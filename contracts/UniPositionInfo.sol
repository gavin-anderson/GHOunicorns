// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
pragma abicoder v2;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "@uniswap/v3-periphery/contracts/libraries/LiquidityAmounts.sol";
import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "@uniswap/v3-core/contracts/libraries/FixedPoint96.sol";
import "@uniswap/v3-core/contracts/libraries/FullMath.sol";


import "./interfaces/IUniswapV3Pool.sol";
import "./interfaces/INonfungiblePositionManager.sol";



contract UniPositionInfo{
    INonfungiblePositionManager public positionManager;
    IUniswapV3Factory public factory;

    constructor(address _nonfungiblePositionManager, address _factory) {

        positionManager = INonfungiblePositionManager(_nonfungiblePositionManager);
        // 0xC36442b4a4522E871399CD717aBDD847Ab11FE88 Go
        // 0x1238536071E1c677A632429e3655c799b22cDA52 sep


        factory = IUniswapV3Factory(_factory);
        // 0x1F98431c8aD98523631AE4a59f267346ea31F984 Go
        //  0x0227628f3F023bb0B980b67D528571c95c6DaC1c sep
    }
    

    function getPositionInfo(uint256 tokenId)public view returns(uint256 amount0, uint256 amount1, address token0, address token1, address poolAdd){
        // Notorious Stack too deep error
        INonfungiblePositionManager.PositionDetails memory positionData = positionManager.positions(tokenId);

        poolAdd = factory.getPool(positionData.token0,positionData.token1,positionData.fee);

        IUniswapV3Pool pool = IUniswapV3Pool(poolAdd);
        (, int24 tick, , , , , ) = pool.slot0();

         (amount0,amount1) = LiquidityAmounts.getAmountsForLiquidity(
            TickMath.getSqrtRatioAtTick(tick),
            TickMath.getSqrtRatioAtTick(positionData.tickLower),
            TickMath.getSqrtRatioAtTick(positionData.tickUpper),
            positionData.liquidity
        );
        return  (amount0,amount1,positionData.token0,positionData.token1, poolAdd);

        
    }


    function getTWAP(address poolAddress, uint32 timeInterval) external view returns ( uint256 gPrice) {
        IUniswapV3Pool pool = IUniswapV3Pool(poolAddress);

        // Time intervals: current and past
        uint32[] memory secondsAgos = new uint32[](2);
        secondsAgos[0] = 0; // Current time
        secondsAgos[1] = timeInterval; // Time interval ago

        // Get cumulative ticks
        (int56[] memory tickCumulatives,) = pool.observe(secondsAgos);

        uint160 sqrtPriceX96 = TickMath.getSqrtRatioAtTick( int24((tickCumulatives[1] - tickCumulatives[0]) / timeInterval));

        uint256 priceX96 = FullMath.mulDiv(sqrtPriceX96, sqrtPriceX96, FixedPoint96.Q96);
        gPrice= (priceX96*1e18)/2**96;

        
        return(gPrice);
       
    }


}


