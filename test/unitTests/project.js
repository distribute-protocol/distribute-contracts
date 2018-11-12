/* eslint-env mocha */
/* global contract artifacts */

const Project = artifacts.require('Project')

const projectHelper = require('../utils/projectHelper')
const assertThrown = require('../utils/assertThrown')
// const hexToAscii = require('../utils/hexToAscii')

contract('Project', function (accounts) {
  // set up project helper
  // let projObj = projectHelper(accounts)

  // get project helper variables
  // let {tokenProposer, repProposer} = projObj.user
  // let {tokenStaker1, repStaker1} = projObj.user
  // let {spoofedTR, spoofedPR, anyAddress, weiToReturn} = projObj.spoofed
  // let {tokensToMint, registeredRep} = projObj.minting
  // let {stakingPeriod, proposalCost, projectCost, ipfsHash, proposerTypeToken, proposerTypeRep} = projObj.project

  // local test variables
  // let spoofedProjT, spoofedProjR, spoofedRR
  // let costProportion, proposerTokenCost

  before(async () => {
    // set costProportion, proposerTokenCost, weiToReturn
    // costProportion = 10
    // proposerTokenCost = 100

    // get contracts from project helped
    // await projObj.contracts.setContracts()
    // DT = projObj.contracts.DT
    // TR = projObj.contracts.TR
    // RR = projObj.contracts.RR
    // PL = projObj.contracts.PL

    // set up spoofedRR
    // spoofedRR = await SpoofedRR.new()

    // set up project contracts
    // spoofedProjT = await Project.new()
    // spoofedProjR = await Project.new()
  })

  it('can be initialized via setup()')
  //   // initialize project contract
  //   await spoofedProjT.setup(proposalCost, costProportion, stakingPeriod, tokenProposer, proposerTypeToken, proposerTokenCost, ipfsHash, spoofedRR.address, spoofedTR, {from: spoofedPR})
  //   await spoofedProjR.setup(proposalCost, costProportion, stakingPeriod, repProposer, proposerTypeRep, proposerTokenCost, ipfsHash, spoofedRR.address, spoofedTR, {from: spoofedPR})
  //
  //   // take stock of variables
  //   let repRegAddrT = await spoofedProjT.reputationRegistryAddress()
  //   let repRegAddrR = await spoofedProjR.reputationRegistryAddress()
  //   assert.equal(repRegAddrT, spoofedRR.address, 'incorrect reputationRegistry address')
  //   assert.equal(repRegAddrR, spoofedRR.address, 'incorrect reputationRegistry address')
  //
  //   let tokRegAddrT = await spoofedProjT.tokenRegistryAddress()
  //   let tokRegAddrR = await spoofedProjR.tokenRegistryAddress()
  //   assert.equal(tokRegAddrT, spoofedTR, 'incorrect tokenRegistry address')
  //   assert.equal(tokRegAddrR, spoofedTR, 'incorrect tokenRegistry address')
  //
  //   let projRegAddrT = await spoofedProjT.projectRegistryAddress()
  //   let projRegAddrR = await spoofedProjR.projectRegistryAddress()
  //   assert.equal(projRegAddrT, spoofedPR, 'incorrect projectRegistry address')
  //   assert.equal(projRegAddrR, spoofedPR, 'incorrect projectRegistry address')
  //
  //   let weiCostT = await spoofedProjT.weiCost()
  //   let weiCostR = await spoofedProjR.weiCost()
  //   assert.equal(weiCostT, projectCost, 'incorrect wei cost')
  //   assert.equal(weiCostR, projectCost, 'incorrect wei cost')
  //
  //   let repCostT = await spoofedProjT.reputationCost()
  //   let repCostR = await spoofedProjR.reputationCost()
  //   let totalSupplyRR = await spoofedRR.totalSupply()
  //   let calRepCost = Math.round((costProportion * totalSupplyRR) / 10000000000)
  //   assert.equal(repCostT, calRepCost, 'incorrect reputation cost')
  //   assert.equal(repCostR, calRepCost, 'incorrect reputation cost')
  //
  //   let stateT = await spoofedProjT.state()
  //   let stateR = await spoofedProjR.state()
  //   assert.equal(stateT, 1, 'incorrect state')
  //   assert.equal(stateR, 1, 'incorrect state')
  //
  //   let nextDeadlineT = await spoofedProjT.nextDeadline()
  //   let nextDeadlineR = await spoofedProjR.nextDeadline()
  //   assert.equal(nextDeadlineT, stakingPeriod, 'incorrect next deadline')
  //   assert.equal(nextDeadlineR, stakingPeriod, 'incorrect next deadline')
  //
  //   let propT = await spoofedProjT.proposer()
  //   let propR = await spoofedProjR.proposer()
  //   assert.equal(propT, tokenProposer, 'incorrect proposer')
  //   assert.equal(propR, repProposer, 'incorrect proposer')
  //
  //   let propTypeT = await spoofedProjT.proposerType()
  //   let propTypeR = await spoofedProjR.proposerType()
  //   assert.equal(propTypeT, proposerTypeToken, 'incorrect proposer type')
  //   assert.equal(propTypeR, proposerTypeRep, 'incorrect proposer type')
  //
  //   let ipfsHashT = await spoofedProjT.ipfsHash()
  //   let ipfsHashR = await spoofedProjR.ipfsHash()
  //   assert.equal(hexToAscii(ipfsHashT), ipfsHash, 'incorrect ipfs hash')
  //   assert.equal(hexToAscii(ipfsHashR), ipfsHash, 'incorrect ipfs hash')
  //
  //   let week = 604800
  //
  //   let stakedStatePeriodT = await spoofedProjT.stakedStatePeriod()
  //   let stakedStatePeriodR = await spoofedProjR.stakedStatePeriod()
  //   assert.equal(stakedStatePeriodT, week, 'incorrect staked state period')
  //   assert.equal(stakedStatePeriodR, week, 'incorrect staked state period')
  //
  //   // INCORRECT OUTCOME - FIX IT
  //   // let activeStatePeriodT = await spoofedProjT.activeStatePeriod()
  //   // let activeStatePeriodR = await spoofedProjR.activeStatePeriod()
  //   // assert.equal(activeStatePeriodT, 2 * week, 'incorrect active state period')
  //   // assert.equal(stakedStatePeriodR, 2 * week, 'incorrect active state period')
  //
  //   let turnoverTimeT = await spoofedProjT.turnoverTime()
  //   let turnoverTimeR = await spoofedProjR.turnoverTime()
  //   assert.equal(turnoverTimeT, week, 'incorrect turnover time period')
  //   assert.equal(turnoverTimeR, week, 'incorrect turnover time period')
  //
  //   let validateStatePeriodT = await spoofedProjT.validateStatePeriod()
  //   let validateStatePeriodR = await spoofedProjR.validateStatePeriod()
  //   assert.equal(validateStatePeriodT, week, 'incorrect validate state period')
  //   assert.equal(validateStatePeriodR, week, 'incorrect validate state period')
  //
  //   let voteCommitPeriodT = await spoofedProjT.voteCommitPeriod()
  //   let voteCommitPeriodR = await spoofedProjR.voteCommitPeriod()
  //   assert.equal(voteCommitPeriodT, week, 'incorrect vote commit period')
  //   assert.equal(voteCommitPeriodR, week, 'incorrect vote commit period')
  //
  //   let voteRevealPeriodT = await spoofedProjT.voteRevealPeriod()
  //   let voteRevealPeriodR = await spoofedProjR.voteRevealPeriod()
  //   assert.equal(voteRevealPeriodT, week, 'incorrect vote reveal period')
  //   assert.equal(voteRevealPeriodR, week, 'incorrect vote reveal period')
  //
  //   let passThresholdT = await spoofedProjT.passThreshold()
  //   let passThresholdR = await spoofedProjR.passThreshold()
  //   assert.equal(passThresholdT, 100, 'incorrect pass threshold')
  //   assert.equal(passThresholdR, 100, 'incorrect pass threshold')
  // })

  it('can\'t be re-initialized via setup()')
  //   let errorThrown = false
  //   try {
  //     await spoofedProjT.setup(projectCost, costProportion, stakingPeriod, tokenProposer, proposerTypeToken, proposerTokenCost, ipfsHash, spoofedRR.address, spoofedTR, {from: spoofedPR})
  //   } catch (e) {
  //     errorThrown = true
  //   }
  //   await assertThrown(errorThrown, 'An error should have been thrown')
  //
  //   errorThrown = false
  //   try {
  //     await spoofedProjR.setup(projectCost, costProportion, stakingPeriod, repProposer, proposerTypeRep, proposerTokenCost, ipfsHash, spoofedRR.address, spoofedTR, {from: spoofedPR})
  //   } catch (e) {
  //     errorThrown = true
  //   }
  //   await assertThrown(errorThrown, 'An error should have been thrown')
  // })

  it('allows tokenRegistry to call stakeTokens()')
  //   // take stock of variables before
  //   let tokenBalanceBefore = await spoofedProjT.tokenBalances(tokenStaker1)
  //   let stakedTokensBefore = await spoofedProjT.tokensStaked()
  //   let weiBalBefore = await spoofedProjT.weiBal()
  //
  //   // stake tokensToMint tokens with weiRequired amount of ether
  //   await spoofedProjT.stakeTokens(tokenStaker1, tokensToMint, weiToReturn, {from: spoofedTR})
  //
  //   // take stock of variables after
  //   let tokenBalanceAfter = await spoofedProjT.tokenBalances(tokenStaker1)
  //   let stakedTokensAfter = await spoofedProjT.tokensStaked()
  //   let weiBalAfter = await spoofedProjT.weiBal()
  //
  //   // checks
  //   assert.equal(tokenBalanceAfter - tokenBalanceBefore, tokensToMint, "doesn't stake tokens to correctly")
  //   assert.equal(stakedTokensAfter - stakedTokensBefore, tokensToMint, "doesn't update total token supply correctly")
  //   assert.equal(weiBalAfter - weiBalBefore, weiToReturn, "doesn't update balance correctly")
  //
  //   // take stock of variables before
  //   tokenBalanceBefore = await spoofedProjR.tokenBalances(tokenStaker1)
  //   stakedTokensBefore = await spoofedProjR.tokensStaked()
  //   weiBalBefore = await spoofedProjR.weiBal()
  //
  //   // stake tokensToMint tokens with weiRequired amount of ether
  //   await spoofedProjR.stakeTokens(tokenStaker1, tokensToMint, weiToReturn, {from: spoofedTR})
  //
  //   // take stock of variables after
  //   tokenBalanceAfter = await spoofedProjR.tokenBalances(tokenStaker1)
  //   stakedTokensAfter = await spoofedProjR.tokensStaked()
  //   weiBalAfter = await spoofedProjR.weiBal()
  //
  //   // checks
  //   assert.equal(tokenBalanceAfter - tokenBalanceBefore, tokensToMint, "doesn't stake tokens to correctly")
  //   assert.equal(stakedTokensAfter - stakedTokensBefore, tokensToMint, "doesn't update total token supply correctly")
  //   assert.equal(weiBalAfter - weiBalBefore, weiToReturn, "doesn't update balance correctly")
  // })

  it('only allows tokenRegistry to call stakeTokens()')
  //   let errorThrown = false
  //   try {
  //     await spoofedProjT.stakeTokens(tokenStaker1, tokensToMint, {from: anyAddress})
  //   } catch (e) {
  //     errorThrown = true
  //   }
  //   await assertThrown(errorThrown, 'An error should have been thrown')
  //
  //   errorThrown = false
  //   try {
  //     await spoofedProjR.stakeTokens(tokenStaker1, tokensToMint, {from: anyAddress})
  //   } catch (e) {
  //     errorThrown = true
  //   }
  //   await assertThrown(errorThrown, 'An error should have been thrown')
  // })

  // SOLIDITY REVERTS - FIX IT
  it('allows reputationRegistry to call stakeReputation()')
  // // take stock of variables before
  // let reputationBalanceBefore = await spoofedProjT.reputationBalances(repStaker1)
  // let stakedReputationBefore = await spoofedProjT.reputationStaked()
  //
  // // stake tokensToMint tokens with weiRequired amount of ether
  // await spoofedRR.callStakeReputation(spoofedProjT.address, repStaker1, registeredRep)
  //
  // // take stock of variables after
  // let reputationBalanceAfter = await spoofedProjT.reputationBalances(repStaker1)
  // let stakedReputationAfter = await spoofedProjT.reputationStaked()
  //
  // // checks
  // assert.equal(reputationBalanceAfter - reputationBalanceBefore, registeredRep, "doesn't stake reputation to correctly")
  // assert.equal(stakedReputationAfter - stakedTokensBefore, registeredRep, "doesn't update total reputation supply correctly")
  //
  //
  // // take stock of variables before
  // reputationBalanceBefore = await spoofedProjR.reputationBalances(repStaker1)
  // stakedReputationBefore = await spoofedProjR.reputationStaked()
  //
  // // stake tokensToMint tokens with weiRequired amount of ether
  // await spoofedRR.callStakeReputation(spoofedProjR.address, repStaker1, registeredRep)
  //
  // // take stock of variables after
  // reputationBalanceAfter = await spoofedProjR.reputationBalances(repStaker1)
  // stakedReputationAfter = await spoofedProjR.reputationStaked()
  //
  // // checks
  // assert.equal(reputationBalanceAfter - reputationBalanceBefore, registeredRep, "doesn't stake reputation to correctly")
  // assert.equal(stakedReputationAfter - stakedTokensBefore, registeredRep, "doesn't update total reputation supply correctly")

  it('only allows reputationRegistry to call stakeReputation()')
  // , async () => {
  //   let errorThrown = false
  //   try {
  //     await spoofedProjT.stakeReputation(repStaker1, registeredRep, {from: anyAddress})
  //   } catch (e) {
  //     errorThrown = true
  //   }
  //   await assertThrown(errorThrown, 'An error should have been thrown')
  //
  //   errorThrown = false
  //   try {
  //     await spoofedProjR.stakeReputation(repStaker1, registeredRep, {from: anyAddress})
  //   } catch (e) {
  //     errorThrown = true
  //   }
  //   await assertThrown(errorThrown, 'An error should have been thrown')
  // })

  // it('returns a bool for an address whether they are a project staker', async () => {
  //   let trueVal = await PL.isStaker(spoofedP.address, staker)
  //   let trueRepVal = await PL.isStaker(spoofedP.address, repStaker)
  //   let falseVal = await PL.isStaker(spoofedP.address, nonStaker)
  //   assert.isTrue(trueVal, 'returns staker as non-staker')
  //   assert.isTrue(trueRepVal, 'returns reputation staker as non-staker')
  //   assert.isNotTrue(falseVal, 'returns non-staker as staker')
  // })
  //
  //
  // it('returns the proportional weight of an address staking', async () => {
  //   let val = await PL.calculateWeightOfAddress(spoofedP.address, staker, {from: spoofedPRaddress})
  //   assert.equal(val.toNumber(), 50, 'doesn\'t return the correct weight')
  //   await spoofedP.stakeTokens(staker2, tokens, web3.toWei(0.5, 'ether'), {from: spoofedTRaddress})
  //   let val1 = await PL.calculateWeightOfAddress(spoofedP.address, staker, {from: spoofedPRaddress})
  //   let val2 = await PL.calculateWeightOfAddress(spoofedP.address, staker2, {from: spoofedPRaddress})
  //   let val3 = await PL.calculateWeightOfAddress(spoofedP.address, repStaker, {from: spoofedPRaddress})
  //   assert.equal(val1.toNumber(), 25, 'doesn\'t return the correct weight after more staking1')
  //   assert.equal(val2.toNumber(), 25, 'doesn\'t return the correct weight after more staking2')
  //   assert.equal(val3.toNumber(), 50, 'doesn\'t return the correct weight for reputation staking')
  //   await spoofedP.unstakeTokens(staker2, tokens, {from: spoofedTRaddress})
  // })
  // // NEED TO FINISH
  // // it('returns the proportional weight on an address staking (reputation)', async () => {
  //   // let val = await spoofedP.calculateWeightOfAddress(repStaker)
  //   // assert.equal(val.toNumber(), 100, 'doesn\'t return the correct weight')
  //   // await spoofedP.stakeTokens(staker2, tokens, web3.toWei(0.5, 'ether'), {from: spoofedTRaddress})
  //   // let val1 = await spoofedP.calculateWeightOfAddress(staker)
  //   // let val2 = await spoofedP.calculateWeightOfAddress(staker2)
  //   // assert.equal(val1.toNumber(), 50, 'doesn\'t return the correct weight after more staking1')
  //   // assert.equal(val2.toNumber(), 50, 'doesn\'t return the correct weight after more staking2')
  //   // await spoofedP.unstakeTokens(staker2, tokens, {from: spoofedTRaddress})
  // // })
  //
  // it('unstakes tokens', async () => {
  //   await spoofedP.unstakeTokens(staker, tokens, {from: spoofedTRaddress})
  //   let tokenBalance = await spoofedP.stakedTokenBalances.call(staker)
  //   let totalTokenBalance = await spoofedP.totalTokensStaked.call()
  //   let weiBal = await spoofedP.weiBal.call()
  //   assert.equal(tokenBalance, 0, "doesn't unstake tokens to correctly")
  //   assert.equal(totalTokenBalance, 0, "doesn't update total token supply correctly")
  //   assert.equal(weiBal, 0, "doesn't update balance correctly")
  // })
  //
  // it('unstakes reputation', async () => {
  //   RR.unstakeReputation(spoofedP.address, 10000, {from: repStaker})
  //   let stakedReputationBalance = await spoofedP.stakedReputationBalances(repStaker)
  //   let repRegBal = await RR.balances(repStaker)
  //   assert.equal(stakedReputationBalance, 0, 'staked reputation is incorrect')
  //   assert.equal(repRegBal, 10000, 'reputation balance not updated correctly')
  // })
  //
  // it('returns the correct bool for a staker who has unstaked', async () => {
  //   let falseVal = await PL.isStaker(spoofedP.address, staker)
  //   let falseVal2 = await PL.isStaker(spoofedP.address, repStaker)
  //   assert.isNotTrue(falseVal, 'returns staker as non-staker')
  // })
  //
  // it('returns if a project is staked or not', async () => {
  //   let notStaked = await PL.isStaked(spoofedP.address)
  //   await spoofedP.stakeTokens(staker, tokens, web3.toWei(1, 'ether'), {from: spoofedTRaddress})
  //   let staked = await PL.isStaked(spoofedP.address)
  //   assert.isTrue(staked, "doesn't return staked state correctly")
  //   assert.isNotTrue(notStaked, "doesn't return unstaked state correctly")
  // })
  //
  // it('sets project state', async () => {
  //   let nextDate = Date.now() + (7 * 25 * 60 * 60)
  //   await spoofedP.setState(2, nextDate, {from: spoofedPRaddress})
  //   let state = await spoofedP.state.call()
  //   let nextDeadline = await spoofedP.nextDeadline.call()
  //   assert.equal(state, 2, "doesn't update state correctly")
  //   assert.equal(nextDeadline, nextDate, "doesn't update nextDeadline correctly")
  // })
  //
  // it('returns false if time is not up', async () => {
  //   let val = await PL.timesUp(spoofedP.address)
  //   assert.isFalse(val, 'returns timesUp true when should be false')
  // })
  //
  // it('handles times up correctly when time is up', async () => {
  //   await spoofedP.setState(2, Math.floor(Date.now()/1000) - 1, {from: spoofedPRaddress})
  //   let nextDeadline = await spoofedP.nextDeadline.call()
  //   let val = await PL.timesUp(spoofedP.address)
  //   assert.isBelow(nextDeadline.toNumber(), Date.now(), "doesn't update nextDeadline correctly")
  //   assert.isTrue(val, 'returns timesUp false when should be true')
  // })
  //
  // // it('handles validation correctly', async () => {
  // //   await spoofedP.setState(5, 0, {from: spoofedPRaddress})
  // //   await PL.validate(spoofedP.address, staker, tokens, true, {from: spoofedTRaddress})
  // //   await PL.validate(spoofedP.address, staker2, tokens, false, {from: spoofedTRaddress})
  // //   let validator1 = await spoofedP.validators(staker)
  // //   let validator2 = await spoofedP.validators(staker2)
  // //   let totalValAffirm = await spoofedP.totalValidateAffirmative.call()
  // //   let totalValNegative = await spoofedP.totalValidateNegative.call()
  // //   assert.equal(totalValAffirm.toNumber(), tokens, "doesn't update affirmative validation correctly")
  // //   assert.equal(totalValNegative.toNumber(), tokens, "doesn't update negative validation correctly")
  // // })
  //
  // it('refunds a token staker when project succeeds', async () => {
  //   await spoofedP.setState(6, 0, {from: spoofedPRaddress})
  //   let state = await spoofedP.state()
  //   // console.log(state)
  //   await PL.refundStaker(spoofedP.address, staker, {from: spoofedTRaddress})
  //   await PL.tokenRefund((error, result) => {
  //     if (!error) {
  //       assert.equal(result.args.staker, staker, "doesn't log the correct staker succeeds")
  //       assert.equal(result.args.refund.toNumber(), 0, "doesn't log the correct refund value succeeds")
  //     }
  //   })
  //   // NEED TO FINISH
  //   // await spoofedP.refundStaker(staker2, {from: spoofedTRaddress})
  //   // await spoofedP.tokenRefund(async (error, result) => {
  //   //   if (!error) {
  //   //     assert.equal(result.args.staker, staker2, "doesn't log the correct staker2 succeeds")
  //   //     assert.equal(result.args.refund.toNumber(), tokens, "doesn't log the correct refund value2 succeeds ")
  //   //   }
  //   // })
  // })
  //
  // it('refunds a token staker when project fails', async () => {
  //   // let spoofedP2 = await Project.new(projectCost, proposeProportion, stakingPeriod, RR.address, spoofedTRaddress, {from: spoofedPRaddress})
  //   // await spoofedP2.stakeTokens(staker, tokens, web3.toWei(1, 'ether'), {from: spoofedTRaddress})
  //   // await spoofedP2.stakeTokens(staker2, tokens, web3.toWei(1, 'ether'), {from: spoofedTRaddress})
  //   // await spoofedP2.validate(staker, tokens, true, {from: spoofedTRaddress})
  //   // await spoofedP2.validate(staker2, tokens, false, {from: spoofedTRaddress})
  //   // await spoofedP2.setState(8, 0, {from: spoofedPRaddress})
  //   // await spoofedP2.refundStaker(staker, {from: spoofedTRaddress})
  //   // await spoofedP2.tokenRefund(async (error, result) => {
  //   //   if (!error) {
  //   //     assert.equal(result.args.staker, staker, "doesn't log the correct staker fails")
  //   //     assert.equal(result.args.refund.toNumber(), 0, "doesn't log the correct refund value fails")
  //   //   }
  //   // })
  //   // await spoofedP2.refundStaker(staker2, {from: spoofedTRaddress})
  //   // await spoofedP2.tokenRefund(async (error, result) => {
  //   //   if (!error) {
  //   //     assert.equal(result.args.staker, staker2, "doesn't log the correct staker2 fails")
  //   //     assert.equal(result.args.refund.toNumber(), tokens, "doesn't log the correct refund value2 fails")
  //   //   }
  //   // })
  // })
  //
  // // Note this does not check total reputation/tokens staked because those have already been burned
  // // We should likely add a flag so that this can only be called once. As this test uses a "bug"
  // // To be able to be ran
  // // it('sets ValidationState when project passes', async () => {
  // //   await spoofedP.setValidationState(true, {from: spoofedPRaddress})
  // //   let validateReward = await spoofedP.validateReward.call()
  // //   let totalValidateNegative = await spoofedP.totalValidateNegative.call()
  // //   let opposingValidator = await spoofedP.opposingValidator.call()
  // //   assert.equal(validateReward.toNumber(), tokens, "doesn't set validate reward to incorrect validators")
  // //   assert.equal(totalValidateNegative.toNumber(), 0, "it clears the totalValidateNegative")
  // //   assert.isTrue(opposingValidator, "doesn't set opposingValidator correctly")
  // // })
  //
  // it('only allows the TokenRegistry to call stakeTokens', async () => {
  //   let errorThrown = false
  //   try {
  //     await P.stakeTokens(staker, tokens, web3.toWei(0.5, 'ether'))
  //   } catch (e) {
  //     errorThrown = true
  //   }
  //   await assertThrown(errorThrown, 'An error should have been thrown')
  // })
  //
  // it('only allows the TokenRegistry to call unstakeTokens', async () => {
  //   let errorThrown = false
  //   try {
  //     await P.unstakeTokens(staker, tokens)
  //   } catch (e) {
  //     errorThrown = true
  //   }
  //   await assertThrown(errorThrown, 'An error should have been thrown')
  // })
  //
  // it('only allows the TokenRegistry to call validate', async () => {
  //   let errorThrown = false
  //   try {
  //     await P.validate(staker, tokens, false)
  //   } catch (e) {
  //     errorThrown = true
  //   }
  //   await assertThrown(errorThrown, 'An error should have been thrown')
  // })
  //
  // it('only allows the ReputationRegistry to call stakeReputation', async () => {
  //   let errorThrown = false
  //   try {
  //     await P.stakeReputation(repStaker, 1)
  //   } catch (e) {
  //     errorThrown = true
  //   }
  //   await assertThrown(errorThrown, 'An error should have been thrown')
  // })
  //
  // it('only allows the ReputationRegistry to call unstakeReputation', async () => {
  //   let errorThrown = false
  //   try {
  //     await P.unstakeReputation(repStaker, 1)
  //   } catch (e) {
  //     errorThrown = true
  //   }
  //   await assertThrown(errorThrown, 'An error should have been thrown')
  // })
  //
  // it('only allows the projectRegistry to call clearStake', async () => {
  //   let errorThrown = false
  //   try {
  //     await P.clearStake()
  //   } catch (e) {
  //     errorThrown = true
  //   }
  //   await assertThrown(errorThrown, 'An error should have been thrown')
  // })
  //
  // it('only allows the projectRegistry to call setState', async () => {
  //   let errorThrown = false
  //   try {
  //     await P.setState(2, (7 * 25 * 60 * 60))
  //   } catch (e) {
  //     errorThrown = true
  //   }
  //   await assertThrown(errorThrown, 'An error should have been thrown')
  // })

  // it('returns true if time is up', async () => {
  //   await evmIncreaseTime(300000000000)
  //   let val = await spoofedP.timesUp()
  //   console.log('second', val)
  //   assert.isTrue(val, 'returns timesUp false when should be true')
  // })
  // it('only allows Token Registry to stake tokens', async () => {
  //
  // })

  /*
  timesUp
  claimTask
  claimTaskReward
  */
})
