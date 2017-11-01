// Global settings and variables
const helpers = require('./helpers');

const DAVToken = artifacts.require('./DAVToken.sol');

let accounts;

// Setup procedure for the tests
const setupDAVToken = async function() {
  accounts = web3.eth.accounts;
  davToken = await DAVToken.new();

  return davToken;
}

// Tests
contract('DAVToken', function(accounts) {

  before(function() {
    // helpers.etherForEveryone();
  });

  it('what do we test?', async function() {
    davToken = await setupDAVToken();


  });
});
