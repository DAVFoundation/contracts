const DAVToken = artifacts.require('./DAVToken.sol');
const DAVCrowdsale = artifacts.require('./DAVCrowdsale.sol');

module.exports = async (deployer, network, [bank]) => {
  // Conversion rate between wei to DAV's smallest unit (1/1e18 DAV)
  const rate = 10000;
  // Minimal acceptable contribution amount
  const minimalContribution = web3.toWei(0.2, 'ether');

  await deployer.deploy(DAVToken);
  await deployer.deploy(DAVCrowdsale, rate, bank, DAVToken.address, minimalContribution);
};
