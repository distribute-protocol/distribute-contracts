var Migrations = artifacts.require("./library/Migrations");

module.exports = function(deployer) {
  deployer.deploy(Migrations, {gas: 6000000});
};
