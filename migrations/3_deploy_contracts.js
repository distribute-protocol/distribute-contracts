/* global artifacts */

const TokenRegistry = artifacts.require('TokenRegistry')
const ReputationRegistry = artifacts.require('ReputationRegistry')
const ProjectRegistry = artifacts.require('ProjectRegistry')
const Project = artifacts.require('Project')
const PLCRVoting = artifacts.require('PLCRVoting')
const HyphaToken = artifacts.require('HyphaToken')
const ProjectLibrary = artifacts.require('ProjectLibrary')
const Task = artifacts.require('Task')

/*
  deploys and connects contracts
*/

module.exports = async function (deployer) {
  // await deployer.deploy(Division)
  // await deployer.link(Division, [HyphaToken, ProjectLibrary, ProjectRegistry, ReputationRegistry, TokenRegistry, Project])
  await deployer.deploy(ProjectLibrary)
  await deployer.link(ProjectLibrary, [TokenRegistry, ReputationRegistry, ProjectRegistry])
  await deployer.deploy(TokenRegistry)
  await deployer.deploy(ReputationRegistry)
  await deployer.deploy(Task)
  await deployer.deploy(Project)

  await deployer.deploy(ProjectRegistry)
  await deployer.deploy(HyphaToken, TokenRegistry.address, ReputationRegistry.address)
  await deployer.deploy(PLCRVoting, TokenRegistry.address, ReputationRegistry.address, ProjectRegistry.address)

  let PRInstance = await ProjectRegistry.deployed()
  let TRInstance = await TokenRegistry.deployed()
  let RRInstance = await ReputationRegistry.deployed()

  await PRInstance.init(HyphaToken.address, TokenRegistry.address, ReputationRegistry.address, PLCRVoting.address, Project.address, Task.address)
  await TRInstance.init(HyphaToken.address, ProjectRegistry.address, PLCRVoting.address)
  await RRInstance.init(HyphaToken.address, ProjectRegistry.address, PLCRVoting.address)
}
