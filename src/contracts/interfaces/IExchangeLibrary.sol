
//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IExchangeLibrary {
    function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB);
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut);
    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) external pure returns (uint amountIn);
    function getAmountsOut(address factory, uint amountIn, address[] memory path) external view returns (uint[] memory amounts);
    function getAmountsIn(address factory, uint amountOut, address[] memory path) external view returns (uint[] memory amounts);
}