var Project = artifacts.require("./Project");
var TokenHolderRegistry = artifacts.require("./TokenHolderRegistry");
var WorkerRegistry = artifacts.require("./WorkerRegistry");

/*
  deploys and connects contracts
*/

module.exports = function(deployer) {
    deployer.then(function(){
        return deployer.deploy(TokenHolderRegistry)
      }).then(function(instance){
        return deployer.deploy(WorkerRegistry, TokenHolderRegistry.address)
      }).then(function(instance){
        return TokenHolderRegistry.deployed()
      }).then(function(instance){
        return instance.init()
    })
};
