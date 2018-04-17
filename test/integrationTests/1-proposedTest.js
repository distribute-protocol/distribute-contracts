const Project = artifacts.require('Project')

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
const evmIncreaseTime = require('../utils/evmIncreaseTime')

contract('Proposed State', (accounts) => {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let TR, RR, PR
  let {tokenProposer, repProposer} = projObj.user
  let {tokenStaker1, tokenStaker2} = projObj.user
  let {repStaker1, repStaker2, notStaker, notProject} = projObj.user
  let {project, utils, returnProject} = projObj

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

    // propose projects
    // to check staking below required amount, unstaking
    projAddrT1 = await returnProject.proposed_T()
    projAddrR1 = await returnProject.proposed_R()

    // to check staking extra above required amount
    projAddrT2 = await returnProject.proposed_T()
    projAddrR2 = await returnProject.proposed_R()

    // to check staking by multiple stakers & state change to staked
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

      // take stock of variables before staking
      let currentPrice = await utils.getCurrentPrice()

      let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
      let weiBalBefore = await project.getWeiBal(projAddrT1)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let tsStakedTokensBefore = await project.getUserStakedTokens(tokenStaker1, projAddrT1)
      let stakedTokensBefore = await project.getStakedTokens(projAddrT1)
      let stakedRepBefore = await project.getStakedRep(projAddrT1)

      // assert that tokenStaker1 has enough tokens for this
      assert.isAtLeast(tsBalBefore, tokensToStake, 'tokenStaker1 doesn\'t have enough tokens to stake this much on projAddrT1')

      // tokenStaker1 stakes all but one of the required tokens
      await TR.stakeTokens(projAddrT1, tokensToStake, {from: tokenStaker1})

      // take stock of tokenStaker1's token balance after staking
      let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
      let weiBalAfter = await project.getWeiBal(projAddrT1)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let tsStakedTokensAfter = await project.getUserStakedTokens(tokenStaker1, projAddrT1)
      let stakedTokensAfter = await project.getStakedTokens(projAddrT1)
      let stakedRepAfter = await project.getStakedRep(projAddrT1)

      // checks
      assert.equal(tsBalBefore, tsBalAfter + tokensToStake, 'tokenStaker1\'s balance updated incorrectly')
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

      // take stock of variables before staking
      let currentPrice = await utils.getCurrentPrice()

      let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
      let weiBalBefore = await project.getWeiBal(projAddrR1)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let tsStakedTokensBefore = await project.getUserStakedTokens(tokenStaker1, projAddrR1)
      let stakedTokensBefore = await project.getStakedTokens(projAddrR1)
      let stakedRepBefore = await project.getStakedRep(projAddrR1)

      // assert that tokenStaker1 has enough tokens for this
      assert.isAtLeast(tsBalBefore, tokensToStake, 'repStaker1 doesn\'t have enough tokens to stake this much on the project')

      // tokenStaker1 stakes all but one of the required tokens
      await TR.stakeTokens(projAddrR1, tokensToStake, {from: tokenStaker1})

      // take stock of tokenStaker1's token balance after staking
      let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
      let weiBalAfter = await project.getWeiBal(projAddrR1)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let tsStakedTokensAfter = await project.getUserStakedTokens(tokenStaker1, projAddrR1)
      let stakedTokensAfter = await project.getStakedTokens(projAddrR1)
      let stakedRepAfter = await project.getStakedRep(projAddrR1)

      // checks
      assert.equal(tsBalBefore, tsBalAfter + tokensToStake, 'tokenStaker1\'s balance updated incorrectly')
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

      // take stock of variables before unstaking
      let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let weiBalBefore = await project.getWeiBal(projAddrT1)
      let tsStakedTokensBefore = await project.getUserStakedTokens(tokenStaker1, projAddrT1)
      let stakedTokensBefore = await project.getStakedTokens(projAddrT1)
      let stakedRepBefore = await project.getStakedRep(projAddrT1)

      // tokenStaker1 unstakes all
      await TR.unstakeTokens(projAddrT1, tokensToUnstake, {from: tokenStaker1})

      // take stock of tokenStaker1's token balance after staking
      let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let weiBalAfter = await project.getWeiBal(projAddrT1)
      let tsStakedTokensAfter = await project.getUserStakedTokens(tokenStaker1, projAddrT1)
      let stakedTokensAfter = await project.getStakedTokens(projAddrT1)
      let stakedRepAfter = await project.getStakedRep(projAddrT1)

      // checks
      assert.equal(tsBalBefore + tokensToUnstake, tsBalAfter, 'tokenStaker1\'s balance updated incorrectly')
      // assert.equal(weiPoolBefore - weiPoolAfter, currentPrice * tokensToStake, 'incorrect weiPoolAfter') --> THIS HAS A WEIRD 50 WEI OFFSET. FIX THIS!
      assert.equal(weiBalAfter, 0, 'incorrect weiBalAfter')
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

      // take stock of variables before unstaking
      let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let weiBalBefore = await project.getWeiBal(projAddrR1)
      let tsStakedTokensBefore = await project.getUserStakedTokens(tokenStaker1, projAddrR1)
      let stakedTokensBefore = await project.getStakedTokens(projAddrR1)
      let stakedRepBefore = await project.getStakedRep(projAddrR1)

      // tokenStaker1 unstakes all
      await TR.unstakeTokens(projAddrR1, tokensToUnstake, {from: tokenStaker1})

      // take stock of tokenStaker1's token balance after staking
      let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let weiBalAfter = await project.getWeiBal(projAddrR1)
      let tsStakedTokensAfter = await project.getUserStakedTokens(tokenStaker1, projAddrR1)
      let stakedTokensAfter = await project.getStakedTokens(projAddrR1)
      let stakedRepAfter = await project.getStakedRep(projAddrR1)

      // checks
      assert.equal(tsBalBefore + tokensToUnstake, tsBalAfter, 'tokenStaker1\'s balance updated incorrectly')
      // assert.equal(weiPoolBefore - weiPoolAfter, currentPrice * tokensToStake, 'incorrect weiPoolAfter') --> THIS HAS A WEIRD 50 WEI OFFSET. FIX THIS!
      assert.equal(weiBalAfter, 0, 'incorrect weiBalAfter')
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

      // take stock of variables before staking
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

      // take stock of variables after staking
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

      // take stock of variables before staking
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

      // take stock of variables after staking
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

      // take stock of variables before unstaking
      let rsBalBefore = await utils.getRepBalance(repStaker1)
      let rsStakedRepBefore = await project.getUserStakedRep(repStaker1, projAddrT1)
      let stakedTokensBefore = await project.getStakedTokens(projAddrT1)
      let stakedRepBefore = await project.getStakedRep(projAddrT1)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let weiBalBefore = await project.getWeiBal(projAddrT1)

      // repStaker1 unstakes all of the reputation they had staked
      await RR.unstakeReputation(projAddrT1, repToUnstake, {from: repStaker1})

      // take stock of variables after unstaking
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

      // take stock of variables before unstaking
      let rsBalBefore = await utils.getRepBalance(repStaker1)
      let rsStakedRepBefore = await project.getUserStakedRep(repStaker1, projAddrR1)
      let stakedTokensBefore = await project.getStakedTokens(projAddrR1)
      let stakedRepBefore = await project.getStakedRep(projAddrR1)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let weiBalBefore = await project.getWeiBal(projAddrR1)

      // repStaker1 unstakes all of the reputation they had staked
      await RR.unstakeReputation(projAddrR1, repToUnstake, {from: repStaker1})

      // take stock of variables after unstaking
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

      // take stock of variables before staking
      let weiCost = await project.getWeiCost(projAddrT2)

      let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
      let weiBalBefore = await project.getWeiBal(projAddrT2)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let tsStakedTokensBefore = await project.getUserStakedTokens(tokenStaker1, projAddrT2)
      let stakedTokensBefore = await project.getStakedTokens(projAddrT2)
      let stakedRepBefore = await project.getStakedRep(projAddrT2)

      // assert that tokenStaker1 has enough tokens for this
      assert.isAtLeast(tsBalBefore, tokensToStake, 'tokenStaker1 doesn\'t have enough tokens to stake this much on the project')

      // tokenStaker1 stakes all but one of the required tokens
      await TR.stakeTokens(projAddrT2, tokensToStake, {from: tokenStaker1})

      // take stock of tokenStaker1's token balance after staking
      let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
      let weiBalAfter = await project.getWeiBal(projAddrT2)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let tsStakedTokensAfter = await project.getUserStakedTokens(tokenStaker1, projAddrT2)
      let stakedTokensAfter = await project.getStakedTokens(projAddrT2)
      let stakedRepAfter = await project.getStakedRep(projAddrT2)

      // checks
      assert.equal(tsBalBefore, tsBalAfter + tokensToStake - 1, 'tokenStaker1\'s balance updated incorrectly')
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

      // take stock of variables before staking
      let weiCost = await project.getWeiCost(projAddrR2)

      let tsBalBefore = await utils.getTokenBalance(tokenStaker1)
      let weiBalBefore = await project.getWeiBal(projAddrR2)
      let weiPoolBefore = await utils.getWeiPoolBal()
      let tsStakedTokensBefore = await project.getUserStakedTokens(tokenStaker1, projAddrR2)
      let stakedTokensBefore = await project.getStakedTokens(projAddrR2)
      let stakedRepBefore = await project.getStakedRep(projAddrR2)

      // assert that tokenStaker1 has enough tokens for this
      assert.isAtLeast(tsBalBefore, tokensToStake, 'tokenStaker1 doesn\'t have enough tokens to stake this much on the project')

      // tokenStaker1 stakes all but one of the required tokens
      await TR.stakeTokens(projAddrR2, tokensToStake, {from: tokenStaker1})

      // take stock of tokenStaker1's token balance after staking
      let tsBalAfter = await utils.getTokenBalance(tokenStaker1)
      let weiBalAfter = await project.getWeiBal(projAddrR2)
      let weiPoolAfter = await utils.getWeiPoolBal()
      let tsStakedTokensAfter = await project.getUserStakedTokens(tokenStaker1, projAddrR2)
      let stakedTokensAfter = await project.getStakedTokens(projAddrR2)
      let stakedRepAfter = await project.getStakedRep(projAddrR2)

      // checks
      assert.equal(tsBalBefore, tsBalAfter + tokensToStake - 1, 'tokenStaker1\'s balance updated incorrectly')
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

      // take stock of variables before staking
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

      // take stock of tokenStaker1's token balance after staking
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

      // take stock of variables before staking
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

      // take stock of tokenStaker1's token balance after staking
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
    })

    it('Multiple token stakers can stake RR proposed project', async function () {
    })

    it('Multiple reputation stakers can stake TR proposed project', async function () {
    })

    it('Multiple reputation stakers can stake RR proposed project', async function () {
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
      // take stock of variables before calling checkStaked
      let stateBefore = await project.getState(projAddrT4)

      // attempt to checkStaked
      await PR.checkStaked(projAddrT4)

      // take stock of variables after calling checkStaked
      let stateAfter = await project.getState(projAddrT4)

      // checks
      assert.equal(stateBefore, 1, 'state before should be 1')
      assert.equal(stateAfter, 1, 'state should not have changed')
    })

    it('checkStaked() does not change RR proposed project to staked if not fully staked', async function () {
      // take stock of variables before calling checkStaked
      let stateBefore = await project.getState(projAddrR4)

      // attempt to checkStaked
      await PR.checkStaked(projAddrR4)

      // take stock of variables after calling checkStaked
      let stateAfter = await project.getState(projAddrR4)

      // checks
      assert.equal(stateBefore, 1, 'state before should be 1')
      assert.equal(stateAfter, 1, 'state should not have changed')
    })
  })

  describe('state changes on fully staked proposed projects', () => {
    it('Fully staked TR proposed project automatically transitions into staked period', async function () {

    })

    it('Fully staked RR proposed project automatically transitions into staked period', async function () {

    })
  })

  describe('staking on staked projects', () => {
    it('Token staker can no longer call unstake token on TR proposed project once in the staked period', async function () {

    })

    it('Token staker can no longer call unstake token on RR proposed project once in the staked period', async function () {

    })

    it('Reputation staker can no longer call unstake reputation on TR proposed project once in the staked period', async function () {

    })

    it('Reputation staker can no longer call unstake reputation on RR proposed project once in the staked period', async function () {

    })
  })

  describe('refund proposer on staked projects', () => {
    it('Refund proposer can be called on TR proposed project after it is fully staked', async function () {

    })

    it('Refund proposer can be called on RR proposed project after it is fully staked', async function () {

    })

    it('Non-proposer can\'t call refund proposer from token registry', async function () {

    })

    it('Non-proposer can\'t call refund proposer from reputation registry', async function () {

    })

    it('Proposer can\'t call refund proposer multiple times from token registry', async function () {

    })

    it('Proposer can\'t call refund proposer multiple times from reputation registry', async function () {

    })
  })

  describe('refund staker on staked projects', () => {
    it('Refund staker can\'t be called from token registry once project is staked', async function () {

    })

    it('Refund staker can\'t be called from reputation registry once project is staked', async function () {

    })
  })

  // fast forward 1 week
  describe('time out state changes', () => {
    it('proposed project from token registry becomes expired if not staked', async function () {

    })

    it('proposed project from reputation registry becomes expired if not staked', async function () {

    })
  })

  describe('refund proposer on expired projects', () => {
    it('proposer can\'t call refund proposer for expired project from token registry', async function () {

    })

    it('proposer can\'t call refund proposer for expired project from reputation registry', async function () {

    })
  })
})
