
// ===================================================================== //
// This contract manages a single task each project.
// ===================================================================== //

pragma solidity ^0.4.8;

import "./Project.sol";
import "./ProjectRegistry.sol";

contract Task {
  ProjectRegistry projectRegistry;
  bytes32 public taskHash;

  uint256 public weiReward;
  uint256 public reputationReward;
  uint256 public claimTime;
  bool public complete;
  address public claimer;

 // validation state VARIABLES

 struct Validator {
   uint256 status;
   uint256 stake;
 }

 bool public opposingValidator = true;
 uint256 public validateReward;

  mapping (address => Validator) public validators;
  uint256 public totalValidateAffirmative;
  uint256 public totalValidateNegative;

  // =====================================================================
  // MODIFIERS
  // =====================================================================

  modifier onlyPR() {
    require(msg.sender == address(projectRegistry));
    _;
  }

  // =====================================================================
  // CONSTRUCTOR
  // =====================================================================

  function Task(bytes32 _hash) public {
    projectRegistry = ProjectRegistry(msg.sender);
    taskHash = _hash;
  }

  // =====================================================================
  // FUNCTIONS
  // =====================================================================

  function setTaskReward(uint256 _weiVal, uint256 _reputationVal, address _claimer) public onlyPR {
    weiReward = _weiVal;
    reputationReward = _reputationVal;
    claimTime = now;
    complete = false;
    claimer = _claimer;
  }

  function markTaskComplete() public onlyPR {
    complete = true;
  }

  function clearValidatorStake(address _staker) public onlyTR {
    validators[_staker].stake = 0;
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

}
