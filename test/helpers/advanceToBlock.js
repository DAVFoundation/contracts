// This code is based on https://github.com/OpenZeppelin/zeppelin-solidity/blob/86628468386b2ed19b74101fa65529b45bdb8b8c/test/helpers/advanceToBlock.js

const advanceBlock = () => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'evm_mine',
      id: Date.now(),
    }, (err, res) => {
      return err ? reject(err) : resolve(res);
    });
  });
};
const advanceToBlock = async (number) => {
  if (web3.eth.blockNumber > number) {
    throw Error(`block number ${number} is in the past (current is ${web3.eth.blockNumber})`);
  }

  while (web3.eth.blockNumber < number) {
    await advanceBlock();
  }
};



module.exports = {
  advanceBlock,
  advanceToBlock,
};
