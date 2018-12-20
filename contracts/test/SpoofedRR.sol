pragma solidity ^0.5.0;

import "./../Project.sol";

contract SpoofedRR {

    uint256 public totalSupply;

    constructor () public {
      totalSupply = 100000;
    }

    function callStakeReputation(address payable _projAddr, address _staker, uint256 _reputation) public {
      Project(_projAddr).stakeReputation(_staker, _reputation);
    }
}
