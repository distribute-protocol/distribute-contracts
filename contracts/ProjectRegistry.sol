
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
  address rrAddress;
  address dtAddress;
  address trAddress;

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
    address firstSubmitter;
    bytes32 firstSubmission;                                 //used to determine if dispute period needs to happen
    uint256 numTotalSubmissions;
    mapping(address => bytes32) openTaskHashSubmissions;
    mapping(bytes32 => uint256) numSubmissions;
  }

  uint256 taskDiscussionPeriod = 1 weeks;
  uint256 disputePeriod = 1 weeks;


  struct DisputeState {
    bytes32 disputeTopTaskHash;
    mapping(address => bytes32) disputeTaskHashSubmissions;
    mapping(bytes32 => uint256) numSubmissionsByWeight;
  }

  struct ActiveState {
    bytes32[] taskList;
  }

  struct Validation {
    uint256 validateReward;
    bool validateFlag;
  }

  uint256 validationPeriod = 1 weeks;
  uint256 votingCommitPeriod = 1 weeks;
  uint256 votingRevealPeriod = 1 weeks;

  mapping (address => ProposedState) proposedProjects;
  mapping (address => OpenState) openProjects;
  mapping (address => DisputeState) disputedProjects;


  /*mapping(address => Proposer) proposers;                   //project -> Proposer*/

  function ProjectRegistry(address _tokenRegistry, address _reputationRegistry, address _distributeToken, address _plcrVoting) public {       //contract is created
    require(address(tokenRegistry) == 0 && address(reputationRegistry) == 0);
    tokenRegistry = TokenRegistry(_tokenRegistry);
    reputationRegistry = ReputationRegistry(_reputationRegistry);
    plcrVoting = PLCRVoting(_plcrVoting);
    trAddress = _tokenRegistry;
    dtAddress = _distributeToken;
    rrAddress = _reputationRegistry;
    //updateMintingPrice(0);
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
  // GENERAL FUNCTIONS
  // =====================================================================

  function getProposerAddress(address _projectAddress) public view returns (address) {
    return proposedProjects[_projectAddress].proposer;
  }

  function startPoll(address _projectAddress, uint256 _commitDuration, uint256 _revealDuration) public {       //can only be called by project in question
    setPollId(_projectAddress, plcrVoting.startPoll(51, _commitDuration, _revealDuration));
  }

  function setPollId(address _projectAddress, uint256 _pollId) public {
    votingPollId[_projectAddress] = _pollId;
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

  function createProject(uint256 _cost, uint256 _costProportion, uint _numTokens, address _proposer) public {

    Project newProject = new Project(_cost,
                                     _costProportion,
                                     rrAddress,
                                     trAddress,
                                     dtAddress
                                     );
   address _projectAddress = address(newProject);
   setProposer(_projectAddress, _proposer, _numTokens, _cost);
  }

  function setProposer(address _projectAddress, address _proposer, uint256 _proposerStake, uint256 _cost) public onlyTR() {
    // Proposer storage proposer = proposers[_projectAddress];
    proposedProjects[_projectAddress].proposer = _proposer;
    proposedProjects[_projectAddress].proposerStake = _proposerStake;
    proposedProjects[_projectAddress].cost = _cost;
  }

  function refundProposer(address _projectAddress) public onlyTR() returns (uint256[2]) {
    require(now > proposedProjects[_projectAddress].stakingPeriod);
    uint256[2] storage returnValues;
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
    require(Project(_projectAddress).state() == 2 || Project(_projectAddress).state() == 3);
    if(Project(_projectAddress).timesUp()) {
      uint256 nextDeadline;
      if(openProjects[_projectAddress].numTotalSubmissions == openProjects[_projectAddress].numSubmissions[openProjects[_projectAddress].firstSubmission] || Project(_projectAddress).state() == 3) {
        nextDeadline = now + activeStatePeriod;
        Project(_projectAddress).setState(4, nextDeadline);
      } else {
        nextDeadline = now + disputeStatePeriod;
        Project(_projectAddress).setState(3, nextDeadline);
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
      startPoll(_projectAddress, votingCommitPeriod, votingRevealPeriod);
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
