pragma solidity ^0.4.10;

//import files
import "./TokenHolderRegistry.sol";
import "./WorkerRegistry.sol";

/*
  a created project
*/

contract Project {

// =====================================================================
// STATE VARIABLES
// =====================================================================

  //GENERAL STATE VARIABLES
  TokenHolderRegistry tokenHolderRegistry;    //connect to THR
  WorkerRegistry workerRegistry;              //connect to WR

  uint256 projectId;                          //project id of this particular project, to be held in mapping in THR

  uint256 public weiCost;                     //set by proposer, total cost of project in ETH, to be fulfilled by capital token holders
  uint256 workerTokenCost;                    //total amount of staked worker tokens needed, TBD

  uint256 nextDeadline;

  //PROPOSED PERIOD STATE VARIABLES
  uint256 proposerTokenStake;                 //amount of capital tokens the proposer stakes (5% of project ETH cost in tokens, exchanged from ETH at time of proposal)
  uint256 stakingPeriod;                      //set by proposer at time of proposal

  uint256 totalWeiStaked;                     //amount of wei currently staked
  uint256 totalCapitalTokensStaked;           //amount of capital tokens currently staked
  uint256 totalWorkerTokensStaked;            //amount of worker tokens currently staked
  mapping (address => uint) stakedCapitalTokenBalances;
  mapping (address => uint) stakedWorkerTokenBalances;

  //OPEN PERIOD STATE VARIABLES
  uint256 taskDiscussionPeriod = 1 weeks;
  uint256 disputePeriod = 1 weeks;                      //length of dispute period - may not reach this point

  bytes32[] taskHashSubmissions;

  //ACTIVE PERIOD
  uint256 workCompletingPeriod = 1 weeks;

  //VALIDATION PERIOD
  mapping (address => uint) validatedAffirmative;
  mapping (address => uint) validatedNegative;
  uint256 totalValidateAffirmative;
  uint256 totalValidateNegative;

  uint256 validationPeriod = 1 weeks;

  uint256 validateReward;
  bool validateFlag = false;            //turn this on if there were no opposing validators

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

  modifier onlyTHR() {
    require(msg.sender == address(tokenHolderRegistry));
    _;
  }

  modifier onlyWR() {
    require(msg.sender == address(workerRegistry));
    _;
  }

  modifier isStaker(address _address) {
    require(stakedCapitalTokenBalances[_address] > 0 || stakedWorkerTokenBalances[_address] > 0);
    _;
  }
// =====================================================================
// FUNCTIONS
// =====================================================================

  // =====================================================================
  // CONSTRUCTOR
  // =====================================================================

  function Project(uint256 _id, uint256 _cost, uint256 _stakingPeriod, uint256 _proposerTokenStake, uint256 _costProportion, address _wr) public {       //called by THR
    //all checks done in THR first
    tokenHolderRegistry = TokenHolderRegistry(msg.sender);     //the token holder registry calls this function
    workerRegistry = WorkerRegistry(_wr);
    projectId = _id;
    weiCost = _cost;
    stakingPeriod = now + _stakingPeriod;
    projectState = State.Proposed;
    proposerTokenStake = _proposerTokenStake;
    totalCapitalTokensStaked = 0;
    totalWorkerTokensStaked = 0;
    workerTokenCost = _costProportion * workerRegistry.totalFreeWorkerTokenSupply();
  }

  // =====================================================================
  // GENERAL FUNCTIONS
  // =====================================================================

  function timesUp() internal returns (bool) {
    return (now > nextDeadline);
  }

  // =====================================================================
  // PROPOSED PROJECT
  // =====================================================================

  function refundProposer() public onlyTHR() returns (uint256 _proposerTokenStake) {   //called by THR, decrements proposer tokens in Project.sol
    require(projectState != State.Proposed && proposerTokenStake != 0);         //make sure out of proposed state & msg.sender is the proposer
    uint256 temp = proposerTokenStake;
    proposerTokenStake = 0;
    return temp;
  }

  function isStaked() internal returns (bool) {
    return (weiCost >= totalWeiStaked && workerTokenCost >= totalWorkerTokensStaked);
  }

  function checkOpen() onlyInState(State.Proposed) internal returns (bool) {
    if(isStaked()) {
      projectState = State.Open;
      nextDeadline = now + taskDiscussionPeriod;
      return true;
    } else if(timesUp()) {
      projectState = State.Failed;
      proposerTokenStake = 0;
      return true;
    } else {
      return false;
    }
  }

  function stakeCapitalToken(uint256 _tokens, address _staker, uint256 _weiVal) public onlyTHR() onlyInState(State.Proposed) returns (uint256) {  //called by THR, increments _staker tokens in Project.sol
    require(!checkOpen());     //check to make sure ethBal hasn't been fulfilled
    require(weiCost > totalWeiStaked);
    if (weiCost >= _weiVal + totalWeiStaked) {
      stakedCapitalTokenBalances[_staker] += _tokens;
      totalCapitalTokensStaked += _tokens;
      totalWeiStaked += _weiVal;
      checkOpen();
      return 0;
    } else {
      uint256 weiOver = totalWeiStaked + _weiVal - weiCost;
      uint256 tokensOver = (weiOver / _weiVal) * _tokens;
      tokenHolderRegistry.transfer(weiOver);
      stakedCapitalTokenBalances[_staker] += _tokens - tokensOver;
      totalCapitalTokensStaked += _tokens - tokensOver;
      totalWeiStaked += _weiVal - weiOver;
      checkOpen();
      return tokensOver;
    }
  }

  function unstakeCapitalToken(uint256 _tokens, address _staker) public onlyTHR() onlyInState(State.Proposed) {    //called by THR only, decrements _staker tokens in Project.sol
    require(!checkOpen());
    require(stakedCapitalTokenBalances[_staker] - _tokens < stakedCapitalTokenBalances[_staker] &&   //check overflow
         stakedCapitalTokenBalances[_staker] - _tokens >= 0);   //make sure _staker has the tokens staked to unstake
    stakedCapitalTokenBalances[_staker] -= _tokens;
    totalCapitalTokensStaked -= _tokens;
    tokenHolderRegistry.transfer(_tokens/totalCapitalTokensStaked * weiCost);
  }

  function stakeWorkerToken(uint256 _tokens, address _staker) public onlyWR() onlyInState(State.Proposed) {
    require(!checkOpen());
    require(workerTokenCost > totalWorkerTokensStaked);
    require(stakedWorkerTokenBalances[_staker] + _tokens > stakedWorkerTokenBalances[_staker]);
    stakedWorkerTokenBalances[_staker] += _tokens;
    checkOpen();
  }

  function unstakeWorkerToken(uint256 _tokens, address _staker) public onlyWR() onlyInState(State.Proposed) {
    require(!checkOpen());
    require(stakedWorkerTokenBalances[_staker] - _tokens < stakedWorkerTokenBalances[_staker] &&   //check overflow
         stakedWorkerTokenBalances[_staker] - _tokens >= 0);   //make sure _staker has the tokens staked to unstake
    stakedWorkerTokenBalances[_staker] -= _tokens;
  }

  // =====================================================================
  // OPEN/DISPUTE PROJECT FUNCTIONS
  // =====================================================================
  /*function submitTaskList(Task[] tasksList) public isStaker() returns (bool success) {
    submittedTasks[msg.sender] = tasksList;
    return true;
  }*/

  function checkActive() internal returns (bool) {
    require(projectState == State.Open || projectState == State.Dispute);
    if (projectState == State.Open) {
      if(timesUp()) {
        if(taskHashSubmissions.length == 1) {
          projectState = State.Active;
          nextDeadline = now + workCompletingPeriod;
          return true;
        } else {
        projectState = State.Dispute;
        nextDeadline = now + disputePeriod;
        return true;
        }
      } else {
        return false;
      }
    } else {          //if projectState == State.Dispute
      if(timesUp()) {
        projectState = State.Active;
        nextDeadline = now + workCompletingPeriod;
        return true;
      } else {
        return false;
      }
    }
  }

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


  function addTaskHash(bytes32 _ipfsHash, address _address) public isStaker(_address) {
    require(projectState == State.Open || projectState == State.Dispute);
    require(msg.sender == address(tokenHolderRegistry) ||  msg.sender == address(workerRegistry));
    if (projectState == State.Open) {
      checkActive();
      if(openTaskHashSubmissions[_address] == 0) {    //first time submission for this particular address
        if(firstSubmission == 0) {                    //first hash submission at all?
            firstSubmission = _ipfsHash;
            firstSubmitter = _address;
        }
        openTaskHashSubmissions[_address] == _ipfsHash;
        numSubmissions[_ipfsHash] += 1;
        numTotalSubmissions += 1;
      } else {                                     //not a first time hash submission
        if(firstSubmitter == _address) {      //first hash submitter resubmits?
          firstSubmission = _ipfsHash;
        }
        bytes32 temp = openTaskHashSubmissions[_address];
        openTaskHashSubmissions[_address] == _ipfsHash;
        numSubmissions[temp] -= 1;
        numSubmissions[_ipfsHash] += 1;
      }
    } else {
      checkActive();
      if(disputeTaskHashSubmissions[_address] == 0) {   //first time submission for this particular address
        disputeTaskHashSubmissions[_address] = _ipfsHash;
        numSubmissionsByWeight[_ipfsHash] += calculateWeightOfAddress(_address);
      } else {
        bytes32 temp2 = disputeTaskHashSubmissions[_address];
        disputeTaskHashSubmissions[_address] = _ipfsHash;
        numSubmissionsByWeight[temp2] -= calculateWeightOfAddress(_address);
        numSubmissionsByWeight[_ipfsHash] += calculateWeightOfAddress(_address);
      }
      if(numSubmissionsByWeight[_ipfsHash] > numSubmissionsByWeight[disputeTopTaskHash]) {
        disputeTopTaskHash = _ipfsHash;
      }
    }
  }

  function calculateWeightOfAddress(address _address) internal view returns (uint256) {
    return (stakedWorkerTokenBalances[_address] + stakedCapitalTokenBalances[_address]);
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

  // =====================================================================
  // COMPLETED PROJECT - VALIDATION & VOTING FUNCTIONALITY
  // =====================================================================


  function checkVoting() public onlyInState(State.Validating) returns (bool) {
    if(timesUp()) {
      projectState = State.Voting;
      tokenHolderRegistry.startPoll(projectId, votingCommitPeriod, votingRevealPeriod);
      nextDeadline = now + votingCommitPeriod;
      return true;
    } else {
      return false;
    }
  }

  function validate(address _staker, uint256 _tokens, bool _validationState) public onlyTHR() onlyInState(State.Validating) {
    //checks for free tokens done in THR
    //increments validation tokens in Project.sol only
    require(checkVoting() == false);
    if (_validationState == true && validatedAffirmative[_staker] + _tokens > validatedAffirmative[_staker] && totalValidateAffirmative + _tokens > totalValidateAffirmative) {
      validatedAffirmative[_staker] += _tokens;
      totalValidateAffirmative += _tokens;
    }
    else if (_validationState == false && validatedNegative[_staker] + _tokens > validatedNegative[_staker] && totalValidateNegative + _tokens > totalValidateNegative){
      validatedNegative[msg.sender] += _tokens;
      totalValidateNegative += _tokens;
    }
  }

  function checkEnd() public onlyInState(State.Voting) returns (bool) {     //don't know where this gets called - maybe separate UI thing
    if(!tokenHolderRegistry.pollEnded(projectId)) {
      return false;
    }
    else {
      bool passed = tokenHolderRegistry.isPassed(projectId);
      handleVoteResult(passed);
      if (passed) {
        projectState = State.Complete;
        return true;
      }
      else {
        projectState = State.Failed;
        return true;
      }
    }
  }

  function handleVoteResult(bool passed) internal {
    if(!passed) {               //project fails
      tokenHolderRegistry.burnTokens(projectId, totalCapitalTokensStaked);
      WorkerRegistry(workerRegistry).burnTokens(projectId, totalWorkerTokensStaked);
      totalCapitalTokensStaked = 0;
      totalWorkerTokensStaked = 0;
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
      totalValidateNegative = 0;
      }
    }
  }

  // =====================================================================
  // VALIDATED / FAILED PROJECT
  // =====================================================================

  function refundStaker(address _staker) public returns (uint256 _refund) {  //called by THR or WR, allow return of staked, validated, and
    require(msg.sender == address(tokenHolderRegistry) ||  msg.sender == address(workerRegistry));
    require(projectState == State.Complete || projectState == State.Failed);
    uint256 refund;     //tokens
    uint256 spoils;     //wei
    if (msg.sender == address(tokenHolderRegistry)) {

      if(totalCapitalTokensStaked != 0) {
        refund = stakedCapitalTokenBalances[_staker];
        stakedCapitalTokenBalances[_staker] = 0;
      }

      if(totalValidateNegative != 0) {
        refund += validatedNegative[_staker];
        if (validateFlag == false) {
          refund += validateReward * validatedNegative[_staker] / totalValidateNegative;
        }
        else if (validateFlag == true) {
          spoils = weiCost * validatedNegative[_staker] / totalValidateNegative;
          tokenHolderRegistry.rewardValidator(projectId, _staker, spoils);
        }
        validatedNegative[_staker] = 0;
      }

      if(totalValidateAffirmative != 0) {
        refund += validatedAffirmative[_staker];
        if (validateFlag == false) {
          refund += validateReward * validatedAffirmative[_staker] / totalValidateAffirmative;
        }
        else if (validateFlag == true) {
          spoils = weiCost * validatedAffirmative[_staker] / totalValidateAffirmative;
          tokenHolderRegistry.rewardValidator(projectId, _staker, spoils);
        }
        validatedAffirmative[_staker] = 0;
      }

      return refund;
    }

    else if (msg.sender == address(workerRegistry)) {
      if(totalWorkerTokensStaked != 0) {
        refund = stakedWorkerTokenBalances[_staker];
        stakedWorkerTokenBalances[_staker] = 0;
      }

      return refund;
    }
  }

  function rewardWorker(address _staker, uint256 _tokens, uint256 _wei) public onlyWR() onlyInState(State.Complete) returns (uint256 _reward) {
    //write
  }
  function() payable {

  }
}
