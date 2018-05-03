const ether = require('../helpers/ether');
const assertRevert = require('../helpers/assertRevert');
const { advanceBlock } = require('../helpers/advanceToBlock');
const { increaseTimeTo, duration } = require('../helpers/increaseTime');
const latestTime = require('../helpers/latestTime');

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const DAVToken = artifacts.require('./DAVToken.sol');
const DAVCrowdsale = artifacts.require('./DAVCrowdsale.sol');

contract('DAVCrowdsale', ([owner, bank, buyerA, buyerB, buyerUnknown]) => {

  const totalSupply = new BigNumber('1e22');
  const crowdsaleSupply = totalSupply.mul(0.4);
  const rate = new BigNumber(10000);
  const minimalContribution = ether(0.2);
  const maximalIndividualContribution = ether(0.5);
  const value = ether(0.2);
  const expectedTokenAmount = rate.mul(value);

  let token;
  let crowdsale;
  let openingTime;
  let openingTimeB;
  let closingTime;
  let afterClosingTime;

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function
    await advanceBlock();
  });

  beforeEach(async () => {
    openingTime = latestTime() + duration.weeks(1);
    openingTimeB = openingTime + duration.hours(5);
    closingTime = openingTime + duration.weeks(1);
    afterClosingTime = closingTime + duration.seconds(1);
    token = await DAVToken.new(totalSupply);
    crowdsale = await DAVCrowdsale.new(rate, bank, token.address, minimalContribution, maximalIndividualContribution, openingTime, openingTimeB, closingTime, {from: owner});
    await token.transfer(crowdsale.address, crowdsaleSupply);
    crowdsale.whitelistUsersA([buyerA]);
    crowdsale.whitelistUsersB([buyerB]);
  });

  describe('between the Crowdsale start time and Whitelist B start time', () => {

    beforeEach(async () => {
      await increaseTimeTo(openingTime);
      await advanceBlock();
    });

    describe('high-level purchase using fallback function', () => {
      it('should accept payments', async () => {
        await crowdsale.sendTransaction({ from: buyerA, value }).should.be.fulfilled;
      });

      it('should assign tokens to sender', async () => {
        await crowdsale.sendTransaction({ from: buyerA, value });
        const balance = await token.balanceOf(buyerA);
        balance.should.be.bignumber.equal(expectedTokenAmount);
      });

      it('should forward funds to wallet', async () => {
        const pre = web3.eth.getBalance(bank);
        await crowdsale.sendTransaction({ from: buyerA, value });
        const post = web3.eth.getBalance(bank);
        post.minus(pre).should.be.bignumber.equal(value);
      });

      it('should log purchase', async () => {
        const { logs } = await crowdsale.sendTransaction({ from: buyerA, value });
        const event = logs.find(e => e.event === 'TokenPurchase');
        should.exist(event);
        event.args.purchaser.should.equal(buyerA);
        event.args.beneficiary.should.equal(buyerA);
        event.args.value.should.be.bignumber.equal(value);
        event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
      });

      it('should accept payments from users in whitelist A', async () => {
        await crowdsale.sendTransaction({ from: buyerA, value }).should.be.fulfilled;
      });

      it('should revert if user is in whitelist b', async () => {
        await assertRevert(crowdsale.sendTransaction({ from: buyerB, value }));
      });

      it('should revert if user is not whitelisted', async () => {
        await assertRevert(crowdsale.sendTransaction({ from: buyerUnknown, value }));
      });

      it('should revert if amount is less than minimal contribution', async () => {
        await assertRevert(crowdsale.sendTransaction({ from: buyerA, value: ether(0.19) }));
      });

      it('should revert if total amount contributed is greater than maximal contribution cap', async () => {
        await crowdsale.sendTransaction({ from: buyerA, value: ether(0.2) }).should.be.fulfilled;
        await crowdsale.sendTransaction({ from: buyerA, value: ether(0.2) }).should.be.fulfilled;
        await assertRevert(crowdsale.sendTransaction({ from: buyerA, value: ether(0.2) }));
        const balance = await token.balanceOf(buyerA);
        balance.should.be.bignumber.equal(rate.mul(ether(0.4)));
      });

      it('should revert if gas price is over 50 gwei', async () => {
        await assertRevert(crowdsale.sendTransaction({ from: buyerA, value, gasPrice: web3.toWei(50.1, 'gwei') }));
      });

      it('should be able to complete with the max gas and max gas price', async () => {
        await crowdsale.sendTransaction({ from: buyerA, value, gasPrice: web3.toWei(50, 'gwei'), gas: 300000 }).should.be.fulfilled;
      });

    });

    describe('buyTokens()', () => {
      it('should accept payments', async () => {
        await crowdsale.buyTokens(buyerA, { from: buyerA, value }).should.be.fulfilled;
      });

      it('should assign tokens to beneficiary', async () => {
        await crowdsale.buyTokens(buyerA, { from: buyerB, value });
        const balance = await token.balanceOf(buyerA);
        balance.should.be.bignumber.equal(expectedTokenAmount);
      });

      it('should forward funds to wallet', async () => {
        const pre = web3.eth.getBalance(bank);
        await crowdsale.buyTokens(buyerA, { from: buyerA, value });
        const post = web3.eth.getBalance(bank);
        post.minus(pre).should.be.bignumber.equal(value);
      });

      it('should log purchase', async () => {
        const { logs } = await crowdsale.buyTokens(buyerA, { from: buyerA, value });
        const event = logs.find(e => e.event === 'TokenPurchase');
        should.exist(event);
        event.args.purchaser.should.equal(buyerA);
        event.args.beneficiary.should.equal(buyerA);
        event.args.value.should.be.bignumber.equal(value);
        event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
      });

      it('should accept payments from users in whitelist A', async () => {
        await crowdsale.buyTokens(buyerA, { from: buyerB, value }).should.be.fulfilled;
      });

      it('should revert if user is in whitelist b', async () => {
        await assertRevert(crowdsale.buyTokens(buyerB, { from: buyerB, value }));
      });

      it('should revert if user is not whitelisted', async () => {
        await assertRevert(crowdsale.buyTokens(buyerUnknown, { from: buyerB, value }));
      });

      it('should revert if amount is less than minimal contribution', async () => {
        await assertRevert(crowdsale.buyTokens(buyerA, { from: buyerA, value: ether(0.19) }));
      });

      it('should revert if total amount contributed is greater than maximal contribution cap', async () => {
        await crowdsale.buyTokens(buyerA, { from: buyerA, value: ether(0.2) }).should.be.fulfilled;
        await crowdsale.buyTokens(buyerA, { from: buyerA, value: ether(0.2) }).should.be.fulfilled;
        await assertRevert(crowdsale.buyTokens(buyerA, { from: buyerA, value: ether(0.2) }));
        const balance = await token.balanceOf(buyerA);
        balance.should.be.bignumber.equal(rate.mul(ether(0.4)));
      });

      it('should revert if gas price is over 50 gwei', async () => {
        await assertRevert(crowdsale.buyTokens(buyerA, { from: buyerA, value, gasPrice: web3.toWei(50.1, 'gwei') }));
      });

      it('should be able to complete with the max gas and max gas price', async () => {
        await crowdsale.buyTokens(buyerA, { from: buyerA, value, gasPrice: web3.toWei(50, 'gwei'), gas: 300000 }).should.be.fulfilled;
      });

    });
  });

  describe('between Whitelist B start and crowdsale end time', () => {

    beforeEach(async () => {
      await increaseTimeTo(openingTimeB);
      await advanceBlock();
    });

    describe('high-level purchase using fallback function', () => {
      it('should accept payments from users in whitelist A', async () => {
        await crowdsale.sendTransaction({ from: buyerA, value }).should.be.fulfilled;
      });

      it('should accept payments from users in whitelist B', async () => {
        await crowdsale.sendTransaction({ from: buyerB, value }).should.be.fulfilled;
      });

      it('should revert if user is not whitelisted', async () => {
        await assertRevert(crowdsale.sendTransaction({ from: buyerUnknown, value }));
      });
    });

    describe('buyTokens()', () => {
      it('should accept payments from users in whitelist A', async () => {
        await crowdsale.buyTokens(buyerA, { from: buyerA, value }).should.be.fulfilled;
      });

      it('should accept payments from users in whitelist B', async () => {
        await crowdsale.buyTokens(buyerB, { from: buyerB, value }).should.be.fulfilled;
      });

      it('should revert if user is not whitelisted', async () => {
        await assertRevert(crowdsale.buyTokens(buyerUnknown, { from: buyerA, value }));
      });
    });

  });

  describe('before the Crowdsale start time', () => {
    const from = buyerA;

    describe('hasClosed()', () => {
      it('returns false', async () => {
        const closed = await crowdsale.hasClosed({ from });
        assert.equal(closed, false);
      });
    });

    describe('high-level purchase using fallback function', () => {
      it('reverts', async () => {
        await assertRevert(crowdsale.sendTransaction({ from, value }));
      });
    });

    describe('buyTokens()', () => {
      it('reverts', async () => {
        await assertRevert(crowdsale.buyTokens(buyerA, { from, value }));
      });
    });
  });

  describe('after the Crowdsale end time', () => {
    const from = buyerA;

    beforeEach(async () => {
      await increaseTimeTo(afterClosingTime);
    });

    describe('hasClosed()', () => {
      it('returns true', async () => {
        const closed = await crowdsale.hasClosed({ from });
        assert.equal(closed, true);
      });
    });

    describe('high-level purchase using fallback function', () => {
      it('reverts', async () => {
        await assertRevert(crowdsale.sendTransaction({ from, value }));
      });
    });

    describe('buyTokens()', () => {
      it('reverts', async () => {
        await assertRevert(crowdsale.buyTokens(buyerA, { from, value }));
      });
    });
  });

});
