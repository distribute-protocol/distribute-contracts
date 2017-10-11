pragma solidity ^0.4.10;

//import files
import "./TokenHolderRegistry.sol";
import "./WorkerRegistry.sol";

/*
  a created project
*/

contract Project{

// =====================================================================
// STATE VARIABLES
// =====================================================================

  address tokenHolderRegistry;    //connect to THR
  address workerRegistry;         //connect to WR

  uint256 projectId;

  uint256 public capitalETHCost;
  uint256 capitalCost;            //total amount of staked capital in tokens needed
  //uint256 workerCost;             //total amount of staked worker tokens needed, one to one with capital tokens

  uint256 proposerStake;          //amount of capital tokens the proposer stakes
  uint256 projectDeadline;

  //keep track of staking on proposed project
  uint256 totalCapitalStaked;     //amount of capital tokens currently staked
  uint256 totalWorkerStaked;      //amount of worker tokens currently staked
  mapping (address => uint) stakedCapitalBalances;
  mapping (address => uint) stakedWorkerBalances;

  Task[] tasks;   //array of tasks for this project

  struct Task {
    address workerAddress;    //which worker is assigned to this task
    string description;       //brief description of task
    bool taskComplete;
    //uint256 taskHash;
    //uint256 escrowTokens;   //tokens paid to sign up for task, amount they will earn if validated
    uint256 ETHReward;        //for now hard-coded
  }

  //keep track of validating complete project
  mapping (address => uint) validatedAffirmative;
  mapping (address => uint) validatedNegative;
  uint256 validationStart;
  uint256 validationPeriod;
  uint256 totalValidateAffirmative;
  uint256 totalValidateNegative;
  uint256 validateReward;

  //keep track of voting complete project
  mapping (address => uint) votedAffirmative;
  mapping (address => uint) votedNegative;
  uint256 votingPeriod;
  uint256 totalVoteAffirmative;
  uint256 totalVoteNegative;

  //project states & deadlines
  State public projectState;
  enum State {
    Proposed,
    Active,
    Completed,
    Validated,
    Incomplete,
    Failed
  }

// =====================================================================
// EVENTS
// =====================================================================

// =====================================================================
// MODIFIERS
// =====================================================================

  modifier onlyInState(State _state) {
    require(projectState == _state);
    _;
  }

  modifier onlyBefore(uint256 time) {
    require(now < time);
    _;
  }

  modifier onlyTHR() {
    require(msg.sender == tokenHolderRegistry);
    _;
  }

  modifier onlyWR() {
    require(msg.sender == workerRegistry);
    _;
  }

// =====================================================================
// FUNCTIONS
// =====================================================================

  // =====================================================================
  // CONSTRUCTOR
  // =====================================================================

  function Project(uint256 _id, uint256 _cost, uint256 _projectDeadline, uint256 _proposerStake) {       //called by THR
    //all checks done in THR first
    tokenHolderRegistry = msg.sender;     //the token holder registry calls this function
    projectId = _id;
    capitalETHCost = _cost;
    projectDeadline = _projectDeadline;
    projectState = State.Proposed;
    proposerStake = _proposerStake;
    totalCapitalStaked = 0;
    totalWorkerStaked = 0;
    capitalCost = 10 * _proposerStake;      //for testing
  }

  // =====================================================================
  // GENERAL FUNCTIONS
  // =====================================================================

  function checkStateChange() internal returns (bool stateChange) {                              //general state change function
    if (projectState == State.Proposed) {
      if (totalCapitalStaked >= capitalCost && totalWorkerStaked >= capitalCost)
        {
          projectState = State.Active;
          return true;
        }
        else {
          return false;
      }
    }

    else if (projectState == State.Active) {
      for (uint256 i = 0; i < tasks.length; i++) {
        if (tasks[i].taskComplete == false) {
          if (now > projectDeadline) {
            projectState = State.Incomplete;
            return true;
          }
          return false;
        }
      }
      validationStart = now;
      projectState = State.Completed;
      return true;
      }

    else if (projectState == State.Completed) {
      if(now > validationStart + validationPeriod + votingPeriod) {
        if (totalVoteNegative > totalVoteAffirmative) {
          handleVoteResult();                   //prevent stakers from withdrawing before burning their tokens
          projectState = State.Failed;
          return true;
        }
        else {
          handleVoteResult();
          projectState = State.Validated;
          return true;
        }
      }
      return false;
    }
  }

  // =====================================================================
  // PROPOSED PROJECT - STAKING FUNCTIONS
  // =====================================================================

  function refundProposer() onlyTHR() returns (uint256 _proposerStake) {   //called by THR, decrements proposer tokens in Project.sol
    require(projectState != State.Proposed && proposerStake != 0);         //make sure out of proposed state & msg.sender is the proposer
    uint256 temp = proposerStake;
    proposerStake = 0;
    return temp;
  }

  function stakeCapitalToken(uint256 _tokens, address _staker) onlyTHR() onlyInState(State.Proposed) onlyBefore(projectDeadline) returns (bool success) {  //called by THR, increments _staker tokens in Project.sol
    if (checkStateChange() == false &&
         stakedCapitalBalances[_staker] + _tokens > stakedCapitalBalances[_staker]) {
        stakedCapitalBalances[_staker] += _tokens;
        totalCapitalStaked += _tokens;
        checkStateChange();
        return true;
    } else {
      return false;
    }
  }

  function unstakeCapitalToken(uint256 _tokens, address _staker) onlyTHR() onlyInState(State.Proposed) onlyBefore(projectDeadline) returns (bool success) {    //called by THR only, decrements _staker tokens in Project.sol
    if (checkStateChange() == false &&
         stakedCapitalBalances[_staker] - _tokens < stakedCapitalBalances[_staker] &&   //check overflow
         stakedCapitalBalances[_staker] - _tokens >= 0) {    //make sure _staker has the tokens staked to unstake
           stakedCapitalBalances[_staker] -= _tokens;
           totalCapitalStaked -= _tokens;
           return true;
    } else {
      return false;
    }
  }

  function stakeWorkerToken(uint256 _tokens, address _staker) onlyWR() onlyInState(State.Proposed) onlyBefore(projectDeadline) returns (bool success) {
    if (checkStateChange() == false &&
         stakedWorkerBalances[_staker] + _tokens > stakedWorkerBalances[_staker]) {
        stakedWorkerBalances[_staker] += _tokens;
        return true;
    } else {
      return false;
    }
  }

  function unstakeWorkerToken(uint256 _tokens, address _staker) onlyWR() onlyInState(State.Proposed) onlyBefore(projectDeadline) returns (bool success) {
    if (checkStateChange() == false &&
         stakedWorkerBalances[_staker] - _tokens < stakedWorkerBalances[_staker] &&   //check overflow
         stakedWorkerBalances[_staker] - _tokens >= 0) {    //make sure _staker has the tokens staked to unstake
           stakedWorkerBalances[_staker] -= _tokens;
           return true;
    } else {
      return false;
    }
  }

  // =====================================================================
  // ACTIVE PROJECT FUNCTIONS
  // =====================================================================

  function addTask(address _workerAddress, string _description, uint256 _workerReward) onlyInState(State.Active) onlyBefore(projectDeadline) {     //uclear who can call this, needs to be restricted to consensus-based tasks
    if (checkStateChange() == false) {
      tasks.push(Task(_workerAddress, _description, false, _workerReward));
    }
  }

  function completeTask() onlyInState(State.Active) onlyWR() returns (bool success) {  //can only be called by worker in task
    if (checkStateChange() == false) {
      for (uint256 i=0; i<tasks.length; i++) {
        if(tasks[i].workerAddress == msg.sender && tasks[i].taskComplete == false) {
          tasks[i].taskComplete = true;
          return true;
        }
      }
      return false;
    }
    return false;
  }

  // =====================================================================
  // COMPLETED PROJECT - VALIDATION & VOTING FUNCTIONALITY
  // =====================================================================

  function validate(address _staker, uint256 _tokens, bool _validationState) onlyTHR() onlyInState(State.Completed) returns (bool success) {
    //checks for free tokens done in THR
    //increments validation tokens in Project.sol only
    if (checkStateChange() == false) {
      require(now < validationStart + validationPeriod);
      if (_validationState == true && validatedAffirmative[_staker] + _tokens > validatedAffirmative[_staker] && totalValidateAffirmative + _tokens > totalValidateAffirmative) {
        validatedAffirmative[_staker] += _tokens;
        totalValidateAffirmative += _tokens;
        return true;
      }
      else if (_validationState == false && validatedNegative[_staker] + _tokens > validatedNegative[_staker] && totalValidateNegative + _tokens > totalValidateNegative){
        validatedNegative[msg.sender] += _tokens;
        totalValidateNegative += _tokens;
        return true;
      }
      return false;
    }
  }

  function vote(address _staker, uint256 _tokens, bool _votingState) onlyInState(State.Completed) returns (bool success) {
    if (checkStateChange() == false) {
      require(now > validationStart + validationPeriod && now < validationStart + validationPeriod + votingPeriod);
      require(msg.sender == tokenHolderRegistry ||  msg.sender == workerRegistry);
      if (_votingState == true && votedAffirmative[_staker] + _tokens > votedAffirmative[_staker] && totalVoteAffirmative + _tokens > totalVoteAffirmative) {
        votedAffirmative[_staker] += _tokens;
        totalVoteAffirmative += _tokens;
        return true;
      }
      else if (_votingState == false && votedNegative[_staker] + _tokens > votedNegative[_staker] && totalVoteNegative + _tokens > totalVoteNegative){
        votedNegative[msg.sender] += _tokens;
        totalVoteNegative += _tokens;
        return true;
      }
      return false;
    }
  }

  function handleVoteResult() internal {
    if(totalVoteNegative > totalVoteAffirmative) {      //project fails
      TokenHolderRegistry(tokenHolderRegistry).updateTotal(projectId, totalCapitalStaked);
      WorkerRegistry(workerRegistry).updateTotal(projectId, totalWorkerStaked);
      totalCapitalStaked = 0;
      totalWorkerStaked = 0;
      validateReward = totalValidateAffirmative;
      totalValidateAffirmative = 0;
    }
    else {                                              //project succeeds
      validateReward = totalValidateNegative;
      totalValidateNegative = 0;
    }
  }

  // =====================================================================
  // VALIDATED / FAILED PROJECT
  // =====================================================================

  function refundStaker(address _staker) returns (uint256 _refund) {  //called by THR or WR, allow return of staked, validated, and
    require(msg.sender == tokenHolderRegistry ||  msg.sender == workerRegistry);
    require(projectState == State.Validated || projectState == State.Failed);
    uint256 refund;
    if (msg.sender == tokenHolderRegistry) {
      if(totalCapitalStaked != 0) {
        refund = stakedCapitalBalances[_staker];
        stakedCapitalBalances[_staker] = 0;
      }
      if(totalValidateNegative != 0) {
        refund += validatedNegative[_staker];
        validatedNegative[_staker] = 0;
        //plus validation reward
      }
      if(totalValidateAffirmative != 0) {
        refund += validatedAffirmative[_staker];
        validatedAffirmative[_staker] = 0;
        //plus validation reward
      }
      refund += votedNegative[_staker];
      votedNegative[_staker] = 0;
      refund += votedAffirmative[_staker];
      votedAffirmative[_staker] = 0;
      return refund;
    }

    else if (msg.sender == workerRegistry) {
      if(totalWorkerStaked != 0) {
        refund = stakedWorkerBalances[_staker];
        stakedWorkerBalances[_staker] = 0;
      }
      refund += votedNegative[_staker];
      votedNegative[_staker] = 0;
      refund += votedAffirmative[_staker];
      votedAffirmative[_staker] = 0;
      return refund;
    }
  }

  function rewardWorker(address _staker) onlyWR() onlyInState(State.Validated) returns (uint256 _reward) {
    uint256 reward = 0;
    for (uint256 i=0; i<tasks.length; i++) {
      if(tasks[i].workerAddress == _staker) {
        reward += tasks[i].ETHReward;
        tasks[i].ETHReward = 0;
      }
    }
    return reward;
  }

}
