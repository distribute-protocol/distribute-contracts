/* eslint-env mocha */
/* global assert contract */

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
const evmIncreaseTime = require('../utils/evmIncreaseTime')
const taskDetails = require('../utils/taskDetails')

const ethers = require('ethers')

contract('Voting State', (accounts) => {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let TR, RR, PR, PLCR
  let {user, project, utils, returnProject, task} = projObj
  let {repYesVoter, repNoVoter, tokenYesVoter, tokenNoVoter, notVoter, cheekyYesVoter, cheekyNoVoter} = user
  let {projectCost, stakingPeriod, ipfsHash} = project

  // set up task details & hashing functions
  let {taskSet1} = taskDetails

  // local test variables
  let projArray
  let errorThrown
  let projAddrT, projAddrR

  // define indices
  let valTrueOnly = 0
  let valFalseOnly = 1
  let valTrueMore = 2
  let valFalseMore = 3
  let valNeither = 4

  let valType = [valTrueOnly, valFalseOnly, valTrueMore, valFalseMore, valNeither]

  let fastForwards = 9 // ganache 9 weeks ahead at this point from previous tests' evmIncreaseTime()

  let secretSalt = 10000
  let voteYes = 1
  let voteNo = 0

  let voteAmount = 10
  let voteAmountMore = 15

  before(async () => {
    // get contract
    await projObj.contracts.setContracts()
    TR = projObj.contracts.TR
    RR = projObj.contracts.RR
    PR = projObj.contracts.PR
    PLCR = projObj.contracts.PLCR

    // get voting projects
    // moves ganache forward 4 more weeks
    projArray = await returnProject.voting(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash, taskSet1, taskSet1.length - 1, valType)

    projAddrT = projArray[0][0]
    projAddrR = projArray[0][1]

    // fund & register voters for successful commit & reveal tests
    await utils.mintIfNecessary(tokenYesVoter)
    await utils.mintIfNecessary(tokenNoVoter)
    await utils.register(repYesVoter)
    await utils.register(repNoVoter)

    // fund & register voters for failed reveal tests
    await utils.mintIfNecessary(cheekyYesVoter)
    await utils.mintIfNecessary(cheekyNoVoter)
    await utils.register(cheekyYesVoter)
    await utils.register(cheekyNoVoter)
  })

  describe('committing yes votes with tokens', () => {
    it('token voter can commit a yes vote to a task validated more yes from TR voting project', async () => {
      // take stock of variables before
      let pollId = await task.getPollNonce(projAddrT, valTrueMore)
      let attrUUID = await PLCR.attrUUID(tokenYesVoter, pollId)
      let expectedUUID = ethers.utils.solidityKeccak256(['address', 'uint'], [tokenYesVoter, pollId])
      let commitHashBefore = await PLCR.getCommitHash(tokenYesVoter, pollId)
      let numTokensBefore = await PLCR.getNumTokens(tokenYesVoter, pollId)
      let pollMapBefore = await task.getPollMap(projAddrT, valTrueMore)

      // checks
      assert.strictEqual(attrUUID, expectedUUID, 'attrUUID was computed incorrectly')
      assert.equal(commitHashBefore, 0, 'nothing should have been committed yet')
      assert.equal(numTokensBefore, 0, 'no tokens should have been committed yet')
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')
      assert.equal(pollMapBefore[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapBefore[4], 0, 'should be no vote tally no yet')

      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenYesVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      // commit yes vote
      await TR.voteCommit(projAddrT, valTrueMore, voteAmountMore, secretHash, 0, {from: tokenYesVoter})

      // take stock of variables after
      let commitHashAfter = await PLCR.getCommitHash(tokenYesVoter, pollId)
      let numTokensAfter = await PLCR.getNumTokens(tokenYesVoter, pollId)
      let pollMapAfter = await task.getPollMap(projAddrT, valTrueMore)

      // checks
      assert.equal(commitHashAfter, secretHash, 'incorrect hash committed')
      assert.equal(numTokensAfter, voteAmountMore, 'incorrect number of tokens committed')
      assert.equal(pollMapBefore[0], (pollMapAfter[0]), 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], (pollMapAfter[1]), 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapAfter[3], 0, 'votes yes shouldn\'t change')
      assert.equal(pollMapAfter[4], 0, 'votes no shouldn\'t change')
    })

    it('token voter can commit a yes vote to a task validated more yes from RR voting project', async () => {
      // take stock of variables before
      let pollId = await task.getPollNonce(projAddrR, valTrueMore)
      let attrUUID = await PLCR.attrUUID(tokenYesVoter, pollId)
      let expectedUUID = ethers.utils.solidityKeccak256(['address', 'uint'], [tokenYesVoter, pollId])
      let commitHashBefore = await PLCR.getCommitHash(tokenYesVoter, pollId)
      let numTokensBefore = await PLCR.getNumTokens(tokenYesVoter, pollId)
      let pollMapBefore = await task.getPollMap(projAddrR, valTrueMore)

      // checks
      assert.strictEqual(attrUUID, expectedUUID, 'attrUUID was computed incorrectly')
      assert.equal(commitHashBefore, 0, 'nothing should have been committed yet')
      assert.equal(numTokensBefore, 0, 'no tokens should have been committed yet')
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')
      assert.equal(pollMapBefore[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapBefore[4], 0, 'should be no vote tally no yet')

      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenYesVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      // commit yes vote
      await TR.voteCommit(projAddrR, valTrueMore, voteAmountMore, secretHash, 0, {from: tokenYesVoter})

      // take stock of variables after
      let commitHashAfter = await PLCR.getCommitHash(tokenYesVoter, pollId)
      let numTokensAfter = await PLCR.getNumTokens(tokenYesVoter, pollId)
      let pollMapAfter = await task.getPollMap(projAddrR, valTrueMore)

      // checks
      assert.equal(commitHashAfter, secretHash, 'incorrect hash committed')
      assert.equal(numTokensAfter, voteAmountMore, 'incorrect number of tokens committed')
      assert.equal(pollMapBefore[0], (pollMapAfter[0]), 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], (pollMapAfter[1]), 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapAfter[3], 0, 'votes yes shouldn\'t change')
      assert.equal(pollMapAfter[4], 0, 'votes no shouldn\'t change')
    })

    it('token voter can commit a yes vote to a task validated more no from TR voting project', async () => {
      // take stock of variables before
      let pollId = await task.getPollNonce(projAddrT, valFalseMore)
      let attrUUID = await PLCR.attrUUID(tokenYesVoter, pollId)
      let expectedUUID = ethers.utils.solidityKeccak256(['address', 'uint'], [tokenYesVoter, pollId])
      let commitHashBefore = await PLCR.getCommitHash(tokenYesVoter, pollId)
      let numTokensBefore = await PLCR.getNumTokens(tokenYesVoter, pollId)
      let pollMapBefore = await task.getPollMap(projAddrT, valFalseMore)

      // checks
      assert.strictEqual(attrUUID, expectedUUID, 'attrUUID was computed incorrectly')
      assert.equal(commitHashBefore, 0, 'nothing should have been committed yet')
      assert.equal(numTokensBefore, 0, 'no tokens should have been committed yet')
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')
      assert.equal(pollMapBefore[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapBefore[4], 0, 'should be no vote tally no yet')

      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenYesVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      // commit yes vote
      await TR.voteCommit(projAddrT, valFalseMore, voteAmountMore, secretHash, 0, {from: tokenYesVoter})

      // take stock of variables after
      let commitHashAfter = await PLCR.getCommitHash(tokenYesVoter, pollId)
      let numTokensAfter = await PLCR.getNumTokens(tokenYesVoter, pollId)
      let pollMapAfter = await task.getPollMap(projAddrT, valFalseMore)

      // checks
      assert.equal(commitHashAfter, secretHash, 'incorrect hash committed')
      assert.equal(numTokensAfter, voteAmountMore, 'incorrect number of tokens committed')
      assert.equal(pollMapBefore[0], (pollMapAfter[0]), 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], (pollMapAfter[1]), 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapAfter[3], 0, 'votes yes shouldn\'t change')
      assert.equal(pollMapAfter[4], 0, 'votes no shouldn\'t change')
    })

    it('token voter can commit a yes vote to a task validated more no from RR voting project', async () => {
      // take stock of variables before
      let pollId = await task.getPollNonce(projAddrR, valFalseMore)
      let attrUUID = await PLCR.attrUUID(tokenYesVoter, pollId)
      let expectedUUID = ethers.utils.solidityKeccak256(['address', 'uint'], [tokenYesVoter, pollId])
      let commitHashBefore = await PLCR.getCommitHash(tokenYesVoter, pollId)
      let numTokensBefore = await PLCR.getNumTokens(tokenYesVoter, pollId)
      let pollMapBefore = await task.getPollMap(projAddrR, valFalseMore)

      // checks
      assert.strictEqual(attrUUID, expectedUUID, 'attrUUID was computed incorrectly')
      assert.equal(commitHashBefore, 0, 'nothing should have been committed yet')
      assert.equal(numTokensBefore, 0, 'no tokens should have been committed yet')
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')
      assert.equal(pollMapBefore[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapBefore[4], 0, 'should be no vote tally no yet')

      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenYesVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      // commit yes vote
      await TR.voteCommit(projAddrR, valFalseMore, voteAmountMore, secretHash, 0, {from: tokenYesVoter})

      // take stock of variables after
      let commitHashAfter = await PLCR.getCommitHash(tokenYesVoter, pollId)
      let numTokensAfter = await PLCR.getNumTokens(tokenYesVoter, pollId)
      let pollMapAfter = await task.getPollMap(projAddrR, valFalseMore)

      // checks
      assert.equal(commitHashAfter, secretHash, 'incorrect hash committed')
      assert.equal(numTokensAfter, voteAmountMore, 'incorrect number of tokens committed')
      assert.equal(pollMapBefore[0], (pollMapAfter[0]), 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], (pollMapAfter[1]), 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapAfter[3], 0, 'votes yes shouldn\'t change')
      assert.equal(pollMapAfter[4], 0, 'votes no shouldn\'t change')
    })

    it('token voter cannot commit a yes vote to a task validated only yes from TR truff project', async () => {
      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenYesVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      // commit yes vote
      errorThrown = false
      try {
        await TR.voteCommit(projAddrT, valTrueOnly, voteAmount, secretHash, 0, {from: tokenYesVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token voter cannot commit a yes vote to a task validated only yes from RR voting project', async () => {
      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenYesVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      // commit yes vote
      errorThrown = false
      try {
        await TR.voteCommit(projAddrR, valTrueOnly, voteAmount, secretHash, 0, {from: tokenYesVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token voter cannot commit a yes vote to a task validated only no from TR voting project', async () => {
      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenYesVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      // commit yes vote
      errorThrown = false
      try {
        await TR.voteCommit(projAddrT, valFalseOnly, voteAmount, secretHash, 0, {from: tokenYesVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token voter cannot commit a yes vote to a task validated only no from RR voting project', async () => {
      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenYesVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      // commit yes vote
      errorThrown = false
      try {
        await TR.voteCommit(projAddrR, valFalseOnly, voteAmount, secretHash, 0, {from: tokenYesVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token voter cannot commit a yes vote to a task not validated from TR voting project', async () => {
      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenYesVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      // commit yes vote
      errorThrown = false
      try {
        await TR.voteCommit(projAddrT, valNeither, voteAmount, secretHash, 0, {from: tokenYesVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token voter cannot commit a yes vote to a task not validated from RR voting project', async () => {
      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenYesVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      // commit yes vote
      errorThrown = false
      try {
        await TR.voteCommit(projAddrR, valNeither, voteAmount, secretHash, 0, {from: tokenYesVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('committing no votes with tokens', () => {
    it('token voter can commit a no vote to a task validated more yes from TR voting project', async () => {
      // take stock of variables before
      let pollId = await task.getPollNonce(projAddrT, valTrueMore)
      let attrUUID = await PLCR.attrUUID(tokenNoVoter, pollId)
      let expectedUUID = ethers.utils.solidityKeccak256(['address', 'uint'], [tokenNoVoter, pollId])
      let commitHashBefore = await PLCR.getCommitHash(tokenNoVoter, pollId)
      let numTokensBefore = await PLCR.getNumTokens(tokenNoVoter, pollId)
      let pollMapBefore = await task.getPollMap(projAddrT, valTrueMore)

      // checks
      assert.strictEqual(attrUUID, expectedUUID, 'attrUUID was computed incorrectly')
      assert.equal(commitHashBefore, 0, 'nothing should have been committed yet')
      assert.equal(numTokensBefore, 0, 'no tokens should have been committed yet')
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')
      assert.equal(pollMapBefore[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapBefore[4], 0, 'should be no vote tally no yet')

      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenNoVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteNo, secretSalt])

      // commit no vote
      await TR.voteCommit(projAddrT, valTrueMore, voteAmount, secretHash, 0, {from: tokenNoVoter})

      // take stock of variables after
      let commitHashAfter = await PLCR.getCommitHash(tokenNoVoter, pollId)
      let numTokensAfter = await PLCR.getNumTokens(tokenNoVoter, pollId)
      let pollMapAfter = await task.getPollMap(projAddrT, valTrueMore)

      // checks
      assert.equal(commitHashAfter, secretHash, 'incorrect hash committed')
      assert.equal(numTokensAfter, voteAmount, 'incorrect number of tokens committed')
      assert.equal(pollMapBefore[0], (pollMapAfter[0]), 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], (pollMapAfter[1]), 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapAfter[3], 0, 'votes yes shouldn\'t change')
      assert.equal(pollMapAfter[4], 0, 'votes no shouldn\'t change')
    })

    it('token voter can commit a no vote to a task validated more yes from RR voting project', async () => {
      // take stock of variables before
      let pollId = await task.getPollNonce(projAddrR, valTrueMore)
      let attrUUID = await PLCR.attrUUID(tokenNoVoter, pollId)
      let expectedUUID = ethers.utils.solidityKeccak256(['address', 'uint'], [tokenNoVoter, pollId])
      let commitHashBefore = await PLCR.getCommitHash(tokenNoVoter, pollId)
      let numTokensBefore = await PLCR.getNumTokens(tokenNoVoter, pollId)
      let pollMapBefore = await task.getPollMap(projAddrR, valTrueMore)

      // checks
      assert.strictEqual(attrUUID, expectedUUID, 'attrUUID was computed incorrectly')
      assert.equal(commitHashBefore, 0, 'nothing should have been committed yet')
      assert.equal(numTokensBefore, 0, 'no tokens should have been committed yet')
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')
      assert.equal(pollMapBefore[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapBefore[4], 0, 'should be no vote tally no yet')

      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenNoVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteNo, secretSalt])

      // commit no vote
      await TR.voteCommit(projAddrR, valTrueMore, voteAmount, secretHash, 0, {from: tokenNoVoter})

      // take stock of variables after
      let commitHashAfter = await PLCR.getCommitHash(tokenNoVoter, pollId)
      let numTokensAfter = await PLCR.getNumTokens(tokenNoVoter, pollId)
      let pollMapAfter = await task.getPollMap(projAddrR, valTrueMore)

      // checks
      assert.equal(commitHashAfter, secretHash, 'incorrect hash committed')
      assert.equal(numTokensAfter, voteAmount, 'incorrect number of tokens committed')
      assert.equal(pollMapBefore[0], (pollMapAfter[0]), 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], (pollMapAfter[1]), 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapAfter[3], 0, 'vote tally yes updated incorrectly')
      assert.equal(pollMapAfter[4], 0, 'should be no vote tally no yet')
    })

    it('token voter can commit a no vote to a task validated more no from TR voting project', async () => {
      // take stock of variables before
      let pollId = await task.getPollNonce(projAddrT, valFalseMore)
      let attrUUID = await PLCR.attrUUID(tokenNoVoter, pollId)
      let expectedUUID = ethers.utils.solidityKeccak256(['address', 'uint'], [tokenNoVoter, pollId])
      let commitHashBefore = await PLCR.getCommitHash(tokenNoVoter, pollId)
      let numTokensBefore = await PLCR.getNumTokens(tokenNoVoter, pollId)
      let pollMapBefore = await task.getPollMap(projAddrT, valFalseMore)

      // checks
      assert.strictEqual(attrUUID, expectedUUID, 'attrUUID was computed incorrectly')
      assert.equal(commitHashBefore, 0, 'nothing should have been committed yet')
      assert.equal(numTokensBefore, 0, 'no tokens should have been committed yet')
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')
      assert.equal(pollMapBefore[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapBefore[4], 0, 'should be no vote tally no yet')

      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenNoVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteNo, secretSalt])

      // commit yes vote
      await TR.voteCommit(projAddrT, valFalseMore, voteAmount, secretHash, 0, {from: tokenNoVoter})

      // take stock of variables after
      let commitHashAfter = await PLCR.getCommitHash(tokenNoVoter, pollId)
      let numTokensAfter = await PLCR.getNumTokens(tokenNoVoter, pollId)
      let pollMapAfter = await task.getPollMap(projAddrT, valFalseMore)

      // checks
      assert.equal(commitHashAfter, secretHash, 'incorrect hash committed')
      assert.equal(numTokensAfter, voteAmount, 'incorrect number of tokens committed')
      assert.equal(pollMapBefore[0], (pollMapAfter[0]), 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], (pollMapAfter[1]), 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapAfter[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapAfter[4], 0, 'should be no vote tally no yet')
    })

    it('token voter can commit a no vote to a task validated more no from RR voting project', async () => {
      // take stock of variables before
      let pollId = await task.getPollNonce(projAddrR, valFalseMore)
      let attrUUID = await PLCR.attrUUID(tokenNoVoter, pollId)
      let expectedUUID = ethers.utils.solidityKeccak256(['address', 'uint'], [tokenNoVoter, pollId])
      let commitHashBefore = await PLCR.getCommitHash(tokenNoVoter, pollId)
      let numTokensBefore = await PLCR.getNumTokens(tokenNoVoter, pollId)
      let pollMapBefore = await task.getPollMap(projAddrR, valFalseMore)

      // checks
      assert.strictEqual(attrUUID, expectedUUID, 'attrUUID was computed incorrectly')
      assert.equal(commitHashBefore, 0, 'nothing should have been committed yet')
      assert.equal(numTokensBefore, 0, 'no tokens should have been committed yet')
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')
      assert.equal(pollMapBefore[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapBefore[4], 0, 'should be no vote tally no yet')

      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenNoVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteNo, secretSalt])

      // commit no vote
      await TR.voteCommit(projAddrR, valFalseMore, voteAmount, secretHash, 0, {from: tokenNoVoter})

      // take stock of variables after
      let commitHashAfter = await PLCR.getCommitHash(tokenNoVoter, pollId)
      let numTokensAfter = await PLCR.getNumTokens(tokenNoVoter, pollId)
      let pollMapAfter = await task.getPollMap(projAddrR, valFalseMore)

      // checks
      assert.equal(commitHashAfter, secretHash, 'incorrect hash committed')
      assert.equal(numTokensAfter, voteAmount, 'incorrect number of tokens committed')
      assert.equal(pollMapBefore[0], (pollMapAfter[0]), 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], (pollMapAfter[1]), 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapAfter[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapAfter[4], 0, 'should be no vote tally no yet')
    })

    it('token voter cannot commit a no vote to a task validated only yes from TR voting project', async () => {
      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenNoVoter, voteAmount)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      errorThrown = false
      try {
        await TR.voteCommit(projAddrT, valTrueOnly, voteAmount, secretHash, 0, {from: tokenNoVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token voter cannot commit a no vote to a task validated only yes from RR voting project', async () => {
      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenNoVoter, voteAmount)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      errorThrown = false
      try {
        await TR.voteCommit(projAddrR, valTrueOnly, voteAmount, secretHash, 0, {from: tokenNoVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token voter cannot commit a no vote to a task validated only no from TR voting project', async function () {
      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenNoVoter, voteAmount)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      errorThrown = false
      try {
        await TR.voteCommit(projAddrT, valFalseOnly, voteAmount, secretHash, 0, {from: tokenNoVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token voter cannot commit a no vote to a task validated only no from RR voting project', async function () {
      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenNoVoter, voteAmount)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      errorThrown = false
      try {
        await TR.voteCommit(projAddrR, valFalseOnly, voteAmount, secretHash, 0, {from: tokenNoVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token voter cannot commit a no vote to a task not validated from TR voting project', async function () {
      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenNoVoter, voteAmount)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      errorThrown = false
      try {
        await TR.voteCommit(projAddrT, valNeither, voteAmount, secretHash, 0, {from: tokenNoVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token voter cannot commit a no vote to a task not validated from RR voting project', async function () {
      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenNoVoter, voteAmount)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      errorThrown = false
      try {
        await TR.voteCommit(projAddrR, valNeither, voteAmount, secretHash, 0, {from: tokenNoVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('committing yes votes with reputation', () => {
    it('reputation voter can commit a yes vote to a task validated more yes from TR voting project', async function () {
      // take stock of variables before
      let pollId = await task.getPollNonce(projAddrT, valTrueMore)
      let attrUUID = await PLCR.attrUUID(repYesVoter, pollId)
      let expectedUUID = ethers.utils.solidityKeccak256(['address', 'uint'], [repYesVoter, pollId])
      let commitHashBefore = await PLCR.getCommitHash(repYesVoter, pollId)
      let numTokensBefore = await PLCR.getNumTokens(repYesVoter, pollId)
      let pollMapBefore = await task.getPollMap(projAddrT, valTrueMore)

      // checks
      assert.strictEqual(attrUUID, expectedUUID, 'attrUUID was computed incorrectly')
      assert.equal(commitHashBefore, 0, 'nothing should have been committed yet')
      assert.equal(numTokensBefore, 0, 'no tokens should have been committed yet')
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')
      assert.equal(pollMapBefore[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapBefore[4], 0, 'should be no vote tally no yet')

      // fund voter with tokens if necessary
      await utils.mintIfNecessary(repYesVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      // commit yes vote
      await RR.voteCommit(projAddrT, valTrueMore, voteAmountMore, secretHash, 0, {from: repYesVoter})

      // take stock of variables after
      let commitHashAfter = await PLCR.getCommitHash(repYesVoter, pollId)
      let numTokensAfter = await PLCR.getNumTokens(repYesVoter, pollId)
      let pollMapAfter = await task.getPollMap(projAddrT, valTrueMore)

      // checks
      assert.equal(commitHashAfter, secretHash, 'incorrect hash committed')
      assert.equal(numTokensAfter, voteAmountMore, 'incorrect number of tokens committed')
      assert.equal(pollMapBefore[0], (pollMapAfter[0]), 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], (pollMapAfter[1]), 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapAfter[3], 0, 'votes yes shouldn\'t change')
      assert.equal(pollMapAfter[4], 0, 'votes no shouldn\'t change')
    })

    it('reputation voter can commit a yes vote to a task validated more yes from RR voting project', async function () {
      // take stock of variables before
      let pollId = await task.getPollNonce(projAddrR, valTrueMore)
      let attrUUID = await PLCR.attrUUID(repYesVoter, pollId)
      let expectedUUID = ethers.utils.solidityKeccak256(['address', 'uint'], [repYesVoter, pollId])
      let commitHashBefore = await PLCR.getCommitHash(repYesVoter, pollId)
      let numTokensBefore = await PLCR.getNumTokens(repYesVoter, pollId)
      let pollMapBefore = await task.getPollMap(projAddrR, valTrueMore)

      // checks
      assert.strictEqual(attrUUID, expectedUUID, 'attrUUID was computed incorrectly')
      assert.equal(commitHashBefore, 0, 'nothing should have been committed yet')
      assert.equal(numTokensBefore, 0, 'no tokens should have been committed yet')
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')
      assert.equal(pollMapBefore[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapBefore[4], 0, 'should be no vote tally no yet')

      // fund voter with tokens if necessary
      await utils.mintIfNecessary(repYesVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      // commit yes vote
      await RR.voteCommit(projAddrR, valTrueMore, voteAmountMore, secretHash, 0, {from: repYesVoter})

      // take stock of variables after
      let commitHashAfter = await PLCR.getCommitHash(repYesVoter, pollId)
      let numTokensAfter = await PLCR.getNumTokens(repYesVoter, pollId)
      let pollMapAfter = await task.getPollMap(projAddrR, valTrueMore)

      // checks
      assert.equal(commitHashAfter, secretHash, 'incorrect hash committed')
      assert.equal(numTokensAfter, voteAmountMore, 'incorrect number of tokens committed')
      assert.equal(pollMapBefore[0], (pollMapAfter[0]), 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], (pollMapAfter[1]), 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapAfter[3], 0, 'votes yes shouldn\'t change')
      assert.equal(pollMapAfter[4], 0, 'votes no shouldn\'t change')
    })

    it('reputation voter can commit a yes vote to a task validated more no from TR voting project', async function () {
      // take stock of variables before
      let pollId = await task.getPollNonce(projAddrT, valFalseMore)
      let attrUUID = await PLCR.attrUUID(repYesVoter, pollId)
      let expectedUUID = ethers.utils.solidityKeccak256(['address', 'uint'], [repYesVoter, pollId])
      let commitHashBefore = await PLCR.getCommitHash(repYesVoter, pollId)
      let numTokensBefore = await PLCR.getNumTokens(repYesVoter, pollId)
      let pollMapBefore = await task.getPollMap(projAddrT, valFalseMore)

      // checks
      assert.strictEqual(attrUUID, expectedUUID, 'attrUUID was computed incorrectly')
      assert.equal(commitHashBefore, 0, 'nothing should have been committed yet')
      assert.equal(numTokensBefore, 0, 'no tokens should have been committed yet')
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')
      assert.equal(pollMapBefore[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapBefore[4], 0, 'should be no vote tally no yet')

      // fund voter with tokens if necessary
      await utils.mintIfNecessary(repYesVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      // commit yes vote
      await RR.voteCommit(projAddrT, valFalseMore, voteAmountMore, secretHash, 0, {from: repYesVoter})

      // take stock of variables after
      let commitHashAfter = await PLCR.getCommitHash(repYesVoter, pollId)
      let numTokensAfter = await PLCR.getNumTokens(repYesVoter, pollId)
      let pollMapAfter = await task.getPollMap(projAddrT, valFalseMore)

      // checks
      assert.equal(commitHashAfter, secretHash, 'incorrect hash committed')
      assert.equal(numTokensAfter, voteAmountMore, 'incorrect number of tokens committed')
      assert.equal(pollMapBefore[0], (pollMapAfter[0]), 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], (pollMapAfter[1]), 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapAfter[3], 0, 'votes yes shouldn\'t change')
      assert.equal(pollMapAfter[4], 0, 'votes no shouldn\'t change')
    })

    it('reputation voter can commit a yes vote to a task validated more no from RR voting project', async function () {
      // take stock of variables before
      let pollId = await task.getPollNonce(projAddrR, valFalseMore)
      let attrUUID = await PLCR.attrUUID(repYesVoter, pollId)
      let expectedUUID = ethers.utils.solidityKeccak256(['address', 'uint'], [repYesVoter, pollId])
      let commitHashBefore = await PLCR.getCommitHash(repYesVoter, pollId)
      let numTokensBefore = await PLCR.getNumTokens(repYesVoter, pollId)
      let pollMapBefore = await task.getPollMap(projAddrR, valFalseMore)

      // checks
      assert.strictEqual(attrUUID, expectedUUID, 'attrUUID was computed incorrectly')
      assert.equal(commitHashBefore, 0, 'nothing should have been committed yet')
      assert.equal(numTokensBefore, 0, 'no tokens should have been committed yet')
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')
      assert.equal(pollMapBefore[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapBefore[4], 0, 'should be no vote tally no yet')

      // fund voter with tokens if necessary
      await utils.mintIfNecessary(repYesVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      // commit yes vote
      await RR.voteCommit(projAddrR, valFalseMore, voteAmountMore, secretHash, 0, {from: repYesVoter})

      // take stock of variables after
      let commitHashAfter = await PLCR.getCommitHash(repYesVoter, pollId)
      let numTokensAfter = await PLCR.getNumTokens(repYesVoter, pollId)
      let pollMapAfter = await task.getPollMap(projAddrR, valFalseMore)

      // checks
      assert.equal(commitHashAfter, secretHash, 'incorrect hash committed')
      assert.equal(numTokensAfter, voteAmountMore, 'incorrect number of tokens committed')
      assert.equal(pollMapBefore[0], (pollMapAfter[0]), 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], (pollMapAfter[1]), 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapAfter[3], 0, 'votes yes shouldn\'t change')
      assert.equal(pollMapAfter[4], 0, 'votes no shouldn\'t change')
    })

    it('reputation voter cannot commit a yes vote to a task validated only yes from TR voting project', async function () {
      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      errorThrown = false
      try {
        await RR.voteCommit(projAddrT, valTrueOnly, voteAmount, secretHash, 0, {from: repYesVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('reputation voter cannot commit a yes vote to a task validated only yes from RR voting project', async function () {
      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      errorThrown = false
      try {
        await RR.voteCommit(projAddrR, valTrueOnly, voteAmount, secretHash, 0, {from: repYesVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('reputation voter cannot commit a yes vote to a task validated only no from TR voting project', async function () {
      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteNo, secretSalt])

      errorThrown = false
      try {
        await RR.voteCommit(projAddrT, valFalseOnly, voteAmount, secretHash, 0, {from: tokenYesVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('reputation voter cannot commit a yes vote to a task validated only no from RR voting project', async function () {
      // fund voter with tokens if necessary
      await utils.mintIfNecessary(repYesVoter, voteAmount)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      errorThrown = false
      try {
        await RR.voteCommit(projAddrR, valFalseOnly, voteAmount, secretHash, 0, {from: repYesVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('reputation voter cannot commit a yes vote to a task not validated from TR voting project', async function () {
      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      errorThrown = false
      try {
        await RR.voteCommit(projAddrT, valNeither, voteAmount, secretHash, 0, {from: repYesVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('reputation voter cannot commit a yes vote to a task not validated from RR voting project', async function () {
      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])

      errorThrown = false
      try {
        await RR.voteCommit(projAddrR, valNeither, voteAmount, secretHash, 0, {from: repYesVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('committing no votes with reputation', () => {
    it('reputation voter can commit a no vote to a task validated more yes from TR voting project', async function () {
      // take stock of variables before
      let pollId = await task.getPollNonce(projAddrT, valTrueMore)
      let attrUUID = await PLCR.attrUUID(repNoVoter, pollId)
      let expectedUUID = ethers.utils.solidityKeccak256(['address', 'uint'], [repNoVoter, pollId])
      let commitHashBefore = await PLCR.getCommitHash(repNoVoter, pollId)
      let numTokensBefore = await PLCR.getNumTokens(repNoVoter, pollId)
      let pollMapBefore = await task.getPollMap(projAddrT, valTrueMore)

      // checks
      assert.strictEqual(attrUUID, expectedUUID, 'attrUUID was computed incorrectly')
      assert.equal(commitHashBefore, 0, 'nothing should have been committed yet')
      assert.equal(numTokensBefore, 0, 'no tokens should have been committed yet')
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')
      assert.equal(pollMapBefore[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapBefore[4], 0, 'should be no vote tally no yet')

      // fund voter with tokens if necessary
      await utils.mintIfNecessary(repNoVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteNo, secretSalt])

      // commit no vote
      await RR.voteCommit(projAddrT, valTrueMore, voteAmount, secretHash, 0, {from: repNoVoter})

      // take stock of variables after
      let commitHashAfter = await PLCR.getCommitHash(repNoVoter, pollId)
      let numTokensAfter = await PLCR.getNumTokens(repNoVoter, pollId)
      let pollMapAfter = await task.getPollMap(projAddrT, valTrueMore)

      // checks
      assert.equal(commitHashAfter, secretHash, 'incorrect hash committed')
      assert.equal(numTokensAfter, voteAmount, 'incorrect number of tokens committed')
      assert.equal(pollMapBefore[0], (pollMapAfter[0]), 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], (pollMapAfter[1]), 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapAfter[3], 0, 'votes yes shouldn\'t change')
      assert.equal(pollMapAfter[4], 0, 'votes no shouldn\'t change')
    })

    it('reputation voter can commit a no vote to a task validated more yes from RR voting project', async function () {
      // take stock of variables before
      let pollId = await task.getPollNonce(projAddrR, valTrueMore)
      let attrUUID = await PLCR.attrUUID(repNoVoter, pollId)
      let expectedUUID = ethers.utils.solidityKeccak256(['address', 'uint'], [repNoVoter, pollId])
      let commitHashBefore = await PLCR.getCommitHash(repNoVoter, pollId)
      let numTokensBefore = await PLCR.getNumTokens(repNoVoter, pollId)
      let pollMapBefore = await task.getPollMap(projAddrR, valTrueMore)

      // checks
      assert.strictEqual(attrUUID, expectedUUID, 'attrUUID was computed incorrectly')
      assert.equal(commitHashBefore, 0, 'nothing should have been committed yet')
      assert.equal(numTokensBefore, 0, 'no tokens should have been committed yet')
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')
      assert.equal(pollMapBefore[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapBefore[4], 0, 'should be no vote tally no yet')

      // fund voter with tokens if necessary
      await utils.mintIfNecessary(repNoVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteNo, secretSalt])

      // commit no vote
      await RR.voteCommit(projAddrR, valTrueMore, voteAmount, secretHash, 0, {from: repNoVoter})

      // take stock of variables after
      let commitHashAfter = await PLCR.getCommitHash(repNoVoter, pollId)
      let numTokensAfter = await PLCR.getNumTokens(repNoVoter, pollId)
      let pollMapAfter = await task.getPollMap(projAddrR, valTrueMore)

      // checks
      assert.equal(commitHashAfter, secretHash, 'incorrect hash committed')
      assert.equal(numTokensAfter, voteAmount, 'incorrect number of tokens committed')
      assert.equal(pollMapBefore[0], (pollMapAfter[0]), 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], (pollMapAfter[1]), 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapAfter[3], 0, 'votes yes shouldn\'t change')
      assert.equal(pollMapAfter[4], 0, 'votes no shouldn\'t change')
    })

    it('reputation voter can commit a no vote to a task validated more no from TR voting project', async function () {
      // take stock of variables before
      let pollId = await task.getPollNonce(projAddrT, valFalseMore)
      let attrUUID = await PLCR.attrUUID(repNoVoter, pollId)
      let expectedUUID = ethers.utils.solidityKeccak256(['address', 'uint'], [repNoVoter, pollId])
      let commitHashBefore = await PLCR.getCommitHash(repNoVoter, pollId)
      let numTokensBefore = await PLCR.getNumTokens(repNoVoter, pollId)
      let pollMapBefore = await task.getPollMap(projAddrT, valFalseMore)

      // checks
      assert.strictEqual(attrUUID, expectedUUID, 'attrUUID was computed incorrectly')
      assert.equal(commitHashBefore, 0, 'nothing should have been committed yet')
      assert.equal(numTokensBefore, 0, 'no tokens should have been committed yet')
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')
      assert.equal(pollMapBefore[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapBefore[4], 0, 'should be no vote tally no yet')

      // fund voter with tokens if necessary
      await utils.mintIfNecessary(repNoVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteNo, secretSalt])

      // commit no vote
      await RR.voteCommit(projAddrT, valFalseMore, voteAmount, secretHash, 0, {from: repNoVoter})

      // take stock of variables after
      let commitHashAfter = await PLCR.getCommitHash(repNoVoter, pollId)
      let numTokensAfter = await PLCR.getNumTokens(repNoVoter, pollId)
      let pollMapAfter = await task.getPollMap(projAddrT, valFalseMore)

      // checks
      assert.equal(commitHashAfter, secretHash, 'incorrect hash committed')
      assert.equal(numTokensAfter, voteAmount, 'incorrect number of tokens committed')
      assert.equal(pollMapBefore[0], (pollMapAfter[0]), 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], (pollMapAfter[1]), 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapAfter[3], 0, 'votes yes shouldn\'t change')
      assert.equal(pollMapAfter[4], 0, 'votes no shouldn\'t change')
    })

    it('reputation voter can commit a no vote to a task validated more no from RR voting project', async function () {
      // take stock of variables before
      let pollId = await task.getPollNonce(projAddrR, valFalseMore)
      let attrUUID = await PLCR.attrUUID(repNoVoter, pollId)
      let expectedUUID = ethers.utils.solidityKeccak256(['address', 'uint'], [repNoVoter, pollId])
      let commitHashBefore = await PLCR.getCommitHash(repNoVoter, pollId)
      let numTokensBefore = await PLCR.getNumTokens(repNoVoter, pollId)
      let pollMapBefore = await task.getPollMap(projAddrR, valFalseMore)

      // checks
      assert.strictEqual(attrUUID, expectedUUID, 'attrUUID was computed incorrectly')
      assert.equal(commitHashBefore, 0, 'nothing should have been committed yet')
      assert.equal(numTokensBefore, 0, 'no tokens should have been committed yet')
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')
      assert.equal(pollMapBefore[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapBefore[4], 0, 'should be no vote tally no yet')

      // fund voter with tokens if necessary
      await utils.mintIfNecessary(repNoVoter)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteNo, secretSalt])

      // commit no vote
      await RR.voteCommit(projAddrR, valFalseMore, voteAmount, secretHash, 0, {from: repNoVoter})

      // take stock of variables after
      let commitHashAfter = await PLCR.getCommitHash(repNoVoter, pollId)
      let numTokensAfter = await PLCR.getNumTokens(repNoVoter, pollId)
      let pollMapAfter = await task.getPollMap(projAddrR, valFalseMore)

      // checks
      assert.equal(commitHashAfter, secretHash, 'incorrect hash committed')
      assert.equal(numTokensAfter, voteAmount, 'incorrect number of tokens committed')
      assert.equal(pollMapBefore[0], (pollMapAfter[0]), 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], (pollMapAfter[1]), 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapAfter[3], 0, 'votes yes shouldn\'t change')
      assert.equal(pollMapAfter[4], 0, 'votes no shouldn\'t change')
    })

    it('reputation voter cannot commit a no vote to a task validated only yes from TR voting project', async function () {
      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteNo, secretSalt])

      errorThrown = false
      try {
        await RR.voteCommit(projAddrT, valTrueOnly, voteAmount, secretHash, 0, {from: repNoVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('reputation voter cannot commit a no vote to a task validated only yes from RR voting project', async function () {
      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteNo, secretSalt])

      errorThrown = false
      try {
        await RR.voteCommit(projAddrR, valTrueOnly, voteAmount, secretHash, 0, {from: repNoVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('reputation voter cannot commit a no vote to a task validated only no from TR voting project', async function () {
      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenNoVoter, voteAmount)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteNo, secretSalt])

      errorThrown = false
      try {
        await RR.voteCommit(projAddrT, valFalseOnly, voteAmount, secretHash, 0, {from: repNoVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('reputation voter cannot commit a no vote to a task validated only no from RR voting project', async function () {
      // fund voter with tokens if necessary
      await utils.mintIfNecessary(tokenNoVoter, voteAmount)

      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteNo, secretSalt])

      errorThrown = false
      try {
        await RR.voteCommit(projAddrR, valFalseOnly, voteAmount, secretHash, 0, {from: repNoVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('reputation voter cannot commit a no vote to a task not validated from TR voting project', async function () {
      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteNo, secretSalt])

      errorThrown = false
      try {
        await RR.voteCommit(projAddrT, valNeither, voteAmount, secretHash, 0, {from: repNoVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('reputation voter cannot commit a no vote to a task not validated from RR voting project', async function () {
      // make commit hash
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteNo, secretSalt])

      errorThrown = false
      try {
        await RR.voteCommit(projAddrR, valNeither, voteAmount, secretHash, 0, {from: repNoVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('revealing yes votes with tokens', () => {
    before(async () => {
      // commit votes to fail in reveal
      let secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteYes, secretSalt])
      await TR.voteCommit(projAddrT, valFalseMore, voteAmount, secretHash, 0, {from: cheekyYesVoter})
      await RR.voteCommit(projAddrR, valTrueMore, voteAmount, secretHash, 0, {from: cheekyYesVoter})

      secretHash = ethers.utils.solidityKeccak256(['int', 'int'], [voteNo, secretSalt])
      await TR.voteCommit(projAddrT, valFalseMore, voteAmount, secretHash, 0, {from: cheekyNoVoter})
      await RR.voteCommit(projAddrR, valTrueMore, voteAmount, secretHash, 0, {from: cheekyNoVoter})

      // fast forward time
      await evmIncreaseTime(604801) // 1 week
    })

    it('token voter can reveal a yes vote to a task validated more yes from TR voting project', async () => {
      // take stock of variables before
      let pollMapBefore = await task.getPollMap(projAddrT, valTrueMore)

      // checks
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')
      assert.equal(pollMapBefore[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapBefore[4], 0, 'should be no vote tally no yet')

      // reveal yes vote
      await TR.voteReveal(projAddrT, valTrueMore, voteYes, secretSalt, {from: tokenYesVoter})

      // take stock of variables after
      let pollMapAfter = await task.getPollMap(projAddrT, valTrueMore)

      // checks
      assert.equal(pollMapBefore[0], (pollMapAfter[0]), 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], (pollMapAfter[1]), 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapAfter[3], voteAmountMore, 'vote tally yes updated incorrectly')
      assert.equal(pollMapAfter[4], 0, 'should be no vote tally no yet')
    })

    it('token voter can reveal a yes vote to a task validated more yes from RR voting project', async () => {
      // take stock of variables before
      let pollMapBefore = await task.getPollMap(projAddrR, valTrueMore)

      // checks
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')
      assert.equal(pollMapBefore[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapBefore[4], 0, 'should be no vote tally no yet')

      // reveal yes vote
      await TR.voteReveal(projAddrR, valTrueMore, voteYes, secretSalt, {from: tokenYesVoter})

      // take stock of variables after
      let pollMapAfter = await task.getPollMap(projAddrR, valTrueMore)

      // checks
      assert.equal(pollMapBefore[0], (pollMapAfter[0]), 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], (pollMapAfter[1]), 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapAfter[3], voteAmountMore, 'vote tally yes updated incorrectly')
      assert.equal(pollMapAfter[4], 0, 'should be no vote tally no yet')
    })

    it('token voter can reveal a yes vote to a task validated more no from TR voting project', async () => {
      // take stock of variables before
      let pollMapBefore = await task.getPollMap(projAddrT, valFalseMore)

      // checks
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')
      assert.equal(pollMapBefore[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapBefore[4], 0, 'should be no vote tally no yet')

      // reveal yes vote
      await TR.voteReveal(projAddrT, valFalseMore, voteYes, secretSalt, {from: tokenYesVoter})

      // take stock of variables after
      let pollMapAfter = await task.getPollMap(projAddrT, valFalseMore)

      // checks
      assert.equal(pollMapBefore[0], (pollMapAfter[0]), 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], (pollMapAfter[1]), 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapAfter[3], voteAmountMore, 'vote tally yes updated incorrectly')
      assert.equal(pollMapAfter[4], 0, 'should be no vote tally no yet')
    })

    it('token voter can reveal a yes vote to a task validated more no from RR voting project', async () => {
      // take stock of variables before
      let pollMapBefore = await task.getPollMap(projAddrR, valFalseMore)

      // checks
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')
      assert.equal(pollMapBefore[3], 0, 'should be no vote tally yes yet')
      assert.equal(pollMapBefore[4], 0, 'should be no vote tally no yet')

      // reveal yes vote
      await TR.voteReveal(projAddrR, valFalseMore, voteYes, secretSalt, {from: tokenYesVoter})

      // take stock of variables after
      let pollMapAfter = await task.getPollMap(projAddrR, valFalseMore)

      // checks
      assert.equal(pollMapBefore[0], (pollMapAfter[0]), 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], (pollMapAfter[1]), 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapAfter[3], voteAmountMore, 'vote tally yes updated incorrectly')
      assert.equal(pollMapAfter[4], 0, 'should be no vote tally no yet')
    })

    it('token voter cannot reveal the no votes side if they voted yes', async () => {
      errorThrown = false
      try {
        await TR.voteReveal(projAddrT, valFalseMore, voteNo, secretSalt, {from: cheekyYesVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token voter cannot reveal a vote they didn\'t commit for a project', async () => {
      errorThrown = false
      try {
        await TR.voteReveal(projAddrT, valFalseMore, voteYes, secretSalt, {from: notVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('revealing yes votes with reputation', () => {
    it('reputation voter can reveal a yes vote to a task validated more yes from TR voting project', async () => {
      // take stock of variables before
      let pollMapBefore = await task.getPollMap(projAddrT, valTrueMore)

      // checks
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')

      // reveal yes vote
      await RR.voteReveal(projAddrT, valTrueMore, voteYes, secretSalt, {from: repYesVoter})

      // take stock of variables after
      let pollMapAfter = await task.getPollMap(projAddrT, valTrueMore)

      // checks
      assert.equal(pollMapBefore[0], pollMapAfter[0], 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], pollMapAfter[1], 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapAfter[3], pollMapBefore[3] + voteAmountMore, 'vote tally yes updated incorrectly')
      assert.equal(pollMapAfter[4], pollMapBefore[4], 'vote tally no updated incorrectly')
    })

    it('reputation voter can reveal a yes vote to a task validated more yes from RR voting project', async () => {
      // take stock of variables before
      let pollMapBefore = await task.getPollMap(projAddrR, valTrueMore)

      // reveal yes vote
      await RR.voteReveal(projAddrR, valTrueMore, voteYes, secretSalt, {from: repYesVoter})

      // take stock of variables after
      let pollMapAfter = await task.getPollMap(projAddrR, valTrueMore)

      // checks
      assert.equal(pollMapAfter[3], pollMapBefore[3] + voteAmountMore, 'vote tally yes updated incorrectly')
      assert.equal(pollMapAfter[4], pollMapBefore[4], 'vote tally no updated incorrectly')
    })

    it('reputation voter can reveal a yes vote to a task validated more no from TR voting project', async () => {
      // take stock of variables before
      let pollMapBefore = await task.getPollMap(projAddrT, valFalseMore)

      // reveal yes vote
      await RR.voteReveal(projAddrT, valFalseMore, voteYes, secretSalt, {from: repYesVoter})

      // take stock of variables after
      let pollMapAfter = await task.getPollMap(projAddrT, valFalseMore)

      // checks
      assert.equal(pollMapAfter[3], pollMapBefore[3] + voteAmountMore, 'vote tally yes updated incorrectly')
      assert.equal(pollMapAfter[4], pollMapBefore[4], 'vote tally no updated incorrectly')
    })

    it('reputation voter can reveal a yes vote to a task validated more no from RR voting project', async () => {
      // take stock of variables before
      let pollMapBefore = await task.getPollMap(projAddrR, valFalseMore)

      // reveal yes vote
      await RR.voteReveal(projAddrR, valFalseMore, voteYes, secretSalt, {from: repYesVoter})

      // take stock of variables after
      let pollMapAfter = await task.getPollMap(projAddrR, valFalseMore)

      // checks
      assert.equal(pollMapAfter[3], pollMapBefore[3] + voteAmountMore, 'vote tally yes updated incorrectly')
      assert.equal(pollMapAfter[4], pollMapBefore[4], 'vote tally no updated incorrectly')
    })

    it('reputation voter cannot reveal the no votes side if they voted yes', async () => {
      // check
      errorThrown = false
      try {
        await RR.voteReveal(projAddrT, valTrueMore, voteNo, secretSalt, {from: cheekyYesVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('reputation voter cannot reveal a vote they didn\'t commit for a RR voting project', async () => {
      errorThrown = false
      try {
        await RR.voteReveal(projAddrT, valFalseMore, voteYes, secretSalt, {from: notVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('revealing no votes with tokens', () => {
    it('token voter can reveal a no vote to a task validated more yes from TR voting project', async () => {
      // take stock of variables before
      let pollMapBefore = await task.getPollMap(projAddrT, valTrueMore)

      // checks
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')
      assert.equal(pollMapBefore[4], 0, 'should be no vote tally no yet')

      // reveal yes vote
      await TR.voteReveal(projAddrT, valTrueMore, voteNo, secretSalt, {from: tokenNoVoter})

      // take stock of variables after
      let pollMapAfter = await task.getPollMap(projAddrT, valTrueMore)

      // checks
      assert.equal(pollMapBefore[0], pollMapAfter[0], 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], pollMapAfter[1], 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapBefore[3], pollMapAfter[3], 'should be no vote tally yes yet')
      assert.equal(pollMapAfter[4], voteAmount, 'vote tally no incorrect')
    })

    it('token voter can reveal a no vote to a task validated more yes from RR voting project', async () => {
      // take stock of variables before
      let pollMapBefore = await task.getPollMap(projAddrR, valTrueMore)

      // checks
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')

      // reveal yes vote
      await TR.voteReveal(projAddrR, valTrueMore, voteNo, secretSalt, {from: tokenNoVoter})

      // take stock of variables after
      let pollMapAfter = await task.getPollMap(projAddrR, valTrueMore)

      // checks
      assert.equal(pollMapBefore[0], pollMapAfter[0], 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], pollMapAfter[1], 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapBefore[3], pollMapAfter[3], 'should be no vote tally yes yet')
      assert.equal(pollMapAfter[4], pollMapBefore[4] + voteAmount, 'vote tally no incorrect')
    })

    it('token voter can reveal a no vote to a task validated more no from TR voting project', async () => {
      // take stock of variables before
      let pollMapBefore = await task.getPollMap(projAddrT, valFalseMore)

      // checks
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')

      // reveal yes vote
      await TR.voteReveal(projAddrT, valFalseMore, voteNo, secretSalt, {from: tokenNoVoter})

      // take stock of variables after
      let pollMapAfter = await task.getPollMap(projAddrT, valFalseMore)

      // checks
      assert.equal(pollMapBefore[0], pollMapAfter[0], 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], pollMapAfter[1], 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapBefore[3], pollMapAfter[3], 'should be no vote tally yes yet')
      assert.equal(pollMapAfter[4], pollMapBefore[4] + voteAmount, 'vote tally no incorrect')
    })

    it('token voter can reveal a no vote to a task validated more no from RR voting project', async () => {
      // take stock of variables before
      let pollMapBefore = await task.getPollMap(projAddrR, valFalseMore)

      // checks
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')

      // reveal yes vote
      await TR.voteReveal(projAddrR, valFalseMore, voteNo, secretSalt, {from: tokenNoVoter})

      // take stock of variables after
      let pollMapAfter = await task.getPollMap(projAddrR, valFalseMore)

      // checks
      assert.equal(pollMapBefore[0], pollMapAfter[0], 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], pollMapAfter[1], 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapBefore[3], pollMapAfter[3], 'should be no vote tally yes yet')
      assert.equal(pollMapAfter[4], pollMapBefore[4] + voteAmount, 'vote tally no incorrect')
    })

    it('token voter cannot reveal the yes votes side if they voted no', async () => {
      errorThrown = false
      try {
        await TR.voteReveal(projAddrT, valTrueMore, voteYes, secretSalt, {from: cheekyNoVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('revealing no votes with reputation', () => {
    it('reputation voter can reveal a no vote to a task validated more yes from TR voting project', async () => {
      // take stock of variables before
      let pollMapBefore = await task.getPollMap(projAddrT, valTrueMore)

      // checks
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')

      // reveal no vote
      await RR.voteReveal(projAddrT, valTrueMore, voteNo, secretSalt, {from: repNoVoter})

      // take stock of variables after
      let pollMapAfter = await task.getPollMap(projAddrT, valTrueMore)

      // checks
      assert.equal(pollMapBefore[0], pollMapAfter[0], 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], pollMapAfter[1], 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapBefore[3], pollMapAfter[3], 'should be no vote tally yes yet')
      assert.equal(pollMapAfter[4], pollMapBefore[4] + voteAmount, 'vote tally no incorrect')
    })

    it('reputation voter can reveal a no vote to a task validated more yes from RR voting project', async () => {
      // take stock of variables before
      let pollMapBefore = await task.getPollMap(projAddrR, valTrueMore)

      // checks
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')

      // reveal yes vote
      await RR.voteReveal(projAddrR, valTrueMore, voteNo, secretSalt, {from: repNoVoter})

      // take stock of variables after
      let pollMapAfter = await task.getPollMap(projAddrR, valTrueMore)

      // checks
      assert.equal(pollMapBefore[0], pollMapAfter[0], 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], pollMapAfter[1], 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapBefore[3], pollMapAfter[3], 'should be no vote tally yes yet')
      assert.equal(pollMapAfter[4], pollMapBefore[4] + voteAmount, 'vote tally no incorrect')
    })

    it('reputation voter can reveal a no vote to a task validated more no from TR voting project', async () => {
      // take stock of variables before
      let pollMapBefore = await task.getPollMap(projAddrT, valFalseMore)

      // checks
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')

      // reveal yes vote
      await RR.voteReveal(projAddrT, valFalseMore, voteNo, secretSalt, {from: repNoVoter})

      // take stock of variables after
      let pollMapAfter = await task.getPollMap(projAddrT, valFalseMore)

      // checks
      assert.equal(pollMapBefore[0], pollMapAfter[0], 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], pollMapAfter[1], 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapBefore[3], pollMapAfter[3], 'should be no vote tally yes yet')
      assert.equal(pollMapAfter[4], pollMapBefore[4] + voteAmount, 'vote tally no incorrect')
    })

    it('reputation voter can reveal a no vote to a task validated more no from RR voting project', async () => {
      // take stock of variables before
      let pollMapBefore = await task.getPollMap(projAddrR, valFalseMore)

      // checks
      assert.equal(pollMapBefore[2], 51, 'poll quorum should be 51')

      // reveal yes vote
      await RR.voteReveal(projAddrR, valFalseMore, voteNo, secretSalt, {from: repNoVoter})

      // take stock of variables after
      let pollMapAfter = await task.getPollMap(projAddrR, valFalseMore)

      // checks
      assert.equal(pollMapBefore[0], pollMapAfter[0], 'commit end date shouldn\'t change')
      assert.equal(pollMapBefore[1], pollMapAfter[1], 'reveal end date shouldn\'t change')
      assert.equal(pollMapAfter[2], 51, 'poll quorum should still be 51')
      assert.equal(pollMapBefore[3], pollMapAfter[3], 'should be no vote tally yes yet')
      assert.equal(pollMapAfter[4], pollMapBefore[4] + voteAmount, 'vote tally no incorrect')
    })

    it('reputation voter cannot reveal the yes votes side if they voted no', async () => {
      errorThrown = false
      try {
        await TR.voteReveal(projAddrT, valTrueMore, voteYes, secretSalt, {from: cheekyNoVoter})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('state changes before time is up', () => {
    it('checkEnd() does not change TR voting project to some end state before time is up', async () => {
      // take stock of variables
      let stateBefore = await project.getState(projAddrT)

      // attempt to checkStaked
      await PR.checkEnd(projAddrT)

      // take stock of variables
      let stateAfter = await project.getState(projAddrT)

      // checks
      assert.equal(stateBefore, 5, 'state before should be 5')
      assert.equal(stateAfter, 5, 'state should not have changed')
    })

    it('checkEnd() does not change RR voting project to some end state before time is up', async () => {
      // take stock of variables
      let stateBefore = await project.getState(projAddrR)

      // attempt to checkStaked
      await PR.checkEnd(projAddrR)

      // take stock of variables
      let stateAfter = await project.getState(projAddrR)

      // checks
      assert.equal(stateBefore, 5, 'state before should be 5')
      assert.equal(stateAfter, 5, 'state should not have changed')
    })
  })

  describe('state changes after time is up', () => {
    before(async () => {
      // fast forward time
      await evmIncreaseTime(604800) // 1 week
    })

    it('checkEnd() changes TR voting project to some end state after time is up', async () => {
      // take stock of variables
      let stateBefore = await project.getState(projAddrT)

      // attempt to checkStaked
      await PR.checkEnd(projAddrT)

      // take stock of variables
      let stateAfter = await project.getState(projAddrT)

      // checks
      assert.equal(stateBefore, 5, 'state before should be 5')
      assert.equal(stateAfter, 7, 'state after should be 7')
    })

    it('checkEnd() changes RR voting project to some end state after time is up', async () => {
      // take stock of variables
      let stateBefore = await project.getState(projAddrR)

      // attempt to checkStaked
      await PR.checkEnd(projAddrR)

      // take stock of variables
      let stateAfter = await project.getState(projAddrR)

      // checks
      assert.equal(stateBefore, 5, 'state before should be 5')
      assert.equal(stateAfter, 7, 'state after should be 7')
    })
  })
})
