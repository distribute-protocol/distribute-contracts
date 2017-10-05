pragma solidity ^0.4.10;

//import files
import "./Project.sol";
import "./TokenHolderRegistry.sol";

/*
  keeps track of worker token balances of all
  states (free, staked, voted
*/

//INCOMPLETE

contract WorkerRegistry{

// =====================================================================
// STATE VARIABLES
// =====================================================================

  address tokenHolderRegistry;

  mapping (address => uint) balances;           //worker token balances

  uint256 totalWorkerTokenSupply;               //total supply of capital tokens in all states
  uint256 totalFreeWorkerTokenSupply;           //total supply of free capital tokens (not staked, validated, or voted)

// =====================================================================
// EVENTS
// =====================================================================

// =====================================================================
// FUNCTIONS
// =====================================================================

  // =====================================================================
  // CONSTRUCTOR
  // =====================================================================

  function WorkerRegistry(address _tokenHolderRegistry){
      tokenHolderRegistry = _tokenHolderRegistry;
  }

  // =====================================================================
  // PROPOSED PROJECT - STAKING FUNCTIONALITY
  // =====================================================================

  function stakeToken(uint256 _projectId, uint256 _tokens) {
    address _projectAddress = TokenHolderRegistry(tokenHolderRegistry).getProjectAddress(_projectId);
    require(balances[msg.sender] >= _tokens);   //make sure project exists & TH has tokens to stake
    bool success = Project(_projectAddress).stakeWorkerToken(_tokens, msg.sender);
    assert(success == true);
    balances[msg.sender] -= _tokens;
    totalFreeWorkerTokenSupply -= _tokens;
  }

  function unstakeToken(uint256 _projectId, uint256 _tokens) {
    address _projectAddress = TokenHolderRegistry(tokenHolderRegistry).getProjectAddress(_projectId);
    bool success = Project(_projectAddress).unstakeWorkerToken(_tokens, msg.sender);
    assert(success == true);
    balances[msg.sender] += _tokens;
    totalFreeWorkerTokenSupply += _tokens;
  }

  // =====================================================================
  // =====================================================================

  function completeTask(uint _projectId) {
    address _projectAddress = TokenHolderRegistry(tokenHolderRegistry).getProjectAddress(_projectId);
    Project(_projectAddress).completeTask();
  }

  // =====================================================================
  // COMPLETED PROJECT - VALIDATION & VOTING FUNCTIONALITY
  // =====================================================================

  function vote(uint256 _projectId, uint256 _tokens, bool _votingState) {
    address _projectAddress = TokenHolderRegistry(tokenHolderRegistry).getProjectAddress(_projectId);
    bool success = Project(_projectAddress).vote(msg.sender, _tokens, _votingState);
    assert(success == true);
    balances[msg.sender] -= _tokens;
    totalFreeWorkerTokenSupply -= _tokens;
  }

  // =====================================================================
  // FAILED / VALIDATED PROJECT
  // =====================================================================

  function updateTotal(uint256 _projectId, uint256 _tokens) {
    require(TokenHolderRegistry(tokenHolderRegistry).getProjectAddress(_projectId) == msg.sender);                  //check that valid project is calling this function
    totalWorkerTokenSupply -= _tokens;
  }


  function refundStaker(uint256 _projectId) {                                                                       //called by worker who staked or voted
    address _projectAddress = TokenHolderRegistry(tokenHolderRegistry).getProjectAddress(_projectId);
    uint256 _refund = Project(_projectAddress).refundStaker(msg.sender);
    totalFreeWorkerTokenSupply += _refund;
    balances[msg.sender] += _refund;
  }

  function rewardWorker(uint256 _projectId) {                                   //called by worker who completed a task
    address _projectAddress = TokenHolderRegistry(tokenHolderRegistry).getProjectAddress(_projectId);
    uint256 _reward = Project(_projectAddress).rewardWorker(msg.sender);
    if (_reward > 0) {
      TokenHolderRegistry(tokenHolderRegistry).rewardWorker(msg.sender, _reward);
    }

  }
}
