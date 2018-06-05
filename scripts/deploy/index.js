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
  whitelistManager,
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
const defaultTransactionOptions = {
  from: deployerAddress,
  gas: 6712388,
  gasPrice: '15000000000',
};

async function deploySequence() {
  // Deploy MultiSigWallet for Ether Bank
  const bankMultisigInstance = await deployContract(
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
  const foundationMultisigInstance = await deployContract(
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
  const ownerMultisigInstance = await deployContract(
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
  const lockedTokensMultisigInstance = await deployContract(
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
  const DAVTokenInstance = await deployContract(
    ethNetworkId,
    web3,
    deployerAddress,
    DAVToken,
    [totalSupply],
    DAVTokenFile,
  );

  // Deploy DAVCrowdsale
  const DAVCrowdsaleInstance = await deployContract(
    ethNetworkId,
    web3,
    deployerAddress,
    DAVCrowdsale,
    [
      rate,
      bankMultisigInstance._address,
      foundationMultisigInstance._address,
      lockedTokensMultisigInstance._address,
      DAVTokenInstance._address,
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

  // Change whitelist manager
  await DAVCrowdsaleInstance.methods.setWhitelistManager(whitelistManager).send(defaultTransactionOptions);

  // Change Crowdsale owner
  await DAVCrowdsaleInstance.methods.transferOwnership(ownerMultisigInstance._address).send(defaultTransactionOptions);
}

deploySequence().then(() => console.log('done')).catch(err => console.log(err));
