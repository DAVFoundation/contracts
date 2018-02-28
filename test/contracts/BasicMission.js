const Identity = artifacts.require('./Identity.sol');
const DAVToken = artifacts.require('./mocks/DAVTokenMock.sol');
const BasicMission = artifacts.require('./BasicMission.sol');

const { registerIdentity, sampleIdentities } = require('../helpers/identity');
const expectThrow = require('../helpers/expectThrow');

const deployContracts = async () => {
  const TokenContract = await DAVToken.new();
  const IdentityContract = await Identity.new(TokenContract.address);
  const BasicMissionContract = await BasicMission.new(IdentityContract.address, TokenContract.address);
  return { TokenContract, IdentityContract, BasicMissionContract };
};

contract('BasicMission', function(accounts) {
  let TokenContract;
  let IdentityContract;
  let BasicMissionContract;
  let createEvent;
  let signedEvent;

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
    ({
      TokenContract,
      IdentityContract,
      BasicMissionContract,
    } = await deployContracts());

    createEvent = BasicMissionContract.Create();
    signedEvent = BasicMissionContract.Signed();

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
  });

  it('should complete successfully when everything is in order', async function() {
    const userAirdropAmount = 10;
    // const missionCost = 4;
    let userTokenBalance;
    // let vehicleTokenBalance;

    // Airdrop some money to User for testing
    userTokenBalance = await IdentityContract.getBalance(user.id);
    assert.equal(userTokenBalance, 0);
    await TokenContract.transfer(user.wallet, userAirdropAmount);
    userTokenBalance = await IdentityContract.getBalance(user.id);
    assert.equal(userTokenBalance, userAirdropAmount);

    // Vehicles creates new basic mission
    await BasicMissionContract.create(vehicle.id, user.id, 4, {from: vehicle.wallet});

    // Event received
    const missionId = (await createEvent.get())[0].args.id;

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
    it('should fire a Create event with the mission id, seller id, and buyer id', async () => {
      await BasicMissionContract.create(vehicle.id, user.id, 4, {
        from: vehicle.wallet,
      });
      const events = await createEvent.get();
      assert.equal(events.length, 1);
      assert.typeOf(events[0].args.id, 'string');
      assert.match(events[0].args.id, /^0x.{64}$/);
      assert.equal(events[0].args.sellerId, vehicle.id);
      assert.equal(events[0].args.buyerId, user.id);
    });

    it('should throw if account creating the mission does not control the identity', async () => {
      await expectThrow(
        BasicMissionContract.create(vehicle.id, user.id, 4, {
          from: user.wallet,
        }),
      );
    });

    xit('should fail if cost is negative');
  });

  describe('fund', () => {
    let missionId;
    const missionCost = 4;

    beforeEach(async () => {
      await BasicMissionContract.create(vehicle.id, user.id, missionCost, {from: vehicle.wallet});
      missionId = (await createEvent.get())[0].args.id;
    });

    xit('should set mission as signed', async () => {
      // Airdrop some money to User for testing
      const userAirdropAmount = 5;
      await TokenContract.transfer(user.wallet, userAirdropAmount);

      await TokenContract.approve(BasicMissionContract.address, missionCost, {from: user.wallet});
      await BasicMissionContract.fund(missionId, user.id, {from: user.wallet});
    });

    it('should fire a Signed event', async () => {
      // Airdrop some money to User for testing
      const userAirdropAmount = 5;
      await TokenContract.transfer(user.wallet, userAirdropAmount);

      await TokenContract.approve(BasicMissionContract.address, missionCost, {from: user.wallet});
      await BasicMissionContract.fund(missionId, user.id, {from: user.wallet});

      const events = await signedEvent.get();
      assert.equal(events.length, 1);
      assert.equal(events[0].args.id, missionId);
    });

    it('should deduct the cost from the balance of the buyer', async () => {
      // Airdrop some money to User for testing
      const userAirdropAmount = 5;
      await TokenContract.transfer(user.wallet, userAirdropAmount);

      await TokenContract.approve(BasicMissionContract.address, missionCost, {from: user.wallet});
      await BasicMissionContract.fund(missionId, user.id, {from: user.wallet});
      const userTokenBalance = await IdentityContract.getBalance(user.id);
      assert.equal(userTokenBalance, userAirdropAmount-missionCost);
    });

    it('should fail if account funding the mission does not control buyer id', async () => {
      // Airdrop some money to User for testing
      const userAirdropAmount = 5;
      await TokenContract.transfer(user.wallet, userAirdropAmount);

      await TokenContract.approve(BasicMissionContract.address, missionCost, {from: user.wallet});
      await expectThrow(
        BasicMissionContract.fund(missionId, user.id, {from: vehicle.wallet})
      );
    });

    xit('should fail if account funding the mission does not have enough tokens');
    xit('should fail if buyer id and mission id do not match');
    xit('should increase the balance of the contract by the mission cost');
  });

});
