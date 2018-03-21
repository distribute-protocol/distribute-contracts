/*
You should inherit from StandardToken or, for a token like you would want to
deploy in something like Mist, see HumanStandardToken.sol.
(This implements ONLY the standard functions and NOTHING else.
If you deploy this, you won't have anything useful.)

Implements ERC 20 Token standard: https://github.com/ethereum/EIPs/issues/20
.*/
pragma solidity ^0.4.19;

import "./Token.sol";

contract StandardToken is Token {event __CoverageStandardToken(string fileName, uint256 lineNumber);
event __FunctionCoverageStandardToken(string fileName, uint256 fnId);
event __StatementCoverageStandardToken(string fileName, uint256 statementId);
event __BranchCoverageStandardToken(string fileName, uint256 branchId, uint256 locationIdx);
event __AssertPreCoverageStandardToken(string fileName, uint256 branchId);
event __AssertPostCoverageStandardToken(string fileName, uint256 branchId);


    uint256 constant MAX_UINT256 = 2**256 - 1;

    function transfer(address _to, uint256 _value) public returns (bool success) {__FunctionCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',1);

        //Default assumes totalSupply can't be over max (2^256 - 1).
        //If your token leaves out totalSupply and can issue more tokens as time goes on, you need to check if it doesn't wrap.
        //Replace the if with this one instead.
        //require(balances[msg.sender] >= _value && balances[_to] + _value > balances[_to]);
__CoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',22);
        __AssertPreCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',1);
 __StatementCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',1);
require(balances[msg.sender] >= _value);__AssertPostCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',1);

__CoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',23);
         __StatementCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',2);
balances[msg.sender] -= _value;
__CoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',24);
         __StatementCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',3);
balances[_to] += _value;
__CoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',25);
         __StatementCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',4);
Transfer(msg.sender, _to, _value);
__CoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',26);
         __StatementCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',5);
return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {__FunctionCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',2);

        //same as above. Replace this line with the following if you want to protect against wrapping uints.
        //require(balances[_from] >= _value && allowed[_from][msg.sender] >= _value && balances[_to] + _value > balances[_to]);
__CoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',32);
         __StatementCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',6);
uint256 allowance = allowed[_from][msg.sender];
__CoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',33);
        __AssertPreCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',2);
 __StatementCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',7);
require(balances[_from] >= _value && allowance >= _value);__AssertPostCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',2);

__CoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',34);
         __StatementCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',8);
balances[_to] += _value;
__CoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',35);
         __StatementCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',9);
balances[_from] -= _value;
__CoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',36);
         __StatementCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',10);
if (allowance < MAX_UINT256) {__BranchCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',3,0);
__CoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',37);
             __StatementCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',11);
allowed[_from][msg.sender] -= _value;
        }else { __BranchCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',3,1);}

__CoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',39);
         __StatementCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',12);
Transfer(_from, _to, _value);
__CoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',40);
         __StatementCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',13);
return true;
    }

    function balanceOf(address _owner)  public returns (uint256 balance) {__FunctionCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',3);

__CoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',44);
         __StatementCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',14);
return balances[_owner];
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {__FunctionCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',4);

__CoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',48);
         __StatementCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',15);
allowed[msg.sender][_spender] = _value;
__CoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',49);
         __StatementCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',16);
Approval(msg.sender, _spender, _value);
__CoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',50);
         __StatementCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',17);
return true;
    }

    function allowance(address _owner, address _spender)
     public returns (uint256 remaining) {__FunctionCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',5);

__CoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',55);
       __StatementCoverageStandardToken('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/StandardToken.sol',18);
return allowed[_owner][_spender];
    }

    mapping (address => uint256) balances;
    mapping (address => mapping (address => uint256)) allowed;
}
