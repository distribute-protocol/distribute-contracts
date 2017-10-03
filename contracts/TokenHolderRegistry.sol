pragma solidity ^0.4.10;

//import files
import "./Project.sol";
import "./ERC20.sol";

/*
  keeps track of token holder capital token balances of all
  states (free, staked, validated, voted), ETH pool balance,
  mint, burn prices
*/

contract TokenHolderRegistry is ERC20 {

//state variables --> note: balances are held in ERC20 contract
  //general token holder state variables
  address workerRegistry;

  uint256 public totalCapitalTokenSupply = 0;               //total supply of capital tokens in all staking states
  uint256 public totalFreeCapitalTokenSupply = 0;           //total supply of free capital tokens (not staked, validated, or voted)
  mapping(uint256 => address) projectId;                    //projectId to project address
  uint256 public projectNonce = 0;     //no projects in existence when contract initialized

 //proposer state variables
  mapping(address => Proposer) proposers;   //project -> Proposer
  uint256 proposeProportion = 20;
  uint256 rewardProportion = 100;

  struct Proposer{
    address proposer;     //who is the proposer
    uint256 proposerStake;   //how much did they stake in tokens
    uint256 projectCost;
  }

  //minting & burning state variables --> from Simon's code
  uint256 public constant MAX_UINT = (2**256) - 1;
  uint256 baseCost = 100000000000000; //100000000000000 wei 0.0001 ether
  uint256 public costPerToken = 0;      //current minting price
  uint256 public weiBal;   //in wei

//events
event LogMint(uint256 amountMinted, uint256 totalCost);
event LogWithdraw(uint256 amountWithdrawn, uint256 reward);
event LogCostOfTokenUpdate(uint256 newCost);

//modifiers
modifier onlyWR() {
  require(msg.sender == workerRegistry);
  _;
}

//QUASI-CONSTRUCTOR
  function init(address _workerRegistry) {       //contract is created
    workerRegistry = _workerRegistry;
    updateMintingPrice(0);
  }

//GENERAL FUNCTION
  function getProjectAddress(uint _id) onlyWR() returns (address) {
    if (_id <= projectNonce) {
      return projectId[_id];
    }
  }

  //MINTING FUNCTIONS
  function fracExp(uint256 k, uint256 q, uint256 n, uint256 p) internal returns (uint) {
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

  function updateMintingPrice(uint256 _supply) internal {    //minting price
      costPerToken = baseCost+fracExp(baseCost, 618046, _supply, 2)+baseCost*_supply/1000;
      LogCostOfTokenUpdate(costPerToken);
  }

  function mint() payable {
      //balance of msg.sender increases if paid right amount according to protocol
      //will mint as many tokens as it can depending on msg.value and MAX_UINT
      uint256 totalMinted = 0;
      uint256 fundsLeft = msg.value;
      while(fundsLeft >= costPerToken) {   //check to see how many whole tokens can be minted
        if (totalCapitalTokenSupply + totalMinted < MAX_UINT) {
          fundsLeft -= costPerToken;     //subtract token cost from amount paid
          totalMinted += 1;          //update the amount of tokens minted
          updateMintingPrice((totalCapitalTokenSupply + totalMinted));  //update costPerToken for next token
        }
        else{
          break; // token supply hit maximum value
        }
      }
      //leaves loop when not enough wei to buy another whole token
      if(fundsLeft > 0) { //some funds left, not enough for one token. Send back funds
          msg.sender.transfer(fundsLeft);
      }
      totalCapitalTokenSupply += totalMinted;
      totalFreeCapitalTokenSupply += totalMinted;
      balances[msg.sender] += totalMinted;
      weiBal += (msg.value - fundsLeft);
      LogMint(totalMinted, (msg.value - fundsLeft));
    }

  function burnAndRefund(uint256 _amountToBurn) returns (bool success) {      //free tokens only
      if(_amountToBurn > 0 && (balances[msg.sender]) >= _amountToBurn) {
          //determine how much you can leave with.
          uint256 reward = _amountToBurn * weiBal/totalCapitalTokenSupply; //rounding? - remainder discarded
          balances[msg.sender] -= _amountToBurn;
          totalCapitalTokenSupply -= _amountToBurn;
          totalFreeCapitalTokenSupply -= _amountToBurn;
          msg.sender.transfer(reward);
          updateMintingPrice(totalCapitalTokenSupply);
          LogWithdraw(_amountToBurn, reward);
          return true;
      } else {
          revert();
      }
  }

  function burnAndRefundPrice() internal returns (uint256 price) {
    //calculated current burn reward of 1 token
    uint256 reward = weiBal/totalCapitalTokenSupply; //rounding? - remainder discarded
    return reward;    //reward in wei of burning 1 token
  }

  //PROPOSER FUNCTIONS
  function proposeProject(uint256 _cost, uint256 _projectDeadline) payable {    //_cost of project in ether
    //calculate cost of project in tokens currently (_cost in wei)
    //check proposer has at least 5% of the proposed cost in tokens
    uint256 currentTokenCost = _cost / burnAndRefundPrice();
    uint256 proposerTokenCost = currentTokenCost / proposeProportion;    //divide by 20 to get 5 percent of tokens
    require(balances[msg.sender] >= proposerTokenCost);
    balances[msg.sender] -= proposerTokenCost;
    totalFreeCapitalTokenSupply -= proposerTokenCost;
    Project newProject = new Project(_cost,
                                     _projectDeadline,
                                     proposerTokenCost
                                     );
    projectNonce += 1;                  //determine project id
    address projectAddress = address(newProject);
    projectId[projectNonce] = projectAddress;
    proposers[projectAddress].proposer = msg.sender;
    proposers[projectAddress].proposerStake = proposerTokenCost;
    proposers[projectAddress].projectCost = _cost;
  }

  function refundProposer(uint256 _projectId) {   //called by proposer, since contract has the eth and
    require(proposers[projectId[_projectId]].proposer == msg.sender);
    //call project to "send back" staked tokens to put in proposer's balances
    address projectAddress = projectId[_projectId];
    uint256 proposerStake = Project(projectAddress).refundProposer();   //function returns proposer stake
    balances[msg.sender] += proposerStake;    //give proposer back their tokens
    totalFreeCapitalTokenSupply += proposerStake;
    //credit 1% of project cost from weiPool
    uint256 proposerReward = proposers[projectAddress].projectCost/rewardProportion;
    msg.sender.transfer(proposerReward);     //how are we sure that this still exists in the ethpool?
  }

  //PROPOSED PROJECT - STAKING FUNCTIONALITY
  function stakeToken(uint256 _projectId, uint256 _tokens) {
    require(balances[msg.sender] >= _tokens && _projectId <= projectNonce);   //make sure project exists & TH has tokens to stake
    bool success = Project(projectId[_projectId]).stakeCapitalToken(_tokens, msg.sender);
    assert(success == true);
    balances[msg.sender] -= _tokens;
    totalFreeCapitalTokenSupply -= _tokens;
  }

  function unstakeToken(uint256 _projectId, uint256 _tokens) {
    require(_projectId <= projectNonce);
    bool success = Project(projectId[_projectId]).unstakeCapitalToken(_tokens, msg.sender);
    assert(success == true);
    balances[msg.sender] += _tokens;                   //assumes _staker has staked to begin with
    totalFreeCapitalTokenSupply += _tokens;
  }

  //COMPLETED PROJECT - VALIDATION & VOTING FUNCTIONALITY
  function validate(uint256 _projectId, uint256 _tokens) {

  }

  function vote(uint256 _projectId, uint256 _tokens) {

  }

  //VALIDATED PROJECT
  function refundStaker(uint _projectId) {

  }

  function rewardWorker(address _worker, uint _reward) onlyWR() {

  }
}
