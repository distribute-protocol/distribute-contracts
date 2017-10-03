pragma solidity ^0.4.10;

//import files
import "./Project.sol";

/*
  keeps track of worker token balances of all
  states (free, staked, voted
*/

//INCOMPLETE

contract WorkerRegistry{

//state variables
  address tokenHolderRegistry;

  mapping (address => uint) balances;
  uint public totalWorkerTokenSupply;               //total supply of capital tokens in all states
  uint public totalFreeWorkerTokenSupply;           //total supply of free capital tokens (not staked, validated, or voted)

//events

//modifiers

//constructor
  function WorkerRegistry(address _tokenHolderRegistry){
      tokenHolderRegistry = _tokenHolderRegistry;
  }

//functions

  function stakeToken(address _staker, uint _tokens) {
    if (balances[_staker] > _tokens) {
      balances[_staker] -= _tokens;
      totalFreeWorkerTokenSupply -= _tokens;
    }
  }

  function unstakeToken(address _staker, uint _tokens) {

  }

  function refundStaker(uint _id) {
    address _staker = msg.sender;
    address _projectAddress = TokenHolderRegistry(tokenHolderRegistry).getProjectAddress(_id);
    uint _refund = Project(_projectAddress).refundStaker(msg.sender);
    balances[msg.sender] += _refund;
    totalFreeWorkerTokenSupply += refund;
  }

}
