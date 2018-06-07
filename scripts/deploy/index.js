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
  let bankMultisigInstanceAddress = bankMultisigInstance._address;
  console.log(
    'Deployed MultiSigWallet for Ether Bank',
    chalkAddr(bankMultisigInstanceAddress),
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
  let foundationMultisigInstanceAddress = foundationMultisigInstance._address;
  console.log(
    'Deployed MultiSigWallet for Foundation DAVs',
    chalkAddr(foundationMultisigInstanceAddress),
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
  let ownerMultisigInstanceAddress = ownerMultisigInstance._address;
  console.log(
    'Deployed MultiSigWallet for contract owner',
    chalkAddr(ownerMultisigInstanceAddress),
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
  let lockedTokensMultisigInstanceAddress = lockedTokensMultisigInstance._address;
  console.log(
    'Deployed MultiSigWallet for locked DAV tokens',
    chalkAddr(lockedTokensMultisigInstanceAddress),
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
      bankMultisigInstanceAddress,
      foundationMultisigInstanceAddress,
      lockedTokensMultisigInstanceAddress,
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

  // Transfer all tokens to crowdsale contract
  await DAVTokenInstance.methods
    .transfer(DAVCrowdsaleInstance._address, totalSupply)
    .send(defaultTransactionOptions);
  console.log(
    'Transfer all tokens to crowdsale contract'
  );

  // Pause token
  await DAVTokenInstance.methods
    .pause()
    .send(defaultTransactionOptions);
  console.log(
    'Pause token'
  );

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
    .transferOwnership(ownerMultisigInstanceAddress)
    .send(defaultTransactionOptions);
  console.log(
    'Transfer Crowdsale ownership to multisig',
    chalkAddr(ownerMultisigInstanceAddress),
  );
}

deploySequence()
  .then(() => console.log(chalkDone('Deployment complete')))
  .catch(err => console.log(chalkError(err)));
