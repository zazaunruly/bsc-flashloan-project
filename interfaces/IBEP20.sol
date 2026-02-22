// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBEP20 {
    function transfer(address recipient, uint amount) external returns (bool);
}
