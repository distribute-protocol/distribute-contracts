var Project = artifacts.require("./Project.sol");
var ProjectRegistry = artifacts.require("./ProjectRegistry.sol");
var TokenHolderRegistry = artifacts.require("./TokenHolderRegistry.sol");
var WorkerRegistry = artifacts.require("./WorkerRegistry.sol");

//var initialBalance = accounts.length*10
//console.log("initBalance" + initialBalance)
var accounts = web3.eth.accounts


module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, MetaCoin);
  deployer.deploy(MetaCoin);
};


module.exports = function(deployer) {
    deployer.then(function(){
        return deployer.deploy(ProjectRegistry)
    }).then(function(instance){
        return deployer.deploy(TokenHolderRegistry, ProjectRegistry.address, accounts[0], initialBalance)
    }).then(function(){
        return ProjectRegistry.deployed()
    }).then(function(instance){
        return instance.init(UserRegistry.address)
    })
