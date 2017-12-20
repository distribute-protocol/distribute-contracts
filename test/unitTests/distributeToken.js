var assert = require('assert')
const DistributeToken = artifacts.require('DistributeToken')
const TokenRegistry = artifacts.require('TokenRegistry')
const Promise = require('bluebird')
web3.eth = Promise.promisifyAll(web3.eth)
const assertThrown = require('../utils/AssertThrown')

contract('DistributeToken', function (accounts) {
  let DT
  let tokens = 10000
  let burnAmount = 100
  let totalSupply
  let totalFreeSupply
  let account1 = accounts[1]
  let netTokens = tokens - burnAmount

  before(async function () {
    // define variables to hold deployed contracts
    DT = await DistributeToken.deployed()
    TR = await TokenRegistry.deployed()
  })

  it('returns baseCost as the current price when no tokens are available', async () => {
    let currentPrice = await DT.currentPrice()
    assert.equal(currentPrice, 100000000000000, 'currentPrice not returned correctly')
  })

  it('returns the correct wei required', async () => {
    let weiRequired = await DT.weiRequired(tokens)
    assert.equal(weiRequired, 1000000000000000000, 'weiRequired not returned correctly')
  })

  it('mints tokens', async () => {
    let weiRequired = await DT.weiRequired(tokens)
    await DT.mint(tokens, {from: account1, value: weiRequired})
    totalSupply = await DT.totalSupply.call()
    assert.equal(totalSupply.toNumber(), tokens, 'total token supply not updated correctly')
    totalFreeSupply = await DT.totalFreeSupply.call()
    assert.equal(totalFreeSupply.toNumber(), tokens, 'free token supply not updated correctly')
    let balance = await DT.balanceOf(account1)
    assert.equal(balance.toNumber(), tokens, 'balances mapping not updated correctly')
    let weiBal = await DT.weiBal.call()
    assert.equal(weiBal.toNumber(), weiRequired.toNumber(), 'weiBal not updated correctly')
  })

  it('returns the correct wei required when tokens are available', async () => {
    let weiRequired = await DT.weiRequired(tokens)
    assert.equal(weiRequired, 2000000000000000000, 'weiRequired not returned correctly')
  })

  it('returns the current price when tokens are available', async () => {
    await DT.mint(tokens, {from: accounts[3], value: web3.toWei(5, 'ether')})
    let currentPrice = await DT.currentPrice()
    assert.equal(currentPrice, 150000000000000, 'currentPrice not returned correctly')
  })

  it('sells tokens', async () => {
    let balance = await DT.balanceOf(account1)
    assert.equal(balance.toNumber(), tokens, 'balance call failed')
    await DT.sell(burnAmount, {from: account1})
    let balance2 = await DT.balanceOf(account1)
    assert.equal(balance2.toNumber(), netTokens, 'balances mapping not updated correctly')
    let totalSupply = await DT.totalSupply.call()
    assert.equal(totalSupply.toNumber(), netTokens + tokens, 'total token supply not updated correctly')
    let freeTokenSupply = await DT.totalFreeSupply.call()
    assert.equal(freeTokenSupply.toNumber(), netTokens + tokens, 'free token supply not updated correctly')
  })

  it('returns the target price for an ammount of tokens', async () => {
    let targetPrice = await DT.targetPrice(tokens)
    assert.equal(targetPrice, 200100000000000, 'targetPrice not returned correctly')
  })

  // it('burns tokens from TokenRegistry', async () => {
  // })

  it('only allows the tokenRegistry to call burn', async () => {
    let errorThrown = false
    try {
      await DT.burn(10)
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('only allows the tokenRegistry to call transferWeiFrom', async () => {
    let errorThrown = false
    try {
      await DT.transferWeiFrom(account1, web3.toWei(3, 'ether'))
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
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
