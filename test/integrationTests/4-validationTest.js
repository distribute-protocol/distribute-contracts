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

    // get active projects
    // moves ganache forward 1 more week
    projArray = await returnProject.active(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash, 1, taskSet1, [taskSet1 - 1])
    projAddrT = projArray[0][0]
    projAddrR = projArray[0][1]
  })

  it('token holder can validate task if it exists and they have enough tokens', async function () {

  })

  it('token holder cannot validate nonexistant task', async function () {

  })

  it('token holder cannot validate incomplete task', async function () {

  })

  it('token holder cannot validate task with tokens they do not have', async function () {

  })

  it('reputation holder cannot validate task with reputation', async function () {

  })

  it('validator cannot validate a task more than once', async function () {

  })

  it('can\'t change project to voting state before time is up', async function () {

  })

  it('project changes to voting state when time is up', async function () {

  })
})
