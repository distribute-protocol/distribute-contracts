pragma solidity ^0.4.10;

//import files
import "./Project.sol";
import "./ProjectRegistry.sol";

/*
  keeps track of token holder capital token balances of all
  states (free, staked, validated, voted)
  balance of this contract is the ETH pool
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
  uint public totalCapitalTokenSupply;               //total supply of capital tokens in all states
  uint public totalFreeCapitalTokenSupply;           //total supply of free capital tokens (not staked, validated, or voted)

  uint mintPriceConstant = 1;

//events

//modifiers

//constructor

  function TokenHolderRegistry(address _projectRegistry, address _firstTokenHolder, uint _initialBalance) {       //contract is created when the first token is minted
    projectRegistry = _projectRegistry;
    balances[_firstTokenHolder] = TokenHolder(_initialBalance, 0, 0, 0, 0);
    totalCapitalTokenSupply = _initialBalance;
    totalFreeCapitalTokenSupply = _initialBalance;
  }

//functions

  function getBalance() returns (uint){    //returns balance of ether pool
    return this.balance;
  }

  function mintPrice() returns (uint) {
    if (getBalance() == 0) {
      return mintPriceConstant;
    }
    else {
      return ((getBalance()/totalCapitalTokenSupply) + mintPriceConstant);    //division errors here
    }
  }

  function burnPrice() returns (uint) {

  }

  function mint(uint _numTokens) {

  }

  function burn(_numTokens) {

  }

  function transfer(address _to) {

  }

}
