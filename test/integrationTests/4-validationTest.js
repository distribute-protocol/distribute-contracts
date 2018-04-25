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
    projArray = await returnProject.validating(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash, 1, taskSet1, [taskSet1 - 1])
    projAddrT = projArray[0][0]
    projAddrR = projArray[0][1]

    // fund validators
    await utils.mintIfNecessary(validator1)
    await utils.mintIfNecessary(validator2)
  })

  describe('validating with tokens', () => {
    it('Validator can validate a completed task yes from TR validating project if they have enough tokens', async function () {
      // getting validator details before validating should fail
      errorThrown = false
      try {
        await task.getValDetails(projAddrT, indexBoth, validator1)
      } catch (e) {
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')

      // take stock of variables before
      let tokensToValidate = 100
      // let valBalBefore = await utils.getTokenBalance(validator1)
      // let TRBalBefore = await utils.getTokenBalance(TR.address)
      // let taskValNegBefore = await task.getTotalValidate(projAddrT, indexBoth, false)
      // let taskValPosBefore = await task.getTotalValidate(projAddrT, indexBoth, true)
      // let taskOpposingValBefore = await task.getOpposingVal(projAddrT, indexBoth)

      // fund validator with tokens if necessary
      await utils.mintIfNecessary(validator1, tokensToValidate)

      // validate task
      await TR.validateTask(projAddrT, indexBoth, tokensToValidate, true, {from: validator1})

      // task stock of variables after
      // let valBalAfter = await utils.getTokenBalance(validator1)
      // let TRBalAfter = await utils.getTokenBalance(TR.address)
      // let taskValNegAfter = await task.getTotalValidate(projAddrT, indexBoth, false)
      // let taskValPosAfter = await task.getTotalValidate(projAddrT, indexBoth, true)
      // let taskOpposingValAfter = await task.getOpposingVal(projAddrT, indexBoth)

      // let taskValBalAfter = await task.getValDetails(projAddrT, indexBoth, validator1)

      // checks
      // assert.equal()

    })

    it('Validator can validate a completed task yes from RR validating project if they have enough tokens', async function () {

    })

    it('Different validator can validate the same completed task no from TR validating project if they have enough tokens', async function () {

    })

    it('Different validator can validate the same completed task no from RR validating project if they have enough tokens', async function () {

    })

    it('Same validator can validate a different completed task no from TR validating project if they have enough tokens', async function () {

    })

    it('Same  validator can validate a different completed task no from RR validating project if they have enough tokens', async function () {

    })

    it('Validator can\'t validate a completed task yes from TR validating project more than once', async function () {

    })

    it('Validator can\'t validate a completed task yes from RR validating project more than once', async function () {

    })

    it('Validator can\'t validate a completed task no from TR validating project more than once', async function () {

    })

    it('Validator can\'t validate a completed task no from RR validating project more than once', async function () {

    })

    it('Validator can\'t validate a completed task yes from TR validating project if they don\'t have enough tokens', async function () {

    })

    it('Validator can\'t validate a completed task yes from RR validating project if they don\'t have enough tokens', async function () {

    })

    it('Validator can\'t validate a completed task no from TR validating project if they don\'t have enough tokens', async function () {

    })

    it('Validator can\'t validate a completed task no from RR validating project if they don\'t have enough tokens', async function () {

    })

    it('Validator can\'t validate incomplete task yes from TR validating project with tokens', async function () {

    })

    it('Validator can\'t validate incomplete task yes from RR validating project with tokens', async function () {

    })

    it('Validator can\'t validate incomplete task no from TR validating project with tokens', async function () {

    })

    it('Validator can\'t validate incomplete task no from RR validating project with tokens', async function () {

    })

    it('Validator can\'t validate nonexistant task yes from TR validating project with tokens', async function () {

    })

    it('Validator can\'t validate nonexistant task yes from RR validating project with tokens', async function () {

    })

    it('Validator can\'t validate nonexistant task no from TR validating project with tokens', async function () {

    })

    it('Validator can\'t validate nonexistant task no from RR validating project with tokens', async function () {

    })
  })

  describe('validating with reputation', () => {
    it('Validator can\'t validate a completed task yes from TR validating project with reputation', async function () {

    })

    it('Validator can\'t validate a completed task yes from RR validating project with reputation', async function () {

    })

    it('Validator can\'t validate a completed task no from TR validating project with reputation', async function () {

    })

    it('Validator can\'t validate a completed task no from RR validating project with reputation', async function () {

    })

    it('Validator can\'t validate an incomplete task yes from TR validating project with reputation', async function () {

    })

    it('Validator can\'t validate an incomplete task yes from RR validating project with reputation', async function () {

    })

    it('Validator can\'t validate an incomplete task no from TR validating project with reputation', async function () {

    })

    it('Validator can\'t validate an incomplete task no from RR validating project with reputation', async function () {

    })

    it('Validator can\'t validate a nonexistant task yes from TR validating project with reputation', async function () {

    })

    it('Validator can\'t validate a nonexistant task yes from RR validating project with reputation', async function () {

    })

    it('Validator can\'t validate a nonexistant task no from TR validating project with reputation', async function () {

    })

    it('Validator can\'t validate a nonexistant task no from RR validating project with reputation', async function () {

    })
  })

  describe('state changes before time is up', () => {
    it('checkVoting() does not change TR validating project to voting before time is up', async function () {

    })

    it('checkVoting() does not change RR validating project to voting before time is up', async function () {

    })
  })

  describe('state changes after time is up', () => {
    before(async function () {
      // fast forward time
      await evmIncreaseTime(604800) // 1 week
    })

    it('checkVoting() changes TR validating project to voting after time is up', async function () {

    })

    it('checkVoting() changes RR validating project to voting after time is up', async function () {

    })
  })

  describe('validate voting projects', () => {
    it('Validator can\'t validate a completed task yes from TR voting project if they have enough tokens', async function () {

    })

    it('Validator can\'t validate a completed task yes from RR voting project if they have enough tokens', async function () {

    })

    it('Validator can\'t validate a completed task no from TR voting project if they have enough tokens', async function () {

    })

    it('Validator can\'t validate a completed task no from RR voting project if they have enough tokens', async function () {

    })
  })
})
