var TokenHolderRegistry = artifacts.require("TokenHolderRegistry")
var Project = artifacts.require("Project")

accounts = web3.eth.accounts
var account1 = accounts[1]    //account 0 is THR

//utils = require("../js/utils.js")

contract('Capital token', function(accounts) {
  it("is minted", function() {
    return TokenHolderRegistry.deployed().then(function(instance) {
      THR = instance;
      //console.log('account1:', account1)
      //return projReg.testFunc(5, {from: account1})
      return THR.mint({from: account1, value: 1500000000000000})
    }).then(function() {
      //return projReg.returnLastProject.call()
      //console.log(x.receipt.gasUsed)
      return THR.totalCapitalTokenSupply.call()
    }).then(function(tokensupply) {
      //gconsole.log(tokensupply.toString())
      a = tokensupply
      assert.notEqual(tokensupply, 0, "tokens were not minted")
    });
  });

  it("is burned", function() {
    return TokenHolderRegistry.deployed().then(function(instance) {
      THR = instance;
      a = THR.totalCapitalTokenSupply.call()
      console.log(a)
      a = a.toNumber();
      return THR.burnAndRefund(a, {from: account1})
    }).then(function(bool){
      return THR.totalCapitalTokenSupply.call();
    }).then(function(tokenSupply) {
      assert.equal(tokenSupply, 0, "tokens were not burned and refunded")
    });
  });



});
