var assert = require('assert')
const DistributeToken = artifacts.require('DistributeToken')
const Promise = require('bluebird')
web3.eth = Promise.promisifyAll(web3.eth)

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
  })

  it('mints capital tokens', async () => {
    let weiRequired = await DT.weiRequired(tokens)
    await DT.mint(tokens, {from: account1, value: web3.toWei(5, 'ether')})
    totalSupply = await DT.totalSupply.call()
    assert.equal(totalSupply.toNumber(), tokens, 'total token supply not updated correctly')
    totalFreeSupply = await DT.totalFreeSupply.call()
    assert.equal(totalFreeSupply.toNumber(), tokens, 'free token supply not updated correctly')
    let balance = await DT.balanceOf(account1)
    assert.equal(balance.toNumber(), tokens, 'balances mapping not updated correctly')
    let weiBal = await DT.weiBal.call()
    assert.equal(weiBal.toNumber(), weiRequired.toNumber(), 'weiRequired does not match weiBal')
  })
  it('burns capital tokens', async () => {
    let balance = await DT.balanceOf(account1)
    assert.equal(balance.toNumber(), tokens, 'balance call failed')
    await DT.burnAndRefundTokens(burnAmount, {from: account1})
    let balance2 = await DT.balanceOf(account1)
    assert.equal(balance2.toNumber(), netTokens, 'balances mapping not updated correctly')
    let totalSupply = await DT.totalSupply.call()
    assert.equal(totalSupply.toNumber(), netTokens, 'total token supply not updated correctly')
    let freeTokenSupply = await DT.totalFreeSupply.call()
    assert.equal(freeTokenSupply.toNumber(), netTokens, 'free token supply not updated correctly')
  })
  //
})
