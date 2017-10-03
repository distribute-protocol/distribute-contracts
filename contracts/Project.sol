pragma solidity ^0.4.10;

//import files
import "./TokenHolderRegistry.sol";
import "./WorkerRegistry.sol";

/*
  a created project
*/

contract Project{

//state variables
  address tokenHolderRegistry;
  address workerRegistry;

  uint capitalCost;   //total amount of staked capital in eth needed

  uint workerCost;    //total amount of staked worker tokens needed, one to one with capital tokens
  uint proposerStake;   //amount of capital tokens the proposer stakes

  //keep track of staking on proposed project
  uint totalCapitalStaked;   //amount of capital tokens currently staked
  uint totalWorkerStaked;    //amount of worker tokens currently staked
  mapping (address => uint) stakedCapitalBalances;
  mapping (address => uint) stakedWorkerBalances;

  //keep track of workers with tasks
  Task[] tasks;   //array of tasks for this project

  struct Task {
    address workerAddress;    //which worker is assigned to this task
    string description;       //brief description of task
    bool taskComplete;
    //uint taskHash;
    //uint escrowTokens;   //tokens paid to sign up for task, amount they will earn if validated
    //uint ETHReward;      //unclear how to go about representing this
  }

  //keep track of validating complete project
  mapping (address => uint) validatedAffirmative;
  mapping (address => uint) validatedNegative;
  uint validationStart;
  uint validationPeriod;

  //needed to keep track of voting complete project
  mapping (address => uint) votedAffirmative;
  mapping (address => uint) votedNegative;
  uint votingPeriod;

  //project states & deadlines
  State public projectState;
  uint public projectDeadline;
  enum State {
    Proposed,
    Active,
    Completed,
    Validated,
    Incomplete,
    Failed,
    Abandoned
  }

//events

//modifiers

  modifier onlyInState(State _state) {
    require(projectState == _state);
    _;
  }

  modifier onlyBefore(uint time) {
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

/*
  modifier onlyTokenHolder() {
    _;
  }
*/

//constructor
  function Project(uint _cost, uint _projectDeadline, uint256 _proposerStake) onlyTHR() {
    //check has percentage of tokens to stake
    //move tokens from free to proposed in tokenholder contract
    tokenHolderRegistry = msg.sender;     //the project registry calls this function
    capitalCost = _cost;
    projectDeadline = _projectDeadline;
    projectState = State.Proposed;
    proposerStake = _proposerStake;
    totalCapitalStaked = 0;
    totalWorkerStaked = 0;
  }

//functions

  //PROPOSED PROJECT - STAKING FUNCTIONALITY
  function checkStaked() onlyInState(State.Proposed) internal returns (bool) {   //if staked, changes state and breaks
    if (totalCapitalStaked >= capitalCost && totalWorkerStaked >= workerCost)
      {
        projectState = State.Active;
        return true;
      }
    else {
      return false;
    }
  }

  function refundProposer() onlyTHR() returns (uint256) {   //called by THR, decrements proposer tokens
    require(projectState != State.Proposed && proposerStake != 0);   //make sure out of proposed state & msg.sender is the proposer
    uint256 temp = proposerStake;
    proposerStake = 0;
    return temp;
  }

  function stakeCapitalToken(uint _tokens, address _staker) onlyTHR() onlyInState(State.Proposed) onlyBefore(projectDeadline) returns (bool) {  //called by THR only
    if (checkStaked() == false &&
      stakedCapitalBalances[_staker] + _tokens > stakedCapitalBalances[_staker]) {
        stakedCapitalBalances[_staker] += _tokens;
        return true;
    } else {
      return false;
    }
  }

  function unstakeCapitalToken(uint _tokens, address _staker) onlyTHR() onlyInState(State.Proposed) onlyBefore(projectDeadline) returns (bool) {    //called by THR only
    if (checkStaked() == false &&
         stakedCapitalBalances[_staker] - _tokens < stakedCapitalBalances[_staker] &&   //check overflow
         stakedCapitalBalances[_staker] - _tokens >= 0) {    //make sure has the tokens staked to unstake
           stakedCapitalBalances[_staker] -= _tokens;
           return true;
    } else {
      return false;
    }
  }

  function stakeWorkerToken(uint _tokens) onlyInState(State.Proposed) onlyBefore(projectDeadline) {
    if (checkStaked() == false &&
        stakedWorkerBalances[msg.sender] + _tokens > stakedWorkerBalances[msg.sender]) {
          WorkerRegistry(workerRegistry).stakeToken(msg.sender, _tokens);
          stakedWorkerBalances[msg.sender] += _tokens;
          checkStaked();
        }
  }

  function unstakeWorkerToken(uint _tokens) onlyInState(State.Proposed) onlyBefore(projectDeadline) {
    if (checkStaked() == false &&
        stakedWorkerBalances[msg.sender] - _tokens < stakedWorkerBalances[msg.sender] &&
        stakedWorkerBalances[msg.sender] - _tokens >= 0) {
          WorkerRegistry(workerRegistry).unstakeToken(msg.sender, _tokens);
          stakedWorkerBalances[msg.sender] -= _tokens;
        }
  }

  //ACTIVE PROJECT
  function checkTasksDone() onlyInState(State.Active) internal returns (bool) {
    for (uint i=0; i<tasks.length; i++) {
        if (tasks[i].taskComplete == false) {
          return false;
        }
        else {
          validationStart = now;
          return true;
        }
    }
  }

  function addTask(address _workerAddress, string _description) onlyInState(State.Active) onlyBefore(projectDeadline) {
    //need to restrict who can call this
    tasks.push(Task(_workerAddress, _description, false));
  }

  function updateTask() onlyInState(State.Active) returns (bool) {  //limit to called by worker in task
    for (uint i=0; i<tasks.length; i++) {
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
  function checkValidationOver() onlyInState(State.Completed) internal returns (bool) {
    if(validationStart + validationPeriod < now) {
      return false;
    }
    else {
      return true;
    }
  }

  function checkVotingOver() onlyInState(State.Completed) internal returns (bool) {
    if (validationStart + validationPeriod + votingPeriod < now) {
      return false;
    }
    else {
      return true;
    }
  }
/*
  function validate(uint _tokens, bool _validationState) onlyInState(State.Completed) onlyBefore(projectDeadline) {
    //make sure has the free tokens
    //move msg.sender's tokens from freeTokenBalance to validatedTokenBalance
    if (_validationState) {
      //check for overflow
      //move tokens from free to validated
      validatedAffirmative[msg.sender] += _tokens;
    }
    else {
      //check for overflow
      //move tokens from free to validated in other contract
      validatedNegative[msg.sender] += _tokens;
    }
  }

  function vote(uint _tokens, bool _validationState, bool _isworker) onlyBefore(projectDeadline) {
    //check has the free tokens depending on bool _isworker
    //move tokens from free to vote in other contract
    //check for overflow
    //update votedAffirmative or votedNegative mapping
  }
*/
  function refundStaker(address _staker) onlyInState(State.validated) returns (uint _refund) {  //called by THR or WR
    require(msg.sender == (tokenHolderRegistry || workerRegistry));
    if (msg.sender == tokenHolderRegistry) {

    }
    else if (msg.sender == workerRegistry) {
      require(stakedWorkerBalances[_staker] > 0);
      _stake = stakedWorkerBalances[_staker];
      stakedWorkerBalances[_staker] -= _stake;
      totalWorkerStaked -= _stake;
      return _stake;
    }
    return 0;
  }
}
