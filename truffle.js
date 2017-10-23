const HDWalletProvider = require('truffle-hdwallet-provider')
const fs = require('fs')

// first read in the secrets.json to get our mnemonic
let mnemonic;
let infura_apikey;
if (fs.existsSync('secrets.json')) {
  mnemonic = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));
} else {
  mnemonic = '';
}

if (fs.existsSync('infura_apikey.json')) {
  infura_apikey = JSON.parse(fs.readFileSync('infura_apikey.json', 'utf8'));
} else {
  console.log('no infura_apikey.json found. You can only deploy to the testrpc.');
  infura_apikey = '';
}

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/'+infura_apikey),
      network_id: "3",
      gas: 4700000,
      gasPrice: 20000000000,
    },
    rinkeby: {
      provider: new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/'+infura_apikey),
      network_id: "*",
      gas: 4700000,
      gasPrice: 20000000000,
    }
  }
};
