const DAVToken = artifacts.require('./mocks/DAVToken.sol');
const assertRevert = require('../helpers/assertRevert');
const totalSupply = 100000;

contract('DAVToken', function([owner, user]) {
  let token;

  beforeEach(async () => {
    token = await DAVToken.new(totalSupply);
  });

  describe('totalSupply()', () => {
    it('should return the correct total supply after construction', async function() {
      const totalSupplyReturned = await token.totalSupply();
      assert.equal(totalSupplyReturned, totalSupply);
    });
  });

  describe('balanceOf()', () => {
    it('should return the correct balance of an account', async function() {
      let firstAccountBalance = await token.balanceOf(owner);
      assert.equal(firstAccountBalance, totalSupply);
    });
  });

  describe('transfer()', () => {
    it('should transfer from sender when calling transfer()', async function() {
      await token.transfer(user, totalSupply);
      let firstAccountBalance = await token.balanceOf(owner);
      let secondAccountBalance = await token.balanceOf(user);
      assert.equal(firstAccountBalance, 0);
      assert.equal(secondAccountBalance, totalSupply);
    });

    it('should revert when trying to transfer more than balance', async function() {
      await assertRevert(token.transfer(user, totalSupply + 1));
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
      assert.equal(await token.allowance(owner, owner), 0);
      await token.approve(owner, 1);
      assert.equal(await token.allowance(owner, owner), 1);
      await token.transferFrom(owner, user, 1);
      assert.equal(await token.allowance(owner, owner), 0);
    });
  });

  describe('pause()', () => {
    it('should be callable by owner and modify pause state', async function() {
      assert.equal(await token.paused(), false);
      await token.pause();
      assert.equal(await token.paused(), true);
    });

    it('should revert when trying to pause while paused', async function() {
      await token.pause();
      await assertRevert(token.pause());
      assert.equal(await token.paused(), true);
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

    it('should revert if a non-owner tries to pause', async () => {
      await assertRevert(token.pause({ from: user }));
      assert.equal(await token.paused(), false);
    });
  });

  describe('unpause()', () => {
    it('should be callable by owner and modify state', async function() {
      assert.equal(await token.paused(), false);
      await token.pause();
      assert.equal(await token.paused(), true);
      await token.unpause();
      assert.equal(await token.paused(), false);
    });

    it('should revert when trying to unpause while not paused', async function() {
      await assertRevert(token.unpause());
      assert.equal(await token.paused(), false);
    });

    it('should revert if a non-owner tries to unpause', async () => {
      await token.pause();
      await assertRevert(token.unpause({ from: user }));
      assert.equal(await token.paused(), true);
    });
  });

  describe('increaseApproval()', () => {
    it('should allow increasing the allowance with increaseApproval', async function() {
      await token.increaseApproval(owner, 1);
      assert.equal(await token.allowance(owner, owner), 1);
    });
  });

  describe('decreaseApproval()', () => {
    it('should allow decreasing the allowance with decreaseApproval', async function() {
      await token.approve(owner, 5);
      await token.decreaseApproval(owner, 1);
      assert.equal(await token.allowance(owner, owner), 4);
    });

    it('should set approved amount to 0 if trying to decreaseApproval to below 0', async function() {
      await token.approve(owner, 1);
      await token.decreaseApproval(owner, 2);
      assert.equal(await token.allowance(owner, owner), 0);
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
