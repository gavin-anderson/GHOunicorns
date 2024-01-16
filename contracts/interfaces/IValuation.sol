// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IValuation {
    function getPositionValue()external pure returns(uint256);
}