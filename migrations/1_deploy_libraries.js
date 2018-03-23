const PLCRVoting = artifacts.require('library/PLCRVoting')
const DLL = artifacts.require('library/DLL')
const AttributeStore = artifacts.require('library/AttributeStore')
const EIP20 = artifacts.require('library/EIP20')

/*
  deploys and connects contracts
*/
module.exports = function (deployer) {
  deployer.deploy(DLL)
  deployer.deploy(AttributeStore)
  deployer.deploy(EIP20)
  deployer.link(DLL, PLCRVoting)
  deployer.link(AttributeStore, PLCRVoting)
}
