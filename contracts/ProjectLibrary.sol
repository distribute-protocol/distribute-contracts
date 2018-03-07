pragma solidity ^0.4.8;

import "./Project.sol";
import "./TokenRegistry.sol";
import "./ProjectRegistry.sol";
import "./Task.sol";
import "./library/PLCRVoting.sol";

library ProjectLibrary {

// =====================================================================
// EVENTS
// =====================================================================

  event tokenRefund(address staker, uint256 refund);
  event reputationRefund(address projectAddress, address staker, uint256 refund);

// =====================================================================
// FUNCTIONS
// =====================================================================

  // =====================================================================
  // UTILITY
  // =====================================================================

    function isStaker(address _projectAddress, address _staker) public view returns(bool) {
      Project project = Project(_projectAddress);
      return project.stakedTokenBalances(_staker) > 0 || project.stakedReputationBalances(_staker) > 0;
    }

    function isStaked(address _projectAddress) public view returns (bool) {
      Project project = Project(_projectAddress);
      return project.weiBal() >= project.weiCost() && project.totalReputationStaked() >= project.reputationCost();
    }

    function timesUp(address _projectAddress) public view returns (bool) {
      return (now > Project(_projectAddress).nextDeadline());
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
    }
  // =====================================================================
  // STATE CHANGE
  // =====================================================================
    function checkStaked(address _projectAddress, uint _stakedStatePeriod) public returns (bool) {
      Project project = Project(_projectAddress);
      require(project.state() == 1);
      if(isStaked(_projectAddress)) {
        uint256 nextDeadline = now + _stakedStatePeriod;
        project.setState(2, nextDeadline);
        return true;
      } else {
        if(timesUp(_projectAddress)) {
          project.setState(8, 0);
          project.clearProposerStake();
        }
        return false;
      }
      return false;
    }
    function checkActive(address _projectAddress, uint _activeStatePeriod, bytes32 _taskHash) public returns (bool) {
      Project project = Project(_projectAddress);
      require(project.state() == 2);
      if(timesUp(_projectAddress)) {
        uint256 nextDeadline;
        if(_taskHash != 0) {
          nextDeadline = now + _activeStatePeriod;
          project.setState(3, nextDeadline);
          return true;
        } else {
          project.setState(7, 0);
          return false;
        }
      }
      return false;
    }

    function checkValidate(address _projectAddress, address _tokenRegistryAddress, address _distributeTokenAddress, uint _validateStatePeriod) public {
      Project project = Project(_projectAddress);
      TokenRegistry tr = TokenRegistry(_tokenRegistryAddress);
      require(project.state() == 3);
      if (timesUp(_projectAddress)) {
        uint256 nextDeadline = now + _validateStatePeriod;
        project.setState(4, nextDeadline);
        for(uint i = 0; i < project.getTaskCount(); i++) {
          Task task = Task(project.tasks(i));
          if (task.complete() == false) {
            uint reward = task.weiReward();
            tr.revertWei(reward);
            project.returnWei(_distributeTokenAddress, reward);
            task.setTaskReward(0, 0, task.claimer());
          }
        }
      }
    }

    function checkVoting(address _projectAddress, address _tokenRegistryAddress, address _distributeTokenAddress, address _plcrVoting, uint _voteCommitPeriod, uint _voteRevealPeriod) public {
      Project project = Project(_projectAddress);
      TokenRegistry tr = TokenRegistry(_tokenRegistryAddress);
      PLCRVoting plcr = PLCRVoting(_plcrVoting);
      require(project.state() == 4);
      if (timesUp(_projectAddress)) {
        project.setState(5, 0);
        for(uint i = 0; i < project.getTaskCount(); i++) {
          Task task = Task(project.tasks(i));
          if (task.complete()) {
            if (task.opposingValidator()) {   // there is an opposing validator, poll required
              task.setPollId(plcr.startPoll(51, _voteCommitPeriod, _voteRevealPeriod)); // function handles storage of voting pollId
            } else {
              bool repClaim = task.markTaskClaimable(true);
              if (!repClaim) {
                uint reward = task.weiReward();
                tr.revertWei(reward);
                project.returnWei(_distributeTokenAddress, reward);
              }
            }
          }
        }
      }
    }

    function checkEnd(address _projectAddress, address _tokenRegistryAddress, address _distributeTokenAddress, address _plcrVoting) public {
      Project project = Project(_projectAddress);
      TokenRegistry tr = TokenRegistry(_tokenRegistryAddress);
      PLCRVoting plcr = PLCRVoting(_plcrVoting);
      require(project.state() == 5);
      for (uint i = 0; i < project.getTaskCount(); i++) {
        Task task = Task(project.tasks(i));
        if (task.complete() && task.opposingValidator()) {      // check tasks with polls only
          if (plcr.pollEnded(task.pollId())) {
            if (plcr.isPassed(task.pollId())) {
              task.markTaskClaimable(true);
            } else {
              task.markTaskClaimable(false);
              uint reward = task.weiReward();
              tr.revertWei(reward);
              project.returnWei(_distributeTokenAddress, reward);
            }
          }
        }
      }
      calculatePassAmount(_projectAddress);
      if (project.passAmount() >= project.passThreshold()) {
        project.setState(6, 0);
      } else {
        project.setState(7, 0);
      }
    }

  // =====================================================================
  // VALIDATION
  // =====================================================================

    function validate(address _projectAddress, address _staker, uint256 _index, uint256 _tokens, bool _validationState) public {
      Project project = Project(_projectAddress);
      require(project.state() == 4);
      Task task = Task(project.tasks(_index));
      require(_tokens > 0);
      if (_validationState == true) {
        task.setValidator(_staker, 1, _tokens);
      }
      else if (_validationState == false){
        task.setValidator(_staker, 0, _tokens);
      }
    }

    function calculatePassAmount(address _projectAddress) public returns (uint){
      Project project = Project(_projectAddress);
      uint totalWeighting;
      require(project.state() == 5);
      for (uint i = 0; i < project.getTaskCount(); i++) {
        Task task = Task(project.tasks(i));
        if (task.claimableByRep()) {
          totalWeighting += task.weighting();
        }
      }
      project.setPassAmount(totalWeighting);
      return totalWeighting;
    }

  // =====================================================================
  // TASK
  // =====================================================================

    function claimTaskReward(uint256 _index, address _projectAddress, address _claimer) public returns (uint256) {
      Project project = Project(_projectAddress);
      require(project.state() == 6);
      Task task = Task(project.tasks(_index));
      require(task.claimer() == _claimer && task.claimableByRep());
      uint256 weiReward = task.weiReward();
      uint256 reputationReward = task.reputationReward();
      task.setTaskReward(0, 0, _claimer);
      project.transferWeiReward(_claimer, weiReward);
      return reputationReward;
    }

  // =====================================================================
  // STAKER
  // =====================================================================

    function refundStaker(address _projectAddress, address _staker) public returns (uint256) {
      Project project = Project(_projectAddress);
      require(project.state() == 6 || project.state() == 8);
      if (project.isTR(msg.sender)) {
        return handleTokenStaker(_projectAddress, _staker);
      } else if (project.isRR(msg.sender)) {
        return handleReputationStaker(_projectAddress, _staker);
      }
    }

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

}
