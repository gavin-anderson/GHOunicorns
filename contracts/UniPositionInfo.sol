// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "./interfaces/INonfungiblePositionManager.sol";
import "./interfaces/IUniPositionInfo.sol";

contract UniPositionInfo is IUniPositionInfo{
    INonfungiblePositionManager public nonfungiblePositionManager;
    IUniswapV3Factory public factory;

    constructor( INonfungiblePositionManager _nonfungiblePositionManager, IUniswapV3Factory _factory) {

        nonfungiblePositionManager = INonfungiblePositionManager(_nonfungiblePositionManager) ;
        factory = IUniswapV3Factory(_factory);
    }

    function getPositionInfo(uint256 tokenId)external view returns(address, address){
        // Notorious Stack too deep error
        // (, , address token0, address token1,uint24 fee, , , uint128 liquidity, , , , ) = nonfungiblePositionManager.positions(tokenId);

       INonfungiblePositionManager.PositionData memory position = nonfungiblePositionManager.positions(tokenId);
        address token0 = position.token0;
        address token1 = position.token1;

        return(token0,token1);
    }

    function getPrice(address token0,address token1,uint24 fee) external view returns (uint160) {
        address poolAdd = factory.getPool(token0,token1,fee);
        IUniswapV3Pool pool = IUniswapV3Pool(poolAdd);
        (uint160 sqrtPriceX96, , , , , , ) = pool.slot0();


        return sqrtPriceX96;
    }

}