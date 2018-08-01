pragma solidity ^0.4.21;

import "./Project.sol";
import "./library/SafeMath.sol";

/**
@title Task Contract for Distribute Network
@author Team: Jessica Marshall, Ashoka Finley
@notice  This contract manages a single task for a project
@dev This contract is initialized by the Project Registry contract with the address of a valid
TokenRegistry, and ReputationRegistry.
*/
contract Task {

    using SafeMath for uint256;

    // =====================================================================
    // STATE VARIABLES
    // =====================================================================

    address public projectRegistryAddress;
    address public tokenRegistryAddress;
    address public reputationRegistryAddress;

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

    mapping (address => Validator) public validators;
    uint256 public validateReward;
    uint public validationEntryFee;
    address[5] public affirmativeValidators;
    uint public affirmativeIndex;
    address[5] public negativeValidators;
    uint public negativeIndex;

    struct Validator {
        uint256 status;
        uint256 index;
        bool initialized;
    }

    /* bool public opposingValidator = false;
    uint256 public totalValidateAffirmative;
    uint256 public totalValidateNegative; */

    // =====================================================================
    // MODIFIERS
    // =====================================================================

    modifier onlyPR() {
        require(msg.sender == projectRegistryAddress);
        _;
    }

    modifier onlyTR() {
        require(msg.sender == tokenRegistryAddress);
        _;
    }

    modifier onlyPRorRR() {
        require(msg.sender == projectRegistryAddress || msg.sender == reputationRegistryAddress);
        _;
    }

    // =====================================================================
    // CONSTRUCTOR
    // =====================================================================

    /**
    @notice Initialize a task related to a project with a hash of the description and weighting
    `_hash` and the addresses of the TokenRegistry `_tokenRegistry` and ReputationRegistry
    `_reputationRegistry`    @dev Used for proxy deployment of this contract.
    @param _hash Hash of the tasks Description and Weighting
    @param _tokenRegistry Address of the TokenRegistry
    @param _reputationRegistry Address of the ReputationRegistry
    */
    function setup(bytes32 _hash, address _tokenRegistry, address _reputationRegistry) public {
        projectRegistryAddress = msg.sender;
        tokenRegistryAddress = _tokenRegistry;
        reputationRegistryAddress = _reputationRegistry;
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
    function setWeighting(uint256 _weighting) external onlyPR {
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
    function setTaskReward(uint256 _weiVal, uint256 _reputationVal, address _claimer) external onlyPRorRR {
        weiReward = _weiVal;
        reputationReward = _reputationVal;
        claimTime = now;
        complete = false;
        claimer = _claimer;
    }

    /**
    @notice Marks task as completed
    @dev Only callable by the Project Registry
    */
    function markTaskComplete() external onlyPR {
        complete = true;
    }

    /**
    @notice Sets the entry fee for validation
    @dev Only callable by the Project Registry
    */
    function setValidationEntryFee(uint256 _entryFee) external onlyPR returns (uint) {
        validationEntryFee = _entryFee;
        return validationEntryFee;
    }

    /**
    @notice Set a validator of the current task,
    @dev Only callable by the Token Registry
    @param _validator Address of validator
    @param _validationVal Flag for positive or negative validation
    */
    function setValidator(address _validator, uint256 _validationVal) external onlyTR {
        require(!validators[_validator].initialized);
        require(_validationVal == 1 || _validationVal == 0);
        if (_validationVal == 1) {
          require(affirmativeIndex < 5);
          affirmativeValidators[affirmativeIndex] = _validator;
          validators[_validator] = Validator(_validationVal, affirmativeIndex, true);
          affirmativeIndex += 1;
        } else {
          require(negativeIndex < 5);
          negativeValidators[negativeIndex] = _validator;
          validators[_validator] = Validator(_validationVal, negativeIndex, true);
          negativeIndex += 1;
        }
    }

    /**
    @notice Sets the PLCR poll id of the current task
    @dev Only callable by Project Registery
    @param _pollId Poll ID of PLCRVoting poll.
    */
    function setPollId(uint256 _pollId) external onlyPR {
        require(pollId == 0);
        pollId = _pollId;
    }

    /**
    @notice Marks a task claimable by the correct or only validators. Determines if the task reward
    is claimableByRep for the reputation holder who initially claimed the task.
    @dev Only callable by the ProjectRegistry
    @param _passed Boolean describing the validation state the task should be claimable for.
    */
    function markTaskClaimable(bool _passed) external onlyPR returns (bool) {
        claimable = true;            // passed only matters in voting
        if (_passed) { claimableByRep = true; }
        return claimableByRep;
    }

    /**
    @notice Return the validator status (affrimative of negative) of validator at `_validator`
    @param _validator Address of validator
    */
    function getValidatorStatus(address _validator) external view returns (uint) {
      require(validators[_validator].initialized);
      return validators[_validator].status;
    }

    /**
    @notice Return the validator validationindex of validator at `_validator`
    @param _validator Address of validator
    */
    function getValidatorIndex(address _validator) external view returns (uint) {
      require(validators[_validator].initialized);
      return validators[_validator].index;
    }


    /**
    @notice Clear the validator stake of validator at `_validator`
    @dev Only callable by TokenRegistry
    @param _validator Address of validator
    */
    function setValidatorIndex(address _validator) external onlyTR {
        validators[_validator].index = 100;
    }
}
