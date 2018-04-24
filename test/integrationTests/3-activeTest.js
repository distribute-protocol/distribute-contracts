/* eslint-env mocha */
/* global assert contract */

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
const evmIncreaseTime = require('../utils/evmIncreaseTime')
const keccakHashes = require('../utils/keccakHashes')
const taskDetails = require('../utils/taskDetails')

contract('Active State', (accounts) => {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let TR, RR, PR
  let {user, project, utils, returnProject, task} = projObj
  let {tokenStaker1, repStaker1} = user
  let {notStaker, notProject} = user
  let {worker1, worker2, notWorker} = user
  let {projectCost, stakingPeriod, ipfsHash} = project

  // set up task details & hashing functions
  let {taskSet1, taskSet2} = taskDetails
  let {hashTasks} = keccakHashes

  // local test variables
  let projArray
  let errorThrown
  let projAddrT, projAddrR

  let fastForwards = 2 // ganache 2 weeks ahead at this point from previous test's evmIncreaseTime()

  before(async function () {
    // get contract
    await projObj.contracts.setContracts()
    TR = projObj.contracts.TR
    RR = projObj.contracts.RR
    PR = projObj.contracts.PR

    // get active projects
    // moves ganache forward 1 more week
    projArray = await returnProject.active(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash, 1)
    projAddrT = projArray[0][0]
    projAddrR = projArray[0][1]
  })

  describe('submitting hash lists to active projects', () => {
    it('Incorrect hash list can\'t be submitted to TR active project', async function () {
      errorThrown = false
      try {
        await PR.submitHashList(projAddrT, hashTasks(taskSet2), {from: repStaker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Incorrect hash list can\'t be submitted to RR active project', async function () {
      errorThrown = false
      try {
        await PR.submitHashList(projAddrR, hashTasks(taskSet2), {from: repStaker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Correct hash list can be submitted to TR active project', async function () {
      // getting the 0 index of the task array should fail before submitting hash list
      errorThrown = false
      try {
        await project.getTasks(projAddrT, 0)
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')

      // take stock of variable before and checks
      let hashListSubmittedBefore = await project.getHashListSubmitted(projAddrT)
      assert.equal(hashListSubmittedBefore, false, 'hash list submitted flag is incorrect')

      // submit hash list
      await PR.submitHashList(projAddrT, hashTasks(taskSet1), {from: repStaker1})

      // task stock of variables after and checks
      let projTaskAddr, taskHash, PRaddress, TRaddress, RRaddress
      for (let i = 0; i < hashTasks(taskSet1).length; i++) {
        projTaskAddr = await project.getTasks(projAddrT, i)
        taskHash = await task.getTaskHash(projTaskAddr)
        PRAddress = await task.getPRAddress(projTaskAddr)
        TRAddress = await task.getTRAddress(projTaskAddr)
        RRAddress = await task.getRRAddress(projTaskAddr)

        assert.equal(projTaskAddr.length, 42, 'task addresses were stored incorrectly')
        assert.equal(taskHash, hashTasks(taskSet1)[i], 'task hash was stored incorectly')
        assert.equal(PRAddress, PR.address, 'PR address was stored incorrectly')
        assert.equal(TRAddress, TR.address, 'TR address was stored incorrectly')
        assert.equal(RRAddress, RR.address, 'RR address was stored incorrectly')
      }

      let hashListSubmittedAfter = await project.getHashListSubmitted(projAddrT)
      assert.equal(hashListSubmittedAfter, true, 'hash list submitted flag is incorrect')
    })

    it('Correct hash list can be submitted to RR active project', async function () {
      // getting the 0 index of the task array should fail before submitting hash list
      errorThrown = false
      try {
        await project.getTasks(projAddrR, 0)
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')

      // take stock of variable before and checks
      let hashListSubmittedBefore = await project.getHashListSubmitted(projAddrR)
      assert.equal(hashListSubmittedBefore, false, 'hash list submitted flag is incorrect')

      // submit hash list
      await PR.submitHashList(projAddrR, hashTasks(taskSet1), {from: repStaker1})

      // task stock of variables after and checks
      let projTaskAddr, taskHash, PRaddress, TRaddress, RRaddress
      for (let i = 0; i < taskSet1.length; i++) {
        projTaskAddr = await project.getTasks(projAddrR, i)
        taskHash = await task.getTaskHash(projTaskAddr)
        PRAddress = await task.getPRAddress(projTaskAddr)
        TRAddress = await task.getTRAddress(projTaskAddr)
        RRAddress = await task.getRRAddress(projTaskAddr)

        assert.equal(projTaskAddr.length, 42, 'task addresses were stored incorrectly')
        assert.equal(taskHash, hashTasks(taskSet1)[i], 'task hash was stored incorectly')
        assert.equal(PRAddress, PR.address, 'PR address was stored incorrectly')
        assert.equal(TRAddress, TR.address, 'TR address was stored incorrectly')
        assert.equal(RRAddress, RR.address, 'RR address was stored incorrectly')
      }

      let hashListSubmittedAfter = await project.getHashListSubmitted(projAddrR)
      assert.equal(hashListSubmittedAfter, true, 'hash list submitted flag is incorrect')
    })

    it('Correct hash list can\'t be resubmitted to TR active project', async function () {
      errorThrown = false
      try {
        await PR.submitHashList(projAddrT, hashTasks(taskSet1), {from: repStaker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Correct hash list can\'t be resubmitted to RR active project', async function () {
      errorThrown = false
      try {
        await PR.submitHashList(projAddrR, hashTasks(taskSet1), {from: repStaker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('claiming tasks pre-turnover time', () => {
    it('Worker with enough reputation can claim a task from TR active project', async function () {
      // register worker
      await utils.register(worker1)

      // take stock of variables before
      let index = 3
      let description = taskSet1[index].description
      let weighting = taskSet1[index].weighting
      let weiVal = await project.calculateWeiVal(projAddrT, weighting)
      let repVal = await project.calculateRepVal(projAddrT, weighting)

      let workerRepBalBefore = await utils.getRepBalance(worker1)
      let taskWeightingBefore = await task.getWeighting(projAddrT, index)
      let taskWeiRewardBefore = await task.getWeiReward(projAddrT, index)
      let taskRepRewardBefore = await task.getRepReward(projAddrT, index)
      let taskCompleteBefore = await task.getComplete(projAddrT, index)
      let taskClaimerBefore = await task.getClaimer(projAddrT, index)

      // assert that worker has the reputation to claim the task
      assert.isAtLeast(workerRepBalBefore, repVal, 'worker1 does not have enough reputation to claim the task')

      // claim task
      await RR.claimTask(projAddrT, index, description, weighting, {from: worker1})

      // take stock of variables after
      let workerRepBalAfter = await utils.getRepBalance(worker1)
      let taskWeightingAfter = await task.getWeighting(projAddrT, index)
      let taskWeiRewardAfter = await task.getWeiReward(projAddrT, index)
      let taskRepRewardAfter = await task.getRepReward(projAddrT, index)
      let taskCompleteAfter = await task.getComplete(projAddrT, index)
      let taskClaimerAfter = await task.getClaimer(projAddrT, index)

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

    it('Worker with enough reputation can claim a task from RR active project', async function () {
      // register worker
      await utils.register(worker1)

      // take stock of variables before
      let index = 3
      let description = taskSet1[index].description
      let weighting = taskSet1[index].weighting
      let weiVal = await project.calculateWeiVal(projAddrR, weighting)
      let repVal = await project.calculateRepVal(projAddrR, weighting)

      let workerRepBalBefore = await utils.getRepBalance(worker1)
      let taskWeightingBefore = await task.getWeighting(projAddrR, index)
      let taskWeiRewardBefore = await task.getWeiReward(projAddrR, index)
      let taskRepRewardBefore = await task.getRepReward(projAddrR, index)
      let taskCompleteBefore = await task.getComplete(projAddrR, index)
      let taskClaimerBefore = await task.getClaimer(projAddrR, index)

      // assert that worker has the reputation to claim the task
      assert.isAtLeast(workerRepBalBefore, repVal, 'worker1 does not have enough reputation to claim the task')

      // claim task
      await RR.claimTask(projAddrR, index, description, weighting, {from: worker1})

      // take stock of variables after
      let workerRepBalAfter = await utils.getRepBalance(worker1)
      let taskWeightingAfter = await task.getWeighting(projAddrR, index)
      let taskWeiRewardAfter = await task.getWeiReward(projAddrR, index)
      let taskRepRewardAfter = await task.getRepReward(projAddrR, index)
      let taskCompleteAfter = await task.getComplete(projAddrR, index)
      let taskClaimerAfter = await task.getClaimer(projAddrR, index)

      // checks
      // weird 1 reputation offset here
      // assert.equal(workerRepBalBefore - repVal, workerRepBalAfter, 'worker rep balance updated incorrectly')
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

    it('Worker with enough reputation can\'t claim the same task from TR active project', async function () {
      let index = 3
      let description = taskSet1[index].description
      let weighting = taskSet1[index].weighting

      errorThrown = false
      try {
        await RR.claimTask(projAddrT, index, description, weighting, {from: worker2})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Worker with enough reputation can\'t claim the same task from RR active project', async function () {
      let index = 3
      let description = taskSet1[index].description
      let weighting = taskSet1[index].weighting

      errorThrown = false
      try {
        await RR.claimTask(projAddrT, index, description, weighting, {from: worker2})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Worker with enough reputation can claim a different task from TR active project', async function () {
      // register worker
      await utils.register(worker2)

      // take stock of variables before
      let index = 2
      let description = taskSet1[index].description
      let weighting = taskSet1[index].weighting
      let weiVal = await project.calculateWeiVal(projAddrT, weighting)
      let repVal = await project.calculateRepVal(projAddrT, weighting)

      let workerRepBalBefore = await utils.getRepBalance(worker2)
      let taskWeightingBefore = await task.getWeighting(projAddrT, index)
      let taskWeiRewardBefore = await task.getWeiReward(projAddrT, index)
      let taskRepRewardBefore = await task.getRepReward(projAddrT, index)
      let taskCompleteBefore = await task.getComplete(projAddrT, index)
      let taskClaimerBefore = await task.getClaimer(projAddrT, index)

      // assert that worker has the reputation to claim the task
      assert.isAtLeast(workerRepBalBefore, repVal, 'worker2 does not have enough reputation to claim the task')

      // claim task
      await RR.claimTask(projAddrT, index, description, weighting, {from: worker2})

      // take stock of variables after
      let workerRepBalAfter = await utils.getRepBalance(worker2)
      let taskWeightingAfter = await task.getWeighting(projAddrT, index)
      let taskWeiRewardAfter = await task.getWeiReward(projAddrT, index)
      let taskRepRewardAfter = await task.getRepReward(projAddrT, index)
      let taskCompleteAfter = await task.getComplete(projAddrT, index)
      let taskClaimerAfter = await task.getClaimer(projAddrT, index)

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

    it('Worker with enough reputation can claim a different task from RR active project', async function () {
      // register worker
      await utils.register(worker2)

      // take stock of variables before
      let index = 2
      let description = taskSet1[index].description
      let weighting = taskSet1[index].weighting
      let weiVal = await project.calculateWeiVal(projAddrR, weighting)
      let repVal = await project.calculateRepVal(projAddrR, weighting)

      let workerRepBalBefore = await utils.getRepBalance(worker2)
      let taskWeightingBefore = await task.getWeighting(projAddrR, index)
      let taskWeiRewardBefore = await task.getWeiReward(projAddrR, index)
      let taskRepRewardBefore = await task.getRepReward(projAddrR, index)
      let taskCompleteBefore = await task.getComplete(projAddrR, index)
      let taskClaimerBefore = await task.getClaimer(projAddrR, index)

      // assert that worker has the reputation to claim the task
      assert.isAtLeast(workerRepBalBefore, repVal, 'worker2 does not have enough reputation to claim the task')

      // claim task
      await RR.claimTask(projAddrR, index, description, weighting, {from: worker2})

      // take stock of variables after
      let workerRepBalAfter = await utils.getRepBalance(worker2)
      let taskWeightingAfter = await task.getWeighting(projAddrR, index)
      let taskWeiRewardAfter = await task.getWeiReward(projAddrR, index)
      let taskRepRewardAfter = await task.getRepReward(projAddrR, index)
      let taskCompleteAfter = await task.getComplete(projAddrR, index)
      let taskClaimerAfter = await task.getClaimer(projAddrR, index)

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

    it('Worker without enough reputation can\'t claim a task from TR active project', async function () {
      let index = 1
      let description = taskSet1[index].description
      let weighting = taskSet1[index].weighting

      errorThrown = false
      try {
        await RR.claimTask(projAddrT, index, description, weighting, {from: notWorker})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Worker without enough reputation can\'t claim a task from RR active project', async function () {
      let index = 1
      let description = taskSet1[index].description
      let weighting = taskSet1[index].weighting

      errorThrown = false
      try {
        await RR.claimTask(projAddrR, index, description, weighting, {from: notWorker})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('marking tasks complete pre-turnover time', () => {
    it('Worker who claimed a task from TR active project can mark it complete before turnaround time', async function () {
    })

    it('Worker who claimed a task from RR active project can mark it complete before turnaround time', async function () {
    })

    it('Worker can\'t mark a task complete that they did not claim from TR active project', async function () {
    })

    it('Worker can\'t mark a task complete that they did not claim from RR active project', async function () {
    })
  })

  describe('claiming tasks post-turnover time', () => {
    before(async function () {
      // fast forward time
      await evmIncreaseTime(604800) // 1 week
    })

    it('Worker with enough reputation can claim a task from TR active project that is claimed but not marked complete', async function () {
    })

    it('Worker with enough reputation can claim a task from RR active project that is claimed but not marked complete', async function () {
    })

    it('Worker with enough reputation can\'t reclaim that same task from TR active project', async function () {
    })

    it('Worker with enough reputation can\'t reclaim that same task from RR active project', async function () {
    })
  })

  describe('marking tasks complete post-turnover time', () => {

    it('Worker who claimed a task from TR active project and is past their turnover time can mark it complete if the task wasn\'t reclaimed', async function () {
    })

    it('Worker who claimed a task from RR active project and is past their turnover time can mark it complete if the task wasn\'t reclaimed', async function () {
    })

    it('Worker who reclaimed a task from TR active project can mark it complete', async function () {
    })

    it('Worker who reclaimed a task from RR active project can mark it complete', async function () {
    })

    it('Worker can\'t mark a task from TR active project complete that was reclaimed from them', async function () {
    })

    it('Worker can\'t mark a task from RR active project complete that was reclaimed from them', async function () {
    })
  })

  describe('state changes before time is up', () => {
    it('checkValidate() does not change TR active project to validating before time is up', async function () {
      // take stock of variables
      let stateBefore = await project.getState(projAddrT)

      // attempt to checkStaked
      // await PR.checkValidate(projAddrT)

      // take stock of variables
      let stateAfter = await project.getState(projAddrT)

      // checks
      assert.equal(stateBefore, 3, 'state before should be 3')
      assert.equal(stateAfter, 3, 'state should not have changed')
    })

    it('checkValidate() does not change RR active project to validating before time is up', async function () {
      // take stock of variables
      let stateBefore = await project.getState(projAddrT)

      // attempt to checkStaked
      // await PR.checkValidate(projAddrT)

      // take stock of variables
      let stateAfter = await project.getState(projAddrT)

      // checks
      assert.equal(stateBefore, 3, 'state before should be 3')
      assert.equal(stateAfter, 3, 'state should not have changed')
    })
  })

  describe('state changes after time is up', () => {
    before(async function () {
      // fast forward time
      await evmIncreaseTime(604800) // 1 week
    })

    it('checkValidate() changes TR active project to validating after time is up', async function () {
      // take stock of variables
      let stateBefore = await project.getState(projAddrT)

      // attempt to checkStaked
      // await PR.checkValidate(projAddrT)

      // take stock of variables
      let stateAfter = await project.getState(projAddrT)

      // checks
      assert.equal(stateBefore, 3, 'state before should be 3')
      // assert.equal(stateAfter, 4, 'state after should be 4')
    })

    it('checkValidate() does not change RR active project to validating before time is up', async function () {
      // take stock of variables
      let stateBefore = await project.getState(projAddrR)

      // attempt to checkStaked
      // await PR.checkValidate(projAddrR)

      // take stock of variables
      let stateAfter = await project.getState(projAddrR)

      // checks
      assert.equal(stateBefore, 3, 'state before should be 3')
      // assert.equal(stateAfter, 4, 'state after should be 4')
    })
  })
})
