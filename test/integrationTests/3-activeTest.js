/* eslint-env mocha */
/* global assert contract */

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
const evmIncreaseTime = require('../utils/evmIncreaseTime')
const keccakHashes = require('../utils/keccakHashes')
const taskDetails = require('../utils/taskDetails')

const BigNumber = require('bignumber.js')

const Web3 = require('web3')
const web3 = new Web3()
web3.setProvider(new Web3.providers.HttpProvider('http://localhost:7545'))

contract('Active State', function (accounts) {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let TR, RR, PR, DT
  let {user, project, utils, returnProject, task} = projObj
  let {tokenProposer, repProposer, notProposer} = user
  let {repStaker1} = user
  let {worker1, worker2, notWorker} = user
  let {projectCost, stakingPeriod, ipfsHash} = project

  // set up task details & hashing functions
  let {taskSet1, taskSet2} = taskDetails
  let {hashTasks} = keccakHashes

  // local test variables
  let projArray
  let errorThrown
  let projAddrT, projAddrR

  // define indices
  let indexEndTest = 4 // only to be used to test task claiming in the validating state
  let indexNoReclaimPre = 3 // to test a task the won't be reclaimed and will be marked complete pre-turnover time
  let indexNoReclaimPost = 2 // to test a task the won't be reclaimed and will be marked complete post-turnover time
  let indexReclaim = 1 // to test a task that will be reclaimed
  let indexThrowaway = 0 // to test a task that will fail every time it's claimed and marked complete
  let notIndex = 5 // to test a nonexistant task

  let fastForwards = 2 // testrpc is 2 weeks ahead at this point

  before(async function () {
    // get contracts
    await projObj.contracts.setContracts()
    TR = projObj.contracts.TR
    RR = projObj.contracts.RR
    PR = projObj.contracts.PR
    DT = projObj.contracts.DT

    // get active projects
    projArray = await returnProject.active(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash, 1, taskSet1)

    projAddrT = projArray[0][0]
    projAddrR = projArray[0][1]
  })

  describe('handle proposer', () => {
    it('not proposer can\'t call refund proposer from token registry', async () => {
      errorThrown = false
      try {
        await TR.refundProposer(projAddrT, {from: notProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not proposer can\'t call refund proposer from reputation registry', async () => {
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
      let proposerStakeBefore = await project.getProposerStake(projAddrT)

      // call refund proposer
      await TR.refundProposer(projAddrT, {from: tokenProposer})

      // take stock of variables
      let tpBalAfter = await utils.getTokenBalance(tokenProposer)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let proposerStakeAfter = await project.getProposerStake(projAddrT)

      // checks
      assert.equal(tpBalBefore + proposerStakeBefore, tpBalAfter, 'tokenProposer balance updated incorrectly')
      assert.equal(TRBalBefore, TRBalAfter + proposerStakeBefore, 'TR balance updated incorrectly')
      assert.equal(weiPoolBefore - Math.floor(proposedWeiCost / 20), weiPoolAfter, 'wei pool should be 5% of the project\'s proposed cost less')
      assert.equal(proposerStakeAfter, 0, 'proposer stake should have been zeroed out')
    })

    it('refund proposer can be called on RR complete project', async () => {
      // take stock of variables
      let proposedWeiCost = await project.getProposedWeiCost(projAddrR)

      let rpBalBefore = await utils.getRepBalance(repProposer)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let proposerStakeBefore = await project.getProposerStake(projAddrR)

      // call refund proposer
      await RR.refundProposer(projAddrR, {from: repProposer})

      // take stock of variables
      let rpBalAfter = await utils.getRepBalance(repProposer)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let proposerStakeAfter = await project.getProposerStake(projAddrR)

      // checks
      assert.equal(rpBalBefore + proposerStakeBefore, rpBalAfter, 'tokenProposer balance updated incorrectly')
      assert.equal(weiPoolBefore - Math.floor(proposedWeiCost / 20), weiPoolAfter, 'wei pool should be 5% of the project\'s proposed cost less')
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

  describe('submitting hash lists to active projects', () => {
    it('incorrect hash list can\'t be submitted to TR active project', async () => {
      errorThrown = false
      try {
        await PR.submitHashList(projAddrT, hashTasks(taskSet2), {from: repStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('incorrect hash list can\'t be submitted to RR active project', async () => {
      errorThrown = false
      try {
        await PR.submitHashList(projAddrR, hashTasks(taskSet2), {from: repStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('correct hash list can be submitted to TR active project', async () => {
      // getting the 0 index of the task array should fail before submitting hash list
      errorThrown = false
      try {
        await project.getTasks(projAddrT, 0)
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')

      // take stock of variable before and checks
      let hashListSubmittedBefore = await project.getHashListSubmitted(projAddrT)
      assert.equal(hashListSubmittedBefore, false, 'hash list submitted flag is incorrect')

      // submit hash list
      await PR.submitHashList(projAddrT, hashTasks(taskSet1), {from: repStaker1})

      // take stock of variables after and checks
      for (let i = 0; i < hashTasks(taskSet1).length; i++) {
        let projTaskAddr = await project.getTasks(projAddrT, i)
        let taskHash = await task.getTaskHash(projTaskAddr)
        let PRAddress = await task.getPRAddress(projTaskAddr)
        let TRAddress = await task.getTRAddress(projTaskAddr)
        let RRAddress = await task.getRRAddress(projTaskAddr)

        assert.equal(projTaskAddr.length, 42, 'task addresses were stored incorrectly')
        assert.equal(taskHash, hashTasks(taskSet1)[i], 'task hash was stored incorectly')
        assert.equal(PRAddress, PR.address, 'PR address was stored incorrectly')
        assert.equal(TRAddress, TR.address, 'TR address was stored incorrectly')
        assert.equal(RRAddress, RR.address, 'RR address was stored incorrectly')
      }

      let hashListSubmittedAfter = await project.getHashListSubmitted(projAddrT)
      assert.equal(hashListSubmittedAfter, true, 'hash list submitted flag is incorrect')
    })

    it('correct hash list can be submitted to RR active project', async () => {
      // getting the 0 index of the task array should fail before submitting hash list
      errorThrown = false
      try {
        await project.getTasks(projAddrR, 0)
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')

      // take stock of variable before and checks
      let hashListSubmittedBefore = await project.getHashListSubmitted(projAddrR)
      assert.equal(hashListSubmittedBefore, false, 'hash list submitted flag is incorrect')

      // submit hash list
      await PR.submitHashList(projAddrR, hashTasks(taskSet1), {from: repStaker1})

      // take stock of variables after and checks
      for (let i = 0; i < taskSet1.length; i++) {
        let projTaskAddr = await project.getTasks(projAddrR, i)
        let taskHash = await task.getTaskHash(projTaskAddr)
        let PRAddress = await task.getPRAddress(projTaskAddr)
        let TRAddress = await task.getTRAddress(projTaskAddr)
        let RRAddress = await task.getRRAddress(projTaskAddr)

        assert.equal(projTaskAddr.length, 42, 'task addresses were stored incorrectly')
        assert.equal(taskHash, hashTasks(taskSet1)[i], 'task hash was stored incorectly')
        assert.equal(PRAddress, PR.address, 'PR address was stored incorrectly')
        assert.equal(TRAddress, TR.address, 'TR address was stored incorrectly')
        assert.equal(RRAddress, RR.address, 'RR address was stored incorrectly')
      }

      let hashListSubmittedAfter = await project.getHashListSubmitted(projAddrR)
      assert.equal(hashListSubmittedAfter, true, 'hash list submitted flag is incorrect')
    })

    it('correct hash list can\'t be resubmitted to TR active project', async () => {
      errorThrown = false
      try {
        await PR.submitHashList(projAddrT, hashTasks(taskSet1), {from: repStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('correct hash list can\'t be resubmitted to RR active project', async () => {
      errorThrown = false
      try {
        await PR.submitHashList(projAddrR, hashTasks(taskSet1), {from: repStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('claiming tasks pre-turnover time', () => {
    it('worker with enough reputation can claim a task from TR active project', async () => {
      // register worker
      await utils.register(worker1)

      // take stock of variables before
      let description = taskSet1[indexNoReclaimPre].description
      let weighting = taskSet1[indexNoReclaimPre].weighting
      let weiVal = await project.calculateWeiVal(projAddrT, weighting)
      let repVal = await project.calculateRepVal(projAddrT, weighting)

      let workerRepBalBefore = await utils.getRepBalance(worker1)
      let taskWeightingBefore = await task.getWeighting(projAddrT, indexNoReclaimPre)
      let taskWeiRewardBefore = await task.getWeiReward(projAddrT, indexNoReclaimPre)
      let taskRepRewardBefore = await task.getRepReward(projAddrT, indexNoReclaimPre)
      let taskCompleteBefore = await task.getComplete(projAddrT, indexNoReclaimPre)
      let taskClaimerBefore = await task.getClaimer(projAddrT, indexNoReclaimPre)

      // assert that worker has the reputation to claim the task
      assert.isAtLeast(workerRepBalBefore, repVal, 'worker1 does not have enough reputation to claim the task')

      // claim task
      await RR.claimTask(projAddrT, indexNoReclaimPre, description, weighting, {from: worker1})

      // take stock of variables after
      let workerRepBalAfter = await utils.getRepBalance(worker1)
      let taskWeightingAfter = await task.getWeighting(projAddrT, indexNoReclaimPre)
      let taskWeiRewardAfter = await task.getWeiReward(projAddrT, indexNoReclaimPre)
      let taskRepRewardAfter = await task.getRepReward(projAddrT, indexNoReclaimPre)
      let taskCompleteAfter = await task.getComplete(projAddrT, indexNoReclaimPre)
      let taskClaimerAfter = await task.getClaimer(projAddrT, indexNoReclaimPre)

      // checks
      assert.equal(workerRepBalBefore - repVal, workerRepBalAfter, 'worker rep balance updated incorrectly')
      assert.equal(taskWeightingBefore, 0, 'task should not have weighting before claimed')
      assert.equal(taskWeightingAfter, weighting, 'task given incorrect weighting')
      assert.equal(taskWeiRewardBefore, 0, 'task should not have wei reward before claimed')
      assert.equal(taskWeiRewardAfter, weiVal, 'task given incorrect wei reward')
      assert.equal(taskRepRewardBefore, 0, 'task should not have rep reward before claimed')
      assert.equal(taskRepRewardAfter, repVal, 'task given incorrect rep reward')
      assert.equal(taskCompleteBefore, false, 'task should not be complete before claiming')
      assert.equal(taskCompleteAfter, false, 'task should not be complete after claiming')
      assert.equal(taskClaimerBefore, 0, 'task should not have claimer before claimed')
      assert.equal(taskClaimerAfter, worker1, 'task given incorrect claimer')
    })

    it('worker with enough reputation can claim a task from RR active project', async () => {
      // register worker
      await utils.register(worker1)

      // take stock of variables before
      let description = taskSet1[indexNoReclaimPre].description
      let weighting = taskSet1[indexNoReclaimPre].weighting
      let weiVal = await project.calculateWeiVal(projAddrR, weighting)
      let repVal = await project.calculateRepVal(projAddrR, weighting)

      let workerRepBalBefore = await utils.getRepBalance(worker1)
      let taskWeightingBefore = await task.getWeighting(projAddrR, indexNoReclaimPre)
      let taskWeiRewardBefore = await task.getWeiReward(projAddrR, indexNoReclaimPre)
      let taskRepRewardBefore = await task.getRepReward(projAddrR, indexNoReclaimPre)
      let taskCompleteBefore = await task.getComplete(projAddrR, indexNoReclaimPre)
      let taskClaimerBefore = await task.getClaimer(projAddrR, indexNoReclaimPre)

      // assert that worker has the reputation to claim the task
      assert.isAtLeast(workerRepBalBefore, repVal, 'worker1 does not have enough reputation to claim the task')

      // claim task
      await RR.claimTask(projAddrR, indexNoReclaimPre, description, weighting, {from: worker1})

      // take stock of variables after
      let workerRepBalAfter = await utils.getRepBalance(worker1)
      let taskWeightingAfter = await task.getWeighting(projAddrR, indexNoReclaimPre)
      let taskWeiRewardAfter = await task.getWeiReward(projAddrR, indexNoReclaimPre)
      let taskRepRewardAfter = await task.getRepReward(projAddrR, indexNoReclaimPre)
      let taskCompleteAfter = await task.getComplete(projAddrR, indexNoReclaimPre)
      let taskClaimerAfter = await task.getClaimer(projAddrR, indexNoReclaimPre)

      // checks
      assert.equal(workerRepBalBefore - repVal, workerRepBalAfter, 'worker rep balance updated incorrectly')
      assert.equal(taskWeightingBefore, 0, 'task should not have weighting before claimed')
      assert.equal(taskWeightingAfter, weighting, 'task given incorrect weighting')
      assert.equal(taskWeiRewardBefore, 0, 'task should not have wei reward before claimed')
      assert.equal(taskWeiRewardAfter, weiVal, 'task given incorrect wei reward')
      assert.equal(taskRepRewardBefore, 0, 'task should not have rep reward before claimed')
      assert.equal(taskRepRewardAfter, repVal, 'task given incorrect rep reward')
      assert.equal(taskCompleteBefore, false, 'task should not be complete before claiming')
      assert.equal(taskCompleteAfter, false, 'task should not be complete after claiming')
      assert.equal(taskClaimerBefore, 0, 'task should not have claimer before claimed')
      assert.equal(taskClaimerAfter, worker1, 'task given incorrect claimer')
    })

    it('same worker with enough reputation can claim a task from TR active project', async () => {
      // register worker
      await utils.register(worker1)

      // take stock of variables before
      let description = taskSet1[indexNoReclaimPost].description
      let weighting = taskSet1[indexNoReclaimPost].weighting
      let weiVal = await project.calculateWeiVal(projAddrT, weighting)
      let repVal = await project.calculateRepVal(projAddrT, weighting)

      let workerRepBalBefore = await utils.getRepBalance(worker1)
      let taskWeightingBefore = await task.getWeighting(projAddrT, indexNoReclaimPost)
      let taskWeiRewardBefore = await task.getWeiReward(projAddrT, indexNoReclaimPost)
      let taskRepRewardBefore = await task.getRepReward(projAddrT, indexNoReclaimPost)
      let taskCompleteBefore = await task.getComplete(projAddrT, indexNoReclaimPost)
      let taskClaimerBefore = await task.getClaimer(projAddrT, indexNoReclaimPost)

      // assert that worker has the reputation to claim the task
      assert.isAtLeast(workerRepBalBefore, repVal, 'worker1 does not have enough reputation to claim the task')

      // claim task
      await RR.claimTask(projAddrT, indexNoReclaimPost, description, weighting, {from: worker1})

      // take stock of variables after
      let workerRepBalAfter = await utils.getRepBalance(worker1)
      let taskWeightingAfter = await task.getWeighting(projAddrT, indexNoReclaimPost)
      let taskWeiRewardAfter = await task.getWeiReward(projAddrT, indexNoReclaimPost)
      let taskRepRewardAfter = await task.getRepReward(projAddrT, indexNoReclaimPost)
      let taskCompleteAfter = await task.getComplete(projAddrT, indexNoReclaimPost)
      let taskClaimerAfter = await task.getClaimer(projAddrT, indexNoReclaimPost)

      // checks
      assert.equal(workerRepBalBefore - repVal, workerRepBalAfter, 'worker rep balance updated incorrectly')
      assert.equal(taskWeightingBefore, 0, 'task should not have weighting before claimed')
      assert.equal(taskWeightingAfter, weighting, 'task given incorrect weighting')
      assert.equal(taskWeiRewardBefore, 0, 'task should not have wei reward before claimed')
      assert.equal(taskWeiRewardAfter, weiVal, 'task given incorrect wei reward')
      assert.equal(taskRepRewardBefore, 0, 'task should not have rep reward before claimed')
      assert.equal(taskRepRewardAfter, repVal, 'task given incorrect rep reward')
      assert.equal(taskCompleteBefore, false, 'task should not be complete before claiming')
      assert.equal(taskCompleteAfter, false, 'task should not be complete after claiming')
      assert.equal(taskClaimerBefore, 0, 'task should not have claimer before claimed')
      assert.equal(taskClaimerAfter, worker1, 'task given incorrect claimer')
    })

    it('same worker with enough reputation can claim a task from RR active project', async () => {
      // register worker
      await utils.register(worker1)

      // take stock of variables before
      let description = taskSet1[indexNoReclaimPost].description
      let weighting = taskSet1[indexNoReclaimPost].weighting
      let weiVal = await project.calculateWeiVal(projAddrR, weighting)
      let repVal = await project.calculateRepVal(projAddrR, weighting)

      let workerRepBalBefore = await utils.getRepBalance(worker1)
      let taskWeightingBefore = await task.getWeighting(projAddrR, indexNoReclaimPost)
      let taskWeiRewardBefore = await task.getWeiReward(projAddrR, indexNoReclaimPost)
      let taskRepRewardBefore = await task.getRepReward(projAddrR, indexNoReclaimPost)
      let taskCompleteBefore = await task.getComplete(projAddrR, indexNoReclaimPost)
      let taskClaimerBefore = await task.getClaimer(projAddrR, indexNoReclaimPost)

      // assert that worker has the reputation to claim the task
      assert.isAtLeast(workerRepBalBefore, repVal, 'worker1 does not have enough reputation to claim the task')

      // claim task
      await RR.claimTask(projAddrR, indexNoReclaimPost, description, weighting, {from: worker1})

      // take stock of variables after
      let workerRepBalAfter = await utils.getRepBalance(worker1)
      let taskWeightingAfter = await task.getWeighting(projAddrR, indexNoReclaimPost)
      let taskWeiRewardAfter = await task.getWeiReward(projAddrR, indexNoReclaimPost)
      let taskRepRewardAfter = await task.getRepReward(projAddrR, indexNoReclaimPost)
      let taskCompleteAfter = await task.getComplete(projAddrR, indexNoReclaimPost)
      let taskClaimerAfter = await task.getClaimer(projAddrR, indexNoReclaimPost)

      // checks
      assert.equal(workerRepBalBefore - repVal, workerRepBalAfter, 'worker rep balance updated incorrectly')
      assert.equal(taskWeightingBefore, 0, 'task should not have weighting before claimed')
      assert.equal(taskWeightingAfter, weighting, 'task given incorrect weighting')
      assert.equal(taskWeiRewardBefore, 0, 'task should not have wei reward before claimed')
      assert.equal(taskWeiRewardAfter, weiVal, 'task given incorrect wei reward')
      assert.equal(taskRepRewardBefore, 0, 'task should not have rep reward before claimed')
      assert.equal(taskRepRewardAfter, repVal, 'task given incorrect rep reward')
      assert.equal(taskCompleteBefore, false, 'task should not be complete before claiming')
      assert.equal(taskCompleteAfter, false, 'task should not be complete after claiming')
      assert.equal(taskClaimerBefore, 0, 'task should not have claimer before claimed')
      assert.equal(taskClaimerAfter, worker1, 'task given incorrect claimer')
    })

    it('worker with enough reputation can\'t claim the same task from TR active project', async () => {
      let description = taskSet1[indexNoReclaimPre].description
      let weighting = taskSet1[indexNoReclaimPre].weighting

      errorThrown = false
      try {
        await RR.claimTask(projAddrT, indexNoReclaimPre, description, weighting, {from: worker2})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker with enough reputation can\'t claim the same task from RR active project', async () => {
      let description = taskSet1[indexNoReclaimPre].description
      let weighting = taskSet1[indexNoReclaimPre].weighting

      errorThrown = false
      try {
        await RR.claimTask(projAddrT, indexNoReclaimPre, description, weighting, {from: worker2})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('different worker with enough reputation can claim a different task from TR active project', async () => {
      // register worker
      await utils.register(worker2)

      // take stock of variables before
      let description = taskSet1[indexReclaim].description
      let weighting = taskSet1[indexReclaim].weighting
      let weiVal = await project.calculateWeiVal(projAddrT, weighting)
      let repVal = await project.calculateRepVal(projAddrT, weighting)

      let workerRepBalBefore = await utils.getRepBalance(worker2)
      let taskWeightingBefore = await task.getWeighting(projAddrT, indexReclaim)
      let taskWeiRewardBefore = await task.getWeiReward(projAddrT, indexReclaim)
      let taskRepRewardBefore = await task.getRepReward(projAddrT, indexReclaim)
      let taskCompleteBefore = await task.getComplete(projAddrT, indexReclaim)
      let taskClaimerBefore = await task.getClaimer(projAddrT, indexReclaim)

      // assert that worker has the reputation to claim the task
      assert.isAtLeast(workerRepBalBefore, repVal, 'worker2 does not have enough reputation to claim the task')

      // claim task
      await RR.claimTask(projAddrT, indexReclaim, description, weighting, {from: worker2})

      // take stock of variables after
      let workerRepBalAfter = await utils.getRepBalance(worker2)
      let taskWeightingAfter = await task.getWeighting(projAddrT, indexReclaim)
      let taskWeiRewardAfter = await task.getWeiReward(projAddrT, indexReclaim)
      let taskRepRewardAfter = await task.getRepReward(projAddrT, indexReclaim)
      let taskCompleteAfter = await task.getComplete(projAddrT, indexReclaim)
      let taskClaimerAfter = await task.getClaimer(projAddrT, indexReclaim)

      // checks
      assert.equal(workerRepBalBefore - repVal, workerRepBalAfter, 'worker rep balance updated incorrectly')
      assert.equal(taskWeightingBefore, 0, 'task should not have weighting before claimed')
      assert.equal(taskWeightingAfter, weighting, 'task given incorrect weighting')
      assert.equal(taskWeiRewardBefore, 0, 'task should not have wei reward before claimed')
      assert.equal(taskWeiRewardAfter, weiVal, 'task given incorrect wei reward')
      assert.equal(taskRepRewardBefore, 0, 'task should not have rep reward before claimed')
      assert.equal(taskRepRewardAfter, repVal, 'task given incorrect rep reward')
      assert.equal(taskCompleteBefore, false, 'task should not be complete before claiming')
      assert.equal(taskCompleteAfter, false, 'task should not be complete after claiming')
      assert.equal(taskClaimerBefore, 0, 'task should not have claimer before claimed')
      assert.equal(taskClaimerAfter, worker2, 'task given incorrect claimer')
    })

    it('different worker with enough reputation can claim a different task from RR active project', async () => {
      // register worker
      await utils.register(worker2)

      // take stock of variables before
      let description = taskSet1[indexReclaim].description
      let weighting = taskSet1[indexReclaim].weighting
      let weiVal = await project.calculateWeiVal(projAddrR, weighting)
      let repVal = await project.calculateRepVal(projAddrR, weighting)

      let workerRepBalBefore = await utils.getRepBalance(worker2)
      let taskWeightingBefore = await task.getWeighting(projAddrR, indexReclaim)
      let taskWeiRewardBefore = await task.getWeiReward(projAddrR, indexReclaim)
      let taskRepRewardBefore = await task.getRepReward(projAddrR, indexReclaim)
      let taskCompleteBefore = await task.getComplete(projAddrR, indexReclaim)
      let taskClaimerBefore = await task.getClaimer(projAddrR, indexReclaim)

      // assert that worker has the reputation to claim the task
      assert.isAtLeast(workerRepBalBefore, repVal, 'worker2 does not have enough reputation to claim the task')

      // claim task
      await RR.claimTask(projAddrR, indexReclaim, description, weighting, {from: worker2})

      // take stock of variables after
      let workerRepBalAfter = await utils.getRepBalance(worker2)
      let taskWeightingAfter = await task.getWeighting(projAddrR, indexReclaim)
      let taskWeiRewardAfter = await task.getWeiReward(projAddrR, indexReclaim)
      let taskRepRewardAfter = await task.getRepReward(projAddrR, indexReclaim)
      let taskCompleteAfter = await task.getComplete(projAddrR, indexReclaim)
      let taskClaimerAfter = await task.getClaimer(projAddrR, indexReclaim)

      // checks
      assert.equal(workerRepBalBefore - repVal, workerRepBalAfter, 'worker rep balance updated incorrectly')
      assert.equal(taskWeightingBefore, 0, 'task should not have weighting before claimed')
      assert.equal(taskWeightingAfter, weighting, 'task given incorrect weighting')
      assert.equal(taskWeiRewardBefore, 0, 'task should not have wei reward before claimed')
      assert.equal(taskWeiRewardAfter, weiVal, 'task given incorrect wei reward')
      assert.equal(taskRepRewardBefore, 0, 'task should not have rep reward before claimed')
      assert.equal(taskRepRewardAfter, repVal, 'task given incorrect rep reward')
      assert.equal(taskCompleteBefore, false, 'task should not be complete before claiming')
      assert.equal(taskCompleteAfter, false, 'task should not be complete after claiming')
      assert.equal(taskClaimerBefore, 0, 'task should not have claimer before claimed')
      assert.equal(taskClaimerAfter, worker2, 'task given incorrect claimer')
    })

    it('worker without enough reputation can\'t claim a task from TR active project', async () => {
      let description = taskSet1[indexThrowaway].description
      let weighting = taskSet1[indexThrowaway].weighting

      errorThrown = false
      try {
        await RR.claimTask(projAddrT, indexThrowaway, description, weighting, {from: notWorker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker without enough reputation can\'t claim a task from RR active project', async () => {
      let description = taskSet1[indexThrowaway].description
      let weighting = taskSet1[indexThrowaway].weighting

      errorThrown = false
      try {
        await RR.claimTask(projAddrR, indexThrowaway, description, weighting, {from: notWorker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t claim task from TR active project with incorrect weighting', async () => {
      let description = taskSet1[indexThrowaway].description
      let weighting = taskSet1[indexThrowaway].weighting + 1

      errorThrown = false
      try {
        await RR.claimTask(projAddrT, indexThrowaway, description, weighting, {from: worker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t claim task from RR active project with incorrect weighting', async () => {
      let description = taskSet1[indexThrowaway].description
      let weighting = taskSet1[indexThrowaway].weighting + 1

      errorThrown = false
      try {
        await RR.claimTask(projAddrR, indexThrowaway, description, weighting, {from: worker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t claim task from TR active project with incorrect description', async () => {
      let description = taskSet1[indexThrowaway].description + 'yolo'
      let weighting = taskSet1[indexThrowaway].weighting

      errorThrown = false
      try {
        await RR.claimTask(projAddrT, indexThrowaway, description, weighting, {from: worker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t claim task from RR active project with incorrect description', async () => {
      let description = taskSet1[indexThrowaway].description + 'yolo'
      let weighting = taskSet1[indexThrowaway].weighting

      errorThrown = false
      try {
        await RR.claimTask(projAddrR, indexThrowaway, description, weighting, {from: worker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t claim nonexistant task from TR active project', async () => {
      let description = taskSet1[indexThrowaway].description
      let weighting = taskSet1[indexThrowaway].weighting

      errorThrown = false
      try {
        await RR.claimTask(projAddrT, notIndex, description, weighting, {from: worker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t claim nonexistant task from RR active project', async () => {
      let description = taskSet1[indexThrowaway].description
      let weighting = taskSet1[indexThrowaway].weighting

      errorThrown = false
      try {
        await RR.claimTask(projAddrR, notIndex, description, weighting, {from: worker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('marking tasks complete pre-turnover time', () => {
    it('worker who claimed a task from TR active project can mark it complete before turnaround time', async () => {
      // take stock of variables before
      let taskCompleteBefore = await task.getComplete(projAddrT, indexNoReclaimPre)

      // mark task complete
      await PR.submitTaskComplete(projAddrT, indexNoReclaimPre, {from: worker1})

      // take stock of variables after
      let taskCompleteAfter = await task.getComplete(projAddrT, indexNoReclaimPre)

      // checks
      assert.equal(taskCompleteBefore, false, 'incorrect taskCompleteBefore')
      assert.equal(taskCompleteAfter, true, 'incorrect taskCompleteAfter')
    })

    it('worker who claimed a task from RR active project can mark it complete before turnaround time', async () => {
      // take stock of variables before
      let taskCompleteBefore = await task.getComplete(projAddrR, indexNoReclaimPre)

      // mark task complete
      await PR.submitTaskComplete(projAddrR, indexNoReclaimPre, {from: worker1})

      // take stock of variables after
      let taskCompleteAfter = await task.getComplete(projAddrT, indexNoReclaimPre)

      // checks
      assert.equal(taskCompleteBefore, false, 'incorrect taskCompleteBefore')
      assert.equal(taskCompleteAfter, true, 'incorrect taskCompleteAfter')
    })

    it('worker can\'t mark a task from TR active project complete again', async () => {
      errorThrown = false
      try {
        await PR.submitTaskComplete(projAddrT, indexReclaim, {from: worker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t mark a task from TR active project complete again', async () => {
      errorThrown = false
      try {
        await PR.submitTaskComplete(projAddrR, indexReclaim, {from: worker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t mark a task complete that they did not claim from TR active project', async () => {
      errorThrown = false
      try {
        await PR.submitTaskComplete(projAddrT, indexReclaim, {from: notWorker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t mark a task complete that they did not claim from RR active project', async () => {
      errorThrown = false
      try {
        await PR.submitTaskComplete(projAddrR, indexReclaim, {from: notWorker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('claiming tasks post-turnover time', () => {
    before(async () => {
      // have worker 2 claim indexThrowaway for post-checkValidate tests
      let description = taskSet1[indexThrowaway].description
      let weighting = taskSet1[indexThrowaway].weighting

      await RR.claimTask(projAddrT, indexThrowaway, description, weighting, {from: worker2})
      await RR.claimTask(projAddrR, indexThrowaway, description, weighting, {from: worker2})

      // fast forward time
      await evmIncreaseTime(604801) // 1 week
    })

    it('worker with enough reputation can reclaim a task from TR active project that is claimed but not marked complete', async () => {
      // take stock of variables before
      let description = taskSet1[indexReclaim].description
      let weighting = taskSet1[indexReclaim].weighting
      let weiVal = await project.calculateWeiVal(projAddrT, weighting)
      let repVal = await project.calculateRepVal(projAddrT, weighting)

      let workerRepBalBefore = await utils.getRepBalance(worker1)
      let taskWeightingBefore = await task.getWeighting(projAddrT, indexReclaim)
      let taskWeiRewardBefore = await task.getWeiReward(projAddrT, indexReclaim)
      let taskRepRewardBefore = await task.getRepReward(projAddrT, indexReclaim)
      let taskCompleteBefore = await task.getComplete(projAddrT, indexReclaim)
      let taskClaimerBefore = await task.getClaimer(projAddrT, indexReclaim)

      // assert that worker has the reputation to claim the task
      assert.isAtLeast(workerRepBalBefore, repVal, 'worker2 does not have enough reputation to claim the task')

      // claim task
      await RR.claimTask(projAddrT, indexReclaim, description, weighting, {from: worker1})

      // take stock of variables after
      let workerRepBalAfter = await utils.getRepBalance(worker1)
      let taskWeightingAfter = await task.getWeighting(projAddrT, indexReclaim)
      let taskWeiRewardAfter = await task.getWeiReward(projAddrT, indexReclaim)
      let taskRepRewardAfter = await task.getRepReward(projAddrT, indexReclaim)
      let taskCompleteAfter = await task.getComplete(projAddrT, indexReclaim)
      let taskClaimerAfter = await task.getClaimer(projAddrT, indexReclaim)

      // checks
      assert.equal(workerRepBalBefore - repVal, workerRepBalAfter, 'worker rep balance updated incorrectly')
      assert.equal(taskWeightingBefore, taskWeightingAfter, 'should be the same')
      assert.equal(taskWeiRewardBefore, taskWeiRewardAfter, 'should be the same')
      assert.equal(taskWeiRewardAfter, weiVal, 'task given incorrect wei reward')
      assert.equal(taskRepRewardBefore, taskRepRewardAfter, 'should be the same')
      assert.equal(taskRepRewardAfter, repVal, 'task given incorrect rep reward')
      assert.equal(taskCompleteBefore, false, 'task should not be complete before claiming')
      assert.equal(taskCompleteAfter, false, 'task should not be complete after claiming')
      assert.equal(taskClaimerBefore, worker2, 'task originally had incorrect claimer')
      assert.equal(taskClaimerAfter, worker1, 'task given incorrect claimer')
    })

    it('worker with enough reputation can reclaim a task from RR active project that is claimed but not marked complete', async () => {
      // take stock of variables before
      let description = taskSet1[indexReclaim].description
      let weighting = taskSet1[indexReclaim].weighting
      let weiVal = await project.calculateWeiVal(projAddrR, weighting)
      let repVal = await project.calculateRepVal(projAddrR, weighting)

      let workerRepBalBefore = await utils.getRepBalance(worker1)
      let taskWeightingBefore = await task.getWeighting(projAddrR, indexReclaim)
      let taskWeiRewardBefore = await task.getWeiReward(projAddrR, indexReclaim)
      let taskRepRewardBefore = await task.getRepReward(projAddrR, indexReclaim)
      let taskCompleteBefore = await task.getComplete(projAddrR, indexReclaim)
      let taskClaimerBefore = await task.getClaimer(projAddrR, indexReclaim)

      // assert that worker has the reputation to claim the task
      assert.isAtLeast(workerRepBalBefore, repVal, 'worker2 does not have enough reputation to claim the task')

      // claim task
      await RR.claimTask(projAddrR, indexReclaim, description, weighting, {from: worker1})

      // take stock of variables after
      let workerRepBalAfter = await utils.getRepBalance(worker1)
      let taskWeightingAfter = await task.getWeighting(projAddrR, indexReclaim)
      let taskWeiRewardAfter = await task.getWeiReward(projAddrR, indexReclaim)
      let taskRepRewardAfter = await task.getRepReward(projAddrR, indexReclaim)
      let taskCompleteAfter = await task.getComplete(projAddrR, indexReclaim)
      let taskClaimerAfter = await task.getClaimer(projAddrR, indexReclaim)

      // checks
      assert.equal(workerRepBalBefore - repVal, workerRepBalAfter, 'worker rep balance updated incorrectly')
      assert.equal(taskWeightingBefore, taskWeightingAfter, 'should be the same')
      assert.equal(taskWeiRewardBefore, taskWeiRewardAfter, 'should be the same')
      assert.equal(taskWeiRewardAfter, weiVal, 'task given incorrect wei reward')
      assert.equal(taskRepRewardBefore, taskRepRewardAfter, 'should be the same')
      assert.equal(taskRepRewardAfter, repVal, 'task given incorrect rep reward')
      assert.equal(taskCompleteBefore, false, 'task should not be complete before claiming')
      assert.equal(taskCompleteAfter, false, 'task should not be complete after claiming')
      assert.equal(taskClaimerBefore, worker2, 'task originally had incorrect claimer')
      assert.equal(taskClaimerAfter, worker1, 'task given incorrect claimer')
    })

    it('worker with enough reputation can\'t reclaim that same task from TR active project', async () => {
      let description = taskSet1[indexReclaim].description
      let weighting = taskSet1[indexReclaim].weighting

      errorThrown = false
      try {
        await RR.claimTask(projAddrT, indexReclaim, description, weighting, {from: worker2})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker with enough reputation can\'t reclaim that same task from RR active project', async () => {
      let description = taskSet1[indexReclaim].description
      let weighting = taskSet1[indexReclaim].weighting

      errorThrown = false
      try {
        await RR.claimTask(projAddrR, indexReclaim, description, weighting, {from: worker2})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('marking tasks complete post-turnover time', () => {
    it('worker who claimed a task from TR active project and is past their turnover time can mark it complete if the task wasn\'t reclaimed', async () => {
      // take stock of variables before
      let taskCompleteBefore = await task.getComplete(projAddrT, indexNoReclaimPost)

      // mark task complete
      await PR.submitTaskComplete(projAddrT, indexNoReclaimPost, {from: worker1})

      // take stock of variables after
      let taskCompleteAfter = await task.getComplete(projAddrT, indexNoReclaimPost)

      // checks
      assert.equal(taskCompleteBefore, false, 'incorrect taskCompleteBefore')
      assert.equal(taskCompleteAfter, true, 'incorrect taskCompleteAfter')
    })

    it('worker who claimed a task from RR active project and is past their turnover time can mark it complete if the task wasn\'t reclaimed', async () => {
      // take stock of variables before
      let taskCompleteBefore = await task.getComplete(projAddrR, indexNoReclaimPost)

      // mark task complete
      await PR.submitTaskComplete(projAddrR, indexNoReclaimPost, {from: worker1})

      // take stock of variables after
      let taskCompleteAfter = await task.getComplete(projAddrR, indexNoReclaimPost)

      // checks
      assert.equal(taskCompleteBefore, false, 'incorrect taskCompleteBefore')
      assert.equal(taskCompleteAfter, true, 'incorrect taskCompleteAfter')
    })

    it('worker who reclaimed a task from TR active project can mark it complete', async () => {
      // take stock of variables before
      let taskCompleteBefore = await task.getComplete(projAddrT, indexReclaim)

      // mark task complete
      await PR.submitTaskComplete(projAddrT, indexReclaim, {from: worker1})

      // take stock of variables after
      let taskCompleteAfter = await task.getComplete(projAddrT, indexReclaim)

      // checks
      assert.equal(taskCompleteBefore, false, 'incorrect taskCompleteBefore')
      assert.equal(taskCompleteAfter, true, 'incorrect taskCompleteAfter')
    })

    it('worker who reclaimed a task from RR active project can mark it complete', async () => {
      // take stock of variables before
      let taskCompleteBefore = await task.getComplete(projAddrR, indexReclaim)

      // mark task complete
      await PR.submitTaskComplete(projAddrR, indexReclaim, {from: worker1})

      // take stock of variables after
      let taskCompleteAfter = await task.getComplete(projAddrR, indexReclaim)

      // checks
      assert.equal(taskCompleteBefore, false, 'incorrect taskCompleteBefore')
      assert.equal(taskCompleteAfter, true, 'incorrect taskCompleteAfter')
    })

    it('worker can\'t mark a task from TR active project complete again', async () => {
      errorThrown = false
      try {
        await PR.submitTaskComplete(projAddrT, indexReclaim, {from: worker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t mark a task from TR active project complete again', async () => {
      errorThrown = false
      try {
        await PR.submitTaskComplete(projAddrR, indexReclaim, {from: worker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t mark a task from TR active project complete that was reclaimed from them', async () => {
      errorThrown = false
      try {
        await PR.submitTaskComplete(projAddrT, indexReclaim, {from: worker2})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t mark a task from RR active project complete that was reclaimed from them', async () => {
      errorThrown = false
      try {
        await PR.submitTaskComplete(projAddrR, indexReclaim, {from: worker2})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('state changes before time is up', () => {
    it('checkValidate does not change TR active project to validating before time is up', async () => {
      // take stock of variables
      let stateBefore = await project.getState(projAddrT)

      // attempt to checkValidate
      await PR.checkValidate(projAddrT)

      // take stock of variables
      let stateAfter = await project.getState(projAddrT)

      // checks
      assert.equal(stateBefore, 3, 'state before should be 3')
      assert.equal(stateAfter, 3, 'state should not have changed')
    })

    it('checkValidate does not change RR active project to validating before time is up', async () => {
      // take stock of variables
      let stateBefore = await project.getState(projAddrR)

      // attempt to checkValidate
      await PR.checkValidate(projAddrR)

      // take stock of variables
      let stateAfter = await project.getState(projAddrR)

      // checks
      assert.equal(stateBefore, 3, 'state before should be 3')
      assert.equal(stateAfter, 3, 'state should not have changed')
    })
  })

  describe('state changes after time is up', () => {
    before(async () => {
      // fast forward time
      await evmIncreaseTime(604801) // 1 week
    })

    it('checkValidate changes TR active project to validating after time is up', async () => {
      // take stock of variables
      let stateBefore = await project.getState(projAddrT)
      let projWeiBalVariableBefore = await project.getWeiBal(projAddrT, true)
      let DTWeiBalVariableBefore = await utils.getWeiPoolBal(true)
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrT))
      let DTWeiBalBefore = parseInt(await web3.eth.getBalance(DT.address))

      // attempt to checkValidate
      await PR.checkValidate(projAddrT)

      // take stock of variables
      let stateAfter = await project.getState(projAddrT)
      let projWeiBalVariableAfter = await project.getWeiBal(projAddrT, true)
      let DTWeiBalVariableAfter = await utils.getWeiPoolBal(true)
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrT))
      let DTWeiBalAfter = parseInt(await web3.eth.getBalance(DT.address))

      let failedTaskWeiReward = new BigNumber(0)

      // go through tasks and collect details
      for (let i = 0; i < taskSet1.length; i++) {
        let complete = await task.getComplete(projAddrT, i)
        let weiReward = await task.getWeiReward(projAddrT, i)
        let weiAndValidatorReward = Math.floor((weiReward * 21) / 20)
        if (!complete) {
          failedTaskWeiReward = failedTaskWeiReward.plus(weiAndValidatorReward)
        }
      }

      // interim calculations
      let weiBalVariableDifference = projWeiBalVariableBefore.minus(projWeiBalVariableAfter)
      let weiPoolVariableDifference = DTWeiBalVariableAfter.minus(DTWeiBalVariableBefore)
      let weiBalDifference = projWeiBalBefore - projWeiBalAfter
      let weiPoolDifference = DTWeiBalAfter - DTWeiBalBefore

      // checks
      assert.equal(stateBefore, 3, 'state before should be 3')
      assert.equal(stateAfter, 4, 'state after should be 4')
      assert.equal(weiBalVariableDifference.minus(weiPoolVariableDifference), 0, 'should be same amount')
      assert.equal(weiPoolVariableDifference.minus(failedTaskWeiReward), 0, 'should be same amount')
      assert.equal(weiBalDifference - weiPoolDifference, 0, 'should be same amount')
      assert.equal(weiPoolDifference - failedTaskWeiReward, 0, 'should be same amount')
    })

    it('checkValidate changes RR active project to validating after time is up', async () => {
      // take stock of variables
      let stateBefore = await project.getState(projAddrR)
      let projWeiBalVariableBefore = await project.getWeiBal(projAddrR, true)
      let DTWeiBalVariableBefore = await utils.getWeiPoolBal(true)
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrR))
      let DTWeiBalBefore = parseInt(await web3.eth.getBalance(DT.address))

      // attempt to checkValidate
      await PR.checkValidate(projAddrR)

      // take stock of variables
      let stateAfter = await project.getState(projAddrR)
      let projWeiBalVariableAfter = await project.getWeiBal(projAddrR, true)
      let DTWeiBalVariableAfter = await utils.getWeiPoolBal(true)
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrR))
      let DTWeiBalAfter = parseInt(await web3.eth.getBalance(DT.address))

      let failedTaskWeiReward = new BigNumber(0)

      // go through tasks and collect details
      for (let i = 0; i < taskSet1.length; i++) {
        let complete = await task.getComplete(projAddrR, i)
        let weiReward = await task.getWeiReward(projAddrR, i)
        let weiAndValidatorReward = Math.floor((weiReward * 21) / 20)
        if (!complete) {
          failedTaskWeiReward = failedTaskWeiReward.plus(weiAndValidatorReward)
        }
      }

      // interim calculations
      let weiBalVariableDifference = projWeiBalVariableBefore.minus(projWeiBalVariableAfter)
      let weiPoolVariableDifference = DTWeiBalVariableAfter.minus(DTWeiBalVariableBefore)
      let weiBalDifference = projWeiBalBefore - projWeiBalAfter
      let weiPoolDifference = DTWeiBalAfter - DTWeiBalBefore

      // checks
      assert.equal(stateBefore, 3, 'state before should be 3')
      assert.equal(stateAfter, 4, 'state after should be 4')
      assert.equal(weiBalVariableDifference.minus(weiPoolVariableDifference), 0, 'should be same amount')
      assert.equal(weiPoolVariableDifference.minus(failedTaskWeiReward), 0, 'should be same amount')
      assert.equal(weiBalDifference - weiPoolDifference, 0, 'should be same amount')
      assert.equal(weiPoolDifference - failedTaskWeiReward, 0, 'should be same amount')
    })
  })

  describe('mark task complete on validating projects', () => {
    it('claim task can\'t be called on task from TR validating project', async () => {
      let description = taskSet1[indexEndTest].description
      let weighting = taskSet1[indexEndTest].weighting

      errorThrown = false
      try {
        await RR.claimTask(projAddrT, indexEndTest, description, weighting, {from: worker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('claim task can\'t be called on task from RR validating project', async () => {
      let description = taskSet1[indexEndTest].description
      let weighting = taskSet1[indexEndTest].weighting

      errorThrown = false
      try {
        await RR.claimTask(projAddrR, indexEndTest, description, weighting, {from: worker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('mark task complete can\'t be called on task from TR validating project', async () => {
      errorThrown = false
      try {
        await PR.submitTaskComplete(projAddrT, indexThrowaway, {from: worker2})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('mark task complete can\'t be called on task from RR validating project', async () => {
      errorThrown = false
      try {
        await PR.submitTaskComplete(projAddrR, indexThrowaway, {from: worker2})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })
})
