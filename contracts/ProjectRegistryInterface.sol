pragma solidity ^0.4.24;

import "./library/PLCRVoting.sol";

/**
@title Project Registry for Distribute Network
@author Team: Jessica Marshall, Ashoka Finley
@notice This project uses the Project Library to manage the state of Distribute Network projects.
@dev This contract must be initialized with the address of a valid Token Registry, Reputation Registry
and Distribute Token
*/
contract ProjectRegistryInterface {

    /* event ProxyDeployed(address proxyAddress, address targetAddress); */

    // =====================================================================
    // STATE VARIABLES
    // =====================================================================

    PLCRVoting plcrVoting;
    address tokenRegistryAddress;
    address reputationRegistryAddress;
    address distributeTokenAddress;
    address projectContractAddress;
    address taskContractAddress;

    uint256 projectNonce = 0;
    mapping (uint => address) public projectsList;
    mapping (address => bool) public projects;

    struct StakedState {
        bytes32 topTaskHash;
        mapping(address => bytes32) taskHashSubmissions;
        mapping(bytes32 => uint256) numSubmissionsByWeight;
        mapping(bytes32 => address) originator;
    }

    mapping (address => StakedState) public stakedProjects;

    uint[5] public validationRewardWeightings = [36, 24, 17, 13, 10];

    bool freeze;

    // =====================================================================
    // MODIFIERS
    // =====================================================================

    modifier onlyTR() { _; }
    modifier onlyRR() { _; }
    modifier onlyTRorRR() { _; }

    // =====================================================================
    // CONSTRUCTOR
    // =====================================================================

    /**
    @notice
    @dev Quasi constructor is called after thr project is deployed. Requires that all relevant contract
    address are not yet intialized.
    @param _distributeToken Address of the distributeToken contract
    @param _tokenRegistry Address of the token registry contract
    @param _reputationRegistry Address of the reputation registry contract
    @param _plcrVoting Address of the plcr voting contract
    */
    function init(
        address _distributeToken,
        address _tokenRegistry,
        address _reputationRegistry,
        address _plcrVoting,
        address _projectAddress,
        address _taskAddress
    ) public;

    // =====================================================================
    // OWNABLE
    // =====================================================================

    /**
     * @dev Freezes the distribute token contract and allows existing token holders to withdraw tokens
     */
    function freezeContract() external;

    /**
     * @dev Unfreezes the distribute token contract and allows existing token holders to withdraw tokens
     */
    function unfreezeContract() external;

    /**
     * @dev Instantiate a new instance of plcrVoting contract
     * @param _newPlcrVoting Address of the new plcr contract
     */
    function updatePLCRVoting(address _newPlcrVoting) external;
    /**
     * @dev Update the address of the distributeToken
     * @param _newDistributeToken Address of the new distribute token
     */
    function updateDistributeToken(address _newDistributeToken) external;

    /**
     * @dev Update the address of the base product proxy contract
     * @param _newProjectContract Address of the new project contract
     */
    function updateProjectContract(address _newProjectContract) external;

    /**
     * @dev Update the address of the base task proxy contract
     * @param _newTaskContract Address of the new task contract
     */
    function updateTaskContract(address _newTaskContract) external;

    /**
     * @dev Update the address of the token registry
     * @param _newTokenRegistry Address of the new token registry
     */
    function updateTokenRegistry(address _newTokenRegistry) external;

    /**
     * @dev Update the address of the reputation registry
     * @param _newReputationRegistry Address of the new reputation registry
     */
    function updateReputationRegistry(address _newReputationRegistry) external;

    // =====================================================================
    // PROXY DEPLOYER
    // =====================================================================

    function createProxy(address _target, bytes _data)
        internal
        returns (address proxyContract);

    function createProxyImpl(address _target, bytes _data)
        internal
        returns (address proxyContract);

    function createProxyProject(
        uint256 _cost,
        uint256 _costProportion,
        uint256 _stakingPeriod,
        address _proposer,
        uint256 _proposerType,
        uint256 _proposerStake,
        bytes _ipfsHash,
        address _reputationRegistry,
        address _tokenRegistry
    ) internal returns (address);

    function createProxyTask(
        bytes32 _hash,
        address _tokenRegistry,
        address _reputationRegistry
    ) internal returns (address);

    // =====================================================================
    // STATE CHANGE
    // =====================================================================

    /**
    @notice Calls the project library checkStaked function
    @dev Used to create the correct msg.sender to manage control
    @param _projectAddress Address of the project
    @return Boolean representing Staked status
    */
    function checkStaked(address _projectAddress) external returns (bool);

    /**
    @notice Calls the project library checkActive function, passing along the topTaskHash of the
    project at `_projectAddress`
    @dev Used to create the correct msg.sender to manage control
    @param _projectAddress Address of the project
    @return Boolean representing Active status
    */
    function checkActive(address _projectAddress) public returns (bool);

    /**
    @notice Calls the project library checkValidate function
    @dev Used to create the correct msg.sender to manage control
    @param _projectAddress Address of the project
    @return Boolean representing Validate status
    */
    function checkValidate(address _projectAddress) external;

    /**
    @notice Calls the project library checkVoting function
    @dev Used to create the correct msg.sender to manage control
    @param _projectAddress Address of the project
    @return Boolean representing Voting status
    */
    function checkVoting(address _projectAddress) external;
    /**
    @notice Calls the project library checkEnd function. Burns tokens and reputation if the project fails
    @dev Used to create the correct msg.sender to manage control
    @param _projectAddress Address of the project
    @return Boolean representing Final Status
    */
    function checkEnd(address _projectAddress) external;

    // =====================================================================
    // PROPOSER
    // =====================================================================

    /**
    @notice Create a project with a cost of `_cost`, a ratio of `_costProportion`, a staking period
    length of `_stakingPeriod`, by proposer `_proposer` of type `_proposerType` with stake of
    `_proposerStake` defined by ipfsHash `_ipfsHash`
    @dev Only callable by the ReputationRegistry or TokenRegistry, after proposer stake is confirmed.
    @param _cost The total cost of the project in wei
    @param _costProportion The proportion of the project cost divided by the DistributeToken weiBal
    represented as integer
    @param _stakingPeriod The length of time this project is open for staking
    @param _proposer The address of the user proposing the project
    @param _proposerType Denotes if a proposer is using reputation or tokens,
    value must be 1: tokens or 2: reputation
    @param _proposerStake The amount of reputation or tokens needed to create the proposal
    @param _ipfsHash The ipfs hash of the full project description
    @return Address of the created project
    */
    function createProject(
        uint256 _cost,
        uint256 _costProportion,
        uint256 _stakingPeriod,
        address _proposer,
        uint256 _proposerType,
        uint256 _proposerStake,
        bytes _ipfsHash
    ) external returns (address);

    /**
    @notice Refund a proposer if the project at `_projectAddress` is not in state: 1 Proposed or
    state: 8 Expired.
    @dev Only called by the TokenRegistry or ReputationRegistry
    @param _projectAddress Address of the project
    @return An array with the weiCost of the project and the proposers stake
    */
    function refundProposer(address _projectAddress) external returns (uint256[2]);

    // =====================================================================
    // STAKED
    // =====================================================================

    /**
    @notice Submit a hash of a task list `_taskHash` to project at `_projectAddress` by staker
    `msg.sender`. Makes sure the Project is in the Active State, and calls stakedTaskHash.
    @dev This library is imported into all the Registries to manage project interactions
    @param _projectAddress Address of the project
    @param _taskHash Hash of the task list
    */
    function addTaskHash(address _projectAddress, bytes32 _taskHash) external;

    /**
    @notice Calculates the taskHash that has the highest weight of all tasks hashes submitted by stakers
    and stores this as the top task hash.
    @dev Internal helper function used to calculate the top task hash.
    @param _projectAddress Address of the project
    @param _staker Address of the staker
    @param _taskHash Hash of the task list
    @param _stakerWeight Weight of the staker
    */
    function stakedTaskHash(
        address _projectAddress,
        address _staker,
        bytes32 _taskHash,
        uint256 _stakerWeight
    ) internal;
    /**
    @notice Rewards the originator of a project plan in tokens.
    @param _projectAddress Address of the project
    */
    function rewardOriginator(
      address _projectAddress
    ) external;
    // =====================================================================
    // ACTIVE
    // =====================================================================

    /**
    @notice Submit the final task list with hashed tasks `_hashes` for project at `_projectAddress`.
    Hashes the submitted task list to validate it is the top task hash list, and creates a task for
    each list item with the respective hash.
    @dev This function is an interation and requires variable gas.
    @param _projectAddress Address of the project
    @param _hashes Array of task hashes
    */
    // Doesn't Change State Here Could Possibly move to ProjectLibrary
    function submitHashList(address _projectAddress, bytes32[] _hashes) external;

    /**
    @notice Claim a task at index `_index` from project at `_projectAddress` with description
    `_taskDescription`, weighting `_weighting` by claimer `_claimer. Set the ether reward of the task
    to `_weiVal` and the reputation needed to claim the task to `_reputationVal`
    @dev Only callable by the ReputationRegistry
    @param _projectAddress Address of project
    @param _index Index of the task in task array.
    @param _taskDescription Description of the task.
    @param _claimer Address of account to claim task.
    @param _weighting Weighting of this particular task (proportion of project funds)
    @param _weiVal Ether reward of task
    @param _reputationVal Reputation required to claim task
    */
    // Doesn't Change State Here Could Possibly move to ProjectLibrary
    function claimTask(
        address _projectAddress,
        uint256 _index,
        bytes32 _taskDescription,
        address _claimer,
        uint _weighting,
        uint _weiVal,
        uint _reputationVal
    ) external;

    /**
    @notice Mark that task at index `_index` in project at `_projectAddress` as completed by the claimer
    `msg.sender`
    @param _projectAddress Address of project
    @param _index Index of the task in task array
    */
    // Doesn't Change State Here Could Possibly move to ProjectLibrary
    function submitTaskComplete(address _projectAddress, uint256 _index) external;
}
