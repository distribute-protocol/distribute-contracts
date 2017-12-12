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

  uint256 workCompletingPeriod = 1 weeks;


  uint256 public projectNonce = 0;                          //no projects in existence when contract initialized
  mapping(uint256 => Projects) public projectId;                    //projectId to project address


  struct Projects {
    address projectAddress;
    uint256 votingPollId;             //for voting
  }

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
  /*modifier projectExists(uint256 _projectId) {
    require(_projectId <= projectNonce && _projectId > 0);
    _;
  }

  modifier isProject(uint256 _projectId) {
      require(projectId[_projectId].projectAddress == msg.sender);
      _;
  }*/

  function projectExists(uint256 _projectId) public view returns (bool) {
    return _projectId <= projectNonce && _projectId > 0;
  }

  // =====================================================================
  // GENERAL FUNCTIONS
  // =====================================================================

  function getProjectAddress(uint256 _id) public view returns (address) {
    require(_id <= projectNonce && _id > 0);
    return projectId[_id].projectAddress;
  }
  function getProposerAddress(address _projectAddress) public view returns (address) {
    return proposedProjects[_projectAddress].proposer;
  }

  function startPoll(uint256 _projectId, uint256 _commitDuration, uint256 _revealDuration) public {       //can only be called by project in question
    setPollId(_projectId, plcrVoting.startPoll(50, _commitDuration, _revealDuration));
  }

  function getPollId(uint256 _id) public view returns (uint256) {
    require(_id <= projectNonce && _id > 0);
    return projectId[_id].votingPollId;
  }

  function setPollId(uint256 _projectId, uint256 _pollID) public {
    Projects storage project = projectId[_projectId];
    project.votingPollId = _pollID;
  }

  function setProject(uint256 _projectNonce, address _projectAddress) public onlyTR() {
    Projects storage project = projectId[_projectNonce];
    project.projectAddress = _projectAddress;
  }
  function incrementProjectNonce() public onlyTR() {
    projectNonce += 1;
  }
  function pollEnded(uint256 _projectId) public view returns (bool) {
    return plcrVoting.pollEnded(getPollId(_projectId));
  }

  function isPassed(uint256 _projectId) public {
    bool passed = plcrVoting.isPassed(getPollId(_projectId));
    Project(projectId[_projectId].projectAddress).rewardValidator(passed);
    //set to complete or failed
  }


  // =====================================================================
  // PROPOSER FUNCTIONS
  // =====================================================================

  function createProject(uint256 _cost, uint256 _costProportion, uint _numTokens) public {

    Project newProject = new Project(_cost,
                                     _costProportion,
                                     rrAddress,
                                     trAddress,
                                     dtAddress
                                     );
   address _projectAddress = address(newProject);
   /*proposerTokenCost*/
   incrementProjectNonce();
   setProject(projectNonce, _projectAddress);
   setProposer(_projectAddress, msg.sender, _numTokens, _cost);
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
}
