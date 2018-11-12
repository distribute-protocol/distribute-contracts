/* eslint-env mocha */
/* global assert contract artifacts */

const TokenRegistry = artifacts.require('TokenRegistry')

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')

contract('Token Registry', function (accounts) {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let spoofedTR
  let {spoofedDTAddress, spoofedPRAddress, spoofedPLCRVotingAddress, anyAddress} = projObj.spoofed
  let {utils} = projObj

  // local test variables
  let errorThrown

  before(async () => {
    // get contracts from project helped
    await projObj.contracts.setContracts()

    // initialize spoofed TR
    spoofedTR = await TokenRegistry.new()
  })

  describe('init', () => {
    it('correctly sets state variables', async () => {
      // initialize contract addresses
      await spoofedTR.init(spoofedDTAddress, spoofedPRAddress, spoofedPLCRVotingAddress)

      // take stock of variables
      let dtAddress = await utils.get({fn: spoofedTR.distributeToken})
      let prAddress = await utils.get({fn: spoofedTR.projectRegistry})
      let plcrAddress = await utils.get({fn: spoofedTR.plcrVoting})
      // checks
      assert.equal(dtAddress, spoofedDTAddress, 'incorrect distribute token address stored by constructor')
      assert.equal(prAddress, spoofedPRAddress, 'incorrect project registry address stored by constructor')
      assert.equal(plcrAddress, spoofedPLCRVotingAddress, 'incorrect plcr voting address stored by constructor')
    })
  })

  describe('freezeContract', () => {
    it('not owner is unable to freeze the contract', async () => {
      // take stock of variables
      let owner = await utils.get({fn: spoofedTR.owner})
      let freezeBefore = await utils.get({fn: spoofedTR.freeze})

      // checks
      assert.equal(freezeBefore, false, 'at initialization freeze should be false')
      assert.notEqual(owner, anyAddress, 'ensure attempted freezer is not the owner')

      // not owner attempts to freeze the contract
      errorThrown = false
      try {
        await spoofedTR.freezeContract({from: anyAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('owner is able to freeze the contract', async () => {
      // take stock of variables
      let owner = await utils.get({fn: spoofedTR.owner})
      let freezeBefore = await utils.get({fn: spoofedTR.freeze})

      // checks
      assert.equal(freezeBefore, false, 'after failed freeze attempt, freeze should be false')

      // owner freezes the contract
      await spoofedTR.freezeContract({from: owner})

      // take stock of variables
      let freezeAfter = await utils.get({fn: spoofedTR.freeze})

      // checks
      assert.equal(freezeAfter, true, 'owner should be able to freeze the contract')
    })
  })

  describe('unfreezeContract', () => {
    it('not owner is unable to freeze the contract', async () => {
      // take stock of variables
      let owner = await utils.get({fn: spoofedTR.owner})
      let freezeBefore = await utils.get({fn: spoofedTR.freeze})

      // checks
      assert.equal(freezeBefore, true, 'after freezing, freeze should be true')
      assert.notEqual(owner, anyAddress, 'ensure attempted unfreezer is not the owner')

      // not owner attempts to freeze the contract
      errorThrown = false
      try {
        await spoofedTR.unfreezeContract({from: anyAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('owner is able to unfreeze the contract', async () => {
      // take stock of variables
      let owner = await utils.get({fn: spoofedTR.owner})
      let freezeBefore = await utils.get({fn: spoofedTR.freeze})

      // checks
      assert.equal(freezeBefore, true, 'after failed unfreeze attempt, freeze should be true')

      // owner freezes the contract
      await spoofedTR.unfreezeContract({from: owner})

      // take stock of variables
      let freezeAfter = await utils.get({fn: spoofedTR.freeze})

      // checks
      assert.equal(freezeAfter, false, 'owner should be able to unfreeze the contract')
    })
  })

  describe('updatePLCRVoting', () => {
    it('not owner is unable to update the plcr voting', async () => {
      // take stock of variables
      let owner = await utils.get({fn: spoofedTR.owner})
      let plcrAddress = await utils.get({fn: spoofedTR.plcrVoting})

      // checks
      assert.equal(plcrAddress, spoofedPLCRVotingAddress, 'before updating, plcr voting address should be plcrAddress')
      assert.notEqual(owner, anyAddress, 'ensure attempted updater is not the owner')

      // not owner attempts to freeze the contract
      errorThrown = false
      try {
        await spoofedTR.updatePLCRVoting(anyAddress, {from: anyAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('owner is able to update the plcr voting', async () => {
      // take stock of variables
      let owner = await utils.get({fn: spoofedTR.owner})
      let plcrAddressBefore = await utils.get({fn: spoofedTR.plcrVoting})

      // checks
      assert.equal(plcrAddressBefore, spoofedPLCRVotingAddress, 'before updating, plcr voting address should be plcrAddress')

      // owner freezes the contract
      await spoofedTR.updatePLCRVoting(anyAddress, {from: owner})

      // take stock of variables
      let plcrVotingAddressAfter = await utils.get({fn: spoofedTR.plcrVoting})

      // checks
      assert.equal(plcrVotingAddressAfter, anyAddress, 'after updating, plcr voting address should be anyAddress')

      // put it back
      await spoofedTR.updatePLCRVoting(spoofedPLCRVotingAddress, {from: owner})
    })
  })

  describe('updateDistributeToken', () => {
    it('not owner is unable to update the distribute token', async () => {
      // take stock of variables
      let owner = await utils.get({fn: spoofedTR.owner})
      let dtAddress = await utils.get({fn: spoofedTR.distributeToken})

      // checks
      assert.equal(dtAddress, spoofedDTAddress, 'before updating, distribute token address should be trAddress')
      assert.notEqual(owner, anyAddress, 'ensure attempted updater is not the owner')

      // not owner attempts to freeze the contract
      errorThrown = false
      try {
        await spoofedTR.updateDistributeToken(anyAddress, {from: anyAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('owner is able to update the distribute token', async () => {
      // take stock of variables
      let owner = await utils.get({fn: spoofedTR.owner})
      let dtAddressBefore = await utils.get({fn: spoofedTR.distributeToken})

      // checks
      assert.equal(dtAddressBefore, spoofedDTAddress, 'before updating, distribute token address should be plcrVotingAddress')

      // owner freezes the contract
      await spoofedTR.updateDistributeToken(anyAddress, {from: owner})

      // take stock of variables
      let dtAddressAfter = await utils.get({fn: spoofedTR.distributeToken})

      // checks
      assert.equal(dtAddressAfter, anyAddress, 'after updating, distribute token address should be anyAddress')

      // put it back
      await spoofedTR.updateDistributeToken(spoofedDTAddress, {from: owner})
    })
  })

  describe('updateProjectRegistry', () => {
    it('not owner is unable to update the project registry', async () => {
      // take stock of variables
      let owner = await utils.get({fn: spoofedTR.owner})
      let prAddress = await utils.get({fn: spoofedTR.projectRegistry})

      // checks
      assert.equal(prAddress, spoofedPRAddress, 'before updating, project registry address should be trAddress')
      assert.notEqual(owner, anyAddress, 'ensure attempted updater is not the owner')

      // not owner attempts to freeze the contract
      errorThrown = false
      try {
        await spoofedTR.updateProjectRegistry(anyAddress, {from: anyAddress})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('owner is able to update the project registry', async () => {
      // take stock of variables
      let owner = await utils.get({fn: spoofedTR.owner})
      let prAddressBefore = await utils.get({fn: spoofedTR.projectRegistry})

      // checks
      assert.equal(prAddressBefore, spoofedPRAddress, 'before updating, project registry address should be prAddress')

      // owner freezes the contract
      await spoofedTR.updateProjectRegistry(anyAddress, {from: owner})

      // take stock of variables
      let prAddressAfter = await utils.get({fn: spoofedTR.projectRegistry})

      // checks
      assert.equal(prAddressAfter, anyAddress, 'after updating, project registry address should be anyAddress')

      // put it back
      await spoofedTR.updateProjectRegistry(spoofedPRAddress, {from: owner})
    })
  })
})
