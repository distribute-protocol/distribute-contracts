// ===================================================================== //
// This contract manages the reputation balances of each user and serves as
// the interface through which users stake reputation, come to consensus around
// tasks, claim tasks, vote, refund their stakes, and claim their task rewards.
// ===================================================================== //

pragma solidity ^0.4.10;

import "./Project.sol";
import "./ProjectLibrary.sol";
import "./ProjectRegistry.sol";
import "./DistributeToken.sol";
import "./library/PLCRVoting.sol";
import "./Task.sol";

contract ReputationRegistry{

// =====================================================================
// STATE VARIABLES
// =====================================================================
  DistributeToken distributeToken;
  ProjectRegistry projectRegistry;
  PLCRVoting plcrVoting;

  mapping (address => uint) public balances;
  mapping (address => bool) public first;   //indicates if address has registerd
  mapping (address => uint) public lastAccess;

  uint256 public totalSupply;               //total supply of reputation in all states
  uint256 public totalUsers;

  uint256 proposeProportion = 20;           // tokensupply/proposeProportion is the number of tokens the proposer must stake
  uint256 rewardProportion = 100;
  // This represents both the initial starting amount and the maximum level the faucet will provide.
  uint256 public initialRepVal = 10000;

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

    function init(address _distributeToken, address _projectRegistry, address _plcrVoting) public {
      require(address(distributeToken) == 0 && address(projectRegistry) == 0 && address(plcrVoting) == 0);
      projectRegistry = ProjectRegistry(_projectRegistry);
      plcrVoting = PLCRVoting(_plcrVoting);
      distributeToken= DistributeToken(_distributeToken);
    }

  // =====================================================================
  // UTILITY
  // =====================================================================

    function averageBalance() public view returns(uint256) {
      return totalSupply / totalUsers;
    }

  // =====================================================================
  // START UP
  // =====================================================================

    function register() public {
      require(balances[msg.sender] == 0 && first[msg.sender] == false);
      first[msg.sender] = true;
      balances[msg.sender] = initialRepVal;
      totalSupply += initialRepVal;
      totalUsers += 1;
    }

    // faucet function brings balance to initial value if between 0 and the initialRepVal
    function faucet() public {
      require(balances[msg.sender] < initialRepVal && balances[msg.sender] >= 0 && first[msg.sender] == true && now > lastAccess[msg.sender]);
      uint256 addtl = initialRepVal - balances[msg.sender];
      balances[msg.sender] += addtl;
      lastAccess[msg.sender] = now + 2 weeks;
      totalSupply += addtl;
    }

  // =====================================================================
  // PROPOSE
  // =====================================================================

    function proposeProject(uint256 _cost, uint256 _stakingPeriod, string _ipfsHash) public {    //_cost of project in ether
      //calculate cost of project in tokens currently (_cost in wei)
      //check proposer has at least 5% of the proposed cost in tokens
      require(now < _stakingPeriod && _cost > 0);
      uint256 costProportion = _cost / distributeToken.weiBal();
      uint256 proposerReputationCost = (costProportion / proposeProportion) * totalSupply;
      require(balances[msg.sender] >= proposerReputationCost);
      balances[msg.sender] -= proposerReputationCost;
      address projectAddress = projectRegistry.createProject(_cost, costProportion, _stakingPeriod, msg.sender, 2, proposerReputationCost, _ipfsHash);
      ProjectCreated(projectAddress, _cost, proposerReputationCost);
    }

    function refundProposer(address _projectAddress) public {
      Project project = Project(_projectAddress);                                         //called by proposer to get refund once project is active
      require(project.proposer() == msg.sender);
      require(project.proposerType() == 2);
      uint256[2] memory proposerVals = projectRegistry.refundProposer(_projectAddress);   //call project to "send back" staked tokens to put in proposer's balances
      balances[msg.sender] += proposerVals[1];
      distributeToken.transferWeiTo(msg.sender, proposerVals[0] / 100);
    }

  // =====================================================================
  // STAKE
  // =====================================================================

    function stakeReputation(address _projectAddress, uint256 _reputation) public {
      require(balances[msg.sender] >= _reputation && _reputation > 0);                    //make sure project exists & RH has tokens to stake
      balances[msg.sender] -= _reputation;
      Project(_projectAddress).stakeReputation(msg.sender, _reputation);
      projectRegistry.checkStaked(_projectAddress);
    }

    function unstakeReputation(address _projectAddress, uint256 _reputation) public {
      require(_reputation > 0);
      balances[msg.sender] += _reputation;
      Project(_projectAddress).unstakeReputation(msg.sender, _reputation);
    }

  // =====================================================================
  // TASK
  // =====================================================================

    function claimTask(address _projectAddress, uint256 _index, bytes32 _taskDescription, uint _weighting) public {
      Project project = Project(_projectAddress);
      uint reputationVal = project.reputationCost() * _weighting / 100;
      require(balances[msg.sender] >= reputationVal);
      uint weiVal = _weighting * project.weiCost() / 100;
      balances[msg.sender] -= reputationVal;
      projectRegistry.claimTask(_projectAddress, _index, _taskDescription, msg.sender, _weighting, weiVal, reputationVal);
    }

    function rewardTask(address _projectAddress, uint8 _index) public {                                   //called by worker who completed a task
      uint256 reward = ProjectLibrary.claimTaskReward(_index, _projectAddress, msg.sender);
      balances[msg.sender] += reward;
    }

  // =====================================================================
  // VOTING
  // =====================================================================

    function voteCommit(address _projectAddress, uint256 _index, uint256 _reputation, bytes32 _secretHash, uint256 _prevPollID) public {     //_secretHash Commit keccak256 hash of voter's choice and salt (tightly packed in this order), done off-chain
      require(balances[msg.sender] > 1);      //worker can't vote with only 1 token
      Project project = Project(_projectAddress);
      uint256 pollId = Task(project.tasks(_index)).pollId();
      //calculate available tokens for voting
      uint256 availableTokens = plcrVoting.voteReputationBalance(msg.sender) - plcrVoting.getLockedTokens(msg.sender);
      //make sure msg.sender has tokens available in PLCR contract
      //if not, request voting rights for token holder
      if (availableTokens < _reputation) {
        require(balances[msg.sender] >= _reputation - availableTokens && pollId != 0);
        balances[msg.sender] -= _reputation;
        plcrVoting.requestVotingRights(msg.sender, _reputation - availableTokens);
      }
      plcrVoting.commitVote(msg.sender, pollId, _secretHash, _reputation, _prevPollID);
    }

    function voteReveal(address _projectAddress, uint256 _index, uint256 _voteOption, uint _salt) public {
      Project project = Project(_projectAddress);
      uint256 pollId = Task(project.tasks(_index)).pollId();
      plcrVoting.revealVote(pollId, _voteOption, _salt);
    }

    function refundVotingReputation(uint256 _reputation) public {
      plcrVoting.withdrawVotingRights(msg.sender, _reputation);
      balances[msg.sender] += _reputation;
    }

  // =====================================================================
  // COMPLETE
  // =====================================================================

    function refundStaker(address _projectAddress) public {                                                                       //called by worker who staked or voted
      uint256 _refund = ProjectLibrary.refundStaker(_projectAddress, msg.sender);
      require(_refund > 0);
      balances[msg.sender] += _refund * 3 / 2;
    }

  // =====================================================================
  // FAILED
  // =====================================================================

    function burnReputation(uint256 _reputation) public onlyPR() {
      totalSupply -= _reputation;
    }
}
