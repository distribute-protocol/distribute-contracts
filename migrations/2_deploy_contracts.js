const TokenHolderRegistry = artifacts.require('TokenHolderRegistry');
const WorkerRegistry = artifacts.require('WorkerRegistry');
const PLCRVoting = artifacts.require('PLCRVoting');
const DLL = artifacts.require('DLL');
const AttributeStore = artifacts.require('AttributeStore');
const StandardToken = artifacts.require('StandardToken');
/*
  deploys and connects contracts
*/

module.exports = function(deployer) {

    // deploy libraries
    deployer.deploy(DLL);
    deployer.deploy(AttributeStore);
    // link libraries
    deployer.link(DLL, PLCRVoting);
    deployer.link(AttributeStore, PLCRVoting);

    deployer.deploy(StandardToken);

    deployer.then(function(){
        return deployer.deploy(TokenHolderRegistry)
      }).then(function(){
        return deployer.deploy(WorkerRegistry)
      }).then(function(){
        return deployer.deploy(PLCRVoting, TokenHolderRegistry.address, WorkerRegistry.address)
      }).then(function(){
        return TokenHolderRegistry.deployed()
      }).then(function(instance){
        return instance.init(WorkerRegistry.address, PLCRVoting.address)
      }).then(function(){
        return WorkerRegistry.deployed()
      }).then(function(instance){
        return instance.init(TokenHolderRegistry.address, PLCRVoting.address)
    });
    deployer.link(StandardToken, TokenHolderRegistry)
};
