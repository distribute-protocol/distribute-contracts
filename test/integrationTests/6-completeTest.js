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

    })
  })
})
