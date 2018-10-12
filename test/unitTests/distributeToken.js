/* eslint-env mocha */
/* global assert contract artifacts */

const DistributeToken = artifacts.require('DistributeToken')

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')

contract('Distribute Token', function (accounts) {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let spoofedDT
  let {tokenProposer} = projObj.user
  let {spoofedTR, spoofedRR, spoofedPR, anyAddress, weiToReturn} = projObj.spoofed
  let {tokensToMint, tokensToBurn} = projObj.minting
  let {utils} = projObj

  // local test variables
  // let errorThrown

  before(async function () {
    // get contracts from project helped
    await projObj.contracts.setContracts()

    // initialize spoofed DT
    spoofedDT = await DistributeToken.new(spoofedTR, spoofedRR)
  })

  it('correctly returns baseCost as the current price when no tokens are available', async function () {
    // current price, base cost getters
    let currentPrice = await utils.getCurrentPrice()
    let baseCost = await utils.getBaseCost()

    // checks
    assert.equal(currentPrice, baseCost, 'currPrice not returned correctly')
  })

  it('returns the correct wei required when no tokens have been minted', async function () {
    // wei required getters
    let weiRequiredFunc = await utils.getWeiRequired(tokensToMint)
    let weiRequiredCalc = await utils.calculateWeiRequired(tokensToMint)

    // checks
    assert.equal(weiRequiredFunc, weiRequiredCalc, 'weiRequired not returned correctly')
  })

  it('mints tokens', async function () {
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

  it('returns the correct wei required when tokens are available', async function () {
    // wei required getters
    let weiRequiredFunc = await utils.getWeiRequired(tokensToMint)
    let weiRequiredCalc = await utils.calculateWeiRequired(tokensToMint)

    // checks
    assert.equal(weiRequiredFunc, weiRequiredCalc, 'weiRequired not returned correctly')
  })

  it('correctly returns the current price when tokens are available', async function () {
    // current price getters
    let currentPriceFunc = await utils.getCurrentPrice()
    let currentPriceCalc = await utils.calculateCurrentPrice()

    // checks
    assert.equal(currentPriceFunc, currentPriceCalc, 'currPrice not returned correctly')
  })

  it('sells tokens', async function () {
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
    assert.equal(tpBalBefore - tpBalAfter, tokensToBurn, 'incorrectly updated tokenProposer\'s token balance')
  })

  it('allows tokenRegistry to call burn()', async function () {
    // take stock of variables before
    let weiRequired = await spoofedDT.weiRequired(tokensToMint)
    let totalSupplyBefore = await spoofedDT.totalSupply()
    let TRBalBefore = await spoofedDT.balances(spoofedTR)

    // mint some tokens so TR has tokens to burn, then burn tokens
    await spoofedDT.mint(tokensToMint, {from: spoofedTR, value: weiRequired})
    await spoofedDT.burn(tokensToBurn, {from: spoofedTR})

    // take stock of variables after
    let totalSupplyAfter = await spoofedDT.totalSupply()
    let TRBalAfter = await spoofedDT.balances(spoofedTR)

    // checks
    assert.equal(totalSupplyAfter - totalSupplyBefore, tokensToMint - tokensToBurn, 'incorrectly updated total supply')
    assert.equal(TRBalAfter - TRBalBefore, tokensToMint - tokensToBurn, 'incorretly updated TR token balance')
  })

  it('only allows the tokenRegistry to call burn()', async function () {
    // mint some tokens so RR has tokens to burn
    let weiRequired = await spoofedDT.weiRequired(tokensToMint)
    await spoofedDT.mint(tokensToMint, {from: spoofedTR, value: weiRequired})

    let errorThrown = false
    try {
      await spoofedDT.burn(tokensToBurn, {from: anyAddress})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('allows tokenRegistry to call transferWeiTo()', async function () {
    // mint some tokens so there is wei to transfer from the pool
    let weiRequired = await spoofedDT.weiRequired(tokensToMint)
    await spoofedDT.mint(tokensToMint, {from: spoofedTR, value: weiRequired})

    // get wei pool bal before
    let weiPoolBalBefore = await spoofedDT.weiBal()

    // call transferWeiTo
    await spoofedDT.transferWeiTo(spoofedTR, weiPoolBalBefore, {from: spoofedTR})

    // get wei pool bal after
    let weiPoolBalAfter = await spoofedDT.weiBal()

    // checks
    assert.notEqual(weiPoolBalBefore, 0, 'weiPoolBal is 0')
    assert.equal(weiPoolBalAfter, 0, 'doesn\'t transfer wei correctly')
  })

  it('allows reputationRegistry to call transferWeiTo()', async function () {
    // mint some tokens so there is wei to transfer from the pool
    let weiRequired = await spoofedDT.weiRequired(tokensToMint)
    await spoofedDT.mint(tokensToMint, {from: spoofedTR, value: weiRequired})

    // get wei pool bal before
    let weiPoolBalBefore = await spoofedDT.weiBal()

    // call transferWeiTo
    await spoofedDT.transferWeiTo(spoofedTR, weiPoolBalBefore, {from: spoofedRR})

    // get wei pool bal after
    let weiPoolBalAfter = await spoofedDT.weiBal()

    // checks
    assert.notEqual(weiPoolBalBefore, 0, 'weiPoolBal is 0')
    assert.equal(weiPoolBalAfter, 0, 'doesn\'t transfer wei correctly')
  })

  it('only allows the tokenRegistry or reputationRegistry to call transferWeiTo()', async function () {
    // mint some tokens so there is wei to transfer from the pool
    let weiRequired = await spoofedDT.weiRequired(tokensToMint)
    await spoofedDT.mint(tokensToMint, {from: spoofedTR, value: weiRequired})

    // get wei pool bal before
    let weiPoolBalBefore = await spoofedDT.weiBal()

    let errorThrown = false
    try {
      await spoofedDT.transferWeiTo(spoofedPR, weiPoolBalBefore, {from: spoofedPR})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('allows tokenRegistry to call returnWei()', async function () {
    // get wei pool bal before
    let weiPoolBalBefore = await spoofedDT.weiBal()

    // call transferWeiTo
    await spoofedDT.returnWei(weiToReturn, {from: spoofedTR})

    // get wei pool bal after
    let weiPoolBalAfter = await spoofedDT.weiBal()

    // check
    assert.equal(weiPoolBalAfter - weiPoolBalBefore, weiToReturn, 'doesn\'t increment weiBal correctly')
  })

  it('only allows the tokenRegistry to call returnWei()', async function () {
    let errorThrown = false
    try {
      await spoofedDT.returnWei(weiToReturn, {from: anyAddress})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('allows tokenRegistry to call transferToEscrow()', async function () {
    // mint some tokens so there are tokens to transfer to escrow
    let weiRequired = await spoofedDT.weiRequired(tokensToMint)
    await spoofedDT.mint(tokensToMint, {from: tokenProposer, value: weiRequired})

    // take stock of variables before
    let totalSupplyBefore = await spoofedDT.totalSupply()
    let TRBalBefore = await spoofedDT.balances(spoofedTR)
    let tpBalBefore = await spoofedDT.balances(tokenProposer)

    // transfer tokenProposer's tokens to escrow
    await spoofedDT.transferToEscrow(tokenProposer, tokensToMint, {from: spoofedTR})

    // take stock of variables after
    let totalSupplyAfter = await spoofedDT.totalSupply()
    let TRBalAfter = await spoofedDT.balances(spoofedTR)
    let tpBalAfter = await spoofedDT.balances(tokenProposer)

    // checks
    assert.equal(totalSupplyAfter.toNumber(), totalSupplyBefore.toNumber(), 'should not change')
    assert.equal(TRBalAfter - TRBalBefore, tokensToMint, 'doesn\'t update balance correctly')
    assert.equal(tpBalBefore - tpBalAfter, tokensToMint, 'doesn\'t update balance correctly')
  })

  it('only allows the tokenRegistry to call transferToEscrow()', async function () {
    // mint some tokens so there are tokens to transfer to escrow
    let weiRequired = await spoofedDT.weiRequired(tokensToMint)
    await spoofedDT.mint(tokensToMint, {from: tokenProposer, value: weiRequired})

    let errorThrown = false
    try {
      await spoofedDT.transferToEscrow(tokenProposer, tokensToMint, {from: anyAddress})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('allows tokenRegistry to call transferFromEscrow()', async function () {
    // take stock of variables before
    let totalSupplyBefore = await spoofedDT.totalSupply()
    let TRBalBefore = await spoofedDT.balances(spoofedTR)
    let tpBalBefore = await spoofedDT.balances(tokenProposer)

    // transfer tokenProposer's tokens to escrow
    await spoofedDT.transferFromEscrow(tokenProposer, tokensToMint, {from: spoofedTR})

    // take stock of variables after
    let totalSupplyAfter = await spoofedDT.totalSupply()
    let TRBalAfter = await spoofedDT.balances(spoofedTR)
    let tpBalAfter = await spoofedDT.balances(tokenProposer)

    // checks
    assert.equal(totalSupplyAfter.toNumber(), totalSupplyBefore.toNumber(), 'should not change')
    assert.equal(TRBalBefore - TRBalAfter, tokensToMint, 'doesn\'t update balance correctly')
    assert.equal(tpBalAfter - tpBalBefore, tokensToMint, 'doesn\'t update balance correctly')
  })

  it('only allows the tokenRegistry to call transferFromEscrow()', async function () {
    let errorThrown = false
    try {
      await spoofedDT.transferFromEscrow(tokenProposer, tokensToMint, {from: anyAddress})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })
})
