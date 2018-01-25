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

const registerIdentity = (contract, walletAddress, address = sampleIdentity.address, v = sampleIdentity.v, r = sampleIdentity.r, s = sampleIdentity.s) =>
  contract.register(address, walletAddress, v, r, s);

contract('Identity', function(accounts) {
  const walletAddress = accounts[0];
  let IdentityContract;

  beforeEach(async function() {
    IdentityContract = await deployContracts();
  });

  describe('register', () => {
    it('should not throw when attempting to register with a valid signature', async function () {
      registerIdentity(IdentityContract, walletAddress);
    });

    it('should throw when attempting to register with an invalid address', async function () {
      await expectThrow(
        registerIdentity(IdentityContract, walletAddress, '0x17325a469aef3472aa58dfdcf672881d79b31d57')
      );
    });

    xit('should throw when attempting to register with an invalid signature.v');

    xit('should throw when attempting to register with an invalid signature.r');

    xit('should throw when attempting to register with an invalid signature.s');

    it('should throw when attempting to register an existing id', async function () {
      registerIdentity(IdentityContract, walletAddress);
      await expectThrow(
        registerIdentity(IdentityContract, walletAddress)
      );
    });
  });

  describe('getBalance', () => {

    beforeEach(async function() {
      registerIdentity(IdentityContract, walletAddress);
    });

    it('should return the correct DAV balance of an identity\'s wallet when given an identity address', async function () {
      assert.equal(await IdentityContract.getBalance(sampleIdentity.address), 100);
    });

  });

});
