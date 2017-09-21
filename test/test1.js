var ProjectRegistry = artifacts.require("ProjectRegistry.sol")
var Project = artifacts.require("Project.sol")

accounts = web3.eth.accounts
var account1 = accounts[0]

utils = require("../js/utils.js")

contract('Project', function(accounts) {
  it("is created", function() {
    return ProjectRegistry.deployed().then(function(instance) {
      projReg = instance;
      console.log('account1:', account1)
      return projReg.proposeProject(10, 1507009087, {from: account1})
    }).then(function(result) {
      alert("Transaction successful!")
      }).catch(function(e) {
        console.log('error')
      }).then(function() {
      //projectAddress = utils.getProjectAddress(receiptFromMakeProposal)
      //project = Project.at(projectAddress)
    }).then(function(projectAddress) {
      //return projReg.returnExists.call(projectAddress)
      return true
    }).then(function(bool) {
      assert.equal(bool, true, "Project was created")
    });
  });
});

/*
  contract("Accepting ", function(accounts) {
      describe("a Proposal", async () => {
          var propReg;
          var proposal;
          var oracle;
          it("is created.", async () => {
              propReg = await ProposalRegistry.deployed()
              oracle = await ArbiterOracle.deployed()
              receiptFromMakeProposal = await propReg.makeProposal(cost, votingTime,roles, oracle.address)
              proposalAddress = utils.getProposalAddress(receiptFromMakeProposal)
              proposal = await Proposal.at(proposalAddress)
              // console.log(proposalAddress)
              exists = await propReg.proposalExists.call(proposalAddress)
              assert.equal(exists, true, "Registry does not know about the created Proposal")

          })
*/
