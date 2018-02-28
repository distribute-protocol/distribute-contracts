
// ===================================================================== //
// This contract manages the state and state-related details of each project.
// ===================================================================== //

pragma solidity ^0.4.8;

import "./Project.sol";
import "./TokenRegistry.sol";
import "./ReputationRegistry.sol";
import "./ProjectLibrary.sol";
import "./library/PLCRVoting.sol";

contract ProjectRegistry {
  TokenRegistry tokenRegistry;
  ReputationRegistry reputationRegistry;
  PLCRVoting plcrVoting;
  address projectLibraryAddress;
  address reputationRegistryAddress;
  address tokenRegistryAddress;

  /* uint256 openStatePeriod = 1 weeks; */
  uint256 disputeStatePeriod = 1 weeks;
  uint256 activeStatePeriod = 1 weeks;
  uint256 validateStatePeriod = 1 weeks;
  uint256 voteCommitPeriod = 1 weeks;
  uint256 voteRevealPeriod = 1 weeks;

  mapping(address => uint256) public votingPollId;                    //projectId to project address

  struct ProposedState {
    address proposer;         //who is the proposer
    uint256 proposerStake;    //how much did they stake in tokens
    uint256 cost;      //cost of the project in ETH/tokens?
    uint256 stakingPeriod;
  }

  struct DisputeState {
    bytes32 topTaskHash;
    mapping(address => bytes32) taskHashSubmissions;
    mapping(bytes32 => uint256) numSubmissionsByWeight;
  }

  mapping (address => bytes32[]) public projectTaskList;      //store project task list for each project address

/*
 function getHashAtIndex(address _projectAddress, uint index) public view returns(bytes32 value) {
   return projectTaskList[_projectAddress][index];
 }*/

  /* struct Validation {
    uint256 validateReward;
    bool validateFlag;
  } */

  // WHY?
  mapping (address => ProposedState) public proposedProjects;
  mapping (address => DisputeState) public disputedProjects;

  // NOTE do we need a validated Projects mapping?

  // =====================================================================
  // CONSTRUCTOR
  // =====================================================================
  function ProjectRegistry(address _tokenRegistry, address _reputationRegistry, address _plcrVoting, address _projectLibrary) public {       //contract is created
    require(address(tokenRegistry) == 0 && address(reputationRegistry) == 0);
    tokenRegistry = TokenRegistry(_tokenRegistry);
    reputationRegistry = ReputationRegistry(_reputationRegistry);
    plcrVoting = PLCRVoting(_plcrVoting);
    reputationRegistryAddress = _reputationRegistry;
    tokenRegistryAddress = _tokenRegistry;
    projectLibraryAddress = _projectLibrary;
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

  // =====================================================================
  // EVENTS
  // =====================================================================

  event LogProjectCreated(address indexed projectAddress, address proposerAddress, uint256 projectCost, uint256 proposerStake);

  // =====================================================================
  // GENERAL FUNCTIONS
  // =====================================================================

  function getProposerAddress(address _projectAddress) public view returns (address) {
    return proposedProjects[_projectAddress].proposer;
  }

  function startPoll(address _projectAddress, uint256 _commitDuration, uint256 _revealDuration) internal {       //can only be called by project in question
    votingPollId[_projectAddress] =  plcrVoting.startPoll(51, _commitDuration, _revealDuration);
  }

  function pollEnded(address _projectAddress) public view returns (bool) {
    return plcrVoting.pollEnded(votingPollId[_projectAddress]);
  }

  // =====================================================================
  // PROPOSER FUNCTIONS
  // =====================================================================

  function createProject(uint256 _cost, uint256 _costProportion, uint256 _numTokens, uint256 _stakingPeriod, address _proposer) public onlyTR() returns (address) {

    Project newProject = new Project(_cost,
                                     _costProportion,
                                     _stakingPeriod,
                                     reputationRegistryAddress,
                                     tokenRegistryAddress,
                                     projectLibraryAddress
                                     );
   address _projectAddress = address(newProject);
   setProposer(_projectAddress, _proposer, _numTokens, _stakingPeriod, _cost);
   LogProjectCreated(_projectAddress, _proposer, _cost, _numTokens);
   return _projectAddress;
  }

  // NOT SURE WHY WE NEED THIS MAPPING
  function setProposer(address _projectAddress, address _proposer, uint256 _proposerStake, uint256 _stakingPeriod, uint256 _cost) internal {
    // Proposer storage proposer = proposers[_projectAddress];
    proposedProjects[_projectAddress].proposer = _proposer;
    proposedProjects[_projectAddress].proposerStake = _proposerStake;
    proposedProjects[_projectAddress].stakingPeriod = _stakingPeriod;
    proposedProjects[_projectAddress].cost = _cost;
  }

  // Maybe makes this easier but we should look at removing
  function refundProposer(address _projectAddress) public onlyTR() returns (uint256[2]) {
    require(Project(_projectAddress).state() > 1);
    uint256[2] memory returnValues;
    uint256 proposerStake = proposedProjects[_projectAddress].proposerStake;
    require(proposerStake > 0);
    returnValues[0] = proposedProjects[_projectAddress].cost;
    returnValues[1] = proposerStake;
    proposedProjects[_projectAddress].proposerStake = 0;
    return returnValues;
  }

  // =====================================================================
  // STATE CHANGE
  // =====================================================================

  function checkStaked(address _projectAddress) public returns (bool) {
    Project project = Project(_projectAddress);
    require(project.state() == 1);    //check that project is in the proposed state
    if(ProjectLibrary.isStaked(_projectAddress)) {
      uint256 nextDeadline = now + disputeStatePeriod;
      project.setState(2, nextDeadline);
      return true;
    } else {
      if(ProjectLibrary.timesUp(_projectAddress)) {
        project.setState(7, 0);
        proposedProjects[_projectAddress].proposerStake = 0;
      }
      return false;
    }
  }

  function checkActive(address _projectAddress) public returns (bool) {
    Project project = Project(_projectAddress);
    require(project.state() == 2);
    if(ProjectLibrary.timesUp(_projectAddress)) {
      uint256 nextDeadline;
      if(disputedProjects[_projectAddress].topTaskHash != 0) {
        nextDeadline = now + activeStatePeriod;
        project.setState(3, nextDeadline);
        return true;
      } else {
        project.setState(7, 0);
        return false;
      }
      /* //MAKE THIS OPEN HANDLER
      if(projectState == 2) {
        if(openProjects[_projectAddress].first == 0 || openProjects[_projectAddress].conflict != 0) {
          nextDeadline = now + disputeStatePeriod;
          project.setState(3, nextDeadline);
        } else if(openProjects[_projectAddress].first != 0 && openProjects[_projectAddress].conflict == 0) {
          nextDeadline = now + activeStatePeriod;
          project.setState(4, nextDeadline);
          return true;
        }
      } else {

      } */
    }
    return false;
  }

  function checkValidate(address _projectAddress) public returns (bool) {
    Project project = Project(_projectAddress);
    require(project.state() == 3);
    if (ProjectLibrary.timesUp(_projectAddress)) {
      uint256 nextDeadline = now + validateStatePeriod;
      project.setState(5, nextDeadline);
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
      startPoll(_projectAddress, voteCommitPeriod, voteRevealPeriod);
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
  // OPEN/DISPUTE PROJECT FUNCTIONS
  // =====================================================================

  function addTaskHash(address _projectAddress, bytes32 _ipfsHash) public  {
    Project project = Project(_projectAddress);
    require(ProjectLibrary.isStaker(_projectAddress, msg.sender) == true);
    checkActive(_projectAddress);
    if (project.state() == 3) {
      uint256 stakerWeight = ProjectLibrary.calculateWeightOfAddress(_projectAddress, msg.sender);
      disputeTaskHash(msg.sender, _projectAddress, _ipfsHash, stakerWeight);
    }
  }

  function disputeTaskHash(address _staker, address _projectAddress, bytes32 _ipfsHash, uint256 stakerWeight) internal {
    DisputeState storage ds = disputedProjects[_projectAddress];
    if(ds.taskHashSubmissions[_staker] !=  0) {   //first time submission for this particular address
      bytes32 submittedTaskHash = ds.taskHashSubmissions[_staker];
      ds.numSubmissionsByWeight[submittedTaskHash] -= stakerWeight;
    }
    ds.numSubmissionsByWeight[_ipfsHash] += stakerWeight;
    ds.taskHashSubmissions[_staker] = _ipfsHash;
    if(ds.numSubmissionsByWeight[_ipfsHash]
      > ds.numSubmissionsByWeight[ds.topTaskHash]) {
      ds.topTaskHash = _ipfsHash;
    }
  }

  function submitHashList(address _projectAddress, bytes32[] _hashes) public {
    Project project = Project(_projectAddress);
    require(ProjectLibrary.isStaker(_projectAddress, msg.sender) == true);
    require(project.state() == 2);
    require(keccak256(_hashes) == disputedProjects[_projectAddress].topTaskHash);
    projectTaskList[_projectAddress] = _hashes;
  }

  // =====================================================================
  // ACTIVE PROJECT
  // =====================================================================
  bytes32 public tempHash;

  function claimTask(
    address _projectAddress, uint256 _index, string _taskDescription, uint256 _weiVal, uint256 _reputationVal, address _claimer
  ) public onlyRR() returns (bytes32) {
    bytes32 taskHash = projectTaskList[_projectAddress][_index];
    require(taskHash == keccak256(_taskDescription, _weiVal, _reputationVal));
    ProjectLibrary.claimTask(_projectAddress, taskHash, _weiVal, _reputationVal, _claimer);
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
