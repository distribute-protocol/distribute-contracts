/* eslint-env mocha */
/* global assert contract */

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
const taskDetails = require('../utils/taskDetails')

contract('Expired State', (accounts) => {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let TR, RR, DT, PR, PLCR
  let {user, project, utils, returnProject, task} = projObj
  let {proposer} = user
  let {projectCost, stakingPeriod, ipfsHash} = project

  // local test variables
  let projArray
  let errorThrown
  let projAddrT, projAddrR

  before(async () => {
    // get contract
    await projObj.contracts.setContracts()
    TR = projObj.contracts.TR
    RR = projObj.contracts.RR
    PR = projObj.contracts.PR
    DT = projObj.contracts.DT

    // get finished - complete projects
    // moves ganache forward 1 more week
    projArray = await returnProject.expired(projectCost, stakingPeriod, ipfsHash, 2)

    projAddrT = projArray[0][0]
    projAddrR = projArray[0][1]
  })

  describe('test', () => {
    it('test', async () => {
    })
  })
})
