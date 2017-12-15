// Test functions in proposal state of a project
// Before, fund a user with tokens and have them propose a project

/*
let ethPrice = await getEthPriceNow.getEthPriceNow()
ethPrice = ethPrice[Object.keys(ethPrice)].ETH.USD
console.log(ethPrice)
*/

const TokenRegistry = artifacts.require('TokenRegistry')
const DistributeToken = artifacts.require('DistributeToken')
const ProjectRegistry = artifacts.require('ProjectRegistry')
const Promise = require('bluebird')
const getEthPriceNow = require('get-eth-price')
const assertThrown = require('../utils/assertThrown')
const lightwallet = require('eth-signer')
const waitForTxReceipt = require('./utils/waitForTxReceipt')

//const ethJSABI = require("ethjs-abi")
web3.eth = Promise.promisifyAll(web3.eth)

contract('proposeProject', (accounts) => {
  let TR
  let PR
  let DT
  let proposer = accounts[0]
  let nonProposer = accounts[1]
  let tokens = 10000
  let stakingPeriod = 2000000000
  let projectCost = web3.toWei(1, 'ether')
  let proposeProportion = 20
  let totalTokenSupply
  let totalFreeSupply

  before(async function() {
    // define variables to hold deployed contracts
    TR = await TokenRegistry.deployed()
    DT = await DistributeToken.deployed()
    PR = await ProjectRegistry.deployed()

    // calculate price of 1000 tokens
    let targetPriceVal = await DT.targetPrice(tokens, {from: proposer})
    //console.log('targetPriceVal: ', targetPriceVal.toNumber())
    let mintingCost = await DT.weiRequired(targetPriceVal, tokens, {from: proposer})
    //console.log('mintingCost: ', mintingCost.toNumber())

    // fund proposer with 10000 tokens and make sure they are minted successfully
    await DT.mint(tokens, {from: proposer, value: mintingCost});
    let proposerBalance = await DT.balanceOf(proposer)
    //console.log(mintedTokens.toNumber())
    totalTokenSupply = await DT.totalSupply()
    totalFreeSupply = await DT.totalFreeSupply()
    assert.equal(tokens, proposerBalance, 'proposer did not successfully mint tokens')
    assert.equal(tokens, totalTokenSupply, 'total supply did not update correctly')
    assert.equal(tokens, totalFreeSupply, 'total free supply did not update correctly')
  })

  it('Proposer can propose project', async function() {
    // propose project & calculate proposer stake
    let currentPrice = await DT.currentPrice()              //put this before propose project because current price changes slightly (rounding errors)
    //console.log('current price', currentPrice.toNumber())
    await TR.proposeProject(projectCost, stakingPeriod, {from: proposer})
    let proposerTokenCost = Math.trunc(Math.trunc(projectCost / currentPrice) / proposeProportion)
    //console.log('proposer token cost', proposerTokenCost)
    let proposerBalance = await DT.balanceOf(proposer)
    //console.log('proposer balance', proposerBalance.toNumber())
    totalFreeSupply = await DT.totalFreeSupply()
    assert.equal(tokens - proposerTokenCost, totalFreeSupply.toNumber(), 'total free supply did not update correctly')
    assert.equal(tokens, totalTokenSupply, 'total supply shouldn\'t have updated')
    assert.equal(proposerBalance.toNumber(), tokens - proposerTokenCost, 'DT did not set aside appropriate proportion to escrow')
  })

  it('Non-proposer can\'t propose project', async function() {
    // propose project & calculate proposer stake
    errorThrown = false
    try {
      await TR.proposeProject(projectCost, stakingPeriod, {from: nonProposer})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Token registry emits accurate event on project creation', async function() {
    let currentPrice = await DT.currentPrice()              //put this before propose project because current price changes slightly (rounding errors)
    let tx = await TR.proposeProject(projectCost, stakingPeriod, {from: proposer})
    let proposerTokenCost = Math.trunc(Math.trunc(projectCost / currentPrice) / proposeProportion)
    let log = tx.logs[0].args
    let newProjectAddress = log.projectAddress.toString()
    let storedProposer = await PR.getProposerAddress(newProjectAddress)
    //console.log(storedProposer)
    assert.equal(proposerTokenCost, log.proposerStake.toNumber(), 'event logged incorrect proposer stake')
    assert.equal(storedProposer, proposer, 'PR stored incorrect proposer address')
  })

// write out what happens in each flow so we know what to test


})
