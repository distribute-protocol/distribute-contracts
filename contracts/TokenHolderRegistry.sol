pragma solidity ^0.4.8;

//import files
import "./Project.sol";
import "./StandardToken.sol";
import "./PLCRVoting.sol";

/*
  keeps track of token holder capital token balances of all
  states (free, staked, validated, voted), ETH pool balance,
  mint, burn prices
*/

contract TokenHolderRegistry is StandardToken {

// =====================================================================
// STATE VARIABLES
// =====================================================================
  address workerRegistry;
  address plcrVoting;

  uint256 public totalCapitalTokenSupply = 0;               //total supply of capital tokens in all staking states
  uint256 public totalFreeCapitalTokenSupply = 0;           //total supply of free capital tokens (not staked, validated, or voted)


  uint256 public projectNonce = 0;                          //no projects in existence when contract initialized
  mapping(uint256 => Projects) public projectId;                    //projectId to project address

  struct Projects {
    address projectAddress;
    uint256 votingPollId;             //for voting
  }

  struct Proposer {
    address proposer;         //who is the proposer
    uint256 proposerStake;    //how much did they stake in tokens
    uint256 projectCost;
  }

  mapping(address => Proposer) proposers;                   //project -> Proposer
  uint256 proposeProportion = 20;                           // tokensupply/proposeProportion is the number of tokens the proposer must stake
  uint256 rewardProportion = 100;

  //minting & burning state variables from Simon de la Rouviere's code
  uint256 public constant MAX_UINT = (2**256) - 1;
  uint256 baseCost = 100000000000000;                   //.0001 ether --> 3 cents for the initial token
  uint256 public costPerToken = 0;                      //current minting price

  //ether pool
  uint256 public weiBal;   //in wei

// =====================================================================
// EVENTS
// =====================================================================

  event LogMint(uint256 amountMinted, uint256 totalCost);
  event LogWithdraw(uint256 amountWithdrawn, uint256 reward);
  event LogCostOfTokenUpdate(uint256 newCost);
  event LogProposal(uint256 nonce, uint256 proposalCostInTokens);

// =====================================================================
// MODIFIERS
// =====================================================================

  modifier onlyWR() {
    require(msg.sender == workerRegistry);
    _;
  }

  modifier projectExists(uint256 _projectId) {
    require(_projectId <= projectNonce && _projectId > 0);
    _;
  }

// =====================================================================
// FUNCTIONS
// =====================================================================

  // =====================================================================
  // QUASI-CONSTRUCTOR
  // =====================================================================
  function init(address _workerRegistry, address _plcrVoting) public {       //contract is created
    workerRegistry = _workerRegistry;
    plcrVoting = _plcrVoting;
    updateMintingPrice(0);
  }

  // =====================================================================
  // GENERAL FUNCTION
  // =====================================================================

  function getProjectAddress(uint256 _id) public view onlyWR() returns (address) {
    if (_id <= projectNonce && _id > 0) {
      return projectId[_id].projectAddress;
    }
  }

  function getPollId(uint256 _id) public view onlyWR() returns (uint256) {
    if (_id <= projectNonce && _id > 0) {
      return projectId[_id].votingPollId;
    }
  }
  // =====================================================================
  // MINTING FUNCTIONS
  // =====================================================================

  function fracExp(uint256 k, uint256 q, uint256 n, uint256 p) internal pure returns (uint) {
    // via: http://ethereum.stackexchange.com/questions/10425/is-there-any-efficient-way-to-compute-the-exponentiation-of-a-fraction-and-an-in/10432#10432
    // Computes `k * (1+1/q) ^ N`, with precision `p`. The higher
    // the precision, the higher the gas cost. It should be
    // something around the log of `n`. When `p == n`, the
    // precision is absolute (sans possible integer overflows).
    // Much smaller values are sufficient to get a great approximation.
    uint256 s = 0;
    uint256 N = 1;
    uint256 B = 1;
    for (uint256 i = 0; i < p; ++i){
      s += k * N / B / (q**i);
      N  = N * (n-i);
      B  = B * (i+1);
    }
    return s;
  }

  function updateMintingPrice(uint256 _supply) internal {
      costPerToken = baseCost+fracExp(baseCost, 618046, _supply, 2)+baseCost*_supply/1000;
      LogCostOfTokenUpdate(costPerToken);
  }

  function mint(uint _tokens) public payable {
      //token balance of msg.sender increases if paid right amount according to protocol
      //will mint as many tokens as it can depending on msg.value, requested # tokens, and MAX_UINT
      uint256 totalMinted = 0;
      uint256 fundsLeft = msg.value;
      while(fundsLeft >= costPerToken && totalMinted < _tokens) {       //leaves loop when minted proper number of tokens or ran out of funds or token supply hit maximum value
        if (totalCapitalTokenSupply + totalMinted < MAX_UINT) {
          fundsLeft -= costPerToken;                                    //subtract token cost from amount paid
          totalMinted += 1;                                             //update the amount of tokens minted
          updateMintingPrice((totalCapitalTokenSupply + totalMinted));  //update costPerToken for next token
        }
        else{
          break;                                                        //token supply hit maximum value
        }
      }
      if(totalMinted < _tokens) {                     //if ran out of funds, revert transaction
        updateMintingPrice(totalCapitalTokenSupply);  //revert to minting price before token purchase request
        revert();
      }
      if(fundsLeft > 0) {                             //send back leftover funds if proper amount minted
          msg.sender.transfer(fundsLeft);
      }
      totalCapitalTokenSupply += totalMinted;
      totalFreeCapitalTokenSupply += totalMinted;
      balances[msg.sender] += totalMinted;
      weiBal += (msg.value - fundsLeft);
      LogMint(totalMinted, (msg.value - fundsLeft));
    }

  function burnAndRefund(uint256 _amountToBurn) public returns (bool success) {      //free tokens only
      if(_amountToBurn > 0 && (balances[msg.sender]) >= _amountToBurn) {
          //determine how much you can leave with.
          uint256 reward = _amountToBurn * weiBal/totalCapitalTokenSupply;    //truncation - remainder discarded
          balances[msg.sender] -= _amountToBurn;
          totalCapitalTokenSupply -= _amountToBurn;
          totalFreeCapitalTokenSupply -= _amountToBurn;
          msg.sender.transfer(reward);
          updateMintingPrice(totalCapitalTokenSupply);
          LogWithdraw(_amountToBurn, reward);
          return true;
      } else {
          return false;
      }
  }

  function burnAndRefundPrice() internal view returns (uint256 price) {
    //calculated current burn reward of 1 token at current weiBal and token supply
    uint256 reward = weiBal/totalCapitalTokenSupply; //truncation - remainder discarded
    return reward;                                   //reward in wei of burning 1 token
  }

  // =====================================================================
  // PROPOSER FUNCTIONS
  // =====================================================================

  function proposeProject(uint256 _cost, uint256 _projectDeadline) public {    //_cost of project in ether, _projectDeadline is for end of active period
    //calculate cost of project in tokens currently (_cost in wei)
    //check proposer has at least 5% of the proposed cost in tokens
    require(now < _projectDeadline);
    uint256 _burnprice = burnAndRefundPrice();
    uint256 currentTokenCost = _cost / _burnprice;      //project cost in tokens
    uint256 proposerTokenCost = currentTokenCost / proposeProportion;           //divide by 20 to get 5 percent of tokens
    require(balances[msg.sender] >= proposerTokenCost);
    balances[msg.sender] -= proposerTokenCost;
    totalFreeCapitalTokenSupply -= proposerTokenCost;
    projectNonce += 1;
    LogProposal(projectNonce, proposerTokenCost);                                                     //determine project id
    Project newProject = new Project(projectNonce,
                                     _cost,
                                     _projectDeadline,
                                     currentTokenCost,
                                     proposerTokenCost
                                     );
    address _projectAddress = address(newProject);
    Projects storage tempProject = projectId[projectNonce];
    tempProject.projectAddress = _projectAddress;
    Proposer storage tempProposer = proposers[_projectAddress];
    tempProposer.proposer = msg.sender;
    tempProposer.proposerStake = proposerTokenCost;
    tempProposer.projectCost = _cost;
  }

  function refundProposer(uint256 _projectId) public {                                 //called by proposer to get refund once project is active
    address _projectAddress = projectId[_projectId].projectAddress;
    require(proposers[_projectAddress].proposer == msg.sender);
    uint256 proposerStake = Project(_projectAddress).refundProposer();           //call project to "send back" staked tokens to put in proposer's balances
    balances[msg.sender] += proposerStake;                                      //give proposer back their tokens
    totalFreeCapitalTokenSupply += proposerStake;
    uint256 proposerReward = proposers[_projectAddress].projectCost/rewardProportion;
    // We can transfer capital tokens rather than eth so that we can just generate what is needed and they can withdraw at a value they see fit.
    msg.sender.transfer(proposerReward);                                        //how are we sure that this still exists in the ethpool?
  }

  // =====================================================================
  // PROPOSED PROJECT - STAKING FUNCTIONALITYå
  // =====================================================================

  function stakeToken(uint256 _projectId, uint256 _tokens) public projectExists(_projectId) {
    require(balances[msg.sender] >= _tokens);   //make sure project exists & TH has tokens to stake
    // Change the order so the tokens are removed before transferred to prevent rentry incase this fails.
    balances[msg.sender] -= _tokens;
    bool success = Project(projectId[_projectId].projectAddress).stakeCapitalToken(_tokens, msg.sender);
    assert(success == true);
    totalFreeCapitalTokenSupply -= _tokens;
  }

  function unstakeToken(uint256 _projectId, uint256 _tokens) public projectExists(_projectId) {
    bool success = Project(projectId[_projectId].projectAddress).unstakeCapitalToken(_tokens, msg.sender);
    assert(success == true);
    balances[msg.sender] += _tokens;
    totalFreeCapitalTokenSupply += _tokens;
  }

  // =====================================================================
  // COMPLETED PROJECT - VALIDATION & VOTING FUNCTIONALITY
  // =====================================================================

  function validate(uint256 _projectId, uint256 _tokens, bool _validationState) public projectExists(_projectId) {
    require(balances[msg.sender] >= _tokens);
    bool success = Project(projectId[_projectId].projectAddress).validate(msg.sender, _tokens, _validationState);
    assert(success == true);
    balances[msg.sender] -= _tokens;
    totalFreeCapitalTokenSupply -= _tokens;
  }

  function startPoll(uint256 _projectId, uint256 _commitDuration, uint256 _revealDuration) public {
      require(projectId[_projectId].projectAddress == msg.sender);
      uint256 _pollId = PLCRVoting(plcrVoting).startPoll(50, _commitDuration, _revealDuration);
      projectId[_projectId].votingPollId = _pollId;
    }

  function voteCommit(uint256 _projectId, uint256 _tokens, bytes32 _secretHash, uint256 _prevPollID) public projectExists(_projectId) {     //_secretHash Commit keccak256 hash of voter's choice and salt (tightly packed in this order), done off-chain
    uint256 pollId = projectId[_projectId].votingPollId;
    //calculate available tokens for voting
    uint256 availableTokens = PLCRVoting(plcrVoting).voteTokenBalanceTH(msg.sender) - PLCRVoting(plcrVoting).getLockedTokens(msg.sender);
    //make sure msg.sender has tokens available in PLCR contract
    //if not, request voting rights for token holder
    if (availableTokens < _tokens) {
      require(balances[msg.sender] >= _tokens - availableTokens);
      balances[msg.sender] -= _tokens;
      totalFreeCapitalTokenSupply -= _tokens;
      PLCRVoting(plcrVoting).requestVotingRights(msg.sender, _tokens - availableTokens);
    }
    PLCRVoting(plcrVoting).commitVote(msg.sender, pollId, _secretHash, _tokens, _prevPollID);
  }

  function voteReveal(uint256 _projectId, uint256 _voteOption, uint _salt) public {
    uint256 pollId = projectId[_projectId].votingPollId;
    PLCRVoting(plcrVoting).revealVote(pollId, _voteOption, _salt);
  }

  function refundVotingTokens(uint256 _tokens) public {
    PLCRVoting(plcrVoting).withdrawVotingRights(msg.sender, _tokens);
    balances[msg.sender] += _tokens;
    totalFreeCapitalTokenSupply += _tokens;
  }

  // =====================================================================
  // FAILED / VALIDATED PROJECT
  // =====================================================================

  function pollEnded(uint256 _projectId) public view returns (bool) {
    require(projectId[_projectId].projectAddress == msg.sender);
    bool success = PLCRVoting(plcrVoting).pollEnded(projectId[_projectId].votingPollId);
    return success;
  }

  function isPassed(uint256 _projectId) public view returns (bool) {
    require(projectId[_projectId].projectAddress == msg.sender);
    bool success = PLCRVoting(plcrVoting).isPassed(projectId[_projectId].votingPollId);
    return success;
  }
  // We should call this something like burnTokens to be more explicit
  function updateTotal(uint256 _projectId, uint256 _tokens) public {
    require(projectId[_projectId].projectAddress == msg.sender);                               //check that valid project is calling this function
    totalCapitalTokenSupply -= _tokens;
  }

  function refundStaker(uint256 _projectId) public {
    uint256 refund = Project(projectId[_projectId].projectAddress).refundStaker(msg.sender);
    totalFreeCapitalTokenSupply += refund;
    balances[msg.sender] += refund;

    //rescue locked tokens that weren't revealed
    uint256 pollId = projectId[_projectId].votingPollId;
    PLCRVoting(plcrVoting).rescueTokens(msg.sender, pollId);
  }

  function rewardValidator(uint256 _projectId, address _validator, uint256 _reward) public {
    require(projectId[_projectId].projectAddress == msg.sender);
    _validator.transfer(_reward);
  }

  function rewardWorker(address _worker, uint256 _reward) public onlyWR() {
    _worker.transfer(_reward);
  }
}
