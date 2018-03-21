pragma solidity ^0.4.19;

import "./Project.sol";
import "./TokenRegistry.sol";
import "./ProjectRegistry.sol";
import "./Task.sol";
import "./library/PLCRVoting.sol";
import "./library/Division.sol";

/**
@title Function Library for Distribute Network Projects
@author Team: Jessica Marshall, Ashoka Finley
@dev This library is imported into all the Registries to manage project interactions
*/
library ProjectLibrary {event __CoverageProjectLibrary(string fileName, uint256 lineNumber);
event __FunctionCoverageProjectLibrary(string fileName, uint256 fnId);
event __StatementCoverageProjectLibrary(string fileName, uint256 statementId);
event __BranchCoverageProjectLibrary(string fileName, uint256 branchId, uint256 locationIdx);
event __AssertPreCoverageProjectLibrary(string fileName, uint256 branchId);
event __AssertPostCoverageProjectLibrary(string fileName, uint256 branchId);


    // =====================================================================
    // EVENTS
    // =====================================================================

    event tokenRefund(address staker, uint256 refund);
    event reputationRefund(address projectAddress, address staker, uint256 refund);

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
    function isStaker(address _projectAddress, address _staker) public  returns(bool) {__FunctionCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',1);

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',36);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',1);
Project project = Project(_projectAddress);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',37);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',2);
return project.tokenBalances(_staker) > 0 || project.reputationBalances(_staker) > 0;
    }

    /**
    @notice Return true if the project at `_projectAddress` is fully staked with both tokens and reputation
    @dev Check project staked status
    @param _projectAddress Address of the project
    @return A boolean representing the project staked status
    */
    function isStaked(address _projectAddress) public  returns (bool) {__FunctionCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',2);

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',47);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',3);
Project project = Project(_projectAddress);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',48);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',4);
return project.weiBal() >= project.weiCost() && project.reputationStaked() >= project.reputationCost();
    }

    /**
    @notice Return true if the current time is greater than the next deadline of the project at `_projectAddress`
    @dev Uses block.timestamp as a time variable. Note that this is subject to variability
    @param _projectAddress Address of the project
    @return A boolean representing wether the project has passed its next deadline.
    */
    function timesUp(address _projectAddress) public  returns (bool) {__FunctionCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',3);

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',58);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',5);
return (now > Project(_projectAddress).nextDeadline());
    }

    /**
    @notice Calculates the relative staking weight of `_address` on project at `_projectAddress.
    Weighting is caluclated by the proportional amount of both reputation and tokens that have been
    staked on the project.
    @dev Returns an average of the token staking and reputation staking.
    @param _projectAddress Address of the project
    @param _address Address of the staker
    @return The relaive weight of a staker as a whole integer
    */
    function calculateWeightOfAddress(
        address _projectAddress,
        address _address
    ) public  returns (uint256) {__FunctionCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',4);

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',74);
        uint256 reputationWeight;
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',75);
        uint256 tokenWeight;
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',76);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',6);
Project project = Project(_projectAddress);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',77);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',7);
project.reputationStaked() != 0
            ? (__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',1,0),reputationWeight = Division.percent(
                project.reputationBalances(_address),
                project.reputationStaked(), 2))
            : (__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',1,1),reputationWeight = 0);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',82);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',8);
project.tokensStaked() != 0
            ? (__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',2,0),tokenWeight = Division.percent(project.tokenBalances(_address), project.tokensStaked(), 2))
            : (__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',2,1),tokenWeight = 0);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',85);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',9);
return (reputationWeight + tokenWeight) / 2;
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
    function checkStaked(address _projectAddress) public returns (bool) {__FunctionCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',5);

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',101);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',10);
Project project = Project(_projectAddress);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',102);
        __AssertPreCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',3);
 __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',11);
require(project.state() == 1);__AssertPostCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',3);


__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',104);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',12);
if(isStaked(_projectAddress)) {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',4,0);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',105);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',13);
uint256 nextDeadline = now + project.stakedStatePeriod();
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',106);
            project.setState(2, nextDeadline);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',107);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',14);
return true;
        } else { __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',15);
__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',4,1);if(timesUp(_projectAddress)) {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',5,0);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',109);
            project.setState(8, 0);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',110);
            project.clearProposerStake();
        }else { __BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',5,1);}
}
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',112);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',16);
return false;
    }

    /**
    @notice Checks if the project at `_projectAddress` has passed its next deadline, and if a
    valid task hash, meaning that the accounts who have staked on the project have succefully
    curated a list of tasks relating to project work. If a task hash exists the project is moved
    to state 3: Active and the next deadline is set. If no task hash exists the project is moved
    to state 7: Failed.
    @dev The nextDeadline value for the active state is set in the project state variables.
    @param _projectAddress Address of the project
    @param _taskHash Address of the top weighted task hash
    @return Returns a bool denoting the project is in the active state.
    */
    function checkActive(address _projectAddress, bytes32 _taskHash) public returns (bool) {__FunctionCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',6);

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',127);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',17);
Project project = Project(_projectAddress);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',128);
        __AssertPreCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',6);
 __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',18);
require(project.state() == 2);__AssertPostCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',6);


__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',130);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',19);
if(timesUp(_projectAddress)) {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',7,0);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',131);
            uint256 nextDeadline;
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',132);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',20);
if(_taskHash != 0) {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',8,0);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',133);
                 __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',21);
nextDeadline = now + project.activeStatePeriod();
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',134);
                project.setState(3, nextDeadline);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',135);
                 __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',22);
return true;
            } else {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',8,1);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',137);
                project.setState(7, 0);
            }
        }else { __BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',7,1);}

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',140);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',23);
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
    @param _distributeTokenAddress Address of the systems DistributeToken contract
    @return Returns a bool denoting if the project is in the validation state.
    */
    function checkValidate(
        address _projectAddress,
        address _tokenRegistryAddress,
        address _distributeTokenAddress
    ) public returns (bool) {__FunctionCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',7);

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',159);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',24);
Project project = Project(_projectAddress);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',160);
        __AssertPreCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',9);
 __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',25);
require(project.state() == 3);__AssertPostCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',9);


__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',162);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',26);
if (timesUp(_projectAddress)) {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',10,0);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',163);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',27);
uint256 nextDeadline = now + project.validateStatePeriod();
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',164);
            project.setState(4, nextDeadline);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',165);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',28);
TokenRegistry tr = TokenRegistry(_tokenRegistryAddress);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',166);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',29);
for(uint i = 0; i < project.getTaskCount(); i++) {
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',167);
                 __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',30);
Task task = Task(project.tasks(i));
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',168);
                 __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',31);
if (task.complete() == false) {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',11,0);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',169);
                     __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',32);
uint reward = task.weiReward();
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',170);
                    tr.revertWei(reward);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',171);
                    project.returnWei(_distributeTokenAddress, reward);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',172);
                    task.setTaskReward(0, 0, task.claimer());
                }else { __BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',11,1);}

            }
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',175);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',33);
return true;
        }else { __BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',10,1);}

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',177);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',34);
return false;
    }

    /**
    @notice Checks if the project at `_projectAddress` has passed its next deadline, and if it has
    moves the project to state 5: Voting. It iterates through the project task list and checks if
    there are opposing validators for each task. If there are then its starts a plcr for each
    disputed task, otherwise it marks the task claimable by the validators, and by the reputation holder
    who claimed the task if the validators approved the task.
    @dev This is an interative function and gas costs will vary depending on the number of tasks.
    @param _projectAddress Address of the project
    @param _tokenRegistryAddress Address of the systems token registry contract
    @param _distributeTokenAddress Address of the systems token contract
    @param _plcrVoting Address of the systems PLCR Voting contract
    @return Returns a bool denoting if the project is in the voting state.
    */
    function checkVoting(
        address _projectAddress,
        address _tokenRegistryAddress,
        address _distributeTokenAddress,
        address _plcrVoting
    ) public returns (bool) {__FunctionCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',8);

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',199);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',35);
Project project = Project(_projectAddress);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',200);
        __AssertPreCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',12);
 __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',36);
require(project.state() == 4);__AssertPostCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',12);


__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',202);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',37);
if (timesUp(_projectAddress)) {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',13,0);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',203);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',38);
uint256 nextDeadline = now + project.voteCommitPeriod() + project.voteRevealPeriod();
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',204);
            project.setState(5, nextDeadline);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',205);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',39);
TokenRegistry tr = TokenRegistry(_tokenRegistryAddress);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',206);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',40);
PLCRVoting plcr = PLCRVoting(_plcrVoting);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',207);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',41);
for(uint i = 0; i < project.getTaskCount(); i++) {
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',208);
                 __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',42);
Task task = Task(project.tasks(i));
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',209);
                 __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',43);
if (task.complete()) {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',14,0);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',210);
                     __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',44);
if (task.opposingValidator()) {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',15,0);   // there is an opposing validator, poll required
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',211);
                        task.setPollId(plcr.startPoll(51, project.voteCommitPeriod(), project.voteRevealPeriod())); // function handles storage of voting pollId
                    } else {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',15,1);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',213);
                         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',45);
bool repClaim = task.markTaskClaimable(true);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',214);
                         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',46);
if (!repClaim) {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',16,0);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',215);
                             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',47);
uint reward = task.weiReward();
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',216);
                            tr.revertWei(reward);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',217);
                            project.returnWei(_distributeTokenAddress, reward);
                        }else { __BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',16,1);}

                    }
                }else { __BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',14,1);}

            }
        }else { __BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',13,1);}

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',223);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',48);
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
    @param _distributeTokenAddress Address of the systems token contract
    @param _plcrVoting Address of the systems PLCR Voting contract
    @return Returns a bool denoting if the project is its final state.
    */
    function checkEnd(
        address _projectAddress,
        address _tokenRegistryAddress,
        address _distributeTokenAddress,
        address _plcrVoting
    ) public returns (bool) {__FunctionCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',9);

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',247);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',49);
Project project = Project(_projectAddress);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',248);
        __AssertPreCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',17);
 __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',50);
require(project.state() == 5);__AssertPostCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',17);


__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',250);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',51);
if (timesUp(_projectAddress)) {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',18,0);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',251);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',52);
TokenRegistry tr = TokenRegistry(_tokenRegistryAddress);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',252);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',53);
PLCRVoting plcr = PLCRVoting(_plcrVoting);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',253);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',54);
for (uint i = 0; i < project.getTaskCount(); i++) {
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',254);
                 __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',55);
Task task = Task(project.tasks(i));
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',255);
                 __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',56);
if (task.complete() && task.opposingValidator()) {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',19,0);      // check tasks with polls only
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',256);
                     __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',57);
if (plcr.pollEnded(task.pollId())) {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',20,0);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',257);
                         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',58);
if (plcr.isPassed(task.pollId())) {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',21,0);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',258);
                            task.markTaskClaimable(true);
                        } else {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',21,1);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',260);
                            task.markTaskClaimable(false);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',261);
                             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',59);
uint reward = task.weiReward();
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',262);
                            tr.revertWei(reward);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',263);
                            project.returnWei(_distributeTokenAddress, reward);
                        }
                    }else { __BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',20,1);}

                }else { __BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',19,1);}

            }
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',268);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',60);
calculatePassAmount(_projectAddress);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',269);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',61);
project.passAmount() >= project.passThreshold()
                ? (__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',22,0),project.setState(6, 0))
                : (__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',22,1),project.setState(7, 0));
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',272);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',62);
return true;
        }else { __BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',18,1);}

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',274);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',63);
return false;
    }

    // =====================================================================
    // VALIDATION
    // =====================================================================

    /**
    @notice Stake tokens on whether the task at index `i` has been successful or not. Validator
    `_validator` can validate either approve or deny, with `tokens` tokens.
    @param _projectAddress Address of the project
    @param _validator Address of the validator
    @param _index Index of the task in the projects task array
    @param _tokens Amount of tokens validator is staking
    @param _validationState Bool representing validators choice.s
    */
    function validate(
        address _projectAddress,
        address _validator,
        uint256 _index,
        uint256 _tokens,
        bool _validationState
    ) public {__FunctionCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',10);

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',297);
        __AssertPreCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',23);
 __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',64);
require(_tokens > 0);__AssertPostCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',23);

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',298);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',65);
Project project = Project(_projectAddress);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',299);
        __AssertPreCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',24);
 __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',66);
require(project.state() == 4);__AssertPostCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',24);


__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',301);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',67);
Task task = Task(project.tasks(_index));
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',302);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',68);
_validationState
            ? (__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',25,0),task.setValidator(_validator, 1, _tokens))
            : (__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',25,1),task.setValidator(_validator, 0, _tokens));
    }

    /**
    @notice Calculates the amount of tasks that have passed for project at `_projectAddress`
    @param _projectAddress Address of the project
    @return Sum of the weightings of the task which have passed.
    */
    function calculatePassAmount(address _projectAddress) public returns (uint){__FunctionCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',11);

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',313);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',69);
Project project = Project(_projectAddress);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',314);
        __AssertPreCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',26);
 __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',70);
require(project.state() == 5);__AssertPostCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',26);


__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',316);
        uint totalWeighting;
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',317);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',71);
for (uint i = 0; i < project.getTaskCount(); i++) {
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',318);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',72);
Task task = Task(project.tasks(i));
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',319);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',73);
if (task.claimableByRep()) {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',27,0);  __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',74);
totalWeighting += task.weighting(); }else { __BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',27,1);}

        }
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',321);
        project.setPassAmount(totalWeighting);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',322);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',75);
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
    @return The amount of reputation the claimer staked on the task
    */
    function claimTaskReward(
        address _projectAddress,
        uint256 _index,
        address _claimer
    ) public returns (uint256) {__FunctionCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',12);

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',342);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',76);
Project project = Project(_projectAddress);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',343);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',77);
Task task = Task(project.tasks(_index));
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',344);
        __AssertPreCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',28);
 __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',78);
require(task.claimer() == _claimer && task.claimableByRep());__AssertPostCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',28);


__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',346);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',79);
uint256 weiReward = task.weiReward();
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',347);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',80);
uint256 reputationReward = task.reputationReward();
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',348);
        task.setTaskReward(0, 0, _claimer);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',349);
        project.transferWeiReward(_claimer, weiReward);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',350);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',81);
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
    function refundStaker(address _projectAddress, address _staker) public returns (uint256) {__FunctionCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',13);

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',365);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',82);
Project project = Project(_projectAddress);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',366);
        __AssertPreCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',29);
 __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',83);
require(project.state() == 6 || project.state() == 8);__AssertPostCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',29);


__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',368);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',84);
if (project.isTR(msg.sender)) {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',30,0);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',369);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',85);
return handleTokenStaker(project, _staker);
        } else { __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',86);
__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',30,1);if (project.isRR(msg.sender)) {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',31,0);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',371);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',87);
return handleReputationStaker(project, _staker);
        } else {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',31,1);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',373);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',88);
return 0;
        }}
    }

    /**
    @notice Handle token staker at _address on project `_project`, stake reward is multiplied by the pass amount.
    @dev Only used internally.
    @param _project Project instance
    @param _staker Token staker address
    @return The token refund to be returned to the token staker.
    */
    function handleTokenStaker(Project _project, address _staker) internal returns (uint256) {__FunctionCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',14);

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',385);
        uint256 refund;
        // account for proportion of successful tasks
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',387);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',89);
if(_project.tokensStaked() != 0) {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',32,0);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',388);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',90);
refund = _project.tokenBalances(_staker) * _project.passAmount() / 100;
        }else { __BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',32,1);}

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',390);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',91);
tokenRefund(_staker, refund);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',391);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',92);
return refund;
    }

    /**
    @notice Handle reputation staker at _address on project `_project`, stake reward is multiplied by the pass amount.
    @dev Only used internally.
    @param _project Project instance
    @param _staker Reputation staker address
    @return The reputation refund to be returned to the reputation staker.
    */
    function handleReputationStaker(Project _project, address _staker) internal returns (uint256) {__FunctionCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',15);

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',402);
        uint256 refund;
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',403);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',93);
if(_project.reputationStaked() != 0) {__BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',33,0);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',404);
             __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',94);
refund = _project.reputationBalances(_staker) * _project.passAmount() / 100;
        }else { __BranchCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',33,1);}

__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',406);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',95);
reputationRefund(address(_project), _staker, refund);
__CoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',407);
         __StatementCoverageProjectLibrary('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectLibrary.sol',96);
return refund;
    }
}
