pragma solidity^0.4.19;

library DLL {event __CoverageDLL(string fileName, uint256 lineNumber);
event __FunctionCoverageDLL(string fileName, uint256 fnId);
event __StatementCoverageDLL(string fileName, uint256 statementId);
event __BranchCoverageDLL(string fileName, uint256 branchId, uint256 locationIdx);
event __AssertPreCoverageDLL(string fileName, uint256 branchId);
event __AssertPostCoverageDLL(string fileName, uint256 branchId);

	struct Node {
		uint next;
		uint prev;
	}

	struct Data {
		mapping(uint => Node) dll;
	}

	function getNext(Data storage self, uint _curr) public  returns (uint) {__FunctionCoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',1);

__CoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',14);
		 __StatementCoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',1);
return self.dll[_curr].next;
	}

	function getPrev(Data storage self, uint _curr) public  returns (uint) {__FunctionCoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',2);

__CoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',18);
		 __StatementCoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',2);
return self.dll[_curr].prev;
	}

	function insert(Data storage self, uint _prev, uint _curr, uint _next) public {__FunctionCoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',3);

__CoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',22);
		 __StatementCoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',3);
self.dll[_curr].prev = _prev;
__CoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',23);
		 __StatementCoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',4);
self.dll[_curr].next = _next;

__CoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',25);
		 __StatementCoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',5);
self.dll[_prev].next = _curr;
__CoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',26);
		 __StatementCoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',6);
self.dll[_next].prev = _curr;
	}

	function remove(Data storage self, uint _curr) public {__FunctionCoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',4);

__CoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',30);
		 __StatementCoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',7);
uint next = getNext(self, _curr);
__CoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',31);
		 __StatementCoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',8);
uint prev = getPrev(self, _curr);

__CoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',33);
		 __StatementCoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',9);
self.dll[next].prev = prev;
__CoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',34);
		 __StatementCoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',10);
self.dll[prev].next = next;

__CoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',36);
		 __StatementCoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',11);
self.dll[_curr].next = _curr;
__CoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',37);
		 __StatementCoverageDLL('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/DLL.sol',12);
self.dll[_curr].prev = _curr;
	}
}
