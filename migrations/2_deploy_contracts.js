const DAVToken = artifacts.require('./DAVToken.sol');
const DAVCrowdsale = artifacts.require('./DAVCrowdsale.sol');

module.exports = async (deployer, network, accounts) => {
  // Conversion rate between wei to DAV's smallest unit (1/1e18 DAV)
  const _rate = 10000;

  await deployer.deploy(DAVToken);
  await deployer.deploy(DAVCrowdsale, _rate, accounts[0], DAVToken.address);
};
