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

const DAVToken = artifacts.require('./mocks/DAVToken.sol');

contract('DAVToken', function([owner, user]) {
  const totalSupply = dav(10000);

  let token;
  let pauseCutoffTime;
  let afterPauseCutoffTime;

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function
    await advanceBlock();
  });

  beforeEach(async () => {
    pauseCutoffTime = latestTime() + duration.weeks(2);
    afterPauseCutoffTime = pauseCutoffTime  + duration.days(1);
    token = await DAVToken.new(totalSupply);
  });

  describe('pauseCutoffTime()', () => {
    it('should return the time after which pause can no longer be called', async function() {
      await token.setPauseCutoffTime(pauseCutoffTime);
      (await token.pauseCutoffTime()).should.be.bignumber.equal(pauseCutoffTime);
    });

    it('should return 0 if not set', async function() {
      (await token.pauseCutoffTime()).should.be.bignumber.equal(0);
    });
  });

  describe('setPauseCutoffTime()', () => {
    it('should set the time after which pause can no longer be called (pauseCutoffTime)', async function() {
      await token.setPauseCutoffTime(pauseCutoffTime);
      (await token.pauseCutoffTime()).should.be.bignumber.equal(pauseCutoffTime);
    });

    it('should revert if a pause cutoff time has already been set', async function() {
      await token.setPauseCutoffTime(pauseCutoffTime);
      await assertRevert(token.setPauseCutoffTime(0));
      await assertRevert(token.setPauseCutoffTime(pauseCutoffTime));
      await assertRevert(token.setPauseCutoffTime(pauseCutoffTime + duration.weeks(1)));
      (await token.pauseCutoffTime()).should.be.bignumber.equal(pauseCutoffTime);

    });

    it('should revert if time given is in the past', async function() {
      await assertRevert(token.setPauseCutoffTime(42));
    });

    it('should revert if called by non-owner', async function() {
      await assertRevert(token.setPauseCutoffTime(pauseCutoffTime, { from: user }));
      await token.setPauseCutoffTime(pauseCutoffTime, { from: owner });
    });
  });

  describe('totalSupply()', () => {
    it('should return the correct total supply after construction', async function() {
      const totalSupplyReturned = await token.totalSupply();
      totalSupply.should.be.bignumber.equal(10000*1e18);
      totalSupplyReturned.should.be.bignumber.equal(totalSupply);
    });
  });

  describe('balanceOf()', () => {
    it('should return the correct balance of an account', async function() {
      let firstAccountBalance = await token.balanceOf(owner);
      firstAccountBalance.should.be.bignumber.equal(totalSupply);
    });
  });

  describe('transfer()', () => {
    it('should transfer from sender when calling transfer()', async function() {
      await token.transfer(user, totalSupply);
      let firstAccountBalance = await token.balanceOf(owner);
      let secondAccountBalance = await token.balanceOf(user);
      firstAccountBalance.should.be.bignumber.equal(0);
      secondAccountBalance.should.be.bignumber.equal(totalSupply);
    });

    it('should revert when trying to transfer more than balance', async function() {
      await assertRevert(token.transfer(user, totalSupply.add(1)));
    });

    it('should revert when trying to transfer without approval', async function() {
      await assertRevert(token.transferFrom(user, owner, 1));
    });
  });

  describe('approve()', () => {
    it('should allow to transfer with transferFrom after approval but no more than approved amount', async function() {
      await token.approve(owner, 2);
      await token.transferFrom(owner, user, 1);
      await token.transferFrom(owner, user, 1);
      await assertRevert(token.transferFrom(owner, user, 1));
    });
  });

  describe('allowance()', () => {
    it('should return the correct allowance of an account to another', async function() {
      (await token.allowance(owner, owner)).should.be.bignumber.equal(0);
      await token.approve(owner, 1);
      (await token.allowance(owner, owner)).should.be.bignumber.equal(1);
      await token.transferFrom(owner, user, 1);
      (await token.allowance(owner, owner)).should.be.bignumber.equal(0);
    });
  });

  describe('pause()', () => {
    it('should be callable by owner and modify pause state', async function() {
      (await token.paused()).should.be.false;
      await token.pause();
      (await token.paused()).should.be.true;
    });

    it('should revert when trying to pause while paused', async function() {
      await token.pause();
      await assertRevert(token.pause());
      (await token.paused()).should.be.true;
    });

    it('should revert when calling transfer, transferFrom, approve, increaseApproval, or decreaseApproval while paused', async function() {
      const from = user;
      await token.approve(owner, 2, { from });
      await token.pause();
      await assertRevert(token.transferFrom(owner, user, 1, { from }));
      await assertRevert(token.transfer(user, 1, { from }));
      await assertRevert(token.approve(owner, 2, { from }));
      await assertRevert(token.increaseApproval(owner, 1, { from }));
      await assertRevert(token.decreaseApproval(owner, 1, { from }));
    });

    it('should not revert when owner calls transfer while paused', async function() {
      const from = owner;
      await token.pause();
      await token.transfer(user, totalSupply, { from });
      let firstAccountBalance = await token.balanceOf(owner);
      let secondAccountBalance = await token.balanceOf(user);
      firstAccountBalance.should.be.bignumber.equal(0);
      secondAccountBalance.should.be.bignumber.equal(totalSupply);
    });

    it('should revert when owner calls transferFrom, approve, increaseApproval, or decreaseApproval while paused', async function() {
      const from = owner;
      await token.pause();
      await assertRevert(token.transferFrom(owner, user, 1, { from }));
      await assertRevert(token.approve(owner, 2, { from }));
      await assertRevert(token.increaseApproval(owner, 1, { from }));
      await assertRevert(token.decreaseApproval(owner, 1, { from }));
    });

    it('should revert if a non-owner tries to pause', async () => {
      await assertRevert(token.pause({ from: user }));
      (await token.paused()).should.be.false;
    });

    it('should not be limited if pause cutoff time not set', async function() {
      await increaseTimeTo(afterPauseCutoffTime);
      await advanceBlock();
      await token.pause().should.be.fulfilled;
    });

    it('should revert if called past the pause cutoff time', async function() {
      await token.setPauseCutoffTime(pauseCutoffTime);
      await increaseTimeTo(afterPauseCutoffTime);
      await advanceBlock();
      await assertRevert(token.pause());
    });
  });

  describe('unpause()', () => {
    it('should be callable by owner and modify state', async function() {
      (await token.paused()).should.be.false;
      await token.pause();
      (await token.paused()).should.be.true;
      await token.unpause();
      (await token.paused()).should.be.false;
    });

    it('should revert when trying to unpause while not paused', async function() {
      await assertRevert(token.unpause());
      (await token.paused()).should.be.false;
    });

    it('should revert if a non-owner tries to unpause', async () => {
      await token.pause();
      await assertRevert(token.unpause({ from: user }));
      (await token.paused()).should.be.true;
    });

    it('should be callable and functional even past the pause cutoff time', async function() {
      await token.setPauseCutoffTime(pauseCutoffTime);
      await token.pause().should.be.fulfilled;
      await increaseTimeTo(afterPauseCutoffTime);
      await advanceBlock();
      await token.unpause().should.be.fulfilled;
      await assertRevert(token.pause());
    });

  });

  describe('increaseApproval()', () => {
    it('should allow increasing the allowance with increaseApproval', async function() {
      await token.increaseApproval(owner, 1);
      (await token.allowance(owner, owner)).should.be.bignumber.equal(1);
    });
  });

  describe('decreaseApproval()', () => {
    it('should allow decreasing the allowance with decreaseApproval', async function() {
      await token.approve(owner, 5);
      await token.decreaseApproval(owner, 1);
      (await token.allowance(owner, owner)).should.be.bignumber.equal(4);
    });

    it('should set approved amount to 0 if trying to decreaseApproval to below 0', async function() {
      await token.approve(owner, 1);
      await token.decreaseApproval(owner, 2);
      (await token.allowance(owner, owner)).should.be.bignumber.equal(0);
    });
  });

  describe('transferOwnership()', () => {
    xit('should allow transfer of ownership by the owner');
    xit('should not allow transfer of ownership by a non-owner');
  });

  describe('burn()', () => {
    xit('should allow a token holder to burn their own tokens');
    xit(
      'should revert when a token holder tries to burn more tokens than they own',
    );
  });

});
