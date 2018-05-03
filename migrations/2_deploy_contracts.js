const DAVToken = artifacts.require('./DAVToken.sol');
const DAVCrowdsale = artifacts.require('./DAVCrowdsale.sol');

module.exports = async (deployer, network, [bank]) => {
  // Total supply
  const totalSupply = web3.toWei(1771428571, 'ether');
  // Conversion rate between wei to DAV's smallest unit (1/1e18 DAV)
  const rate = 10000;
  // Minimal acceptable contribution amount
  const minimalContribution = web3.toWei(0.2, 'ether');
  const maximalIndividualContribution = web3.toWei(150, 'ether');
  // Sale time
  const openingTime = Date.parse('11 June 2018 13:00:00 GMT')/1000;
  const openingTimeB = Date.parse('11 June 2018 18:00:00 GMT')/1000;
  const closingTime = Date.parse('25 June 2018 13:00:00 GMT')/1000;

  await deployer.deploy(DAVToken, totalSupply);
  await deployer.deploy(DAVCrowdsale, rate, bank, DAVToken.address, minimalContribution, maximalIndividualContribution, openingTime, openingTimeB, closingTime);
};
