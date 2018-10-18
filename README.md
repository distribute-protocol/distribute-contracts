# Distribute Smart Contracts [![Build Status](https://travis-ci.com/distribute-protocol/distribute-contracts.svg?branch=master)](https://travis-ci.com/distribute-protocol/distribute-contracts)

* [Protocol Overview](#protocol-overview)
* [Contracts](#contracts)
  * [Main Contract Summaries](#main-contract-summaries)
  * [Helper Contract Summaries](#helper-contract-summaries)
* [Actions](#actions)
  * [General Actions](#general-actions)
  * [Stage-Specific Actions](#stage-specific-actions)
* [Running Tests](#running-tests)

## Protocol Overview

The distribute protocol is an experiment in using smart contract-enabled token economies to decentralize the governance, maintenance, and financial support of public utilities and communal infrastructure.

Its multifaceted incentive structure ensures that:

1. collective public infrastructure projects receive sufficient funding from capital holders;
2. governance of the public utility is totally transparent;
3. direct decision making power in the public utility is decoupled from financial investment;
4. the infrastructure itself is created, maintained, and operated by those who directly benefit from it;
5. multiple utilities may interlock in the future to create a synergistic system of many distributed utilities and communal infrastructure projects.


### Main Contract Summaries

#### [DistributeToken.sol](../contracts/DistributeToken.sol)
Rinkeby: [0x14fc303a77f9b9687f8079ecfee70d70d16416c4](https://rinkeby.etherscan.io/address/0x14fc303a77f9b9687f8079ecfee70d70d16416c4)

The distribute token (DST) is continuously minted as the network gains more users, so there is no cap on the total number of tokens in circulation. The price of the token is determined by the total market share of the amount of tokens being minted or sold. The user exchanges ether (ETH) for tokens and then the ETH is held in the distribute token contract. Any function that involves minting, selling, transferring, or burning tokens goes through DistributeToken.sol. Minting and selling tokens can be called directly by the user while burning and transferring tokens are called by the token registry or reputation registry that the contract was initialized with. DST is based on a standard EIP20 token and uses EIP20.sol to import basic token functionality and EIP20Interface.sol to import a getter function for the total supply of tokens.

#### [TokenRegistry.sol](../contracts/TokenRegistry.sol)
Rinkeby: [0xa5a25c7427ac407ffddda903804a99fc63dfdc24](https://rinkeby.etherscan.io/address/0xa5a25c7427ac407ffddda903804a99fc63dfdc24)

The token registry is the central contract by which the distribute protocol's users perform actions using tokens in the various stages of a project. It is the contract through which users are given the ability to propose projects using tokens. Users may also stake their tokens on projects, come to consensus on which tasks to perform, vote on completed tasks and more.

#### [ReputationRegistry.sol](../contracts/ReputationRegistry.sol)
Rinkeby: [0x86bdbb4b05df61d146e46fefa956cef5f00be61e](https://rinkeby.etherscan.io/address/0x86bdbb4b05df61d146e46fefa956cef5f00be61e)

The reputation registry is the central contract for the distribute protocol to manage the reputation balances of each user. It is the contract through which users are given the ability to propose projects using reputation. Users may also stake their reputation on projects, come to consensus on which tasks to perform, then claim tasks, and subsequent task rewards, vote on completed tasks and more.

#### [ProjectRegistry.sol](../contracts/ProjectRegistry.sol)
Rinkeby: [0x35ceb91961bd66786c5492f1bd1409d14396f929](https://rinkeby.etherscan.io/address/0x35ceb91961bd66786c5492f1bd1409d14396f929)

The project registry manages and records the state of projects and allows for the user to interact with projects by creating projects, add tasks after the project has been staked, submit hashed task lists to finalize the tasks for a project, claim tasks, and submit completed tasks for validation. The project registry contract provides a way for the user to manage the information in each project and return information to the token and reputation registries. The project registry does not initialize any projects, just handles the information within a project and the state of the projects. ProjectRegistry.sol calls ProjectLibrary.sol to check what stage a project is in and tell the token registry or reputation registry to burn tokens and reputation if needed.

#### [ProjectLibrary.sol](../contracts/ProjectLibrary.sol)
Rinkeby: [0x7c5d0c44028917f013a12327da45fa350652015c](https://rinkeby.etherscan.io/address/0x7c5d0c44028917f013a12327da45fa350652015c)

The project library manages interactions with a project by acting as library with functions that can be imported. ProjectLibrary.sol records how a project is staked, the time a project has till it expires, the staking power a user has on an individual project, supports validation functionality, allows for a worker to claim their reward after completing a task, and refunds any user who staked reputation or tokens. Along with providing these function, the project library has functions that do the actual state checking of a project to return to the project registry.

#### [Project.sol](../contracts/Project.sol)
Rinkeby (main contract): [0xfeafacc324f775a1ffc0333f883ee44a658fe573](https://rinkeby.etherscan.io/address/0xfeafacc324f775a1ffc0333f883ee44a658fe573)

The project contract manages each individual project and holds in the information recorded from ProjectRegistry.sol. As a project is proposed a new project contract is created to manage interactions with a unique project. Nothing in Project.sol can be directly called by the user and instead all calls go through the three registries. As staking, task claiming, and validation occurs, the users participating in these actions are recorded on each project with the amount of tokens or reputation staked by them.

In order to reduce gas use, we deploy projects through a proxy, using AssertBytes.sol and BytesLib.sol.

#### [Task.sol](../contracts/Task.sol)
Rinkeby (main contract): [0xb9422d692b425cffc2260944b8192a03d229b543](https://rinkeby.etherscan.io/address/0xb9422d692b425cffc2260944b8192a03d229b543)

Task contracts are instantiated for single tasks in every project to keep track of information such as its weighting, whether it has been completed, validation status, and more.

### Helper Contract Summaries

#### [PLCRVoting.sol](../contracts/library/PLCRVoting.sol)
Rinkeby: [0x15ce86d4278e86619c9354d109befeba5acea07a](https://rinkeby.etherscan.io/address/0x15ce86d4278e86619c9354d109befeba5acea07a)

This is an extension of the [Partial-Lock-Commit-Reveal Voting scheme with ERC20 tokens](https://github.com/ConsenSys/PLCRVoting) that includes non-ERC20 tokens.

#### [SafeMath.sol](../contracts/library/SafeMath.sol)
SafeMath.sol helps the distribute protocol deal with unsigned integer overflow issues as the Ethereum Virtual Machine allows mathematical operations to overflow the maximum integer value it can handle, resulting in incorrect calculations.

#### [Division.sol](../contracts/library/Division.sol)
Division.sol allows for the distribute protocol to use division, because Ethereum has not implemented floating point numbers. The function in Division.sol rounds up to the degree of precision needed for a specific task.

#### [ProxyFactory.sol](../contracts/library/ProxyFactory.sol)
Allows us to create new proxy contracts and execute a message call to the new proxy within one transaction.

## Actions

### General Actions

#### Minting Tokens

Users can mint tokens at any time so long as they have enough ether to do so. Minting happens in a continuous fashion proportional to the market share the user is attempting to purchase.

```
let numTokens = 100
distributeToken.mint(numTokens)
```
[diagram TBD]

#### Selling Tokens

Users can sell their tokens at any time. Tokens are priced proportionally to the market share of the amount of tokens being sold.
```
let numTokens = 100
distributeToken.sell(numTokens)
```
[diagram TBD]

#### Registering as a Worker
Users can register as workers and receive 10,000 reputation as new members.
```
reputationRegistry.register()
```
[diagram TBD]

### Stage-Specific Actions

#### 0 - Proposal

Any user may propose a potential project to the Distribute Protocol community by first estimating the total cost (in wei) of the project from start to finish and broadcasting this to the Distribute community.

However, to be able to propose a project, the proposer must have at least 5% of the proposed cost in either reputation or tokens.

Proposers must also identify a staking period, by the end of which members of the community (stakers) must stake sufficient tokens or reputation at least up to the amount determined by the proposer of the project. If a project does not have enough stakers by the end of the stated staking period, the project is not successfully proposed and the proposer's collateral tokens or reputation are burned and the project expires (and moves to Stage 8: Expired). If it does, then a project is considered successfully proposed and moves to the Staking stage.

##### Propose a Project with Tokens
This is handled by TokenRegistry.sol
```
let _cost = 100
let _stakingPeriod = 1 week
let _ipfsHash = 'ipfsHashlalalalalalalalalalalalalalalalalalala'
tokenRegistry.proposeProject(_cost, _stakingPeriod, _ipfsHash)
```
[diagram TBD]

##### Propose a Project with Reputation
This is handled by ReputationRegistry.sol.
```
let _cost = 100
let _stakingPeriod = 1 week
let _ipfsHash = 'ipfsHashlalalalalalalalalalalalalalalalalalala'
reputationRegistry.proposeProject( _cost, _stakingPeriod, _ipfsHash)
```
[diagram TBD]

A project expecting to spend a certain proportion of the current ETH pool requires stakes equal to that proportion in both capital and reputation. That is, a project costing 20% of the current ETH pool, requires the stake of 20% of tokens in circulation and 20% of the total market reputation.

#### 1 - Staking

##### Staking Tokens
These members have an interest in seeing the project follow through because they will lose tokens if the project fails.
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
let _tokens = 100
tokenRegistry.stakeTokens(_projectAddress, _tokens)
```
[diagram TBD]  

##### Staking Reputation
These members have an interest in seeing the project follow through because they will lose reputation if the project fails.
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
let _reputation = 100
reputationRegistry.stakeReputation(_projectAddress, _reputation)
```
[diagram TBD]

##### Unstaking Tokens
A staker may change their mind about staking their tokens on a project and decide to unstake those tokens as long as the staking period has not ended.
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
let _tokens = 100
tokenRegistry.unstakeTokens(_projectAddress, _tokens)
```
[diagram TBD]

##### Unstaking Reputation
A staker may change their mind about staking their reputation to a project and decide to unstake their tokens as long as the staking period has not ended.
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
let _reputation = 100
reputationRegistry.unstakeReputation(_projectAddress, _reputation)
```
[diagram TBD]

#### * State Change - Check Staked
Project.sol records whether a proposed project should move to the next stage using the checkStaked() function outlined in ProjectLibrary.sol. This function checks if the project at the stated address is fully staked with both reputation and tokens. If the project is fully staked, the project moves to stage 2: Staked, and the next deadline (for the submission of a complete task list) is set. If the staking period has ended and the project has not been fully staked, the project expires (stage 8).
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
projectRegistry.checkStaked(_projectAddress)
```
[diagram TBD]

#### 2 - Staked Project
Once a project is successfully staked, the proposer is rewarded with 1% of the project cost and gets their collateral tokens back.
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
tokenRegistry.refundProposer(_projectAddress)
```
OR
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
reputationRegistry.refundProposer(_projectAddress)
```
[diagram TBD]

##### Submit Hashed Task List
After a project has been fully staked and is in the staked stage, stakers need to collaborate off-chain to determine a task list for the project. At any time in the staked stage, stakers need to submit a hashed task list that they believe fully encompasses what needs to get done to complete the project and assigns the correct ETH value to reward the worker and purchase any supplies needed for the task. Once every staker submits their hashed list, the final task list is determined by the highest proportion of tokens and reputation staked. The first staker who submitted the winning task hash is deemed the originator, and will be rewarded if the project becomes complete.

To submit a list of tasks:
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
let _taskArray = [{description: 'blah', weighting: 90}, {description: 'blahblah', weighting: 10}]
let taskHash = hashTaskArrayFunction(_taskArray)   // calculated by the frontend
projectRegistry.addTaskHash(_projectAddress, taskHash)
```
[diagram TBD]

#### * State Change - Check Active
If a task hash exists for the project then the project moves to stage 3-Active Project and a new deadline is set. If no task hash exists after the current deadline is met, the project is moved to stage 7-Failed.
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
projectRegistry.checkActive(_projectAddress)
```
[diagram TBD]

#### 3 - Active Project


##### Submit Task List
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
let _taskArray = [{description: 'blah', weighting: 90}, {description: 'blahblah', weighting: 10}]
projectRegistry.submitTaskList(_projectAddress, _taskArray)
```
[diagram TBD]

Once the task list is submitted, each item in this hashed array of tasks instantiates its own task contract, which is handled by Task.sol. Using Task.sol, users may view the weighting of the task (as set by the stakers in the previous stage), see the reward for completing the task, as well as whether or not it has been claimed yet, or if it has been completed.

##### Claim/Reclaim Task
A user can claim available tasks on a project for a specific period of time by staking the predetermined amount of reputation token on it. This effectively allows the user to 'claim' a task, and by staking their reputation on it, are now held accountable to completing the task. If a user claims a task and then fails to complete it after a certain period of time depending, it becomes available again for another worker to reclaim. If they fail to complete the task before the expiration or not get validated, the user loses their staked reputation. The amount of reputation required to claim a task increases with the difficulty/how critical a task. This was decided by the stakers when they submitted their task lists.

To claim a task:
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
let _index = 0
let _taskDescription = 'blah'
let _weighting = '90'
reputationRegistry.claimTask(_projectAddress, _index, _taskDescription, _weighting)
```
[diagram TBD]

##### Mark Task Complete
Once a user finishes a task they can mark it complete so that the task can be validated. A user can submit proof of the task being completed (i.e. images of the final product, packets received by a new node).
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
let _index = 0
projectRegistry.markTaskComplete(_projectAddress, _index)
```
[diagram TBD]

#### * State Change - Check Validate
Once all of the tasks in a project are marked complete or the project has expired, the project changes state to 4-Validating. ProjectRegistry.checkValidate() calls ProjectLibrary.checkValidate() and returns the state to Project.setState() .
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
projectRegistry.checkValidate(_projectAddress)
```
[diagram TBD]

#### 4 - Validating Project

##### Validate Yes/No with Tokens
If the task is marked complete by the user completing it, it is then up for validation by the network, which validates whether or not the task has been completed sufficiently. As long as the validator has at least `validationEntryFee` tokens, they will be allowed to validate the task.
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
let _index = 0
let _validationState = true
tokenRegistry.validateTask(_projectAddress, _index, _validationState)
```
[diagram TBD]

#### * State Change - Check Voting
After the voting deadline finishes ProjectRegistry.checkVoting() calls ProjectLibrary.checkVoting() which then iterates through the task list of the project and checks to see if there are any contested validations, and Project.setState() changes the state of the project to 5-Voting. If the validation of a task is contested, a PLCR voting contract is opened for any token holder or reputation holder to vote on, not just stakers on that project. If validation is uncontested then the reward is marked as claimable for the validators and the worker if the task was validated as completed. If the task was not completed the ETH for the task is returned back to the total pool in the network.
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
projectRegistry.checkVoting(_projectAddress)
```
[diagram TBD]

#### 5 - Voting Project
If the community is not able to come to a consensus on whether or not certain tasks have been completed, the decision goes to a vote. This vote is proportionally representative. The greater the voter's proportion of the stake in the project, the more their vote counts on the outcome of the validation of the task list.
Users may also withdraw their vote from the PLCR voting contract until the voting period ends.

##### Vote Yes/No with tokens
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
let _index = 0
let _tokens = 100
let _salt = 15   // calculated by the frontend
let _voteOption = true
let _secretHash = secretHashFunction(_salt, _voteOption)   // calculated by the frontend
let _prevPollID = 7	// calculated by the frontend
tokenRegistry.voteCommit(_projectAddress, _index, _tokens, _secretHash, _prevPollID)
```
[diagram TBD]
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
let _index = 0
let _voteOption = true
let _salt = 15	// stored by the frontend
tokenRegistry.voteReveal(_projectAddress, _index, _voteOption, _salt)
```
[diagram TBD]

##### Vote Yes/No with Reputation
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
let _index = 0
let _reputation = 100
let _salt = 15   // calculated by the frontend
let _voteOption = true
let _secretHash = secretHashFunction(_salt, _voteOption)   // calculated by the frontend
let _prevPollID = 7	// calculated by the frontend
reputationRegistry.voteCommit(_projectAddress, _index, _reputation, _secretHash, _prevPollID)
```
[diagram TBD]
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
let _index = 0
let _voteOption = true
let _salt = 15	// stored by the frontend
reputationRegistry.voteReveal(_projectAddress, _index, _voteOption, _salt)
```
[diagram TBD]

#### * State Change - Check End
Once the contested tasks have been voted on or if all of the tasks were uncontested, ProjectRegistry.checkEnd() calls ProjectLibrary.checkEnd() to see the result of the PLCR voting contracts for each task.

Once the poll is over, if the task was validated as complete, then the reward is marked claimable for the correct validators and the worker who completed it. If the task is not validated as complete, the ETH for the task is returned back to the total pool in the network. The amount of tasks that passed are calculated, and if the minimum number of tasks were validated, then the project moves to stage 6-Complete. If the minimum was not met, then the project moves to stage 7-Failed.
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
projectRegistry.checkEnd(_projectAddress)
```
[diagram TBD]

#### 6 - Complete Project
When a project reaches stage 6- Complete, all stakers (reputation and token holders) regain their stake, positive validators are rewarded for correct validation of tasks, negative validators lose half of the tokens they validated with, and originators are rewarded for originating the winning task hash.

##### Refund Staker
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
tokenRegistry.refundStaker(_projectAddress)
```
[diagram TBD]

```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
reputationRegistry.refundStaker(_projectAddress)
```
[diagram TBD]

##### Reward Validator
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
let _index = 0
tokenRegistry.rewardValidator(_projectAddress, _index)
```
[diagram TBD]

##### Refund Voting Tokens/Reputation
```
let _tokens = 100
tokenRegistry.refundVotingTokens(_tokens)
```
[diagram TBD]

```
let _tokens = 100
reputationRegistry.refundVotingReputation(_reputation)
```
[diagram TBD]

##### Reward Worker
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
let _index = 0
reputationRegistry.rewardTask(_projectAddress, _index)
```
[diagram TBD]

##### Reward Originator
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
tokenRegistry.rewardOriginator(_projectAddress)
```
[diagram TBD]

#### 7 - Failed Project
Some of the actions in stage 6 still apply.

If a **task** fails, the associated wei needed to complete it is returned to the collective pool from the project contract's balance. Validators who correctly marked the task as incomplete are rewarded. The reputation staked by the worker who failed to complete the task are burned.

If a **project** fails, validators who validated tasks correctly and workers who completed their tasks still receive rewards. However, validators who validated a task incorrectly lose half of the tokens they used to validate that task and all the stakers' tokens are burned.

#### 8 - Expired Project
If a project does not receive enough stakes before the set deadline, then the project expires. The proposer who put tokens or reputation as collateral lose them, but stakers on the project can retrieve their stakes.  

##### Refund Staker
```
let _projectAddress = '0x0b239F63eC6248162c7F19B0B2956186725eb321'
tokenRegistry.refundStaker(_projectAddress)
```
[diagram TBD]

## Running Tests

To run the full test suite, open a tab and run
```
truffle test
```
