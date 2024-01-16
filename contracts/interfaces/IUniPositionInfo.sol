// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUniPositionInfo{

    function INonfungiblePositionManager() external view returns(address);
    
    function getPositionInfo(uint256 tokenId)external view returns(address,address);

    function getPrice(address token0,address token1,uint24 fee) external view returns (uint160);
}