var Project = artifacts.require("./Project");
var ProjectRegistry = artifacts.require("./ProjectRegistry");
var TokenHolderRegistry = artifacts.require("./TokenHolderRegistry");
var WorkerRegistry = artifacts.require("./WorkerRegistry");

/*
  deploys and connects contracts
*/

module.exports = function(deployer) {
    deployer.then(function(){
        return deployer.deploy(ProjectRegistry)
      }).then(function(instance){
        return deployer.deploy(TokenHolderRegistry, ProjectRegistry.address)
      }).then(function(instance){
        return deployer.deploy(WorkerRegistry, ProjectRegistry.address)
      }).then(function(){
        return ProjectRegistry.deployed()
      }).then(function(instance){
        //console.log('success 2')   //prints the contract to the console
        return instance.init(TokenHolderRegistry.address, WorkerRegistry.address)
    })
};
