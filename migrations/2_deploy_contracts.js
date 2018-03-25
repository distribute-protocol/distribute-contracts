const TokenRegistry = artifacts.require('TokenRegistry')
const ReputationRegistry = artifacts.require('ReputationRegistry')
const ProjectRegistry = artifacts.require('ProjectRegistry')
const Project = artifacts.require('Project')
const PLCRVoting = artifacts.require('PLCRVoting')
const DistributeToken = artifacts.require('DistributeToken')
const ProjectLibrary = artifacts.require('ProjectLibrary')
const Division = artifacts.require('library/Division')
const Task = artifacts.require('Task')

/*
  deploys and connects contracts
*/

module.exports = function (deployer) {
  deployer.then(async () => {
    await deployer.deploy(Division)
    await deployer.link(Division, [DistributeToken, ProjectLibrary, ProjectRegistry, ReputationRegistry, TokenRegistry, Project])
    await deployer.deploy(ProjectLibrary)
    await deployer.link(ProjectLibrary, [TokenRegistry, ReputationRegistry, ProjectRegistry])
    await deployer.deploy(TokenRegistry)
    await deployer.deploy(ReputationRegistry)
    await deployer.deploy(Task)
    await deployer.deploy(Project)

    // await deployer.deploy(Task, '0', TokenRegistry.address, ReputationRegistry.address)
    // await deployer.deploy(Project, 0, 0, 0, '0x0', 0, 0, 'ipfsHash', ReputationRegistry.address, TokenRegistry.address)
    await deployer.deploy(ProjectRegistry)
    await deployer.deploy(DistributeToken, TokenRegistry.address, ReputationRegistry.address)
    await deployer.deploy(PLCRVoting, TokenRegistry.address, ReputationRegistry.address, ProjectRegistry.address)

    let PRInstance = await ProjectRegistry.deployed()
    let TRInstance = await TokenRegistry.deployed()
    let RRInstance = await ReputationRegistry.deployed()
    return Promise.all([
      PRInstance.init(DistributeToken.address, TokenRegistry.address, ReputationRegistry.address, PLCRVoting.address, Project.address, Task.address),
      TRInstance.init(DistributeToken.address, ProjectRegistry.address, PLCRVoting.address),
      RRInstance.init(DistributeToken.address, ProjectRegistry.address, PLCRVoting.address)
    ])
  })
}
