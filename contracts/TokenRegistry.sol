// ===================================================================== //
// This contract serves as the interface through which users propose projects,
// stake tokens, come to consensus around tasks, validate projects, vote on projects,
// refund their stakes, and claim their rewards.
// ===================================================================== //

pragma solidity ^0.4.8;

//import files
import "./Project.sol";
import "./DistributeToken.sol";
import "./library/PLCRVoting.sol";


contract TokenRegistry {

// =====================================================================
// STATE VARIABLES
// =====================================================================
  ReputationRegistry reputationRegistry;
  ProjectRegistry projectRegistry;
  DistributeToken distributeToken;
  PLCRVoting plcrVoting;

  uint256 proposeProportion = 20;                           // tokensupply/proposeProportion is the number of tokens the proposer must stake
  uint256 rewardProportion = 100;


// =====================================================================
// EVENTS
// =====================================================================

  event LogProposal(uint256 nonce, uint256 proposalCostInTokens);

// =====================================================================
// MODIFIERS
// =====================================================================

  modifier onlyValidProject() {
    require(projectRegistry.votingPollId(msg.sender) > 0);
    _;
  }

// =====================================================================
// FUNCTIONS
// =====================================================================

  // =====================================================================
  // QUASI-CONSTRUCTOR
  // =====================================================================
  function init(address _distributeToken, address _reputationRegistry, address _projectRegistry, address _plcrVoting) public {       //contract is created
    require(address(distributeToken) == 0 && address(reputationRegistry) == 0 && address(projectRegistry) == 0 && address(plcrVoting) == 0);
    distributeToken = DistributeToken(_distributeToken);
    reputationRegistry = ReputationRegistry(_reputationRegistry);
    projectRegistry = ProjectRegistry(_projectRegistry);
    plcrVoting = PLCRVoting(_plcrVoting);
  }

  // =====================================================================
  // PROPOSER FUNCTIONS
  // =====================================================================

  function proposeProject(uint256 _cost, uint256 _stakingPeriod) public {    //_cost of project in ether
    //calculate cost of project in tokens currently (_cost in wei)
    //check proposer has at least 5% of the proposed cost in tokens
    require(now < _stakingPeriod && _cost > 0);
    uint256 proposerTokenCost = _cost / distributeToken.currentPrice();
    proposerTokenCost = proposerTokenCost / proposeProportion;           //divide by 20 to get 5 percent of tokens
    require(distributeToken.balanceOf(msg.sender) >= proposerTokenCost);
    uint256 costProportion = _cost / distributeToken.weiBal();
    distributeToken.transferToEscrow(msg.sender, proposerTokenCost);
    projectRegistry.createProject(_cost, costProportion, proposerTokenCost, msg.sender);
    /*LogProposal(projectRegistry.projectNonce(), proposerTokenCost);                                                     //determine project id*/
  }

  function refundProposer(address _projectAddress) public {                                 //called by proposer to get refund once project is active

    require(projectRegistry.getProposerAddress(_projectAddress) == msg.sender);
    uint256[2] memory proposerVals = projectRegistry.refundProposer(_projectAddress);        //call project to "send back" staked tokens to put in proposer's balances
    distributeToken.transferFromEscrow(msg.sender, proposerVals[1]);
    distributeToken.transferWeiFrom(msg.sender, proposerVals[0] / 100);
  }

  // =====================================================================
  // PROPOSED PROJECT - STAKING FUNCTIONALITY
  // =====================================================================

  function stakeTokens(address _projectAddress, uint256 _tokens) public {
    require(distributeToken.balanceOf(msg.sender) >= _tokens);
    Project project = Project(_projectAddress);
    require(project.state() == 1);
    uint256 currentPrice = distributeToken.currentPrice();
    uint256 weiRemaining = project.weiCost() - project.weiBal();
    uint256 weiVal =  currentPrice * _tokens;
    Project(_projectAddress).stakeTokens(msg.sender, _tokens, weiVal);
    bool flag = weiVal > weiRemaining;
    uint256 tokens = flag ? ((weiVal - weiRemaining) / currentPrice) : _tokens;
    uint256 weiChange = flag ? weiVal - weiRemaining : weiVal;
    distributeToken.transferWeiFrom(_projectAddress, weiChange);
    distributeToken.transferToEscrow(msg.sender, tokens);
    projectRegistry.checkOpen(_projectAddress);
  }

  function unstakeTokens(address _projectAddress, uint256 _tokens) public {
    uint256 weiVal = Project(_projectAddress).unstakeTokens(msg.sender, _tokens);
    distributeToken.transferWeiFrom(msg.sender, weiVal);
    distributeToken.transferFromEscrow(msg.sender, _tokens);
  }

  // =====================================================================
  // COMPLETED PROJECT - VALIDATION & VOTING FUNCTIONALITY
  // =====================================================================

  function validate(address _projectAddress, uint256 _tokens, bool _validationState) public {
    // require(projectRegistry.projectStates(_projectAddress) == 5);
    require(distributeToken.balanceOf(msg.sender) >= _tokens);
    distributeToken.transferToEscrow(msg.sender, _tokens);
    Project(_projectAddress).validate(msg.sender, _tokens, _validationState);
  }

  function voteCommit(address _projectAddress, uint256 _tokens, bytes32 _secretHash, uint256 _prevPollID) public {     //_secretHash Commit keccak256 hash of voter's choice and salt (tightly packed in this order), done off-chain
    uint256 pollId = projectRegistry.votingPollId(_projectAddress);
    require(pollId != 0);
    //calculate available tokens for voting
    uint256 availableTokens = plcrVoting.voteTokenBalance(msg.sender) - plcrVoting.getLockedTokens(msg.sender);
    //make sure msg.sender has tokens available in PLCR contract
    //if not, request voting rights for token holder
    if (availableTokens < _tokens) {
      require(distributeToken.balanceOf(msg.sender) >= _tokens - availableTokens);
      distributeToken.transferToEscrow(msg.sender, _tokens - availableTokens);
      plcrVoting.requestVotingRights(msg.sender, _tokens - availableTokens);
    }
    plcrVoting.commitVote(msg.sender, pollId, _secretHash, _tokens, _prevPollID);
  }

  function voteReveal(address _projectAddress, uint256 _voteOption, uint _salt) public {
    plcrVoting.revealVote(projectRegistry.votingPollId(_projectAddress), _voteOption, _salt);
  }

  function refundVotingTokens(uint256 _tokens) public {
    plcrVoting.withdrawVotingRights(msg.sender, _tokens);
    distributeToken.transferFromEscrow(msg.sender, _tokens);
  }

  // =====================================================================
  // FAILED / VALIDATED PROJECT
  // =====================================================================

  // called by project if a project fails
  function burnTokens(uint256 _tokens) public onlyValidProject() {              //check that valid project is calling this function
    distributeToken.burnTokens(_tokens);
  }
  function refundStaker(address _projectAddress) public {
    uint256 refund = Project(_projectAddress).refundStaker(msg.sender);
    distributeToken.transferFromEscrow(msg.sender, refund);
    //rescue locked tokens that weren't revealed
    uint256 pollId = projectRegistry.votingPollId(_projectAddress);
    plcrVoting.rescueTokens(msg.sender, pollId);
  }

  function rewardValidator(address _validator, uint256 _reward) public onlyValidProject() {
    require(Project(msg.sender).state() == 7 || Project(msg.sender).state() == 9);
    require(projectRegistry.votingPollId(msg.sender) != 0);
    distributeToken.transferWeiFrom(_validator, _reward);
  }

  function transferWeiReward(address _destination, uint256 _weiVal) public onlyValidProject() {
    distributeToken.transferWeiFrom(_destination, _weiVal);
  }

  function() public payable {

  }

}
