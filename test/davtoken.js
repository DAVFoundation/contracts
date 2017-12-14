const DAVToken = artifacts.require('./DAVToken.sol');

contract('DAVToken', function(/*accounts*/) {

  it('should return the correct totalSupply after construction', async function() {
    let token = await DAVToken.new();
    let totalSupply = await token.totalSupply();
    assert.equal(totalSupply, (1000000 * 10**18));
  });

});
