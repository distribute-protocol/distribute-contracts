// ===================================================================== //
// This contract manages the reputation balances of each user and serves as
// the interface through which users stake reputation, come to consensus around
// tasks, claim tasks, vote, refund their stakes, and claim their task rewards.
// ===================================================================== //

pragma solidity ^0.4.10;

//import files
import "./Project.sol";
import "./ProjectLibrary.sol";
import "./ProjectRegistry.sol";
import "./DistributeToken.sol";
import "./library/PLCRVoting.sol";
import "./Task.sol";

/*
  keeps track of worker token balances of all
  states (free, staked, voted
*/

contract ReputationRegistry{

// =====================================================================
// STATE VARIABLES
// =====================================================================
  DistributeToken distributeToken;
  ProjectRegistry projectRegistry;
  PLCRVoting plcrVoting;
  address tokenRegistryAddress;

  mapping (address => uint) public balances; //worker token balances
  mapping (address => bool) public first;

  uint256 public totalSupply;               //total supply of reputation in all states
  uint256 public totalFreeSupply;           //total supply of free reputation (not staked, validated, or voted)
  uint256 public totalUsers;

  uint256 proposeProportion = 20;                           // tokensupply/proposeProportion is the number of tokens the proposer must stake
  uint256 rewardProportion = 100;
  // This represents both the initial starting amount and the maximum level the faucet will provide.
  uint256 public initialRepVal = 10000;

// =====================================================================
// EVENTS
// =====================================================================

  event ProjectCreated(address indexed projectAddress, uint256 projectCost, uint256 proposerStake);

// =====================================================================
// MODIFIERS
// =====================================================================

modifier onlyPR() {
  require(msg.sender == address(projectRegistry));
  _;
}
// =====================================================================
// FUNCTIONS
// =====================================================================

  // =====================================================================
  // CONSTRUCTOR
  // =====================================================================

  function init(address _distributeToken, address _tokenRegistry, address _projectRegistry, address _plcrVoting) public {
      require(address(projectRegistry) == 0 && address(plcrVoting) == 0);
      distributeToken = DistributeToken(_distributeToken);
      projectRegistry = ProjectRegistry(_projectRegistry);
      plcrVoting = PLCRVoting(_plcrVoting);
      distributeToken= DistributeToken(_distributeToken);
      tokenRegistryAddress = _tokenRegistry;
  }

  function register() public {
    require(balances[msg.sender] == 0 && first[msg.sender] == false);
    first[msg.sender] = true;
    balances[msg.sender] = initialRepVal;
    totalSupply += initialRepVal;
    totalFreeSupply += initialRepVal;
    totalUsers += 1;
  }

  /* function getAverageFreeReputation() public returns (uint) {
    totalUsers == 0
      ? return 0
      : return totalFreeSupply / totalUsers;
  } */

  // faucet function brings balance to initial value if between 0 and the initialRepVal
  function faucet() public {
    require(balances[msg.sender] < initialRepVal && balances[msg.sender] >= 0 && first[msg.sender] == true);
    uint256 addtl = initialRepVal - balances[msg.sender];
    balances[msg.sender] += addtl;
    totalSupply += addtl;
    totalFreeSupply += addtl;
  }

  function proposeProject(uint256 _cost, uint256 _stakingPeriod) public {    //_cost of project in ether
    //calculate cost of project in tokens currently (_cost in wei)
    //check proposer has at least 5% of the proposed cost in tokens
    require(now < _stakingPeriod && _cost > 0);
    uint256 costProportion = _cost / distributeToken.weiBal();
    uint256 proposerReputationCost = (costProportion / proposeProportion) * totalSupply;
    require(balances[msg.sender] >= proposerReputationCost);
    balances[msg.sender] -= proposerReputationCost;
    address projectAddress = projectRegistry.createProject(_cost, costProportion, _stakingPeriod, msg.sender, 2, proposerReputationCost);
    ProjectCreated(projectAddress, _cost, proposerReputationCost);
  }

  function refundProposer(address _projectAddress) public {
    Project project = Project(_projectAddress);                            //called by proposer to get refund once project is active
    require(project.proposer() == msg.sender);
    require(project.proposerType() == 2);
    uint256[2] memory proposerVals = projectRegistry.refundProposer(_projectAddress);        //call project to "send back" staked tokens to put in proposer's balances
    balances[msg.sender] += proposerVals[1];
    distributeToken.transferWeiFrom(msg.sender, proposerVals[0] / 100);
  }

  // =====================================================================
  // PROPOSED PROJECT - STAKING FUNCTIONALITY
  // =====================================================================

  function stakeReputation(address _projectAddress, uint256 _reputation) public {
    require(balances[msg.sender] >= _reputation && _reputation > 0);   //make sure project exists & TH has tokens to stake
    balances[msg.sender] -= _reputation;
    totalFreeSupply -= _reputation;
    Project(_projectAddress).stakeReputation(msg.sender, _reputation);
  }

  function unstakeReputation(address _projectAddress, uint256 _reputation) public {
    require(_reputation > 0);
    balances[msg.sender] += _reputation;
    totalFreeSupply += _reputation;
    Project(_projectAddress).unstakeReputation(msg.sender, _reputation);
  }

  // =====================================================================
  // ACTIVE PERIOD FUNCTIONALITY
  // =====================================================================

  function claimTask(address _projectAddress, uint256 _index, string _taskDescription, uint _weighting) public {
    Project project = Project(_projectAddress);
    uint reputationVal = (project.weiCost() * _weighting * totalFreeSupply) / (distributeToken.weiBal() * 100);
    require(balances[msg.sender] >= reputationVal);
    uint weiVal = _weighting * project.weiCost() / 100;
    balances[msg.sender] -= reputationVal;
    totalFreeSupply -= reputationVal;
    projectRegistry.claimTask(_projectAddress, _index, _taskDescription, msg.sender, _weighting, weiVal, reputationVal);
  }

  // =====================================================================
  // VOTING FUNCTIONALITY
  // =====================================================================

  function voteCommit(address _projectAddress, uint256 _index, uint256 _reputation, bytes32 _secretHash, uint256 _prevPollID) public {     //_secretHash Commit keccak256 hash of voter's choice and salt (tightly packed in this order), done off-chain
    require(balances[msg.sender] > 1);      //worker can't vote with only 1 token
    Project project = Project(_projectAddress);
    uint256 pollId = Task(project.tasks(_index)).pollId();
    /*uint256 nonce = projectRegistry.projectNonce();*/
    //calculate available tokens for voting
    uint256 availableTokens = plcrVoting.voteReputationBalance(msg.sender) - plcrVoting.getLockedTokens(msg.sender);
    //make sure msg.sender has tokens available in PLCR contract
    //if not, request voting rights for token holder
    if (availableTokens < _reputation) {
      require(balances[msg.sender] >= _reputation - availableTokens && pollId != 0);
      balances[msg.sender] -= _reputation;
      totalFreeSupply -= _reputation;
      plcrVoting.requestVotingRights(msg.sender, _reputation - availableTokens);
    }
    plcrVoting.commitVote(msg.sender, pollId, _secretHash, _reputation, _prevPollID);
  }

  function voteReveal(address _projectAddress, uint256 _index, uint256 _voteOption, uint _salt) public {
    Project project = Project(_projectAddress);
    uint256 pollId = Task(project.tasks(_index)).pollId();
    plcrVoting.revealVote(pollId, _voteOption, _salt);
  }

  function refundVotingReputation(uint256 _reputation) public {
    plcrVoting.withdrawVotingRights(msg.sender, _reputation);
    balances[msg.sender] += _reputation;
    totalFreeSupply += _reputation;
  }

  // =====================================================================
  // FAILED / VALIDATED PROJECT
  // =====================================================================

  // called by project if a project fails
  function burnReputation(uint256 _reputation) public onlyPR() {
    //check that valid project is calling this function
    totalSupply -= _reputation;
  }

  function refundStaker(address _projectAddress) public {                                                                       //called by worker who staked or voted
    uint256 _refund = ProjectLibrary.refundStaker(_projectAddress, msg.sender);
    require(_refund > 0);
    totalFreeSupply += _refund * 3 / 2;
    balances[msg.sender] += _refund * 3 / 2;
  }

  function rewardTask(address _projectAddress, uint8 _index) public {                                   //called by worker who completed a task
    uint256 reward = ProjectLibrary.claimTaskReward(tokenRegistryAddress, _index, _projectAddress, msg.sender);
    totalFreeSupply += reward;
    balances[msg.sender] += reward;
  }
}
