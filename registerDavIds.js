
const Web3 = require('web3');
const TruffleContract = require('truffle-contract');
const IdentityArtifact = require('./build/contracts/Identity.json');

let web3Provider = new Web3
  .providers
  .HttpProvider('http://localhost:8545');
let web3 = new Web3(web3Provider);

let register = async function(IdentityContract) {
  let instance = await IdentityContract.deployed();
  let res = await instance.registerSimple({ from: '0x1df62f291b2e969fb0849d99d9ce41e2f137006e' });
  console.log(res);
  res = await instance.registerSimple({ from: '0xaca94ef8bd5ffee41947b4585a84bda5a3d3da6e' });
  console.log(res); 
};

let contract = TruffleContract(IdentityArtifact);
contract.setProvider(web3.currentProvider);

register(contract)
  .catch(function (err) {
    console.log(err);
  });