/* eslint-env mocha */
/* global assert contract */

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')

contract('Expired State', function (accounts) {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let DT, TR, RR
  let {user, project, variables, utils, returnProject} = projObj
  let {tokenProposer, repProposer} = user
  let {tokenStaker1, repStaker1, notStaker} = user
  let {projectCost, stakingPeriod, ipfsHash} = variables

  // local test variables
  let projArray
  let errorThrown
  let projAddrT, projAddrR

  let fastForwards = 28 // testrpc is 28 weeks ahead at this point

  before(async function () {
    // get contract
    await projObj.contracts.setContracts()
    DT = projObj.contracts.DT
    TR = projObj.contracts.TR
    RR = projObj.contracts.RR

    // get finished - expired projects
    projArray = await returnProject.expired(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash, 1)

    projAddrT = projArray[0][0]
    projAddrR = projArray[0][1]
  })

  describe('handle proposer', () => {
    it('proposer can\'t call refund proposer from token registry', async () => {
      errorThrown = false
      try {
        await TR.refundProposer(projAddrT, {from: tokenProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('proposer can\'t call refund proposer from reputation registry', async () => {
      errorThrown = false
      try {
        await RR.refundProposer(projAddrR, {from: repProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('handle stakers', () => {
    it('token staker can ask for refund from TR expired project', async () => {
      // take stock of variables before
      let totalTokensBefore = await utils.get({fn: DT.totalSupply, bn: false})
      let tsBalBefore = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let TRBalBefore = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let projTokensBefore = await project.get({projAddr: projAddrT, fn: 'tokensStaked', bn: false})
      let tsProjBalBefore = await project.get({projAddr: projAddrT, fn: 'tokenBalances', params: tokenStaker1, bn: false})

      // calculate refund & reward
      let refund = tsProjBalBefore

      // refund staker
      await TR.refundStaker(projAddrT, {from: tokenStaker1})

      // take stock of variables after
      let totalTokensAfter = await utils.get({fn: DT.totalSupply, bn: false})
      let tsBalAfter = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let TRBalAfter = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let projTokensAfter = await project.get({projAddr: projAddrT, fn: 'tokensStaked', bn: false})
      let tsProjBalAfter = await project.get({projAddr: projAddrT, fn: 'tokenBalances', params: tokenStaker1, bn: false})

      // checks
      assert.equal(totalTokensBefore, totalTokensAfter, 'incorrect token reward minted')
      assert.equal(tsBalBefore + refund, tsBalAfter, 'incorrect token staker balance post-refund')
      assert.equal(TRBalAfter + refund, TRBalBefore, 'incorrect TR balance post-refund')
      assert.equal(tsProjBalBefore, refund, 'incorrect refund calculation')
      assert.equal(projTokensAfter + refund, projTokensBefore, 'incorrect change in total staked tokens on project')
      assert.equal(tsProjBalAfter, 0, 'staker should no longer have any tokens staked on the project')
    })

    it('token staker can ask for refund from RR expired project', async () => {
      // take stock of variables before
      let totalTokensBefore = await utils.get({fn: DT.totalSupply, bn: false})
      let tsBalBefore = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let TRBalBefore = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let projTokensBefore = await project.get({projAddr: projAddrR, fn: 'tokensStaked', bn: false})
      let tsProjBalBefore = await project.get({projAddr: projAddrR, fn: 'tokenBalances', params: tokenStaker1, bn: false})

      // calculate refund & reward
      let refund = tsProjBalBefore

      // refund staker
      await TR.refundStaker(projAddrR, {from: tokenStaker1})

      // take stock of variables after
      let totalTokensAfter = await utils.get({fn: DT.totalSupply, bn: false})
      let tsBalAfter = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let TRBalAfter = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let projTokensAfter = await project.get({projAddr: projAddrR, fn: 'tokensStaked', bn: false})
      let tsProjBalAfter = await project.get({projAddr: projAddrR, fn: 'tokenBalances', params: tokenStaker1, bn: false})

      // checks
      assert.equal(totalTokensBefore, totalTokensAfter, 'incorrect token reward minted')
      assert.equal(tsBalBefore + refund, tsBalAfter, 'incorrect token staker balance post-refund')
      assert.equal(TRBalAfter + refund, TRBalBefore, 'incorrect TR balance post-refund')
      assert.equal(tsProjBalBefore, refund, 'incorrect refund calculation')
      assert.equal(projTokensAfter + refund, projTokensBefore, 'incorrect change in total staked tokens on project')
      assert.equal(tsProjBalAfter, 0, 'staker should no longer have any tokens staked on the project')
    })

    it('reputation staker can ask for refund from TR expired project', async () => {
      // take stock of variables before
      let totalRepBefore = await utils.get({fn: RR.totalSupply, bn: false})
      let rsBalBefore = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let projRepBefore = await project.get({projAddr: projAddrT, fn: 'reputationStaked', bn: false})
      let rsProjBalBefore = await project.get({projAddr: projAddrT, fn: 'reputationBalances', params: repStaker1, bn: false})

      // calculate refund & reward
      let refund = rsProjBalBefore

      // refund staker
      await RR.refundStaker(projAddrT, {from: repStaker1})

      // take stock of variables after
      let totalRepAfter = await utils.get({fn: RR.totalSupply, bn: false})
      let rsBalAfter = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let projRepAfter = await project.get({projAddr: projAddrT, fn: 'reputationStaked', bn: false})
      let rsProjBalAfter = await project.get({projAddr: projAddrT, fn: 'reputationBalances', params: repStaker1, bn: false})

      // checks
      assert.equal(totalRepBefore, totalRepAfter, 'incorrect rep reward calculated')
      assert.equal(rsBalBefore + refund, rsBalAfter, 'incorrect reputation staker balance post-refund')
      assert.equal(rsProjBalBefore, refund, 'incorrect refund calculation')
      assert.equal(projRepAfter + refund, projRepBefore, 'incorrect change in total staked rep on project')
      assert.equal(rsProjBalAfter, 0, 'staker should no longer have any tokens staked on the project')
    })

    it('reputation staker can ask for refund from RR expired project', async () => {
      // take stock of variables before
      let totalRepBefore = await utils.get({fn: RR.totalSupply, bn: false})
      let rsBalBefore = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let projRepBefore = await project.get({projAddr: projAddrR, fn: 'reputationStaked', bn: false})
      let rsProjBalBefore = await project.get({projAddr: projAddrR, fn: 'reputationBalances', params: repStaker1, bn: false})

      // calculate refund & reward
      let refund = rsProjBalBefore

      // refund staker
      await RR.refundStaker(projAddrR, {from: repStaker1})

      // take stock of variables after
      let totalRepAfter = await utils.get({fn: RR.totalSupply, bn: false})
      let rsBalAfter = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let projRepAfter = await project.get({projAddr: projAddrR, fn: 'reputationStaked', bn: false})
      let rsProjBalAfter = await project.get({projAddr: projAddrR, fn: 'reputationBalances', params: repStaker1, bn: false})

      // checks
      assert.equal(totalRepBefore, totalRepAfter, 'incorrect rep reward calculated')
      assert.equal(rsBalBefore + refund, rsBalAfter, 'incorrect reputation staker balance post-refund')
      assert.equal(rsProjBalBefore, refund, 'incorrect refund calculation')
      assert.equal(projRepAfter + refund, projRepBefore, 'incorrect change in total staked rep on project')
      assert.equal(rsProjBalAfter, 0, 'staker should no longer have any tokens staked on the project')
    })

    it('not staker can\'t ask for token refund from TR expired project', async () => {
      errorThrown = false
      try {
        await TR.refundStaker(projAddrT, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not staker can\'t ask for token refund from RR expired project', async () => {
      errorThrown = false
      try {
        await TR.refundStaker(projAddrR, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not staker can\'t ask for reputation refund from TR expired project', async () => {
      errorThrown = false
      try {
        await RR.refundStaker(projAddrT, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not staker can\'t ask for reputation refund from TR expired project', async () => {
      errorThrown = false
      try {
        await RR.refundStaker(projAddrR, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })
  })
})
