const Promise = require('bluebird')
let abi = require('ethereumjs-abi');


function KeccakHashes(types, bytesarray) {
  let hash = abi.soliditySHA3(types, bytesarray).toString('hex')
  return hash
}

module.exports = KeccakHashes
