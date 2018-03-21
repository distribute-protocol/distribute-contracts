pragma solidity ^0.4.19;

import "./library/PLCRVoting.sol";
import "./ReputationRegistry.sol";
import "./Project.sol";
import "./ProjectLibrary.sol";
import "./Task.sol";

/**
@title Project Registry for Distribute Network
@author Team: Jessica Marshall, Ashoka Finley
@notice This project uses the Project Library to manage the state of Distribute Network projects.
@dev This contract must be initialized with the address of a valid Token Registry, Reputation Registry
and Distribute Token
*/
contract ProjectRegistry {event __CoverageProjectRegistry(string fileName, uint256 lineNumber);
event __FunctionCoverageProjectRegistry(string fileName, uint256 fnId);
event __StatementCoverageProjectRegistry(string fileName, uint256 statementId);
event __BranchCoverageProjectRegistry(string fileName, uint256 branchId, uint256 locationIdx);
event __AssertPreCoverageProjectRegistry(string fileName, uint256 branchId);
event __AssertPostCoverageProjectRegistry(string fileName, uint256 branchId);


    using ProjectLibrary for address;

    // =====================================================================
    // EVENTS
    // =====================================================================

    event LogProjectCreated(
        address indexed projectAddress,
        address proposerAddress,
        uint256 projectCost,
        uint256 proposerStake
    );

    // =====================================================================
    // STATE VARIABLES
    // =====================================================================

    PLCRVoting plcrVoting;

    address tokenRegistryAddress;
    address reputationRegistryAddress;
    address distributeTokenAddress;

    struct StakedState {
        bytes32 topTaskHash;
        mapping(address => bytes32) taskHashSubmissions;
        mapping(bytes32 => uint256) numSubmissionsByWeight;
    }

    mapping (address => StakedState) public stakedProjects;

    // =====================================================================
    // MODIFIERS
    // =====================================================================

    modifier onlyTR() {__FunctionCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',1);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',54);
        __AssertPreCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',1);
 __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',1);
require(msg.sender == tokenRegistryAddress);__AssertPostCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',1);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',55);
        _;
    }

    modifier onlyRR() {__FunctionCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',2);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',59);
        __AssertPreCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',2);
 __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',2);
require(msg.sender == reputationRegistryAddress);__AssertPostCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',2);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',60);
        _;
    }
    modifier onlyTRorRR() {__FunctionCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',3);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',63);
        __AssertPreCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',3);
 __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',3);
require(msg.sender == tokenRegistryAddress || msg.sender == reputationRegistryAddress);__AssertPostCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',3);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',64);
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
        address _plcrVoting
    ) public {__FunctionCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',4);
       //contract is created
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',86);
        __AssertPreCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',4);
 __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',4);
require(
            tokenRegistryAddress == 0 &&
            reputationRegistryAddress == 0 &&
            distributeTokenAddress == 0
        );__AssertPostCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',4);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',91);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',5);
distributeTokenAddress = _distributeToken;
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',92);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',6);
tokenRegistryAddress = _tokenRegistry;
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',93);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',7);
reputationRegistryAddress = _reputationRegistry;
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',94);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',8);
plcrVoting = PLCRVoting(_plcrVoting);
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
    function checkStaked(address _projectAddress) public returns (bool) {__FunctionCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',5);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',108);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',9);
return _projectAddress.checkStaked();
    }

    /**
    @notice Calls the project library checkActive function, passing along the topTaskHash of the
    project at `_projectAddress`
    @dev Used to create the correct msg.sender to manage control
    @param _projectAddress Address of the project
    @return Boolean representing Active status
    */
    function checkActive(address _projectAddress) public returns (bool) {__FunctionCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',6);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',119);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',10);
return _projectAddress.checkActive(stakedProjects[_projectAddress].topTaskHash);
    }

    /**
    @notice Calls the project library checkValidate function
    @dev Used to create the correct msg.sender to manage control
    @param _projectAddress Address of the project
    @return Boolean representing Validate status
    */
    function checkValidate(address _projectAddress) public {__FunctionCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',7);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',129);
        _projectAddress.checkValidate(tokenRegistryAddress, distributeTokenAddress);
    }

    /**
    @notice Calls the project library checkVoting function
    @dev Used to create the correct msg.sender to manage control
    @param _projectAddress Address of the project
    @return Boolean representing Voting status
    */
    function checkVoting(address _projectAddress) public {__FunctionCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',8);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',139);
        _projectAddress.checkVoting(tokenRegistryAddress, distributeTokenAddress, address(plcrVoting));
    }

    /**
    @notice Calls the project library checkEnd function. Burns tokens and reputation if the project fails
    @dev Used to create the correct msg.sender to manage control
    @param _projectAddress Address of the project
    @return Boolean representing Final Status
    */
    function checkEnd(address _projectAddress) public {__FunctionCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',9);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',149);
        _projectAddress.checkEnd(tokenRegistryAddress, distributeTokenAddress, address(plcrVoting));
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',150);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',11);
Project project = Project(_projectAddress);
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',151);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',12);
if (project.state() == 7) {__BranchCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',5,0);
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',152);
             __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',13);
TokenRegistry(tokenRegistryAddress).burnTokens(project.tokensStaked());
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',153);
             __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',14);
ReputationRegistry(reputationRegistryAddress).burnReputation(project.reputationStaked());
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',154);
            project.clearStake();
        }else { __BranchCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',5,1);}

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
        string _ipfsHash
    ) public onlyTRorRR returns (address) {__FunctionCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',10);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',187);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',15);
Project newProject = new Project(
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
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',198);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',16);
address projectAddress = address(newProject);
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',199);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',17);
LogProjectCreated(projectAddress, _proposer, _cost, _proposerStake);
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',200);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',18);
return projectAddress;
    }

    /**
    @notice Refund a proposer if the project at `_projectAddress` is not in state: 1 Proposed or
    state: 8 Expired.
    @dev Only called by the TokenRegistry or ReputationRegistry
    @param _projectAddress Address of the project
    @return An array with the weiCost of the project and the proposers stake
    */
    function refundProposer(address _projectAddress) public onlyTRorRR returns (uint256[2]) {__FunctionCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',11);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',211);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',19);
Project project =  Project(_projectAddress);
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',212);
        __AssertPreCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',6);
 __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',20);
require(project.state() > 1 && project.state() != 8);__AssertPostCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',6);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',213);
        __AssertPreCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',7);
 __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',21);
require(project.proposerStake() > 0);__AssertPostCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',7);


__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',215);
        uint256[2] memory returnValues;
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',216);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',22);
returnValues[0] = project.weiCost();
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',217);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',23);
returnValues[1] = project.proposerStake();
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',218);
        project.clearProposerStake();
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',219);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',24);
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
    function addTaskHash(address _projectAddress, bytes32 _taskHash) public  {__FunctionCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',12);
      // format of has should be 'description', 'percentage', check via js that percentages add up to 100 prior to calling contract
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',234);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',25);
Project project = Project(_projectAddress);
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',235);
        __AssertPreCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',8);
 __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',26);
require(_projectAddress.isStaker(msg.sender) == true);__AssertPostCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',8);


__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',237);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',27);
checkActive(_projectAddress);
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',238);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',28);
if (project.state() == 2) {__BranchCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',9,0);
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',239);
             __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',29);
uint256 stakerWeight = _projectAddress.calculateWeightOfAddress(msg.sender);
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',240);
             __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',30);
stakedTaskHash(_projectAddress, msg.sender, _taskHash, stakerWeight);
        }else { __BranchCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',9,1);}

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
    ) internal {__FunctionCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',13);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',259);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',31);
StakedState storage ss = stakedProjects[_projectAddress];
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',260);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',32);
if(ss.taskHashSubmissions[_staker] !=  0) {__BranchCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',10,0);   //Not time submission for this particular address
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',261);
             __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',33);
bytes32 submittedTaskHash = ss.taskHashSubmissions[_staker];
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',262);
             __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',34);
ss.numSubmissionsByWeight[submittedTaskHash] -= _stakerWeight;
        }else { __BranchCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',10,1);}

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',264);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',35);
ss.numSubmissionsByWeight[_taskHash] += _stakerWeight;
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',265);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',36);
ss.taskHashSubmissions[_staker] = _taskHash;
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',266);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',37);
if(ss.numSubmissionsByWeight[_taskHash] > ss.numSubmissionsByWeight[ss.topTaskHash]) {__BranchCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',11,0);
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',267);
             __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',38);
ss.topTaskHash = _taskHash;
        }else { __BranchCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',11,1);}

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
    function submitHashList(address _projectAddress, bytes32[] _hashes) public {__FunctionCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',14);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',285);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',39);
Project project = Project(_projectAddress);
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',286);
        __AssertPreCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',12);
 __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',40);
require(keccak256(_hashes) == stakedProjects[_projectAddress].topTaskHash);__AssertPostCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',12);


__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',288);
        project.setTaskLength(_hashes.length);
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',289);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',41);
for (uint256 i = 0; i < _hashes.length; i++) {
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',290);
             __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',42);
Task newTask = new Task(_hashes[i], tokenRegistryAddress, reputationRegistryAddress);
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',291);
            project.setTaskAddress(address(newTask), i);
        }
    }

    /**
    @notice Claim a task at index `_index` from project at `_projectAddress` with description
    `_taskDescription`, weighting `_weighting` by claimer `_claimer. Set the ether reward of the task
    to `_weiVal` and the repuation needed to claim the task to `_reputationVal`
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
    ) public onlyRR {__FunctionCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',15);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',318);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',43);
Project project = Project(_projectAddress);
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',319);
        __AssertPreCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',13);
 __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',44);
require(project.state() == 3);__AssertPostCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',13);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',320);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',45);
Task task = Task(project.tasks(_index));
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',321);
        __AssertPreCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',14);
 __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',46);
require(keccak256(_taskDescription, _weighting) == task.taskHash());__AssertPostCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',14);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',322);
        __AssertPreCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',15);
 __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',47);
require(
            task.claimer() == 0 ||
            (now > (task.claimTime() + project.turnoverTime()) && !task.complete())
        );__AssertPostCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',15);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',326);
        task.setWeighting(_weighting);
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',327);
        task.setTaskReward(_weiVal, _reputationVal, _claimer);
    }

    /**
    @notice Mark that task at index `_index` in project at `_projectAddress` as completed by the claimer
    `msg.sender`
    @param _projectAddress Address of project
    @param _index Index of the task in task array
    */
    // Doesn't Change State Here Could Possibly move to ProjectLibrary
    function submitTaskComplete(address _projectAddress, uint256 _index) public {__FunctionCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',16);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',338);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',48);
Project project = Project(_projectAddress);
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',339);
         __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',49);
Task task = Task(project.tasks(_index));
__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',340);
        __AssertPreCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',16);
 __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',50);
require(task.claimer() == msg.sender);__AssertPostCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',16);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',341);
        __AssertPreCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',17);
 __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',51);
require(task.complete() == false);__AssertPostCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',17);

__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',342);
        __AssertPreCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',18);
 __StatementCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',52);
require(project.state() == 3);__AssertPostCoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',18);


__CoverageProjectRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ProjectRegistry.sol',344);
        task.markTaskComplete();
    }
}
