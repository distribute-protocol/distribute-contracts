require('./testFunctions.js')();

contract('Token holder', function() {

  let accounts = web3.eth.accounts
  let account1 = accounts[1]

  let tokens = 102;
  let burnAmount = 2;
  let weiPool, _projectCost, _timePeriod;
  let tempBalance, freeTokenTemp, totalTokenTemp;

  it("mints capital tokens", () =>  {
      let THR;
      return getTHR()
          .then((instance) => THR = instance)
          .then(() => THR.mint(tokens, {from: account1, value: 502934896893435110}))
          .then(() => THR.totalCapitalTokenSupply.call())
          .then((tokensupply) => assert.equal(tokensupply, tokens, "total token supply not updated correctly"))
          .then(() => THR.totalFreeCapitalTokenSupply.call())
          .then((tokensupply) => assert.equal(tokensupply, tokens, "free token supply not updated correctly"))
          .then(() => THR.balances.call(account1))
          .then((balance) => assert.equal(balance, tokens, "balances mapping not updated correctly"));
  });

  it("burns capital tokens", function() {
      let THR;
      return getTHR()
          .then((instance) => THR = instance)
          .then(() => THR.balances.call(account1))
          .then((balance) => assert.equal(balance, tokens, "balance call failed"))
          .then(() => THR.burnAndRefund(burnAmount, {from: account1}))
          .then(() => THR.balances.call(account1))
          .then((balance) => {
              tempBalance = balance;
              assert.equal(tempBalance, (tokens - burnAmount), "balances mapping not updated correctly")
          })
          .then(() => THR.totalCapitalTokenSupply.call())
          .then((tokensupply) => {
              totalTokenTemp = tokensupply
              assert.equal(totalTokenTemp, (tokens - burnAmount), "total token supply not updated correctly")
          })
          .then(() => THR.totalFreeCapitalTokenSupply.call())
          .then((tokensupply) => assert.equal(tokensupply, (tokens - burnAmount), "free token supply not updated correctly"));
  });


  it("proposes a project", function() {
      let THR;
      return getTHR()
          .then((instance) => THR = instance)
          .then(() => THR.weiBal.call())
          .then((weiBal) => weiPool = weiBal)
          .then(() => THR.totalCapitalTokenSupply.call())
          .then((tokensupply) => {
              _projectCost = Math.round(20*(weiPool/tokensupply))      //cost of 20 tokens will be project cost, so proposer stake should be 1 token
              _timePeriod = Date.now() + 120000000000 //long time from now
          })
          .then(() => THR.proposeProject(_projectCost, _timePeriod, {from: account1}))
          .then(() => THR.projectNonce.call())
          .then((nonce) => assert.notEqual(nonce, 0, "nonce not updated correctly"))
          .then(() => THR.balances.call(account1))
          .then((balance) => assert.notEqual(balance, tempBalance, "account1 balances not updated correctly"))
          .then(() => THR.totalFreeCapitalTokenSupply.call())
          .then((freetokens) => assert.notEqual(freeTokenTemp, freetokens, "free token supply not updated correctly"))
          .then(() => THR.totalCapitalTokenSupply.call())
          .then((totaltokens) => assert.notEqual(totalTokenTemp, totaltokens, "total token supply not updated correctly"));
  });

});
