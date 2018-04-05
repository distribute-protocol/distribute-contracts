const TokenRegistry = artifacts.require('TokenRegistry')
const ReputationRegistry = artifacts.require('ReputationRegistry')
const DistributeToken = artifacts.require('DistributeToken')
const ProjectRegistry = artifacts.require('ProjectRegistry')
const ProjectLibrary = artifacts.require('ProjectLibrary')

export default async function projectHelper (web3, accounts) {
  let obj = {}
  obj.user = {}
  obj.minting = {}
  obj.project = {}
  obj.contracts = {}

  // set up user identities
  // accounts[0] - tokens
  // accounts[1] - both
  // accounts[2] - tokens
  // accounts[3] - rep
  // accounts[4] - rep
  // accounts[5] - rep
  // accounts[6] - rep
  // accounts[7] - nothing

  obj.user.tokenProposer = accounts[0]
  obj.user.repProposer = accounts[1]
  obj.user.notProposer = accounts[7]

  obj.user.tokenStaker1 = accounts[1]
  obj.user.tokenStaker2 = accounts[2]
  obj.user.repStaker1 = accounts[3]
  obj.user.repStaker2 = accounts[4]
  obj.user.notStaker = accounts[7]

  obj.user.worker1 = accounts[5]
  obj.user.worker2 = accounts[6]
  obj.user.notWorker = accounts[7]

  obj.user.validator1 = accounts[0]
  obj.user.validator2 = accounts[1]
  obj.user.notValidator = accounts[7]

  obj.user.repVoter = accounts[3]
  obj.user.tokenVoter = accounts[2]
  obj.user.notVoter = accounts[7]

  obj.user.notProject = accounts[7]

  // minting details
  obj.minting.tokensToMint = 10000

  // project details
  obj.project.stakingPeriod = 20000000000     // 10/11/2603 @ 11:33am (UTC)
  obj.project.expiredStakingPeriod = 10       // January 1st, 1970
  obj.project.projectCost = web3.toWei(1, 'ether')
  obj.project.ipfsHash = 'ipfsHashlalalalalalalalalalalalalalalalalalala'
  obj.project.incorrectipfsHash = 'whyiseveryspokeleadawhiteman'
  obj.project.proposePropostion = 20
  obj.project.proposeReward = 100

  // contracts
  obj.contracts.TR = await TokenRegistry.deployed()
  obj.contracts.RR = await ReputationRegistry.deployed()
  obj.contracts.DT = await DistributeToken.deployed()
  obj.contracts.PR = await ProjectRegistry.deployed()
  obj.contracts.PL = await ProjectLibrary.deployed()

  return obj
}
