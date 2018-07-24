pragma solidity ^0.4.21;

import "./library/PLCRVoting.sol";
import "./ReputationRegistry.sol";
import "./DistributeToken.sol";
import "./ProjectLibrary.sol";
import "./Task.sol";
import "bytes/BytesLib.sol";
import "./library/SafeMath.sol";
import "./library/Ownable.sol";

/**
@title Project Registry for Distribute Network
@author Team: Jessica Marshall, Ashoka Finley
@notice This project uses the Project Library to manage the state of Distribute Network projects.
@dev This contract must be initialized with the address of a valid Token Registry, Reputation Registry
and Distribute Token
*/
contract ProjectRegistry is Ownable {

    using ProjectLibrary for address;
    using BytesLib for bytes;
    using SafeMath for uint256;

    // =====================================================================
    // EVENTS
    // =====================================================================

    event LogProjectCreated(address indexed projectAddress);
    event LogProjectFullyStaked(address projectAddress, bool staked);
    event LogTaskHashSubmitted(address projectAddress, bytes32 taskHash, address submitter, uint weighting);
    event LogProjectActive(address projectAddress, bytes32 topTaskHash, bool active);
    event LogFinalTaskCreated(address taskAddress, address projectAddress, bytes32 finalTaskHash, uint256 index);
    event LogTaskClaimed(address projectAddress, uint256 index, uint256 reputationVal, address claimer);
    event LogSubmitTaskComplete(address projectAddress, uint256 index);
    event LogProjectValidate(address projectAddress, bool validate);

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
    }

    mapping (address => StakedState) public stakedProjects;

    uint[5] public validationRewardWeightings = [36, 24, 17, 13, 10];

    bool freeze;

    // =====================================================================
    // MODIFIERS
    // =====================================================================

    modifier onlyTR() {
        require(msg.sender == tokenRegistryAddress);
        _;
    }

    modifier onlyRR() {
        require(msg.sender == reputationRegistryAddress);
        _;
    }
    modifier onlyTRorRR() {
        require(msg.sender == tokenRegistryAddress || msg.sender == reputationRegistryAddress);
        _;
    }

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
    ) public {       //contract is created
              /* address _proxyFactory */
        require(
            tokenRegistryAddress == 0 &&
            reputationRegistryAddress == 0 &&
            distributeTokenAddress == 0
        );
        distributeTokenAddress = _distributeToken;
        tokenRegistryAddress = _tokenRegistry;
        reputationRegistryAddress = _reputationRegistry;
        plcrVoting = PLCRVoting(_plcrVoting);
        projectContractAddress = _projectAddress;
        taskContractAddress = _taskAddress;
        /* proxyFactory = ProxyFactory(_proxyFactory); */
    }

    // =====================================================================
    // OWNABLE
    // =====================================================================

    /**
     * @dev Freezes the distribute token contract and allows existing token holders to withdraw tokens
     */
    function freezeContract() external onlyOwner {
        freeze = true;
    }

    /**
     * @dev Unfreezes the distribute token contract and allows existing token holders to withdraw tokens
     */
    function unfreezeContract() external onlyOwner {
        freeze = false;
    }

    /**
     * @dev Instantiate a new instance of plcrVoting contract
     * @param _newPlcrVoting Address of the new plcr contract
     */
    function updatePLCRVoting(address _newPlcrVoting) external onlyOwner {
        plcrVoting = PLCRVoting(_newPlcrVoting);
    }

    /**
     * @dev Update the address of the distributeToken
     * @param _newDistributeToken Address of the new distribute token
     */
    function updateDistributeToken(address _newDistributeToken) external onlyOwner {
        distributeTokenAddress = _newDistributeToken;
    }

    /**
     * @dev Update the address of the base product proxy contract
     * @param _newProjectContract Address of the new project contract
     */
    function updateProjectContract(address _newProjectContract) external onlyOwner {
        projectContractAddress = _newProjectContract;
    }

    /**
     * @dev Update the address of the base task proxy contract
     * @param _newTaskContract Address of the new task contract
     */
    function updateTaskContract(address _newTaskContract) external onlyOwner {
        taskContractAddress = _newTaskContract;
    }

    /**
     * @dev Update the address of the token registry
     * @param _newTokenRegistry Address of the new token registry
     */
    function updateTokenRegistry(address _newTokenRegistry) external onlyOwner {
        tokenRegistryAddress = _newTokenRegistry;
    }

    /**
     * @dev Update the address of the reputation registry
     * @param _newReputationRegistry Address of the new reputation registry
     */
    function updateReputationRegistry(address _newReputationRegistry) external onlyOwner {
        reputationRegistryAddress = _newReputationRegistry;
    }

    // =====================================================================
    // PROXY DEPLOYER
    // =====================================================================

    function createProxy(address _target, bytes _data)
        internal
        returns (address proxyContract)
    {
        proxyContract = createProxyImpl(_target, _data);

        /* emit ProxyDeployed(proxyContract, _target); */
    }

    function createProxyImpl(address _target, bytes _data)
        internal
        returns (address proxyContract)
    {
        assembly {
            let contractCode := mload(0x40) // Find empty storage location using "free memory pointer"

            mstore(add(contractCode, 0x14), _target) // Add target address, with a 20 bytes [i.e. 32 - (32 - 20)] offset to later accomodate first part of the bytecode
            mstore(contractCode, 0x000000000000000000603160008181600b9039f3600080808080368092803773) // First part of the bytecode, padded with 9 bytes of zeros to the left, overwrites left padding of target address
            mstore(add(contractCode, 0x34), 0x5af43d828181803e808314602f57f35bfd000000000000000000000000000000) // Final part of bytecode, offset by 52 bytes

            proxyContract := create(0, add(contractCode, 0x09), 60) // total length 60 bytes
            if iszero(extcodesize(proxyContract)) {
                revert(0, 0)
            }

            // check if the _data.length > 0 and if it is forward it to the newly created contract
            let dataLength := mload(_data)
            if iszero(iszero(dataLength)) {
                if iszero(call(gas, proxyContract, 0, add(_data, 0x20), dataLength, 0, 0)) {
                    revert(0, 0)
                }
            }
        }
    }

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
    ) internal returns (address) {
        require(_ipfsHash.length == 46);
        bytes memory dataToSend;
        assembly {
            //let ipfsHashSize := mload(_ipfsHash)
            dataToSend := mload(0x40) // Find empty memory location using "free memory pointer"
            mstore(add(dataToSend, 0x4), 0xf58a1adb)  // this is the function ID
            mstore(add(dataToSend, 0x24), _cost)
            mstore(add(dataToSend, 0x44), _costProportion)
            mstore(add(dataToSend, 0x64), _stakingPeriod)
            mstore(add(dataToSend, 0x84), _proposer)
            mstore(add(dataToSend, 0xa4), _proposerType)
            mstore(add(dataToSend, 0xc4), _proposerStake)
            mstore(add(dataToSend, 0xe4), 0x120) // <--- _ipfsHash data location part (length + contents)
            mstore(add(dataToSend, 0x104), _reputationRegistry)
            mstore(add(dataToSend, 0x124), _tokenRegistry)
            mstore(add(dataToSend, 0x144), 46) // <--- Length of the IPFS hash size
            mstore(add(dataToSend, 0x164), mload(add(_ipfsHash, 0x20)))
            mstore(add(dataToSend, 0x184), mload(add(_ipfsHash, 0x40)))
            mstore(dataToSend, 0x172) // 4 bytes (function ID) + 32 bytes per parameter * 9 + 32 bytes of "length of bytes" + first 32 bytes of bytes data + 14 bytes = 370 bytes [0x172 bytes]

            // updating the free memory pointer with the length of tightly packed
            mstore(0x40, add(dataToSend, 0x192)) // 0x192 == 0x172 + 0x20
        }
        address projectAddress = createProxy(projectContractAddress, dataToSend);
        return projectAddress;
    }

    function createProxyTask(
        bytes32 _hash,
        address _tokenRegistry,
        address _reputationRegistry
    ) internal returns (address) {
        bytes memory dataToSend;
        assembly {
          dataToSend := mload(0x40)
          mstore(add(dataToSend, 0x4), 0xae4d1af6)
          mstore(add(dataToSend, 0x24), _hash)
          mstore(add(dataToSend, 0x44), _tokenRegistry)
          mstore(add(dataToSend, 0x64), _reputationRegistry)
          mstore(dataToSend, 0x64)/// 4 + 32 * 3 == 100 bytes
          mstore(0x40, add(dataToSend, 0x84))
        }
        address taskAddress = createProxy(taskContractAddress, dataToSend);
        return taskAddress;
    }

    // =====================================================================
    // STATE CHANGE
    // =====================================================================

    /**
    @notice Calls the project library checkStaked function
    @dev Used to create the correct msg.sender to manage control
    @param _projectAddress Address of the project
    @return Boolean representing Staked status
    */
    function checkStaked(address _projectAddress) external returns (bool) {
        require(!freeze);
        require(projects[_projectAddress] == true);
        bool staked = _projectAddress.checkStaked();
        emit LogProjectFullyStaked(_projectAddress, staked);
        return staked;
    }

    /**
    @notice Calls the project library checkActive function, passing along the topTaskHash of the
    project at `_projectAddress`
    @dev Used to create the correct msg.sender to manage control
    @param _projectAddress Address of the project
    @return Boolean representing Active status
    */
    function checkActive(address _projectAddress) public returns (bool) {
        require(!freeze);
        require(projects[_projectAddress] == true);
        bytes32 topTaskHash = stakedProjects[_projectAddress].topTaskHash;
        bool active = _projectAddress.checkActive(topTaskHash, stakedProjects[_projectAddress].numSubmissionsByWeight[topTaskHash], tokenRegistryAddress, reputationRegistryAddress, distributeTokenAddress);
        emit LogProjectActive(_projectAddress, topTaskHash, active);
        return active;
    }

    /**
    @notice Calls the project library checkValidate function
    @dev Used to create the correct msg.sender to manage control
    @param _projectAddress Address of the project
    @return Boolean representing Validate status
    */
    function checkValidate(address _projectAddress) external {
        require(!freeze);
        require(projects[_projectAddress] == true);
        bool validate = _projectAddress.checkValidate(tokenRegistryAddress, distributeTokenAddress);
        emit LogProjectValidate(_projectAddress, validate);
    }

    /**
    @notice Calls the project library checkVoting function
    @dev Used to create the correct msg.sender to manage control
    @param _projectAddress Address of the project
    @return Boolean representing Voting status
    */
    function checkVoting(address _projectAddress) external {
        require(!freeze);
        require(projects[_projectAddress] == true);
        _projectAddress.checkVoting(tokenRegistryAddress, distributeTokenAddress, address(plcrVoting));
    }

    /**
    @notice Calls the project library checkEnd function. Burns tokens and reputation if the project fails
    @dev Used to create the correct msg.sender to manage control
    @param _projectAddress Address of the project
    @return Boolean representing Final Status
    */
    function checkEnd(address _projectAddress) external {
        require(!freeze);
        require(projects[_projectAddress] == true);
        _projectAddress.checkEnd(tokenRegistryAddress, distributeTokenAddress, address(plcrVoting), reputationRegistryAddress);
    }

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
    ) external onlyTRorRR returns (address) {
        require(!freeze);
        address projectAddress = createProxyProject(
            _cost,
            _costProportion,
            _stakingPeriod,
            _proposer,
            _proposerType,
            _proposerStake,
            _ipfsHash,
            reputationRegistryAddress,
            tokenRegistryAddress
        );
        projects[projectAddress] = true;
        projectsList[projectNonce] = projectAddress;
        projectNonce += 1;
        emit LogProjectCreated(projectAddress);
        return projectAddress;
    }

    /**
    @notice Refund a proposer if the project at `_projectAddress` is not in state: 1 Proposed or
    state: 8 Expired.
    @dev Only called by the TokenRegistry or ReputationRegistry
    @param _projectAddress Address of the project
    @return An array with the weiCost of the project and the proposers stake
    */
    function refundProposer(address _projectAddress) external onlyTRorRR returns (uint256[2]) {
        require(!freeze);
        require(projects[_projectAddress] == true);
        Project project =  Project(_projectAddress);
        require(project.state() > 1 && project.state() != 8);
        require(project.proposerStake() > 0);

        uint256[2] memory returnValues;
        returnValues[0] = project.proposedCost();
        returnValues[1] = project.proposerStake();
        project.clearProposerStake();
        return returnValues;
    }

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
    function addTaskHash(address _projectAddress, bytes32 _taskHash) external  {      // format of has should be 'description', 'percentage', check via js that percentages add up to 100 prior to calling contract
        require(!freeze);
        require(projects[_projectAddress] == true);
        Project project = Project(_projectAddress);
        require(_projectAddress.isStaker(msg.sender) == true);
        checkActive(_projectAddress);
        require(project.state() == 2);

        uint256 stakerWeight = _projectAddress.calculateWeightOfAddress(msg.sender);
        stakedTaskHash(_projectAddress, msg.sender, _taskHash, stakerWeight);
        emit LogTaskHashSubmitted(_projectAddress, _taskHash, msg.sender, stakerWeight);
    }

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
    ) internal {
        StakedState storage ss = stakedProjects[_projectAddress];
        if(ss.taskHashSubmissions[_staker] !=  0) {   //Not first time submission for this particular address
            bytes32 submittedTaskHash = ss.taskHashSubmissions[_staker];
            ss.numSubmissionsByWeight[submittedTaskHash] -= _stakerWeight;
        }
        ss.numSubmissionsByWeight[_taskHash] += _stakerWeight;
        ss.taskHashSubmissions[_staker] = _taskHash;
        if(ss.numSubmissionsByWeight[_taskHash] > ss.numSubmissionsByWeight[ss.topTaskHash]) {
            ss.topTaskHash = _taskHash;
        }
    }

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
    function submitHashList(address _projectAddress, bytes32[] _hashes) external {
        require(!freeze);
        require(projects[_projectAddress] == true);
        Project project = Project(_projectAddress);
        require(project.state() == 3);
        require(keccak256(abi.encodePacked(_hashes)) == stakedProjects[_projectAddress].topTaskHash);
        // Fail project if topTaskHash is not over 50
        require(project.hashListSubmitted() == false);
        project.setTaskLength(_hashes.length);
        for (uint256 i = 0; i < _hashes.length; i++) {
            address newTask = createProxyTask(_hashes[i], tokenRegistryAddress, reputationRegistryAddress);
            project.setTaskAddress(newTask, i);
            emit LogFinalTaskCreated(newTask, _projectAddress, _hashes[i], i);
        }
        project.setHashListSubmitted();
    }

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
    ) external onlyRR {
        require(!freeze);
        Project project = Project(_projectAddress);
        require(project.state() == 3);
        Task task = Task(project.tasks(_index));
        require(keccak256(abi.encodePacked(_taskDescription, _weighting)) == task.taskHash());
        require(
            task.claimer() == 0 ||
            (now > (task.claimTime() + project.turnoverTime()) && !task.complete())
        );
        task.setWeighting(_weighting);
        task.setTaskReward(_weiVal, _reputationVal, _claimer);
        emit LogTaskClaimed(_projectAddress, _index, _reputationVal, _claimer);
    }

    /**
    @notice Mark that task at index `_index` in project at `_projectAddress` as completed by the claimer
    `msg.sender`
    @param _projectAddress Address of project
    @param _index Index of the task in task array
    */
    // Doesn't Change State Here Could Possibly move to ProjectLibrary
    function submitTaskComplete(address _projectAddress, uint256 _index) external {
        require(!freeze);
        Project project = Project(_projectAddress);
        Task task = Task(project.tasks(_index));
        DistributeToken dt = DistributeToken(distributeTokenAddress);
        require(task.claimer() == msg.sender);
        require(task.complete() == false);
        require(project.state() == 3);
        task.setValidationEntryFee((task.weighting() * project.proposedCost() / 100) / dt.currentPrice());
        task.markTaskComplete();
        emit LogSubmitTaskComplete(_projectAddress, _index);
    }
}
