/* eslint-env mocha */
/* global assert contract */

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
const evmIncreaseTime = require('../utils/evmIncreaseTime')
const keccakHashes = require('../utils/keccakHashes')
const taskDetails = require('../utils/taskDetails')

contract('Staked State', (accounts) => {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let PR
  let {user, project, returnProject} = projObj
  let {tokenStaker1, tokenStaker2} = user
  let {repStaker1} = user
  let {notStaker, notProject} = user
  let {projectCost, stakingPeriod, ipfsHash} = project

  // set up task details & hashing functions
  let {taskSet1, taskSet2} = taskDetails
  let {hashTasks, hashTasksArray} = keccakHashes

  // local test variables
  let projAddrT1, projAddrT2
  let projAddrR1, projAddrR2
  let errorThrown

  let fastForwards = 1 // ganache 1 week ahead at this point from previous test's evmIncreaseTime()

  before(async () => {
    // get contract
    await projObj.contracts.setContracts()
    PR = projObj.contracts.PR

    // get staked projects
    // to check successful transition to active period
    projAddrT1 = await returnProject.staked_T(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash)
    projAddrR1 = await returnProject.staked_R(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash)

    // to check failed transition to failed period
    projAddrT2 = await returnProject.staked_T(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash)
    projAddrR2 = await returnProject.staked_R(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash)
  })

  describe('adding task hashes to staked projects', () => {
    it('Token staker can submit a task hash to TR staked project', async () => {
      // take stock of variables before
      let topTaskHashBefore = await PR.stakedProjects(projAddrT1)

      // token staker submits
      await PR.addTaskHash(projAddrT1, hashTasksArray(taskSet1), {from: tokenStaker1})

      // take stock of variables after
      let topTaskHashAfter = await PR.stakedProjects(projAddrT1)

      // checks
      assert.equal(topTaskHashBefore, 0, 'there should be nothing in stakedProjects before anyone adds a task hash')
      assert.equal(topTaskHashAfter, hashTasksArray(taskSet1), 'incorrect top task hash')
    })

    it('Token staker can submit a task hash to RR staked project', async () => {
      // take stock of variables before
      let topTaskHashBefore = await PR.stakedProjects(projAddrR1)

      // token staker submits
      await PR.addTaskHash(projAddrR1, hashTasksArray(taskSet1), {from: tokenStaker1})

      // take stock of variables after
      let topTaskHashAfter = await PR.stakedProjects(projAddrR1)

      // checks
      assert.equal(topTaskHashBefore, 0, 'there should be nothing in stakedProjects before anyone adds a task hash')
      assert.equal(topTaskHashAfter, hashTasksArray(taskSet1), 'incorrect top task hash after')
    })

    it('Reputation staker can submit different task hash to TR staked project', async () => {
      // take stock of variables before
      let topTaskHashBefore = await PR.stakedProjects(projAddrT1)

      // token staker submits
      await PR.addTaskHash(projAddrT1, hashTasksArray(taskSet1), {from: repStaker1})

      // take stock of variables after
      let topTaskHashAfter = await PR.stakedProjects(projAddrT1)

      // checks
      assert.equal(topTaskHashBefore, hashTasksArray(taskSet1), 'incorrect top task hash before')
      assert.equal(topTaskHashAfter, hashTasksArray(taskSet1), 'incorrect top task hash after')
    })

    it('Reputation staker can submit same task hash to RR staked project', async () => {
      // take stock of variables before
      let topTaskHashBefore = await PR.stakedProjects(projAddrR1)

      // token staker submits
      await PR.addTaskHash(projAddrR1, hashTasksArray(taskSet1), {from: repStaker1})

      // take stock of variables after
      let topTaskHashAfter = await PR.stakedProjects(projAddrR1)

      // checks
      assert.equal(topTaskHashBefore, hashTasksArray(taskSet1), 'incorrect top task hash before')
      assert.equal(topTaskHashAfter, hashTasksArray(taskSet1), 'incorrect top task hash after')
    })

    it('Reputation staker can submit different task hash to TR staked project', async () => {
      // take stock of variables before
      let topTaskHashBefore = await PR.stakedProjects(projAddrT1)

      // token staker submits
      await PR.addTaskHash(projAddrT1, hashTasksArray(taskSet2), {from: repStaker1})

      // take stock of variables after
      let topTaskHashAfter = await PR.stakedProjects(projAddrT1)

      // checks
      assert.equal(topTaskHashBefore, hashTasksArray(taskSet1), 'incorrect top task hash before')
      assert.equal(topTaskHashAfter, hashTasksArray(taskSet2), 'incorrect top task hash after')
    })

    it('Reputation staker can submit different task hash to RR staked project', async () => {
      // take stock of variables before
      let topTaskHashBefore = await PR.stakedProjects(projAddrR1)

      // token staker submits
      await PR.addTaskHash(projAddrR1, hashTasksArray(taskSet2), {from: repStaker1})

      // take stock of variables after
      let topTaskHashAfter = await PR.stakedProjects(projAddrR1)

      // checks
      assert.equal(topTaskHashBefore, hashTasksArray(taskSet1), 'incorrect top task hash before')
      assert.equal(topTaskHashAfter, hashTasksArray(taskSet2), 'incorrect top task hash after')
    })

    it('Not staker can\'t submit a task hash to TR staked project', async () => {
      errorThrown = false
      try {
        await PR.addTaskHash(projAddrT1, hashTasksArray(taskSet1), {from: notStaker})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Not staker can\'t submit a task hash to RR staked project', async () => {
      errorThrown = false
      try {
        await PR.addTaskHash(projAddrR1, hashTasksArray(taskSet1), {from: notStaker})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('adding task hashes to nonexistant projects', () => {
    it('Token staker can\'t a task hash to a nonexistant project', async () => {
      errorThrown = false
      try {
        await PR.addTaskHash(notProject, hashTasksArray(taskSet1), {from: tokenStaker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Reputation staker can submit same task hash to RR staked project', async () => {
      errorThrown = false
      try {
        await PR.addTaskHash(notProject, hashTasksArray(taskSet1), {from: repStaker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('submitting hash lists to staked projects', () => {
    it('Token staker can\'t submit hash list to TR staked project in staked state', async () => {
      errorThrown = false
      try {
        await PR.submitHashList(projAddrT1, hashTasks(taskSet2), {from: tokenStaker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Reputation staker can\'t submit hash list to TR staked project in staked state', async () => {
      errorThrown = false
      try {
        await PR.submitHashList(projAddrT1, hashTasks(taskSet2), {from: tokenStaker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Token staker can\'t submit hash list to RR staked project in staked state', async () => {
      errorThrown = false
      try {
        await PR.submitHashList(projAddrR1, hashTasks(taskSet2), {from: tokenStaker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Reputation staker can\'t submit hash list to RR staked project in staked state', async () => {
      errorThrown = false
      try {
        await PR.submitHashList(projAddrR1, hashTasks(taskSet2), {from: tokenStaker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('state changes on staked projects with task hash submissions', () => {
    before(async () => {
      // have tokenStaker2 and repStaker1 change their hash list back to taskSet1 so that each project has at least 51% on taskSet1
      await PR.addTaskHash(projAddrT1, hashTasksArray(taskSet1), {from: tokenStaker2})
      await PR.addTaskHash(projAddrT1, hashTasksArray(taskSet1), {from: repStaker1})

      await PR.addTaskHash(projAddrR1, hashTasksArray(taskSet1), {from: tokenStaker2})
      await PR.addTaskHash(projAddrR1, hashTasksArray(taskSet1), {from: repStaker1})

      // fast forward time
      await evmIncreaseTime(604800) // 1 week
    })

    it('TR staked project becomes active if task hashes are submitted by the staking deadline', async () => {
      // take stock of variables
      let stateBefore = await project.getState(projAddrT1)

      // call checkStaked()
      await PR.checkActive(projAddrT1)

      // take stock of variables
      let stateAfter = await project.getState(projAddrT1)

      // checks
      assert.equal(stateBefore, 2, 'state before should be 2')
      assert.equal(stateAfter, 3, 'state after should be 3')
    })

    it('RR staked project becomes active if task hashes are submitted by the staking deadline', async () => {
      // take stock of variables
      let stateBefore = await project.getState(projAddrR1)

      // call checkStaked()
      await PR.checkActive(projAddrR1)

      // take stock of variables
      let stateAfter = await project.getState(projAddrR1)

      // checks
      assert.equal(stateBefore, 2, 'state before should be 2')
      assert.equal(stateAfter, 3, 'state after should be 3')
    })
  })

  describe('time out state changes', () => {
    it('TR staked project becomes failed if no task hashes are submitted by the staking deadline', async () => {
      // take stock of variables
      let stateBefore = await project.getState(projAddrT2)

      // call checkStaked()
      await PR.checkActive(projAddrT2)

      // take stock of variables
      let stateAfter = await project.getState(projAddrT2)

      // checks
      assert.equal(stateBefore, 2, 'state before should be 2')
      assert.equal(stateAfter, 7, 'state after should be 7')
    })

    it('RR staked project becomes failed if no task hashes are submitted by the staking deadline', async () => {
      // take stock of variables
      let stateBefore = await project.getState(projAddrR2)

      // call checkStaked()
      await PR.checkActive(projAddrR2)

      // take stock of variables
      let stateAfter = await project.getState(projAddrR2)

      // checks
      assert.equal(stateBefore, 2, 'state before should be 2')
      assert.equal(stateAfter, 7, 'state after should be 7')
    })
  })

  describe('submit task hash on active projects', () => {
    it('Add task hash can\'t be called by token staker on TR staked project once it is active', async () => {
      errorThrown = false
      try {
        await PR.addTaskHash(projAddrT1, hashTasksArray(taskSet1), {from: tokenStaker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Add task hash can\'t be called by reputation staker on TR staked project once it is active', async () => {
      errorThrown = false
      try {
        await PR.addTaskHash(projAddrT1, hashTasksArray(taskSet1), {from: repStaker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Add task hash can\'t be called by token staker on RR staked project once it is active', async () => {
      errorThrown = false
      try {
        await PR.addTaskHash(projAddrR1, hashTasksArray(taskSet1), {from: tokenStaker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Add task hash can\'t be called by reputation staker on RR staked project once it is active', async () => {
      errorThrown = false
      try {
        await PR.addTaskHash(projAddrR1, hashTasksArray(taskSet1), {from: repStaker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })
})
