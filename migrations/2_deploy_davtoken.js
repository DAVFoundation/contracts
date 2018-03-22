var DAVToken = artifacts.require('./DAVToken.sol');

module.exports = async (deployer) => {
  deployer.deploy(DAVToken);
};
