const DAVToken = artifacts.require('./mocks/DAVTokenMock.sol');
const expectThrow = require('../helpers/expectThrow');
const totalSupplySetting = 100;

contract('DAVToken', function(accounts) {

  describe('totalSupply()', () => {
    it('should return the correct total supply after construction', async function() {
      let token = await DAVToken.new();
      let totalSupply = await token.totalSupply();
      assert.equal(totalSupply, totalSupplySetting);
    });
  });

  describe('balanceOf()', () => {
    it('should return the correct balance of an account', async function() {
      let token = await DAVToken.new();
      let firstAccountBalance = await token.balanceOf(accounts[0]);
      assert.equal(firstAccountBalance, totalSupplySetting);
    });
  });

  describe('transfer()', () => {
    it('should transfer from sender when calling transfer()', async function() {
      let token = await DAVToken.new();
      await token.transfer(accounts[1], totalSupplySetting);
      let firstAccountBalance = await token.balanceOf(accounts[0]);
      let secondAccountBalance = await token.balanceOf(accounts[1]);
      assert.equal(firstAccountBalance, 0);
      assert.equal(secondAccountBalance, totalSupplySetting);
    });

    it('should throw an error when trying to transfer more than balance', async function() {
      let token = await DAVToken.new();
      await expectThrow(token.transfer(accounts[1], totalSupplySetting + 1));
    });

    it('should throw an error when trying to transfer without approval', async function() {
      let token = await DAVToken.new();
      await expectThrow(token.transferFrom(accounts[1], accounts[0], 1));
    });
  });

  describe('approve()', () => {
    it('should allow to transfer with transferFrom after approval but no more than approved amount', async function() {
      let token = await DAVToken.new();
      await token.approve(accounts[0], 2);
      await token.transferFrom(accounts[0], accounts[1], 1);
      await token.transferFrom(accounts[0], accounts[1], 1);
      await expectThrow(token.transferFrom(accounts[0], accounts[1], 1));
    });
  });

  describe('allowance()', () => {
    it('should return the correct allowance of an account to another', async function() {
      let token = await DAVToken.new();
      assert.equal(await token.allowance(accounts[0], accounts[0]), 0);
      await token.approve(accounts[0], 1);
      assert.equal(await token.allowance(accounts[0], accounts[0]), 1);
      await token.transferFrom(accounts[0], accounts[1], 1);
      assert.equal(await token.allowance(accounts[0], accounts[0]), 0);
    });

  });

  describe('pause()', () => {
    it('should be callable by owner and modify pause state', async function() {
      let token = await DAVToken.new();
      assert.equal(await token.paused(), false);
      await token.pause();
      assert.equal(await token.paused(), true);
    });

    it('should throw an error when trying to pause while paused', async function() {
      let token = await DAVToken.new();
      await token.pause();
      await expectThrow(token.pause());
      assert.equal(await token.paused(), true);
    });

    it('should throw errors when calling transfer, transferFrom, approve, increaseApproval, or decreaseApproval while paused', async function() {
      let token = await DAVToken.new();
      await token.approve(accounts[0], 2);
      await token.pause();
      await expectThrow(token.transferFrom(accounts[0], accounts[1], 1));
      await expectThrow(token.transfer(accounts[1], 1));
      await expectThrow(token.approve(accounts[0], 2));
      await expectThrow(token.increaseApproval(accounts[0], 1));
      await expectThrow(token.decreaseApproval(accounts[0], 1));
    });

    it('should throw an error if a non-owner tries to pause', async () => {
      let token = await DAVToken.new();
      await expectThrow(token.pause({from: accounts[1]}));
      assert.equal(await token.paused(), false);
    });
  });

  describe('unpause()', () => {
    it('should be callable by owner and modify state', async function() {
      let token = await DAVToken.new();
      assert.equal(await token.paused(), false);
      await token.pause();
      assert.equal(await token.paused(), true);
      await token.unpause();
      assert.equal(await token.paused(), false);
    });

    it('should throw an error when trying to unpause while not paused', async function() {
      let token = await DAVToken.new();
      await expectThrow(token.unpause());
      assert.equal(await token.paused(), false);
    });

    it('should throw an error if a non-owner tries to unpause', async () => {
      let token = await DAVToken.new();
      await token.pause();
      await expectThrow(token.unpause({from: accounts[1]}));
      assert.equal(await token.paused(), true);
    });
  });

  describe('increaseApproval()', () => {
    it('should allow increasing the allowance with increaseApproval', async function() {
      let token = await DAVToken.new();
      await token.increaseApproval(accounts[0], 1);
      assert.equal(await token.allowance(accounts[0], accounts[0]), 1);
    });
  });

  describe('decreaseApproval()', () => {
    it('should allow decreasing the allowance with decreaseApproval', async function() {
      let token = await DAVToken.new();
      await token.approve(accounts[0], 5);
      await token.decreaseApproval(accounts[0], 1);
      assert.equal(await token.allowance(accounts[0], accounts[0]), 4);
    });

    it('should set approved amount to 0 if trying to decreaseApproval to below 0', async function() {
      let token = await DAVToken.new();
      await token.approve(accounts[0], 1);
      await token.decreaseApproval(accounts[0], 2);
      assert.equal(await token.allowance(accounts[0], accounts[0]), 0);
    });
  });

  describe('transferOwnership()', () => {
    xit('should allow transfer of ownership by the owner');
    xit('should not allow transfer of ownership by a non-owner');
  });

  describe('burn()', () => {
    xit('should allow a token holder to burn their own tokens');
    xit('should throw an error when a token holder tries to burn more tokens than they own');
  });

  describe('mint()', () => {
    xit('should allow owner to mint tokens');
    xit('should throw an error if non-owner tries to mint tokens');
    xit('should throw an error trying to mint tokens after mintingFinished');
  });

});
