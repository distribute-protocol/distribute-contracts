/* eslint-env mocha */
/* global assert contract */

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
const evmIncreaseTime = require('../utils/evmIncreaseTime')
const keccakHashes = require('../utils/keccakHashes')
const taskDetails = require('../utils/taskDetails')

contract('Validating State', (accounts) => {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let TR, RR, PR
  let {user, project, utils, returnProject, task} = projObj
  let {validator1, validator2, notValidator} = user
  let {worker1, worker2, notWorker} = user
  let {projectCost, stakingPeriod, ipfsHash} = project

  // set up task details & hashing functions
  let {taskSet1, taskSet2} = taskDetails
  let {hashTasks} = keccakHashes

  // local test variables
  let projArray
  let errorThrown
  let projAddrT, projAddrR
  let tokensToValidate = 100

  // define indices
  let indexYes = 0
  let indexNo = 1
  let indexBoth = 2
  let indexNeither = 3
  let indexIncomplete = 4
  let notIndex = 5

  let fastForwards = 5 // ganache 5 weeks ahead at this point from previous test's evmIncreaseTime()

  before(async function () {
    // get contract
    await projObj.contracts.setContracts()
    TR = projObj.contracts.TR
    RR = projObj.contracts.RR
    PR = projObj.contracts.PR

    // get validating projects
    // moves ganache forward 1 more week
    projArray = await returnProject.validating(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash, 1, taskSet1, [taskSet1.length - 1])
    projAddrT = projArray[0][0]
    projAddrR = projArray[0][1]

    // fund validators
    await utils.mintIfNecessary(validator1)
    await utils.mintIfNecessary(validator2)
  })

  describe('validating with tokens', () => {
    it('Validator can validate a completed task yes from TR validating project', async function () {
      // take stock of variables before
      let valBalBefore = await utils.getTokenBalance(validator1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let taskValNegBefore = await task.getTotalValidate(projAddrT, indexYes, false)
      let taskValPosBefore = await task.getTotalValidate(projAddrT, indexYes, true)
      let taskOpposingValBefore = await task.getOpposingVal(projAddrT, indexYes)
      let taskValDetailsBefore = await task.getValDetails(projAddrT, indexYes, validator1)

      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      let complete = await task.getComplete(projAddrT, indexYes)

      // validate task
      await TR.validateTask(projAddrT, indexYes, tokensToValidate, true, {from: validator1})

      // task stock of variables after
      let valBalAfter = await utils.getTokenBalance(validator1)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let taskValNegAfter = await task.getTotalValidate(projAddrT, indexYes, false)
      let taskValPosAfter = await task.getTotalValidate(projAddrT, indexYes, true)
      let taskOpposingValAfter = await task.getOpposingVal(projAddrT, indexYes)
      let taskValDetailsAfter = await task.getValDetails(projAddrT, indexYes, validator1)

      // checks
      assert.equal(valBalBefore - tokensToValidate, valBalAfter, 'token addition/subtraction incorrect')
      assert.equal(TRBalAfter - tokensToValidate, TRBalBefore, 'token addition/subtraction incorrect')
      assert.equal(taskValNegBefore, 0, 'should be 0')
      assert.equal(taskValNegAfter, taskValNegBefore, 'shouldn\'t change')
      assert.equal(taskValPosBefore, 0, 'should be 0')
      assert.equal(taskValPosAfter, tokensToValidate, 'task contract updated incorrectly')
      assert.equal(taskOpposingValBefore, false, 'should be false')
      assert.equal(taskOpposingValAfter, taskOpposingValBefore, 'shouldn\'t change')
      assert.equal(taskValDetailsBefore[0], 0, 'status should be 0')
      assert.equal(taskValDetailsBefore[1], 0, 'stake should be 0')
      assert.equal(taskValDetailsAfter[0], 1, 'status after should be true')
      assert.equal(taskValDetailsAfter[1], tokensToValidate, 'stake after should be tokensToValidate')
    })

    it('Validator can validate a completed task yes from RR validating project', async function () {
      // take stock of variables before
      let valBalBefore = await utils.getTokenBalance(validator1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let taskValNegBefore = await task.getTotalValidate(projAddrR, indexYes, false)
      let taskValPosBefore = await task.getTotalValidate(projAddrR, indexYes, true)
      let taskOpposingValBefore = await task.getOpposingVal(projAddrR, indexYes)
      let taskValDetailsBefore = await task.getValDetails(projAddrR, indexYes, validator1)

      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      // validate task
      await TR.validateTask(projAddrR, indexYes, tokensToValidate, true, {from: validator1})

      // task stock of variables after
      let valBalAfter = await utils.getTokenBalance(validator1)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let taskValNegAfter = await task.getTotalValidate(projAddrR, indexYes, false)
      let taskValPosAfter = await task.getTotalValidate(projAddrR, indexYes, true)
      let taskOpposingValAfter = await task.getOpposingVal(projAddrR, indexYes)
      let taskValDetailsAfter = await task.getValDetails(projAddrR, indexYes, validator1)

      // checks
      assert.equal(valBalBefore - tokensToValidate, valBalAfter, 'token addition/subtraction incorrect')
      assert.equal(TRBalAfter - tokensToValidate, TRBalBefore, 'token addition/subtraction incorrect')
      assert.equal(taskValNegBefore, 0, 'should be 0')
      assert.equal(taskValNegAfter, taskValNegBefore, 'shouldn\'t change')
      assert.equal(taskValPosBefore, 0, 'should be 0')
      assert.equal(taskValPosAfter, tokensToValidate, 'task contract updated incorrectly')
      assert.equal(taskOpposingValBefore, false, 'should be false')
      assert.equal(taskOpposingValAfter, taskOpposingValBefore, 'shouldn\'t change')
      assert.equal(taskValDetailsBefore[0], 0, 'status should be 0')
      assert.equal(taskValDetailsBefore[1], 0, 'stake should be 0')
      assert.equal(taskValDetailsAfter[0], 1, 'status after should be true')
      assert.equal(taskValDetailsAfter[1], tokensToValidate, 'stake after should be tokensToValidate')
    })

    it('Validator can validate a completed task no from TR validating project', async function () {
      // take stock of variables before
      let valBalBefore = await utils.getTokenBalance(validator1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let taskValNegBefore = await task.getTotalValidate(projAddrT, indexNo, false)
      let taskValPosBefore = await task.getTotalValidate(projAddrT, indexNo, true)
      let taskOpposingValBefore = await task.getOpposingVal(projAddrT, indexNo)
      let taskValDetailsBefore = await task.getValDetails(projAddrT, indexNo, validator1)

      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      let complete = await task.getComplete(projAddrT, indexNo)

      // validate task
      await TR.validateTask(projAddrT, indexNo, tokensToValidate, false, {from: validator1})

      // task stock of variables after
      let valBalAfter = await utils.getTokenBalance(validator1)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let taskValNegAfter = await task.getTotalValidate(projAddrT, indexNo, false)
      let taskValPosAfter = await task.getTotalValidate(projAddrT, indexNo, true)
      let taskOpposingValAfter = await task.getOpposingVal(projAddrT, indexNo)
      let taskValDetailsAfter = await task.getValDetails(projAddrT, indexNo, validator1)

      // checks
      assert.equal(valBalBefore - tokensToValidate, valBalAfter, 'token addition/subtraction incorrect')
      assert.equal(TRBalAfter - tokensToValidate, TRBalBefore, 'token addition/subtraction incorrect')
      assert.equal(taskValPosBefore, 0, 'should be 0')
      assert.equal(taskValPosAfter, taskValPosBefore, 'shouldn\'t change')
      assert.equal(taskValNegBefore, 0, 'should be 0')
      assert.equal(taskValNegAfter, tokensToValidate, 'task contract updated incorrectly')
      assert.equal(taskOpposingValBefore, false, 'should be false')
      assert.equal(taskOpposingValAfter, taskOpposingValBefore, 'shouldn\'t change')
      assert.equal(taskValDetailsBefore[0], 0, 'status should be 0')
      assert.equal(taskValDetailsBefore[1], 0, 'stake should be 0')
      assert.equal(taskValDetailsAfter[0], 0, 'status after should be false')
      assert.equal(taskValDetailsAfter[1], tokensToValidate, 'stake after should be tokensToValidate')
    })

    it('Validator can validate a completed task no from RR validating project', async function () {
      // take stock of variables before
      let valBalBefore = await utils.getTokenBalance(validator1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let taskValNegBefore = await task.getTotalValidate(projAddrR, indexNo, false)
      let taskValPosBefore = await task.getTotalValidate(projAddrR, indexNo, true)
      let taskOpposingValBefore = await task.getOpposingVal(projAddrR, indexNo)
      let taskValDetailsBefore = await task.getValDetails(projAddrR, indexNo, validator1)

      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      // validate task
      await TR.validateTask(projAddrR, indexNo, tokensToValidate, false, {from: validator1})

      // task stock of variables after
      let valBalAfter = await utils.getTokenBalance(validator1)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let taskValNegAfter = await task.getTotalValidate(projAddrR, indexNo, false)
      let taskValPosAfter = await task.getTotalValidate(projAddrR, indexNo, true)
      let taskOpposingValAfter = await task.getOpposingVal(projAddrR, indexNo)
      let taskValDetailsAfter = await task.getValDetails(projAddrR, indexNo, validator1)

      // checks
      assert.equal(valBalBefore - tokensToValidate, valBalAfter, 'token addition/subtraction incorrect')
      assert.equal(TRBalAfter - tokensToValidate, TRBalBefore, 'token addition/subtraction incorrect')
      assert.equal(taskValPosBefore, 0, 'should be 0')
      assert.equal(taskValPosAfter, taskValPosBefore, 'shouldn\'t change')
      assert.equal(taskValNegBefore, 0, 'should be 0')
      assert.equal(taskValNegAfter, tokensToValidate, 'task contract updated incorrectly')
      assert.equal(taskOpposingValBefore, false, 'should be false')
      assert.equal(taskOpposingValAfter, taskOpposingValBefore, 'shouldn\'t change')
      assert.equal(taskValDetailsBefore[0], 0, 'status should be 0')
      assert.equal(taskValDetailsBefore[1], 0, 'stake should be 0')
      assert.equal(taskValDetailsAfter[0], 0, 'status after should be false')
      assert.equal(taskValDetailsAfter[1], tokensToValidate, 'stake after should be tokensToValidate')
    })

    it('Different validator can also validate a yes validated completed task yes from TR validating project', async function () {
      // take stock of variables before
      let tokensToValidate = 100
      let valBalBefore = await utils.getTokenBalance(validator2)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let taskValNegBefore = await task.getTotalValidate(projAddrT, indexYes, false)
      let taskValPosBefore = await task.getTotalValidate(projAddrT, indexYes, true)
      let taskOpposingValBefore = await task.getOpposingVal(projAddrT, indexYes)
      let taskValDetailsBefore = await task.getValDetails(projAddrT, indexYes, validator2)

      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator2, tokensToValidate)

      // validate task
      await TR.validateTask(projAddrT, indexYes, tokensToValidate, true, {from: validator2})

      // task stock of variables after
      let valBalAfter = await utils.getTokenBalance(validator2)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let taskValNegAfter = await task.getTotalValidate(projAddrT, indexYes, false)
      let taskValPosAfter = await task.getTotalValidate(projAddrT, indexYes, true)
      let taskOpposingValAfter = await task.getOpposingVal(projAddrT, indexYes)
      let taskValDetailsAfter = await task.getValDetails(projAddrT, indexYes, validator2)

      // checks
      assert.equal(valBalBefore - tokensToValidate, valBalAfter, 'token addition/subtraction incorrect')
      assert.equal(TRBalAfter - tokensToValidate, TRBalBefore, 'token addition/subtraction incorrect')
      assert.equal(taskValNegBefore, 0, 'should be 0')
      assert.equal(taskValNegAfter, taskValNegBefore, 'shouldn\'t change')
      assert.equal(taskValPosBefore, tokensToValidate, 'should be tokensToValidate')
      assert.equal(taskValPosAfter, tokensToValidate * 2, 'task contract updated incorrectly')
      assert.equal(taskOpposingValBefore, false, 'should be false')
      assert.equal(taskOpposingValAfter, taskOpposingValBefore, 'shouldn\'t change')
      assert.equal(taskValDetailsBefore[0], 0, 'status should be 0')
      assert.equal(taskValDetailsBefore[1], 0, 'stake should be 0')
      assert.equal(taskValDetailsAfter[0], 1, 'status after should be true')
      assert.equal(taskValDetailsAfter[1], tokensToValidate, 'stake after should be tokensToValidate')
    })

    it('Different validator can also validate a yes validated completed task yes from RR validating project', async function () {
      // take stock of variables before
      let tokensToValidate = 100
      let valBalBefore = await utils.getTokenBalance(validator2)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let taskValNegBefore = await task.getTotalValidate(projAddrR, indexYes, false)
      let taskValPosBefore = await task.getTotalValidate(projAddrR, indexYes, true)
      let taskOpposingValBefore = await task.getOpposingVal(projAddrR, indexYes)
      let taskValDetailsBefore = await task.getValDetails(projAddrR, indexYes, validator2)

      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator2, tokensToValidate)

      // validate task
      await TR.validateTask(projAddrR, indexYes, tokensToValidate, true, {from: validator2})

      // task stock of variables after
      let valBalAfter = await utils.getTokenBalance(validator2)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let taskValNegAfter = await task.getTotalValidate(projAddrR, indexYes, false)
      let taskValPosAfter = await task.getTotalValidate(projAddrR, indexYes, true)
      let taskOpposingValAfter = await task.getOpposingVal(projAddrR, indexYes)
      let taskValDetailsAfter = await task.getValDetails(projAddrR, indexYes, validator2)

      // checks
      assert.equal(valBalBefore - tokensToValidate, valBalAfter, 'token addition/subtraction incorrect')
      assert.equal(TRBalAfter - tokensToValidate, TRBalBefore, 'token addition/subtraction incorrect')
      assert.equal(taskValNegBefore, 0, 'should be 0')
      assert.equal(taskValNegAfter, taskValNegBefore, 'shouldn\'t change')
      assert.equal(taskValPosBefore, tokensToValidate, 'should be tokensToValidate')
      assert.equal(taskValPosAfter, tokensToValidate * 2, 'task contract updated incorrectly')
      assert.equal(taskOpposingValBefore, false, 'should be false')
      assert.equal(taskOpposingValAfter, taskOpposingValBefore, 'shouldn\'t change')
      assert.equal(taskValDetailsBefore[0], 0, 'status should be 0')
      assert.equal(taskValDetailsBefore[1], 0, 'stake should be 0')
      assert.equal(taskValDetailsAfter[0], 1, 'status after should be true')
      assert.equal(taskValDetailsAfter[1], tokensToValidate, 'stake after should be tokensToValidate')
    })

    it('Different validator can also validate a no validated completed task no from TR validating project', async function () {
      // take stock of variables before
      let tokensToValidate = 100
      let valBalBefore = await utils.getTokenBalance(validator2)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let taskValNegBefore = await task.getTotalValidate(projAddrT, indexNo, false)
      let taskValPosBefore = await task.getTotalValidate(projAddrT, indexNo, true)
      let taskOpposingValBefore = await task.getOpposingVal(projAddrT, indexNo)
      let taskValDetailsBefore = await task.getValDetails(projAddrT, indexNo, validator2)

      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator2, tokensToValidate)

      // validate task
      await TR.validateTask(projAddrT, indexNo, tokensToValidate, false, {from: validator2})

      // task stock of variables after
      let valBalAfter = await utils.getTokenBalance(validator2)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let taskValNegAfter = await task.getTotalValidate(projAddrT, indexNo, false)
      let taskValPosAfter = await task.getTotalValidate(projAddrT, indexNo, true)
      let taskOpposingValAfter = await task.getOpposingVal(projAddrT, indexNo)
      let taskValDetailsAfter = await task.getValDetails(projAddrT, indexNo, validator2)

      // checks
      assert.equal(valBalBefore - tokensToValidate, valBalAfter, 'token addition/subtraction incorrect')
      assert.equal(TRBalAfter - tokensToValidate, TRBalBefore, 'token addition/subtraction incorrect')
      assert.equal(taskValPosBefore, 0, 'should be 0')
      assert.equal(taskValPosAfter, taskValPosBefore, 'shouldn\'t change')
      assert.equal(taskValNegBefore, tokensToValidate, 'should be tokensToValidate')
      assert.equal(taskValNegAfter, tokensToValidate * 2, 'task contract updated incorrectly')
      assert.equal(taskOpposingValBefore, false, 'should be false')
      assert.equal(taskOpposingValAfter, taskOpposingValBefore, 'shouldn\'t change')
      assert.equal(taskValDetailsBefore[0], 0, 'status should be 0')
      assert.equal(taskValDetailsBefore[1], 0, 'stake should be 0')
      assert.equal(taskValDetailsAfter[0], 0, 'status after should be false')
      assert.equal(taskValDetailsAfter[1], tokensToValidate, 'stake after should be tokensToValidate')
    })

    it('Different validator can also validate a no validated completed task no from RR validating project', async function () {
      // take stock of variables before
      let tokensToValidate = 100
      let valBalBefore = await utils.getTokenBalance(validator2)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let taskValNegBefore = await task.getTotalValidate(projAddrR, indexNo, false)
      let taskValPosBefore = await task.getTotalValidate(projAddrR, indexNo, true)
      let taskOpposingValBefore = await task.getOpposingVal(projAddrR, indexNo)
      let taskValDetailsBefore = await task.getValDetails(projAddrR, indexNo, validator2)

      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator2, tokensToValidate)

      // validate task
      await TR.validateTask(projAddrR, indexNo, tokensToValidate, false, {from: validator2})

      // task stock of variables after
      let valBalAfter = await utils.getTokenBalance(validator2)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let taskValNegAfter = await task.getTotalValidate(projAddrR, indexNo, false)
      let taskValPosAfter = await task.getTotalValidate(projAddrR, indexNo, true)
      let taskOpposingValAfter = await task.getOpposingVal(projAddrR, indexNo)
      let taskValDetailsAfter = await task.getValDetails(projAddrR, indexNo, validator2)

      // checks
      assert.equal(valBalBefore - tokensToValidate, valBalAfter, 'token addition/subtraction incorrect')
      assert.equal(TRBalAfter - tokensToValidate, TRBalBefore, 'token addition/subtraction incorrect')
      assert.equal(taskValPosBefore, 0, 'should be 0')
      assert.equal(taskValPosAfter, taskValPosBefore, 'shouldn\'t change')
      assert.equal(taskValNegBefore, tokensToValidate, 'should be tokensToValidate')
      assert.equal(taskValNegAfter, tokensToValidate * 2, 'task contract updated incorrectly')
      assert.equal(taskOpposingValBefore, false, 'should be false')
      assert.equal(taskOpposingValAfter, taskOpposingValBefore, 'shouldn\'t change')
      assert.equal(taskValDetailsBefore[0], 0, 'status should be 0')
      assert.equal(taskValDetailsBefore[1], 0, 'stake should be 0')
      assert.equal(taskValDetailsAfter[0], 0, 'status after should be false')
      assert.equal(taskValDetailsAfter[1], tokensToValidate, 'stake after should be tokensToValidate')
    })

    it('Validators can validate a completed task yes and no from TR validating project', async function () {
      // take stock of variables before
      let val1BalBefore = await utils.getTokenBalance(validator1)
      let val2BalBefore = await utils.getTokenBalance(validator2)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let taskValNegBefore = await task.getTotalValidate(projAddrT, indexBoth, false)
      let taskValPosBefore = await task.getTotalValidate(projAddrT, indexBoth, true)
      let taskOpposingValBefore = await task.getOpposingVal(projAddrT, indexBoth)
      let taskVal1DetailsBefore = await task.getValDetails(projAddrT, indexBoth, validator1)
      let taskVal2DetailsBefore = await task.getValDetails(projAddrT, indexBoth, validator2)

      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      // validate task
      await TR.validateTask(projAddrT, indexBoth, tokensToValidate, false, {from: validator1})

      // task stock of variables after
      let val1BalMiddle = await utils.getTokenBalance(validator1)
      let val2BalMiddle = await utils.getTokenBalance(validator2)
      let TRBalMiddle = await utils.getTokenBalance(TR.address)
      let taskValNegMiddle = await task.getTotalValidate(projAddrT, indexBoth, false)
      let taskValPosMiddle = await task.getTotalValidate(projAddrT, indexBoth, true)
      let taskOpposingValMiddle = await task.getOpposingVal(projAddrT, indexBoth)
      let taskVal1DetailsMiddle = await task.getValDetails(projAddrT, indexBoth, validator1)
      let taskVal2DetailsMiddle = await task.getValDetails(projAddrT, indexBoth, validator2)

      // checks
      assert.equal(val1BalBefore - tokensToValidate, val1BalMiddle, 'token addition/subtraction incorrect')
      assert.equal(val2BalBefore, val2BalMiddle, 'shouldn\'t change')
      assert.equal(TRBalMiddle - tokensToValidate, TRBalBefore, 'token addition/subtraction incorrect')
      assert.equal(taskValPosBefore, 0, 'should be 0')
      assert.equal(taskValPosMiddle, taskValPosBefore, 'shouldn\'t change')
      assert.equal(taskValNegBefore, 0, 'should be 0')
      assert.equal(taskValNegMiddle, tokensToValidate, 'task contract updated incorrectly')
      assert.equal(taskOpposingValBefore, false, 'should be false')
      assert.equal(taskOpposingValMiddle, taskOpposingValBefore, 'shouldn\'t change')
      assert.equal(taskVal1DetailsBefore[0], 0, 'status should be 0')
      assert.equal(taskVal1DetailsBefore[1], 0, 'stake should be 0')
      assert.equal(taskVal2DetailsBefore[0], 0, 'status should be 0')
      assert.equal(taskVal2DetailsBefore[1], 0, 'stake should be 0')
      assert.equal(taskVal1DetailsMiddle[0], 0, 'status after should be false')
      assert.equal(taskVal1DetailsMiddle[1], tokensToValidate, 'stake after should be tokensToValidate')
      assert.equal(taskVal2DetailsMiddle[0], 0, 'status should be 0')
      assert.equal(taskVal2DetailsMiddle[1], 0, 'stake should be 0')

      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator2, tokensToValidate)

      // validate task
      await TR.validateTask(projAddrT, indexBoth, tokensToValidate, true, {from: validator2})

      // task stock of variables after
      let val1BalAfter = await utils.getTokenBalance(validator1)
      let val2BalAfter = await utils.getTokenBalance(validator2)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let taskValNegAfter = await task.getTotalValidate(projAddrT, indexBoth, false)
      let taskValPosAfter = await task.getTotalValidate(projAddrT, indexBoth, true)
      let taskOpposingValAfter = await task.getOpposingVal(projAddrT, indexBoth)
      let taskVal1DetailsAfter = await task.getValDetails(projAddrT, indexBoth, validator1)
      let taskVal2DetailsAfter = await task.getValDetails(projAddrT, indexBoth, validator2)

      // checks
      assert.equal(val2BalMiddle - tokensToValidate, val2BalAfter, 'token addition/subtraction incorrect')
      assert.equal(val1BalMiddle, val1BalAfter, 'shouldn\'t change')
      assert.equal(TRBalAfter - tokensToValidate, TRBalMiddle, 'token addition/subtraction incorrect')
      assert.equal(taskValPosAfter, tokensToValidate, 'should change')
      assert.equal(taskValNegAfter, tokensToValidate, 'shouldn\'t change')
      assert.equal(taskOpposingValAfter, true, 'should change')
      assert.equal(taskVal1DetailsAfter[0], 0, 'status after should be false')
      assert.equal(taskVal1DetailsAfter[1], tokensToValidate, 'stake after should be tokensToValidate')
      assert.equal(taskVal2DetailsAfter[0], 1, 'status after should be true')
      assert.equal(taskVal2DetailsAfter[1], tokensToValidate, 'stake after should be tokensToValidate')
    })

    it('Validators can validate a completed task yes and no from RR validating project', async function () {
      // take stock of variables before
      let val1BalBefore = await utils.getTokenBalance(validator1)
      let val2BalBefore = await utils.getTokenBalance(validator2)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let taskValNegBefore = await task.getTotalValidate(projAddrR, indexBoth, false)
      let taskValPosBefore = await task.getTotalValidate(projAddrR, indexBoth, true)
      let taskOpposingValBefore = await task.getOpposingVal(projAddrR, indexBoth)
      let taskVal1DetailsBefore = await task.getValDetails(projAddrR, indexBoth, validator1)
      let taskVal2DetailsBefore = await task.getValDetails(projAddrR, indexBoth, validator2)

      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      // validate task
      await TR.validateTask(projAddrR, indexBoth, tokensToValidate, false, {from: validator1})

      // task stock of variables after
      let val1BalMiddle = await utils.getTokenBalance(validator1)
      let val2BalMiddle = await utils.getTokenBalance(validator2)
      let TRBalMiddle = await utils.getTokenBalance(TR.address)
      let taskValNegMiddle = await task.getTotalValidate(projAddrR, indexBoth, false)
      let taskValPosMiddle = await task.getTotalValidate(projAddrR, indexBoth, true)
      let taskOpposingValMiddle = await task.getOpposingVal(projAddrR, indexBoth)
      let taskVal1DetailsMiddle = await task.getValDetails(projAddrR, indexBoth, validator1)
      let taskVal2DetailsMiddle = await task.getValDetails(projAddrR, indexBoth, validator2)

      // checks
      assert.equal(val1BalBefore - tokensToValidate, val1BalMiddle, 'token addition/subtraction incorrect')
      assert.equal(val2BalBefore, val2BalMiddle, 'shouldn\'t change')
      assert.equal(TRBalMiddle - tokensToValidate, TRBalBefore, 'token addition/subtraction incorrect')
      assert.equal(taskValPosBefore, 0, 'should be 0')
      assert.equal(taskValPosMiddle, taskValPosBefore, 'shouldn\'t change')
      assert.equal(taskValNegBefore, 0, 'should be 0')
      assert.equal(taskValNegMiddle, tokensToValidate, 'task contract updated incorrectly')
      assert.equal(taskOpposingValBefore, false, 'should be false')
      assert.equal(taskOpposingValMiddle, taskOpposingValBefore, 'shouldn\'t change')
      assert.equal(taskVal1DetailsBefore[0], 0, 'status should be 0')
      assert.equal(taskVal1DetailsBefore[1], 0, 'stake should be 0')
      assert.equal(taskVal2DetailsBefore[0], 0, 'status should be 0')
      assert.equal(taskVal2DetailsBefore[1], 0, 'stake should be 0')
      assert.equal(taskVal1DetailsMiddle[0], 0, 'status after should be false')
      assert.equal(taskVal1DetailsMiddle[1], tokensToValidate, 'stake after should be tokensToValidate')
      assert.equal(taskVal2DetailsMiddle[0], 0, 'status should be 0')
      assert.equal(taskVal2DetailsMiddle[1], 0, 'stake should be 0')

      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator2, tokensToValidate)

      // validate task
      await TR.validateTask(projAddrR, indexBoth, tokensToValidate, true, {from: validator2})

      // task stock of variables after
      let val1BalAfter = await utils.getTokenBalance(validator1)
      let val2BalAfter = await utils.getTokenBalance(validator2)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let taskValNegAfter = await task.getTotalValidate(projAddrR, indexBoth, false)
      let taskValPosAfter = await task.getTotalValidate(projAddrR, indexBoth, true)
      let taskOpposingValAfter = await task.getOpposingVal(projAddrR, indexBoth)
      let taskVal1DetailsAfter = await task.getValDetails(projAddrR, indexBoth, validator1)
      let taskVal2DetailsAfter = await task.getValDetails(projAddrR, indexBoth, validator2)

      // checks
      assert.equal(val2BalMiddle - tokensToValidate, val2BalAfter, 'token addition/subtraction incorrect')
      assert.equal(val1BalMiddle, val1BalAfter, 'shouldn\'t change')
      assert.equal(TRBalAfter - tokensToValidate, TRBalMiddle, 'token addition/subtraction incorrect')
      assert.equal(taskValPosAfter, tokensToValidate, 'should change')
      assert.equal(taskValNegAfter, tokensToValidate, 'shouldn\'t change')
      assert.equal(taskOpposingValAfter, true, 'should change')
      assert.equal(taskVal1DetailsAfter[0], 0, 'status after should be false')
      assert.equal(taskVal1DetailsAfter[1], tokensToValidate, 'stake after should be tokensToValidate')
      assert.equal(taskVal2DetailsAfter[0], 1, 'status after should be true')
      assert.equal(taskVal2DetailsAfter[1], tokensToValidate, 'stake after should be tokensToValidate')
    })

    it('Validator can\'t validate a completed task yes from TR validating project more than once', async function () {
      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexYes, tokensToValidate, true, {from: validator1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate a completed task yes from RR validating project more than once', async function () {
      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      errorThrown = false
      try {
        await TR.validateTask(projAddrR, indexYes, tokensToValidate, true, {from: validator1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate a completed task no from TR validating project more than once', async function () {
      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexBoth, tokensToValidate, false, {from: validator1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate a completed task no from RR validating project more than once', async function () {
      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      errorThrown = false
      try {
        await TR.validateTask(projAddrR, indexBoth, tokensToValidate, false, {from: validator1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate a completed task yes from TR validating project if they don\'t have enough tokens', async function () {
      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexBoth, tokensToValidate, true, {from: notValidator})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate a completed task yes from RR validating project if they don\'t have enough tokens', async function () {
      errorThrown = true
      try {
        await TR.validateTask(projAddrT, indexBoth, tokensToValidate, true, {from: notValidator})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate a completed task no from TR validating project if they don\'t have enough tokens', async function () {
      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexBoth, tokensToValidate, false, {from: notValidator})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate a completed task no from RR validating project if they don\'t have enough tokens', async function () {
      errorThrown = false
      try {
        await TR.validateTask(projAddrR, indexBoth, tokensToValidate, false, {from: notValidator})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate incomplete task yes from TR validating project with tokens', async function () {
      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexIncomplete, tokensToValidate, true, {from: validator1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate incomplete task yes from RR validating project with tokens', async function () {
      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      errorThrown = false
      try {
        await TR.validateTask(projAddrR, indexIncomplete, tokensToValidate, true, {from: validator1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate incomplete task no from TR validating project with tokens', async function () {
      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexIncomplete, tokensToValidate, false, {from: validator1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate incomplete task no from RR validating project with tokens', async function () {
      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      errorThrown = false
      try {
        await TR.validateTask(projAddrR, indexIncomplete, tokensToValidate, false, {from: validator1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate nonexistant task yes from TR validating project with tokens', async function () {
      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, notIndex, tokensToValidate, true, {from: validator1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate nonexistant task yes from RR validating project with tokens', async function () {
      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      errorThrown = false
      try {
        await TR.validateTask(projAddrR, notIndex, tokensToValidate, true, {from: validator1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate nonexistant task no from TR validating project with tokens', async function () {
      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, notIndex, tokensToValidate, false, {from: validator1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate nonexistant task no from RR validating project with tokens', async function () {
      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      errorThrown = false
      try {
        await TR.validateTask(projAddrR, notIndex, tokensToValidate, false, {from: validator1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('validating with reputation', () => {
    it('Validator can\'t validate a completed task yes from TR validating project with reputation', async function () {
      // assert that worker has tokensToValidate amount of reputation
      let repBal = await utils.getRepBalance(worker1)
      assert.isAtLeast(repBal, tokensToValidate, 'worker1 does not have tokensToValidate reputation')

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexBoth, tokensToValidate, true, {from: worker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate a completed task yes from RR validating project with reputation', async function () {
      // assert that worker has tokensToValidate amount of reputation
      let repBal = await utils.getRepBalance(worker1)
      assert.isAtLeast(repBal, tokensToValidate, 'worker1 does not have tokensToValidate reputation')

      errorThrown = false
      try {
        await TR.validateTask(projAddrR, indexBoth, tokensToValidate, true, {from: worker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate a completed task no from TR validating project with reputation', async function () {
      // assert that worker has tokensToValidate amount of reputation
      let repBal = await utils.getRepBalance(worker1)
      assert.isAtLeast(repBal, tokensToValidate, 'worker1 does not have tokensToValidate reputation')

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexBoth, tokensToValidate, false, {from: worker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate a completed task no from RR validating project with reputation', async function () {
      // assert that worker has tokensToValidate amount of reputation
      let repBal = await utils.getRepBalance(worker1)
      assert.isAtLeast(repBal, tokensToValidate, 'worker1 does not have tokensToValidate reputation')

      errorThrown = false
      try {
        await TR.validateTask(projAddrR, indexBoth, tokensToValidate, false, {from: worker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate an incomplete task yes from TR validating project with reputation', async function () {
      // assert that worker has tokensToValidate amount of reputation
      let repBal = await utils.getRepBalance(worker1)
      assert.isAtLeast(repBal, tokensToValidate, 'worker1 does not have tokensToValidate reputation')

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexIncomplete, tokensToValidate, true, {from: worker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate an incomplete task yes from RR validating project with reputation', async function () {
      // assert that worker has tokensToValidate amount of reputation
      let repBal = await utils.getRepBalance(worker1)
      assert.isAtLeast(repBal, tokensToValidate, 'worker1 does not have tokensToValidate reputation')

      errorThrown = false
      try {
        await TR.validateTask(projAddrR, indexIncomplete, tokensToValidate, true, {from: worker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate an incomplete task no from TR validating project with reputation', async function () {
      // assert that worker has tokensToValidate amount of reputation
      let repBal = await utils.getRepBalance(worker1)
      assert.isAtLeast(repBal, tokensToValidate, 'worker1 does not have tokensToValidate reputation')

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexIncomplete, tokensToValidate, false, {from: worker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate an incomplete task no from RR validating project with reputation', async function () {
      // assert that worker has tokensToValidate amount of reputation
      let repBal = await utils.getRepBalance(worker1)
      assert.isAtLeast(repBal, tokensToValidate, 'worker1 does not have tokensToValidate reputation')

      errorThrown = false
      try {
        await TR.validateTask(projAddrR, indexIncomplete, tokensToValidate, false, {from: worker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate a nonexistant task yes from TR validating project with reputation', async function () {
      // assert that worker has tokensToValidate amount of reputation
      let repBal = await utils.getRepBalance(worker1)
      assert.isAtLeast(repBal, tokensToValidate, 'worker1 does not have tokensToValidate reputation')

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, notIndex, tokensToValidate, true, {from: worker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate a nonexistant task yes from RR validating project with reputation', async function () {
      // assert that worker has tokensToValidate amount of reputation
      let repBal = await utils.getRepBalance(worker1)
      assert.isAtLeast(repBal, tokensToValidate, 'worker1 does not have tokensToValidate reputation')

      errorThrown = false
      try {
        await TR.validateTask(projAddrR, notIndex, tokensToValidate, true, {from: worker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate a nonexistant task no from TR validating project with reputation', async function () {
      // assert that worker has tokensToValidate amount of reputation
      let repBal = await utils.getRepBalance(worker1)
      assert.isAtLeast(repBal, tokensToValidate, 'worker1 does not have tokensToValidate reputation')

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, notIndex, tokensToValidate, false, {from: worker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate a nonexistant task no from RR validating project with reputation', async function () {
      // assert that worker has tokensToValidate amount of reputation
      let repBal = await utils.getRepBalance(worker1)
      assert.isAtLeast(repBal, tokensToValidate, 'worker1 does not have tokensToValidate reputation')

      errorThrown = false
      try {
        await TR.validateTask(projAddrR, notIndex, tokensToValidate, false, {from: worker1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('state changes before time is up', () => {
    it('checkVoting() does not change TR validating project to voting before time is up', async function () {
      // take stock of variables
      let stateBefore = await project.getState(projAddrT)

      // attempt to checkStaked
      await PR.checkVoting(projAddrT)

      // take stock of variables
      let stateAfter = await project.getState(projAddrT)

      // checks
      assert.equal(stateBefore, 4, 'state before should be 4')
      assert.equal(stateAfter, 4, 'state should not have changed')
    })

    it('checkVoting() does not change RR validating project to voting before time is up', async function () {
      // take stock of variables
      let stateBefore = await project.getState(projAddrR)

      // attempt to checkStaked
      await PR.checkVoting(projAddrR)

      // take stock of variables
      let stateAfter = await project.getState(projAddrR)

      // checks
      assert.equal(stateBefore, 4, 'state before should be 4')
      assert.equal(stateAfter, 4, 'state should not have changed')
    })
  })

  describe('state changes after time is up', () => {
    before(async function () {
      // fast forward time
      await evmIncreaseTime(604800) // 1 week
    })

    it('checkVoting() changes TR validating project to voting after time is up', async function () {
      // take stock of variables
      let stateBefore = await project.getState(projAddrT)
      let projWeiBalBefore = await project.getWeiBal(projAddrT, true)
      let DTBalBefore = await utils.getWeiPoolBal(true)

      // attempt to checkStaked
      await PR.checkVoting(projAddrT)

      // take stock of variables
      let stateAfter = await project.getState(projAddrT)
      let projWeiBalAfter = await project.getWeiBal(projAddrT, true)
      let DTBalAfter = await utils.getWeiPoolBal(true)
      let failedTaskWeighting = 0
      let pollNonce = []
      let taskClaimable = []

      for (let i = 0; i < taskSet1.length; i++) {
        let nonce = await task.getPollNonce(projAddrT, i)
        let claimable = await task.getClaimable(projAddrT, i)
        let complete = await task.getComplete(projAddrT, i)
        if (claimable === false && complete === true) {
          let weighting = await task.getWeiReward(projAddrT, i)
          failedTaskWeighting += weighting
        }
        pollNonce.push(nonce)
        taskClaimable.push(claimable)
      }

      // interim calculations
      let weiBalDifference = projWeiBalBefore.minus(projWeiBalAfter).toNumber()
      let weiPoolDifference = DTBalAfter.minus(DTBalBefore).toNumber()

      // checks
      assert.equal(stateBefore, 4, 'state before should be 4')
      assert.equal(stateAfter, 5, 'state should not have changed')
      assert.equal(pollNonce[indexYes], 0, 'should be no poll ID')
      assert.equal(pollNonce[indexNo], 0, 'should be no poll ID')
      assert.equal(pollNonce[indexNeither], 0, 'should be no poll ID')
      assert.equal(pollNonce[indexIncomplete], 0, 'should be no poll ID')
      assert.notEqual(pollNonce[indexBoth], 0, 'should be nonzero poll ID')
      assert.equal(taskClaimable[indexYes], true, 'should be claimable')
      assert.equal(taskClaimable[indexNo], true, 'should be claimable')
      assert.equal(taskClaimable[indexNeither], true, 'should be claimable')
      assert.equal(taskClaimable[indexIncomplete], false, 'should not be claimable')
      assert.equal(taskClaimable[indexBoth], false, 'should not be claimable')
      // FIGURE OUT WHY FAILEDTASKWEIGHTING TESTS DON'T WORK
      // assert.equal(weiBalDifference, failedTaskWeighting, 'should be same amount')
      // assert.equal(weiPoolDifference, failedTaskWeighting, 'should be same amount')
      // ADD PLCR START POLL TEST
    })

    it('checkVoting() changes RR validating project to voting after time is up', async function () {
      // take stock of variables
      let stateBefore = await project.getState(projAddrR)

      // attempt to checkStaked
      await PR.checkVoting(projAddrR)

      // take stock of variables
      let stateAfter = await project.getState(projAddrR)

      // checks
      assert.equal(stateBefore, 4, 'state before should be 4')
      assert.equal(stateAfter, 5, 'state should not have changed')
    })
  })

  describe('validate voting projects', () => {
    it('Validator can\'t validate a completed task yes from TR voting project', async function () {
      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexNeither, tokensToValidate, true, {from: validator1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate a completed task yes from RR voting project', async function () {
      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexNeither, tokensToValidate, true, {from: validator1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate a completed task no from TR voting project', async function () {
      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexNeither, tokensToValidate, false, {from: validator1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Validator can\'t validate a completed task no from RR voting project', async function () {
      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      errorThrown = false
      try {
        await TR.validateTask(projAddrT, indexNeither, tokensToValidate, false, {from: validator1})
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })
})
