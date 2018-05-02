pragma solidity ^0.4.21;

import "./Project.sol";
import "./ProjectLibrary.sol";
import "./ProjectRegistry.sol";
import "./DistributeToken.sol";
import "./Task.sol";
import "./library/PLCRVoting.sol";
import "./library/Division.sol";

/**
@title Reputation Registry for Distribute Network
@author Team: Jessica Marshall, Ashoka Finley
@notice This contract manages the reputation balances of each user and serves as the interface through
which users stake reputation, come to consensus around tasks, claim tasks, vote, refund their stakes,
and claim their task rewards.
@dev This contract must be initialized with the address of a valid DistributeToken, ProjectRegistry,
and PLCR Voting contract
*/
// ===================================================================== //
//
// ===================================================================== //
contract ReputationRegistry {

    using ProjectLibrary for address;

    // =====================================================================
    // EVENTS
    // =====================================================================

    event ProjectCreated(
        address indexed projectAddress,
        uint256 projectCost,
        uint256 proposerStake
    );

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

    uint256 proposeProportion = 200000000000; // tokensupply/proposeProportion is the number of tokens the proposer must stake
    uint256 rewardProportion = 100;
    uint256 public initialRepVal = 10000;

    // =====================================================================
    // MODIFIERS
    // =====================================================================

    modifier onlyPR() {
        require(msg.sender == address(projectRegistry));
        _;
    }

    // =====================================================================
    // QUASI-CONSTRUCTOR
    // =====================================================================

    /**
    @dev Quasi contstructor is called after contract is deployed, must be called with distributeToken,
    projectRegistry, and plcrVoting intialized to 0
    @param _distributeToken Address of DistributeToken contract
    @param _projectRegistry Address of ProjectRegistry contract
    @param _plcrVoting Address of PLCRVoting contract
    */
    function init(address _distributeToken, address _projectRegistry, address _plcrVoting) public {
        require(
            address(distributeToken) == 0 &&
            address(projectRegistry) == 0 &&
            address(plcrVoting) == 0
        );
        projectRegistry = ProjectRegistry(_projectRegistry);
        plcrVoting = PLCRVoting(_plcrVoting);
        distributeToken = DistributeToken(_distributeToken);
    }

    // =====================================================================
    // UTILITY
    // =====================================================================

    /**
    @notice Return the average reputation balance of the network users
    @return Average balance of each user
    */
    function averageBalance() external view returns(uint256) {
        return totalSupply / totalUsers;
    }

    // =====================================================================
    // START UP
    // =====================================================================

    /**
    @notice Register an account `msg.sender` for the first time in the reputation registry, grant 10,000
    repuation to start.
    @dev Has no sybil protection, thus a user can auto generate accounts to receive excess reputation.
    */
    function register() external {
        require(balances[msg.sender] == 0 && first[msg.sender] == false);
        first[msg.sender] = true;
        balances[msg.sender] = initialRepVal;
        totalSupply += initialRepVal;
        totalUsers += 1;
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
    function proposeProject(uint256 _cost, uint256 _stakingPeriod, bytes _ipfsHash) external {    //_cost of project in ether
        //calculate cost of project in tokens currently (_cost in wei)
        //check proposer has at least 5% of the proposed cost in reputation
        require(now < _stakingPeriod && _cost > 0);
        uint256 costProportion = Division.percent(_cost, distributeToken.weiBal(), 10);
        uint256 proposerReputationCost = ( //divide by 20 to get 5 percent of reputation
        Division.percent(costProportion, proposeProportion, 10) *
        totalSupply) /
        10000000000;
        require(balances[msg.sender] >= proposerReputationCost);

        balances[msg.sender] -= proposerReputationCost;
        address projectAddress = projectRegistry.createProject(
            _cost,
            costProportion,
            _stakingPeriod,
            msg.sender,
            2,
            proposerReputationCost,
            _ipfsHash
        );
        emit ProjectCreated(projectAddress, _cost, proposerReputationCost);
    }

    /**
    @notice Refund a reputation proposer upon proposal success, transfer 1% of the project cost in
    wei as a reward along with any reputation staked.
    @param _projectAddress Address of the project
    */
    function refundProposer(address _projectAddress) external {
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

    /**
    @notice Stake `_reputation` reputation on project at `_projectAddress`
    @dev Prevents over staking and returns any excess reputation staked.
    @param _projectAddress Address of the project
    @param _reputation Amount of reputation to stake
    */
    function stakeReputation(address _projectAddress, uint256 _reputation) external {
        require(projectRegistry.projects(_projectAddress) == true);
        require(balances[msg.sender] >= _reputation && _reputation > 0);                    //make sure project exists & RH has tokens to stake
        Project project = Project(_projectAddress);
        // handles edge case where someone attempts to stake past the staking deadline
        projectRegistry.checkStaked(_projectAddress);
        require(project.state() == 1);

        uint256 repRemaining = project.reputationCost() - project.reputationStaked();
        uint256 reputationVal = _reputation < repRemaining ? _reputation : repRemaining;
        balances[msg.sender] -= reputationVal;
        Project(_projectAddress).stakeReputation(msg.sender, reputationVal);
        projectRegistry.checkStaked(_projectAddress);
    }

    /**
    @notice Unstake `_reputation` reputation from project at `_projectAddress`
    @dev Require repuation unstaked is greater than 0
    @param _projectAddress Address of the project
    @param _reputation Amount of reputation to unstake
    */
    function unstakeReputation(address _projectAddress, uint256 _reputation) external {
        require(projectRegistry.projects(_projectAddress) == true);
        require(_reputation > 0);
        // handles edge case where someone attempts to stake past the staking deadline
        projectRegistry.checkStaked(_projectAddress);

        balances[msg.sender] += _reputation;
        Project(_projectAddress).unstakeReputation(msg.sender, _reputation);
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
        address _projectAddress,
        uint256 _index,
        bytes32 _taskDescription,
        uint _weighting
    ) external {
        require(projectRegistry.projects(_projectAddress) == true);
        Project project = Project(_projectAddress);
        require(project.hashListSubmitted() == true);
        uint reputationVal = project.reputationCost() * _weighting / 100;
        require(balances[msg.sender] >= reputationVal);
        uint weiVal = project.weiCost() * _weighting / 100;
        balances[msg.sender] -= reputationVal;
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
    //called by reputation holder who completed a task
    function rewardTask(address _projectAddress, uint8 _index) external {
        require(projectRegistry.projects(_projectAddress) == true);
        uint256 reward = _projectAddress.claimTaskReward(_index, msg.sender);
        balances[msg.sender] += reward;
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
    @param _reputation Reputation to vote with
    @param _secretHash Secret Hash of voter choice and salt
    @param _prevPollID The nonce of the previous poll. This is stored off chain
    */
    function voteCommit(
        address _projectAddress,
        uint256 _index,
        uint256 _reputation,
        bytes32 _secretHash,
        uint256 _prevPollID
    ) external {     //_secretHash Commit keccak256 hash of voter's choice and salt (tightly packed in this order), done off-chain
        require(projectRegistry.projects(_projectAddress) == true);
        require(balances[msg.sender] > 10000); //prevent network effect of new account creation
        Project project = Project(_projectAddress);
        uint256 pollId = Task(project.tasks(_index)).pollId();
        //calculate available tokens for voting
        uint256 availableTokens = plcrVoting.getAvailableTokens(msg.sender, 2);
        //make sure msg.sender has tokens available in PLCR contract
        //if not, request voting rights for token holder
        if (availableTokens < _reputation) {
            require(balances[msg.sender] >= _reputation - availableTokens && pollId != 0);
            balances[msg.sender] -= _reputation;
            plcrVoting.requestVotingRights(msg.sender, _reputation - availableTokens);
        }
        plcrVoting.commitVote(msg.sender, pollId, _secretHash, _reputation, _prevPollID);
    }

    /**
    @notice Second part of voting process. Reveal existing vote.
    @param _projectAddress Address of the project
    @param _index Index of the task
    @param _voteOption Vote choice of account
    @param _salt Salt of account
    */
    function voteReveal(
        address _projectAddress,
        uint256 _index,
        uint256 _voteOption,
        uint _salt
    ) external {
        require(projectRegistry.projects(_projectAddress) == true);
        Project project = Project(_projectAddress);
        uint256 pollId = Task(project.tasks(_index)).pollId();
        plcrVoting.revealVote(pollId, _voteOption, _salt);
    }

    /**
    @notice Withdraw voting rights from PLCR Contract
    @param _reputation Amount of reputation to withdraw
    */
    function refundVotingReputation(uint256 _reputation) external {
        balances[msg.sender] += _reputation;
        plcrVoting.withdrawVotingRights(msg.sender, _reputation);
    }

    // =====================================================================
    // COMPLETE
    // =====================================================================

    /**
    @notice Refund a reputation staker from project at `_projectAddress`
    @param _projectAddress Address of the project
    */
    function refundStaker(address _projectAddress) external {     //called by worker who staked or voted
        require(projectRegistry.projects(_projectAddress) == true);
        uint256 _refund = _projectAddress.refundStaker(msg.sender);
        require(_refund > 0);
        balances[msg.sender] += _refund * 3 / 2;
        Project(_projectAddress).clearReputationStake(msg.sender);
    }

    /**
    @notice Rescue unrevealed reputation votes from expired polls of task at `_index` of project at
    `_projectAddress`
    @param _projectAddress Address of the project
    @param _index Index of the task
    */
    function rescueTokens(address _projectAddress, uint _index) external {
        //rescue locked reputation that wasn't revealed
        require(projectRegistry.projects(_projectAddress) == true);
        uint256 pollId = Task(Project(_projectAddress).tasks(_index)).pollId();
        plcrVoting.rescueTokens(msg.sender, pollId);
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
        totalSupply -= _reputation;
    }

}
