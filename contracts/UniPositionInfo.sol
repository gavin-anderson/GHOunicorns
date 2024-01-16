// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "./interfaces/INonfungiblePositionManager.sol";


contract UniPositionInfo{
    INonfungiblePositionManager public positionManager;
    IUniswapV3Factory public factory;

    constructor(address _nonfungiblePositionManager, address _factory) {

        positionManager = INonfungiblePositionManager(_nonfungiblePositionManager) ;
        factory = IUniswapV3Factory(_factory);
    }

    function getPositionInfo(uint256 tokenId)external view returns(address, address, uint24, uint128){
        // Notorious Stack too deep error
        INonfungiblePositionManager.PositionDetails memory positionData = positionManager.positions(tokenId);

        return  (positionData.token0, positionData.token1,positionData.fee,positionData.liquidity);
    }

    function getPrice(address token0,address token1,uint24 fee) external view returns (uint160) {
        address poolAdd = factory.getPool(token0,token1,fee);
        IUniswapV3Pool pool = IUniswapV3Pool(poolAdd);
        (uint160 sqrtPriceX96, , , , , , ) = pool.slot0();


        return sqrtPriceX96;
    }
}

