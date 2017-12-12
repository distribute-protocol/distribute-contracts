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

  //project id of this particular project, to be held in mapping in PR
  uint256 projectId;

  //set by proposer, total cost of project in ETH, to be fulfilled by capital token holders
  uint256 public weiCost;
  //total amount of staked worker tokens needed, TBD
  uint256 reputationCost;

  uint256 nextDeadline;

  //PROPOSED PERIOD STATE VARIABLES
  uint256 proposerTokenStake;                 //amount of capital tokens the proposer stakes (5% of project ETH cost in tokens, exchanged from ETH at time of proposal)
  uint256 stakingPeriod;                      //set by proposer at time of proposal

  uint256 totalWeiStaked;                     //amount of wei currently staked
  uint256 totalTokensStaked;           //amount of capital tokens currently staked
  uint256 totalReputationStaked;            //amount of worker tokens currently staked
  mapping (address => uint) stakedTokenBalances;
  mapping (address => uint) stakedReputationBalances;

  //OPEN/DISPUTE PERIOD STATE VARIABLES
  uint256 taskDiscussionPeriod = 1 weeks;
  uint256 disputePeriod = 1 weeks;                      //length of dispute period - may not reach this point

  //open
  address firstSubmitter;
  bytes32 firstSubmission;                                 //used to determine if dispute period needs to happen
  uint256 numTotalSubmissions;
  mapping(address => bytes32) openTaskHashSubmissions;
  mapping(bytes32 => uint256) numSubmissions;

  //dispute
  bytes32 disputeTopTaskHash;
  mapping(address => bytes32) disputeTaskHashSubmissions;
  mapping(bytes32 => uint256) numSubmissionsByWeight;

  //ACTIVE PERIOD
  uint256 workCompletingPeriod = 1 weeks;
  bytes32[] taskList;

  //VALIDATION PERIOD
  struct Validator {
    uint256 status;
    uint256 stake;
  }
  mapping (address => Validator) validators;
  uint256 totalValidateAffirmative;
  uint256 totalValidateNegative;
  uint256 validationPeriod = 1 weeks;
  uint256 validateReward;
  bool validateFlag = false;

  //VOTING PERIOD
  uint256 votingCommitPeriod = 1 weeks;
  uint256 votingRevealPeriod = 1 weeks;

  //project states & deadlines
  State public projectState;
  enum State {
    Proposed,
    Open,
    Dispute,
    Active,
    Validating,
    Voting,
    Complete,
    Incomplete,
    Failed
  }

// =====================================================================
// EVENTS
// =====================================================================

// =====================================================================
// MODIFIERS
// =====================================================================

  modifier onlyInState(State _state) {
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
  }
// =====================================================================
// FUNCTIONS
// =====================================================================

  // =====================================================================
  // CONSTRUCTOR
  // =====================================================================

  function Project(uint256 _id, uint256 _cost, uint256 _stakingPeriod, uint256 _proposerTokenStake, uint256 _costProportion, address _rr, address _dt) public {       //called by THR
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
  }

  // =====================================================================
  // GENERAL FUNCTIONS
  // =====================================================================

  function timesUp() internal view returns (bool) {
    return (now > nextDeadline);
  }

  // =====================================================================
  // PROPOSED PROJECT
  // =====================================================================

  function refundProposer() public onlyTR() returns (uint256 _proposerTokenStake) {   //called by THR, decrements proposer tokens in Project.sol
    require(projectState == State.Open && proposerTokenStake != 0);         //make sure out of proposed state & msg.sender is the proposer
    uint256 temp = proposerTokenStake;
    proposerTokenStake = 0;
    return temp;
  }

  function isStaked() internal view returns (bool) {
    return (weiCost >= totalWeiStaked && reputationCost >= totalReputationStaked);
  }

  function checkOpen() onlyInState(State.Proposed) internal returns (bool) {
    if(isStaked()) {
      projectState = State.Open;
      nextDeadline = now + taskDiscussionPeriod;
      return true;
    } else if(timesUp()) {
      projectState = State.Failed;
      proposerTokenStake = 0;
      return false;
    } else {
      return false;
    }
  }

  function stakeToken(uint256 _tokens, address _staker, uint256 _weiVal) public onlyTR() onlyInState(State.Proposed) returns (uint256) {  //called by THR, increments _staker tokens in Project.sol
    uint256 tokensOver = 0;
    /*require(weiCost > totalWeiStaked);*/
    if (weiCost >= _weiVal + totalWeiStaked) {
      stakedTokenBalances[_staker] += _tokens;
      totalTokensStaked += _tokens;
      totalWeiStaked += _weiVal;
    } else {
      uint256 weiOver = totalWeiStaked + _weiVal - weiCost;
      tokensOver = (weiOver / _weiVal) * _tokens;
      distributeToken.transfer(weiOver);
      stakedTokenBalances[_staker] += _tokens - tokensOver;
      totalTokensStaked += _tokens - tokensOver;
      totalWeiStaked += _weiVal - weiOver;
    }
    checkOpen();
    return tokensOver;
  }

  function unstakeToken(uint256 _tokens, address _staker) public onlyTR() onlyInState(State.Proposed) returns (uint256) {    //called by THR only, decrements _staker tokens in Project.sol
    require(stakedTokenBalances[_staker] - _tokens < stakedTokenBalances[_staker] &&   //check overflow
         stakedTokenBalances[_staker] > _tokens);   //make sure _staker has the tokens staked to unstake
    stakedTokenBalances[_staker] -= _tokens;
    totalTokensStaked -= _tokens;
    distributeToken.transfer((_tokens / totalTokensStaked) * weiCost);
  }

  function stakeReputation(uint256 _tokens, address _staker) public onlyRR() onlyInState(State.Proposed) {
    // require(reputationCost > totalReputationStaked); I don't think this can be reached, because it would move to Open after
    /*require(stakedReputationBalances[_staker] + _tokens > stakedReputationBalances[_staker]);*/
    require(_tokens > 0);
    stakedReputationBalances[_staker] += _tokens;
    checkOpen();
  }

  function unstakeReputation(uint256 _tokens, address _staker) public onlyRR() onlyInState(State.Proposed) {
    require(stakedReputationBalances[_staker] - _tokens < stakedReputationBalances[_staker] &&  //check overflow /
      stakedReputationBalances[_staker] > _tokens); //make sure _staker has the tokens staked to unstake
    stakedReputationBalances[_staker] -= _tokens;
  }

  // =====================================================================
  // OPEN/DISPUTE PROJECT FUNCTIONS
  // =====================================================================

  function checkActive() internal returns (bool) {
    require(projectState == State.Open || projectState == State.Dispute);
    if(timesUp()) {
      if(numTotalSubmissions == numSubmissions[firstSubmission] || projectState == State.Dispute) {         //FIX THIS AHH
        projectState = State.Active;
        nextDeadline = now + workCompletingPeriod;
      } else {
        projectState = State.Dispute;
        nextDeadline = now + disputePeriod;
      }
      return true;
    } else {
      return false;
    }
  }

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

  function checkValidate() internal onlyInState(State.Active) returns (bool) {
    if (timesUp()) {
      projectState = State.Validating;
      nextDeadline = now + validationPeriod;
      return true;
    } else {
      return false;
    }
  }

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


  function checkVoting() public onlyInState(State.Validating) returns (bool) {
    if(timesUp()) {
      projectState = State.Voting;
      tokenRegistry.startPoll(projectId, votingCommitPeriod, votingRevealPeriod);
      nextDeadline = now + votingCommitPeriod;
      return true;
    } else {
      return false;
    }
  }

  function validate(address _staker, uint256 _tokens, bool _validationState) public onlyTR() onlyInState(State.Validating) {
    //checks for free tokens done in THR
    //increments validation tokens in Project.sol only
    require(!checkVoting());
    if (_tokens > 0) {
      if (_validationState == true) {
        validators[_staker] = Validator(1, _tokens);
        totalValidateAffirmative += _tokens;
      }
      else if (_validationState == false){
        validators[_staker] = Validator(0, _tokens);
        totalValidateNegative += _tokens;
      }
    }
  }

  function checkEnd() public onlyInState(State.Voting) returns (bool) {     //don't know where this gets called - maybe separate UI thing
    if(!tokenRegistry.pollEnded(projectId)) {
      return false;
    }
    else {
      bool passed = tokenRegistry.isPassed(projectId);
      handleVoteResult(passed);
      if (passed) {
        projectState = State.Complete;
      }
      else {
        projectState = State.Failed;
      }
      return true;
    }
  }

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

  function refundStaker(address _staker) public returns (uint256 _refund) {  //called by THR or WR, allow return of staked, validated, and
    require(msg.sender == address(tokenRegistry) ||  msg.sender == address(reputationRegistry));
    require(projectState == State.Complete || projectState == State.Failed);
    uint256 refund;     //tokens
    if (msg.sender == address(tokenRegistry)) {
      if(totalTokensStaked != 0) {
        refund = stakedTokenBalances[_staker];
        stakedTokenBalances[_staker] = 0;
      }
      if(totalValidateNegative != 0 || totalValidateAffirmative != 0) {
        refund += validators[_staker].stake;
        uint256 denom;
        if (projectState == State.Failed) {
          denom = totalValidateNegative;
        } else {
          denom = totalValidateAffirmative;
        }
        if (validateFlag == false) {
          refund += validateReward * validators[_staker].stake / denom;
        } else {
          tokenRegistry.rewardValidator(projectId, _staker, (weiCost * validators[_staker].stake / denom));
        }
        validators[_staker].stake = 0;
      }
    } else if (msg.sender == address(reputationRegistry)) {
      if(totalReputationStaked != 0) {
        refund = stakedReputationBalances[_staker];
        stakedReputationBalances[_staker] = 0;
      }
    }
    return refund;
  }
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

  function() public payable {

  }

}
