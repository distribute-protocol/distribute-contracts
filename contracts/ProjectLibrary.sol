pragma solidity ^0.4.8;

import "./Project.sol";
import "./TokenRegistry.sol";
import "./ReputationRegistry.sol";
import "./ProjectRegistry.sol";
import "./Task.sol";

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

// happens at the end!
  function refundStaker(address _projectAddress, address _staker) public returns (uint256) {
    Project project = Project(_projectAddress);
    require(project.state() == 6 || (project.state() == 8));
    if (project.isTR(msg.sender)) {
      return handleTokenStaker(_projectAddress, _staker);
    } else if (project.isRR(msg.sender)) {
      return handleReputationStaker(_projectAddress, _staker);
    }
  }

  // this happens at the end when all tasks are completed!
  function handleTokenStaker(address _projectAddress, address _staker) internal returns (uint256) {
    uint256 refund;
    // account for proportion of successful tasks
    Project project = Project(_projectAddress);
    if(project.totalTokensStaked() != 0) {
      refund = project.stakedTokenBalances(_staker) * project.passThreshold() / 100;
      project.clearTokenStake(_staker);
    }
    tokenRefund(_staker, refund);
    return refund;
  }

  function handleReputationStaker(address _projectAddress, address _staker) internal returns (uint256 _refund) {
    uint256 refund;
    Project project = Project(_projectAddress);
    if(project.totalReputationStaked() != 0) {
      refund = project.stakedReputationBalances(_staker) * project.passThreshold() / 100;
      project.clearReputationStake(_staker);
    }
    reputationRefund(_projectAddress, _staker, refund);
    return refund;
  }
  // =====================================================================
  // TASK FUNCTIONS
  // =====================================================================

  function claimTask(address _projectAddress, uint256 _index, uint256 _weiVal, uint256 _reputationVal, address _claimer) public onlyInState(_projectAddress, 3) {
    Project project = Project(_projectAddress);
    Task task = Task(project.tasks(_index));
    require(task.claimer() == 0 || now > (task.claimTime() + project.turnoverTime()) && !task.complete());
    task.setTaskReward(_weiVal, _reputationVal, _claimer);
  }

  function claimTaskReward(uint256 _index, address _projectAddress, address _claimer) public onlyInState(_projectAddress, 6) returns (uint256) {
    Project project = Project(_projectAddress);
    Task task = Task(project.tasks(_index));
    require(task.claimer() == _claimer && task.claimableByRep());
    uint256 weiReward = task.weiReward();
    uint256 reputationReward = task.reputationReward();
    task.setTaskReward(0, 0, _claimer);
    project.transferWeiReward(_claimer, weiReward);
    return reputationReward;
  }

  // =====================================================================
  // VALIDATOR FUNCTIONS
  // =====================================================================
  function validate(address _projectAddress, address _staker, uint256 _index, uint256 _tokens, bool _validationState) public onlyInState(_projectAddress, 4) {
    Project project = Project(_projectAddress);
    Task task = Task(project.tasks(_index));
    require(_tokens > 0);
    if (_validationState == true) {
      task.setValidator(_staker, 1, _tokens);
    }
    else if (_validationState == false){
      task.setValidator(_staker, 0, _tokens);
    }
  }

  function calculatePassThreshold(address _projectAddress) internal returns (uint){
    Project project = Project(_projectAddress);
    uint totalWeighting;
    for (uint i = 0; i < project.getTaskCount(); i++) {
      Task task = Task(project.tasks(i));
      if (task.claimableByRep()) {
        totalWeighting += task.weighting();
      }
    }
    project.setPassThreshold(totalWeighting);
    return totalWeighting;
  }

  function burnStake(address _tokenRegistry, address _reputationRegistry, address _projectAddress) public {
    Project project = Project(_projectAddress);
    TokenRegistry(_tokenRegistry).burnTokens(project.totalTokensStaked());
    ReputationRegistry(_reputationRegistry).burnReputation(project.totalReputationStaked());
    project.clearStake();
  }
}
