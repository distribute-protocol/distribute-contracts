pragma solidity ^0.4.10;

//import files
import "./TokenRegistry.sol";
import "./ReputationRegistry.sol";
import "./DistributeToken.sol";

/*
  a created project
*/

contract Project {

// =====================================================================
// STATE VARIABLES
// =====================================================================

  //GENERAL STATE VARIABLES
  TokenRegistry tokenRegistry;
  ReputationRegistry reputationRegistry;
  DistributeToken distributeToken;
/*
  uint256 taskDiscussionPeriod = 1 weeks;
  uint256 disputePeriod = 1 weeks; //length of dispute period - may not reach this point*/

  /*struct ProposedState {
    //PROPOSED PERIOD STATE VARIABLES
    uint256 proposerStake;                 //amount of capital tokens the proposer stakes (5% of project ETH cost in tokens, exchanged from ETH at time of proposal)
    uint256 stakingPeriod;
  }*/



  /*mapping (address => ProposedState) proposedProjects;
  mapping (address => OpenState) openProjects;*/

  //project id of this particular project, to be held in mapping in PR

                 //set by proposer at time of proposal

  //OPEN/DISPUTE PERIOD STATE VARIABLES

  //dispute


  //ACTIVE PERIOD



  //VALIDATION PERIOD

  /*uint256 validationPeriod = 1 weeks;*/



  //VOTING PERIOD
  /*uint256 votingCommitPeriod = 1 weeks;
  uint256 votingRevealPeriod = 1 weeks;*/

  //project states & deadlines
  /*State public projectState;*/
  /*enum State {
    1: Proposed,
    2: Open,
    3: Dispute,
    4: Active,
    5: Validating,
    6: Voting,
    7: Complete,
    8: Incomplete,
    9: Failed
  }*/

// =====================================================================
// EVENTS
// =====================================================================

// =====================================================================
// MODIFIERS
// =====================================================================

  /*modifier onlyInState(State _state) {
    require(projectState == _state);
    _;
  }

  modifier onlyTR() {
    require(msg.sender == address(tokenRegistry));
    _;
  }

  modifier onlyRR() {
    require(msg.sender == address(reputationRegistry));
    _;
  }

  modifier isStaker(address _address) {
    require(stakedTokenBalances[_address] > 0 || stakedReputationBalances[_address] > 0);
    _;
  }*/
// =====================================================================
// FUNCTIONS
// =====================================================================

  // =====================================================================
  // CONSTRUCTOR
  // =====================================================================

  /*function Project(uint256 _id, uint256 _cost, uint256 _stakingPeriod, uint256 _proposerTokenStake, uint256 _costProportion, address _rr, address _dt) public {       //called by THR
    //all checks done in THR first
    tokenRegistry = TokenRegistry(msg.sender);     //the token holder registry calls this function
    reputationRegistry = ReputationRegistry(_rr);
    distributeToken = DistributeToken(_dt);
    projectId = _id;
    weiCost = _cost;
    stakingPeriod = now + _stakingPeriod;
    projectState = State.Proposed;
    proposerTokenStake = _proposerTokenStake;
    totalTokensStaked = 0;
    totalReputationStaked = 0;
    reputationCost = _costProportion * reputationRegistry.totalFreeReputationSupply();
  }*/

  // =====================================================================
  // GENERAL FUNCTIONS
  // =====================================================================



  // =====================================================================
  // PROPOSED PROJECT
  // =====================================================================





  // =====================================================================
  // OPEN/DISPUTE PROJECT FUNCTIONS
  // =====================================================================

  function addTaskHash(bytes32 _ipfsHash, address _address) public isStaker(_address) {
    require(projectState == State.Open || projectState == State.Dispute);
    require(msg.sender == address(tokenRegistry) ||  msg.sender == address(reputationRegistry));
    if (projectState == State.Open) {
      if(openTaskHashSubmissions[_address] == 0) {    //first time submission for this particular address
        if(firstSubmission == 0) {                    //first hash submission at all?
            firstSubmission = _ipfsHash;
            firstSubmitter = _address;
        }
        numSubmissions[_ipfsHash] += 1;
        numTotalSubmissions += 1;
      } else {                                     //not a first time hash submission
        if(firstSubmitter == _address) {      //first hash submitter resubmits?
          firstSubmission = _ipfsHash;
        }
        bytes32 temp = openTaskHashSubmissions[_address];
        numSubmissions[temp] -= 1;
        numSubmissions[_ipfsHash] += 1;
      }
      openTaskHashSubmissions[_address] == _ipfsHash;
    } else {
      if(disputeTaskHashSubmissions[_address] != 0) {   //first time submission for this particular address
        bytes32 temp2 = disputeTaskHashSubmissions[_address];
        numSubmissionsByWeight[temp2] -= calculateWeightOfAddress(_address);
      }
      numSubmissionsByWeight[_ipfsHash] += calculateWeightOfAddress(_address);
      disputeTaskHashSubmissions[_address] = _ipfsHash;
      if(numSubmissionsByWeight[_ipfsHash] > numSubmissionsByWeight[disputeTopTaskHash]) {
        disputeTopTaskHash = _ipfsHash;
      }
    }
    checkActive();
  }

  function calculateWeightOfAddress(address _address) internal view returns (uint256) {
    return (stakedReputationBalances[_address] + stakedTokenBalances[_address]);
  }

  // =====================================================================
  // ACTIVE PROJECT
  // =====================================================================


  function submitHashList(bytes32[] _hashes) onlyInState(State.Active) public {
    require(msg.sender == address(tokenRegistry) ||  msg.sender == address(reputationRegistry));
    if (disputeTopTaskHash != 0) {
      require(keccak256(_hashes) == disputeTopTaskHash);
    } else {
      require(keccak256(_hashes) == firstSubmission);
    }
      taskList = _hashes;
  }

  struct Reward {
    uint256 weiReward;
    uint256 reputationReward;
    address claimer;
  }

  mapping(bytes32 => Reward) taskRewards;       //hash to worker rewards

  function claimTask(uint256 _index, string _taskDescription, uint256 _weiVal, uint256 _tokenVal, address _address) public onlyRR() onlyInState(State.Active) {
    require(taskList[_index] == keccak256(_taskDescription, _weiVal, _tokenVal));
    require(taskRewards[taskList[_index]].claimer == 0);
    taskRewards[taskList[_index]].claimer = _address;
    taskRewards[taskList[_index]].weiReward = _weiVal;
    taskRewards[taskList[_index]].reputationReward = _tokenVal;
  }

  // =====================================================================
  // COMPLETED PROJECT - VALIDATION & VOTING FUNCTIONALITY
  // =====================================================================


  function handleVoteResult(bool passed) internal {
    if(!passed) {               //project fails
      tokenRegistry.burnTokens(projectId, totalTokensStaked);
      reputationRegistry.burnReputation(projectId, totalReputationStaked);
      totalTokensStaked = 0;
      totalReputationStaked = 0;
      validateReward = totalValidateAffirmative;
      if (validateReward == 0) {
        validateFlag = true;
      }
      totalValidateAffirmative = 0;
    }
    else {                                              //project succeeds
      validateReward = totalValidateNegative;
      if (validateReward == 0) {
        validateFlag = true;
      }
      totalValidateNegative = 0;
    }
  }

  // =====================================================================
  // VALIDATED / FAILED PROJECT
  // =====================================================================


  function claimTaskReward(bytes32 _taskHash, address _address) public onlyRR() onlyInState(State.Complete) returns (uint256) {
    require(taskRewards[_taskHash].claimer == _address);
    uint256 weiTemp = taskRewards[_taskHash].weiReward;
    uint256 tokenTemp = taskRewards[_taskHash].reputationReward;
    taskRewards[_taskHash].claimer = 0;
    taskRewards[_taskHash].weiReward = 0;
    taskRewards[_taskHash].reputationReward = 0;
    _address.transfer(weiTemp);
    return tokenTemp;
  }



}
