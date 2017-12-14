// Test functions in proposal state of a project
// Before, fund a user with tokens and have them propose a project

/*
let ethPrice = await getEthPriceNow.getEthPriceNow()
ethPrice = ethPrice[Object.keys(ethPrice)].ETH.USD
console.log(ethPrice)
*/

const TokenRegistry = artifacts.require('TokenRegistry')
const ReputationRegistry = artifacts.require('ReputationRegistry')
const DistributeToken = artifacts.require('DistributeToken')
const Promise = require('bluebird')
const getEthPriceNow = require('get-eth-price')
//const ethJSABI = require("ethjs-abi")
web3.eth = Promise.promisifyAll(web3.eth)

contract('proposeProject', (accounts) => {
  let TR
  let RR
  let DT
  let proposer = accounts[0]
  let not_proposer = accounts[1]
  let tokens = 10000
  let stakingPeriod = 2000000000
  let projectCost = web3.toWei(1, 'ether')
  let proposeProportion = 20

  before(async function() {
    // define variables to hold deployed contracts
    TR = await TokenRegistry.deployed()
    RR = await ReputationRegistry.deployed()
    DT = await DistributeToken.deployed()

    // calculate price of 1000 tokens
    let targetPriceVal = await DT.targetPrice(tokens, {from: proposer})
    //console.log('targetPriceVal: ', targetPriceVal.toNumber())
    let mintingCost = await DT.weiRequired(targetPriceVal, tokens, {from: proposer})
    //console.log('mintingCost: ', mintingCost.toNumber())

    // fund proposer with 10000 tokens and make sure they are minted successfully
    await DT.mint(tokens, {from: proposer, value: mintingCost});
    let mintedTokens = await DT.balances(proposer)
    //console.log(mintedTokens.toNumber())
    assert.equal(tokens, mintedTokens, 'proposer did not successfully mint tokens')
  })

  it('Proposer can propose project', async function() {
    // propose project & calculate proposer stake
    await TR.proposeProject(projectCost, stakingPeriod, {from: proposer})
    let currentPrice = await DT.currentPrice()
    let proposerTokenCost = Math.floor(Math.floor(projectCost / currentPrice) / proposeProportion)
    let proposerTokenBalance = await DT.balances(proposer)
    console.log(proposerTokenBalance.toNumber())
    assert.equal(proposerTokenBalance, tokens - proposerTokenCost, 'DT did not set aside appropriate proportion to escrow')
  })

  it('Non-proposer cannot propose project', async function() {
    // propose project & calculate proposer stake
    await TR.proposeProject(projectCost, stakingPeriod, {from: proposer})
    let currentPrice = await DT.currentPrice()
    let proposerTokenCost = Math.floor(Math.floor(projectCost / currentPrice) / proposeProportion)
    let proposerTokenBalance = await DT.balances(proposer)
    console.log(proposerTokenBalance.toNumber())
    assert.equal(proposerTokenBalance, tokens - proposerTokenCost, 'DT did not set aside appropriate proportion to escrow')
  })


})
