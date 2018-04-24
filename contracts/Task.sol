pragma solidity ^0.4.21;

import "./Project.sol";

/**
@title Task Contract for Distribute Network
@author Team: Jessica Marshall, Ashoka Finley
@notice  This contract manages a single task for a project
@dev This contract is initialized by the Project Registry contract with the address of a valid
TokenRegistry, and ReputationRegistry.
*/
contract Task {

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
    `_reputationRegistry`
    @dev Created iteratively by the Project Registry contract
    @param _hash Hash of the tasks Description and Weighting
    @param _tokenRegistry Address of the TokenRegistry
    @param _reputationRegistry Address of the ReputationRegistry
    */
    function Task(bytes32 _hash, address _tokenRegistry, address _reputationRegistry) public {
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
    @notice Set validator of the current task, if the validator is of a different type than the other
    validators i.e. No when there are only Yes validators, then sets opposingValidator to true.
    @dev Only callable by the Token Registry
    @param _validator Address of validator
    @param _validationVal Flag for positive or negative validation
    @param _tokens Amount of tokens to stake on Validation.
    */
    function setValidator(address _validator, uint256 _validationVal, uint256 _tokens) external onlyTR {
        require(validators[_validator].stake == 0);
        validators[_validator] = Validator(_validationVal, _tokens);
        _validationVal == 1
            ? totalValidateAffirmative += _tokens
            : totalValidateNegative += _tokens;
        if (!opposingValidator && (totalValidateAffirmative != 0 && totalValidateNegative != 0)) {
            opposingValidator = true;
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
    is claimable by the reputation holder who initially claimed the task.
    @dev Only callable by the ProjectRegistry
    @param _passed Boolean describing the validation state the task should be claimable for.
    */
    function markTaskClaimable(bool _passed) external onlyPR returns (bool) {             // passed only matters in voting
        if (totalValidateAffirmative == 0 || totalValidateNegative == 0) {
            claimable = true;
            if (totalValidateAffirmative > totalValidateNegative) { claimableByRep = true; }
        } else {
            claimable = true;
            if (_passed) {
                claimableByRep = true;
                totalValidateNegative = 0;
            } else {
                totalValidateAffirmative = 0;
            }
        }
        return claimableByRep;
    }

    /**
    @notice Return the validator status of validator at `_validator`
    @param _validator Address of validator
    */
    function getValidatorStatus(address _validator) external view returns (uint) {
      return validators[_validator].status;
    }

    /**
    @notice Clear the validator stake of validator at `_validator`
    @param _validator Address of validator
    */
    function getValidatorStake(address _validator) external view returns (uint) {
      return validators[_validator].stake;
    }

    /**
    @notice Clear the validator stake of validator at `_validator`
    @dev Only callable by TokenRegistry
    @param _validator Address of validator
    */
    function clearValidatorStake(address _validator) external onlyTR {
        validators[_validator].stake = 0;
    }
}
