
//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IFactory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function createPair(address tokenA, address tokenB) external returns (address pair);
    function setFeeTo(address _feeTo) external;
    function setFeeToSetter(address _feeToSetter) external;
    function feeTo() external returns (address _feeTo);
}
