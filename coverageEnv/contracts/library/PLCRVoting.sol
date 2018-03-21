pragma solidity ^0.4.19;

//import files
import "./DLL.sol";
import "./AttributeStore.sol";
import "../ProjectRegistry.sol";

/**
@title Partial-Lock-Commit-Reveal Voting scheme with ERC20 tokens
@author Team: Aspyn Palatnick, Cem Ozer, Yorke Rhodes
*/
contract PLCRVoting {event __CoveragePLCRVoting(string fileName, uint256 lineNumber);
event __FunctionCoveragePLCRVoting(string fileName, uint256 fnId);
event __StatementCoveragePLCRVoting(string fileName, uint256 statementId);
event __BranchCoveragePLCRVoting(string fileName, uint256 branchId, uint256 locationIdx);
event __AssertPreCoveragePLCRVoting(string fileName, uint256 branchId);
event __AssertPostCoveragePLCRVoting(string fileName, uint256 branchId);


    event VoteCommitted(address voter, uint pollID, uint numTokens);
    event VoteRevealed(address voter, uint pollID, uint numTokens, uint choice);
    event PollCreated(uint voteQuorum, uint commitDuration, uint revealDuration, uint pollID);
    event VotingRightsGranted(address voter, uint numTokens);
    event VotingRightsWithdrawn(address voter, uint numTokens);

    /// maps user's address to voteToken balance
    mapping(address => uint) public voteTokenBalance;
    mapping(address => uint) public voteReputationBalance;

    struct Poll {
        uint commitEndDate;     /// expiration date of commit period for poll
        uint revealEndDate;     /// expiration date of reveal period for poll
        uint voteQuorum;	    /// number of votes required for a proposal to pass
        uint votesFor;		    /// tally of votes supporting proposal
        uint votesAgainst;      /// tally of votes countering proposal
    }

    /// maps pollID to Poll struct
    mapping(uint => Poll) public pollMap;
    uint pollNonce;

    using DLL for DLL.Data;
    mapping(address => DLL.Data) dllMap;

    using AttributeStore for AttributeStore.Data;
    AttributeStore.Data store;

    // =====================================================================
    // MODIFIERS
    // =====================================================================

      modifier onlyTRRR() {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',1);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',47);
        __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',1);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',1);
require(msg.sender == reputationRegistry || msg.sender == tokenRegistry);__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',1);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',48);
        _;
      }

      modifier onlyTR() {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',2);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',52);
        __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',2);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',2);
require(msg.sender == tokenRegistry);__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',2);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',53);
        _;
      }

    // ============
    // CONSTRUCTOR:
    // ============

    uint256 constant INITIAL_POLL_NONCE = 0;

    address tokenRegistry;
    address reputationRegistry;
    address projectRegistry;

    /**
    @dev Initializes voteQuorum, commitDuration, revealDuration, and pollNonce in addition to token contract and trusted mapping
    */
    function PLCRVoting(address _tokenRegistry, address _reputationRegistry, address _projectRegistry) public {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',3);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',70);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',3);
tokenRegistry = _tokenRegistry;
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',71);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',4);
reputationRegistry = _reputationRegistry;
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',72);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',5);
projectRegistry = _projectRegistry;
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',73);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',6);
pollNonce = INITIAL_POLL_NONCE;
    }

    // ================
    // TOKEN INTERFACE:
    // ================

    /**
    @notice Returns the available tokens for voting for voter `_voter`
    @param _voter Address of the voter
    @param _type The type of the validator
    */
    function getAvailableTokens(address _voter, uint _type) public  returns(uint256) {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',4);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',86);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',7);
return _type == 1
            ? voteTokenBalance[_voter] - getLockedTokens(_voter)
            : voteReputationBalance[_voter] - getLockedTokens(_voter);
    }
    /**
    @notice Loads _numTokens ERC20 tokens into the voting contract for one-to-one voting rights
    @dev Assumes that msg.sender has approved voting contract to spend on their behalf
    @param _numTokens The number of votingTokens desired in exchange for ERC20 tokens
    */
    function requestVotingRights(address _staker, uint _numTokens) public onlyTRRR() {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',5);

        //checks done in THR/WR to ensure that staker has tokens to vote with
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',97);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',8);
if (msg.sender == tokenRegistry) {__BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',3,0);
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',98);
             __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',9);
voteTokenBalance[_staker] += _numTokens;
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',99);
             __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',10);
VotingRightsGranted(_staker, _numTokens);
        } else { __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',11);
__BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',3,1);if (msg.sender == reputationRegistry) {__BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',4,0);
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',101);
             __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',12);
voteReputationBalance[_staker] += _numTokens;
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',102);
             __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',13);
VotingRightsGranted(_staker, _numTokens);
        }else { __BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',4,1);}
}
    }

    /**
    @notice Withdraw _numTokens ERC20 tokens from the voting contract, revoking these voting rights
    @param _numTokens The number of ERC20 tokens desired in exchange for voting rights
    */
    function withdrawVotingRights(address _staker, uint _numTokens) external onlyTRRR() {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',6);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',111);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',14);
if (msg.sender == tokenRegistry) {__BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',5,0);
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',112);
             __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',15);
uint256 availableTokens = voteTokenBalance[_staker] - getLockedTokens(_staker);
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',113);
            __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',6);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',16);
require(availableTokens >= _numTokens);__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',6);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',114);
             __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',17);
voteTokenBalance[_staker] -= _numTokens;
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',115);
             __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',18);
VotingRightsWithdrawn(_staker, _numTokens);
        } else { __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',19);
__BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',5,1);if (msg.sender == reputationRegistry) {__BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',7,0);
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',117);
             __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',20);
availableTokens = voteReputationBalance[_staker] - getLockedTokens(_staker);
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',118);
            __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',8);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',21);
require(availableTokens >= _numTokens);__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',8);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',119);
             __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',22);
voteReputationBalance[_staker] -= _numTokens;
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',120);
             __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',23);
VotingRightsWithdrawn(_staker, _numTokens);
        }else { __BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',7,1);}
}
    }

    /**
    @dev Unlocks tokens locked in unrevealed vote where poll has ended
    @param _pollID Integer identifier associated with the target poll
    */
    function rescueTokens(address _staker, uint _pollID) onlyTRRR() external {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',7);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',129);
        __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',9);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',24);
require(pollEnded(_pollID));__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',9);


__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',131);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',25);
if(!hasBeenRevealed(_staker, _pollID)) {__BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',10,0);
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',132);
            dllMap[_staker].remove(_pollID);
        }else { __BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',10,1);}

    }

    // =================
    // VOTING INTERFACE:
    // =================

    /**
    @notice Commits vote using hash of choice and secret salt to conceal vote until reveal
    @param _pollID Integer identifier associated with target poll
    @param _secretHash Commit keccak256 hash of voter's choice and salt (tightly packed in this order)
    @param _numTokens The number of tokens to be committed towards the target poll
    @param _prevPollID The ID of the poll that the user has voted the maximum number of tokens in which is still less than or equal to numTokens
    */
    function commitVote(
        address _staker,
        uint _pollID,
        bytes32 _secretHash,
        uint _numTokens,
        uint _prevPollID
    ) onlyTRRR() external {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',8);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',154);
        __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',11);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',26);
require(commitPeriodActive(_pollID));__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',11);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',155);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',27);
msg.sender == reputationRegistry
            ? (__BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',12,0),require(voteReputationBalance[_staker] >= _numTokens)) // prevent user from overspending
            : (__BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',12,1),require(voteTokenBalance[_staker] >= _numTokens)); // prevent user from overspending
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',158);
        __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',13);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',28);
require(_pollID != 0);__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',13);
                // prevent user from committing to zero node placeholder
        // TODO: Move all insert validation into the DLL lib
        // Check if _prevPollID exists
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',161);
        __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',14);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',29);
require(_prevPollID == 0 || getCommitHash(_staker, _prevPollID) != 0);__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',14);


__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',163);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',30);
uint nextPollID = dllMap[_staker].getNext(_prevPollID);
        // if nextPollID is equal to _pollID, _pollID is being updated,
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',165);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',31);
nextPollID; (,nextPollID) = (nextPollID == _pollID)
            ? (__BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',15,0),dllMap[_staker].getNext(_pollID))
            : (__BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',15,1),nextPollID);
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',168);
        __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',16);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',32);
require(validPosition(_prevPollID, nextPollID, _staker, _numTokens));__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',16);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',169);
        dllMap[_staker].insert(_prevPollID, _pollID, nextPollID);
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',170);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',33);
bytes32 UUID = attrUUID(_staker, _pollID);
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',171);
        store.attachAttribute(UUID, "numTokens", _numTokens);
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',172);
        store.attachAttribute(UUID, "commitHash", uint(_secretHash));
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',173);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',34);
VoteCommitted(_staker, _pollID, _numTokens);
    }

    /**
    @dev Compares previous and next poll's committed tokens for sorting purposes
    @param _prevID Integer identifier associated with previous poll in sorted order
    @param _nextID Integer identifier associated with next poll in sorted order
    @param _voter Address of user to check DLL position for
    @param _numTokens The number of tokens to be committed towards the poll (used for sorting)
    @return valid Boolean indication of if the specified position maintains the sort
    */
    function validPosition(
        uint _prevID,
        uint _nextID,
        address _voter,
        uint _numTokens
    ) public  returns (bool valid) {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',9);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',190);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',35);
bool prevValid = (_numTokens >= getNumTokens(_voter, _prevID));
        // if next is zero node, _numTokens does not need to be greater
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',192);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',36);
bool nextValid = (_numTokens <= getNumTokens(_voter, _nextID) || _nextID == 0);
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',193);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',37);
return prevValid && nextValid;
    }

    /**
    @notice Reveals vote with choice and secret salt used in generating commitHash to attribute committed tokens
    @param _pollID Integer identifier associated with target poll
    @param _voteOption Vote choice used to generate commitHash for associated poll
    @param _salt Secret number used to generate commitHash for associated poll
    */
    function revealVote(uint _pollID, uint _voteOption, uint _salt) onlyTRRR() external {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',10);

    // Make sure the reveal period is active
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',204);
    __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',17);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',38);
require(revealPeriodActive(_pollID));__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',17);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',205);
    __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',18);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',39);
require(!hasBeenRevealed(msg.sender, _pollID));__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',18);
                        // prevent user from revealing multiple times
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',206);
    __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',19);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',40);
require(keccak256(_voteOption, _salt) == getCommitHash(msg.sender, _pollID));__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',19);
 // compare resultant hash from inputs to original commitHash

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',208);
     __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',41);
uint numTokens = getNumTokens(msg.sender, _pollID);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',210);
     __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',42);
if (_voteOption == 1) // apply numTokens to appropriate poll choice
        { __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',43);
__BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',20,0);__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',211);
pollMap[_pollID].votesFor += numTokens;}
    else
        { __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',44);
__BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',20,1);__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',213);
pollMap[_pollID].votesAgainst += numTokens;}

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',215);
    dllMap[msg.sender].remove(_pollID); // remove the node referring to this vote upon reveal

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',217);
     __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',45);
VoteRevealed(msg.sender, _pollID, numTokens, _voteOption);
    }

    /**
    @param _pollID Integer identifier associated with target poll
    @param _salt Arbitrarily chosen integer used to generate secretHash
    @return correctVotes Number of tokens voted for winning option
    */
    function getNumPassingTokens(
      address _voter,
      uint _pollID,
      uint _salt
    ) public  returns (uint correctVotes) {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',11);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',230);
        __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',21);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',46);
require(pollEnded(_pollID));__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',21);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',231);
        __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',22);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',47);
require(hasBeenRevealed(_voter, _pollID));__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',22);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',232);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',48);
uint winningChoice; (,winningChoice) = isPassed(_pollID) ? (__BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',23,0),1) : (__BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',23,1),0);
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',233);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',49);
bytes32 winnerHash = keccak256(winningChoice, _salt);
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',234);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',50);
bytes32 commitHash = getCommitHash(_voter, _pollID);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',236);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',51);
return (winnerHash == commitHash) ? getNumTokens(_voter, _pollID) : 0;
    }

    // ==================
    // POLLING INTERFACE:
    // ==================

    /**
    @dev Initiates a poll with canonical configured parameters at pollID emitted by PollCreated event
    @param _voteQuorum Type of majority (out of 100) that is necessary for poll to be successful
    @param _commitDuration Length of desired commit period in seconds
    @param _revealDuration Length of desired reveal period in seconds
    */
    function startPoll(
      uint _voteQuorum,
      uint _commitDuration,
      uint _revealDuration
    ) public returns (uint pollID) {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',12);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',254);
        __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',24);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',52);
require(msg.sender == projectRegistry);__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',24);


__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',256);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',53);
pollNonce = pollNonce + 1;
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',257);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',54);
pollMap[pollNonce] = Poll({
            voteQuorum: _voteQuorum,
            commitEndDate: block.timestamp + _commitDuration,
            revealEndDate: block.timestamp + _commitDuration + _revealDuration,
            votesFor: 0,
            votesAgainst: 0
        });
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',264);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',55);
PollCreated(_voteQuorum, _commitDuration, _revealDuration, pollNonce);
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',265);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',56);
return pollNonce;
    }

    /**
    @notice Determines if proposal has passed
    @dev Check if votesFor out of totalVotes exceeds votesQuorum (requires pollEnded)
    @param _pollID Integer identifier associated with target poll
    */
    function isPassed(uint _pollID) onlyTRRR()  public returns (bool passed) {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',13);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',274);
        __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',25);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',57);
require(msg.sender == tokenRegistry);__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',25);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',275);
        __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',26);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',58);
require(pollEnded(_pollID));__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',26);


__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',277);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',59);
Poll memory poll = pollMap[_pollID];
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',278);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',60);
return (100 * poll.votesFor) > (poll.voteQuorum * (poll.votesFor + poll.votesAgainst));
    }

    // ----------------
    // POLLING HELPERS:
    // ----------------

    /**
    @dev Gets the total winning votes for reward distribution purposes
    @param _pollID Integer identifier associated with target poll
    @return Total number of votes committed to the winning option for specified poll
    */
    function getTotalNumberOfTokensForWinningOption(uint _pollID)  public returns (uint numTokens) {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',14);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',291);
        __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',27);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',61);
require(pollEnded(_pollID));__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',27);


__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',293);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',62);
if (isPassed(_pollID))
            { __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',63);
__BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',28,0);__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',294);
return pollMap[_pollID].votesFor;}
        else
            { __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',64);
__BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',28,1);__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',296);
return pollMap[_pollID].votesAgainst;}
    }

    /**
    @notice Determines if poll is over
    @dev Checks isExpired for specified poll's revealEndDate
    @return Boolean indication of whether polling period is over
    */
    function pollEnded(uint _pollID)  public returns (bool ended) {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',15);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',305);
        __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',29);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',65);
require(pollExists(_pollID));__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',29);


__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',307);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',66);
return isExpired(pollMap[_pollID].revealEndDate);
    }

    /**
    @notice Checks if the commit period is still active for the specified poll
    @dev Checks isExpired for the specified poll's commitEndDate
    @param _pollID Integer identifier associated with target poll
    @return Boolean indication of isCommitPeriodActive for target poll
    */
    function commitPeriodActive(uint _pollID)  public returns (bool active) {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',16);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',317);
        __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',30);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',67);
require(pollExists(_pollID));__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',30);


__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',319);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',68);
return !isExpired(pollMap[_pollID].commitEndDate);
    }

    /**
    @notice Checks if the reveal period is still active for the specified poll
    @dev Checks isExpired for the specified poll's revealEndDate
    @param _pollID Integer identifier associated with target poll
    */
    function revealPeriodActive(uint _pollID)  public returns (bool active) {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',17);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',328);
        __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',31);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',69);
require(pollExists(_pollID));__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',31);


__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',330);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',70);
return !isExpired(pollMap[_pollID].revealEndDate) && !commitPeriodActive(_pollID);
    }

    /**
    @dev Checks if user has already revealed for specified poll
    @param _voter Address of user to check against
    @param _pollID Integer identifier associated with target poll
    @return Boolean indication of whether user has already revealed
    */
    function hasBeenRevealed(address _voter, uint _pollID)  public returns (bool revealed) {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',18);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',340);
        __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',32);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',71);
require(pollExists(_pollID));__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',32);


__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',342);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',72);
uint prevID = dllMap[_voter].getPrev(_pollID);
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',343);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',73);
uint nextID = dllMap[_voter].getNext(_pollID);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',345);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',74);
return (prevID == _pollID) && (nextID == _pollID);
    }

    /**
    @dev Checks if a poll exists, throws if the provided poll is in an impossible state
    @param _pollID The pollID whose existance is to be evaluated.
    @return Boolean Indicates whether a poll exists for the provided pollID
    */
    function pollExists(uint _pollID)  public returns (bool exists) {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',19);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',354);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',75);
uint commitEndDate = pollMap[_pollID].commitEndDate;
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',355);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',76);
uint revealEndDate = pollMap[_pollID].revealEndDate;

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',357);
        __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',33);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',77);
assert(!(commitEndDate == 0 && revealEndDate != 0));__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',33);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',358);
        __AssertPreCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',34);
 __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',78);
assert(!(commitEndDate != 0 && revealEndDate == 0));__AssertPostCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',34);


__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',360);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',79);
if(commitEndDate == 0 || revealEndDate == 0) {__BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',35,0);  __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',80);
return false; }else { __BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',35,1);}

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',361);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',81);
return true;
    }

    // ---------------------------
    // DOUBLE-LINKED-LIST HELPERS:
    // ---------------------------

    /**
    @dev Gets the bytes32 commitHash property of target poll
    @param _voter Address of user to check against
    @param _pollID Integer identifier associated with target poll
    @return Bytes32 hash property attached to target poll
    */
    function getCommitHash(address _voter, uint _pollID)  public returns (bytes32 commitHash) {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',20);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',375);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',82);
return bytes32(store.getAttribute(attrUUID(_voter, _pollID), "commitHash"));
    }

    /**
    @dev Wrapper for getAttribute with attrName="numTokens"
    @param _voter Address of user to check against
    @param _pollID Integer identifier associated with target poll
    @return Number of tokens committed to poll in sorted poll-linked-list
    */
    function getNumTokens(address _voter, uint _pollID)  public returns (uint numTokens) {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',21);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',385);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',83);
return store.getAttribute(attrUUID(_voter, _pollID), "numTokens");
    }

    /**
    @dev Gets top element of sorted poll-linked-list
    @param _voter Address of user to check against
    @return Integer identifier to poll with maximum number of tokens committed to it
    */
    function getLastNode(address _voter)  public returns (uint pollID) {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',22);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',394);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',84);
return dllMap[_voter].getPrev(0);
    }

    /**
    @dev Gets the numTokens property of getLastNode
    @param _voter Address of user to check against
    @return Maximum number of tokens committed in poll specified
    */
    function getLockedTokens(address _voter)  public returns (uint numTokens) {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',23);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',403);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',85);
return getNumTokens(_voter, getLastNode(_voter));
    }

    /**
    @dev Gets the prevNode a new node should be inserted after given the sort factor
    @param _voter The voter whose DLL will be searched
    @param _numTokens The value for the numTokens attribute in the node to be inserted
    @return the node which the propoded node should be inserted after
    */
    function getInsertPointForNumTokens(
        address _voter,
        uint _numTokens
    )  public returns (uint prevNode) {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',24);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',416);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',86);
uint nodeID = getLastNode(_voter);
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',417);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',87);
uint tokensInNode = getNumTokens(_voter, nodeID);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',419);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',88);
while(tokensInNode != 0) {
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',420);
             __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',89);
tokensInNode = getNumTokens(_voter, nodeID);
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',421);
             __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',90);
if(tokensInNode < _numTokens) {__BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',36,0);  __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',91);
return nodeID; }else { __BranchCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',36,1);}

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',422);
             __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',92);
nodeID = dllMap[_voter].getPrev(nodeID);
        }
__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',424);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',93);
return nodeID;
    }

    // ----------------
    // GENERAL HELPERS:
    // ----------------

    /**
    @dev Checks if an expiration date has been reached
    @param _terminationDate Integer timestamp of date to compare current timestamp with
    @return expired Boolean indication of whether the terminationDate has passed
    */
    function isExpired(uint _terminationDate)  public returns (bool expired) {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',25);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',437);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',94);
return (block.timestamp > _terminationDate);
    }

    /**
    @dev Generates an identifier which associates a user and a poll together
    @param _pollID Integer identifier associated with target poll
    @return UUID Hash which is deterministic from _user and _pollID
    */
    function attrUUID(address _user, uint _pollID) public  returns (bytes32 UUID) {__FunctionCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',26);

__CoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',446);
         __StatementCoveragePLCRVoting('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/PLCRVoting.sol',95);
return keccak256(_user, _pollID);
    }
}
