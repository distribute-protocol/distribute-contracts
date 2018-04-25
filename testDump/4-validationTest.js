/* eslint-env mocha */
/* global assert contract */

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
const evmIncreaseTime = require('../utils/evmIncreaseTime')
const keccakHashes = require('../utils/keccakHashes')
const taskDetails = require('../utils/taskDetails')

contract('Active State', (accounts) => {
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
    // define variables to hold deployed contracts
    TR = await TokenRegistry.deployed()
    DT = await DistributeToken.deployed()
    PR = await ProjectRegistry.deployed()
    RR = await ReputationRegistry.deployed()

    before(async function () {
      // get contract
      await projObj.contracts.setContracts()
      TR = projObj.contracts.TR
      RR = projObj.contracts.RR
      PR = projObj.contracts.PR

      // get active projects
      // moves ganache forward 1 more week
      projArray = await returnProject.active(projectCost, stakingPeriod + (fastForwards * 604800), ipfsHash, 1)
      projAddrT = projArray[0][0]
      projAddrR = projArray[0][1]
    })

    // mint 10000 tokens for proposer, stakers, and token holder
    let mintingCost = await DT.weiRequired(tokens, {from: proposer})
    await DT.mint(tokens, {from: proposer, value: mintingCost})
    mintingCost = await DT.weiRequired(tokens, {from: staker1})
    await DT.mint(tokens, {from: staker1, value: mintingCost})
    mintingCost = await DT.weiRequired(tokens, {from: staker2})
    await DT.mint(tokens, {from: staker2, value: mintingCost})
    mintingCost = await DT.weiRequired(tokens, {from: tokenHolder})
    await DT.mint(tokens, {from: tokenHolder, value: mintingCost})
    proposerBalance = await DT.balanceOf(proposer)
    stakerBalance1 = await DT.balanceOf(staker1)
    stakerBalance2 = await DT.balanceOf(staker2)
    tokenHolderBalance = await DT.balanceOf(tokenHolder)
    totalTokenSupply = await DT.totalSupply()
    totalFreeSupply = await DT.totalFreeSupply()
    assert.equal(4 * tokens, proposerBalance.toNumber() + stakerBalance1.toNumber() + stakerBalance2.toNumber() + tokenHolderBalance.toNumber(), 'proposer or stakers did not successfully mint tokens')
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
    let totalRequiredTokens = Math.ceil(projectCost / await DT.currentPrice())
    await TR.stakeTokens(projectAddress, Math.floor(totalRequiredTokens / 2), {from: staker1})
    let weiRemaining = projectCost - await PROJ.weiBal()
    let requiredTokens = Math.ceil(weiRemaining / await DT.currentPrice())
    await TR.stakeTokens(projectAddress, requiredTokens, {from: staker2})
    totalFreeSupply = await DT.totalFreeSupply()
    assert.equal(4 * tokens - proposerTokenCost - totalRequiredTokens, totalFreeSupply, 'total free supply did not update correctly')

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

    console.log('MADE IT HERE')

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
    await RR.register({from: worker3})
    workerBalance1 = await RR.balances.call(worker1)
    workerBalance2 = await RR.balances.call(worker2)
    workerBalance3 = await RR.balances.call(worker3)
    // console.log(workerBalance1.toNumber())
    // console.log(workerBalance2.toNumber())
    assert.equal(workerBalance1.toNumber(), 1, 'worker 1 does not have the correct amount of reputation')
    assert.equal(workerBalance2.toNumber(), 1, 'worker 2 does not have the correct amount of reputation')
    assert.equal(workerBalance3.toNumber(), 1, 'worker 3 does not have the correct amount of reputation')
    totalReputation = await RR.totalSupply.call()
    totalFreeReputation = await RR.totalFreeSupply.call()
    assert.equal(totalReputation, 3, 'incorrect total reputation stored')
    assert.equal(totalFreeReputation, 3, 'incorrect free reputation stored')

    // worker1 claims task 0
    let repPrice = 1
    let weiReward = 100000
    let index = 0
    await RR.claimTask(projectAddress, index, 'install a super long string thats most definitely longer than bytes32 I really hope this works yup yup yup', weiReward, repPrice, {from: worker1})
    let workerBalance1New = await RR.balances.call(worker1)
    // console.log(workerBalance1New.toNumber())
    assert.equal(workerBalance1New, workerBalance1 - repPrice, 'worker 1 reputation balance not decremented appropriately')
    let taskHash1 = hashListForSubmission(data)[index]
    let reward = await PROJ.taskRewards.call(taskHash1)
    assert.equal(reward[0].toNumber(), weiReward, 'wei reward stored incorrectly')
    assert.equal(reward[1].toNumber(), repPrice, 'reputation cost stored incorrectly')
    assert.equal(reward[2], worker1, 'incorrect worker stored')
    totalReputation = await RR.totalSupply.call()
    totalFreeReputation = await RR.totalFreeSupply.call()
    assert.equal(totalReputation, 3, 'incorrect total reputation stored')
    assert.equal(totalFreeReputation, 2, 'incorrect free reputation stored')

    // worker2 claims task 1
    // let data = 'install a super long string thats most definitely longer than bytes32 I really hope this works yup yup yup;100000;1,install a supernode;200000;1'
    repPrice = 1
    weiReward = 200000
    index = 1
    await RR.claimTask(projectAddress, index, 'install a supernode', weiReward, repPrice, {from: worker1})
    let workerBalance2New = await RR.balances.call(worker1)
    // console.log(workerBalance1New.toNumber())
    assert.equal(workerBalance2New, workerBalance2 - repPrice, 'worker 2 reputation balance not decremented appropriately')
    let taskHash2 = hashListForSubmission(data)[index]
    reward = await PROJ.taskRewards.call(taskHash2)
    assert.equal(reward[0].toNumber(), weiReward, 'wei reward stored incorrectly')
    assert.equal(reward[1].toNumber(), repPrice, 'reputation cost stored incorrectly')
    assert.equal(reward[2], worker1, 'incorrect worker stored')
    totalReputation = await RR.totalSupply.call()
    totalFreeReputation = await RR.totalFreeSupply.call()
    assert.equal(totalReputation, 3, 'incorrect total reputation stored')
    assert.equal(totalFreeReputation, 1, 'incorrect free reputation stored')

    // check how much free reputation and tokens are available

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
