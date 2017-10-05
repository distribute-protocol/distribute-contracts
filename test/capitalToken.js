var TokenHolderRegistry = artifacts.require("TokenHolderRegistry")
var Project = artifacts.require("Project")

accounts = web3.eth.accounts
var account1 = accounts[1]    //account 0 is THR
var tokens = 7
var burnAmount = 2

//utils = require("../js/utils.js")

contract('Capital token', function(accounts) {
  it("is minted", function() {
    return TokenHolderRegistry.deployed().then(function(instance) {
      THR = instance
      return THR.mint(tokens, {from: account1, value: 1500000000000000})
    }).then(function() {
      return THR.totalCapitalTokenSupply.call()
    }).then(function(tokensupply) {
      assert.equal(tokensupply, tokens, "total token supply not updated correctly")
      return THR.totalFreeCapitalTokenSupply.call()
    }).then(function(tokensupply) {
      assert.equal(tokensupply, tokens, "free token supply not updated correctly")
      return THR.balances.call(account1)
    }).then(function(balance) {
      assert.equal(balance, tokens, 'balances mapping not updated correctly')
    });
  });

  it("is burned", function() {
    return TokenHolderRegistry.deployed().then(function(instance) {
      THR = instance
      return THR.balances.call(account1)
    }).then(function(balance) {
      assert.equal(balance, tokens, "balance call failed")
      return THR.burnAndRefund(burnAmount, {from: account1})
    }).then(function() {
      return THR.balances.call(account1)
    }).then(function(balance) {
      assert.equal(balance, (tokens - burnAmount), 'balances mapping not updated correctly')
      return THR.totalCapitalTokenSupply.call();
    }).then(function(tokensupply) {
      assert.equal(tokensupply, (tokens - burnAmount), "total token supply not updated correctly")
      return THR.totalFreeCapitalTokenSupply.call()
    }).then(function(tokensupply) {
      assert.equal(tokensupply, (tokens - burnAmount), "free token supply not updated correctly")
    });
  });



});
