pragma solidity ^0.4.10;

//import files
import "./Project.sol";
import "./ProjectRegistry.sol";

/*
  keeps track of worker token balances of all
  states (free, staked, voted
*/

contract WorkerRegistry{

//state variables
  struct Worker{
    uint totalTokenBalance;       //total capital tokens of all types
    uint proposedTokenBalance;    //tokens held in escrow for proposed projects
    uint stakedTokenBalance;      //tokens staked on proposed/active projects
    uint validatedTokenBalance;   //tokens staked on a validation state of a complete project
    uint votedTokenBalance;       //tokens held in escrow for voting on a complete project
  }

  address projectRegistry;
  mapping (address => Worker) public balances;
  uint public totalWorkerTokenSupply;               //total supply of capital tokens in all states
  uint public totalFreeWorkerTokenSupply;           //total supply of free capital tokens (not staked, validated, or voted)

//events

//modifiers

//constructor
function WorkerRegistry(address _projectRegistry, address _firstWorker){
  projectRegistry = _projectRegistry;
  balances[_firstWorker] = Worker(1, 0, 0, 0, 0);
  totalWorkerTokenSupply = 1;
  totalFreeWorkerTokenSupply = 1;
}


//functions

}
