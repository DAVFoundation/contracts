var DAVToken = artifacts.require('./DAVToken.sol');
var Identity = artifacts.require('./Identity.sol');

module.exports = async (deployer) => {
  deployer.deploy(Identity, DAVToken.address);
};
