const PLCRVoting = artifacts.require('library/PLCRVoting')
const DLL = artifacts.require('library/DLL')
const AttributeStore = artifacts.require('library/AttributeStore')

/*
  deploys and connects contracts
*/
module.exports = function (deployer) {
  deployer.deploy(DLL)
  deployer.deploy(AttributeStore)
  deployer.link(DLL, PLCRVoting)
  deployer.link(AttributeStore, PLCRVoting)
}
