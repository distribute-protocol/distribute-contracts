pragma solidity ^0.4.21;

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
contract Project {

    using SafeMath for uint256;

    // =====================================================================
    // STATE VARIABLES
    // =====================================================================

    address public tokenRegistryAddress;
    address public reputationRegistryAddress;
    address public projectRegistryAddress;

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

    bool public hashListSubmitted;
    uint256 public passAmount;

    // MAKE THIS A DLL EVENTUALLY?
    address[] public tasks;

    // =====================================================================
    // MODIFIERS
    // =====================================================================

    modifier onlyPR() {
        require(msg.sender == projectRegistryAddress);
        _;
    }

    modifier onlyTR() {
        require(msg.sender == tokenRegistryAddress);
        _;
    }

    modifier onlyRR() {
        require(msg.sender == reputationRegistryAddress);
        _;
    }

    function isTR(address _sender) external view returns (bool) {
        return _sender == tokenRegistryAddress
            ? true
            : false;
    }

    function isRR(address _sender) external view returns (bool) {
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
    ) public {
        require (bytes(_ipfsHash).length == 46);
        reputationRegistryAddress = _reputationRegistry;
        tokenRegistryAddress = _tokenRegistry;
        projectRegistryAddress = msg.sender;
        weiCost = _cost;
        reputationCost = _costProportion * ReputationRegistry(_reputationRegistry).totalSupply() / 10000000000;
        state = 1;
        nextDeadline = _stakingPeriod;
        proposer = _proposer;
        proposerType = _proposerType;
        proposerStake = _proposerStake;
        ipfsHash = _ipfsHash;
    }

    // =====================================================================
    // FALLBACK
    // =====================================================================

    function() public payable {}

    // =====================================================================
    // GETTERS
    // =====================================================================
    /**
    @notice The amount of tasks created in the project during the Staked period.
    @dev Helper function used by the project library
    @return The number of tasks in the task array
    */
    function getTaskCount() external view returns (uint256) {
        return tasks.length;
    }

    /* function getTaskAddress(uint256 _index) external view returns (address) {
        return tasks[_index];
    } */

    // =====================================================================
    // SETTERS
    // =====================================================================

    /**
    @notice Set the project state to `_state`, and update the nextDeadline to `_nextDeadline`
    @dev Only callable by the Project Registry initialized during construction
    @param _state The state to update the project to
    @param _nextDeadline The nextDeadline to transition project to the next state
    */
    function setState(uint256 _state, uint256 _nextDeadline) external onlyPR {
        state = _state;
        nextDeadline = _nextDeadline;
    }

    /**
    @notice Clears the proposer stake on proposal expiration
    @dev Only callable by the Project Registry initialized during construction
    */
    function clearProposerStake() external onlyPR {
        proposerStake = 0;
    }

    /**
    @notice Clear the token stake of `_staker`, used during stake claiming
    @dev Only callable by the Token Registry initialized during construction
    @param _staker Address of the staker
    */
    function clearTokenStake(address _staker) external onlyTR {
        tokenBalances[_staker] = 0;
    }

    /**
    @notice Clear the reputation stake of `_staker`, used during stake claiming
    @dev Only callable by the Reputation Registry initialized during construction
    @param _staker Address of the staker
    */
    function clearReputationStake(address _staker) external onlyRR {
        reputationBalances[_staker] = 0;
    }

    /**
    @notice Clear the stake of all stakers in the event of Project failure
    @dev Only callable by the Project Registry initialized during construction, in the case of project failure
    */
    function clearStake() external onlyPR {
        tokensStaked = 0;
        reputationStaked = 0;
    }

    /**
    @notice Set the number of project tasks to `_tasksLength` as defined by the project stakers
    @dev Only callable by the Project Registry initialized during construction
    @param _tasksLength The amount of tasks as defined by the project stakers
    */
    function setTaskLength(uint _tasksLength) external onlyPR {
        tasks.length = _tasksLength;
    }

    /**
    @notice Set the address of a task at index `_index`
    @dev Only callable by the Project Registry initialized during construction
    @param _taskAddress Address of the task contract
    @param _index Index of the task in the tasks array
    */
    function setTaskAddress(address _taskAddress, uint _index) external onlyPR {
        require(state == 3);
        tasks[_index] = _taskAddress;
        hashListSubmitted = true;
    }

    /**
    @notice Set the weighting of the amount of tasks that passed to `_passAmount`
    @dev Only callable by the Project Registry initialized during construction
    @param _passAmount The total weighting of all tasks which passed
    */
    function setPassAmount(uint256 _passAmount) external onlyPR {
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
    function stakeTokens(address _staker, uint256 _tokens, uint256 _weiValue) external onlyTR {
        require(state == 1);
        require(
            tokenBalances[_staker].add(_tokens) > tokenBalances[_staker]    // check overflow
        );
        tokenBalances[_staker] += _tokens;
        tokensStaked += _tokens;
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
    function unstakeTokens(address _staker, uint256 _tokens, address _distributeTokenAddress) external onlyTR returns (uint256) {
        require(state == 1);
        require(
            tokenBalances[_staker].sub(_tokens) < tokenBalances[_staker] &&  //check overflow
            tokenBalances[_staker] >= _tokens   //make sure _staker has the tokens staked to unstake */
        );

        uint256 weiVal = (Division.percent(_tokens, tokensStaked, 10) * weiBal) / 10000000000;
        tokenBalances[_staker] -= _tokens;
        tokensStaked -= _tokens;
        weiBal -= weiVal;
        _distributeTokenAddress.transfer(weiVal);
        return weiVal;
    }

    /**
    @notice Stake `_reputation` reputation from `_staker`
    @dev Only callable by the Reputation Registry initialized during construction, to maintain control flow
    @param _staker Address of the staker who is staking
    @param _reputation Amount of reputation to stake on the project
    */
    function stakeReputation(address _staker, uint256 _reputation) external onlyRR {
        require(state == 1);
        require(reputationBalances[_staker] + _reputation > reputationBalances[_staker]);

        reputationBalances[_staker] += _reputation;
        reputationStaked += _reputation;
    }

    /**
    @notice Unstake `_reputation` reputation from the project, and update staked balance of `_staker`
    @dev Only callable by the Reputation Registry initialized during construction, to maintain control flow
    @param _staker Address of the staker who is unstaking
    @param _reputation Amount of reputation to unstake on the project
    */
    function unstakeReputation(address _staker, uint256 _reputation) external onlyRR {
        require(state == 1);
        require(
            reputationBalances[_staker].sub(_reputation) < reputationBalances[_staker] &&  //check overflow
            reputationBalances[_staker] >= _reputation //make sure _staker has the tokens staked to unstake
        );

        reputationBalances[_staker] -= _reputation;
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
    function transferWeiReward(address _rewardee, uint _reward) external onlyRR {
        require(_reward <= weiBal);

        weiBal -= _reward;
        _rewardee.transfer(_reward);
    }

    /**
    @notice Transfer `_value` wei back to distribute token balance on task failure
    @dev Only callable by the Project Registry initialized during construction, to maintain control flow
    @param _distributeToken The address of the systems token contract.
    @param _value The amount of ether to send
    */
    function returnWei(address _distributeToken, uint _value) external onlyPR {
        require(_value <= weiBal);
        weiBal -= _value;
        _distributeToken.transfer(_value);
    }

}
