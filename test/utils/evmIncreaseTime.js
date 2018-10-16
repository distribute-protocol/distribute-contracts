// increase time

const EthRPC = require('ethjs-rpc')
const HttpProvider = require('ethjs-provider-http')

const ethRPC = new EthRPC(new HttpProvider('http://localhost:7545'))

const increaseTime = (seconds) => {
  if ((typeof seconds) !== 'number') {
    throw new Error('arguments to increaseTime must be of type number')
  }

  return new Promise((resolve, reject) =>
    ethRPC.sendAsync(
      {
        method: 'evm_increaseTime',
        params: [seconds]
      }, (err) => {
        if (err) reject(err)
        resolve()
      }
    )
  ).then(() =>
    new Promise((resolve, reject) =>
      ethRPC.sendAsync(
        {
          method: 'evm_mine',
          params: []
        }, (err) => {
          if (err) reject(err)
          resolve()
        }
      )
    )
  )
}

module.exports = increaseTime
