const Project = artifacts.require('Project')
const TokenRegistry = artifacts.require('TokenRegistry')
const ReputationRegistry = artifacts.require('ReputationRegistry')
const ProjectRegistry = artifacts.require('ProjectRegistry')
// const DistributeToken = artifacts.require('DistributeToken')
const evmIncreaseTime = require('../utils/evmIncreaseTime')
const Promise = require('bluebird')
web3.eth = Promise.promisifyAll(web3.eth)
const assertThrown = require('../utils/AssertThrown')

contract('Project', function (accounts) {
  let TR, RR, P, spoofedP
  let projectCost = web3.toWei(1, 'ether')
  let proposeProportion = 20
  let stakingPeriod = 10000000000

  // let spoofedRRaddress = accounts[8]
  let spoofedTRaddress = accounts[7]
  let spoofedPRaddress = accounts[4]
  // let proposer = accounts[1]
  let tokens = 10000
  let staker = accounts[2]
  let staker2 = accounts[5]
  let repStaker = accounts[6]
  let nonStaker = accounts[3]
  // let totalTokenSupply
  // let totalFreeSupply
  before(async function () {
    TR = await TokenRegistry.deployed()
    RR = await ReputationRegistry.deployed()
    PR = await ProjectRegistry.deployed()
    P = await Project.new(projectCost, proposeProportion, stakingPeriod, RR.address, TR.address, {from: spoofedPRaddress})
    spoofedP = await Project.new(projectCost, proposeProportion, stakingPeriod, RR.address, spoofedTRaddress, {from: spoofedPRaddress})
  })

  it('stakes tokens', async () => {
    await spoofedP.stakeTokens(staker, tokens, web3.toWei(0.5, 'ether'), {from: spoofedTRaddress})
    let tokenBalance = await spoofedP.stakedTokenBalances(staker)
    let totalTokenBalance = await spoofedP.totalTokensStaked.call()
    let weiBal = await spoofedP.weiBal.call()
    assert.equal(tokenBalance, tokens, "doesn't stake tokens to correctly")
    assert.equal(totalTokenBalance, tokens, "doesn't update total token supply correctly")
    assert.equal(weiBal, web3.toWei(0.5, 'ether'), "doesn't update balance correctly")
  })

  it('stakes reputation', async () => {
    RR.register({from: repStaker})
    RR.stakeReputation(spoofedP.address, 1, {from: repStaker})
    let stakedReputationBalance = await spoofedP.stakedReputationBalances(repStaker)
    let repRegBal = await RR.balances(repStaker)
    assert.equal(stakedReputationBalance, 1, 'staked reputation is incorrect')
    assert.equal(repRegBal, 0, 'reputation balance not updated correctly')
  })

  it('returns a bool for an address whether they are a project staker', async () => {
    let trueVal = await spoofedP.isStaker(staker)
    let trueRepVal = await spoofedP.isStaker(repStaker)
    let falseVal = await spoofedP.isStaker(nonStaker)
    assert.isTrue(trueVal, 'returns staker as non-staker')
    assert.isTrue(trueRepVal, 'returns staker as non-staker')
    assert.isNotTrue(falseVal, 'returns non-staker as staker')
  })


  it('returns the proportional weight of an address staking', async () => {
    let val = await spoofedP.calculateWeightOfAddress(staker, {from: spoofedPRaddress})
    assert.equal(val.toNumber(), 50, 'doesn\'t return the correct weight')
    await spoofedP.stakeTokens(staker2, tokens, web3.toWei(0.5, 'ether'), {from: spoofedTRaddress})
    let val1 = await spoofedP.calculateWeightOfAddress(staker, {from: spoofedPRaddress})
    let val2 = await spoofedP.calculateWeightOfAddress(staker2, {from: spoofedPRaddress})
    let val3 = await spoofedP.calculateWeightOfAddress(repStaker, {from: spoofedPRaddress})
    assert.equal(val1.toNumber(), 25, 'doesn\'t return the correct weight after more staking1')
    assert.equal(val2.toNumber(), 25, 'doesn\'t return the correct weight after more staking2')
    assert.equal(val3.toNumber(), 50, 'doesn\'t return the correct weight for reputation staking')
    await spoofedP.unstakeTokens(staker2, tokens, {from: spoofedTRaddress})
  })

  // it('returns the proportional weight on an address staking (reputation)', async () => {
  //   let val = await spoofedP.calculateWeightOfAddress(repStaker)
  //   assert.equal(val.toNumber(), 100, 'doesn\'t return the correct weight')
  //   await spoofedP.stakeTokens(staker2, tokens, web3.toWei(0.5, 'ether'), {from: spoofedTRaddress})
  //   let val1 = await spoofedP.calculateWeightOfAddress(staker)
  //   let val2 = await spoofedP.calculateWeightOfAddress(staker2)
  //   assert.equal(val1.toNumber(), 50, 'doesn\'t return the correct weight after more staking1')
  //   assert.equal(val2.toNumber(), 50, 'doesn\'t return the correct weight after more staking2')
  //   await spoofedP.unstakeTokens(staker2, tokens, {from: spoofedTRaddress})
  // })

  it('unstakes tokens', async () => {
    await spoofedP.unstakeTokens(staker, tokens, {from: spoofedTRaddress})
    let tokenBalance = await spoofedP.stakedTokenBalances.call(staker)
    let totalTokenBalance = await spoofedP.totalTokensStaked.call()
    let weiBal = await spoofedP.weiBal.call()
    assert.equal(tokenBalance, 0, "doesn't unstake tokens to correctly")
    assert.equal(totalTokenBalance, 0, "doesn't update total token supply correctly")
    assert.equal(weiBal, 0, "doesn't update balance correctly")
  })

  it('unstakes reputation', async () => {
    RR.unstakeReputation(spoofedP.address, 1, {from: repStaker})
    let stakedReputationBalance = await spoofedP.stakedReputationBalances(repStaker)
    let repRegBal = await RR.balances(repStaker)
    assert.equal(stakedReputationBalance, 0, 'staked reputation is incorrect')
    assert.equal(repRegBal, 1, 'reputation balance not updated correctly')
  })

  it('returns the correct bool for a staker who has unstaked', async () => {
    let falseVal = await spoofedP.isStaker(staker)
    let falseVal2 = await spoofedP.isStaker(repStaker)
    assert.isNotTrue(falseVal, 'returns staker as non-staker')
  })

  it('returns if a project is staked or not', async () => {
    let notStaked = await spoofedP.isStaked()
    await spoofedP.stakeTokens(staker, tokens, web3.toWei(1, 'ether'), {from: spoofedTRaddress})
    let staked = await spoofedP.isStaked()
    assert.isTrue(staked, "doesn't return staked state correctly")
    assert.isNotTrue(notStaked, "doesn't return unstaked state correctly")
  })

  it('sets project state', async () => {
    let nexD = Date.now() + (7 * 25 * 60 * 60)
    await spoofedP.setState(2, nexD, {from: spoofedPRaddress})
    let state = await spoofedP.state.call()
    let nextDeadline = await spoofedP.nextDeadline.call()
    assert.equal(state, 2, "doesn't update state correctly")
    assert.equal(nextDeadline, nexD, "doesn't update nextDeadline correctly")
  })

  it('returns false if time is not up', async () => {
    let val = await spoofedP.timesUp()
    assert.isFalse(val, 'returns timesUp true when should be false')
  })

  it('handles times up correctly when time is up', async () => {
    await spoofedP.setState(2, Math.floor(Date.now()/1000) - 1, {from: spoofedPRaddress})
    let nextDeadline = await spoofedP.nextDeadline.call()
    // console.log(nextDeadline.toNumber())
    let val = await spoofedP.timesUp()
    // console.log(val)
    assert.isBelow(nextDeadline.toNumber(), Date.now(), "doesn't update nextDeadline correctly")
    assert.isTrue(val, 'returns timesUp false when should be true')
  })

  it('handles validation correctly', async () => {
    let nexD = Date.now() + (7 * 25 * 60 * 60)
    await spoofedP.setState(5, 0, {from: spoofedPRaddress})
    await spoofedP.validate(staker, tokens, true, {from: spoofedTRaddress})
    await spoofedP.validate(staker2, tokens, false, {from: spoofedTRaddress})
    let validator1 = await spoofedP.validators(staker)
    let validator2 = await spoofedP.validators(staker2)
    let totalValAffirm = await spoofedP.totalValidateAffirmative.call()
    let totalValNegative = await spoofedP.totalValidateNegative.call()
    assert.equal(totalValAffirm.toNumber(), tokens, "doesn't update affirmative validation correctly")
    assert.equal(totalValNegative.toNumber(), tokens, "doesn't update negative validation correctly")
  })

  // it('sets ValidatorStatus', async () => {
  //   await PR.startPoll(spoofedP.address, stakingPeriod, stakingPeriod)
  //   await spoofedP.setValidationState(false, {from: spoofedPRaddress})
  //   let totalTokensStaked = spoofedP.totalTokensStaked.call()
  //   let totalReputationStaked = spoofedP.totalReputationStaked.call()
  //   let validateReward = spoofedP.validateReward.call()
  //   let totalValidateAffirmative = spoofedP.totalValidateAffirmative.call()
  //   // 0, 0, 10010, 0
  //   console.log(totalTokensStaked)
  //   console.log(totalReputationStaked)
  //   console.log(validateReward)
  //   console.log(totalValidateAffirmative)
  // })

  it('only allows the TokenRegistry to call stakeTokens', async () => {
    let errorThrown = false
    try {
      await P.stakeTokens(staker, tokens, web3.toWei(0.5, 'ether'))
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('only allows the TokenRegistry to call unstakeTokens', async () => {
    let errorThrown = false
    try {
      await P.unstakeTokens(staker, tokens)
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('only allows the TokenRegistry to call validate', async () => {
    let errorThrown = false
    try {
      await P.validate(staker, tokens, false)
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('only allows the ReputationRegistry to call stakeReputation', async () => {
    let errorThrown = false
    try {
      await P.stakeReputation(repStaker, 1)
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('only allows the ReputationRegistry to call unstakeReputation', async () => {
    let errorThrown = false
    try {
      await P.unstakeReputation(repStaker, 1)
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('only allows the projectRegistry to call setTotalValidateAffirmative', async () => {
    let errorThrown = false
    try {
      await P.setTotalValidateAffirmative(10)
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('only allows the projectRegistry to call setTotalValidateNegative', async () => {
    let errorThrown = false
    try {
      await P.setTotalValidateNegative(20)
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('only allows the projectRegistry to call clearStake', async () => {
    let errorThrown = false
    try {
      await P.clearStake()
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('only allows the projectRegistry to call setState', async () => {
    let errorThrown = false
    try {
      await P.setState(2, (7 * 25 * 60 * 60))
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('only allows the projectRegistry to call setValidateReward', async () => {
    let errorThrown = false
    try {
      await P.setValidateReward(true)
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  it('only allows the projectRegistry to call setValidateFlag', async () => {
    let errorThrown = false
    try {
      await P.setValidateFlag(true)
    } catch (e) {
      errorThrown = true
    }
    assertThrown(errorThrown, 'An error should have been thrown')
  })

  // it('returns true if time is up', async () => {
  //   await evmIncreaseTime(300000000000)
  //   let val = await spoofedP.timesUp()
  //   console.log('second', val)
  //   assert.isTrue(val, 'returns timesUp false when should be true')
  // })
  // it('only allows Token Registry to stake tokens', async function () {
  //
  // })

  /*
  timesUp
  refundStaker
  setValidationState
  claimTask
  claimTaskReward
  */
})
