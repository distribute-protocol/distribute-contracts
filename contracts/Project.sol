
// ===================================================================== //
// This contract manages the ether and balances of stakers & validators of a given project.
// It holds its own state as well, set by a call from the PR.
// ===================================================================== //

pragma solidity ^0.4.10;

import "./TokenRegistry.sol";
import "./ReputationRegistry.sol";
import "./ProjectRegistry.sol";
import "./ProjectLibrary.sol";
import "./Task.sol";

contract Project {
  TokenRegistry tokenRegistry;
  ReputationRegistry reputationRegistry;
  ProjectRegistry projectRegistry;

  uint256 public state;

  /* POSSIBLE STATES */
  /*
    1: Proposed,
    2: Staked,
    3: Active,
    4: Validation,
    5: Voting,
    6: Complete,
    7: Failed,
    8: Expired
  */

  uint256 public stakedStatePeriod = 1 weeks;
  uint256 public activeStatePeriod = 2 weeks;
  uint256 public turnoverTime = 1 weeks;
  uint256 public validateStatePeriod = 1 weeks;
  uint256 public voteCommitPeriod = 1 weeks;
  uint256 public voteRevealPeriod = 1 weeks;

  address public proposer;
  uint256 public proposerType;
  uint256 public proposerStake;
  uint256 public stakingPeriod;
  uint256 public weiBal;
  uint256 public nextDeadline;
  uint256 public weiCost;
  uint256 public reputationCost;
  uint256 public passThreshold = 100;

  uint256 public totalTokensStaked;                           //amount of capital tokens currently staked
  uint256 public totalReputationStaked;                       //amount of worker tokens currently staked
  mapping (address => uint) public stakedTokenBalances;
  mapping (address => uint) public stakedReputationBalances;

  address[] public tasks;

  // =====================================================================
  // MODIFIERS
  // =====================================================================

  modifier onlyInState(uint256 _state) {
    require(state == _state);
    _;
  }

  modifier onlyPR() {
    require(msg.sender == address(projectRegistry));
    _;
  }

  modifier onlyTR() {
    require(msg.sender == address(tokenRegistry));
    _;
  }

  modifier onlyRR() {
    require(msg.sender == address(reputationRegistry));
    _;
  }

  function isTR(address _sender) public view returns (bool) {
    if (_sender == address(tokenRegistry)) {
      return true;
    } else {
      return false;
    }
  }
  function isRR(address _sender) public view returns (bool) {
    if (_sender == address(reputationRegistry)) {
      return true;
    } else {
      return false;
    }
  }

  // =====================================================================
  // CONSTRUCTOR
  // =====================================================================

  function Project(
    uint256 _cost,
    uint256 _costProportion,
    uint256 _stakingPeriod,
    address _proposer,
    uint256 _proposerType,
    uint256 _proposerStake,
    address _reputationRegistry,
    address _tokenRegistry
  ) public {       //called by THR
    reputationRegistry = ReputationRegistry(_reputationRegistry);
    tokenRegistry = TokenRegistry(_tokenRegistry);
    projectRegistry = ProjectRegistry(msg.sender);
    weiCost = _cost;
    reputationCost = _costProportion * reputationRegistry.totalSupply();
    state = 1;
    nextDeadline = _stakingPeriod;
    proposer = _proposer;
    proposerType = _proposerType;
    proposerStake = _proposerStake;
  }

  // =====================================================================
  // GETTER FUNCTIONS
  // =====================================================================

  function getTaskCount() public view returns (uint256) {
    return tasks.length;
  }

  // =====================================================================
  // SETTER FUNCTIONS
  // =====================================================================

  function setState(uint256 _state, uint256 _nextDeadline) public onlyPR {
    state = _state;
    nextDeadline = _nextDeadline;
  }

  function clearProposerStake() public onlyPR {
    proposerStake = 0;
  }

  function clearTokenStake(address _staker) public onlyTR {
    stakedTokenBalances[_staker] = 0;
  }

  function clearReputationStake(address _staker) public onlyRR {
    stakedReputationBalances[_staker] = 0;
  }

  function clearStake() public onlyPR {
    totalTokensStaked = 0;
    totalReputationStaked = 0;
  }

  function setTaskAddress(address _taskAddress, uint _index) public onlyPR {
    tasks[_index] = _taskAddress;
  }

  function setPassThreshold(uint256 _passThreshold) public onlyPR() {
    passThreshold = _passThreshold;
  }

  // =====================================================================
  // STAKE FUNCTIONS
  // =====================================================================

  function stakeTokens(address _staker, uint256 _tokens, uint256 _weiValue) public onlyTR onlyInState(1) {
    stakedTokenBalances[_staker] += _tokens;
    totalTokensStaked += _tokens;
    weiBal += _weiValue;
    projectRegistry.checkStaked(address(this));
  }

  function unstakeTokens(address _staker, uint256 _tokens) public onlyTR onlyInState(1) returns (uint256) {
    require(stakedTokenBalances[_staker] - _tokens < stakedTokenBalances[_staker] &&   //check overflow
         stakedTokenBalances[_staker] >= _tokens);   //make sure _staker has the tokens staked to unstake */
    uint256 weiVal = (_tokens / totalTokensStaked) * weiBal;
    stakedTokenBalances[_staker] -= _tokens;
    totalTokensStaked -= _tokens;
    weiBal -= weiVal;
    return weiVal;
  }

  function stakeReputation(address _staker, uint256 _reputation) public onlyRR onlyInState(1) {
    require(stakedReputationBalances[_staker] + _reputation > stakedReputationBalances[_staker]);
    stakedReputationBalances[_staker] += _reputation;
    totalReputationStaked += _reputation;
    projectRegistry.checkStaked(address(this));
  }

  function unstakeReputation(address _staker, uint256 _reputation) public onlyRR onlyInState(1) {
    require(stakedReputationBalances[_staker] - _reputation < stakedReputationBalances[_staker] &&  //check overflow /
      stakedReputationBalances[_staker] >= _reputation); //make sure _staker has the tokens staked to unstake
    stakedReputationBalances[_staker] -= _reputation;
    totalReputationStaked -= _reputation;
  }

  // =====================================================================
  // REWARD FUNCTIONS
  // =====================================================================

  function transferWeiReward(address _rewardee, uint _reward) public onlyRR {
    require(_reward <= weiBal);
    weiBal -= _reward;
    _rewardee.transfer(_reward);
  }

  function() public payable {

  }
}
