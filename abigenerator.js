var fs = require('fs')

let contractSource = async (contract) => {
  let instance = await contract.deployed()
  console.log('address', instance.address)
  console.log('abi', JSON.stringify(contract.abi))
  console.log('bytecode', contract.bytecode)
}
// fs.writeFile("/tmp/test", "Hey there!", function(err) {
//     if(err) {
//         return console.log(err);
//     }
//
//     console.log("The file was saved!");
// });

module.exports = function (callback) {
  contractSource()
}
