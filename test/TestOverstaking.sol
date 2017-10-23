pragma solidity ^0.4.10;

import "truffle/DeployedAddresses.sol";
import "../contracts/TokenHolderRegistry.sol";
import "./ThrowProxy.sol";

contract TestOverstaking {
  function testThrow() public {
    TokenHolderRegistry THR = new TokenHolderRegistry();
    ThrowProxy throwProxy = new ThrowProxy(address(THR)); //set TokenHolderRegistry as the contract to forward requests to. The target.

    //prime the proxy.
    TokenHolderRegistry(address(throwProxy)).mint(100);
    TokenHolderRegistry(address(throwProxy)).proposeProject(4183186686622021, 2508356242808);
    TokenHolderRegistry(address(throwProxy)).stakeToken(1, 100);

    //execute the call that is supposed to throw.
    //r will be false if it threw. r will be true if it didn't.
    //make sure you send enough gas for your contract method.
    bool r = throwProxy.execute.gas(200000)();

    Assert.isFalse(r, 'Should be false, as it should throw');
  }
}
