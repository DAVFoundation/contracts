const ether = require('../helpers/ether');
const dav = require('../helpers/dav');
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

contract('DAVCrowdsale', ([owner, bank, foundation, lockedTokens, buyerA, buyerB, buyerUnknown]) => {

  const totalSupply = dav(20000);
  const rate = new BigNumber(10000);
  const weiCap = ether(0.8);
  const vinciCap = ether(0.9) * rate;
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
  let earlyClosingTime;
  let afterEarlyClosingTime;

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function
    await advanceBlock();
  });

  beforeEach(async () => {
    openingTime = latestTime() + duration.weeks(1);
    openingTimeB = openingTime + duration.hours(5);
    closingTime = openingTime + duration.weeks(1);
    afterClosingTime = closingTime + duration.seconds(1);
    earlyClosingTime = openingTime + duration.hours(1); // used for testing closeEarly() only
    afterEarlyClosingTime = earlyClosingTime  + duration.seconds(1); // used for testing closeEarly() only

    token = await DAVToken.new(totalSupply);
    crowdsale = await DAVCrowdsale.new(rate, bank, foundation, lockedTokens, token.address, weiCap, vinciCap, minimalContribution, maximalIndividualContribution, openingTime, openingTimeB, closingTime, {from: owner});
    await token.transfer(crowdsale.address, totalSupply);
    await token.pause();
    await token.transferOwnership(crowdsale.address);
    crowdsale.whitelistUsersA([buyerA]);
    crowdsale.whitelistUsersB([buyerB]);
  });

  describe('tokenWallet()', () => {
    it('should return the foundation address', async () => {
      const tokenWallet = await crowdsale.tokenWallet();
      tokenWallet.should.equal(foundation);
    });
  });

  describe('lockedTokensWallet()', () => {
    it('should return the locked tokens wallet address', async () => {
      const lockedTokensWallet = await crowdsale.lockedTokensWallet();
      lockedTokensWallet.should.equal(lockedTokens);
    });
  });

  describe('weiRaised()', () => {

    beforeEach(async () => {
      await increaseTimeTo(openingTime);
      await advanceBlock();
    });

    it('should return 0 wei raised before first purchase', async () => {
      const weiRaised = await crowdsale.weiRaised();
      weiRaised.should.be.bignumber.equal(0);
    });

    it('should return the correct amount of wei raised', async () => {
      let weiRaised;
      weiRaised = await crowdsale.weiRaised();
      weiRaised.should.be.bignumber.equal(0);
      await crowdsale.sendTransaction({ from: buyerA, value }).should.be.fulfilled;
      weiRaised = await crowdsale.weiRaised();
      weiRaised.should.be.bignumber.equal(value);
      await crowdsale.sendTransaction({ from: buyerA, value }).should.be.fulfilled;
      weiRaised = await crowdsale.weiRaised();
      weiRaised.should.be.bignumber.equal(value * 2);
    });
  });

  describe('weiCap()', () => {
    it('should return the maximum number of wei that can be raised', async () => {
      const weiCap = await crowdsale.weiCap();
      weiCap.should.be.bignumber.equal(weiCap);
    });
  });

  describe('vinciSold()', () => {

    beforeEach(async () => {
      await increaseTimeTo(openingTime);
      await advanceBlock();
    });

    it('should return 0 vinci sold before first purchase', async () => {
      const vinciSold = await crowdsale.vinciSold();
      vinciSold.should.be.bignumber.equal(0);
    });

    it('should return the correct number of vinci sold', async () => {
      let vinciSold;
      vinciSold = await crowdsale.vinciSold();
      vinciSold.should.be.bignumber.equal(0);
      await crowdsale.sendTransaction({ from: buyerA, value }).should.be.fulfilled;
      vinciSold = await crowdsale.vinciSold();
      vinciSold.should.be.bignumber.equal(value * rate);
      await crowdsale.sendTransaction({ from: buyerA, value }).should.be.fulfilled;
      vinciSold = await crowdsale.vinciSold();
      vinciSold.should.be.bignumber.equal(value * 2 * rate);
    });
  });

  describe('vinciCap()', () => {
    it('should return the maximum number of DAV that can be sold', async () => {
      const vinciCap = await crowdsale.vinciCap();
      vinciCap.should.be.bignumber.equal(vinciCap);
    });
  });

  describe('recordSale()', () => {
    it('should assign tokens to locked tokens wallet', async () => {
      const tokens = dav(1);
      await crowdsale.recordSale(0, tokens);
      const balance = await token.balanceOf(lockedTokens);
      balance.should.be.bignumber.equal(tokens);
    });

    it('should only be callable by owner', async () => {
      await crowdsale.recordSale(1, 1, { from: owner }).should.be.fulfilled;
      await assertRevert(crowdsale.recordSale(1, 1, { from: buyerA }));
    });

    it('should affect the amount of wei raised', async () => {
      await crowdsale.recordSale(1, 0);
      (await crowdsale.weiRaised()).should.be.bignumber.equal(1);
      (await crowdsale.vinciSold()).should.be.bignumber.equal(0);
    });

    it('should affect the amount of vinci sold', async () => {
      await crowdsale.recordSale(0, 1);
      (await crowdsale.weiRaised()).should.be.bignumber.equal(0);
      (await crowdsale.vinciSold()).should.be.bignumber.equal(1);
    });

    it('should revert if will cause wei cap to pass', async () => {
      await crowdsale.recordSale(ether(0.7), 1).should.be.fulfilled;
      await assertRevert(crowdsale.recordSale(ether(0.2), 1));
      (await crowdsale.weiRaised()).should.be.bignumber.equal(ether(0.7));
      (await crowdsale.vinciSold()).should.be.bignumber.equal(1);
    });

    it('should revert if will cause vinci cap to pass', async () => {
      await crowdsale.recordSale(1, vinciCap/2).should.be.fulfilled;
      await assertRevert(crowdsale.recordSale(1, vinciCap));
      (await crowdsale.weiRaised()).should.be.bignumber.equal(1);
      (await crowdsale.vinciSold()).should.be.bignumber.equal(vinciCap/2);
    });

    it('should be callable before and during crowdsale', async () => {
      await crowdsale.recordSale(1, 2).should.be.fulfilled;
      await increaseTimeTo(openingTime);
      await advanceBlock();
      await crowdsale.recordSale(1, 2).should.be.fulfilled;
      await increaseTimeTo(openingTimeB);
      await advanceBlock();
      await crowdsale.recordSale(1, 2).should.be.fulfilled;
      (await crowdsale.weiRaised()).should.be.bignumber.equal(3);
      (await crowdsale.vinciSold()).should.be.bignumber.equal(6);
    });

    it('should revert if called after sale is closed and finalized', async () => {
      await crowdsale.recordSale(1, 2).should.be.fulfilled;
      await increaseTimeTo(afterClosingTime);
      await advanceBlock();
      await crowdsale.finalize({from: owner}).should.be.fulfilled;
      await assertRevert(crowdsale.recordSale(1, 2));
      (await crowdsale.weiRaised()).should.be.bignumber.equal(1);
      (await crowdsale.vinciSold()).should.be.bignumber.equal(2);
    });

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

    describe('isFinalized()', () => {
      it('should be false', async () => {
        const finalized = await crowdsale.isFinalized();
        finalized.should.be.false;
      });
    });

    describe('finalize()', () => {
      it('should revert', async () => {
        await assertRevert(crowdsale.finalize({ from: owner }));
      });
    });

    describe('closeEarly()', () => {
      it('should close the sale at the given time', async () => {
        await crowdsale.closeEarly(earlyClosingTime);
        (await crowdsale.hasClosed()).should.be.false;
        await increaseTimeTo(afterEarlyClosingTime);
        await advanceBlock();
        (await crowdsale.hasClosed()).should.be.true;
      });

      it('should update closingTime', async () => {
        await crowdsale.closeEarly(earlyClosingTime);
        (await crowdsale.closingTime()).should.be.bignumber.equal(earlyClosingTime);
      });

      it('should close the sale right after this block if given time is in the past', async () => {
        await crowdsale.closeEarly(0);
        (await crowdsale.closingTime()).should.be.bignumber.equal(latestTime());
        await increaseTimeTo(afterEarlyClosingTime);
        await advanceBlock();
        (await crowdsale.hasClosed()).should.be.true;
      });

      it('should revert if called by non-owner', async () => {
        await assertRevert(crowdsale.closeEarly(earlyClosingTime, { from: buyerA }));
      });

      it('should revert if new time is later than current close time', async () => {
        await assertRevert(crowdsale.closeEarly(afterClosingTime));
      });

      it('should block additional token purchases', async () => {
        await crowdsale.sendTransaction({ from: buyerA, value }).should.be.fulfilled;
        await crowdsale.closeEarly(earlyClosingTime);
        await increaseTimeTo(afterEarlyClosingTime);
        await advanceBlock();
        await assertRevert(crowdsale.sendTransaction({ from: buyerA, value }));
      });

      it('should allow sale to be finalized early', async () => {
        await assertRevert(crowdsale.finalize());
        await crowdsale.closeEarly(earlyClosingTime);
        await increaseTimeTo(afterEarlyClosingTime);
        await advanceBlock();
        await crowdsale.finalize().should.be.fulfilled;
        (await crowdsale.isFinalized()).should.be.true;
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

      it('should succeed if amount of wei raised equals wei cap', async () => {
        await crowdsale.sendTransaction({ from: buyerA, value: ether(0.4) }).should.be.fulfilled;
        await crowdsale.sendTransaction({ from: buyerB, value: ether(0.4) }).should.be.fulfilled;
        const weiRaised = await crowdsale.weiRaised();
        weiRaised.should.be.bignumber.equal(weiCap);
      });

      it('should revert if amount of wei raised in total is greater than wei cap', async () => {
        await crowdsale.sendTransaction({ from: buyerA, value: ether(0.4) }).should.be.fulfilled;
        await crowdsale.sendTransaction({ from: buyerB, value: ether(0.3) }).should.be.fulfilled;
        await assertRevert(crowdsale.sendTransaction({ from: buyerB, value: ether(0.2) }));
        const weiRaised = await crowdsale.weiRaised();
        weiRaised.should.be.bignumber.equal(ether(0.7));
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

    describe('isFinalized()', () => {
      it('should be false', async () => {
        const finalized = await crowdsale.isFinalized();
        finalized.should.be.false;
      });
    });

    describe('finalize()', () => {
      it('should revert', async () => {
        await assertRevert(crowdsale.finalize({ from: owner }));
      });
    });

    describe('closeEarly()', () => {
      it('should revert', async () => {
        await assertRevert(crowdsale.closeEarly(earlyClosingTime));
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

    describe('isFinalized()', () => {
      it('should be false', async () => {
        const finalized = await crowdsale.isFinalized();
        finalized.should.be.false;
      });
    });

    describe('finalize()', () => {
      it('should not revert', async () => {
        await crowdsale.finalize({ from: owner }).should.be.fulfilled;
      });
    });

    it('should emit a Finalized event', async () => {
      const { logs } = await crowdsale.finalize({ from: owner });
      const event = logs.find(e => e.event === 'Finalized');
      should.exist(event);
    });

    describe('closeEarly()', () => {
      it('should revert', async () => {
        await assertRevert(crowdsale.closeEarly(earlyClosingTime));
      });
    });
  });

  describe('after the Crowdsale is finalized', () => {
    let finalizeLogs;
    const weiRaised = ether(0.4);
    const tokensSold = weiRaised.mul(rate);

    beforeEach(async () => {
      await increaseTimeTo(openingTimeB);
      await advanceBlock();
      await crowdsale.sendTransaction({ from: buyerA, value: weiRaised.div(2) });
      await crowdsale.sendTransaction({ from: buyerB, value: weiRaised.div(2) });

      await increaseTimeTo(afterClosingTime);
      finalizeLogs = (await crowdsale.finalize({ from: owner })).logs;
    });

    it('should transfer tokens to foundation wallet worth 50% more than number of tokens raised (%40 to %60)', async () => {
      const expectedFoundationTokens = tokensSold.mul(1.5);
      const balance = await token.balanceOf(foundation);
      balance.should.be.bignumber.equal(expectedFoundationTokens);
    });

    it('should burn off remaining tokens', async () => {
      const expectedTotalSupply = tokensSold.mul(2.5);
      const totalSupplyReturned = await token.totalSupply();
      totalSupplyReturned.should.be.bignumber.equal(expectedTotalSupply);
      const balance = await token.balanceOf(crowdsale.address);
      balance.should.be.bignumber.equal(0);
    });

    it('should transfer token ownership back to original owner', async () => {
      const event = finalizeLogs.find(e => e.event === 'OwnershipTransferred');
      should.exist(event);
      event.args.previousOwner.should.equal(crowdsale.address);
      event.args.newOwner.should.equal(owner);
    });

    it('token should be unpausable by original owner', async () => {
      const unpauseLogs = (await token.unpause({ from: owner })).logs;
      const event = unpauseLogs.find(e => e.event === 'Unpause');
      should.exist(event);
    });

    describe('closeEarly()', () => {
      it('should revert', async () => {
        await assertRevert(crowdsale.closeEarly(earlyClosingTime));
      });
    });
  });

});
