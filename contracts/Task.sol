
// ===================================================================== //
// This contract manages a single task each project.
// ===================================================================== //

pragma solidity ^0.4.8;

import "./Project.sol";
import "./ProjectRegistry.sol";
import "./TokenRegistry.sol";

contract Task {
  ProjectRegistry projectRegistry;
  TokenRegistry tokenRegistry;
  bytes32 public taskHash;
  bool public claimable;

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

  bool public opposingValidator = false;
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

  modifier onlyTR() {
    require(msg.sender == address(tokenRegistry));
    _;
  }

  // =====================================================================
  // CONSTRUCTOR
  // =====================================================================

  function Task(bytes32 _hash, address _tokenRegistry) public {
    projectRegistry = ProjectRegistry(msg.sender);
    tokenRegistry = TokenRegistry(_tokenRegistry);
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
    _validationVal == 1
      ? totalValidateAffirmative += _tokens
      : totalValidateNegative += _tokens;
    if (!opposingValidator && (totalValidateAffirmative != 0 && totalValidateNegative != 0)) {
      opposingValidator = true;
    }
  }

  function markTaskClaimable() public onlyPR {
    claimable = true;
    if (totalValidateAffirmative > totalValidateNegative) {
      claimableByWorker = true;
    }
  }
}
