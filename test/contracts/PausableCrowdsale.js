const assertRevert = require('../helpers/assertRevert');

const DAVToken = artifacts.require('./mocks/DAVTokenMock.sol');
const DAVCrowdsale = artifacts.require('./DAVCrowdsale.sol');

const BigNumber = web3.BigNumber;

contract('DAVCrowdsale is PausableCrowdsale', function(accounts) {

  const owner = accounts[1];
  const bank = accounts[2];
  const rate = new BigNumber(10000);

  let token;
  let crowdsale;

  beforeEach(async () => {
    token = await DAVToken.new();
    crowdsale = await DAVCrowdsale.new(rate, bank, token.address, { from: owner });
    await token.transferOwnership(crowdsale.address);
  });

  describe('pause()', () => {
    describe('when the sender is the token owner', function () {

      describe('when the token is unpaused', function () {

        it('pauses the token', async function () {
          await crowdsale.pause({ from: owner });
          const paused = await crowdsale.paused();
          assert.equal(paused, true);
        });

        it('emits a Pause event', async function () {
          const { logs } = await crowdsale.pause({ from: owner });
          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Pause');
        });
      });

      describe('when the token is paused', function () {
        beforeEach(async function () {
          await crowdsale.pause({ from: owner });
        });

        it('reverts', async function () {
          await assertRevert(crowdsale.pause({ from: owner }));
        });
      });

    });

    describe('when the sender is not the token owner', function () {

      it('reverts', async function () {
        await assertRevert(crowdsale.pause({ from: bank }));
      });

    });
  });

  describe('unpause()', () => {
    describe('when the sender is the token owner', function () {

      describe('when the token is paused', function () {
        beforeEach(async function () {
          await crowdsale.pause({ from: owner });
        });

        it('unpauses the token', async function () {
          await crowdsale.unpause({ from: owner });
          const paused = await crowdsale.paused();
          assert.equal(paused, false);
        });

        it('emits an Unpause event', async function () {
          const { logs } = await crowdsale.unpause({ from: owner });
          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Unpause');
        });
      });

    });
  });

});
