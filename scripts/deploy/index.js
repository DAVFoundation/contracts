// Requirements
const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');
const deployContract = require('../helpers/deployContract');
const {
  ethNodeUrl,
  ethNetworkId,
  mnemonic,
  ownerAddress,
  bankAddress,
  foundationAddress,
  lockedTokensAddress,
  totalSupply,
  rate,
  weiCap,
  vinciCap,
  minimalContribution,
  maximalIndividualContribution,
  openingTime,
  openingTimeB,
  closingTime,
} = require('./config');

// Contracts
let DAVTokenFile = '../../build/contracts/DAVToken.json';
let DAVToken = require(DAVTokenFile);
let DAVCrowdsaleFile = '../../build/contracts/DAVCrowdsale.json';
let DAVCrowdsale = require(DAVCrowdsaleFile);

// Initialize Web3
const web3Provider = new HDWalletProvider(mnemonic, ethNodeUrl);
const web3 = new Web3(web3Provider);

async function deploySequence() {
  // Deploy DAVToken
  const DAVTokenAddress = await deployContract(
    ethNetworkId,
    web3,
    ownerAddress,
    DAVToken,
    [totalSupply],
    DAVTokenFile,
  );

  // Deploy DAVCrowdsale
  const DAVCrowdsaleAddress = await deployContract(
    ethNetworkId,
    web3,
    ownerAddress,
    DAVCrowdsale,
    [
      rate,
      bankAddress,
      foundationAddress,
      lockedTokensAddress,
      DAVTokenAddress,
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
