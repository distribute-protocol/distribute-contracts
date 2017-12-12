const TokenRegistry = artifacts.require('./TokenRegistry.sol')
const ReputationRegistry = artifacts.require('./ReputationRegistry.sol')
const ProjectRegistry = artifacts.require('./ProjectRegistry.sol')
const DistributeToken = artifacts.require('./DistributeToken.sol')
const Project = artifacts.require('./Project.sol')

module.exports = function () {
    // returns deployed TokenHolderRegistry
  this.getTR = function () {
    return TokenRegistry.deployed()
  }
    // returns deployed WorkerRegistry
  this.getRR = function () {
    return ReputationRegistry.deployed()
  }

  this.getPR = function () {
    return ProjectRegistry.deployed()
  }

  this.getDT = function () {
    return DistributeToken.deployed()
  }

  this.project = function () {
    return Project.deployed()
  }
}
