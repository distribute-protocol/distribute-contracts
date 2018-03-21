Analysis result for Division:
# Analysis Results
## Exception state
- Type: Informational
- Contract: Division
- Function name: `fallback`
- PC address: 154

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

calldata_Division_0: 0x2c1a9e00000000000000000000000000000000000000000000000000000000
calldatasize_Division: 0x4
calldata_Division_32 + 4: 0x0



In *Division.json:8*

```
numerator / _denominator
```

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
- PC address: 6398

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

storage_0 + keccac_calldata_PLCRVoting_4: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_PLCRVoting_0: 0xee68483000000000000000000000000000000000000000000000000000000000
calldatasize_PLCRVoting: 0x4
storage_1 + keccac_calldata_PLCRVoting_4: 0x0
callvalue: 0x0



In *PLCRVoting.json:358*

```
assert(!(commitEndDate != 0 && revealEndDate == 0))
```
## Exception state
- Type: Informational
- Contract: PLCRVoting
- Function name: `_function_0xee684830`
- PC address: 6372

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

storage_1 + keccac_calldata_PLCRVoting_4: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_PLCRVoting_0: 0xee68483000000000000000000000000000000000000000000000000000000000
calldatasize_PLCRVoting: 0x4
storage_0 + keccac_calldata_PLCRVoting_4: 0x0
callvalue: 0x0



In *PLCRVoting.json:357*

```
assert(!(commitEndDate == 0 && revealEndDate != 0))
```

Analysis result for DistributeToken:
# Analysis Results
## Exception state
- Type: Informational
- Contract: DistributeToken
- Function name: `mint(uint256)`
- PC address: 5459

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

retval_5424: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
extcodesize: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
storage_6: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_DistributeToken_4: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_DistributeToken_0: 0xa0712d6800000000000000000000000000000000000000000000000000000000
calldatasize_DistributeToken: 0x4
storage_5: 0x0



In *DistributeToken.json:122*

```
cp * (1000 + Division.percent(_tokens, newSupply, 3)) / 1000
```
## Exception state
- Type: Informational
- Contract: DistributeToken
- Function name: `sell(uint256)`
- PC address: 5483

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



In *DistributeToken.json:26*

```
==============
```
## Integer Underflow
- Type: Warning
- Contract: DistributeToken
- Function name: `burn(uint256)`
- PC address: 3178

### Description
A possible integer underflow exists in the function burn(uint256).
The SUB instruction at address 3178 may result in a value < 0.

In *DistributeToken.json:155*

```
balances[msg.sender] -= _tokens
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
storage_24: 0x0
storage_2: 0x0
caller: 0x0
calldata_Project_0: 0x3f2f92800000000000000000000000000000000000000000000000000000000
calldatasize_Project: 0x4
storage_3: 0x3
callvalue: 0x0



In *Project.json:230*

```
tasks[_index]
```
## Exception state
- Type: Informational
- Contract: Project
- Function name: `unstakeTokens(address,uint256)`
- PC address: 6395

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

storage_keccac_1461501637330902918203684832716283019655932542975_&
1461501637330902918203684832716283019655932542975_&
1461501637330902918203684832716283019655932542975_&
calldata_Project_4: 0x0
calldata_Project_32 + 4: 0x1
storage_0: 0x0
caller: 0x0
calldata_Project_0: 0xe89a173e00000000000000000000000000000000000000000000000000000000
calldatasize_Project: 0x4
storage_3: 0x1
callvalue: 0x0



In *Project.json:25*

```
==============
```
## Exception state
- Type: Informational
- Contract: Project
- Function name: `_function_0x8d977672`
- PC address: 4819

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

calldata_Project_4: 0x0
storage_24: 0x0
calldata_Project_0: 0x8d97767200000000000000000000000000000000000000000000000000000000
calldatasize_Project: 0x4
callvalue: 0x0



In *Project.json:68*

```
address[] public tasks
```
## Integer Underflow
- Type: Warning
- Contract: Project
- Function name: `unstakeReputation(address,uint256)`
- PC address: 3830

### Description
A possible integer underflow exists in the function unstakeReputation(address,uint256).
The SUB instruction at address 3830 may result in a value < 0.

In *Project.json:312*

```
reputationStaked -= _reputation
```

Analysis result for Task: No issues found.
Analysis result for SafeMath: No issues found.
Analysis result for ProjectRegistry:
# Analysis Results
## Exception state
- Type: Informational
- Contract: ProjectRegistry
- Function name: `submitHashList(address,bytes32[])`
- PC address: 8214

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

calldata_ProjectRegistry_4 + calldata_ProjectRegistry_32 + 4: 0x3
retval_8170: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
extcodesize: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
calldata_ProjectRegistry_0: 0x47c34c0b00000000000000000000000000000000000000000000000000000000
calldatasize_ProjectRegistry: 0x4
storage_0 +
keccac_1461501637330902918203684832716283019655932542975_&
1461501637330902918203684832716283019655932542975_&
1461501637330902918203684832716283019655932542975_&
calldata_ProjectRegistry_4: 0x0
KECCAC_mem_96 +
32 +
32*
calldata_ProjectRegistry_4 + calldata_ProjectRegistry_32 + 4): 0x0
callvalue: 0x0



In *ProjectRegistry.json:290*

```
_hashes[i]
```
## Message call to external contract
- Type: Warning
- Contract: ProjectRegistry
- Function name: `checkEnd(address)`
- PC address: 4086

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectRegistry.json:151*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectRegistry
- Function name: `_function_0x3330dcd8`
- PC address: 5449

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectRegistry.json:319*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectRegistry
- Function name: `submitHashList(address,bytes32[])`
- PC address: 8170

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectRegistry.json:288*

```
project.setTaskLength(_hashes.length)
```
## Message call to external contract
- Type: Warning
- Contract: ProjectRegistry
- Function name: `submitTaskComplete(address,uint256)`
- PC address: 9521

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectRegistry.json:339*

```
project.tasks(_index)
```
## Integer Underflow
- Type: Warning
- Contract: ProjectRegistry
- Function name: `fallback`
- PC address: 2588

### Description
A possible integer underflow exists in the function fallback.
The SUB instruction at address 2588 may result in a value < 0.

In *ProjectRegistry.json:1*

```
gma solidity ^0.4.8;

import "./library/PLCRVoting.sol";
import "./ReputationRegistry.sol";
import "./Project
```

Analysis result for StandardToken: No issues found.
Analysis result for TokenRegistry:
# Analysis Results
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `voteCommit(address,uint256,uint256,bytes32,uint256)`
- PC address: 2108

### Description
This contract executes a message call to an address found at storage slot 2. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:232*

```
plcrVoting.getAvailableTokens(msg.sender, 1)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `voteCommit(address,uint256,uint256,bytes32,uint256)`
- PC address: 1723

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:229*

```
Project(_projectAddress).tasks(_index)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `_function_0x57376198`
- PC address: 4661

### Description
This contract executes a message call to an address found at storage slot 2. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:292*

```
plcrVoting.rescueTokens(msg.sender, pollId)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `_function_0x57376198`
- PC address: 4302

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:291*

```
Project(_projectAddress).tasks(_index)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `proposeProject(uint256,uint256,string)`
- PC address: 5193

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:95*

```
distributeToken.totalSupply()
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `proposeProject(uint256,uint256,string)`
- PC address: 4885

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:92*

```
distributeToken.weiBal()
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `refundStaker(address)`
- PC address: 6992

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:281*

```
distributeToken.transferFromEscrow(msg.sender, refund)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `refundStaker(address)`
- PC address: 6767

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:280*

```
Project(_projectAddress).clearTokenStake(msg.sender)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `burnTokens(uint256)`
- PC address: 7259

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:314*

```
distributeToken.burn(_tokens)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `revertWei(uint256)`
- PC address: 7517

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:305*

```
distributeToken.returnWei(_value)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `stakeTokens(address,uint256)`
- PC address: 8035

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:141*

```
project.weiCost()
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `stakeTokens(address,uint256)`
- PC address: 7900

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:141*

```
project.weiBal()
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `stakeTokens(address,uint256)`
- PC address: 7749

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:137*

```
distributeToken.balanceOf(msg.sender)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `refundVotingTokens(uint256)`
- PC address: 9600

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:264*

```
distributeToken.transferFromEscrow(msg.sender, _tokens)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `refundVotingTokens(uint256)`
- PC address: 9375

### Description
This contract executes a message call to an address found at storage slot 2. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:263*

```
plcrVoting.withdrawVotingRights(msg.sender, _tokens)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `rewardValidator(address,uint256)`
- PC address: 9759

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:197*

```
project.tasks(_index)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `voteReveal(address,uint256,uint256,uint256)`
- PC address: 11717

### Description
This contract executes a message call to an address found at storage slot 2. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:254*

```
plcrVoting.revealVote(Task(Project(_projectAddress).tasks(_index)).pollId(), _voteOption, _salt)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `voteReveal(address,uint256,uint256,uint256)`
- PC address: 11459

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:254*

```
Project(_projectAddress).tasks(_index)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `unstakeTokens(address,uint256)`
- PC address: 12366

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:167*

```
distributeToken.transferFromEscrow(msg.sender, _tokens)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `unstakeTokens(address,uint256)`
- PC address: 12141

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:166*

```
distributeToken.transferWeiTo(msg.sender, weiVal)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `unstakeTokens(address,uint256)`
- PC address: 11916

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:165*

```
Project(_projectAddress).unstakeTokens(msg.sender, _tokens)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `validateTask(address,uint256,uint256,bool)`
- PC address: 12842

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:186*

```
distributeToken.transferToEscrow(msg.sender, _tokens)
```
## Message call to external contract
- Type: Warning
- Contract: TokenRegistry
- Function name: `validateTask(address,uint256,uint256,bool)`
- PC address: 12597

### Description
This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *TokenRegistry.json:185*

```
distributeToken.balanceOf(msg.sender)
```
## Integer Underflow
- Type: Warning
- Contract: TokenRegistry
- Function name: `voteCommit(address,uint256,uint256,bytes32,uint256)`
- PC address: 2142

### Description
A possible integer underflow exists in the function voteCommit(address,uint256,uint256,bytes32,uint256).
The SUB instruction at address 2142 may result in a value < 0.

In *TokenRegistry.json:236*

```
_tokens - availableTokens
```

Analysis result for ProjectLibrary:
# Analysis Results
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `checkStaked(address)`
- PC address: 1650

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:102*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `_function_0x25bc963e`
- PC address: 2406

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:343*

```
project.tasks(_index)
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `calculateWeightOfAddress(address,address)`
- PC address: 3916

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:80*

```
project.reputationStaked()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `calculateWeightOfAddress(address,address)`
- PC address: 3781

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:79*

```
project.reputationBalances(_address)
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `calculateWeightOfAddress(address,address)`
- PC address: 3550

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:77*

```
project.reputationStaked()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `isStaked(address)`
- PC address: 4993

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:48*

```
project.weiBal()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `isStaked(address)`
- PC address: 4858

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:48*

```
project.weiCost()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `checkVoting(address,address,address,address)`
- PC address: 5437

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:200*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `checkEnd(address,address,address,address)`
- PC address: 7820

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:248*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `calculatePassAmount(address)`
- PC address: 10521

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:314*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `checkActive(address,bytes32)`
- PC address: 11408

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:128*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `refundStaker(address,address)`
- PC address: 12179

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:366*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `refundStaker(address,address)`
- PC address: 12035

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:366*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `checkValidate(address,address,address)`
- PC address: 12779

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:160*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `validate(address,address,uint256,uint256,bool)`
- PC address: 14501

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:299*

```
project.state()
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `isStaker(address,address)`
- PC address: 15261

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:37*

```
project.tokenBalances(_staker)
```
## Message call to external contract
- Type: Warning
- Contract: ProjectLibrary
- Function name: `timesUp(address)`
- PC address: 15608

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ProjectLibrary.json:58*

```
Project(_projectAddress).nextDeadline()
```

Analysis result for ReputationRegistry:
# Analysis Results
## Exception state
- Type: Informational
- Contract: ReputationRegistry
- Function name: `_function_0x5d151b19`
- PC address: 7829

### Description
A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that assert() should only be used to check invariants. Use require() for regular input checking. The exception is triggered under the following conditions:

calldata_ReputationRegistry_0: 0x5d151b1900000000000000000000000000000000000000000000000000000000
calldatasize_ReputationRegistry: 0x4
storage_7: 0x0
callvalue: 0x0



In *ReputationRegistry.json:96*

```
totalSupply / totalUsers
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `claimTask(address,uint256,bytes32,uint256)`
- PC address: 2719

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:220*

```
project.weiCost()
```
## State change after external call
- Type: Warning
- Contract: ReputationRegistry
- Function name: `claimTask(address,uint256,bytes32,uint256)`
- PC address: 2829

### Description
The contract account state is changed after an external call. Consider that the called contract could re-enter the function before this state change takes place. This can lead to business logic vulnerabilities.

In *ReputationRegistry.json:221*

```
balances[msg.sender] -= reputationVal
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `claimTask(address,uint256,bytes32,uint256)`
- PC address: 2490

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:218*

```
project.reputationCost()
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `voteCommit(address,uint256,uint256,bytes32,uint256)`
- PC address: 3752

### Description
This contract executes a message call to an address found at storage slot 2. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:269*

```
plcrVoting.getAvailableTokens(msg.sender, 2)
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `voteCommit(address,uint256,uint256,bytes32,uint256)`
- PC address: 3383

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:267*

```
project.tasks(_index)
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `unstakeReputation(address,uint256)`
- PC address: 4690

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:195*

```
Project(_projectAddress).unstakeReputation(msg.sender, _reputation)
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `refundVotingReputation(uint256)`
- PC address: 5839

### Description
This contract executes a message call to an address found at storage slot 2. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:303*

```
plcrVoting.withdrawVotingRights(msg.sender, _reputation)
```
## State change after external call
- Type: Warning
- Contract: ReputationRegistry
- Function name: `refundVotingReputation(uint256)`
- PC address: 5929

### Description
The contract account state is changed after an external call. Consider that the called contract could re-enter the function before this state change takes place. This can lead to business logic vulnerabilities.

In *ReputationRegistry.json:304*

```
balances[msg.sender] += _reputation
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `proposeProject(uint256,uint256,string)`
- PC address: 6444

### Description
This contract executes a message call to an address found at storage slot 0. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:136*

```
distributeToken.totalSupply()
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `proposeProject(uint256,uint256,string)`
- PC address: 6137

### Description
This contract executes a message call to an address found at storage slot 0. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:133*

```
distributeToken.weiBal()
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `refundStaker(address)`
- PC address: 7703

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:318*

```
Project(_projectAddress).clearReputationStake(msg.sender)
```
## State change after external call
- Type: Warning
- Contract: ReputationRegistry
- Function name: `refundStaker(address)`
- PC address: 7808

### Description
The contract account state is changed after an external call. Consider that the called contract could re-enter the function before this state change takes place. This can lead to business logic vulnerabilities.

In *ReputationRegistry.json:319*

```
balances[msg.sender] += _refund * 3 / 2
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `stakeReputation(address,uint256)`
- PC address: 8181

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:180*

```
project.reputationCost()
```
## State change after external call
- Type: Warning
- Contract: ReputationRegistry
- Function name: `stakeReputation(address,uint256)`
- PC address: 8295

### Description
The contract account state is changed after an external call. Consider that the called contract could re-enter the function before this state change takes place. This can lead to business logic vulnerabilities.

In *ReputationRegistry.json:181*

```
balances[msg.sender] -= _reputation < repRemaining ? _reputation : repRemaining
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `stakeReputation(address,uint256)`
- PC address: 8046

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:180*

```
project.reputationStaked()
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `stakeReputation(address,uint256)`
- PC address: 8464

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:182*

```
Project(_projectAddress).stakeReputation(msg.sender, _reputation)
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `voteReveal(address,uint256,uint256,uint256)`
- PC address: 9663

### Description
This contract executes a message call to an address found at storage slot 2. This storage slot can be written to by calling the function 'init(address,address,address)'. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:295*

```
plcrVoting.revealVote(pollId, _voteOption, _salt)
```
## Message call to external contract
- Type: Warning
- Contract: ReputationRegistry
- Function name: `voteReveal(address,uint256,uint256,uint256)`
- PC address: 9340

### Description
This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied adresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.

In *ReputationRegistry.json:294*

```
project.tasks(_index)
```
## Integer Underflow
- Type: Warning
- Contract: ReputationRegistry
- Function name: `voteCommit(address,uint256,uint256,bytes32,uint256)`
- PC address: 3786

### Description
A possible integer underflow exists in the function voteCommit(address,uint256,uint256,bytes32,uint256).
The SUB instruction at address 3786 may result in a value < 0.

In *ReputationRegistry.json:273*

```
_reputation - availableTokens
```
## Integer Underflow
- Type: Warning
- Contract: ReputationRegistry
- Function name: `burnReputation(uint256)`
- PC address: 8810

### Description
A possible integer underflow exists in the function burnReputation(uint256).
The SUB instruction at address 8810 may result in a value < 0.

In *ReputationRegistry.json:332*

```
totalSupply -= _reputation
```

