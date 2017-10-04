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
  
  struct Worker{
    uint totalTokenBalance;       //total worker tokens of all types
    uint freeTokenBalance;
  }

  mapping (address => Worker) balances;
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
  if (balances[_staker].freeTokenBalance > _tokens) {
    balances[_staker].freeTokenBalance -= _tokens;
    totalFreeWorkerTokenSupply -= _tokens;
  }
}

function unstakeToken(address _staker, uint _tokens) {
  if (balances[_staker].totalTokenBalance - balances[_staker].freeTokenBalance < _tokens) {
    balances[_staker].freeTokenBalance += _tokens;
    totalFreeWorkerTokenSupply += _tokens;
  }
}

}