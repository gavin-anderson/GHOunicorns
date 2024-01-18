// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "./interfaces/IUniswapV3Pool.sol";
import "./interfaces/INonfungiblePositionManager.sol";
import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "@uniswap/v3-periphery/contracts/libraries/LiquidityAmounts.sol";
import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "@uniswap/v3-core/contracts/libraries/FixedPoint96.sol";
import "@uniswap/v3-core/contracts/libraries/FullMath.sol";


contract UniPositionInfo{
    INonfungiblePositionManager public positionManager;
    IUniswapV3Factory public factory;

    constructor(address _nonfungiblePositionManager, address _factory) {

        positionManager = INonfungiblePositionManager(_nonfungiblePositionManager);
        // 0xC36442b4a4522E871399CD717aBDD847Ab11FE88
        factory = IUniswapV3Factory(_factory);
        // 0x1F98431c8aD98523631AE4a59f267346ea31F984
    }
    

    function getPositionInfo(uint256 tokenId)external view returns(address, address, uint24, uint128,int24,int24){
        // Notorious Stack too deep error
        INonfungiblePositionManager.PositionDetails memory positionData = positionManager.positions(tokenId);
        return  (positionData.token0, positionData.token1,positionData.fee,positionData.liquidity, positionData.tickLower,positionData.tickUpper);
    }

    function getPool(address token0,address token1,uint24 fee) external view returns (address){
        address poolAdd = factory.getPool(token0,token1,fee);
        return poolAdd;
    }

    function getSqrtPrice(address poolAdd) external view returns (uint160, int24) {
        IUniswapV3Pool pool = IUniswapV3Pool(poolAdd);
        (uint160 sqrtPriceX96, int24 tick, , , , , ) = pool.slot0();
        return(sqrtPriceX96,tick);
    }

    function tokenAmount(uint128 liquidity, int24 tick, int24 tickLower, int24 tickUpper) external view returns(uint256 amount0 ,uint256 amount1) {
        (amount0,amount1) = LiquidityAmounts.getAmountsForLiquidity(
            TickMath.getSqrtRatioAtTick(tick),
            TickMath.getSqrtRatioAtTick(tickLower),
            TickMath.getSqrtRatioAtTick(tickUpper),
            liquidity
        );
        return(amount0,amount1);
    }

    function getTWAP(address poolAddress, uint32 timeInterval) external view returns (uint256) {
        IUniswapV3Pool pool = IUniswapV3Pool(poolAddress);

        // Time intervals: current and past
        uint32[] memory secondsAgos = new uint32[](2);
        secondsAgos[0] = 0; // Current time
        secondsAgos[1] = timeInterval; // Time interval ago

        // Get cumulative ticks
        (int56[] memory tickCumulatives,) = pool.observe(secondsAgos);

        uint160 sqrtPriceX96 = TickMath.getSqrtRatioAtTick( int24((tickCumulatives[1] - tickCumulatives[0]) / timeInterval));
        uint256 priceX96 = FullMath.mulDiv(sqrtPriceX96, sqrtPriceX96, FixedPoint96.Q96);
        return priceX96;
       
    }
}

