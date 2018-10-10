/* eslint-env mocha */
/* global assert contract */

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')

contract('Expired State', (accounts) => {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let TR, RR
  let {user, project, utils, returnProject} = projObj
  let {tokenProposer, repProposer} = user
  let {tokenStaker1, repStaker1, notStaker} = user
  let {projectCost, stakingPeriod, ipfsHash} = project

  // local test variables
  let projArray
  let errorThrown
  let projAddrT, projAddrR

  before(async () => {
    // get contract
    await projObj.contracts.setContracts()
    TR = projObj.contracts.TR
    RR = projObj.contracts.RR

    // get finished - expired projects
    // moves ganache forward 1 more week
    projArray = await returnProject.expired(projectCost, stakingPeriod, ipfsHash, 1)

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
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('proposer can\'t call refund proposer from reputation registry', async () => {
      errorThrown = false
      try {
        await RR.refundProposer(projAddrR, {from: repProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('handle stakers', () => {
    it('token staker can ask for refund from TR expired project', async () => {
      // take stock of variables before
      let totalTokensBefore = await utils.getTotalTokens()
      let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let projTokensBefore = await project.getStakedTokens(projAddrT)
      let tsProjBalBefore = await project.getUserStakedTokens(tokenStaker1, projAddrT)

      // calculate refund & reward
      let refund = tsProjBalBefore

      // refund staker
      await TR.refundStaker(projAddrT, {from: tokenStaker1})

      // take stock of variables after
      let totalTokensAfter = await utils.getTotalTokens()
      let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let projTokensAfter = await project.getStakedTokens(projAddrT)
      let tsProjBalAfter = await project.getUserStakedTokens(tokenStaker1, projAddrT)

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
      let totalTokensBefore = await utils.getTotalTokens()
      let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let projTokensBefore = await project.getStakedTokens(projAddrR)
      let tsProjBalBefore = await project.getUserStakedTokens(tokenStaker1, projAddrR)

      // calculate refund & reward
      let refund = tsProjBalBefore

      // refund staker
      await TR.refundStaker(projAddrR, {from: tokenStaker1})

      // take stock of variables after
      let totalTokensAfter = await utils.getTotalTokens()
      let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let projTokensAfter = await project.getStakedTokens(projAddrR)
      let tsProjBalAfter = await project.getUserStakedTokens(tokenStaker1, projAddrR)

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
      let totalRepBefore = await utils.getTotalRep()
      let rsBalBefore = await utils.getRepBalance(repStaker1)
      let projRepBefore = await project.getStakedRep(projAddrT)
      let rsProjBalBefore = await project.getUserStakedRep(repStaker1, projAddrT)

      // calculate refund & reward
      let refund = rsProjBalBefore

      // refund staker
      await RR.refundStaker(projAddrT, {from: repStaker1})

      // take stock of variables after
      let totalRepAfter = await utils.getTotalRep()
      let rsBalAfter = await utils.getRepBalance(repStaker1)
      let projRepAfter = await project.getStakedRep(projAddrT)
      let rsProjBalAfter = await project.getUserStakedRep(repStaker1, projAddrT)

      // checks
      assert.equal(totalRepBefore, totalRepAfter, 'incorrect rep reward calculated')
      assert.equal(rsBalBefore + refund, rsBalAfter, 'incorrect reputation staker balance post-refund')
      assert.equal(rsProjBalBefore, refund, 'incorrect refund calculation')
      assert.equal(projRepAfter + refund, projRepBefore, 'incorrect change in total staked rep on project')
      assert.equal(rsProjBalAfter, 0, 'staker should no longer have any tokens staked on the project')
    })

    it('reputation staker can ask for refund from RR expired project', async () => {
      // take stock of variables before
      let totalRepBefore = await utils.getTotalRep()
      let rsBalBefore = await utils.getRepBalance(repStaker1)
      let projRepBefore = await project.getStakedRep(projAddrR)
      let rsProjBalBefore = await project.getUserStakedRep(repStaker1, projAddrR)

      // calculate refund & reward
      let refund = rsProjBalBefore

      // refund staker
      await RR.refundStaker(projAddrR, {from: repStaker1})

      // take stock of variables after
      let totalRepAfter = await utils.getTotalRep()
      let rsBalAfter = await utils.getRepBalance(repStaker1)
      let projRepAfter = await project.getStakedRep(projAddrR)
      let rsProjBalAfter = await project.getUserStakedRep(repStaker1, projAddrR)

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
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not staker can\'t ask for token refund from RR expired project', async () => {
      errorThrown = false
      try {
        await TR.refundStaker(projAddrR, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not staker can\'t ask for reputation refund from TR expired project', async () => {
      errorThrown = false
      try {
        await RR.refundStaker(projAddrT, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not staker can\'t ask for reputation refund from TR expired project', async () => {
      errorThrown = false
      try {
        await RR.refundStaker(projAddrR, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })
})
