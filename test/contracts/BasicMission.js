const Identity = artifacts.require('./Identity.sol');
const DAVToken = artifacts.require('./DAVToken.sol');
const BasicMission = artifacts.require('./BasicMission.sol');
const uuid = require('uuid/v4');
const totalSupply = web3.toWei(1771428571, 'ether');

const { registerIdentity, sampleIdentities } = require('../helpers/identity');
const expectThrow = require('../helpers/assertRevert');

const deployContracts = async () => {
  const TokenContract = await DAVToken.new(totalSupply);
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
    await registerIdentity(
      IdentityContract,
      user.wallet,
      user.id,
      user.v,
      user.r,
      user.s,
    );

    // Create Identity for Vehicle
    await registerIdentity(
      IdentityContract,
      vehicle.wallet,
      vehicle.id,
      vehicle.v,
      vehicle.r,
      vehicle.s,
    );
  });

  it('should complete successfully when everything is in order', async function() {
    const userAirdropAmount = 20;
    const missionCost = 4;
    const tokenAmount = 15;
    const preMissionVehicleBalance = web3.eth.getBalance(vehicle.wallet);
    let userTokenBalance;
    // let vehicleTokenBalance;

    // Airdrop some money to User for testing
    userTokenBalance = await IdentityContract.getBalance.call(user.id);
    assert.equal(userTokenBalance.toNumber(), 0);
    await TokenContract.transfer(user.wallet, userAirdropAmount);
    userTokenBalance = await IdentityContract.getBalance.call(user.id);
    assert.equal(userTokenBalance.toNumber(), userAirdropAmount);

    // User funds basic mission and creates new basic mission
    await TokenContract.approve(BasicMissionContract.address, tokenAmount, {from: user.wallet});
    // generate new unique 128bit id for bid
    let binaryId = new Array(16);
    uuid(null, binaryId, 0);
    let missionId = Buffer.from(binaryId).toString('hex');
    await BasicMissionContract.create(missionId, vehicle.id, user.id, tokenAmount, {from: user.wallet, value: missionCost});
    assert.equal(web3.eth.getBalance(BasicMissionContract.address), missionCost);

    userTokenBalance = await IdentityContract.getBalance(user.id);
    assert.equal(userTokenBalance.toNumber(), userAirdropAmount-tokenAmount);

    // Event received (Create)
    const createdMissionId = (await createEvent.get())[0].args.id;
    assert.equal(Buffer.from(createdMissionId.substr(2), 'hex').toString(), missionId);

    await BasicMissionContract.fulfilled(missionId, {from: user.wallet});
    assert.equal(web3.eth.getBalance(BasicMissionContract.address), 0);

    // Event received (Signed)
    const events = await signedEvent.get();
    assert.equal(events.length, 1);
    assert.equal(events[0].args.id, '0x' + Buffer.from(missionId).toString('hex'));

    let vehicleTokenBalance = await IdentityContract.getBalance(vehicle.id);
    assert.equal(vehicleTokenBalance.toNumber(), 0);
    // verify eth received by seller
    const postMissionVehicleBalance = web3.eth.getBalance(vehicle.wallet);
    assert.equal(postMissionVehicleBalance.sub(preMissionVehicleBalance), missionCost);

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
    const userAirdropAmount = 20;
    const missionCost = 4;
    const tokenAmount = 15;
    let missionId;
    beforeEach(async () => {
      // Airdrop some money to User for testing
      await TokenContract.transfer(user.wallet, userAirdropAmount);
      // User funds basic mission and creates new basic mission
      await TokenContract.approve(BasicMissionContract.address, tokenAmount, {from: user.wallet});

      // generate new unique 128bit id for bid
      let binaryId = new Array(16);
      uuid(null, binaryId, 0);
      missionId = Buffer.from(binaryId).toString('hex');
    });

    it('should fire a Create event with the mission id, seller id, and buyer id', async () => {
      await BasicMissionContract.create(missionId, vehicle.id, user.id, tokenAmount, {from: user.wallet, value: missionCost});

      const events = await createEvent.get();
      assert.equal(events.length, 1);
      assert.typeOf(events[0].args.id, 'string');
      assert.equal(events[0].args.id, '0x' + Buffer.from(missionId).toString('hex'));
      assert.equal(events[0].args.sellerId, vehicle.id);
      assert.equal(events[0].args.buyerId, user.id);
    });

    it('should throw if account creating the mission does not control the identity', async () => {
      await expectThrow(
        BasicMissionContract.create(missionId, vehicle.id, user.id, tokenAmount, {
          from: vehicle.wallet,
          value: missionCost
        }),
      );
    });

    xit('should fail if cost is negative');
  });

  describe('approve', () => {
    let missionId;
    const userAirdropAmount = 20;
    const missionCost = 4;
    const tokenAmount = 15;

    beforeEach(async () => {
      // Airdrop some money to User for testing
      // generate new unique 128bit id for bid
      let binaryId = new Array(16);
      uuid(null, binaryId, 0);
      missionId = Buffer.from(binaryId).toString('hex');

      await TokenContract.transfer(user.wallet, userAirdropAmount);
      await TokenContract.approve(BasicMissionContract.address, tokenAmount, {from: user.wallet});
      await BasicMissionContract.create(missionId, vehicle.id, user.id, tokenAmount, {from: user.wallet, value: missionCost});
      // missionId = (await createEvent.get())[0].args.id;
    });

    xit('should set mission as signed', async () => {
      await BasicMissionContract.fulfilled(missionId, {from: user.wallet});
      //TODO: chech if mission is signed or remove this test
    });

    it('should fire a Signed event', async () => {
      await BasicMissionContract.fulfilled(missionId, {from: user.wallet});
      const events = await signedEvent.get();
      let createdMissionId = events[0].args.id;
      assert.equal(events.length, 1);
      assert.equal(Buffer.from(createdMissionId.substr(2), 'hex').toString(), missionId);
    });

    it('should deduct the cost from the balance of the buyer', async () => {
      const userTokenBalance = await IdentityContract.getBalance(user.id);
      assert.equal(userTokenBalance.toNumber(), userAirdropAmount - tokenAmount);
    });

    it('should fail if account signing the mission fulfillment does not control buyer id', async () => {
      await expectThrow(
        BasicMissionContract.fulfilled(missionId, {from: vehicle.wallet})
      );
    });

    xit('should fail if account funding the mission does not have enough tokens');
    xit('should fail if buyer id and mission id do not match');
    xit('should increase the balance of the contract by the mission cost');
  });

});
