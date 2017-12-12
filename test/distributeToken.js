require('./testFunctions.js')()

contract('DistributeToken', function () {
  let accounts = web3.eth.accounts
  let account1 = accounts[1]

  let tokens = 1000
  let burnAmount = 100
  let netTokens = tokens - burnAmount

  let weiPool, _projectCost, _proposerStake, _timePeriod
  let tempBalance, totalTokenTemp

  it('mints capital tokens', () =>  {
    let DT
    return getDT()
      .then((instance) => DT = instance)
      .then(() => DT.mint(tokens, {from: account1, value: 502934896893435110}))
      .then(() => DT.totalSupply.call())
      .then((totalSupply) => assert.equal(totalSupply, tokens, 'total token supply not updated correctly'))
      .then(() => DT.totalFreeSupply.call())
      .then((totalFreeSupply) => assert.equal(totalFreeSupply, tokens, 'free token supply not updated correctly'))
      .then(() => DT.balances.call(account1))
      .then((balance) => assert.equal(balance, tokens, 'balances mapping not updated correctly'))
  })

  it('burns capital tokens', function() {
    let DT
    return getDT ()
      .then((instance) => DT = instance)
      .then(() => DT.balances.call(account1))
      .then((balance) => assert.equal(balance, tokens, 'balance call failed'))
      .then(() => DT.burnAndRefund(burnAmount, {from: account1}))
      .then(() => DT.balances.call(account1))
      .then((balance) => {
        tempBalance = balance
        assert.equal(tempBalance, netTokens, 'balances mapping not updated correctly')
      })
      .then(() => DT.totalCapitalTokenSupply.call())
      .then((tokensupply) => {
        totalTokenTemp = tokensupply
        assert.equal(totalTokenTemp, netTokens, 'total token supply not updated correctly')
      })
      .then(() => DT.totalFreeCapitalTokenSupply.call())
      .then((tokensupply) => assert.equal(tokensupply, netTokens, 'free token supply not updated correctly'))
  })


  // it('proposes a project', function() {
  //     let DT
  //     return getDT()
  //       .then((instance) => DT = instance)
  //       .then(() => DT.weiBal.call())
  //       .then((weiBal) => weiPool = weiBal)
  //       .then(() => DT.totalCapitalTokenSupply.call())
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
