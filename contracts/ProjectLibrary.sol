pragma solidity ^0.5.0;

import "./Project.sol";
import "./TokenRegistry.sol";
import "./ProjectRegistry.sol";
import "./ReputationRegistry.sol";
import "./Task.sol";
import "./library/SafeMath.sol";
import "./library/PLCRVoting.sol";
import "./library/Division.sol";

/**
@title Function Library for Distribute Network Projects
@author Team: Jessica Marshall, Ashoka Finley
@dev This library is imported into all the Registries to manage project interactions
*/
library ProjectLibrary {

  using SafeMath for uint256;

    // =====================================================================
    // EVENTS
    // =====================================================================

    event TokenRefund(address staker, uint256 refund);
    event ReputationRefund(address projectAddress, address staker, uint256 refund);
    event LogTaskVote(address taskAddress, address projectAddress, uint pollNonce);
    event LogTaskValidated(address taskAddress, address projectAddress, bool confirmation);
    event LogClaimTaskReward(address projectAddress, uint256 index, address claimer, uint256 weiReward, uint256 reputationReward);
    event LogProjectExpired(address projectAddress);

    // =====================================================================
    // UTILITY
    // =====================================================================

    /**
    @notice Returns true if `_staker` is either a token or reputation staker on project at `_projectAddress`
    @dev Used to define control access to relevant project functions
    @param _projectAddress Address of the project
    @param _staker Address of the staker
    @return A boolean representing staker status
    */
    function isStaker(address payable _projectAddress, address _staker) public view returns(bool) {
        Project project = Project(_projectAddress);
        return project.tokenBalances(_staker) > 0 || project.reputationBalances(_staker) > 0;
    }

    /**
    @notice Return true if the project at `_projectAddress` is fully staked with both tokens and reputation
    @dev Check project staked status
    @param _projectAddress Address of the project
    @return A boolean representing the project staked status
    */
    function isStaked(address payable _projectAddress) public view returns (bool) {
        Project project = Project(_projectAddress);
        return project.weiBal() >= project.weiCost() && project.reputationStaked() >= project.reputationCost();
    }

    /**
    @notice Return true if the current time is greater than the next deadline of the project at `_projectAddress`
    @dev Uses block.timestamp as a time variable. Note that this is subject to variability
    @param _projectAddress Address of the project
    @return A boolean representing whether the project has passed its next deadline.
    */
    function timesUp(address payable _projectAddress) public view returns (bool) {
        return (block.timestamp > Project(_projectAddress).nextDeadline());
    }

    /**
    @notice Calculates the relative staking weight of `_address` on project at `_projectAddress.
    Weighting is calculated by the proportional amount of both reputation and tokens that have been
    staked on the project.
    @dev Returns an average of the token staking and reputation staking to understand the relative influence of a staker
    @param _projectAddress Address of the project
    @param _address Address of the staker
    @return The relative weight of a staker as a whole integer
    */
    function calculateWeightOfAddress(
        address payable _projectAddress,
        address _address
    ) public view returns (uint256) {
        uint256 reputationWeight;
        uint256 tokenWeight;
        Project project = Project(_projectAddress);
        if(isStaker(_projectAddress, _address)){
          project.reputationStaked() != 0
              ? reputationWeight = Division.percent(
                  project.reputationBalances(_address),
                  project.reputationStaked(), 15)
              : reputationWeight = 0;
          project.tokensStaked() != 0
              ? tokenWeight = Division.percent(project.tokenBalances(_address), project.tokensStaked(), 15)
              : tokenWeight = 0;
          return (reputationWeight + tokenWeight) / 2;
        }
        return 0;
    }

    // =====================================================================
    // STATE CHANGE
    // =====================================================================

    /**
    @notice Checks if project at `_projectAddress` is fully staked with both reputation and tokens.
    If the project is staked the project moves to state 2: Staked, and the next deadline is set.
    If the current time is passed the staking period, the project expires and is moved to state 8: Expired.
    @dev The nextDeadline value for the staked state is set in the project state variables.
    @param _projectAddress Address of the project.
    @return Returns a bool denoting the project is in the staked state.
    */
    function checkStaked(address payable _projectAddress) public returns (bool) {
        Project project = Project(_projectAddress);
        require(project.state() == 1);

        if(isStaked(_projectAddress)) {
            uint256 nextDeadline = block.timestamp + project.stakedStatePeriod();
            project.setState(2, nextDeadline);
            return true;
        } else if(timesUp(_projectAddress)) {
            project.setState(8, 0);
            project.clearProposerStake();
            emit LogProjectExpired(_projectAddress);
        }
        return false;
    }

    /**
    @notice Checks if the project at `_projectAddress` has passed its next deadline, and if a
    valid task hash exists, meaning that the accounts who have staked on the project have successfully
    curated a list of tasks relating to project work. If a task hash exists the project is moved
    to state 3: Active and the next deadline is set. If no task hash exists once the deadline has passed,
    the project is moved to state 7: Failed.
    @dev The nextDeadline value for the active state is set in the project state variables.
    @param _projectAddress Address of the project
    @param _taskHash Address of the top weighted task hash
    @return Returns a bool denoting the project is in the active state.
    */
    function checkActive(address payable _projectAddress, bytes32 _taskHash, uint256 _taskListWeighting, address payable _tokenRegistryAddress, address _reputationRegistryAddress, address payable _hyphaTokenAddress) public returns (bool) {
        Project project = Project(_projectAddress);
        require(project.state() == 2);

        if(timesUp(_projectAddress)) {
            uint256 nextDeadline;
            if(_taskHash != 0 && _taskListWeighting > 50) {
                nextDeadline = block.timestamp + project.activeStatePeriod();
                project.setState(3, nextDeadline);
                return true;
            } else {
                project.setState(7, 0);
                TokenRegistry(_tokenRegistryAddress).burnTokens(project.tokensStaked());
                ReputationRegistry(_reputationRegistryAddress).burnReputation(project.reputationStaked());
                TokenRegistry(_tokenRegistryAddress).revertWei(project.weiBal());
                project.returnWei(_hyphaTokenAddress, project.weiBal());
                project.clearStake();
            }
        }
        return false;
    }

    /**
    @notice Checks if the project at `_projectAddress` has passed its next deadline, and if it has
    moves the project to state 4: Validation. It interates through the project task list and checks if the
    project tasks have been marked complete. If a task hasn't been marked complete, its wei reward,
    is returned to the network balance, the task reward is zeroed.
    @dev This is an interative function and gas costs will vary depending on the number of tasks.
    @param _projectAddress Address of the project
    @param _tokenRegistryAddress Address of the systems Token Registry contract
    @param _hyphaTokenAddress Address of the systems HyphaToken contract
    @return Returns a bool denoting if the project is in the validation state.
    */
    function checkValidate(
        address payable _projectAddress,
        address payable _tokenRegistryAddress,
        address payable _hyphaTokenAddress
    ) public returns (bool) {
        Project project = Project(_projectAddress);
        require(project.state() == 3);

        if (timesUp(_projectAddress)) {
            uint256 nextDeadline = block.timestamp + project.validateStatePeriod();
            project.setState(4, nextDeadline);
            TokenRegistry tr = TokenRegistry(_tokenRegistryAddress);
            for(uint i = 0; i < project.getTaskCount(); i++) {
                Task task = Task(project.tasks(i));
                if (!task.complete()) {
                    // workers did not complete task, reward & validator chunk must be sent back
                    uint reward = task.weiReward();
                    reward = task.weiReward().mul(21).div(20);
                    tr.revertWei(reward);
                    project.returnWei(_hyphaTokenAddress, reward);
                }
            }
            return true;
        }
        return false;
    }

    /**
    @notice Checks if the project at `_projectAddress` has passed its next deadline, and if it has,
    moves the project to state 5: Voting. It iterates through the project task list and checks if
    there are opposing validators for each task. If there are then its starts a plcr for each
    disputed task, otherwise it marks the task claimable by the validators, as well as by the reputation holder
    who claimed the task if the validators approved the task.
    @dev This is an interative function and gas costs will vary depending on the number of tasks.
    @param _projectAddress Address of the project
    @param _tokenRegistryAddress Address of the systems token registry contract
    @param _hyphaTokenAddress Address of the systems token contract
    @param _plcrVoting Address of the systems PLCR Voting contract
    @return Returns a bool denoting if the project is in the voting state.
    */
    function checkVoting(
        address payable _projectAddress,
        address payable _tokenRegistryAddress,
        address payable _hyphaTokenAddress,
        address _plcrVoting
    ) public returns (bool) {
        Project project = Project(_projectAddress);
        require(project.state() == 4);
        if (timesUp(_projectAddress)) {
            uint256 nextDeadline = block.timestamp + project.voteCommitPeriod() + project.voteRevealPeriod();
            project.setState(5, nextDeadline);
            TokenRegistry tr = TokenRegistry(_tokenRegistryAddress);
            PLCRVoting plcr = PLCRVoting(_plcrVoting);
            for(uint i = 0; i < project.getTaskCount(); i++) {
                Task task = Task(project.tasks(i));
                uint reward;
                if (task.complete()) {
                    // require that one of the indexes is not zero, meaning that a validator exists
                    if (task.affirmativeIndex() != 0 && task.negativeIndex() != 0) { // there is an opposing validator, poll required
                        uint pollNonce = plcr.startPoll(51, project.voteCommitPeriod(), project.voteRevealPeriod());
                        task.setPollId(pollNonce); // function handles storage of voting pollId
                        emit LogTaskVote(address(task), _projectAddress, pollNonce);
                    } else if (task.negativeIndex() == 0 && task.affirmativeIndex() != 0) {
                        // this means that there are no negative validators, the task passes, and reward is claimable.
                        task.markTaskClaimable(true);
                        emit LogTaskValidated(address(task), _projectAddress, true);
                    } else if (task.negativeIndex() != 0 && task.affirmativeIndex() == 0) {
                      // this means that there are no affirmative validators, the task fails, and reward is not claimable.
                        task.markTaskClaimable(false);
                        reward = task.weiReward();
                        tr.revertWei(reward);
                        project.returnWei(_hyphaTokenAddress, reward);
                        emit LogTaskValidated(address(task), _projectAddress, false);
                    } else {
                      // there are no validators, reward & validator chunk must be sent back
                      task.markTaskClaimable(false);
                      reward = task.weiReward().mul(21).div(20);
                      tr.revertWei(reward);
                      project.returnWei(_hyphaTokenAddress, reward);
                      emit LogTaskValidated(address(task), _projectAddress, false);
                    }
                }
            }
            return true;
        }
        return false;
    }

    /**
    @notice Checks if the project at `_projectAddress` has passed its next deadline. It iterates through
    the project task list, and checks the projects which have polls to see the poll state. If the poll has
    passed the task is marked claimable by both the approve validators and the task claimer. Otherwise
    the task is marked claimable for the deny validators, and the task reward is returned to the networks
    wei balance. The amount of tasks that have passed is then calculated. If the total weighting of those
    tasks passes the project passThreshold then the project is moved to state 6: Complete, otherwise it
    moves to state 7: Expired.
    @dev The project pass passThreshold is set in the project state variables
    @param _projectAddress Address of the project
    @param _tokenRegistryAddress Address of the systems token registry contract
    @param _hyphaTokenAddress Address of the systems token contract
    @param _plcrVoting Address of the systems PLCR Voting contract
    @return Returns a bool denoting if the project is its final state.
    */
    function checkEnd(
        address payable _projectAddress,
        address payable _tokenRegistryAddress,
        address payable _hyphaTokenAddress,
        address _plcrVoting,
        address _reputationRegistryAddress
    ) public returns (uint) {
        Project project = Project(_projectAddress);
        require(project.state() == 5);

        if (timesUp(_projectAddress)) {
            TokenRegistry tr = TokenRegistry(_tokenRegistryAddress);
            PLCRVoting plcr = PLCRVoting(_plcrVoting);
            for (uint i = 0; i < project.getTaskCount(); i++) {
                Task task = Task(project.tasks(i));
                if (task.pollId() != 0) {      // check tasks with polls only
                    if (plcr.pollEnded(task.pollId())) {
                        if (plcr.isPassed(task.pollId())) {
                            task.markTaskClaimable(true);
                        } else {
                            task.markTaskClaimable(false);
                            uint reward = task.weiReward();
                            tr.revertWei(reward);
                            project.returnWei(_hyphaTokenAddress, reward);
                        }
                    }
                }
            }
            calculatePassAmount(_projectAddress);
            if (project.passAmount() >= project.passThreshold()) {
              project.setState(6, 0);
              return 1;
            } else {
              uint originatorReward = project.originatorReward();
              tr.revertWei(originatorReward);
              project.returnWei(_hyphaTokenAddress, originatorReward);
              project.setState(7, 0);
              TokenRegistry(_tokenRegistryAddress).burnTokens(project.tokensStaked());
              ReputationRegistry(_reputationRegistryAddress).burnReputation(project.reputationStaked());
              project.clearStake();
              return 2;
            }
        }
        return 0;
    }

    // =====================================================================
    // VALIDATION
    // =====================================================================

    /**
    @notice Stake tokens on whether the task at index `i` has been successful or not. Validator
    `_validator` can validate either approve or deny, with `tokens` tokens.
    @param _projectAddress Address of the project
    @param _validator Address of the validator
    @param _taskIndex Index of the task in the projects task array
    @param _validationState Bool representing validators choice.s
    */
    function validate(
        address payable _projectAddress,
        address _validator,
        uint256 _taskIndex,
        bool _validationState
    ) public {
        Project project = Project(_projectAddress);
        require(project.state() == 4);
        Task task = Task(project.tasks(_taskIndex));
        require(task.complete() == true);
        _validationState
            ? task.setValidator(_validator, 1)
            : task.setValidator(_validator, 0);
    }

    /**
    @notice Calculates the amount of tasks that have passed for project at `_projectAddress`
    @param _projectAddress Address of the project
    @return Sum of the weightings of the task which have passed.
    */
    function calculatePassAmount(address payable _projectAddress) public returns (uint){
        Project project = Project(_projectAddress);
        require(project.state() == 5);

        uint totalWeighting;
        for (uint i = 0; i < project.getTaskCount(); i++) {
            Task task = Task(project.tasks(i));
            if (task.claimableByRep()) { totalWeighting += task.weighting(); }
        }
        project.setPassAmount(totalWeighting);
        return totalWeighting;
    }

    // =====================================================================
    // TASK
    // =====================================================================

    /**
    @notice Claim the task reward from task at index `_index` from the task array of project at
    `_projectAddress`. If task is claimable by the reputation holder, Clears the task reward, and
    transfers the wei reward to the task claimer. Returns the reputation reward for the claimer.
    @param _projectAddress Address of the project
    @param _index Index of the task in project task array
    @param _claimer Address of account claiming task reward.
    @return The amount of reputation the claimer staked on the task
    */
    function claimTaskReward(
        address payable _projectAddress,
        uint256 _index,
        address payable _claimer
    ) public returns (uint256) {
        Project project = Project(_projectAddress);
        Task task = Task(project.tasks(_index));
        require(task.complete() && task.claimer() == _claimer && task.claimableByRep());
        uint256 weiReward = task.weiReward();
        uint256 reputationReward = task.reputationReward();
        task.setTaskReward(0, 0, _claimer);
        project.transferWeiReward(_claimer, weiReward);
        emit LogClaimTaskReward(_projectAddress, _index, _claimer, weiReward, reputationReward);
        return reputationReward;
    }

    // =====================================================================
    // STAKER
    // =====================================================================

    /**
    @notice Refund both either reputation or token staker `_staker` for project at address `_projectAddress`
    @dev Calls internal functions to handle either staker case.
    @param _projectAddress Address of the project
    @param _staker Address of the staker
    @return The amount to be refunded to the staker.
    */
    function refundStaker(address payable _projectAddress, address _staker, address _sender) public returns (uint256) {
        Project project = Project(_projectAddress);
        require(project.state() == 6 || project.state() == 8);
        if (project.isTR(_sender)) {
            return handleTokenStaker(project, _staker);
        } else if (project.isRR(_sender)) {
            return handleReputationStaker(project, _staker);
        } else {
            return 0;
        }
    }

    /**
    @notice Handle token staker at _address on project `_project`, stake reward is multiplied by the pass amount.
    @dev Only used internally.
    @param _project Project instance
    @param _staker Token staker address
    @return The token refund to be returned to the token staker.
    */
    function handleTokenStaker(Project _project, address _staker) internal returns (uint256) {
        uint256 refund;
        // account for proportion of successful tasks
        if(_project.tokensStaked() != 0) {
            _project.state() == 6
                ? refund = _project.tokenBalances(_staker).mul( _project.passAmount()).div(100)
                : refund = _project.tokenBalances(_staker);
        }
        emit TokenRefund(_staker, refund);
        return refund;
    }

    /**
    @notice Handle reputation staker at _address on project `_project`, stake reward is multiplied by the pass amount.
    @dev Only used internally.
    @param _project Project instance
    @param _staker Reputation staker address
    @return The reputation refund to be returned to the reputation staker.
    */
    function handleReputationStaker(Project _project, address _staker) internal returns (uint256) {
        uint256 refund;
        if(_project.reputationStaked() != 0) {
          _project.state() == 6
              ? refund = _project.reputationBalances(_staker).mul( _project.passAmount()).div(100)
              : refund = _project.reputationBalances(_staker);
        }
        emit ReputationRefund(address(_project), _staker, refund);
        return refund;
    }
}
