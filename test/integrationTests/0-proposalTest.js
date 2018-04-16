const Project = artifacts.require('Project')

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')

contract('Propose Projects', function (accounts) {
  // set up project helper
  let projObj = projectHelper(web3, accounts)

  // get projectHelper variables
  let TR, RR, PR
  let {tokenProposer, repProposer, notProposer} = projObj.user
  let {tokensToMint} = projObj.minting
  let {registeredRep} = projObj.reputation
  let {stakingPeriod, expiredStakingPeriod, projectCost, ipfsHash, incorrectIpfsHash, proposeProportion} = projObj.project

  // local test variables
  let projAddr
  let PROJ_T, PROJ_R
  let totalTokens, totalReputation
  let ttBal, rtBal, ntBal
  let trBal, rrBal, nrBal
  let proposerCost, repCost
  let repHolders
  let weiBal
  let tx, log
  let errorThrown

  before(async function () {
    // get contracts
    await projObj.contracts.setContracts()
    TR = projObj.contracts.TR
    RR = projObj.contracts.RR
    PR = projObj.contracts.PR

    // fund users with tokens and reputation
    await projObj.mint(tokenProposer, tokensToMint)   // mint 10000 tokens for token proposer
    await projObj.register(repProposer)               // register 10000 reputation for rep proposer

    // take stock of variables after minting and registering
    ttBal = await projObj.getTokenBalance(tokenProposer)
    rtBal = await projObj.getTokenBalance(repProposer)
    ntBal = await projObj.getTokenBalance(notProposer)

    trBal = await projObj.getRepBalance(tokenProposer)
    rrBal = await projObj.getRepBalance(repProposer)
    nrBal = await projObj.getRepBalance(notProposer)

    totalTokens = await projObj.getTotalTokens()
    totalReputation = await projObj.getTotalRep()
    repHolders = await projObj.getRepHolders()

    // checks
    assert.equal(0, rtBal + ntBal, 'rep proposer or not proposer somehow have tokens')
    assert.equal(tokensToMint, ttBal + rtBal + ntBal, 'proposer did not successfully mint tokens')
    assert.equal(0, trBal + nrBal, 'token proposer or not proposer somehow have reputation')
    assert.equal(registeredRep, trBal + rrBal + nrBal, 'proposer did not successfully register for reputation')
    assert.equal(tokensToMint, totalTokens, 'total token supply did not update correctly')
    assert.equal(registeredRep, totalReputation, 'total reputation supply did not update correctly')
    assert.equal(1, repHolders, 'there should be 1 rep holder after registering repProposer')

  })

  it('Proposer can propose project with tokens', async function () {
    // propose project
    tx = await TR.proposeProject(projectCost, stakingPeriod, ipfsHash, {from: tokenProposer})

    // token supply, token balance checks
    ttBal = await projObj.getTokenBalance(tokenProposer)
    weiBal = await projObj.getWeiPoolBal()
    totalTokens = await projObj.getTotalTokens()
    totalReputation = await projObj.getTotalRep()

    proposerCost = Math.floor((projectCost / weiBal / proposeProportion) * totalTokens)
    repCost = Math.floor((projectCost / weiBal) * totalReputation)

    assert.equal(tokensToMint, totalTokens, 'total token supply shouldn\'t have updated')
    assert.equal(ttBal, tokensToMint - proposerCost, 'DT did not set aside appropriate proportion to escrow')

    // project contract creation, log checks
    log = tx.logs[0].args
    projAddr = log.projectAddress.toString()
    PROJ_T = await Project.at(projAddr)

    let _TRaddr = await PROJ_T.tokenRegistryAddress()
    let _PRaddr = await PROJ_T.projectRegistryAddress()
    let _weiCost = await PROJ_T.weiCost()
    let _repCost = await PROJ_T.reputationCost()
    let _state = await PROJ_T.state()
    let _nextDeadline = await PROJ_T.nextDeadline()
    let _proposer = await PROJ_T.proposer()
    let _proposerType = await PROJ_T.proposerType()
    let _proposerStake = await PROJ_T.proposerStake()
    let _ipfsHash = await PROJ_T.ipfsHash()

    assert.equal(TR.address, _TRaddr, 'PR stored incorrect token registry address')
    assert.equal(PR.address, _PRaddr, 'PR stored incorrect project registry address')
    assert.equal(projectCost, _weiCost, 'PR stored incorrect project cost')
    assert.equal(repCost, _repCost, 'PR stored incorrect rep cost')
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
    rBal = await projObj.getRepBalance(repProposer)
    weiBal = await projObj.getWeiPoolBal()
    totalTokens = await projObj.getTotalTokens()
    totalReputation = await projObj.getTotalRep()

    proposerCost = Math.floor((projectCost / weiBal / proposeProportion) * totalReputation)
    repCost = Math.floor((projectCost / weiBal) * totalReputation)

    assert.equal(registeredRep, totalReputation, 'total reputation supply shouldn\'t have updated')
    assert.equal(rBal, registeredRep - proposerCost, 'DT did not set aside appropriate proportion to escrow')

    // project contract creation, log checks
    log = tx.logs[0].args
    projAddr = log.projectAddress.toString()
    PROJ_R = await Project.at(projAddr)

    let _TRaddr = await PROJ_R.tokenRegistryAddress()
    let _PRaddr = await PROJ_R.projectRegistryAddress()
    let _weiCost = await PROJ_R.weiCost()
    let _repCost = await PROJ_R.reputationCost()
    let _state = await PROJ_R.state()
    let _nextDeadline = await PROJ_R.nextDeadline()
    let _proposer = await PROJ_R.proposer()
    let _proposerType = await PROJ_R.proposerType()
    let _proposerStake = await PROJ_R.proposerStake()
    let _ipfsHash = await PROJ_R.ipfsHash()

    assert.equal(TR.address, _TRaddr, 'PR stored incorrect token registry address')
    assert.equal(PR.address, _PRaddr, 'PR stored incorrect project registry address')
    assert.equal(projectCost, _weiCost, 'PR stored incorrect project cost')
    assert.equal(repCost, _repCost, 'PR stored incorrect rep cost')
    assert.equal(1, _state, 'PR stored incorrect state')
    assert.equal(stakingPeriod, _nextDeadline, 'PR stored incorrect staking period')
    assert.equal(repProposer, _proposer, 'PR stored incorrect proposer address')
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
