// Test functions in staked state of a project
// Before, fund a user with tokens and have them propose and fully stake 2 projects
var assert = require('assert')
const TokenRegistry = artifacts.require('TokenRegistry')
const ReputationRegistry = artifacts.require('ReputationRegistry')
const DistributeToken = artifacts.require('DistributeToken')
const ProjectRegistry = artifacts.require('ProjectRegistry')
const Project = artifacts.require('Project')
const Promise = require('bluebird')
const assertThrown = require('../utils/assertThrown')
const evmIncreaseTime = require('../utils/evmIncreaseTime')
const {hashTasks, hashTasksArray} = require('../utils/KeccakHashes')
web3.eth = Promise.promisifyAll(web3.eth)

contract('Active State', (accounts) => {
  let TR, PR, DT, PROJ, RR
  let errorThrown
  // proposer only necessary in the
  let proposer = accounts[0]
  let staker1 = accounts[2]
  let staker2 = accounts[3]
  let staker3 = accounts[4]
  let worker1 = accounts[5]
  let worker2 = accounts[6]
  let worker3 = accounts[7]
  let incorrectProjectAddress = accounts[8]

  let tokens = 10000
  let stakingPeriod = 20000000000     // 10/11/2603 @ 11:33am (UTC)
  let projectCost = web3.toWei(0.25, 'ether')
  let proposeProportion = 20
  let ipfsHash = 'ipfsHash'
  // let proposeReward = 100

  let proposerTokenCost
  let proposerBalance, stakerBalance1, stakerBalance2, stakerBalance3

  let totalTokenSupply
  let totalReputation, totalFreeReputation
  let currentPrice

  let projectAddress
  let tx

  let workerBalance1, workerBalance2, workerBalance3

  // format of task hash is 'taskdescription;weivalue;reputationvalue,secondtask;secondweival;secondrepval,...'
  // let data = 'install a super long string thats most definitely longer than bytes32 I really hope this works yup yup yup;100000;1,install a supernode;200000;1,break the internet;100;2,save the world;100;1'
  let data = [{weiReward: 10000000000000000, description: 'some random task list'}]


  before(async function () {
    // define variables to hold deployed contracts
    TR = await TokenRegistry.deployed()
    DT = await DistributeToken.deployed()
    PR = await ProjectRegistry.deployed()
    RR = await ReputationRegistry.deployed()

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

    // fully stake the project with all three stakers
    let requiredTokens = Math.ceil(projectCost / await DT.currentPrice())
    await TR.stakeTokens(projectAddress, Math.floor(requiredTokens / 3), {from: staker1})
    await TR.stakeTokens(projectAddress, Math.floor(requiredTokens / 3), {from: staker2})
    let weiRemaining = projectCost - await PROJ.weiBal()
    requiredTokens = Math.ceil(weiRemaining / await DT.currentPrice())
    await TR.stakeTokens(projectAddress, requiredTokens, {from: staker3})

    // check that project is fully staked, change to staked
    let state = await PROJ.state()
    assert.equal(state.toNumber(), 2, 'project should be in staked state as it is now fully staked')
    let stakedProjectsBefore = await PR.stakedProjects.call(projectAddress)
    await PR.addTaskHash(projectAddress, hashTasksArray(data), {from: staker1})
    let stakedProjectsAfter = await PR.stakedProjects.call(projectAddress)
    assert.equal(stakedProjectsAfter, hashTasksArray(data), 'first hash didn\'t update')
    // assert.equal(stakedProjectsAfter[1].toNumber(), stakedProjectsBefore[1].toNumber(), 'logged nonexistant conflict')
    // assert.equal(stakedProjectsAfter[2].toNumber(), stakedProjectsBefore[2].toNumber() + 1, 'didn\'t log submission')
    await evmIncreaseTime(7 * 25 * 60 * 60)
    await PR.checkActive(projectAddress)
    state = await PROJ.state()
    assert.equal(state.toNumber(), 3, 'project should have entered active period')

    // submit task hash list
    let taskHash = await PR.stakedProjects.call(projectAddress)
    // console.log('task hash from PR', taskHash[0])
    // console.log('task hash from test', hashTasksArray(data))
    // console.log('task list from test', hashTasks(data))
    assert.equal(taskHash, hashTasksArray(data), 'incorrect task list stored')
    await PR.submitHashList(projectAddress, hashTasks(data), {from: staker2})
    // let firstTask = await PR.projectTaskList.call(projectAddress, 0)
    // assert.equal(firstTask, hashTasks(data)[0], 'incorrect first task hash stored')

    // register workers and check reputation balances
    await RR.register({from: worker1})
    await RR.register({from: worker2})
    await RR.register({from: worker3})
    workerBalance1 = await RR.balances.call(worker1)
    workerBalance2 = await RR.balances.call(worker2)
    workerBalance3 = await RR.balances.call(worker3)
    assert.equal(workerBalance1.toNumber(), 10000, 'worker 1 does not have the correct amount of reputation')
    assert.equal(workerBalance2.toNumber(), 10000, 'worker 2 does not have the correct amount of reputation')
    assert.equal(workerBalance3.toNumber(), 10000, 'worker 3 does not have the correct amount of reputation')

    totalReputation = await RR.totalSupply()

    assert.equal(totalReputation, 30000, 'incorrect total reputation stored')
  })

  it('worker1 can claim a task', async function () {
    let repPrice = 1
    let weiReward = 100000
    let index = 0
    await RR.claimTask(projectAddress, index, 'install a super long string thats most definitely longer than bytes32 I really hope this works yup yup yup', 90, {from: worker1})
    let workerBalance1New = await RR.balances.call(worker1)
    // console.log(workerBalance1New.toNumber())
    assert.equal(workerBalance1New, workerBalance1 - repPrice, 'worker 1 reputation balance not decremented appropriately')
    let taskHash = hashTasks(data)[index]
    let reward = await PROJ.taskRewards.call(taskHash)
    assert.equal(reward[0].toNumber(), weiReward, 'wei reward stored incorrectly')
    assert.equal(reward[1].toNumber(), repPrice, 'reputation cost stored incorrectly')
    assert.equal(reward[2], worker1, 'incorrect worker stored')
    totalReputation = await RR.totalSupply()
    totalFreeReputation = await RR.totalFreeSupply()
    assert.equal(totalReputation, 3, 'incorrect total reputation stored')
    assert.equal(totalFreeReputation, 2, 'incorrect free reputation stored')
    // console.log(reward)
  })

  it('worker1 can\'t claim another task', async function () {
    errorThrown = false
    try {
      let repPrice = 1
      let weiReward = 2000000
      let index = 1
      await RR.claimTask(projectAddress, index, 'install a supernode', weiReward, repPrice, {from: worker1})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('worker2 can\'t claim worker1\'s task', async function () {
    errorThrown = false
    try {
      let repPrice = 1
      let weiReward = 100000
      let index = 0
      await RR.claimTask(projectAddress, index, 'install a super long string thats most definitely longer than bytes32 I really hope this works yup yup yup', weiReward, repPrice, {from: worker2})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('worker2 can\'t claim a task if incorrect reputation price is provided', async function () {
    errorThrown = false
    try {
      let repPrice = 0
      let weiReward = 2000000
      let index = 1
      await RR.claimTask(projectAddress, index, 'install a supernode', weiReward, repPrice, {from: worker2})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('worker2 can\'t claim a task if incorrect wei reward is provided', async function () {
    errorThrown = false
    try {
      let repPrice = 1
      let weiReward = 20000000
      let index = 1
      await RR.claimTask(projectAddress, index, 'install a supernode', weiReward, repPrice, {from: worker2})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('worker2 can\'t claim a task if incorrect task description is provided', async function () {
    errorThrown = false
    try {
      let repPrice = 1
      let weiReward = 2000000
      let index = 1
      await RR.claimTask(projectAddress, index, 'install a supergoobi', weiReward, repPrice, {from: worker2})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('worker2 can\'t claim a task if incorrect task index is provided', async function () {
    errorThrown = false
    try {
      let repPrice = 1
      let weiReward = 2000000
      let index = 100
      await RR.claimTask(projectAddress, index, 'install a supernode', weiReward, repPrice, {from: worker2})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('worker2 can\'t claim a task if incorrect project address is provided', async function () {
    errorThrown = false
    try {
      let repPrice = 1
      let weiReward = 2000000
      let index = 1
      await RR.claimTask(incorrectProjectAddress, index, 'install a supernode', weiReward, repPrice, {from: worker2})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('worker2 can\'t claim a task costing more reputation points than she has', async function () {
    errorThrown = false
    try {
      let repPrice = 2
      let weiReward = 100
      let index = 2
      await RR.claimTask(projectAddress, index, 'break the internet', weiReward, repPrice, {from: worker2})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('worker2 can claim another task', async function () {
    let repPrice = 1
    let weiReward = 200000
    let index = 1
    await RR.claimTask(projectAddress, index, 'install a supernode', 90, {from: worker2})
    let workerBalance2New = await RR.balances.call(worker2)
    // console.log(workerBalance1New.toNumber())
    assert.equal(workerBalance2New, workerBalance2 - repPrice, 'worker 1 reputation balance not decremented appropriately')
    let taskHash = hashTasks(data)[index]
    let reward = await PROJ.taskRewards.call(taskHash)
    assert.equal(reward[0].toNumber(), weiReward, 'wei reward stored incorrectly')
    assert.equal(reward[1].toNumber(), repPrice, 'reputation cost stored incorrectly')
    assert.equal(reward[2], worker2, 'incorrect worker stored')
    // console.log(reward)
    totalReputation = await RR.totalSupply()
    totalFreeReputation = await RR.totalFreeSupply()
    assert.equal(totalReputation, 3, 'incorrect total reputation stored')
    assert.equal(totalFreeReputation, 1, 'incorrect free reputation stored')
  })

  it('active project becomes validating project when active period is up', async function () {
    let state = await PROJ.state()
    assert.equal(state.toNumber(), 3, 'project should be in active state')
    await evmIncreaseTime(7 * 25 * 60 * 60)
    await PR.checkValidate(projectAddress)
    state = await PROJ.state()
    assert.equal(state.toNumber(), 4, 'project should have entered validating state')
  })

  it('worker3 can\'t claim a task once the active period is up', async function () {
    errorThrown = false
    try {
      let repPrice = 1
      let weiReward = 100
      let index = 3
      await RR.claimTask(projectAddress, index, 'save the world', weiReward, repPrice, {from: worker3})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

})
