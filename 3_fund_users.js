var TokenHolderRegistry = artifacts.require("./TokenHolderRegistry.sol");

module.exports = function(deployer) {
    var accounts = web3.eth.accounts;
    console.log(accounts.length)

    deployer.then(function(){
        return TokenHolderRegistry.deployed()
    }).then(function(instance){
        for(i=0; i < accounts.length; i++) {
            console.log(web3.eth.getBalance(accounts[i]).toNumber())
            instance.mint(10, {from: accounts[i], value: 100000000000000})
            return TokenHolderRegistry.deployed()
        }
    }).then(function(instance){
      return instance.balancesuint.call(accounts[0])
    }).then(function (instance){
        console.log(instance)
    }).then(function(){
        for(i=0; i < accounts.length; i++) {
            console.log(web3.eth.getBalance(accounts[i]))
        // instance.transfer(demoAddress, 1, {from: accounts[0]})
        }
    })
}
