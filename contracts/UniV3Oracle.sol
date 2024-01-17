// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IUniswapV3Pool {
    function observe(uint32[] calldata secondsAgos) external view returns (int56[] memory tickCumulatives, uint160[] memory secondsPerLiquidityCumulativeX128s);
}

contract UniV3Oracle {

    // Deriving an asset price from the current tick is achievable due to the fixed expression across the pool contract of token0 in terms of token1.
    function getTWAP(address token0, address token1, address poolAddress, uint32 timeInterval) public view returns (uint256, uint256) {
        IUniswapV3Pool pool = IUniswapV3Pool(poolAddress);

        // Time intervals: current and past
        uint32[] memory secondsAgos = new uint32[](2);
        secondsAgos[0] = 0; // Current time
        secondsAgos[1] = timeInterval; // Time interval ago

        // Get cumulative ticks
        (int56[] memory tickCumulatives,,) = pool.observe(secondsAgos);

        // Calculate TWAP
        int56 tickDifference = tickCumulatives[0] - tickCumulatives[1];
        int56 averageTick= tickDifference / int56(timeInterval);
        uint256 priceRatio = 1.001**averageTick;

        uint256 price0 = priceRatio *(10**ERC20(token0).decimals())/(10**ERC20(token1).decimals());
        uint256 price1= 1/price0;
        return(price0,price1);
    }
}