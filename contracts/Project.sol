pragma solidity ^0.4.10;

//import files

contract Project{

//state variables (incomplete)
  address projectRegistry;
  address[] tokenHolders;     //list of token holders who stake capital tokens
  address[] workers;          //list of workers who stake worker tokens
  uint capitalCost;           //amount of staked capital tokens needed
  uint workerCost;            //amount of staked worker tokens needed
  State public proposalState;
  uint public projectDeadline;
  mapping (address => )

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

//constructor
  function Project(uint _cost, uint _projectDeadline) {
    capitalCost = _cost;
    projectDeadline = _projectDeadline;
    proposalState = State.Proposed;
  }

//functions
  function stakeCapitalToken() onlyInState(State.Proposed) onlyBefore(projectDeadline) {
    //if first stake, add to tokenholders mapping

  }

  function unstakeCapitalToken() onlyInState(State.Proposed) onlyBefore(projectDeadline) {
    //if removes all tokens, remove from tokenholders mapping
  }

  function stakeWorkerToken() onlyInState(State.Proposed) onlyBefore(projectDeadline) {
    //if first stake, add to workers mapping
  }

  function unstakeWorkerToken() onlyInState(State.Proposed) onlyBefore(projectDeadline) {
    //if removes all tokens, remove from workers mapping`
  }

  function getTotalCapitalTokens() returns (uint) {
    return this.
  }

  function checkReady() internal {
  }

}
