const assertRevert = require('../helpers/assertRevert');

const DAVToken = artifacts.require('./mocks/DAVTokenMock.sol');
const DAVCrowdsale = artifacts.require('./DAVCrowdsale.sol');

const BigNumber = web3.BigNumber;

contract('DAVCrowdsale is PausableCrowdsale', ([owner, bank, buyer]) => {

  const rate = new BigNumber(10000);
  const value = new BigNumber(1);

  let token;
  let crowdsale;

  beforeEach(async () => {
    token = await DAVToken.new();
    crowdsale = await DAVCrowdsale.new(rate, bank, token.address, { from: owner });
    await token.transferOwnership(crowdsale.address);
  });

  describe('pause()', () => {
    describe('when the sender is the crowdsale owner', () => {

      describe('when the crowdsale is unpaused', () => {

        it('pauses the crowdsale', async () => {
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

      describe('when the crowdsale is paused', () => {
        beforeEach(async () => {
          await crowdsale.pause({ from: owner });
        });

        it('reverts', async () => {
          await assertRevert(crowdsale.pause({ from: owner }));
        });
      });

    });

    describe('when the sender is not the crowdsale owner', () => {

      it('reverts', async () => {
        await assertRevert(crowdsale.pause({ from: bank }));
      });

    });
  });

  describe('unpause()', () => {
    describe('when the sender is the crowdsale owner', () => {

      describe('when the crowdsale is paused', () => {
        beforeEach(async () => {
          await crowdsale.pause({ from: owner });
        });

        it('unpauses the crowdsale', async () => {
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

      describe('when the crowdsale is unpaused', () => {
        it('reverts', async () => {
          await assertRevert(crowdsale.unpause({ from: owner }));
        });
      });

    });

    describe('when the sender is not the crowdsale owner', () => {
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

  describe('when the crowdsale is paused', () => {

    beforeEach(async () => {
      await crowdsale.pause({ from: owner });
    });

    describe('high-level purchase using fallback function', () => {
      it('reverts', async () => {
        await assertRevert(crowdsale.sendTransaction({ from: buyer, value }));
      });
    });

    describe('buyTokens()', () => {
      it('reverts', async () => {
        await assertRevert(crowdsale.buyTokens(buyer, { from: buyer, value }));
      });
    });

  });

});
