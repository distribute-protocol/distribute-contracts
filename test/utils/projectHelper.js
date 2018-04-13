const TokenRegistry = artifacts.require('TokenRegistry')
const ReputationRegistry = artifacts.require('ReputationRegistry')
const DistributeToken = artifacts.require('DistributeToken')
const ProjectRegistry = artifacts.require('ProjectRegistry')
const ProjectLibrary = artifacts.require('ProjectLibrary')

const evmIncreaseTime = require('./evmIncreaseTime')

module.exports = async function projectHelper (web3, accounts) {
  let obj = {}
  obj.user = {}
  obj.minting = {}
  obj.reputation = {}
  obj.project = {}
  obj.contracts = {}
  obj.returnProject = {}

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

  // mutable minting details for each user
  obj.minting.tokensToMint = 100000

  // immutable registration reputation amount
  obj.reputation.registeredRep = 10000

  // mutable project details
  obj.project.now = new Date().getTime() / 1000                             // in seconds
  obj.project.stakingPeriod = Math.floor(obj.project.now + 604800)          // blockchain understands seconds                    // one week from now
  obj.project.expiredStakingPeriod = 10                                     // January 1st, 1970
  obj.project.projectCost = parseInt(web3.toWei(0.5, 'ether'))
  obj.project.ipfsHash = 'ipfsHashlalalalalalalalalalalalalalalalalalala'   // length == 46
  obj.project.incorrectIpfsHash = 'whyiseveryspokeleadawhiteman'            // length != 46

  // immutable project details
  obj.project.proposeProportion = 20
  obj.project.proposeReward = 100

  // contracts
  obj.contracts.TR = await TokenRegistry.deployed()
  obj.contracts.RR = await ReputationRegistry.deployed()
  obj.contracts.DT = await DistributeToken.deployed()
  obj.contracts.PR = await ProjectRegistry.deployed()
  obj.contracts.PL = await ProjectLibrary.deployed()

  // helper functions
  obj.mint = async function (_user, _numTokens) {
    if (_numTokens === undefined) {                // use default minting amount
      _numTokens = obj.minting.tokensToMint
    }
    let mintingCost = await obj.contracts.DT.weiRequired(_numTokens, {from: _user})
    await obj.contracts.DT.mint(_numTokens, {from: _user, value: mintingCost})
  }

  obj.register = async function (_user) {
    await obj.contracts.RR.register({from: _user})
  }

  // getters
  obj.getTokenBalance = async function (_user) {
    let bal = await obj.contracts.DT.balanceOf(_user)
    return bal.toNumber()
  }

  obj.getRepBalance = async function (_user) {
    let bal = await obj.contracts.RR.balances(_user)
    return bal.toNumber()
  }

  obj.getTotalTokens = async function () {
    let total = await obj.contracts.DT.totalSupply()
    return total.toNumber()
  }

  obj.getTotalRep = async function () {
    let total = await obj.contracts.RR.totalSupply()
    return total.toNumber()
  }

  obj.getWeiBal = async function () {
    let weiBal = await obj.contracts.DT.weiBal()
    return weiBal.toNumber()
  }

  // project return functions
  // return project (address) proposed by token holder
  obj.returnProject.proposed_T = async function (_cost, _stakingPeriod, _ipfsHash) {
    if (_cost === undefined) {
      _cost = obj.project.projectCost             // use default project cost
    }
    if (_stakingPeriod === undefined) {
      _stakingPeriod = obj.project.stakingPeriod  // use default staking period
    }
    if (_ipfsHash === undefined) {
      _ipfsHash = obj.project.ipfsHash            // use default staking period
    }
    let currentPrice = await obj.contracts.DT.currentPrice()              // put this before propose project because current price changes slightly (rounding errors)
    let proposerTokenCost = Math.floor(Math.floor(_cost / currentPrice) / obj.project.proposeProportion)
    await obj.mint(obj.user.tokenProposer, proposerTokenCost)
    let tx = await obj.contracts.TR.proposeProject(_cost, _stakingPeriod, _ipfsHash, {from: obj.user.tokenProposer})
    let log = tx.logs[0].args
    return log.projectAddress.toString()
  }

  // return project (address) proposed by reputation holder
  obj.returnProject.proposed_R = async function (_cost, _stakingPeriod, _ipfsHash) {
    if (_cost === undefined) {
      _cost = obj.project.projectCost             // use default project cost
    }
    if (_stakingPeriod === undefined) {
      _stakingPeriod = obj.project.stakingPeriod  // use default staking period
    }
    if (_ipfsHash === undefined) {
      _ipfsHash = obj.project.ipfsHash            // use default staking period
    }
    await obj.register(obj.user.repProposer)
    let tx = await obj.contracts.RR.proposeProject(_cost, _stakingPeriod, _ipfsHash, {from: obj.user.repProposer})
    let log = tx.logs[0].args
    return log.projectAddress.toString()
  }

  // return project (address) proposed and only staked by 2 token holders
  obj.returnProject.staked_T = async function (_cost, _stakingPeriod, _ipfsHash) {
    let projAddr = await obj.returnProject.proposed_T(_cost, _stakingPeriod, _ipfsHash)
  }

  // return project (address) proposed by token holder and staked by 2 of each
  obj.returnProject.staked_TR = async function () {

  }

  // return project (address) proposed by reputation holder and staked by 2 of each
  obj.returnProject.staked_RT = async function () {

  }

  return obj
}
