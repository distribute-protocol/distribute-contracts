pragma solidity ^0.4.10;

//import files
import "./Project.sol";
import "./ProjectRegistry.sol";

/*
  keeps track of token holder capital token balances of all
  states (free, staked, validated, voted),
  is linked to the ProjectRegistry and Project contracts
*/

contract TokenHolderRegistry{

//state variables
  struct TokenHolder{
    uint totalTokenBalance;       //total capital tokens of all types
    uint proposedTokenBalance;    //tokens held in escrow for proposed projects
    uint stakedTokenBalance;      //tokens staked on proposed/active projects
    uint validatedTokenBalance;   //tokens staked on a validation state of a complete project
    uint votedTokenBalance;       //tokens held in escrow for voting on a complete project
  }

  address projectRegistry;
  mapping (address => TokenHolder) public balances;
  uint public totalSupply;               //total supply of capital tokens in all states
  uint public totalFreeSupply;           //total supply of free capital tokens (not staked, validated, or voted)

//events

//modifiers

//constructor

  function TokenHolderRegistry(address firstMinter){       //contract is created when the first token is minted

  }

//functions

  function mintPrice(){

  }

  function burnPrice(){

  }

  function mint(){

  }


  function burn(){

  }

}
