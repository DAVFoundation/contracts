// This code is based on https://github.com/OpenZeppelin/zeppelin-solidity/blob/86628468386b2ed19b74101fa65529b45bdb8b8c/test/helpers/latestTime.js

// Returns the time of the last mined block in seconds
module.exports = () => {
  return web3.eth.getBlock('latest').timestamp;
};
