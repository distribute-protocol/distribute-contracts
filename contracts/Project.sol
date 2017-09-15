pragma solidity ^0.4.10;

//import files

contract Project{

//state variables
  address projectRegistry;
  address[] tokenHolders;     //list of token holders who stake capital tokens
  address[] workers;          //list of workers who stake worker tokens
  uint capitalCost;           //amount of staked capital tokens needed
  uint workerCost;            //amount of staked worker tokens needed
  State public proposalState;
  uint public stakingDeadline;
  
  enum State {
    Proposed,
    Open,
    Active,
    Completed,
    Validated,
    Incomplete,
    Failed
  }

//events

//modifiers

//constructor
  function Project(uint _cost, uint _time){

  }

//functions

}
