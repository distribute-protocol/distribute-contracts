Analysis result for DLL: No issues found.
Analysis result for AttributeStore:
# Analysis Results
## Integer Underflow
- Type: Warning
- Contract: AttributeStore
- Function name: `_function_0x50389f5c`
- PC address: 383

### Description
A possible integer underflow exists in the function _function_0x50389f5c.
The SUB instruction at address 383 may result in a value < 0.

In *AttributeStore.json:8*

```
ttr
```
## Integer Underflow
- Type: Warning
- Contract: AttributeStore
- Function name: `_function_0xf8f42244`
- PC address: 542

### Description
A possible integer underflow exists in the function _function_0xf8f42244.
The SUB instruction at address 542 may result in a value < 0.

In *AttributeStore.json:8*

```
ttr
```

Analysis result for PLCRVoting:
# Analysis Results
## Exception state
- Type: Informational
- Contract: PLCRVoting
- Function name: `_function_0xee684830`
- PC address: 6384

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

storage_0 + keccac_calldata_PLCRVoting_4: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_PLCRVoting_0: 0xee68483000000000000000000000000000000000000000000000000000000000
calldatasize_PLCRVoting: 0x4
storage_1 + keccac_calldata_PLCRVoting_4: 0x0
callvalue: 0x0



In *PLCRVoting.json:340*

```
assert(!(commitEndDate != 0 && revealEndDate == 0))
```
## Exception state
- Type: Informational
- Contract: PLCRVoting
- Function name: `_function_0xee684830`
- PC address: 6358

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

storage_1 + keccac_calldata_PLCRVoting_4: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_PLCRVoting_0: 0xee68483000000000000000000000000000000000000000000000000000000000
calldatasize_PLCRVoting: 0x4
storage_0 + keccac_calldata_PLCRVoting_4: 0x0
callvalue: 0x0



In *PLCRVoting.json:339*

```
assert(!(commitEndDate == 0 && revealEndDate != 0))
```

Analysis result for DistributeToken:
# Analysis Results
## Exception state
- Type: Informational
- Contract: DistributeToken
- Function name: `targetPrice(uint256)`
- PC address: 5353

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

storage_6: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
storage_5: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_DistributeToken_4: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_DistributeToken_0: 0x81af819100000000000000000000000000000000000000000000000000000000
calldatasize_DistributeToken: 0x4
callvalue: 0x0



In *DistributeToken.json:73*

```
_numerator / denominator
```
## Exception state
- Type: Informational
- Contract: DistributeToken
- Function name: `sell(uint256)`
- PC address: 3751

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

calldata_DistributeToken_4: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
storage_6: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
storage_keccac_1461501637330902918203684832716283019655932542975_&
1461501637330902918203684832716283019655932542975_&
caller: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_DistributeToken_0: 0xe4849b3200000000000000000000000000000000000000000000000000000000
calldatasize_DistributeToken: 0x4
storage_5: 0x0
callvalue: 0x0



In *DistributeToken.json:66*

```
weiBal / totalSupply
```
## Exception state
- Type: Informational
- Contract: DistributeToken
- Function name: `sell(uint256)`
- PC address: 5389

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

calldata_DistributeToken_4: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
storage_5: 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe
storage_keccac_1461501637330902918203684832716283019655932542975_&
1461501637330902918203684832716283019655932542975_&
caller: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_DistributeToken_0: 0xe4849b3200000000000000000000000000000000000000000000000000000000
calldatasize_DistributeToken: 0x4
storage_6: 0x0
callvalue: 0x0



In *DistributeToken.json:31*

```
============
/
```

Analysis result for Project:
# Analysis Results
## Exception state
- Type: Informational
- Contract: Project
- Function name: `setTaskAddress(address,uint256)`
- PC address: 2801

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

calldata_Project_32 + 4: 0x0
storage_25: 0x0
storage_2: 0x0
caller: 0x0
calldata_Project_0: 0x3f2f92800000000000000000000000000000000000000000000000000000000
calldatasize_Project: 0x4
storage_3: 0x3
callvalue: 0x0



In *Project.json:160*

```
tasks[_index]
```
## Exception state
- Type: Informational
- Contract: Project
- Function name: `_function_0x8d977672`
- PC address: 4761

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

calldata_Project_4: 0x0
storage_25: 0x0
calldata_Project_0: 0x8d97767200000000000000000000000000000000000000000000000000000000
calldatasize_Project: 0x4
callvalue: 0x0



In *Project.json:56*

```
address[] public tasks
```
## Exception state
- Type: Informational
- Contract: Project
- Function name: `unstakeTokens(address,uint256)`
- PC address: 6058

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

storage_keccac_1461501637330902918203684832716283019655932542975_&
1461501637330902918203684832716283019655932542975_&
1461501637330902918203684832716283019655932542975_&
calldata_Project_4: 0xfff8f76d0055fc90000400104a63d880020003697c00c38c05fffffe3fb39692
calldata_Project_32 + 4: 0x7fffffecfff20020002000000000000000000000000000000000000000000000
storage_0: 0x0
caller: 0x0
calldata_Project_0: 0xe89a173e00000000000000000000000000000000000000000000000000000000
calldatasize_Project: 0x4
storage_21: 0x0
storage_3: 0x1
callvalue: 0x0



In *Project.json:182*

```
_tokens / totalTokensStaked
```
## Integer Underflow
- Type: Warning
- Contract: Project
- Function name: `unstakeReputation(address,uint256)`
- PC address: 3820

### Description
A possible integer underflow exists in the function unstakeReputation(address,uint256).
The SUB instruction at address 3820 may result in a value < 0.

In *Project.json:201*

```
totalReputationStaked -= _reputation
```
## Integer Underflow
- Type: Warning
- Contract: Project
- Function name: `unstakeReputation(address,uint256)`
- PC address: 3647

### Description
A possible integer underflow exists in the function unstakeReputation(address,uint256).
The SUB instruction at address 3647 may result in a value < 0.

In *Project.json:198*

```
stakedReputationBalances[_staker] - _reputation
```
## Integer Underflow
- Type: Warning
- Contract: Project
- Function name: `unstakeTokens(address,uint256)`
- PC address: 6149

### Description
A possible integer underflow exists in the function unstakeTokens(address,uint256).
The SUB instruction at address 6149 may result in a value < 0.

In *Project.json:184*

```
totalTokensStaked -= _tokens
```
## Integer Underflow
- Type: Warning
- Contract: Project
- Function name: `unstakeTokens(address,uint256)`
- PC address: 5956

### Description
A possible integer underflow exists in the function unstakeTokens(address,uint256).
The SUB instruction at address 5956 may result in a value < 0.

In *Project.json:180*

```
stakedTokenBalances[_staker] - _tokens
```

Analysis result for Task: No issues found.
Analysis result for SafeMath: No issues found.
Analysis result for ProjectRegistry:
# Analysis Results
## Exception state
- Type: Informational
- Contract: ProjectRegistry
- Function name: `submitHashList(address,bytes32[])`
- PC address: 8176

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

calldata_ProjectRegistry_4 + calldata_ProjectRegistry_32 + 4: 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc
retval_8132: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_ProjectRegistry_4: 0x0
retval_7820: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
extcodesize: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_ProjectRegistry_0: 0x47c34c0b00000000000000000000000000000000000000000000000000000000
calldatasize_ProjectRegistry: 0x4
KECCAC_mem_96 +
32 +
32*
calldata_ProjectRegistry_4 + calldata_ProjectRegistry_32 + 4): 0x0
callvalue: 0x0



In *ProjectRegistry.json:171*

```
_hashes[i]
```
## Message call to external contract
- Type: Warning
- Contract: ProjectRegistry
- Function name: `checkEnd(address)`
- PC address: 3980

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectRegistry.json:92*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectRegistry
- Function name: `_function_0x3330dcd8`
- PC address: 5302

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectRegistry.json:180*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectRegistry
- Function name: `submitHashList(address,bytes32[])`
- PC address: 8132

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectRegistry.json:169*

```
project.setTaskLength(_hashes.length)
```
## Message call to external contract
- Type: Warning
- Contract: ProjectRegistry
- Function name: `submitTaskComplete(address,uint256)`
- PC address: 9349

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectRegistry.json:191*

```
project.tasks(_index)
```
## Integer Underflow
- Type: Warning
- Contract: ProjectRegistry
- Function name: `fallback`
- PC address: 2547

### Description
A possible integer underflow exists in the function fallback.
The SUB instruction at address 2547 may result in a value < 0.

In *ProjectRegistry.json:2*

```
 ===================================================================== //
// This contract manages the state 
```

Analysis result for StandardToken: No issues found.
Analysis result for TokenRegistry:
# Analysis Results
## Exception state
- Type: Informational
- Contract: TokenRegistry
- Function name: `proposeProject(uint256,uint256,string)`
- PC address: 4717

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

timestamp: 0x0
retval_4684: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_TokenRegistry_4 + calldata_TokenRegistry_32 + 32 + 4: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe1
retval_4502: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
extcodesize: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_TokenRegistry_4: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_TokenRegistry_32 + 4: 0x1
calldata_TokenRegistry_0: 0x5890b1e200000000000000000000000000000000000000000000000000000000
calldatasize_TokenRegistry: 0x4
storage_3: 0x0
callvalue: 0x0



In *TokenRegistry.json:67*

```
costProportion / proposeProportion
```
## Exception state
- Type: Informational
- Contract: TokenRegistry
- Function name: `proposeProject(uint256,uint256,string)`
- PC address: 4532

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

timestamp: 0x0
calldata_TokenRegistry_4 + calldata_TokenRegistry_32 + 32 + 4: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff61
retval_4502: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
extcodesize: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_TokenRegistry_4: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_TokenRegistry_32 + 4: 0x1
calldata_TokenRegistry_0: 0x5890b1e200000000000000000000000000000000000000000000000000000000
calldatasize_TokenRegistry: 0x4
callvalue: 0x0



In *TokenRegistry.json:66*

```
_cost / distributeToken.weiBal()
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `voteCommit(address,uint256,uint256,bytes32,uint256)`
- PC address: 2031

### Description
This contract executes a message call to an address found at storage slot 2. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:149*

```
plcrVoting.getLockedTokens(msg.sender)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `voteCommit(address,uint256,uint256,bytes32,uint256)`
- PC address: 1655

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:146*

```
Project(_projectAddress).tasks(_index)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `proposeProject(uint256,uint256,string)`
- PC address: 4684

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:67*

```
distributeToken.totalSupply()
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `proposeProject(uint256,uint256,string)`
- PC address: 4502

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:66*

```
distributeToken.weiBal()
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `burnTokens(uint256)`
- PC address: 5902

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:189*

```
distributeToken.burn(_tokens)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `revertWei(uint256)`
- PC address: 6160

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:186*

```
distributeToken.returnWei(_value)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `stakeTokens(address,uint256)`
- PC address: 6714

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:92*

```
project.weiBal()
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `stakeTokens(address,uint256)`
- PC address: 6577

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:91*

```
distributeToken.currentPrice()
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `stakeTokens(address,uint256)`
- PC address: 6392

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:88*

```
distributeToken.balanceOf(msg.sender)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `refundVotingTokens(uint256)`
- PC address: 8243

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:166*

```
distributeToken.transferFromEscrow(msg.sender, _tokens)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `refundVotingTokens(uint256)`
- PC address: 8018

### Description
This contract executes a message call to an address found at storage slot 2. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:165*

```
plcrVoting.withdrawVotingRights(msg.sender, _tokens)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `rewardValidator(address,uint256)`
- PC address: 8402

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:126*

```
project.tasks(_index)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `voteReveal(address,uint256,uint256,uint256)`
- PC address: 10360

### Description
This contract executes a message call to an address found at storage slot 2. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:161*

```
plcrVoting.revealVote(Task(Project(_projectAddress).tasks(_index)).pollId(), _voteOption, _salt)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `voteReveal(address,uint256,uint256,uint256)`
- PC address: 10102

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:161*

```
Project(_projectAddress).tasks(_index)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `unstakeTokens(address,uint256)`
- PC address: 11009

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:111*

```
distributeToken.transferFromEscrow(msg.sender, _tokens)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `unstakeTokens(address,uint256)`
- PC address: 10784

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:110*

```
distributeToken.transferWeiTo(msg.sender, weiVal)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `unstakeTokens(address,uint256)`
- PC address: 10559

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:109*

```
Project(_projectAddress).unstakeTokens(msg.sender, _tokens)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `validateTask(address,uint256,uint256,bool)`
- PC address: 11485

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:120*

```
distributeToken.transferToEscrow(msg.sender, _tokens)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `validateTask(address,uint256,uint256,bool)`
- PC address: 11240

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:119*

```
distributeToken.balanceOf(msg.sender)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `refundStaker(address,uint256)`
- PC address: 12364

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:177*

```
Project(_projectAddress).tasks(_index)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `refundStaker(address,uint256)`
- PC address: 12217

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:175*

```
distributeToken.transferFromEscrow(msg.sender, refund)
```

Analysis result for ProjectLibrary:
# Analysis Results
## Exception state
- Type: Informational
- Contract: ProjectLibrary
- Function name: `calculateWeightOfAddress(address,address)`
- PC address: 15145

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

retval_2667: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
retval_2532: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
retval_2323: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
extcodesize: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_ProjectLibrary_0: 0x43fa21d700000000000000000000000000000000000000000000000000000000
calldatasize_ProjectLibrary: 0x4



In *ProjectLibrary.json:44*

```
_numerator / denominator
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `checkStaked(address)`
- PC address: 1578

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:64*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `calculateWeightOfAddress(address,address)`
- PC address: 2667

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:52*

```
project.totalReputationStaked()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `calculateWeightOfAddress(address,address)`
- PC address: 2532

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:52*

```
project.stakedReputationBalances(_address)
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `calculateWeightOfAddress(address,address)`
- PC address: 2323

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:51*

```
project.totalReputationStaked()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `isStaked(address)`
- PC address: 3474

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:33*

```
project.weiBal()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `isStaked(address)`
- PC address: 3339

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:33*

```
project.weiCost()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `checkVoting(address,address,address,address)`
- PC address: 3921

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:118*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `checkEnd(address,address,address,address)`
- PC address: 6021

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:143*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `calculatePassAmount(address)`
- PC address: 8687

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:187*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `checkActive(address,bytes32)`
- PC address: 9574

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:80*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `refundStaker(address,address)`
- PC address: 10353

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:220*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `refundStaker(address,address)`
- PC address: 10209

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:220*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `checkValidate(address,address,address)`
- PC address: 10950

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:98*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `validate(address,address,uint256,uint256,bool)`
- PC address: 12639

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:173*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `claimTaskReward(uint256,address,address)`
- PC address: 13386

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:204*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `isStaker(address,address)`
- PC address: 14740

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:28*

```
project.stakedTokenBalances(_staker)
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `timesUp(address)`
- PC address: 15087

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:37*

```
Project(_projectAddress).nextDeadline()
```

Analysis result for ReputationRegistry:
# Analysis Results
## Exception state
- Type: Informational
- Contract: ReputationRegistry
- Function name: `proposeProject(uint256,uint256,string)`
- PC address: 6407

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

timestamp: 0x0
calldata_ReputationRegistry_4 + calldata_ReputationRegistry_32 + 32 + 4: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe1
retval_6358: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
extcodesize: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_ReputationRegistry_4: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_ReputationRegistry_32 + 4: 0x1
calldata_ReputationRegistry_0: 0x5890b1e200000000000000000000000000000000000000000000000000000000
calldatasize_ReputationRegistry: 0x4
storage_8: 0x0
callvalue: 0x0



In *ReputationRegistry.json:105*

```
costProportion / proposeProportion
```
## Exception state
- Type: Informational
- Contract: ReputationRegistry
- Function name: `proposeProject(uint256,uint256,string)`
- PC address: 6388

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

timestamp: 0x0
calldata_ReputationRegistry_4 + calldata_ReputationRegistry_32 + 32 + 4: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff61
retval_6358: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
extcodesize: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_ReputationRegistry_4: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_ReputationRegistry_32 + 4: 0x1
calldata_ReputationRegistry_0: 0x5890b1e200000000000000000000000000000000000000000000000000000000
calldatasize_ReputationRegistry: 0x4
callvalue: 0x0



In *ReputationRegistry.json:104*

```
_cost / distributeToken.weiBal()
```
## Exception state
- Type: Informational
- Contract: ReputationRegistry
- Function name: `_function_0x5d151b19`
- PC address: 7405

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

calldata_ReputationRegistry_0: 0x5d151b1900000000000000000000000000000000000000000000000000000000
calldatasize_ReputationRegistry: 0x4
storage_7: 0x0
callvalue: 0x0



In *ReputationRegistry.json:72*

```
totalSupply / totalUsers
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `claimTask(address,uint256,bytes32,uint256)`
- PC address: 2750

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:146*

```
project.weiCost()
```
## State change after external call
- Type: Warning
- Contract: ReputationRegistry
- Function name: `claimTask(address,uint256,bytes32,uint256)`
- PC address: 2861

### Description
The contract account state is changed after an external call. Consider that the called contract could re-enter the function before this state change takes place. This can lead to business logic vulnerabilities.

In *ReputationRegistry.json:147*

```
balances[msg.sender] -= reputationVal
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `claimTask(address,uint256,bytes32,uint256)`
- PC address: 2522

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:144*

```
project.reputationCost()
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `voteCommit(address,uint256,uint256,bytes32,uint256)`
- PC address: 3774

### Description
This contract executes a message call to an address found at storage slot 2. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:165*

```
plcrVoting.getLockedTokens(msg.sender)
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `voteCommit(address,uint256,uint256,bytes32,uint256)`
- PC address: 3414

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:163*

```
project.tasks(_index)
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `unstakeReputation(address,uint256)`
- PC address: 4937

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:135*

```
Project(_projectAddress).unstakeReputation(msg.sender, _reputation)
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `refundVotingReputation(uint256)`
- PC address: 6086

### Description
This contract executes a message call to an address found at storage slot 2. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:183*

```
plcrVoting.withdrawVotingRights(msg.sender, _reputation)
```
## State change after external call
- Type: Warning
- Contract: ReputationRegistry
- Function name: `refundVotingReputation(uint256)`
- PC address: 6176

### Description
The contract account state is changed after an external call. Consider that the called contract could re-enter the function before this state change takes place. This can lead to business logic vulnerabilities.

In *ReputationRegistry.json:184*

```
balances[msg.sender] += _reputation
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `proposeProject(uint256,uint256,string)`
- PC address: 6358

### Description
This contract executes a message call to an address found at storage slot 0. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:104*

```
distributeToken.weiBal()
```
## State change after external call
- Type: Warning
- Contract: ReputationRegistry
- Function name: `proposeProject(uint256,uint256,string)`
- PC address: 6566

### Description
The contract account state is changed after an external call. Consider that the called contract could re-enter the function before this state change takes place. This can lead to business logic vulnerabilities.

In *ReputationRegistry.json:107*

```
balances[msg.sender] -= proposerReputationCost
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `stakeReputation(address,uint256)`
- PC address: 7964

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:129*

```
projectRegistry.checkStaked(_projectAddress)
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `stakeReputation(address,uint256)`
- PC address: 7747

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:128*

```
Project(_projectAddress).stakeReputation(msg.sender, _reputation)
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `voteReveal(address,uint256,uint256,uint256)`
- PC address: 9482

### Description
This contract executes a message call to an address found at storage slot 2. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:179*

```
plcrVoting.revealVote(pollId, _voteOption, _salt)
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `voteReveal(address,uint256,uint256,uint256)`
- PC address: 9159

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:178*

```
project.tasks(_index)
```
## Integer Underflow
- Type: Warning
- Contract: ReputationRegistry
- Function name: `burnReputation(uint256)`
- PC address: 8091

### Description
A possible integer underflow exists in the function burnReputation(uint256).
The SUB instruction at address 8091 may result in a value < 0.

In *ReputationRegistry.json:202*

```
totalSupply -= _reputation
```

