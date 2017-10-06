const TokenHolderRegistry = artifacts.require("./TokenHolderRegistry.sol");
const WorkerRegistry = artifacts.require("./WorkerRegistry.sol");
const Project = artifacts.require("./Project.sol");

module.exports = function() {

    // returns deployed TokenHolderRegistry
    this.getTHR = function() {
      return TokenHolderRegistry.deployed();
    }

    // returns deployed WorkerRegistry
    this.getWR = function() {
      return WorkerRegistry.deployed();
    }
}
