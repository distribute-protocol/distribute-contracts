pragma solidity ^0.4.10;

contract ProjectLibrary {
  function isStaked() internal view returns (bool) {
    return (weiCost >= totalWeiStaked && reputationCost >= totalReputationStaked);
  }

  function checkValidate() internal onlyInState(State.Active) returns (bool) {
    if (timesUp()) {
      projectState = State.Validating;
      nextDeadline = now + validationPeriod;
      return true;
    } else {
      return false;
    }
  }

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

  function checkEnd() public onlyInState(State.Voting) returns (bool) {     //don't know where this gets called - maybe separate UI thing
    if(!tokenRegistry.pollEnded(projectId)) {
      return false;
    } else {
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
}
