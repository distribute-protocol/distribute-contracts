
// ===================================================================== //
// This contract manages the state and state-related details of each project.
// ===================================================================== //

pragma solidity ^0.4.8;

import "./Project.sol";
import "./ProjectLibrary.sol";
import "./library/PLCRVoting.sol";
import "./Task.sol";
import "./ReputationRegistry.sol";

contract ProjectRegistry {
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
// EVENTS
// =====================================================================

  event LogProjectCreated(address indexed projectAddress, address proposerAddress, uint256 projectCost, uint256 proposerStake);

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

  function init(address _distributeToken, address _tokenRegistry, address _reputationRegistry, address _plcrVoting) public {       //contract is created
    require(tokenRegistryAddress == 0 && reputationRegistryAddress == 0 && distributeTokenAddress == 0);
    distributeTokenAddress = _distributeToken;
    tokenRegistryAddress = _tokenRegistry;
    reputationRegistryAddress = _reputationRegistry;
    plcrVoting = PLCRVoting(_plcrVoting);
  }

// =====================================================================
// FUNCTIONS
// =====================================================================

  // =====================================================================
  // STATE CHANGE
  // =====================================================================


    function checkStaked(address _projectAddress) public returns (bool) {
      return ProjectLibrary.checkStaked(_projectAddress);
    }

    function checkActive(address _projectAddress) public returns (bool) {
      return ProjectLibrary.checkActive(_projectAddress, stakedProjects[_projectAddress].topTaskHash);
    }

    function checkValidate(address _projectAddress) public {
      ProjectLibrary.checkValidate(_projectAddress, tokenRegistryAddress, distributeTokenAddress);
    }

    function checkVoting(address _projectAddress) public {
      ProjectLibrary.checkVoting(_projectAddress, tokenRegistryAddress, distributeTokenAddress, address(plcrVoting));
    }

    function checkEnd(address _projectAddress) public {
      ProjectLibrary.checkEnd(_projectAddress, tokenRegistryAddress, distributeTokenAddress, address(plcrVoting));
      Project project = Project(_projectAddress);
      if (project.state() == 7) {
        TokenRegistry(tokenRegistryAddress).burnTokens(project.totalTokensStaked());
        ReputationRegistry(reputationRegistryAddress).burnReputation(project.totalReputationStaked());
        project.clearStake();
      }
    }

  // =====================================================================
  // PROPOSER
  // =====================================================================

    function createProject(uint256 _cost, uint256 _costProportion, uint256 _stakingPeriod,
                           address _proposer, uint256 _proposerType, uint256 _proposerStake,
                           string _ipfsHash) public onlyTRorRR returns (address) {
      Project newProject = new Project(_cost,
                                       _costProportion,
                                       _stakingPeriod,
                                       _proposer,
                                       _proposerType,
                                       _proposerStake,
                                       _ipfsHash,
                                       reputationRegistryAddress,
                                       tokenRegistryAddress
                                       );
     address projectAddress = address(newProject);
     LogProjectCreated(projectAddress, _proposer, _cost, _proposerStake);
     return projectAddress;
    }

    function refundProposer(address _projectAddress) public onlyTRorRR returns (uint256[2]) {
      Project project =  Project(_projectAddress);
      require(project.state() > 1);
      uint256[2] memory returnValues;
      require(project.proposerStake() > 0);
      returnValues[0] = project.weiCost();
      returnValues[1] = project.proposerStake();
      project.clearProposerStake();
      return returnValues;
    }

  // =====================================================================
  // STAKED
  // =====================================================================

    function addTaskHash(address _projectAddress, bytes32 _taskHash) public  {      // format of has should be 'description', 'percentage', check via js that percentages add up to 100 prior to calling contract
      Project project = Project(_projectAddress);
      require(ProjectLibrary.isStaker(_projectAddress, msg.sender) == true);
      checkActive(_projectAddress);
      if (project.state() == 2) {
        uint256 stakerWeight = ProjectLibrary.calculateWeightOfAddress(_projectAddress, msg.sender);
        stakedTaskHash(msg.sender, _projectAddress, _taskHash, stakerWeight);
      }
    }

    function stakedTaskHash(address _staker, address _projectAddress, bytes32 _taskHash, uint256 stakerWeight) internal {
      StakedState storage ss = stakedProjects[_projectAddress];
      if(ss.taskHashSubmissions[_staker] !=  0) {   //Not time submission for this particular address
        bytes32 submittedTaskHash = ss.taskHashSubmissions[_staker];
        ss.numSubmissionsByWeight[submittedTaskHash] -= stakerWeight;
      }
      ss.numSubmissionsByWeight[_taskHash] += stakerWeight;
      ss.taskHashSubmissions[_staker] = _taskHash;
      if(ss.numSubmissionsByWeight[_taskHash]
        > ss.numSubmissionsByWeight[ss.topTaskHash]) {
        ss.topTaskHash = _taskHash;
      }
    }

  // =====================================================================
  // ACTIVE
  // =====================================================================

  // Doesn't Change State Here Could Possibly move to ProjectLibrary
    function submitHashList(address _projectAddress, bytes32[] _hashes) public {
      Project project = Project(_projectAddress);
      require(ProjectLibrary.isStaker(_projectAddress, msg.sender) == true);
      require(keccak256(_hashes) == stakedProjects[_projectAddress].topTaskHash);
      project.setTaskLength(_hashes.length);
      for (uint256 i = 0; i < _hashes.length; i++) {
        Task newTask = new Task(_hashes[i], tokenRegistryAddress);
        project.setTaskAddress(address(newTask), i);
      }
    }

  // Doesn't Change State Here Could Possibly move to ProjectLibrary
    function claimTask(address _projectAddress, uint256 _index, bytes32 _taskDescription,
      address _claimer, uint _weighting, uint _weiVal, uint _reputationVal) public onlyRR {
      Project project = Project(_projectAddress);
      require(project.state() == 3);
      Task task = Task(project.tasks(_index));
      require(keccak256(_taskDescription, _weighting) == task.taskHash());
      require(task.claimer() == 0 || (now > (task.claimTime() + project.turnoverTime()) && !task.complete()));
      task.setWeighting(_weighting);
      task.setTaskReward(_weiVal, _reputationVal, _claimer);
    }

  // Doesn't Change State Here Could Possibly move to ProjectLibrary
    function submitTaskComplete(address _projectAddress, uint256 _index) public {
      Project project = Project(_projectAddress);
      Task task = Task(project.tasks(_index));
      require(task.complete() == false);
      require(task.claimer() == msg.sender);
      require(project.state() == 3);
      task.markTaskComplete();
    }
}
