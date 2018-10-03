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
  let TR, RR, DT, PR, PLCR
  let {user, project, utils, returnProject, task} = projObj
  let {tokenStaker1, tokenStaker2, notStaker} = user
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
    DT = projObj.contracts.DT

    // get finished - complete projects
    // moves ganache forward 6 more weeks
    projArray = await returnProject.finished(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash, taskSet4, taskSet4.length, valType, voteType, 6)

    projAddrT = projArray[0][0]
    projAddrR = projArray[0][1]
  })

  describe('refund stakers', () => {
    it('token staker can ask for refund from TR complete project', async () => {
      // take stock of variables before
      let totalTokensBefore = await utils.getTotalTokens()
      let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
      let DTBalBefore = await utils.getTokenBalance(DT.address)
      let tsProjBalBefore = await project.getUserStakedTokens(tokenStaker1, projAddrT)
      let passAmount = await project.getPassAmount(projAddrT)

      // calculate refund & reward
      let refund = Math.floor((tsBalBefore * passAmount) / 100)
      let reward = Math.floor(refund / 20)

      // refund staker
      await TR.refundStaker(projAddrT, {from: tokenStaker1})

      // take stock of variables after
      let totalTokensAfter = await utils.getTotalTokens()
      let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
      let DTBalAfter = await utils.getTokenBalance(DT.address)
      let tsProjBalAfter = await project.getUserStakedTokens(tokenStaker1, projAddrT)

      // checks
      assert.equal(totalTokensBefore + reward, totalTokensAfter, 'incorrect token reward minted')
      assert.equal(tsBalBefore + reward + refund, tsBalAfter, 'incorrect token staker balance post-refund')
      assert.equal(DTBalAfter + refund, DTBalBefore, 'incorrect token staker balance post-refund')
      assert.equal(tsProjBalBefore, refund, 'incorrect refund calculation')
      assert.equal(tsProjBalAfter, 0, 'staker should no longer have any tokens staked on the project')
    })

    it('token staker can ask for refund from RR complete project', async () => {
      // take stock of variables before
      let totalTokensBefore = await utils.getTotalTokens()
      let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
      let DTBalBefore = await utils.getTokenBalance(DT.address)
      let tsProjBalBefore = await project.getUserStakedTokens(tokenStaker1, projAddrR)
      let passAmount = await project.getPassAmount(projAddrR)

      // calculate refund & reward
      let refund = Math.floor((tsBalBefore * passAmount) / 100)
      let reward = Math.floor(refund / 20)
      console.log(refund, passAmount.toNumber(), tsBalBefore, reward)

      // refund staker
      await TR.refundStaker(projAddrR, {from: tokenStaker1})

      // take stock of variables after
      let totalTokensAfter = await utils.getTotalTokens()
      let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
      let DTBalAfter = await utils.getTokenBalance(DT.address)
      let tsProjBalAfter = await project.getUserStakedTokens(tokenStaker1, projAddrR)

      // checks
      assert.equal(totalTokensBefore + reward, totalTokensAfter, 'incorrect token reward minted')
      assert.equal(tsBalBefore + reward + refund, tsBalAfter, 'incorrect token staker balance post-refund')
      assert.equal(DTBalAfter + refund, DTBalBefore, 'incorrect token staker balance post-refund')
      assert.equal(tsProjBalBefore, refund, 'incorrect refund calculation')
      assert.equal(tsProjBalAfter, 0, 'staker should no longer have any tokens staked on the project')
    })
  })
})
