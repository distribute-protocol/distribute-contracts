/* eslint-env mocha */
/* global assert contract artifacts */

const DistributeToken = artifacts.require('DistributeToken')

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/AssertThrown')

contract('DistributeToken', function (accounts) {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let DT
  let {spoofedDT, TR, RR, tokenProposer} = projObj.user
  let {tokensToMint, tokensToBurn} = projObj.minting
  let {utils} = projObj

  // local test variables
  let errorThrown

  before(async function () {
    // get contracts
    await projObj.contracts.setContracts()
    DT = projObj.contracts.DT

    // set up spoofedDT with correct TR & RR address
    spoofedDT = await DistributeToken.new(TR.address, RR.address)
  })

  it('correctly returns baseCost as the current price when no tokens are available', async () => {
    // current price, base cost getters
    let currentPrice = await utils.getCurrentPrice()
    let baseCost = await utils.getBaseCost()

    // checks
    assert.equal(currentPrice, baseCost, 'currPrice not returned correctly')
  })

  it('returns the correct wei required when no tokens have been minted', async () => {
    // wei required getters
    let weiRequiredFunc = await utils.getWeiRequired(tokensToMint)
    let weiRequiredCalc = await utils.calculateWeiRequired(tokensToMint)

    // checks
    assert.equal(weiRequiredFunc, weiRequiredCalc, 'weiRequired not returned correctly')
  })

  it('mints tokens', async () => {
    // take stock of variables before
    let weiRequired = await utils.getWeiRequired(tokensToMint)
    let totalSupplyBefore = await utils.getTotalTokens()
    let weiPoolBalBefore = await utils.getWeiPoolBal()
    let tpBalBefore = await utils.getTokenBalance(tokenProposer)

    // mint tokensToMint tokens with weiRequired amount of ether
    await utils.mint(tokenProposer, tokensToMint, weiRequired)

    // take stock of variables after
    let totalSupplyAfter = await utils.getTotalTokens()
    let weiPoolBalAfter = await utils.getWeiPoolBal()
    let tpBalAfter = await utils.getTokenBalance(tokenProposer)

    // checks
    assert.equal(totalSupplyBefore, 0, 'there should be no tokens in existence before minting')
    assert.equal(weiPoolBalBefore, 0, 'there should be no wei in the DT pool before minting')
    assert.equal(tpBalBefore, 0, 'there should be no tokens in tokenProposer\'s balance before minting')
    assert.equal(totalSupplyAfter, tokensToMint, 'there should be tokensToMint tokens in existence after minting')
    assert.equal(weiPoolBalAfter, weiRequired, 'there should be weiRequired wei in the DT pool after minting')
    assert.equal(tpBalAfter, tokensToMint, 'there should be tokensToMint tokens in tokenProposer\'s balance after minting')
  })

  it('returns the correct wei required when tokens are available', async () => {
    // wei required getters
    let weiRequiredFunc = await utils.getWeiRequired(tokensToMint)
    let weiRequiredCalc = await utils.calculateWeiRequired(tokensToMint)

    // checks
    assert.equal(weiRequiredFunc, weiRequiredCalc, 'weiRequired not returned correctly')
  })

  it('correctly returns the current price when tokens are available', async () => {
    // current price getters
    let currentPriceFunc = await utils.getCurrentPrice()
    let currentPriceCalc = await utils.calculateCurrentPrice()

    // checks
    assert.equal(currentPriceFunc, currentPriceCalc, 'currPrice not returned correctly')
  })

  it('sells tokens', async () => {
    // take stock of variables before
    let burnVal = await utils.getBurnPrice(tokensToBurn)
    let totalSupplyBefore = await utils.getTotalTokens()
    let weiPoolBalBefore = await utils.getWeiPoolBal()
    let tpBalBefore = await utils.getTokenBalance(tokenProposer)

    // burn tokensToMint tokens with weiRequired amount of ether
    await utils.sell(tokenProposer, tokensToBurn)

    // take stock of variables after
    let totalSupplyAfter = await utils.getTotalTokens()
    let weiPoolBalAfter = await utils.getWeiPoolBal()
    let tpBalAfter = await utils.getTokenBalance(tokenProposer)

    // checks
    assert.equal(totalSupplyBefore - totalSupplyAfter, tokensToBurn, 'incorrectly updated total supply')
    assert.equal(weiPoolBalBefore - weiPoolBalAfter, burnVal, 'incorrectly updated DT\'s weiBal')
    assert.equal(tpBalBefore - tpBalAfter, tokensToBurn, 'incorrectly updated tokenProposer\'s balance')
  })

  it('allows tokenRegistry to burn tokens', async () => {
    await spoofedDT.mint(tokensToMint, {from: TR.address})
    spoofedDT.mint(tokens, {from: TR.address, value: weiRequired})
    await spoofedDT.burn(tokens)
    let totalSupply = await spoofedDT.totalSupply.call()
    assert.equal(totalSupply, 0, "doesn't burn tokens correctly")
  })

  it('only allows the tokenRegistry to call burn', async () => {
    let errorThrown = false
    try {
      await DT.burn(10)
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('allows tokenRegistry to call transferWeiTo', async () => {
    let weiRequired = await spoofedDT.weiRequired(tokens)
    await spoofedDT.transferWeiTo(account1, weiRequired)
    let weiBal = await spoofedDT.weiBal()
    assert.equal(weiBal, 0, "doesn't transfer wei correctly")
  })

  it('only allows the tokenRegistry to call transferWeiTo', async () => {
    let errorThrown = false
    try {
      await DT.transferWeiTo(account1, web3.toWei(3, 'ether'))
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('allows tokenRegistry to call returnWei', async () => {
    // let weiRequired = await spoofedDT.weiRequired(tokens)
    await spoofedDT.returnWei(1000)
    let weiBal = await spoofedDT.weiBal()
    assert.equal(weiBal, 1000, "doesn't transfer wei correctly")
  })

  it('only allows the tokenRegistry to call returnWei', async () => {
    let errorThrown = false
    try {
      await DT.returnWei(1000)
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('allows tokenRegistry to call transferToEscrow', async () => {
    spoofedDT = await DistributeToken.new(accounts[0], accounts[3])
    let weiRequired = await spoofedDT.weiRequired(tokens)
    await spoofedDT.mint(tokens, {from: account1, value: weiRequired})
    await spoofedDT.transferToEscrow(account1, tokens)
    let totalSupply = await spoofedDT.totalSupply.call()
    let balance = await spoofedDT.balanceOf(account1)
    assert.equal(totalSupply, tokens, "doesn't maintain supply correctly")
    assert.equal(balance, 0, "doesn't update balance correctly")
  })

  it('only allows the tokenRegistry to call transferToEscrow', async () => {
    let errorThrown = false
    try {
      await DT.transferToEscrow(account1, 10)
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('allows tokenRegistry to call transferFromEscrow', async () => {
    await spoofedDT.transferFromEscrow(account1, tokens)
    let totalSupply = await spoofedDT.totalSupply.call()
    let balance = await spoofedDT.balanceOf(account1)
    assert.equal(totalSupply, tokens, "doesn't maintain supply correctly")
    assert.equal(balance, tokens, "doesn't update balance correctly")
  })

  it('only allows the tokenRegistry to call transferFromEscrow', async () => {
    let errorThrown = false
    try {
      await DT.transferFromEscrow(account1, 10)
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })
})
