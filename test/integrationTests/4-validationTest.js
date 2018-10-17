/* eslint-env mocha */
/* global assert contract web3 */

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
const evmIncreaseTime = require('../utils/evmIncreaseTime')
const taskDetails = require('../utils/taskDetails')

const BigNumber = require('bignumber.js')

contract('Validating State', function (accounts) {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let TR, PR, RR, DT
  let {user, project, utils, returnProject, task} = projObj
  let {tokenProposer, repProposer, notProposer} = user
  let {validator1, validator2, notValidator} = user
  let {projectCost, stakingPeriod, ipfsHash} = project

  // set up task details & hashing functions
  let {taskSet1} = taskDetails

  // local test variables
  let projArray
  let errorThrown
  let projAddrT, projAddrR

  // define indices
  let indexYes = 0
  let indexNo = 1
  let indexBoth = 2
  let indexNeither = 3
  let indexIncomplete = 4
  let notIndex = 5

  let fastForwards = 5 // testrpc is 5 weeks ahead at this point

  before(async function () {
    // get contract
    await projObj.contracts.setContracts()
    TR = projObj.contracts.TR
    PR = projObj.contracts.PR
    RR = projObj.contracts.RR
    DT = projObj.contracts.DT

    // get validating projects
    projArray = await returnProject.validating(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash, taskSet1, taskSet1.length - 1)

    projAddrT = projArray[0][0]
    projAddrR = projArray[0][1]

    // fund validators
    await utils.mintIfNecessary(validator1)
    await utils.mintIfNecessary(validator2)
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

  describe('validating with tokens', () => {
    it('validator can validate a completed task yes from TR validating project', async () => {
      // take stock of variables before
      let valBalBefore = await utils.getTokenBalance(validator1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let taskValDetailsBefore = await task.getValDetails(projAddrT, indexYes, validator1)
      let validationEntryFee = await task.getValidationEntryFee(projAddrT, indexYes)
      let affirmativeIndexBefore = await task.getValidationIndex(projAddrT, indexYes, true)
      let negativeIndexBefore = await task.getValidationIndex(projAddrT, indexYes, false)
      let affirmativeValidatorBefore = await task.getValidatorAtIndex(projAddrT, indexYes, affirmativeIndexBefore, true)
      let negativeValidatorBefore = await task.getValidatorAtIndex(projAddrT, indexYes, negativeIndexBefore, false)

      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, validationEntryFee)

      // validate task
      await TR.validateTask(projAddrT, indexYes, true, {from: validator1})

      // take stock of variables after
      let valBalAfter = await utils.getTokenBalance(validator1)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let taskValDetailsAfter = await task.getValDetails(projAddrT, indexYes, validator1)
      let affirmativeIndexAfter = await task.getValidationIndex(projAddrT, indexYes, true)
      let negativeIndexAfter = await task.getValidationIndex(projAddrT, indexYes, false)
      let affirmativeValidatorAfter = await task.getValidatorAtIndex(projAddrT, indexYes, affirmativeIndexBefore, true)
      let negativeValidatorAfter = await task.getValidatorAtIndex(projAddrT, indexYes, negativeIndexBefore, false)

      // checks
      assert.equal(valBalBefore - validationEntryFee, valBalAfter, 'token addition/subtraction incorrect')
      assert.equal(TRBalAfter - validationEntryFee, TRBalBefore, 'token addition/subtraction incorrect')
      assert.equal(taskValDetailsBefore[0], false, 'validation status before should be false')
      assert.equal(taskValDetailsAfter[0], true, 'validation status after should be true')
      assert.equal(taskValDetailsBefore[1], 0, 'validation index before should be 0')
      assert.equal(taskValDetailsAfter[1], affirmativeIndexBefore, 'validation index after should still be 0')
      assert.equal(taskValDetailsBefore[2], false, 'validation initialized before should be false')
      assert.equal(taskValDetailsAfter[2], true, 'validation initialized after should be true')
      assert.equal(affirmativeIndexBefore + 1, affirmativeIndexAfter, 'affirmative validation index should increment by 1')
      assert.equal(negativeIndexBefore, negativeIndexAfter, 'negative validation index should not change')
      assert.equal(affirmativeValidatorBefore, 0, 'affirmative validator at this index should be zero address before validation')
      assert.equal(affirmativeValidatorAfter, validator1, 'affirmative validator at this index should be validator1 after validation')
      assert.equal(negativeValidatorBefore, negativeValidatorAfter, 'negative validator at this index should not change')
    })

    it('validator can validate a completed task yes from RR validating project', async () => {
      // take stock of variables before
      let valBalBefore = await utils.getTokenBalance(validator1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let taskValDetailsBefore = await task.getValDetails(projAddrR, indexYes, validator1)
      let validationEntryFee = await task.getValidationEntryFee(projAddrR, indexYes)
      let affirmativeIndexBefore = await task.getValidationIndex(projAddrR, indexYes, true)
      let negativeIndexBefore = await task.getValidationIndex(projAddrR, indexYes, false)
      let affirmativeValidatorBefore = await task.getValidatorAtIndex(projAddrR, indexYes, affirmativeIndexBefore, true)
      let negativeValidatorBefore = await task.getValidatorAtIndex(projAddrR, indexYes, negativeIndexBefore, false)

      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, validationEntryFee)

      // validate task
      await TR.validateTask(projAddrR, indexYes, true, {from: validator1})

      // take stock of variables after
      let valBalAfter = await utils.getTokenBalance(validator1)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let taskValDetailsAfter = await task.getValDetails(projAddrR, indexYes, validator1)
      let affirmativeIndexAfter = await task.getValidationIndex(projAddrR, indexYes, true)
      let negativeIndexAfter = await task.getValidationIndex(projAddrR, indexYes, false)
      let affirmativeValidatorAfter = await task.getValidatorAtIndex(projAddrR, indexYes, affirmativeIndexBefore, true)
      let negativeValidatorAfter = await task.getValidatorAtIndex(projAddrR, indexYes, negativeIndexBefore, false)

      // checks
      assert.equal(valBalBefore - validationEntryFee, valBalAfter, 'token addition/subtraction incorrect')
      assert.equal(TRBalAfter - validationEntryFee, TRBalBefore, 'token addition/subtraction incorrect')
      assert.equal(taskValDetailsBefore[0], false, 'validation status before should be false')
      assert.equal(taskValDetailsAfter[0], true, 'validation status after should be true')
      assert.equal(taskValDetailsBefore[1], 0, 'validation index before should be 0')
      assert.equal(taskValDetailsAfter[1], affirmativeIndexBefore, 'validation index after should still be 0')
      assert.equal(taskValDetailsBefore[2], false, 'validation initialized before should be false')
      assert.equal(taskValDetailsAfter[2], true, 'validation initialized after should be true')
      assert.equal(affirmativeIndexBefore + 1, affirmativeIndexAfter, 'affirmative validation index should increment by 1')
      assert.equal(negativeIndexBefore, negativeIndexAfter, 'negative validation index should not change')
      assert.equal(affirmativeValidatorBefore, 0, 'affirmative validator at this index should be zero address before validation')
      assert.equal(affirmativeValidatorAfter, validator1, 'affirmative validator at this index should be validator1 after validation')
      assert.equal(negativeValidatorBefore, negativeValidatorAfter, 'negative validator at this index should not change')
    })

    it('validator can validate a completed task no from TR validating project', async () => {
      // take stock of variables before
      let valBalBefore = await utils.getTokenBalance(validator1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let taskValDetailsBefore = await task.getValDetails(projAddrT, indexNo, validator1)
      let validationEntryFee = await task.getValidationEntryFee(projAddrT, indexNo)
      let affirmativeIndexBefore = await task.getValidationIndex(projAddrT, indexNo, true)
      let negativeIndexBefore = await task.getValidationIndex(projAddrT, indexNo, false)
      let affirmativeValidatorBefore = await task.getValidatorAtIndex(projAddrT, indexNo, affirmativeIndexBefore, true)
      let negativeValidatorBefore = await task.getValidatorAtIndex(projAddrT, indexNo, negativeIndexBefore, false)

      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, validationEntryFee)

      // validate task
      await TR.validateTask(projAddrT, indexNo, false, {from: validator1})

      // take stock of variables after
      let valBalAfter = await utils.getTokenBalance(validator1)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let taskValDetailsAfter = await task.getValDetails(projAddrT, indexNo, validator1)
      let affirmativeIndexAfter = await task.getValidationIndex(projAddrT, indexNo, true)
      let negativeIndexAfter = await task.getValidationIndex(projAddrT, indexNo, false)
      let affirmativeValidatorAfter = await task.getValidatorAtIndex(projAddrT, indexNo, affirmativeIndexBefore, true)
      let negativeValidatorAfter = await task.getValidatorAtIndex(projAddrT, indexNo, negativeIndexAfter - 1, false)

      // checks
      assert.equal(valBalBefore - validationEntryFee, valBalAfter, 'token addition/subtraction incorrect')
      assert.equal(TRBalAfter - validationEntryFee, TRBalBefore, 'token addition/subtraction incorrect')
      assert.equal(taskValDetailsBefore[0], false, 'validation status before should be false')
      assert.equal(taskValDetailsAfter[0], false, 'validation status after should be false')
      assert.equal(taskValDetailsBefore[1], 0, 'validation index before should be 0')
      assert.equal(taskValDetailsAfter[1], negativeIndexBefore, 'validation index after should still be 0')
      assert.equal(taskValDetailsBefore[2], false, 'validation initialized before should be false')
      assert.equal(taskValDetailsAfter[2], true, 'validation initialized after should be true')
      assert.equal(affirmativeIndexBefore, affirmativeIndexAfter, 'affirmative validation index should not change')
      assert.equal(negativeIndexBefore + 1, negativeIndexAfter, 'negative validation index should increment by 1')
      assert.equal(negativeValidatorBefore, 0, 'negative validator at this index should be zero address before validation')
      assert.equal(negativeValidatorAfter, validator1, 'negative validator at this index should be validator1 after validation')
      assert.equal(affirmativeValidatorBefore, affirmativeValidatorAfter, 'affirmative validator at this index should not change')
    })

    it('validator can validate a completed task no from RR validating project', async () => {
      // take stock of variables before
      let valBalBefore = await utils.getTokenBalance(validator1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let taskValDetailsBefore = await task.getValDetails(projAddrR, indexNo, validator1)
      let validationEntryFee = await task.getValidationEntryFee(projAddrR, indexNo)
      let affirmativeIndexBefore = await task.getValidationIndex(projAddrR, indexNo, true)
      let negativeIndexBefore = await task.getValidationIndex(projAddrR, indexNo, false)
      let affirmativeValidatorBefore = await task.getValidatorAtIndex(projAddrR, indexNo, affirmativeIndexBefore, true)
      let negativeValidatorBefore = await task.getValidatorAtIndex(projAddrR, indexNo, negativeIndexBefore, false)

      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, validationEntryFee)

      // validate task
      await TR.validateTask(projAddrR, indexNo, false, {from: validator1})

      // take stock of variables after
      let valBalAfter = await utils.getTokenBalance(validator1)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let taskValDetailsAfter = await task.getValDetails(projAddrR, indexNo, validator1)
      let affirmativeIndexAfter = await task.getValidationIndex(projAddrR, indexNo, true)
      let negativeIndexAfter = await task.getValidationIndex(projAddrR, indexNo, false)
      let affirmativeValidatorAfter = await task.getValidatorAtIndex(projAddrR, indexNo, affirmativeIndexBefore, true)
      let negativeValidatorAfter = await task.getValidatorAtIndex(projAddrR, indexNo, negativeIndexBefore, false)

      // checks
      assert.equal(valBalBefore - validationEntryFee, valBalAfter, 'token addition/subtraction incorrect')
      assert.equal(TRBalAfter - validationEntryFee, TRBalBefore, 'token addition/subtraction incorrect')
      assert.equal(taskValDetailsBefore[0], false, 'validation status before should be false')
      assert.equal(taskValDetailsAfter[0], false, 'validation status after should be false')
      assert.equal(taskValDetailsBefore[1], 0, 'validation index before should be 0')
      assert.equal(taskValDetailsAfter[1], negativeIndexBefore, 'validation index after should still be 0')
      assert.equal(taskValDetailsBefore[2], false, 'validation initialized before should be false')
      assert.equal(taskValDetailsAfter[2], true, 'validation initialized after should be true')
      assert.equal(affirmativeIndexBefore, affirmativeIndexAfter, 'affirmative validation index should not change')
      assert.equal(negativeIndexBefore + 1, negativeIndexAfter, 'negative validation index should increment by 1')
      assert.equal(negativeValidatorBefore, 0, 'negative validator at this index should be zero address before validation')
      assert.equal(negativeValidatorAfter, validator1, 'negative validator at this index should be validator1 after validation')
      assert.equal(affirmativeValidatorBefore, affirmativeValidatorAfter, 'affirmative validator at this index should not change')
    })

    it('different validator can also validate a yes validated completed task yes from TR validating project', async () => {
      // take stock of variables before
      let valBalBefore = await utils.getTokenBalance(validator2)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let taskValDetailsBefore = await task.getValDetails(projAddrT, indexYes, validator2)
      let validationEntryFee = await task.getValidationEntryFee(projAddrT, indexYes)
      let affirmativeIndexBefore = await task.getValidationIndex(projAddrT, indexYes, true)
      let negativeIndexBefore = await task.getValidationIndex(projAddrT, indexYes, false)
      let affirmativeValidatorBefore = await task.getValidatorAtIndex(projAddrT, indexYes, affirmativeIndexBefore, true)
      let negativeValidatorBefore = await task.getValidatorAtIndex(projAddrT, indexYes, negativeIndexBefore, false)

      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator2, validationEntryFee)

      // validate task
      await TR.validateTask(projAddrT, indexYes, true, {from: validator2})

      // take stock of variables after
      let valBalAfter = await utils.getTokenBalance(validator2)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let taskValDetailsAfter = await task.getValDetails(projAddrT, indexYes, validator2)
      let affirmativeIndexAfter = await task.getValidationIndex(projAddrT, indexYes, true)
      let negativeIndexAfter = await task.getValidationIndex(projAddrT, indexYes, false)
      let affirmativeValidatorAfter = await task.getValidatorAtIndex(projAddrT, indexYes, affirmativeIndexBefore, true)
      let negativeValidatorAfter = await task.getValidatorAtIndex(projAddrT, indexYes, negativeIndexBefore, false)

      // checks
      assert.equal(valBalBefore - validationEntryFee, valBalAfter, 'token addition/subtraction incorrect')
      assert.equal(TRBalAfter - validationEntryFee, TRBalBefore, 'token addition/subtraction incorrect')
      assert.equal(taskValDetailsBefore[0], false, 'validation status before should be false')
      assert.equal(taskValDetailsAfter[0], true, 'validation status after should be true')
      assert.equal(taskValDetailsBefore[1], 0, 'validation index before should be 0')
      assert.equal(taskValDetailsAfter[1], affirmativeIndexBefore, 'validation index after should be 1')
      assert.equal(taskValDetailsBefore[2], false, 'validation initialized before should be false')
      assert.equal(taskValDetailsAfter[2], true, 'validation initialized after should be true')
      assert.equal(affirmativeIndexBefore + 1, affirmativeIndexAfter, 'affirmative validation index should increment by 1')
      assert.equal(negativeIndexBefore, negativeIndexAfter, 'negative validation index should not change')
      assert.equal(affirmativeValidatorBefore, 0, 'affirmative validator at this index should be zero address before validation')
      assert.equal(affirmativeValidatorAfter, validator2, 'affirmative validator at this index should be validator1 after validation')
      assert.equal(negativeValidatorBefore, negativeValidatorAfter, 'negative validator at this index should not change')
    })

    it('different validator can also validate a yes validated completed task yes from RR validating project', async () => {
      // take stock of variables before
      let valBalBefore = await utils.getTokenBalance(validator2)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let taskValDetailsBefore = await task.getValDetails(projAddrR, indexYes, validator2)
      let validationEntryFee = await task.getValidationEntryFee(projAddrR, indexYes)
      let affirmativeIndexBefore = await task.getValidationIndex(projAddrR, indexYes, true)
      let negativeIndexBefore = await task.getValidationIndex(projAddrR, indexYes, false)
      let affirmativeValidatorBefore = await task.getValidatorAtIndex(projAddrR, indexYes, affirmativeIndexBefore, true)
      let negativeValidatorBefore = await task.getValidatorAtIndex(projAddrR, indexYes, negativeIndexBefore, false)

      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator2, validationEntryFee)

      // validate task
      await TR.validateTask(projAddrR, indexYes, true, {from: validator2})

      // take stock of variables after
      let valBalAfter = await utils.getTokenBalance(validator2)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let taskValDetailsAfter = await task.getValDetails(projAddrR, indexYes, validator2)
      let affirmativeIndexAfter = await task.getValidationIndex(projAddrR, indexYes, true)
      let negativeIndexAfter = await task.getValidationIndex(projAddrR, indexYes, false)
      let affirmativeValidatorAfter = await task.getValidatorAtIndex(projAddrR, indexYes, affirmativeIndexBefore, true)
      let negativeValidatorAfter = await task.getValidatorAtIndex(projAddrR, indexYes, negativeIndexBefore, false)

      // checks
      assert.equal(valBalBefore - validationEntryFee, valBalAfter, 'token addition/subtraction incorrect')
      assert.equal(TRBalAfter - validationEntryFee, TRBalBefore, 'token addition/subtraction incorrect')
      assert.equal(taskValDetailsBefore[0], false, 'validation status before should be false')
      assert.equal(taskValDetailsAfter[0], true, 'validation status after should be true')
      assert.equal(taskValDetailsBefore[1], 0, 'validation index before should be 0')
      assert.equal(taskValDetailsAfter[1], affirmativeIndexBefore, 'validation index after should be 1')
      assert.equal(taskValDetailsBefore[2], false, 'validation initialized before should be false')
      assert.equal(taskValDetailsAfter[2], true, 'validation initialized after should be true')
      assert.equal(affirmativeIndexBefore + 1, affirmativeIndexAfter, 'affirmative validation index should increment by 1')
      assert.equal(negativeIndexBefore, negativeIndexAfter, 'negative validation index should not change')
      assert.equal(affirmativeValidatorBefore, 0, 'affirmative validator at this index should be zero address before validation')
      assert.equal(affirmativeValidatorAfter, validator2, 'affirmative validator at this index should be validator1 after validation')
      assert.equal(negativeValidatorBefore, negativeValidatorAfter, 'negative validator at this index should not change')
    })

    it('different validator can also validate a no validated completed task no from TR validating project', async () => {
      // take stock of variables before
      let valBalBefore = await utils.getTokenBalance(validator2)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let taskValDetailsBefore = await task.getValDetails(projAddrT, indexNo, validator2)
      let validationEntryFee = await task.getValidationEntryFee(projAddrT, indexNo)
      let affirmativeIndexBefore = await task.getValidationIndex(projAddrT, indexNo, true)
      let negativeIndexBefore = await task.getValidationIndex(projAddrT, indexNo, false)
      let affirmativeValidatorBefore = await task.getValidatorAtIndex(projAddrT, indexNo, affirmativeIndexBefore, true)
      let negativeValidatorBefore = await task.getValidatorAtIndex(projAddrT, indexNo, negativeIndexBefore, false)

      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator2, validationEntryFee)

      // validate task
      await TR.validateTask(projAddrT, indexNo, false, {from: validator2})

      // take stock of variables after
      let valBalAfter = await utils.getTokenBalance(validator2)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let taskValDetailsAfter = await task.getValDetails(projAddrT, indexNo, validator2)
      let affirmativeIndexAfter = await task.getValidationIndex(projAddrT, indexNo, true)
      let negativeIndexAfter = await task.getValidationIndex(projAddrT, indexNo, false)
      let affirmativeValidatorAfter = await task.getValidatorAtIndex(projAddrT, indexNo, affirmativeIndexBefore, true)
      let negativeValidatorAfter = await task.getValidatorAtIndex(projAddrT, indexNo, negativeIndexBefore, false)

      // checks
      assert.equal(valBalBefore - validationEntryFee, valBalAfter, 'token addition/subtraction incorrect')
      assert.equal(TRBalAfter - validationEntryFee, TRBalBefore, 'token addition/subtraction incorrect')
      assert.equal(taskValDetailsBefore[0], false, 'validation status before should be false')
      assert.equal(taskValDetailsAfter[0], false, 'validation status after should be false')
      assert.equal(taskValDetailsBefore[1], 0, 'validation index before should be 0')
      assert.equal(taskValDetailsAfter[1], negativeIndexBefore, 'validation index after should be 1')
      assert.equal(taskValDetailsBefore[2], false, 'validation initialized before should be false')
      assert.equal(taskValDetailsAfter[2], true, 'validation initialized after should be true')
      assert.equal(negativeIndexBefore + 1, negativeIndexAfter, 'negative validation index should increment by 1')
      assert.equal(affirmativeIndexBefore, affirmativeIndexAfter, 'affirmative validation index should not change')
      assert.equal(negativeValidatorBefore, 0, 'negative validator at this index should be zero address before validation')
      assert.equal(negativeValidatorAfter, validator2, 'negative validator at this index should be validator1 after validation')
      assert.equal(affirmativeValidatorBefore, affirmativeValidatorAfter, 'affirmative validator at this index should not change')
    })

    it('different validator can also validate a no validated completed task no from RR validating project', async () => {
      // take stock of variables before
      let valBalBefore = await utils.getTokenBalance(validator2)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let taskValDetailsBefore = await task.getValDetails(projAddrR, indexNo, validator2)
      let validationEntryFee = await task.getValidationEntryFee(projAddrR, indexNo)
      let affirmativeIndexBefore = await task.getValidationIndex(projAddrR, indexNo, true)
      let negativeIndexBefore = await task.getValidationIndex(projAddrR, indexNo, false)
      let affirmativeValidatorBefore = await task.getValidatorAtIndex(projAddrR, indexNo, affirmativeIndexBefore, true)
      let negativeValidatorBefore = await task.getValidatorAtIndex(projAddrR, indexNo, negativeIndexBefore, false)

      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator2, validationEntryFee)

      // validate task
      await TR.validateTask(projAddrR, indexNo, false, {from: validator2})

      // take stock of variables after
      let valBalAfter = await utils.getTokenBalance(validator2)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let taskValDetailsAfter = await task.getValDetails(projAddrR, indexNo, validator2)
      let affirmativeIndexAfter = await task.getValidationIndex(projAddrR, indexNo, true)
      let negativeIndexAfter = await task.getValidationIndex(projAddrR, indexNo, false)
      let affirmativeValidatorAfter = await task.getValidatorAtIndex(projAddrR, indexNo, affirmativeIndexBefore, true)
      let negativeValidatorAfter = await task.getValidatorAtIndex(projAddrR, indexNo, negativeIndexBefore, false)

      // checks
      assert.equal(valBalBefore - validationEntryFee, valBalAfter, 'token addition/subtraction incorrect')
      assert.equal(TRBalAfter - validationEntryFee, TRBalBefore, 'token addition/subtraction incorrect')
      assert.equal(taskValDetailsBefore[0], false, 'validation status before should be false')
      assert.equal(taskValDetailsAfter[0], false, 'validation status after should be false')
      assert.equal(taskValDetailsBefore[1], 0, 'validation index before should be 0')
      assert.equal(taskValDetailsAfter[1], negativeIndexBefore, 'validation index after should be 1')
      assert.equal(taskValDetailsBefore[2], false, 'validation initialized before should be false')
      assert.equal(taskValDetailsAfter[2], true, 'validation initialized after should be true')
      assert.equal(negativeIndexBefore + 1, negativeIndexAfter, 'negative validation index should increment by 1')
      assert.equal(affirmativeIndexBefore, affirmativeIndexAfter, 'affirmative validation index should not change')
      assert.equal(negativeValidatorBefore, 0, 'negative validator at this index should be zero address before validation')
      assert.equal(negativeValidatorAfter, validator2, 'negative validator at this index should be validator1 after validation')
      assert.equal(affirmativeValidatorBefore, affirmativeValidatorAfter, 'affirmative validator at this index should not change')
    })

    it('validators can\'t validate a completed task yes and no from TR validating project', async () => {
      // fund validator with tokens if necessary
      let validationEntryFee = await task.getValidationEntryFee(projAddrT, indexBoth)
      await utils.mintIfNecessary(validator1, 2 * validationEntryFee)

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexBoth, true, {from: validator1})
        await TR.validateTask(projAddrT, indexBoth, false, {from: validator1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('validators can\'t validate a completed task yes and no from RR validating project', async () => {
      // fund validator with tokens if necessary
      let validationEntryFee = await task.getValidationEntryFee(projAddrT, indexBoth)
      await utils.mintIfNecessary(validator1, 2 * validationEntryFee)

      errorThrown = false
      try {
        await TR.validateTask(projAddrR, indexBoth, true, {from: validator1})
        await TR.validateTask(projAddrR, indexBoth, false, {from: validator1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('validator can\'t validate a completed task yes from TR validating project more than once', async () => {
      // fund validator with tokens if necessary
      let validationEntryFee = await task.getValidationEntryFee(projAddrT, indexYes)
      await utils.mintIfNecessary(validator1, validationEntryFee)

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexYes, true, {from: validator1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('validator can\'t validate a completed task yes from RR validating project more than once', async () => {
      // fund validator with tokens if necessary
      let validationEntryFee = await task.getValidationEntryFee(projAddrR, indexYes)
      await utils.mintIfNecessary(validator1, validationEntryFee)

      errorThrown = false
      try {
        await TR.validateTask(projAddrR, indexYes, true, {from: validator1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('validator can\'t validate a completed task no from TR validating project more than once', async () => {
      // fund validator with tokens if necessary
      let validationEntryFee = await task.getValidationEntryFee(projAddrT, indexBoth)
      await utils.mintIfNecessary(validator1, validationEntryFee)

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexBoth, false, {from: validator1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('validator can\'t validate a completed task no from RR validating project more than once', async () => {
      // fund validator with tokens if necessary
      let validationEntryFee = await task.getValidationEntryFee(projAddrR, indexBoth)
      await utils.mintIfNecessary(validator1, validationEntryFee)

      errorThrown = false
      try {
        await TR.validateTask(projAddrR, indexBoth, false, {from: validator1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('validator can\'t validate a completed task yes from TR validating project if they don\'t have enough tokens', async () => {
      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexBoth, true, {from: notValidator})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('validator can\'t validate a completed task yes from RR validating project if they don\'t have enough tokens', async () => {
      errorThrown = true
      try {
        await TR.validateTask(projAddrT, indexBoth, true, {from: notValidator})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('validator can\'t validate a completed task no from TR validating project if they don\'t have enough tokens', async () => {
      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexBoth, false, {from: notValidator})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('validator can\'t validate a completed task no from RR validating project if they don\'t have enough tokens', async () => {
      errorThrown = false
      try {
        await TR.validateTask(projAddrR, indexBoth, false, {from: notValidator})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('validator can\'t validate incomplete task yes from TR validating project with tokens', async () => {
      // fund validator with tokens if necessary
      let validationEntryFee = await task.getValidationEntryFee(projAddrT, indexIncomplete)
      assert.equal(validationEntryFee, 0, 'validationEntryFee for incomplete task should be 0')
      await utils.mintIfNecessary(validator1, validationEntryFee)

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexIncomplete, true, {from: validator1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('validator can\'t validate incomplete task yes from RR validating project with tokens', async () => {
      // fund validator with tokens if necessary
      let validationEntryFee = await task.getValidationEntryFee(projAddrR, indexIncomplete)
      assert.equal(validationEntryFee, 0, 'validationEntryFee for incomplete task should be 0')
      await utils.mintIfNecessary(validator1, validationEntryFee)

      errorThrown = false
      try {
        await TR.validateTask(projAddrR, indexIncomplete, true, {from: validator1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('validator can\'t validate incomplete task no from TR validating project with tokens', async () => {
      // fund validator with tokens if necessary
      let validationEntryFee = await task.getValidationEntryFee(projAddrT, indexIncomplete)
      assert.equal(validationEntryFee, 0, 'validationEntryFee for incomplete task should be 0')
      await utils.mintIfNecessary(validator1, validationEntryFee)

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexIncomplete, false, {from: validator1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('validator can\'t validate incomplete task no from RR validating project with tokens', async () => {
      // fund validator with tokens if necessary
      let validationEntryFee = await task.getValidationEntryFee(projAddrR, indexIncomplete)
      assert.equal(validationEntryFee, 0, 'validationEntryFee for incomplete task should be 0')
      await utils.mintIfNecessary(validator1, validationEntryFee)

      errorThrown = false
      try {
        await TR.validateTask(projAddrR, indexIncomplete, false, {from: validator1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('validator can\'t validate nonexistant task yes from TR validating project with tokens', async () => {
      errorThrown = false
      try {
        await TR.validateTask(projAddrT, notIndex, true, {from: validator1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('validator can\'t validate nonexistant task yes from RR validating project with tokens', async () => {
      errorThrown = false
      try {
        await TR.validateTask(projAddrR, notIndex, true, {from: validator1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('validator can\'t validate nonexistant task no from TR validating project with tokens', async () => {
      errorThrown = false
      try {
        await TR.validateTask(projAddrT, notIndex, false, {from: validator1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('validator can\'t validate nonexistant task no from RR validating project with tokens', async () => {
      errorThrown = false
      try {
        await TR.validateTask(projAddrR, notIndex, false, {from: validator1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('state changes before time is up', () => {
    it('checkVoting does not change TR validating project to voting before time is up', async () => {
      // take stock of variables
      let stateBefore = await project.getState(projAddrT)

      // attempt to checkVoting
      await PR.checkVoting(projAddrT)

      // take stock of variables
      let stateAfter = await project.getState(projAddrT)

      // checks
      assert.equal(stateBefore, 4, 'state before should be 4')
      assert.equal(stateAfter, 4, 'state should not have changed')
    })

    it('checkVoting does not change RR validating project to voting before time is up', async () => {
      // take stock of variables
      let stateBefore = await project.getState(projAddrR)

      // attempt to checkVoting
      await PR.checkVoting(projAddrR)

      // take stock of variables
      let stateAfter = await project.getState(projAddrR)

      // checks
      assert.equal(stateBefore, 4, 'state before should be 4')
      assert.equal(stateAfter, 4, 'state should not have changed')
    })
  })

  describe('state changes after time is up', () => {
    before(async () => {
      // validate yes and no on indexBoth in projAddrT * projAddrR
      let validationEntryFee = await task.getValidationEntryFee(projAddrT, indexBoth)
      await utils.mintIfNecessary(validator2, validationEntryFee)

      await TR.validateTask(projAddrT, indexBoth, false, {from: validator2})

      validationEntryFee = await task.getValidationEntryFee(projAddrR, indexBoth)
      await utils.mintIfNecessary(validator2, validationEntryFee)

      await TR.validateTask(projAddrR, indexBoth, false, {from: validator2})

      // fast forward time
      await evmIncreaseTime(604801) // 1 week
    })

    it('checkVoting changes TR validating project to voting after time is up', async () => {
      // take stock of variables
      let stateBefore = await project.getState(projAddrT)
      let projWeiBalVariableBefore = await project.getWeiBal(projAddrT, true)
      let DTWeiBalVariableBefore = await utils.getWeiPoolBal(true)
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrT))
      let DTWeiBalBefore = parseInt(await web3.eth.getBalance(DT.address))

      // attempt to checkVoting
      await PR.checkVoting(projAddrT)

      // take stock of variables
      let stateAfter = await project.getState(projAddrT)
      let projWeiBalVariableAfter = await project.getWeiBal(projAddrT, true)
      let DTWeiBalVariableAfter = await utils.getWeiPoolBal(true)
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrT))
      let DTWeiBalAfter = parseInt(await web3.eth.getBalance(DT.address))

      let failedTaskWeiReward = new BigNumber(0)
      let pollNonce = []
      let taskClaimableByVal = []
      let taskClaimableByRep = []

      // go through tasks and collect details
      for (let i = 0; i < taskSet1.length; i++) {
        let nonce = await task.getPollNonce(projAddrT, i)
        let claimable = await task.getClaimable(projAddrT, i)
        let claimableByRep = await task.getClaimableByRep(projAddrT, i)
        let complete = await task.getComplete(projAddrT, i)
        let negativeIndex = await task.getValidationIndex(projAddrT, i, false)
        let affirmativeIndex = await task.getValidationIndex(projAddrT, i, true)
        let weiReward = await task.getWeiReward(projAddrT, i)
        let weiAndValidatorReward = Math.floor((weiReward * 21) / 20)
        if (claimable && !claimableByRep && complete) {
          if (negativeIndex !== 0 && affirmativeIndex === 0) {
            // there is at least one validator
            failedTaskWeiReward = failedTaskWeiReward.plus(weiReward)
          } else if (negativeIndex === 0 && affirmativeIndex === 0) {
            // there is no validator
            failedTaskWeiReward = failedTaskWeiReward.plus(weiAndValidatorReward)
          }
        }
        pollNonce.push(nonce)
        taskClaimableByVal.push(claimable)
        taskClaimableByRep.push(claimableByRep)
      }

      // interim calculations
      let weiBalVariableDifference = projWeiBalVariableBefore.minus(projWeiBalVariableAfter)
      let weiPoolVariableDifference = DTWeiBalVariableAfter.minus(DTWeiBalVariableBefore)
      let weiBalDifference = projWeiBalBefore - projWeiBalAfter
      let weiPoolDifference = DTWeiBalAfter - DTWeiBalBefore

      // checks
      assert.equal(stateBefore, 4, 'state before should be 4')
      assert.equal(stateAfter, 5, 'state should have changed')
      assert.equal(pollNonce[indexYes], 0, 'should be no poll ID')
      assert.equal(pollNonce[indexNo], 0, 'should be no poll ID')
      assert.equal(pollNonce[indexNeither], 0, 'should be no poll ID')
      assert.equal(pollNonce[indexIncomplete], 0, 'should be no poll ID')
      assert.notEqual(pollNonce[indexBoth], 0, 'should be nonzero poll ID')
      assert.equal(taskClaimableByVal[indexYes], true, 'should be claimable by validator')
      assert.equal(taskClaimableByVal[indexNo], true, 'should be claimable by validator')
      assert.equal(taskClaimableByVal[indexNeither], true, 'should be claimable by validator')
      assert.equal(taskClaimableByVal[indexIncomplete], false, 'should not be claimable by validator')
      assert.equal(taskClaimableByVal[indexBoth], false, 'should not be claimable by validator')
      assert.equal(taskClaimableByRep[indexYes], true, 'should be claimable by rep')
      assert.equal(taskClaimableByRep[indexNo], false, 'should not be claimable by rep')
      assert.equal(taskClaimableByRep[indexNeither], false, 'should not be claimable by rep')
      assert.equal(taskClaimableByRep[indexIncomplete], false, 'should not be claimable by rep')
      assert.equal(taskClaimableByRep[indexBoth], false, 'should not be claimable by rep')
      assert.equal(weiBalVariableDifference.minus(weiPoolVariableDifference), 0, 'should be same amount')
      assert.equal(weiPoolVariableDifference.minus(failedTaskWeiReward), 0, 'should be same amount')
      assert.equal(weiBalDifference - weiPoolDifference, 0, 'should be same amount')
      assert.equal(weiPoolDifference - failedTaskWeiReward, 0, 'should be same amount')
    })

    it('checkVoting changes RR validating project to voting after time is up', async () => {
      // take stock of variables
      let stateBefore = await project.getState(projAddrR)
      let projWeiBalVariableBefore = await project.getWeiBal(projAddrR, true)
      let DTWeiBalVariableBefore = await utils.getWeiPoolBal(true)
      let projWeiBalBefore = parseInt(await web3.eth.getBalance(projAddrR))
      let DTWeiBalBefore = parseInt(await web3.eth.getBalance(DT.address))

      // attempt to checkVoting
      await PR.checkVoting(projAddrR)

      // take stock of variables
      let stateAfter = await project.getState(projAddrR)
      let projWeiBalVariableAfter = await project.getWeiBal(projAddrR, true)
      let DTWeiBalVariableAfter = await utils.getWeiPoolBal(true)
      let projWeiBalAfter = parseInt(await web3.eth.getBalance(projAddrR))
      let DTWeiBalAfter = parseInt(await web3.eth.getBalance(DT.address))

      let failedTaskWeiReward = new BigNumber(0)
      let pollNonce = []
      let taskClaimableByVal = []
      let taskClaimableByRep = []

      // go through tasks and collect details
      for (let i = 0; i < taskSet1.length; i++) {
        let nonce = await task.getPollNonce(projAddrR, i)
        let claimable = await task.getClaimable(projAddrR, i)
        let claimableByRep = await task.getClaimableByRep(projAddrR, i)
        let complete = await task.getComplete(projAddrR, i)
        let negativeIndex = await task.getValidationIndex(projAddrR, i, false)
        let affirmativeIndex = await task.getValidationIndex(projAddrR, i, true)
        let weiReward = await task.getWeiReward(projAddrR, i)
        let weiAndValidatorReward = Math.floor((weiReward * 21) / 20)
        if (claimable && !claimableByRep && complete) {
          if (negativeIndex !== 0 && affirmativeIndex === 0) {
            // there is at least one validator
            failedTaskWeiReward = failedTaskWeiReward.plus(weiReward)
          } else if (negativeIndex === 0 && affirmativeIndex === 0) {
            // there is no validator
            failedTaskWeiReward = failedTaskWeiReward.plus(weiAndValidatorReward)
          }
        }
        pollNonce.push(nonce)
        taskClaimableByVal.push(claimable)
        taskClaimableByRep.push(claimableByRep)
      }

      // interim calculations
      let weiBalVariableDifference = projWeiBalVariableBefore.minus(projWeiBalVariableAfter)
      let weiPoolVariableDifference = DTWeiBalVariableAfter.minus(DTWeiBalVariableBefore)
      let weiBalDifference = projWeiBalBefore - projWeiBalAfter
      let weiPoolDifference = DTWeiBalAfter - DTWeiBalBefore

      // checks
      assert.equal(stateBefore, 4, 'state before should be 4')
      assert.equal(stateAfter, 5, 'state should have changed')
      assert.equal(pollNonce[indexYes], 0, 'should be no poll ID')
      assert.equal(pollNonce[indexNo], 0, 'should be no poll ID')
      assert.equal(pollNonce[indexNeither], 0, 'should be no poll ID')
      assert.equal(pollNonce[indexIncomplete], 0, 'should be no poll ID')
      assert.notEqual(pollNonce[indexBoth], 0, 'should be nonzero poll ID')
      assert.equal(taskClaimableByVal[indexYes], true, 'should be claimable by validator')
      assert.equal(taskClaimableByVal[indexNo], true, 'should be claimable by validator')
      assert.equal(taskClaimableByVal[indexNeither], true, 'should be claimable by validator')
      assert.equal(taskClaimableByVal[indexIncomplete], false, 'should not be claimable by validator')
      assert.equal(taskClaimableByVal[indexBoth], false, 'should not be claimable by validator')
      assert.equal(taskClaimableByRep[indexYes], true, 'should be claimable by rep')
      assert.equal(taskClaimableByRep[indexNo], false, 'should not be claimable by rep')
      assert.equal(taskClaimableByRep[indexNeither], false, 'should not be claimable by rep')
      assert.equal(taskClaimableByRep[indexIncomplete], false, 'should not be claimable by rep')
      assert.equal(taskClaimableByRep[indexBoth], false, 'should not be claimable by rep')
      assert.equal(weiBalVariableDifference.minus(weiPoolVariableDifference), 0, 'should be same amount')
      assert.equal(weiPoolVariableDifference.minus(failedTaskWeiReward), 0, 'should be same amount')
      assert.equal(weiBalDifference - weiPoolDifference, 0, 'should be same amount')
      assert.equal(weiPoolDifference - failedTaskWeiReward, 0, 'should be same amount')
    })
  })

  describe('validate voting projects', () => {
    it('validator can\'t validate a completed task yes from TR voting project', async () => {
      // fund validator with tokens if necessary
      let validationEntryFee = await task.getValidationEntryFee(projAddrT, indexNeither)
      await utils.mintIfNecessary(validator1, validationEntryFee)

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexNeither, true, {from: validator1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('validator can\'t validate a completed task yes from RR voting project', async () => {
      // fund validator with tokens if necessary
      let validationEntryFee = await task.getValidationEntryFee(projAddrR, indexNeither)
      await utils.mintIfNecessary(validator1, validationEntryFee)

      errorThrown = false
      try {
        await TR.validateTask(projAddrR, indexNeither, true, {from: validator1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('validator can\'t validate a completed task no from TR voting project', async () => {
      // fund validator with tokens if necessary
      let validationEntryFee = await task.getValidationEntryFee(projAddrT, indexNeither)
      await utils.mintIfNecessary(validator1, validationEntryFee)

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexNeither, false, {from: validator1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('validator can\'t validate a completed task no from RR voting project', async () => {
      // fund validator with tokens if necessary
      let validationEntryFee = await task.getValidationEntryFee(projAddrR, indexNeither)
      await utils.mintIfNecessary(validator1, validationEntryFee)

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexNeither, false, {from: validator1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })
})
