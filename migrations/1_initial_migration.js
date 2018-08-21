var Migrations = artifacts.require("./Library/Migrations.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
