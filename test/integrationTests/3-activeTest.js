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
  let {user, project, returnProject, task} = projObj
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
    projAddrT = (await returnProject.active(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash))[0]
    projAddrR = (await returnProject.active(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash))[1]
  })

  describe('submitting hash lists to active projects', () => {
    it('Incorrect hash list can\'t be submitted to TR active project', async function () {
      errorThrown = false
      try {
        await PR.submitHashList(projArray[0], hashTasks(taskSet2), {from: repStaker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Incorrect hash list can\'t be submitted to RR active project', async function () {
      errorThrown = false
      try {
        await PR.submitHashList(projArray[1], hashTasks(taskSet2), {from: repStaker1})
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
  })
  //
  //   it('Token staker can submit a task hash to RR staked project', async function () {
  //     // take stock of variables before
  //     let topTaskHashBefore = await PR.stakedProjects(projAddrR1)
  //
  //     // token staker submits
  //     await PR.addTaskHash(projAddrR1, hashTasksArray(taskSet1), {from: tokenStaker1})
  //
  //     // take stock of variables after
  //     let topTaskHashAfter = await PR.stakedProjects(projAddrR1)
  //
  //     //checks
  //     assert.equal(topTaskHashBefore, 0, 'there should be nothing in stakedProjects before anyone adds a task hash')
  //     assert.equal(topTaskHashAfter, hashTasksArray(taskSet1), 'incorrect top task hash after')
  //   })
  //
  //   it('Reputation staker can submit same task hash to TR staked project', async function () {
  //     // take stock of variables before
  //     let topTaskHashBefore = await PR.stakedProjects(projAddrT1)
  //
  //     // token staker submits
  //     await PR.addTaskHash(projAddrT1, hashTasksArray(taskSet1), {from: repStaker1})
  //
  //     // take stock of variables after
  //     let topTaskHashAfter = await PR.stakedProjects(projAddrT1)
  //
  //     //checks
  //     assert.equal(topTaskHashBefore, hashTasksArray(taskSet1), 'incorrect top task hash before')
  //     assert.equal(topTaskHashAfter, hashTasksArray(taskSet1), 'incorrect top task hash after')
  //   })
  //
  //   it('Reputation staker can submit same task hash to RR staked project', async function () {
  //     // take stock of variables before
  //     let topTaskHashBefore = await PR.stakedProjects(projAddrR1)
  //
  //     // token staker submits
  //     await PR.addTaskHash(projAddrR1, hashTasksArray(taskSet1), {from: repStaker1})
  //
  //     // take stock of variables after
  //     let topTaskHashAfter = await PR.stakedProjects(projAddrR1)
  //
  //     //checks
  //     assert.equal(topTaskHashBefore, hashTasksArray(taskSet1), 'incorrect top task hash before')
  //     assert.equal(topTaskHashAfter, hashTasksArray(taskSet1), 'incorrect top task hash after')
  //   })
  //
  //   it('Reputation staker can submit different task hash to TR staked project', async function () {
  //     // take stock of variables before
  //     let topTaskHashBefore = await PR.stakedProjects(projAddrT1)
  //
  //     // token staker submits
  //     await PR.addTaskHash(projAddrT1, hashTasksArray(taskSet2), {from: repStaker1})
  //
  //     // take stock of variables after
  //     let topTaskHashAfter = await PR.stakedProjects(projAddrT1)
  //
  //     //checks
  //     assert.equal(topTaskHashBefore, hashTasksArray(taskSet1), 'incorrect top task hash before')
  //     assert.equal(topTaskHashAfter, hashTasksArray(taskSet2), 'incorrect top task hash after')
  //   })
  //
  //   it('Reputation staker can submit different task hash to RR staked project', async function () {
  //     // take stock of variables before
  //     let topTaskHashBefore = await PR.stakedProjects(projAddrR1)
  //
  //     // token staker submits
  //     await PR.addTaskHash(projAddrR1, hashTasksArray(taskSet2), {from: repStaker1})
  //
  //     // take stock of variables after
  //     let topTaskHashAfter = await PR.stakedProjects(projAddrR1)
  //
  //     //checks
  //     assert.equal(topTaskHashBefore, hashTasksArray(taskSet1), 'incorrect top task hash before')
  //     assert.equal(topTaskHashAfter, hashTasksArray(taskSet2), 'incorrect top task hash after')
  //   })
  //
  //   it('Not staker can\'t submit a task hash to TR staked project', async function () {
  //     errorThrown = false
  //     try {
  //       await PR.addTaskHash(projAddrT1, hashTasksArray(taskSet1), {from: notStaker})
  //     } catch (e) {
  //       errorThrown = true
  //     }
  //     assertThrown(errorThrown, 'An error should have been thrown')
  //   })
  //
  //   it('Not staker can\'t submit a task hash to RR staked project', async function () {
  //     errorThrown = false
  //     try {
  //       await PR.addTaskHash(projAddrR1, hashTasksArray(taskSet1), {from: notStaker})
  //     } catch (e) {
  //       errorThrown = true
  //     }
  //     assertThrown(errorThrown, 'An error should have been thrown')
  //   })
  // })
  //
  // describe('adding task hashes to nonexistant projects', () => {
  //   it('Token staker can\'t a task hash to a nonexistant project', async function () {
  //     errorThrown = false
  //     try {
  //       await PR.addTaskHash(notProject, hashTasksArray(taskSet1), {from: tokenStaker1})
  //     } catch (e) {
  //       errorThrown = true
  //     }
  //     assertThrown(errorThrown, 'An error should have been thrown')
  //   })
  //
  //   it('Reputation staker can submit same task hash to RR staked project', async function () {
  //     errorThrown = false
  //     try {
  //       await PR.addTaskHash(notProject, hashTasksArray(taskSet1), {from: repStaker1})
  //     } catch (e) {
  //       errorThrown = true
  //     }
  //     assertThrown(errorThrown, 'An error should have been thrown')
  //   })
  // })
  //
  // describe('submitting hash lists to staked projects', () => {
  //   it('Token staker can\'t submit hash list to TR staked project in staked state', async function () {
  //     errorThrown = false
  //     try {
  //       await PR.submitHashList(projAddrT1, hashTasks(taskSet2), {from: tokenStaker1})
  //     } catch (e) {
  //       errorThrown = true
  //     }
  //     assertThrown(errorThrown, 'An error should have been thrown')
  //   })
  //
  //   it('Reputation staker can\'t submit hash list to TR staked project in staked state', async function () {
  //     errorThrown = false
  //     try {
  //       await PR.submitHashList(projAddrT1, hashTasks(taskSet2), {from: tokenStaker1})
  //     } catch (e) {
  //       errorThrown = true
  //     }
  //     assertThrown(errorThrown, 'An error should have been thrown')
  //   })
  //
  //   it('Token staker can\'t submit hash list to RR staked project in staked state', async function () {
  //     errorThrown = false
  //     try {
  //       await PR.submitHashList(projAddrR1, hashTasks(taskSet2), {from: tokenStaker1})
  //     } catch (e) {
  //       errorThrown = true
  //     }
  //     assertThrown(errorThrown, 'An error should have been thrown')
  //   })
  //
  //   it('Reputation staker can\'t submit hash list to RR staked project in staked state', async function () {
  //     errorThrown = false
  //     try {
  //       await PR.submitHashList(projAddrR1, hashTasks(taskSet2), {from: tokenStaker1})
  //     } catch (e) {
  //       errorThrown = true
  //     }
  //     assertThrown(errorThrown, 'An error should have been thrown')
  //   })
  // })
  //
  // describe('state changes on staked projects with task hash submissions', () => {
  //   before(async function () {
  //     // fast forward time
  //     evmIncreaseTime(604800) // 1 week
  //   })
  //
  //   it('TR staked project becomes active if task hashes are submitted by the staking deadline', async function () {
  //     // take stock of variables
  //     let stateBefore = await project.getState(projAddrT1)
  //
  //     // call checkStaked()
  //     await PR.checkActive(projAddrT1)
  //
  //     // take stock of variables
  //     let stateAfter = await project.getState(projAddrT1)
  //
  //     // checks
  //     assert.equal(stateBefore, 2, 'state before should be 2')
  //     assert.equal(stateAfter, 3, 'state after should be 3')
  //   })
  //
  //   it('RR staked project becomes active if task hashes are submitted by the staking deadline', async function () {
  //     // take stock of variables
  //     let stateBefore = await project.getState(projAddrR1)
  //
  //     // call checkStaked()
  //     await PR.checkActive(projAddrR1)
  //
  //     // take stock of variables
  //     let stateAfter = await project.getState(projAddrR1)
  //
  //     // checks
  //     assert.equal(stateBefore, 2, 'state before should be 2')
  //     assert.equal(stateAfter, 3, 'state after should be 3')
  //   })
  // })
  //
  // describe('time out state changes', () => {
  //   it('TR staked project becomes failed if no task hashes are submitted by the staking deadline', async function () {
  //     // take stock of variables
  //     let stateBefore = await project.getState(projAddrT2)
  //
  //     // call checkStaked()
  //     await PR.checkActive(projAddrT2)
  //
  //     // take stock of variables
  //     let stateAfter = await project.getState(projAddrT2)
  //
  //     // checks
  //     assert.equal(stateBefore, 2, 'state before should be 2')
  //     assert.equal(stateAfter, 7, 'state after should be 7')
  //   })
  //
  //   // it('RR staked project becomes failed if no task hashes are submitted by the staking deadline', async function () {
  //   //   // take stock of variables
  //   //   let stateBefore = await project.getState(projAddrR2)
  //   //
  //   //   // call checkStaked()
  //   //   await PR.checkActive(projAddrR2)
  //   //
  //   //   // take stock of variables
  //   //   let stateAfter = await project.getState(projAddrR2)
  //   //
  //   //   // checks
  //   //   assert.equal(stateBefore, 2, 'state before should be 2')
  //   //   assert.equal(stateAfter, 7, 'state after should be 7')
  //   // })
  // })
  //
  // describe('submit task hash on active projects', () => {
  //   it('Add task hash can\'t be called by token staker on TR staked project once it is active', async function () {
  //     errorThrown = false
  //     try {
  //       await PR.addTaskHash(projAddrT1, hashTasksArray(taskSet1), {from: tokenStaker1})
  //     } catch (e) {
  //       errorThrown = true
  //     }
  //     assertThrown(errorThrown, 'An error should have been thrown')
  //   })
  //
  //   it('Add task hash can\'t be called by reputation staker on TR staked project once it is active', async function () {
  //     errorThrown = false
  //     try {
  //       await PR.addTaskHash(projAddrT1, hashTasksArray(taskSet1), {from: repStaker1})
  //     } catch (e) {
  //       errorThrown = true
  //     }
  //     assertThrown(errorThrown, 'An error should have been thrown')
  //   })
  //
  //   it('Add task hash can\'t be called by token staker on RR staked project once it is active', async function () {
  //     errorThrown = false
  //     try {
  //       await PR.addTaskHash(projAddrR1, hashTasksArray(taskSet1), {from: tokenStaker1})
  //     } catch (e) {
  //       errorThrown = true
  //     }
  //     assertThrown(errorThrown, 'An error should have been thrown')
  //   })
  //
  //   it('Add task hash can\'t be called by reputation staker on RR staked project once it is active', async function () {
  //     errorThrown = false
  //     try {
  //       await PR.addTaskHash(projAddrR1, hashTasksArray(taskSet1), {from: repStaker1})
  //     } catch (e) {
  //       errorThrown = true
  //     }
  //     assertThrown(errorThrown, 'An error should have been thrown')
  //   })
  // })
})
