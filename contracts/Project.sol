pragma solidity ^0.4.10;

//import files
import "./TokenHolderRegistry.sol";
import "./WorkerRegistry.sol";

/*
  a created project
*/

contract Project{

// =======================
// STATE VARIABLES
// =======================

  address tokenHolderRegistry;    //connect to THR
  address workerRegistry;         //connect to WR

  uint256 capitalCost;            //total amount of staked capital in ETH needed
  uint256 workerCost;             //total amount of staked worker tokens needed, one to one with capital tokens

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
    //uint256 ETHReward;      //unclear how to go about representing this
  }

  //keep track of validating complete project
  mapping (address => uint) validatedAffirmative;
  mapping (address => uint) validatedNegative;
  uint256 validationStart;
  uint256 validationPeriod;

  //keep track of voting complete project
  mapping (address => uint) votedAffirmative;
  mapping (address => uint) votedNegative;
  uint256 votingPeriod;
  uint256 totalVoteAffirmate;
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

  // =======================
  // EVENTS
  // =======================

  // =======================
  // MODIFIERS
  // =======================

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

  // =======================
  // CONSTRUCTOR
  // =======================

  function Project(uint256 _cost, uint256 _projectDeadline, uint256 _proposerStake) onlyTHR() {       //called by THR
    //all checks done in THR first
    tokenHolderRegistry = msg.sender;     //the token holder registry calls this function
    capitalCost = _cost;
    projectDeadline = _projectDeadline;
    projectState = State.Proposed;
    proposerStake = _proposerStake;
    totalCapitalStaked = 0;
    totalWorkerStaked = 0;
  }

  // =======================
  // FUNCTIONS
  // =======================

  //GENERAL FUNCTIONS
  function checkStateChange() internal returns (bool stateChange) {                              //general state change function
    if (projectState == State.Proposed) {
      if (totalCapitalStaked >= capitalCost && totalWorkerStaked >= workerCost)
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
        if (votedNegative > votedAffirmative) {
          projectState = State.Failed;
          return true;
        }
        else {
          projectState = State.Validated;
          return true;
        }
      }
      return false;
    }
  }

  //PROPOSED PROJECT - STAKING FUNCTIONALITY
  function refundProposer() onlyTHR() returns (uint256 _proposerStake) {   //called by THR, decrements proposer tokens
    require(projectState != State.Proposed && proposerStake != 0);   //make sure out of proposed state & msg.sender is the proposer
    uint256 temp = proposerStake;
    proposerStake = 0;
    return temp;
  }

  function stakeCapitalToken(uint256 _tokens, address _staker) onlyTHR() onlyInState(State.Proposed) onlyBefore(projectDeadline) returns (bool) {  //called by THR only
    if (checkStaked() == false &&
      stakedCapitalBalances[_staker] + _tokens > stakedCapitalBalances[_staker]) {
        stakedCapitalBalances[_staker] += _tokens;
        return true;
    } else {
      return false;
    }
  }

  function unstakeCapitalToken(uint256 _tokens, address _staker) onlyTHR() onlyInState(State.Proposed) onlyBefore(projectDeadline) returns (bool) {    //called by THR only
    if (checkStaked() == false &&
         stakedCapitalBalances[_staker] - _tokens < stakedCapitalBalances[_staker] &&   //check overflow
         stakedCapitalBalances[_staker] - _tokens >= 0) {    //make sure has the tokens staked to unstake
           stakedCapitalBalances[_staker] -= _tokens;
           return true;
    } else {
      return false;
    }
  }

  function stakeWorkerToken(uint256 _tokens, address _staker) onlyWR() onlyInState(State.Proposed) onlyBefore(projectDeadline) {

  }

  function unstakeWorkerToken(uint256 _tokens, address _staker) onlyWR() onlyInState(State.Proposed) onlyBefore(projectDeadline) {

  }

  //ACTIVE PROJECT

  function addTask(address _workerAddress, string _description) onlyInState(State.Active) onlyBefore(projectDeadline) {
    //need to restrict who can call this
    tasks.push(Task(_workerAddress, _description, false));
  }

  function updateTask() onlyInState(State.Active) onlyWR() returns (bool success) {  //limit to called by worker in task
    for (uint256 i=0; i<tasks.length; i++) {
      if(tasks[i].workerAddress == msg.sender) {
        tasks[i].taskComplete = true;
        return true;
      }
      else {
      return false;
      }
    }
  }

  //COMPLETED PROJECT - VALIDATION & VOTING FUNCTIONALITY
  function validate(uint256 _tokens, bool _validationState) onlyTHR() onlyInState(State.Completed) onlyBefore(projectDeadline) onlyTHR() {
    //make sure has the free tokens
    //move msg.sender's tokens from freeTokenBalance to validatedTokenBalance
    if (_validationState) {
      //check for overflow
      validatedAffirmative[msg.sender] += _tokens;
    }
    else {
      //check for overflow
      validatedNegative[msg.sender] += _tokens;
    }
  }

  function checkValidationOver() onlyInState(State.Completed) internal returns (bool) {
    if(validationStart + validationPeriod < now) {
      return false;
    }
    else {

      return true;
    }
  }

  function vote(uint256 _tokens, bool _validationState) onlyBefore(projectDeadline) {
    require(msg.sender == tokenHolderRegistry ||  msg.sender == workerRegistry);

  }

  function checkVotingOver() onlyInState(State.Completed) internal returns (bool) {         //if true, handle redistribution of validation tokens & potentially staked tokens
    if (validationStart + validationPeriod + votingPeriod < now) {
      return false;
    }
    else {
      return true;
    }
  }

  //VALIDATED PROJECT
  function refundStaker(address _staker) onlyInState(State.Validated) returns (uint256 _refund) {  //called by THR or WR
    require(msg.sender == tokenHolderRegistry ||  msg.sender == workerRegistry);
    if (msg.sender == tokenHolderRegistry) {

    }
    else if (msg.sender == workerRegistry) {
      require(stakedWorkerBalances[_staker] > 0);
      uint256 _stake = stakedWorkerBalances[_staker];
      stakedWorkerBalances[_staker] -= _stake;
      totalWorkerStaked -= _stake;
      return _stake;
    }
    return 0;
  }

  function rewardWorker() onlyWR() onlyInState(State.Validated) returns (uint256 _reward) {
    return 1;
  }
}
