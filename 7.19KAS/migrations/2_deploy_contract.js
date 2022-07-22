const Migrations = artifacts.require("safe");

module.exports = function (deployer) {
  deployer.deploy(safe);
};
