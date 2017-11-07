var DAVToken = artifacts.require('./DAVToken.sol');
var Identities = artifacts.require('./Identities.sol');
var Payments = artifacts.require('./Payments.sol');
// var IdentityRelay = artifacts.require('./identity/IdentityRelay.sol');
// var Identity = artifacts.require('./identity/Identity.sol');

module.exports = function(deployer) {
  deployer.deploy(DAVToken);
  deployer.deploy(Identities);
  deployer.deploy(Payments);
  // deployer.deploy(IdentityRelay);
  // deployer.deploy(Identity);
  // deployer.deploy(Ownable);
};
