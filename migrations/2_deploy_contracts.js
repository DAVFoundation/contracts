const DAVToken = artifacts.require('./DAVToken.sol');
const DAVCrowdsale = artifacts.require('./DAVCrowdsale.sol');

module.exports = async (deployer, network, [bank]) => {
  // Conversion rate between wei to DAV's smallest unit (1/1e18 DAV)
  const rate = 10000;
  // Minimal acceptable contribution amount
  const minimalContribution = web3.toWei(0.2, 'ether');
  // Sale time
  const openingTime = Date.parse('11 June 2018 13:00:00 GMT')/1000;
  const closingTime = Date.parse('25 June 2018 13:00:00 GMT')/1000;

  await deployer.deploy(DAVToken, 1000000000000000000000000);
  await deployer.deploy(DAVCrowdsale, rate, bank, DAVToken.address, minimalContribution, openingTime, closingTime);
};
