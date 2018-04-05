// Test functions in open state of a project
// Before, fund a user with tokens and have them propose and fully stake 2 projects
var assert = require('assert')
const TokenRegistry = artifacts.require('TokenRegistry')
const DistributeToken = artifacts.require('DistributeToken')
const ProjectRegistry = artifacts.require('ProjectRegistry')
const Project = artifacts.require('Project')
const Promise = require('bluebird')
const assertThrown = require('../utils/assertThrown')
const evmIncreaseTime = require('../utils/evmIncreaseTime')
const {hashTasks, hashTasksArray} = require('../utils/KeccakHashes')

web3.eth = Promise.promisifyAll(web3.eth)

contract('Staked State |', (accounts) => {
  let TR
  let PR
  let DT
  let PROJ, PROJ2, PROJ3
  let errorThrown
  // proposer only necessary in the
  let proposer = accounts[0]
  let staker1 = accounts[2]
  let staker2 = accounts[3]
  let staker3 = accounts[4]
  let nonStaker = accounts[5]

  let tokens = 50000
  let stakingPeriod = 20000000000     // 10/11/2603 @ 11:33am (UTC)
  let projectCost = web3.toWei(1, 'ether')
  let projectCost2 = web3.toWei(0.5, 'ether')
  let proposeProportion = 20
  let ipfsHash = 'ipfsHash'
  // let proposeReward = 100

  let proposerTokenCost
  let proposerBalance, stakerBalance1, stakerBalance2, stakerBalance3

  let totalTokenSupply
  let currentPrice

  let projectAddress, projectAddress2, projectAddress3
  let tx

  // each word is a task in this case
  let data1 = [{weiReward: 10000000000000000, description: 'some random task list'}]
  let data2 = [{weiReward: 20000000000000000, description: 'some other random task list'}]
  let data3 = {weiReward: 30000000000000000, description: 'some totally different task list'}

  before(async function () {
    // define variables to hold deployed contracts
    TR = await TokenRegistry.deployed()
    DT = await DistributeToken.deployed()
    PR = await ProjectRegistry.deployed()

    // mint 10000 tokens for proposer & each staker
    let mintingCost = await DT.weiRequired(tokens, {from: proposer})
    await DT.mint(tokens, {from: proposer, value: mintingCost})
    mintingCost = await DT.weiRequired(tokens, {from: staker1})
    await DT.mint(tokens, {from: staker1, value: mintingCost})
    mintingCost = await DT.weiRequired(tokens, {from: staker2})
    await DT.mint(tokens, {from: staker2, value: mintingCost})
    mintingCost = await DT.weiRequired(tokens, {from: staker3})
    await DT.mint(tokens, {from: staker3, value: mintingCost})

    proposerBalance = await DT.balanceOf(proposer)
    stakerBalance1 = await DT.balanceOf(staker1)
    stakerBalance2 = await DT.balanceOf(staker2)
    stakerBalance3 = await DT.balanceOf(staker3)
    totalTokenSupply = await DT.totalSupply()
    assert.equal(4 * tokens, proposerBalance.toNumber() + stakerBalance1.toNumber() + stakerBalance2.toNumber() + stakerBalance3.toNumber(), 'proposer or stakers did not successfully mint tokens')
    assert.equal(4 * tokens, totalTokenSupply, 'total supply did not update correctly')

    // propose a project
    currentPrice = await DT.currentPrice()              // put this before propose project because current price changes slightly (rounding errors)
    tx = await TR.proposeProject(projectCost, stakingPeriod, ipfsHash, {from: proposer})
    let log = tx.logs[0].args
    projectAddress = log.projectAddress.toString()
    PROJ = await Project.at(projectAddress)
    proposerTokenCost = Math.floor(Math.floor(projectCost / currentPrice) / proposeProportion)
    proposerBalance = await DT.balanceOf(proposer)
    assert.equal(4 * tokens, totalTokenSupply, 'total supply shouldn\'t have updated')
    assert.equal(proposerBalance, tokens - proposerTokenCost, 'DT did not set aside appropriate proportion to escrow')

    // fully stake the project
    let requiredTokens = Math.ceil(projectCost / await DT.currentPrice())
    await TR.stakeTokens(projectAddress, Math.floor(requiredTokens / 3), {from: staker1})
    await TR.stakeTokens(projectAddress, Math.floor(requiredTokens / 3), {from: staker2})
    let weiRemaining = projectCost - await PROJ.weiBal()
    requiredTokens = Math.ceil(weiRemaining / await DT.currentPrice())
    await TR.stakeTokens(projectAddress, requiredTokens, {from: staker3})

    // check that project is fully staked
    let state = await PROJ.state()
    assert.equal(state.toNumber(), 2, 'project should be in open state as it is now fully staked')

    // propose another project
    currentPrice = await DT.currentPrice()              // put this before propose project because current price changes slightly (rounding errors)
    tx = await TR.proposeProject(projectCost2, stakingPeriod, ipfsHash, {from: proposer})
    log = tx.logs[0].args
    projectAddress2 = log.projectAddress.toString()
    PROJ2 = await Project.at(projectAddress2)

    // fully stake the project
    requiredTokens = Math.ceil(projectCost2 / await DT.currentPrice())
    await TR.stakeTokens(projectAddress2, Math.floor(requiredTokens / 3), {from: staker1})
    await TR.stakeTokens(projectAddress2, Math.floor(requiredTokens / 3), {from: staker2})
    weiRemaining = projectCost2 - await PROJ2.weiBal()
    requiredTokens = Math.ceil(weiRemaining / await DT.currentPrice())
    await TR.stakeTokens(projectAddress2, requiredTokens, {from: staker3})

    await PR.addTaskHash(projectAddress2, hashTasksArray(data2, projectCost), {from: staker1})
    await PR.addTaskHash(projectAddress2, hashTasksArray(data2, projectCost), {from: staker2})

    // propose and stake project3 to fail
    tx = await TR.proposeProject(1, stakingPeriod, ipfsHash, {from: proposer})
    log = tx.logs[0].args
    projectAddress3 = log.projectAddress.toString()
    PROJ3 = await Project.at(projectAddress3)
    requiredTokens = Math.ceil(1 / await DT.currentPrice())
    await TR.stakeTokens(projectAddress3, requiredTokens, {from: staker1})
  })

  it('non-staker can\'t submit a task hash', async function () {
    errorThrown = false
    try {
      await PR.addTaskHash(projectAddress, hashTasksArray(data1), {from: nonStaker})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('token staker can submit a task hash', async function () {
    let stakedProjectsBefore = await PR.stakedProjects.call(projectAddress)
    await PR.addTaskHash(projectAddress, hashTasksArray(data1), {from: staker1})
    let stakedProjectsAfter = await PR.stakedProjects.call(projectAddress)
    assert.equal(stakedProjectsAfter, hashTasksArray(data1), 'first hash didn\'t update')
    // assert.equal(stakedProjectsAfter[1].toNumber(), stakedProjectsBefore[1].toNumber(), 'logged nonexistant conflict')
    // assert.equal(stakedProjectsAfter[2].toNumber(), stakedProjectsBefore[2].toNumber() + 1, 'didn\'t log submission')
  })

  it('token staker\'s submission logs correct weighting', async function () {

  })

  it('reputation staker can submit a task hash', async function () {
  })

  it('reputation staker\'s submission logs correct weighting', async function () {

  })

  it('another token staker can submit a different task hash', async function () {
    let stakedProjectsBefore = await PR.stakedProjects.call(projectAddress)
    await PR.addTaskHash(projectAddress, hashTasksArray(data2), {from: staker2})
    let stakedProjectsAfter = await PR.stakedProjects.call(projectAddress)
    assert.equal(stakedProjectsAfter, hashTasksArray(data1), 'first hash shouldn\'t have updated')
    // assert.equal(stakedProjectsAfter[1].toNumber(), 1, 'didn\'t log conflict')
    // assert.equal(stakedProjectsAfter[2].toNumber(), stakedProjectsBefore[2].toNumber() + 1, 'didn\'t log submission')
  })

  it('another reputation staker can submit a different task hash', async function () {
  })


  it('another token staker can submit the same task hash', async function () {
    let stakedProjectsBefore = await PR.stakedProjects.call(projectAddress)
    await PR.addTaskHash(projectAddress, hashTasksArray(data1), {from: staker1})
    let stakedProjectsAfter = await PR.stakedProjects.call(projectAddress)
    assert.equal(stakedProjectsAfter, hashTasksArray(data1), 'first hash shouldn\'t have updated')
    // assert.equal(stakedProjectsAfter[1].toNumber(), 1, 'conflict should still exist')
    // assert.equal(stakedProjectsAfter[2].toNumber(), stakedProjectsBefore[2].toNumber(), 'total submissions shouldn\'t update')
  })

  it('another reputation staker can submit the same task hash', async function () {
  })

  it('token staker can\'t submit hash list of staked project, even if correct', async function () {
    errorThrown = false
    try {
      await PR.submitHashList(projectAddress2, hashTasks(data2), {from: staker1})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('reputation staker can\'t submit hash list of staked project, even if correct', async function () {
  })

  it('token staker\'s resubmission overwrites their previous submission', async function () {

  })

  it('reputation staker\'s resubmission overwrites their previous submission', async function () {

  })

  it('project with any submissions becomes active', async function () {
    await evmIncreaseTime(7 * 25 * 60 * 60)
    await PR.checkActive(projectAddress2)
    let state = await PROJ2.state()
    assert.equal(state.toNumber(), 3, 'project should have entered active period')
  })


  it('project with no task hash submissions becomes failed', async function () {
    await evmIncreaseTime(7 * 25 * 60 * 60)
    await PR.checkActive(projectAddress2)
    let state = await PROJ2.state()
    assert.equal(state.toNumber(), 3, 'project should have entered active period')
  })

  // ///staker weights/// //
  // staker1 - 1332
  // staker2 - 1332
  // staker3 - 1333
  // let numSubmissions = await PR.getNumSubmissionsByWeight(projectAddress, topTaskHashBefore)
  // console.log('topTaskHash', topTaskHashBefore)
  // console.log('numSubmissionsByWeight', numSubmissions)
  // numSubmissions = await PR.getNumSubmissionsByWeight(projectAddress, topTaskHashAfter)
  // console.log('topTaskHashAfter', topTaskHashAfter)
  // console.log('numSubmissionsByWeightAfter', numSubmissions)

  // may need to do following 3 tests 3x - token staker w/token staker, token staker w/rep staker, rep staker w/rep staker
  it('staker with less weight with a different task hash doesn\'t change top task hash', async function () {
    let topTaskHashBefore = await PR.disputedProjects.call(projectAddress)
    await PR.addTaskHash(projectAddress, hashTasksForAddition(data2), {from: staker2})
    let topTaskHashAfter = await PR.disputedProjects.call(projectAddress)
    let state = await PROJ.state()
    assert.equal(topTaskHashAfter, hashTasksForAddition(data1), 'top hash didn\'t update')
    assert.equal(topTaskHashBefore, topTaskHashAfter, 'top hash shouldn\'t have updated')
    assert.equal(state.toNumber(), 3, 'project shouldn\'t have exited the dispute period')
  })

 it('staker with same weight with a different task hash doesn\'t change top task hash', async function () {
   let topTaskHashBefore = await PR.disputedProjects.call(projectAddress)
   await PR.addTaskHash(projectAddress, hashTasksForAddition(data2), {from: staker2})
   let topTaskHashAfter = await PR.disputedProjects.call(projectAddress)
   let state = await PROJ.state()
   assert.equal(topTaskHashAfter, hashTasksForAddition(data1), 'top hash didn\'t update')
   assert.equal(topTaskHashBefore, topTaskHashAfter, 'top hash shouldn\'t have updated')
   assert.equal(state.toNumber(), 3, 'project shouldn\'t have exited the dispute period')
 })

 it('staker with larger weight with a different task hash changes top task hash', async function () {
   let topTaskHashBefore = await PR.disputedProjects.call(projectAddress)
   await PR.addTaskHash(projectAddress, hashTasksForAddition(data3), {from: staker3})
   let topTaskHashAfter = await PR.disputedProjects.call(projectAddress)
   let state = await PROJ.state()
   assert.equal(topTaskHashAfter, hashTasksForAddition(data3), 'top hash didn\'t update')
   assert.equal(topTaskHashBefore, hashTasksForAddition(data1), 'top hash shouldn\'t have updated')
   assert.equal(state.toNumber(), 3, 'project shouldn\'t have exited the dispute period')
 })

 it('non-staker can\'t submit task hash staked project', async function () {
   errorThrown = false
   try {
     await PR.addTaskHash(projectAddress, hashTasksForAddition(data1), {from: nonStaker})
   } catch (e) {
     errorThrown = true
   }
   assertThrown(errorThrown, 'An error should have been thrown')
 })

 it('staked project with no submissions becomes failed', async function () {
   let state = await PROJ3.state()
   assert.equal(state.toNumber(), 2, 'project should be in open state')
   await evmIncreaseTime(7 * 25 * 60 * 60)
   await PR.checkActive(projectAddress3)
   state = await PROJ3.state()
   assert.equal(state.toNumber(), 7, 'project should have entered dispute period')
 })
})
