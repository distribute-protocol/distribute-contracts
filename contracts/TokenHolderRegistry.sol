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
  WorkerRegistry workerRegistry;
  address wrAddress;
  PLCRVoting plcrVoting;

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
    uint256 projectCost;      //cost of the project in ETH/tokens?
  }

  mapping(address => Proposer) proposers;                   //project -> Proposer
  uint256 proposeProportion = 20;                           // tokensupply/proposeProportion is the number of tokens the proposer must stake
  uint256 rewardProportion = 100;

  uint256 baseCost = 100000000000000;                   //.0001 ether --> 3 cents for the initial token, only used once

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
    require(msg.sender == address(workerRegistry));
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
    require(address(workerRegistry) == 0 && address(plcrVoting) == 0);
    wrAddress = _workerRegistry;
    workerRegistry = WorkerRegistry(_workerRegistry);
    plcrVoting = PLCRVoting(_plcrVoting);
    //updateMintingPrice(0);
  }

  // =====================================================================
  // GENERAL FUNCTIONS
  // =====================================================================

  function getProjectAddress(uint256 _id) public view onlyWR() returns (address) {
    require(_id <= projectNonce && _id > 0);
    return projectId[_id].projectAddress;
  }

  function getPollId(uint256 _id) public view onlyWR() returns (uint256) {
    require(_id <= projectNonce && _id > 0);
    return projectId[_id].votingPollId;
  }
  // =====================================================================
  // MINTING FUNCTIONS
  // =====================================================================

// This produces out of gas errors for numbers to high.
  function mint(uint _tokens) public payable {
      uint256 targetPriceVar;
      if (totalCapitalTokenSupply == 0 || currentPrice() == 0) {
        targetPriceVar = baseCost;
      } else {
        targetPriceVar = targetPrice(_tokens);
      }
      uint256 weiRequiredVar = weiRequired(targetPriceVar, _tokens);
      require(msg.value >= weiRequiredVar);
      totalCapitalTokenSupply += _tokens;
      totalFreeCapitalTokenSupply += _tokens;
      balances[msg.sender] += _tokens;
      weiBal += weiRequiredVar;
      LogMint(_tokens, weiRequiredVar);
      uint256 fundsLeft = msg.value - weiRequiredVar;
      if (fundsLeft > 0) {
        msg.sender.transfer(fundsLeft);
      }
  }

  function percent(uint256 numerator, uint256 denominator, uint256 precision) internal pure returns (uint256) {
     // caution, check safe-to-multiply here
    uint256 _numerator  = numerator * 10 ** (precision+1);
    // with rounding of last digit
    uint256 _quotient =  ((_numerator / denominator) + 5) / 10;
    return _quotient;
  }

  function weiRequired(uint256 _targetPrice, uint256 _tokens) public view returns (uint256) {
    return ((_targetPrice * (totalCapitalTokenSupply + _tokens)) - currentPrice() * totalCapitalTokenSupply);
  }

  function targetPrice(uint _tokens) public view returns (uint256) {
    uint256 newSupply = totalCapitalTokenSupply + _tokens;
    uint256 cp = currentPrice();
    return cp * (1000 + percent(_tokens, newSupply, 3)) / 1000;
  }

  function burnAndRefund(uint256 _amountToBurn) public {      //free tokens only
      require(_amountToBurn > 0 && (balances[msg.sender]) >= _amountToBurn);
      //determine how much you can leave with.
      uint256 reward = _amountToBurn * currentPrice();    //truncation - remainder discarded
      balances[msg.sender] -= _amountToBurn;
      totalCapitalTokenSupply -= _amountToBurn;
      totalFreeCapitalTokenSupply -= _amountToBurn;
      LogWithdraw(_amountToBurn, reward);
      msg.sender.transfer(reward);
  }

  function currentPrice() internal view returns (uint256) {
    //calculated current burn reward of 1 token at current weiBal and free token supply
    if (totalFreeCapitalTokenSupply == 0) {
      return baseCost;
    } else {
    return weiBal/totalFreeCapitalTokenSupply; //truncation - remainder discarded
    }
  }
  /*function futurePrice() internal view return (uint256 price) {
  }*/

  // =====================================================================
  // PROPOSER FUNCTIONS
  // =====================================================================

  function proposeProject(uint256 _cost, uint256 _stakingPeriod) public {    //_cost of project in ether, _projectDeadline is for end of active period
    //calculate cost of project in tokens currently (_cost in wei)
    //check proposer has at least 5% of the proposed cost in tokens
    require(now < _stakingPeriod && _cost > 0);
    uint256 _currentPrice = currentPrice();
    uint256 currentTokenCost = _cost / _currentPrice;      //project cost in tokens
    uint256 proposerTokenCost = currentTokenCost / proposeProportion;           //divide by 20 to get 5 percent of tokens
    uint256 _costProportion = _cost / weiBal;
    require(balances[msg.sender] >= proposerTokenCost);
    balances[msg.sender] -= proposerTokenCost;
    totalFreeCapitalTokenSupply -= proposerTokenCost;
    projectNonce += 1;
    LogProposal(projectNonce, proposerTokenCost);                                                     //determine project id
    Project newProject = new Project(projectNonce,
                                     _cost,
                                     _stakingPeriod,
                                     proposerTokenCost,
                                     _costProportion,
                                     wrAddress
                                     );
    //delete unnecessary variables
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
    uint256 proposerReward = proposers[_projectAddress].projectCost / rewardProportion;
    // We can transfer capital tokens rather than eth so that we can just generate what is needed and they can withdraw at a value they see fit. Don't lose conversion fees.
    msg.sender.transfer(proposerReward);                                        //how are we sure that this still exists in the ethpool?
  }

  // =====================================================================
  // PROPOSED PROJECT - STAKING FUNCTIONALITYå
  // =====================================================================

  function stakeToken(uint256 _projectId, uint256 _tokens) public projectExists(_projectId) {
    require(balances[msg.sender] >= _tokens);   //make sure project exists & TH has tokens to stake
    uint256 weiVal = currentPrice() * _tokens;
    balances[msg.sender] -= _tokens;
    totalFreeCapitalTokenSupply -= _tokens;
    Project(projectId[_projectId].projectAddress).transfer(weiVal);
    uint256 returnedTokens = Project(projectId[_projectId].projectAddress).stakeCapitalToken(_tokens, msg.sender, weiVal);
    if (returnedTokens > 0) {
      balances[msg.sender] += returnedTokens;
      totalFreeCapitalTokenSupply += returnedTokens;
    }
  }

  function unstakeToken(uint256 _projectId, uint256 _tokens) public projectExists(_projectId) {
    balances[msg.sender] += _tokens;
    totalFreeCapitalTokenSupply += _tokens;
    Project(projectId[_projectId].projectAddress).unstakeCapitalToken(_tokens, msg.sender);
  }

  // =====================================================================
  // OPEN/DISPUTE PROJECT
  // =====================================================================

  function submitTaskHash(uint256 _projectId, bytes32 _taskHash) public projectExists(_projectId) {
    Project(projectId[_projectId].projectAddress).addTaskHash(_taskHash, msg.sender);
  }

  // =====================================================================
  // ACTIVE PROJECT
  // =====================================================================

  function submitHashList(uint256 _projectId, bytes32[] _hashes) public {
    Project(projectId[_projectId].projectAddress).submitHashList(_hashes);
  }

  // =====================================================================
  // COMPLETED PROJECT - VALIDATION & VOTING FUNCTIONALITY
  // =====================================================================

  function validate(uint256 _projectId, uint256 _tokens, bool _validationState) public projectExists(_projectId) {
    require(balances[msg.sender] >= _tokens);
    balances[msg.sender] -= _tokens;
    totalFreeCapitalTokenSupply -= _tokens;
    Project(projectId[_projectId].projectAddress).validate(msg.sender, _tokens, _validationState);
  }

  function startPoll(uint256 _projectId, uint256 _commitDuration, uint256 _revealDuration) public {       //can only be called by project in question
      require(projectId[_projectId].projectAddress == msg.sender);
      projectId[_projectId].votingPollId = plcrVoting.startPoll(50, _commitDuration, _revealDuration);
    }

  function voteCommit(uint256 _projectId, uint256 _tokens, bytes32 _secretHash, uint256 _prevPollID) public projectExists(_projectId) {     //_secretHash Commit keccak256 hash of voter's choice and salt (tightly packed in this order), done off-chain

    uint256 pollId = projectId[_projectId].votingPollId;
    //calculate available tokens for voting
    uint256 availableTokens = plcrVoting.voteTokenBalanceTH(msg.sender) - plcrVoting.getLockedTokens(msg.sender);
    //make sure msg.sender has tokens available in PLCR contract
    //if not, request voting rights for token holder
    if (availableTokens < _tokens) {
      require(balances[msg.sender] >= _tokens - availableTokens);
      balances[msg.sender] -= _tokens;
      totalFreeCapitalTokenSupply -= _tokens;
      plcrVoting.requestVotingRights(msg.sender, _tokens - availableTokens);
    }
    plcrVoting.commitVote(msg.sender, pollId, _secretHash, _tokens, _prevPollID);
  }

  function voteReveal(uint256 _projectId, uint256 _voteOption, uint _salt) public {
    plcrVoting.revealVote(projectId[_projectId].votingPollId, _voteOption, _salt);
  }

  function refundVotingTokens(uint256 _tokens) public {
    balances[msg.sender] += _tokens;
    totalFreeCapitalTokenSupply += _tokens;
    plcrVoting.withdrawVotingRights(msg.sender, _tokens);
  }

  // =====================================================================
  // FAILED / VALIDATED PROJECT
  // =====================================================================

  function pollEnded(uint256 _projectId) public view returns (bool) {
    require(projectId[_projectId].projectAddress == msg.sender);
    return plcrVoting.pollEnded(projectId[_projectId].votingPollId);
  }

  function isPassed(uint256 _projectId) public view returns (bool) {
    require(projectId[_projectId].projectAddress == msg.sender);
    return plcrVoting.isPassed(projectId[_projectId].votingPollId);
  }
  // We should call this something like burnTokens to be more explicit
  function burnTokens(uint256 _projectId, uint256 _tokens) public {
    require(projectId[_projectId].projectAddress == msg.sender);                               //check that valid project is calling this function
    totalCapitalTokenSupply -= _tokens;
  }

  function refundStaker(uint256 _projectId) public {
    uint256 refund = Project(projectId[_projectId].projectAddress).refundStaker(msg.sender);
    totalFreeCapitalTokenSupply += refund;
    balances[msg.sender] += refund;
    //rescue locked tokens that weren't revealed
    uint256 pollId = projectId[_projectId].votingPollId;
    plcrVoting.rescueTokens(msg.sender, pollId);
  }

  function rewardValidator(uint256 _projectId, address _validator, uint256 _reward) public {
    require(projectId[_projectId].projectAddress == msg.sender);
    _validator.transfer(_reward);
  }

  function() public payable {

  }
}
