const PLCRVoting = artifacts.require('library/PLCRVoting')
const DLL = artifacts.require('library/DLL')
const AttributeStore = artifacts.require('library/AttributeStore')
const StandardToken = artifacts.require('library/StandardToken')

/*
  deploys and connects contracts
*/
module.exports = function(deployer) {
  deployer.deploy(DLL)
  deployer.deploy(AttributeStore)
  deployer.deploy(StandardToken)
  deployer.link(DLL, PLCRVoting)
  deployer.link(AttributeStore, PLCRVoting)
}
