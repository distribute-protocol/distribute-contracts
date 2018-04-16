const Project = artifacts.require('Project')

const assert = require('assert')
const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
const evmIncreaseTime = require('../utils/evmIncreaseTime')

contract('Proposed State', (accounts) => {
  // projectHelper variables
  let projObj = projectHelper(accounts)
  let {tokenProposer, repProposer, notProposer} = projObj.user
  let {tokenStaker1, tokenStaker2} = projObj.user
  let {repStaker1, repStaker2, notStaker} = projObj.user
  let {tokensToMint} = projObj.minting
  let {registeredRep} = projObj.reputation
  let {stakingPeriod, projectCost, ipfsHash, proposeProportion} = projObj.project

  // local test variables
  let TR, RR, PR
  let projAddr
  let PROJ_T, PROJ_R, PROJ_TX, PROJ_RX
  let projAddrT, projAddrR, projAddrTx, projAddrRx
  let totalTokens, totalReputation
  let tBal, rBal, nBal
  let proposerCost, repCost
  let weiBal
  let tx, log
  let errorThrown

  before(async function () {
    // get contracts
    await projObj.contracts.setContracts()
    TR = projObj.contracts.TR
    RR = projObj.contracts.RR
    PR = projObj.contracts.PR

    // propose projects that should succeed
    projAddrT = await projObj.returnProject.proposed_T()     // to check staking, refund proposer
    projAddrR = await projObj.returnProject.proposed_R()     // to check staking, refund proposer
    PROJ_T = await Project.at(projAddrT)
    PROJ_R = await Project.at(projAddrR)

    // propose projects that should fail
    projAddrTx = await projObj.returnProject.proposed_T()     // to check expiration
    projAddrRx = await projObj.returnProject.proposed_R()     // to check expiration
    PROJ_TX = await Project.at(projAddrTx)
    PROJ_RX = await Project.at(projAddrRx)

    // fund token stakers
    await projObj.mintIfNecessary(tokenStaker1)
    await projObj.mintIfNecessary(tokenStaker2)

    // fund reputation stakers
    await projObj.register(repStaker1)
    await projObj.register(repStaker2)

    // pre-staking checks
    // assert
  })

  it('Token staker can stake tokens on a TR proposed project below the required ether amount', async function () {
    // get tokens required to fully stake the project
    let requiredTokens = await projObj.project.calculateRequiredTokens(projAddrT)
    let tokensToStake = requiredTokens - 1

    // mint extra tokens for staker if necessary
    await projObj.mintIfNecessary(tokenStaker1, tokensToStake)

    // take stock of variables before staking
    let currentPrice = await projObj.getCurrentPrice()

    let tsBalBefore = await projObj.getTokenBalance(tokenStaker1)
    let weiBalBefore = await projObj.project.getWeiBal(projAddrT)
    let tsStakedTokensBefore = await projObj.project.getUserStakedTokens(tokenStaker1, projAddrT)
    let stakedTokensBefore = await projObj.project.getStakedTokens(projAddrT)
    let stakedRepBefore = await projObj.project.getStakedRep(projAddrT)

    // tokenStaker1 stakes all but one of the required tokens
    await TR.stakeTokens(projAddrT, tokensToStake, {from: tokenStaker1})

    // take stock of tokenStaker1's token balance after staking
    let tsBalAfter = await projObj.getTokenBalance(tokenStaker1)
    let weiBalAfter = await projObj.project.getWeiBal(projAddrT)
    let tsStakedTokensAfter = await projObj.project.getUserStakedTokens(tokenStaker1, projAddrT)
    let stakedTokensAfter = await projObj.project.getStakedTokens(projAddrT)
    let stakedRepAfter = await projObj.project.getStakedRep(projAddrT)

    // checks
    assert.equal(tsBalBefore, tsBalAfter + tokensToStake, 'tokenStaker1\'s balance updated incorrectly')
    assert.equal(weiBalAfter - weiBalBefore, currentPrice * tokensToStake, 'incorrect weiBalAfter')
    assert.equal(0, tsStakedTokensBefore, 'tokenStaker1 should not have any tokens staked on projAddrT before staking')
    assert.equal(0, stakedTokensBefore, 'projAddrT should not have any tokens staked on it before tokenStaker1 stakes')
    assert.equal(tokensToStake, tsStakedTokensAfter, 'tokenStaker1 should have tokensToStake amount of tokens staked on projAddrT')
    assert.equal(tokensToStake, stakedTokensAfter, 'projAddrT should have a total of tokensToStake tokens staked before staking')
    assert.equal(0, stakedRepBefore, 'projAddrT should not have any rep staked on it before tokenStaker1 stakes')
    assert.equal(0, stakedRepAfter, 'projAddrT should not have any rep staked on it after tokenStaker1 stakes')
  })

  it('Token staker can stake tokens on a RR proposed project below the required ether amount', async function () {
    // get tokens required to fully stake the project
    let requiredTokens = await projObj.project.calculateRequiredTokens(projAddrR)
    let tokensToStake = requiredTokens - 1

    // mint extra tokens for staker if necessary
    await projObj.mintIfNecessary(tokenStaker1, tokensToStake)

    // take stock of variables before staking
    let currentPrice = await projObj.getCurrentPrice()

    let tsBalBefore = await projObj.getTokenBalance(tokenStaker1)
    let weiBalBefore = await projObj.project.getWeiBal(projAddrR)
    let tsStakedTokensBefore = await projObj.project.getUserStakedTokens(tokenStaker1, projAddrR)
    let stakedTokensBefore = await projObj.project.getStakedTokens(projAddrR)
    let stakedRepBefore = await projObj.project.getStakedRep(projAddrR)

    // tokenStaker1 stakes all but one of the required tokens
    await TR.stakeTokens(projAddrR, tokensToStake, {from: tokenStaker1})

    // take stock of tokenStaker1's token balance after staking
    let tsBalAfter = await projObj.getTokenBalance(tokenStaker1)
    let weiBalAfter = await projObj.project.getWeiBal(projAddrR)
    let tsStakedTokensAfter = await projObj.project.getUserStakedTokens(tokenStaker1, projAddrR)
    let stakedTokensAfter = await projObj.project.getStakedTokens(projAddrR)
    let stakedRepAfter = await projObj.project.getStakedRep(projAddrR)

    // checks
    assert.equal(tsBalBefore, tsBalAfter + tokensToStake, 'tokenStaker1\'s balance updated incorrectly')
    assert.equal(weiBalAfter - weiBalBefore, currentPrice * tokensToStake, 'incorrect weiBalAfter')
    assert.equal(0, tsStakedTokensBefore, 'tokenStaker1 should not have any tokens staked on projAddrR before staking')
    assert.equal(0, stakedTokensBefore, 'projAddrR should not have any tokens staked on it before tokenStaker1 stakes')
    assert.equal(tokensToStake, tsStakedTokensAfter, 'tokenStaker1 should have tokensToStake amount of tokens staked on projAddrR')
    assert.equal(tokensToStake, stakedTokensAfter, 'projAddrR should have a total of tokensToStake tokens staked before staking')
    assert.equal(0, stakedRepBefore, 'projAddrR should not have any rep staked on it before tokenStaker1 stakes')
    assert.equal(0, stakedRepAfter, 'projAddrR should not have any rep staked on it after tokenStaker1 stakes')
  })

  it('Token staker can unstake tokens from TR proposed project', async function () {
    let tokensToUnstake = await projObj.project.getUserStakedTokens(tokenStaker1, projAddrT)

    // take stock of variables before unstaking
    let tsBalBefore = await projObj.getTokenBalance(tokenStaker1)
    let weiPoolBefore = await projObj.getWeiPoolBal()
    let weiBalBefore = await projObj.project.getWeiBal(projAddrT)
    let tsStakedTokensBefore = await projObj.project.getUserStakedTokens(tokenStaker1, projAddrT)
    let stakedTokensBefore = await projObj.project.getStakedTokens(projAddrT)
    let stakedRepBefore = await projObj.project.getStakedRep(projAddrT)

    // tokenStaker1 unstakes all
    await TR.unstakeTokens(projAddrT, tokensToUnstake, {from: tokenStaker1})

    // take stock of tokenStaker1's token balance after staking
    let tsBalAfter = await projObj.getTokenBalance(tokenStaker1)
    let weiPoolAfter = await projObj.getWeiPoolBal()
    let weiBalAfter = await projObj.project.getWeiBal(projAddrT)
    let tsStakedTokensAfter = await projObj.project.getUserStakedTokens(tokenStaker1, projAddrT)
    let stakedTokensAfter = await projObj.project.getStakedTokens(projAddrT)
    let stakedRepAfter = await projObj.project.getStakedRep(projAddrT)

    // checks
    assert.equal(tsBalBefore + tokensToUnstake, tsBalAfter, 'tokenStaker1\'s balance updated incorrectly')
    assert.equal(weiPoolAfter, weiPoolBefore + weiBalBefore, 'incorrect transfer of wei from project to wei pool')
    assert.equal(weiBalAfter, 0, 'incorrect weiBalAfter')
    assert.equal(tokensToUnstake, tsStakedTokensBefore, 'tokenStaker1 should have tokens staked on projAddrT before staking')
    assert.equal(tokensToUnstake, stakedTokensBefore, 'projAddrT should have a total of tokensToStake tokens staked before staking')
    assert.equal(0, tsStakedTokensAfter, 'tokenStaker1 should have no tokens staked on projAddrT')
    assert.equal(0, stakedTokensAfter, 'projAddrT should have any tokens staked on it before tokenStaker1 stakes')
    assert.equal(0, stakedRepBefore, 'projAddrT should not have any rep staked on it before tokenStaker1 stakes')
    assert.equal(0, stakedRepAfter, 'projAddrT should not have any rep staked on it after tokenStaker1 stakes')
  })

  it('Token staker can unstake tokens from RR proposed project', async function () {
    let tokensToUnstake = await projObj.project.getUserStakedTokens(tokenStaker1, projAddrR)

    // take stock of variables before unstaking
    let tsBalBefore = await projObj.getTokenBalance(tokenStaker1)
    let weiPoolBefore = await projObj.getWeiPoolBal()
    let weiBalBefore = await projObj.project.getWeiBal(projAddrR)
    let tsStakedTokensBefore = await projObj.project.getUserStakedTokens(tokenStaker1, projAddrR)
    let stakedTokensBefore = await projObj.project.getStakedTokens(projAddrR)
    let stakedRepBefore = await projObj.project.getStakedRep(projAddrR)

    // tokenStaker1 unstakes all
    await TR.unstakeTokens(projAddrR, tokensToUnstake, {from: tokenStaker1})

    // take stock of tokenStaker1's token balance after staking
    let tsBalAfter = await projObj.getTokenBalance(tokenStaker1)
    let weiPoolAfter = await projObj.getWeiPoolBal()
    let weiBalAfter = await projObj.project.getWeiBal(projAddrR)
    let tsStakedTokensAfter = await projObj.project.getUserStakedTokens(tokenStaker1, projAddrR)
    let stakedTokensAfter = await projObj.project.getStakedTokens(projAddrR)
    let stakedRepAfter = await projObj.project.getStakedRep(projAddrR)

    // checks
    assert.equal(tsBalBefore + tokensToUnstake, tsBalAfter, 'tokenStaker1\'s balance updated incorrectly')
    assert.equal(weiPoolAfter, weiPoolBefore + weiBalBefore, 'incorrect transfer of wei from project to wei pool')
    assert.equal(weiBalAfter, 0, 'incorrect weiBalAfter')
    assert.equal(tokensToUnstake, tsStakedTokensBefore, 'tokenStaker1 should have tokens staked on projAddrR before staking')
    assert.equal(tokensToUnstake, stakedTokensBefore, 'projAddrR should have a total of tokensToStake tokens staked before staking')
    assert.equal(0, tsStakedTokensAfter, 'tokenStaker1 should have no tokens staked on projAddrR')
    assert.equal(0, stakedTokensAfter, 'projAddrR should have any tokens staked on it before tokenStaker1 stakes')
    assert.equal(0, stakedRepBefore, 'projAddrR should not have any rep staked on it before tokenStaker1 stakes')
    assert.equal(0, stakedRepAfter, 'projAddrR should not have any rep staked on it after tokenStaker1 stakes')
  })

  it('checkStaked does not change token registry proposed project to staked if not fully staked', async function() {

  })

  it('checkStaked does not change reputation registry proposed project to staked if not fully staked', async function() {

  })

  it('User can stake reputation on a proposed project below the required reputation amount', async function () {
  })

  it('reputation staker can unstake reputation', async function () {
  })


  it('Non-staker can\'t unstake tokens', async function () {
    errorThrown = false
    try {
      // await TR.unstakeTokens(projectAddress, 1, {from: nonStaker})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Non-staker can\'t unstake reputation', async function () {

  })

  it('User can\'t stake tokens they don\'t have', async function () {
    errorThrown = false
    try {
      // await TR.stakeTokens(projectAddress, 1, {from: nonStaker})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('User can\'t stake reputation they don\'t have', async function () {
  })

  it('Refund proposer can\'t be called from token registry while still in propose period', async function () {
    errorThrown = false
    try {
      // await TR.refundProposer(projectAddress, {from: proposer})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Refund proposer can\'t be called from reputation registry while still in propose period', async function () {
  })

  it('Refund staker can\'t be called from token registry while still in propose period', async function () {
  })

  it('Refund staker can\'t be called from reputation registry while still in propose period', async function () {
  })

  it('User can stake extra tokens on a proposed project but only the required amount of wei and tokens is sent', async function () {
  })

  it('User can stake extra reputation on a proposed project but only the required amount of reputation is sent', async function () {
  })

  it('A staker can no longer call unstake token once in the open period', async function () {
    errorThrown = false
    try {
      // await TR.unstakeTokens(1, {from: staker})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('A staker can no longer call unstake reputation once in the open period', async function () {
  })

  it('Refund proposer from token registry works after a project is fully staked', async function () {

  })

  it('Refund proposer from reputation registry works after a project is fully staked', async function () {
  })

  it('User can\'t stake tokens on nonexistant project', async function () {
    errorThrown = false
    try {
      // await TR.stakeTokens(notAProject, 1, {from: staker})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('User can\'t stake reputation on nonexistant project', async function () {
  })

  it('Non-proposer can\'t call refund proposer from token registry', async function () {
    errorThrown = false
    try {
      // await TR.refundProposer(projectAddress, {from: nonProposer})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Non-proposer can\'t call refund proposer from reputation registry', async function () {
  })

  it('Proposer can\'t call refund proposer multiple times from token registry', async function () {
    errorThrown = false
    try {
      // await TR.refundProposer(projectAddress, {from: proposer})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Proposer can\'t call refund proposer multiple times from reputation registry', async function () {
  })

  it('can\'t propose a project from token registry whose staking deadline has passed', async function () {
    errorThrown = false
    try {
      // await TR.proposeProject(1, stakingPeriodFail, {from: proposer})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('can\'t propose a project from reputation registry whose staking deadline has passed', async function () {
  })

  it('Refund staker can be called from token registry once project is staked', async function () {
  })

  it('Refund staker can be called from reputation registry once project is staked', async function () {
  })

  // fast forward 1 week

  it('proposed project from token registry becomes expired if not staked', async function () {
  })

  it('proposed project from reputation registry becomes expired if not staked', async function () {
  })

  it('proposer can\'t call refund proposer for expired project from token registry', async function () {
  })

  it('proposer can\'t call refund proposer for expired project from reputation registry', async function () {
  })

})
