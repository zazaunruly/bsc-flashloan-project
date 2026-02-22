// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint);

    function transfer(address recipient, uint amount) external returns (bool);

    function approve(address spender, uint amount) external returns (bool);
}

interface IPancakeRouter {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory);
}

contract FlashLoanPancake is ReentrancyGuard, Ownable {
    address public routerA;
    address public routerB;
    uint public minimumProfit;

    constructor(
        address _routerA,
        address _routerB,
        uint _minimumProfit,
        address initialOwner
    ) Ownable(initialOwner) {
        routerA = _routerA;
        routerB = _routerB;
        minimumProfit = _minimumProfit;
    }

    // ================================
    // Arbitrage Execution
    // ================================

    function executeArbitrage(
        address tokenBorrow,
        address tokenOther,
        uint borrowAmount,
        address[] memory path1,
        address[] memory path2,
        uint deadline
    ) external onlyOwner nonReentrant {
        uint balanceBefore = IERC20(tokenBorrow).balanceOf(address(this));

        require(balanceBefore >= borrowAmount, "Insufficient contract balance");

        // Swap 1 → Router A
        IERC20(tokenBorrow).approve(routerA, borrowAmount);

        IPancakeRouter(routerA).swapExactTokensForTokens(
            borrowAmount,
            1,
            path1,
            address(this),
            deadline
        );

        uint intermediateBalance = IERC20(tokenOther).balanceOf(address(this));

        require(intermediateBalance > 0, "Swap1 failed");

        // Swap 2 → Router B
        IERC20(tokenOther).approve(routerB, intermediateBalance);

        IPancakeRouter(routerB).swapExactTokensForTokens(
            intermediateBalance,
            1,
            path2,
            address(this),
            deadline
        );

        uint finalBalance = IERC20(tokenBorrow).balanceOf(address(this));

        require(
            finalBalance > balanceBefore + minimumProfit,
            "No profitable arbitrage"
        );
    }
}
