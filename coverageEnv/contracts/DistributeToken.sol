pragma solidity ^0.4.19;

import "./library/StandardToken.sol";
import "./library/SafeMath.sol";
import "./library/Division.sol";

/**
@title Bonded Curve Implementation of an ERC20 token
@author Team: Jessica Marshall, Ashoka Finley
@notice This contract implements functionality to be controlled by a TokenRegistry & a ReputationRegistry.
@dev This contract must be initialized with both a TokenRegistry & a ReputationRegistry.
*/
contract DistributeToken is StandardToken {event __CoverageDistributeToken(string fileName, uint256 lineNumber);
event __FunctionCoverageDistributeToken(string fileName, uint256 fnId);
event __StatementCoverageDistributeToken(string fileName, uint256 statementId);
event __BranchCoverageDistributeToken(string fileName, uint256 branchId, uint256 locationIdx);
event __AssertPreCoverageDistributeToken(string fileName, uint256 branchId);
event __AssertPostCoverageDistributeToken(string fileName, uint256 branchId);


    using SafeMath for uint256;

    // =====================================================================
    // EVENTS
    // =====================================================================

    event LogMint(uint256 amountMinted, uint256 totalCost);
    event LogWithdraw(uint256 amountWithdrawn, uint256 reward);

    // =====================================================================
    // STATE VARIABLES
    // =====================================================================

    address tokenRegistryAddress;
    address reputationRegistryAddress;

    string public constant symbol = "DST";
    string public constant name = "Distributed Utility Token";
    uint8 public constant decimals = 18;

    uint256 public totalSupply = 0;
    uint256 public weiBal;

    // .00005 ether
    uint256 baseCost = 50000000000000;

    // =====================================================================
    // MODIFIERS
    // =====================================================================

    modifier onlyTR() {__FunctionCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',1);

__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',46);
        __AssertPreCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',1);
 __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',1);
require(msg.sender == tokenRegistryAddress);__AssertPostCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',1);

__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',47);
        _;
    }

    modifier onlyTRorRR() {__FunctionCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',2);

__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',51);
        __AssertPreCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',2);
 __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',2);
require(
            msg.sender == tokenRegistryAddress ||
            msg.sender == reputationRegistryAddress
        );__AssertPostCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',2);

__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',55);
        _;
    }

    // =====================================================================
    // CONSTRUCTOR
    // =====================================================================

    /**
    @dev Initialize the DistributeToken contract with the address of a TokenRegistry contract & a
    ReputationRegistry contract
    @param _tokenRegistry Address of the Token Registry
    @param _reputationRegistry Address of the ReputationRegistry
    */
    function DistributeToken(address _tokenRegistry, address _reputationRegistry) public {__FunctionCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',3);

__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',69);
        __AssertPreCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',3);
 __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',3);
require(tokenRegistryAddress == 0 && reputationRegistryAddress == 0);__AssertPostCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',3);


__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',71);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',4);
tokenRegistryAddress = _tokenRegistry;
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',72);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',5);
reputationRegistryAddress = _reputationRegistry;
    }

    // =====================================================================
    // FALLBACK
    // =====================================================================

    function() public payable {__FunctionCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',4);
}

    // =====================================================================
    // UTILITY
    // =====================================================================

    /**
    @notice Returns the current price of a token calculated as the contract wei balance divided
    by the token supply
    @return The current price of 1 token in wei
    */
    function currentPrice() public  returns (uint256) {__FunctionCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',5);

        //calculated current burn reward of 1 token at current weiBal and token supply
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',92);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',6);
if (weiBal == 0 || totalSupply == 0) {__BranchCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',4,0);  __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',7);
return baseCost; }else { __BranchCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',4,1);}

        // If totalTokenSupply is greater than weiBal this will fail
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',94);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',8);
uint256 price = weiBal / totalSupply;
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',95);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',9);
return price < baseCost
            ? baseCost
            : price;
    }

    /**
    @notice Return the wei required to mint `_tokens` tokens
    @dev Calulates the target price and multiplies it by the number of tokens desired
    @param _tokens The number of tokens requested to be minted
    @return The wei required to purchase the given amount of tokens
    */
    function weiRequired(uint256 _tokens) public  returns (uint256) {__FunctionCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',6);

__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',107);
        __AssertPreCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',5);
 __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',10);
require(_tokens > 0);__AssertPostCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',5);


__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',109);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',11);
return targetPrice(_tokens) *  _tokens;
    }

    /**
    @notice Calulates the price of `_tokens` tokens dependent on the market share that `_tokens`
    tokens represent.
    @dev A helper function to provide clarity for weiRequired
    @param _tokens The number of tokens requested to be minted
    @return The target price of the amount of tokens requested
    */
    function targetPrice(uint _tokens) internal  returns (uint256) {__FunctionCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',7);

__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',120);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',12);
uint256 cp = currentPrice();
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',121);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',13);
uint256 newSupply = totalSupply + _tokens;
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',122);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',14);
return cp * (1000 + Division.percent(_tokens, newSupply, 3)) / 1000;
    }

    // =====================================================================
    // TOKEN
    // =====================================================================

    /**
    @notice Mint `_tokens` tokens, add `_tokens` to the contract totalSupply and add the weiRequired to
    the contract weiBalance
    @dev The required amount of wei must be transferred as the msg.value
    @param _tokens The number of tokens requested to be minted
    */
    function mint(uint _tokens) public payable {__FunctionCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',8);

__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',136);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',15);
uint256 weiRequiredVal = weiRequired(_tokens);
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',137);
        __AssertPreCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',6);
 __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',16);
require(msg.value >= weiRequiredVal);__AssertPostCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',6);


__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',139);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',17);
totalSupply += _tokens;
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',140);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',18);
balances[msg.sender] += _tokens;
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',141);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',19);
weiBal += weiRequiredVal;
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',142);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',20);
LogMint(_tokens, weiRequiredVal);
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',143);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',21);
uint256 fundsLeft = msg.value - weiRequiredVal;
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',144);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',22);
if (fundsLeft > 0) {__BranchCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',7,0); msg.sender.transfer(fundsLeft); }else { __BranchCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',7,1);}

    }

    /**
    @notice Burn `_tokens` tokens by removing them from the total supply, and from the Token Registry
    balance.
    @dev Only to be called by the Token Registry initialized during constrction
    @param _tokens The number of tokens to burn
    */
    function burn(uint256 _tokens) public onlyTR {__FunctionCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',9);

__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',154);
        __AssertPreCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',8);
 __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',23);
require(_tokens <= totalSupply && _tokens > 0);__AssertPostCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',8);

__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',155);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',24);
balances[msg.sender] -= _tokens;
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',156);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',25);
totalSupply -= _tokens;
    }

    /**
    @notice Sell `_tokens` tokens at the current token price.
    @dev Checks that `_tokens` is greater than 0 and that `msg.sender` has sufficient balance. The
    corresponding amount of wei is transferred to the `msg.sender`
    @param _tokens The number of tokens to sell.
    */
    function sell(uint256 _tokens) public {__FunctionCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',10);

__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',166);
        __AssertPreCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',9);
 __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',26);
require(_tokens > 0 && (_tokens <= balances[msg.sender]));__AssertPostCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',9);


__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',168);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',27);
uint256 weiVal = _tokens * currentPrice();
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',169);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',28);
balances[msg.sender] -= _tokens;
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',170);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',29);
totalSupply = totalSupply.sub(_tokens);
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',171);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',30);
weiBal -= weiVal;
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',172);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',31);
LogWithdraw(_tokens, weiVal);
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',173);
        msg.sender.transfer(weiVal);
    }

    // =====================================================================
    // TRANSFER
    // =====================================================================

    /**
    @notice Transfer `_weiValue` wei to `_address`
    @dev Only callable by the TokenRegistry or ReputationRegistry initialized during contract
    construction
    @param _address Receipient of wei value
    @param _weiValue The amount of wei to transfer to the _address
    */
    function transferWeiTo(address _address, uint256 _weiValue) public onlyTRorRR {__FunctionCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',11);

__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',188);
        __AssertPreCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',10);
 __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',32);
require(_weiValue <= weiBal);__AssertPostCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',10);


__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',190);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',33);
weiBal -= _weiValue;
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',191);
        _address.transfer(_weiValue);
    }

    /**
    @notice Return `_weiValue` wei back to Distribute Token contract
    @dev Only callable by the TokenRegistry initialized during contract construction
    @param _weiValue The amount of wei to transfer back to the token contract
    */
    function returnWei(uint _weiValue) public onlyTR {__FunctionCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',12);

__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',200);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',34);
weiBal += _weiValue;
    }

    /**
    @notice Transfer `_tokens` tokens from the balance of `_owner` to the TokenRegistry escrow
    @dev Only callable by the TokenRegistry initialized during contract construction
    @param _owner Owner of the tokens being transferred
    @param _tokens The number of tokens to transfer
    */
    function transferToEscrow(address _owner, uint256 _tokens) public onlyTR returns (bool) {__FunctionCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',13);

__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',210);
        __AssertPreCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',11);
 __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',35);
require(balances[_owner] >= _tokens);__AssertPostCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',11);

__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',211);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',36);
balances[_owner] -= _tokens;
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',212);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',37);
balances[msg.sender] += _tokens;
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',213);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',38);
return true;
    }

    /**
    @notice Transfer `_tokens` tokens from the TokenRegistry escrow to the balance of `_receipient`
    @dev Only callable by the TokenRegistry initialized during contract construction
    @param _receipient Receipient of the tokens being transferred
    @param _tokens The number of tokens to transfer
    */
    function transferFromEscrow(address _receipient, uint256 _tokens) public onlyTR returns (bool) {__FunctionCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',14);

__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',223);
        __AssertPreCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',12);
 __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',39);
require(balances[msg.sender] >= _tokens);__AssertPostCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',12);

__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',224);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',40);
balances[msg.sender] -= _tokens;
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',225);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',41);
balances[_receipient] += _tokens;
__CoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',226);
         __StatementCoverageDistributeToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/DistributeToken.sol',42);
return true;
    }

}
