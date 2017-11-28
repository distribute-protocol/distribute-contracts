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

  taskHash[] taskHashSubmissions;                       //used to determine

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
    VotingCommit,
    VotingReveal,
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

  modifier onlyBefore(uint256 time) {
    require(now < time);
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

  modifier isStaker() {
    require(stakedCapitalTokenBalances[msg.sender] > 0 || stakedWorkerTokenBalances[msg.sender] > 0);
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
    projectId = _id;
    weiCost = _cost;
    stakingPeriod = now + _stakingPeriod;
    projectState = State.Proposed;
    proposerTokenStake = _proposerTokenStake;
    totalWorkerTokensStaked = 0;
    workerRegistry = workerRegistry(_wr);
    workerTokenCost = _costProportion * workerRegistry.totalFreeWorkerTokenSupply;
  }

  // =====================================================================
  // GENERAL FUNCTIONS
  // =====================================================================

/*
  function checkStateChange() internal returns (bool stateChange) {                              //general state change function
    if (projectState == State.Proposed) {
      if (totalCapitalTokensStaked >= capitalTokenCost && totalWorkerTokensStaked >= workerTokenCost)
        {
          projectState = State.Active;
          return true;
        }
        else {
          return false;
      }
    }

    else if (projectState == State.Active) {
      for (uint256 i = 0; i < tasks.length; i++) {
        if (tasks[i].taskComplete == false) {
          if (now > projectDeadline) {
            projectState = State.Incomplete;
            return true;
          }
          return false;
        }
      }
      validationStart = now;
      projectState = State.Validating;
      return true;
      }

    else if (projectState == State.Validating) {
      if(now > validationStart + validationPeriod) {
        tokenHolderRegistry.startPoll(projectId, 604800, 604800);   //1 week commit, 1 week reveal
        projectState = State.Voting;
        return true;
      }
      else {
        return false;
      }
    }

    else if (projectState == State.Voting) {
      //call TokenHolderRegistry to call PLCR to see if the commit & reveal period is over
      if(!tokenHolderRegistry.pollEnded(projectId)) {
        return false;
      }
      else {
        bool passed = tokenHolderRegistry.isPassed(projectId);
        handleVoteResult(passed);
        if (passed) {
          projectState = State.Validated;
        }
        else {
          projectState = State.Failed;
        }
        return true;
      }
    }
  }

*/
  // =====================================================================
  // PROPOSED PROJECT - STAKING FUNCTIONS
  // =====================================================================

  function refundProposer() public onlyTHR() returns (uint256 _proposerTokenStake) {   //called by THR, decrements proposer tokens in Project.sol
    require(projectState != State.Proposed && proposerTokenStake != 0);         //make sure out of proposed state & msg.sender is the proposer
    uint256 temp = proposerTokenStake;
    proposerTokenStake = 0;
    return temp;
  }

  function stakeCapitalToken(uint256 _tokens, address _staker, uint256 _weiVal) public onlyTHR() onlyInState(State.Proposed) returns (uint256 excess) {  //called by THR, increments _staker tokens in Project.sol
    require(!checkOpen());     //check to make sure ethBal hasn't been fulfilled
    require(weiCost > totalWeiStaked);
    if (weiCost > _weiVal + totalWeiStaked) {
      stakedCapitalTokenBalances[_staker] += _tokens;
      totalCapitalTokensStaked += _tokens;
      totalWeiStaked += _weiVal;
      checkOpen();
      return 0;
    } else {
      uint256 weiOver = totalWeiStaked + _weiVal - weiCost;
      uint256 tokensOver = (weiOver / _weiVal) * _tokens;
      THR.transfer(weiOver);
      stakedCapitalTokenBalances[_staker] += _tokens - tokensOver;
      totalCapitalTokensStaked += _tokens - tokensOver;
      totalWeiStaked += _weiVal - weiOver;
      checkOpen();
      return tokensOver;
    }
  }

  function unstakeCapitalToken(uint256 _tokens, address _staker) public onlyTHR() onlyInState(State.Proposed) {    //called by THR only, decrements _staker tokens in Project.sol
    require(!checkOpen());
    require(weiCost > totalWeiStaked &&
         stakedCapitalTokenBalances[_staker] - _tokens < stakedCapitalTokenBalances[_staker] &&   //check overflow
         stakedCapitalTokenBalances[_staker] - _tokens >= 0);   //make sure _staker has the tokens staked to unstake
    stakedCapitalTokenBalances[_staker] -= _tokens;
    totalCapitalTokensStaked -= _tokens;
    THR.transfer(_tokens/totalCapitalTokensStaked * weiCost);
  }

  function stakeWorkerToken(uint256 _tokens, address _staker) public onlyWR() onlyInState(State.Proposed) onlyBefore(projectDeadline) returns (bool success) {
    require(!checkOpen());
    require(workerTokenCost > totalWorkerTokenSupply);
    if (checkStateChange() == false &&
         stakedWorkerTokenBalances[_staker] + _tokens > stakedWorkerTokenBalances[_staker]) {
        stakedWorkerTokenBalances[_staker] += _tokens;
        return true;
    } else {
      return false;
    }
  }

  function unstakeWorkerToken(uint256 _tokens, address _staker) public onlyWR() onlyInState(State.Proposed) onlyBefore(projectDeadline) returns (bool success) {
    if (checkStateChange() == false &&
         stakedWorkerTokenBalances[_staker] - _tokens < stakedWorkerTokenBalances[_staker] &&   //check overflow
         stakedWorkerTokenBalances[_staker] - _tokens >= 0) {    //make sure _staker has the tokens staked to unstake
           stakedWorkerTokenBalances[_staker] -= _tokens;
           return true;
    } else {
      return false;
    }
  }

  function checkOpen() internal onlyInState(State.Proposed)

  // =====================================================================
  // ACTIVE PROJECT FUNCTIONS
  // =====================================================================
  /*function submitTaskList(Task[] tasksList) public isStaker() returns (bool success) {
    submittedTasks[msg.sender] = tasksList;
    return true;
  }*/

  function addTaskHash(bytes32 _ipfsHash) public onlyInState(State.Open) onlyBefore(taskTimePeriod) isStaker() {     //uclear who can call this, needs to be restricted to consensus-based tasks
    if (checkStateChange() == false) {
      tasks.push(Task(_workerAddress, _description, false, _ipfsHash, _workerReward));
    }
  }

  function completeTask() onlyInState(State.Active) public onlyWR() returns (bool success) {  //can only be called by worker in task
    if (checkStateChange() == false) {
      for (uint256 i=0; i<tasks.length; i++) {
        if(tasks[i].workerAddress == msg.sender && tasks[i].taskComplete == false) {
          tasks[i].taskComplete = true;
          return true;
        }
      }
      return false;
    }
    return false;
  }

  // =====================================================================
  // COMPLETED PROJECT - VALIDATION & VOTING FUNCTIONALITY
  // =====================================================================

  function validate(address _staker, uint256 _tokens, bool _validationState) public onlyTHR() onlyInState(State.Validating) returns (bool success) {
    //checks for free tokens done in THR
    //increments validation tokens in Project.sol only
    if (checkStateChange() == false) {
      require(now < validationStart + validationPeriod);
      if (_validationState == true && validatedAffirmative[_staker] + _tokens > validatedAffirmative[_staker] && totalValidateAffirmative + _tokens > totalValidateAffirmative) {
        validatedAffirmative[_staker] += _tokens;
        totalValidateAffirmative += _tokens;
        return true;
      }
      else if (_validationState == false && validatedNegative[_staker] + _tokens > validatedNegative[_staker] && totalValidateNegative + _tokens > totalValidateNegative){
        validatedNegative[msg.sender] += _tokens;
        totalValidateNegative += _tokens;
        return true;
      }
      return false;
    }
  }

  function handleVoteResult(bool passed) internal {
    if(!passed) {               //project fails
      tokenHolderRegistry.updateTotal(projectId, totalCapitalTokensStaked);
      WorkerRegistry(workerRegistry).updateTotal(projectId, totalWorkerTokensStaked);
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
    require(projectState == State.Validated || projectState == State.Failed);
    uint256 refund;     //tokens
    uint256 spoils;     //wei
    if (msg.sender == address(tokenHolderRegistry)) {

      if(totalCapitalTokensStaked != 0) {
        refund = stakedCapitalTokenBalances;[_staker];
        stakedCapitalTokenBalances;[_staker] = 0;
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
        refund = stakedWorkerTokenBalances;[_staker];
        stakedWorkerTokenBalances;[_staker] = 0;
      }

      return refund;
    }
  }

  function rewardWorker(address _staker) public onlyWR() onlyInState(State.Validated) returns (uint256 _reward) {
    uint256 reward = 0;
    for (uint256 i=0; i<tasks.length; i++) {
      if(tasks[i].workerAddress == _staker) {
        reward += tasks[i].ETHReward;
        tasks[i].ETHReward = 0;
      }
    }
    return reward;
  }

}
