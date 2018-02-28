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
import "./library/PLCRVoting.sol";

/*
  keeps track of worker token balances of all
  states (free, staked, voted
*/

contract ReputationRegistry{

// =====================================================================
// STATE VARIABLES
// =====================================================================

  ProjectRegistry projectRegistry;
  PLCRVoting plcrVoting;
  address tokenRegistryAddress;

  mapping (address => uint) public balances; //worker token balances
  mapping (address => uint) public first;

  uint256 public totalSupply;               //total supply of reputation in all states
  uint256 public totalFreeSupply;           //total supply of free reputation (not staked, validated, or voted)
  uint256 public totalUsers;

  // This represents both the initial starting amount and the maximum level the faucet will provide.
  uint256 public initialRepVal = 10000;

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

  function init(address _projectRegistry, address _plcrVoting, address _tokenRegistry) public {
      require(address(projectRegistry) == 0 && address(plcrVoting) == 0);
      projectRegistry = ProjectRegistry(_projectRegistry);
      plcrVoting = PLCRVoting(_plcrVoting);
      tokenRegistryAddress = _tokenRegistry;
  }

  function register() public {
    require(balances[msg.sender] == 0 && first[msg.sender] == 0);
    first[msg.sender] = 1;
    balances[msg.sender] = initialRepVal;
    totalSupply += initialRepVal;
    totalFreeSupply += initialRepVal;
    totalUsers += 1;
  }

  /* function faucet() public {
    require(balances[msg.sender] == 0 && first[msg.sender] != 0);
    balances[msg.sender] += 10000;
    totalSupply += 10000;
    totalFreeSupply += 10000;
  } */

  /* faucet function brings balance to initial value if between 0 and the initialRepVal */
  function faucet() public {
    require(balances[msg.sender] < initialRepVal && balances[msg.sender] >= 0 && first[msg.sender] != 0);
    uint256 addtl = initialRepVal - balances[msg.sender];
    balances[msg.sender] += addtl;
    totalSupply += addtl;
    totalFreeSupply += addtl;
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

  function claimTask(address _projectAddress, uint256 _index, string _taskDescription, uint256 _weiVal, uint256 _reputationVal) public {
    require(balances[msg.sender] >= _reputationVal);
    balances[msg.sender] -= _reputationVal;
    totalFreeSupply -= _reputationVal;
    projectRegistry.claimTask(_projectAddress, _index, _taskDescription, _weiVal, _reputationVal, msg.sender);
  }

  // =====================================================================
  // VALIDATE/VOTING FUNCTIONALITY
  // =====================================================================

  function voteCommit(address _projectAddress, uint256 _reputation, bytes32 _secretHash, uint256 _prevPollID) public {     //_secretHash Commit keccak256 hash of voter's choice and salt (tightly packed in this order), done off-chain
    require(balances[msg.sender] > 1);      //worker can't vote with only 1 token
    uint256 pollId = projectRegistry.votingPollId(_projectAddress);
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

  function voteReveal(address _projectAddress, uint256 _voteOption, uint _salt) public {
    uint256 pollId = projectRegistry.votingPollId(_projectAddress);
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

  function rewardTask(address _projectAddress, bytes32 _taskHash) public {                                   //called by worker who completed a task
    uint256 reward = ProjectLibrary.claimTaskReward(tokenRegistryAddress, _projectAddress, _taskHash, msg.sender);
    totalFreeSupply += reward;
    balances[msg.sender] += reward;
  }
}
