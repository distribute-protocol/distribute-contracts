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
      let burnPrice = await utils.calculateBurnPrice({DT: spoofedDT, tokens: userBalance})

      // take stock of variables
      let tokenSupplyBefore = await utils.get({fn: spoofedDT.totalSupply, bn: false})
      let weiBalBefore = await utils.get({fn: spoofedDT.weiBal})
      let minterBalanceBefore = await utils.get({fn: spoofedDT.balances, params: anyAddress, bn: false})
      let dtWeiBalBefore = parseInt(await web3.eth.getBalance(spoofedDT.address))

      await spoofedDT.sell(userBalance, {from: anyAddress})

      // take stock of variables
      let tokenSupplyAfter = await utils.get({fn: spoofedDT.totalSupply, bn: false})
      let weiBalAfter = await utils.get({fn: spoofedDT.weiBal})
      let minterBalanceAfter = await utils.get({fn: spoofedDT.balances, params: anyAddress, bn: false})
      let dtWeiBalAfter = parseInt(await web3.eth.getBalance(spoofedDT.address))

      // checks
      assert.equal(tokenSupplyBefore, tokenSupplyAfter + userBalance, 'incorrect number of tokens minted')
      assert.equal(minterBalanceBefore, minterBalanceAfter + userBalance, 'incorrect number of tokens minted')
      assert.equal(weiBalBefore.minus(weiBalAfter), burnPrice, 'incorrect amount of wei kept by contract in variable')
      assert.equal(dtWeiBalBefore - dtWeiBalAfter, burnPrice, 'incorrect amount of wei kept by contract in actual wei')
    })
  })

  describe('transferWeiTo', () => {
  })

  describe('transferTokensTo', () => {
  })

  describe('returnWei', () => {
  })

  describe('transferToEscrow', () => {
  })

  describe('transferFromEscrow', () => {
  })

  describe('fallback', () => {
  })
  // it('mints tokens', async () => {
  //   // take stock of variables before
  //   let weiRequired = await utils.getWeiRequired(tokensToMint)
  //   let totalSupplyBefore = await utils.getTotalTokens()
  //   let weiPoolBalBefore = await utils.getWeiPoolBal()
  //   let tpBalBefore = await utils.getTokenBalance(tokenProposer)
  //
  //   // mint tokensToMint tokens with weiRequired amount of ether
  //   await utils.mint(tokenProposer, tokensToMint, weiRequired)
  //
  //   // take stock of variables after
  //   let totalSupplyAfter = await utils.getTotalTokens()
  //   let weiPoolBalAfter = await utils.getWeiPoolBal()
  //   let tpBalAfter = await utils.getTokenBalance(tokenProposer)
  //
  //   // checks
  //   assert.equal(totalSupplyBefore, 0, 'there should be no tokens in existence before minting')
  //   assert.equal(weiPoolBalBefore, 0, 'there should be no wei in the DT pool before minting')
  //   assert.equal(tpBalBefore, 0, 'there should be no tokens in tokenProposer\'s balance before minting')
  //   assert.equal(totalSupplyAfter, tokensToMint, 'there should be tokensToMint tokens in existence after minting')
  //   assert.equal(weiPoolBalAfter, weiRequired, 'there should be weiRequired wei in the DT pool after minting')
  //   assert.equal(tpBalAfter, tokensToMint, 'there should be tokensToMint tokens in tokenProposer\'s balance after minting')
  // })
  //
  // it('returns the correct wei required when tokens are available', async () => {
  //   // wei required getters
  //   let weiRequiredFunc = await utils.getWeiRequired(tokensToMint)
  //   let weiRequiredCalc = await utils.calculateWeiRequired(tokensToMint)
  //
  //   // checks
  //   assert.equal(weiRequiredFunc, weiRequiredCalc, 'weiRequired not returned correctly')
  // })
  //
  // it('correctly returns the current price when tokens are available', async () => {
  //   // current price getters
  //   let currentPriceFunc = await utils.getCurrentPrice()
  //   let currentPriceCalc = await utils.calculateCurrentPrice()
  //
  //   // checks
  //   assert.equal(currentPriceFunc, currentPriceCalc, 'currPrice not returned correctly')
  // })
  //
  // it('sells tokens', async () => {
  //   // take stock of variables before
  //   let burnVal = await utils.getBurnPrice(tokensToBurn)
  //   let totalSupplyBefore = await utils.getTotalTokens()
  //   let weiPoolBalBefore = await utils.getWeiPoolBal()
  //   let tpBalBefore = await utils.getTokenBalance(tokenProposer)
  //
  //   // burn tokensToMint tokens with weiRequired amount of ether
  //   await utils.sell(tokenProposer, tokensToBurn)
  //
  //   // take stock of variables after
  //   let totalSupplyAfter = await utils.getTotalTokens()
  //   let weiPoolBalAfter = await utils.getWeiPoolBal()
  //   let tpBalAfter = await utils.getTokenBalance(tokenProposer)
  //
  //   // checks
  //   assert.equal(totalSupplyBefore - totalSupplyAfter, tokensToBurn, 'incorrectly updated total supply')
  //   assert.equal(weiPoolBalBefore - weiPoolBalAfter, burnVal, 'incorrectly updated DT\'s weiBal')
  //   assert.equal(tpBalBefore - tpBalAfter, tokensToBurn, 'incorrectly updated tokenProposer\'s token balance')
  // })
  //
  // it('allows tokenRegistry to call burn()', async () => {
  //   // take stock of variables before
  //   let weiRequired = await spoofedDT.weiRequired(tokensToMint)
  //   let totalSupplyBefore = await spoofedDT.totalSupply()
  //   let TRBalBefore = await spoofedDT.balances(spoofedTRAddress)
  //
  //   // mint some tokens so TR has tokens to burn, then burn tokens
  //   await spoofedDT.mint(tokensToMint, {from: spoofedTRAddress, value: weiRequired})
  //   await spoofedDT.burn(tokensToBurn, {from: spoofedTRAddress})
  //
  //   // take stock of variables after
  //   let totalSupplyAfter = await spoofedDT.totalSupply()
  //   let TRBalAfter = await spoofedDT.balances(spoofedTRAddress)
  //
  //   // checks
  //   assert.equal(totalSupplyAfter - totalSupplyBefore, tokensToMint - tokensToBurn, 'incorrectly updated total supply')
  //   assert.equal(TRBalAfter - TRBalBefore, tokensToMint - tokensToBurn, 'incorretly updated TR token balance')
  // })
  //
  // it('only allows the tokenRegistry to call burn()', async () => {
  //   // mint some tokens so RR has tokens to burn
  //   let weiRequired = await spoofedDT.weiRequired(tokensToMint)
  //   await spoofedDT.mint(tokensToMint, {from: spoofedTRAddress, value: weiRequired})
  //
  //   let errorThrown = false
  //   try {
  //     await spoofedDT.burn(tokensToBurn, {from: anyAddress})
  //   } catch (e) {
  //     errorThrown = true
  //   }
  //   await assertThrown(errorThrown, 'An error should have been thrown')
  // })
  //
  // it('allows tokenRegistry to call transferWeiTo()', async () => {
  //   // mint some tokens so there is wei to transfer from the pool
  //   let weiRequired = await spoofedDT.weiRequired(tokensToMint)
  //   await spoofedDT.mint(tokensToMint, {from: spoofedTRAddress, value: weiRequired})
  //
  //   // get wei pool bal before
  //   let weiPoolBalBefore = await spoofedDT.weiBal()
  //
  //   // call transferWeiTo
  //   await spoofedDT.transferWeiTo(spoofedTRAddress, weiPoolBalBefore, {from: spoofedTRAddress})
  //
  //   // get wei pool bal after
  //   let weiPoolBalAfter = await spoofedDT.weiBal()
  //
  //   // checks
  //   assert.notEqual(weiPoolBalBefore, 0, 'weiPoolBal is 0')
  //   assert.equal(weiPoolBalAfter, 0, 'doesn\'t transfer wei correctly')
  // })
  //
  // it('allows reputationRegistry to call transferWeiTo()', async () => {
  //   // mint some tokens so there is wei to transfer from the pool
  //   let weiRequired = await spoofedDT.weiRequired(tokensToMint)
  //   await spoofedDT.mint(tokensToMint, {from: spoofedTRAddress, value: weiRequired})
  //
  //   // get wei pool bal before
  //   let weiPoolBalBefore = await spoofedDT.weiBal()
  //
  //   // call transferWeiTo
  //   await spoofedDT.transferWeiTo(spoofedTRAddress, weiPoolBalBefore, {from: spoofedRRAddress})
  //
  //   // get wei pool bal after
  //   let weiPoolBalAfter = await spoofedDT.weiBal()
  //
  //   // checks
  //   assert.notEqual(weiPoolBalBefore, 0, 'weiPoolBal is 0')
  //   assert.equal(weiPoolBalAfter, 0, 'doesn\'t transfer wei correctly')
  // })
  //
  // it('only allows the tokenRegistry or reputationRegistry to call transferWeiTo()', async () => {
  //   // mint some tokens so there is wei to transfer from the pool
  //   let weiRequired = await spoofedDT.weiRequired(tokensToMint)
  //   await spoofedDT.mint(tokensToMint, {from: spoofedTRAddress, value: weiRequired})
  //
  //   // get wei pool bal before
  //   let weiPoolBalBefore = await spoofedDT.weiBal()
  //
  //   let errorThrown = false
  //   try {
  //     await spoofedDT.transferWeiTo(spoofedPRAddress, weiPoolBalBefore, {from: spoofedPRAddress})
  //   } catch (e) {
  //     errorThrown = true
  //   }
  //   await assertThrown(errorThrown, 'An error should have been thrown')
  // })
  //
  // it('allows tokenRegistry to call returnWei()', async () => {
  //   // get wei pool bal before
  //   let weiPoolBalBefore = await spoofedDT.weiBal()
  //
  //   // call transferWeiTo
  //   await spoofedDT.returnWei(weiToReturn, {from: spoofedTRAddress})
  //
  //   // get wei pool bal after
  //   let weiPoolBalAfter = await spoofedDT.weiBal()
  //
  //   // check
  //   assert.equal(weiPoolBalAfter - weiPoolBalBefore, weiToReturn, 'doesn\'t increment weiBal correctly')
  // })
  //
  // it('only allows the tokenRegistry to call returnWei()', async () => {
  //   let errorThrown = false
  //   try {
  //     await spoofedDT.returnWei(weiToReturn, {from: anyAddress})
  //   } catch (e) {
  //     errorThrown = true
  //   }
  //   await assertThrown(errorThrown, 'An error should have been thrown')
  // })
  //
  // it('allows tokenRegistry to call transferToEscrow()', async () => {
  //   // mint some tokens so there are tokens to transfer to escrow
  //   let weiRequired = await spoofedDT.weiRequired(tokensToMint)
  //   await spoofedDT.mint(tokensToMint, {from: tokenProposer, value: weiRequired})
  //
  //   // take stock of variables before
  //   let totalSupplyBefore = await spoofedDT.totalSupply()
  //   let TRBalBefore = await spoofedDT.balances(spoofedTRAddress)
  //   let tpBalBefore = await spoofedDT.balances(tokenProposer)
  //
  //   // transfer tokenProposer's tokens to escrow
  //   await spoofedDT.transferToEscrow(tokenProposer, tokensToMint, {from: spoofedTRAddress})
  //
  //   // take stock of variables after
  //   let totalSupplyAfter = await spoofedDT.totalSupply()
  //   let TRBalAfter = await spoofedDT.balances(spoofedTRAddress)
  //   let tpBalAfter = await spoofedDT.balances(tokenProposer)
  //
  //   // checks
  //   assert.equal(totalSupplyAfter.toNumber(), totalSupplyBefore.toNumber(), 'should not change')
  //   assert.equal(TRBalAfter - TRBalBefore, tokensToMint, 'doesn\'t update balance correctly')
  //   assert.equal(tpBalBefore - tpBalAfter, tokensToMint, 'doesn\'t update balance correctly')
  // })
  //
  // it('only allows the tokenRegistry to call transferToEscrow()', async () => {
  //   // mint some tokens so there are tokens to transfer to escrow
  //   let weiRequired = await spoofedDT.weiRequired(tokensToMint)
  //   await spoofedDT.mint(tokensToMint, {from: tokenProposer, value: weiRequired})
  //
  //   let errorThrown = false
  //   try {
  //     await spoofedDT.transferToEscrow(tokenProposer, tokensToMint, {from: anyAddress})
  //   } catch (e) {
  //     errorThrown = true
  //   }
  //   await assertThrown(errorThrown, 'An error should have been thrown')
  // })
  //
  // it('allows tokenRegistry to call transferFromEscrow()', async () => {
  //   // take stock of variables before
  //   let totalSupplyBefore = await spoofedDT.totalSupply()
  //   let TRBalBefore = await spoofedDT.balances(spoofedTRAddress)
  //   let tpBalBefore = await spoofedDT.balances(tokenProposer)
  //
  //   // transfer tokenProposer's tokens to escrow
  //   await spoofedDT.transferFromEscrow(tokenProposer, tokensToMint, {from: spoofedTRAddress})
  //
  //   // take stock of variables after
  //   let totalSupplyAfter = await spoofedDT.totalSupply()
  //   let TRBalAfter = await spoofedDT.balances(spoofedTRAddress)
  //   let tpBalAfter = await spoofedDT.balances(tokenProposer)
  //
  //   // checks
  //   assert.equal(totalSupplyAfter.toNumber(), totalSupplyBefore.toNumber(), 'should not change')
  //   assert.equal(TRBalBefore - TRBalAfter, tokensToMint, 'doesn\'t update balance correctly')
  //   assert.equal(tpBalAfter - tpBalBefore, tokensToMint, 'doesn\'t update balance correctly')
  // })
  //
  // it('only allows the tokenRegistry to call transferFromEscrow()', async () => {
  //   let errorThrown = false
  //   try {
  //     await spoofedDT.transferFromEscrow(tokenProposer, tokensToMint, {from: anyAddress})
  //   } catch (e) {
  //     errorThrown = true
  //   }
  //   await assertThrown(errorThrown, 'An error should have been thrown')
  // })
})
