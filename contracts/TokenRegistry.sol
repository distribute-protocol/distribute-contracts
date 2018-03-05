// ===================================================================== //
// This contract serves as the interface through which users propose projects,
// stake tokens, come to consensus around tasks, validate projects, vote on projects,
// refund their stakes, and claim their rewards.
// ===================================================================== //

pragma solidity ^0.4.8;

import "./ProjectRegistry.sol";
import "./DistributeToken.sol";
import "./library/PLCRVoting.sol";
import "./Project.sol";
import "./ProjectLibrary.sol";
import "./Task.sol";

contract TokenRegistry {

// =====================================================================
// STATE VARIABLES
// =====================================================================
  ProjectRegistry projectRegistry;
  DistributeToken distributeToken;
  PLCRVoting plcrVoting;

  uint256 proposeProportion = 20;                           // tokensupply/proposeProportion is the number of tokens the proposer must stake
  uint256 rewardProportion = 100;

// =====================================================================
// EVENTS
// =====================================================================

  event ProjectCreated(address indexed projectAddress, uint256 projectCost, uint256 proposerStake);

// =====================================================================
// MODIFIERS
// =====================================================================

  modifier onlyPR() {
    require(msg.sender == address(projectRegistry));
    _;
  }

// =====================================================================
// FUNCTIONS
// =====================================================================

  // =====================================================================
  // QUASI-CONSTRUCTOR
  // =====================================================================

    function init(address _distributeToken, address _projectRegistry, address _plcrVoting) public {       //contract is created
      require(address(distributeToken) == 0 && address(projectRegistry) == 0 && address(plcrVoting) == 0);
      distributeToken = DistributeToken(_distributeToken);
      projectRegistry = ProjectRegistry(_projectRegistry);
      plcrVoting = PLCRVoting(_plcrVoting);
    }

  // =====================================================================
  // PROPOSE
  // =====================================================================

    function proposeProject(uint256 _cost, uint256 _stakingPeriod) public {    //_cost of project in ether
      //calculate cost of project in tokens currently (_cost in wei)
      //check proposer has at least 5% of the proposed cost in tokens
      require(now < _stakingPeriod && _cost > 0);
      uint256 costProportion = _cost / distributeToken.weiBal();
      uint256 proposerTokenCost = (costProportion / proposeProportion) * distributeToken.totalSupply();           //divide by 20 to get 5 percent of tokens
      require(distributeToken.balanceOf(msg.sender) >= proposerTokenCost);
      distributeToken.transferToEscrow(msg.sender, proposerTokenCost);
      address projectAddress = projectRegistry.createProject(_cost, costProportion, _stakingPeriod, msg.sender, 1, proposerTokenCost);
      ProjectCreated(projectAddress, _cost, proposerTokenCost);
    }

    function refundProposer(address _projectAddress) public {                                 //called by proposer to get refund once project is active
      Project project = Project(_projectAddress);                            //called by proposer to get refund once project is active
      require(project.proposer() == msg.sender);
      require(project.proposerType() == 1);
      uint256[2] memory proposerVals = projectRegistry.refundProposer(_projectAddress);        //call project to "send back" staked tokens to put in proposer's balances
      distributeToken.transferFromEscrow(msg.sender, proposerVals[1]);
      distributeToken.transferWeiTo(msg.sender, proposerVals[0] / 100);
    }

  // =====================================================================
  // STAKE
  // =====================================================================

    function stakeTokens(address _projectAddress, uint256 _tokens) public {
      require(distributeToken.balanceOf(msg.sender) >= _tokens);
      Project project = Project(_projectAddress);
      // require(project.state() == 1);   ------> this now happens in project.stakeTokens()
      uint256 currentPrice = distributeToken.currentPrice();
      uint256 weiRemaining = project.weiCost() - project.weiBal();
      require(weiRemaining > 0);
      uint256 weiVal =  currentPrice * _tokens;
      bool flag = weiVal > weiRemaining;
      uint256 weiChange = flag
        ? weiRemaining
        : weiVal;       //how much ether to send on change
      uint256 tokens = flag
        ? ((weiRemaining/currentPrice) + 1)
        : _tokens;
      project.stakeTokens(msg.sender, tokens, weiChange);
      distributeToken.transferWeiTo(_projectAddress, weiChange);
      distributeToken.transferToEscrow(msg.sender, tokens);
      projectRegistry.checkStaked(_projectAddress);
    }

    function unstakeTokens(address _projectAddress, uint256 _tokens) public {
      uint256 weiVal = Project(_projectAddress).unstakeTokens(msg.sender, _tokens);
      distributeToken.transferWeiTo(msg.sender, weiVal);
      distributeToken.transferFromEscrow(msg.sender, _tokens);
    }

  // =====================================================================
  // VALIDATION
  // =====================================================================

    function validateTask(address _projectAddress, uint256 _index, uint256 _tokens, bool _validationState) public {
      require(distributeToken.balanceOf(msg.sender) >= _tokens);
      distributeToken.transferToEscrow(msg.sender, _tokens);
      ProjectLibrary.validate(_projectAddress, msg.sender, _index, _tokens, _validationState);
    }

    function rewardValidator(address _projectAddress, uint256 _index) public {
      Project project = Project(_projectAddress);
      Task task = Task(project.tasks(_index));
      require(task.claimable());
      var (status, reward) = task.validators(msg.sender);
      if (task.totalValidateNegative() == 0) {
        require(status == 1);
      } else if (task.totalValidateAffirmative() == 0) {
        require(status == 0);
      } else {
        revert();
      }
      task.clearValidatorStake(msg.sender);
      distributeToken.transferFromEscrow(msg.sender, reward);
      distributeToken.transferWeiTo(msg.sender, reward * distributeToken.currentPrice() / 100);
    }

  // =====================================================================
  // VOTING
  // =====================================================================

    function voteCommit(address _projectAddress, uint256 _index, uint256 _tokens, bytes32 _secretHash, uint256 _prevPollID) public {     //_secretHash Commit keccak256 hash of voter's choice and salt (tightly packed in this order), done off-chain
      uint256 pollId = Task(Project(_projectAddress).tasks(_index)).pollId();
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

    function voteReveal(address _projectAddress, uint256 _index, uint256 _voteOption, uint _salt) public {
      plcrVoting.revealVote(Task(Project(_projectAddress).tasks(_index)).pollId(), _voteOption, _salt);
    }

    function refundVotingTokens(uint256 _tokens) public {
      plcrVoting.withdrawVotingRights(msg.sender, _tokens);
      distributeToken.transferFromEscrow(msg.sender, _tokens);
    }

  // =====================================================================
  // COMPLETE
  // =====================================================================

    function refundStaker(address _projectAddress, uint _index) public {
      uint256 refund = ProjectLibrary.refundStaker(_projectAddress, msg.sender);
      distributeToken.transferFromEscrow(msg.sender, refund);
      //rescue locked tokens that weren't revealed
      uint256 pollId = Task(Project(_projectAddress).tasks(_index)).pollId();
      plcrVoting.rescueTokens(msg.sender, pollId);
    }

  // =====================================================================
  // FAILED
  // =====================================================================

    function burnTokens(uint256 _tokens) public onlyPR() {
      distributeToken.burn(_tokens);
    }

  function() public payable {}
}
