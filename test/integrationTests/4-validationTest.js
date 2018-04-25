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
  let {repStaker1} = user
  let {worker1, worker2, notWorker} = user
  let {projectCost, stakingPeriod, ipfsHash} = project

  // set up task details & hashing functions
  let {taskSet1, taskSet2} = taskDetails
  let {hashTasks} = keccakHashes

  // local test variables
  let projArray
  let errorThrown
  let projAddrT, projAddrR

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
  })

  describe('validating with tokens', () => {
    it('Validator can validate a completed task yes from TR validating project if they have enough tokens', async function () {

    })

    it('Validator can validate a completed task yes from RR validating project if they have enough tokens', async function () {

    })

    it('Validator can validate a completed task no from TR validating project if they have enough tokens', async function () {

    })

    it('Validator can validate a completed task no from RR validating project if they have enough tokens', async function () {

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
