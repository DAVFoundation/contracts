const HDWalletProvider = require('truffle-hdwallet-provider');
const mnemonic = require('./mnemonic');

module.exports = {
  networks: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/wUiZtmeZ1KwjFrcC8zRO');
      },
      network_id: 3,
      gas: 4600000
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/wUiZtmeZ1KwjFrcC8zRO');
      },
      network_id: 4,
      gas: 4600000
    },
    mainnet: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/wUiZtmeZ1KwjFrcC8zRO');
      },
      network_id: 1,
      gas: 6712388,
      gasPrice: 2000000000,
    },
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*' // Match any network id
    }
  }
};
