var DAVToken = artifacts.require('./DAVToken.sol');
var Identity = artifacts.require('./Identity.sol');
var Payment = artifacts.require('./Payment.sol');

module.exports = function(deployer) {
  deployer.deploy(DAVToken);
  deployer.deploy(Identity);
  deployer.deploy(Payment);
};
