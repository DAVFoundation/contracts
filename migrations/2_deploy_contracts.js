var DAVToken = artifacts.require('./DAVToken.sol');
// var Ownable = artifacts.require('./helpers/Ownable.sol');
var Factory = artifacts.require('./Factory.sol');
// var IdentityRelay = artifacts.require('./identity/IdentityRelay.sol');
// var Identity = artifacts.require('./identity/Identity.sol');

module.exports = function(deployer) {
  deployer.deploy(DAVToken);
  deployer.deploy(Factory);
  // deployer.deploy(IdentityRelay);
  // deployer.deploy(Identity);
  // deployer.deploy(Ownable);
};
