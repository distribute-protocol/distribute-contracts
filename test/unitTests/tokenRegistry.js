/*
proposedProject
refundProposer
stakeTokens
unstakeTokens
validate
voteCommit
voteReveal
refundVotingTokens
burnTokens
refundStaker
rewardValidator
transferWeiReward
*/

const Project = artifacts.require('Project')
const TokenRegistry = artifacts.require('TokenRegistry')
const ReputationRegistry = artifacts.require('ReputationRegistry')
const ProjectRegistry = artifacts.require('ProjectRegistry')
const DistributeToken = artifacts.require('DistributeToken')
const evmIncreaseTime = require('../utils/evmIncreaseTime')
const Promise = require('bluebird')
web3.eth = Promise.promisifyAll(web3.eth)
const assertThrown = require('../utils/AssertThrown')

contract('TokenRegistry', function (accounts) {
  let DT, TR, RR, PR, spoofedP
  let spoofedTRaddress = accounts[7]
  let spoofedPRaddress = accounts[4]
  let projectCost = web3.toWei(1, 'ether')
  let proposeProportion = 20
  let stakingPeriod = 20000000000

  // let spoofedRRaddress = accounts[8]

  let tokens = 10000
  let proposer = accounts[0]
  let staker2 = accounts[5]
  let repStaker = accounts[6]
  let nonStaker = accounts[3]
  before(async function () {
    TR = await TokenRegistry.deployed()
    RR = await ReputationRegistry.deployed()
    PR = await ProjectRegistry.deployed()
    DT = await DistributeToken.deployed()
    DT.mint(10000, {value: web3.toWei(5, 'ether'), from: proposer})
    // P = await Project.new(projectCost, proposeProportion, stakingPeriod, RR.address, TR.address, {from: spoofedPRaddress})
    // spoofedP = await Project.new(projectCost, proposeProportion, stakingPeriod, RR.address, spoofedTRaddress, {from: spoofedPRaddress})
  })

  it('proposes a project', async () => {
    TR.proposeProject(web3.toWei(1, 'ether'), stakingPeriod, {from: proposer});
    await TR.ProjectCreated(async (error, result) => {
      if (!error) {
        console.log(result)
        // assert.equal(result.args.staker, staker, "doesn't log the correct staker succeeds")
        // assert.equal(result.args.refund.toNumber(), (tokens * 2), "doesn't log the correct refund value succeeds")
      }
    })
    // await spoofedP.stakeTokens(staker, tokens, web3.toWei(0.5, 'ether'), {from: spoofedTRaddress})
    // let tokenBalance = await spoofedP.stakedTokenBalances(staker)
    // let totalTokenBalance = await spoofedP.totalTokensStaked.call()
    // let weiBal = await spoofedP.weiBal.call()
    // assert.equal(tokenBalance, tokens, "doesn't stake tokens to correctly")
    // assert.equal(totalTokenBalance, tokens, "doesn't update total token supply correctly")
    // assert.equal(weiBal, web3.toWei(0.5, 'ether'), "doesn't update balance correctly")
  })

})
