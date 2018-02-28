pragma solidity ^0.4.8;

import "./Project.sol";
import "./TokenRegistry.sol";
import "./ReputationRegistry.sol";
import "./ProjectRegistry.sol";

library ProjectLibrary {

  struct Reward {
    uint256 weiReward;
    uint256 reputationReward;
    address claimer;
  }

  event tokenRefund(address staker, uint256 refund);
  event reputationRefund(address projectAddress, address staker, uint256 refund);
  // =====================================================================
  // UTILITY FUNCTIONS
  // =====================================================================
  modifier onlyInState(address _projectAddress, uint256 _state) {
    Project project = Project(_projectAddress);
    require(project.state() == _state);
    _;
  }

  function isStaker(address _projectAddress, address _staker) public view returns(bool) {
    Project project = Project(_projectAddress);
    return project.stakedTokenBalances(_staker) > 0 || project.stakedReputationBalances(_staker) > 0;
  }

  function percent(uint256 numerator, uint256 denominator, uint256 precision) internal pure returns (uint256) {
     // caution, check safe-to-multiply here
    uint256 _numerator  = numerator * 10 ** (precision+1);
    // with rounding of last digit
    return ((_numerator / denominator) + 5) / 10;
  }

  function calculateWeightOfAddress(address _projectAddress, address _address) public view returns (uint256) {
    uint256 reputationWeight;
    uint256 tokenWeight;
    Project project = Project(_projectAddress);
    project.totalReputationStaked() != 0
      ? reputationWeight = percent(project.stakedReputationBalances(_address), project.totalReputationStaked(), 2)
      : reputationWeight = 0;
    project.totalTokensStaked() != 0
      ? tokenWeight = percent(project.stakedTokenBalances(_address), project.totalTokensStaked(), 2)
      : tokenWeight = 0;
    return (reputationWeight + tokenWeight) / 2;
    /* return percent((stakedReputationBalances[_address] + stakedTokenBalances[_address]), (totalTokensStaked + totalReputationStaked), 2); */
  }

  function timesUp(address _projectAddress) public view returns (bool) {
    return (now > Project(_projectAddress).nextDeadline());
  }

  function isStaked(address _projectAddress) public view returns (bool) {
    Project project = Project(_projectAddress);
    return project.weiCost() <= project.weiBal() && project.reputationCost() <= project.totalReputationStaked();
  }

  /* ####### NEEDS TESTS ####### */
  function refundStaker(address _projectAddress, address _staker) public returns (uint256 _refund) {  //called by THR or WR, allow return of staked, validated, and
    Project project = Project(_projectAddress);
    /* require(msg.sender == address(tokenRegistry) ||  msg.sender == address(reputationRegistry)); */
    require(project.state() == 6);
    if (project.isTR(msg.sender)) {
      return handleTokenStaker(msg.sender, _projectAddress, _staker);
    } else if (project.isRR(msg.sender)) {
      return handleReputationStaker(_projectAddress, _staker);
    }
  }

  function handleTokenStaker(address _tokenRegistry, address _projectAddress, address _staker) internal returns (uint256 _refund) {
    uint256 refund;     //tokens
    Project project = Project(_projectAddress);
    if(project.totalTokensStaked() != 0) {
      refund = project.stakedTokenBalances(_staker);
      project.clearTokenStake(_staker);
    }
    refund += validatorRewardHandler(_tokenRegistry, _projectAddress, _staker);
    tokenRefund(_staker, refund);
    return refund;
  }

  function validatorRewardHandler(address _tokenRegistry, address _projectAddress, address _staker) internal returns (uint256 _refund) {
    uint256 refund;
    Project project = Project(_projectAddress);
    if(project.totalValidateNegative() != 0 || project.totalValidateAffirmative() != 0) {
      var (,stake) = project.validators(_staker);
      refund += stake;
      uint256 denom;
      project.state() == 7
        ? denom = project.totalValidateNegative()
        : denom = project.totalValidateAffirmative();
      project.opposingValidator() == true)
        ? refund += project.validateReward() * stake / denom;
        : TokenRegistry(_tokenRegistry).rewardValidator(_projectAddress, _staker, (project.weiCost() * stake / denom));
      project.clearValidatorStake(_staker);
    }
    return refund;
  }

  function handleReputationStaker(address _projectAddress, address _staker) internal returns (uint256 _refund) {
    uint256 refund;
    Project project = Project(_projectAddress);
    if(project.totalReputationStaked() != 0) {
      refund = project.stakedReputationBalances(_staker);
      project.clearReputationStake(_staker);
    }
    reputationRefund(_projectAddress, _staker, refund);
    return refund;
  }

  // =====================================================================
  // VALIDATOR FUNCTIONS
  // =====================================================================
  function validate(address _projectAddress, address _staker, uint256 _tokens, bool _validationState) public onlyInState(_projectAddress, 4) {
    //check for free tokens done in THR
    //increments validation tokens in Project.sol only
    // NEEDS A CHECK FOR REMOVING VALIDATION / CHANGING VALIDATION
    Project project = Project(_projectAddress);
    require(_tokens > 0);
    if (_validationState == true) {
      project.setValidator(_staker, 1, _tokens);
      project.addValidationTokens(1, _tokens);
    }
    else if (_validationState == false){
      project.setValidator(_staker, 0, _tokens);
      project.addValidationTokens(0, _tokens);
    }
  }

  function setValidationState(address _tokenRegistry, address _reputationRegistry, address _projectAddress, bool isPassed) public {
    Project project = Project(_projectAddress);
    if(isPassed) {                          // project succeeds
      project.setValidationReward(0);
    } else {                                // project fails
      burnStake(_tokenRegistry, _reputationRegistry, _projectAddress);
      project.setValidationReward(1);
    }
    if (project.validateReward() == 0) {
      project.setOpposingValidator();
    }
  }

  function burnStake(address _tokenRegistry, address _reputationRegistry, address _projectAddress) internal {
    Project project = Project(_projectAddress);
    TokenRegistry(_tokenRegistry).burnTokens(project.totalTokensStaked());
    ReputationRegistry(_reputationRegistry).burnReputation(project.totalReputationStaked());
    project.clearStake();
  }

  // =====================================================================
  // TASK FUNCTIONS
  // =====================================================================

  /* ####### NEEDS TESTS ####### */
  function claimTask(address _projectAddress, bytes32 _taskHash, uint256 _weiVal, uint256 _reputationVal, address _claimer) public onlyInState(_projectAddress, 3) {
    Project project = Project(_projectAddress);
    //###############################################
    var (,claimer) = project.taskRewards(_taskHash);
    require(claimer == 0);
    project.setTaskReward(_taskHash, _weiVal, _reputationVal, _claimer);
  }

  /* ####### NEEDS TESTS ####### */
  function claimTaskReward(address _tokenRegistry, address _projectAddress, bytes32 _taskHash, address _claimer) public onlyInState(_projectAddress, 6) returns (uint256) {
    Project project = Project(_projectAddress);
    var (weiReward, reputationReward, claimer) = project.taskRewards(_taskHash);
    require(claimer == _claimer);
    project.setTaskReward(_taskHash, 0, 0, 0);
    TokenRegistry(_tokenRegistry).transferWeiReward(_claimer, weiReward);
    return reputationReward;
  }
}
