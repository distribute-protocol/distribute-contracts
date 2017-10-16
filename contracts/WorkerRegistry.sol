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

  address tokenHolderRegistry;
  address plcrVoting;

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

  function init(address _tokenHolderRegistry, address _plcrVoting) public {
      tokenHolderRegistry = _tokenHolderRegistry;
      plcrVoting = _plcrVoting;
  }

  // =====================================================================
  // PROPOSED PROJECT - STAKING FUNCTIONALITY
  // =====================================================================

  function stakeToken(uint256 _projectId, uint256 _tokens) public {
    address _projectAddress = TokenHolderRegistry(tokenHolderRegistry).getProjectAddress(_projectId);
    require(balances[msg.sender] >= _tokens);   //make sure project exists & TH has tokens to stake
    bool success = Project(_projectAddress).stakeWorkerToken(_tokens, msg.sender);
    assert(success == true);
    balances[msg.sender] -= _tokens;
    totalFreeWorkerTokenSupply -= _tokens;
  }

  function unstakeToken(uint256 _projectId, uint256 _tokens) public {
    address _projectAddress = TokenHolderRegistry(tokenHolderRegistry).getProjectAddress(_projectId);
    bool success = Project(_projectAddress).unstakeWorkerToken(_tokens, msg.sender);
    assert(success == true);
    balances[msg.sender] += _tokens;
    totalFreeWorkerTokenSupply += _tokens;
  }

  // =====================================================================
  // =====================================================================

  function completeTask(uint _projectId) public {
    address _projectAddress = TokenHolderRegistry(tokenHolderRegistry).getProjectAddress(_projectId);
    Project(_projectAddress).completeTask();
  }

  // =====================================================================
  // COMPLETED PROJECT - VALIDATION & VOTING FUNCTIONALITY
  // =====================================================================

  function voteCommit(uint256 _projectId, uint256 _tokens, bytes32 _secretHash, uint256 _prevPollID) public {     //_secretHash Commit keccak256 hash of voter's choice and salt (tightly packed in this order), done off-chain
    uint256 pollId = TokenHolderRegistry(tokenHolderRegistry).getPollId(_projectId);
    uint256 nonce = TokenHolderRegistry(tokenHolderRegistry).projectNonce();
    //calculate available tokens for voting
    uint256 availableTokens = PLCRVoting(plcrVoting).voteTokenBalanceW(msg.sender) - PLCRVoting(plcrVoting).getLockedTokens(msg.sender);
    //make sure msg.sender has tokens available in PLCR contract
    //if not, request voting rights for token holder
    if (availableTokens < _tokens) {
      require(balances[msg.sender] >= _tokens - availableTokens && _projectId <= nonce && _projectId > 0);
      balances[msg.sender] -= _tokens;
      totalFreeWorkerTokenSupply -= _tokens;
      PLCRVoting(plcrVoting).requestVotingRights(msg.sender, _tokens - availableTokens);
    }
    PLCRVoting(plcrVoting).commitVote(msg.sender, pollId, _secretHash, _tokens, _prevPollID);
  }

  function voteReveal(uint256 _projectId, uint256 _voteOption, uint _salt) public {
    uint256 pollId = TokenHolderRegistry(tokenHolderRegistry).getPollId(_projectId);
    PLCRVoting(plcrVoting).revealVote(pollId, _voteOption, _salt);
  }

  function refundVotingTokens(uint256 _tokens) public {
    PLCRVoting(plcrVoting).withdrawVotingRights(msg.sender, _tokens);
    balances[msg.sender] += _tokens;
    totalFreeWorkerTokenSupply += _tokens;
  }


  // =====================================================================
  // FAILED / VALIDATED PROJECT
  // =====================================================================

  function updateTotal(uint256 _projectId, uint256 _tokens) public {
    require(TokenHolderRegistry(tokenHolderRegistry).getProjectAddress(_projectId) == msg.sender);                  //check that valid project is calling this function
    totalWorkerTokenSupply -= _tokens;
  }


  function refundStaker(uint256 _projectId) public {                                                                       //called by worker who staked or voted
    address _projectAddress = TokenHolderRegistry(tokenHolderRegistry).getProjectAddress(_projectId);
    uint256 _refund = Project(_projectAddress).refundStaker(msg.sender);
    totalFreeWorkerTokenSupply += _refund;
    balances[msg.sender] += _refund;
  }

  function rewardWorker(uint256 _projectId) public {                                   //called by worker who completed a task
    address _projectAddress = TokenHolderRegistry(tokenHolderRegistry).getProjectAddress(_projectId);
    uint256 _reward = Project(_projectAddress).rewardWorker(msg.sender);
    if (_reward > 0) {
      TokenHolderRegistry(tokenHolderRegistry).rewardWorker(msg.sender, _reward);
    }

  }
}
