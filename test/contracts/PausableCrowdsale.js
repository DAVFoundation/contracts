const ether = require('../helpers/ether');
const assertRevert = require('../helpers/assertRevert');
const { advanceBlock } = require('../helpers/advanceToBlock');
const { increaseTimeTo, duration } = require('../helpers/increaseTime');
const latestTime = require('../helpers/latestTime');

const DAVToken = artifacts.require('./mocks/DAVTokenMock.sol');
const DAVCrowdsale = artifacts.require('./DAVCrowdsale.sol');

const BigNumber = web3.BigNumber;

contract('DAVCrowdsale is PausableCrowdsale', ([owner, bank, buyer]) => {

  const rate = new BigNumber(10000);
  const value = ether(0.2);

  let token;
  let crowdsale;
  let openingTime;
  let closingTime;

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function
    await advanceBlock();
  });

  beforeEach(async () => {
    openingTime = latestTime() + duration.weeks(1);
    closingTime = openingTime + duration.weeks(1);
    token = await DAVToken.new();
    crowdsale = await DAVCrowdsale.new(rate, bank, token.address, ether(0.2), openingTime, closingTime, { from: owner });
    await token.transferOwnership(crowdsale.address);
    await increaseTimeTo(openingTime);
    await advanceBlock();
  });

  describe('pause()', () => {
    describe('when the sender is the crowdsale owner', () => {
      const from = owner;

      describe('when the crowdsale is unpaused', () => {

        it('pauses the crowdsale', async () => {
          await crowdsale.pause({ from });
          const paused = await crowdsale.paused();
          assert.equal(paused, true);
        });

        it('emits a Pause event', async () => {
          const { logs } = await crowdsale.pause({ from });
          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Pause');
        });
      });

      describe('when the crowdsale is paused', () => {
        beforeEach(async () => {
          await crowdsale.pause({ from });
        });

        it('reverts', async () => {
          await assertRevert(crowdsale.pause({ from }));
        });
      });

    });

    describe('when the sender is not the crowdsale owner', () => {
      const from = bank;

      it('reverts', async () => {
        await assertRevert(crowdsale.pause({ from }));
      });

    });
  });

  describe('unpause()', () => {
    describe('when the sender is the crowdsale owner', () => {
      const from = owner;

      describe('when the crowdsale is paused', () => {
        beforeEach(async () => {
          await crowdsale.pause({ from });
        });

        it('unpauses the crowdsale', async () => {
          await crowdsale.unpause({ from });
          const paused = await crowdsale.paused();
          assert.equal(paused, false);
        });

        it('emits an Unpause event', async () => {
          const { logs } = await crowdsale.unpause({ from });
          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Unpause');
        });
      });

      describe('when the crowdsale is unpaused', () => {
        it('reverts', async () => {
          await assertRevert(crowdsale.unpause({ from }));
        });
      });

    });

    describe('when the sender is not the crowdsale owner', () => {
      const from = bank;

      it('reverts', async () => {
        await assertRevert(crowdsale.unpause({ from }));
      });
    });
  });

  describe('paused', () => {
    const from = owner;

    it('is not paused by default', async () => {
      const paused = await crowdsale.paused({ from });
      assert.equal(paused, false);
    });

    it('is paused after being paused', async () => {
      await crowdsale.pause({ from });
      const paused = await crowdsale.paused({ from });
      assert.equal(paused, true);
    });

    it('is not paused after being paused and then unpaused', async () => {
      await crowdsale.pause({ from });
      await crowdsale.unpause({ from });
      const paused = await crowdsale.paused({ from });
      assert.equal(paused, false);
    });

  });

  describe('when the crowdsale is paused', () => {
    const from = buyer;

    beforeEach(async () => {
      await crowdsale.pause({ from: owner });
    });

    describe('high-level purchase using fallback function', () => {
      it('reverts', async () => {
        await assertRevert(crowdsale.sendTransaction({ from, value }));
      });
    });

    describe('buyTokens()', () => {
      it('reverts', async () => {
        await assertRevert(crowdsale.buyTokens(buyer, { from, value }));
      });
    });

  });

});
