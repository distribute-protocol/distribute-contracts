// const HDWalletProvider = require('truffle-hdwallet-provider')
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

// var infuraApikey = '11XiCuI1EjsowYvplZ24'

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 7545,
      network_id: '*'
      // gas: 6412500,
      // gasPrice: 20000000000
    }
    // ropsten: {
    //   provider: new HDWalletProvider(mnemonic, 'https://ropsten.infura.io'),
    //   network_id: '3'
    // },
    // rinkeby: {
    //   provider: new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/'),
    //   network_id: '*'
    // }
  }
}
