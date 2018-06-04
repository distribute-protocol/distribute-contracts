/* global artifacts web3 assert */

const TokenRegistry = artifacts.require('TokenRegistry')
const ReputationRegistry = artifacts.require('ReputationRegistry')
const DistributeToken = artifacts.require('DistributeToken')
const ProjectRegistry = artifacts.require('ProjectRegistry')
const ProjectLibrary = artifacts.require('ProjectLibrary')
const Project = artifacts.require('Project')
const Task = artifacts.require('Task')

const evmIncreaseTime = require('./evmIncreaseTime')
const keccakHashes = require('../utils/keccakHashes')
const taskDetails = require('../utils/taskDetails')
// const web3 = require('web3-utils')

module.exports = function projectHelper (accounts) {
  let obj = {}
  obj.user = {}
  obj.minting = {}
  obj.reputation = {}
  obj.time = {}
  obj.project = {}
  obj.contracts = {}
  obj.utils = {}
  obj.spoofed = {}
  obj.returnProject = {}
  obj.returnProjectHelper = {}
  obj.task = {}

  // set up user identities
  // accounts[0] - no identity, default user for non-specified contract calls
  // accounts[1] - tokens
  // accounts[2] - both
  // accounts[3] - tokens
  // accounts[4] - rep
  // accounts[5] - rep
  // accounts[6] - rep
  // accounts[7] - rep
  // accounts[8] - nothing

  obj.user.tokenProposer = accounts[1]
  obj.user.repProposer = accounts[2]
  obj.user.notProposer = accounts[8]

  obj.user.tokenStaker1 = accounts[2]
  obj.user.tokenStaker2 = accounts[3]
  obj.user.repStaker1 = accounts[4]
  obj.user.repStaker2 = accounts[5]
  obj.user.notStaker = accounts[8]

  obj.user.worker1 = accounts[6]
  obj.user.worker2 = accounts[7]
  obj.user.notWorker = accounts[8]

  obj.user.validator1 = accounts[1]
  obj.user.validator2 = accounts[2]
  obj.user.notValidator = accounts[8]

  obj.user.repVoter = accounts[1]
  obj.user.repNoVoter = accounts[2]
  obj.user.tokenVoter = accounts[3]
  obj.user.tokenNoVoter = accounts[4]
  obj.user.notVoter = accounts[8]

  obj.user.notProject = accounts[8]

  // these will only be used in unit tests
  // make sure overlap is fine
  obj.spoofed.spoofedDT = accounts[9]
  obj.spoofed.spoofedTR = accounts[8]
  obj.spoofed.spoofedRR = accounts[7]
  obj.spoofed.spoofedPR = accounts[6]
  obj.spoofed.anyAddress = accounts[0]
  obj.spoofed.spoofedPLCRVoting = accounts[4]

  obj.spoofed.weiToReturn = 10000000000000000000

  // mutable minting details for each user
  obj.minting.tokensToMint = 10000
  obj.minting.tokensToBurn = 100

  // immutable registration reputation amount
  obj.reputation.registeredRep = 10000

  // mutable project details
  // note that now & stakingPeriod are absolute and don't reflect evmIncreaseTime() calls
  // this will be accounted for manually in each integration test and clearly denoted
  obj.project.now = Math.floor(new Date().getTime() / 1000) // in seconds
  obj.project.stakingPeriod = obj.project.now + 604800 // blockchain understands seconds                    // one week from now

  obj.project.expiredStakingPeriod = 10 // January 1st, 1970
  obj.project.projectCost = parseInt(web3.toWei(0.25, 'ether'))
  obj.project.ipfsHash = 'ipfsHashlalalalalalalalalalalalalalalalalalala' // length === 46
  obj.project.incorrectIpfsHash = 'whyiseveryspokeleadawhiteman' // length != 46

  // immutable project details
  obj.project.proposerTypeToken = 1
  obj.project.proposerTypeRep = 2

  // immutable project details
  obj.project.proposeProportion = 20
  obj.project.proposeReward = 100

  // contracts
  obj.contracts.setContracts = async function () {
    obj.contracts.TR = await TokenRegistry.deployed()
    obj.contracts.RR = await ReputationRegistry.deployed()
    obj.contracts.DT = await DistributeToken.deployed()
    obj.contracts.PR = await ProjectRegistry.deployed()
    obj.contracts.PL = await ProjectLibrary.deployed()
  }

  obj.contracts.setContract = function (type, contract) {
    obj.contracts[type] = contract
  }

  // helper functions
  obj.utils.mint = async function (_user, _numTokens, _weiVal) {
    if (_numTokens === undefined) { // use default minting amount
      _numTokens = obj.minting.tokensToMint
    }
    if (_weiVal === undefined) {
      let _weiVal = await obj.contracts.DT.weiRequired(_numTokens, {from: _user})
    }
    let mintingCost = await obj.contracts.DT.weiRequired(_numTokens, {from: _user})
    await obj.contracts.DT.mint(_numTokens, {from: _user, value: mintingCost})
  }

  obj.utils.sell = async function (_user, _numTokens, _weiVal) {
    if (_numTokens === undefined) { // use default minting amount
      _numTokens = await obj.utils.getTokenBalance(_user)
    }
    if (_weiVal === undefined) {
      let _weiVal = await obj.contracts.DT.weiRequired(_numTokens, {from: _user})
    }
    await obj.contracts.DT.sell(_numTokens, {from: _user})
  }

  obj.utils.register = async function (_user) {
    let bal = await obj.contracts.RR.balances(_user)
    let first = await obj.contracts.RR.first(_user)
    if (bal.toNumber() === 0 && first === false) {
      await obj.contracts.RR.register({from: _user})
    }
  }

  obj.utils.mintIfNecessary = async function (_user, _numTokens) {
    if (_numTokens === undefined) { // use default minting amount
      _numTokens = obj.minting.tokensToMint
    }
    let bal = await obj.utils.getTokenBalance(_user)
    if (_numTokens > bal) {
      obj.utils.mint(_user, _numTokens - bal)
    }
  }

  // getters
  obj.utils.getRepHolders = async function () {
    let repHolders = await obj.contracts.RR.totalUsers()
    return repHolders.toNumber()
  }

  obj.utils.getTokenBalance = async function (_user) {
    let bal = await obj.contracts.DT.balances(_user)
    return bal.toNumber()
  }

  obj.utils.getRepBalance = async function (_user, _unadulterated) {
    let bal = await obj.contracts.RR.balances(_user)
    if (_unadulterated === true) {
      return bal
    } else {
      return bal.toNumber()
    }
  }

  obj.utils.getTotalTokens = async function () {
    let total = await obj.contracts.DT.totalSupply()
    return total.toNumber()
  }

  obj.utils.getTotalRep = async function () {
    let total = await obj.contracts.RR.totalSupply()
    return total.toNumber()
  }

  obj.utils.getWeiPoolBal = async function (_unadulterated) {
    let weiBal = await obj.contracts.DT.weiBal()
    if (_unadulterated === true) {
      return weiBal
    } else {
      return weiBal.toNumber()
    }
  }

  obj.utils.getCurrentPrice = async function (_unadulterated) {
    let currPrice = await obj.contracts.DT.currentPrice()
    if (_unadulterated === true) {
      return currPrice
    } else {
      return currPrice.toNumber()
    }
  }

  obj.utils.calculateCurrentPrice = async function () { // will fail if totalSupply == 0
    let baseCost = await obj.utils.getBaseCost()
    let weiBal = await obj.utils.getWeiPoolBal()
    let totalSupply = await obj.utils.getTotalTokens()
    let price = Math.round(weiBal / totalSupply)
    if ((price < baseCost) ) {
      price = baseCost
    }
    return price
  }

  obj.utils.getBaseCost = async function () {
    let baseCost = await obj.contracts.DT.baseCost()
    return baseCost.toNumber()
  }

  obj.utils.getWeiRequired = async function (_tokens) {
    let weiReq = await obj.contracts.DT.weiRequired(_tokens)
    return weiReq.toNumber()
  }

  obj.utils.calculateWeiRequired = async function (_tokens) {
    let targPrice = await obj.utils.calculateTargetPrice(_tokens)
    return targPrice.times(_tokens).toNumber()
  }

  obj.utils.calculateTargetPrice = async function (_tokens) {
    let currPrice = await obj.utils.getCurrentPrice(true) // get big number version
    let totalSupply = await obj.utils.getTotalTokens()
    let newSupply = totalSupply + _tokens
    let weiReq = currPrice.times(1000 + Math.round(_tokens * 1000 / newSupply)) // emulate Divison.percent() precision of 3
    return weiReq.div(1000)
  }

  obj.utils.getBurnPrice = async function (_tokens) {
    let currPrice = await obj.utils.getCurrentPrice(true) // get big number version
    return currPrice.times(_tokens).toNumber()
  }

  obj.project.getState = async function (_projAddr) {
    let PROJ = await Project.at(_projAddr)
    let state = await PROJ.state()
    return state.toNumber()
  }

  obj.project.getWeiCost = async function (_projAddr, _unadulterated) {
    let PROJ = await Project.at(_projAddr)
    let weiCost = await PROJ.weiCost()
    if (_unadulterated === true) {
      return weiCost
    } else {
      return weiCost.toNumber()
    }
  }

  obj.project.getWeiBal = async function (_projAddr, _unadulterated) {
    let PROJ = await Project.at(_projAddr)
    let weiBal = await PROJ.weiBal()
    if (_unadulterated === true) {
      return weiBal
    } else {
      return weiBal.toNumber()
    }
  }

  obj.project.getWeiRemaining = async function (_projAddr) {
    let weiCost = await obj.project.getWeiCost(_projAddr)
    let weiBal = await obj.project.getWeiBal(_projAddr)
    return weiCost - weiBal
  }

  obj.project.getRepCost = async function (_projAddr, _unadulterated) {
    let PROJ = await Project.at(_projAddr)
    let repCost = await PROJ.reputationCost()
    if (_unadulterated === true) {
      return repCost
    } else {
      return repCost.toNumber()
    }
  }

  obj.project.calculateRequiredTokens = async function (_projAddr) {
    let weiRemaining = await obj.project.getWeiRemaining(_projAddr)
    let currentPrice = await obj.utils.getCurrentPrice()
    let requiredTokens = Math.ceil(weiRemaining / currentPrice)
    return requiredTokens
  }

  obj.project.getRequiredReputation = async function (_projAddr) {
    let PROJ = await Project.at(_projAddr)
    let requiredRep = await PROJ.reputationCost()
    return requiredRep.toNumber()
  }

  obj.project.getStakedTokens = async function (_projAddr) {
    let PROJ = await Project.at(_projAddr)
    let stakedTokens = await PROJ.tokensStaked()
    return stakedTokens.toNumber()
  }

  obj.project.getStakedRep = async function (_projAddr) {
    let PROJ = await Project.at(_projAddr)
    let stakedRep = await PROJ.reputationStaked()
    return stakedRep.toNumber()
  }

  obj.project.getUserStakedTokens = async function (_user, _projAddr) {
    let PROJ = await Project.at(_projAddr)
    let stakedTokens = await PROJ.tokenBalances(_user)
    return stakedTokens.toNumber()
  }

  obj.project.getUserStakedRep = async function (_user, _projAddr) {
    let PROJ = await Project.at(_projAddr)
    let stakedRep = await PROJ.reputationBalances(_user)
    return stakedRep.toNumber()
  }

  obj.project.getProposerStake = async function (_projAddr) {
    let PROJ = await Project.at(_projAddr)
    let propStake = await PROJ.proposerStake()
    return propStake.toNumber()
  }

  obj.project.getNextDeadline = async function (_projAddr) {
    let PROJ = await Project.at(_projAddr)
    let nextDeadline = await PROJ.nextDeadline()
    return nextDeadline.toNumber()
  }

  obj.project.getStakedStatePeriod = async function (_projAddr) {
    let PROJ = await Project.at(_projAddr)
    let stakedStatePeriod = await PROJ.stakedStatePeriod()
    return stakedStatePeriod.toNumber()
  }

  obj.project.calculateWeightOfAddress = async function (_user, _projAddr) {
    let stakedRep = await obj.project.getUserStakedRep(_user, _projAddr)
    let totalRep = await obj.project.getStakedRep(_projAddr)
    let repWeighting = Math.round(stakedRep * 100 / totalRep) // emulate Divison.percent() precision of 2

    let stakedTokens = await obj.project.getUserStakedTokens(_user, _projAddr)
    let totalTokens = await obj.project.getStakedTokens(_projAddr)
    let tokenWeighting = Math.round(stakedTokens * 100 / totalTokens) // emulate Divison.percent() precision of 2

    return Math.floor((repWeighting + tokenWeighting) / 2)
  }

  obj.project.getTasks = async function (_projAddr, _index) {
    let PROJ = await Project.at(_projAddr)
    let task = await PROJ.tasks(_index)
    return task
  }

  obj.project.getHashListSubmitted = async function (_projAddr) {
    let PROJ = await Project.at(_projAddr)
    let submitted = await PROJ.hashListSubmitted()
    return submitted
  }

  obj.project.calculateWeiVal = async function (_projAddr, _weighting) {
    let weiCost = await obj.project.getWeiCost(_projAddr, true)
    let weiVal = Math.round((weiCost.times(_weighting).div(100)))
    return weiVal
  }

  obj.project.calculateRepVal = async function (_projAddr, _weighting) {
    let repCost = await obj.project.getRepCost(_projAddr, true)
    let repVal = Math.round((repCost.times(_weighting).div(100)))
    return repVal
  }

  obj.project.getTaskCount = async function (_projAddr) {
    let PROJ = await Project.at(_projAddr)
    let taskCount = await PROJ.getTaskCount()
    return taskCount
  }

  obj.task.getTaskHash = async function (_taskAddr) {
    let TASK = await Task.at(_taskAddr)
    let taskHash = await TASK.taskHash()
    return taskHash
  }

  obj.task.getPRAddress = async function (_taskAddr) {
    let TASK = await Task.at(_taskAddr)
    let PRAddress = await TASK.projectRegistryAddress()
    return PRAddress
  }

  obj.task.getTRAddress = async function (_taskAddr) {
    let TASK = await Task.at(_taskAddr)
    let TRAddress = await TASK.tokenRegistryAddress()
    return TRAddress
  }

  obj.task.getRRAddress = async function (_taskAddr) {
    let TASK = await Task.at(_taskAddr)
    let RRAddress = await TASK.reputationRegistryAddress()
    return RRAddress
  }

  obj.task.getWeighting = async function (_projAddr, _index) {
    let taskAddr = await obj.project.getTasks(_projAddr, _index)
    let TASK = await Task.at(taskAddr)
    let weighting = await TASK.weighting()
    return weighting.toNumber()
  }

  obj.task.getWeiReward = async function (_projAddr, _index) {
    let taskAddr = await obj.project.getTasks(_projAddr, _index)
    let TASK = await Task.at(taskAddr)
    let weiReward = await TASK.weiReward()
    return weiReward.toNumber()
  }

  obj.task.getRepReward = async function (_projAddr, _index) {
    let taskAddr = await obj.project.getTasks(_projAddr, _index)
    let TASK = await Task.at(taskAddr)
    let repReward = await TASK.reputationReward()
    return repReward.toNumber()
  }

  obj.task.getComplete = async function (_projAddr, _index) {
    let taskAddr = await obj.project.getTasks(_projAddr, _index)
    let TASK = await Task.at(taskAddr)
    let complete = await TASK.complete()
    return complete
  }

  obj.task.getClaimer = async function (_projAddr, _index) {
    let taskAddr = await obj.project.getTasks(_projAddr, _index)
    let TASK = await Task.at(taskAddr)
    let claimer = await TASK.claimer()
    return claimer
  }

  obj.task.getTotalValidate = async function (_projAddr, _index, _valVal, _unadulterated) {
    let taskAddr = await obj.project.getTasks(_projAddr, _index)
    let TASK = await Task.at(taskAddr)
    let valBal
    if (_valVal === true) {
      valBal = await TASK.totalValidateAffirmative()
    } else if (_valVal === false) {
      valBal = await TASK.totalValidateNegative()
    }
    if (_unadulterated === true) {
      return valBal
    } else {
      return valBal.toNumber()
    }
  }

  obj.task.getValDetails = async function (_projAddr, _index, _user) {
    let taskAddr = await obj.project.getTasks(_projAddr, _index)
    let TASK = await Task.at(taskAddr)
    let valBal = await TASK.validators(_user)
    return valBal
  }

  obj.task.getOpposingVal = async function (_projAddr, _index) {
    let taskAddr = await obj.project.getTasks(_projAddr, _index)
    let TASK = await Task.at(taskAddr)
    let oppVal = await TASK.opposingValidator()
    return oppVal
  }

  obj.task.getClaimable = async function (_projAddr, _index) {
    let taskAddr = await obj.project.getTasks(_projAddr, _index)
    let TASK = await Task.at(taskAddr)
    let claimable = await TASK.claimable()
    return claimable
  }

  obj.task.getPollNonce = async function (_projAddr, _index) {
    let taskAddr = await obj.project.getTasks(_projAddr, _index)
    let TASK = await Task.at(taskAddr)
    let poll = await TASK.pollId()
    return poll.toNumber()
  }

  // project return functions
  // return project (address) proposed by token holder
  obj.returnProject.proposed_T = async function (_cost, _stakingPeriod, _ipfsHash) {
    // input parameter checks
    if (_cost === undefined) {
      _cost = obj.project.projectCost // use default project cost
    }
    if (_stakingPeriod === undefined) {
      _stakingPeriod = obj.project.stakingPeriod // use default staking period
    }
    if (_ipfsHash === undefined) {
      _ipfsHash = obj.project.ipfsHash // use default staking period
    }

    // seed the system with tokens and rep
    await obj.utils.mintIfNecessary(obj.user.tokenProposer)
    await obj.utils.register(obj.user.repProposer)

    // ensure proposer has enough tokens
    let weiBal = await obj.utils.getWeiPoolBal()
    let totalTokens = await obj.utils.getTotalTokens()
    let proposerTokenCost = Math.floor((_cost / weiBal / obj.project.proposeProportion) * totalTokens)
    await obj.utils.mintIfNecessary(obj.user.tokenProposer, proposerTokenCost)

    // propose project
    let tx = await obj.contracts.TR.proposeProject(_cost, _stakingPeriod, _ipfsHash, {from: obj.user.tokenProposer})
    let log = tx.logs[0].args
    return log.projectAddress.toString() // return project address
  }

  // return project (address) proposed by reputation holder
  obj.returnProject.proposed_R = async function (_cost, _stakingPeriod, _ipfsHash) {
    // input parameter checks
    if (_cost === undefined) {
      _cost = obj.project.projectCost // use default project cost
    }
    if (_stakingPeriod === undefined) {
      _stakingPeriod = obj.project.stakingPeriod // use default staking period
    }
    if (_ipfsHash === undefined) {
      _ipfsHash = obj.project.ipfsHash // use default staking period
    }

    // seed the system with tokens and rep
    await obj.utils.mintIfNecessary(obj.user.tokenProposer)
    await obj.utils.register(obj.user.repProposer)

    // propose project
    let tx = await obj.contracts.RR.proposeProject(_cost, _stakingPeriod, _ipfsHash, {from: obj.user.repProposer})
    let log = tx.logs[0].args
    return log.projectAddress.toString()
  }

  // return staked project (address) proposed by token holder
  obj.returnProject.staked_T = async function (_cost, _stakingPeriod, _ipfsHash) {
    // get proposed project
    let _projAddr = await obj.returnProject.proposed_T(_cost, _stakingPeriod, _ipfsHash)

    // stake tokens & reputation
    await obj.returnProjectHelper.stakeTokens(_projAddr)
    await obj.returnProjectHelper.stakeReputation(_projAddr)

    // check that the project is in state 2
    let state = await obj.project.getState(_projAddr)
    assert.equal(state, 2, 'project is not in staked state')

    return _projAddr
  }

  // return staked project (address) proposed by reputation holder
  obj.returnProject.staked_R = async function (_cost, _stakingPeriod, _ipfsHash) {
    // get proposed project
    let _projAddr = await obj.returnProject.proposed_R(_cost, _stakingPeriod, _ipfsHash)

    // stake tokens & reputation
    await obj.returnProjectHelper.stakeTokens(_projAddr)
    await obj.returnProjectHelper.stakeReputation(_projAddr)

    // check that the project is in state 2
    let state = await obj.project.getState(_projAddr)
    assert.equal(state, 2, 'project is not in staked state')

    return _projAddr
  }

  // return active projects (addresses) proposed by token holder and reputation holder
  // moves ganache forward 1 week
  obj.returnProject.active = async function (_cost, _stakingPeriod, _ipfsHash, _numSets) {
    // make array of projects
    let projArray = []

    for (let i = 0; i < _numSets; i++) {
      // get staked projects
      let temp1 = await obj.returnProject.staked_T(_cost, _stakingPeriod, _ipfsHash)
      let temp2 = await obj.returnProject.staked_R(_cost, _stakingPeriod, _ipfsHash)
      projArray.push([temp1, temp2])

      // add task hashes to both projects by at least 50% of the stakers
      for (let j = 0; j < 2; j++) {
        await obj.contracts.PR.addTaskHash(projArray[i][j], keccakHashes.hashTasksArray(taskDetails.taskSet1), {from: obj.user.tokenStaker1})
        await obj.contracts.PR.addTaskHash(projArray[i][j], keccakHashes.hashTasksArray(taskDetails.taskSet1), {from: obj.user.tokenStaker2})
        await obj.contracts.PR.addTaskHash(projArray[i][j], keccakHashes.hashTasksArray(taskDetails.taskSet1), {from: obj.user.repStaker1})
        await obj.contracts.PR.addTaskHash(projArray[i][j], keccakHashes.hashTasksArray(taskDetails.taskSet1), {from: obj.user.repStaker2})
      }
    }

    // increase time 1 week + 1 ms to make sure that checkActive() doesn't bug out
    await evmIncreaseTime(604801)

    for (let i = 0; i < _numSets; i++) {
      // call checkActive on projects and do checks
      await obj.contracts.PR.checkActive(projArray[i][0])
      await obj.contracts.PR.checkActive(projArray[i][1])

      // check that the project is in state 3
      let stateT = await obj.project.getState(projArray[i][0])
      let stateR = await obj.project.getState(projArray[i][1])
      assert.equal(stateT, 3, 'project is not in active state')
      assert.equal(stateR, 3, 'project is not in active state')
    }

    return projArray
  }

  // return validating projects (addresses) proposed by token holder and reputation holder
  // takes a list of tasks and a _numComplete array parameter of how many should be marked complete (in order)
  // moves ganache forward 3 weeks
  obj.returnProject.validating = async function (_cost, _stakingPeriod, _ipfsHash, _numSets, _tasks, _numComplete) {
    // get array of active projects
    // moves ganache forward 1 week
    let projArray = await obj.returnProject.active(_cost, _stakingPeriod, _ipfsHash, _numSets)

    // register workers
    await obj.utils.register(obj.user.worker1)
    await obj.utils.register(obj.user.worker2)

    // make worker array
    let workerArray = [obj.user.worker1, obj.user.worker2]

    for (let i = 0; i < _numSets; i++) {
      // submit hash list
      await obj.contracts.PR.submitHashList(projArray[i][0], keccakHashes.hashTasks(taskDetails.taskSet1), {from: obj.user.repStaker1})
      await obj.contracts.PR.submitHashList(projArray[i][1], keccakHashes.hashTasks(taskDetails.taskSet1), {from: obj.user.repStaker1})

      for (let j = 0; j < _numComplete[i]; j++) {
        // get description and weighting of task with index j from project set i
        let description = _tasks[j].description
        let weighting = _tasks[j].weighting

        // claim task j of set i
        await obj.contracts.RR.claimTask(projArray[i][0], j, description, weighting, {from: workerArray[j % 2]})
        await obj.contracts.RR.claimTask(projArray[i][1], j, description, weighting, {from: workerArray[j % 2]})

        // mark task j of set i complete
        await obj.contracts.PR.submitTaskComplete(projArray[i][0], j, {from: workerArray[j % 2]})
        await obj.contracts.PR.submitTaskComplete(projArray[i][1], j, {from: workerArray[j % 2]})
      }
    }

    // increase time 2 weeks + 1 ms to make sure that checkValidating() doesn't bug out
    await evmIncreaseTime((2 * 604800) + 1)

    for (let i = 0; i < _numSets; i++) {
      // call check validate for each project
      await obj.contracts.PR.checkValidate(projArray[i][0])
      await obj.contracts.PR.checkValidate(projArray[i][1])

      // assert that project is in state 4
      let stateT = await obj.project.getState(projArray[i][0])
      let stateR = await obj.project.getState(projArray[i][1])
      assert.equal(stateT, 4, 'project ' + i + ',T not in validating state')
      assert.equal(stateR, 4, 'project ' + i + ',R not in validating state')
    }

    return projArray
  }

  // return voting projects (addresses) proposed by token holder and reputation holder
  // takes a list of tasks and returns
  // takes a list of tasks and a _valType array parameter of how validated type
  // 0: validate true only
  // 1: validate false only
  // 2: validate both (true > false)
  // 3: validate both (false > true)
  // 4: validate neither
  // moves ganache forward 4 weeks
  obj.returnProject.voting = async function (_cost, _stakingPeriod, _ipfsHash, _numSets, _tasks, _numComplete) {
    // get array of validating projects
    let projArray = await obj.returnProject.validating(_cost, _stakingPeriod, _ipfsHash, _numSets, _tasks, _numComplete)

    let indexYes = 0
    let indexNo = 1
    let tokensToValidate = 100

    for (let i = 0; i < _numSets; i++) {
      await obj.contracts.TR.validateTask(projArray[i][0], indexYes, tokensToValidate, true, {from: obj.user.validator1})
      await obj.contracts.TR.validateTask(projAddrT[i][1], indexNo, tokensToValidate, false, {from: obj.user.validator1})
    }

    await evmIncreaseTime((1 * 604800) + 1)

    for (let i = 0; i < _numSets; i++) {
      // call check validate for each project
      await obj.contracts.PR.checkVoting(projArray[i][0])
      await obj.contracts.PR.checkVoting(projArray[i][1])

      // assert that project is in state 4
      let stateT = await obj.project.getState(projArray[i][0])
      let stateR = await obj.project.getState(projArray[i][1])
      assert.equal(stateT, 5, 'project ' + i + ',T not in validating state')
      assert.equal(stateR, 5, 'project ' + i + ',R not in validating state')
    }

    return projArray
  }

  // fully stake project with tokens via two stakers
  obj.returnProjectHelper.stakeTokens = async function (_projAddr) {
    // fuel token stakers
    await obj.utils.mintIfNecessary(obj.user.tokenStaker1)
    await obj.utils.mintIfNecessary(obj.user.tokenStaker2)

    // get tokens required to fully stake the project and stake half of them
    let requiredTokens = await obj.project.calculateRequiredTokens(_projAddr)
    let tokensToStake = Math.floor(requiredTokens / 2)

    // assert that tokenStaker1 has the tokens to stake
    let tsBal = await obj.utils.getTokenBalance(obj.user.tokenStaker1)
    assert.isAtLeast(tsBal, tokensToStake, 'tokenStaker1 doesn\'t have enough tokens to stake')

    // stake
    await obj.contracts.TR.stakeTokens(_projAddr, tokensToStake, {from: obj.user.tokenStaker1})

    // get tokens left to fully stake the project and stake them
    requiredTokens = await obj.project.calculateRequiredTokens(_projAddr)

    // assert that tokenStaker2 has the tokens to stake
    tsBal = await obj.utils.getTokenBalance(obj.user.tokenStaker2)
    assert.isAtLeast(tsBal, requiredTokens, 'tokenStaker2 doesn\'t have enough tokens to stake')

    // stake
    await obj.contracts.TR.stakeTokens(_projAddr, requiredTokens, {from: obj.user.tokenStaker2})
  }

  // fully stake project with reputation via two stakers
  obj.returnProjectHelper.stakeReputation = async function (_projAddr) {
    // register reputation stakers
    await obj.utils.register(obj.user.repStaker1)
    await obj.utils.register(obj.user.repStaker2)

    // get reputation required to fully stake the project and stake half of it
    let requiredRep = await obj.project.getRequiredReputation(_projAddr)
    let repToStake = Math.floor(requiredRep / 2)

    // assert that repStaker1 has the reputation to stake
    let rsBal = await obj.utils.getRepBalance(obj.user.repStaker1)
    assert.isAtLeast(rsBal, repToStake, 'repStaker1 doesn\'t have enough rep to stake')

    // stake
    await obj.contracts.RR.stakeReputation(_projAddr, repToStake, {from: obj.user.repStaker1})

    // get reputation left to fully stake the project and stake it
    requiredRep = await obj.project.getRequiredReputation(_projAddr)

    // assert that repStaker2 has the reputation to stake
    rsBal = await obj.utils.getRepBalance(obj.user.repStaker2)
    assert.isAtLeast(rsBal, requiredRep, 'repStaker2 doesn\'t have enough rep to stake')

    // stake
    await obj.contracts.RR.stakeReputation(_projAddr, requiredRep, {from: obj.user.repStaker2})
  }

  return obj
}
