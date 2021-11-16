//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import './Exchange.sol';
// import 'hardhat/console.sol';

contract Factory is IFactory{
    address public override feeTo;
    address public feeToSetter;

    constructor() {
        feeTo = msg.sender;
        feeToSetter = msg.sender;
    }
    mapping(address => mapping(address => address)) public override getPair;
    
    function createPair(address _tokenA, address _tokenB) public override returns (address pair) {
        require(_tokenA != _tokenB, "createPair: IDENTICAL_ADDRESSES");
        (address token0, address token1) = _tokenA < _tokenB ? (_tokenA, _tokenB) : (_tokenB, _tokenA);
        require(token0 != address(0), 'createPair: ZERO_ADDRESS');
        require(
            getPair[token0][token1] == address(0),
            "PAIR already exists!"
        );

        bytes memory bytecode = type(Exchange).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IExchange(pair).initialize(token0, token1);
        getPair[token0][token1] = address(pair);
        getPair[token1][token0] = address(pair);

    }

    function setFeeTo(address _feeTo) external override {
        require(msg.sender == feeToSetter, 'setFeeTo: FORBIDDEN');
        feeTo = _feeTo;
    }

    function setFeeToSetter(address _feeToSetter) external override {
        require(msg.sender == feeToSetter, 'setFeeToSetter: FORBIDDEN');
        feeToSetter = _feeToSetter;
    }

}

