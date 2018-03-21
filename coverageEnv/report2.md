# Mythril Security Analysis Report

  * [Project](#project)
    + [Integer Underflow](#integer-underflow)
    + [Integer Underflow](#integer-underflow-1)
  * [ProjectRegistry](#projectregistry)
    + [Message calls to contract addresses taken from function arguments](#message-calls-to-contract-addresses-taken-from-function-arguments)
  * [TokenRegistry](#tokenregistry)
    + [Message calls to stored contract addresses](#message-calls-to-stored-contract-addresses)
  * [Message calls to external contract addresses taken from function arguments](#message-calls-to-external-contract-addresses-taken-from-function-arguments)
  * [ProjectLibrary](#projectlibrary)
    + [Message calls to external contract addresses taken from function arguments](#message-calls-to-external-contract-addresses-taken-from-function-arguments-1)
  * [ReputationRegistry](#reputationregistry)
    + [Message calls to external contract addresses taken from function arguments](#message-calls-to-external-contract-addresses-taken-from-function-arguments-2)
    + [State change after external call](#state-change-after-external-call)
    + [Message call to external contract](#message-call-to-external-contract)
    + [State change after external call](#state-change-after-external-call-1)
    + [State change after external call](#state-change-after-external-call-2)
    + [Integer Underflow](#integer-underflow-2)
- [Exceptional States](#exceptional-states)

## Project

### Integer Underflow
- Type: Warning
- Contract: Project
- Function name: `unstakeReputation(address,uint256)`
- PC address: 3820

Possible integer underflows exist in the function unstakeReputation(address,uint256).

In *Project.json:198*

```
stakedReputationBalances[_staker] - _reputation
```

In *Project.json:201*

```
totalReputationStaked -= _reputation
```

### Integer Underflow
- Type: Warning
- Contract: Project
- Function name: `unstakeTokens(address,uint256)`
- PC address: 6149

Possible integer underflows exists in the function `unstakeTokens(address,uint256)`.

In *Project.json:180*

```
stakedTokenBalances[_staker] - _tokens
```

In *Project.json:184*

```
totalTokensStaked -= _tokens
```

## ProjectRegistry

### Message calls to contract addresses taken from function arguments

- Type: Warning
- Contract: ProjectRegistry

This contract executes a messages call to addresses provided as a function arguments. Generally, it is not recommended to call user-supplied adresses using Solidity's `call()` construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectRegistry.json:92*

```
project.state()
```

In *ProjectRegistry.json:169*

```
project.setTaskLength(_hashes.length)
```

In *ProjectRegistry.json:180*

```
project.state()
```

In *ProjectRegistry.json:191*

```
project.tasks(_index)
```

## TokenRegistry

### Message calls to stored contract addresses

- Type: Informational
- Contract: TokenRegistry

This contract executes messsage calls to several other contracts. The addresses of those contracts are held in storage, and initialized with the method `init(address,address,address)`. Make sure that initialization method is protected and that all called contracts are trusted.

The following list contains examples for the external calls detected:


In *TokenRegistry.json:88*

```
distributeToken.balanceOf(msg.sender)
```

In *TokenRegistry.json:149*

```
plcrVoting.getLockedTokens(msg.sender)
```

## Message calls to external contract addresses taken from function arguments

- Type: Warning
- Contract: TokenRegistry

This contract executes a messages call to addresses provided as a function arguments. Generally, it is not recommended to call user-supplied adresses using Solidity's `call()` construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:92*

```
project.weiBal()
```

In *TokenRegistry.json:109*

```
Project(_projectAddress).unstakeTokens(msg.sender, _tokens)
```

In *TokenRegistry.json:126*

```
project.tasks(_index)
```

In *TokenRegistry.json:146*

```
Project(_projectAddress).tasks(_index)
```

In *TokenRegistry.json:161*

```
Project(_projectAddress).tasks(_index)
```

In *ProjectRegistry.json:169*

```
project.setTaskLength(_hashes.length)
```

In *TokenRegistry.json:177*

```
Project(_projectAddress).tasks(_index)
```

In *ProjectRegistry.json:180*

```
project.state()
```

## ProjectLibrary

### Message calls to external contract addresses taken from function arguments

- Type: Warning
- Contract: ProjectLibrary

This contract executes a messages call to addresses provided as a function arguments. Generally, it is not recommended to call user-supplied adresses using Solidity's `call()` construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

The following list contains examples for the external calls detected:


In *ProjectLibrary.json:51*

```
project.totalReputationStaked()
```

In *ProjectLibrary.json:52*

```
project.totalReputationStaked()
```

```
project.stakedReputationBalances(_address)
```

In *ProjectLibrary.json:64*

```
project.state()
```

## ReputationRegistry

### Message calls to external contract addresses taken from function arguments

- Type: Warning
- Contract: ReputationRegistry

This contract executes a messages call to addresses provided as a function arguments. Generally, it is not recommended to call user-supplied adresses using Solidity's `call()` construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:128*

```
Project(_projectAddress).stakeReputation(msg.sender, _reputation)
```

In *ReputationRegistry.json:135*

```
Project(_projectAddress).unstakeReputation(msg.sender, _reputation)
```

In *ReputationRegistry.json:144*

```
project.reputationCost()
```

In *ReputationRegistry.json:146*

```
project.weiCost()
```

In *ReputationRegistry.json:163*

```
project.tasks(_index)
```

In *ReputationRegistry.json:178*

```
project.tasks(_index)
```

### State change after external call

- Type: Warning
- Contract: ReputationRegistry
- Function name: `claimTask(address,uint256,bytes32,uint256)`
- PC address: 2861

The contract account state is changed after an external call. Consider that the called contract could re-enter the function before this state change takes place. This can lead to business logic vulnerabilities.

In *ReputationRegistry.json:147*

```
balances[msg.sender] -= reputationVal
```

### Message call to external contract

- Type: Warning
- Contract: ReputationRegistry
- Function name: `voteCommit(address,uint256,uint256,bytes32,uint256)`
- PC address: 3774

This contract sends messsage calls to several other contracts. The addresses of those contracts are held in storage, and initialized with the method `init(address,address,address)`. Make sure that initialization method is protected and that all called contracts are trusted.

In *ReputationRegistry.json:165*

```
plcrVoting.getLockedTokens(msg.sender)
```

In *ReputationRegistry.json:183*

```
plcrVoting.withdrawVotingRights(msg.sender, _reputation)
```

```
distributeToken.weiBal()
```

In *ReputationRegistry.json:129*

```
projectRegistry.checkStaked(_projectAddress)
```


In *ReputationRegistry.json:179*

```
plcrVoting.revealVote(pollId, _voteOption, _salt)
```

### State change after external call

- Type: Warning
- Contract: ReputationRegistry
- Function name: `refundVotingReputation(uint256)`
- PC address: 6176

The contract account state is changed after an external call. Consider that the called contract could re-enter the function before this state change takes place. This can lead to business logic vulnerabilities.

In *ReputationRegistry.json:184*

```
balances[msg.sender] += _reputation
```

### State change after external call

- Type: Warning
- Contract: ReputationRegistry
- Function name: `proposeProject(uint256,uint256,string)`
- PC address: 6566


The contract account state is changed after an external call. Consider that the called contract could re-enter the function before this state change takes place. This can lead to business logic vulnerabilities.

In *ReputationRegistry.json:107*

```
balances[msg.sender] -= proposerReputationCost
```

### Integer Underflow

- Type: Warning
- Contract: ReputationRegistry
- Function name: `burnReputation(uint256)`
- PC address: 8091

A possible integer underflow exists in the function burnReputation(uint256).
The SUB instruction at address 8091 may result in a value < 0.

In *ReputationRegistry.json:202*

```
totalSupply -= _reputation
```

# Exceptional States

A following reachable exceptions (opcode 0xfe) have been detected. Exceptions can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that `assert()` should only be used to check invariants. Use `require()` for regular input checking. The exception is triggered under the following conditions:


In *PLCRVoting.json:339*

```
assert(!(commitEndDate == 0 && revealEndDate != 0))
```

In *PLCRVoting.json:340*

```
assert(!(commitEndDate != 0 && revealEndDate == 0))
```

In *DistributeToken.json:66*

```
weiBal / totalSupply
```

In *DistributeToken.json:73*

```
_numerator / denominator
```

In *Project.json:160*

```
tasks[_index]
```

In *Project.json:182*

```
_tokens / totalTokensStaked
```

In *ProjectRegistry.json:171*

```
_hashes[i]
```

In *TokenRegistry.json:66*

```
_cost / distributeToken.weiBal()
```

In *TokenRegistry.json:67*

```
costProportion / proposeProportion
```

In *ProjectLibrary.json:44*

```
_numerator / denominator
```

In *ReputationRegistry.json:72*

```
totalSupply / totalUsers
```

In *ReputationRegistry.json:104*

```
_cost / distributeToken.weiBal()
```

In *ReputationRegistry.json:105*

```
costProportion / proposeProportion
```

