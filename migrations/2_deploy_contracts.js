var DAVToken = artifacts.require('./DAVToken.sol');
var Identity = artifacts.require('./Identity.sol');

module.exports = function(deployer) {
  deployer.deploy(DAVToken);
  deployer.deploy(Identity);
};
