const HDWalletProvider = require('truffle-hdwallet-provider')
const fs = require('fs')

// first read in the secrets.json to get our mnemonic
let secrets, mnemonic
if (fs.existsSync('secrets.json')) {
  secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'))
  mnemonic = secrets.mnemonic
  // console.log(mnemonic)
} else {
  console.log('no secrets.json found. You can only deploy to the testrpc.')
  mnemonic = ''
}

module.exports = {
  networks: {
    // run truffle migrate --network app to migrate contracts for app
    // do not change name to development!!!!
    app: {
      host: 'localhost',
      port: 8545,
      network_id: 5777
    },
    rinkeby: {
      provider: new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/'),
      network_id: '*'
    },
    mocha: {
      reporter: 'eth-gas-reporter',
      reporterOptions: {
        currency: 'ETH',
        gasPrice: 21
      }
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}
