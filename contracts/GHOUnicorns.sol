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
    address public constant uniswapV3Factory =
        0x1F98431c8aD98523631AE4a59f267346ea31F984;
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

    // Math purposes
    uint256 public constant scalingFactor = 1e18;

    uint256 public constant Loan2Value = 75e16;
    uint256 public constant liquidRatio = 8e17;

    constructor(
        IGHO _ghoToken,
        INonfungiblePositionManager _nonfungiblePositionManager
    ) {
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
        require(data.length > 0, "No requested loan amount.");
        uint256 requestedLoanAmount = abi.decode(data, (uint24));
        newDeposit(tokenId, from, requestedLoanAmount);
        return this.onERC721Received.selector;
    }

    function openPosition(
        uint256 tokenId,
        uint160 _value,
        uint256 _borrowedAmount,
        address from
    ) internal {
        deposits[tokenId] = Deposit({
            value: _value,
            borrowedAmount: _borrowedAmount,
            feesIncurred: 0,
            owner: from
        });
    }
    
    function newDeposit(uint256 tokenId, address from, uint256 _borrowedAmount)internal{
        (address token0, address token1,uint24 fee, uint128 liquidity) = getPositionInfo(tokenId);

    }


    function getPositionInfo(uint256 tokenId)internal view returns(address token0,address token1,uint24 fee, uint128 liquidity){
        ( , ,address _token0,address _token1,uint24 _fee,,,uint128 liquidity,,,,) = nonfungiblePositionManager.positions(tokenId);
        return (_token0, _token1, _fee, liquidity);
    }

    function valuation(address token0,address token1,uint24 fee,uint128 liquidity,uint256 priceData) internal pure returns (uint160) {
        // value = price of token0* qty of token0 + price of token1*qty of token1
        return 0;
    }

    function getPrice(address token0,address token1,uint24 fee) internal view returns (uint160) {
        PoolAddress.PoolKey memory key = PoolAddress.getPoolKey(token0,token1,fee);
        address poolAddress = PoolAddress.computeAddress(uniswapV3Factory, key);
        IUniswapV3Pool pool = IUniswapV3Pool(poolAddress);
        (uint160 sqrtPriceX96, , , , , , ) = pool.slot0();
        return sqrtPriceX96;
    }

    // function closePosition(uint256 tokenId) internal {
    //     Position storage position = positions[tokenId];
    //     require(position.owner != address(0), "Position does not exist");
    //     delete positions[tokenId];
    // }

    // function payback(uint256 tokenId) public {
    //     // partial payback can help loan health/ if fully paid back sent nft back to owner. Money needs to be sent in same transaction.
    //     uint256 ghoOwned = ghoToken.balanceOf(address(this));
    //     require(ghoOwned > 0, "No GHO sent");
    //     Position storage position = positions[tokenId];

    //     if (position.borrowedAmount > ghoOwned) {
    //         ghoToken.burn(address(this), ghoOwned);
    //         position.borrowedAmount = position.borrowedAmount - ghoOwned;
    //     } else {

    //         if (position.borrowedAmount*scalingFactor/position.value>=liquidRatio){

    //             ghoToken.burn(address(this), ghoOwned);
    //             nonfungiblePositionManager.safeTransferFrom(
    //             address(this),
    //             msg.sender,
    //             tokenId,
    //             ""
    //         );
    //         closePosition(tokenId);

    //         }else{
    //         ghoToken.burn(address(this), ghoOwned);
    //         nonfungiblePositionManager.safeTransferFrom(
    //             address(this),
    //             position.owner,
    //             tokenId,
    //             ""
    //         );
    //         closePosition(tokenId);
    //         }
    //     }
    // }
}
