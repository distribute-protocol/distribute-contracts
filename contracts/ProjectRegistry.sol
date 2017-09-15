pragma solidity ^0.4.10;

//import files
import "./Project.sol";
import "./TokenHolderRegistry.sol";
import "./WorkerRegistry.sol";

/*
  create project,keep track of existing projects
*/

contract ProjectRegistry{

//state variables
  address tokenHolderRegistry;    //to be able to call the contract at this address
  address workerRegistry;

  mapping(address => bool) public projectExists = false;
  mapping(address => address) proposers;
  bool initialized = false;

//events

//modifiers

//"constructor"
  function init(address _tokenHolderRegistry, address _workerRegistry) {
    if (initialized == false) {
      initialized = true;
      tokenHolderRegistry = _tokenHolderRegistry;
      workerRegistry = _workerRegistry;
    }
  }


//functions
  function proposeProject(uint _cost, uint _projectDeadline) {
    //check to make sure has enough tokens
    Project newProject = new Project(_cost, _projectDeadline);
    address projectAddress = address(newProject);
    projectExists(projectAddress) = true;
    proposers(projectAddress) = msg.sender;
  }

}
