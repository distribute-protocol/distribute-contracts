pragma solidity ^0.4.19;

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
contract ReputationRegistry{event __CoverageReputationRegistry(string fileName, uint256 lineNumber);
event __FunctionCoverageReputationRegistry(string fileName, uint256 fnId);
event __StatementCoverageReputationRegistry(string fileName, uint256 statementId);
event __BranchCoverageReputationRegistry(string fileName, uint256 branchId, uint256 locationIdx);
event __AssertPreCoverageReputationRegistry(string fileName, uint256 branchId);
event __AssertPostCoverageReputationRegistry(string fileName, uint256 branchId);


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

    modifier onlyPR() {__FunctionCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',1);

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',61);
        __AssertPreCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',1);
 __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',1);
require(msg.sender == address(projectRegistry));__AssertPostCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',1);

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',62);
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
    function init(address _distributeToken, address _projectRegistry, address _plcrVoting) public {__FunctionCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',2);

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',77);
        __AssertPreCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',2);
 __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',2);
require(
            address(distributeToken) == 0 &&
            address(projectRegistry) == 0 &&
            address(plcrVoting) == 0
        );__AssertPostCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',2);

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',82);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',3);
projectRegistry = ProjectRegistry(_projectRegistry);
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',83);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',4);
plcrVoting = PLCRVoting(_plcrVoting);
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',84);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',5);
distributeToken= DistributeToken(_distributeToken);
    }

    // =====================================================================
    // UTILITY
    // =====================================================================

    /**
    @notice Return the average reputation balance of the network users
    @return Average balance of each user
    */
    function averageBalance() public  returns(uint256) {__FunctionCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',3);

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',96);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',6);
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
    function register() public {__FunctionCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',4);

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',109);
        __AssertPreCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',3);
 __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',7);
require(balances[msg.sender] == 0 && first[msg.sender] == false);__AssertPostCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',3);

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',110);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',8);
first[msg.sender] = true;
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',111);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',9);
balances[msg.sender] = initialRepVal;
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',112);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',10);
totalSupply += initialRepVal;
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',113);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',11);
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
    function proposeProject(uint256 _cost, uint256 _stakingPeriod, string _ipfsHash) public {__FunctionCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',5);
    //_cost of project in ether
        //calculate cost of project in tokens currently (_cost in wei)
        //check proposer has at least 5% of the proposed cost in tokens
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',131);
        __AssertPreCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',4);
 __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',12);
require(now < _stakingPeriod && _cost > 0);__AssertPostCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',4);


__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',133);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',13);
uint256 costProportion = Division.percent(_cost, distributeToken.weiBal(), 10);
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',134);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',14);
uint256 proposerReputationCost = ( //divide by 20 to get 5 percent of tokens
        Division.percent(costProportion, proposeProportion, 10) *
        distributeToken.totalSupply()) /
        10000000000;
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',138);
        __AssertPreCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',5);
 __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',15);
require(balances[msg.sender] >= proposerReputationCost);__AssertPostCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',5);


__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',140);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',16);
balances[msg.sender] -= proposerReputationCost;
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',141);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',17);
address projectAddress = projectRegistry.createProject(
            _cost,
            costProportion,
            _stakingPeriod,
            msg.sender,
            2,
            proposerReputationCost,
            _ipfsHash
        );
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',150);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',18);
ProjectCreated(projectAddress, _cost, proposerReputationCost);
    }

    /**
    @notice Refund a reputation proposer upon proposal success, transfer 1% of the project cost in
    wei as a reward along with any reputation staked.
    @param _projectAddress Address of the project
    */
    function refundProposer(address _projectAddress) public {__FunctionCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',6);

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',159);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',19);
Project project = Project(_projectAddress);                                         //called by proposer to get refund once project is active
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',160);
        __AssertPreCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',6);
 __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',20);
require(project.proposer() == msg.sender);__AssertPostCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',6);

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',161);
        __AssertPreCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',7);
 __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',21);
require(project.proposerType() == 2);__AssertPostCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',7);

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',162);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',22);
uint256[2] memory proposerVals = projectRegistry.refundProposer(_projectAddress);   //call project to "send back" staked tokens to put in proposer's balances
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',163);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',23);
balances[msg.sender] += proposerVals[1];
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',164);
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
    function stakeReputation(address _projectAddress, uint256 _reputation) public {__FunctionCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',7);

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',178);
        __AssertPreCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',8);
 __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',24);
require(balances[msg.sender] >= _reputation && _reputation > 0);__AssertPostCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',8);
                    //make sure project exists & RH has tokens to stake
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',179);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',25);
Project project = Project(_projectAddress);
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',180);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',26);
uint256 repRemaining = project.reputationCost() - project.reputationStaked();
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',181);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',27);
uint256 reputationVal; (,reputationVal) = _reputation < repRemaining ? (__BranchCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',9,0),_reputation) : (__BranchCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',9,1),repRemaining);
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',182);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',28);
balances[msg.sender] -= reputationVal;
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',183);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',29);
Project(_projectAddress).stakeReputation(msg.sender, reputationVal);
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',184);
        projectRegistry.checkStaked(_projectAddress);
    }

    /**
    @notice Unstake `_reputation` reputation from project at `_projectAddress`
    @dev Require repuation unstaked is greater than 0
    @param _projectAddress Address of the project
    @param _reputation Amount of reputation to unstake
    */
    function unstakeReputation(address _projectAddress, uint256 _reputation) public {__FunctionCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',8);

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',194);
        __AssertPreCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',10);
 __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',30);
require(_reputation > 0);__AssertPostCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',10);

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',195);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',31);
balances[msg.sender] += _reputation;
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',196);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',32);
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
    ) public {__FunctionCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',9);

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',218);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',33);
Project project = Project(_projectAddress);
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',219);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',34);
uint reputationVal = project.reputationCost() * _weighting / 100;
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',220);
        __AssertPreCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',11);
 __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',35);
require(balances[msg.sender] >= reputationVal);__AssertPostCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',11);

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',221);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',36);
uint weiVal = project.weiCost() * _weighting / 100;
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',222);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',37);
balances[msg.sender] -= reputationVal;
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',223);
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
    function rewardTask(address _projectAddress, uint8 _index) public {__FunctionCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',10);

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',241);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',38);
uint256 reward = _projectAddress.claimTaskReward(_index, msg.sender);
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',242);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',39);
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
    ) public {__FunctionCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',11);
     //_secretHash Commit keccak256 hash of voter's choice and salt (tightly packed in this order), done off-chain
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',266);
        __AssertPreCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',12);
 __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',40);
require(balances[msg.sender] > 10000);__AssertPostCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',12);
 //prevent network effect of new account creation
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',267);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',41);
Project project = Project(_projectAddress);
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',268);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',42);
uint256 pollId = Task(project.tasks(_index)).pollId();
        //calculate available tokens for voting
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',270);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',43);
uint256 availableTokens = plcrVoting.getAvailableTokens(msg.sender, 2);
        //make sure msg.sender has tokens available in PLCR contract
        //if not, request voting rights for token holder
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',273);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',44);
if (availableTokens < _reputation) {__BranchCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',13,0);
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',274);
            __AssertPreCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',14);
 __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',45);
require(balances[msg.sender] >= _reputation - availableTokens && pollId != 0);__AssertPostCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',14);

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',275);
             __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',46);
balances[msg.sender] -= _reputation;
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',276);
            plcrVoting.requestVotingRights(msg.sender, _reputation - availableTokens);
        }else { __BranchCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',13,1);}

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',278);
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
    ) public {__FunctionCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',12);

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',294);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',47);
Project project = Project(_projectAddress);
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',295);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',48);
uint256 pollId = Task(project.tasks(_index)).pollId();
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',296);
        plcrVoting.revealVote(pollId, _voteOption, _salt);
    }

    /**
    @notice Withdraw voting rights from PLCR Contract
    @param _reputation Amount of reputation to withdraw
    */
    function refundVotingReputation(uint256 _reputation) public {__FunctionCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',13);

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',304);
        plcrVoting.withdrawVotingRights(msg.sender, _reputation);
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',305);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',49);
balances[msg.sender] += _reputation;
    }

    // =====================================================================
    // COMPLETE
    // =====================================================================

    /**
    @notice Refund a reputation staker from project at `_projectAddress`
    @param _projectAddress Address of the project
    */
    function refundStaker(address _projectAddress) public {__FunctionCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',14);
     //called by worker who staked or voted
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',317);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',50);
uint256 _refund = _projectAddress.refundStaker(msg.sender);
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',318);
        __AssertPreCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',15);
 __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',51);
require(_refund > 0);__AssertPostCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',15);

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',319);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',52);
Project(_projectAddress).clearReputationStake(msg.sender);
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',320);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',53);
balances[msg.sender] += _refund * 3 / 2;
    }

    /**
    @notice Rescue unrevealed reputation votes from expired polls of task at `_index` of project at
    `_projectAddress`
    @param _projectAddress Address of the project
    @param _index Index of the task
    */
    function rescueTokens(address _projectAddress, uint _index) public {__FunctionCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',15);

        //rescue locked reputation that wasn't revealed
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',331);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',54);
uint256 pollId = Task(Project(_projectAddress).tasks(_index)).pollId();
__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',332);
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
    function burnReputation(uint256 _reputation) public onlyPR {__FunctionCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',16);

__CoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',346);
         __StatementCoverageReputationRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/ReputationRegistry.sol',55);
totalSupply -= _reputation;
    }

}
