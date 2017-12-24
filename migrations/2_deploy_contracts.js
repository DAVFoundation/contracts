var DAVToken = artifacts.require('./DAVToken.sol');

module.exports = function(deployer) {
  deployer.deploy(DAVToken);
};
