var Project = artifacts.require("./Project");
var TokenHolderRegistry = artifacts.require("./TokenHolderRegistry");
var WorkerRegistry = artifacts.require("./WorkerRegistry");
var ERC20Contract = artifacts.require("./ERC20");

/*
  deploys and connects contracts
*/

accounts = web3.eth.accounts

module.exports = function(deployer) {
    deployer.deploy(ERC20Contract);
    deployer.then(function(){
        return deployer.deploy(TokenHolderRegistry)
      }).then(function(instance){
        return deployer.deploy(WorkerRegistry, TokenHolderRegistry.address)
      }).then(function(instance){
        return TokenHolderRegistry.deployed()
      }).then(function(instance){
        return instance.init()
    })
    deployer.link(ERC20Contract, TokenHolderRegistry);
};
