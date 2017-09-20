var TokenHolderRegistry = artifacts.require("./TokenHolderRegistry.sol");

module.exports = function(deployer) {
    var accounts = web3.eth.accounts;
    var account1 = accounts[0];
    var account2 = accounts[1];

    deployer.then(function(){
        return TokenHolderRegistry.deployed()
    }).then(function(instance){
        for(i=1; i < accounts.length; i++) {
            console.log(web3.eth.getBalance(accounts[i]))
          //  instance.mint(10, {from: accounts[i]})
          //  console.log(web3.eth.getBalance(account[i]))
        }
        // instance.transfer(demoAddress, 1, {from: accounts[0]})
    })
}
