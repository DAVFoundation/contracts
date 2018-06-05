// Requirements
const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');
const deployContract = require('../helpers/deployContract');
const {
  ethNodeUrl,
  ethNetworkId,
  mnemonic,
  deployerAddress,
  bankMultisigOwners,
  bankMultisigRequirement,
  ownerMultisigOwners,
  ownerMultisigRequirement,
  foundationMultisigOwners,
  foundationMultisigRequirement,
  lockedTokensMultisigOwners,
  lockedTokensMultisigRequirement,
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
let MultiSigWalletFile = '../../build/contracts/MultiSigWallet.json';
let MultiSigWallet = require(MultiSigWalletFile);
let DAVTokenFile = '../../build/contracts/DAVToken.json';
let DAVToken = require(DAVTokenFile);
let DAVCrowdsaleFile = '../../build/contracts/DAVCrowdsale.json';
let DAVCrowdsale = require(DAVCrowdsaleFile);

// Initialize Web3
const web3Provider = new HDWalletProvider(mnemonic, ethNodeUrl);
const web3 = new Web3(web3Provider);

async function deploySequence() {
  // Deploy MultiSigWallet for Ether Bank
  const bankAddress = await deployContract(
    ethNetworkId,
    web3,
    deployerAddress,
    MultiSigWallet,
    [
      bankMultisigOwners,
      bankMultisigRequirement,
    ],
    MultiSigWalletFile,
  );

  // Deploy MultiSigWallet for Foundation DAVs
  const foundationAddress = await deployContract(
    ethNetworkId,
    web3,
    deployerAddress,
    MultiSigWallet,
    [
      foundationMultisigOwners,
      foundationMultisigRequirement,
    ],
    MultiSigWalletFile,
  );

  // Deploy MultiSigWallet for contract owner
  const ownerAddress = await deployContract(
    ethNetworkId,
    web3,
    deployerAddress,
    MultiSigWallet,
    [
      ownerMultisigOwners,
      ownerMultisigRequirement,
    ],
    MultiSigWalletFile,
  );

  // Deploy MultiSigWallet for locked DAV tokens
  const lockedTokensAddress = await deployContract(
    ethNetworkId,
    web3,
    deployerAddress,
    MultiSigWallet,
    [
      lockedTokensMultisigOwners,
      lockedTokensMultisigRequirement,
    ],
    MultiSigWalletFile,
  );

  // Deploy DAVToken
  const DAVTokenAddress = await deployContract(
    ethNetworkId,
    web3,
    deployerAddress,
    DAVToken,
    [totalSupply],
    DAVTokenFile,
  );

  // Deploy DAVCrowdsale
  const DAVCrowdsaleAddress = await deployContract(
    ethNetworkId,
    web3,
    deployerAddress,
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
}

deploySequence().then(() => console.log('done')).catch(err => console.log(err));
