/* eslint-env mocha */
/* global assert contract */

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
const evmIncreaseTime = require('../utils/evmIncreaseTime')

contract('Proposed State', function (accounts) {
  // set up project helper
  let projObj = projectHelper(accounts)

  // get project helper variables
  let TR, RR, PR, DT
  let {user, project, utils, variables, returnProject} = projObj
  let {tokenProposer, repProposer, notProposer} = user
  let {tokenStaker1, tokenStaker2} = user
  let {repStaker1, repStaker2} = user
  let {notStaker, notProject} = user
  let {projectCost, stakingPeriod, ipfsHash} = variables

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
    projAddrT1 = await returnProject.proposed_T(projectCost, stakingPeriod, ipfsHash)
    projAddrR1 = await returnProject.proposed_R(projectCost, stakingPeriod, ipfsHash)

    // to check staking extra above required amount & state change to staked
    projAddrT2 = await returnProject.proposed_T(projectCost, stakingPeriod, ipfsHash)
    projAddrR2 = await returnProject.proposed_R(projectCost, stakingPeriod, ipfsHash)

    // to check staking by multiple stakers
    projAddrT3 = await returnProject.proposed_T(projectCost, stakingPeriod, ipfsHash)
    projAddrR3 = await returnProject.proposed_R(projectCost, stakingPeriod, ipfsHash)

    // to check errors and expiration
    projAddrT4 = await returnProject.proposed_T(projectCost, stakingPeriod, ipfsHash)
    projAddrR4 = await returnProject.proposed_R(projectCost, stakingPeriod, ipfsHash)

    // fund token stakers
    await utils.mintIfNecessary({user: tokenStaker1})
    await utils.mintIfNecessary({user: tokenStaker2})

    // fund reputation stakers
    await utils.register({user: repStaker1})
    await utils.register({user: repStaker2})
  })

  describe('staking on projects in proposed state', () => {
    it('token staker can stake tokens on a TR proposed project below the required ether amount', async () => {
      // get tokens required to fully stake the project
      let requiredTokens = await project.calculateRequiredTokens({projAddr: projAddrT1})
      let tokensToStake = requiredTokens - 1

      // take stock of variables
      let currentPrice = await utils.get({fn: DT.currentPrice})

      let tsBalBefore = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let TRBalBefore = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiBalBefore = await project.get({fn: 'weiBal', projAddr: projAddrT1})
      let weiPoolBefore = await utils.get({fn: DT.weiBal})
      let tsStakedTokensBefore = await project.get({projAddr: projAddrT1, fn: 'tokenBalances', params: tokenStaker1, bn: false})
      let stakedTokensBefore = await project.get({projAddr: projAddrT1, fn: 'tokensStaked', bn: false})
      let stakedRepBefore = await project.get({projAddr: projAddrT1, fn: 'reputationStaked', bn: false})

      // assert that tokenStaker1 has enough tokens for this
      assert.isAtLeast(tsBalBefore, tokensToStake, 'tokenStaker1 doesn\'t have enough tokens to stake this much on projAddrT1')

      // tokenStaker1 stakes all but one of the required tokens
      await TR.stakeTokens(projAddrT1, tokensToStake, {from: tokenStaker1})

      // take stock of variables
      let tsBalAfter = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let TRBalAfter = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiBalAfter = await project.get({fn: 'weiBal', projAddr: projAddrT1})
      let weiPoolAfter = await utils.get({fn: DT.weiBal})
      let tsStakedTokensAfter = await project.get({projAddr: projAddrT1, fn: 'tokenBalances', params: tokenStaker1, bn: false})
      let stakedTokensAfter = await project.get({projAddr: projAddrT1, fn: 'tokensStaked', bn: false})
      let stakedRepAfter = await project.get({projAddr: projAddrT1, fn: 'reputationStaked', bn: false})

      // handle big number subtraction
      let weiPoolDifference = weiPoolBefore.minus(weiPoolAfter).toNumber()

      // checks
      assert.equal(tsBalBefore, tsBalAfter + tokensToStake, 'tokenStaker1\'s balance updated incorrectly')
      assert.equal(TRBalBefore + tokensToStake, TRBalAfter, 'TR\'s balance updated incorrectly')
      assert.equal(weiBalAfter - weiBalBefore, currentPrice * tokensToStake, 'incorrect weiBalAfter')
      assert.equal(weiPoolDifference, currentPrice * tokensToStake, 'incorrect weiPoolAfter')
      assert.equal(0, tsStakedTokensBefore, 'tokenStaker1 should not have any tokens staked on projAddrT1 before staking')
      assert.equal(0, stakedTokensBefore, 'projAddrT1 should not have any tokens staked on it before tokenStaker1 stakes')
      assert.equal(tokensToStake, tsStakedTokensAfter, 'tokenStaker1 should have tokensToStake amount of tokens staked on projAddrT1')
      assert.equal(tokensToStake, stakedTokensAfter, 'projAddrT1 should have a total of tokensToStake tokens staked before staking')
      assert.equal(0, stakedRepBefore, 'projAddrT1 should not have any rep staked on it before tokenStaker1 stakes')
      assert.equal(0, stakedRepAfter, 'projAddrT1 should not have any rep staked on it after tokenStaker1 stakes')
    })

    it('token staker can unstake tokens from TR proposed project', async () => {
      // get number of tokens to unstake
      let tokensToUnstake = await project.get({projAddr: projAddrT1, fn: 'tokenBalances', params: tokenStaker1, bn: false})

      // take stock of variables
      let tsBalBefore = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let TRBalBefore = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiPoolBefore = await utils.get({fn: DT.weiBal})
      let weiBalBefore = await project.get({fn: 'weiBal', projAddr: projAddrT1})
      let tsStakedTokensBefore = await project.get({projAddr: projAddrT1, fn: 'tokenBalances', params: tokenStaker1})
      let stakedTokensBefore = await project.get({projAddr: projAddrT1, fn: 'tokensStaked'})
      let stakedRepBefore = await project.get({projAddr: projAddrT1, fn: 'reputationStaked'})

      // tokenStaker1 unstakes all
      await TR.unstakeTokens(projAddrT1, tokensToUnstake, {from: tokenStaker1})

      // take stock of variables
      let tsBalAfter = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let TRBalAfter = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiPoolAfter = await utils.get({fn: DT.weiBal})
      let weiBalAfter = await project.get({fn: 'weiBal', projAddr: projAddrT1})
      let tsStakedTokensAfter = await project.get({projAddr: projAddrT1, fn: 'tokenBalances', params: tokenStaker1})
      let stakedTokensAfter = await project.get({projAddr: projAddrT1, fn: 'tokensStaked'})
      let stakedRepAfter = await project.get({projAddr: projAddrT1, fn: 'reputationStaked'})

      // handle big number subtraction
      let weiPoolDifference = weiPoolAfter.minus(weiPoolBefore).toNumber()

      // checks
      assert.equal(tsBalBefore + tokensToUnstake, tsBalAfter, 'tokenStaker1\'s balance updated incorrectly')
      assert.equal(TRBalAfter + tokensToUnstake, TRBalBefore, 'TR\'s balance updated incorrectly')
      assert.equal(weiBalAfter, 0, 'incorrect weiBalAfter')
      assert.equal(weiPoolDifference, weiBalBefore, 'incorrect weiPoolAfter')
      assert.equal(tokensToUnstake, tsStakedTokensBefore, 'tokenStaker1 should have tokens staked on projAddrT1 before staking')
      assert.equal(tokensToUnstake, stakedTokensBefore, 'projAddrT1 should have a total of tokensToStake tokens staked before staking')
      assert.equal(0, tsStakedTokensAfter, 'tokenStaker1 should have no tokens staked on projAddrT1')
      assert.equal(0, stakedTokensAfter, 'projAddrT1 should have any tokens staked on it before tokenStaker1 stakes')
      assert.equal(0, stakedRepBefore, 'projAddrT1 should not have any rep staked on it before tokenStaker1 stakes')
      assert.equal(0, stakedRepAfter, 'projAddrT1 should not have any rep staked on it after tokenStaker1 stakes')
    })

    it('token staker can stake tokens on a RR proposed project below the required ether amount', async () => {
      // get tokens required to fully stake the project
      let requiredTokens = await project.calculateRequiredTokens({projAddr: projAddrR1})
      let tokensToStake = requiredTokens - 1

      // take stock of variables
      let currentPrice = await utils.get({fn: DT.currentPrice})

      let tsBalBefore = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let TRBalBefore = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiBalBefore = await project.get({fn: 'weiBal', projAddr: projAddrR1})
      let weiPoolBefore = await utils.get({fn: DT.weiBal})
      let tsStakedTokensBefore = await project.get({projAddr: projAddrR1, fn: 'tokenBalances', params: tokenStaker1})
      let stakedTokensBefore = await project.get({projAddr: projAddrR1, fn: 'tokensStaked'})
      let stakedRepBefore = await project.get({projAddr: projAddrR1, fn: 'reputationStaked'})

      // assert that tokenStaker1 has enough tokens for this
      assert.isAtLeast(tsBalBefore, tokensToStake, 'tokenStaker1 doesn\'t have enough tokens to stake this much on projAddrT1')

      // tokenStaker1 stakes all but one of the required tokens
      await TR.stakeTokens(projAddrR1, tokensToStake, {from: tokenStaker1})

      // take stock of variables
      let tsBalAfter = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let TRBalAfter = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiBalAfter = await project.get({fn: 'weiBal', projAddr: projAddrR1})
      let weiPoolAfter = await utils.get({fn: DT.weiBal})
      let tsStakedTokensAfter = await project.get({projAddr: projAddrR1, fn: 'tokenBalances', params: tokenStaker1})
      let stakedTokensAfter = await project.get({projAddr: projAddrR1, fn: 'tokensStaked'})
      let stakedRepAfter = await project.get({projAddr: projAddrR1, fn: 'reputationStaked'})

      // handle big number subtraction
      let weiPoolDifference = weiPoolBefore.minus(weiPoolAfter).toNumber()

      // checks
      assert.equal(tsBalBefore, tsBalAfter + tokensToStake, 'tokenStaker1\'s balance updated incorrectly')
      assert.equal(TRBalBefore + tokensToStake, TRBalAfter, 'TR\'s balance updated incorrectly')
      assert.equal(weiBalAfter - weiBalBefore, currentPrice * tokensToStake, 'incorrect weiBalAfter')
      assert.equal(weiPoolDifference, currentPrice * tokensToStake, 'incorrect weiPoolAfter')
      assert.equal(0, tsStakedTokensBefore, 'tokenStaker1 should not have any tokens staked on projAddrR1 before staking')
      assert.equal(0, stakedTokensBefore, 'projAddrR1 should not have any tokens staked on it before tokenStaker1 stakes')
      assert.equal(tokensToStake, tsStakedTokensAfter, 'tokenStaker1 should have tokensToStake amount of tokens staked on projAddrR1')
      assert.equal(tokensToStake, stakedTokensAfter, 'projAddrR1 should have a total of tokensToStake tokens staked before staking')
      assert.equal(0, stakedRepBefore, 'projAddrR1 should not have any rep staked on it before tokenStaker1 stakes')
      assert.equal(0, stakedRepAfter, 'projAddrR1 should not have any rep staked on it after tokenStaker1 stakes')
    })

    it('token staker can unstake tokens from RR proposed project', async () => {
      // get number of tokens to unstake
      let tokensToUnstake = await project.get({projAddr: projAddrR1, fn: 'tokenBalances', params: tokenStaker1, bn: false})

      // take stock of variables
      let tsBalBefore = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let TRBalBefore = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiPoolBefore = await utils.get({fn: DT.weiBal})
      let weiBalBefore = await project.get({fn: 'weiBal', projAddr: projAddrR1})
      let tsStakedTokensBefore = await project.get({projAddr: projAddrR1, fn: 'tokenBalances', params: tokenStaker1})
      let stakedTokensBefore = await project.get({projAddr: projAddrR1, fn: 'tokensStaked'})
      let stakedRepBefore = await project.get({projAddr: projAddrR1, fn: 'reputationStaked'})

      // tokenStaker1 unstakes all
      await TR.unstakeTokens(projAddrR1, tokensToUnstake, {from: tokenStaker1})

      // take stock of variables
      let tsBalAfter = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let TRBalAfter = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiPoolAfter = await utils.get({fn: DT.weiBal})
      let weiBalAfter = await project.get({fn: 'weiBal', projAddr: projAddrR1})
      let tsStakedTokensAfter = await project.get({projAddr: projAddrR1, fn: 'tokenBalances', params: tokenStaker1})
      let stakedTokensAfter = await project.get({projAddr: projAddrR1, fn: 'tokensStaked'})
      let stakedRepAfter = await project.get({projAddr: projAddrR1, fn: 'reputationStaked'})

      // handle big number subtraction
      let weiPoolDifference = weiPoolAfter.minus(weiPoolBefore).toNumber()

      // checks
      assert.equal(tsBalBefore + tokensToUnstake, tsBalAfter, 'tokenStaker1\'s balance updated incorrectly')
      assert.equal(TRBalAfter + tokensToUnstake, TRBalBefore, 'TR\'s balance updated incorrectly')
      assert.equal(weiBalAfter, 0, 'incorrect weiBalAfter')
      assert.equal(weiPoolDifference, weiBalBefore, 'incorrect weiPoolAfter')
      assert.equal(tokensToUnstake, tsStakedTokensBefore, 'tokenStaker1 should have tokens staked on projAddrR1 before staking')
      assert.equal(tokensToUnstake, stakedTokensBefore, 'projAddrR1 should have a total of tokensToStake tokens staked before staking')
      assert.equal(0, tsStakedTokensAfter, 'tokenStaker1 should have no tokens staked on projAddrR1')
      assert.equal(0, stakedTokensAfter, 'projAddrR1 should have any tokens staked on it before tokenStaker1 stakes')
      assert.equal(0, stakedRepBefore, 'projAddrR1 should not have any rep staked on it before tokenStaker1 stakes')
      assert.equal(0, stakedRepAfter, 'projAddrR1 should not have any rep staked on it after tokenStaker1 stakes')
    })

    it('reputation staker can stake reputation on a TR proposed project below the required reputation amount', async () => {
      // get reputation required to fully stake the project
      let requiredRep = await project.get({projAddr: projAddrT1, fn: 'reputationCost'})
      let repToStake = requiredRep - 1

      // take stock of variables
      let rsBalBefore = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let rsStakedRepBefore = await project.get({projAddr: projAddrT1, fn: 'reputationBalances', params: repStaker1})
      let stakedTokensBefore = await project.get({projAddr: projAddrT1, fn: 'tokensStaked'})
      let stakedRepBefore = await project.get({projAddr: projAddrT1, fn: 'reputationStaked'})
      let weiPoolBefore = await utils.get({fn: DT.weiBal, bn: false})
      let weiBalBefore = await project.get({fn: 'weiBal', projAddr: projAddrT1, bn: false})

      // assert that repStaker1 has enough reputation for this
      assert.isAtLeast(rsBalBefore, repToStake, 'repStaker1 doesn\'t have enough reputation to stake this much on the project')

      // repStaker1 stakes all but one of the required reputation
      await RR.stakeReputation(projAddrT1, repToStake, {from: repStaker1})

      // take stock of variables
      let rsBalAfter = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let rsStakedRepAfter = await project.get({projAddr: projAddrT1, fn: 'reputationBalances', params: repStaker1})
      let stakedTokensAfter = await project.get({projAddr: projAddrT1, fn: 'tokensStaked'})
      let stakedRepAfter = await project.get({projAddr: projAddrT1, fn: 'reputationStaked'})
      let weiPoolAfter = await utils.get({fn: DT.weiBal, bn: false})
      let weiBalAfter = await project.get({fn: 'weiBal', projAddr: projAddrT1, bn: false})

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

    it('reputation staker can stake reputation on a RR proposed project below the required reputation amount', async () => {
      // get reputation required to fully stake the project
      let requiredRep = await project.get({projAddr: projAddrR1, fn: 'reputationCost'})
      let repToStake = requiredRep - 1

      // take stock of variables
      let rsBalBefore = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let rsStakedRepBefore = await project.get({projAddr: projAddrR1, fn: 'reputationBalances', params: repStaker1})
      let stakedTokensBefore = await project.get({projAddr: projAddrR1, fn: 'tokensStaked'})
      let stakedRepBefore = await project.get({projAddr: projAddrR1, fn: 'reputationStaked'})
      let weiPoolBefore = await utils.get({fn: DT.weiBal, bn: false})
      let weiBalBefore = await project.get({fn: 'weiBal', projAddr: projAddrR1, bn: false})

      // assert that repStaker1 has enough reputation for this
      assert.isAtLeast(rsBalBefore, repToStake, 'repStaker1 doesn\'t have enough reputation to stake this much on the project')

      // repStaker1 stakes all but one of the required reputation
      await RR.stakeReputation(projAddrR1, repToStake, {from: repStaker1})

      // take stock of variables
      let rsBalAfter = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let rsStakedRepAfter = await project.get({projAddr: projAddrR1, fn: 'reputationBalances', params: repStaker1})
      let stakedTokensAfter = await project.get({projAddr: projAddrR1, fn: 'tokensStaked'})
      let stakedRepAfter = await project.get({projAddr: projAddrR1, fn: 'reputationStaked'})
      let weiPoolAfter = await utils.get({fn: DT.weiBal, bn: false})
      let weiBalAfter = await project.get({fn: 'weiBal', projAddr: projAddrR1, bn: false})

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

    it('reputation staker can unstake reputation from TR proposed project', async () => {
      // get reputation staked on the project
      let repToUnstake = await project.get({projAddr: projAddrT1, fn: 'reputationStaked', bn: false})

      // take stock of variables
      let rsBalBefore = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let rsStakedRepBefore = await project.get({projAddr: projAddrT1, fn: 'reputationBalances', params: repStaker1})
      let stakedTokensBefore = await project.get({projAddr: projAddrT1, fn: 'tokensStaked'})
      let stakedRepBefore = await project.get({projAddr: projAddrT1, fn: 'reputationStaked'})
      let weiPoolBefore = await utils.get({fn: DT.weiBal, bn: false})
      let weiBalBefore = await project.get({fn: 'weiBal', projAddr: projAddrT1, bn: false})

      // repStaker1 unstakes all of the reputation they had staked
      await RR.unstakeReputation(projAddrT1, repToUnstake, {from: repStaker1})

      // take stock of variables
      let rsBalAfter = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let rsStakedRepAfter = await project.get({projAddr: projAddrT1, fn: 'reputationBalances', params: repStaker1})
      let stakedTokensAfter = await project.get({projAddr: projAddrT1, fn: 'tokensStaked'})
      let stakedRepAfter = await project.get({projAddr: projAddrT1, fn: 'reputationStaked'})
      let weiPoolAfter = await utils.get({fn: DT.weiBal, bn: false})
      let weiBalAfter = await project.get({fn: 'weiBal', projAddr: projAddrT1, bn: false})

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

    it('reputation staker can unstake reputation from RR proposed project', async () => {
      // get reputation staked on the project
      let repToUnstake = await project.get({projAddr: projAddrR1, fn: 'reputationStaked', bn: false})

      // take stock of variables
      let rsBalBefore = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let rsStakedRepBefore = await project.get({projAddr: projAddrR1, fn: 'reputationBalances', params: repStaker1})
      let stakedTokensBefore = await project.get({projAddr: projAddrR1, fn: 'tokensStaked'})
      let stakedRepBefore = await project.get({projAddr: projAddrR1, fn: 'reputationStaked'})
      let weiPoolBefore = await utils.get({fn: DT.weiBal, bn: false})
      let weiBalBefore = await project.get({fn: 'weiBal', projAddr: projAddrR1, bn: false})

      // repStaker1 unstakes all of the reputation they had staked
      await RR.unstakeReputation(projAddrR1, repToUnstake, {from: repStaker1})

      // take stock of variables
      let rsBalAfter = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let rsStakedRepAfter = await project.get({projAddr: projAddrR1, fn: 'reputationBalances', params: repStaker1})
      let stakedTokensAfter = await project.get({projAddr: projAddrR1, fn: 'tokensStaked'})
      let stakedRepAfter = await project.get({projAddr: projAddrR1, fn: 'reputationStaked'})
      let weiPoolAfter = await utils.get({fn: DT.weiBal, bn: false})
      let weiBalAfter = await project.get({fn: 'weiBal', projAddr: projAddrR1, bn: false})

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

    it('token staker can stake extra tokens on TR proposed project but only the required amount of wei and tokens is sent', async () => {
      // get tokens required to fully stake the project
      let requiredTokens = await project.calculateRequiredTokens({projAddr: projAddrT2})
      let tokensToStake = requiredTokens + 1

      // take stock of variables
      let weiCost = await project.get({fn: 'weiCost', projAddr: projAddrT2, bn: false})

      let tsBalBefore = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let TRBalBefore = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiBalBefore = await project.get({fn: 'weiBal', projAddr: projAddrT2, bn: false})
      let weiPoolBefore = await utils.get({fn: DT.weiBal, bn: false})
      let tsStakedTokensBefore = await project.get({projAddr: projAddrT2, fn: 'tokenBalances', params: tokenStaker1})
      let stakedTokensBefore = await project.get({projAddr: projAddrT2, fn: 'tokensStaked'})
      let stakedRepBefore = await project.get({projAddr: projAddrT2, fn: 'reputationStaked'})

      // assert that tokenStaker1 has enough tokens for this
      assert.isAtLeast(tsBalBefore, tokensToStake, 'tokenStaker1 doesn\'t have enough tokens to stake this much on the project')

      // tokenStaker1 stakes all but one of the required tokens
      await TR.stakeTokens(projAddrT2, tokensToStake, {from: tokenStaker1})

      // take stock of variables
      let tsBalAfter = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let TRBalAfter = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiBalAfter = await project.get({fn: 'weiBal', projAddr: projAddrT2, bn: false})
      let weiPoolAfter = await utils.get({fn: DT.weiBal, bn: false})
      let tsStakedTokensAfter = await project.get({projAddr: projAddrT2, fn: 'tokenBalances', params: tokenStaker1})
      let stakedTokensAfter = await project.get({projAddr: projAddrT2, fn: 'tokensStaked'})
      let stakedRepAfter = await project.get({projAddr: projAddrT2, fn: 'reputationStaked'})

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

    it('token staker can stake extra tokens on RR proposed project but only the required amount of wei and tokens is sent', async () => {
      // get tokens required to fully stake the project
      let requiredTokens = await project.calculateRequiredTokens({projAddr: projAddrR2})
      let tokensToStake = requiredTokens + 1

      // take stock of variables
      let weiCost = await project.get({fn: 'weiCost', projAddr: projAddrR2, bn: false})

      let tsBalBefore = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let TRBalBefore = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiBalBefore = await project.get({fn: 'weiBal', projAddr: projAddrR2, bn: false})
      let weiPoolBefore = await utils.get({fn: DT.weiBal})
      let tsStakedTokensBefore = await project.get({projAddr: projAddrR2, fn: 'tokenBalances', params: tokenStaker1})
      let stakedTokensBefore = await project.get({projAddr: projAddrR2, fn: 'tokensStaked'})
      let stakedRepBefore = await project.get({projAddr: projAddrR2, fn: 'reputationStaked'})

      // assert that tokenStaker1 has enough tokens for this
      assert.isAtLeast(tsBalBefore, tokensToStake, 'tokenStaker1 doesn\'t have enough tokens to stake this much on the project')

      // tokenStaker1 stakes all but one of the required tokens
      await TR.stakeTokens(projAddrR2, tokensToStake, {from: tokenStaker1})

      // take stock of variables
      let tsBalAfter = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let TRBalAfter = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiBalAfter = await project.get({fn: 'weiBal', projAddr: projAddrR2, bn: false})
      let weiPoolAfter = await utils.get({fn: DT.weiBal})
      let tsStakedTokensAfter = await project.get({projAddr: projAddrR2, fn: 'tokenBalances', params: tokenStaker1})
      let stakedTokensAfter = await project.get({projAddr: projAddrR2, fn: 'tokensStaked'})
      let stakedRepAfter = await project.get({projAddr: projAddrR2, fn: 'reputationStaked'})

      // handle big number subtraction
      let weiPoolDifference = weiPoolBefore.minus(weiPoolAfter).toNumber()

      // checks
      assert.equal(tsBalBefore, tsBalAfter + tokensToStake - 1, 'tokenStaker1\'s balance updated incorrectly')
      assert.equal(TRBalBefore + tokensToStake - 1, TRBalAfter, 'TR\'s balance updated incorrectly')
      assert.equal(weiBalAfter, weiCost, 'incorrect weiBalAfter')
      assert.equal(weiPoolDifference, weiCost - weiBalBefore, 'incorrect weiPoolAfter')
      assert.equal(0, tsStakedTokensBefore, 'tokenStaker1 should not have any tokens staked on projAddrR2 before staking')
      assert.equal(0, stakedTokensBefore, 'projAddrR2 should not have any tokens staked on it before tokenStaker1 stakes')
      assert.equal(tokensToStake - 1, tsStakedTokensAfter, 'tokenStaker1 should have tokensToStake - 1 amount of tokens staked on projAddrR2')
      assert.equal(tokensToStake - 1, stakedTokensAfter, 'projAddrR2 should have a total of tokensToStake - 1 tokens staked before staking')
      assert.equal(0, stakedRepBefore, 'projAddrR2 should not have any rep staked on it before tokenStaker1 stakes')
      assert.equal(0, stakedRepAfter, 'projAddrR2 should not have any rep staked on it after tokenStaker1 stakes')
    })

    it('reputation staker can stake extra reputation on TR proposed project but only the required amount of reputation is sent', async () => {
      // get reputation required to fully stake the project
      let requiredRep = await project.get({projAddr: projAddrT2, fn: 'reputationCost', bn: false})
      let repToStake = requiredRep + 1

      // take stock of variables
      let rsBalBefore = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let weiBalBefore = await project.get({fn: 'weiBal', projAddr: projAddrT2, bn: false})
      let weiPoolBefore = await utils.get({fn: DT.weiBal, bn: false})
      let rsStakedRepBefore = await project.get({projAddr: projAddrT2, fn: 'reputationBalances', params: repStaker1})
      let stakedTokensBefore = await project.get({projAddr: projAddrT2, fn: 'tokensStaked', bn: false})
      let stakedRepBefore = await project.get({projAddr: projAddrT2, fn: 'reputationStaked'})

      // assert that tokenStaker1 has enough tokens for this
      assert.isAtLeast(rsBalBefore, repToStake, 'repStaker1 doesn\'t have enough reputation to stake this much on the project')

      // tokenStaker1 stakes all but one of the required tokens
      await RR.stakeReputation(projAddrT2, repToStake, {from: repStaker1})

      // take stock of variables
      let rsBalAfter = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let weiBalAfter = await project.get({fn: 'weiBal', projAddr: projAddrT2, bn: false})
      let weiPoolAfter = await utils.get({fn: DT.weiBal, bn: false})
      let tsStakedRepAfter = await project.get({projAddr: projAddrT2, fn: 'reputationBalances', params: repStaker1})
      let stakedTokensAfter = await project.get({projAddr: projAddrT2, fn: 'tokensStaked', bn: false})
      let stakedRepAfter = await project.get({projAddr: projAddrT2, fn: 'reputationStaked'})

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

    it('reputation staker can stake extra reputation on RR proposed project but only the required amount of reputation is sent', async () => {
      // get reputation required to fully stake the project
      let requiredRep = await project.get({projAddr: projAddrR2, fn: 'reputationCost', bn: false})
      let repToStake = requiredRep + 1

      // take stock of variables
      let rsBalBefore = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let weiBalBefore = await project.get({fn: 'weiBal', projAddr: projAddrR2, bn: false})
      let weiPoolBefore = await utils.get({fn: DT.weiBal, bn: false})
      let rsStakedRepBefore = await project.get({projAddr: projAddrR2, fn: 'reputationBalances', params: repStaker1})
      let stakedTokensBefore = await project.get({projAddr: projAddrR2, fn: 'tokensStaked', bn: false})
      let stakedRepBefore = await project.get({projAddr: projAddrR2, fn: 'reputationStaked'})

      // assert that tokenStaker1 has enough tokens for this
      assert.isAtLeast(rsBalBefore, repToStake, 'repStaker1 doesn\'t have enough reputation to stake this much on the project')

      // tokenStaker1 stakes all but one of the required tokens
      await RR.stakeReputation(projAddrR2, repToStake, {from: repStaker1})

      // take stock of variables
      let rsBalAfter = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let weiBalAfter = await project.get({fn: 'weiBal', projAddr: projAddrR2, bn: false})
      let weiPoolAfter = await utils.get({fn: DT.weiBal, bn: false})
      let tsStakedRepAfter = await project.get({projAddr: projAddrR2, fn: 'reputationBalances', params: repStaker1})
      let stakedTokensAfter = await project.get({projAddr: projAddrR2, fn: 'tokensStaked', bn: false})
      let stakedRepAfter = await project.get({projAddr: projAddrR2, fn: 'reputationStaked'})

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

    it('multiple token stakers can stake TR proposed project', async () => {
      // refuel token stakers
      await utils.mintIfNecessary({user: tokenStaker1})
      await utils.mintIfNecessary({user: tokenStaker2})

      // get tokens required to fully stake the project
      let requiredTokens1 = await project.calculateRequiredTokens({projAddr: projAddrT3})
      let tokensToStake1 = Math.floor(requiredTokens1 / 2)

      // take stock of variables
      let currentPrice = await utils.get({fn: DT.currentPrice})

      let ts1BalBefore = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let ts2BalBefore = await utils.get({fn: DT.balances, params: tokenStaker2, bn: false})
      let TRBalBefore = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiBalBefore = await project.get({fn: 'weiBal', projAddr: projAddrT3})
      let weiPoolBefore = await utils.get({fn: DT.weiBal})
      let ts1StakedTokensBefore = await project.get({projAddr: projAddrT3, fn: 'tokenBalances', params: tokenStaker1})
      let ts2StakedTokensBefore = await project.get({projAddr: projAddrT3, fn: 'tokenBalances', params: tokenStaker2})
      let stakedTokensBefore = await project.get({projAddr: projAddrT3, fn: 'tokensStaked'})
      let stakedRepBefore = await project.get({projAddr: projAddrT3, fn: 'reputationStaked'})

      // assert that tokenStaker1 has enough tokens for this
      assert.isAtLeast(ts1BalBefore, tokensToStake1, 'tokenStaker1 doesn\'t have enough tokens to stake this much on projAddrT3')

      // tokenStaker1 stakes half the required tokens
      await TR.stakeTokens(projAddrT3, tokensToStake1, {from: tokenStaker1})

      // take stock of variables
      let ts1BalMiddle = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let ts2BalMiddle = await utils.get({fn: DT.balances, params: tokenStaker2, bn: false})
      let TRBalMiddle = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiBalMiddle = await project.get({fn: 'weiBal', projAddr: projAddrT3})
      let weiPoolMiddle = await utils.get({fn: DT.weiBal})
      let ts1StakedTokensMiddle = await project.get({projAddr: projAddrT3, fn: 'tokenBalances', params: tokenStaker1})
      let ts2StakedTokensMiddle = await project.get({projAddr: projAddrT3, fn: 'tokenBalances', params: tokenStaker2})
      let stakedTokensMiddle = await project.get({projAddr: projAddrT3, fn: 'tokensStaked'})
      let stakedRepMiddle = await project.get({projAddr: projAddrT3, fn: 'reputationStaked'})

      // handle big number subtraction
      let weiPoolDifference = weiPoolBefore.minus(weiPoolMiddle).toNumber()

      // checks
      assert.equal(ts1BalBefore - tokensToStake1, ts1BalMiddle, 'tokenStaker1\'s balance updated incorrectly')
      assert.equal(ts2BalBefore, ts2BalMiddle, 'tokenStaker2\'s balance shouldn\'t change')
      assert.equal(TRBalBefore + tokensToStake1, TRBalMiddle, 'TR\'s balance updated incorrectly')
      assert.equal(weiBalMiddle - weiBalBefore, currentPrice * tokensToStake1, 'incorrect weiBalMiddle')
      assert.equal(weiPoolDifference, currentPrice * tokensToStake1, 'incorrect weiPooMiddle')
      assert.equal(0, ts1StakedTokensBefore, 'tokenStaker1 should not have any tokens staked on projAddrT3 before staking')
      assert.equal(0, ts2StakedTokensBefore, 'tokenStaker2 should not have any tokens staked on projAddrT3 before staking')
      assert.equal(0, stakedTokensBefore, 'projAddrT3 should not have any tokens staked on it before tokenStaker1 stakes')
      assert.equal(tokensToStake1, ts1StakedTokensMiddle, 'tokenStaker1 should have tokensToStake1 amount of tokens staked on projAddrT3')
      assert.equal(0, ts2StakedTokensMiddle, 'tokenStaker2 should have no tokens staked on projAddrT3 after tokenStaker 1 stakes')
      assert.equal(tokensToStake1, stakedTokensMiddle, 'projAddrT3 should have a total of tokensToStake1 tokens staked after tokenStaker1 stakes')
      assert.equal(0, stakedRepBefore, 'projAddrT3 should not have any rep staked on it before tokenStaker1 stakes')
      assert.equal(0, stakedRepMiddle, 'projAddrT3 should not have any rep staked on it after tokenStaker1 stakes')

      // get tokens required to fully stake the project
      let requiredTokens2 = await project.calculateRequiredTokens({projAddr: projAddrT3})
      let tokensToStake2 = requiredTokens2 - 1

      // take stock of variables
      currentPrice = await utils.get({fn: DT.currentPrice})

      // assert that tokenStaker2 has enough tokens for this
      assert.isAtLeast(ts2BalBefore, tokensToStake2, 'tokenStaker2 doesn\'t have enough tokens to stake this much on projAddrT3')

      // tokenStaker2 stakes all but one of the required tokens
      await TR.stakeTokens(projAddrT3, tokensToStake2, {from: tokenStaker2})

      // take stock of variables
      let ts1BalAfter = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let ts2BalAfter = await utils.get({fn: DT.balances, params: tokenStaker2, bn: false})
      let TRBalAfter = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiPoolAfter = await utils.get({fn: DT.weiBal})
      let ts1StakedTokensAfter = await project.get({projAddr: projAddrT3, fn: 'tokenBalances', params: tokenStaker1})
      let ts2StakedTokensAfter = await project.get({projAddr: projAddrT3, fn: 'tokenBalances', params: tokenStaker2})
      let stakedTokensAfter = await project.get({projAddr: projAddrT3, fn: 'tokensStaked'})
      let stakedRepAfter = await project.get({projAddr: projAddrT3, fn: 'reputationStaked', bn: false})

      // handle big number subtraction
      weiPoolDifference = weiPoolMiddle.minus(weiPoolAfter).toNumber()

      // checks
      assert.equal(ts1BalMiddle, ts1BalAfter, 'tokenStaker1\'s balance shouldn\'t change')
      assert.equal(ts2BalMiddle - tokensToStake2, ts2BalAfter, 'tokenStaker2\'s balance updated incorrectly')
      assert.equal(TRBalMiddle + tokensToStake2, TRBalAfter, 'TR\'s balance updated incorrectly')
      assert.equal(weiPoolDifference, currentPrice * tokensToStake2, 'incorrect weiPoolAfter')
      assert.equal(tokensToStake1, ts1StakedTokensAfter, 'tokenStaker1 should have tokensToStake1 tokens staked on projAddrT3 after staking')
      assert.equal(tokensToStake2, ts2StakedTokensAfter, 'tokenStaker2 should have tokensToStake2 tokens staked on projAddrT3 after staking')
      assert.equal(tokensToStake1 + tokensToStake2, stakedTokensAfter, 'projAddrT3 should have tokensToStake1 + tokensToStake2 tokens staked on it after tokenStaker1 and tokenStaker2 stakes')
      assert.equal(0, stakedRepAfter, 'projAddrT3 should not have any rep staked on it after tokenStaker1 and tokenStaker2 stakes')
    })

    it('multiple token stakers can stake RR proposed project', async () => {
      // refuel token stakers
      await utils.mintIfNecessary({user: tokenStaker1})
      await utils.mintIfNecessary({user: tokenStaker2})

      // get tokens required to fully stake the project
      let requiredTokens1 = await project.calculateRequiredTokens({projAddr: projAddrR3})
      let tokensToStake1 = Math.floor(requiredTokens1 / 2)

      // take stock of variables
      let currentPrice = await utils.get({fn: DT.currentPrice})

      let ts1BalBefore = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let ts2BalBefore = await utils.get({fn: DT.balances, params: tokenStaker2, bn: false})
      let TRBalBefore = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiBalBefore = await project.get({fn: 'weiBal', projAddr: projAddrR3, bn: false})
      let weiPoolBefore = await utils.get({fn: DT.weiBal})
      let ts1StakedTokensBefore = await project.get({projAddr: projAddrR3, fn: 'tokenBalances', params: tokenStaker1})
      let ts2StakedTokensBefore = await project.get({projAddr: projAddrR3, fn: 'tokenBalances', params: tokenStaker2})
      let stakedTokensBefore = await project.get({projAddr: projAddrR3, fn: 'tokensStaked'})
      let stakedRepBefore = await project.get({projAddr: projAddrR3, fn: 'reputationStaked'})

      // assert that tokenStaker1 has enough tokens for this
      assert.isAtLeast(ts1BalBefore, tokensToStake1, 'tokenStaker1 doesn\'t have enough tokens to stake this much on projAddrR3')

      // tokenStaker1 stakes half the required tokens
      await TR.stakeTokens(projAddrR3, tokensToStake1, {from: tokenStaker1})

      // take stock of variables
      let ts1BalMiddle = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let ts2BalMiddle = await utils.get({fn: DT.balances, params: tokenStaker2, bn: false})
      let TRBalMiddle = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiBalMiddle = await project.get({fn: 'weiBal', projAddr: projAddrR3, bn: false})
      let weiPoolMiddle = await utils.get({fn: DT.weiBal})
      let ts1StakedTokensMiddle = await project.get({projAddr: projAddrR3, fn: 'tokenBalances', params: tokenStaker1})
      let ts2StakedTokensMiddle = await project.get({projAddr: projAddrR3, fn: 'tokenBalances', params: tokenStaker2})
      let stakedTokensMiddle = await project.get({projAddr: projAddrR3, fn: 'tokensStaked'})
      let stakedRepMiddle = await project.get({projAddr: projAddrR3, fn: 'reputationStaked'})

      // handle big number subtraction
      let weiPoolDifference = weiPoolBefore.minus(weiPoolMiddle).toNumber()

      // checks
      assert.equal(ts1BalBefore - tokensToStake1, ts1BalMiddle, 'tokenStaker1\'s balance updated incorrectly')
      assert.equal(ts2BalBefore, ts2BalMiddle, 'tokenStaker2\'s balance shouldn\'t change')
      assert.equal(TRBalBefore + tokensToStake1, TRBalMiddle, 'TR\'s balance updated incorrectly')
      assert.equal(weiBalMiddle - weiBalBefore, currentPrice * tokensToStake1, 'incorrect weiBalMiddle')
      assert.equal(weiPoolDifference, currentPrice * tokensToStake1, 'incorrect weiPooMiddle')
      assert.equal(0, ts1StakedTokensBefore, 'tokenStaker1 should not have any tokens staked on projAddrR3 before staking')
      assert.equal(0, ts2StakedTokensBefore, 'tokenStaker2 should not have any tokens staked on projAddrR3 before staking')
      assert.equal(0, stakedTokensBefore, 'projAddrR3 should not have any tokens staked on it before tokenStaker1 stakes')
      assert.equal(tokensToStake1, ts1StakedTokensMiddle, 'tokenStaker1 should have tokensToStake1 amount of tokens staked on projAddrR3')
      assert.equal(0, ts2StakedTokensMiddle, 'tokenStaker2 should have no tokens staked on projAddrR3 after tokenStaker 1 stakes')
      assert.equal(tokensToStake1, stakedTokensMiddle, 'projAddrR3 should have a total of tokensToStake1 tokens staked after tokenStaker1 stakes')
      assert.equal(0, stakedRepBefore, 'projAddrR3 should not have any rep staked on it before tokenStaker1 stakes')
      assert.equal(0, stakedRepMiddle, 'projAddrR3 should not have any rep staked on it after tokenStaker1 stakes')

      // get tokens required to fully stake the project
      let requiredTokens2 = await project.calculateRequiredTokens({projAddr: projAddrR3})
      let tokensToStake2 = requiredTokens2 - 1

      // take stock of variables
      currentPrice = await utils.get({fn: DT.currentPrice})

      // assert that tokenStaker2 has enough tokens for this
      assert.isAtLeast(ts2BalBefore, tokensToStake2, 'tokenStaker2 doesn\'t have enough tokens to stake this much on projAddrR3')

      // tokenStaker2 stakes all but one of the required tokens
      await TR.stakeTokens(projAddrR3, tokensToStake2, {from: tokenStaker2})

      // take stock of variables
      let ts1BalAfter = await utils.get({fn: DT.balances, params: tokenStaker1, bn: false})
      let ts2BalAfter = await utils.get({fn: DT.balances, params: tokenStaker2, bn: false})
      let TRBalAfter = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiPoolAfter = await utils.get({fn: DT.weiBal})
      let ts1StakedTokensAfter = await project.get({projAddr: projAddrR3, fn: 'tokenBalances', params: tokenStaker1})
      let ts2StakedTokensAfter = await project.get({projAddr: projAddrR3, fn: 'tokenBalances', params: tokenStaker2})
      let stakedTokensAfter = await project.get({projAddr: projAddrR3, fn: 'tokensStaked'})
      let stakedRepAfter = await project.get({projAddr: projAddrR3, fn: 'reputationStaked', bn: false})

      // handle big number subtraction
      weiPoolDifference = weiPoolMiddle.minus(weiPoolAfter).toNumber()

      // checks
      assert.equal(ts1BalMiddle, ts1BalAfter, 'tokenStaker1\'s balance shouldn\'t change')
      assert.equal(ts2BalMiddle - tokensToStake2, ts2BalAfter, 'tokenStaker2\'s balance updated incorrectly')
      assert.equal(TRBalMiddle + tokensToStake2, TRBalAfter, 'TR\'s balance updated incorrectly')
      // assert.equal(weiBalAfter - weiBalMiddle, currentPrice * tokensToStake2, 'incorrect weiBalAfter')
      assert.equal(weiPoolDifference, currentPrice * tokensToStake2, 'incorrect weiPoolAfter')
      assert.equal(tokensToStake1, ts1StakedTokensAfter, 'tokenStaker1 should have tokensToStake1 tokens staked on projAddrR3 after staking')
      assert.equal(tokensToStake2, ts2StakedTokensAfter, 'tokenStaker2 should have tokensToStake2 tokens staked on projAddrR3 after staking')
      assert.equal(tokensToStake1 + tokensToStake2, stakedTokensAfter, 'projAddrR3 should have tokensToStake1 + tokensToStake2 tokens staked on it after tokenStaker1 and tokenStaker2 stakes')
      assert.equal(0, stakedRepAfter, 'projAddrR3 should not have any rep staked on it after tokenStaker1 and tokenStaker2 stakes')
    })

    it('multiple reputation stakers can stake TR proposed project', async () => {
      // get reputation required to fully stake the project
      let requiredRep1 = await project.get({projAddr: projAddrT3, fn: 'reputationCost'})
      let repToStake1 = Math.floor(requiredRep1 / 30) // running out of reputation

      // take stock of variables
      let rs1BalBefore = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let rs2BalBefore = await utils.get({fn: RR.users, params: repStaker2, bn: false, position: 0})
      let weiBalBefore = await project.get({fn: 'weiBal', projAddr: projAddrT3, bn: false})
      let weiPoolBefore = await utils.get({fn: DT.weiBal})
      let rs1StakedRepBefore = await project.get({projAddr: projAddrT3, fn: 'reputationBalances', params: repStaker1})
      let rs2StakedRepBefore = await project.get({projAddr: projAddrT3, fn: 'reputationBalances', params: repStaker2})
      let stakedTokensBefore = await project.get({projAddr: projAddrT3, fn: 'tokensStaked', bn: false})
      let stakedRepBefore = await project.get({projAddr: projAddrT3, fn: 'reputationStaked'})

      // assert that repStaker1 has enough reputation for this
      assert.isAtLeast(rs1BalBefore, repToStake1, 'repStaker1 doesn\'t have enough reputation to stake this much on projAddrT3')

      // repStaker1 stakes half the required reputation
      await RR.stakeReputation(projAddrT3, repToStake1, {from: repStaker1})

      // take stock of variables
      let rs1BalMiddle = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let rs2BalMiddle = await utils.get({fn: RR.users, params: repStaker2, bn: false, position: 0})
      let weiBalMiddle = await project.get({fn: 'weiBal', projAddr: projAddrT3, bn: false})
      let weiPoolMiddle = await utils.get({fn: DT.weiBal})
      let rs1StakedRepMiddle = await project.get({projAddr: projAddrT3, fn: 'reputationBalances', params: repStaker1})
      let rs2StakedRepMiddle = await project.get({projAddr: projAddrT3, fn: 'reputationBalances', params: repStaker2})
      let stakedTokensMiddle = await project.get({projAddr: projAddrT3, fn: 'tokensStaked', bn: false})
      let stakedRepMiddle = await project.get({projAddr: projAddrT3, fn: 'reputationStaked'})

      // handle big number subtraction
      let weiPoolDifference = weiPoolBefore.minus(weiPoolMiddle).toNumber()

      // checks
      assert.equal(rs1BalBefore - repToStake1, rs1BalMiddle, 'repStaker1\'s balance updated incorrectly')
      assert.equal(rs2BalBefore, rs2BalMiddle, 'repStaker2\'s balance shouldn\'t change')
      assert.equal(weiBalMiddle, weiBalBefore, 'weiBal shouldn\'t change')
      assert.equal(weiPoolDifference, 0, 'weiPool shouldn\'t change')
      assert.equal(0, rs1StakedRepBefore, 'repStaker1 should not have any reputation staked on projAddrT3 before staking')
      assert.equal(0, rs2StakedRepBefore, 'repStaker2 should not have any reputation staked on projAddrT3 before staking')
      assert.equal(0, stakedRepBefore, 'projAddrT3 should not have any reputation staked on it before repStaker1 stakes')
      assert.equal(repToStake1, rs1StakedRepMiddle, 'repStaker1 should have repToStake1 amount of reputation staked on projAddrT3')
      assert.equal(0, rs2StakedRepMiddle, 'repStaker2 should have no reputation staked on projAddrT3 after repStaker1 stakes')
      assert.equal(repToStake1, stakedRepMiddle, 'projAddrT3 should have a total of repToStake1 tokens staked after repStaker1 stakes')
      assert.equal(stakedTokensMiddle, stakedTokensBefore, 'staked tokens should not change')

      // get reputation required to fully stake the project
      let requiredRep2 = await project.get({projAddr: projAddrT3, fn: 'reputationCost'})
      let repToStake2 = Math.floor(requiredRep2 / 30) // running out of reputation

      // assert that repStaker1 has enough reputation for this
      assert.isAtLeast(rs2BalBefore, repToStake2, 'repStaker2 doesn\'t have enough reputation to stake this much on projAddrT3')

      // repStaker2 stakes all but one of the required reputation
      await RR.stakeReputation(projAddrT3, repToStake2, {from: repStaker2})

      // take stock of variables
      let rs1BalAfter = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let rs2BalAfter = await utils.get({fn: RR.users, params: repStaker2, bn: false, position: 0})
      let weiBalAfter = await project.get({fn: 'weiBal', projAddr: projAddrT3})
      let weiPoolAfter = await utils.get({fn: DT.weiBal})
      let rs1StakedRepAfter = await project.get({projAddr: projAddrT3, fn: 'reputationBalances', params: repStaker1})
      let rs2StakedRepAfter = await project.get({projAddr: projAddrT3, fn: 'reputationBalances', params: repStaker2})
      let stakedTokensAfter = await project.get({projAddr: projAddrT3, fn: 'tokensStaked'})
      let stakedRepAfter = await project.get({projAddr: projAddrT3, fn: 'reputationStaked'})

      // handle big number subtraction
      weiPoolDifference = weiPoolMiddle.minus(weiPoolAfter).toNumber()

      // checks
      assert.equal(rs1BalMiddle, rs1BalAfter, 'repStaker1\'s balance shouldn\'t change')
      assert.equal(rs2BalMiddle - repToStake2, rs2BalAfter, 'repStaker2\'s balance updated incorrectly')
      assert.equal(weiBalAfter, weiBalMiddle, 'weiBal should\'nt change')
      assert.equal(weiPoolDifference, 0, 'weiPool shouldn\'t change')
      assert.equal(repToStake1, rs1StakedRepAfter, 'repStaker1 should have repToStake1 reputation staked on projAddrT3 after staking')
      assert.equal(repToStake2, rs2StakedRepAfter, 'repStaker2 should have repToStake2 reputation staked on projAddrT3 after staking')
      assert.equal(repToStake1 + repToStake2, stakedRepAfter, 'projAddrT3 should have repToStake1 + repToStake2 tokens staked on it after tokenStaker1 and tokenStaker2 stakes')
      assert.equal(stakedTokensAfter, stakedTokensMiddle, 'staked tokens should not change')
    })

    it('multiple reputation stakers can stake RR proposed project', async () => {
      // get reputation required to fully stake the project
      let requiredRep1 = await project.get({projAddr: projAddrR3, fn: 'reputationCost'})
      let repToStake1 = Math.floor(requiredRep1 / 30) // running out of reputation

      // take stock of variables
      let rs1BalBefore = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let rs2BalBefore = await utils.get({fn: RR.users, params: repStaker2, bn: false, position: 0})
      let weiBalBefore = await project.get({fn: 'weiBal', projAddr: projAddrR3, bn: false})
      let weiPoolBefore = await utils.get({fn: DT.weiBal})
      let rs1StakedRepBefore = await project.get({projAddr: projAddrR3, fn: 'reputationBalances', params: repStaker1})
      let rs2StakedRepBefore = await project.get({projAddr: projAddrR3, fn: 'reputationBalances', params: repStaker2})
      let stakedTokensBefore = await project.get({projAddr: projAddrR3, fn: 'tokensStaked', bn: false})
      let stakedRepBefore = await project.get({projAddr: projAddrR3, fn: 'reputationStaked', bn: false})

      // assert that repStaker1 has enough reputation for this
      assert.isAtLeast(rs1BalBefore, repToStake1, 'repStaker1 doesn\'t have enough reputation to stake this much on projAddrR3')

      // repStaker1 stakes half the required reputation
      await RR.stakeReputation(projAddrR3, repToStake1, {from: repStaker1})

      // take stock of variables
      let rs1BalMiddle = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let rs2BalMiddle = await utils.get({fn: RR.users, params: repStaker2, bn: false, position: 0})
      let weiBalMiddle = await project.get({fn: 'weiBal', projAddr: projAddrR3, bn: false})
      let weiPoolMiddle = await utils.get({fn: DT.weiBal, bn: false})
      let rs1StakedRepMiddle = await project.get({projAddr: projAddrR3, fn: 'reputationBalances', params: repStaker1})
      let rs2StakedRepMiddle = await project.get({projAddr: projAddrR3, fn: 'reputationBalances', params: repStaker2})
      let stakedTokensMiddle = await project.get({projAddr: projAddrR3, fn: 'tokensStaked', bn: false})
      let stakedRepMiddle = await project.get({projAddr: projAddrR3, fn: 'reputationStaked', bn: false})

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
      assert.equal(repToStake1, stakedRepMiddle, 'projAddrR3 should have a total of repToStake1 rep staked after repStaker1 stakes')
      assert.equal(stakedTokensMiddle, stakedTokensBefore, 'staked tokens should not change')

      // get reputation required to fully stake the project
      let requiredRep2 = await project.get({projAddr: projAddrR3, fn: 'reputationCost'})
      let repToStake2 = Math.floor(requiredRep2 / 30) // running out of reputation

      // assert that repStaker1 has enough reputation for this
      assert.isAtLeast(rs2BalBefore, repToStake2, 'repStaker2 doesn\'t have enough reputation to stake this much on projAddrR3')

      // repStaker2 stakes all but one of the required reputation
      await RR.stakeReputation(projAddrR3, repToStake2, {from: repStaker2})

      // take stock of variables
      let rs1BalAfter = await utils.get({fn: RR.users, params: repStaker1, bn: false, position: 0})
      let rs2BalAfter = await utils.get({fn: RR.users, params: repStaker2, bn: false, position: 0})
      let weiBalAfter = await project.get({fn: 'weiBal', projAddr: projAddrR3})
      let weiPoolAfter = await utils.get({fn: DT.weiBal})
      let rs1StakedRepAfter = await project.get({projAddr: projAddrR3, fn: 'reputationBalances', params: repStaker1})
      let rs2StakedRepAfter = await project.get({projAddr: projAddrR3, fn: 'reputationBalances', params: repStaker2})
      let stakedTokensAfter = await project.get({projAddr: projAddrR3, fn: 'tokensStaked'})
      let stakedRepAfter = await project.get({projAddr: projAddrR3, fn: 'reputationStaked'})

      // checks
      assert.equal(rs1BalMiddle, rs1BalAfter, 'repStaker1\'s balance shouldn\'t change')
      assert.equal(rs2BalMiddle - repToStake2, rs2BalAfter, 'repStaker2\'s balance updated incorrectly')
      assert.equal(weiBalAfter, weiBalMiddle, 'weiBal should\'nt change')
      assert.equal(weiPoolAfter, weiPoolMiddle, 'weiPool shouldn\'t change')
      assert.equal(repToStake1, rs1StakedRepAfter, 'repStaker1 should have repToStake1 reputation staked on projAddrR3 after staking')
      assert.equal(repToStake2, rs2StakedRepAfter, 'repStaker2 should have repToStake2 reputation staked on projAddrR3 after staking')
      assert.equal(repToStake1 + repToStake2, stakedRepAfter, 'projAddrR3 should have repToStake1 + repToStake2 reputation staked on it after repStaker1 and repStaker2 stakes')
      assert.equal(stakedTokensAfter, stakedTokensMiddle, 'staked tokens should not change')
    })

    it('not staker can\'t stake tokens they don\'t have on TR proposed project', async () => {
      errorThrown = false
      try {
        await TR.stakeTokens(projAddrT4, 1, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not staker can\'t stake tokens they don\'t have on RR proposed project', async () => {
      errorThrown = false
      try {
        await TR.stakeTokens(projAddrR4, 1, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not staker can\'t stake reputation they don\'t have on TR proposed project', async () => {
      errorThrown = false
      try {
        await RR.stakeReputation(projAddrT4, 1, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not staker can\'t stake reputation they don\'t have on RR proposed project', async () => {
      errorThrown = false
      try {
        await RR.stakeReputation(projAddrR4, 1, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not staker can\'t unstake tokens they don\'t have from TR proposed project', async () => {
      errorThrown = false
      try {
        await TR.unstakeTokens(projAddrT4, 1, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not staker can\'t unstake tokens they don\'t have from RR proposed project', async () => {
      errorThrown = false
      try {
        await TR.unstakeTokens(projAddrR4, 1, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not staker can\'t unstake reputation they don\'t have from TR proposed project', async () => {
      errorThrown = false
      try {
        await RR.unstakeReputation(projAddrT4, 1, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not staker can\'t unstake reputation they don\'t have from RR proposed project', async () => {
      errorThrown = false
      try {
        await RR.unstakeReputation(projAddrR4, 1, {from: notStaker})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('staking on nonexistant projects', () => {
    it('token staker can\'t stake tokens on nonexistant project', async () => {
      // make sure token staker has tokens
      utils.mintIfNecessary({user: tokenStaker1, numTokens: 1})

      // check for error
      errorThrown = false
      try {
        await TR.stakeTokens(notProject, 1, {from: tokenStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('reputation staker can\'t stake reputation on nonexistant project', async () => {
      // make sure reputation staker is registered
      utils.register({user: repStaker1})

      // check for error
      errorThrown = false
      try {
        await RR.stakeReputation(notProject, 1, {from: repStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('refund proposer on proposed projects', () => {
    it('refund proposer can\'t be called on TR proposed project while still in propose period', async () => {
      errorThrown = false
      try {
        await TR.refundProposer(projAddrT4, {from: tokenProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('refund proposer can\'t be called on RR proposed project while still in propose period', async () => {
      errorThrown = false
      try {
        await RR.refundProposer(projAddrR4, {from: repProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')

        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('refund staker on proposed projects', () => {
    it('refund token staker can\'t be called on TR proposed project while still in propose period', async () => {
      // make sure token staker has something staked on the project
      await utils.mintIfNecessary({user: tokenStaker1, numTokens: 1})
      await TR.stakeTokens(projAddrT4, 1, {from: tokenStaker1})

      // check for error
      errorThrown = false
      try {
        await TR.refundStaker(projAddrT4, {from: tokenStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('refund token staker can\'t be called on RR proposed project while still in propose period', async () => {
      // make sure token staker has something staked on the project
      await utils.mintIfNecessary({user: tokenStaker1, numTokens: 1})
      await TR.stakeTokens(projAddrR4, 1, {from: tokenStaker1})

      // check for error
      errorThrown = false
      try {
        await TR.refundStaker(projAddrR4, {from: tokenStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('refund reputation staker can\'t be called on TR proposed project while still in propose period', async () => {
      // make sure reputation staker has something staked on the project
      await utils.register({user: repStaker1})
      await RR.stakeReputation(projAddrT4, 1, {from: repStaker1})

      // check for error
      errorThrown = false
      try {
        await RR.refundStaker(projAddrT4, {from: repStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('refund reputation staker can\'t be called on RR proposed project while still in propose period', async () => {
      // make sure reputation staker has something staked on the project
      await utils.register({user: repStaker1})
      await RR.stakeReputation(projAddrR4, 1, {from: repStaker1})

      // check for error
      errorThrown = false
      try {
        await RR.refundStaker(projAddrR4, {from: repStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('state changes on understaked proposed projects', () => {
    it('checkStaked does not change TR proposed project to staked if not fully staked', async () => {
      // take stock of variables
      let stateBefore = await project.get({projAddr: projAddrT4, fn: 'state'})

      // attempt to checkStaked
      await PR.checkStaked(projAddrT4)

      // take stock of variables
      let stateAfter = await project.get({projAddr: projAddrT4, fn: 'state'})

      // checks
      assert.equal(stateBefore, 1, 'state before should be 1')
      assert.equal(stateAfter, 1, 'state should not have changed')
    })

    it('checkStaked does not change RR proposed project to staked if not fully staked', async () => {
      // take stock of variables
      let stateBefore = await project.get({projAddr: projAddrR4, fn: 'state'})

      // attempt to checkStaked
      await PR.checkStaked(projAddrR4)

      // take stock of variables
      let stateAfter = await project.get({projAddr: projAddrR4, fn: 'state'})

      // checks
      assert.equal(stateBefore, 1, 'state before should be 1')
      assert.equal(stateAfter, 1, 'state should not have changed')
    })
  })

  describe('state changes on fully staked proposed projects', () => {
    it('fully staked TR proposed project automatically transitions into staked period', async () => {
      // take stock of variables
      let state = await project.get({projAddr: projAddrT2, fn: 'state', bn: false})

      // checks
      assert.equal(state, 2, 'state before should be 2')
    })

    it('fully staked RR proposed project automatically transitions into staked period', async () => {
      // take stock of variables
      let state = await project.get({projAddr: projAddrR2, fn: 'state', bn: false})

      // checks
      assert.equal(state, 2, 'state before should be 2')
    })
  })

  describe('staking on staked projects', () => {
    it('token staker can no longer call unstake token on TR proposed project once in the staked period', async () => {
      // take stock of variables
      let tsBal = await project.get({projAddr: projAddrT2, fn: 'tokenBalances', params: tokenStaker1, bn: false})

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
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('token staker can no longer call unstake token on RR proposed project once in the staked period', async () => {
      // take stock of variables
      let tsBal = await project.get({projAddr: projAddrR2, fn: 'tokenBalances', params: tokenStaker1, bn: false})

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
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('reputation staker can no longer call unstake reputation on TR proposed project once in the staked period', async () => {
      // take stock of variables
      let rsBal = await project.get({projAddr: projAddrT2, fn: 'reputationBalances', params: repStaker1, bn: false})

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
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('reputation staker can no longer call unstake reputation on RR proposed project once in the staked period', async () => {
      // take stock of variables
      let rsBal = await project.get({projAddr: projAddrR2, fn: 'reputationBalances', params: repStaker1, bn: false})

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
      await assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('refund proposer on staked projects', () => {
    it('not proposer can\'t call refund proposer from token registry', async () => {
      errorThrown = false
      try {
        await TR.refundProposer(projAddrT2, {from: notProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('not proposer can\'t call refund proposer from reputation registry', async () => {
      errorThrown = false
      try {
        await RR.refundProposer(projAddrR2, {from: notProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    // these two tests must come after not proposer refund proposer tests
    it('refund proposer can be called on TR proposed project after it is fully staked', async () => {
      // take stock of variables
      let proposedWeiCost = await project.get({projAddr: projAddrT2, fn: 'proposedCost', bn: false})

      let tpBalBefore = await utils.get({fn: DT.balances, params: tokenProposer, bn: false})
      let TRBalBefore = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiPoolBefore = await utils.get({fn: DT.weiBal, bn: false})
      let proposerStakeBefore = await project.get({projAddr: projAddrT2, fn: 'proposerStake', bn: false})

      // call refund proposer
      await TR.refundProposer(projAddrT2, {from: tokenProposer})

      // take stock of variables
      let tpBalAfter = await utils.get({fn: DT.balances, params: tokenProposer, bn: false})
      let TRBalAfter = await utils.get({fn: DT.balances, params: TR.address, bn: false})
      let weiPoolAfter = await utils.get({fn: DT.weiBal, bn: false})
      let proposerStakeAfter = await project.get({projAddr: projAddrT2, fn: 'proposerStake', bn: false})

      // checks
      assert.equal(tpBalBefore + proposerStakeBefore, tpBalAfter, 'tokenProposer balance updated incorrectly')
      assert.equal(TRBalBefore, TRBalAfter + proposerStakeBefore, 'TR balance updated incorrectly')
      assert.equal(weiPoolBefore - Math.floor(proposedWeiCost / 20), weiPoolAfter, 'wei pool should be 5% of the project\'s proposed cost less')
      assert.equal(proposerStakeAfter, 0, 'proposer stake should have been zeroed out')
    })

    it('refund proposer can be called on RR proposed project after it is fully staked', async () => {
      // take stock of variables
      let proposedWeiCost = await project.get({projAddr: projAddrR2, fn: 'proposedCost', bn: false})

      let rpBalBefore = await utils.get({fn: RR.users, params: repProposer, bn: false, position: 0})
      let weiPoolBefore = await utils.get({fn: DT.weiBal, bn: false})
      let proposerStakeBefore = await project.get({projAddr: projAddrR2, fn: 'proposerStake', bn: false})

      // call refund proposer
      await RR.refundProposer(projAddrR2, {from: repProposer})

      // take stock of variables
      let rpBalAfter = await utils.get({fn: RR.users, params: repProposer, bn: false, position: 0})
      let weiPoolAfter = await utils.get({fn: DT.weiBal, bn: false})
      let proposerStakeAfter = await project.get({projAddr: projAddrR2, fn: 'proposerStake', bn: false})

      // checks
      assert.equal(rpBalBefore + proposerStakeBefore, rpBalAfter, 'tokenProposer balance updated incorrectly')
      assert.equal(weiPoolBefore - Math.floor(proposedWeiCost / 20), weiPoolAfter, 'wei pool should be 5% of the project\'s proposed cost less')
      assert.equal(proposerStakeAfter, 0, 'proposer stake should have been zeroed out')
    })

    it('proposer can\'t call refund proposer multiple times from token registry', async () => {
      errorThrown = false
      try {
        await TR.refundProposer(projAddrT2, {from: tokenProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('proposer can\'t call refund proposer multiple times from reputation registry', async () => {
      errorThrown = false
      try {
        await RR.refundProposer(projAddrR2, {from: repProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('refund staker on staked projects', () => {
    it('refund token staker can\'t be called on TR proposed project once it is staked', async () => {
      // take stock of variables
      let tsBal = await project.get({projAddr: projAddrT2, fn: 'tokenBalances', params: tokenStaker1, bn: false})

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
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('refund token staker can\'t be called on RR proposed project once it is staked', async () => {
      // take stock of variables
      let tsBal = await project.get({projAddr: projAddrR2, fn: 'tokenBalances', params: tokenStaker1, bn: false})

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
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('refund reputation staker can\'t be called on TR proposed project once it is staked', async () => {
      // take stock of variables
      let rsBal = await project.get({projAddr: projAddrT2, fn: 'reputationBalances', params: repStaker1, bn: false})

      // assert that tokenStaker1 has tokens staked on projAddrT2
      assert.isAtLeast(rsBal, 1, 'repStaker1 has no reputation staked on projAddrT2')

      // check for error
      errorThrown = false
      try {
        await RR.refundStaker(projAddrT2, {from: repStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('refund reputation staker can\'t be called on RR proposed project once it is staked', async () => {
      // take stock of variables
      let rsBal = await project.get({projAddr: projAddrR2, fn: 'reputationBalances', params: repStaker1, bn: false})

      // assert that tokenStaker1 has tokens staked on projAddrR2
      assert.isAtLeast(rsBal, 1, 'repStaker1 has no reputation staked on projAddrR2')

      // check for error
      errorThrown = false
      try {
        await RR.refundStaker(projAddrR2, {from: repStaker1})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })
  })

  describe('time out state changes', () => {
    before(async () => {
      // fast forward time
      await evmIncreaseTime(604801 * 1) // 1 week & 1 second
    })

    it('TR proposed project becomes expired if not staked at staking deadline', async () => {
      // take stock of variables
      let stateBefore = await project.get({projAddr: projAddrT4, fn: 'state'})
      let proposerStakeBefore = await project.get({projAddr: projAddrT4, fn: 'proposerStake'})

      // call checkStaked
      await PR.checkStaked(projAddrT4)

      // take stock of variables
      let stateAfter = await project.get({projAddr: projAddrT4, fn: 'state'})
      let proposerStakeAfter = await project.get({projAddr: projAddrT4, fn: 'proposerStake'})

      // checks
      assert.equal(stateBefore, 1, 'state before should be 1')
      assert.equal(stateAfter, 8, 'state after should be 8')
      assert.notEqual(proposerStakeBefore, 0, 'proposer stake before should be positive nonzero value')
      assert.equal(proposerStakeAfter, 0, 'proposer stake should have been cleared')
    })

    it('RR proposed project becomes expired if not staked at staking deadline', async () => {
      // take stock of variables
      let stateBefore = await project.get({projAddr: projAddrR4, fn: 'state'})
      let proposerStakeBefore = await project.get({projAddr: projAddrR4, fn: 'proposerStake'})

      // call checkStaked
      await PR.checkStaked(projAddrR4)

      // take stock of variables
      let stateAfter = await project.get({projAddr: projAddrR4, fn: 'state'})
      let proposerStakeAfter = await project.get({projAddr: projAddrR4, fn: 'proposerStake'})

      // checks
      assert.equal(stateBefore, 1, 'state before should be 1')
      assert.equal(stateAfter, 8, 'state after should be 8')
      assert.notEqual(proposerStakeBefore, 0, 'proposer stake before should be positive nonzero value')
      assert.equal(proposerStakeAfter, 0, 'proposer stake should have been cleared')
    })
  })

  describe('refund proposer on expired projects', () => {
    it('proposer can\'t call refund proposer for expired TR proposed project', async () => {
      errorThrown = false
      try {
        await TR.refundProposer(projAddrT4, {from: tokenProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })

    it('proposer can\'t call refund proposer for expired RR proposed project', async () => {
      errorThrown = false
      try {
        await RR.refundProposer(projAddrT4, {from: repProposer})
      } catch (e) {
        assert.match(e.message, /VM Exception while processing transaction: revert/, 'throws an error')
        errorThrown = true
      }
      await assertThrown(errorThrown, 'An error should have been thrown')
    })
  })
})
