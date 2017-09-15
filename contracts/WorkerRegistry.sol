pragma solidity ^0.4.10;

//import files
import "./Project.sol";
import "./ProjectRegistry.sol";

/*
  keeps track of worker token balances of all
  states (free, staked, voted
*/

contract WorkerRegistry{

  struct Worker{
    uint totalTokenBalance;       //total capital tokens of all types
    uint proposedTokenBalance;    //tokens held in escrow for proposed projects
    uint stakedTokenBalance;      //tokens staked on proposed/active projects
    uint validatedTokenBalance;   //tokens staked on a validation state of a complete project
    uint votedTokenBalance;       //tokens held in escrow for voting on a complete project
  }
//state variables


//events

//modifiers

//constructor
function WorkerRegistry(){

}


//functions

}
