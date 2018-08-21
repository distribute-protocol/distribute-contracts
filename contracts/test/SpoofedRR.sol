pragma solidity ^0.4.24;

import "./../Project.sol";

contract SpoofedRR {

    uint256 public totalSupply;

    constructor () public {
      totalSupply = 100000;
    }

    function callStakeReputation(address _projAddr, address _staker, uint256 _reputation) public {
      Project(_projAddr).stakeReputation(_staker, _reputation);
    }
}
