pragma solidity ^0.5.0;

import "./Project.sol";
import "./ProjectLibrary.sol";
import "./ProjectRegistry.sol";
import "./HyphaToken.sol";
import "./Task.sol";
import "./library/PLCRVoting.sol";
import "./library/Division.sol";
import "./library/SafeMath.sol";
import "./library/Ownable.sol";
/**
@title Reputation Registry for Distribute Network
@author Team: Jessica Marshall, Ashoka Finley
@notice This contract manages the reputation balances of each user and serves as the interface through
which users stake reputation, come to consensus around tasks, claim tasks, vote, refund their stakes,
and claim their task rewards. This contract also registers users and instantiates their accounts with 10.000 reputation
@dev This contract must be initialized with the address of a valid HyphaToken, ProjectRegistry,
and PLCR Voting contract
*/
// ===================================================================== //
//
// ===================================================================== //
contract ReputationRegistry is Ownable {

    using ProjectLibrary for address;
    using SafeMath for uint256;

    // =====================================================================
    // EVENTS
    // =====================================================================

    event LogRegister(
        address indexed account
    );

    event LogProjectCreated(address projectAddress, uint256 weiCost, uint256 reputationCost);
    event LogStakedReputation(address indexed projectAddress, uint256 reputation, address staker, bool projectStaked);
    event LogUnstakedReputation(address indexed projectAddress, uint256 reputation, address unstaker);
    event LogReputationVoteCommitted(address indexed projectAddress, uint256 index, uint256 votes, bytes32 secretHash, uint256 pollId, address voter);
    event LogReputationVoteRevealed(address indexed projectAddress, uint256 index, uint256 vote, uint256 salt, address voter);
    event LogReputationVoteRescued(address indexed projectAddress, uint256 index, uint256 pollId, address voter);

    // =====================================================================
    // STATE VARIABLES
    // =====================================================================

    HyphaToken hyphaToken;
    ProjectRegistry projectRegistry;
    PLCRVoting plcrVoting;

    struct User {
      uint balance;
      bool registered; //indicates if address has registerd
      uint lastAccess;
    }
    mapping (address => User) public users;
    // make this a struct and save the mapping

    uint256 public totalSupply;               //total supply of reputation in all states
    uint256 public totalUsers;

    uint256 proposeProportion = 20 * 10000000000; // tokensupply/proposeProportion is the number of tokens the proposer must stake
    uint256 rewardProportion = 100;
    uint256 public initialRepVal = 10000;

    bool freeze;

    // =====================================================================
    // MODIFIERS
    // =====================================================================

    modifier onlyPR() {
        require(msg.sender == address(projectRegistry));
        _;
    }

    // =====================================================================
    // CONSTRUCTOR
    // =====================================================================

    /**
    @dev Quasi contstructor is called after contract is deployed, must be called with hyphaToken,
    projectRegistry, and plcrVoting intialized to 0
    @param _hyphaToken Address of HyphaToken contract
    @param _projectRegistry Address of ProjectRegistry contract
    @param _plcrVoting Address of PLCRVoting contract
    */
    function init(address payable _hyphaToken, address _projectRegistry, address _plcrVoting) public {
        require(
            address(hyphaToken) == address(0) &&
            address(projectRegistry) == address(0) &&
            address(plcrVoting) == address(0)
        );
        projectRegistry = ProjectRegistry(_projectRegistry);
        plcrVoting = PLCRVoting(_plcrVoting);
        hyphaToken = HyphaToken(_hyphaToken);
    }

    // =====================================================================
    // UTILITY
    // =====================================================================

    /**
    @notice Return the average reputation balance of the network users
    @return Average balance of each user
    */
    function averageBalance() external view returns(uint256) {
        return totalSupply.div(totalUsers);
    }

    // =====================================================================
    // OWNABLE
    // =====================================================================

    /**
     * @dev Freezes the contract and allows existing token holders to withdraw tokens
     */
    function freezeContract() external onlyOwner {
      freeze = true;
    }

    /**
     * @dev Unfreezes the contract and allows existing token holders to withdraw tokens
     */
    function unfreezeContract() external onlyOwner {
      freeze = false;
    }

    /**
     * @dev Instantiate a new instance of plcrVoting contract
     * @param _newPlcrVoting Address of the new plcr contract
     */
    function updatePLCRVoting(address _newPlcrVoting) external onlyOwner {
      plcrVoting = PLCRVoting(_newPlcrVoting);
    }

    /**
     * @dev Update the address of the hyphaToken
     * @param _newHyphaToken Address of the new distribute token
     */
    function updateHyphaToken(address payable _newHyphaToken) external onlyOwner {
      hyphaToken = HyphaToken(_newHyphaToken);
    }

    /**
     * @dev Update the address of the base product proxy contract
     * @param _newProjectRegistry Address of the new project contract
     */
    function updateProjectRegistry(address _newProjectRegistry) external onlyOwner {
      projectRegistry = ProjectRegistry(_newProjectRegistry);
    }

    function squaredAmount(uint _amount) internal pure returns (uint) {
      return _amount.mul(_amount);
    }

    // =====================================================================
    // START UP
    // =====================================================================

    /**
    @notice Register an account `msg.sender` for the first time in the reputation registry, grant 10,000
    reputation to start.
    @dev Has no sybil protection, thus a user can auto generate accounts to receive excess reputation.
    */
    function register() external {
        require(!freeze);
        require(users[msg.sender].balance == 0 && users[msg.sender].registered == false);
        users[msg.sender].registered = true;
        users[msg.sender].balance = initialRepVal;
        totalSupply = totalSupply.add(initialRepVal);
        totalUsers = totalUsers.add(1);
        emit LogRegister(msg.sender);
    }

    // =====================================================================
    // PROPOSE
    // =====================================================================

    /**
    @notice Propose a project of cost `_cost` with staking period `_stakingPeriod` and hash `_ipfsHash`,
    with reputation.
    @dev Calls ProjectRegistry.createProject finalize transaction
    @param _cost Total project cost in wei
    @param _stakingPeriod Length of time the project can be staked before it expires
    @param _ipfsHash Hash of the project description
    */
    function proposeProject(uint256 _cost, uint256 _stakingPeriod, bytes calldata _ipfsHash) external {
        require(!freeze);
        require(block.timestamp < _stakingPeriod && _cost > 0);
        uint256 costProportion = Division.percent(_cost, hyphaToken.weiBal(), 10);
        uint256 proposerReputationCost = ( //divide by 20 to get 5 percent of reputation
        Division.percent(costProportion, proposeProportion, 10) *
        totalSupply) /
        10000000000;
        require(users[msg.sender].balance >= proposerReputationCost);
        users[msg.sender].balance -= proposerReputationCost;
        address projectAddress = projectRegistry.createProject(
            _cost,
            costProportion,
            _stakingPeriod,
            msg.sender,
            2,
            proposerReputationCost,
            _ipfsHash
        );
        emit LogProjectCreated(projectAddress, _cost, proposerReputationCost);
    }

    /**
    @notice Refund a reputation proposer upon proposal success, transfer 1% of the project cost in
    wei as a reward along with any reputation staked.
    @param _projectAddress Address of the project
    */
    function refundProposer(address payable _projectAddress) external {
        require(!freeze);
        Project project = Project(_projectAddress);                                         //called by proposer to get refund once project is active
        require(project.proposer() == msg.sender);
        require(project.proposerType() == 2);

        uint256[2] memory proposerVals = projectRegistry.refundProposer(_projectAddress, msg.sender);   //call project to "send back" staked tokens to put in proposer's balances
        users[msg.sender].balance += proposerVals[1];
        hyphaToken.transferWeiTo(msg.sender, proposerVals[0] / 20);
    }

    // =====================================================================
    // STAKE
    // =====================================================================

    /**
    @notice Stake `_reputation` reputation on project at `_projectAddress`
    @dev Prevents over staking and returns any excess reputation staked.
    @param _projectAddress Address of the project
    @param _reputation Amount of reputation to stake
    */
    function stakeReputation(address payable _projectAddress, uint256 _reputation) external {
        require(!freeze);
        require(projectRegistry.projects(_projectAddress) == true);
        require(users[msg.sender].balance >= _reputation && _reputation > 0);                    //make sure project exists & RH has tokens to stake
        Project project = Project(_projectAddress);
        // handles edge case where someone attempts to stake past the staking deadline
        projectRegistry.checkStaked(_projectAddress);
        require(project.state() == 1);

        uint256 repRemaining = project.reputationCost() - project.reputationStaked();
        uint256 reputationVal = _reputation < repRemaining ? _reputation : repRemaining;
        users[msg.sender].balance -= reputationVal;
        Project(_projectAddress).stakeReputation(msg.sender, reputationVal);
        bool staked = projectRegistry.checkStaked(_projectAddress);
        emit LogStakedReputation(_projectAddress, _reputation, msg.sender, staked);
    }

    /**
    @notice Unstake `_reputation` reputation from project at `_projectAddress`
    @dev Require reputation to be unstaked to be greater than 0
    @param _projectAddress Address of the project
    @param _reputation Amount of reputation to unstake
    */
    function unstakeReputation(address payable _projectAddress, uint256 _reputation) external {
        require(!freeze);
        require(projectRegistry.projects(_projectAddress) == true);
        require(_reputation > 0);
        // handles edge case where someone attempts to stake past the staking deadline
        projectRegistry.checkStaked(_projectAddress);

        users[msg.sender].balance += _reputation;
        Project(_projectAddress).unstakeReputation(msg.sender, _reputation);
        emit LogUnstakedReputation(_projectAddress, _reputation, msg.sender);
    }

    /**
    @notice Calculates the relative weight of an `_address`.
    Weighting is calculated by the proportional amount of both reputation and tokens that have been
    staked on the project.
    @dev Returns an average of the token staking and reputation staking to understand the relative influence of a staker

    @param _address Address of the staker
    @return The relative weight of a staker as a whole integer
    */
    function calculateWeightOfAddress(
        address _address
    ) public view returns (uint256) {
        return Division.percent(users[_address].balance, totalSupply, 15);
    }


    // =====================================================================
    // TASK
    // =====================================================================

    /**
    @notice Claim a task at index `_index` from project at `_projectAddress` with description
    `_taskDescription` and weighting `_weighting`
    @dev Requires the reputation of msg.sender to be greater than the reputationVal of the task
    @param _projectAddress Address of the project
    @param _index Index of the task
    @param _taskDescription Description of the task
    @param _weighting Weighting of the task
    */
    function claimTask(
        address payable _projectAddress,
        uint256 _index,
        bytes32 _taskDescription,
        uint _weighting
    ) external {
        require(!freeze);
        require(projectRegistry.projects(_projectAddress) == true);
        Project project = Project(_projectAddress);
        require(project.hashListSubmitted() == true);
        uint reputationVal = project.reputationCost() * _weighting / 100;
        require(users[msg.sender].balance >= reputationVal);
        uint weiVal = project.proposedCost() * _weighting / 100;
        users[msg.sender].balance -= reputationVal;
        projectRegistry.claimTask(
            _projectAddress,
            _index,
            _taskDescription,
            msg.sender,
            _weighting,
            weiVal,
            reputationVal
        );
    }

    /**
    @notice Reward the claimer of a task that has been successfully validated.
    @param _projectAddress Address of the project
    @param _index Index of the task
    */
    // called by reputation holder who completed a task
    function rewardTask(address payable _projectAddress, uint256 _index) external {
        require(!freeze);
        require(projectRegistry.projects(_projectAddress) == true);
        uint256 reward = ProjectLibrary.claimTaskReward(_projectAddress, _index, msg.sender);
        users[msg.sender].balance += reward;
    }

    // =====================================================================
    // VOTING
    // =====================================================================

    /**
    @notice First part of voting process. Commits a vote using reputation to task at index `_index`
    of project at `projectAddress` for reputation `_reputation`. Submits a secrect hash `_secretHash`,
    which is a tightly packed hash of the voters choice and their salt
    @param _projectAddress Address of the project
    @param _index Index of the task
    @param _votes Reputation to vote with
    @param _secretHash Secret Hash of voter choice and salt
    @param _prevPollID The nonce of the previous poll. This is stored off chain
    */
    function voteCommit(
        address payable _projectAddress,
        uint256 _index,
        uint256 _votes,
        bytes32 _secretHash,
        uint256 _prevPollID
    ) external {     //_secretHash Commit keccak256 hash of voter's choice and salt (tightly packed in this order), done off-chain
        require(!freeze);
        require(projectRegistry.projects(_projectAddress) == true);
        uint256 pollId = Task(Project(_projectAddress).tasks(_index)).pollId();
        //calculate available tokens for voting
        uint256 availableVotes = plcrVoting.getAvailableTokens(msg.sender, 2);
        //make sure msg.sender has tokens available in PLCR contract
        //if not, request voting rights for token holder
        if (availableVotes < _votes) {
            uint votesCost = squaredAmount(_votes).sub(squaredAmount(availableVotes));
            require(users[msg.sender].balance >= votesCost);
            users[msg.sender].balance -= votesCost;
            plcrVoting.requestVotingRights(msg.sender, _votes - availableVotes);
        }
        plcrVoting.commitVote(msg.sender, pollId, _secretHash, _votes, _prevPollID);
        emit LogReputationVoteCommitted(_projectAddress, _index, _votes, _secretHash, pollId, msg.sender);
    }

    /**
    @notice Second part of voting process. Reveal existing vote.
    @param _projectAddress Address of the project
    @param _index Index of the task
    @param _voteOption Vote choice of account
    @param _salt Salt of account
    */
    function voteReveal(
        address payable _projectAddress,
        uint256 _index,
        uint256 _voteOption,
        uint256 _salt
    ) external {
        require(!freeze);
        require(projectRegistry.projects(_projectAddress) == true);
        plcrVoting.revealVote(msg.sender, Task(Project(_projectAddress).tasks(_index)).pollId(), _voteOption, _salt);
        emit LogReputationVoteRevealed(_projectAddress, _index, _voteOption, _salt, msg.sender);
    }

    /**
    @notice Withdraw voting rights from PLCR Contract
    @param _votes Amount of reputation to withdraw
    */
    function refundVotingReputation(uint256 _votes) external {
        require(!freeze);
        uint userVotes = plcrVoting.getAvailableTokens(msg.sender, 2);
        require(_votes <= userVotes);
        uint votesPrice = squaredAmount(userVotes) - squaredAmount(userVotes - _votes);
        plcrVoting.withdrawVotingRights(msg.sender, _votes);
        users[msg.sender].balance += votesPrice;
    }

    // =====================================================================
    // COMPLETE
    // =====================================================================

    /**
    @notice Refund a reputation staker from project at `_projectAddress`
    @param _projectAddress Address of the project
    */
    function refundStaker(address payable _projectAddress) external {     //called by worker who staked or voted
        require(!freeze);
        require(projectRegistry.projects(_projectAddress) == true);
        uint256 refund = ProjectLibrary.refundStaker(_projectAddress, msg.sender, address(this));
        require(refund > 0);
        Project(_projectAddress).clearReputationStake(msg.sender);
        users[msg.sender].balance = users[msg.sender].balance.add(refund);
        if (Project(_projectAddress).state() == 6) {
          uint256 reward = refund / 2;
          users[msg.sender].balance = users[msg.sender].balance.add(reward);
          totalSupply = totalSupply.add(reward);
        }
    }

    /**
    @notice Rescue unrevealed reputation votes from expired polls of task at `_index` of project at
    `_projectAddress`
    @param _projectAddress Address of the project
    @param _index Index of the task
    */
    function rescueTokens(address payable _projectAddress, uint _index) external {
        require(!freeze);
        require(projectRegistry.projects(_projectAddress) == true);
        uint256 pollId = Task(Project(_projectAddress).tasks(_index)).pollId();
        plcrVoting.rescueTokens(msg.sender, pollId);
        emit LogReputationVoteRescued(_projectAddress, _index, pollId, msg.sender);
    }


    // =====================================================================
    // FAILED
    // =====================================================================

    /**
    @notice Burn reputation in event of project failure
    @dev Only callable by the ProjectRegistry contract
    @param _reputation Amount of reputation to burn
    */
    function burnReputation(uint256 _reputation) external onlyPR {
        require(!freeze);
        totalSupply -= _reputation;
    }

}
