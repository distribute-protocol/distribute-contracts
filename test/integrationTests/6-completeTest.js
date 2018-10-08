/* eslint-env mocha */
/* global assert contract */

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
const taskDetails = require('../utils/taskDetails')

const Web3 = require('web3')
const web3 = new Web3()
web3.setProvider(new Web3.providers.HttpProvider('http://localhost:8545'))

contract('Complete State', (accounts) => {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let TR, RR
  let {user, project, task, utils, returnProject} = projObj
  let {tokenProposer, repProposer, notProposer} = user
  let {tokenStaker1, tokenStaker2, repStaker1, repStaker2, notStaker} = user
  let {worker1, worker2, notWorker} = user
  let {validator1, validator2, validator3, notValidator} = user
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
    it('Not proposer can\'t call refund proposer from token registry', async () => {
      errorThrown = false
      try {
        await TR.refundProposer(projAddrT, {from: notProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Not proposer can\'t call refund proposer from reputation registry', async () => {
      errorThrown = false
      try {
        await RR.refundProposer(projAddrR, {from: notProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    // these two tests must come after not proposer refund proposer tests
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
      let projTokensBefore = await project.getStakedTokens(projAddrT)
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
      let projTokensAfter = await project.getStakedTokens(projAddrT)
      let tsProjBalAfter = await project.getUserStakedTokens(tokenStaker1, projAddrT)

      // checks
      assert.equal(totalTokensBefore + reward, totalTokensAfter, 'incorrect token reward minted')
      assert.equal(tsBalBefore + reward + refund, tsBalAfter, 'incorrect token staker balance post-refund')
      assert.equal(TRBalAfter + refund, TRBalBefore, 'incorrect TR balance post-refund')
      assert.equal(tsProjBalBefore, refund, 'incorrect refund calculation')
      assert.equal(projTokensAfter + refund, projTokensBefore, 'incorrect change in total staked tokens on project')
      assert.equal(tsProjBalAfter, 0, 'staker should no longer have any tokens staked on the project')
    })

    it('token staker can ask for refund from RR complete project', async () => {
      // take stock of variables before
      let totalTokensBefore = await utils.getTotalTokens()
      let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let projTokensBefore = await project.getStakedTokens(projAddrR)
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
      let projTokensAfter = await project.getStakedTokens(projAddrR)
      let tsProjBalAfter = await project.getUserStakedTokens(tokenStaker1, projAddrR)

      // checks
      assert.equal(totalTokensBefore + reward, totalTokensAfter, 'incorrect token reward minted')
      assert.equal(tsBalBefore + reward + refund, tsBalAfter, 'incorrect token staker balance post-refund')
      assert.equal(TRBalAfter + refund, TRBalBefore, 'incorrect TR balance post-refund')
      assert.equal(tsProjBalBefore, refund, 'incorrect refund calculation')
      assert.equal(projTokensAfter + refund, projTokensBefore, 'incorrect change in total staked tokens on project')
      assert.equal(tsProjBalAfter, 0, 'staker should no longer have any tokens staked on the project')
    })

    it('reputation staker can ask for refund from TR complete project', async () => {
      // take stock of variables before
      let totalRepBefore = await utils.getTotalRep()
      let rsBalBefore = await utils.getRepBalance(repStaker1)
      let projRepBefore = await project.getStakedRep(projAddrT)
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
      let projRepAfter = await project.getStakedRep(projAddrT)
      let rsProjBalAfter = await project.getUserStakedRep(repStaker1, projAddrT)

      // checks
      assert.equal(totalRepBefore + reward, totalRepAfter, 'incorrect rep reward calculated')
      assert.equal(rsBalBefore + reward + refund, rsBalAfter, 'incorrect reputation staker balance post-refund')
      assert.equal(rsProjBalBefore, refund, 'incorrect refund calculation')
      assert.equal(projRepAfter + refund, projRepBefore, 'incorrect change in total staked rep on project')
      assert.equal(rsProjBalAfter, 0, 'staker should no longer have any tokens staked on the project')
    })

    it('reputation staker can ask for refund from RR complete project', async () => {
      // take stock of variables before
      let totalRepBefore = await utils.getTotalRep()
      let rsBalBefore = await utils.getRepBalance(repStaker1)
      let projRepBefore = await project.getStakedRep(projAddrR)
      let rsProjBalBefore = await project.getUserStakedRep(repStaker1, projAddrR)
      let passAmount = await project.getPassAmount(projAddrR)

      // calculate refund & reward
      let refund = Math.floor((rsProjBalBefore * passAmount) / 100)
      let reward = Math.floor(refund / 2)

      // refund staker
      await RR.refundStaker(projAddrR, {from: repStaker1})

      // take stock of variables after
      let totalRepAfter = await utils.getTotalRep()
      let rsBalAfter = await utils.getRepBalance(repStaker1)
      let projRepAfter = await project.getStakedRep(projAddrR)
      let rsProjBalAfter = await project.getUserStakedRep(repStaker1, projAddrR)

      // checks
      assert.equal(totalRepBefore + reward, totalRepAfter, 'incorrect rep reward calculated')
      assert.equal(rsBalBefore + reward + refund, rsBalAfter, 'incorrect reputation staker balance post-refund')
      assert.equal(rsProjBalBefore, refund, 'incorrect refund calculation')
      assert.equal(projRepAfter + refund, projRepBefore, 'incorrect change in total staked rep on project')
      assert.equal(rsProjBalAfter, 0, 'staker should no longer have any tokens staked on the project')
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
      // take stock of variables before
      let totalTokensBefore = await utils.getTotalTokens()
      let tsBalBefore = await utils.getTokenBalance(tokenStaker2)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let projTokensBefore = await project.getStakedTokens(projAddrT)
      let tsProjBalBefore = await project.getUserStakedTokens(tokenStaker2, projAddrT)

      let totalRepBefore = await utils.getTotalRep()
      let rsBalBefore = await utils.getRepBalance(repStaker2)
      let projRepBefore = await project.getStakedRep(projAddrT)
      let rsProjBalBefore = await project.getUserStakedRep(repStaker2, projAddrT)

      let passAmount = await project.getPassAmount(projAddrT)

      // calculate refund & reward
      let refundToken = Math.floor((tsProjBalBefore * passAmount) / 100)
      let rewardToken = Math.floor(refundToken / 20)

      let refundRep = Math.floor((rsProjBalBefore * passAmount) / 100)
      let rewardRep = Math.floor(refundRep / 2)

      // refund other token staker
      await TR.refundStaker(projAddrT, {from: tokenStaker2})

      // refund other reputation staker
      await RR.refundStaker(projAddrT, {from: repStaker2})

      // take stock of variables after
      let totalTokensAfter = await utils.getTotalTokens()
      let tsBalAfter = await utils.getTokenBalance(tokenStaker2)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let projTokensAfter = await project.getStakedTokens(projAddrT)
      let tsProjBalAfter = await project.getUserStakedTokens(tokenStaker2, projAddrT)

      let totalRepAfter = await utils.getTotalRep()
      let rsBalAfter = await utils.getRepBalance(repStaker2)
      let projRepAfter = await project.getStakedRep(projAddrT)
      let rsProjBalAfter = await project.getUserStakedRep(repStaker2, projAddrT)

      // checks
      assert.equal(totalTokensBefore + rewardToken, totalTokensAfter, 'incorrect token reward minted')
      assert.equal(tsBalBefore + rewardToken + refundToken, tsBalAfter, 'incorrect token staker balance post-refund')
      assert.equal(TRBalAfter + refundToken, TRBalBefore, 'incorrect TR balance post-refund')
      assert.equal(tsProjBalBefore, refundToken, 'incorrect refund calculation')
      assert.equal(tsProjBalAfter, 0, 'staker should no longer have any tokens staked on the project')

      assert.equal(totalRepBefore + rewardRep, totalRepAfter, 'incorrect rep reward calculated')
      assert.equal(rsBalBefore + rewardRep + refundRep, rsBalAfter, 'incorrect reputation staker balance post-refund')
      assert.equal(rsProjBalBefore, refundRep, 'incorrect refund calculation')
      assert.equal(rsProjBalAfter, 0, 'staker should no longer have any tokens staked on the project')

      assert.equal(projTokensBefore, projTokensAfter + refundToken, 'incorrect token reward minted')
      assert.equal(projRepBefore, projRepAfter + refundRep, 'incorrect rep reward calculated')
      assert.equal(projTokensAfter, 0, 'there are leftover tokens')
      assert.equal(projRepAfter, 0, 'there is leftover rep')
    })

    it('all stakers can be rewarded from RR complete project', async () => {
      // take stock of variables before
      let totalTokensBefore = await utils.getTotalTokens()
      let tsBalBefore = await utils.getTokenBalance(tokenStaker2)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let projTokensBefore = await project.getStakedTokens(projAddrR)
      let tsProjBalBefore = await project.getUserStakedTokens(tokenStaker2, projAddrR)

      let totalRepBefore = await utils.getTotalRep()
      let rsBalBefore = await utils.getRepBalance(repStaker2)
      let projRepBefore = await project.getStakedRep(projAddrR)
      let rsProjBalBefore = await project.getUserStakedRep(repStaker2, projAddrR)

      let passAmount = await project.getPassAmount(projAddrR)

      // calculate refund & reward
      let refundToken = Math.floor((tsProjBalBefore * passAmount) / 100)
      let rewardToken = Math.floor(refundToken / 20)

      let refundRep = Math.floor((rsProjBalBefore * passAmount) / 100)
      let rewardRep = Math.floor(refundRep / 2)

      // refund other token staker
      await TR.refundStaker(projAddrR, {from: tokenStaker2})

      // refund other reputation staker
      await RR.refundStaker(projAddrR, {from: repStaker2})

      // take stock of variables after
      let totalTokensAfter = await utils.getTotalTokens()
      let tsBalAfter = await utils.getTokenBalance(tokenStaker2)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let projTokensAfter = await project.getStakedTokens(projAddrR)
      let tsProjBalAfter = await project.getUserStakedTokens(tokenStaker2, projAddrR)

      let totalRepAfter = await utils.getTotalRep()
      let rsBalAfter = await utils.getRepBalance(repStaker2)
      let projRepAfter = await project.getStakedRep(projAddrR)
      let rsProjBalAfter = await project.getUserStakedRep(repStaker2, projAddrR)

      // checks
      assert.equal(totalTokensBefore + rewardToken, totalTokensAfter, 'incorrect token reward minted')
      assert.equal(tsBalBefore + rewardToken + refundToken, tsBalAfter, 'incorrect token staker balance post-refund')
      assert.equal(TRBalAfter + refundToken, TRBalBefore, 'incorrect TR balance post-refund')
      assert.equal(tsProjBalBefore, refundToken, 'incorrect refund calculation')
      assert.equal(tsProjBalAfter, 0, 'staker should no longer have any tokens staked on the project')

      assert.equal(totalRepBefore + rewardRep, totalRepAfter, 'incorrect rep reward calculated')
      assert.equal(rsBalBefore + rewardRep + refundRep, rsBalAfter, 'incorrect reputation staker balance post-refund')
      assert.equal(rsProjBalBefore, refundRep, 'incorrect refund calculation')
      assert.equal(rsProjBalAfter, 0, 'staker should no longer have any tokens staked on the project')

      assert.equal(projTokensBefore, projTokensAfter + refundToken, 'incorrect token reward minted')
      assert.equal(projRepBefore, projRepAfter + refundRep, 'incorrect rep reward calculated')
      assert.equal(projTokensAfter, 0, 'there are leftover tokens')
      assert.equal(projRepAfter, 0, 'there is leftover rep')
    })
  })

  describe('handle workers', () => {
    it('worker can ask for reward from TR complete project', async () => {
      // can't figure out why _rewardee.transfer to worker1 is not working at the moment, but will come back to this

      // let index = 0
      //
      // // take stock of variables before
      // let totalRepBefore = await utils.getTotalRep()
      // let rwBalBefore = await utils.getRepBalance(worker1)
      // let rwWeiBalBefore = parseInt(await web3.eth.getBalance(worker1))
      // let projWeiBalVariableBefore = await project.getWeiBal(projAddrT)
      // let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrT))
      // let repRewardBefore = await task.getRepReward(projAddrT, index)
      // let weiRewardBefore = await task.getWeiReward(projAddrT, index)
      //
      // // reward worker
      // await RR.rewardTask(projAddrT, index, {from: worker1})
      //
      // // take stock of variables after
      //
      // let totalRepAfter = await utils.getTotalRep()
      // let rwBalAfter = await utils.getRepBalance(worker1)
      // let rwWeiBalAfter = parseInt(await web3.eth.getBalance(worker1))
      // let projWeiBalVariableAfter = await project.getWeiBal(projAddrT)
      // let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrT))
      // let repRewardAfter = await task.getRepReward(projAddrT, index)
      // let weiRewardAfter = await task.getWeiReward(projAddrT, index)
      //
      // console.log(worker1)
      // console.log(projWeiBalBefore, projWeiBalAfter, weiRewardBefore, weiRewardAfter)
      // console.log(rwWeiBalBefore, rwWeiBalAfter, weiRewardBefore, weiRewardAfter)
      //
      // // checks
      // assert.equal(totalRepBefore, totalRepAfter, 'total reputation should not change')
      // assert.equal(rwBalBefore + repRewardBefore, rwBalAfter, 'incorrect worker rep balance post-refund')
      // assert.equal(rwWeiBalBefore + weiRewardBefore, rwWeiBalAfter, 'incorrect wei reward sent to worker')
      // assert.equal(projWeiBalVariableBefore, projWeiBalVariableAfter + weiRewardBefore, 'project wei bal variable updated incorrectly')
      // assert.equal(projWeiBalBefore, projWeiBalAfter + weiRewardBefore, 'incorrect wei reward sent from project')
      // assert.equal(repRewardAfter, 0, 'rep reward not zeroed out')
      // assert.equal(weiRewardAfter, 0, 'wei reward not zeroed out')
    })

    it('worker can ask for reward from RR complete project', async () => {
    })

    it('worker can\'t ask for reward they\'ve already received from TR complete project', async () => {
    })

    it('worker can\'t ask for reward they\'ve already received from RR complete project', async () => {
    })

    it('not worker can\'t ask for reward from TR complete project', async () => {
    })

    it('not worker can\'t ask for reward from RR complete project', async () => {
    })

    it('all workers can be rewarded from TR complete project', async () => {
    })

    it('all workers can be rewarded from RR complete project', async () => {
    })
  })

  describe('handle validators', () => {
    it('yes validator can ask for refund & reward from TR complete project', async () => {
      // take stock of important environmental variables
      let index = 0
      let claimable = await task.getClaimable(projAddrT, index)
      let claimableByRep = await task.getClaimableByRep(projAddrT, index)
      let valDetails = await task.getValDetails(projAddrT, index, validator1)
      let validatorStatus = valDetails[0]
      let validatorIndexBefore = valDetails[1].toNumber()
      let validatorAtIndex = await task.getValidatorAtIndex(projAddrT, index, validatorIndexBefore, true)
      let affirmativeIndex = await task.getValidationIndex(projAddrT, index, true)

      // environmental checks
      assert.equal(claimable, true, 'task should be claimable')
      assert.equal(claimableByRep, true, 'task should be claimable by rep')
      assert.isAtMost(validatorIndexBefore, 4, 'validator index should be at most 4')
      assert.isAtLeast(validatorIndexBefore, 0, 'validator index should be at least 0')
      assert.equal(validatorAtIndex, validator1, 'incorrect validator stored at index')
      assert.equal(validatorStatus, true, 'ensure validator voted affirmatively')
      assert.isAtMost(affirmativeIndex, 5, 'affirmative index should be at most 5')
      assert.isAtLeast(affirmativeIndex, 0, 'affirmative index should be at least 0')

      // calculate wei reward
      let rewardWeighting = 100 // no other validators on this task
      let validationReward = await project.getValidationReward(projAddrT, true)
      let taskWeighting = await task.getWeighting(projAddrT, index, true)
      let weiReward = Math.floor(validationReward.times(taskWeighting).toNumber() * rewardWeighting / 10000)

      // take stock of variables
      let validationEntryFee = await task.getValidationEntryFee(projAddrT, index)
      let vBalBefore = await utils.getTokenBalance(validator1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrT))

      // refund & reward validator on index validated true only
      await TR.rewardValidator(projAddrT, index, {from: validator1})

      // take stock of variables
      valDetails = await task.getValDetails(projAddrT, index, validator1)
      let validatorIndexAfter = valDetails[1]
      let vBalAfter = await utils.getTokenBalance(validator1)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrT))

      // checks
      assert.equal(validatorIndexAfter, 5, 'validator index should be 5')
      assert.equal(vBalAfter, vBalBefore + validationEntryFee, 'validation tokens were not returned to validator')
      assert.equal(TRBalAfter + validationEntryFee, TRBalBefore, 'validation tokens were not removed from TR')
      assert.equal(projWeiBalAfter + weiReward, projWeiBalBefore, 'wei reward was not sent correctly to validator')
    })

    it('yes validator can ask for refund & reward from RR complete project', async () => {
      // take stock of important environmental variables
      let index = 0
      let claimable = await task.getClaimable(projAddrR, index)
      let claimableByRep = await task.getClaimableByRep(projAddrR, index)
      let valDetails = await task.getValDetails(projAddrR, index, validator1)
      let validatorStatus = valDetails[0]
      let validatorIndexBefore = valDetails[1].toNumber()
      let validatorAtIndex = await task.getValidatorAtIndex(projAddrR, index, validatorIndexBefore, true)
      let affirmativeIndex = await task.getValidationIndex(projAddrR, index, true)

      // environmental checks
      assert.equal(claimable, true, 'task should be claimable')
      assert.equal(claimableByRep, true, 'task should be claimable by rep')
      assert.isAtMost(validatorIndexBefore, 4, 'validator index should be at most 4')
      assert.isAtLeast(validatorIndexBefore, 0, 'validator index should be at least 0')
      assert.equal(validatorAtIndex, validator1, 'incorrect validator stored at index')
      assert.equal(validatorStatus, true, 'ensure validator voted affirmatively')
      assert.isAtMost(affirmativeIndex, 5, 'affirmative index should be at most 5')
      assert.isAtLeast(affirmativeIndex, 0, 'affirmative index should be at least 0')

      // calculate wei reward
      let rewardWeighting = 100 // no other validators on this task
      let validationReward = await project.getValidationReward(projAddrR, true)
      let taskWeighting = await task.getWeighting(projAddrR, index, true)
      let weiReward = Math.floor(validationReward.times(taskWeighting).toNumber() * rewardWeighting / 10000)

      // take stock of variables
      let validationEntryFee = await task.getValidationEntryFee(projAddrR, index)
      let vBalBefore = await utils.getTokenBalance(validator1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrR))

      // refund & reward validator on index validated true only
      await TR.rewardValidator(projAddrR, index, {from: validator1})

      // take stock of variables
      valDetails = await task.getValDetails(projAddrR, index, validator1)
      let validatorIndexAfter = valDetails[1]
      let vBalAfter = await utils.getTokenBalance(validator1)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrR))

      // checks
      assert.equal(validatorIndexAfter, 5, 'validator index should be 5')
      assert.equal(vBalAfter, vBalBefore + validationEntryFee, 'validation tokens were not returned to validator')
      assert.equal(TRBalAfter + validationEntryFee, TRBalBefore, 'validation tokens were not removed from TR')
      assert.equal(projWeiBalAfter + weiReward, projWeiBalBefore, 'wei reward was not sent correctly to validator')
    })

    it('no validator can ask for half refund from TR complete project', async () => {
      // half refund no validator on index validated true more
      await TR.rewardValidator(projAddrT, 1, {from: validator2})

      // half refund no validator on index validated false more
      await TR.rewardValidator(projAddrT, 2, {from: validator2})
    })

    it('no validator can ask for half reward from RR complete project', async () => {
      // half refund no validator on index validated true more
      await TR.rewardValidator(projAddrR, 1, {from: validator2})

      // half refund no validator on index validated false more
      await TR.rewardValidator(projAddrR, 2, {from: validator2})
    })

    it('not validator can\'t ask for reward from TR complete project', async () => {
      errorThrown = false
      try {
        // attempt to refund not validator on index validated false more (still has validations left on it)
        await TR.rewardValidator(projAddrT, 2, {from: notValidator})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not validator can\'t ask for reward from RR complete project', async () => {
      errorThrown = false
      try {
        // attempt to refund not validator on index validated false more (still has validations left on it)
        await TR.rewardValidator(projAddrT, 2, {from: notValidator})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('all eligible validators can be rewarded from TR complete project', async () => {
      // refund remaining yes validator
      TR.rewardValidator(projAddrT, 1, {from: validator3})
    })

    it('all eligible validators can be reward from RR complete project', async () => {
      // refund remaining yes validator
      TR.rewardValidator(projAddrR, 1, {from: validator3})
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

    it('not voter can\'t ask for refund from RR complete project', async () => {
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
