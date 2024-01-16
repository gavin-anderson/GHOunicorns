// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./GHOToken.sol";
// import "./interfaces/IValuation.sol";
// import "./interfaces/IUniPositionInfo.sol";

interface IGHO is IERC20 {
    function mint(address to, uint256 amount) external;

    function burn(address from, uint256 amount) external;
}

contract GHOUnicorns is IERC721Receiver {

    // Interfaces
    // Token Address
    IGHO public ghoToken;
    // Valuation contract
    // IValuation public evaluate;
    // Position Info contract
    // IUniPositionInfo public postionInfo;

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

    constructor(IGHO _ghoToken) {
        ghoToken = _ghoToken;
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
    ) internal {}

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
