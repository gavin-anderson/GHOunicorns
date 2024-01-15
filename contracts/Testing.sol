// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/IERC721Receiver.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";
import "https://github.com/Uniswap/v3-periphery/blob/main/contracts/libraries/PoolAddress.sol";
import "https://github.com/Uniswap/v3-periphery/blob/main/contracts/interfaces/INonfungiblePositionManager.sol";
import "https://github.com/Uniswap/v3-core/blob/main/contracts/interfaces/IUniswapV3Pool.sol";

import "contracts/GHOToken.sol";

interface IGHO is IERC20 {
    function mint(address to, uint256 amount) external;

    function burn(address from, uint256 amount) external;
}

contract GHOUnicorns is IERC721Receiver {
    // Uniswap V3 Factory address
    address public constant uniswapV3Factory = 0x1F98431c8aD98523631AE4a59f267346ea31F984;
    // Token Address
    IGHO public ghoToken;
    // Uniswap NFT Manager
    INonfungiblePositionManager public immutable nonfungiblePositionManager;
    // 0xC36442b4a4522E871399CD717aBDD847Ab11FE88

    // Structure of a position
    struct Deposit {
        uint256 value;
        uint256 borrowedAmount;
        uint256 feesIncurred;
        address owner;
    }

    //Track all Positions made
    mapping(uint256 => Deposit) deposits;

    constructor(IGHO _ghoToken, INonfungiblePositionManager _nonfungiblePositionManager) {
        ghoToken = _ghoToken;
        nonfungiblePositionManager = _nonfungiblePositionManager;
    }

    // // Main function for handeling new positions
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) public override returns (bytes4) {

        newDeposit(tokenId, from);

        return this.onERC721Received.selector;
    }

     function newDeposit(uint256 tokenId, address from)internal{
       address pool = getPositionInfo(tokenId);

    }

    function getPositionInfo(uint256 tokenId)internal view returns(address){
        ( , ,address _token0,address _token1,uint24 _fee,,,uint128 liquidity,,,,) = nonfungiblePositionManager.positions(tokenId);
        return PoolAddress.computeAddress(nonfungiblePositionManager.factory(),PoolAddress.PoolKey({token0: _token0, token1: _token1, fee: _fee}) );
    }  
}
