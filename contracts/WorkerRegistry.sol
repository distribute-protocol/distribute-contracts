pragma solidity ^0.4.10;

//import files
import "./Project.sol";
import "./TokenHolderRegistry.sol";
import "./PLCRVoting.sol";

/*
  keeps track of worker token balances of all
  states (free, staked, voted
*/

//INCOMPLETE

contract WorkerRegistry{

// =====================================================================
// STATE VARIABLES
// =====================================================================

  TokenHolderRegistry tokenHolderRegistry;
  PLCRVoting plcrVoting;

  mapping (address => uint) public balances;                   //worker token balances

  uint256 public totalWorkerTokenSupply;               //total supply of capital tokens in all states
  uint256 public totalFreeWorkerTokenSupply;           //total supply of free capital tokens (not staked, validated, or voted)

// =====================================================================
// EVENTS
// =====================================================================

// =====================================================================
// FUNCTIONS
// =====================================================================

  // =====================================================================
  // CONSTRUCTOR
  // =====================================================================

  function init(address _tokenHolderRegistry, address _plcrVoting) public {
      require(address(tokenHolderRegistry) == 0 && address(plcrVoting) == 0);
      tokenHolderRegistry = TokenHolderRegistry(_tokenHolderRegistry);
      plcrVoting = PLCRVoting(_plcrVoting);
  }

  function register() public {
    require(balances[msg.sender] == 0);
    balances[msg.sender] = 1;
  }

  // =====================================================================
  // PROPOSED PROJECT - STAKING FUNCTIONALITY
  // =====================================================================

  function stakeToken(uint256 _projectId, uint256 _tokens) public {
    require(balances[msg.sender] > 1);
    address _projectAddress = tokenHolderRegistry.getProjectAddress(_projectId);
    require(balances[msg.sender] >= _tokens);   //make sure project exists & TH has tokens to stake
    balances[msg.sender] -= _tokens;
    totalFreeWorkerTokenSupply -= _tokens;
    Project(_projectAddress).stakeWorkerToken(_tokens, msg.sender);
  }

  function unstakeToken(uint256 _projectId, uint256 _tokens) public {
    address _projectAddress = tokenHolderRegistry.getProjectAddress(_projectId);
    balances[msg.sender] += _tokens;
    totalFreeWorkerTokenSupply += _tokens;
    Project(_projectAddress).unstakeWorkerToken(_tokens, msg.sender);
  }

  function submitTaskHash(uint256 _projectId, bytes32 _taskHash) public {
    address _projectAddress = tokenHolderRegistry.getProjectAddress(_projectId);
    Project(_projectAddress).addTaskHash(_taskHash, msg.sender);
  }

  // =====================================================================
  // ACTIVE PERIOD FUNCTIONALITY
  // =====================================================================

  function submitHashList(uint256 _projectId, bytes32[] _hashes) public {
    address _projectAddress = tokenHolderRegistry.getProjectAddress(_projectId);
    Project(_projectAddress).submitHashList(_hashes);
  }

  function claimTask(uint256 _projectId, uint256 _index, string _taskDescription, uint256 _weiVal, uint256 _tokenVal) public {
    require(balances[msg.sender] >= _tokenVal);
    address _projectAddress = tokenHolderRegistry.getProjectAddress(_projectId);
    balances[msg.sender] -= _tokenVal;
    Project(_projectAddress).claimTask(_index, _taskDescription, _weiVal, _tokenVal, msg.sender);
  }

  // =====================================================================
  // VALIDATE/VOTING FUNCTIONALITY
  // =====================================================================

  function voteCommit(uint256 _projectId, uint256 _tokens, bytes32 _secretHash, uint256 _prevPollID) public {     //_secretHash Commit keccak256 hash of voter's choice and salt (tightly packed in this order), done off-chain
    require(balances[msg.sender] > 1);      //worker can't vote with only 1 token
    uint256 pollId = tokenHolderRegistry.getPollId(_projectId);
    uint256 nonce = tokenHolderRegistry.projectNonce();
    //calculate available tokens for voting
    uint256 availableTokens = plcrVoting.voteTokenBalanceW(msg.sender) - plcrVoting.getLockedTokens(msg.sender);
    //make sure msg.sender has tokens available in PLCR contract
    //if not, request voting rights for token holder
    if (availableTokens < _tokens) {
      require(balances[msg.sender] >= _tokens - availableTokens && _projectId <= nonce && _projectId > 0);
      balances[msg.sender] -= _tokens;
      totalFreeWorkerTokenSupply -= _tokens;
      plcrVoting.requestVotingRights(msg.sender, _tokens - availableTokens);
    }
    plcrVoting.commitVote(msg.sender, pollId, _secretHash, _tokens, _prevPollID);
  }

  function voteReveal(uint256 _projectId, uint256 _voteOption, uint _salt) public {
    uint256 pollId = tokenHolderRegistry.getPollId(_projectId);
    plcrVoting.revealVote(pollId, _voteOption, _salt);
  }

  function refundVotingTokens(uint256 _tokens) public {
    plcrVoting.withdrawVotingRights(msg.sender, _tokens);
    balances[msg.sender] += _tokens;
    totalFreeWorkerTokenSupply += _tokens;
  }


  // =====================================================================
  // FAILED / VALIDATED PROJECT
  // =====================================================================

  // We should document this function further, or make its name more descriptive
  function burnTokens(uint256 _projectId, uint256 _tokens) public {
    require(tokenHolderRegistry.getProjectAddress(_projectId) == msg.sender);                  //check that valid project is calling this function
    totalWorkerTokenSupply -= _tokens;
  }


  function refundStaker(uint256 _projectId) public {                                                                       //called by worker who staked or voted
    address _projectAddress = tokenHolderRegistry.getProjectAddress(_projectId);
    uint256 _refund = Project(_projectAddress).refundStaker(msg.sender);
    totalFreeWorkerTokenSupply += _refund;
    balances[msg.sender] += _refund;
  }

  function rewardWorker(uint256 _projectId, bytes32 _taskHash) public {                                   //called by worker who completed a task
    address _projectAddress = tokenHolderRegistry.getProjectAddress(_projectId);
    uint256 reward = Project(_projectAddress).rewardWorker(_taskHash, msg.sender);
    totalFreeWorkerTokenSupply += reward;
    balances[msg.sender] += reward;
  }
}
