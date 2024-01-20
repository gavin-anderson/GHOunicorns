// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./interfaces/IValuation.sol";


contract Valuation{
    
    constructor(){

    }

    function evaluate(address token0, address token1, uint256 gPrice, uint256 amount0, uint256 amount1)external view returns(uint256 fValue){

        // 6
        uint256 dec0 = getDecimals(token0);  
        // 18
        uint256 dec1 = getDecimals(token1);
        uint256 amt0 = amount0*10**uint256(18-dec0);
        uint256 amt1 = amount1*10**uint256(18-dec1);
        uint256 scale;
       if (dec0>dec1){
        scale = 10**uint256(dec0-dec1);
       }else{
        scale = 10**uint256(dec1-dec0);
       }
        
       if (gPrice>scale){
        gPrice=(gPrice/scale);
        fValue = amt1+(gPrice*amt0)/1e18;
        
       }else{
        gPrice=gPrice*scale;
        fValue = amt0+(gPrice*amt1)/1e18;
       }

       return(fValue);

    }
        
    

    function getDecimals(address token) internal view returns(uint8){
        try ERC20(token).decimals() returns (uint8 tokenDecimals) {
            return tokenDecimals;
        } catch {
            // If the function call fails, default to a standard value (e.g., 18 decimals)
            return 18;
        }
    }
}