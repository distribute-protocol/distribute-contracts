
// ===================================================================== //
// This contract manages the ether and balances of stakers & validators of a given project.
// It holds its own state as well, set by a call from the PR.
// ===================================================================== //

pragma solidity ^0.4.10;

import "./TokenRegistry.sol";
import "./ReputationRegistry.sol";
import "./ProjectRegistry.sol";
import "./DistributeToken.sol";

contract Project {
  TokenRegistry tokenRegistry;
  ReputationRegistry reputationRegistry;
  ProjectRegistry projectRegistry;
  uint256 public state;
  /* POSSIBLE STATES */
  /*
    1: Proposed,
    2: Open,
    3: Dispute,
    4: Active,
    5: Validation,
    6: Voting,
    7: Complete,
    8: Failed
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

  event tokenRefund(address staker, uint256 refund);
  event reputationRefund(address staker, uint256 refund);

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

  // =====================================================================
  // CONSTRUCTOR
  // =====================================================================
  function Project(uint256 _cost, uint256 _costProportion, uint256 _stakingPeriod, address _reputationRegistry, address _tokenRegistry) public {       //called by THR
    tokenRegistry = TokenRegistry(_tokenRegistry);     //the token holder registry calls this function
    reputationRegistry = ReputationRegistry(_reputationRegistry);
    projectRegistry = ProjectRegistry(msg.sender);
    weiCost = _cost;
    reputationCost = _costProportion * reputationRegistry.totalFreeSupply();
    state = 1;
    nextDeadline = _stakingPeriod;
  }

  // =====================================================================
  // UTILITY FUNCTIONS
  // =====================================================================

  function isStaker(address _staker) public view returns(bool) {
    return stakedTokenBalances[_staker] > 0 || stakedReputationBalances[_staker] > 0;
  }

  function percent(uint256 numerator, uint256 denominator, uint256 precision) internal pure returns (uint256) {
     // caution, check safe-to-multiply here
    uint256 _numerator  = numerator * 10 ** (precision+1);
    // with rounding of last digit
    return ((_numerator / denominator) + 5) / 10;
  }

  function calculateWeightOfAddress(address _address) public view onlyPR returns (uint256) {
    uint256 reputationWeight;
    uint256 tokenWeight;
    reputationWeight = percent(stakedReputationBalances[_address], totalReputationStaked, 2);
    tokenWeight = percent(stakedTokenBalances[_address], totalTokensStaked, 2);
    return (reputationWeight + tokenWeight) / 2;
    /* return percent((stakedReputationBalances[_address] + stakedTokenBalances[_address]), (totalTokensStaked + totalReputationStaked), 2); */
  }

  function timesUp() public view returns (bool) {
    return (now > nextDeadline);
  }

  function isStaked() public view returns (bool) {
    return weiCost <= weiBal && reputationCost <= totalReputationStaked;
  }

  // =====================================================================
  // SETTER FUNCTIONS
  // =====================================================================

  function setState(uint256 _state, uint256 _nextDeadline) public onlyPR {
    state = _state;
    nextDeadline = _nextDeadline;
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

  /* ####### NEEDS TESTS ####### */
  function refundStaker(address _staker) public returns (uint256 _refund) {  //called by THR or WR, allow return of staked, validated, and
    require(msg.sender == address(tokenRegistry) ||  msg.sender == address(reputationRegistry));
    require(state == 7 || state == 8);
    if (msg.sender == address(tokenRegistry)) {
      return handleTokenStaker(_staker);
    } else if (msg.sender == address(reputationRegistry)) {
      return handleReputationStaker(_staker);
    }
  }

  function handleTokenStaker(address _staker) internal returns (uint256 _refund) {
    uint256 refund;     //tokens
    if(totalTokensStaked != 0) {
      refund = stakedTokenBalances[_staker];
      stakedTokenBalances[_staker] = 0;
    }
    refund += validatorRewardHandler(_staker);
    tokenRefund(_staker, refund);
    return refund;
  }

  function validatorRewardHandler(address _staker) internal returns (uint256 _refund) {
    uint256 refund;
    if(totalValidateNegative != 0 || totalValidateAffirmative != 0) {
      refund += validators[_staker].stake;
      uint256 denom;
      state == 8
        ? denom = totalValidateNegative
        : denom = totalValidateAffirmative;
      if (opposingValidator == true) {
        refund += validateReward * validators[_staker].stake / denom;
      } else {
        tokenRegistry.rewardValidator(_staker, (weiCost * validators[_staker].stake / denom));
      }
      validators[_staker].stake = 0;
    }
    return refund;
  }

  function handleReputationStaker(address _staker) internal returns (uint256 _refund) {
    uint256 refund;
    if(totalReputationStaked != 0) {
      refund = stakedReputationBalances[_staker];
      stakedReputationBalances[_staker] = 0;
    }
    reputationRefund(_staker, refund);
    return refund;
  }

  // =====================================================================
  // VALIDATOR FUNCTIONS
  // =====================================================================
  function validate(address _staker, uint256 _tokens, bool _validationState) public onlyTR() onlyInState(5) {
    //check for free tokens done in THR
    //increments validation tokens in Project.sol only
    // NEEDS A CHECK FOR REMOVING VALIDATION / CHANGING VALIDATION
    require(_tokens > 0);
    if (_validationState == true) {
      validators[_staker] = Validator(1, _tokens);
      totalValidateAffirmative += _tokens;
    }
    else if (_validationState == false){
      validators[_staker] = Validator(0, _tokens);
      totalValidateNegative += _tokens;
    }
  }

  function setValidationState(bool isPassed) public onlyPR() {
    if(isPassed) {                          // project succeeds
      validateReward = totalValidateNegative;
      totalValidateNegative = 0;
    } else {                                // project fails
      burnStake();
      validateReward = totalValidateAffirmative;
      totalValidateAffirmative = 0;
    }
    if (validateReward == 0) {
      opposingValidator = false;
    }
  }

  function burnStake() internal {
    tokenRegistry.burnTokens(totalTokensStaked);
    reputationRegistry.burnReputation(totalReputationStaked);
    totalTokensStaked = 0;
    totalReputationStaked = 0;
  }

  // =====================================================================
  // TASK FUNCTIONS
  // =====================================================================

  /* ####### NEEDS TESTS ####### */
  function claimTask(bytes32 _taskHash, uint256 _weiVal, uint256 _reputationVal, address _claimer) public onlyInState(4) onlyPR() {
    require(taskRewards[_taskHash].claimer == 0);
    Reward storage taskReward = taskRewards[_taskHash];
    taskReward.claimer = _claimer;
    taskReward.weiReward = _weiVal;
    taskReward.reputationReward = _reputationVal;
  }

  /* ####### NEEDS TESTS ####### */
  function claimTaskReward(bytes32 _taskHash, address _claimer) public onlyInState(7) onlyRR() returns (uint256) {
    require(taskRewards[_taskHash].claimer == _claimer);
    Reward storage singleTaskReward = taskRewards[_taskHash];
    uint256 weiTemp = singleTaskReward.weiReward;
    uint256 reputationReward = singleTaskReward.reputationReward;
    singleTaskReward.claimer = 0;
    singleTaskReward.weiReward = 0;
    singleTaskReward.reputationReward = 0;
    tokenRegistry.transferWeiReward(_claimer, weiTemp);
    return reputationReward;
  }

  function() public payable {

  }
}
