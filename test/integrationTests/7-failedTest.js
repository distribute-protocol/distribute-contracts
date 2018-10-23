/* eslint-env mocha */
/* global assert contract web3 */

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
const taskDetails = require('../utils/taskDetails')

contract('Failed State', function (accounts) {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let DT, TR, RR, PLCR
  let {user, project, task, variables, utils, returnProject} = projObj
  let {tokenProposer, repProposer, notProposer} = user
  let {tokenStaker1, tokenStaker2, repStaker1, repStaker2, notStaker} = user
  let {worker1, worker2, notWorker} = user
  let {validator1, validator2, validator3, notValidator} = user
  let {tokenYesVoter, tokenNoVoter, repYesVoter, repNoVoter, notVoter} = user
  let {projectCost, stakingPeriod, ipfsHash} = variables
  let {voteAmount, voteAmountMore} = variables

  // set up task details & hashing functions
  let {taskSet5} = taskDetails

  // local test variables
  let projArray
  let errorThrown
  let projAddrT, projAddrR

  // define task validation & voting indices
  let valTrueOnly = 0
  let valFalseOnly = 1
  let valTrueMoreVoteTrueOnly = 2
  let valFalseMoreVoteTrueOnly = 3
  let valTrueMoreVoteFalseOnly = 4
  let valFalseMoreVoteFalseOnly = 5
  let valTrueMoreVoteTrueMore = 6
  let valFalseMoreVoteTrueMore = 7
  let valTrueMoreVoteFalseMore = 8
  let valFalseMoreVoteFalseMore = 9
  let valNeither = 10

  let valType = [variables.valTrueOnly, variables.valFalseOnly, variables.valTrueMore, variables.valFalseMore, variables.valTrueMore, variables.valFalseMore, variables.valTrueMore, variables.valFalseMore, variables.valTrueMore, variables.valFalseMore, variables.valNeither]
  let voteType = [variables.voteNeither, variables.voteNeither, variables.voteTrueOnly, variables.voteTrueOnly, variables.voteFalseOnly, variables.voteFalseOnly, variables.voteTrueMore, variables.voteTrueMore, variables.voteFalseMore, variables.voteFalseMore, variables.voteNeither]

  let fastForwards = 23 // testrpc is 23 weeks ahead at this point

  before(async function () {
    // get contract
    await projObj.contracts.setContracts()
    DT = projObj.contracts.DT
    TR = projObj.contracts.TR
    RR = projObj.contracts.RR
    PLCR = projObj.contracts.PLCR

    // get finished - failed projects
    projArray = await returnProject.finished(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash, taskSet5, taskSet5.length, valType, voteType, 7)

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
    it('refund proposer can be called on TR failed project', async () => {
      // take stock of variables
      let proposedWeiCost = await project.get({projAddr: projAddrT, fn: 'proposedCost', bn: false})

      let tpBalBefore = await utils.get({fn: DT.balances, params: tokenProposer, bn: false})
      let TRBalBefore = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiPoolBefore = await utils.get({fn: DT.weiBal})
      let proposerStakeBefore = await project.get({projAddr: projAddrT, fn: 'proposerStake', bn: false})

      // call refund proposer
      await TR.refundProposer(projAddrT, {from: tokenProposer})

      // take stock of variables
      let tpBalAfter = await utils.get({fn: DT.balances, params: tokenProposer, bn: false})
      let TRBalAfter = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiPoolAfter = await utils.get({fn: DT.weiBal})
      let proposerStakeAfter = await project.get({projAddr: projAddrT, fn: 'proposerStake', bn: false})

      // checks
      assert.equal(tpBalBefore + proposerStakeBefore, tpBalAfter, 'tokenProposer balance updated incorrectly')
      assert.equal(TRBalBefore, TRBalAfter + proposerStakeBefore, 'TR balance updated incorrectly')
      assert.equal(weiPoolBefore - Math.floor(proposedWeiCost / 20), weiPoolAfter, 'wei pool should be 5% of the project\'s proposed cost less')
      assert.equal(proposerStakeAfter, 0, 'proposer stake should have been zeroed out')
    })

    it('refund proposer can be called on RR failed project', async () => {
      // take stock of variables
      let proposedWeiCost = await project.get({projAddr: projAddrR, fn: 'proposedCost', bn: false})

      let rpBalBefore = await utils.get({fn: RR.users, params: repProposer, bn: false, position: 0})
      let weiPoolBefore = await utils.get({fn: DT.weiBal})
      let proposerStakeBefore = await project.get({projAddr: projAddrR, fn: 'proposerStake', bn: false})

      // call refund proposer
      await RR.refundProposer(projAddrR, {from: repProposer})

      // take stock of variables
      let rpBalAfter = await utils.get({fn: RR.users, params: repProposer, bn: false, position: 0})
      let weiPoolAfter = await utils.get({fn: DT.weiBal})
      let proposerStakeAfter = await project.get({projAddr: projAddrR, fn: 'proposerStake', bn: false})

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

  describe('handle stakers', () => {
    it('token stakers can\'t ask for refund from TR failed project', async () => {
      errorThrown = false
      try {
        // attempt to refund not validator on index validated false more (still has validations left on it)
        await TR.refundStaker(projAddrT, {from: tokenStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')

      errorThrown = false
      try {
        // attempt to refund not validator on index validated false more (still has validations left on it)
        await TR.refundStaker(projAddrT, {from: tokenStaker2})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token stakers can\'t ask for refund from RR failed project', async () => {
      errorThrown = false
      try {
        // attempt to refund not validator on index validated false more (still has validations left on it)
        await TR.refundStaker(projAddrR, {from: tokenStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')

      errorThrown = false
      try {
        // attempt to refund not validator on index validated false more (still has validations left on it)
        await TR.refundStaker(projAddrR, {from: tokenStaker2})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('reputation stakers can\'t ask for refund from TR failed project', async () => {
      errorThrown = false
      try {
        // attempt to refund not validator on index validated false more (still has validations left on it)
        await RR.refundStaker(projAddrT, {from: repStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')

      errorThrown = false
      try {
        // attempt to refund not validator on index validated false more (still has validations left on it)
        await RR.refundStaker(projAddrT, {from: repStaker2})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('reputation stakers can\'t ask for refund from RR failed project', async () => {
      errorThrown = false
      try {
        // attempt to refund not validator on index validated false more (still has validations left on it)
        await RR.refundStaker(projAddrR, {from: repStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')

      errorThrown = false
      try {
        // attempt to refund not validator on index validated false more (still has validations left on it)
        await RR.refundStaker(projAddrR, {from: repStaker2})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not staker can\'t ask for token refund from TR failed project', async () => {
      errorThrown = false
      try {
        await TR.refundStaker(projAddrT, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not staker can\'t ask for token refund from RR failed project', async () => {
      errorThrown = false
      try {
        await TR.refundStaker(projAddrR, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not staker can\'t ask for reputation refund from TR failed project', async () => {
      errorThrown = false
      try {
        await RR.refundStaker(projAddrT, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not staker can\'t ask for reputation refund from TR failed project', async () => {
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

  describe('handle workers', () => {
    it('worker can ask for reward from task validated only yes in TR failed project', async () => {
      let index = valTrueOnly

      // take stock of variables before
      let totalRepBefore = await utils.get({fn: RR.totalSupply, bn: false})
      let rwBalBefore = await utils.get({fn: RR.users, params: worker1, bn: false, position: 0})
      let projWeiBalVariableBefore = await project.get({projAddr: projAddrT, fn: 'weiBal', bn: false})
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrT))
      let repRewardBefore = await task.get({projAddr: projAddrT, index: index, fn: 'reputationReward', bn: false})
      let weiRewardBefore = await task.get({projAddr: projAddrT, index: index, fn: 'weiReward', bn: false})

      // reward worker
      await RR.rewardTask(projAddrT, index, {from: worker1})

      // take stock of variables after
      let totalRepAfter = await utils.get({fn: RR.totalSupply, bn: false})
      let rwBalAfter = await utils.get({fn: RR.users, params: worker1, bn: false, position: 0})
      let projWeiBalVariableAfter = await project.get({projAddr: projAddrT, fn: 'weiBal', bn: false})
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrT))
      let repRewardAfter = await task.get({projAddr: projAddrT, index: index, fn: 'reputationReward', bn: false})
      let weiRewardAfter = await task.get({projAddr: projAddrT, index: index, fn: 'weiReward', bn: false})

      // checks
      assert.equal(totalRepBefore, totalRepAfter, 'total reputation should not change')
      assert.equal(rwBalBefore + repRewardBefore, rwBalAfter, 'incorrect worker rep balance post-refund')
      assert.equal(projWeiBalVariableBefore, projWeiBalVariableAfter + weiRewardBefore, 'project wei bal variable updated incorrectly')
      assert.equal(projWeiBalBefore, projWeiBalAfter + weiRewardBefore, 'incorrect wei reward sent from project')
      assert.equal(repRewardAfter, 0, 'rep reward not zeroed out')
      assert.equal(weiRewardAfter, 0, 'wei reward not zeroed out')
    })

    it('worker can ask for reward from task validated only yes in RR failed project', async () => {
      let index = valTrueOnly

      // take stock of variables before
      let totalRepBefore = await utils.get({fn: RR.totalSupply, bn: false})
      let rwBalBefore = await utils.get({fn: RR.users, params: worker1, bn: false, position: 0})
      let projWeiBalVariableBefore = await project.get({projAddr: projAddrR, fn: 'weiBal', bn: false})
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrR))
      let repRewardBefore = await task.get({projAddr: projAddrR, index: index, fn: 'reputationReward', bn: false})
      let weiRewardBefore = await task.get({projAddr: projAddrR, index: index, fn: 'weiReward', bn: false})

      // reward worker
      await RR.rewardTask(projAddrR, index, {from: worker1})

      // take stock of variables after
      let totalRepAfter = await utils.get({fn: RR.totalSupply, bn: false})
      let rwBalAfter = await utils.get({fn: RR.users, params: worker1, bn: false, position: 0})
      let projWeiBalVariableAfter = await project.get({projAddr: projAddrR, fn: 'weiBal', bn: false})
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrR))
      let repRewardAfter = await task.get({projAddr: projAddrR, index: index, fn: 'reputationReward', bn: false})
      let weiRewardAfter = await task.get({projAddr: projAddrR, index: index, fn: 'weiReward', bn: false})

      // checks
      assert.equal(totalRepBefore, totalRepAfter, 'total reputation should not change')
      assert.equal(rwBalBefore + repRewardBefore, rwBalAfter, 'incorrect worker rep balance post-refund')
      assert.equal(projWeiBalVariableBefore, projWeiBalVariableAfter + weiRewardBefore, 'project wei bal variable updated incorrectly')
      assert.equal(projWeiBalBefore, projWeiBalAfter + weiRewardBefore, 'incorrect wei reward sent from project')
      assert.equal(repRewardAfter, 0, 'rep reward not zeroed out')
      assert.equal(weiRewardAfter, 0, 'wei reward not zeroed out')
    })

    it('worker can ask for reward from task validated more yes than no and voted only yes in TR failed project', async () => {
      let index = valTrueMoreVoteTrueOnly

      // take stock of variables before
      let totalRepBefore = await utils.get({fn: RR.totalSupply, bn: false})
      let rwBalBefore = await utils.get({fn: RR.users, params: worker1, bn: false, position: 0})
      let projWeiBalVariableBefore = await project.get({projAddr: projAddrT, fn: 'weiBal', bn: false})
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrT))
      let repRewardBefore = await task.get({projAddr: projAddrT, index: index, fn: 'reputationReward', bn: false})
      let weiRewardBefore = await task.get({projAddr: projAddrT, index: index, fn: 'weiReward', bn: false})

      // reward worker
      await RR.rewardTask(projAddrT, index, {from: worker1})

      // take stock of variables after
      let totalRepAfter = await utils.get({fn: RR.totalSupply, bn: false})
      let rwBalAfter = await utils.get({fn: RR.users, params: worker1, bn: false, position: 0})
      let projWeiBalVariableAfter = await project.get({projAddr: projAddrT, fn: 'weiBal', bn: false})
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrT))
      let repRewardAfter = await task.get({projAddr: projAddrT, index: index, fn: 'reputationReward', bn: false})
      let weiRewardAfter = await task.get({projAddr: projAddrT, index: index, fn: 'weiReward', bn: false})

      // checks
      assert.equal(totalRepBefore, totalRepAfter, 'total reputation should not change')
      assert.equal(rwBalBefore + repRewardBefore, rwBalAfter, 'incorrect worker rep balance post-refund')
      assert.equal(projWeiBalVariableBefore, projWeiBalVariableAfter + weiRewardBefore, 'project wei bal variable updated incorrectly')
      assert.equal(projWeiBalBefore, projWeiBalAfter + weiRewardBefore, 'incorrect wei reward sent from project')
      assert.equal(repRewardAfter, 0, 'rep reward not zeroed out')
      assert.equal(weiRewardAfter, 0, 'wei reward not zeroed out')
    })

    it('worker can ask for reward from task validated more yes than no and voted only yes in RR failed project', async () => {
      let index = valTrueMoreVoteTrueOnly

      // take stock of variables before
      let totalRepBefore = await utils.get({fn: RR.totalSupply, bn: false})
      let rwBalBefore = await utils.get({fn: RR.users, params: worker1, bn: false, position: 0})
      let projWeiBalVariableBefore = await project.get({projAddr: projAddrR, fn: 'weiBal', bn: false})
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrR))
      let repRewardBefore = await task.get({projAddr: projAddrR, index: index, fn: 'reputationReward', bn: false})
      let weiRewardBefore = await task.get({projAddr: projAddrR, index: index, fn: 'weiReward', bn: false})

      // reward worker
      await RR.rewardTask(projAddrR, index, {from: worker1})

      // take stock of variables after
      let totalRepAfter = await utils.get({fn: RR.totalSupply, bn: false})
      let rwBalAfter = await utils.get({fn: RR.users, params: worker1, bn: false, position: 0})
      let projWeiBalVariableAfter = await project.get({projAddr: projAddrR, fn: 'weiBal', bn: false})
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrR))
      let repRewardAfter = await task.get({projAddr: projAddrT, index: index, fn: 'reputationReward', bn: false})
      let weiRewardAfter = await task.get({projAddr: projAddrR, index: index, fn: 'weiReward', bn: false})

      // checks
      assert.equal(totalRepBefore, totalRepAfter, 'total reputation should not change')
      assert.equal(rwBalBefore + repRewardBefore, rwBalAfter, 'incorrect worker rep balance post-refund')
      assert.equal(projWeiBalVariableBefore, projWeiBalVariableAfter + weiRewardBefore, 'project wei bal variable updated incorrectly')
      assert.equal(projWeiBalBefore, projWeiBalAfter + weiRewardBefore, 'incorrect wei reward sent from project')
      assert.equal(repRewardAfter, 0, 'rep reward not zeroed out')
      assert.equal(weiRewardAfter, 0, 'wei reward not zeroed out')
    })

    it('worker can ask for reward from task validated more no than yes and voted only yes in TR failed project', async () => {
      let index = valFalseMoreVoteTrueOnly

      // take stock of variables before
      let totalRepBefore = await utils.get({fn: RR.totalSupply, bn: false})
      let rwBalBefore = await utils.get({fn: RR.users, params: worker2, bn: false, position: 0})
      let projWeiBalVariableBefore = await project.get({projAddr: projAddrT, fn: 'weiBal', bn: false})
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrT))
      let repRewardBefore = await task.get({projAddr: projAddrT, index: index, fn: 'reputationReward', bn: false})
      let weiRewardBefore = await task.get({projAddr: projAddrT, index: index, fn: 'weiReward', bn: false})

      // reward worker
      await RR.rewardTask(projAddrT, index, {from: worker2})

      // take stock of variables after
      let totalRepAfter = await utils.get({fn: RR.totalSupply, bn: false})
      let rwBalAfter = await utils.get({fn: RR.users, params: worker2, bn: false, position: 0})
      let projWeiBalVariableAfter = await project.get({projAddr: projAddrT, fn: 'weiBal', bn: false})
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrT))
      let repRewardAfter = await task.get({projAddr: projAddrT, index: index, fn: 'reputationReward', bn: false})
      let weiRewardAfter = await task.get({projAddr: projAddrT, index: index, fn: 'weiReward', bn: false})

      // checks
      assert.equal(totalRepBefore, totalRepAfter, 'total reputation should not change')
      assert.equal(rwBalBefore + repRewardBefore, rwBalAfter, 'incorrect worker rep balance post-refund')
      assert.equal(projWeiBalVariableBefore, projWeiBalVariableAfter + weiRewardBefore, 'project wei bal variable updated incorrectly')
      assert.equal(projWeiBalBefore, projWeiBalAfter + weiRewardBefore, 'incorrect wei reward sent from project')
      assert.equal(repRewardAfter, 0, 'rep reward not zeroed out')
      assert.equal(weiRewardAfter, 0, 'wei reward not zeroed out')
    })

    it('worker can ask for reward from task validated more no than yes and voted only yes in TR failed project', async () => {
      let index = valFalseMoreVoteTrueOnly

      // take stock of variables before
      let totalRepBefore = await utils.get({fn: RR.totalSupply, bn: false})
      let rwBalBefore = await utils.get({fn: RR.users, params: worker2, bn: false, position: 0})
      let projWeiBalVariableBefore = await project.get({projAddr: projAddrR, fn: 'weiBal', bn: false})
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrR))
      let repRewardBefore = await task.get({projAddr: projAddrR, index: index, fn: 'reputationReward', bn: false})
      let weiRewardBefore = await task.get({projAddr: projAddrR, index: index, fn: 'weiReward', bn: false})

      // reward worker
      await RR.rewardTask(projAddrR, index, {from: worker2})

      // take stock of variables after
      let totalRepAfter = await utils.get({fn: RR.totalSupply, bn: false})
      let rwBalAfter = await utils.get({fn: RR.users, params: worker2, bn: false, position: 0})
      let projWeiBalVariableAfter = await project.get({projAddr: projAddrR, fn: 'weiBal', bn: false})
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrR))
      let repRewardAfter = await task.get({projAddr: projAddrR, index: index, fn: 'reputationReward', bn: false})
      let weiRewardAfter = await task.get({projAddr: projAddrR, index: index, fn: 'weiReward', bn: false})

      // checks
      assert.equal(totalRepBefore, totalRepAfter, 'total reputation should not change')
      assert.equal(rwBalBefore + repRewardBefore, rwBalAfter, 'incorrect worker rep balance post-refund')
      assert.equal(projWeiBalVariableBefore, projWeiBalVariableAfter + weiRewardBefore, 'project wei bal variable updated incorrectly')
      assert.equal(projWeiBalBefore, projWeiBalAfter + weiRewardBefore, 'incorrect wei reward sent from project')
      assert.equal(repRewardAfter, 0, 'rep reward not zeroed out')
      assert.equal(weiRewardAfter, 0, 'wei reward not zeroed out')
    })

    it('worker can ask for reward from task validated more yes than no and voted more yes than no in TR failed project', async () => {
      let index = valTrueMoreVoteTrueMore

      // take stock of variables before
      let totalRepBefore = await utils.get({fn: RR.totalSupply, bn: false})
      let rwBalBefore = await utils.get({fn: RR.users, params: worker1, bn: false, position: 0})
      let projWeiBalVariableBefore = await project.get({projAddr: projAddrT, fn: 'weiBal', bn: false})
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrT))
      let repRewardBefore = await task.get({projAddr: projAddrT, index: index, fn: 'reputationReward', bn: false})
      let weiRewardBefore = await task.get({projAddr: projAddrT, index: index, fn: 'weiReward', bn: false})

      // reward worker
      await RR.rewardTask(projAddrT, index, {from: worker1})

      // take stock of variables after
      let totalRepAfter = await utils.get({fn: RR.totalSupply, bn: false})
      let rwBalAfter = await utils.get({fn: RR.users, params: worker1, bn: false, position: 0})
      let projWeiBalVariableAfter = await project.get({projAddr: projAddrT, fn: 'weiBal', bn: false})
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrT))
      let repRewardAfter = await task.get({projAddr: projAddrT, index: index, fn: 'reputationReward', bn: false})
      let weiRewardAfter = await task.get({projAddr: projAddrT, index: index, fn: 'weiReward', bn: false})

      // checks
      assert.equal(totalRepBefore, totalRepAfter, 'total reputation should not change')
      assert.equal(rwBalBefore + repRewardBefore, rwBalAfter, 'incorrect worker rep balance post-refund')
      assert.equal(projWeiBalVariableBefore, projWeiBalVariableAfter + weiRewardBefore, 'project wei bal variable updated incorrectly')
      assert.equal(projWeiBalBefore, projWeiBalAfter + weiRewardBefore, 'incorrect wei reward sent from project')
      assert.equal(repRewardAfter, 0, 'rep reward not zeroed out')
      assert.equal(weiRewardAfter, 0, 'wei reward not zeroed out')
    })

    it('worker can ask for reward from task validated more yes than no and voted more yes than no in RR failed project', async () => {
      let index = valTrueMoreVoteTrueMore

      // take stock of variables before
      let totalRepBefore = await utils.get({fn: RR.totalSupply, bn: false})
      let rwBalBefore = await utils.get({fn: RR.users, params: worker1, bn: false, position: 0})
      let projWeiBalVariableBefore = await project.get({projAddr: projAddrR, fn: 'weiBal', bn: false})
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrR))
      let repRewardBefore = await task.get({projAddr: projAddrR, index: index, fn: 'reputationReward', bn: false})
      let weiRewardBefore = await task.get({projAddr: projAddrR, index: index, fn: 'weiReward', bn: false})

      // reward worker
      await RR.rewardTask(projAddrR, index, {from: worker1})

      // take stock of variables after
      let totalRepAfter = await utils.get({fn: RR.totalSupply, bn: false})
      let rwBalAfter = await utils.get({fn: RR.users, params: worker1, bn: false, position: 0})
      let projWeiBalVariableAfter = await project.get({projAddr: projAddrR, fn: 'weiBal', bn: false})
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrR))
      let repRewardAfter = await task.get({projAddr: projAddrR, index: index, fn: 'reputationReward', bn: false})
      let weiRewardAfter = await task.get({projAddr: projAddrR, index: index, fn: 'weiReward', bn: false})

      // checks
      assert.equal(totalRepBefore, totalRepAfter, 'total reputation should not change')
      assert.equal(rwBalBefore + repRewardBefore, rwBalAfter, 'incorrect worker rep balance post-refund')
      assert.equal(projWeiBalVariableBefore, projWeiBalVariableAfter + weiRewardBefore, 'project wei bal variable updated incorrectly')
      assert.equal(projWeiBalBefore, projWeiBalAfter + weiRewardBefore, 'incorrect wei reward sent from project')
      assert.equal(repRewardAfter, 0, 'rep reward not zeroed out')
      assert.equal(weiRewardAfter, 0, 'wei reward not zeroed out')
    })

    it('worker can ask for reward from task validated more no than yes and voted more yes than no in TR failed project', async () => {
      let index = valFalseMoreVoteTrueMore

      // take stock of variables before
      let totalRepBefore = await utils.get({fn: RR.totalSupply, bn: false})
      let rwBalBefore = await utils.get({fn: RR.users, params: worker2, bn: false, position: 0})
      let projWeiBalVariableBefore = await project.get({projAddr: projAddrT, fn: 'weiBal', bn: false})
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrT))
      let repRewardBefore = await task.get({projAddr: projAddrT, index: index, fn: 'reputationReward', bn: false})
      let weiRewardBefore = await task.get({projAddr: projAddrT, index: index, fn: 'weiReward', bn: false})

      // reward worker
      await RR.rewardTask(projAddrT, index, {from: worker2})

      // take stock of variables after
      let totalRepAfter = await utils.get({fn: RR.totalSupply, bn: false})
      let rwBalAfter = await utils.get({fn: RR.users, params: worker2, bn: false, position: 0})
      let projWeiBalVariableAfter = await project.get({projAddr: projAddrT, fn: 'weiBal', bn: false})
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrT))
      let repRewardAfter = await task.get({projAddr: projAddrT, index: index, fn: 'reputationReward', bn: false})
      let weiRewardAfter = await task.get({projAddr: projAddrT, index: index, fn: 'weiReward', bn: false})

      // checks
      assert.equal(totalRepBefore, totalRepAfter, 'total reputation should not change')
      assert.equal(rwBalBefore + repRewardBefore, rwBalAfter, 'incorrect worker rep balance post-refund')
      assert.equal(projWeiBalVariableBefore, projWeiBalVariableAfter + weiRewardBefore, 'project wei bal variable updated incorrectly')
      assert.equal(projWeiBalBefore, projWeiBalAfter + weiRewardBefore, 'incorrect wei reward sent from project')
      assert.equal(repRewardAfter, 0, 'rep reward not zeroed out')
      assert.equal(weiRewardAfter, 0, 'wei reward not zeroed out')
    })

    it('worker can ask for reward from task validated more no than yes and voted more yes than no in RR failed project', async () => {
      let index = valFalseMoreVoteTrueMore

      // take stock of variables before
      let totalRepBefore = await utils.get({fn: RR.totalSupply, bn: false})
      let rwBalBefore = await utils.get({fn: RR.users, params: worker2, bn: false, position: 0})
      let projWeiBalVariableBefore = await project.get({projAddr: projAddrR, fn: 'weiBal', bn: false})
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrR))
      let repRewardBefore = await task.get({projAddr: projAddrR, index: index, fn: 'reputationReward', bn: false})
      let weiRewardBefore = await task.get({projAddr: projAddrR, index: index, fn: 'weiReward', bn: false})

      // reward worker
      await RR.rewardTask(projAddrR, index, {from: worker2})

      // take stock of variables after
      let totalRepAfter = await utils.get({fn: RR.totalSupply, bn: false})
      let rwBalAfter = await utils.get({fn: RR.users, params: worker2, bn: false, position: 0})
      let projWeiBalVariableAfter = await project.get({projAddr: projAddrR, fn: 'weiBal', bn: false})
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrR))
      let repRewardAfter = await task.get({projAddr: projAddrR, index: index, fn: 'reputationReward', bn: false})
      let weiRewardAfter = await task.get({projAddr: projAddrR, index: index, fn: 'weiReward', bn: false})

      // checks
      assert.equal(totalRepBefore, totalRepAfter, 'total reputation should not change')
      assert.equal(rwBalBefore + repRewardBefore, rwBalAfter, 'incorrect worker rep balance post-refund')
      assert.equal(projWeiBalVariableBefore, projWeiBalVariableAfter + weiRewardBefore, 'project wei bal variable updated incorrectly')
      assert.equal(projWeiBalBefore, projWeiBalAfter + weiRewardBefore, 'incorrect wei reward sent from project')
      assert.equal(repRewardAfter, 0, 'rep reward not zeroed out')
      assert.equal(weiRewardAfter, 0, 'wei reward not zeroed out')
    })

    it('worker can\'t ask for reward they\'ve already received from TR failed project', async () => {
      let index = valTrueOnly

      errorThrown = false
      try {
        await RR.rewardTask(projAddrT, index, {from: worker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t ask for reward they\'ve already received from RR failed project', async () => {
      let index = valTrueOnly

      errorThrown = false
      try {
        await RR.rewardTask(projAddrT, index, {from: worker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t ask for reward from task validated only no in TR failed project', async () => {
      let index = valFalseOnly

      errorThrown = false
      try {
        await RR.rewardTask(projAddrT, index, {from: worker2})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t ask for reward from task validated only no in RR failed project', async () => {
      let index = valFalseOnly

      errorThrown = false
      try {
        await RR.rewardTask(projAddrR, index, {from: worker2})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t ask for reward from task not validated in TR failed project', async () => {
      let index = valNeither

      errorThrown = false
      try {
        await RR.rewardTask(projAddrT, index, {from: worker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t ask for reward from task not validated in RR failed project', async () => {
      let index = valNeither

      errorThrown = false
      try {
        await RR.rewardTask(projAddrR, index, {from: worker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t ask for reward from task validated more yes than no and voted only no in TR failed project', async () => {
      let index = valTrueMoreVoteFalseOnly

      errorThrown = false
      try {
        await RR.rewardTask(projAddrT, index, {from: worker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t ask for reward from task validated more yes than no and voted only no in RR failed project', async () => {
      let index = valTrueMoreVoteFalseOnly

      errorThrown = false
      try {
        await RR.rewardTask(projAddrR, index, {from: worker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t ask for reward from task validated more no than yes and voted only no in TR failed project', async () => {
      let index = valFalseMoreVoteFalseOnly

      errorThrown = false
      try {
        await RR.rewardTask(projAddrT, index, {from: worker2})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t ask for reward from task validated more no than yes and voted only no in RR failed project', async () => {
      let index = valFalseMoreVoteFalseOnly

      errorThrown = false
      try {
        await RR.rewardTask(projAddrR, index, {from: worker2})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t ask for reward from task validated more yes than no and voted more no than yes in TR failed project', async () => {
      let index = valTrueMoreVoteFalseMore

      errorThrown = false
      try {
        await RR.rewardTask(projAddrT, index, {from: worker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t ask for reward from task validated more yes than no and voted more no than yes in RR failed project', async () => {
      let index = valTrueMoreVoteFalseMore

      errorThrown = false
      try {
        await RR.rewardTask(projAddrR, index, {from: worker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t ask for reward from task validated more no than yes and voted more no than yes in TR failed project', async () => {
      let index = valFalseMoreVoteFalseMore

      errorThrown = false
      try {
        await RR.rewardTask(projAddrT, index, {from: worker2})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('worker can\'t ask for reward from task validated more no than yes and voted more no than yes in RR failed project', async () => {
      let index = valFalseMoreVoteFalseMore

      errorThrown = false
      try {
        await RR.rewardTask(projAddrR, index, {from: worker2})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not worker can\'t ask for reward from TR failed project', async () => {
      let index = 1

      errorThrown = false
      try {
        await RR.rewardTask(projAddrT, index, {from: notWorker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not worker can\'t ask for reward from RR failed project', async () => {
      let index = 1

      errorThrown = false
      try {
        await RR.rewardTask(projAddrR, index, {from: notWorker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('handle originator', () => {
    it('not originator can\'t call reward originator from TR failed project', async () => {
      errorThrown = false
      try {
        await TR.rewardOriginator(projAddrT, {from: tokenStaker2})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not originator can\'t call reward originator from RR failed project', async () => {
      errorThrown = false
      try {
        await TR.rewardOriginator(projAddrR, {from: tokenStaker2})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('originator can\'t call reward originator from TR failed project', async () => {
      errorThrown = false
      try {
        await TR.rewardOriginator(projAddrT, {from: tokenStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('originator can\'t call reward originator from RR failed project', async () => {
      errorThrown = false
      try {
        await TR.rewardOriginator(projAddrR, {from: tokenStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('handle validators', () => {
    it('yes validator can ask for refund & reward from in TR failed project', async () => {
      // take stock of important environmental variables
      let index = valTrueMoreVoteTrueOnly
      let claimable = await task.get({projAddr: projAddrT, index: index, fn: 'claimable'})
      let claimableByRep = await task.get({projAddr: projAddrT, index: index, fn: 'claimableByRep'})
      let valDetails = await task.get({projAddr: projAddrT, index: index, fn: 'validators', params: validator1})
      let validatorStatus = valDetails[0]
      let validatorIndexBefore = valDetails[1].toNumber()
      let validatorAtIndex = await task.get({projAddr: projAddrT, index: index, fn: 'affirmativeValidators', params: validatorIndexBefore})
      let affirmativeIndex = await task.get({projAddr: projAddrT, index: index, fn: 'affirmativeIndex', bn: false})

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
      let rewardWeighting = 55 // 1st of 2 validators
      let validationReward = await project.get({projAddr: projAddrT, fn: 'validationReward'})
      let taskWeighting = await task.get({projAddr: projAddrT, index: index, fn: 'weighting'})
      let weiReward = Math.floor(validationReward.times(taskWeighting).toNumber() * rewardWeighting / 10000)

      // take stock of variables
      let validationEntryFee = await task.get({projAddr: projAddrT, index: index, fn: 'validationEntryFee', bn: false})
      let vBalBefore = await utils.get({fn: DT.balances, params: validator1, bn: false})
      let TRBalBefore = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrT))

      // refund & reward validator on index validated true only
      await TR.rewardValidator(projAddrT, index, {from: validator1})

      // take stock of variables
      valDetails = await task.get({projAddr: projAddrT, index: index, fn: 'validators', params: validator1})
      let validatorIndexAfter = valDetails[1]
      let vBalAfter = await utils.get({fn: DT.balances, params: validator1, bn: false})
      let TRBalAfter = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrT))

      // checks
      assert.equal(validatorIndexAfter, 5, 'validator index should be 5')
      assert.equal(vBalAfter, vBalBefore + validationEntryFee, 'validation tokens were not returned to validator')
      assert.equal(TRBalAfter + validationEntryFee, TRBalBefore, 'validation tokens were not removed from TR')
      assert.equal(projWeiBalAfter + weiReward, projWeiBalBefore, 'wei reward was not sent correctly to validator')
    })

    it('yes validator can ask for refund & reward from RR failed project', async () => {
      // take stock of important environmental variables
      let index = valTrueMoreVoteTrueOnly
      let claimable = await task.get({projAddr: projAddrR, index: index, fn: 'claimable'})
      let claimableByRep = await task.get({projAddr: projAddrR, index: index, fn: 'claimableByRep'})
      let valDetails = await task.get({projAddr: projAddrR, index: index, fn: 'validators', params: validator1})
      let validatorStatus = valDetails[0]
      let validatorIndexBefore = valDetails[1].toNumber()
      let validatorAtIndex = await task.get({projAddr: projAddrR, index: index, fn: 'affirmativeValidators', params: validatorIndexBefore})
      let affirmativeIndex = await task.get({projAddr: projAddrR, index: index, fn: 'affirmativeIndex', bn: false})

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
      let rewardWeighting = 55 // 1st of 2 validators
      let validationReward = await project.get({projAddr: projAddrR, fn: 'validationReward'})
      let taskWeighting = await task.get({projAddr: projAddrR, index: index, fn: 'weighting'})
      let weiReward = Math.floor(validationReward.times(taskWeighting).toNumber() * rewardWeighting / 10000)

      // take stock of variables
      let validationEntryFee = await task.get({projAddr: projAddrR, index: index, fn: 'validationEntryFee', bn: false})
      let vBalBefore = await utils.get({fn: DT.balances, params: validator1, bn: false})
      let TRBalBefore = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrR))

      // refund & reward validator on index validated true only
      await TR.rewardValidator(projAddrR, index, {from: validator1})

      // take stock of variables
      valDetails = await task.get({projAddr: projAddrR, index: index, fn: 'validators', params: validator1})
      let validatorIndexAfter = valDetails[1]
      let vBalAfter = await utils.get({fn: DT.balances, params: validator1, bn: false})
      let TRBalAfter = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrR))

      // checks
      assert.equal(validatorIndexAfter, 5, 'validator index should be 5')
      assert.equal(vBalAfter, vBalBefore + validationEntryFee, 'validation tokens were not returned to validator')
      assert.equal(TRBalAfter + validationEntryFee, TRBalBefore, 'validation tokens were not removed from TR')
      assert.equal(projWeiBalAfter + weiReward, projWeiBalBefore, 'wei reward was not sent correctly to validator')
    })

    it('no validator can ask for half refund from TR failed project', async () => {
      // take stock of important environmental variables
      let index = valTrueMoreVoteTrueOnly
      let claimable = await task.get({projAddr: projAddrT, index: index, fn: 'claimable'})
      let claimableByRep = await task.get({projAddr: projAddrT, index: index, fn: 'claimableByRep'})
      let valDetails = await task.get({projAddr: projAddrT, index: index, fn: 'validators', params: validator2})
      let validatorStatus = valDetails[0]
      let validatorIndexBefore = valDetails[1].toNumber()
      let validatorAtIndex = await task.get({projAddr: projAddrT, index: index, fn: 'negativeValidators', params: validatorIndexBefore})
      let negativeIndex = await task.get({projAddr: projAddrT, index: index, fn: 'negativeIndex', bn: false})

      // environmental checks
      assert.equal(claimable, true, 'task should be claimable')
      assert.equal(claimableByRep, true, 'task should be claimable by rep')
      assert.isAtMost(validatorIndexBefore, 4, 'validator index should be at most 4')
      assert.isAtLeast(validatorIndexBefore, 0, 'validator index should be at least 0')
      assert.equal(validatorAtIndex, validator2, 'incorrect validator stored at index')
      assert.equal(validatorStatus, false, 'ensure validator voted negatively')
      assert.isAtMost(negativeIndex, 5, 'negative index should be at most 5')
      assert.isAtLeast(negativeIndex, 0, 'negative index should be at least 0')

      // take stock of variables
      let validationEntryFee = await task.get({projAddr: projAddrT, index: index, fn: 'validationEntryFee', bn: false})
      let refund = Math.floor(validationEntryFee / 2)
      let tokensBurned = validationEntryFee - refund

      let totalTokensBefore = await utils.get({fn: DT.totalSupply, bn: false})
      let vBalBefore = await utils.get({fn: DT.balances, params: validator2, bn: false})
      let TRBalBefore = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrT))

      // refund & reward validator on index validated true only
      await TR.rewardValidator(projAddrT, index, {from: validator2})

      // take stock of variables
      valDetails = await task.get({projAddr: projAddrT, index: index, fn: 'validators', params: validator2})
      let validatorIndexAfter = valDetails[1]
      let totalTokensAfter = await utils.get({fn: DT.totalSupply, bn: false})
      let vBalAfter = await utils.get({fn: DT.balances, params: validator2, bn: false})
      let TRBalAfter = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrT))

      // checks
      assert.equal(validatorIndexAfter, 5, 'validator index should be 5')
      assert.equal(vBalAfter, vBalBefore + refund, 'validation tokens were not returned to validator')
      assert.equal(TRBalAfter + refund + tokensBurned, TRBalBefore, 'validation tokens were not removed from TR correctly')
      assert.equal(totalTokensAfter + tokensBurned, totalTokensBefore, 'tokens were not removed from total supply correctly')
      assert.equal(projWeiBalAfter, projWeiBalBefore, 'no wei reward should have been sent to validator')
    })

    it('no validator can ask for half reward from RR failed project', async () => {
      // take stock of important environmental variables
      let index = valTrueMoreVoteTrueOnly
      let claimable = await task.get({projAddr: projAddrR, index: index, fn: 'claimable'})
      let claimableByRep = await task.get({projAddr: projAddrR, index: index, fn: 'claimableByRep'})
      let valDetails = await task.get({projAddr: projAddrR, index: index, fn: 'validators', params: validator2})
      let validatorStatus = valDetails[0]
      let validatorIndexBefore = valDetails[1].toNumber()
      let validatorAtIndex = await task.get({projAddr: projAddrR, index: index, fn: 'negativeValidators', params: validatorIndexBefore})
      let negativeIndex = await task.get({projAddr: projAddrR, index: index, fn: 'negativeIndex', bn: false})

      // environmental checks
      assert.equal(claimable, true, 'task should be claimable')
      assert.equal(claimableByRep, true, 'task should be claimable by rep')
      assert.isAtMost(validatorIndexBefore, 4, 'validator index should be at most 4')
      assert.isAtLeast(validatorIndexBefore, 0, 'validator index should be at least 0')
      assert.equal(validatorAtIndex, validator2, 'incorrect validator stored at index')
      assert.equal(validatorStatus, false, 'ensure validator voted negatively')
      assert.isAtMost(negativeIndex, 5, 'negative index should be at most 5')
      assert.isAtLeast(negativeIndex, 0, 'negative index should be at least 0')

      // take stock of variables
      let validationEntryFee = await task.get({projAddr: projAddrR, index: index, fn: 'validationEntryFee', bn: false})
      let refund = Math.floor(validationEntryFee / 2)
      let tokensBurned = validationEntryFee - refund

      let totalTokensBefore = await utils.get({fn: DT.totalSupply, bn: false})
      let vBalBefore = await utils.get({fn: DT.balances, params: validator2, bn: false})
      let TRBalBefore = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrR))

      // refund & reward validator on index validated true only
      await TR.rewardValidator(projAddrR, index, {from: validator2})

      // take stock of variables
      valDetails = await task.get({projAddr: projAddrR, index: index, fn: 'validators', params: validator2})
      let validatorIndexAfter = valDetails[1]
      let totalTokensAfter = await utils.get({fn: DT.totalSupply, bn: false})
      let vBalAfter = await utils.get({fn: DT.balances, params: validator2, bn: false})
      let TRBalAfter = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrR))

      // checks
      assert.equal(validatorIndexAfter, 5, 'validator index should be 5')
      assert.equal(vBalAfter, vBalBefore + refund, 'validation tokens were not returned to validator')
      assert.equal(TRBalAfter + refund + tokensBurned, TRBalBefore, 'validation tokens were not removed from TR correctly')
      assert.equal(totalTokensAfter + tokensBurned, totalTokensBefore, 'tokens were not removed from total supply correctly')
      assert.equal(projWeiBalAfter, projWeiBalBefore, 'no wei reward should have been sent to validator')
    })

    it('not validator can\'t ask for reward from TR failed project', async () => {
      errorThrown = false
      try {
        // attempt to refund not validator on index validated false more (still has validations left on it)
        await TR.rewardValidator(projAddrT, valTrueMoreVoteTrueOnly, {from: notValidator})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not validator can\'t ask for reward from RR failed project', async () => {
      errorThrown = false
      try {
        // attempt to refund not validator on index validated false more (still has validations left on it)
        await TR.rewardValidator(projAddrT, valTrueMoreVoteTrueOnly, {from: notValidator})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('all eligible validators can be rewarded from TR failed project', async () => {
      // most things to be tests have been done in previous tests, but want to test that every TR.rewardValidator() can be called
      // as well as making sure that validator is rewarded proportionally correctly

      // calculate wei reward for validator 3 on index 1
      let index = valTrueMoreVoteTrueOnly
      let rewardWeighting = 45 // 2nd of 2 validators
      let validationReward = await project.get({projAddr: projAddrT, fn: 'validationReward'})
      let taskWeighting = await task.get({projAddr: projAddrT, index: index, fn: 'weighting'})
      let weiReward = Math.floor(validationReward.times(taskWeighting).toNumber() * rewardWeighting / 10000)

      // take stock of variables
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrT))

      // refund validator 3 on index 1
      await TR.rewardValidator(projAddrT, index, {from: validator3})

      // take stock of variables after
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrT))

      // checks
      assert.equal(projWeiBalAfter + weiReward, projWeiBalBefore, 'wei reward was not sent correctly to validator')

      // refund validators from index valTrueOnly
      index = valTrueOnly
      await TR.rewardValidator(projAddrT, index, {from: validator1})

      // refund validators from index valFalseOnly
      index = valFalseOnly
      await TR.rewardValidator(projAddrT, index, {from: validator1})

      // refund validators from index valTrueMoreVoteTrueOnly --> completed above

      // refund validators from index valTrueMoreVoteFalseOnly
      index = valTrueMoreVoteFalseOnly
      await TR.rewardValidator(projAddrT, index, {from: validator1})
      await TR.rewardValidator(projAddrT, index, {from: validator2})
      await TR.rewardValidator(projAddrT, index, {from: validator3})

      // refund validators from index valTrueMoreVoteTrueMore
      index = valTrueMoreVoteTrueMore
      await TR.rewardValidator(projAddrT, index, {from: validator1})
      await TR.rewardValidator(projAddrT, index, {from: validator2})
      await TR.rewardValidator(projAddrT, index, {from: validator3})

      // refund validators from index valTrueMoreVoteFalseMore
      index = valTrueMoreVoteFalseMore
      await TR.rewardValidator(projAddrT, index, {from: validator1})
      await TR.rewardValidator(projAddrT, index, {from: validator2})
      await TR.rewardValidator(projAddrT, index, {from: validator3})

      // refund validators from index valFalseMoreVoteTrueOnly
      index = valFalseMoreVoteTrueOnly
      await TR.rewardValidator(projAddrT, index, {from: validator1})
      await TR.rewardValidator(projAddrT, index, {from: validator2})
      await TR.rewardValidator(projAddrT, index, {from: validator3})

      // refund validators from index valFalseMoreVoteFalseOnly
      index = valFalseMoreVoteFalseOnly
      await TR.rewardValidator(projAddrT, index, {from: validator1})
      await TR.rewardValidator(projAddrT, index, {from: validator2})
      await TR.rewardValidator(projAddrT, index, {from: validator3})

      // refund validators from index valFalseMoreVoteTrueMore
      index = valFalseMoreVoteTrueMore
      await TR.rewardValidator(projAddrT, index, {from: validator1})
      await TR.rewardValidator(projAddrT, index, {from: validator2})
      await TR.rewardValidator(projAddrT, index, {from: validator3})

      // refund validators from index valFalseMoreVoteFalseMore
      index = valFalseMoreVoteFalseMore
      await TR.rewardValidator(projAddrT, index, {from: validator1})
      await TR.rewardValidator(projAddrT, index, {from: validator2})
      await TR.rewardValidator(projAddrT, index, {from: validator3})
    })

    it('all eligible validators can be rewarded from RR failed project', async () => {
      // most things to be tests have been done in previous tests, but want to test that every TR.rewardValidator() can be called
      // as well as making sure that validator is rewarded proportionally correctly

      // calculate wei reward for validator 3 on index 1
      let index = valTrueMoreVoteTrueOnly
      let rewardWeighting = 45 // 2nd of 2 validators
      let validationReward = await project.get({projAddr: projAddrR, fn: 'validationReward'})
      let taskWeighting = await task.get({projAddr: projAddrR, index: index, fn: 'weighting'})
      let weiReward = Math.floor(validationReward.times(taskWeighting).toNumber() * rewardWeighting / 10000)

      // take stock of variables
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrR))

      // refund validator 3 on index 1
      await TR.rewardValidator(projAddrR, index, {from: validator3})

      // take stock of variables after
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrR))

      // checks
      assert.equal(projWeiBalAfter + weiReward, projWeiBalBefore, 'wei reward was not sent correctly to validator')

      // refund validators from index valTrueOnly
      index = valTrueOnly
      await TR.rewardValidator(projAddrR, index, {from: validator1})

      // refund validators from index valFalseOnly
      index = valFalseOnly
      await TR.rewardValidator(projAddrR, index, {from: validator1})

      // refund validators from index valTrueMoreVoteTrueOnly --> completed above

      // refund validators from index valTrueMoreVoteFalseOnly
      index = valTrueMoreVoteFalseOnly
      await TR.rewardValidator(projAddrR, index, {from: validator1})
      await TR.rewardValidator(projAddrR, index, {from: validator2})
      await TR.rewardValidator(projAddrR, index, {from: validator3})

      // refund validators from index valTrueMoreVoteTrueMore
      index = valTrueMoreVoteTrueMore
      await TR.rewardValidator(projAddrR, index, {from: validator1})
      await TR.rewardValidator(projAddrR, index, {from: validator2})
      await TR.rewardValidator(projAddrR, index, {from: validator3})

      // refund validators from index valTrueMoreVoteFalseMore
      index = valTrueMoreVoteFalseMore
      await TR.rewardValidator(projAddrR, index, {from: validator1})
      await TR.rewardValidator(projAddrR, index, {from: validator2})
      await TR.rewardValidator(projAddrR, index, {from: validator3})

      // refund validators from index valFalseMoreVoteTrueOnly
      index = valFalseMoreVoteTrueOnly
      await TR.rewardValidator(projAddrR, index, {from: validator1})
      await TR.rewardValidator(projAddrR, index, {from: validator2})
      await TR.rewardValidator(projAddrR, index, {from: validator3})

      // refund validators from index valFalseMoreVoteFalseOnly
      index = valFalseMoreVoteFalseOnly
      await TR.rewardValidator(projAddrR, index, {from: validator1})
      await TR.rewardValidator(projAddrR, index, {from: validator2})
      await TR.rewardValidator(projAddrR, index, {from: validator3})

      // refund validators from index valFalseMoreVoteTrueMore
      index = valFalseMoreVoteTrueMore
      await TR.rewardValidator(projAddrR, index, {from: validator1})
      await TR.rewardValidator(projAddrR, index, {from: validator2})
      await TR.rewardValidator(projAddrR, index, {from: validator3})

      // refund validators from index valFalseMoreVoteFalseMore
      index = valFalseMoreVoteFalseMore
      await TR.rewardValidator(projAddrR, index, {from: validator1})
      await TR.rewardValidator(projAddrR, index, {from: validator2})
      await TR.rewardValidator(projAddrR, index, {from: validator3})
    })
  })

  describe('handle voters', () => {
    it('yes token voter can\'t refund more voting tokens than they have', async () => {
      errorThrown = false
      let availableVotesBefore = await PLCR.getAvailableTokens(tokenYesVoter, 1)
      let lockedTokens = await PLCR.getLockedTokens(tokenYesVoter)

      try {
        await TR.refundVotingTokens(availableVotesBefore - lockedTokens + 1, {from: tokenYesVoter})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('yes token voter can refund voting tokens', async () => {
      // take stock of variables before
      let tyvBalBefore = await utils.get({fn: DT.balances, params: tokenYesVoter, bn: false})
      let TRBalBefore = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let availableVotesBefore = await PLCR.getAvailableTokens(tokenYesVoter, 1)
      let lockedTokens = await PLCR.getLockedTokens(tokenYesVoter)

      // checks
      assert.equal(0, lockedTokens, 'assure no votes are locked')
      assert.equal(voteAmountMore, availableVotesBefore, 'assure correct amount of tokens are available')

      // refund voter
      await TR.refundVotingTokens(voteAmountMore, {from: tokenYesVoter})

      // take stock of variables after
      let tyvBalAfter = await utils.get({fn: DT.balances, params: tokenYesVoter, bn: false})
      let TRBalAfter = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let availableVotesAfter = await PLCR.getAvailableTokens(tokenYesVoter, 1)

      // checks
      assert.equal(Math.pow(availableVotesBefore, 2) - Math.pow(availableVotesAfter, 2), tyvBalAfter - tyvBalBefore, 'votes requested incorrectly')
      assert.equal(tyvBalAfter - tyvBalBefore, TRBalBefore - TRBalAfter, 'tokens transferred to escrow incorrectly')
      assert.equal(availableVotesAfter, 0, 'assert no votes are available')
    })

    it('no token voter can\'t refund more voting tokens than they have', async () => {
      errorThrown = false
      let availableVotesBefore = await PLCR.getAvailableTokens(tokenNoVoter, 1)
      let lockedTokens = await PLCR.getLockedTokens(tokenNoVoter)

      try {
        await TR.refundVotingTokens(availableVotesBefore - lockedTokens + 1, {from: tokenNoVoter})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('no token voter can refund voting tokens', async () => {
      // take stock of variables before
      let tnvBalBefore = await utils.get({fn: DT.balances, params: tokenNoVoter, bn: false})
      let TRBalBefore = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let availableVotesBefore = await PLCR.getAvailableTokens(tokenNoVoter, 1)
      let lockedTokens = await PLCR.getLockedTokens(tokenNoVoter)

      // checks
      assert.equal(0, lockedTokens, 'assure no votes are locked')
      assert.equal(voteAmountMore, availableVotesBefore, 'assure correct amount of tokens are available')

      // refund voter
      await TR.refundVotingTokens(voteAmountMore, {from: tokenNoVoter})

      // take stock of variables after
      let tnvBalAfter = await utils.get({fn: DT.balances, params: tokenNoVoter, bn: false})
      let TRBalAfter = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let availableVotesAfter = await PLCR.getAvailableTokens(tokenNoVoter, 1)

      // checks
      assert.equal(Math.pow(availableVotesBefore, 2) - Math.pow(availableVotesAfter, 2), tnvBalAfter - tnvBalBefore, 'votes requested incorrectly')
      assert.equal(tnvBalAfter - tnvBalBefore, TRBalBefore - TRBalAfter, 'tokens transferred to escrow incorrectly')
      assert.equal(availableVotesAfter, 0, 'assert no votes are available')
    })

    it('yes reputation voter can\'t refund more voting reputation than they have', async () => {
      errorThrown = false
      let availableVotesBefore = await PLCR.getAvailableTokens(repYesVoter, 2)
      let lockedTokens = await PLCR.getLockedTokens(repYesVoter)

      try {
        await RR.refundVotingReputation(availableVotesBefore - lockedTokens + 1, {from: repYesVoter})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('yes reputation voter can refund voting reputation', async () => {
      // take stock of variables before
      let ryvBalBefore = await utils.get({fn: RR.users, params: repYesVoter, bn: false, position: 0})
      let availableVotesBefore = await PLCR.getAvailableTokens(repYesVoter, 2)
      let lockedTokens = await PLCR.getLockedTokens(repYesVoter)

      // checks
      assert.equal(0, lockedTokens, 'assure no votes are locked')
      assert.equal(voteAmountMore, availableVotesBefore, 'assure correct amount of rep are available')

      // refund voter
      await RR.refundVotingReputation(voteAmountMore, {from: repYesVoter})

      // take stock of variables after
      let ryvBalAfter = await utils.get({fn: RR.users, params: repYesVoter, bn: false, position: 0})
      let availableVotesAfter = await PLCR.getAvailableTokens(repYesVoter, 2)

      // checks
      assert.equal(Math.pow(availableVotesBefore, 2) - Math.pow(availableVotesAfter, 2), ryvBalAfter - ryvBalBefore, 'votes requested incorrectly')
      assert.equal(availableVotesAfter, 0, 'assert no votes are available')
    })

    it('no reputation voter can\'t refund more voting reputation than they have', async () => {
      errorThrown = false
      let availableVotesBefore = await PLCR.getAvailableTokens(repNoVoter, 2)
      let lockedTokens = await PLCR.getLockedTokens(repNoVoter)

      try {
        await RR.refundVotingReputation(availableVotesBefore - lockedTokens + 1, {from: repNoVoter})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('no reputation voter can refund voting reputation', async () => {
      // take stock of variables before
      let rnvBalBefore = await utils.get({fn: RR.users, params: repNoVoter, bn: false, position: 0})
      let availableVotesBefore = await PLCR.getAvailableTokens(repNoVoter, 2)
      let lockedTokens = await PLCR.getLockedTokens(repNoVoter)

      // checks
      assert.equal(0, lockedTokens, 'assure no votes are locked')
      assert.equal(voteAmountMore, availableVotesBefore, 'assure correct amount of rep are available')

      // refund voter
      await RR.refundVotingReputation(voteAmountMore, {from: repNoVoter})

      // take stock of variables after
      let rnvBalAfter = await utils.get({fn: RR.users, params: repNoVoter, bn: false, position: 0})
      let availableVotesAfter = await PLCR.getAvailableTokens(repNoVoter, 2)

      // checks
      assert.equal(Math.pow(availableVotesBefore, 2) - Math.pow(availableVotesAfter, 2), rnvBalAfter - rnvBalBefore, 'votes requested incorrectly')
      assert.equal(availableVotesAfter, 0, 'assert no votes are available')
    })

    it('not voter can\'t refund voting tokens', async () => {
      errorThrown = false
      try {
        await TR.refundVotingTokens(voteAmount, {from: notVoter})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not voter can\'t refund voting reputation', async () => {
      errorThrown = false
      try {
        await RR.refundVotingReputation(voteAmount, {from: notVoter})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('project contract empty', () => {
    it('TR failed project has 0 wei, 0 tokens staked, and 0 reputation staked', async () => {
      // take stock of variables
      let projRepStaked = await project.get({projAddr: projAddrT, fn: 'reputationStaked', bn: false})
      let projTokensStaked = await project.get({projAddr: projAddrT, fn: 'tokensStaked', bn: false})
      let projWeiBal = parseInt(await web3.eth.getBalance(projAddrT))

      // checks
      assert.equal(projRepStaked, 0, 'project should not have rep staked on it')
      assert.equal(projTokensStaked, 0, 'project should not have tokens staked on it')
      assert.equal(projWeiBal, 0, 'project contract should not have any wei left in it')
    })

    it('RR failed project has 0 wei, 0 tokens staked, and 0 reputation staked', async () => {
      // take stock of variables
      let projRepStaked = await project.get({projAddr: projAddrR, fn: 'reputationStaked', bn: false})
      let projTokensStaked = await project.get({projAddr: projAddrR, fn: 'tokensStaked', bn: false})
      let projWeiBal = parseInt(await web3.eth.getBalance(projAddrR))

      // checks
      assert.equal(projRepStaked, 0, 'project should not have rep staked on it')
      assert.equal(projTokensStaked, 0, 'project should not have tokens staked on it')
      assert.equal(projWeiBal, 0, 'project contract should not have any wei left in it')
    })
  })
})
