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
