/* eslint-env mocha */
/* global assert contract artifacts web3 */

const DistributeToken = artifacts.require('DistributeToken')

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')

contract('Distribute Token', function (accounts) {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let spoofedDT
  let {tokenProposer} = projObj.user
  let {spoofedTRAddress, spoofedRRAddress, anyAddress} = projObj.spoofed
  let {tokensToMint} = projObj.variables
  let {utils} = projObj

  // local test variables
  let errorThrown

  before(async () => {
    // get contracts from project helped
    await projObj.contracts.setContracts()

    // initialize spoofed DT
    spoofedDT = await DistributeToken.new(spoofedTRAddress, spoofedRRAddress)
  })

  describe('constructor', () => {
    it('correctly sets state variables', async () => {
      let trAddress = await utils.get({fn: spoofedDT.tokenRegistryAddress})
      let rrAddress = await utils.get({fn: spoofedDT.reputationRegistryAddress})
      assert.equal(trAddress, spoofedTRAddress, 'incorrect token registry address stored by constructor')
      assert.equal(rrAddress, spoofedRRAddress, 'incorrect reputation registry address stored by constructor')
    })
  })

  describe('freezeContract', () => {
    it('not owner is unable to freeze the contract', async () => {
      // take stock of variables
      let owner = await utils.get({fn: spoofedDT.owner})
      let freezeBefore = await utils.get({fn: spoofedDT.freeze})

      // checks
      assert.equal(freezeBefore, false, 'at initialization freeze should be false')
      assert.notEqual(owner, anyAddress, 'ensure attempted freezer is not the owner')

      // not owner attempts to freeze the contract
      errorThrown = false
      try {
        await spoofedDT.freezeContract({from: anyAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('owner is able to freeze the contract', async () => {
      // take stock of variables
      let owner = await utils.get({fn: spoofedDT.owner})
      let freezeBefore = await utils.get({fn: spoofedDT.freeze})

      // checks
      assert.equal(freezeBefore, false, 'after failed freeze attempt, freeze should be false')

      // owner freezes the contract
      await spoofedDT.freezeContract({from: owner})

      // take stock of variables
      let freezeAfter = await utils.get({fn: spoofedDT.freeze})

      // checks
      assert.equal(freezeAfter, true, 'owner should be able to freeze the contract')
    })
  })

  describe('unfreezeContract', () => {
    it('not owner is unable to freeze the contract', async () => {
      // take stock of variables
      let owner = await utils.get({fn: spoofedDT.owner})
      let freezeBefore = await utils.get({fn: spoofedDT.freeze})

      // checks
      assert.equal(freezeBefore, true, 'after freezing, freeze should be true')
      assert.notEqual(owner, anyAddress, 'ensure attempted unfreezer is not the owner')

      // not owner attempts to freeze the contract
      errorThrown = false
      try {
        await spoofedDT.unfreezeContract({from: anyAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('owner is able to unfreeze the contract', async () => {
      // take stock of variables
      let owner = await utils.get({fn: spoofedDT.owner})
      let freezeBefore = await utils.get({fn: spoofedDT.freeze})

      // checks
      assert.equal(freezeBefore, true, 'after failed unfreeze attempt, freeze should be true')

      // owner freezes the contract
      await spoofedDT.unfreezeContract({from: owner})

      // take stock of variables
      let freezeAfter = await utils.get({fn: spoofedDT.freeze})

      // checks
      assert.equal(freezeAfter, false, 'owner should be able to unfreeze the contract')
    })
  })

  describe('updateTokenRegistry', () => {
    it('not owner is unable to update the token registry', async () => {
      // take stock of variables
      let owner = await utils.get({fn: spoofedDT.owner})
      let trAddress = await utils.get({fn: spoofedDT.tokenRegistryAddress})

      // checks
      assert.equal(trAddress, spoofedTRAddress, 'before updating, token registry address should be trAddress')
      assert.notEqual(owner, anyAddress, 'ensure attempted updater is not the owner')

      // not owner attempts to freeze the contract
      errorThrown = false
      try {
        await spoofedDT.updateTokenRegistry(anyAddress, {from: anyAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('owner is able to update the token registry', async () => {
      // take stock of variables
      let owner = await utils.get({fn: spoofedDT.owner})
      let trAddressBefore = await utils.get({fn: spoofedDT.tokenRegistryAddress})

      // checks
      assert.equal(trAddressBefore, spoofedTRAddress, 'before updating, token registry address should be trAddress')

      // owner freezes the contract
      await spoofedDT.updateTokenRegistry(anyAddress, {from: owner})

      // take stock of variables
      let trAddressAfter = await utils.get({fn: spoofedDT.tokenRegistryAddress})

      // checks
      assert.equal(trAddressAfter, anyAddress, 'after updating, token registry address should be anyAddress')

      // put it back
      await spoofedDT.updateTokenRegistry(spoofedTRAddress, {from: owner})
    })
  })

  describe('updateReputationRegistry', () => {
    it('not owner is unable to update the reputation registry', async () => {
      // take stock of variables
      let owner = await utils.get({fn: spoofedDT.owner})
      let rrAddress = await utils.get({fn: spoofedDT.reputationRegistryAddress})

      // checks
      assert.equal(rrAddress, spoofedRRAddress, 'before updating, reputation registry address should be trAddress')
      assert.notEqual(owner, anyAddress, 'ensure attempted updater is not the owner')

      // not owner attempts to freeze the contract
      errorThrown = false
      try {
        await spoofedDT.updateReputationRegistry(anyAddress, {from: anyAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('owner is able to update the reputation registry', async () => {
      // take stock of variables
      let owner = await utils.get({fn: spoofedDT.owner})
      let rrAddressBefore = await utils.get({fn: spoofedDT.reputationRegistryAddress})

      // checks
      assert.equal(rrAddressBefore, spoofedRRAddress, 'before updating, reputation registry address should be trAddress')

      // owner freezes the contract
      await spoofedDT.updateReputationRegistry(anyAddress, {from: owner})

      // take stock of variables
      let rrAddressAfter = await utils.get({fn: spoofedDT.reputationRegistryAddress})

      // checks
      assert.equal(rrAddressAfter, anyAddress, 'after updating, reputation registry address should be anyAddress')

      // put it back
      await spoofedDT.updateReputationRegistry(spoofedRRAddress, {from: owner})
    })
  })

  describe('currentPrice', () => {
    it('returns baseCost as the current price when there are no tokens or wei', async () => {
      // take stock of variables
      let totalSupply = await utils.get({fn: spoofedDT.totalSupply, bn: false})
      let weiBal = await utils.get({fn: spoofedDT.weiBal, bn: false})
      let currentPrice = await utils.get({fn: spoofedDT.currentPrice, bn: false})
      let baseCost = await utils.get({fn: spoofedDT.baseCost, bn: false})

      // checks
      assert.equal(totalSupply, 0, 'total supply should be 0')
      assert.equal(weiBal, 0, 'weiBal should be 0')
      assert.equal(currentPrice, baseCost, 'currPrice not returned correctly')
    })

    it('returns weiBal / totalSupply as the current price when there are tokens and wei', async () => {
      // mint some tokens
      await utils.mint({user: tokenProposer, numTokens: tokensToMint, DT: spoofedDT})

      // take stock of variables
      let totalSupply = await utils.get({fn: spoofedDT.totalSupply, bn: false})
      let weiBal = await utils.get({fn: spoofedDT.weiBal, bn: false})
      let currentPrice = await utils.get({fn: spoofedDT.currentPrice, bn: false})

      // interim calculations
      let price = Math.floor(weiBal / totalSupply)

      // checks
      assert.notEqual(totalSupply, 0, 'total supply should not be 0')
      assert.notEqual(weiBal, 0, 'weiBal should not be 0')
      assert.equal(currentPrice, price, 'currPrice not returned correctly')

      // burn the tokens
      await utils.sell({user: tokenProposer, numTokens: tokensToMint, DT: spoofedDT})
    })
  })

  describe('weiRequired', () => {
    it('returns the correct wei required for positive token value', async () => {
      // take stock of variables
      let weiRequiredFunc = await utils.get({fn: spoofedDT.weiRequired, params: tokensToMint})
      let weiRequiredCalc = await utils.calculateWeiRequired({tokens: tokensToMint, DT: spoofedDT})

      // checks
      assert.equal(weiRequiredFunc, weiRequiredCalc, 'weiRequired not returned correctly')
    })

    it('reverts for non-positive token value', async () => {
      errorThrown = false
      try {
        await utils.get({fn: spoofedDT.weiRequired, params: -1 * tokensToMint})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: invalid opcode/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')

      errorThrown = false
      try {
        await utils.get({fn: spoofedDT.weiRequired, params: 0})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('targetPrice', () => {
    it('can\'t be called', async () => {
      errorThrown = false
      try {
        await spoofedDT.targetPrice(tokensToMint)
      } catch (e) {
        assert.match(e.message, /spoofedDT.targetPrice is not a function/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('mint', () => {
    it('can\'t be called if contract is frozen', async () => {
      // freeze contract
      let owner = await utils.get({fn: spoofedDT.owner})
      await spoofedDT.freezeContract({from: owner})

      errorThrown = false
      try {
        await utils.mint({DT: spoofedDT, numTokens: tokensToMint, user: anyAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')

      // unfreeze contract
      await spoofedDT.unfreezeContract({from: owner})
    })

    it('reverts if not enough wei is sent', async () => {
      // get wei required
      let weiRequired = await utils.get({fn: spoofedDT.weiRequired, params: tokensToMint, bn: false})
      errorThrown = false
      try {
        await utils.mint({DT: spoofedDT, numTokens: tokensToMint, mintingCost: weiRequired - 100, user: anyAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('mints tokens and returns leftover wei if enough wei is sent', async () => {
      // get wei required
      let weiRequired = await utils.get({fn: spoofedDT.weiRequired, params: tokensToMint, bn: false})

      // take stock of variables
      let tokenSupplyBefore = await utils.get({fn: spoofedDT.totalSupply, bn: false})
      let weiBalBefore = await utils.get({fn: spoofedDT.weiBal})
      let minterBalanceBefore = await utils.get({fn: spoofedDT.balances, params: anyAddress, bn: false})

      // mint tokens
      await utils.mint({DT: spoofedDT, numTokens: tokensToMint, mintingCost: weiRequired + 100, user: anyAddress})

      // take stock of variables
      let tokenSupplyAfter = await utils.get({fn: spoofedDT.totalSupply, bn: false})
      let weiBalAfter = await utils.get({fn: spoofedDT.weiBal})
      let minterBalanceAfter = await utils.get({fn: spoofedDT.balances, params: anyAddress, bn: false})

      // checks
      assert.equal(tokenSupplyAfter, tokenSupplyBefore + tokensToMint, 'incorrect number of tokens minted')
      assert.equal(minterBalanceAfter, minterBalanceBefore + tokensToMint, 'incorrect number of tokens minted')
      assert.equal(weiBalAfter.minus(weiBalBefore), weiRequired, 'incorrect amount of wei kept by contract')
    })
  })

  describe('burn', () => {
    it('can\'t be called if contract is frozen', async () => {
      // freeze contract
      let owner = await utils.get({fn: spoofedDT.owner})
      await spoofedDT.freezeContract({from: owner})

      // transfer some tokens to TR
      await spoofedDT.transferTokensTo(spoofedTRAddress, tokensToMint, {from: spoofedTRAddress})

      errorThrown = false
      try {
        await spoofedDT.burn(tokensToMint, {from: spoofedTRAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')

      // unfreeze contract
      await spoofedDT.unfreezeContract({from: owner})
    })

    it('not token registry is unable to burn tokens', async () => {
      // get user balance
      let userBalance = await utils.get({fn: spoofedDT.balances, params: anyAddress, bn: false})

      errorThrown = false
      try {
        await spoofedDT.burn(userBalance, {from: anyAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token registry is unable to burn more tokens than it has', async () => {
      // get user balance
      let userBalance = await utils.get({fn: spoofedDT.balances, params: spoofedTRAddress, bn: false})

      errorThrown = false
      try {
        await spoofedDT.burn(userBalance + 1, {from: spoofedTRAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: invalid opcode/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token registry is unable to burn more tokens than in the total supply', async () => {
      // get user balance
      let tokenSupply = await utils.get({fn: spoofedDT.totalSupply, bn: false})

      errorThrown = false
      try {
        await spoofedDT.burn(tokenSupply + 1, {from: spoofedTRAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token registry is unable to burn zero tokens', async () => {
      errorThrown = false
      try {
        await spoofedDT.burn(0, {from: spoofedTRAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token registry is able to burn tokens it has', async () => {
      // get user balance
      let trBalance = await utils.get({fn: spoofedDT.balances, params: spoofedTRAddress, bn: false})

      // take stock of variables
      let tokenSupplyBefore = await utils.get({fn: spoofedDT.totalSupply, bn: false})
      let trBalanceBefore = await utils.get({fn: spoofedDT.balances, params: spoofedTRAddress, bn: false})

      await spoofedDT.burn(trBalance, {from: spoofedTRAddress})

      // take stock of variables
      let tokenSupplyAfter = await utils.get({fn: spoofedDT.totalSupply, bn: false})
      let trBalanceAfter = await utils.get({fn: spoofedDT.balances, params: spoofedTRAddress, bn: false})

      // checks
      assert.equal(tokenSupplyBefore, tokenSupplyAfter + trBalance, 'incorrectly updated total supply')
      assert.equal(trBalanceBefore, trBalanceAfter + trBalance, 'incorrectly updated TR token balance')
    })
  })

  describe('sell', () => {
    it('can\'t be called to sell 0 tokens', async () => {
      errorThrown = false
      try {
        await spoofedDT.sell(0, {from: anyAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('user can\'t sell more tokens than they have', async () => {
      // get user balance
      let userBalance = await utils.get({fn: spoofedDT.balances, params: anyAddress, bn: false})

      errorThrown = false
      try {
        await spoofedDT.sell(userBalance + 1, {from: anyAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('user can sell tokens they have', async () => {
      // get user balance & current price
      let userBalance = await utils.get({fn: spoofedDT.balances, params: anyAddress, bn: false})
      let burnPrice = await utils.calculateBurnPrice({DT: spoofedDT, tokens: userBalance - 1000})

      // take stock of variables
      let tokenSupplyBefore = await utils.get({fn: spoofedDT.totalSupply, bn: false})
      let weiBalBefore = await utils.get({fn: spoofedDT.weiBal})
      let minterBalanceBefore = await utils.get({fn: spoofedDT.balances, params: anyAddress, bn: false})
      let dtWeiBalBefore = parseInt(await web3.eth.getBalance(spoofedDT.address))

      await spoofedDT.sell(userBalance - 1000, {from: anyAddress})

      // take stock of variables
      let tokenSupplyAfter = await utils.get({fn: spoofedDT.totalSupply, bn: false})
      let weiBalAfter = await utils.get({fn: spoofedDT.weiBal})
      let minterBalanceAfter = await utils.get({fn: spoofedDT.balances, params: anyAddress, bn: false})
      let dtWeiBalAfter = parseInt(await web3.eth.getBalance(spoofedDT.address))

      // checks
      assert.equal(tokenSupplyBefore, tokenSupplyAfter + userBalance - 1000, 'incorrect number of tokens minted')
      assert.equal(minterBalanceBefore, minterBalanceAfter + userBalance - 1000, 'incorrect number of tokens minted')
      assert.equal(weiBalBefore.minus(weiBalAfter), burnPrice, 'incorrect amount of wei kept by contract in variable')
      assert.equal(dtWeiBalBefore - dtWeiBalAfter, burnPrice, 'incorrect amount of wei kept by contract in actual wei')
    })
  })

  describe('transferWeiTo', () => {
    it('can\'t be called if contract is frozen', async () => {
      // freeze contract
      let owner = await utils.get({fn: spoofedDT.owner})
      await spoofedDT.freezeContract({from: owner})

      // get DT weiBal
      let weiBal = await utils.get({fn: spoofedDT.weiBal})

      errorThrown = false
      try {
        await spoofedDT.transferWeiTo(anyAddress, weiBal, {from: spoofedTRAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')

      errorThrown = false
      try {
        await spoofedDT.transferWeiTo(anyAddress, weiBal, {from: spoofedRRAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')

      // unfreeze contract
      await spoofedDT.unfreezeContract({from: owner})
    })

    it('not token/reputation registry is unable to transfer wei', async () => {
      // get DT weiBal
      let weiBal = await utils.get({fn: spoofedDT.weiBal})

      errorThrown = false
      try {
        await spoofedDT.transferWeiTo(anyAddress, weiBal, {from: anyAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token/reputation registry is able to transfer wei', async () => {
      // take stock of variables
      let weiBalBefore = await utils.get({fn: spoofedDT.weiBal})
      let dtWeiBalBefore = parseInt(await web3.eth.getBalance(spoofedDT.address))
      let weiBalToTransfer = weiBalBefore.div(10)

      await spoofedDT.transferWeiTo(anyAddress, weiBalToTransfer, {from: spoofedTRAddress})

      // take stock of variables
      let weiBalMiddle = await utils.get({fn: spoofedDT.weiBal})
      let dtWeiBalMiddle = parseInt(await web3.eth.getBalance(spoofedDT.address))

      await spoofedDT.transferWeiTo(anyAddress, weiBalToTransfer, {from: spoofedRRAddress})

      // take stock of variables
      let weiBalAfter = await utils.get({fn: spoofedDT.weiBal})
      let dtWeiBalAfter = parseInt(await web3.eth.getBalance(spoofedDT.address))

      // checks
      assert.equal(weiBalBefore.minus(weiBalMiddle).minus(weiBalToTransfer), 0, 'TR failed to transfer wei (variable)')
      assert.equal(dtWeiBalBefore - dtWeiBalMiddle, weiBalToTransfer, 'TR failed to transfer wei (actual wei)')
      assert.equal(weiBalMiddle.minus(weiBalAfter).minus(weiBalToTransfer), 0, 'RR failed to transfer wei (variable)')
      assert.equal(dtWeiBalMiddle - dtWeiBalAfter, weiBalToTransfer, 'RR failed to transfer wei (actual wei)')
    })
  })

  describe('transferTokensTo', () => {
    it('can\'t be called by not token registry', async () => {
      errorThrown = false
      try {
        await spoofedDT.transferTokensTo(anyAddress, 100000, {from: anyAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('can be called by token registry', async () => {
      let tokensToTransfer = 100000

      // take stock of variables
      let tokenSupplyBefore = await utils.get({fn: spoofedDT.totalSupply, bn: false})
      let userBalanceBefore = await utils.get({fn: spoofedDT.balances, params: anyAddress, bn: false})

      await spoofedDT.transferTokensTo(anyAddress, tokensToTransfer, {from: spoofedTRAddress})

      // take stock of variables
      let tokenSupplyAfter = await utils.get({fn: spoofedDT.totalSupply, bn: false})
      let userBalanceAfter = await utils.get({fn: spoofedDT.balances, params: anyAddress, bn: false})

      // checks
      assert.equal(tokenSupplyAfter - tokenSupplyBefore, tokensToTransfer, 'total supply does not reflect number of tokens transferred')
      assert.equal(userBalanceAfter - userBalanceBefore, tokensToTransfer, 'user balance does not reflect number of tokens transferred')
    })
  })

  describe('returnWei', () => {
    it('can\'t be called if contract is frozen', async () => {
      // freeze contract
      let owner = await utils.get({fn: spoofedDT.owner})
      await spoofedDT.freezeContract({from: owner})

      let weiVal = 10000000000

      errorThrown = false
      try {
        await spoofedDT.returnWei(weiVal, {from: spoofedTRAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')

      // unfreeze contract
      await spoofedDT.unfreezeContract({from: owner})
    })

    it('can\'t be called by not token registry', async () => {
      let weiVal = 10000000000

      errorThrown = false
      try {
        await spoofedDT.returnWei(weiVal, {from: anyAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('can be called by token registry', async () => {
      let weiVal = 10000000000

      // take stock of variables
      let weiBalBefore = await utils.get({fn: spoofedDT.weiBal})

      await spoofedDT.returnWei(weiVal, {from: spoofedTRAddress})

      // take stock of variables
      let weiBalAfter = await utils.get({fn: spoofedDT.weiBal})

      // checks
      assert.equal(weiBalAfter.minus(weiBalBefore), weiVal, 'incorrect amount of wei returned')
    })
  })

  describe('transferToEscrow', () => {
    it('can\'t be called if contract is frozen', async () => {
      // freeze contract
      let owner = await utils.get({fn: spoofedDT.owner})
      await spoofedDT.freezeContract({from: owner})

      // get user balance
      let userBalance = await utils.get({fn: spoofedDT.balances, params: anyAddress, bn: false})

      errorThrown = false
      try {
        await spoofedDT.transferToEscrow(anyAddress, userBalance, {from: spoofedTRAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')

      // unfreeze contract
      await spoofedDT.unfreezeContract({from: owner})
    })

    it('can\'t be called by not token registry', async () => {
      // get user balance
      let userBalance = await utils.get({fn: spoofedDT.balances, params: anyAddress, bn: false})

      errorThrown = false
      try {
        await spoofedDT.transferToEscrow(anyAddress, userBalance, {from: anyAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token registry can\'t transfer more to escrow than a user has', async () => {
      // get user balance
      let userBalance = await utils.get({fn: spoofedDT.balances, params: anyAddress, bn: false})

      errorThrown = false
      try {
        await spoofedDT.transferToEscrow(anyAddress, userBalance + 1, {from: spoofedTRAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token registry can transfer user tokens to escrow', async () => {
      // take stock of variables
      let userBalanceBefore = await utils.get({fn: spoofedDT.balances, params: anyAddress, bn: false})
      let trBalanceBefore = await utils.get({fn: spoofedDT.balances, params: spoofedTRAddress, bn: false})

      await spoofedDT.transferToEscrow(anyAddress, userBalanceBefore, {from: spoofedTRAddress})

      // take stock of variables
      let userBalanceAfter = await utils.get({fn: spoofedDT.balances, params: anyAddress, bn: false})
      let trBalanceAfter = await utils.get({fn: spoofedDT.balances, params: spoofedTRAddress, bn: false})

      // checks
      assert.equal(userBalanceBefore - userBalanceAfter, userBalanceBefore, 'incorrect amount of tokens transferred from user')
      assert.equal(trBalanceAfter - trBalanceBefore, userBalanceBefore, 'incorrect amount of tokens transferred to escrow')
    })
  })

  describe('transferFromEscrow', () => {
    it('can\'t be called if contract is frozen', async () => {
      // freeze contract
      let owner = await utils.get({fn: spoofedDT.owner})
      await spoofedDT.freezeContract({from: owner})

      // get TR balance
      let trBalance = await utils.get({fn: spoofedDT.balances, params: spoofedTRAddress, bn: false})

      errorThrown = false
      try {
        await spoofedDT.transferFromEscrow(anyAddress, trBalance, {from: spoofedTRAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')

      // unfreeze contract
      await spoofedDT.unfreezeContract({from: owner})
    })

    it('can\'t be called by not token registry', async () => {
      // get TR balance
      let trBalance = await utils.get({fn: spoofedDT.balances, params: spoofedTRAddress, bn: false})

      errorThrown = false
      try {
        await spoofedDT.transferFromEscrow(anyAddress, trBalance, {from: anyAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token registry can\'t transfer more to escrow than it has', async () => {
      // get TR balance
      let trBalance = await utils.get({fn: spoofedDT.balances, params: spoofedTRAddress, bn: false})

      errorThrown = false
      try {
        await spoofedDT.transferFromEscrow(anyAddress, trBalance + 1, {from: spoofedTRAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token registry can transfer tokens from escrow', async () => {
      // take stock of variables
      let userBalanceBefore = await utils.get({fn: spoofedDT.balances, params: anyAddress, bn: false})
      let trBalanceBefore = await utils.get({fn: spoofedDT.balances, params: spoofedTRAddress, bn: false})

      await spoofedDT.transferFromEscrow(anyAddress, trBalanceBefore, {from: spoofedTRAddress})

      // take stock of variables
      let userBalanceAfter = await utils.get({fn: spoofedDT.balances, params: anyAddress, bn: false})
      let trBalanceAfter = await utils.get({fn: spoofedDT.balances, params: spoofedTRAddress, bn: false})

      // checks
      assert.equal(userBalanceAfter - userBalanceBefore, trBalanceBefore, 'incorrect amount of tokens transferred from token registry')
      assert.equal(trBalanceBefore - trBalanceAfter, trBalanceBefore, 'incorrect amount of tokens transferred to escrow')
    })
  })

  describe('fallback', () => {
  })
})
