// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// import "./interfaces/INonfungiblePositionManager.sol";
import "./interfaces/IUniPositionInfo.sol";

import"./interfaces/IValuation.sol";
import "./GhoToken.sol";

interface IGHO is IERC20 {
    function mint(address to, uint256 amount) external;

    function burn(address from, uint256 amount) external;

    // function approve(address spender, uint256 value) external virtual returns (bool);

    // function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract GHOUnicorns is IERC721Receiver {

    // Token Address
    IGHO public ghoToken;

    // // Position Info contract
    IUniPositionInfo public positInfo;
    IValuation public positVal;

    // Structure of a Deposit
    struct Deposit {
        uint256 value;
        uint256 borrowedAmount;
        address owner;
    }

    //Track all Positions made
    mapping(uint256 => Deposit) public deposits;

    // Math purposes
    uint256 public constant Loan2Value = 75e16;
    uint256 public constant liquidRatio = 8e17;

    constructor( address _ghoToken, address _positInfo, address _positVal) {
        ghoToken = IGHO(_ghoToken);
        positInfo = IUniPositionInfo(_positInfo);
        positVal = IValuation(_positVal);
    }

    // // ON recieve
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) public override returns (bytes4) {
       
        return this.onERC721Received.selector;
    }

    function openPosition(
        uint256 tokenId,
        uint256 _value,
        uint256 _borrowedAmount,
        address from
    ) internal {
        deposits[tokenId] = Deposit({
            value: _value,
            borrowedAmount: _borrowedAmount,
            owner: from
        });
    }

    function closePosition(uint256 tokenId) internal {
        Deposit storage depositPosition = deposits[tokenId];
        require(depositPosition.owner != address(0), "Position does not exist");
        delete deposits[tokenId];
    }

    function newDeposit(
        uint256 tokenId,
        uint256 _borrowedAmount
    ) public{
        // IERC721(positInfo.positionManager()).safeTransferFrom(msg.sender,address(this),tokenId);
        uint256 fValue = getValue(tokenId);
        require(_borrowedAmount/fValue <Loan2Value, "Borrowing Too Much");
        openPosition(tokenId,fValue,_borrowedAmount,msg.sender);
        ghoToken.mint(msg.sender, _borrowedAmount);
     
    }

    function getValue(uint256 tokenId)internal view returns(uint256 fValue){
        (uint256 amount0,uint256 amount1,address token0,address token1, address poolAdd) = positInfo.getPositionInfo(tokenId); 
        uint256 gPrice = positInfo.getTWAP(poolAdd,250);
        fValue = positVal.evaluate(token0, token1,  gPrice, amount0, amount1);
        
    }

    function checkGhoBalance(address userAddress) public view returns(uint256){
        return ghoToken.balanceOf(userAddress);
    }

   function payback(uint256 tokenId, uint256 ghoRepaid) public {
        // partial payback can help loan health/ if fully paid back sent nft back to owner. Money needs to be sent in same transaction.
        ghoToken.transferFrom(msg.sender,address(this),ghoRepaid);

        Deposit storage depositPosition = deposits[tokenId];

        // Partial Payback
        if (depositPosition.borrowedAmount > ghoRepaid) {
            ghoToken.burn(address(this), ghoRepaid);
            depositPosition.borrowedAmount = depositPosition.borrowedAmount - ghoRepaid;
        } else {

            if (depositPosition.borrowedAmount/depositPosition.value>=liquidRatio){

                ghoToken.burn(address(this), ghoRepaid);
            //     IERC721(positInfo.positionManager()).safeTransferFrom(
            //     address(this),
            //     msg.sender,
            //     tokenId
            // );
            

            }else{
                ghoToken.burn(address(this), ghoRepaid);
            //     IERC721(positInfo.positionManager()).safeTransferFrom(
            //     address(this),
            //     depositPosition.owner,
            //     tokenId
            // );
            }

            closePosition(tokenId);
        }
    }
}
