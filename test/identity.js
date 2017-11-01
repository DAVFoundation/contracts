// Global settings and variables
const helpers = require('./helpers');
const assertJump = require('zeppelin-solidity/test/helpers/assertJump');

const Identity = artifacts.require('./Identity.sol');

let accounts;

// Setup procedure for the tests
const setupIdentity = async function() {
  accounts = web3.eth.accounts;
  identity = await Identity.new();

  return identity;
}

// Tests
contract('Identity', function(accounts) {

  before(function() {
    // helpers.etherForEveryone();
  });

  it('Should prevent non-owners from taking control over identity', async function() {
    identity = await setupIdentity();

    try {
      await identity.transferOwnership(accounts[1], {from: accounts[1]});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }

    assert.equal(await identity.owner(), accounts[0]);
  });

  it('Owner(identity creator) can transfer ownership of identity', async function() {
    identity = await setupIdentity();

    await identity.transferOwnership(accounts[1]);
    assert.equal(await identity.owner(), accounts[1]);
  });

});
