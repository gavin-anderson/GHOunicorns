// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import"https://github.com/Uniswap/v3-periphery/blob/main/contracts/libraries/PoolAddress.sol";
import "https://github.com/Uniswap/v3-periphery/blob/main/contracts/interfaces/INonfungiblePositionManager.sol";
// import "@uniswap/v3-core/contracts/libraries/TickMath.sol";

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
    struct Position {
        uint256 value;
        uint256 borrowedAmount;
        uint256 feesIncurred;
        address token0;
        address token1;
        uint256 feeTier;
        address owner;
    }

    //Track all Positions made
    mapping(uint256 => Position) positions;

    // Math purposes
    uint256 public constant scalingFactor = 1e18;

    uint256 public constant Loan2Value = 75e16;
    uint256 public constant liquidRatio = 8e17;

    constructor(IGHO _ghoToken, INonfungiblePositionManager _nonfungiblePositionManager) {
        // uniswapV3NFT = _uniswapV3NFT;
        ghoToken = _ghoToken;
        nonfungiblePositionManager = _nonfungiblePositionManager;
    }

    // Main function for handeling new positions
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) public override returns (bytes4) {
        // require(msg.sender == address(uniswapV3NFT), "Not a Uniswap V3 NFT");
        require(data.length > 0, "No requested loan amount.");
        createPosition(tokenId, from, data);
        return this.onERC721Received.selector;
    }

    function createPosition(
        uint256 tokenId,
        address from,
        bytes calldata data
    ) internal {
        // Find the amount requested
        uint256 requestedLoanAmount = abi.decode(data, (uint256));
        // Grab Info on position
        (, , address _token0, address _token1,uint24 _fee , , , uint128 liquidity, , , , ) = nonfungiblePositionManager.positions(tokenId);
        // calculate the value of the tokenId
        uint256 _value = valuation(tokenId);
        // Check that the amount requested to the value of position is equal too or less than the LTV ratio
        require(requestedLoanAmount*scalingFactor / _value <= Loan2Value,"Not enough collateral to borrow that much.");


        // Create new position
        Position memory newPosition = Position({
            value: _value,
            borrowedAmount:requestedLoanAmount,
            feesIncurred: 0,
            token0: _token0,
            token1: _token1,
            feeTier: _fee,
            owner: from
        });

        // Store position in tracked mapping
        positions[tokenId] = newPosition;

        // Mint approiate amount of GHO tokens
        ghoToken.mint(from, positions[tokenId].borrowedAmount);
    }

    function closePosition(uint256 tokenId) internal {
        Position storage position = positions[tokenId];
        require(position.owner != address(0), "Position does not exist");
        delete positions[tokenId];
    }

    function payback(uint256 tokenId) public {
        // partial payback can help loan health/ if fully paid back sent nft back to owner. Money needs to be sent in same transaction.
        uint256 ghoOwned = ghoToken.balanceOf(address(this));
        require(ghoOwned > 0, "No GHO sent");
        Position storage position = positions[tokenId];

        if (position.borrowedAmount > ghoOwned) {
            ghoToken.burn(address(this), ghoOwned);
            position.borrowedAmount = position.borrowedAmount - ghoOwned;
        } else {

            if (position.borrowedAmount*scalingFactor/position.value>=liquidRatio){

                ghoToken.burn(address(this), ghoOwned);
                nonfungiblePositionManager.safeTransferFrom(
                address(this),
                msg.sender,
                tokenId,
                ""
            );
            closePosition(tokenId);

            }else{
            ghoToken.burn(address(this), ghoOwned);
            nonfungiblePositionManager.safeTransferFrom(
                address(this),
                position.owner,
                tokenId,
                ""
            );
            closePosition(tokenId);
            }
        }
    }

    function valuation(uint256 tokenId) public returns (uint256) {
        // value = price of token0* qty of token0 + price of token1*qty of token1
        (, , address token0, address token1, uint24 fee, , , uint128 liquidity, , , , ) = nonfungiblePositionManager.positions(tokenId);
        uint160 price = getPrice(token0,token1,fee);

    }

    function getPrice(address tokenA, address tokenB, uint24 fee) internal view returns(uint160){

        PoolAddress.PoolKey memory key = PoolAddress.getPoolKey(tokenA, tokenB, fee);
        address poolAddress = PoolAddress.computeAddress(uniswapV3Factory, key);
        IUniswapV3Pool pool = IUniswapV3Pool(poolAddress);
        (uint160 sqrtPriceX96,,,,,,) = pool.slot0();
        return sqrtPriceX96;

    }

    // function increaseBorrowAmount(uint256 tokenId, uint256 additionalBorrow) public{

    // }


}
