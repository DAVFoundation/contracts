// Thise code is based on https://github.com/OpenZeppelin/zeppelin-solidity/blob/323d1fa9415695f9132af17a9ebd57642afb7f29/test/helpers/assertRevert.js

module.exports = async promise => {
  try {
    await promise;
    assert.fail('Expected revert not received');
  } catch (error) {
    const revertFound = error.message.search('revert') >= 0;
    assert(revertFound, `Expected "revert", got ${error} instead`);
  }
};
