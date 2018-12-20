pragma solidity ^0.5.0;

import "./ProjectRegistry.sol";
import "./DistributeToken.sol";
import "./Project.sol";
import "./ProjectLibrary.sol";
import "./Task.sol";
import "./library/PLCRVoting.sol";
import "./library/Division.sol";
import "./library/SafeMath.sol";
import "./library/Ownable.sol";

/**
@title This contract serves as the interface through which users propose projects, stake tokens,
come to consensus around tasks, validate projects, vote on projects, refund their stakes, and
claim their rewards.
@author Team: Jessica Marshall, Ashoka Finley
@notice This contract implements how users perform actions using capital tokens in the various stages of a project.
*/
contract TokenRegistry is Ownable {

    using ProjectLibrary for address;
    using SafeMath for uint256;

    // =====================================================================
    // EVENTS
    // =====================================================================

    event LogProjectCreated(address projectAddress, uint256 weiCost, uint256 tokenCost);
    event LogStakedTokens(address indexed projectAddress, uint256 tokens, uint256 weiChange, address staker, bool staked);
    event LogUnstakedTokens(address indexed projectAddress, uint256 tokens, uint256 weiChange, address unstaker);
    event LogValidateTask(address indexed projectAddress, uint256 validationFee, bool validationState, uint256 taskIndex, address validator);
    event LogRewardValidator(address indexed projectAddress, uint256 index, uint256 weiReward, uint256 returnAmount, address validator);
    event LogTokenVoteCommitted(address indexed projectAddress, uint256 index, uint256 tokens, bytes32 secretHash, uint256 pollId, address voter);
    event LogTokenVoteRevealed(address indexed projectAddress, uint256 index, uint256 voteOption, uint256 salt, address voter);
    event LogTokenVoteRescued(address indexed projectAddress, uint256 index, uint256 pollId, address voter);

    // =====================================================================
    // STATE VARIABLES
    // =====================================================================

    ProjectRegistry projectRegistry;
    DistributeToken distributeToken;
    PLCRVoting plcrVoting;

    uint256 proposeProportion = 200000000000;  // tokensupply/proposeProportion is the number of tokens the proposer must stake
    uint256 rewardProportion = 100;

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
    @dev Quasi constructor is called after contract is deployed, must be called with distributeToken,
    projectRegistry, and plcrVoting intialized to 0
    @param _distributeToken Address of DistributeToken contract
    @param _projectRegistry Address of ProjectRegistry contract
    @param _plcrVoting Address of PLCRVoting contract
    */
    function init(address payable _distributeToken, address _projectRegistry, address _plcrVoting) public { //contract is created
        require(
            address(distributeToken) == address(0) &&
            address(projectRegistry) == address(0) &&
            address(plcrVoting) == address(0)
        );

        distributeToken = DistributeToken(_distributeToken);
        projectRegistry = ProjectRegistry(_projectRegistry);
        plcrVoting = PLCRVoting(_plcrVoting);
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
     * @dev Update the address of the distributeToken
     * @param _newDistributeToken Address of the new distribute token
     */
    function updateDistributeToken(address payable _newDistributeToken) external onlyOwner {
      distributeToken = DistributeToken(_newDistributeToken);
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
    // FALLBACK
    // =====================================================================

    function() external payable {}

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
    function proposeProject(uint256 _cost, uint256 _stakingPeriod, bytes calldata _ipfsHash) external {
        require(!freeze);
        require(block.timestamp < _stakingPeriod && _cost > 0);
        uint256 costProportion = Division.percent(_cost, distributeToken.weiBal(), 10);
        uint256 proposerTokenCost = (
            Division.percent(costProportion, proposeProportion, 10).mul(
            distributeToken.totalSupply())).div(
            10000000000);
            //divide by 20 to get 5 percent of tokens
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
        emit LogProjectCreated(projectAddress, _cost, proposerTokenCost);
    }

    /**
    @notice Refund a token proposer upon proposal success, transfer 5% of the project cost in
    wei as a reward along with any tokens staked on the project.
    @dev token proposer types are denoted by '1' and reputation proposers by '2'
    @param _projectAddress Address of the project
    */
    function refundProposer(address payable _projectAddress) external {                                 //called by proposer to get refund once project is active
        require(!freeze);
        Project project = Project(_projectAddress);                            //called by proposer to get refund once project is active
        require(project.proposer() == msg.sender);
        require(project.proposerType() == 1);

        uint256[2] memory proposerVals = projectRegistry.refundProposer(_projectAddress, msg.sender);        //call project to "send back" staked tokens to put in proposer's balances
        distributeToken.transferFromEscrow(msg.sender, proposerVals[1]);
        distributeToken.transferWeiTo(msg.sender, proposerVals[0] / (20));
    }

    /**
    @notice Rewards the originator of a project plan in tokens.
    @param _projectAddress Address of the project
    */
    function rewardOriginator(address payable _projectAddress) external {
      require(!freeze);
      Project project = Project(_projectAddress);
      require(project.state() == 6);
      projectRegistry.rewardOriginator(_projectAddress, msg.sender);
      project.transferWeiReward(msg.sender, project.originatorReward());
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
    function stakeTokens(address payable _projectAddress, uint256 _tokens) external {
        require(!freeze);
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
        distributeToken.transferWeiTo(_projectAddress, weiChange);
        distributeToken.transferToEscrow(msg.sender, tokens);
        bool staked = projectRegistry.checkStaked(_projectAddress);
        emit LogStakedTokens(_projectAddress, tokens, weiChange, msg.sender, staked);
    }

    /**
    @notice Unstake `_tokens` tokens from project at `_projectAddress`
    @dev Require tokens unstaked is greater than 0
    @param _projectAddress Address of the project
    @param _tokens Amount of reputation to unstake
    */
    function unstakeTokens(address payable _projectAddress, uint256 _tokens) external {
        require(!freeze);
        require(projectRegistry.projects(_projectAddress) == true);
        // handles edge case where someone attempts to unstake past the staking deadline
        projectRegistry.checkStaked(_projectAddress);

        uint256 weiVal = Project(_projectAddress).unstakeTokens(msg.sender, _tokens, address(distributeToken));
        // the actual wei is sent back to DT via Project.unstakeTokens()
        // the weiBal is updated via the next line
        distributeToken.returnWei(weiVal);
        distributeToken.transferFromEscrow(msg.sender, _tokens);
        emit LogUnstakedTokens(_projectAddress, _tokens, weiVal, msg.sender);
    }

    /**
    @notice Calculates the relative weight of an `_address`.
    Weighting is calculated by the proportional amount of tokens a user possess in relation to the total supply.
    @param _address Address of the staker
    @return The relative weight of a staker as a whole integer
    */
    function calculateWeightOfAddress(
        address _address
    ) public view returns (uint256) {
        return Division.percent(distributeToken.balanceOf(_address), distributeToken.totalSupply(), 15);
    }

    // =====================================================================
    // VALIDATION
    // =====================================================================

    /**
    @notice Validate a task at index `_index` from project at `_projectAddress` with `_tokens`
    tokens for validation state `_validationState`
    @dev Requires the token balance of msg.sender to be greater than the reputationVal of the task
    @param _projectAddress Address of the project
    @param _taskIndex Index of the task
    @param _validationState Approve or Deny task
    */
    function validateTask(
        address payable _projectAddress,
        uint256 _taskIndex,
        bool _validationState
    ) external {
        require(!freeze);
        require(projectRegistry.projects(_projectAddress) == true);
        Project project = Project(_projectAddress);
        Task task = Task(project.tasks(_taskIndex));
        uint256 validationFee = task.validationEntryFee();
        require(distributeToken.balanceOf(msg.sender) >= validationFee);
        distributeToken.transferToEscrow(msg.sender, validationFee);
        ProjectLibrary.validate(_projectAddress, msg.sender, _taskIndex, _validationState);
        emit LogValidateTask(_projectAddress, validationFee, _validationState, _taskIndex, msg.sender);
    }

    /**
    @notice Reward the validator of a task if they have been determined to have validated correctly.
    @param _projectAddress Address of the project
    @param _index Index of the task
    */
    function rewardValidator(address payable _projectAddress, uint256 _index) external {
        require(!freeze);
        require(projectRegistry.projects(_projectAddress) == true);
        Project project = Project(_projectAddress);
        Task task = Task(project.tasks(_index));
        require(task.claimable());
        uint returnAmount;
        uint index = task.getValidatorIndex(msg.sender);
        require(index < 5);
        task.setValidatorIndex(msg.sender);
        uint rewardWeighting = projectRegistry.validationRewardWeightings(index);
        uint statusNeed = task.claimableByRep() ? 1 : 0;
        uint weiReward;

        if (statusNeed == task.getValidatorStatus(msg.sender)) {
            returnAmount += task.validationEntryFee();
            uint validationIndex;
            if (task.getValidatorStatus(msg.sender) == 1) {
              require(task.affirmativeValidators(index) == msg.sender);
              validationIndex = task.affirmativeIndex();
            } else {
              require(task.negativeValidators(index) == msg.sender);
              validationIndex = task.negativeIndex();
            }
            if (validationIndex < 5) {
                uint addtlWeighting;
                for(uint i = validationIndex ; i < 5; i++) {
                    addtlWeighting = addtlWeighting.add(projectRegistry.validationRewardWeightings(i));
                }
                rewardWeighting = rewardWeighting.add(addtlWeighting.div(validationIndex));
            }
            weiReward = project.validationReward().mul(task.weighting()).mul(rewardWeighting).div(10000);
            project.transferWeiReward(msg.sender, weiReward);
            emit LogRewardValidator(_projectAddress, _index, weiReward, returnAmount, msg.sender);
        } else {
            weiReward = 0;
            statusNeed == 1
                ? require(task.negativeValidators(index) == msg.sender)
                : require(task.affirmativeValidators(index) == msg.sender);
            returnAmount += task.validationEntryFee() / 2;
            distributeToken.burn(task.validationEntryFee() - returnAmount);
            emit LogRewardValidator(_projectAddress, _index, 0, returnAmount, msg.sender);
        }
        emit LogRewardValidator(_projectAddress, _index, weiReward, returnAmount, msg.sender);
        distributeToken.transferFromEscrow(msg.sender, returnAmount);
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
    @param _votes Tokens to vote with
    @param _secretHash Secret Hash of voter choice and salt
    @param _prevPollID The nonce of the previous poll. This is stored off chain
    */
    function voteCommit(
        address payable _projectAddress,
        uint256 _index,
        uint256 _votes,
        bytes32 _secretHash,
        uint256 _prevPollID
    ) external {     // _secretHash Commit keccak256 hash of voter's choice and salt (tightly packed in this order), done off-chain
        require(!freeze);
        require(projectRegistry.projects(_projectAddress) == true);
        uint256 pollId = Task(Project(_projectAddress).tasks(_index)).pollId();
        // calculate available tokens for voting
        uint256 availableVotes = plcrVoting.getAvailableTokens(msg.sender, 1);
        // make sure msg.sender has tokens available in PLCR contract
        // if not, request voting rights for token holder
        if (availableVotes < _votes) {
            uint votesCost = squaredAmount(_votes) - squaredAmount(availableVotes);
            require(distributeToken.balanceOf(msg.sender) >= votesCost);
            distributeToken.transferToEscrow(msg.sender, votesCost);
            plcrVoting.requestVotingRights(msg.sender, _votes - availableVotes);
        }
        plcrVoting.commitVote(msg.sender, pollId, _secretHash, _votes, _prevPollID);
        emit LogTokenVoteCommitted(_projectAddress, _index, _votes, _secretHash, pollId, msg.sender);
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
        emit LogTokenVoteRevealed(_projectAddress, _index, _voteOption, _salt, msg.sender);
    }

    /**
    @notice Refunds staked tokens, thus also withdrawing voting rights from PLCR Contract
    @param _votes Amount of tokens to withdraw
    */
    function refundVotingTokens(uint256 _votes) external {
        require(!freeze);
        uint userVotes = plcrVoting.getAvailableTokens(msg.sender, 1);
        require(_votes <= userVotes);
        uint votesPrice = squaredAmount(userVotes) - squaredAmount(userVotes - _votes);
        plcrVoting.withdrawVotingRights(msg.sender, _votes);
        distributeToken.transferFromEscrow(msg.sender, votesPrice);
    }

    // =====================================================================
    // COMPLETE
    // =====================================================================

    /**
    @notice Refund a token staker from project at `_projectAddress`
    @param _projectAddress Address of the project
    */
    function refundStaker(address payable _projectAddress) external {
        require(!freeze);
        require(projectRegistry.projects(_projectAddress) == true);
        uint256 refund = ProjectLibrary.refundStaker(_projectAddress, msg.sender, address(this));
        require(refund > 0);
        Project(_projectAddress).clearTokenStake(msg.sender);
        distributeToken.transferFromEscrow(msg.sender, refund);
        if (Project(_projectAddress).state() == 6) {
          distributeToken.transferTokensTo(msg.sender, refund / 20);
        }
    }

    /**
    @notice Rescue unrevealed token votes from expired polls of task at `_index` of project at
    `_projectAddress`
    @param _projectAddress Address of the project
    @param _index Index of the task
    */
    function rescueTokens(address payable _projectAddress, uint _index) external {
        require(!freeze);
        require(projectRegistry.projects(_projectAddress) == true);
        uint256 pollId = Task(Project(_projectAddress).tasks(_index)).pollId();
        plcrVoting.rescueTokens(msg.sender, pollId);
        emit LogTokenVoteRescued(_projectAddress, _index, pollId, msg.sender);
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
        require(!freeze);
        distributeToken.returnWei(_value);
    }

    /**
    @notice Burn tokens in event of project failure
    @dev Only callable by the ProjectRegistry contract
    @param _tokens Amount of reputation to burn
    */
    function burnTokens(uint256 _tokens) external onlyPR {
        require(!freeze);
        distributeToken.burn(_tokens);
    }

}
