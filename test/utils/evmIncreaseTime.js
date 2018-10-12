// increase time
const Web3 = require('web3')
const web3 = new Web3()
web3.setProvider(new Web3.providers.HttpProvider('http://localhost:8545'))

const jsonrpc = '2.0'
const id = 0

const send = (method, params = []) =>
  web3.currentProvider.send({
    id, jsonrpc, method, params
  })

const increaseTime = async seconds => {
  await send('evm_increaseTime', [seconds])
  await send('evm_mine')
}
module.exports = increaseTime
