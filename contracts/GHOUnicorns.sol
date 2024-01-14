// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "contracts/GHOToken.sol";


// import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
// import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";

interface IGHO is IERC20 {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
}

contract GHOUnicorns is IERC721Receiver{

    // Contract addresses
    IERC721 public uniswapV3NFT;
    IGHO public ghoToken;

    // Structure of a position
    struct Position {
        uint256 value;
        uint256 borrowedAmount;
        uint256 feesIncurred;
        address owner;
    }

    //Track all Positions made
    mapping(uint256 => Position) positions;

    // Math purposes
    uint256 public constant scalingFactor = 1e18;

    
    uint256 public constant Loan2Value = 75000000000000000;
    uint256 public constant liquidRatio = 80000000000000000;


    constructor(IERC721 _uniswapV3NFT, IGHO _ghoToken){
        uniswapV3NFT = _uniswapV3NFT;
        ghoToken = _ghoToken;
    }

    // Main function for handeling new positions
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) public override returns (bytes4) {
        
        require(msg.sender == address(uniswapV3NFT),"Not a Uniswap V3 NFT");
        require(data.length>0,"No requested loan amount.");

        uint256 requestedLoanAmount = abi.decode(data, (uint256));

        uint256 _value = valuation(tokenId);
        require(requestedLoanAmount/_value <= Loan2Value, "Not enough collateral to borrow that much.");

        createPosition(tokenId,from,requestedLoanAmount, _value);

        return this.onERC721Received.selector;
    }

    function createPosition(uint256 tokenId, address from, uint256 _borrowedAmount, uint256 _value) internal{

        Position memory newPosition = Position({
            value:_value,
            borrowedAmount:_borrowedAmount,
            feesIncurred:0,
            owner:from
        });

        positions[tokenId] = newPosition;

    }
    function closePosition(uint256 tokenId) internal{

        Position storage position = positions[tokenId];
        require(position.owner != address(0), "Position does not exist");
        delete positions[tokenId];

    }

    function payback (uint256 tokenId) public payable{

        // partial payback can help loan health/ if fully paid back sent nft back to owner
    

    }

    function valuation(uint256 tokenId) public returns(uint256){
        // value = price of token0* qty of token0 + price of token1*qty of token1
    }

    function increaseBorrowAmount(uint256 tokenId, uint256 additionalBorrow) public{

    }

    function liquidation(uint256 tokenId) public{
        // DOING THIS LAST cuz damn
        // Should be Payable
        // Check if it is marked as unhealthy
        // pays the min value
        // check that the value they paid is equal to or greater than debt+fees
        //transfer NFT position to them
    }


}
