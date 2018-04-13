const Project = artifacts.require('Project')

const Promise = require('bluebird')
const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
web3.eth = Promise.promisifyAll(web3.eth)

contract('Project Proposal', async (accounts) => {
  // projectHelper variables
  let projObj = await projectHelper(web3, accounts)
  let {TR, RR, DT, PR} = projObj.contracts
  let {tokenProposer, repProposer, notProposer} = projObj.user
  let {tokensToMint} = projObj.minting
  let {registeredRep} = projObj.reputation
  let {stakingPeriod, expiredStakingPeriod, projectCost, ipfsHash, incorrectIpfsHash, proposeProportion} = projObj.project

  // local test variables
  let projAddr
  let PROJ_T, PROJ_R
  let totalTokens, totalReputation
  let tBal, rBal, nBal
  let proposerCost
  let weiBal
  let tx, log
  let errorThrown

  before(async function () {
    // fund users with tokens and reputation
    await projObj.mint(tokenProposer, tokensToMint)   // mint 10000 tokens for token proposer
    await projObj.register(repProposer)               // register 10000 reputation for rep proposer

    // check that minting, totalTokenSupply, and totalReputationSupply check out
    tBal = await projObj.getTokenBalance(tokenProposer)
    rBal = await projObj.getTokenBalance(repProposer)
    nBal = await projObj.getTokenBalance(notProposer)

    totalTokens = await projObj.getTotalTokens()
    totalReputation = await projObj.getTotalRep()

    assert.equal(tokensToMint, tBal + rBal + nBal, 'proposer did not successfully mint tokens')
    assert.equal(tokensToMint, totalTokens, 'total token supply did not update correctly')
    assert.equal(registeredRep, totalReputation, 'total reputation supply did not update correctly')
  })

  it('Proposer can propose project with tokens', async function () {
    // propose project
    tx = await TR.proposeProject(projectCost, stakingPeriod, ipfsHash, {from: tokenProposer})

    // token supply, token balance checks
    weiBal = await projObj.getWeiBal()
    proposerCost = Math.floor((projectCost / weiBal / proposeProportion) * totalTokens)
    tBal = await projObj.getTokenBalance(tokenProposer)
    totalTokens = await projObj.getTotalTokens()

    assert.equal(tokensToMint, totalTokens, 'total token supply shouldn\'t have updated')
    assert.equal(tBal, tokensToMint - proposerCost, 'DT did not set aside appropriate proportion to escrow')

    // project contract creation, log checks
    log = tx.logs[0].args
    projAddr = log.projectAddress.toString()
    PROJ_T = await Project.at(projAddr)

    let _TRaddr = await PROJ_T.tokenRegistryAddress()
    let _PRaddr = await PROJ_T.projectRegistryAddress()
    let _weiCost = await PROJ_T.weiCost()
    // let reputation cost = await PROJ_T.reputationCost() ---> needs test
    let _state = await PROJ_T.state()
    let _nextDeadline = await PROJ_T.nextDeadline()
    let _proposer = await PROJ_T.proposer()
    let _proposerType = await PROJ_T.proposerType()
    let _proposerStake = await PROJ_T.proposerStake()
    let _ipfsHash = await PROJ_T.ipfsHash()

    assert.equal(TR.address, _TRaddr, 'PR stored incorrect token registry address')
    assert.equal(PR.address, _PRaddr, 'PR stored incorrect project registry address')
    assert.equal(projectCost, _weiCost, 'PR stored incorrect project cost')
    assert.equal(1, _state, 'PR stored incorrect state')
    assert.equal(stakingPeriod, _nextDeadline, 'PR stored incorrect staking period')
    assert.equal(tokenProposer, _proposer, 'PR stored incorrect proposer address')
    assert.equal(1, _proposerType, 'PR stored incorrect proposer type')
    assert.equal(proposerCost, _proposerStake, 'PR stored incorrect proposer stake')
    assert.equal(ipfsHash, _ipfsHash, 'PR stored incorrect ipfs hash')
  })

  it('Proposer can propose project with reputation', async function () {
    // propose project
    tx = await RR.proposeProject(projectCost, stakingPeriod, ipfsHash, {from: repProposer})

    // token supply, token balance checks
    weiBal = await projObj.getWeiBal()
    proposerCost = Math.floor((projectCost / weiBal / proposeProportion) * totalReputation)
    rBal = await RR.balances(repProposer)
    totalReputation = await RR.totalSupply()

    assert.equal(registeredRep, totalReputation, 'total reputation supply shouldn\'t have updated')
    assert.equal(rBal, registeredRep - proposerCost, 'DT did not set aside appropriate proportion to escrow')

    // project contract creation, log checks
    log = tx.logs[0].args
    projAddr = log.projectAddress.toString()
    PROJ_R = await Project.at(projAddr)

    let _TRaddr = await PROJ_R.tokenRegistryAddress()
    let _PRaddr = await PROJ_R.projectRegistryAddress()
    let _weiCost = await PROJ_R.weiCost()
    // let reputation cost = await PROJ_R.reputationCost() ---> needs test
    let _state = await PROJ_R.state()
    let _nextDeadline = await PROJ_R.nextDeadline()
    let _proposer = await PROJ_R.proposer()
    let _proposerType = await PROJ_R.proposerType()
    let _proposerStake = await PROJ_R.proposerStake()
    let _ipfsHash = await PROJ_R.ipfsHash()

    assert.equal(TR.address, _TRaddr, 'PR stored incorrect token registry address')
    assert.equal(PR.address, _PRaddr, 'PR stored incorrect project registry address')
    assert.equal(projectCost, _weiCost, 'PR stored incorrect project cost')
    assert.equal(1, _state, 'PR stored incorrect state')
    assert.equal(stakingPeriod, _nextDeadline, 'PR stored incorrect staking period')
    assert.equal(tokenProposer, _proposer, 'PR stored incorrect proposer address')
    assert.equal(2, _proposerType, 'PR stored incorrect proposer type')
    assert.equal(proposerCost, _proposerStake, 'PR stored incorrect proposer stake')
    assert.equal(ipfsHash, _ipfsHash, 'PR stored incorrect ipfs hash')
  })

  it('Proposer with tokens can\'t propose project from TR with staking period that\'s passed', async function () {
    errorThrown = false
    try {
      await TR.proposeProject(projectCost, expiredStakingPeriod, {from: tokenProposer})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Proposer with reputation can\'t propose project from RR with staking period that\'s passed', async function () {
    errorThrown = false
    try {
      await RR.proposeProject(projectCost, expiredStakingPeriod, ipfsHash, {from: repProposer})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Proposer can\'t propose project from TR with ipfs hash of incorrect length', async function () {
    errorThrown = false
    try {
      await TR.proposeProject(projectCost, stakingPeriod, incorrectIpfsHash, {from: tokenProposer})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Proposer can\'t propose project from RR with ipfs hash of incorrect length', async function () {
    errorThrown = false
    try {
      await RR.proposeProject(projectCost, stakingPeriod, incorrectIpfsHash, {from: repProposer})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('User can\'t propose project without the required token stake', async function () {
    errorThrown = false
    try {
      await TR.proposeProject(projectCost, stakingPeriod, ipfsHash, {from: notProposer})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('User can\'t propose project without the required reputation stake', async function () {
    errorThrown = false
    try {
      await RR.proposeProject(projectCost, stakingPeriod, ipfsHash, {from: notProposer})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })
})
