// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IValuation{
    function evaluate(address token0, address token1, uint256 gPrice, uint256 amount0, uint256 amount1)external view returns(uint256 fValue);
    
    
}
