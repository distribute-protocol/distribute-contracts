const Promise = require('bluebird')
// let abi = require('ethereumjs-abi');
let Web3Utils = require('web3-utils')

// function KeccakHashes (types, bytesarray) {
//   let hash = Web3Utils.soliditySha3(types, bytesarray).toString('hex')
//   return hash
// }

const KeccakHashes = (types, bytesarray) => {
  // {t: 'string', v: 'Hello!%'}, {t: 'int8', v:-23}, {t: 'address', v: '0x85F43D8a49eeB85d32Cf465507DD71d507100C1d'}
  let objArray = []
  for (let i = 0; i < types.length; i++) {
    types[i] === 'uint'
      ? objArray.push({t: types[i], v: bytesarray[i].toString()})
      : objArray.push({t: types[i], v: bytesarray[i]})
  }
  let hash = Web3Utils.soliditySha3(...objArray).toString('hex')
  return hash
}

const hashTasks = (taskArray, cost) => {
  let taskHashArray = []
  let args = ['bytes32', 'uint']
  for (var i = 0; i < taskArray.length; i++) {
    let thisTask = []
    thisTask.push(web3.fromAscii(taskArray[i].description, 32))
    thisTask.push(100 * taskArray[i].weiReward / cost)
    taskHashArray.push(KeccakHashes(args, thisTask))
  }
  return taskHashArray
}

const hashTasksArray = (taskArray, cost) => {
  let hashList = hashTasks(taskArray, cost)
  hashList.map(arr => arr.slice(2))
  let numArgs = hashList.length
  let args = 'bytes32'.concat(' bytes32'.repeat(numArgs - 1)).split(' ')
  let taskHash = KeccakHashes(args, hashList)
  return taskHash
}

// function hashTasksArray (data) {
//   let hashList = hashTask(data)
//   hashList.map(arr => arr.slice(2))
//   let numArgs = hashList.length
//   let args = 'bytes32'.concat(' bytes32'.repeat(numArgs - 1)).split(' ')
//   let taskHash = keccakHashes(args, hashList)
//   // console.log('0x' + taskHash)
//   return '0x' + taskHash
// }
//
// function hashTask (data) {
//   let tasks = data.split(',')     // split tasks up
//   let taskHashArray = []
//   let args = ['string', 'uint', 'uint']
//   // let args = ['bytes32', 'bytes32', 'bytes32']
//   for (var i = 0; i < tasks.length; i++) {
//     let thisTask = tasks[i].split(';')  // split each task into elements
//     taskHashArray.push('0x' + keccakHashes(args, thisTask))
//   }
//   // console.log(taskHashArray)
//   return taskHashArray
// }

module.exports = {KeccakHashes, hashTasks, hashTasksArray}
