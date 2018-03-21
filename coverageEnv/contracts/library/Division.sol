pragma solidity ^0.4.19;

library Division {event __CoverageDivision(string fileName, uint256 lineNumber);
event __FunctionCoverageDivision(string fileName, uint256 fnId);
event __StatementCoverageDivision(string fileName, uint256 statementId);
event __BranchCoverageDivision(string fileName, uint256 branchId, uint256 locationIdx);
event __AssertPreCoverageDivision(string fileName, uint256 branchId);
event __AssertPostCoverageDivision(string fileName, uint256 branchId);

    function percent(uint256 _numerator, uint256 _denominator, uint256 _precision) public  returns (uint256) {__FunctionCoverageDivision('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/Division.sol',1);

         // caution, check safe-to-multiply here
__CoverageDivision('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/Division.sol',6);
         __StatementCoverageDivision('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/Division.sol',1);
uint256 numerator = _numerator * 10 ** (_precision + 1);
        // with rounding of last digit
__CoverageDivision('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/Division.sol',8);
         __StatementCoverageDivision('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/Division.sol',2);
return ((numerator / _denominator) + 5) / 10;
    }
}
