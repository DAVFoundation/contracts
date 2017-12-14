const DAVToken = artifacts.require('./mocks/DAVTokenMock.sol');
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


});
