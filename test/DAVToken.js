const DAVToken = artifacts.require('./mocks/DAVTokenMock.sol');
const expectThrow = require('./helpers/expectThrow');
const totalSupplySetting = 100;

contract('DAVToken', function(accounts) {

  it('should return the correct totalSupply after construction', async function() {
    let token = await DAVToken.new();
    let totalSupply = await token.totalSupply();
    assert.equal(totalSupply, totalSupplySetting);
  });

  it('should return the correct balanceOf after construction', async function() {
    let token = await DAVToken.new();
    let firstAccountBalance = await token.balanceOf(accounts[0]);
    assert.equal(firstAccountBalance, totalSupplySetting);
  });

  it('should transfer from sender when calling transfer()', async function() {
    let token = await DAVToken.new();
    await token.transfer(accounts[1], totalSupplySetting);
    let firstAccountBalance = (await token.balanceOf(accounts[0])).toNumber();
    let secondAccountBalance = (await token.balanceOf(accounts[1])).toNumber();
    assert.equal(firstAccountBalance, 0);
    assert.equal(secondAccountBalance, totalSupplySetting);
  });

  it('should throw an error when trying to transfer more than balance', async function() {
    let token = await DAVToken.new();
    await expectThrow(token.transfer(accounts[1], totalSupplySetting+1));
  });

  it('should throw an error when trying to transfer without approval', async function() {
    let token = await DAVToken.new();
    await expectThrow(token.transferFrom(accounts[1], accounts[0], 1));
  });

  it('should allow to transfer with transferFrom after approval but no more than approved amount', async function() {
    let token = await DAVToken.new();
    await token.approve(accounts[0], 2);
    await token.transferFrom(accounts[0], accounts[1], 1);
    await token.transferFrom(accounts[0], accounts[1], 1);
    await expectThrow(token.transferFrom(accounts[0], accounts[1], 1));
  });

});
