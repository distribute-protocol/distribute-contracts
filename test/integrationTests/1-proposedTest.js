/* eslint-env mocha */
/* global assert contract */

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
const evmIncreaseTime = require('../utils/evmIncreaseTime')

contract('Proposed State', (accounts) => {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let TR, RR, PR, DT
  let {user, project, utils, returnProject} = projObj
  let {tokenProposer, repProposer, notProposer} = user
  let {tokenStaker1, tokenStaker2} = user
  let {repStaker1, repStaker2} = user
  let {notStaker, notProject} = user

  // local test variables
  let projAddrT1, projAddrT2, projAddrT3, projAddrT4
  let projAddrR1, projAddrR2, projAddrR3, projAddrR4
  let errorThrown

  before(async function () {
    // get contracts
    await projObj.contracts.setContracts()
    TR = projObj.contracts.TR
    RR = projObj.contracts.RR
    PR = projObj.contracts.PR
    DT = projObj.contracts.DT

    // propose projects
    // to check staking below required amount, unstaking
    projAddrT1 = await returnProject.proposed_T()
    projAddrR1 = await returnProject.proposed_R()

    // to check staking extra above required amount & state change to staked
    projAddrT2 = await returnProject.proposed_T()
    projAddrR2 = await returnProject.proposed_R()

    // to check staking by multiple stakers
    projAddrT3 = await returnProject.proposed_T()
    projAddrR3 = await returnProject.proposed_R()

    // to check errors and expiration
    projAddrT4 = await returnProject.proposed_T()
    projAddrR4 = await returnProject.proposed_R()

    // fund token stakers
    await utils.mintIfNecessary(tokenStaker1)
    await utils.mintIfNecessary(tokenStaker2)

    // fund reputation stakers
    await utils.register(repStaker1)
    await utils.register(repStaker2)

    // pre-staking checks
    // assert
  })

  describe('staking on projects in proposed state', () => {
    it('Token staker can stake tokens on a TR proposed project below the required ether amount', async function () {
      // get tokens required to fully stake the project
      let requiredTokens = await project.calculateRequiredTokens(projAddrT1)
      let tokensToStake = requiredTokens - 1

      // take stock of variables
      let currentPrice = await utils.getCurrentPrice()

      let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let weiBalBefore = await project.getWeiBal(projAddrT1)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let tsStakedTokensBefore = await project.getUserStakedTokens(tokenStaker1, projAddrT1)
      let stakedTokensBefore = await project.getStakedTokens(projAddrT1)
      let stakedRepBefore = await project.getStakedRep(projAddrT1)

      // assert that tokenStaker1 has enough tokens for this
      assert.isAtLeast(tsBalBefore, tokensToStake, 'tokenStaker1 doesn\'t have enough tokens to stake this much on projAddrT1')

      // HERE FOR DEBUGGING
      let DTBalBefore = web3.eth.getBalance(DT.address)
      let ProjBalBefore = web3.eth.getBalance(projAddrT1)

      // tokenStaker1 stakes all but one of the required tokens
      await TR.stakeTokens(projAddrT1, tokensToStake, {from: tokenStaker1})

      // HERE FOR DEBUGGING
      let DTBalAfter = web3.eth.getBalance(DT.address)
      let ProjBalAfter = web3.eth.getBalance(projAddrT1)

      // take stock of variables
      let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let weiBalAfter = await project.getWeiBal(projAddrT1)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let tsStakedTokensAfter = await project.getUserStakedTokens(tokenStaker1, projAddrT1)
      let stakedTokensAfter = await project.getStakedTokens(projAddrT1)
      let stakedRepAfter = await project.getStakedRep(projAddrT1)

      // HERE FOR DEBUGGING
      // console.log('DT before, after', DTBalBefore.toNumber(), DTBalAfter.toNumber(), DTBalBefore.toNumber() - DTBalAfter.toNumber())
      // console.log('weiPool before, after', weiPoolBefore, weiPoolAfter, weiPoolBefore - weiPoolAfter)
      // console.log('PROJ before, after', ProjBalBefore.toNumber(), ProjBalAfter.toNumber(), ProjBalAfter.toNumber() - ProjBalBefore.toNumber())
      // console.log('weiBal before, after', weiBalBefore, weiBalAfter, weiBalBefore - weiBalAfter)

      // checks
      assert.equal(tsBalBefore, tsBalAfter + tokensToStake, 'tokenStaker1\'s balance updated incorrectly')
      assert.equal(TRBalBefore + tokensToStake, TRBalAfter, 'TR\'s balance updated incorrectly')
      assert.equal(weiBalAfter - weiBalBefore, currentPrice * tokensToStake, 'incorrect weiBalAfter')
      // assert.equal(weiPoolBefore - weiPoolAfter, currentPrice * tokensToStake, 'incorrect weiPoolAfter') --> THIS HAS A WEIRD 50 WEI OFFSET. FIX THIS!
      assert.equal(0, tsStakedTokensBefore, 'tokenStaker1 should not have any tokens staked on projAddrT1 before staking')
      assert.equal(0, stakedTokensBefore, 'projAddrT1 should not have any tokens staked on it before tokenStaker1 stakes')
      assert.equal(tokensToStake, tsStakedTokensAfter, 'tokenStaker1 should have tokensToStake amount of tokens staked on projAddrT1')
      assert.equal(tokensToStake, stakedTokensAfter, 'projAddrT1 should have a total of tokensToStake tokens staked before staking')
      assert.equal(0, stakedRepBefore, 'projAddrT1 should not have any rep staked on it before tokenStaker1 stakes')
      assert.equal(0, stakedRepAfter, 'projAddrT1 should not have any rep staked on it after tokenStaker1 stakes')
    })

    it('Token staker can stake tokens on a RR proposed project below the required ether amount', async function () {
      // get tokens required to fully stake the project
      let requiredTokens = await project.calculateRequiredTokens(projAddrR1)
      let tokensToStake = requiredTokens - 1

      // take stock of variables
      let currentPrice = await utils.getCurrentPrice()

      let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let weiBalBefore = await project.getWeiBal(projAddrR1)
      // let weiPoolBefore = await utils.getWeiPoolBal()
      let tsStakedTokensBefore = await project.getUserStakedTokens(tokenStaker1, projAddrR1)
      let stakedTokensBefore = await project.getStakedTokens(projAddrR1)
      let stakedRepBefore = await project.getStakedRep(projAddrR1)

      // assert that tokenStaker1 has enough tokens for this
      assert.isAtLeast(tsBalBefore, tokensToStake, 'repStaker1 doesn\'t have enough tokens to stake this much on the project')

      // tokenStaker1 stakes all but one of the required tokens
      await TR.stakeTokens(projAddrR1, tokensToStake, {from: tokenStaker1})

      // take stock of variables
      let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let weiBalAfter = await project.getWeiBal(projAddrR1)
      // let weiPoolAfter = await utils.getWeiPoolBal()
      let tsStakedTokensAfter = await project.getUserStakedTokens(tokenStaker1, projAddrR1)
      let stakedTokensAfter = await project.getStakedTokens(projAddrR1)
      let stakedRepAfter = await project.getStakedRep(projAddrR1)

      // checks
      assert.equal(tsBalBefore, tsBalAfter + tokensToStake, 'tokenStaker1\'s balance updated incorrectly')
      assert.equal(TRBalBefore + tokensToStake, TRBalAfter, 'TR\'s balance updated incorrectly')
      assert.equal(weiBalAfter - weiBalBefore, currentPrice * tokensToStake, 'incorrect weiBalAfter')
      // assert.equal(weiPoolBefore - weiPoolAfter, currentPrice * tokensToStake, 'incorrect weiPoolAfter') --> THIS HAS A WEIRD 50 WEI OFFSET. FIX THIS!
      assert.equal(0, tsStakedTokensBefore, 'tokenStaker1 should not have any tokens staked on projAddrR1 before staking')
      assert.equal(0, stakedTokensBefore, 'projAddrR1 should not have any tokens staked on it before tokenStaker1 stakes')
      assert.equal(tokensToStake, tsStakedTokensAfter, 'tokenStaker1 should have tokensToStake amount of tokens staked on projAddrR1')
      assert.equal(tokensToStake, stakedTokensAfter, 'projAddrR1 should have a total of tokensToStake tokens staked before staking')
      assert.equal(0, stakedRepBefore, 'projAddrR1 should not have any rep staked on it before tokenStaker1 stakes')
      assert.equal(0, stakedRepAfter, 'projAddrR1 should not have any rep staked on it after tokenStaker1 stakes')
    })

    it('Token staker can unstake tokens from TR proposed project', async function () {
      // get number of tokens to unstake
      let tokensToUnstake = await project.getUserStakedTokens(tokenStaker1, projAddrT1)

      // take stock of variables
      let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      // let weiPoolBefore = await utils.getWeiPoolBal()
      // let weiBalBefore = await project.getWeiBal(projAddrT1)
      let tsStakedTokensBefore = await project.getUserStakedTokens(tokenStaker1, projAddrT1)
      let stakedTokensBefore = await project.getStakedTokens(projAddrT1)
      let stakedRepBefore = await project.getStakedRep(projAddrT1)

      // tokenStaker1 unstakes all
      await TR.unstakeTokens(projAddrT1, tokensToUnstake, {from: tokenStaker1})

      // take stock of variables
      let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      // let weiPoolAfter = await utils.getWeiPoolBal()
      let weiBalAfter = await project.getWeiBal(projAddrT1)
      let tsStakedTokensAfter = await project.getUserStakedTokens(tokenStaker1, projAddrT1)
      let stakedTokensAfter = await project.getStakedTokens(projAddrT1)
      let stakedRepAfter = await project.getStakedRep(projAddrT1)

      // checks
      assert.equal(tsBalBefore + tokensToUnstake, tsBalAfter, 'tokenStaker1\'s balance updated incorrectly')
      assert.equal(TRBalAfter + tokensToUnstake, TRBalBefore, 'TR\'s balance updated incorrectly')
      assert.equal(weiBalAfter, 0, 'incorrect weiBalAfter')
      // assert.equal(weiPoolAfter - weiPoolBefore, weiBalBefore, 'incorrect weiPoolAfter')
      assert.equal(tokensToUnstake, tsStakedTokensBefore, 'tokenStaker1 should have tokens staked on projAddrT1 before staking')
      assert.equal(tokensToUnstake, stakedTokensBefore, 'projAddrT1 should have a total of tokensToStake tokens staked before staking')
      assert.equal(0, tsStakedTokensAfter, 'tokenStaker1 should have no tokens staked on projAddrT1')
      assert.equal(0, stakedTokensAfter, 'projAddrT1 should have any tokens staked on it before tokenStaker1 stakes')
      assert.equal(0, stakedRepBefore, 'projAddrT1 should not have any rep staked on it before tokenStaker1 stakes')
      assert.equal(0, stakedRepAfter, 'projAddrT1 should not have any rep staked on it after tokenStaker1 stakes')
    })

    it('Token staker can unstake tokens from RR proposed project', async function () {
      // get number of tokens to unstake
      let tokensToUnstake = await project.getUserStakedTokens(tokenStaker1, projAddrR1)

      // take stock of variables
      let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      // let weiPoolBefore = await utils.getWeiPoolBal()
      // let weiBalBefore = await project.getWeiBal(projAddrR1)
      let tsStakedTokensBefore = await project.getUserStakedTokens(tokenStaker1, projAddrR1)
      let stakedTokensBefore = await project.getStakedTokens(projAddrR1)
      let stakedRepBefore = await project.getStakedRep(projAddrR1)

      // tokenStaker1 unstakes all
      await TR.unstakeTokens(projAddrR1, tokensToUnstake, {from: tokenStaker1})

      // take stock of variables
      let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      // let weiPoolAfter = await utils.getWeiPoolBal()
      let weiBalAfter = await project.getWeiBal(projAddrR1)
      let tsStakedTokensAfter = await project.getUserStakedTokens(tokenStaker1, projAddrR1)
      let stakedTokensAfter = await project.getStakedTokens(projAddrR1)
      let stakedRepAfter = await project.getStakedRep(projAddrR1)

      // checks
      assert.equal(tsBalBefore + tokensToUnstake, tsBalAfter, 'tokenStaker1\'s balance updated incorrectly')
      assert.equal(TRBalAfter + tokensToUnstake, TRBalBefore, 'TR\'s balance updated incorrectly')
      assert.equal(weiBalAfter, 0, 'incorrect weiBalAfter')
      // assert.equal(weiPoolAfter - weiPoolBefore, weiBalBefore, 'incorrect weiPoolAfter')
      assert.equal(tokensToUnstake, tsStakedTokensBefore, 'tokenStaker1 should have tokens staked on projAddrR1 before staking')
      assert.equal(tokensToUnstake, stakedTokensBefore, 'projAddrR1 should have a total of tokensToStake tokens staked before staking')
      assert.equal(0, tsStakedTokensAfter, 'tokenStaker1 should have no tokens staked on projAddrR1')
      assert.equal(0, stakedTokensAfter, 'projAddrR1 should have any tokens staked on it before tokenStaker1 stakes')
      assert.equal(0, stakedRepBefore, 'projAddrR1 should not have any rep staked on it before tokenStaker1 stakes')
      assert.equal(0, stakedRepAfter, 'projAddrR1 should not have any rep staked on it after tokenStaker1 stakes')
    })

    it('Reputation staker can stake reputation on a TR proposed project below the required reputation amount', async function () {
      // get reputation required to fully stake the project
      let requiredRep = await project.calculateRequiredTokens(projAddrT1)
      let repToStake = requiredRep - 1

      // take stock of variables
      let rsBalBefore = await utils.getRepBalance(repStaker1)
      let rsStakedRepBefore = await project.getUserStakedRep(repStaker1, projAddrT1)
      let stakedTokensBefore = await project.getStakedTokens(projAddrT1)
      let stakedRepBefore = await project.getStakedRep(projAddrT1)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let weiBalBefore = await project.getWeiBal(projAddrT1)

      // assert that repStaker1 has enough reputation for this
      assert.isAtLeast(rsBalBefore, repToStake, 'repStaker1 doesn\'t have enough reputation to stake this much on the project')

      // repStaker1 stakes all but one of the required reputation
      await RR.stakeReputation(projAddrT1, repToStake, {from: repStaker1})

      // take stock of variables
      let rsBalAfter = await utils.getRepBalance(repStaker1)
      let rsStakedRepAfter = await project.getUserStakedRep(repStaker1, projAddrT1)
      let stakedTokensAfter = await project.getStakedTokens(projAddrT1)
      let stakedRepAfter = await project.getStakedRep(projAddrT1)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let weiBalAfter = await project.getWeiBal(projAddrT1)

      // checks
      assert.equal(rsBalBefore, rsBalAfter + repToStake, 'repStaker1\'s balance updated incorrectly')
      assert.equal(0, rsStakedRepBefore, 'repStaker1 should not have any rep staked on projAddrT1 before staking')
      assert.equal(0, stakedRepBefore, 'projAddrT1 should not have any rep staked on it before repStaker1 stakes')
      assert.equal(repToStake, rsStakedRepAfter, 'repStaker1 should have repToStake amount of rep staked on projAddrT1')
      assert.equal(repToStake, stakedRepAfter, 'projAddrT1 should have a total of repToStake rep staked before staking')
      assert.equal(0, stakedTokensBefore, 'projAddrT1 should not have any tokens staked on it before staking')
      assert.equal(0, stakedTokensAfter, 'projAddrT1 should not have any tokens staked on it after repStaker1 stakes')
      assert.equal(weiPoolBefore, weiPoolAfter, 'wei pool balance should not change')
      assert.equal(weiBalBefore, weiBalAfter, 'project wei balance should not change')
    })

    it('Reputation staker can stake reputation on a RR proposed project below the required reputation amount', async function () {
      // get reputation required to fully stake the project
      let requiredRep = await project.calculateRequiredTokens(projAddrR1)
      let repToStake = requiredRep - 1

      // take stock of variables
      let rsBalBefore = await utils.getRepBalance(repStaker1)
      let rsStakedRepBefore = await project.getUserStakedRep(repStaker1, projAddrR1)
      let stakedTokensBefore = await project.getStakedTokens(projAddrR1)
      let stakedRepBefore = await project.getStakedRep(projAddrR1)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let weiBalBefore = await project.getWeiBal(projAddrR1)

      // assert that repStaker1 has enough reputation for this
      assert.isAtLeast(rsBalBefore, repToStake, 'repStaker1 doesn\'t have enough reputation to stake this much on the project')

      // repStaker1 stakes all but one of the required reputation
      await RR.stakeReputation(projAddrR1, repToStake, {from: repStaker1})

      // take stock of variables
      let rsBalAfter = await utils.getRepBalance(repStaker1)
      let rsStakedRepAfter = await project.getUserStakedRep(repStaker1, projAddrR1)
      let stakedTokensAfter = await project.getStakedTokens(projAddrR1)
      let stakedRepAfter = await project.getStakedRep(projAddrR1)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let weiBalAfter = await project.getWeiBal(projAddrR1)

      // checks
      assert.equal(rsBalBefore, rsBalAfter + repToStake, 'repStaker1\'s balance updated incorrectly')
      assert.equal(0, rsStakedRepBefore, 'repStaker1 should not have any rep staked on projAddrR1 before staking')
      assert.equal(0, stakedRepBefore, 'projAddrR1 should not have any rep staked on it before repStaker1 stakes')
      assert.equal(repToStake, rsStakedRepAfter, 'repStaker1 should have repToStake amount of rep staked on projAddrR1')
      assert.equal(repToStake, stakedRepAfter, 'projAddrR1 should have a total of repToStake rep staked before staking')
      assert.equal(0, stakedTokensBefore, 'projAddrR1 should not have any tokens staked on it before staking')
      assert.equal(0, stakedTokensAfter, 'projAddrR1 should not have any tokens staked on it after repStaker1 stakes')
      assert.equal(weiPoolBefore, weiPoolAfter, 'wei pool balance should not change')
      assert.equal(weiBalBefore, weiBalAfter, 'project wei balance should not change')
    })

    it('Reputation staker can unstake reputation from TR proposed project', async function () {
      // get reputation staked on the project
      let repToUnstake = await project.getStakedRep(projAddrT1)

      // take stock of variables
      let rsBalBefore = await utils.getRepBalance(repStaker1)
      let rsStakedRepBefore = await project.getUserStakedRep(repStaker1, projAddrT1)
      let stakedTokensBefore = await project.getStakedTokens(projAddrT1)
      let stakedRepBefore = await project.getStakedRep(projAddrT1)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let weiBalBefore = await project.getWeiBal(projAddrT1)

      // repStaker1 unstakes all of the reputation they had staked
      await RR.unstakeReputation(projAddrT1, repToUnstake, {from: repStaker1})

      // take stock of variables
      let rsBalAfter = await utils.getRepBalance(repStaker1)
      let rsStakedRepAfter = await project.getUserStakedRep(repStaker1, projAddrT1)
      let stakedTokensAfter = await project.getStakedTokens(projAddrT1)
      let stakedRepAfter = await project.getStakedRep(projAddrT1)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let weiBalAfter = await project.getWeiBal(projAddrT1)

      // checks
      assert.equal(rsBalBefore + repToUnstake, rsBalAfter, 'repStaker1\'s balance updated incorrectly')
      assert.equal(repToUnstake, rsStakedRepBefore, 'repStaker1 should not have any rep staked on projAddrT1 before unstaking')
      assert.equal(repToUnstake, stakedRepBefore, 'projAddrT1 should not have any rep staked on it before repStaker1 unstakes')
      assert.equal(0, rsStakedRepAfter, 'repStaker1 should have repToStake amount of rep staked on projAddrT1')
      assert.equal(0, stakedRepAfter, 'projAddrT1 should have a total of repToStake rep staked before unstaking')
      assert.equal(0, stakedTokensBefore, 'projAddrT1 should not have any rep staked on it before unstaking')
      assert.equal(0, stakedTokensAfter, 'projAddrT1 should not have any rep staked on it after repStaker1 unstakes')
      assert.equal(weiPoolBefore, weiPoolAfter, 'wei pool balance should not change')
      assert.equal(weiBalBefore, weiBalAfter, 'project wei balance should not change')
    })

    it('Reputation staker can unstake reputation from RR proposed project', async function () {
      // get reputation staked on the project
      let repToUnstake = await project.getStakedRep(projAddrR1)

      // take stock of variables
      let rsBalBefore = await utils.getRepBalance(repStaker1)
      let rsStakedRepBefore = await project.getUserStakedRep(repStaker1, projAddrR1)
      let stakedTokensBefore = await project.getStakedTokens(projAddrR1)
      let stakedRepBefore = await project.getStakedRep(projAddrR1)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let weiBalBefore = await project.getWeiBal(projAddrR1)

      // repStaker1 unstakes all of the reputation they had staked
      await RR.unstakeReputation(projAddrR1, repToUnstake, {from: repStaker1})

      // take stock of variables
      let rsBalAfter = await utils.getRepBalance(repStaker1)
      let rsStakedRepAfter = await project.getUserStakedRep(repStaker1, projAddrR1)
      let stakedTokensAfter = await project.getStakedTokens(projAddrR1)
      let stakedRepAfter = await project.getStakedRep(projAddrR1)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let weiBalAfter = await project.getWeiBal(projAddrR1)

      // checks
      assert.equal(rsBalBefore + repToUnstake, rsBalAfter, 'repStaker1\'s balance updated incorrectly')
      assert.equal(repToUnstake, rsStakedRepBefore, 'repStaker1 should not have any rep staked on projAddrR1 before unstaking')
      assert.equal(repToUnstake, stakedRepBefore, 'projAddrR1 should not have any rep staked on it before repStaker1 unstakes')
      assert.equal(0, rsStakedRepAfter, 'repStaker1 should have repToStake amount of rep staked on projAddrR1')
      assert.equal(0, stakedRepAfter, 'projAddrR1 should have a total of repToStake rep staked before unstaking')
      assert.equal(0, stakedTokensBefore, 'projAddrR1 should not have any rep staked on it before unstaking')
      assert.equal(0, stakedTokensAfter, 'projAddrR1 should not have any rep staked on it after repStaker1 unstakes')
      assert.equal(weiPoolBefore, weiPoolAfter, 'wei pool balance should not change')
      assert.equal(weiBalBefore, weiBalAfter, 'project wei balance should not change')
    })

    it('Token staker can stake extra tokens on TR proposed project but only the required amount of wei and tokens is sent', async function () {
      // get tokens required to fully stake the project
      let requiredTokens = await project.calculateRequiredTokens(projAddrT2)
      let tokensToStake = requiredTokens + 1

      // take stock of variables
      let weiCost = await project.getWeiCost(projAddrT2)

      let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let weiBalBefore = await project.getWeiBal(projAddrT2)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let tsStakedTokensBefore = await project.getUserStakedTokens(tokenStaker1, projAddrT2)
      let stakedTokensBefore = await project.getStakedTokens(projAddrT2)
      let stakedRepBefore = await project.getStakedRep(projAddrT2)

      // assert that tokenStaker1 has enough tokens for this
      assert.isAtLeast(tsBalBefore, tokensToStake, 'tokenStaker1 doesn\'t have enough tokens to stake this much on the project')

      // tokenStaker1 stakes all but one of the required tokens
      await TR.stakeTokens(projAddrT2, tokensToStake, {from: tokenStaker1})

      // take stock of variables
      let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let weiBalAfter = await project.getWeiBal(projAddrT2)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let tsStakedTokensAfter = await project.getUserStakedTokens(tokenStaker1, projAddrT2)
      let stakedTokensAfter = await project.getStakedTokens(projAddrT2)
      let stakedRepAfter = await project.getStakedRep(projAddrT2)

      // checks
      assert.equal(tsBalBefore, tsBalAfter + tokensToStake - 1, 'tokenStaker1\'s balance updated incorrectly')
      assert.equal(TRBalBefore + tokensToStake - 1, TRBalAfter, 'TR\'s balance updated incorrectly')
      assert.equal(weiBalAfter, weiCost, 'incorrect weiBalAfter')
      assert.equal(weiPoolBefore - weiPoolAfter, weiCost - weiBalBefore, 'incorrect weiPoolAfter')
      assert.equal(0, tsStakedTokensBefore, 'tokenStaker1 should not have any tokens staked on projAddrT2 before staking')
      assert.equal(0, stakedTokensBefore, 'projAddrT2 should not have any tokens staked on it before tokenStaker1 stakes')
      assert.equal(tokensToStake - 1, tsStakedTokensAfter, 'tokenStaker1 should have tokensToStake - 1 amount of tokens staked on projAddrT2')
      assert.equal(tokensToStake - 1, stakedTokensAfter, 'projAddrT2 should have a total of tokensToStake - 1 tokens staked before staking')
      assert.equal(0, stakedRepBefore, 'projAddrT2 should not have any rep staked on it before tokenStaker1 stakes')
      assert.equal(0, stakedRepAfter, 'projAddrT2 should not have any rep staked on it after tokenStaker1 stakes')
    })

    it('Token staker can stake extra tokens on RR proposed project but only the required amount of wei and tokens is sent', async function () {
      // get tokens required to fully stake the project
      let requiredTokens = await project.calculateRequiredTokens(projAddrR2)
      let tokensToStake = requiredTokens + 1

      // take stock of variables
      let weiCost = await project.getWeiCost(projAddrR2)

      let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let weiBalBefore = await project.getWeiBal(projAddrR2)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let tsStakedTokensBefore = await project.getUserStakedTokens(tokenStaker1, projAddrR2)
      let stakedTokensBefore = await project.getStakedTokens(projAddrR2)
      let stakedRepBefore = await project.getStakedRep(projAddrR2)

      // assert that tokenStaker1 has enough tokens for this
      assert.isAtLeast(tsBalBefore, tokensToStake, 'tokenStaker1 doesn\'t have enough tokens to stake this much on the project')

      // tokenStaker1 stakes all but one of the required tokens
      await TR.stakeTokens(projAddrR2, tokensToStake, {from: tokenStaker1})

      // take stock of variables
      let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let weiBalAfter = await project.getWeiBal(projAddrR2)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let tsStakedTokensAfter = await project.getUserStakedTokens(tokenStaker1, projAddrR2)
      let stakedTokensAfter = await project.getStakedTokens(projAddrR2)
      let stakedRepAfter = await project.getStakedRep(projAddrR2)

      // checks
      assert.equal(tsBalBefore, tsBalAfter + tokensToStake - 1, 'tokenStaker1\'s balance updated incorrectly')
      assert.equal(TRBalBefore + tokensToStake - 1, TRBalAfter, 'TR\'s balance updated incorrectly')
      assert.equal(weiBalAfter, weiCost, 'incorrect weiBalAfter')
      assert.equal(weiPoolBefore - weiPoolAfter, weiCost - weiBalBefore, 'incorrect weiPoolAfter')
      assert.equal(0, tsStakedTokensBefore, 'tokenStaker1 should not have any tokens staked on projAddrR2 before staking')
      assert.equal(0, stakedTokensBefore, 'projAddrR2 should not have any tokens staked on it before tokenStaker1 stakes')
      assert.equal(tokensToStake - 1, tsStakedTokensAfter, 'tokenStaker1 should have tokensToStake - 1 amount of tokens staked on projAddrR2')
      assert.equal(tokensToStake - 1, stakedTokensAfter, 'projAddrR2 should have a total of tokensToStake - 1 tokens staked before staking')
      assert.equal(0, stakedRepBefore, 'projAddrR2 should not have any rep staked on it before tokenStaker1 stakes')
      assert.equal(0, stakedRepAfter, 'projAddrR2 should not have any rep staked on it after tokenStaker1 stakes')
    })

    it('Reputation staker can stake extra reputation on TR proposed project but only the required amount of reputation is sent', async function () {
      // get reputation required to fully stake the project
      let requiredRep = await project.getRequiredReputation(projAddrT2)
      let repToStake = requiredRep + 1

      // take stock of variables
      let rsBalBefore = await utils.getRepBalance(repStaker1)
      let weiBalBefore = await project.getWeiBal(projAddrT2)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let rsStakedRepBefore = await project.getUserStakedRep(repStaker1, projAddrT2)
      let stakedTokensBefore = await project.getStakedTokens(projAddrT2)
      let stakedRepBefore = await project.getStakedRep(projAddrT2)

      // assert that tokenStaker1 has enough tokens for this
      assert.isAtLeast(rsBalBefore, repToStake, 'repStaker1 doesn\'t have enough reputation to stake this much on the project')

      // tokenStaker1 stakes all but one of the required tokens
      await RR.stakeReputation(projAddrT2, repToStake, {from: repStaker1})

      // take stock of variables
      let rsBalAfter = await utils.getRepBalance(repStaker1)
      let weiBalAfter = await project.getWeiBal(projAddrT2)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let tsStakedRepAfter = await project.getUserStakedRep(repStaker1, projAddrT2)
      let stakedTokensAfter = await project.getStakedTokens(projAddrT2)
      let stakedRepAfter = await project.getStakedRep(projAddrT2)

      // checks
      assert.equal(rsBalBefore, rsBalAfter + repToStake - 1, 'repStaker1\'s balance updated incorrectly')
      assert.equal(0, rsStakedRepBefore, 'repStaker1 should not have any reputation staked on projAddrT2 before staking')
      assert.equal(0, stakedRepBefore, 'projAddrT2 should not have any reputation staked on it before repStaker1 stakes')
      assert.equal(repToStake - 1, tsStakedRepAfter, 'repStaker1 should have repToStake - 1 amount of reputation staked on projAddrT2')
      assert.equal(repToStake - 1, stakedRepAfter, 'projAddrT2 should have a total of repToStake - 1 reputation staked before staking')
      assert.equal(stakedTokensAfter, stakedTokensBefore, 'staked tokens on projAddrT2 should not have changed')
      assert.equal(weiBalBefore, weiBalAfter, 'weiBal should not have changed')
      assert.equal(weiPoolBefore, weiPoolAfter, 'wei pool bal should not have changed')
    })

    it('Reputation staker can stake extra reputation on RR proposed project but only the required amount of reputation is sent', async function () {
      // get reputation required to fully stake the project
      let requiredRep = await project.getRequiredReputation(projAddrR2)
      let repToStake = requiredRep + 1

      // take stock of variables
      let rsBalBefore = await utils.getRepBalance(repStaker1)
      let weiBalBefore = await project.getWeiBal(projAddrR2)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let rsStakedRepBefore = await project.getUserStakedRep(repStaker1, projAddrR2)
      let stakedTokensBefore = await project.getStakedTokens(projAddrR2)
      let stakedRepBefore = await project.getStakedRep(projAddrR2)

      // assert that tokenStaker1 has enough tokens for this
      assert.isAtLeast(rsBalBefore, repToStake, 'repStaker1 doesn\'t have enough reputation to stake this much on the project')

      // tokenStaker1 stakes all but one of the required tokens
      await RR.stakeReputation(projAddrR2, repToStake, {from: repStaker1})

      // take stock of variables
      let rsBalAfter = await utils.getRepBalance(repStaker1)
      let weiBalAfter = await project.getWeiBal(projAddrR2)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let tsStakedRepAfter = await project.getUserStakedRep(repStaker1, projAddrR2)
      let stakedTokensAfter = await project.getStakedTokens(projAddrR2)
      let stakedRepAfter = await project.getStakedRep(projAddrR2)

      // checks
      assert.equal(rsBalBefore, rsBalAfter + repToStake - 1, 'repStaker1\'s balance updated incorrectly')
      assert.equal(0, rsStakedRepBefore, 'repStaker1 should not have any reputation staked on projAddrR2 before staking')
      assert.equal(0, stakedRepBefore, 'projAddrR2 should not have any reputation staked on it before repStaker1 stakes')
      assert.equal(repToStake - 1, tsStakedRepAfter, 'repStaker1 should have repToStake - 1 amount of reputation staked on projAddrR2')
      assert.equal(repToStake - 1, stakedRepAfter, 'projAddrR2 should have a total of repToStake - 1 reputation staked before staking')
      assert.equal(stakedTokensAfter, stakedTokensBefore, 'staked tokens on projAddrR2 should not have changed')
      assert.equal(weiBalBefore, weiBalAfter, 'weiBal should not have changed')
      assert.equal(weiPoolBefore, weiPoolAfter, 'wei pool bal should not have changed')
    })

    it('Multiple token stakers can stake TR proposed project', async function () {
      // refuel token stakers
      await utils.mintIfNecessary(tokenStaker1)
      await utils.mintIfNecessary(tokenStaker2)

      // get tokens required to fully stake the project
      let requiredTokens1 = await project.calculateRequiredTokens(projAddrT3)
      let tokensToStake1 = Math.floor(requiredTokens1 / 2)

      // take stock of variables
      let currentPrice = await utils.getCurrentPrice()

      let ts1BalBefore = await utils.getTokenBalance(tokenStaker1)
      let ts2BalBefore = await utils.getTokenBalance(tokenStaker2)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let weiBalBefore = await project.getWeiBal(projAddrT3)
      // let weiPoolBefore = await utils.getWeiPoolBal()
      let ts1StakedTokensBefore = await project.getUserStakedTokens(tokenStaker1, projAddrT3)
      let ts2StakedTokensBefore = await project.getUserStakedTokens(tokenStaker2, projAddrT3)
      let stakedTokensBefore = await project.getStakedTokens(projAddrT3)
      let stakedRepBefore = await project.getStakedRep(projAddrT3)

      // assert that tokenStaker1 has enough tokens for this
      assert.isAtLeast(ts1BalBefore, tokensToStake1, 'tokenStaker1 doesn\'t have enough tokens to stake this much on projAddrT3')

      // tokenStaker1 stakes all but one of the required tokens
      await TR.stakeTokens(projAddrT3, tokensToStake1, {from: tokenStaker1})

      // take stock of variables
      let ts1BalMiddle = await utils.getTokenBalance(tokenStaker1)
      let ts2BalMiddle = await utils.getTokenBalance(tokenStaker2)
      let TRBalMiddle = await utils.getTokenBalance(TR.address)
      let weiBalMiddle = await project.getWeiBal(projAddrT3)
      // let weiPoolMiddle = await utils.getWeiPoolBal()
      let ts1StakedTokensMiddle = await project.getUserStakedTokens(tokenStaker1, projAddrT3)
      let ts2StakedTokensMiddle = await project.getUserStakedTokens(tokenStaker2, projAddrT3)
      let stakedTokensMiddle = await project.getStakedTokens(projAddrT3)
      let stakedRepMiddle = await project.getStakedRep(projAddrT3)

      // checks
      assert.equal(ts1BalBefore - tokensToStake1, ts1BalMiddle, 'tokenStaker1\'s balance updated incorrectly')
      assert.equal(ts2BalBefore, ts2BalMiddle, 'tokenStaker2\'s balance shouldn\'t change')
      assert.equal(TRBalBefore + tokensToStake1, TRBalMiddle, 'TR\'s balance updated incorrectly')
      assert.equal(weiBalMiddle - weiBalBefore, currentPrice * tokensToStake1, 'incorrect weiBalMiddle')
      // assert.equal(weiPoolBefore - weiPoolAfter, currentPrice * tokensToStake1, 'incorrect weiPoolAfter') --> THIS HAS A WEIRD 50 WEI OFFSET. FIX THIS!
      assert.equal(0, ts1StakedTokensBefore, 'tokenStaker1 should not have any tokens staked on projAddrT3 before staking')
      assert.equal(0, ts2StakedTokensBefore, 'tokenStaker2 should not have any tokens staked on projAddrT3 before staking')
      assert.equal(0, stakedTokensBefore, 'projAddrT3 should not have any tokens staked on it before tokenStaker1 stakes')
      assert.equal(tokensToStake1, ts1StakedTokensMiddle, 'tokenStaker1 should have tokensToStake1 amount of tokens staked on projAddrT3')
      assert.equal(0, ts2StakedTokensMiddle, 'tokenStaker2 should have no tokens staked on projAddrT3 after tokenStaker 1 stakes')
      assert.equal(tokensToStake1, stakedTokensMiddle, 'projAddrT3 should have a total of tokensToStake1 tokens staked after tokenStaker1 stakes')
      assert.equal(0, stakedRepBefore, 'projAddrT3 should not have any rep staked on it before tokenStaker1 stakes')
      assert.equal(0, stakedRepMiddle, 'projAddrT3 should not have any rep staked on it after tokenStaker1 stakes')

      // get tokens required to fully stake the project
      let requiredTokens2 = await project.calculateRequiredTokens(projAddrT3)
      let tokensToStake2 = requiredTokens2 - 1

      // take stock of variables
      currentPrice = await utils.getCurrentPrice()

      // assert that tokenStaker1 has enough tokens for this
      assert.isAtLeast(ts1BalBefore, tokensToStake2, 'tokenStaker2 doesn\'t have enough tokens to stake this much on projAddrT3')

      // tokenStaker1 stakes all but one of the required tokens
      await TR.stakeTokens(projAddrT3, tokensToStake2, {from: tokenStaker2})

      // take stock of variables
      let ts1BalAfter = await utils.getTokenBalance(tokenStaker1)
      let ts2BalAfter = await utils.getTokenBalance(tokenStaker2)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let weiBalAfter = await project.getWeiBal(projAddrT3)
      // let weiPoolAfter = await utils.getWeiPoolBal()
      let ts1StakedTokensAfter = await project.getUserStakedTokens(tokenStaker1, projAddrT3)
      let ts2StakedTokensAfter = await project.getUserStakedTokens(tokenStaker2, projAddrT3)
      let stakedTokensAfter = await project.getStakedTokens(projAddrT3)
      let stakedRepAfter = await project.getStakedRep(projAddrT3)

      // checks
      assert.equal(ts1BalMiddle, ts1BalAfter, 'tokenStaker1\'s balance shouldn\'t change')
      assert.equal(ts2BalMiddle - tokensToStake2, ts2BalAfter, 'tokenStaker2\'s balance updated incorrectly')
      assert.equal(TRBalMiddle + tokensToStake2, TRBalAfter, 'TR\'s balance updated incorrectly')
      assert.equal(weiBalAfter - weiBalMiddle, currentPrice * tokensToStake2, 'incorrect weiBalAfter')
      // assert.equal(weiPoolBefore - weiPoolAfter, currentPrice * tokensToStake1, 'incorrect weiPoolAfter') --> THIS HAS A WEIRD 50 WEI OFFSET. FIX THIS!
      assert.equal(tokensToStake1, ts1StakedTokensAfter, 'tokenStaker1 should have tokensToStake1 tokens staked on projAddrT3 after staking')
      assert.equal(tokensToStake2, ts2StakedTokensAfter, 'tokenStaker2 should have tokensToStake2 tokens staked on projAddrT3 after staking')
      assert.equal(tokensToStake1 + tokensToStake2, stakedTokensAfter, 'projAddrT3 should have tokensToStake1 + tokensToStake2 tokens staked on it after tokenStaker1 and tokenStaker2 stakes')
      assert.equal(0, stakedRepAfter, 'projAddrT3 should not have any rep staked on it after tokenStaker1 and tokenStaker2 stakes')
    })

    it('Multiple token stakers can stake RR proposed project', async function () {
      // refuel token stakers
      await utils.mintIfNecessary(tokenStaker1)
      await utils.mintIfNecessary(tokenStaker2)

      // get tokens required to fully stake the project
      let requiredTokens1 = await project.calculateRequiredTokens(projAddrR3)
      let tokensToStake1 = Math.floor(requiredTokens1 / 2)

      // take stock of variables
      let currentPrice = await utils.getCurrentPrice()

      let ts1BalBefore = await utils.getTokenBalance(tokenStaker1)
      let ts2BalBefore = await utils.getTokenBalance(tokenStaker2)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let weiBalBefore = await project.getWeiBal(projAddrR3)
      // let weiPoolBefore = await utils.getWeiPoolBal()
      let ts1StakedTokensBefore = await project.getUserStakedTokens(tokenStaker1, projAddrR3)
      let ts2StakedTokensBefore = await project.getUserStakedTokens(tokenStaker2, projAddrR3)
      let stakedTokensBefore = await project.getStakedTokens(projAddrR3)
      let stakedRepBefore = await project.getStakedRep(projAddrR3)

      // assert that tokenStaker1 has enough tokens for this
      assert.isAtLeast(ts1BalBefore, tokensToStake1, 'tokenStaker1 doesn\'t have enough tokens to stake this much on projAddrR3')

      // tokenStaker1 stakes half the required tokens
      await TR.stakeTokens(projAddrR3, tokensToStake1, {from: tokenStaker1})

      // take stock of variables
      let ts1BalMiddle = await utils.getTokenBalance(tokenStaker1)
      let ts2BalMiddle = await utils.getTokenBalance(tokenStaker2)
      let TRBalMiddle = await utils.getTokenBalance(TR.address)
      let weiBalMiddle = await project.getWeiBal(projAddrR3)
      // let weiPoolMiddle = await utils.getWeiPoolBal()
      let ts1StakedTokensMiddle = await project.getUserStakedTokens(tokenStaker1, projAddrR3)
      let ts2StakedTokensMiddle = await project.getUserStakedTokens(tokenStaker2, projAddrR3)
      let stakedTokensMiddle = await project.getStakedTokens(projAddrR3)
      let stakedRepMiddle = await project.getStakedRep(projAddrR3)

      // checks
      assert.equal(ts1BalBefore - tokensToStake1, ts1BalMiddle, 'tokenStaker1\'s balance updated incorrectly')
      assert.equal(ts2BalBefore, ts2BalMiddle, 'tokenStaker2\'s balance shouldn\'t change')
      assert.equal(TRBalBefore + tokensToStake1, TRBalMiddle, 'TR\'s balance updated incorrectly')
      assert.equal(weiBalMiddle - weiBalBefore, currentPrice * tokensToStake1, 'incorrect weiBalMiddle')
      // assert.equal(weiPoolBefore - weiPoolAfter, currentPrice * tokensToStake1, 'incorrect weiPoolAfter') --> THIS HAS A WEIRD 50 WEI OFFSET. FIX THIS!
      assert.equal(0, ts1StakedTokensBefore, 'tokenStaker1 should not have any tokens staked on projAddrR3 before staking')
      assert.equal(0, ts2StakedTokensBefore, 'tokenStaker2 should not have any tokens staked on projAddrR3 before staking')
      assert.equal(0, stakedTokensBefore, 'projAddrR3 should not have any tokens staked on it before tokenStaker1 stakes')
      assert.equal(tokensToStake1, ts1StakedTokensMiddle, 'tokenStaker1 should have tokensToStake1 amount of tokens staked on projAddrR3')
      assert.equal(0, ts2StakedTokensMiddle, 'tokenStaker2 should have no tokens staked on projAddrR3 after tokenStaker 1 stakes')
      assert.equal(tokensToStake1, stakedTokensMiddle, 'projAddrR3 should have a total of tokensToStake1 tokens staked after tokenStaker1 stakes')
      assert.equal(0, stakedRepBefore, 'projAddrR3 should not have any rep staked on it before tokenStaker1 stakes')
      assert.equal(0, stakedRepMiddle, 'projAddrR3 should not have any rep staked on it after tokenStaker1 stakes')

      // get tokens required to fully stake the project
      let requiredTokens2 = await project.calculateRequiredTokens(projAddrR3)
      let tokensToStake2 = requiredTokens2 - 1

      // take stock of variables
      currentPrice = await utils.getCurrentPrice()

      // assert that tokenStaker2 has enough tokens for this
      assert.isAtLeast(ts2BalBefore, tokensToStake2, 'tokenStaker2 doesn\'t have enough tokens to stake this much on projAddrR3')

      // tokenStaker2 stakes all but one of the required tokens
      await TR.stakeTokens(projAddrR3, tokensToStake2, {from: tokenStaker2})

      // take stock of variables
      let ts1BalAfter = await utils.getTokenBalance(tokenStaker1)
      let ts2BalAfter = await utils.getTokenBalance(tokenStaker2)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let weiBalAfter = await project.getWeiBal(projAddrR3)
      // let weiPoolAfter = await utils.getWeiPoolBal()
      let ts1StakedTokensAfter = await project.getUserStakedTokens(tokenStaker1, projAddrR3)
      let ts2StakedTokensAfter = await project.getUserStakedTokens(tokenStaker2, projAddrR3)
      let stakedTokensAfter = await project.getStakedTokens(projAddrR3)
      let stakedRepAfter = await project.getStakedRep(projAddrR3)

      // checks
      assert.equal(ts1BalMiddle, ts1BalAfter, 'tokenStaker1\'s balance shouldn\'t change')
      assert.equal(ts2BalMiddle - tokensToStake2, ts2BalAfter, 'tokenStaker2\'s balance updated incorrectly')
      assert.equal(TRBalMiddle + tokensToStake2, TRBalAfter, 'TR\'s balance updated incorrectly')
      assert.equal(weiBalAfter - weiBalMiddle, currentPrice * tokensToStake2, 'incorrect weiBalAfter')
      // assert.equal(weiPoolBefore - weiPoolAfter, currentPrice * tokensToStake1, 'incorrect weiPoolAfter') --> THIS HAS A WEIRD 50 WEI OFFSET. FIX THIS!
      assert.equal(tokensToStake1, ts1StakedTokensAfter, 'tokenStaker1 should have tokensToStake1 tokens staked on projAddrR3 after staking')
      assert.equal(tokensToStake2, ts2StakedTokensAfter, 'tokenStaker2 should have tokensToStake2 tokens staked on projAddrR3 after staking')
      assert.equal(tokensToStake1 + tokensToStake2, stakedTokensAfter, 'projAddrR3 should have tokensToStake1 + tokensToStake2 tokens staked on it after tokenStaker1 and tokenStaker2 stakes')
      assert.equal(0, stakedRepAfter, 'projAddrR3 should not have any rep staked on it after tokenStaker1 and tokenStaker2 stakes')
    })

    it('Multiple reputation stakers can stake TR proposed project', async function () {
      // get reputation required to fully stake the project
      let requiredRep1 = await project.getRequiredReputation(projAddrT3)
      let repToStake1 = Math.floor(requiredRep1 / 30) // running out of reputation

      // take stock of variables
      let rs1BalBefore = await utils.getRepBalance(repStaker1)
      let rs2BalBefore = await utils.getRepBalance(repStaker2)
      let weiBalBefore = await project.getWeiBal(projAddrT3)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let rs1StakedRepBefore = await project.getUserStakedRep(repStaker1, projAddrT3)
      let rs2StakedRepBefore = await project.getUserStakedRep(repStaker2, projAddrT3)
      let stakedTokensBefore = await project.getStakedTokens(projAddrT3)
      let stakedRepBefore = await project.getStakedRep(projAddrT3)

      // assert that repStaker1 has enough reputation for this
      assert.isAtLeast(rs1BalBefore, repToStake1, 'repStaker1 doesn\'t have enough reputation to stake this much on projAddrT3')

      // repStaker1 stakes half the required reputation
      await RR.stakeReputation(projAddrT3, repToStake1, {from: repStaker1})

      // take stock of variables
      let rs1BalMiddle = await utils.getRepBalance(repStaker1)
      let rs2BalMiddle = await utils.getRepBalance(repStaker2)
      let weiBalMiddle = await project.getWeiBal(projAddrT3)
      let weiPoolMiddle = await utils.getWeiPoolBal()
      let rs1StakedRepMiddle = await project.getUserStakedRep(repStaker1, projAddrT3)
      let rs2StakedRepMiddle = await project.getUserStakedRep(repStaker2, projAddrT3)
      let stakedTokensMiddle = await project.getStakedTokens(projAddrT3)
      let stakedRepMiddle = await project.getStakedRep(projAddrT3)

      // checks
      assert.equal(rs1BalBefore - repToStake1, rs1BalMiddle, 'repStaker1\'s balance updated incorrectly')
      assert.equal(rs2BalBefore, rs2BalMiddle, 'repStaker2\'s balance shouldn\'t change')
      assert.equal(weiBalMiddle, weiBalBefore, 'weiBal shouldn\'t change')
      assert.equal(weiPoolMiddle, weiPoolBefore, 'weiPool shouldn\'t change')
      assert.equal(0, rs1StakedRepBefore, 'repStaker1 should not have any reputation staked on projAddrT3 before staking')
      assert.equal(0, rs2StakedRepBefore, 'repStaker2 should not have any reputation staked on projAddrT3 before staking')
      assert.equal(0, stakedRepBefore, 'projAddrT3 should not have any reputation staked on it before repStaker1 stakes')
      assert.equal(repToStake1, rs1StakedRepMiddle, 'repStaker1 should have repToStake1 amount of reputation staked on projAddrT3')
      assert.equal(0, rs2StakedRepMiddle, 'repStaker2 should have no reputation staked on projAddrT3 after repStaker1 stakes')
      assert.equal(repToStake1, stakedRepMiddle, 'projAddrT3 should have a total of repToStake1 tokens staked after repStaker1 stakes')
      assert.equal(stakedTokensMiddle, stakedTokensBefore, 'staked tokens should not change')

      // get reputation required to fully stake the project
      let requiredRep2 = await project.getRequiredReputation(projAddrT3)
      let repToStake2 = Math.floor(requiredRep2 / 30) // running out of reputation

      // assert that repStaker1 has enough reputation for this
      assert.isAtLeast(rs2BalBefore, repToStake2, 'repStaker2 doesn\'t have enough reputation to stake this much on projAddrT3')

      // repStaker2 stakes all but one of the required reputation
      await RR.stakeReputation(projAddrT3, repToStake2, {from: repStaker2})

      // take stock of variables
      let rs1BalAfter = await utils.getRepBalance(repStaker1)
      let rs2BalAfter = await utils.getRepBalance(repStaker2)
      let weiBalAfter = await project.getWeiBal(projAddrT3)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let rs1StakedRepAfter = await project.getUserStakedRep(repStaker1, projAddrT3)
      let rs2StakedRepAfter = await project.getUserStakedRep(repStaker2, projAddrT3)
      let stakedTokensAfter = await project.getStakedTokens(projAddrT3)
      let stakedRepAfter = await project.getStakedRep(projAddrT3)

      // checks
      assert.equal(rs1BalMiddle, rs1BalAfter, 'repStaker1\'s balance shouldn\'t change')
      assert.equal(rs2BalMiddle - repToStake2, rs2BalAfter, 'repStaker2\'s balance updated incorrectly')
      assert.equal(weiBalAfter, weiBalMiddle, 'weiBal should\'nt change')
      assert.equal(weiPoolAfter, weiPoolMiddle, 'weiPool shouldn\'t change')
      assert.equal(repToStake1, rs1StakedRepAfter, 'repStaker1 should have repToStake1 reputation staked on projAddrT3 after staking')
      assert.equal(repToStake2, rs2StakedRepAfter, 'repStaker2 should have repToStake2 reputation staked on projAddrT3 after staking')
      assert.equal(repToStake1 + repToStake2, stakedRepAfter, 'projAddrT3 should have repToStake1 + repToStake2 tokens staked on it after tokenStaker1 and tokenStaker2 stakes')
      assert.equal(stakedTokensAfter, stakedTokensMiddle, 'staked tokens should not change')
    })

    it('Multiple reputation stakers can stake RR proposed project', async function () {
      // get reputation required to fully stake the project
      let requiredRep1 = await project.getRequiredReputation(projAddrR3)
      let repToStake1 = Math.floor(requiredRep1 / 30) // running out of reputation

      // take stock of variables
      let rs1BalBefore = await utils.getRepBalance(repStaker1)
      let rs2BalBefore = await utils.getRepBalance(repStaker2)
      let weiBalBefore = await project.getWeiBal(projAddrR3)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let rs1StakedRepBefore = await project.getUserStakedRep(repStaker1, projAddrR3)
      let rs2StakedRepBefore = await project.getUserStakedRep(repStaker2, projAddrR3)
      let stakedTokensBefore = await project.getStakedTokens(projAddrR3)
      let stakedRepBefore = await project.getStakedRep(projAddrR3)

      // assert that repStaker1 has enough reputation for this
      assert.isAtLeast(rs1BalBefore, repToStake1, 'repStaker1 doesn\'t have enough reputation to stake this much on projAddrR3')

      // repStaker1 stakes half the required reputation
      await RR.stakeReputation(projAddrR3, repToStake1, {from: repStaker1})

      // take stock of variables
      let rs1BalMiddle = await utils.getRepBalance(repStaker1)
      let rs2BalMiddle = await utils.getRepBalance(repStaker2)
      let weiBalMiddle = await project.getWeiBal(projAddrR3)
      let weiPoolMiddle = await utils.getWeiPoolBal()
      let rs1StakedRepMiddle = await project.getUserStakedRep(repStaker1, projAddrR3)
      let rs2StakedRepMiddle = await project.getUserStakedRep(repStaker2, projAddrR3)
      let stakedTokensMiddle = await project.getStakedTokens(projAddrR3)
      let stakedRepMiddle = await project.getStakedRep(projAddrR3)

      // checks
      assert.equal(rs1BalBefore - repToStake1, rs1BalMiddle, 'repStaker1\'s balance updated incorrectly')
      assert.equal(rs2BalBefore, rs2BalMiddle, 'repStaker2\'s balance shouldn\'t change')
      assert.equal(weiBalMiddle, weiBalBefore, 'weiBal shouldn\'t change')
      assert.equal(weiPoolMiddle, weiPoolBefore, 'weiPool shouldn\'t change')
      assert.equal(0, rs1StakedRepBefore, 'repStaker1 should not have any reputation staked on projAddrR3 before staking')
      assert.equal(0, rs2StakedRepBefore, 'repStaker2 should not have any reputation staked on projAddrR3 before staking')
      assert.equal(0, stakedRepBefore, 'projAddrR3 should not have any reputation staked on it before repStaker1 stakes')
      assert.equal(repToStake1, rs1StakedRepMiddle, 'repStaker1 should have repToStake1 amount of reputation staked on projAddrR3')
      assert.equal(0, rs2StakedRepMiddle, 'repStaker2 should have no reputation staked on projAddrR3 after repStaker1 stakes')
      assert.equal(repToStake1, stakedRepMiddle, 'projAddrR3 should have a total of repToStake1 tokens staked after repStaker1 stakes')
      assert.equal(stakedTokensMiddle, stakedTokensBefore, 'staked tokens should not change')

      // get reputation required to fully stake the project
      let requiredRep2 = await project.getRequiredReputation(projAddrR3)
      let repToStake2 = Math.floor(requiredRep2 / 30) // running out of reputation

      // assert that repStaker1 has enough reputation for this
      assert.isAtLeast(rs2BalBefore, repToStake2, 'repStaker2 doesn\'t have enough reputation to stake this much on projAddrR3')

      // repStaker2 stakes all but one of the required reputation
      await RR.stakeReputation(projAddrR3, repToStake2, {from: repStaker2})

      // take stock of variables
      let rs1BalAfter = await utils.getRepBalance(repStaker1)
      let rs2BalAfter = await utils.getRepBalance(repStaker2)
      let weiBalAfter = await project.getWeiBal(projAddrR3)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let rs1StakedRepAfter = await project.getUserStakedRep(repStaker1, projAddrR3)
      let rs2StakedRepAfter = await project.getUserStakedRep(repStaker2, projAddrR3)
      let stakedTokensAfter = await project.getStakedTokens(projAddrR3)
      let stakedRepAfter = await project.getStakedRep(projAddrR3)

      // checks
      assert.equal(rs1BalMiddle, rs1BalAfter, 'repStaker1\'s balance shouldn\'t change')
      assert.equal(rs2BalMiddle - repToStake2, rs2BalAfter, 'repStaker2\'s balance updated incorrectly')
      assert.equal(weiBalAfter, weiBalMiddle, 'weiBal should\'nt change')
      assert.equal(weiPoolAfter, weiPoolMiddle, 'weiPool shouldn\'t change')
      assert.equal(repToStake1, rs1StakedRepAfter, 'repStaker1 should have repToStake1 reputation staked on projAddrR3 after staking')
      assert.equal(repToStake2, rs2StakedRepAfter, 'repStaker2 should have repToStake2 reputation staked on projAddrR3 after staking')
      assert.equal(repToStake1 + repToStake2, stakedRepAfter, 'projAddrR3 should have repToStake1 + repToStake2 tokens staked on it after tokenStaker1 and tokenStaker2 stakes')
      assert.equal(stakedTokensAfter, stakedTokensMiddle, 'staked tokens should not change')
    })

    it('Not staker can\'t stake tokens they don\'t have on TR proposed project', async function () {
      errorThrown = false
      try {
        await TR.stakeTokens(projAddrT4, 1, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Not staker can\'t stake tokens they don\'t have on RR proposed project', async function () {
      errorThrown = false
      try {
        await TR.stakeTokens(projAddrR4, 1, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Not staker can\'t stake reputation they don\'t have on TR proposed project', async function () {
      errorThrown = false
      try {
        await RR.stakeReputation(projAddrT4, 1, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Not staker can\'t stake reputation they don\'t have on RR proposed project', async function () {
      errorThrown = false
      try {
        await RR.stakeReputation(projAddrR4, 1, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Not staker can\'t unstake tokens they don\'t have from TR proposed project', async function () {
      errorThrown = false
      try {
        await TR.unstakeTokens(projAddrT4, 1, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Not staker can\'t unstake tokens they don\'t have from RR proposed project', async function () {
      errorThrown = false
      try {
        await TR.unstakeTokens(projAddrR4, 1, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Not staker can\'t unstake reputation they don\'t have from TR proposed project', async function () {
      errorThrown = false
      try {
        await RR.unstakeReputation(projAddrT4, 1, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Not staker can\'t unstake reputation they don\'t have from RR proposed project', async function () {
      errorThrown = false
      try {
        await RR.unstakeReputation(projAddrR4, 1, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('staking on nonexistant projects', () => {
    it('Token staker can\'t stake tokens on nonexistant project', async function () {
      // make sure token staker has tokens
      utils.mintIfNecessary(tokenStaker1, 1)

      // check for error
      errorThrown = false
      try {
        await TR.stakeTokens(notProject, 1, {from: tokenStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
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
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('refund proposer on proposed projects', () => {
    it('Refund proposer can\'t be called on TR proposed project while still in propose period', async function () {
      errorThrown = false
      try {
        await TR.refundProposer(projAddrT4, {from: tokenProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Refund proposer can\'t be called on RR proposed project while still in propose period', async function () {
      errorThrown = false
      try {
        await RR.refundProposer(projAddrR4, {from: repProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')

        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('refund staker on proposed projects', () => {
    it('Refund token staker can\'t be called on TR proposed project while still in propose period', async function () {
      // make sure token staker has something staked on the project
      await utils.mintIfNecessary(tokenStaker1, 1)
      await TR.stakeTokens(projAddrT4, 1, {from: tokenStaker1})

      // check for error
      errorThrown = false
      try {
        await TR.refundStaker(projAddrT4, {from: tokenStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Refund token staker can\'t be called on RR proposed project while still in propose period', async function () {
      // make sure token staker has something staked on the project
      await utils.mintIfNecessary(tokenStaker1, 1)
      await TR.stakeTokens(projAddrR4, 1, {from: tokenStaker1})

      // check for error
      errorThrown = false
      try {
        await TR.refundStaker(projAddrR4, {from: tokenStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Refund reputation staker can\'t be called on TR proposed project while still in propose period', async function () {
      // make sure reputation staker has something staked on the project
      await utils.register(repStaker1)
      await RR.stakeReputation(projAddrT4, 1, {from: repStaker1})

      // check for error
      errorThrown = false
      try {
        await RR.refundStaker(projAddrT4, {from: repStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Refund reputation staker can\'t be called on RR proposed project while still in propose period', async function () {
      // make sure reputation staker has something staked on the project
      await utils.register(repStaker1)
      await RR.stakeReputation(projAddrR4, 1, {from: repStaker1})

      // check for error
      errorThrown = false
      try {
        await RR.refundStaker(projAddrR4, {from: repStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('state changes on understaked proposed projects', () => {
    it('checkStaked() does not change TR proposed project to staked if not fully staked', async function () {
      // take stock of variables
      let stateBefore = await project.getState(projAddrT4)

      // attempt to checkStaked
      await PR.checkStaked(projAddrT4)

      // take stock of variables
      let stateAfter = await project.getState(projAddrT4)

      // checks
      assert.equal(stateBefore, 1, 'state before should be 1')
      assert.equal(stateAfter, 1, 'state should not have changed')
    })

    it('checkStaked() does not change RR proposed project to staked if not fully staked', async function () {
      // take stock of variables
      let stateBefore = await project.getState(projAddrR4)

      // attempt to checkStaked
      await PR.checkStaked(projAddrR4)

      // take stock of variables
      let stateAfter = await project.getState(projAddrR4)

      // checks
      assert.equal(stateBefore, 1, 'state before should be 1')
      assert.equal(stateAfter, 1, 'state should not have changed')
    })
  })

  describe('state changes on fully staked proposed projects', () => {
    it('Fully staked TR proposed project automatically transitions into staked period', async function () {
      // take stock of variables
      let state = await project.getState(projAddrT2)

      // checks
      assert.equal(state, 2, 'state before should be 2')
      // need a nextDeadline update check
    })

    it('Fully staked RR proposed project automatically transitions into staked period', async function () {
      // take stock of variables
      let state = await project.getState(projAddrR2)

      // checks
      assert.equal(state, 2, 'state before should be 2')
      // need a nextDeadline update check
    })
  })

  describe('staking on staked projects', () => {
    it('Token staker can no longer call unstake token on TR proposed project once in the staked period', async function () {
      // take stock of variables
      let tsBal = await project.getUserStakedTokens(tokenStaker1, projAddrT2)

      // assert that tokenStaker1 has tokens staked on the project
      assert.isAtLeast(tsBal, 1, 'tokenStaker1 has no tokens staked on projAddrT2')

      // check for error
      errorThrown = false
      try {
        await TR.unstakeTokens(projAddrT2, 1, {from: tokenStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Token staker can no longer call unstake token on RR proposed project once in the staked period', async function () {
      // take stock of variables
      let tsBal = await project.getUserStakedTokens(tokenStaker1, projAddrR2)

      // assert that tokenStaker1 has tokens staked on the project
      assert.isAtLeast(tsBal, 1, 'tokenStaker1 has no tokens staked on projAddrR2')

      // check for error
      errorThrown = false
      try {
        await TR.unstakeTokens(projAddrR2, 1, {from: tokenStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Reputation staker can no longer call unstake reputation on TR proposed project once in the staked period', async function () {
      // take stock of variables
      let rsBal = await project.getUserStakedRep(repStaker1, projAddrT2)

      // assert that repStaker1 has reputation staked on the project
      assert.isAtLeast(rsBal, 1, 'repStaker1 has no reputation staked on projAddrT')

      // check for error
      errorThrown = false
      try {
        await RR.unstakeReputation(projAddrT2, 1, {from: repStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Reputation staker can no longer call unstake reputation on RR proposed project once in the staked period', async function () {
      // take stock of variables
      let rsBal = await project.getUserStakedRep(repStaker1, projAddrR2)

      // assert that repStaker1 has reputation staked on the project
      assert.isAtLeast(rsBal, 1, 'repStaker1 has no reputation staked on projAddrR2')

      // check for error
      errorThrown = false
      try {
        await RR.unstakeReputation(projAddrR2, 1, {from: repStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('refund proposer on staked projects', () => {
    it('Not proposer can\'t call refund proposer from token registry', async function () {
      errorThrown = false
      try {
        await TR.refundProposer(projAddrT2, {from: notProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Not proposer can\'t call refund proposer from reputation registry', async function () {
      errorThrown = false
      try {
        await RR.refundProposer(projAddrR2, {from: notProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    // these two tests must come after not proposer refund proposer tests
    it('Refund proposer can be called on TR proposed project after it is fully staked', async function () {
      // take stock of variables
      let weiCost = await project.getWeiCost(projAddrT2)

      let tpBalBefore = await utils.getTokenBalance(tokenProposer)
      let TRBalBefore = await utils.getTokenBalance(TR.address)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let proposerStakeBefore = await project.getProposerStake(projAddrT2)

      // call refund proposer
      await TR.refundProposer(projAddrT2, {from: tokenProposer})

      // take stock of variables
      let tpBalAfter = await utils.getTokenBalance(tokenProposer)
      let TRBalAfter = await utils.getTokenBalance(TR.address)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let proposerStakeAfter = await project.getProposerStake(projAddrT2)

      // checks
      assert.equal(tpBalBefore + proposerStakeBefore, tpBalAfter, 'tokenProposer balance updated incorrectly')
      assert.equal(TRBalBefore, TRBalAfter + proposerStakeBefore, 'TR balance updated incorrectly')
      assert.equal(weiPoolBefore, weiPoolAfter + Math.floor(weiCost / 100), 'incorrect wei reward returned')
      assert.equal(proposerStakeAfter, 0, 'proposer stake should have been zeroed out')
    })

    it('Refund proposer can be called on RR proposed project after it is fully staked', async function () {
      // take stock of variables
      let weiCost = await project.getWeiCost(projAddrR2)

      let rpBalBefore = await utils.getRepBalance(repProposer)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let proposerStakeBefore = await project.getProposerStake(projAddrR2)

      // call refund proposer
      await RR.refundProposer(projAddrR2, {from: repProposer})

      // take stock of variables
      let rpBalAfter = await utils.getRepBalance(repProposer)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let proposerStakeAfter = await project.getProposerStake(projAddrR2)

      // checks
      assert.equal(rpBalBefore + proposerStakeBefore, rpBalAfter, 'repProposer balance updated incorrectly')
      assert.equal(weiPoolBefore, weiPoolAfter + Math.floor(weiCost / 100), 'incorrect wei reward returned')
      assert.equal(proposerStakeAfter, 0, 'proposer stake should have been zeroed out')
    })

    it('Proposer can\'t call refund proposer multiple times from token registry', async function () {
      errorThrown = false
      try {
        await TR.refundProposer(projAddrR2, {from: tokenProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Proposer can\'t call refund proposer multiple times from reputation registry', async function () {
      errorThrown = false
      try {
        await RR.refundProposer(projAddrR2, {from: notProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('refund staker on staked projects', () => {
    it('Refund token staker can\'t be called on TR proposed project once it is staked', async function () {
      // take stock of variables
      let tsBal = await project.getUserStakedTokens(tokenStaker1, projAddrT2)

      // assert that tokenStaker1 has tokens staked on projAddrT2
      assert.isAtLeast(tsBal, 1, 'tokenStaker1 has no tokens staked on projAddrT2')

      // check for error
      errorThrown = false
      try {
        await TR.refundStaker(projAddrT2, {from: tokenStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Refund token staker can\'t be called on RR proposed project once it is staked', async function () {
      // take stock of variables
      let tsBal = await project.getUserStakedTokens(tokenStaker1, projAddrR2)

      // assert that tokenStaker1 has tokens staked on projAddrR2
      assert.isAtLeast(tsBal, 1, 'tokenStaker1 has no tokens staked on projAddrR2')

      // check for error
      errorThrown = false
      try {
        await TR.refundStaker(projAddrR2, {from: tokenStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Refund reputation staker can\'t be called on TR proposed project once it is staked', async function () {
      // take stock of variables
      let rsBal = await project.getUserStakedRep(repStaker1, projAddrT2)

      // assert that tokenStaker1 has tokens staked on projAddrT2
      assert.isAtLeast(rsBal, 1, 'repStaker1 has no repsutation staked on projAddrT2')

      // check for error
      errorThrown = false
      try {
        await RR.refundStaker(projAddrT2, {from: repStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('Refund reputation staker can\'t be called on RR proposed project once it is staked', async function () {
      // take stock of variables
      let rsBal = await project.getUserStakedRep(repStaker1, projAddrR2)

      // assert that tokenStaker1 has tokens staked on projAddrR2
      assert.isAtLeast(rsBal, 1, 'repStaker1 has no repsutation staked on projAddrR2')

      // check for error
      errorThrown = false
      try {
        await RR.refundStaker(projAddrR2, {from: repStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('time out state changes', () => {
    before(async function () {
      // fast forward time
      evmIncreaseTime(604800) // fast forward time 1 week
      projObj.time.fastForward +=1
    })

    it('TR proposed project becomes expired if not staked at staking deadline', async function () {
      // take stock of variables
      let stateBefore = await project.getState(projAddrT4)

      // call checkStaked()
      await PR.checkStaked(projAddrT4)

      // take stock of variables
      let stateAfter = await project.getState(projAddrT4)

      // checks
      assert.equal(stateBefore, 1, 'state before should be 1')
      assert.equal(stateAfter, 8, 'state after should be 8')
    })

    it('RR proposed project becomes expired if not staked at staking deadline', async function () {
      // take stock of variables
      let stateBefore = await project.getState(projAddrR4)

      // call checkStaked()
      await PR.checkStaked(projAddrR4)

      // take stock of variables
      let stateAfter = await project.getState(projAddrR4)

      // checks
      assert.equal(stateBefore, 1, 'state before should be 1')
      assert.equal(stateAfter, 8, 'state after should be 8')
    })
  })

  describe('refund proposer on expired projects', () => {
    it('proposer can\'t call refund proposer for expired TR proposed project', async function () {
      errorThrown = false
      try {
        await TR.refundProposer(projAddrT4, {from: tokenProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('proposer can\'t call refund proposer for expired RR proposed project', async function () {
      errorThrown = false
      try {
        await RR.refundProposer(projAddrT4, {from: repProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      assertThrown(errorThrown, 'An error should have been thrown')
    })
  })
})
