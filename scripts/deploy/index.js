// Requirements
const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');
const deployContract = require('../helpers/deployContract');
const chalk = require('chalk');
const chalkAddr = chalk.bold.green;
const chalkDone = chalk.bold.bgGreen;
const chalkError = chalk.bold.bgRed;
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
    [bankMultisigOwners, bankMultisigRequirement],
    MultiSigWalletFile,
  );
  console.log(
    'Deployed MultiSigWallet for Ether Bank',
    chalkAddr(bankMultisigInstance._address),
  );

  // Deploy MultiSigWallet for Foundation DAVs
  const foundationMultisigInstance = await deployContract(
    ethNetworkId,
    web3,
    deployerAddress,
    MultiSigWallet,
    [foundationMultisigOwners, foundationMultisigRequirement],
    MultiSigWalletFile,
  );
  console.log(
    'Deployed MultiSigWallet for Foundation DAVs',
    chalkAddr(foundationMultisigInstance._address),
  );

  // Deploy MultiSigWallet for contract owner
  const ownerMultisigInstance = await deployContract(
    ethNetworkId,
    web3,
    deployerAddress,
    MultiSigWallet,
    [ownerMultisigOwners, ownerMultisigRequirement],
    MultiSigWalletFile,
  );
  console.log(
    'Deployed MultiSigWallet for contract owner',
    chalkAddr(ownerMultisigInstance._address),
  );

  // Deploy MultiSigWallet for locked DAV tokens
  const lockedTokensMultisigInstance = await deployContract(
    ethNetworkId,
    web3,
    deployerAddress,
    MultiSigWallet,
    [lockedTokensMultisigOwners, lockedTokensMultisigRequirement],
    MultiSigWalletFile,
  );
  console.log(
    'Deployed MultiSigWallet for locked DAV tokens',
    chalkAddr(lockedTokensMultisigInstance._address),
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
  console.log('Deployed DAVToken', chalkAddr(DAVTokenInstance._address));

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
  console.log(
    'Deployed DAVCrowdsale',
    chalkAddr(DAVCrowdsaleInstance._address),
  );

  // Change whitelist manager
  await DAVCrowdsaleInstance.methods
    .setWhitelistManager(whitelistManager)
    .send(defaultTransactionOptions);
  console.log('Change whitelist manager', chalkAddr(whitelistManager));

  // Transfer Token ownership to Crowdsale
  await DAVTokenInstance.methods
    .transferOwnership(DAVCrowdsaleInstance._address)
    .send(defaultTransactionOptions);
  console.log(
    'Transfer Token ownership to Crowdsale',
    chalkAddr(DAVCrowdsaleInstance._address),
  );

  // Transfer Crowdsale ownership to multisig
  await DAVCrowdsaleInstance.methods
    .transferOwnership(ownerMultisigInstance._address)
    .send(defaultTransactionOptions);
  console.log(
    'Transfer Crowdsale ownership to multisig',
    chalkAddr(ownerMultisigInstance._address),
  );
}

deploySequence()
  .then(() => console.log(chalkDone('Deployment complete')))
  .catch(err => console.log(chalkError(err)));
