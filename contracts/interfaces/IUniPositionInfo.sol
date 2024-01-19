// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUniPositionInfo{

    function positionManager()external view returns(address);

    function getPositionInfo(uint256 tokenId)external view returns(address, address, uint24, uint128,int24,int24);
      
    function getPool(address token0,address token1,uint24 fee) external view returns (address);

    function getCurrentTick(address poolAdd) external view returns (int24);

    function tokenAmount(uint128 liquidity, int24 tick, int24 tickLower, int24 tickUpper) external pure returns(uint256 amount0 ,uint256 amount1);

    function getTWAP(address poolAddress, uint32 timeInterval) external view returns (uint256);
    
    function valueCalc(uint256 amount0, uint256 amount1, uint256 gPrice) external pure returns(uint256 fValue);
}

