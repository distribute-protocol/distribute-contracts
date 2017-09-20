var TokenHolderRegistry = artifacts.require("./TokenHolderRegistry.sol");

module.exports = function(deployer) {
    var accounts = web3.eth.accounts;
    console.log(accounts.length)
    var account1 = accounts[0];
    var account2 = accounts[1];

    deployer.then(function(){
        return TokenHolderRegistry.deployed()
    }).then(function(instance){
        for(i=0; i < accounts.length; i++) {
            console.log(web3.eth.getBalance(accounts[i]).toNumber())
            instance.mint(10, {from: accounts[i]})
            return TokenHolderRegistry.deployed()
        }
    }).then(function(){
        for(i=0; i < accounts.length; i++) {
            console.log(web3.eth.getBalance(accounts[i]))
        // instance.transfer(demoAddress, 1, {from: accounts[0]})
        }
    })
}
