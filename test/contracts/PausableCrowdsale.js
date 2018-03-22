const assertRevert = require('../helpers/assertRevert');

const DAVToken = artifacts.require('./mocks/DAVTokenMock.sol');
const DAVCrowdsale = artifacts.require('./DAVCrowdsale.sol');

const BigNumber = web3.BigNumber;

contract('DAVCrowdsale is PausableCrowdsale', (accounts) => {

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
    describe('when the sender is the token owner', () => {

      describe('when the token is unpaused', () => {

        it('pauses the token', async () => {
          await crowdsale.pause({ from: owner });
          const paused = await crowdsale.paused();
          assert.equal(paused, true);
        });

        it('emits a Pause event', async () => {
          const { logs } = await crowdsale.pause({ from: owner });
          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Pause');
        });
      });

      describe('when the token is paused', () => {
        beforeEach(async () => {
          await crowdsale.pause({ from: owner });
        });

        it('reverts', async () => {
          await assertRevert(crowdsale.pause({ from: owner }));
        });
      });

    });

    describe('when the sender is not the token owner', () => {

      it('reverts', async () => {
        await assertRevert(crowdsale.pause({ from: bank }));
      });

    });
  });

  describe('unpause()', () => {
    describe('when the sender is the token owner', () => {

      describe('when the token is paused', () => {
        beforeEach(async () => {
          await crowdsale.pause({ from: owner });
        });

        it('unpauses the token', async () => {
          await crowdsale.unpause({ from: owner });
          const paused = await crowdsale.paused();
          assert.equal(paused, false);
        });

        it('emits an Unpause event', async () => {
          const { logs } = await crowdsale.unpause({ from: owner });
          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Unpause');
        });
      });

      describe('when the token is unpaused', () => {
        it('reverts', async () => {
          await assertRevert(crowdsale.unpause({ from: owner }));
        });
      });

    });

    describe('when the sender is not the token owner', () => {
      it('reverts', async () => {
        await assertRevert(crowdsale.unpause({ from: bank }));
      });
    });
  });

  describe('paused', () => {

    it('is not paused by default', async () => {
      const paused = await crowdsale.paused({ from: owner });
      assert.equal(paused, false);
    });

    it('is paused after being paused', async () => {
      await crowdsale.pause({ from: owner });
      const paused = await crowdsale.paused({ from: owner });
      assert.equal(paused, true);
    });

    it('is not paused after being paused and then unpaused', async () => {
      await crowdsale.pause({ from: owner });
      await crowdsale.unpause({ from: owner });
      const paused = await crowdsale.paused({ from: owner });
      assert.equal(paused, false);
    });

  });

});
