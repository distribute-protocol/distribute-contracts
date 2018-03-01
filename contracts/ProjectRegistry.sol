
// ===================================================================== //
// This contract manages the state and state-related details of each project.
// ===================================================================== //

pragma solidity ^0.4.8;

import "./Project.sol";
import "./DistributeToken.sol";
import "./TokenRegistry.sol";
import "./ReputationRegistry.sol";
import "./ProjectLibrary.sol";
import "./library/PLCRVoting.sol";

contract ProjectRegistry {
  DistributeToken distributeToken;
  TokenRegistry tokenRegistry;
  ReputationRegistry reputationRegistry;
  PLCRVoting plcrVoting;
  address reputationRegistryAddress;
  address tokenRegistryAddress;

  // will need to be changed to make a poll for each task
  mapping(address => uint256) public votingPollId;

  struct StakedState {
    bytes32 topTaskHash;
    mapping(address => bytes32) taskHashSubmissions;
    mapping(bytes32 => uint256) numSubmissionsByWeight;
  }

  mapping (address => bytes32[]) public projectTaskList;      //store project task list for each project address

  mapping (address => StakedState) public stakedProjects;

  // NOTE do we need a validated Projects mapping?

  // =====================================================================
  // CONSTRUCTOR
  // =====================================================================
  function ProjectRegistry(address _distributeToken, address _tokenRegistry, address _reputationRegistry, address _plcrVoting) public {       //contract is created
    require(address(tokenRegistry) == 0 && address(reputationRegistry) == 0);
    tokenRegistry = TokenRegistry(_tokenRegistry);
    reputationRegistry = ReputationRegistry(_reputationRegistry);
    distributeToken = DistributeToken(_distributeToken);
    plcrVoting = PLCRVoting(_plcrVoting);
    reputationRegistryAddress = _reputationRegistry;
    tokenRegistryAddress = _tokenRegistry;
  }
  // =====================================================================
  // MODIFIERS
  // =====================================================================
  modifier onlyTR() {
    require(msg.sender == address(tokenRegistry));
    _;
  }

  modifier onlyRR() {
    require(msg.sender == address(reputationRegistry));
    _;
  }
  modifier onlyTRorRR() {
    require(msg.sender == address(tokenRegistry) || msg.sender == address(reputationRegistry));
    _;
  }

  // =====================================================================
  // EVENTS
  // =====================================================================

  event LogProjectCreated(address indexed projectAddress, address proposerAddress, uint256 projectCost, uint256 proposerStake);

  // =====================================================================
  // GENERAL FUNCTIONS
  // =====================================================================

  function startPoll(address _projectAddress, uint256 _commitDuration, uint256 _revealDuration) internal {       //can only be called by project in question
    votingPollId[_projectAddress] =  plcrVoting.startPoll(51, _commitDuration, _revealDuration);
  }

  function pollEnded(address _projectAddress) public view returns (bool) {
    return plcrVoting.pollEnded(votingPollId[_projectAddress]);
  }

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
   address _projectAddress = address(newProject);
   LogProjectCreated(_projectAddress, _proposer, _cost, _proposerStake);
   return _projectAddress;
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
      uint256 nextDeadline = now + project.stakedStatePeriod();
      project.setState(2, nextDeadline);
      return true;
    } else {
      if(ProjectLibrary.timesUp(_projectAddress)) {
        project.setState(7, 0);
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
        nextDeadline = now + project.activeStatePeriod();
        project.setState(3, nextDeadline);
        return true;
      } else {
        project.setState(7, 0);
        return false;
      }
    }
    return false;
  }

  function checkValidate(address _projectAddress) public returns (bool) {
    Project project = Project(_projectAddress);
    require(project.state() == 3);
    if (ProjectLibrary.timesUp(_projectAddress)) {
      uint256 nextDeadline = now + project.validateStatePeriod();
      project.setState(4, nextDeadline);
      return true;
    } else {
      return false;
    }
  }

  function checkVoting(address _projectAddress) public returns (bool) {
    Project project = Project(_projectAddress);
    require(project.state() == 4);
    if(ProjectLibrary.timesUp(_projectAddress)) {
      project.setState(5, 0);
      startPoll(_projectAddress, project.voteCommitPeriod(), project.voteRevealPeriod());
      return true;
    }
    return false;
  }

  function checkEnd(address _projectAddress) public returns (bool) {     //don't know where this gets called - maybe separate UI thing
    Project project = Project(_projectAddress);
    if(!pollEnded(_projectAddress)) { return false; }
    bool passed = plcrVoting.isPassed(votingPollId[_projectAddress]);
    ProjectLibrary.setValidationState(tokenRegistryAddress, reputationRegistryAddress, _projectAddress, passed);
    passed
      ? project.setState(6, 0)
      : project.setState(7, 0);
    return true;
  }

  // =====================================================================
  // STAKED PROJECT FUNCTIONS
  // =====================================================================

  function addTaskHash(address _projectAddress, bytes32 _taskHash) public  {      // format of has should be 'description', 'percentage', check via js that percentages add up to 100 prior to calling contract
    Project project = Project(_projectAddress);
    require(ProjectLibrary.isStaker(_projectAddress, msg.sender) == true);
    checkActive(_projectAddress);
    if (project.state() == 3) {
      uint256 stakerWeight = ProjectLibrary.calculateWeightOfAddress(_projectAddress, msg.sender);
      stakedTaskHash(msg.sender, _projectAddress, _taskHash, stakerWeight);
    }
  }

  function stakedTaskHash(address _staker, address _projectAddress, bytes32 _taskHash, uint256 stakerWeight) internal {
    StakedState storage ss = stakedProjects[_projectAddress];
    if(ss.taskHashSubmissions[_staker] !=  0) {   //first time submission for this particular address
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
    require(project.state() == 2);
    require(keccak256(_hashes) == stakedProjects[_projectAddress].topTaskHash);
    projectTaskList[_projectAddress] = _hashes;
  }

  // =====================================================================
  // ACTIVE PROJECT
  // =====================================================================

  function claimTask(address _projectAddress, uint256 _index, string _taskDescription, address _claimer, uint _weighting, uint _weiVal, uint _reputationVal) public onlyRR() returns (bytes32) {
    // 100% => percentage = 100
    bytes32 taskHash = projectTaskList[_projectAddress][_index];
    require(taskHash == keccak256(_taskDescription, _weighting));
    // weiVal is wei reward of the task as indicated by its percentage
    ProjectLibrary.claimTask(_projectAddress, taskHash, _weiVal, _reputationVal, _claimer);
  }

  function submitTaskComplete(address _projectAddress, bytes32 _taskHash) public {
    Project project = Project(_projectAddress);
    var (,claimer) = project.taskRewards(_taskHash);
    require(claimer == msg.sender);
    project.markTaskComplete(_taskHash);
  }
  /*function checkHash(bytes32 taskHash, string _taskDescription, uint256 _weiVal, uint256 _reputationVal) public view {
    require(taskHash == keccak256(_taskDescription, _weiVal, _reputationVal));
  }*/

  // =====================================================================
  // COMPLETED PROJECT - VALIDATION & VOTING FUNCTIONALITY
  // =====================================================================
/* NOTE: could implement a function to keep track of validated projects
  using a mapping like proposedProjects and the others */
}
