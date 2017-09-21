var ProjectRegistry = artifacts.require("ProjectRegistry")
var Project = artifacts.require("Project")

accounts = web3.eth.accounts
var account1 = accounts[0]

//utils = require("../js/utils.js")

contract('Project', function(accounts) {
  it("is created", function() {
    return ProjectRegistry.deployed().then(function(instance) {
      projReg = instance;
      //console.log('account1:', account1)
      //return projReg.testFunc(5, {from: account1})
      return projReg.proposeProject(10, 1507009087, {from: account1})
    }).then(function(x) {
      //return projReg.returnLastProject.call()
      //console.log(x.receipt.gasUsed)
      return projReg.lastProject.call()
    }).then(function(address) {
      //console.log(address)
      return projReg.projectExists.call(address)
    }).then(function(bool) {
      assert.equal(bool, true, "Project was created")
    });
  });
});
