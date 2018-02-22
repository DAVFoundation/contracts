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

    it('should throw when attempting to register with an invalid address', async function() {
      await expectThrow(
        registerIdentity(
          IdentityContract,
          walletAddress,
          '0x17325a469aef3472aa58dfdcf672881d79b31d57',
        ),
      );
    });

    xit('should throw when attempting to register with an invalid signature.v');

    xit('should throw when attempting to register with an invalid signature.r');

    xit('should throw when attempting to register with an invalid signature.s');

    it('should throw when attempting to register an existing id', async function() {
      registerIdentity(IdentityContract, walletAddress);
      await expectThrow(registerIdentity(IdentityContract, walletAddress));
    });
  });

  describe('getBalance', () => {
    beforeEach(async function() {
      registerIdentity(IdentityContract, walletAddress);
    });

    it("should return the correct DAV balance of an identity's wallet when given an identity address", async function() {
      assert.equal(
        await IdentityContract.getBalance(sampleIdentities[0].address),
        100,
      );
    });
  });
});
