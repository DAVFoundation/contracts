const DAVToken = artifacts.require('./mocks/DAVToken.sol');
const expectThrow = require('../helpers/expectThrow');
const totalSupply = 100000;

contract('DAVToken', function([user1, user2]) {
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
      let firstAccountBalance = await token.balanceOf(user1);
      assert.equal(firstAccountBalance, totalSupply);
    });
  });

  describe('transfer()', () => {
    it('should transfer from sender when calling transfer()', async function() {
      await token.transfer(user2, totalSupply);
      let firstAccountBalance = await token.balanceOf(user1);
      let secondAccountBalance = await token.balanceOf(user2);
      assert.equal(firstAccountBalance, 0);
      assert.equal(secondAccountBalance, totalSupply);
    });

    it('should revert when trying to transfer more than balance', async function() {
      await expectThrow(token.transfer(user2, totalSupply + 1));
    });

    it('should revert when trying to transfer without approval', async function() {
      await expectThrow(token.transferFrom(user2, user1, 1));
    });
  });

  describe('approve()', () => {
    it('should allow to transfer with transferFrom after approval but no more than approved amount', async function() {
      await token.approve(user1, 2);
      await token.transferFrom(user1, user2, 1);
      await token.transferFrom(user1, user2, 1);
      await expectThrow(token.transferFrom(user1, user2, 1));
    });
  });

  describe('allowance()', () => {
    it('should return the correct allowance of an account to another', async function() {
      assert.equal(await token.allowance(user1, user1), 0);
      await token.approve(user1, 1);
      assert.equal(await token.allowance(user1, user1), 1);
      await token.transferFrom(user1, user2, 1);
      assert.equal(await token.allowance(user1, user1), 0);
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
      await expectThrow(token.pause());
      assert.equal(await token.paused(), true);
    });

    it('should revert when calling transfer, transferFrom, approve, increaseApproval, or decreaseApproval while paused', async function() {
      await token.approve(user1, 2);
      await token.pause();
      await expectThrow(token.transferFrom(user1, user2, 1));
      await expectThrow(token.transfer(user2, 1));
      await expectThrow(token.approve(user1, 2));
      await expectThrow(token.increaseApproval(user1, 1));
      await expectThrow(token.decreaseApproval(user1, 1));
    });

    it('should revert if a non-owner tries to pause', async () => {
      await expectThrow(token.pause({ from: user2 }));
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
      await expectThrow(token.unpause());
      assert.equal(await token.paused(), false);
    });

    it('should revert if a non-owner tries to unpause', async () => {
      await token.pause();
      await expectThrow(token.unpause({ from: user2 }));
      assert.equal(await token.paused(), true);
    });
  });

  describe('increaseApproval()', () => {
    it('should allow increasing the allowance with increaseApproval', async function() {
      await token.increaseApproval(user1, 1);
      assert.equal(await token.allowance(user1, user1), 1);
    });
  });

  describe('decreaseApproval()', () => {
    it('should allow decreasing the allowance with decreaseApproval', async function() {
      await token.approve(user1, 5);
      await token.decreaseApproval(user1, 1);
      assert.equal(await token.allowance(user1, user1), 4);
    });

    it('should set approved amount to 0 if trying to decreaseApproval to below 0', async function() {
      await token.approve(user1, 1);
      await token.decreaseApproval(user1, 2);
      assert.equal(await token.allowance(user1, user1), 0);
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
