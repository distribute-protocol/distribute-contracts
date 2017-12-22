
// ===================================================================== //
// This contract manages the state and state-related details of each project.
// ===================================================================== //

pragma solidity ^0.4.8;

import "./Project.sol";
import "./TokenRegistry.sol";
import "./ReputationRegistry.sol";
import "./library/PLCRVoting.sol";

contract ProjectRegistry {
  TokenRegistry tokenRegistry;
  ReputationRegistry reputationRegistry;
  PLCRVoting plcrVoting;
  address reputationRegistryAddress;
  address tokenRegistryAddress;

  uint256 openStatePeriod = 1 weeks;
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
  struct OpenState {
    //open
    bytes32 first;
    uint256 conflict;                                 //used to determine if dispute period needs to happen
    uint256 numTotalSubmissions;
    mapping(address => bytes32) taskHashSubmissions;
    mapping(bytes32 => uint256) numSubmissions;
  }

  struct DisputeState {
    bytes32 topTaskHash;
    mapping(address => bytes32) taskHashSubmissions;
    mapping(bytes32 => uint256) numSubmissionsByWeight;
  }

  mapping (address => bytes32[]) public projectTaskList;

  struct Validation {
    uint256 validateReward;
    bool validateFlag;
  }

  mapping (address => ProposedState) public proposedProjects;
  mapping (address => OpenState) public openProjects;
  mapping (address => DisputeState) public disputedProjects;

  // =====================================================================
  // CONSTRUCTOR
  // =====================================================================
  function ProjectRegistry(address _tokenRegistry, address _reputationRegistry, address _plcrVoting) public {       //contract is created
    require(address(tokenRegistry) == 0 && address(reputationRegistry) == 0);
    tokenRegistry = TokenRegistry(_tokenRegistry);
    reputationRegistry = ReputationRegistry(_reputationRegistry);
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

  // =====================================================================
  // EVENTS
  // =====================================================================

  event LogProjectCreated(address projectAddress, address proposerAddress, uint256 projectCost, uint256 proposerStake);

  // =====================================================================
  // GENERAL FUNCTIONS
  // =====================================================================

  function getProposerAddress(address _projectAddress) public view returns (address) {
    return proposedProjects[_projectAddress].proposer;
  }

  function startPoll(address _projectAddress, uint256 _commitDuration, uint256 _revealDuration) public {       //can only be called by project in question
    votingPollId[_projectAddress] =  plcrVoting.startPoll(51, _commitDuration, _revealDuration);
  }

  function pollEnded(address _projectAddress) public view returns (bool) {
    return plcrVoting.pollEnded(votingPollId[_projectAddress]);
  }

  function isPassed(address _projectAddress) public returns (bool) {
    bool passed = plcrVoting.isPassed(votingPollId[_projectAddress]);
    Project(_projectAddress).rewardValidator(passed);
    return passed;
  }


  // =====================================================================
  // PROPOSER FUNCTIONS
  // =====================================================================

  function createProject(uint256 _cost, uint256 _costProportion, uint256 _numTokens, uint256 _stakingPeriod, address _proposer) public onlyTR() returns (address) {

    Project newProject = new Project(_cost,
                                     _costProportion,
                                     _stakingPeriod,
                                     reputationRegistryAddress,
                                     tokenRegistryAddress
                                     );
   address _projectAddress = address(newProject);
   setProposer(_projectAddress, _proposer, _numTokens, _stakingPeriod, _cost);
   LogProjectCreated(_projectAddress, _proposer, _cost, _numTokens);
   return _projectAddress;
  }

  function setProposer(address _projectAddress, address _proposer, uint256 _proposerStake, uint256 _stakingPeriod, uint256 _cost) internal {
    // Proposer storage proposer = proposers[_projectAddress];
    proposedProjects[_projectAddress].proposer = _proposer;
    proposedProjects[_projectAddress].proposerStake = _proposerStake;
    proposedProjects[_projectAddress].stakingPeriod = _stakingPeriod;
    proposedProjects[_projectAddress].cost = _cost;
  }

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

  function checkOpen(address _projectAddress) public returns (bool) {
    require(Project(_projectAddress).state() == 1);    //check that project is in the proposed state
    if(Project(_projectAddress).isStaked()) {
      uint256 nextDeadline = now + openStatePeriod;
      Project(_projectAddress).setState(2, nextDeadline);
      return true;
    } else if(Project(_projectAddress).timesUp()) {
      Project(_projectAddress).setState(9, 0);
      proposedProjects[_projectAddress].proposerStake = 0;
      return false;
    } else {
      return false;
    }
  }

  function checkActive(address _projectAddress) public returns (bool) {
    Project project = Project(_projectAddress);
    uint256 projectState = project.state();
    require(projectState == 2 || projectState == 3);
    if(project.timesUp()) {
      uint256 nextDeadline;
      if(projectState == 3 && disputedProjects[_projectAddress].topTaskHash == 0) {
        project.setState(9, 0);
      } else if(projectState == 2 && openProjects[_projectAddress].conflict != 0) {
        nextDeadline = now + disputeStatePeriod;
        project.setState(3, nextDeadline);
      } else {
        nextDeadline = now + activeStatePeriod;
        project.setState(4, nextDeadline);
      }
      return true;
    } else {
      return false;
    }
  }

  function checkValidate(address _projectAddress) public returns (bool) {
    require(Project(_projectAddress).state() == 4);
    if (Project(_projectAddress).timesUp()) {
      uint256 nextDeadline = now + validateStatePeriod;
      Project(_projectAddress).setState(4, nextDeadline);
      return true;
    } else {
      return false;
    }
  }

  function checkVoting(address _projectAddress) public returns (bool) {
    require(Project(_projectAddress).state()== 5);
    if(Project(_projectAddress).timesUp()) {
      Project(_projectAddress).setState(4, 0);
      startPoll(_projectAddress, voteCommitPeriod, voteRevealPeriod);
      return true;
    } else {
      return false;
    }
  }

  function checkEnd(address _projectAddress) public returns (bool) {     //don't know where this gets called - maybe separate UI thing
    if(!pollEnded(_projectAddress)) {
      return false;
    } else {
      bool passed = isPassed(_projectAddress);
      handleVoteResult(_projectAddress, passed);
      if (passed) {
        Project(_projectAddress).setState(7, 0);
      }
      else {
        Project(_projectAddress).setState(9, 0);
      }
      return true;
    }
  }

  // =====================================================================
  // OPEN/DISPUTE PROJECT FUNCTIONS
  // =====================================================================

  function addTaskHash(address _projectAddress, bytes32 _ipfsHash) public  {
    Project project = Project(_projectAddress);
    require(project.isStaker(msg.sender) == true);
    require(project.state() == 2 || project.state() == 3);
    if (project.state() == 2) {
      openTaskHash(msg.sender, _projectAddress, _ipfsHash);
    } else {
      uint256 stakerWeight = project.calculateWeightOfAddress(msg.sender);
      disputeTaskHash(msg.sender, _projectAddress, _ipfsHash, stakerWeight);
    }
    checkActive(_projectAddress);
  }

  function openTaskHash(address _staker, address _projectAddress, bytes32 _ipfsHash) internal {
    OpenState storage os = openProjects[_projectAddress];
    if(os.taskHashSubmissions[_staker] == 0) {    //first time submission for this particular address
      os.numTotalSubmissions += 1;
      if (os.first == 0) { os.first = _ipfsHash; }
    } else {                                  //not a first time hash submission
        os.numSubmissions[os.taskHashSubmissions[_staker]] -= 1;
    }
    if (os.first != _ipfsHash) { os.conflict = 1; }
    os.numSubmissions[_ipfsHash] += 1;
    os.taskHashSubmissions[_staker] = _ipfsHash;
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
    require(project.isStaker(msg.sender) == true);
    require(project.state() == 4);
    if (disputedProjects[_projectAddress].topTaskHash != 0) {
      require(keccak256(_hashes) == disputedProjects[_projectAddress].topTaskHash);
    } else {
      require(keccak256(_hashes) == openProjects[_projectAddress].first);
    }
      projectTaskList[_projectAddress] = _hashes;
  }

  // =====================================================================
  // ACTIVE PROJECT
  // =====================================================================
  function claimTask(
    address _projectAddress, uint256 _index, string _taskDescription, uint256 _weiVal, uint256 _reputationVal, address _claimer
  ) public onlyRR() {
    bytes32 taskHash = projectTaskList[_projectAddress][_index];
    Project project = Project(_projectAddress);
    require(taskHash == keccak256(_taskDescription, _weiVal, _reputationVal));
    project.claimTask(taskHash, _weiVal, _reputationVal, _claimer);
  }

  // =====================================================================
  // COMPLETED PROJECT - VALIDATION & VOTING FUNCTIONALITY
  // =====================================================================

  function handleVoteResult(address _projectAddress, bool passed) internal {
    Project project = Project(_projectAddress);
    if(!passed) {               //project fails
      tokenRegistry.burnTokens(project.totalTokensStaked());
      reputationRegistry.burnReputation(project.totalReputationStaked());
      project.clearStake();
      project.setValidateReward(true);
      if (project.validateReward() == 0) {
        project.setValidateFlag(true);
      }
      project.setTotalValidateAffirmative(0);
    }
    else {                                              //project succeeds
      project.setValidateReward(false);
      if (project.validateReward() == 0) {
        project.setValidateFlag(false);
      }
      project.setTotalValidateNegative(0);
    }
  }
}
