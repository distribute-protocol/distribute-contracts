const Project = artifacts.require('Project')

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
const evmIncreaseTime = require('../utils/evmIncreaseTime')

contract('Proposed State', (accounts) => {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let TR, RR, PR
  let {tokenProposer, repProposer, notProposer} = projObj.user
  let {tokenStaker1, tokenStaker2} = projObj.user
  let {repStaker1, repStaker2, notStaker, notProject} = projObj.user
  let {tokensToMint} = projObj.minting
  let {registeredRep} = projObj.reputation
  let {project, utils, returnProject} = projObj

  // local test variables
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
    projAddrT = await returnProject.proposed_T()     // to check staking, refund proposer
    projAddrR = await returnProject.proposed_R()     // to check staking, refund proposer
    PROJ_T = await Project.at(projAddrT)
    PROJ_R = await Project.at(projAddrR)

    // propose projects that should fail
    projAddrTx = await returnProject.proposed_T()     // to check expiration
    projAddrRx = await returnProject.proposed_R()     // to check expiration
    PROJ_TX = await Project.at(projAddrTx)
    PROJ_RX = await Project.at(projAddrRx)

    // fund token stakers
    await utils.mintIfNecessary(tokenStaker1)
    await utils.mintIfNecessary(tokenStaker2)

    // fund reputation stakers
    await utils.register(repStaker1)
    await utils.register(repStaker2)

    // pre-staking checks
    // assert
  })

  it('Token staker can stake tokens on a TR proposed project below the required ether amount', async function () {
    // get tokens required to fully stake the project
    let requiredTokens = await project.calculateRequiredTokens(projAddrT)
    let tokensToStake = requiredTokens - 1

    // mint extra tokens for staker if necessary
    await utils.mintIfNecessary(tokenStaker1, tokensToStake)

    // take stock of variables before staking
    let currentPrice = await utils.getCurrentPrice()

    let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
    let weiBalBefore = await project.getWeiBal(projAddrT)
    let tsStakedTokensBefore = await project.getUserStakedTokens(tokenStaker1, projAddrT)
    let stakedTokensBefore = await project.getStakedTokens(projAddrT)
    let stakedRepBefore = await project.getStakedRep(projAddrT)

    // tokenStaker1 stakes all but one of the required tokens
    await TR.stakeTokens(projAddrT, tokensToStake, {from: tokenStaker1})

    // take stock of tokenStaker1's token balance after staking
    let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
    let weiBalAfter = await project.getWeiBal(projAddrT)
    let tsStakedTokensAfter = await project.getUserStakedTokens(tokenStaker1, projAddrT)
    let stakedTokensAfter = await project.getStakedTokens(projAddrT)
    let stakedRepAfter = await project.getStakedRep(projAddrT)

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
    let requiredTokens = await project.calculateRequiredTokens(projAddrR)
    let tokensToStake = requiredTokens - 1

    // mint extra tokens for staker if necessary
    await utils.mintIfNecessary(tokenStaker1, tokensToStake)

    // take stock of variables before staking
    let currentPrice = await utils.getCurrentPrice()

    let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
    let weiBalBefore = await project.getWeiBal(projAddrR)
    let tsStakedTokensBefore = await project.getUserStakedTokens(tokenStaker1, projAddrR)
    let stakedTokensBefore = await project.getStakedTokens(projAddrR)
    let stakedRepBefore = await project.getStakedRep(projAddrR)

    // tokenStaker1 stakes all but one of the required tokens
    await TR.stakeTokens(projAddrR, tokensToStake, {from: tokenStaker1})

    // take stock of tokenStaker1's token balance after staking
    let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
    let weiBalAfter = await project.getWeiBal(projAddrR)
    let tsStakedTokensAfter = await project.getUserStakedTokens(tokenStaker1, projAddrR)
    let stakedTokensAfter = await project.getStakedTokens(projAddrR)
    let stakedRepAfter = await project.getStakedRep(projAddrR)

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
    // get number of tokens to unstake
    let tokensToUnstake = await project.getUserStakedTokens(tokenStaker1, projAddrT)

    // take stock of variables before unstaking
    let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
    let weiPoolBefore = await utils.getWeiPoolBal()
    let weiBalBefore = await project.getWeiBal(projAddrT)
    let tsStakedTokensBefore = await project.getUserStakedTokens(tokenStaker1, projAddrT)
    let stakedTokensBefore = await project.getStakedTokens(projAddrT)
    let stakedRepBefore = await project.getStakedRep(projAddrT)

    // tokenStaker1 unstakes all
    await TR.unstakeTokens(projAddrT, tokensToUnstake, {from: tokenStaker1})

    // take stock of tokenStaker1's token balance after staking
    let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
    let weiPoolAfter = await utils.getWeiPoolBal()
    let weiBalAfter = await project.getWeiBal(projAddrT)
    let tsStakedTokensAfter = await project.getUserStakedTokens(tokenStaker1, projAddrT)
    let stakedTokensAfter = await project.getStakedTokens(projAddrT)
    let stakedRepAfter = await project.getStakedRep(projAddrT)

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
    // get number of tokens to unstake
    let tokensToUnstake = await project.getUserStakedTokens(tokenStaker1, projAddrR)

    // take stock of variables before unstaking
    let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
    let weiPoolBefore = await utils.getWeiPoolBal()
    let weiBalBefore = await project.getWeiBal(projAddrR)
    let tsStakedTokensBefore = await project.getUserStakedTokens(tokenStaker1, projAddrR)
    let stakedTokensBefore = await project.getStakedTokens(projAddrR)
    let stakedRepBefore = await project.getStakedRep(projAddrR)

    // tokenStaker1 unstakes all
    await TR.unstakeTokens(projAddrR, tokensToUnstake, {from: tokenStaker1})

    // take stock of tokenStaker1's token balance after staking
    let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
    let weiPoolAfter = await utils.getWeiPoolBal()
    let weiBalAfter = await project.getWeiBal(projAddrR)
    let tsStakedTokensAfter = await project.getUserStakedTokens(tokenStaker1, projAddrR)
    let stakedTokensAfter = await project.getStakedTokens(projAddrR)
    let stakedRepAfter = await project.getStakedRep(projAddrR)

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

  it('Reputation staker can stake reputation on a TR proposed project below the required reputation amount', async function () {
    // get reputation required to fully stake the project
    let requiredRep = await project.calculateRequiredTokens(projAddrT)
    let repToStake = requiredRep - 1

    // take stock of variables before staking
    let rsBalBefore = await utils.getRepBalance(repStaker1)
    let rsStakedRepBefore = await project.getUserStakedRep(repStaker1, projAddrT)
    let stakedTokensBefore = await project.getStakedTokens(projAddrT)
    let stakedRepBefore = await project.getStakedRep(projAddrT)

    // assert that repStaker1 has enough reputation for this
    assert.isAtLeast(rsBalBefore, repToStake, 'repStaker1 doesn\'t have enough reputation to stake this much on the project')

    // repStaker1 stakes all but one of the required reputation
    await RR.stakeReputation(projAddrT, repToStake, {from: repStaker1})

    // take stock of variables after staking
    let rsBalAfter = await utils.getRepBalance(repStaker1)
    let rsStakedRepAfter = await project.getUserStakedRep(repStaker1, projAddrT)
    let stakedTokensAfter = await project.getStakedTokens(projAddrT)
    let stakedRepAfter = await project.getStakedRep(projAddrT)

    // checks
    assert.equal(rsBalBefore, rsBalAfter + repToStake, 'repStaker1\'s balance updated incorrectly')
    assert.equal(0, rsStakedRepBefore, 'repStaker1 should not have any rep staked on projAddrT before staking')
    assert.equal(0, stakedRepBefore, 'projAddrT should not have any rep staked on it before repStaker1 stakes')
    assert.equal(repToStake, rsStakedRepAfter, 'repStaker1 should have repToStake amount of rep staked on projAddrT')
    assert.equal(repToStake, stakedRepAfter, 'projAddrT should have a total of repToStake rep staked before staking')
    assert.equal(0, stakedTokensBefore, 'projAddrT should not have any tokens staked on it before staking')
    assert.equal(0, stakedTokensAfter, 'projAddrT should not have any tokens staked on it after repStaker1 stakes')
  })

  it('Reputation staker can stake reputation on a RR proposed project below the required reputation amount', async function () {
    // get reputation required to fully stake the project
    let requiredRep = await project.calculateRequiredTokens(projAddrR)
    let repToStake = requiredRep - 1

    // take stock of variables before staking
    let rsBalBefore = await utils.getRepBalance(repStaker1)
    let rsStakedRepBefore = await project.getUserStakedRep(repStaker1, projAddrR)
    let stakedTokensBefore = await project.getStakedTokens(projAddrR)
    let stakedRepBefore = await project.getStakedRep(projAddrR)

    // assert that repStaker1 has enough reputation for this
    assert.isAtLeast(rsBalBefore, repToStake, 'repStaker1 doesn\'t have enough reputation to stake this much on the project')

    // repStaker1 stakes all but one of the required reputation
    await RR.stakeReputation(projAddrR, repToStake, {from: repStaker1})

    // take stock of variables after staking
    let rsBalAfter = await utils.getRepBalance(repStaker1)
    let rsStakedRepAfter = await project.getUserStakedRep(repStaker1, projAddrR)
    let stakedTokensAfter = await project.getStakedTokens(projAddrR)
    let stakedRepAfter = await project.getStakedRep(projAddrR)

    // checks
    assert.equal(rsBalBefore, rsBalAfter + repToStake, 'repStaker1\'s balance updated incorrectly')
    assert.equal(0, rsStakedRepBefore, 'repStaker1 should not have any rep staked on projAddrR before staking')
    assert.equal(0, stakedRepBefore, 'projAddrR should not have any rep staked on it before repStaker1 stakes')
    assert.equal(repToStake, rsStakedRepAfter, 'repStaker1 should have repToStake amount of rep staked on projAddrR')
    assert.equal(repToStake, stakedRepAfter, 'projAddrR should have a total of repToStake rep staked before staking')
    assert.equal(0, stakedTokensBefore, 'projAddrR should not have any tokens staked on it before staking')
    assert.equal(0, stakedTokensAfter, 'projAddrR should not have any tokens staked on it after repStaker1 stakes')
  })

  it('Reputation staker can unstake reputation from TR proposed project', async function () {
    // get reputation staked on the project
    let repToUnstake = await project.getStakedRep(projAddrT)

    // take stock of variables before unstaking
    let rsBalBefore = await utils.getRepBalance(repStaker1)
    let rsStakedRepBefore = await project.getUserStakedRep(repStaker1, projAddrT)
    let stakedTokensBefore = await project.getStakedTokens(projAddrT)
    let stakedRepBefore = await project.getStakedRep(projAddrT)

    // repStaker1 unstakes all of the reputation they had staked
    await RR.unstakeReputation(projAddrT, repToUnstake, {from: repStaker1})

    // take stock of variables after unstaking
    let rsBalAfter = await utils.getRepBalance(repStaker1)
    let rsStakedRepAfter = await project.getUserStakedRep(repStaker1, projAddrT)
    let stakedTokensAfter = await project.getStakedTokens(projAddrT)
    let stakedRepAfter = await project.getStakedRep(projAddrT)

    // checks
    assert.equal(rsBalBefore + repToUnstake, rsBalAfter, 'repStaker1\'s balance updated incorrectly')
    assert.equal(repToUnstake, rsStakedRepBefore, 'repStaker1 should not have any rep staked on projAddrT before unstaking')
    assert.equal(repToUnstake, stakedRepBefore, 'projAddrT should not have any rep staked on it before repStaker1 unstakes')
    assert.equal(0, rsStakedRepAfter, 'repStaker1 should have repToStake amount of rep staked on projAddrT')
    assert.equal(0, stakedRepAfter, 'projAddrT should have a total of repToStake rep staked before unstaking')
    assert.equal(0, stakedTokensBefore, 'projAddrT should not have any rep staked on it before unstaking')
    assert.equal(0, stakedTokensAfter, 'projAddrT should not have any rep staked on it after repStaker1 unstakes')
  })

  it('Reputation staker can unstake reputation from RR proposed project', async function () {
    // get reputation staked on the project
    let repToUnstake = await project.getStakedRep(projAddrR)

    // take stock of variables before unstaking
    let rsBalBefore = await utils.getRepBalance(repStaker1)
    let rsStakedRepBefore = await project.getUserStakedRep(repStaker1, projAddrR)
    let stakedTokensBefore = await project.getStakedTokens(projAddrR)
    let stakedRepBefore = await project.getStakedRep(projAddrR)

    // repStaker1 unstakes all of the reputation they had staked
    await RR.unstakeReputation(projAddrR, repToUnstake, {from: repStaker1})

    // take stock of variables after unstaking
    let rsBalAfter = await utils.getRepBalance(repStaker1)
    let rsStakedRepAfter = await project.getUserStakedRep(repStaker1, projAddrR)
    let stakedTokensAfter = await project.getStakedTokens(projAddrR)
    let stakedRepAfter = await project.getStakedRep(projAddrR)

    // checks
    assert.equal(rsBalBefore + repToUnstake, rsBalAfter, 'repStaker1\'s balance updated incorrectly')
    assert.equal(repToUnstake, rsStakedRepBefore, 'repStaker1 should not have any rep staked on projAddrR before unstaking')
    assert.equal(repToUnstake, stakedRepBefore, 'projAddrR should not have any rep staked on it before repStaker1 unstakes')
    assert.equal(0, rsStakedRepAfter, 'repStaker1 should have repToStake amount of rep staked on projAddrR')
    assert.equal(0, stakedRepAfter, 'projAddrR should have a total of repToStake rep staked before unstaking')
    assert.equal(0, stakedTokensBefore, 'projAddrR should not have any rep staked on it before unstaking')
    assert.equal(0, stakedTokensAfter, 'projAddrR should not have any rep staked on it after repStaker1 unstakes')
  })

  it('Not staker can\'t stake tokens they don\'t have on TR proposed project', async function () {
    errorThrown = false
    try {
      await TR.stakeTokens(projAddrT, 1, {from: notStaker})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Not staker can\'t stake tokens they don\'t have on RR proposed project', async function () {
    errorThrown = false
    try {
      await TR.stakeTokens(projAddrR, 1, {from: notStaker})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Not staker can\'t stake reputation they don\'t have on TR proposed project', async function () {
    errorThrown = false
    try {
      await RR.stakeReputation(projAddrT, 1, {from: notStaker})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Not staker can\'t stake reputation they don\'t have on RR proposed project', async function () {
    errorThrown = false
    try {
      await RR.stakeReputation(projAddrR, 1, {from: notStaker})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Not staker can\'t unstake tokens they don\'t have from TR proposed project', async function () {
    errorThrown = false
    try {
      await TR.unstakeTokens(projAddrT, 1, {from: notStaker})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Not staker can\'t unstake tokens they don\'t have from RR proposed project', async function () {
    errorThrown = false
    try {
      await TR.unstakeTokens(projAddrR, 1, {from: notStaker})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Not staker can\'t unstake reputation they don\'t have from TR proposed project', async function () {
    errorThrown = false
    try {
      await RR.unstakeReputation(projAddrT, 1, {from: notStaker})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Not staker can\'t unstake reputation they don\'t have from RR proposed project', async function () {
    errorThrown = false
    try {
      await RR.unstakeReputation(projAddrR, 1, {from: notStaker})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Token staker can\'t stake tokens on nonexistant project', async function () {
    // make sure token staker has tokens
    utils.mintIfNecessary(tokenStaker1, 1)

    // check for error
    errorThrown = false
    try {
      await TR.stakeTokens(notProject, 1, {from: tokenStaker1})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Reputation staker can\'t stake reputation on nonexistant project', async function () {
    // make sure reputation staker is registered
    utils.register(repStaker1)

    // check for error
    errorThrown = false
    try {
      await RR.stakeReputation(notProject, 1, {from: repStaker1})
    } catch(e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })


  it('checkStaked() does not change TR proposed project to staked if not fully staked', async function () {
    // take stock of variables before calling checkStaked
    let stateBefore = await project.getState(projAddrT)

    // attempt to checkStaked
    await PR.checkStaked(projAddrT)

    // take stock of variables after calling checkStaked
    let stateAfter = await project.getState(projAddrT)

    // checks
    assert.equal(stateBefore, 1, 'state before should be 1')
    assert.equal(stateAfter, 1, 'state should not have changed')
  })

  it('checkStaked() does not change RR proposed project to staked if not fully staked', async function () {
    // take stock of variables before calling checkStaked
    let stateBefore = await project.getState(projAddrR)

    // attempt to checkStaked
    await PR.checkStaked(projAddrR)

    // take stock of variables after calling checkStaked
    let stateAfter = await project.getState(projAddrR)

    // checks
    assert.equal(stateBefore, 1, 'state before should be 1')
    assert.equal(stateAfter, 1, 'state should not have changed')
  })


  it('Refund proposer can\'t be called on TR proposed project while still in propose period', async function () {
    errorThrown = false
    try {
      await TR.refundProposer(projAddrT, {from: tokenProposer})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Refund proposer can\'t be called on RR proposed project while still in propose period', async function () {
    errorThrown = false
    try {
      await RR.refundProposer(projAddrR, {from: repProposer})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Refund token staker can\'t be called on TR proposed project while still in propose period', async function () {
    // make sure token staker has something staked on the project
    await utils.mintIfNecessary(tokenStaker1, 1)
    await TR.stakeTokens(projAddrT, 1, {from: tokenStaker1})

    // check for error
    errorThrown = false
    try {
      await TR.refundStaker(projAddrT, {from: tokenStaker1})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')

    // unstake the token
    await TR.unstakeTokens(projAddrT, 1, {from: tokenStaker1})
  })

  it('Refund token staker can\'t be called on RR proposed project while still in propose period', async function () {
    // make sure token staker has something staked on the project
    await utils.mintIfNecessary(tokenStaker1, 1)
    await TR.stakeTokens(projAddrR, 1, {from: tokenStaker1})

    // check for error
    errorThrown = false
    try {
      await TR.refundStaker(projAddrR, {from: tokenStaker1})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')

    // unstake the token
    await TR.unstakeTokens(projAddrR, 1, {from: tokenStaker1})
  })

  it('Refund reputation staker can\'t be called on TR proposed project while still in propose period', async function () {
    // make sure reputation staker has something staked on the project
    await utils.register(repStaker1)
    await RR.stakeReputation(projAddrT, 1, {from: repStaker1})

    // check for error
    errorThrown = false
    try {
      await RR.refundStaker(projAddrT, {from: repStaker1})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')

    // unstake the reputation
    await RR.unstakeReputation(projAddrT, 1, {from: repStaker1})
  })

  it('Refund reputation staker can\'t be called on RR proposed project while still in propose period', async function () {
    // make sure reputation staker has something staked on the project
    await utils.register(repStaker1)
    await RR.stakeReputation(projAddrR, 1, {from: repStaker1})

    // check for error
    errorThrown = false
    try {
      await RR.refundStaker(projAddrR, {from: repStaker1})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')

    // unstake the reputation
    await RR.unstakeReputation(projAddrR, 1, {from: repStaker1})
  })


  it('Token staker can stake extra tokens on TR proposed project but only the required amount of wei and tokens is sent', async function () {
  })

  it('Token staker can stake extra tokens on RR proposed project but only the required amount of wei and tokens is sent', async function () {
  })

  it('Reputation staker can stake extra reputation on TR proposed project but only the required amount of reputation is sent', async function () {
  })

  it('Reputation staker can stake extra reputation on RR proposed project but only the required amount of reputation is sent', async function () {
  })

  it('Fully staked TR proposed project automatically transitions into staked period', async function () {

  })

  it('Fully staked RR proposed project automatically transitions into staked period', async function () {

  })

  it('Token staker can no longer call unstake token on TR proposed project once in the staked period', async function () {
    errorThrown = false
    try {
      // await TR.unstakeTokens(1, {from: staker})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Token staker can no longer call unstake token on RR proposed project once in the staked period', async function () {
    errorThrown = false
    try {
      // await TR.unstakeTokens(1, {from: staker})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Reputation staker can no longer call unstake reputation on TR proposed project once in the staked period', async function () {
    errorThrown = false
    try {
      // await TR.unstakeTokens(1, {from: staker})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Reputation staker can no longer call unstake reputation on RR proposed project once in the staked period', async function () {
    errorThrown = false
    try {
      // await TR.unstakeTokens(1, {from: staker})
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('Refund proposer can be called on TR proposed project after it is fully staked', async function () {

  })

  it('Refund proposer can be called on RR proposed project after it is fully staked', async function () {

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
