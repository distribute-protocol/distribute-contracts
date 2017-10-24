const HDWalletProvider = require('truffle-hdwallet-provider')
const fs = require('fs')

// first read in the secrets.json to get our mnemonic
let mnemonic;
if (fs.existsSync('secrets.json')) {
  mnemonic = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));
} else {
  mnemonic = '';
}

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: new HDWalletProvider(mnemonic, 'https://ropsten.infura.io'),
      network_id: "3",
      gas: 4700000,
      gasPrice: 20000000000,
    },
    rinkeby: {
      provider: new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io'),
      network_id: "*",
      gas: 4700000,
      gasPrice: 20000000000,
    }
  }
};
