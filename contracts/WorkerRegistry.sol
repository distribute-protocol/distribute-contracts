pragma solidity ^0.4.10;

//import files
import "./Project.sol";
import "./TokenHolderRegistry.sol";

/*
  keeps track of worker token balances of all
  states (free, staked, voted
*/

//INCOMPLETE

contract WorkerRegistry{

//state variables
  address tokenHolderRegistry;

  mapping (address => uint) balances;
  uint256 totalWorkerTokenSupply;               //total supply of capital tokens in all states
  uint256 totalFreeWorkerTokenSupply;           //total supply of free capital tokens (not staked, validated, or voted)

//events

//modifiers

//CONSTRUCTOR
  function WorkerRegistry(address _tokenHolderRegistry){
      tokenHolderRegistry = _tokenHolderRegistry;
  }

//PROPOSED PROJECT - STAKING FUNCTIONALITY
  function stakeToken(uint256 _projectId, uint256 _tokens) {

  }

  function unstakeToken(uint256 _projectId, uint256 _tokens) {

  }


  //ACTIVE PROJECT
  function updateTask() {

  }

  //COMPLETED PROJECT - VALIDATION & VOTING FUNCTIONALITY
  function vote(uint256 _projectId, uint256 _tokens) {

  }

  function refundStaker(uint256 _projectId) {
    address _projectAddress = TokenHolderRegistry(tokenHolderRegistry).getProjectAddress(_projectId);
    uint256 _refund = Project(_projectAddress).refundStaker(msg.sender);
    totalFreeWorkerTokenSupply += _refund;
    balances[msg.sender] += _refund;
  }

  function rewardWorker(uint256 _projectId) {   //pay worker for work

  }

}
