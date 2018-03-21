pragma solidity ^0.4.19;

library AttributeStore {event __CoverageAttributeStore(string fileName, uint256 lineNumber);
event __FunctionCoverageAttributeStore(string fileName, uint256 fnId);
event __StatementCoverageAttributeStore(string fileName, uint256 statementId);
event __BranchCoverageAttributeStore(string fileName, uint256 branchId, uint256 locationIdx);
event __AssertPreCoverageAttributeStore(string fileName, uint256 branchId);
event __AssertPostCoverageAttributeStore(string fileName, uint256 branchId);

    struct Data {
        mapping(bytes32 => uint) store;
    }

    function getAttribute(Data storage self, bytes32 _UUID, string _attrName) public  returns (uint) {__FunctionCoverageAttributeStore('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/AttributeStore.sol',1);

__CoverageAttributeStore('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/AttributeStore.sol',9);
         __StatementCoverageAttributeStore('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/AttributeStore.sol',1);
bytes32 key = keccak256(_UUID, _attrName);
__CoverageAttributeStore('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/AttributeStore.sol',10);
         __StatementCoverageAttributeStore('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/AttributeStore.sol',2);
return self.store[key];
    }

    function attachAttribute(Data storage self, bytes32 _UUID, string _attrName, uint _attrVal) public {__FunctionCoverageAttributeStore('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/AttributeStore.sol',2);

__CoverageAttributeStore('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/AttributeStore.sol',14);
         __StatementCoverageAttributeStore('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/AttributeStore.sol',3);
bytes32 key = keccak256(_UUID, _attrName);
__CoverageAttributeStore('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/AttributeStore.sol',15);
         __StatementCoverageAttributeStore('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/AttributeStore.sol',4);
self.store[key] = _attrVal;
    }
}
