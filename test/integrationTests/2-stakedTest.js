/* eslint-env mocha */
/* global assert contract */

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
const evmIncreaseTime = require('../utils/evmIncreaseTime')
const keccakHashes = require('../utils/keccakHashes')
const taskDetails = require('../utils/taskDetails')

contract('Staked State', function (accounts) {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let PR, TR, RR
  let {user, project, returnProject, utils} = projObj
  let {tokenProposer, repProposer, notProposer} = user
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

  let fastForwards = 1 // testrpc is 1 week ahead at this point

  before(async function () {
    // get contract
    await projObj.contracts.setContracts()
    PR = projObj.contracts.PR
    RR = projObj.contracts.RR
    TR = projObj.contracts.TR

    // get staked projects
    // to check successful transition to active period
    projAddrT1 = await returnProject.staked_T(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash)
    projAddrR1 = await returnProject.staked_R(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash)

    // to check failed transition to failed period
    projAddrT2 = await returnProject.staked_T(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash)
    projAddrR2 = await returnProject.staked_R(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash)
  })

  describe('handle proposer', () => {
    it('not proposer can\'t call refund proposer from token registry', async () => {
      errorThrown = false
      try {
        await TR.refundProposer(projAddrT1, {from: notProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not proposer can\'t call refund proposer from reputation registry', async () => {
      errorThrown = false
      try {
        await RR.refundProposer(projAddrR1, {from: notProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    // these two tests must come after not proposer refund proposer tests
    it('refund proposer can be called on TR complete project', async () => {
      // take stock of variables
      let proposedWeiCost = await project.getProposedWeiCost(projAddrT1)

      let tpBalBefore = await utils.getTokenBalance(tokenProposer)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let proposerStakeBefore = await project.getProposerStake(projAddrT1)

      // call refund proposer
      await TR.refundProposer(projAddrT1, {from: tokenProposer})

      // take stock of variables
      let tpBalAfter = await utils.getTokenBalance(tokenProposer)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let proposerStakeAfter = await project.getProposerStake(projAddrT1)

      // checks
      assert.equal(tpBalBefore + proposerStakeBefore, tpBalAfter, 'tokenProposer balance updated incorrectly')
      assert.equal(TRBalBefore, TRBalAfter + proposerStakeBefore, 'TR balance updated incorrectly')
      assert.equal(weiPoolBefore - Math.floor(proposedWeiCost / 20), weiPoolAfter, 'wei pool should be 5% of the project\'s proposed cost less')
      assert.equal(proposerStakeAfter, 0, 'proposer stake should have been zeroed out')
    })

    it('refund proposer can be called on RR complete project', async () => {
      // take stock of variables
      let proposedWeiCost = await project.getProposedWeiCost(projAddrR1)

      let rpBalBefore = await utils.getRepBalance(repProposer)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let proposerStakeBefore = await project.getProposerStake(projAddrR1)

      // call refund proposer
      await RR.refundProposer(projAddrR1, {from: repProposer})

      // take stock of variables
      let rpBalAfter = await utils.getRepBalance(repProposer)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let proposerStakeAfter = await project.getProposerStake(projAddrR1)

      // checks
      assert.equal(rpBalBefore + proposerStakeBefore, rpBalAfter, 'tokenProposer balance updated incorrectly')
      assert.equal(weiPoolBefore - Math.floor(proposedWeiCost / 20), weiPoolAfter, 'wei pool should be 5% of the project\'s proposed cost less')
      assert.equal(proposerStakeAfter, 0, 'proposer stake should have been zeroed out')
    })

    it('proposer can\'t call refund proposer multiple times from token registry', async () => {
      errorThrown = false
      try {
        await TR.refundProposer(projAddrT1, {from: tokenProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('proposer can\'t call refund proposer multiple times from reputation registry', async () => {
      errorThrown = false
      try {
        await RR.refundProposer(projAddrR1, {from: repProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('adding task hashes to staked projects', () => {
    it('token staker can submit a task hash to TR staked project', async () => {
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

    it('token staker can submit a task hash to RR staked project', async () => {
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

    it('reputation staker can submit a different task hash to TR staked project', async () => {
      // take stock of variables before
      let topTaskHashBefore = await PR.stakedProjects(projAddrT1)

      let repStaker1Weighting = project.calculateWeightOfAddress(repStaker1, projAddrT1)
      let tokenStaker1Weighting = project.calculateWeightOfAddress(tokenStaker1, projAddrT1)

      // token staker submits
      await PR.addTaskHash(projAddrT1, hashTasksArray(taskSet2), {from: repStaker1})

      // take stock of variables after
      let topTaskHashAfter = await PR.stakedProjects(projAddrT1)

      // checks
      assert.equal(topTaskHashBefore, hashTasksArray(taskSet1), 'incorrect top task hash before')

      repStaker1Weighting > tokenStaker1Weighting
        ? assert.equal(topTaskHashAfter, hashTasksArray(taskSet2), 'incorrect top task hash after')
        : assert.equal(topTaskHashAfter, hashTasksArray(taskSet1), 'incorrect top task hash after')
    })

    it('reputation staker can submit the same task hash to TR staked project', async () => {
      // take stock of variables before
      let topTaskHashBefore = await PR.stakedProjects(projAddrT1)

      let repStaker1Weighting = project.calculateWeightOfAddress(repStaker1, projAddrT1)
      let tokenStaker1Weighting = project.calculateWeightOfAddress(tokenStaker1, projAddrT1)

      // token staker submits
      await PR.addTaskHash(projAddrT1, hashTasksArray(taskSet1), {from: repStaker1})

      // take stock of variables after
      let topTaskHashAfter = await PR.stakedProjects(projAddrT1)

      // checks
      if (repStaker1Weighting > tokenStaker1Weighting) {
        assert.equal(topTaskHashBefore, hashTasksArray(taskSet2), 'incorrect top task hash before')
        assert.equal(topTaskHashAfter, hashTasksArray(taskSet1), 'incorrect top task hash after')
      } else {
        assert.equal(topTaskHashBefore, hashTasksArray(taskSet1), 'incorrect top task hash before')
        assert.equal(topTaskHashAfter, hashTasksArray(taskSet1), 'incorrect top task hash after')
      }
    })

    it('reputation staker can submit a different task hash to RR staked project', async () => {
      // take stock of variables before
      let topTaskHashBefore = await PR.stakedProjects(projAddrR1)

      let repStaker1Weighting = project.calculateWeightOfAddress(repStaker1, projAddrR1)
      let tokenStaker1Weighting = project.calculateWeightOfAddress(tokenStaker1, projAddrR1)

      // token staker submits
      await PR.addTaskHash(projAddrR1, hashTasksArray(taskSet2), {from: repStaker1})

      // take stock of variables after
      let topTaskHashAfter = await PR.stakedProjects(projAddrR1)

      // checks
      // checks
      assert.equal(topTaskHashBefore, hashTasksArray(taskSet1), 'incorrect top task hash before')

      repStaker1Weighting > tokenStaker1Weighting
        ? assert.equal(topTaskHashAfter, hashTasksArray(taskSet2), 'incorrect top task hash after')
        : assert.equal(topTaskHashAfter, hashTasksArray(taskSet1), 'incorrect top task hash after')
    })

    it('reputation staker can submit the same task hash to RR staked project', async () => {
      // take stock of variables before
      let topTaskHashBefore = await PR.stakedProjects(projAddrR1)

      let repStaker1Weighting = project.calculateWeightOfAddress(repStaker1, projAddrR1)
      let tokenStaker1Weighting = project.calculateWeightOfAddress(tokenStaker1, projAddrR1)

      // token staker submits
      await PR.addTaskHash(projAddrR1, hashTasksArray(taskSet1), {from: repStaker1})

      // take stock of variables after
      let topTaskHashAfter = await PR.stakedProjects(projAddrR1)

      // checks
      if (repStaker1Weighting > tokenStaker1Weighting) {
        assert.equal(topTaskHashBefore, hashTasksArray(taskSet2), 'incorrect top task hash before')
        assert.equal(topTaskHashAfter, hashTasksArray(taskSet1), 'incorrect top task hash after')
      } else {
        assert.equal(topTaskHashBefore, hashTasksArray(taskSet1), 'incorrect top task hash before')
        assert.equal(topTaskHashAfter, hashTasksArray(taskSet1), 'incorrect top task hash after')
      }
    })

    it('not staker can\'t submit a task hash to TR staked project', async () => {
      errorThrown = false
      try {
        await PR.addTaskHash(projAddrT1, hashTasksArray(taskSet1), {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not staker can\'t submit a task hash to RR staked project', async () => {
      errorThrown = false
      try {
        await PR.addTaskHash(projAddrR1, hashTasksArray(taskSet1), {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('adding task hashes to nonexistant projects', () => {
    it('token staker can\'t add a task hash to a nonexistant project', async () => {
      errorThrown = false
      try {
        await PR.addTaskHash(notProject, hashTasksArray(taskSet1), {from: tokenStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('reputation staker can\'t add a task hash to a nonexistant project', async () => {
      errorThrown = false
      try {
        await PR.addTaskHash(notProject, hashTasksArray(taskSet1), {from: repStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('submitting hash lists to staked projects', () => {
    it('token staker can\'t submit hash list to TR staked project in staked state', async () => {
      errorThrown = false
      try {
        await PR.submitHashList(projAddrT1, hashTasks(taskSet2), {from: tokenStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('reputation staker can\'t submit hash list to TR staked project in staked state', async () => {
      errorThrown = false
      try {
        await PR.submitHashList(projAddrT1, hashTasks(taskSet2), {from: tokenStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token staker can\'t submit hash list to RR staked project in staked state', async () => {
      errorThrown = false
      try {
        await PR.submitHashList(projAddrR1, hashTasks(taskSet2), {from: tokenStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('reputation staker can\'t submit hash list to RR staked project in staked state', async () => {
      errorThrown = false
      try {
        await PR.submitHashList(projAddrR1, hashTasks(taskSet2), {from: tokenStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
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
      await evmIncreaseTime(604801) // 1 week
    })

    it('TR staked project becomes active if task hashes are submitted by the staking deadline', async () => {
      // take stock of variables
      let stateBefore = await project.getState(projAddrT1)

      // call checkActive
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

      // call checkActive
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

      // call checkActive
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

      // call checkActive
      await PR.checkActive(projAddrR2)

      // take stock of variables
      let stateAfter = await project.getState(projAddrR2)

      // checks
      assert.equal(stateBefore, 2, 'state before should be 2')
      assert.equal(stateAfter, 7, 'state after should be 7')
    })
  })

  describe('submit task hash on active projects', () => {
    it('add task hash can\'t be called by token staker on TR staked project once it is active', async () => {
      errorThrown = false
      try {
        await PR.addTaskHash(projAddrT1, hashTasksArray(taskSet1), {from: tokenStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('add task hash can\'t be called by reputation staker on TR staked project once it is active', async () => {
      errorThrown = false
      try {
        await PR.addTaskHash(projAddrT1, hashTasksArray(taskSet1), {from: repStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('add task hash can\'t be called by token staker on RR staked project once it is active', async () => {
      errorThrown = false
      try {
        await PR.addTaskHash(projAddrR1, hashTasksArray(taskSet1), {from: tokenStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('add task hash can\'t be called by reputation staker on RR staked project once it is active', async () => {
      errorThrown = false
      try {
        await PR.addTaskHash(projAddrR1, hashTasksArray(taskSet1), {from: repStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })
})
