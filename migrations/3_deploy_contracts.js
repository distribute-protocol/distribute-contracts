const TokenRegistry = artifacts.require('TokenRegistry');
const ReputationRegistry = artifacts.require('ReputationRegistry');
const ProjectRegistry = artifacts.require('ProjectRegistry');
const PLCRVoting = artifacts.require('PLCRVoting');
const DLL = artifacts.require('DLL');
const AttributeStore = artifacts.require('AttributeStore');
const DistributeToken = artifacts.require('DistributeToken');
/*
  deploys and connects contracts
*/

module.exports = function (deployer) {
  deployer.then(function () {
    return deployer.deploy(TokenRegistry)
  }).then(function () {
    return deployer.deploy(ReputationRegistry)
  }).then(function () {
    return deployer.deploy(ProjectRegistry, TokenRegistry.address, ReputationRegistry.address)
  }).then(function () {
    return deployer.deploy(PLCRVoting, TokenRegistry.address, ReputationRegistry.address)
  }).then(function () {
    return deployer.deploy(DistributeToken, TokenRegistry.address)
  }).then(function () {
    return TokenRegistry.deployed()
  }).then(function (instance) {
    return instance.init(DistributeToken.address, ReputationRegistry.address, ProjectRegistry, PLCRVoting.address)
  }).then(function () {
    return ReputationRegistry.deployed()
  }).then(function (instance) {
    return instance.init(TokenRegistry.address, PLCRVoting.address)
  })
}
