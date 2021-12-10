//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IExchangeCallee  {
    function exchangeCall(address sender, uint amount0, uint amount1, bytes calldata data) external;
}