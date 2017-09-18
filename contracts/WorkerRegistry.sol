pragma solidity ^0.4.10;

//import files
import "./Project.sol";
import "./ProjectRegistry.sol";

/*
  keeps track of worker token balances of all
  states (free, staked, voted
*/

//INCOMPLETE

contract WorkerRegistry{

//state variables
  struct Worker{
    uint totalTokenBalance;       //total worker tokens of all types
    uint freeTokenBalance;
  }

  address projectRegistry;
  mapping (address => Worker) public balances;
  uint public totalWorkerTokenSupply;               //total supply of capital tokens in all states
  uint public totalFreeWorkerTokenSupply;           //total supply of free capital tokens (not staked, validated, or voted)

//events

//modifiers

//constructor
function WorkerRegistry(address _projectRegistry){
  projectRegistry = _projectRegistry;
  balances[_firstWorker] = Worker(1, 0, 0, 0);
  totalWorkerTokenSupply = 1;
  totalFreeWorkerTokenSupply = 1;
  }

//functions

}
