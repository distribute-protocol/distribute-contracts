const TokenRegistry = artifacts.require('TokenRegistry')
const DistributeToken = artifacts.require('DistributeToken')
const ProjectRegistry = artifacts.require('ProjectRegistry')
const Project = artifacts.require('Project')
const ProjectLibrary = artifacts.require('ProjectLibrary')

const Promise = require('bluebird')
const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
const evmIncreaseTime = require('../utils/evmIncreaseTime')
web3.eth = Promise.promisifyAll(web3.eth)

contract('Project Proposal', async (accounts) => {
  let projObj = await projectHelper(web3, accounts)
  console.log(projObj, projectHelper)
  let {TR, RR, DT, PR, PL} = projObj.contracts
  let {tokenProposer, repProposer, notProposer} = projObj.user
  let {tokenstoMint} = projObj.minting
  let {stakingPeriod, expiredStakingPeriod, projectCost, ipfsHash, incorrectipfsHash, proposeProportion, proposeReward} = projObj.project
  let PROJ_TR, PROJ_RR

  let totalTokenSupply
  let currentPrice
  let projAddr_TR, projAddr_RR
  let tx
  let errorThrown

  before(async function () {

    async function tokenMinter({contracts, minting, user}) {
      // fund tokenProposer with tokens
      let mintingCost = await contracts.DT.weiRequired(minting.tokensToMint, {from: user.tokenProposer})
      await contracts.DT.mint(minting.tokensToMint, {from: user.tokenProposer, value: mintingCost})

      // fund repProposer with rep

      // check that totalTokenSupply is correct
      let tokenProposerBal = await DT.balanceOf(user.tokenProposer)
      let repProposerBal = await DT.balanceOf(user.repProposer)
      let stakerBalance = await DT.balanceOf(staker)
      totalTokenSupply = await DT.totalSupply()
      assert.equal(2 * tokens, proposerBalance.toNumber() + stakerBalance.toNumber(), 'proposer or staker did not successfully mint tokens')
      assert.equal(2 * tokens, totalTokenSupply, 'total supply did not update correctly')
    }



  })

  it('Proposer can propose project with tokens', async function () {
    currentPrice = await DT.currentPrice()              // put this before propose project because current price changes slightly (rounding errors)
    tx = await TR.proposeProject(projectCost, stakingPeriod, ipfsHash, {from: proposer})
    let proposerTokenCost = Math.floor(Math.floor(projectCost / currentPrice) / proposeProportion)
    let proposerBalance = await DT.balanceOf(proposer)
    assert.equal(2 * tokens, totalTokenSupply, 'total supply shouldn\'t have updated')
    assert.equal(proposerBalance.toNumber(), tokens - proposerTokenCost, 'DT did not set aside appropriate proportion to escrow')
  })

  it('Token registry emits accurate event on project creation', async function() {
    //THIS TEST MUST BE DIRECTLY BELOW "proposer can propose project"
    // let tx = await TR.proposeProject(projectCost, stakingPeriod, {from: proposer})
    let proposerTokenCost = Math.floor(Math.floor(projectCost / currentPrice) / proposeProportion)
    let log = tx.logs[0].args
    projectAddress = log.projectAddress.toString()
    PROJ = await Project.at(projectAddress)
    let storedProposer = await PROJ.proposer()
    assert.equal(proposerTokenCost, log.proposerStake.toNumber(), 'event logged incorrect proposer stake')
    assert.equal(storedProposer, proposer, 'PR stored incorrect proposer address')
  })

  it('Proposer can propose project with reputation', async function () {
  })

 it('Proposer can\'t propose project with staking period that\'s passed'), async function () {

 }

 it('Proposer can\'t propose project with ipfs hash of incorrect length'), async function () {

 }

  it('User can\'t propose project without the required token stake', async function () {
    // propose project & calculate proposer stake
    errorThrown = false
    try {
      await TR.proposeProject(projectCost, stakingPeriod, {from: nonProposer})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('User can\'t propose project without the required reputation stake', async function () {
  })

})
