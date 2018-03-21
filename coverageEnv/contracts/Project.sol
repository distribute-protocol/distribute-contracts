pragma solidity ^0.4.19;

import "./ProjectRegistry.sol";
import "./ReputationRegistry.sol";
import "./Task.sol";
import "./library/SafeMath.sol";
import "./library/Division.sol";

/**
@title An individual project in the distribute DAO system
@author Team: Jessica Marshall, Ashoka Finley
@notice This contract is used to manage the state of all project related parameters while also
maintaining a wei balance to be used in the case of reward. The project can be in 8 state represented by
integers. They are as follows: [1: Proposed, 2: Staked, 3: Active, 4: Validation, 5: Voting, 6: Complete,
7: Failed, 8: Expired]
@dev This contract is managed and deployed by a Project Registry contract, and must be initialized
with a ReputationRegistry and TokenRegistry for full control.
*/
contract Project {event __CoverageProject(string fileName, uint256 lineNumber);
event __FunctionCoverageProject(string fileName, uint256 fnId);
event __StatementCoverageProject(string fileName, uint256 statementId);
event __BranchCoverageProject(string fileName, uint256 branchId, uint256 locationIdx);
event __AssertPreCoverageProject(string fileName, uint256 branchId);
event __AssertPostCoverageProject(string fileName, uint256 branchId);


    using SafeMath for uint256;

    // =====================================================================
    // STATE VARIABLES
    // =====================================================================

    address tokenRegistryAddress;
    address reputationRegistryAddress;
    address projectRegistryAddress;

    uint256 public state;

    /*
    POSSIBLE PROJECT STATES
        1: Proposed,
        2: Staked,
        3: Active,
        4: Validation,
        5: Voting,
        6: Complete,
        7: Failed,
        8: Expired
    */

    uint256 public stakedStatePeriod = 1 weeks;
    uint256 public activeStatePeriod = 2 weeks;
    uint256 public turnoverTime = 1 weeks;
    uint256 public validateStatePeriod = 1 weeks;
    uint256 public voteCommitPeriod = 1 weeks;
    uint256 public voteRevealPeriod = 1 weeks;
    uint256 public passThreshold = 100;

    address public proposer;
    uint256 public proposerType;
    uint256 public proposerStake;
    uint256 public stakingPeriod;
    uint256 public weiBal;
    uint256 public nextDeadline;
    uint256 public weiCost;
    uint256 public reputationCost;
    string public ipfsHash;

    uint256 public tokensStaked;
    uint256 public reputationStaked;
    mapping (address => uint) public tokenBalances;
    mapping (address => uint) public reputationBalances;

    address[] public tasks;

    uint256 public passAmount;

    // =====================================================================
    // MODIFIERS
    // =====================================================================

    modifier onlyPR() {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',1);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',77);
        __AssertPreCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',1);
 __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',1);
require(msg.sender == projectRegistryAddress);__AssertPostCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',1);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',78);
        _;
    }

    modifier onlyTR() {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',2);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',82);
        __AssertPreCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',2);
 __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',2);
require(msg.sender == tokenRegistryAddress);__AssertPostCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',2);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',83);
        _;
    }

    modifier onlyRR() {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',3);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',87);
        __AssertPreCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',3);
 __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',3);
require(msg.sender == reputationRegistryAddress);__AssertPostCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',3);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',88);
        _;
    }

    function isTR(address _sender) public  returns (bool) {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',4);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',92);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',4);
return _sender == tokenRegistryAddress
            ? true
            : false;
    }

    function isRR(address _sender) public  returns (bool) {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',5);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',98);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',5);
return _sender == reputationRegistryAddress
            ? true
            : false;
    }

    // =====================================================================
    // CONSTRUCTOR
    // =====================================================================

    /**
    @dev Initialize a Project with a Reputation Registry and a Token Registry, and all related project values.
    @param _cost The total cost of the project in wei
    @param _costProportion The proportion of the project cost divided by theDistributeToken weiBal
    represented as integer
    @param _stakingPeriod The length of time this project is open for staking
    @param _proposer The address of the user proposing the project
    @param _proposerType Denotes if a proposer is using reputation or tokens,
    value must be 1: tokens or 2: reputation
    @param _proposerStake The amount of reputation or tokens needed to create the proposal
    @param _ipfsHash The ipfs hash of the full project description
    @param _reputationRegistry Address of the Reputation Registry
    @param _tokenRegistry Address of the contract system Token Registry
    */
    function Project(
        uint256 _cost,
        uint256 _costProportion,
        uint256 _stakingPeriod,
        address _proposer,
        uint256 _proposerType,
        uint256 _proposerStake,
        string _ipfsHash,
        address _reputationRegistry,
        address _tokenRegistry
    ) public {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',6);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',132);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',6);
reputationRegistryAddress = _reputationRegistry;
__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',133);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',7);
tokenRegistryAddress = _tokenRegistry;
__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',134);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',8);
projectRegistryAddress = msg.sender;
__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',135);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',9);
weiCost = _cost;
__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',136);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',10);
reputationCost = _costProportion * ReputationRegistry(_reputationRegistry).totalSupply() / 10000000000;
__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',137);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',11);
state = 1;
__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',138);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',12);
nextDeadline = _stakingPeriod;
__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',139);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',13);
proposer = _proposer;
__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',140);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',14);
proposerType = _proposerType;
__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',141);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',15);
proposerStake = _proposerStake;
__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',142);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',16);
ipfsHash = _ipfsHash;
    }

    // =====================================================================
    // FALLBACK
    // =====================================================================

    function() public payable {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',7);
}

    // =====================================================================
    // GETTERS
    // =====================================================================
    /**
    @notice The amount of tasks created in the project during the Staked period.
    @dev Helper function used by the project library
    @return The number of tasks in the task array
    */
    function getTaskCount() public  returns (uint256) {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',8);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',160);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',17);
return tasks.length;
    }

    // =====================================================================
    // SETTERS
    // =====================================================================

    /**
    @notice Set the project state to `_state`, and update the nextDeadline to `_nextDeadline`
    @dev Only callable by the Project Registry initialized during construction
    @param _state The state to update the project to
    @param _nextDeadline The nextDeadline to transition project to the next state
    */
    function setState(uint256 _state, uint256 _nextDeadline) public onlyPR {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',9);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',174);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',18);
state = _state;
__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',175);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',19);
nextDeadline = _nextDeadline;
    }

    /**
    @notice Clears the proposer stake on proposal expiration
    @dev Only callable by the Project Registry initialized during construction
    */
    function clearProposerStake() public onlyPR {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',10);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',183);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',20);
proposerStake = 0;
    }

    /**
    @notice Clear the token stake of `_staker`, used during stake claiming
    @dev Only callable by the Token Registry initialized during construction
    @param _staker Address of the staker
    */
    function clearTokenStake(address _staker) public onlyTR {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',11);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',192);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',21);
tokenBalances[_staker] = 0;
    }

    /**
    @notice Clear the reputation stake of `_staker`, used during stake claiming
    @dev Only callable by the Reputation Registry initialized during construction
    @param _staker Address of the staker
    */
    function clearReputationStake(address _staker) public onlyRR {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',12);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',201);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',22);
reputationBalances[_staker] = 0;
    }

    /**
    @notice Clear the stake of all stakers in the event of Project failure
    @dev Only callable by the Project Registry initialized during construction, in the case of project failure
    */
    function clearStake() public onlyPR {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',13);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',209);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',23);
tokensStaked = 0;
__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',210);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',24);
reputationStaked = 0;
    }

    /**
    @notice Set the number of project tasks to `_tasksLength` as defined by the project stakers
    @dev Only callable by the Project Registry initialized during construction
    @param _tasksLength The amount of tasks as defined by the project stakers
    */
    function setTaskLength(uint _tasksLength) public onlyPR {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',14);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',219);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',25);
tasks.length = _tasksLength;
    }

    /**
    @notice Set the address of a task at index `_index`
    @dev Only callable by the Project Registry initialized during construction
    @param _taskAddress Address of the task contract
    @param _index Index of the task in the tasks array
    */
    function setTaskAddress(address _taskAddress, uint _index) public onlyPR {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',15);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',229);
        __AssertPreCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',4);
 __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',26);
require(state == 3);__AssertPostCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',4);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',230);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',27);
tasks[_index] = _taskAddress;
    }

    /**
    @notice Set the weighting of the amount of tasks that passed to `_passAmount`
    @dev Only callable by the Project Registry initialized during construction
    @param _passAmount The total weighting of all tasks which passed
    */
    function setPassAmount(uint256 _passAmount) public onlyPR {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',16);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',239);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',28);
passAmount = _passAmount;
    }

    // =====================================================================
    // STAKE
    // =====================================================================

    /**
    @notice Stake `_tokens` tokens from `_staker` and add `_weiValue` to the project ether balance
    @dev Only callable by the Token Registry initialized during construction, to maintain control flow
    @param _staker Address of the staker who is staking
    @param _tokens Amount of tokens to stake on the project
    @param _weiValue Amount of wei transferred to the project
    */
    function stakeTokens(address _staker, uint256 _tokens, uint256 _weiValue) public onlyTR {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',17);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',254);
        __AssertPreCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',5);
 __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',29);
require(state == 1);__AssertPostCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',5);


__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',256);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',30);
tokenBalances[_staker] += _tokens;
__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',257);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',31);
tokensStaked += _tokens;
__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',258);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',32);
weiBal += _weiValue;
    }

    /**
    @notice Unstake `_tokens` tokens from the project, subtract this value from the balance of `_staker`
    Returns the amount of ether to subtract from the project's ether balance
    @dev Only callable by the Token Registry initialized during construction, to maintain control flow
    @param _staker Address of the staker who is unstaking
    @param _tokens Amount of tokens to unstake on the project
    @return The amount of ether to deduct from the projects balance

    */
    function unstakeTokens(address _staker, uint256 _tokens) public onlyTR returns (uint256) {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',18);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',271);
        __AssertPreCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',6);
 __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',33);
require(state == 1);__AssertPostCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',6);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',272);
        __AssertPreCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',7);
 __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',34);
require(
            tokenBalances[_staker].sub(_tokens) < tokenBalances[_staker] &&  //check overflow
            tokenBalances[_staker] >= _tokens   //make sure _staker has the tokens staked to unstake */
        );__AssertPostCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',7);


__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',277);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',35);
uint256 weiVal = (Division.percent(_tokens, tokensStaked, 10) * weiBal) / 10000000000;
__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',278);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',36);
tokenBalances[_staker] -= _tokens;
__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',279);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',37);
tokensStaked -= _tokens;
__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',280);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',38);
weiBal -= weiVal;
__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',281);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',39);
return weiVal;
    }

    /**
    @notice Stake `_reputation` reputation from `_staker`
    @dev Only callable by the Reputation Registry initialized during construction, to maintain control flow
    @param _staker Address of the staker who is staking
    @param _reputation Amount of reputation to stake on the project
    */
    function stakeReputation(address _staker, uint256 _reputation) public onlyRR {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',19);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',291);
        __AssertPreCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',8);
 __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',40);
require(state == 1);__AssertPostCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',8);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',292);
        __AssertPreCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',9);
 __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',41);
require(reputationBalances[_staker] + _reputation > reputationBalances[_staker]);__AssertPostCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',9);


__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',294);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',42);
reputationBalances[_staker] += _reputation;
__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',295);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',43);
reputationStaked += _reputation;
    }

    /**
    @notice Unstake `_reputation` reputation from the project, and update staked balance of `_staker`
    @dev Only callable by the Reputation Registry initialized during construction, to maintain control flow
    @param _staker Address of the staker who is unstaking
    @param _reputation Amount of reputation to unstake on the project
    */
    function unstakeReputation(address _staker, uint256 _reputation) public onlyRR {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',20);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',305);
        __AssertPreCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',10);
 __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',44);
require(state == 1);__AssertPostCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',10);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',306);
        __AssertPreCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',11);
 __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',45);
require(
            reputationBalances[_staker].sub(_reputation) < reputationBalances[_staker] &&  //check overflow
            reputationBalances[_staker] >= _reputation //make sure _staker has the tokens staked to unstake
        );__AssertPostCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',11);


__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',311);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',46);
reputationBalances[_staker] -= _reputation;
__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',312);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',47);
reputationStaked -= _reputation;
    }

    // =====================================================================
    // REWARD
    // =====================================================================

    /**
    @notice Transfer `_reward` wei as reward for completing a task to `_rewardee
    @dev Only callable by the Reputation Registry initialized during construction, to maintain control flow
    @param _rewardee The account who claimed and completed the task.
    */
    function transferWeiReward(address _rewardee, uint _reward) public onlyRR {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',21);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',325);
        __AssertPreCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',12);
 __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',48);
require(_reward <= weiBal);__AssertPostCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',12);


__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',327);
         __StatementCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',49);
weiBal -= _reward;
__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',328);
        _rewardee.transfer(_reward);
    }

    /**
    @notice Transfer `_value` wei back to distribute token balance on task failure
    @dev Only callable by the Project Registry initialized during construction, to maintain control flow
    @param _distributeToken The address of the systems token contract.
    @param _value The amount of ether to send
    */
    function returnWei(address _distributeToken, uint _value) public onlyPR {__FunctionCoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',22);

__CoverageProject('/Users/shokishoki/development/consensys/distribute/contracts/contracts/Project.sol',338);
        _distributeToken.transfer(_value);
    }

}
