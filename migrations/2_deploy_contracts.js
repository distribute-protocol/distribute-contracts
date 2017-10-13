const Project = artifacts.require("./Project");
const TokenHolderRegistry = artifacts.require("./TokenHolderRegistry");
const WorkerRegistry = artifacts.require("./WorkerRegistry");
const StandardToken = artifacts.require("./StandardToken")
const PLCRVoting = artifacts.require('./PLCRVoting.sol');
const HumanStandardToken = artifacts.require('./HumanStandardToken.sol');
const DLL = artifacts.require('./DLL.sol');
const AttributeStore = artifacts.require('./AttributeStore.sol');

/*
  deploys and connects contracts
*/

module.exports = function(deployer, network, accounts) {
/*
    // deploy libraries
    deployer.deploy(DLL);
    deployer.deploy(AttributeStore);

    // link libraries
    deployer.link(DLL, PLCRVoting);
    deployer.link(AttributeStore, PLCRVoting);

    //deploy other contract
    deployer.deploy(StandardToken);

      const tokenConf = {
        initialAmount: '0',
        tokenName: 'TestToken',
        decimalUnits: '0',
        tokenSymbol: 'TEST',
      };

    deployer.deploy(
        HumanStandardToken,
        tokenConf.initialAmount,
        tokenConf.tokenName,
        tokenConf.decimalUnits,
        tokenConf.tokenSymbol,
    ).then(() => deployer.deploy(
          PLCRVoting,
          HumanStandardToken.address,
        ))
*/
    deployer.then(function(){
        return deployer.deploy(TokenHolderRegistry)
      }).then(function(instance){
        return deployer.deploy(WorkerRegistry, TokenHolderRegistry.address)
      }).then(function(instance){
        return TokenHolderRegistry.deployed()
      }).then(function(instance){
        return instance.init(WorkerRegistry.address)
    });
};
