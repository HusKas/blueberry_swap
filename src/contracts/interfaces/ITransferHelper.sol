//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;


interface  ITransferHelper {
    function safeApprove(
        address token,
        address to,
        uint256 value
    ) external;

      function safeTransfer(
        address token,
        address to,
        uint256 value
    ) external;

    function safeTransferFrom(
        address token,
        address from,
        address to,
        uint256 value
    ) external;

    function safeTransferETH(address to, uint256 value) external; 

}