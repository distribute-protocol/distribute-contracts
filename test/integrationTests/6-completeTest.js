/* eslint-env mocha */
/* global assert contract */

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
const evmIncreaseTime = require('../utils/evmIncreaseTime')
const taskDetails = require('../utils/taskDetails')

const ethers = require('ethers')

contract('Complete State', (accounts) => {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let TR, RR, PR, PLCR
  let {user, project, utils, returnProject, task} = projObj
  let {proposer} = user
  let {projectCost, stakingPeriod, ipfsHash} = project

  // set up task details & hashing functions
  let {taskSet4} = taskDetails

  // local test variables
  let projArray
  let errorThrown
  let projAddrT, projAddrR

  // define validaton indices
  let valTrueOnly = 0
  // let valFalseOnly = 1
  let valTrueMore = 2
  let valFalseMore = 3
  // let valNeither = 4

  let valType = [valTrueOnly, valTrueMore, valFalseMore]

  // define voting indices
  let voteNeither = 0
  // let voteTrueOnly = 1
  // let voteFalseOnly = 2
  let voteTrueMore = 3
  // let voteFalseMore = 4

  let voteType = [voteNeither, voteTrueMore, voteTrueMore]

  let fastForwards = 14 // ganache 14 weeks ahead at this point from previous tests' evmIncreaseTime()

  before(async () => {
    // get contract
    await projObj.contracts.setContracts()
    TR = projObj.contracts.TR
    RR = projObj.contracts.RR
    PR = projObj.contracts.PR

    // get finished - complete projects
    // moves ganache forward 6 more weeks
    projArray = await returnProject.finished(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash, taskSet4, taskSet4.length, valType, voteType, 6)

    projAddrT = projArray[0][0]
    projAddrR = projArray[0][1]
  })

  describe('committing yes votes with tokens', () => {
    it('token voter can commit a yes vote to a task validated more yes from TR voting project', async () => {

    })
  })
})
