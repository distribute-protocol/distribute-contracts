const Promise = require('bluebird')
// let abi = require('ethereumjs-abi');
let Web3Utils = require('web3-utils')

function KeccakHashes (types, bytesarray) {
  let hash = Web3Utils.soliditySha3(types, bytesarray).toString('hex')
  return hash
}

module.exports = KeccakHashes
