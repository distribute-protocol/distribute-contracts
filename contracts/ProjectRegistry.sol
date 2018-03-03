
// ===================================================================== //
// This contract manages the state and state-related details of each project.
// ===================================================================== //

pragma solidity ^0.4.8;

import "./Project.sol";
import "./ProjectLibrary.sol";
import "./library/PLCRVoting.sol";
import "./Task.sol";

contract ProjectRegistry {
  address tokenRegistryAddress;
  address reputationRegistryAddress;
  PLCRVoting plcrVoting;

  uint256 public stakedStatePeriod = 1 weeks;
  uint256 public activeStatePeriod = 2 weeks;
  uint256 public validateStatePeriod = 1 weeks;
  uint256 public voteCommitPeriod = 1 weeks;
  uint256 public voteRevealPeriod = 1 weeks;

  struct StakedState {
    bytes32 topTaskHash;
    mapping(address => bytes32) taskHashSubmissions;
    mapping(bytes32 => uint256) numSubmissionsByWeight;
  }

  mapping (address => StakedState) public stakedProjects;

  // NOTE do we need a validated Projects mapping?

  // =====================================================================
  // CONSTRUCTOR
  // =====================================================================

  function ProjectRegistry(address _tokenRegistry, address _reputationRegistry, address _plcrVoting) public {       //contract is created
    require(tokenRegistryAddress == 0 && reputationRegistryAddress == 0);
    tokenRegistryAddress = _tokenRegistry;
    reputationRegistryAddress = _reputationRegistry;
    plcrVoting = PLCRVoting(_plcrVoting);
  }
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
  // EVENTS
  // =====================================================================

  event LogProjectCreated(address indexed projectAddress, address proposerAddress, uint256 projectCost, uint256 proposerStake);

  // =====================================================================
  // PROPOSER FUNCTIONS
  // =====================================================================

  function createProject(uint256 _cost, uint256 _costProportion, uint256 _stakingPeriod, address _proposer, uint256 _proposerType, uint256 _proposerStake) public onlyTRorRR() returns (address) {

    Project newProject = new Project(_cost,
                                     _costProportion,
                                     _stakingPeriod,
                                     _proposer,
                                     _proposerType,
                                     _proposerStake,
                                     reputationRegistryAddress,
                                     tokenRegistryAddress
                                     );
   address projectAddress = address(newProject);
   LogProjectCreated(projectAddress, _proposer, _cost, _proposerStake);
   return projectAddress;
  }

  // Maybe makes this easier but we should look at removing
  function refundProposer(address _projectAddress) public onlyTRorRR() returns (uint256[2]) {
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
  // STATE CHANGE
  // =====================================================================

  function checkStaked(address _projectAddress) public returns (bool) {
    Project project = Project(_projectAddress);
    require(project.state() == 1);    //check that project is in the proposed state
    if(ProjectLibrary.isStaked(_projectAddress)) {
      uint256 nextDeadline = now + stakedStatePeriod;
      project.setState(2, nextDeadline);
      return true;
    } else {
      if(ProjectLibrary.timesUp(_projectAddress)) {
        project.setState(8, 0);
        project.clearProposerStake();
      }
      return false;
    }
  }

  function checkActive(address _projectAddress) public returns (bool) {
    Project project = Project(_projectAddress);
    require(project.state() == 2);
    if(ProjectLibrary.timesUp(_projectAddress)) {
      uint256 nextDeadline;
      if(stakedProjects[_projectAddress].topTaskHash != 0) {
        nextDeadline = now + activeStatePeriod;
        project.setState(3, nextDeadline);
        return true;
      } else {
        project.setState(7, 0);
        return false;
      }
    }
    return false;
  }

  function checkValidate(address _projectAddress) public {
    Project project = Project(_projectAddress);
    require(project.state() == 3);
    if (ProjectLibrary.timesUp(_projectAddress)) {
      uint256 nextDeadline = now + validateStatePeriod;
      project.setState(4, nextDeadline);
      for(uint i = 0; i < project.getTaskCount(); i++) {
        Task task = Task(project.tasks(i));
        if (task.complete() == false) {
          task.setTaskReward(0, 0, task.claimer());
        }
      }
    }
  }

  function checkVoting(address _projectAddress) public {
    Project project = Project(_projectAddress);
    require(project.state() == 4);
    if (ProjectLibrary.timesUp(_projectAddress)) {
      project.setState(5, 0);
      for(uint i = 0; i < project.getTaskCount(); i++) {
        Task task = Task(project.tasks(i));
        if (task.complete()) {
          if (task.opposingValidator()) {   // there is an opposing validator, poll required
            task.setPollId(plcrVoting.startPoll(51, voteCommitPeriod, voteRevealPeriod)); // function handles storage of voting pollId
          } else {
            task.markTaskClaimable(true);
          }
        }
      }
    }
  }

  function checkEnd(address _projectAddress) public {
    Project project = Project(_projectAddress);
    require(project.state() == 5);
    for (uint i = 0; i < project.getTaskCount(); i++) {
      Task task = Task(project.tasks(i));
      if (task.complete() && task.opposingValidator()) {      // check tasks with polls only
        if (plcrVoting.pollEnded(task.pollId())) {
          plcrVoting.isPassed(task.pollId())
            ? task.markTaskClaimable(true)
            : task.markTaskClaimable(false);
        }
      }
    }
    uint passThreshold = ProjectLibrary.calculatePassThreshold(_projectAddress);
    if (passThreshold > 70) {
      project.setState(6, 0);
    } else {
      project.setState(7, 0);
      ProjectLibrary.burnStake(tokenRegistryAddress, reputationRegistryAddress, _projectAddress);
    }
  }

  // =====================================================================
  // STAKED PROJECT FUNCTIONS
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

  function submitHashList(address _projectAddress, bytes32[] _hashes) public {
    Project project = Project(_projectAddress);
    require(ProjectLibrary.isStaker(_projectAddress, msg.sender) == true);
    checkActive(_projectAddress);
    require(project.state() == 3);
    require(keccak256(_hashes) == stakedProjects[_projectAddress].topTaskHash);
    for (uint256 i = 0; i < _hashes.length; i++) {
      Task newTask = new Task(_hashes[i], tokenRegistryAddress);
      project.setTaskAddress(address(newTask), i);
    }
  }

  // =====================================================================
  // ACTIVE PROJECT
  // =====================================================================

  function claimTask(address _projectAddress, uint256 _index, string _taskDescription, address _claimer, uint _weighting, uint _weiVal, uint _reputationVal) public onlyRR() returns (bytes32) {
    Project project = Project(_projectAddress);
    require(project.state() == 3);
    Task task = Task(project.tasks(_index));
    require(task.taskHash() == keccak256(_taskDescription, _weighting));
    require(task.claimer() == 0 || now > (task.claimTime() + project.turnoverTime()) && !task.complete());
    task.setWeighting(_weighting);
    task.setTaskReward(_weiVal, _reputationVal, _claimer);
  }

  function submitTaskComplete(address _projectAddress, uint256 _index) public {
    Project project = Project(_projectAddress);
    Task task = Task(project.tasks(_index));
    require(task.claimer() == msg.sender);
    require(project.state() == 3);
    task.markTaskComplete();
  }

  // =====================================================================
  // COMPLETED PROJECT - VALIDATION & VOTING FUNCTIONALITY
  // =====================================================================
/* NOTE: could implement a function to keep track of validated projects
  using a mapping like proposedProjects and the others */
}
