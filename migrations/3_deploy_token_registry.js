const TokenRegistry = artifacts.require('TokenRegistry')

module.exports = function (deployer) {
  deployer.then(function () {
    return deployer.deploy(TokenRegistry, {gas: 5718615})
  })
}
