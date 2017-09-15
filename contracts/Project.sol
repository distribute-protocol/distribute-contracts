pragma solidity ^0.4.10;

//import files

contract Project{

//state variables (incomplete)
  address projectRegistry;
  address[] tokenHolders;       //list of token holders who stake capital tokens
  address[] workers;            //list of workers who stake worker tokens

  uint capitalTokenCost;   //amount of staked capital tokens needed
  uint workerTokenCost;    //amount of staked worker tokens needed

  uint totalCapitalTokensStaked;   //amount of capital tokens currently staked
  uint totalWorkerTokensStaked;    //amount of worker tokens currently staked

  mapping (address => uint) capitalTokens;
  mapping (address => uint) workerTokens;

  State public proposalState;
  uint public projectDeadline;

  enum State {
    Proposed,
    Active,
    Completed,
    Validated,
    Incomplete,
    Failed
  }

//events

//modifiers

  modifier onlyInState(State _state) {
    require(proposalState == _state);
    _;
  }

  modifier onlyBefore(uint _time) {
    require(now >= _time);
    _;
  }

  modifier onlyWorker() {

    _;
  }

  modifier onlyTokenHolder() {

    _;
  }

//balance of contract
function getBalance() returns(uint){
  return this.balance;
}

//constructor
  function Project(uint _cost, uint _projectDeadline) {
    capitalTokenCost = _cost;
    projectDeadline = _projectDeadline;
    proposalState = State.Proposed;
    totalCapitalTokensStaked = 0;
    totalWorkerTokensStaked = 0;
    projectRegistry = msg.sender;
  }

//functions

  //ACTIVE PROJECT - STAKING FUNCTIONALITY
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

  function checkStaked() internal {
    if (totalCapitalTokensStaked >= capitalTokenCost &&
      totalWorkerTokensStaked >= workerTokenCost)
      {
        proposalState = State.Active;
      }
  }

  //COMPLETED PROJECT - VALIDATION & VOTING FUNCTIONALITY
  function validate(uint _tokens) onlyInState(State.Active) onlyBefore(projectDeadline) {
    //if removes all tokens, remove from workers mapping`
  }

}
