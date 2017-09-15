pragma solidity ^0.4.10;

//import files
import "./ProjectRegistry.sol";
import "./TokenHolderRegistry.sol";
import "./WorkerRegistry.sol";

/*
  a created project
*/

contract Project{

//state variables (incomplete)

  address projectRegistry;
  uint capitalCost;   //total amount of staked capital tokens needed
  uint workerCost;    //total amount of staked worker tokens needed

  //keep track of staking on proposed project
  uint totalCapitalStaked;   //amount of capital tokens currently staked
  uint totalWorkerStaked;    //amount of worker tokens currently staked
  mapping (address => uint) stakedCapitalBalances;
  mapping (address => uint) stakedWorkerBalances;

  //keep track of workers with tasks
  Worker[] workers;

  struct Worker {
    address workerAddress;
    //uint taskHash;
    //uint escrowTokens;   //tokens paid to sign up for task, amount they will earn if validated
    //uint ETHReward;      //unclear how to go about representing this
  }

  //keep track of validating complete project
  mapping (address => uint) validatedAffirmative;
  mapping (address => uint) validatedNegative;
  uint validationPeriod;

  //needed to keep track of voting complete project
  mapping (address => uint) votedAffirmative;
  mapping (address => uint) votedNegative;
  uint votingPeriod;

  //project states & deadlines
  State public proposalState;
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
    require(proposalState == _state);
    _;
  }

  modifier onlyAfter(uint _time){
    require(now > _time);
    _;
  }

  modifier onlyBefore(uint _time) {
    require(now < _time);
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

//balance of contract
function getBalance() returns(uint){
  return this.balance;
}

//constructor
  function Project(uint _cost, uint _projectDeadline) {
    capitalCost = _cost;
    projectDeadline = _projectDeadline;
    proposalState = State.Proposed;
    totalCapitalStaked = 0;
    totalWorkerStaked = 0;
    //projectRegistry = msg.sender;
  }

//functions

  //CHECK HAS TOKENS

  function checkHasFreeWorkerTokens() {
    //references worker registry
  }

  function checkHasFreeCapitalTokens() {
    //references token holder registry
  }

  //PROPOSED PROJECT - STAKING FUNCTIONALITY
  function checkStaked() onlyInState(State.Proposed) internal {
    if (totalCapitalStaked >= capitalCost &&
      totalWorkerStaked >= workerCost)
      {
        proposalState = State.Active;
      }
  }

  function stakeCapitalToken() onlyInState(State.Proposed) onlyBefore(projectDeadline) {
    checkStaked();
    //if first stake, add to tokenholders mapping
  }

  function unstakeCapitalToken() onlyInState(State.Proposed) onlyBefore(projectDeadline) {
    //if removes all tokens, remove from tokenholders mapping
  }

  function stakeWorkerToken() onlyInState(State.Proposed) onlyBefore(projectDeadline) {
    checkStaked();
    //if first stake, add to workers mapping
  }

  function unstakeWorkerToken() onlyInState(State.Proposed) onlyBefore(projectDeadline) {
    //if removes all tokens, remove from workers mapping`
  }

  //ACTIVE PROJECT
  function checkWorkersDone() onlyInState(State.Active) internal {

  }

  function addWorker(address _workerAddress) onlyInState(State.Active) {
    //need to restrict who can call this
    workers.push(Worker(_workerAddress));
  }

  //COMPLETED PROJECT - VALIDATION & VOTING FUNCTIONALITY
  function checkValidationOver() onlyInState(State.Completed) internal {

  }

  function checkVotingOver() onlyInState(State.Completed) internal {

  }

  function validate(uint _tokens, bool _validationState) onlyInState(State.Completed) onlyBefore(projectDeadline) {
    //make sure has the free tokens
    //move msg.sender's tokens from freeTokenBalance to validatedTokenBalance
    if (_validationState) {
      validatedAffirmative(msg.sender) = _tokens;
    }
    else {
      validatedNegative(msg.sender) = _tokens
    }
  }

  function voteWorker(uint _workerTokens) {
    //check has the free tokens
  }

  function voteTokenHolder(uint _capitalTokens){

  }

}
