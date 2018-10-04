/* eslint-env mocha */
/* global assert contract */

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
const taskDetails = require('../utils/taskDetails')

contract('Complete State', (accounts) => {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let TR, RR
  let {user, project, utils, returnProject} = projObj
  let {tokenProposer, repProposer, tokenStaker1, repStaker1, notStaker} = user
  let {projectCost, stakingPeriod, ipfsHash} = project

  // set up task details & hashing functions
  let {taskSet4} = taskDetails

  // local test variables
  let projArray
  let errorThrown
  let projAddrT, projAddrR

  // define validaton indices
  let valTrueOnly = 0
  // let valFalseOnly = 1
  let valTrueMore = 2
  let valFalseMore = 3
  // let valNeither = 4

  let valType = [valTrueOnly, valTrueMore, valFalseMore]

  // define voting indices
  let voteNeither = 0
  // let voteTrueOnly = 1
  // let voteFalseOnly = 2
  let voteTrueMore = 3
  // let voteFalseMore = 4

  let voteType = [voteNeither, voteTrueMore, voteTrueMore]

  let fastForwards = 15 // ganache 15 weeks ahead at this point from previous tests' evmIncreaseTime()

  before(async () => {
    // get contract
    await projObj.contracts.setContracts()
    TR = projObj.contracts.TR
    RR = projObj.contracts.RR

    // get finished - complete projects
    // moves ganache forward 6 more weeks
    projArray = await returnProject.finished(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash, taskSet4, taskSet4.length, valType, voteType, 6)

    projAddrT = projArray[0][0]
    projAddrR = projArray[0][1]
  })

  describe('handle proposer', () => {
    it('refund proposer can be called on TR complete project', async () => {
      // take stock of variables
      let proposedWeiCost = await project.getProposedWeiCost(projAddrT)

      let tpBalBefore = await utils.getTokenBalance(tokenProposer)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let projWeiBalBefore = await project.getWeiCost(projAddrT, true)
      let proposerStakeBefore = await project.getProposerStake(projAddrT)

      // call refund proposer
      await TR.refundProposer(projAddrT, {from: tokenProposer})

      // take stock of variables
      let tpBalAfter = await utils.getTokenBalance(tokenProposer)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let projWeiBalAfter = await project.getWeiCost(projAddrT, true)
      let proposerStakeAfter = await project.getProposerStake(projAddrT)

      let projWeiCostDifference = projWeiBalBefore.minus(projWeiBalAfter).toNumber()

      // checks
      assert.equal(tpBalBefore + proposerStakeBefore, tpBalAfter, 'tokenProposer balance updated incorrectly')
      assert.equal(TRBalBefore, TRBalAfter + proposerStakeBefore, 'TR balance updated incorrectly')
      assert.equal(weiPoolBefore - Math.floor(proposedWeiCost / 20), weiPoolAfter, 'wei pool should be 5% of the project\'s proposed cost less')
      assert.equal(projWeiCostDifference, 0, 'project wei cost should remain the same')
      assert.equal(proposerStakeAfter, 0, 'proposer stake should have been zeroed out')
    })

    it('refund proposer can be called on RR complete project', async () => {
      // take stock of variables
      let proposedWeiCost = await project.getProposedWeiCost(projAddrR)

      let rpBalBefore = await utils.getRepBalance(repProposer)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let projWeiBalBefore = await project.getWeiCost(projAddrR, true)
      let proposerStakeBefore = await project.getProposerStake(projAddrR)

      // call refund proposer
      await RR.refundProposer(projAddrR, {from: repProposer})

      // take stock of variables
      let rpBalAfter = await utils.getRepBalance(repProposer)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let projWeiBalAfter = await project.getWeiCost(projAddrR, true)
      let proposerStakeAfter = await project.getProposerStake(projAddrR)

      let projWeiCostDifference = projWeiBalBefore.minus(projWeiBalAfter).toNumber()

      // checks
      assert.equal(rpBalBefore + proposerStakeBefore, rpBalAfter, 'tokenProposer balance updated incorrectly')
      assert.equal(weiPoolBefore - Math.floor(proposedWeiCost / 20), weiPoolAfter, 'wei pool should be 5% of the project\'s proposed cost less')
      assert.equal(projWeiCostDifference, 0, 'project wei cost should remain the same')
      assert.equal(proposerStakeAfter, 0, 'proposer stake should have been zeroed out')
    })

    it('proposer can\'t call refund proposer multiple times from token registry', async () => {
      errorThrown = false
      try {
        await TR.refundProposer(projAddrT, {from: tokenProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('proposer can\'t call refund proposer multiple times from reputation registry', async () => {
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
    it('token staker can ask for refund from TR complete project', async () => {
      // take stock of variables before
      let totalTokensBefore = await utils.getTotalTokens()
      let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let tsProjBalBefore = await project.getUserStakedTokens(tokenStaker1, projAddrT)
      let passAmount = await project.getPassAmount(projAddrT)

      // calculate refund & reward
      let refund = Math.floor((tsProjBalBefore * passAmount) / 100)
      let reward = Math.floor(refund / 20)

      // refund staker
      await TR.refundStaker(projAddrT, {from: tokenStaker1})

      // take stock of variables after
      let totalTokensAfter = await utils.getTotalTokens()
      let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let tsProjBalAfter = await project.getUserStakedTokens(tokenStaker1, projAddrT)

      // checks
      assert.equal(totalTokensBefore + reward, totalTokensAfter, 'incorrect token reward minted')
      assert.equal(tsBalBefore + reward + refund, tsBalAfter, 'incorrect token staker balance post-refund')
      assert.equal(TRBalAfter + refund, TRBalBefore, 'incorrect TR balance post-refund')
      assert.equal(tsProjBalBefore, refund, 'incorrect refund calculation')
      assert.equal(tsProjBalAfter, 0, 'staker should no longer have any tokens staked on the project')
    })

    it('token staker can ask for refund from RR complete project', async () => {
      // take stock of variables before
      let totalTokensBefore = await utils.getTotalTokens()
      let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let tsProjBalBefore = await project.getUserStakedTokens(tokenStaker1, projAddrR)
      let passAmount = await project.getPassAmount(projAddrR)

      // calculate refund & reward
      let refund = Math.floor((tsProjBalBefore * passAmount) / 100)
      let reward = Math.floor(refund / 20)

      // refund staker
      await TR.refundStaker(projAddrR, {from: tokenStaker1})

      // take stock of variables after
      let totalTokensAfter = await utils.getTotalTokens()
      let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let tsProjBalAfter = await project.getUserStakedTokens(tokenStaker1, projAddrR)

      // checks
      assert.equal(totalTokensBefore + reward, totalTokensAfter, 'incorrect token reward minted')
      assert.equal(tsBalBefore + reward + refund, tsBalAfter, 'incorrect token staker balance post-refund')
      assert.equal(TRBalAfter + refund, TRBalBefore, 'incorrect TR balance post-refund')
      assert.equal(tsProjBalBefore, refund, 'incorrect refund calculation')
      assert.equal(tsProjBalAfter, 0, 'staker should no longer have any tokens staked on the project')
    })

    it('reputation staker can ask for refund from TR complete project', async () => {
      // take stock of variables before
      let totalRepBefore = await utils.getTotalRep()
      let rsBalBefore = await utils.getRepBalance(repStaker1)
      let rsProjBalBefore = await project.getUserStakedRep(repStaker1, projAddrT)
      let passAmount = await project.getPassAmount(projAddrT)

      // calculate refund & reward
      let refund = Math.floor((rsProjBalBefore * passAmount) / 100)
      let reward = Math.floor(refund / 2)

      // refund staker
      await RR.refundStaker(projAddrT, {from: repStaker1})

      // take stock of variables after
      let totalRepAfter = await utils.getTotalRep()
      let rsBalAfter = await utils.getRepBalance(repStaker1)
      let rsProjBalAfter = await project.getUserStakedRep(repStaker1, projAddrT)

      // checks
      assert.equal(totalRepBefore + reward, totalRepAfter, 'incorrect rep reward calculated')
      assert.equal(rsBalBefore + reward + refund, rsBalAfter, 'incorrect reputation staker balance post-refund')
      assert.equal(rsProjBalBefore, refund, 'incorrect refund calculation')
      assert.equal(rsProjBalAfter, 0, 'staker should no longer have any tokens staked on the project')
    })

    it('reputation staker can ask for refund from RR complete project', async () => {
      // take stock of variables before
      let totalTokensBefore = await utils.getTotalTokens()
      let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let tsProjBalBefore = await project.getUserStakedTokens(tokenStaker1, projAddrR)
      let passAmount = await project.getPassAmount(projAddrR)

      // calculate refund & reward
      let refund = Math.floor((tsProjBalBefore * passAmount) / 100)
      let reward = Math.floor(refund / 20)

      // refund staker
      await RR.refundStaker(projAddrR, {from: repStaker1})

      // take stock of variables after
      let totalTokensAfter = await utils.getTotalTokens()
      let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let tsProjBalAfter = await project.getUserStakedTokens(tokenStaker1, projAddrR)

      // checks
      assert.equal(totalTokensBefore + reward, totalTokensAfter, 'incorrect token reward minted')
      assert.equal(tsBalBefore + reward + refund, tsBalAfter, 'incorrect token staker balance post-refund')
      assert.equal(TRBalAfter + refund, TRBalBefore, 'incorrect TR balance post-refund')
      assert.equal(tsProjBalBefore, refund, 'incorrect refund calculation')
      assert.equal(tsProjBalAfter, 0, 'staker should no longer have any tokens staked on the project')
    })

    it('not staker can\'t ask for token refund from TR complete project', async () => {
      errorThrown = false
      try {
        await TR.refundStaker(projAddrT, {from: notStaker})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not staker can\'t ask for token refund from RR complete project', async () => {
      errorThrown = false
      try {
        await TR.refundStaker(projAddrR, {from: notStaker})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not staker can\'t ask for reputation refund from TR complete project', async () => {
      errorThrown = false
      try {
        await RR.refundStaker(projAddrT, {from: notStaker})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not staker can\'t ask for reputation refund from TR complete project', async () => {
      errorThrown = false
      try {
        await RR.refundStaker(projAddrR, {from: notStaker})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('all stakers can be rewarded from TR complete project', async () => {
    })

    it('all stakers can be rewarded from RR complete project', async () => {
    })
  })

  describe('handle workers', () => {
    it('worker can ask for reward from TR complete project', async () => {
    })

    it('worker can ask for reward from RR complete project', async () => {
    })

    it('not worker can\'t ask for reward from TR complete project', async () => {
    })

    it('worker can\'t ask for reward from RR complete project', async () => {
    })

    it('all workers can be rewarded from TR complete project', async () => {
    })

    it('all workers can be rewarded from RR complete project', async () => {
    })
  })

  describe('handle validators', () => {
    it('yes validator can ask for reward from TR complete project', async () => {
    })

    it('yes validator can ask for reward from RR complete project', async () => {
    })

    it('no validator can\'t ask for reward from TR complete project', async () => {
    })

    it('no validator can\'t ask for reward from RR complete project', async () => {
    })

    it('not validator can\'t ask for reward from TR complete project', async () => {
    })

    it('validator can\'t ask for reward from RR complete project', async () => {
    })

    it('all eligible validators can be rewarded from TR complete project', async () => {
    })

    it('all eligible validators can be reward from RR complete project', async () => {
    })
  })

  describe('handle voters', () => {
    it('yes voter can ask for refund from TR complete project', async () => {
    })

    it('yes voter can ask for refund from RR complete project', async () => {
    })

    it('no voter can ask for refund from TR complete project', async () => {
    })

    it('no voter can ask for refund from RR complete project', async () => {
    })

    it('not voter can\'t ask for refund from TR complete project', async () => {
    })

    it('voter can\'t ask for refund from RR complete project', async () => {
    })

    it('all eligible voters can be refunded from TR complete project', async () => {
    })

    it('all eligible voters can be refund from RR complete project', async () => {
    })
  })

  describe('project contract empty', () => {
    it('TR complete project has 0 wei, 0 tokens staked, and 0 reputation staked', async () => {
    })

    it('RR complete project has 0 wei, 0 tokens staked, and 0 reputation staked', async () => {
    })
  })
})
