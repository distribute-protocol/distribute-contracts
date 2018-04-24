pragma solidity ^0.4.21;

library Division {
    function percent(uint256 _numerator, uint256 _denominator, uint256 _precision) public pure returns (uint256) {
         // caution, check safe-to-multiply here
        uint256 numerator = _numerator * 10 ** (_precision + 1);
        // with rounding of last digit
        return ((numerator / _denominator) + 5) / 10;
    }
}
