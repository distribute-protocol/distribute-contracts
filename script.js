module.exports = async function(callback) {

  var Web3 = require('web3');
  var web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545"));

  const TokenRegistry = artifacts.require('TokenRegistry')
  const DistributeToken = artifacts.require('DistributeToken')
  const ProjectRegistry = artifacts.require('ProjectRegistry')
  const Project = artifacts.require('Project')
  //const ethJSABI = require("ethjs-abi")

  let TR
  let PR
  let DT
  let PROJ
  //proposer only necessary in the
  let proposer = web3.eth.accounts[0]
  let staker1 = web3.eth.accounts[2]
  let staker2 = web3.eth.accounts[3]
  let staker3 = web3.eth.accounts[4]
  let nonStaker = web3.eth.accounts[5]

  let tokens = 10000
  let stakingPeriod = 20000000000     //10/11/2603 @ 11:33am (UTC)
  let projectCost = web3.toWei(1, 'ether')
  let proposeProportion = 20
  let proposeReward = 100

  let proposerTokenCost
  let proposerBalance, stakerBalance1, stakerBalance2, stakerBalance3

  let totalTokenSupply, totalFreeSupply
  let currentPrice

  let projectAddress
  let tx

  let data1 = 'some random task list'
  let data2 = 'some other random task list'

  TR = TokenRegistry.at("0x8f0483125fcb9aaaefa9209d8e9d7b9c8b9fb90f")
  DT = DistributeToken.at("0x2c2b9c9a4a25e24b174f26114e8926a9f2128fe4")
  PR = ProjectRegistry.at("0xfb88de099e13c3ed21f80a7a1e49f8caecf10df6")

      // mint 10000 tokens for proposer & each staker
  let mintingCost = await DT.weiRequired(tokens, {from: proposer})
  await DT.mint(tokens, {from: proposer, value: mintingCost})
  mintingCost = await DT.weiRequired(tokens, {from: staker1})
  await DT.mint(tokens, {from: staker1, value: mintingCost})
  mintingCost = await DT.weiRequired(tokens, {from: staker2})
  await DT.mint(tokens, {from: staker2, value: mintingCost})
  mintingCost = await DT.weiRequired(tokens, {from: staker3})
  await DT.mint(tokens, {from: staker3, value: mintingCost})

  currentPrice = await DT.currentPrice()              // put this before propose project because current price changes slightly (rounding errors)
  tx = await TR.proposeProject(projectCost, stakingPeriod, {from: proposer})
  let log = tx.logs[0].args
  projectAddress = log.projectAddress.toString()
  console.log(projectAddress)
  PROJ = await Project.at(projectAddress)

  // //fully stake the project
  let requiredTokens = Math.ceil(projectCost / await DT.currentPrice())
  await TR.stakeTokens(projectAddress, Math.floor(requiredTokens/3), {from: staker1})
  await TR.stakeTokens(projectAddress, Math.floor(requiredTokens/3), {from: staker2})
  let weiRemaining = projectCost - await PROJ.weiBal()
  requiredTokens = Math.ceil(weiRemaining / await DT.currentPrice())
  await TR.stakeTokens(projectAddress, requiredTokens, {from: staker3})

  //
  // //check that project is fully staked
  let state =  await PROJ.state()

  // callback()


/*
  //    let openProjectsBefore =  PR.openProjects.call(projectAddress)
       PR.addTaskHash(projectAddress, web3.sha3(data1), {from: staker1})
//      let openProjectsAfter =  PR.openProjects.call(projectAddress)

    //  let openProjectsBefore =  PR.openProjects.call(projectAddress)
       PR.addTaskHash(projectAddress, web3.sha3(data2), {from: staker2})
    //  let openProjectsAfter =  PR.openProjects.call(projectAddress)



  //    let openProjectsBefore =  PR.openProjects.call(projectAddress)
       PR.addTaskHash(projectAddress, web3.sha3(data1), {from: staker2})
  //    let openProjectsAfter =  PR.openProjects.call(projectAddress)
*/


  callback()
}
