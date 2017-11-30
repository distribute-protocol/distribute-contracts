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
};
