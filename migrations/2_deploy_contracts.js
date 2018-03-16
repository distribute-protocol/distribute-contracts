const TokenRegistry = artifacts.require('TokenRegistry')
const ReputationRegistry = artifacts.require('ReputationRegistry')
const ProjectRegistry = artifacts.require('ProjectRegistry')
const Project = artifacts.require('Project')
const PLCRVoting = artifacts.require('PLCRVoting')
const DistributeToken = artifacts.require('DistributeToken')
const ProjectLibrary = artifacts.require('ProjectLibrary')
const Division = artifacts.require('library/Division')

/*
  deploys and connects contracts
*/

// module.exports = async function (deployer) {
  // deployer.deploy(Division)
  // deployer.link(Division, [DistributeToken, ProjectLibrary, ReputationRegistry, TokenRegistry])
//   deployer.deploy(ProjectLibrary)
//   deployer.link(ProjectLibrary, [TokenRegistry, ReputationRegistry, ProjectRegistry])
//   deployer.deploy(TokenRegistry)
//   deployer.deploy(ReputationRegistry)
//   deployer.deploy(ProjectRegistry)
//   deployer.deploy(DistributeToken, TokenRegistry.address, ReputationRegistry.address)
//   deployer.deploy(PLCRVoting, TokenRegistry.address, ReputationRegistry.address, ProjectRegistry.address)
//   let PRInstance = await ProjectRegistry.deployed()
//   PRInstance.init(DistributeToken.address, TokenRegistry.address, ReputationRegistry.address, PLCRVoting.address)
//   let TRInstance = await TokenRegistry.deployed()
//   TRInstance.init(DistributeToken.address, ProjectRegistry.address, PLCRVoting.address)
//   let RRInstance = await ReputationRegistry.deployed()
//   RRInstance.init(DistributeToken.address, ProjectRegistry.address, PLCRVoting.address)
// }
module.exports = function (deployer) {
  deployer.deploy(Division)
  deployer.link(Division, [DistributeToken, ProjectLibrary, ReputationRegistry, TokenRegistry, ProjectRegistry, Project])
  deployer.deploy(ProjectLibrary)
  deployer.link(ProjectLibrary, [TokenRegistry, ReputationRegistry, ProjectRegistry])
  deployer.then(function () {
    return deployer.deploy(TokenRegistry)
  }).then(function () {
    return deployer.deploy(ReputationRegistry)
  }).then(function () {
    return deployer.deploy(ProjectRegistry)
  }).then(function () {
    return deployer.deploy(DistributeToken, TokenRegistry.address, ReputationRegistry.address)
  }).then(function () {
    return deployer.deploy(PLCRVoting, TokenRegistry.address, ReputationRegistry.address, ProjectRegistry.address)
  }).then(function () {
    return ProjectRegistry.deployed()
  }).then(function (instance) {
    return instance.init(DistributeToken.address, TokenRegistry.address, ReputationRegistry.address, PLCRVoting.address)
  }).then(function () {
    return TokenRegistry.deployed()
  }).then(function (instance) {
    return instance.init(DistributeToken.address, ProjectRegistry.address, PLCRVoting.address)
  }).then(function () {
    return ReputationRegistry.deployed()
  }).then(function (instance) {
    return instance.init(DistributeToken.address, ProjectRegistry.address, PLCRVoting.address)
  })
}
