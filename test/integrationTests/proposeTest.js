// Test functions in proposal state of a project
// Before, fund a user with tokens and have them propose a project

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//TO DO STILL:
//
// test a project that is proposed but fails to be staked (stakers receive stakes back, proposer doesn't)
// also have to do reputation stake testing
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
let ethPrice = await getEthPriceNow.getEthPriceNow()
ethPrice = ethPrice[Object.keys(ethPrice)].ETH.USD
console.log(ethPrice)
*/

const TokenRegistry = artifacts.require('TokenRegistry')
const DistributeToken = artifacts.require('DistributeToken')
const ProjectRegistry = artifacts.require('ProjectRegistry')
const Project = artifacts.require('Project')
const Promise = require('bluebird')
const getEthPriceNow = require('get-eth-price')
const assertThrown = require('../utils/AssertThrown')
const lightwallet = require('eth-signer')
const waitForTxReceipt = require('../utils/waitForTxReceipt')
//const ethJSABI = require("ethjs-abi")
web3.eth = Promise.promisifyAll(web3.eth)

contract('Proposed State', (accounts) => {
  let TR
  let PR
  let DT
  let PROJ
  let proposer = accounts[0]
  let nonProposer = accounts[1]
  let staker = accounts[2]
  let nonStaker = accounts[3]
  let notAProject = accounts[4]
  let tokens = 10000
  let stakingPeriod = 20000000000     //10/11/2603 @ 11:33am (UTC)
  let stakingPeriodFail = 10          //January 1st, 1970
  let projectCost = web3.toWei(1, 'ether')
  let proposeProportion = 20
  let proposeReward = 100
  let totalTokenSupply
  let totalFreeSupply
  let currentPrice
  let projectAddress
  let tx

  before(async function() {
    // define variables to hold deployed contracts
    TR = await TokenRegistry.deployed()
    DT = await DistributeToken.deployed()
    PR = await ProjectRegistry.deployed()

    // calculate price of 1000 tokens
    let mintingCost = await DT.weiRequired(tokens, {from: proposer})
    //console.log('mintingCost: ', mintingCost.toNumber())
    // fund proposer with 10000 tokens and make sure they are minted successfully
    await DT.mint(tokens, {from: proposer, value: mintingCost});
    mintingCost = await DT.weiRequired(tokens, {from: staker})
    //console.log('mintingCost: ', mintingCost.toNumber())
    // fund staker with 10000 tokens and make sure they are minted successfully
    await DT.mint(tokens, {from: staker, value: mintingCost})
    let proposerBalance = await DT.balanceOf(proposer)
    let stakerBalance = await DT.balanceOf(staker)
    totalTokenSupply = await DT.totalSupply()
    totalFreeSupply = await DT.totalFreeSupply()
    assert.equal(2 * tokens, proposerBalance.toNumber() + stakerBalance.toNumber(), 'proposer or staker did not successfully mint tokens')
    assert.equal(2 * tokens, totalTokenSupply, 'total supply did not update correctly')
    assert.equal(2 * tokens, totalFreeSupply, 'total free supply did not update correctly')
  })

  it('Proposer can propose project', async function() {
    // propose project & calculate proposer stake
    currentPrice = await DT.currentPrice()              //put this before propose project because current price changes slightly (rounding errors)
    //console.log('current price', currentPrice.toNumber())
    tx = await TR.proposeProject(projectCost, stakingPeriod, {from: proposer})
    let proposerTokenCost = Math.floor(Math.floor(projectCost / currentPrice) / proposeProportion)
    //console.log('proposer token cost', proposerTokenCost)
    let proposerBalance = await DT.balanceOf(proposer)
    //console.log('proposer balance', proposerBalance.toNumber())
    totalFreeSupply = await DT.totalFreeSupply()
    assert.equal(2 * tokens - proposerTokenCost, totalFreeSupply, 'total free supply did not update correctly')
    assert.equal(2 * tokens, totalTokenSupply, 'total supply shouldn\'t have updated')
    assert.equal(proposerBalance, tokens - proposerTokenCost, 'DT did not set aside appropriate proportion to escrow')
  })

  it('Token registry emits accurate event on project creation', async function() {
    //THIS TEST MUST BE DIRECTLY BELOW "proposer can propose project"
    //let tx = await TR.proposeProject(projectCost, stakingPeriod, {from: proposer})
    let proposerTokenCost = Math.floor(Math.floor(projectCost / currentPrice) / proposeProportion)
    let log = tx.logs[0].args
    projectAddress = log.projectAddress.toString()
    PROJ = await Project.at(projectAddress)
    let storedProposer = await PR.getProposerAddress(projectAddress)
    //console.log(storedProposer)
    assert.equal(proposerTokenCost, log.proposerStake, 'event logged incorrect proposer stake')
    assert.equal(storedProposer, proposer, 'PR stored incorrect proposer address')
  })

  it('User can\'t propose project without the required token stake', async function() {
    // propose project & calculate proposer stake
    errorThrown = false
    try {
      await TR.proposeProject(projectCost, stakingPeriod, {from: nonProposer})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('User can stake tokens on a proposed project below the required ether amount', async function() {
    let requiredTokens = Math.ceil(projectCost / await DT.currentPrice())
    //console.log('required tokens', requiredTokens)
    let stakerBalanceBefore = await DT.balanceOf(staker)
    let freeTokensBefore = await DT.totalFreeSupply()
    //console.log('staker token balance', stakerBalanceBefore.toNumber())
    await TR.stakeTokens(projectAddress, requiredTokens - 1, {from: staker})
    let stakedTokens = await PROJ.totalTokensStaked()
    let isStaker = await PROJ.isStaker(staker)
    //console.log('staked tokens', stakedTokens.toNumber())
    let stakerBalanceAfter = await DT.balanceOf(staker)
    let freeTokensAfter = await DT.totalFreeSupply()
    let stakedBalance = await PROJ.stakedTokenBalances(staker)
    let state = await PROJ.state()
    let weiCost = await PROJ.weiCost()
    let weiBal = await PROJ.weiBal()
    assert.equal(stakedTokens.toNumber(), requiredTokens - 1, 'did not successfully stake tokens')
    assert.equal(stakerBalanceAfter, stakerBalanceBefore - requiredTokens + 1, 'staker balance does not change correctly')
    assert.equal(freeTokensAfter, freeTokensBefore - requiredTokens + 1, 'free token supply does not change correctly')
    assert.isTrue(isStaker, 'contract incorrectly reports that staker is not a staker')
    assert.equal(stakedBalance, requiredTokens - 1, 'staked balance did not update in project contract')
    assert.equal(state.toNumber(), 1, 'project should still be in proposed state')
    assert.isBelow(weiBal.toNumber(), weiCost.toNumber(), 'project has more wei than it should')
  })

  it('staker can unstake tokens', async function() {
    let stakedTokensBefore = await PROJ.totalTokensStaked()
    let stakerBalanceBefore = await DT.balanceOf(staker)
    let freeTokensBefore = await DT.totalFreeSupply()
    let stakedBalanceBefore = await PROJ.stakedTokenBalances(staker)
    //console.log('staker token balance', stakerBalanceBefore.toNumber())
    await TR.unstakeTokens(projectAddress, 1, {from: staker})
    let stakedTokensAfter = await PROJ.totalTokensStaked()
    //console.log('staked tokens', stakedTokens.toNumber())
    let stakerBalanceAfter = await DT.balanceOf(staker)
    let freeTokensAfter = await DT.totalFreeSupply()
    let stakedBalanceAfter = await PROJ.stakedTokenBalances(staker)
    let state = await PROJ.state()
    let weiCost = await PROJ.weiCost()
    let weiBal = await PROJ.weiBal()
    assert.equal(stakedTokensAfter, stakedTokensBefore - 1, 'did not successfully stake tokens')
    assert.equal(stakerBalanceAfter, stakerBalanceBefore.toNumber() + 1, 'staker balance does not change correctly')
    assert.equal(freeTokensAfter, freeTokensBefore.toNumber() + 1, 'free token supply does not change correctly')
    assert.equal(stakedBalanceAfter, stakedTokensBefore.toNumber() - 1, 'staked balance did not update in project contract')
    assert.equal(state.toNumber(), 1, 'project should still be in proposed state')
    assert.isBelow(weiBal.toNumber(), weiCost.toNumber(), 'project has more wei than it should')
  })

  it('Non-staker can\'t unstake tokens', async function() {
    errorThrown = false
    try {
      await TR.unstakeTokens(projectAddress, 1, {from: nonStaker})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('User can\'t stake tokens they don\'t have', async function() {
    errorThrown = false
    try {
      await TR.stakeTokens(projectAddress, 1, {from: nonStaker})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Refund proposer can\'t be called while still in propose period', async function() {
    errorThrown = false
    try {
      await TR.refundProposer(projectAddress, {from: proposer})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('User can stake extra tokens on a proposed project but only the required amount of wei is sent', async function() {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //NOTE! If a staker overstakes, that is their fault! Those tokens will be locked up and treated as staked tokens.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    let weiCost = await PROJ.weiCost()
    //console.log('wei cost', weiCost.toNumber())
    let weiBal = await PROJ.weiBal()
    projectWeiBal = weiBal;
    let weiNeeded = weiCost - weiBal
    //console.log('wei needed', weiNeeded)
    let requiredTokens = Math.ceil(weiNeeded / await DT.currentPrice())   //need next largest whole token
    //console.log('required tokens', requiredTokens)
    let stakedTokensBefore = await PROJ.totalTokensStaked()
    let stakerBalanceBefore = await DT.balanceOf(staker)
    //console.log('staker balance before', stakerBalanceBefore.toNumber())
    let freeTokensBefore = await DT.totalFreeSupply()
    let stakedBalanceBefore = await PROJ.stakedTokenBalances(staker)
    await TR.stakeTokens(projectAddress, requiredTokens + 1, {from: staker})      //stake one extra token
    let stakedTokensAfter = await PROJ.totalTokensStaked()
    //console.log('staked tokens', stakedTokens.toNumber())
    let stakerBalanceAfter = await DT.balanceOf(staker)
    let freeTokensAfter = await DT.totalFreeSupply()
    let stakedBalanceAfter = await PROJ.stakedTokenBalances(staker)
    let state = await PROJ.state()
    let newWeiBal = await PROJ.weiBal()
    //console.log('wei bal', newWeiBal.toNumber())
    assert.equal(stakedTokensAfter.toNumber(), stakedTokensBefore.toNumber() + requiredTokens + 1, 'did not successfully stake tokens')
    assert.equal(stakerBalanceAfter.toNumber(), stakerBalanceBefore.toNumber() -requiredTokens - 1, 'staker balance does not change correctly')
    assert.equal(freeTokensAfter.toNumber(), freeTokensBefore.toNumber() - requiredTokens - 1, 'free token supply does not change correctly')
    assert.equal(stakedBalanceAfter.toNumber(), stakedBalanceBefore.toNumber() + requiredTokens + 1, 'staked balance did not update in project contract')
    assert.equal(state.toNumber(), 2, 'project should be in open state as it is now fully staked')
    assert.equal(weiCost.toNumber(), newWeiBal.toNumber(), 'project was not funded exactly')
  })

  it('A staker can no longer call unstake token once in the open period', async function() {
    errorThrown = false
    try {
      await TR.unstakeTokens(1, {from: staker})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Refund proposer works after a project is fully staked', async function() {
    // let proposer = await PR.getProposerAddress(projectAddress)
    // console.log('proposer address', proposer)
    // console.log(proposer)
    let weiBalBefore = await DT.weiBal();
    await TR.refundProposer(projectAddress, {from: proposer})
    let weiBalAfter = await DT.weiBal();
    let proposerStake = await PR.proposedProjects.call(projectAddress)
    //console.log(proposerStake)
    assert.equal(weiBalBefore - weiBalAfter, Math.floor(projectCost/proposeReward), 'incorrect propose reward was sent')
    assert.equal(proposerStake[1].toNumber(), 0, 'proposer stake unsuccessfully reset in PR')
  })

  it('User can\'t stake tokens on nonexistant project', async function() {
    errorThrown = false
    try {
      await TR.stakeTokens(notAProject, 1, {from: staker})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Non-proposer can\'t call refund proposer', async function() {
    errorThrown = false
    try {
      await TR.refundProposer(projectAddress, {from: nonProposer})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Proposer can\'t refund proposer multiple times', async function() {
    errorThrown = false
    try {
      await TR.refundProposer(projectAddress, {from: proposer})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('can\'t propose a project whose staking deadline has passed', async function() {
    errorThrown = false
    try {
      await TR.proposeProject(1, stakingPeriodFail, {from: proposer})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })



})
