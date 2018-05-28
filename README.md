# Distribute

## Overall Summary

##### An experiment in using smart contract-enabled token economies to decentralize the governance, maintenance, and financial support of public utilities, communal infrastructure, and common pool resources.

The desired outcome of Distribute is a multifaceted incentive structure that makes sure that:

1. collective public infrastructure projects receive sufficient funding from capital holders;
2. governance of the public utility is totally transparent;
3. direct decision making power in the public utility is decoupled from financial investment;
4. the infrastructure itself is created, maintained, and operated by those who directly benefit from it;
5. multiple utilities may interlock in the future to create a synergistic system of many distributed utilities and communal infrastructure projects.

## Contract Summaries

### Core Contract Summaries

#### DistributeToken.sol

In here, reference EIP20.sol & EIP20Interface.sol

#### TokenRegistry.sol

#### ReputationRegistry.sol

#### ProjectRegistry.sol

#### ProjectLibrary.sol

#### Project.sol

In here, discuss proxy creation (AssertBytes.sol, BytesLib.sol)

#### Task.sol

### Helper Contract Summaries

#### PLCRVoting.sol

In here, reference AttributeStore.sol and DLL.sol

#### SafeMath.sol

#### Division.sol

#### ProxyFactory.sol

## Actions

### General Actions

#### Minting Tokens

Users can mint tokens at any time so long as they have enough ether to do so. Minting happens in a continuous fashion proportional to the market share the user is attempting to purchase.

```
numTokens = 100
distributeToken.mint(100)  
```

[put diagram here eventually]

#### Selling Tokens

#### Registering as a Worker

### Stage-Specific Actions

#### 0 - Proposal

##### Propose a Project w/Tokens

##### Propose a Project w/Reputation

#### 1 - Proposed

##### Stake Tokens

Maybe we put diagrams here eventually

##### Unstake Tokens

##### Stake Reputation

##### Unstake Reputation

#### * State Change: checkStaked()

#### 2 - Staked Project

##### Submit Hashed Task List

Implicit vote on list with highest stake

#### * State Change: checkActive()

#### 3 - Active Project

##### Submit Task List

Task contracts are created

##### Claim/Reclaim Task

##### Mark Task Complete

#### * State Change: checkValidate()

#### 4 - Validating

##### Validate Yes/No w/Tokens

#### * State Change: checkVoting()

#### 5 - Voting

##### Vote Yes/No w/Tokens

##### Vote Yes/No w/Reputation

#### * State Change: checkEnd()

#### 6 - Complete

##### Stakers can pull their stakes out & rewarded

##### validators can get their reward (task-specific)

##### Voters get their tokens/rep back

##### Workers who completed tasks can get their reward

#### 7 - Failed

##### validators can get their reward (task-specific)

##### Voters get their tokens/rep back

##### Workers who completed tasks can get their reward

#### 8 - Expired

##### stakers can pull their stake out

##### proposer loses their stake
