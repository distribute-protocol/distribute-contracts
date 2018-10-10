pragma solidity ^0.4.21;

import "./SafeMath.sol";

// divide by 10 ** precision at the very end
library Division {
  using SafeMath for uint256;

    function percent(uint256 _numerator, uint256 _denominator, uint256 _precision) public pure returns (uint256) {
        require(_denominator > 0);
        uint256 numerator = _numerator.mul(10) ** (_precision.add(1));
        // with rounding of last digit
        return ((numerator.div(_denominator)).add(5)).div(10);
    }
}
