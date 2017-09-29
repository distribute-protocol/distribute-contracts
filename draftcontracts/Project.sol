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

  address proposer;

  uint capitalCost;   //total amount of staked capital tokens needed
  uint workerCost;    //total amount of staked worker tokens needed
  uint proposerStake;   //amount of capital tokens the proposer stakes

  //keep track of staking on proposed project
  uint totalCapitalStaked;   //amount of capital tokens currently staked
  uint totalWorkerStaked;    //amount of worker tokens currently staked
  mapping (address => uint) stakedCapitalBalances;
  mapping (address => uint) stakedWorkerBalances;

  //keep track of workers with tasks
  Worker[] workers;   //array of tasked workers

  struct Worker {
    address workerAddress;
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

/*
  modifier onlyWorker() {
    _;
  }

  modifier onlyTokenHolder() {
    _;
  }
*/

//constructor
  function Project(uint _cost, uint _projectDeadline) {
    //check has percentage of tokens to stake
    //move tokens from free to proposed in tokenholder contract
    projectRegistry = msg.sender;     //the project registry calls this function
    capitalCost = _cost;
    projectDeadline = _projectDeadline;
    projectState = State.Proposed;
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

  function refundProposer() {   //called by proposer to return
    if (projectState != State.Proposed && sha3(ProjectRegistry(projectRegistry).proposers(address(this))) == sha3(msg.sender)) {   //make sure out of proposed state & msg.sender is the proposer
      address tempaddress = msg.sender;    //proposer's address
      uint tempvalue = ProjectRegistry(projectRegistry).proposerStakes(address(this));    //proposer's stake
      TokenHolderRegistry(tokenHolderRegistry).refundProposer(tempaddress, tempvalue);
    }
  }

  function stakeCapitalToken(uint _tokens) onlyInState(State.Proposed) onlyBefore(projectDeadline) {
    if (checkStaked() == false &&
         stakedCapitalBalances[msg.sender] + _tokens > stakedCapitalBalances[msg.sender]) {
           TokenHolderRegistry(tokenHolderRegistry).stakeToken(msg.sender, _tokens);
           stakedCapitalBalances[msg.sender] += _tokens;
           checkStaked();
    }
  }

  function unStakeCapitalToken(uint _tokens) onlyInState(State.Proposed) onlyBefore(projectDeadline) {
    if (checkStaked() == false &&
         stakedCapitalBalances[msg.sender] - _tokens < stakedCapitalBalances[msg.sender] &&   //check overflow
         stakedCapitalBalances[msg.sender] - _tokens >= 0) {    //make sure has the tokens staked to unstake
           stakedCapitalBalances[msg.sender] -= _tokens;
           TokenHolderRegistry(tokenHolderRegistry).unstakeToken(msg.sender, _tokens);
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
  function checkWorkersDone() onlyInState(State.Active) internal returns (bool) {
    for (uint i=0; i<workers.length; i++) {
        if (workers[i].taskComplete == false) {
          return false;
        }
        else {
          validationStart = now;
          return true;
        }
    }
  }

  function addWorker(address _workerAddress) onlyInState(State.Active) onlyBefore(projectDeadline) {
    //need to restrict who can call this
    workers.push(Worker(_workerAddress, false));
  }

  function updateWorker() onlyInState(State.Active) returns (bool) {
    for (uint i=0; i<workers.length; i++) {
      if(workers[i].workerAddress == msg.sender) {
        workers[i].taskComplete = true;
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
}
