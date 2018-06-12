pragma solidity ^0.4.21;

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
@notice This contract implements how users perform actions using capital tokens in the various stages of a project.
*/
contract TokenRegistry {

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

    modifier onlyPR() {
        require(msg.sender == address(projectRegistry));
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
    function init(address _distributeToken, address _projectRegistry, address _plcrVoting) public { //contract is created
        require(
            address(distributeToken) == 0 &&
            address(projectRegistry) == 0 &&
            address(plcrVoting) == 0
        );

        distributeToken = DistributeToken(_distributeToken);
        projectRegistry = ProjectRegistry(_projectRegistry);
        plcrVoting = PLCRVoting(_plcrVoting);
    }

    // =====================================================================
    // FALLBACK
    // =====================================================================

    function() public payable {}

    // =====================================================================
    // PROPOSE
    // =====================================================================

    /**
    @notice Propose a project of cost `_cost` with staking period `_stakingPeriod` and hash `_ipfsHash`,
    with tokens.
    @dev Calls ProjectRegistry.createProject to finalize transaction and emits ProjectCreated event
    @param _cost Total project cost in wei
    @param _stakingPeriod Length of time the project can be staked on before it expires
    @param _ipfsHash Hash of the project description
    */
    function proposeProject(uint256 _cost, uint256 _stakingPeriod, bytes _ipfsHash) external {
        // _cost of project in wei
        // calculate cost of project in tokens currently (_cost in wei)
        // check proposer has at least 5% of the proposed cost in tokens
        require(now < _stakingPeriod && _cost > 0);

        uint256 costProportion = Division.percent(_cost, distributeToken.weiBal(), 10);
        uint256 proposerTokenCost = (
            Division.percent(costProportion, proposeProportion, 10) *
            distributeToken.totalSupply()) /
            10000000000;           //divide by 20 to get 5 percent of tokens
        require(distributeToken.balanceOf(msg.sender) >= proposerTokenCost);

        distributeToken.transferToEscrow(msg.sender, proposerTokenCost);
        address projectAddress = projectRegistry.createProject(
            _cost,
            costProportion,
            _stakingPeriod,
            msg.sender,
            1,
            proposerTokenCost,
            _ipfsHash
        );
        emit ProjectCreated(projectAddress, _cost, proposerTokenCost);
    }

    /**
    @notice Refund a token proposer upon proposal success, transfer 1% of the project cost in
    wei as a reward along with any tokens staked on the project.
    @dev token proposer types are denoted by '1' and reputation proposers by '2'
    @param _projectAddress Address of the project
    */
    function refundProposer(address _projectAddress) external {                                 //called by proposer to get refund once project is active
        Project project = Project(_projectAddress);                            //called by proposer to get refund once project is active
        require(project.proposer() == msg.sender);
        require(project.proposerType() == 1);

        uint256[2] memory proposerVals = projectRegistry.refundProposer(_projectAddress);        //call project to "send back" staked tokens to put in proposer's balances
        distributeToken.transferFromEscrow(msg.sender, proposerVals[1]);
        distributeToken.transferWeiTo(msg.sender, proposerVals[0] / (100));
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
    function stakeTokens(address _projectAddress, uint256 _tokens) external {
        require(projectRegistry.projects(_projectAddress) == true);
        require(distributeToken.balanceOf(msg.sender) >= _tokens);
        Project project = Project(_projectAddress);
        // handles edge case where someone attempts to stake past the staking deadline
        projectRegistry.checkStaked(_projectAddress);
        require(project.state() == 1);

        // calculate amount of wei the project still needs
        uint256 weiRemaining = project.weiCost() - project.weiBal();
        require(weiRemaining > 0);

        uint256 currentPrice = distributeToken.currentPrice();
        uint256 weiVal =  currentPrice * _tokens;
        bool flag = weiVal > weiRemaining;
        uint256 weiChange = flag
            ? weiRemaining
            : weiVal;       //how much ether to send on change
        uint256 tokens = flag
            ? ((weiRemaining/currentPrice) + 1)     // round up to prevent loophole where user can stake without losing tokens
            : _tokens;
        // updating of P weiBal happens via the next line
        project.stakeTokens(msg.sender, tokens, weiChange);
        // the transfer of wei and the updating of DT weiBal happens via the next line
        distributeToken.transferWeiTo(_projectAddress, weiChange);      // A and S are confused - why is this here/what is it doing?
        distributeToken.transferToEscrow(msg.sender, tokens);
        projectRegistry.checkStaked(_projectAddress);
    }

    /**
    @notice Unstake `_tokens` tokens from project at `_projectAddress`
    @dev Require tokens unstaked is greater than 0
    @param _projectAddress Address of the project
    @param _tokens Amount of reputation to unstake
    */
    function unstakeTokens(address _projectAddress, uint256 _tokens) external {
        require(projectRegistry.projects(_projectAddress) == true);
        // handles edge case where someone attempts to unstake past the staking deadline
        projectRegistry.checkStaked(_projectAddress);

        uint256 weiVal = Project(_projectAddress).unstakeTokens(msg.sender, _tokens, address(distributeToken));
        // the actual wei is sent back to DT via Project.unstakeTokens()
        // the weiBal is updated via the next line
        distributeToken.returnWei(weiVal);
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
    ) external {
        require(projectRegistry.projects(_projectAddress) == true);
        require(distributeToken.balanceOf(msg.sender) >= _tokens);
        distributeToken.transferToEscrow(msg.sender, _tokens);
        _projectAddress.validate(msg.sender, _index, _tokens, _validationState);
    }

    /**
    @notice Reward the validator of a task if they have been determined to have validated correctly.
    @param _projectAddress Address of the project
    @param _index Index of the task
    */
    function rewardValidator(address _projectAddress, uint256 _index) external {
        require(projectRegistry.projects(_projectAddress) == true);
        Project project = Project(_projectAddress);
        Task task = Task(project.tasks(_index));
        require(task.claimable());
        uint status = task.getValidatorStatus(msg.sender);
        uint reward = task.getValidatorStake(msg.sender);
        if (task.totalValidateNegative() == 0) {
            require(status == 1);
        } else if (task.totalValidateAffirmative() == 0) {
            require(status == 0);
        } else {
            revert();
        }
        task.clearValidatorStake(msg.sender);
        distributeToken.transferFromEscrow(msg.sender, reward);
        distributeToken.transferWeiTo(msg.sender, reward * 101/100);
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
    ) external {     //_secretHash Commit keccak256 hash of voter's choice and salt (tightly packed in this order), done off-chain
        require(projectRegistry.projects(_projectAddress) == true);
        uint256 pollId = Task(Project(_projectAddress).tasks(_index)).pollId();
        require(pollId != 0);
        //calculate available tokens for voting
        uint256 availableTokens = plcrVoting.getAvailableTokens(msg.sender, 1);
        //make sure msg.sender has tokens available in PLCR contract
        //if not, request voting rights for token holder
        if (availableTokens < _tokens) {
            require(distributeToken.balanceOf(msg.sender) >= _tokens - availableTokens);
            distributeToken.transferToEscrow(msg.sender, _tokens - availableTokens);
            plcrVoting.requestVotingRights(msg.sender, _tokens - availableTokens);
        }
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
    ) external {
        require(projectRegistry.projects(_projectAddress) == true);
        plcrVoting.revealVote(Task(Project(_projectAddress).tasks(_index)).pollId(), _voteOption, _salt);
    }

    /**
    @notice Refunds staked tokens, thus also withdrawing voting rights from PLCR Contract
    @param _tokens Amount of tokens to withdraw
    */
    function refundVotingTokens(uint256 _tokens) external {
        plcrVoting.withdrawVotingRights(msg.sender, _tokens);
        distributeToken.transferFromEscrow(msg.sender, _tokens);
    }

    // =====================================================================
    // COMPLETE
    // =====================================================================

    /**
    @notice Refund a token staker from project at `_projectAddress`
    @param _projectAddress Address of the project
    */
    function refundStaker(address _projectAddress) external {
        require(projectRegistry.projects(_projectAddress) == true);
        uint256 refund = _projectAddress.refundStaker(msg.sender);
        require(refund > 0);

        Project(_projectAddress).clearTokenStake(msg.sender);
        distributeToken.transferFromEscrow(msg.sender, refund);
    }

    /**
    @notice Rescue unrevealed token votes from expired polls of task at `_index` of project at
    `_projectAddress`
    @param _projectAddress Address of the project
    @param _index Index of the task
    */
    function rescueTokens(address _projectAddress, uint _index) external {
        require(projectRegistry.projects(_projectAddress) == true);
        //rescue locked tokens that weren't revealed
        uint256 pollId = Task(Project(_projectAddress).tasks(_index)).pollId();
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
    function revertWei(uint256 _value) external onlyPR {
        distributeToken.returnWei(_value);
    }

    /**
    @notice Burn tokens in event of project failure
    @dev Only callable by the ProjectRegistry contract
    @param _tokens Amount of reputation to burn
    */
    function burnTokens(uint256 _tokens) external onlyPR {
        distributeToken.burn(_tokens);
    }

}
