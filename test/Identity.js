const Identity = artifacts.require('./Identity.sol');
const DAVToken = artifacts.require('./mocks/DAVTokenMock.sol');
const expectThrow = require('./helpers/expectThrow');

const sampleIdentity = {
  address: '0x17325a469aef3472aa58dfdcf672881d79b31d58',
  v: 28,
  r: '0x092851aac67ddb02c0bd976142f66c937d920fee4dbb305890452b67abb1b9b8',
  s: '0x12f6f410abbb099561c5018f4fc5d9ad7a4c5c2a6f01c594f66a3a243bc7f713',
  invalidR: '0x092851aac67ddb02c0bd976142f66c937d920fee4dbb305890452b67abb1b9b0',
};

const deployContracts = async () => {
  const token = await DAVToken.new();
  return Identity.new(token.address);
};

contract('Identity', function(accounts) {
  const walletAddress = accounts[0];
  let IdentityContract;

  beforeEach(async function() {
    IdentityContract = await deployContracts();
  });

  describe('register', () => {
    it('should not throw when attempting to register with a valid signature', async function () {
      IdentityContract.register(sampleIdentity.address, walletAddress, sampleIdentity.v, sampleIdentity.r, sampleIdentity.s);
    });

    it('should throw when attempting to register with an invalid signature', async function () {
      await expectThrow(
        IdentityContract.register(sampleIdentity.address, walletAddress, sampleIdentity.v, sampleIdentity.invalidR, sampleIdentity.s)
      );
    });

    it('should throw when attempting to register an existing id', async function () {
      IdentityContract.register(sampleIdentity.address, walletAddress, sampleIdentity.v, sampleIdentity.r, sampleIdentity.s);
      await expectThrow(
        IdentityContract.register(sampleIdentity.address, walletAddress, sampleIdentity.v, sampleIdentity.r, sampleIdentity.s)
      );
    });
  });

  describe('getBalance', () => {

    beforeEach(async function() {
      IdentityContract.register(sampleIdentity.address, walletAddress, sampleIdentity.v, sampleIdentity.r, sampleIdentity.s);
    });

    it('should return the correct DAV balance of an identity\'s wallet when given an identity address', async function () {
      assert.equal(await IdentityContract.getBalance(sampleIdentity.address), 100);
    });

  });

});
