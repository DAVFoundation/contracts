// Requirements
const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');
const deployContract = require('../helpers/deployContract');

// Contracts
let DAVTokenFile = '../../build/contracts/DAVToken.json';
let DAVToken = require(DAVTokenFile);
let DAVCrowdsaleFile = '../../build/contracts/DAVCrowdsale.json';
let DAVCrowdsale = require(DAVCrowdsaleFile);

// Configuration
const ETH_NODE_URL = 'http://localhost:8545';
const ETH_NETWORK_ID = '1527775870202';
const mnemonic =
  'enforce budget dog forest market habit wasp slot another amused genuine scheme';
const ownerAddress = '0xc32f8fe0a1cc707314d4cfc4ce70a54eb0f45ce7';
const bankAddress = '0x84a1ee68a472d49b78b23974c36805b8cc351695';
const foundationAddress = '0x7446d4c07c83ea6e854b6f7b8c8c513a3ef7235a';
const lockedTokensAddress = '0xedf100d5ed9b5215837317cb2162461226f30f6c';

// Initialize Web3
const web3Provider = new HDWalletProvider(mnemonic, ETH_NODE_URL);
const web3 = new Web3(web3Provider);

// Sale parameters
// Total supply
const totalSupply = web3.utils.toWei('1771428571', 'ether');
// Conversion rate between wei to Vinci (DAV's smallest unit: 1/1e18 DAV)
const rate = 10000;
// Caps
const weiCap = web3.utils.toWei('54286');
const vinciCap = web3.utils.toWei('708571429');
// Minimal acceptable contribution amount
const minimalContribution = web3.utils.toWei('0.2', 'ether');
const maximalIndividualContribution = web3.utils.toWei('150', 'ether');
// Sale time
const openingTime = Date.parse('11 June 2018 13:00:00 GMT') / 1000;
const openingTimeB = Date.parse('11 June 2018 18:00:00 GMT') / 1000;
const closingTime = Date.parse('25 June 2018 13:00:00 GMT') / 1000;

async function deploySequence() {
  await deployContract(
    ETH_NETWORK_ID,
    web3,
    ownerAddress,
    DAVToken,
    [totalSupply],
    DAVTokenFile,
  );

  await deployContract(
    ETH_NETWORK_ID,
    web3,
    ownerAddress,
    DAVCrowdsale,
    [
      rate,
      bankAddress,
      foundationAddress,
      lockedTokensAddress,
      DAVToken.networks[ETH_NETWORK_ID].address,
      weiCap,
      vinciCap,
      minimalContribution,
      maximalIndividualContribution,
      openingTime,
      openingTimeB,
      closingTime,
    ],
    DAVCrowdsaleFile,
  );

  console.log('done');
}

deploySequence().catch(err => console.log(err));
