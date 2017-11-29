projectProposed () {
  isStaked().then(
   projectState = open
  )
  if timesUp() {
    burnProposer
    return Stakers
  }
}

projectOpen () {
  if timesUp() {
    if taskArr.length == 1
      projectState = active
    else
      projectState = dispute
  }
}

projectDispute () {
  if timesUp() {
    selectWinningTaskHash()
    projectState = active
  }
}

projectActive () {
  if tasksCompleted() {
    projectState = validate
  } elseif timesUp() {
    burnStakers()
    return ethToPool
    projectState = failed
  }
}

projectValidation () {
  if timesUp() {
    projectState = commit
  }
}

projectCommit () {
  if timesUp() {
    projectState = reveal
  }
}

projectReveal () {
  if timesUp() {
    if isPassed(){
      handleVote()
    } else {
      projectState = failed
    }
  }
}
