// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUniPositionInfo{

    function positionManager()external view returns(address);

    function getPositionInfo(uint256 tokenId) external view returns(uint256, uint256, address, address, address);

    function getTWAP(address poolAddress, uint32 timeInterval) external view returns ( uint256 fValue);
  
}

