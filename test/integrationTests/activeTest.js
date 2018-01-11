// Test functions in open state of a project
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
const keccakHashes = require('../utils/KeccakHashes')
web3.eth = Promise.promisifyAll(web3.eth)

contract('Active State', (accounts) => {
  let TR, PR, DT, PROJ, RR
  let errorThrown
  // proposer only necessary in the
  let proposer = accounts[0]
  let staker1 = accounts[2]
  let staker2 = accounts[3]
  let staker3 = accounts[4]
  let nonStaker = accounts[5]
  let worker1 = accounts[6]
  let worker2 = accounts[7]

  let tokens = 10000
  let stakingPeriod = 20000000000     // 10/11/2603 @ 11:33am (UTC)
  let projectCost = web3.toWei(0.25, 'ether')
  let proposeProportion = 20
  // let proposeReward = 100

  let proposerTokenCost
  let proposerBalance, stakerBalance1, stakerBalance2, stakerBalance3

  let totalTokenSupply, totalFreeSupply
  let currentPrice

  let projectAddress
  let tx

  let workerBalance1, workerBalance2

  // format of task hash is 'taskdescription;weivalue;reputationvalue,secondtask;secondweival;secondrepval,...'
  let data = 'install;100000;1,install a supernode;200000;1'

  function hashTasksForAddition (data) {
    let hashList = hashListForSubmission(data)
    hashList.map(arr => arr.slice(2))
    let numArgs = hashList.length
    let args = 'bytes32'.concat(' bytes32'.repeat(numArgs - 1)).split(' ')
    let taskHash = keccakHashes(args, hashList)
    // console.log('0x' + taskHash)
    return '0x' + taskHash
  }

  function hashListForSubmission (data) {
    let tasks = data.split(',')     // split tasks up
    let taskHashArray = []
    let args = ['string', 'uint', 'uint']
    // let args = ['bytes32', 'bytes32', 'bytes32']
    for (var i = 0; i < tasks.length; i++) {
      let thisTask = tasks[i].split(';')  // split each task into elements
      taskHashArray.push('0x' + keccakHashes(args, thisTask))
    }
    // console.log(taskHashArray)
    return taskHashArray
  }

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
    totalFreeSupply = await DT.totalFreeSupply()
    assert.equal(4 * tokens, proposerBalance.toNumber() + stakerBalance1.toNumber() + stakerBalance2.toNumber() + stakerBalance3.toNumber(), 'proposer or stakers did not successfully mint tokens')
    assert.equal(4 * tokens, totalTokenSupply, 'total supply did not update correctly')
    assert.equal(4 * tokens, totalFreeSupply, 'total free supply did not update correctly')

    // propose a project
    currentPrice = await DT.currentPrice()              // put this before propose project because current price changes slightly (rounding errors)
    tx = await TR.proposeProject(projectCost, stakingPeriod, {from: proposer})
    let log = tx.logs[0].args
    projectAddress = log.projectAddress.toString()
    PROJ = await Project.at(projectAddress)
    proposerTokenCost = Math.floor(Math.floor(projectCost / currentPrice) / proposeProportion) + 1
    proposerBalance = await DT.balanceOf(proposer)
    totalFreeSupply = await DT.totalFreeSupply()
    assert.equal(4 * tokens - proposerTokenCost, totalFreeSupply, 'total free supply did not update correctly')
    assert.equal(4 * tokens, totalTokenSupply, 'total supply shouldn\'t have updated')
    assert.equal(proposerBalance, tokens - proposerTokenCost, 'DT did not set aside appropriate proportion to escrow')

    // fully stake the project with all three stakers
    let requiredTokens = Math.ceil(projectCost / await DT.currentPrice())
    await TR.stakeTokens(projectAddress, Math.floor(requiredTokens / 3), {from: staker1})
    await TR.stakeTokens(projectAddress, Math.floor(requiredTokens / 3), {from: staker2})
    let weiRemaining = projectCost - await PROJ.weiBal()
    requiredTokens = Math.ceil(weiRemaining / await DT.currentPrice())
    await TR.stakeTokens(projectAddress, requiredTokens, {from: staker3})

    // check that project is fully staked, change to open
    let state = await PROJ.state()
    assert.equal(state.toNumber(), 2, 'project should be in open state as it is now fully staked')
    let openProjectsBefore = await PR.openProjects.call(projectAddress)
    await PR.addTaskHash(projectAddress, hashTasksForAddition(data), {from: staker1})
    let openProjectsAfter = await PR.openProjects.call(projectAddress)
    assert.equal(openProjectsAfter[0], hashTasksForAddition(data), 'first hash didn\'t update')
    assert.equal(openProjectsAfter[1].toNumber(), openProjectsBefore[1].toNumber(), 'logged nonexistant conflict')
    assert.equal(openProjectsAfter[2].toNumber(), openProjectsBefore[2].toNumber() + 1, 'didn\'t log submission')
    await evmIncreaseTime(7 * 25 * 60 * 60)
    await PR.checkActive(projectAddress)
    state = await PROJ.state()
    assert.equal(state.toNumber(), 4, 'project should have entered active period')

    // submit task hash list
    let taskHash = await PR.openProjects.call(projectAddress)
    // console.log('task hash from PR', taskHash[0])
    // console.log('task hash from test', hashTasksForAddition(data))
    // console.log('task list from test', hashListForSubmission(data))
    assert.equal(taskHash[0], hashTasksForAddition(data), 'incorrect task list stored')
    await PR.submitHashList(projectAddress, hashListForSubmission(data), {from: staker2})
    let firstTask = await PR.projectTaskList.call(projectAddress, 0)
    // console.log('first task from contract', firstTask)
    assert.equal(firstTask, hashListForSubmission(data)[0], 'incorrect first task hash stored')

    // register workers and check reputation balances
    await RR.register({from: worker1})
    await RR.register({from: worker2})
    workerBalance1 = await RR.balances.call(worker1)
    workerBalance2 = await RR.balances.call(worker2)
    // console.log(workerBalance1.toNumber())
    // console.log(workerBalance2.toNumber())
    assert.equal(workerBalance1.toNumber(), 1, 'worker 1 does not have the correct amount of reputation')
    assert.equal(workerBalance2.toNumber(), 1, 'worker 2 does not have the correct amount of reputation')

  })

  it('worker can claim a task', async function () {
    let repPrice = 1
    let index = 0
    await RR.claimTask(projectAddress, index, 'install', 100000, repPrice, {from: worker1})
    let workerBalance1New = await RR.balances.call(worker1)
    // console.log(workerBalance1New.toNumber())
    assert.equal(workerBalance1New, workerBalance1 - repPrice, 'worker 1 reputation balance not decremented appropriately')
    let taskHash = hashListForSubmission(data)[0]
    let reward = await PROJ.taskRewards.call(taskHash)
    assert.equal(reward[0].toNumber(), 100000, 'wei reward stored incorrectly')
    assert.equal(reward[1].toNumber(), repPrice, 'reputation cost stored incorrectly')
    assert.equal(reward[2], worker1, 'incorrect worker stored')
    // console.log(reward)
  })

  // don't let this worker claim another task
  // don't let other worker claim this task
  // make another task costing more than 1 reputation point

})
