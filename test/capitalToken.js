var TokenHolderRegistry = artifacts.require("TokenHolderRegistry")
var Project = artifacts.require("Project")

accounts = web3.eth.accounts
var account1 = accounts[1]    //account 0 is THR

//utils = require("../js/utils.js")

contract('Capital token', function(accounts) {
  it("is minted", function() {
    return TokenHolderRegistry.deployed().then(function(instance) {
      THR = instance
      tokens = 7
      return THR.mint(tokens, {from: account1, value: 1500000000000000})
    }).then(function() {
      return THR.totalCapitalTokenSupply.call()
    }).then(function(tokensupply) {
      assert.equal(tokensupply, tokens, "total token supply not updated correctly")
    }).then(function() {
      return THR.balances.call(account1)
    }).then(function(balance) {
      assert.equal(balance, tokens, 'balances mapping not updated correctly')
    });
  });

  it("is burned", function() {
    return TokenHolderRegistry.deployed().then(function(instance) {
      THR = instance;
      return THR.balances.call(account1)
    }).then(function(balance) {
      assert.equal(balance, 7, "balance call failed")
      return THR.burnAndRefund(balance, {from: account1})
    }).then(function() {
      return THR.balances.call(account1)
    }).then(function(balance) {
      assert.equal(balance, 0, 'balances mapping not updated correctly')
      return THR.totalCapitalTokenSupply.call();
    }).then(function(tokensupply) {
      assert.equal(tokensupply, 0, "total token supply not updated correctly")
    });
  });



});
