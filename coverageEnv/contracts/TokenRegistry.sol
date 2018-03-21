pragma solidity ^0.4.19;

import "./ProjectRegistry.sol";
import "./DistributeToken.sol";
import "./Project.sol";
import "./ProjectLibrary.sol";
import "./Task.sol";
import "./library/PLCRVoting.sol";
import "./library/Division.sol";

/**
@title This contract serves as the interface through which users propose projects, stake tokens,
come to consensus around tasks, validate projects, vote on projects, refund their stakes, and
claim their rewards.
@author Team: Jessica Marshall, Ashoka Finley
*/
contract TokenRegistry {event __CoverageTokenRegistry(string fileName, uint256 lineNumber);
event __FunctionCoverageTokenRegistry(string fileName, uint256 fnId);
event __StatementCoverageTokenRegistry(string fileName, uint256 statementId);
event __BranchCoverageTokenRegistry(string fileName, uint256 branchId, uint256 locationIdx);
event __AssertPreCoverageTokenRegistry(string fileName, uint256 branchId);
event __AssertPostCoverageTokenRegistry(string fileName, uint256 branchId);


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

    ProjectRegistry projectRegistry;
    DistributeToken distributeToken;
    PLCRVoting plcrVoting;

    uint256 proposeProportion = 200000000000;  // tokensupply/proposeProportion is the number of tokens the proposer must stake
    uint256 rewardProportion = 100;

    // =====================================================================
    // MODIFIERS
    // =====================================================================

    modifier onlyPR() {__FunctionCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',1);

__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',47);
        __AssertPreCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',1);
 __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',1);
require(msg.sender == address(projectRegistry));__AssertPostCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',1);

__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',48);
        _;
    }

    // =====================================================================
    // QUASI-CONSTRUCTOR
    // =====================================================================

    /**
    @dev Quasi constructor is called after contract is deployed, must be called with distributeToken,
    projectRegistry, and plcrVoting intialized to 0
    @param _distributeToken Address of DistributeToken contract
    @param _projectRegistry Address of ProjectRegistry contract
    @param _plcrVoting Address of PLCRVoting contract
    */
    function init(address _distributeToken, address _projectRegistry, address _plcrVoting) public {__FunctionCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',2);
 //contract is created
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',63);
        __AssertPreCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',2);
 __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',2);
require(
            address(distributeToken) == 0 &&
            address(projectRegistry) == 0 &&
            address(plcrVoting) == 0
        );__AssertPostCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',2);


__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',69);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',3);
distributeToken = DistributeToken(_distributeToken);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',70);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',4);
projectRegistry = ProjectRegistry(_projectRegistry);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',71);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',5);
plcrVoting = PLCRVoting(_plcrVoting);
    }

    // =====================================================================
    // FALLBACK
    // =====================================================================

    function() public payable {__FunctionCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',3);
}

    // =====================================================================
    // PROPOSE
    // =====================================================================

    /**
    @notice Propose a project of cost `_cost` with staking period `_stakingPeriod` and hash `_ipfsHash`,
    with tokens.
    @dev Calls ProjectRegistry.createProject finalize transaction
    @param _cost Total project cost in wei
    @param _stakingPeriod Length of time the project can be staked before it expires
    @param _ipfsHash Hash of the project description
    */
    function proposeProject(uint256 _cost, uint256 _stakingPeriod, string _ipfsHash) public {__FunctionCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',4);
 //_cost of project in ether
        //calculate cost of project in tokens currently (_cost in wei)
        //check proposer has at least 5% of the proposed cost in tokens
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',95);
        __AssertPreCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',3);
 __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',6);
require(now < _stakingPeriod && _cost > 0);__AssertPostCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',3);


__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',97);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',7);
uint256 costProportion = Division.percent(_cost, distributeToken.weiBal(), 10);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',98);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',8);
uint256 proposerTokenCost = (
            Division.percent(costProportion, proposeProportion, 10) *
            distributeToken.totalSupply()) /
            10000000000;           //divide by 20 to get 5 percent of tokens
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',102);
        __AssertPreCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',4);
 __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',9);
require(distributeToken.balanceOf(msg.sender) >= proposerTokenCost);__AssertPostCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',4);


__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',104);
        distributeToken.transferToEscrow(msg.sender, proposerTokenCost);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',105);
             __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',10);
address projectAddress = projectRegistry.createProject(
            _cost,
            costProportion,
            _stakingPeriod,
            msg.sender,
            1,
            proposerTokenCost,
            _ipfsHash
        );
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',114);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',11);
ProjectCreated(projectAddress, _cost, proposerTokenCost);
    }

    /**
    @notice Refund a reputation proposer upon proposal success, transfer 1% of the project cost in
    wei as a reward along with any tokens staked.
    @param _projectAddress Address of the project
    */
    function refundProposer(address _projectAddress) public {__FunctionCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',5);
                                 //called by proposer to get refund once project is active
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',123);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',12);
Project project = Project(_projectAddress);                            //called by proposer to get refund once project is active
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',124);
        __AssertPreCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',5);
 __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',13);
require(project.proposer() == msg.sender);__AssertPostCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',5);

__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',125);
        __AssertPreCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',6);
 __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',14);
require(project.proposerType() == 1);__AssertPostCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',6);


__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',127);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',15);
uint256[2] memory proposerVals = projectRegistry.refundProposer(_projectAddress);        //call project to "send back" staked tokens to put in proposer's balances
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',128);
        distributeToken.transferFromEscrow(msg.sender, proposerVals[1]);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',129);
        distributeToken.transferWeiTo(msg.sender, proposerVals[0] / 100);
    }

    // =====================================================================
    // STAKE
    // =====================================================================

    /**
    @notice Stake `_tokens` tokens on project at `_projectAddress`
    @dev Prevents over staking and returns any excess tokens staked.
    @param _projectAddress Address of the project
    @param _tokens Amount of tokens to stake
    */
    function stakeTokens(address _projectAddress, uint256 _tokens) public {__FunctionCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',6);

__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',143);
        __AssertPreCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',7);
 __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',16);
require(distributeToken.balanceOf(msg.sender) >= _tokens);__AssertPostCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',7);


__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',145);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',17);
Project project = Project(_projectAddress);
        // require(project.state() == 1);   ------> this now happens in project.stakeTokens()
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',147);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',18);
uint256 weiRemaining = project.weiCost() - project.weiBal();
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',148);
        __AssertPreCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',8);
 __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',19);
require(weiRemaining > 0);__AssertPostCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',8);


__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',150);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',20);
uint256 currentPrice = distributeToken.currentPrice();
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',151);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',21);
uint256 weiVal =  currentPrice * _tokens;
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',152);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',22);
bool flag = weiVal > weiRemaining;
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',153);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',23);
uint256 weiChange; (,weiChange) = flag
            ? (__BranchCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',9,0),weiRemaining)
            : (__BranchCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',9,1),weiVal);       //how much ether to send on change
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',156);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',24);
uint256 tokens; (,tokens) = flag
            ? ((__BranchCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',10,0),(weiRemaining/currentPrice) + 1))
            : (__BranchCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',10,1),_tokens);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',159);
        project.stakeTokens(msg.sender, tokens, weiChange);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',160);
        distributeToken.transferWeiTo(_projectAddress, weiChange);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',161);
        distributeToken.transferToEscrow(msg.sender, tokens);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',162);
        projectRegistry.checkStaked(_projectAddress);
    }

    /**
    @notice Unstake `_tokens` tokens from project at `_projectAddress`
    @dev Require tokens unstaked is greater than 0
    @param _projectAddress Address of the project
    @param _tokens Amount of reputation to unstake
    */
    function unstakeTokens(address _projectAddress, uint256 _tokens) public {__FunctionCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',7);

__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',172);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',25);
uint256 weiVal = Project(_projectAddress).unstakeTokens(msg.sender, _tokens);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',173);
        distributeToken.transferWeiTo(msg.sender, weiVal);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',174);
        distributeToken.transferFromEscrow(msg.sender, _tokens);
    }

    // =====================================================================
    // VALIDATION
    // =====================================================================

    /**
    @notice Validate a task at index `_index` from project at `_projectAddress` with `_tokens`
    tokens for validation state `_validationState`
    @dev Requires the token balance of msg.sender to be greater than the reputationVal of the task
    @param _projectAddress Address of the project
    @param _index Index of the task
    @param _tokens Amount of tokens to stake on the validation state
    @param _validationState Approve or Deny task
    */
    function validateTask(
        address _projectAddress,
        uint256 _index,
        uint256 _tokens,
        bool _validationState
    ) public {__FunctionCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',8);

__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',196);
        __AssertPreCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',11);
 __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',26);
require(distributeToken.balanceOf(msg.sender) >= _tokens);__AssertPostCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',11);

__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',197);
        distributeToken.transferToEscrow(msg.sender, _tokens);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',198);
        _projectAddress.validate(msg.sender, _index, _tokens, _validationState);
    }

    /**
    @notice Reward the validator of a task if they have been determined to have validated correctly.
    @param _projectAddress Address of the project
    @param _index Index of the task
    */
    function rewardValidator(address _projectAddress, uint256 _index) public {__FunctionCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',9);

__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',207);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',27);
Project project = Project(_projectAddress);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',208);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',28);
Task task = Task(project.tasks(_index));
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',209);
        __AssertPreCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',12);
 __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',29);
require(task.claimable());__AssertPostCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',12);


__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',211);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',30);
var (status, reward) = task.validators(msg.sender);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',212);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',31);
if (task.totalValidateNegative() == 0) {__BranchCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',13,0);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',213);
            __AssertPreCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',14);
 __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',32);
require(status == 1);__AssertPostCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',14);

        } else { __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',33);
__BranchCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',13,1);if (task.totalValidateAffirmative() == 0) {__BranchCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',15,0);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',215);
            __AssertPreCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',16);
 __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',34);
require(status == 0);__AssertPostCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',16);

        } else {__BranchCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',15,1);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',217);
             __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',35);
revert();
        }}
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',219);
        task.clearValidatorStake(msg.sender);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',220);
        distributeToken.transferFromEscrow(msg.sender, reward);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',221);
        distributeToken.transferWeiTo(msg.sender, reward * distributeToken.currentPrice() / 100);
    }

    // =====================================================================
    // VOTING
    // =====================================================================

    /**
    @notice First part of voting process. Commits a vote using tokens to task at index `_index`
    of project at `projectAddress` for tokens `_tokens`. Submits a secrect hash `_secretHash`,
    which is a tightly packed hash of the voters choice and their salt
    @param _projectAddress Address of the project
    @param _index Index of the task
    @param _tokens Tokens to vote with
    @param _secretHash Secret Hash of voter choice and salt
    @param _prevPollID The nonce of the previous poll. This is stored off chain
    */
    function voteCommit(
        address _projectAddress,
        uint256 _index,
        uint256 _tokens,
        bytes32 _secretHash,
        uint256 _prevPollID
    ) public {__FunctionCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',10);
     //_secretHash Commit keccak256 hash of voter's choice and salt (tightly packed in this order), done off-chain
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',245);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',36);
uint256 pollId = Task(Project(_projectAddress).tasks(_index)).pollId();
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',246);
        __AssertPreCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',17);
 __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',37);
require(pollId != 0);__AssertPostCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',17);

        //calculate available tokens for voting
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',248);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',38);
uint256 availableTokens = plcrVoting.getAvailableTokens(msg.sender, 1);
        //make sure msg.sender has tokens available in PLCR contract
        //if not, request voting rights for token holder
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',251);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',39);
if (availableTokens < _tokens) {__BranchCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',18,0);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',252);
            __AssertPreCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',19);
 __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',40);
require(distributeToken.balanceOf(msg.sender) >= _tokens - availableTokens);__AssertPostCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',19);

__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',253);
            distributeToken.transferToEscrow(msg.sender, _tokens - availableTokens);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',254);
            plcrVoting.requestVotingRights(msg.sender, _tokens - availableTokens);
        }else { __BranchCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',18,1);}

__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',256);
        plcrVoting.commitVote(msg.sender, pollId, _secretHash, _tokens, _prevPollID);
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
    ) public {__FunctionCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',11);

__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',272);
        plcrVoting.revealVote(Task(Project(_projectAddress).tasks(_index)).pollId(), _voteOption, _salt);
    }

    /**
    @notice Withdraw voting rights from PLCR Contract
    @param _tokens Amount of tokens to withdraw
    */
    function refundVotingTokens(uint256 _tokens) public {__FunctionCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',12);

__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',280);
        plcrVoting.withdrawVotingRights(msg.sender, _tokens);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',281);
        distributeToken.transferFromEscrow(msg.sender, _tokens);
    }

    // =====================================================================
    // COMPLETE
    // =====================================================================

    /**
    @notice Refund a token staker from project at `_projectAddress`
    @param _projectAddress Address of the project
    */
    function refundStaker(address _projectAddress) public {__FunctionCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',13);

__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',293);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',41);
uint256 refund = _projectAddress.refundStaker(msg.sender);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',294);
        __AssertPreCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',20);
 __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',42);
require(refund > 0);__AssertPostCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',20);


__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',296);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',43);
Project(_projectAddress).clearTokenStake(msg.sender);
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',297);
        distributeToken.transferFromEscrow(msg.sender, refund);
    }

    /**
    @notice Rescue unrevealed reputation votes from expired polls of task at `_index` of project at
    `_projectAddress`
    @param _projectAddress Address of the project
    @param _index Index of the task
    */
    function rescueTokens(address _projectAddress, uint _index) public {__FunctionCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',14);

        //rescue locked tokens that weren't revealed
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',308);
         __StatementCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',44);
uint256 pollId = Task(Project(_projectAddress).tasks(_index)).pollId();
__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',309);
        plcrVoting.rescueTokens(msg.sender, pollId);
    }

    // =====================================================================
    // FAILED
    // =====================================================================

    /**
    @notice Return wei from project balance if task fails
    @dev Only callable by the ProjectRegistry contract
    @param _value Amount of wei to transfer to the distributeToken contract
    */
    function revertWei(uint256 _value) public onlyPR {__FunctionCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',15);

__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',322);
        distributeToken.returnWei(_value);
    }

    /**
    @notice Burn tokens in event of project failure
    @dev Only callable by the ProjectRegistry contract
    @param _tokens Amount of reputation to burn
    */
    function burnTokens(uint256 _tokens) public onlyPR {__FunctionCoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',16);

__CoverageTokenRegistry('/Users/shokishoki/development/consensys/distribute/contracts/contracts/TokenRegistry.sol',331);
        distributeToken.burn(_tokens);
    }

}
