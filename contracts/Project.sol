
// ===================================================================== //
// This contract manages the ether and balances of stakers & validators of a given project.
// It holds its own state as well, set by a call from the PR.
// ===================================================================== //

pragma solidity ^0.4.10;

import "./TokenRegistry.sol";
import "./ReputationRegistry.sol";
import "./ProjectRegistry.sol";
import "./DistributeToken.sol";
import "./ProjectLibrary.sol";

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
    7: Failed
  */
  uint256 public weiBal;
  uint256 public nextDeadline;
  //set by proposer, total cost of project in ETH, to be fulfilled by capital token holders
  uint256 public weiCost;
  //total amount of staked worker tokens needed, TBD
  uint256 public reputationCost;

  uint256 public totalTokensStaked;           //amount of capital tokens currently staked
  uint256 public totalReputationStaked;            //amount of worker tokens currently staked
  mapping (address => uint) public stakedTokenBalances;
  mapping (address => uint) public stakedReputationBalances;

  struct Validator {
    uint256 status;
    uint256 stake;
  }


 bool public opposingValidator = true;
 uint256 public validateReward;

  mapping (address => Validator) public validators;
  uint256 public totalValidateAffirmative;
  uint256 public totalValidateNegative;

  struct Reward {
    uint256 weiReward;
    uint256 reputationReward;
    address claimer;
  }

  mapping (bytes32 => Reward) public taskRewards;


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

  modifier onlyPRorRR() {
    require(msg.sender == address(projectRegistry) || msg.sender == address(reputationRegistry));
    _;
  }

  function isTR(address _sender) public view returns (bool) {
    _sender == address(tokenRegistry)
      ? true
      : false;
  }
  function isRR(address _sender) public view returns (bool) {
    _sender == address(reputationRegistry)
      ? true
      : false;
  }

  // =====================================================================
  // CONSTRUCTOR
  // =====================================================================
  function Project(uint256 _cost, uint256 _costProportion, uint256 _stakingPeriod, address _reputationRegistry, address _tokenRegistry) public {       //called by THR
    reputationRegistry = ReputationRegistry(_reputationRegistry);
    tokenRegistry = TokenRegistry(_tokenRegistry);
    projectRegistry = ProjectRegistry(msg.sender);
    weiCost = _cost;
    reputationCost = _costProportion * reputationRegistry.totalFreeSupply();
    state = 1;
    nextDeadline = _stakingPeriod;
  }

  // =====================================================================
  // SETTER FUNCTIONS
  // =====================================================================

  function setState(uint256 _state, uint256 _nextDeadline) public onlyPR {
    state = _state;
    nextDeadline = _nextDeadline;
  }

  function clearTokenStake(address _staker) public onlyTR {
    stakedTokenBalances[_staker] = 0;
  }

  function clearValidatorStake(address _staker) public onlyTR {
    validators[_staker].stake = 0;
  }

  function clearReputationStake(address _staker) public onlyRR {
    stakedReputationBalances[_staker] = 0;
  }

  function setValidator(address _staker, uint256 _validationVal, uint256 _tokens) public onlyTR {
    validators[_staker] = Validator(_validationVal, _tokens);
  }

  function addValidationTokens(uint256 _validationVal, uint256 _tokens) public onlyTR {
    _validationVal == 1
      ? totalValidateAffirmative += _tokens
      : totalValidateNegative += _tokens;
  }
  function setValidationReward(uint256 _validationVal) public onlyPR {
    if (_validationVal == 0) {
      validateReward = totalValidateNegative;
      totalValidateNegative = 0;
    } else if (_validationVal == 1) {
      validateReward = totalValidateAffirmative;
      totalValidateAffirmative = 0;
    }
  }
  function setOpposingValidator() public onlyPR {
    opposingValidator = false;
  }

  function clearStake() public onlyPR {
    totalTokensStaked = 0;
    totalReputationStaked = 0;
  }

  function setTaskReward(bytes32 _taskHash, uint256 _weiVal, uint256 _reputationVal, address _claimer) public onlyPRorRR {
    Reward storage taskReward = taskRewards[_taskHash];
    taskReward.weiReward = _weiVal;
    taskReward.reputationReward = _reputationVal;
    taskReward.claimer = _claimer;
    /* taskRewards[_taskHash] = _reward; */
  }

  // =====================================================================
  // STAKE FUNCTIONS
  // =====================================================================
  function stakeTokens(address _staker, uint256 _tokens, uint256 _weiValue) public onlyTR onlyInState(1) {
    stakedTokenBalances[_staker] += _tokens;
    totalTokensStaked += _tokens;
    weiBal += _weiValue;
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
  }

  function unstakeReputation(address _staker, uint256 _reputation) public onlyRR onlyInState(1) {
    require(stakedReputationBalances[_staker] - _reputation < stakedReputationBalances[_staker] &&  //check overflow /
      stakedReputationBalances[_staker] >= _reputation); //make sure _staker has the tokens staked to unstake
    stakedReputationBalances[_staker] -= _reputation;
    totalReputationStaked -= _reputation;

  }

  function() public payable {

  }
}
