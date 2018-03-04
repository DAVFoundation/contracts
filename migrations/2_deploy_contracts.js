var DAVToken = artifacts.require('./DAVToken.sol');

module.exports = async (deployer) => {
  await deployer.deploy(DAVToken);
};
