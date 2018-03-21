
pragma solidity ^0.4.18;


/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {event __CoverageSafeMath(string fileName, uint256 lineNumber);
event __FunctionCoverageSafeMath(string fileName, uint256 fnId);
event __StatementCoverageSafeMath(string fileName, uint256 statementId);
event __BranchCoverageSafeMath(string fileName, uint256 branchId, uint256 locationIdx);
event __AssertPreCoverageSafeMath(string fileName, uint256 branchId);
event __AssertPostCoverageSafeMath(string fileName, uint256 branchId);


    /**
    * @dev Multiplies two numbers, throws on overflow.
    */
    function mul(uint256 a, uint256 b) internal  returns (uint256) {__FunctionCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',1);

__CoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',15);
         __StatementCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',1);
if (a == 0) {__BranchCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',1,0);  __StatementCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',2);
return 0; }else { __BranchCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',1,1);}

__CoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',16);
         __StatementCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',3);
uint256 c = a * b;
__CoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',17);
        __AssertPreCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',2);
 __StatementCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',4);
assert(c / a == b);__AssertPostCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',2);

__CoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',18);
         __StatementCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',5);
return c;
    }

    /**
    * @dev Integer division of two numbers, truncating the quotient.
    */
    function div(uint256 a, uint256 b) internal  returns (uint256) {__FunctionCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',2);

        // assert(b > 0); // Solidity automatically throws when dividing by 0
__CoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',26);
         __StatementCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',6);
uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
__CoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',28);
         __StatementCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',7);
return c;
    }

    /**
    * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
    */
    function sub(uint256 a, uint256 b) internal  returns (uint256) {__FunctionCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',3);

__CoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',35);
        __AssertPreCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',3);
 __StatementCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',8);
assert(b <= a);__AssertPostCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',3);

__CoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',36);
         __StatementCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',9);
return a - b;
    }

    /**
    * @dev Adds two numbers, throws on overflow.
    */
    function add(uint256 a, uint256 b) internal  returns (uint256) {__FunctionCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',4);

__CoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',43);
         __StatementCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',10);
uint256 c = a + b;
__CoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',44);
        __AssertPreCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',4);
 __StatementCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',11);
assert(c >= a);__AssertPostCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',4);

__CoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',45);
         __StatementCoverageSafeMath('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/SafeMath.sol',12);
return c;
    }
}
