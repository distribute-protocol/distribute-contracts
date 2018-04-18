/* eslint-env mocha */
/* global assert contract */

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
const evmIncreaseTime = require('../utils/evmIncreaseTime')
const KeccakHashes = require('../utils/KeccakHashes')

contract('Staked State', (accounts) => {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let TR, RR, PR
  let {user, project, returnProject} = projObj
  let {tokenStaker1, tokenStaker2} = user
  let {repStaker1, repStaker2} = user
  let {notStaker, notProject} = user
  let {projectCost, stakingPeriod, ipfsHash} = project

  // local test variables
  let projAddrT1, projAddrT2
  let projAddrR1, projAddrR2
  let errorThrown

  // ganache 1 week ahead at this point from previous test's evmIncreaseTime()
  let fastForwards = 1

  before(async function () {
    // get contracts
    await projObj.contracts.setContracts()
    TR = projObj.contracts.TR
    RR = projObj.contracts.RR
    PR = projObj.contracts.PR

    // get staked projects
    // to check successful transition to active period
    projAddrT1 = await returnProject.staked_T(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash)
    projAddrR1 = await returnProject.staked_R(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash)

    // to check failed transition to failed period
    // projAddrT2 = await returnProject.staked_T(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash)
    // projAddrR2 = await returnProject.staked_R(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash)
  })

  it('math works', async function () {
    assert.equal(1, 1, 'math broke')
  })

 //  it('non-staker can\'t submit a task hash', async function () {
 //    errorThrown = false
 //    try {
 //      await PR.addTaskHash(projectAddress, hashTasksArray(data1), {from: nonStaker})
 //    } catch (e) {
 //      errorThrown = true
 //    }
 //    assertThrown(errorThrown, 'An error should have been thrown')
 //  })
 //
 //  it('token staker can submit a task hash', async function () {
 //    let stakedProjectsBefore = await PR.stakedProjects.call(projectAddress)
 //    await PR.addTaskHash(projectAddress, hashTasksArray(data1), {from: staker1})
 //    let stakedProjectsAfter = await PR.stakedProjects.call(projectAddress)
 //    assert.equal(stakedProjectsAfter, hashTasksArray(data1), 'first hash didn\'t update')
 //    // assert.equal(stakedProjectsAfter[1].toNumber(), stakedProjectsBefore[1].toNumber(), 'logged nonexistant conflict')
 //    // assert.equal(stakedProjectsAfter[2].toNumber(), stakedProjectsBefore[2].toNumber() + 1, 'didn\'t log submission')
 //  })
 //
 //  it('token staker\'s submission logs correct weighting', async function () {
 //
 //  })
 //
 //  it('reputation staker can submit a task hash', async function () {
 //  })
 //
 //  it('reputation staker\'s submission logs correct weighting', async function () {
 //
 //  })
 //
 //  it('another token staker can submit a different task hash', async function () {
 //    let stakedProjectsBefore = await PR.stakedProjects.call(projectAddress)
 //    await PR.addTaskHash(projectAddress, hashTasksArray(data2), {from: staker2})
 //    let stakedProjectsAfter = await PR.stakedProjects.call(projectAddress)
 //    assert.equal(stakedProjectsAfter, hashTasksArray(data1), 'first hash shouldn\'t have updated')
 //    // assert.equal(stakedProjectsAfter[1].toNumber(), 1, 'didn\'t log conflict')
 //    // assert.equal(stakedProjectsAfter[2].toNumber(), stakedProjectsBefore[2].toNumber() + 1, 'didn\'t log submission')
 //  })
 //
 //  it('another reputation staker can submit a different task hash', async function () {
 //  })
 //
 //
 //  it('another token staker can submit the same task hash', async function () {
 //    let stakedProjectsBefore = await PR.stakedProjects.call(projectAddress)
 //    await PR.addTaskHash(projectAddress, hashTasksArray(data1), {from: staker1})
 //    let stakedProjectsAfter = await PR.stakedProjects.call(projectAddress)
 //    assert.equal(stakedProjectsAfter, hashTasksArray(data1), 'first hash shouldn\'t have updated')
 //    // assert.equal(stakedProjectsAfter[1].toNumber(), 1, 'conflict should still exist')
 //    // assert.equal(stakedProjectsAfter[2].toNumber(), stakedProjectsBefore[2].toNumber(), 'total submissions shouldn\'t update')
 //  })
 //
 //  it('another reputation staker can submit the same task hash', async function () {
 //  })
 //
 //  it('token staker can\'t submit hash list of staked project, even if correct', async function () {
 //    errorThrown = false
 //    try {
 //      await PR.submitHashList(projectAddress2, hashTasks(data2), {from: staker1})
 //    } catch (e) {
 //      errorThrown = true
 //    }
 //    assertThrown(errorThrown, 'An error should have been thrown')
 //  })
 //
 //  it('reputation staker can\'t submit hash list of staked project, even if correct', async function () {
 //  })
 //
 //  it('token staker\'s resubmission overwrites their previous submission', async function () {
 //
 //  })
 //
 //  it('reputation staker\'s resubmission overwrites their previous submission', async function () {
 //
 //  })
 //
 //  it('project with any submissions becomes active', async function () {
 //    await evmIncreaseTime(7 * 25 * 60 * 60)
 //    await PR.checkActive(projectAddress2)
 //    let state = await PROJ2.state()
 //    assert.equal(state.toNumber(), 3, 'project should have entered active period')
 //  })
 //
 //
 //  it('project with no task hash submissions becomes failed', async function () {
 //    await evmIncreaseTime(7 * 25 * 60 * 60)
 //    await PR.checkActive(projectAddress2)
 //    let state = await PROJ2.state()
 //    assert.equal(state.toNumber(), 3, 'project should have entered active period')
 //  })
 //
 //  // ///staker weights/// //
 //  // staker1 - 1332
 //  // staker2 - 1332
 //  // staker3 - 1333
 //  // let numSubmissions = await PR.getNumSubmissionsByWeight(projectAddress, topTaskHashBefore)
 //  // console.log('topTaskHash', topTaskHashBefore)
 //  // console.log('numSubmissionsByWeight', numSubmissions)
 //  // numSubmissions = await PR.getNumSubmissionsByWeight(projectAddress, topTaskHashAfter)
 //  // console.log('topTaskHashAfter', topTaskHashAfter)
 //  // console.log('numSubmissionsByWeightAfter', numSubmissions)
 //
 //  // may need to do following 3 tests 3x - token staker w/token staker, token staker w/rep staker, rep staker w/rep staker
 //  it('staker with less weight with a different task hash doesn\'t change top task hash', async function () {
 //    let topTaskHashBefore = await PR.disputedProjects.call(projectAddress)
 //    await PR.addTaskHash(projectAddress, hashTasksForAddition(data2), {from: staker2})
 //    let topTaskHashAfter = await PR.disputedProjects.call(projectAddress)
 //    let state = await PROJ.state()
 //    assert.equal(topTaskHashAfter, hashTasksForAddition(data1), 'top hash didn\'t update')
 //    assert.equal(topTaskHashBefore, topTaskHashAfter, 'top hash shouldn\'t have updated')
 //    assert.equal(state.toNumber(), 3, 'project shouldn\'t have exited the dispute period')
 //  })
 //
 // it('staker with same weight with a different task hash doesn\'t change top task hash', async function () {
 //   let topTaskHashBefore = await PR.disputedProjects.call(projectAddress)
 //   await PR.addTaskHash(projectAddress, hashTasksForAddition(data2), {from: staker2})
 //   let topTaskHashAfter = await PR.disputedProjects.call(projectAddress)
 //   let state = await PROJ.state()
 //   assert.equal(topTaskHashAfter, hashTasksForAddition(data1), 'top hash didn\'t update')
 //   assert.equal(topTaskHashBefore, topTaskHashAfter, 'top hash shouldn\'t have updated')
 //   assert.equal(state.toNumber(), 3, 'project shouldn\'t have exited the dispute period')
 // })
 //
 // it('staker with larger weight with a different task hash changes top task hash', async function () {
 //   let topTaskHashBefore = await PR.disputedProjects.call(projectAddress)
 //   await PR.addTaskHash(projectAddress, hashTasksForAddition(data3), {from: staker3})
 //   let topTaskHashAfter = await PR.disputedProjects.call(projectAddress)
 //   let state = await PROJ.state()
 //   assert.equal(topTaskHashAfter, hashTasksForAddition(data3), 'top hash didn\'t update')
 //   assert.equal(topTaskHashBefore, hashTasksForAddition(data1), 'top hash shouldn\'t have updated')
 //   assert.equal(state.toNumber(), 3, 'project shouldn\'t have exited the dispute period')
 // })
 //
 // it('non-staker can\'t submit task hash staked project', async function () {
 //   errorThrown = false
 //   try {
 //     await PR.addTaskHash(projectAddress, hashTasksForAddition(data1), {from: nonStaker})
 //   } catch (e) {
 //     errorThrown = true
 //   }
 //   assertThrown(errorThrown, 'An error should have been thrown')
 // })
 //
 // it('staked project with no submissions becomes failed', async function () {
 //   let state = await PROJ3.state()
 //   assert.equal(state.toNumber(), 2, 'project should be in open state')
 //   await evmIncreaseTime(7 * 25 * 60 * 60)
 //   await PR.checkActive(projectAddress3)
 //   state = await PROJ3.state()
 //   assert.equal(state.toNumber(), 7, 'project should have entered dispute period')
 // })
 //
 // it('can\'t change project to active or failed state before time is up', async function () {
 //
 // })
})
