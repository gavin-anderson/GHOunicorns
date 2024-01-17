// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "./interfaces/INonfungiblePositionManager.sol";
import "./GHOToken.sol";
import "./UniPositionInfo.sol";


interface IGHO is IERC20 {
    function mint(address to, uint256 amount) external;

    function burn(address from, uint256 amount) external;
}

contract GHOUnicorns is IERC721Receiver {

    // Token Address
    IGHO public ghoToken;

    // Position Info contract
    UniPositionInfo public positInfo;

    // Structure of a Deposit
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

    constructor(address _ghoToken, address _positInfo) {
        ghoToken = IGHO(_ghoToken);
        positInfo = UniPositionInfo(_positInfo);
    }

    // // ON recieve
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

    function newDeposit(
        uint256 tokenId,
        address from,
        uint256 _borrowedAmount
    ) internal {

        (address token0, address token1, uint24 fee, uint128 liquidity) = positInfo.getPositionInfo(tokenId);
        uint256 price = positInfo.getPrice(token0, token1, fee);

    }

    function closePosition(uint256 tokenId) internal {
        Deposit storage depositPosition = deposits[tokenId];
        require(depositPosition.owner != address(0), "Position does not exist");
        delete deposits[tokenId];
    }

    // function payback(uint256 tokenId) public {
    //     // partial payback can help loan health/ if fully paid back sent nft back to owner. Money needs to be sent in same transaction.
    //     uint256 ghoOwned = ghoToken.balanceOf(address(this));
    //     require(ghoOwned > 0, "No GHO sent");
    //     Deposit storage depositPosition = deposits[tokenId];

    //     if (depositPosition.borrowedAmount > ghoOwned) {
    //         ghoToken.burn(address(this), ghoOwned);
    //         depositPosition.borrowedAmount = depositPosition.borrowedAmount - ghoOwned;
    //     } else {

    //         if (depositPosition.borrowedAmount*scalingFactor/depositPosition.value>=liquidRatio){

    //             ghoToken.burn(address(this), ghoOwned);
    //             IERC721(positInfo.positionManager()).safeTransferFrom(
    //             address(this),
    //             msg.sender,
    //             tokenId,
    //             ""
    //         );
    //         closePosition(tokenId);

    //         }else{
    //         ghoToken.burn(address(this), ghoOwned);
    //          IERC721(positInfo.positionManager()).safeTransferFrom(
    //             address(this),
    //             depositPosition,
    //             tokenId,
    //             ""
    //         );
    //         closePosition(tokenId);
    //         }
    //     }
    // }
}
