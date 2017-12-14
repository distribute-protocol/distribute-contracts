require('./testFunctions.js')()

var assert = require('assert')

contract('DistributeToken', function () {
  let accounts = web3.eth.accounts
  let account1 = accounts[1]

  let tokens = 1000
  let burnAmount = 100
  let baseCost = 100000000000000
  let netTokens = tokens - burnAmount
  let weiBal = 1000000000000000000

  let tokenRegistry = '0x0c3f0451c6fd1daae3304829b3dd29e7c26446c2'

  let weiPool, _projectCost, _proposerStake, _timePeriod
  let tempBalance, totalTokenTemp

  it('mints capital tokens', () => {
    let DT
    let wb
    return getDT()
      .then((instance) => DT = instance)
      .then(() => DT.mint(tokens, {from: account1, value: 502934896893435110}))
      .then(() => DT.totalSupply.call())
      .then((totalSupply) => assert.equal(totalSupply.toNumber(), tokens, 'total token supply not updated correctly'))
      .then(() => DT.totalFreeSupply.call())
      .then((totalFreeSupply) => assert.equal(totalFreeSupply.toNumber(), tokens, 'free token supply not updated correctly'))
      .then(() => DT.balanceOf(account1))
      .then((balance) => assert.equal(balance.toNumber(), tokens, 'balances mapping not updated correctly'))
      .then(() => DT.weiBal.call())
      .then((weiBal) => { wb = weiBal; return DT.weiRequired(baseCost, tokens) })
      .then((weiRequired) => assert.equal(wb.toNumber(), weiRequired.toNumber()))
  })

  it('burns capital tokens', () => {
    let DT
    return getDT ()
      .then((instance) => { DT = instance; return true })
      .then(() => DT.balanceOf(account1))
      .then((balance) => assert.equal(balance.toNumber(), tokens, 'balance call failed'))
      .then(() => DT.burnAndRefundTokens(burnAmount, {from: account1}))
      .then(() => DT.balanceOf(account1))
      .then((balance2) => assert.equal(balance2.toNumber(), netTokens, 'balances mapping not updated correctly'))
      .then(() => DT.totalSupply.call())
      .then((tokensupply) => assert.equal(tokensupply.toNumber(), netTokens, 'total token supply not updated correctly'))
      .then(() => DT.totalFreeSupply.call())
      .then((freetokensupply) => assert.equal(freetokensupply.toNumber(), netTokens, 'free token supply not updated correctly'))
  })

  it('transfers wei to and from', () => {
    let DT
    return getDT ()
      .then((instance) => { DT = instance; return true })
      .then(() => DT.weiBal.call())
      .then((initWeiBal) => assert.equal(initWeiBal.toNumber(), 90000000000000000, 'initial weiBal incorrect'))
      .then(() => DT.transferWeiTo({from: account1, value: 1000000000000000000}))
      .then(() => DT.weiBal.call())
      .then((weibal1) => assert.equal(weibal1.toNumber(), 1090000000000000000, 'weiBal not updated correctly'))
      .then(() => DT.transferWeiFrom(account1, 1000000000000000000, {from: tokenRegistry}))
      .then((res) => console.log(res))
      // .then(() => DT.weiBal.call())
      // .then((weiBal2) => assert.equal(we
  })
  // it('proposes a project', function () {
  //     let DT, PR
  //     return getDT()
  //       .then((instance) => DT = instance)
  //       .then(() => DT.weiBal.call())
  //       .then((weiBal) => weiPool = weiBal)
  //       .then(() => DT.totalSupply.call())
  //       .then((tokensupply) => {
  //           _projectCost = Math.round(20*(weiPool/tokensupply))      //cost of 20 tokens will be project cost, so proposer stake should be 1 token
  //           _timePeriod = Date.now() + 120000000000 //long time from now
  //           _proposerStake = 1
  //           //console.log(_projectCost)
  //       })
  //       .then(() => DT.proposeProject(_projectCost, _timePeriod, {from: account1}))
  //       .then(() => DT.projectNonce.call())
  //       .then((nonce) => assert.equal(nonce, 1, 'nonce not updated correctly'))
  //       .then(() => DT.balances.call(account1))
  //       .then((balance) => assert.equal(balance, netTokens - _proposerStake, 'account1 balances not updated correctly'))
  //       .then(() => DT.totalFreeCapitalTokenSupply.call())
  //       .then((freetokens) => assert.equal(freetokens, netTokens - _proposerStake, 'free token supply not updated correctly'))
  //       .then(() => DT.totalCapitalTokenSupply.call())
  //       .then((totaltokens) => assert.equal(totaltokens, netTokens, 'total token supply not updated correctly'))
  // })

  // it('stakes/unstakes on a project', function() {
  //     let DT
  //     return getDT()
  //         .then((instance) => DT = instance)
  //         .then(() => DT.stakeToken(1, 19*_proposerStake, {from: account1}))      //stakes 10 tokens on project 1
  //         .then(() => DT.balances.call(account1))
  //         .then((balances) => assert.equal(balances, netTokens - (20 * _proposerStake), 'account1 balances not updated correctly'))
  //         .then(() => DT.totalFreeCapitalTokenSupply.call())
  //         .then((tokensupply) => assert.equal(tokensupply, netTokens - (20 * _proposerStake), 'free token supply not updated correctly'))
  //         .then(() => DT.unstakeToken(1, 2*_proposerStake, {from: account1}))
  //         .then(() => DT.balances.call(account1))
  //         .then((balances) => assert.equal(balances, netTokens - (18 * _proposerStake), 'account1 balances not updated correctly'))
  //         .then(() => DT.totalFreeCapitalTokenSupply.call())
  //         .then((tokensupply) => assert.equal(tokensupply, netTokens - (18 * _proposerStake), 'free token supply not updated correctly'))
  //         .then(() => DT.stakeToken(1, 3*_proposerStake, {from: account1}))
  //     })
  //
  // it('is refunded for proposal', function() {           //project contract has workerCost = 0
  //     let DT
  //     return getDT()
  //         .then((instance) => DT = instance)
  //         .then(() => DT.refundProposer(1, {from: account1}))      //stakes 20 tokens on project 1
  //         .then(() => DT.balances.call(account1))
  //         .then((balances) => assert.equal(balances, netTokens - (20 * _proposerStake), 'account1 balances not updated correctly'))
  //         .then(() => DT.totalFreeCapitalTokenSupply.call())
  //         .then((tokensupply) => assert.equal(tokensupply, netTokens - (20 * _proposerStake), 'free token supply not updated correctly'))
  //     })
})
