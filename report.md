# Analysis results for Division.json

## Exception state

- Type: Informational
- Contract: Unknown
- Function name: `fallback`
- PC address: 187

### Description

A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that `assert()` should only be used to check invariants. Use `require()` for regular input checking.
In file: Division.json:9

### Code

```
numerator / _denominator
```

# Analysis result for DLL

No issues found.
# Analysis results for AttributeStore.json

## Integer Overflow 

- Type: Warning
- Contract: Unknown
- Function name: `_function_0x50389f5c`
- PC address: 149

### Description

A possible integer overflow exists in the function `_function_0x50389f5c`.
The addition or multiplication may result in a value higher than the maximum representable integer.
In file: AttributeStore.json:8

### Code

```
function getAttribute(Data storage self, bytes32 _UUID, string _attrName) public view returns (uint) {
        bytes32 key = keccak256(abi.encodePacked(_UUID, _attrName));
        return self.store[key];
    }
```

# Analysis results for PLCRVoting.json

## Integer Overflow 

- Type: Warning
- Contract: Unknown
- Function name: `_function_0x32ed3d60`
- PC address: 3070

### Description

A possible integer overflow exists in the function `_function_0x32ed3d60`.
The addition or multiplication may result in a value higher than the maximum representable integer.
In file: PLCRVoting.json:283

### Code

```
pollNonce + 1
```

## Integer Overflow 

- Type: Warning
- Contract: Unknown
- Function name: `_function_0x32ed3d60`
- PC address: 3091

### Description

A possible integer overflow exists in the function `_function_0x32ed3d60`.
The addition or multiplication may result in a value higher than the maximum representable integer.
In file: PLCRVoting.json:286

### Code

```
block.timestamp + _commitDuration
```

## Integer Overflow 

- Type: Warning
- Contract: Unknown
- Function name: `_function_0x32ed3d60`
- PC address: 3100

### Description

A possible integer overflow exists in the function `_function_0x32ed3d60`.
The addition or multiplication may result in a value higher than the maximum representable integer.
In file: PLCRVoting.json:287

### Code

```
block.timestamp + _commitDuration
```

## Integer Overflow 

- Type: Warning
- Contract: Unknown
- Function name: `_function_0x32ed3d60`
- PC address: 3101

### Description

A possible integer overflow exists in the function `_function_0x32ed3d60`.
The addition or multiplication may result in a value higher than the maximum representable integer.
In file: PLCRVoting.json:287

### Code

```
block.timestamp + _commitDuration + _revealDuration
```

# Analysis results for DistributeToken.json

## Integer Overflow 

- Type: Warning
- Contract: Unknown
- Function name: `transferFrom(address,address,uint256)`
- PC address: 2855

### Description

A possible integer overflow exists in the function `transferFrom(address,address,uint256)`.
The addition or multiplication may result in a value higher than the maximum representable integer.
In file: DistributeToken.json:61

### Code

```
  @param _reputationReg
```

# Analysis results for Project.json

## Exception state

- Type: Informational
- Contract: Unknown
- Function name: `setTaskAddress(address,uint256)`
- PC address: 3655

### Description

A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that `assert()` should only be used to check invariants. Use `require()` for regular input checking.
In file: Project.json:288

### Code

```
tasks[_index]
```

# Analysis result for Task

No issues found.
# Analysis result for SafeMath

No issues found.
# Analysis results for SpoofedRR.json

## Message call to external contract

- Type: Warning
- Contract: Unknown
- Function name: `_function_0xcbc3582c`
- PC address: 405

### Description

This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied addresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.
In file: SpoofedRR.json:14

### Code

```
Project(_projAddr).stakeReputation(_staker, _reputation)
```

# Analysis result for ProjectRegistry

No issues found.
# Analysis result for BytesLib

No issues found.
# Analysis results for TokenRegistry.json

## Message call to external contract

- Type: Warning
- Contract: Unknown
- Function name: `voteCommit(address,uint256,uint256,bytes32,uint256)`
- PC address: 1907

### Description

This contract executes a message call to an address found at storage slot 0. This storage slot can be written to by calling the function `init(address,address,address)`. Generally, it is not recommended to call user-supplied addresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.
In file: TokenRegistry.json:261

### Code

```
projectRegistry.projects(_projectAddress)
```

## Multiple Calls

- Type: Information
- Contract: Unknown
- Function name: `voteCommit(address,uint256,uint256,bytes32,uint256)`
- PC address: 1907

### Description

Multiple sends exist in one transaction, try to isolate each external call into its own transaction. As external calls can fail accidentally or deliberately.
Consecutive calls: 
Call at address: 2091
In file: TokenRegistry.json:261

### Code

```
projectRegistry.projects(_projectAddress)
```

## Transaction order dependence

- Type: Warning
- Contract: Unknown
- Function name: `voteCommit(address,uint256,uint256,bytes32,uint256)`
- PC address: 1907

### Description

A possible transaction order independence vulnerability exists in function voteCommit(address,uint256,uint256,bytes32,uint256). The value or direction of the call statement is determined from a tainted storage location
In file: TokenRegistry.json:261

### Code

```
projectRegistry.projects(_projectAddress)
```

## Message call to external contract

- Type: Warning
- Contract: Unknown
- Function name: `voteCommit(address,uint256,uint256,bytes32,uint256)`
- PC address: 2091

### Description

This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied addresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.
In file: TokenRegistry.json:262

### Code

```
Project(_projectAddress).tasks(_index)
```

## Message call to external contract

- Type: Warning
- Contract: Unknown
- Function name: `_function_0x57376198`
- PC address: 4969

### Description

This contract executes a message call to an address found at storage slot 0. This storage slot can be written to by calling the function `init(address,address,address)`. Generally, it is not recommended to call user-supplied addresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.
In file: TokenRegistry.json:325

### Code

```
projectRegistry.projects(_projectAddress)
```

## Transaction order dependence

- Type: Warning
- Contract: Unknown
- Function name: `_function_0x57376198`
- PC address: 4969

### Description

A possible transaction order independence vulnerability exists in function _function_0x57376198. The value or direction of the call statement is determined from a tainted storage location
In file: TokenRegistry.json:325

### Code

```
projectRegistry.projects(_projectAddress)
```

## Message call to external contract

- Type: Warning
- Contract: Unknown
- Function name: `refundStaker(address)`
- PC address: 5792

### Description

This contract executes a message call to an address found at storage slot 0. This storage slot can be written to by calling the function `init(address,address,address)`. Generally, it is not recommended to call user-supplied addresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.
In file: TokenRegistry.json:310

### Code

```
projectRegistry.projects(_projectAddress)
```

## Transaction order dependence

- Type: Warning
- Contract: Unknown
- Function name: `refundStaker(address)`
- PC address: 5792

### Description

A possible transaction order independence vulnerability exists in function refundStaker(address). The value or direction of the call statement is determined from a tainted storage location
In file: TokenRegistry.json:310

### Code

```
projectRegistry.projects(_projectAddress)
```

# Analysis results for EIP20.json

## Integer Overflow 

- Type: Warning
- Contract: Unknown
- Function name: `transferFrom(address,address,uint256)`
- PC address: 2003

### Description

A possible integer overflow exists in the function `transferFrom(address,address,uint256)`.
The addition or multiplication may result in a value higher than the maximum representable integer.
In file: EIP20.json:50

### Code

```
balances[_to] += _value
```

# Analysis results for ProjectLibrary.json

## Message call to external contract

- Type: Warning
- Contract: Unknown
- Function name: `calculateWeightOfAddress(address,address)`
- PC address: 4004

### Description

This contract executes a message call to an address provided as a function argument. Generally, it is not recommended to call user-supplied addresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.
In file: ProjectLibrary.json:80

### Code

```
project.reputationStaked()
```

# Analysis results for ReputationRegistry.json

## Integer Overflow 

- Type: Warning
- Contract: Unknown
- Function name: `register()`
- PC address: 2560

### Description

A possible integer overflow exists in the function `register()`.
The addition or multiplication may result in a value higher than the maximum representable integer.
In file: ReputationRegistry.json:115

### Code

```
totalSupply += initialRepVal
```

## Integer Overflow 

- Type: Warning
- Contract: Unknown
- Function name: `register()`
- PC address: 2577

### Description

A possible integer overflow exists in the function `register()`.
The addition or multiplication may result in a value higher than the maximum representable integer.
In file: ReputationRegistry.json:116

### Code

```
totalUsers += 1
```

## Message call to external contract

- Type: Warning
- Contract: Unknown
- Function name: `claimTask(address,uint256,bytes32,uint256)`
- PC address: 2854

### Description

This contract executes a message call to an address found at storage slot 1. This storage slot can be written to by calling the function `init(address,address,address)`. Generally, it is not recommended to call user-supplied addresses using Solidity's call() construct. Note that attackers might leverage reentrancy attacks to exploit race conditions or manipulate this contract's state.
In file: ReputationRegistry.json:231

### Code

```
projectRegistry.projects(_projectAddress)
```

## Transaction order dependence

- Type: Warning
- Contract: Unknown
- Function name: `claimTask(address,uint256,bytes32,uint256)`
- PC address: 2854

### Description

A possible transaction order independence vulnerability exists in function claimTask(address,uint256,bytes32,uint256). The value or direction of the call statement is determined from a tainted storage location
In file: ReputationRegistry.json:231

### Code

```
projectRegistry.projects(_projectAddress)
```

# Analysis result for Ownable

No issues found.
# Analysis results for ProxyFactory.json

## Integer Overflow 

- Type: Warning
- Contract: Unknown
- Function name: `_function_0x61b69abd`
- PC address: 147

### Description

A possible integer overflow exists in the function `_function_0x61b69abd`.
The addition or multiplication may result in a value higher than the maximum representable integer.
In file: ProxyFactory.json:51

### Code

```
eateProxy(address _target, bytes _data)
        public
        returns (address proxyContract)
    {
        proxyContract = createProxyImpl(_target, _data);

        emit ProxyDeployed(proxyContract, _target);
    }

    funct
```

## Integer Overflow 

- Type: Warning
- Contract: Unknown
- Function name: `_function_0x7b8b82a8`
- PC address: 358

### Description

A possible integer overflow exists in the function `_function_0x7b8b82a8`.
The addition or multiplication may result in a value higher than the maximum representable integer.
In file: ProxyFactory.json:39

### Code

```
eateManyProxies(uint256 _count, address _target, bytes _data)
        public
    {
        address[] memory proxyAddresses = new address[](_count);

        for (uint256 i = 0; i < _count; ++i) {
            proxyAddresses[i] = createProxyImpl(_target, _data);
        }

        emit ProxiesDeployed(proxyAddresses, _target);
    }

    funct
```

## Integer Overflow 

- Type: Warning
- Contract: Unknown
- Function name: `_function_0x7b8b82a8`
- PC address: 881

### Description

A possible integer overflow exists in the function `_function_0x7b8b82a8`.
The addition or multiplication may result in a value higher than the maximum representable integer.
In file: ProxyFactory.json:48

### Code

```
oyed(proxyAddresses, _target);
    }

  
```

