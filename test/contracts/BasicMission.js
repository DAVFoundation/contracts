const Identity = artifacts.require('./Identity.sol');
const DAVToken = artifacts.require('./mocks/DAVTokenMock.sol');
const BasicMission = artifacts.require('./BasicMission.sol');

const { registerIdentity, sampleIdentities } = require('../helpers/identity');

const deployContracts = async () => {
  const TokenContract = await DAVToken.new();
  const IdentityContract = await Identity.new(TokenContract.address);
  const BasicMissionContract = await BasicMission.new();
  return { TokenContract, IdentityContract, BasicMissionContract };
};

contract('BasicMission', function(accounts) {
  let TokenContract;
  let IdentityContract;
  let BasicMissionContract;

  const user = {
    wallet: accounts[1],
    id: sampleIdentities[0].id,
    v: sampleIdentities[0].v,
    r: sampleIdentities[0].r,
    s: sampleIdentities[0].s,
  };

  const vehicle = {
    wallet: accounts[2],
    id: sampleIdentities[1].id,
    v: sampleIdentities[1].v,
    r: sampleIdentities[1].r,
    s: sampleIdentities[1].s,
  };

  beforeEach(async function() {
    ({ TokenContract, IdentityContract, BasicMissionContract } = await deployContracts());
  });

  it('should complete successfully when everything is in order', async function() {
    const userAirdropAmount = 10;
    // const missionCost = 4;
    let userTokenBalance;
    // let vehicleTokenBalance;

    // Create Identity for User
    registerIdentity(
      IdentityContract,
      user.wallet,
      user.id,
      user.v,
      user.r,
      user.s,
    );

    // Create Identity for Vehicle
    registerIdentity(
      IdentityContract,
      vehicle.wallet,
      vehicle.id,
      vehicle.v,
      vehicle.r,
      vehicle.s,
    );

    // Airdrop some money to User for testing
    userTokenBalance = await IdentityContract.getBalance(user.id);
    assert.equal(userTokenBalance, 0);
    await TokenContract.transfer(user.wallet, userAirdropAmount);
    userTokenBalance = await IdentityContract.getBalance(user.id);
    assert.equal(userTokenBalance, userAirdropAmount);

    // Vehicles creates new basic mission

    // Event received

    // User funds basic mission

    // userTokenBalance = await IdentityContract.getBalance(user.id);
    // assert.equal(userTokenBalance, userAirdropAmount-missionCost);

    // Event received

    // Vehicle agrees to resolve mission

    // Event received

    // User agrees to resolve mission

    // Event received

    // userTokenBalance = await IdentityContract.getBalance(user.id);
    // assert.equal(userTokenBalance, userAirdropAmount-missionCost);
    // vehicleTokenBalance = await IdentityContract.getBalance(vehicle.id);
    // assert.equal(vehicleTokenBalance, missionCost);
  });

  describe('create', () => {
    it('should fire a Create event with the mission id, seller id, and buyer id', () => {
      const createEventContract = BasicMissionContract.Create();
      BasicMissionContract.create(vehicle.id, user.id, 4)
        .then(() => createEventContract.get())
        .then(events => {
          assert.equal(events.length, 1);
          assert.typeOf(events[0].args.id, 'string');
          assert.match(events[0].args.id, /^0x.{64}$/);
          assert.equal(events[0].args.sellerId, vehicle.id);
          assert.equal(events[0].args.buyerId, user.id);
        });
    });

    xit('should throw if account creating the mission does not control the identity');
  });

});
