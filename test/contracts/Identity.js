const Identity = artifacts.require('./Identity.sol');
const DAVToken = artifacts.require('./mocks/DAVTokenMock.sol');
const expectThrow = require('../helpers/expectThrow');
const { registerIdentity, sampleIdentities } = require('../helpers/identity');

const deployContracts = async () => {
  const TokenContract = await DAVToken.new();
  return Identity.new(TokenContract.address);
};

contract('Identity', function(accounts) {
  const walletAddress = accounts[0];
  let IdentityContract;

  beforeEach(async function() {
    IdentityContract = await deployContracts();
  });

  describe('register', () => {
    it('should not throw when attempting to register with a valid signature', async function() {
      registerIdentity(IdentityContract, walletAddress);
    });

    it('isRegistered should return true for registered address', async function() {
      await registerIdentity(IdentityContract, walletAddress);
      var isRegistered = await IdentityContract.isRegistered.call(sampleIdentities[0].id);
      assert.isTrue(
        isRegistered
      );
    });

    it('isRegistered should return flase for unregistered address', async function() {
      var isRegistered = await IdentityContract.isRegistered.call(sampleIdentities[0].id);
      assert.isNotTrue(
        isRegistered
      );
    });

    it('should throw when attempting to register with an invalid DAV id', async function() {
      await expectThrow(
        registerIdentity(
          IdentityContract,
          walletAddress,
          '0x17325a469aef3472aa58dfdcf672881d79b31d57'
        ),
      );
    });

    xit('should throw when attempting to register with an invalid signature.v');

    xit('should throw when attempting to register with an invalid signature.r');

    xit('should throw when attempting to register with an invalid signature.s');

    it('should throw when attempting to register an existing DAV id', async function() {
      await registerIdentity(IdentityContract, walletAddress);
      await expectThrow(registerIdentity(IdentityContract, walletAddress));
    });
  });

  describe('getBalance', () => {
    beforeEach(async function() {
      return registerIdentity(
        IdentityContract, 
        walletAddress, 
        sampleIdentities[1].id,
        sampleIdentities[1].v,
        sampleIdentities[1].r,
        sampleIdentities[1].s
      );
    });

    it('should return the correct DAV balance of an identity\'s wallet when given a DAV id', async function() {
      const balance = await IdentityContract.getBalance(sampleIdentities[1].id);
      assert.equal(
        balance.toNumber(),
        100,
      );
    });
  });

  describe('verifyOwnership', () => {
    beforeEach(async function() {
      await registerIdentity(IdentityContract, walletAddress);
    });
    it('should return true when identity and wallet match', async function() {
      assert.isTrue(
        await IdentityContract.verifyOwnership(
          sampleIdentities[0].id,
          accounts[0],
        ),
      );
    });

    it('should return false when identity and wallet do not match', async function() {
      assert.isNotTrue(
        await IdentityContract.verifyOwnership(
          sampleIdentities[0].id,
          accounts[1],
        ),
      );
    });

    it('should return false when identity given is not registered', async function() {
      assert.isNotTrue(
        await IdentityContract.verifyOwnership(
          sampleIdentities[1].id,
          accounts[1],
        ),
      );
    });
  });
});
