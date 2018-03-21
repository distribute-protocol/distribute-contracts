pragma solidity ^0.4.19;

import "./Project.sol";

/**
@title Task Contract for Distribute Network
@author Team: Jessica Marshall, Ashoka Finley
@notice  This contract manages a single task for a project
@dev This contract is initialized by the Project Registry contract with the address of a valid
TokenRegistry, and ReputationRegistry.
*/
contract Task {event __CoverageTask(string fileName, uint256 lineNumber);
event __FunctionCoverageTask(string fileName, uint256 fnId);
event __StatementCoverageTask(string fileName, uint256 statementId);
event __BranchCoverageTask(string fileName, uint256 branchId, uint256 locationIdx);
event __AssertPreCoverageTask(string fileName, uint256 branchId);
event __AssertPostCoverageTask(string fileName, uint256 branchId);


    // =====================================================================
    // STATE VARIABLES
    // =====================================================================

    address projectRegistryAddress;
    address tokenRegistryAddress;
    address reputationRegistryAddress;

    bytes32 public taskHash;
    bool public claimable;
    bool public claimableByRep;
    uint256 public pollId;
    uint256 public weighting;

    uint256 public weiReward;
    uint256 public reputationReward;
    uint256 public claimTime;
    bool public complete;
    address public claimer;

    struct Validator {
        uint256 status;
        uint256 stake;
    }

    bool public opposingValidator = false;
    uint256 public validateReward;

    mapping (address => Validator) public validators;
    uint256 public totalValidateAffirmative;
    uint256 public totalValidateNegative;

    // =====================================================================
    // MODIFIERS
    // =====================================================================

    modifier onlyPR() {__FunctionCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',1);

__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',51);
        __AssertPreCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',1);
 __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',1);
require(msg.sender == projectRegistryAddress);__AssertPostCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',1);

__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',52);
        _;
    }

    modifier onlyTR() {__FunctionCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',2);

__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',56);
        __AssertPreCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',2);
 __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',2);
require(msg.sender == tokenRegistryAddress);__AssertPostCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',2);

__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',57);
        _;
    }

    modifier onlyPRorRR() {__FunctionCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',3);

__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',61);
        __AssertPreCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',3);
 __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',3);
require(msg.sender == projectRegistryAddress || msg.sender == reputationRegistryAddress);__AssertPostCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',3);

__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',62);
        _;
    }

    // =====================================================================
    // CONSTRUCTOR
    // =====================================================================

    /**
    @notice Initialize a task related to a project with a hash of the description and weighting
    `_hash` and the addresses of the TokenRegistry `_tokenRegistry` and ReputationRegistry
    `_reputationRegistry`
    @dev Created iteratively by the Project Registry contract
    @param _hash Hash of the tasks Description and Weighting
    @param _tokenRegistry Address of the TokenRegistry
    @param _reputationRegistry Address of the ReputationRegistry
    */
    function Task(bytes32 _hash, address _tokenRegistry, address _reputationRegistry) public {__FunctionCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',4);

__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',79);
         __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',4);
projectRegistryAddress = msg.sender;
__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',80);
         __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',5);
tokenRegistryAddress = _tokenRegistry;
__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',81);
         __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',6);
reputationRegistryAddress = _reputationRegistry;
__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',82);
         __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',7);
taskHash = _hash;
    }

    // =====================================================================
    // SETTERS
    // =====================================================================

    /**
    @notice Set the weighting of the task to `_weighting` which represent the proportion of the project
    cost it represents
    @dev Only callable by the Project Registry
    @param _weighting Weighting of the task
    */
    function setWeighting(uint256 _weighting) public onlyPR {__FunctionCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',5);

__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',96);
         __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',8);
weighting = _weighting;
    }

    /**
    @notice Set the ether reward of the task to `weiVal` and the required reputation to claim to
    `_reputationVal`, with the address of the claimer `_claimer`
    @dev Only callable by the ReputationRegistry or ProjectRegistry
    @param _weiVal Ether Reward of the Task
    @param _reputationVal Reputation threshold for claiming
    @param _claimer Address of account who has claimed the task
    */
    function setTaskReward(uint256 _weiVal, uint256 _reputationVal, address _claimer) public onlyPRorRR {__FunctionCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',6);

__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',108);
         __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',9);
weiReward = _weiVal;
__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',109);
         __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',10);
reputationReward = _reputationVal;
__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',110);
         __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',11);
claimTime = now;
__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',111);
         __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',12);
complete = false;
__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',112);
         __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',13);
claimer = _claimer;
    }

    /**
    @notice Marks task as completed
    @dev Only callable by the Project Registry
    */
    function markTaskComplete() public onlyPR {__FunctionCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',7);

__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',120);
         __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',14);
complete = true;
    }

    /**
    @notice Set validator of the current task, if the validator is of a different type than the other
    validators i.e. No when there are only Yes validators, then sets opposingValidator to true.
    @dev Only callable by the Token Registry
    @param _validator Address of validator
    @param _validationVal Flag for positive or negative validation
    @param _tokens Amount of tokens to stake on Validation.
    */
    function setValidator(address _validator, uint256 _validationVal, uint256 _tokens) public onlyTR {__FunctionCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',8);

__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',132);
         __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',15);
validators[_validator] = Validator(_validationVal, _tokens);
__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',133);
         __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',16);
_validationVal == 1
            ? (__BranchCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',4,0),totalValidateAffirmative += _tokens)
            : (__BranchCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',4,1),totalValidateNegative += _tokens);
__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',136);
         __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',17);
if (!opposingValidator && (totalValidateAffirmative != 0 && totalValidateNegative != 0)) {__BranchCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',5,0);
__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',137);
             __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',18);
opposingValidator = true;
        }else { __BranchCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',5,1);}

    }

    /**
    @notice Sets the PLCR poll id of the current task
    @dev Only callable by Project Registery
    @param _pollId Poll ID of PLCRVoting poll.
    */
    function setPollId(uint256 _pollId) public onlyPR {__FunctionCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',9);

__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',147);
        __AssertPreCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',6);
 __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',19);
require(pollId == 0);__AssertPostCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',6);

__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',148);
         __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',20);
pollId = _pollId;
    }

    /**
    @notice Marks a task claimable by the correct or only validators. Determines if the task reward
    is claimable by the reputation holder who initially claimed the task.
    @dev Only callable by the ProjectRegistry
    @param _passed Boolean describing the validation state the task should be claimable for.
    */
    function markTaskClaimable(bool _passed) public onlyPR returns(bool) {__FunctionCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',10);
             // passed only matters in voting
__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',158);
         __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',21);
if (totalValidateAffirmative == 0 || totalValidateNegative == 0) {__BranchCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',7,0);
__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',159);
             __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',22);
claimable = true;
__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',160);
             __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',23);
if (totalValidateAffirmative > totalValidateNegative) {__BranchCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',8,0);  __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',24);
claimableByRep = true; }else { __BranchCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',8,1);}

        } else {__BranchCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',7,1);
__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',162);
             __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',25);
claimable = true;
__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',163);
             __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',26);
if (_passed) {__BranchCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',9,0);
__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',164);
                 __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',27);
claimableByRep = true;
__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',165);
                 __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',28);
totalValidateNegative = 0;
            } else {__BranchCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',9,1);
__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',167);
                 __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',29);
totalValidateAffirmative = 0;
            }
        }
__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',170);
         __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',30);
return claimableByRep;
    }

    /**
    @notice Clear the validator stake of validator at `_validator`
    @dev Only callable by TokenRegistry
    @param _validator Address of validator
    */
    function clearValidatorStake(address _validator) public onlyTR {__FunctionCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',11);

__CoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',179);
         __StatementCoverageTask('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Task.sol',31);
validators[_validator].stake = 0;
    }
}
