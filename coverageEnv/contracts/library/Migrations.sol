pragma solidity ^0.4.19;

contract Migrations {event __CoverageMigrations(string fileName, uint256 lineNumber);
event __FunctionCoverageMigrations(string fileName, uint256 fnId);
event __StatementCoverageMigrations(string fileName, uint256 statementId);
event __BranchCoverageMigrations(string fileName, uint256 branchId, uint256 locationIdx);
event __AssertPreCoverageMigrations(string fileName, uint256 branchId);
event __AssertPostCoverageMigrations(string fileName, uint256 branchId);

  address public owner;
  uint public last_completed_migration;

  modifier restricted() {__FunctionCoverageMigrations('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/Migrations.sol',1);

__CoverageMigrations('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/Migrations.sol',8);
     __StatementCoverageMigrations('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/Migrations.sol',1);
if (msg.sender == owner) {__BranchCoverageMigrations('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/Migrations.sol',1,0);_;}else { __BranchCoverageMigrations('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/Migrations.sol',1,1);}

  }

  function Migrations() public {__FunctionCoverageMigrations('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/Migrations.sol',2);

__CoverageMigrations('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/Migrations.sol',12);
     __StatementCoverageMigrations('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/Migrations.sol',2);
owner = msg.sender;
  }

  function setCompleted(uint completed) public restricted {__FunctionCoverageMigrations('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/Migrations.sol',3);

__CoverageMigrations('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/Migrations.sol',16);
     __StatementCoverageMigrations('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/Migrations.sol',3);
last_completed_migration = completed;
  }

  function upgrade(address new_address) public restricted {__FunctionCoverageMigrations('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/Migrations.sol',4);

__CoverageMigrations('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/Migrations.sol',20);
     __StatementCoverageMigrations('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/Migrations.sol',4);
Migrations upgraded = Migrations(new_address);
__CoverageMigrations('/Users/shokishoki/development/consensys/distribute/contracts/contracts/library/Migrations.sol',21);
    upgraded.setCompleted(last_completed_migration);
  }
}
