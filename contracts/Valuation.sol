// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IValuation.sol";

contract Valuation is IValuation {


    constructor(){

    }

    function getPositionValue()external pure returns(uint256){
        return 0;
    }
}