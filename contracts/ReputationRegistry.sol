pragma solidity ^0.4.10;

//import files
import "./Project.sol";
import "./TokenRegistry.sol";
import "./ProjectRegistry.sol";
import "./library/PLCRVoting.sol";

/*
  keeps track of worker token balances of all
  states (free, staked, voted
*/

//INCOMPLETE

contract ReputationRegistry{

// =====================================================================
// STATE VARIABLES
// =====================================================================

  TokenRegistry tokenRegistry;
  ProjectRegistry projectRegistry;
  PLCRVoting plcrVoting;

  mapping (address => uint) public balances;                   //worker token balances

  uint256 public totalReputationSupply;               //total supply of reputation in all states
  uint256 public totalFreeReputationSupply;           //total supply of free reputation (not staked, validated, or voted)

// =====================================================================
// EVENTS
// =====================================================================

// =====================================================================
// FUNCTIONS
// =====================================================================

  // =====================================================================
  // CONSTRUCTOR
  // =====================================================================

  function init(address _tokenRegistry, address _projectRegistry, address _plcrVoting) public {
      require(address(tokenRegistry) == 0 && address(projectRegistry) == 0 && address(plcrVoting) == 0);
      tokenRegistry = TokenRegistry(_tokenRegistry);
      projectRegistry = ProjectRegistry(_projectRegistry);
      plcrVoting = PLCRVoting(_plcrVoting);
  }

  function register() public {
    require(balances[msg.sender] == 0);
    balances[msg.sender] = 1;
  }

  // =====================================================================
  // PROPOSED PROJECT - STAKING FUNCTIONALITY
  // =====================================================================

  function stakeReputation(uint256 _projectId, uint256 _reputation) public {
    /*require(balances[msg.sender] > 1);*/
    address _projectAddress = projectRegistry.getProjectAddress(_projectId);
    require(balances[msg.sender] >= _reputation);   //make sure project exists & TH has tokens to stake
    balances[msg.sender] -= _reputation;
    totalFreeReputationSupply -= _reputation;
    Project(_projectAddress).stakeReputation(_reputation, msg.sender);
  }

  function unstakeReputation(uint256 _projectId, uint256 _reputation) public {
    address _projectAddress = projectRegistry.getProjectAddress(_projectId);
    balances[msg.sender] += _reputation;
    totalFreeReputationSupply += _reputation;
    Project(_projectAddress).unstakeReputation(_reputation, msg.sender);
  }

  function submitTaskHash(uint256 _projectId, bytes32 _taskHash) public {
    address _projectAddress = projectRegistry.getProjectAddress(_projectId);
    Project(_projectAddress).addTaskHash(_taskHash, msg.sender);
  }

  // =====================================================================
  // ACTIVE PERIOD FUNCTIONALITY
  // =====================================================================

  function submitHashList(uint256 _projectId, bytes32[] _hashes) public {
    address _projectAddress = projectRegistry.getProjectAddress(_projectId);
    Project(_projectAddress).submitHashList(_hashes);
  }

  function claimTask(uint256 _projectId, uint256 _index, string _taskDescription, uint256 _weiVal, uint256 _repVal) public {
    require(balances[msg.sender] >= _tokenVal);
    address _projectAddress = projectRegistry.getProjectAddress(_projectId);
    balances[msg.sender] -= _repVal;
    Project(_projectAddress).claimTask(_index, _taskDescription, _weiVal, _repVal, msg.sender);
  }

  // =====================================================================
  // VALIDATE/VOTING FUNCTIONALITY
  // =====================================================================

  function voteCommit(uint256 _projectId, uint256 _reputation, bytes32 _secretHash, uint256 _prevPollID) public {     //_secretHash Commit keccak256 hash of voter's choice and salt (tightly packed in this order), done off-chain
    require(balances[msg.sender] > 1);      //worker can't vote with only 1 token
    uint256 pollId = projectRegistry.getPollId(_projectId);
    uint256 nonce = tokenRegistry.projectNonce();
    //calculate available tokens for voting
    uint256 availableTokens = plcrVoting.voteTokenBalanceW(msg.sender) - plcrVoting.getLockedTokens(msg.sender);
    //make sure msg.sender has tokens available in PLCR contract
    //if not, request voting rights for token holder
    if (availableTokens < _reputation) {
      require(balances[msg.sender] >= _reputation - availableTokens && _projectId <= nonce && _projectId > 0);
      balances[msg.sender] -= _reputation;
      totalFreeReputationSupply -= _reputation;
      plcrVoting.requestVotingRights(msg.sender, _reputation - availableTokens);
    }
    plcrVoting.commitVote(msg.sender, pollId, _secretHash, _reputation, _prevPollID);
  }

  function voteReveal(uint256 _projectId, uint256 _voteOption, uint _salt) public {
    uint256 pollId = projectRegistry.getPollId(_projectId);
    plcrVoting.revealVote(pollId, _voteOption, _salt);
  }

  function refundVotingReputation(uint256 _reputation) public {
    plcrVoting.withdrawVotingRights(msg.sender, _reputation);
    balances[msg.sender] += _reputation;
    totalFreeReputationSupply += _reputation;
  }


  // =====================================================================
  // FAILED / VALIDATED PROJECT
  // =====================================================================

  // We should document this function further, or make its name more descriptive
  function burnReputation(uint256 _projectId, uint256 _reputation) public {
    require(projectRegistry.getProjectAddress(_projectId) == msg.sender);                  //check that valid project is calling this function
    totalReputationSupply -= _reputation;
  }


  function refundStaker(uint256 _projectId) public {                                                                       //called by worker who staked or voted
    address _projectAddress = projectRegistry.getProjectAddress(_projectId);
    uint256 _refund = Project(_projectAddress).refundStaker(msg.sender);
    totalFreeReputationSupply += _refund;
    balances[msg.sender] += _refund;
  }

  function rewardTask(uint256 _projectId, bytes32 _taskHash) public {                                   //called by worker who completed a task
    address _projectAddress = projectRegistry.getProjectAddress(_projectId);
    uint256 reward = Project(_projectAddress).claimTaskReward(_taskHash, msg.sender);
    totalFreeReputationSupply += reward;
    balances[msg.sender] += reward;
  }
}
