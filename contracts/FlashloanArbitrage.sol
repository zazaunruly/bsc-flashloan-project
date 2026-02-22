// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IPancakeRouter {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory);

    function WETH() external pure returns (address);
}

interface IERC20 {
    function balanceOf(address account) external view returns (uint);

    function transfer(address recipient, uint amount) external returns (bool);

    function approve(address spender, uint amount) external returns (bool);
}

contract FlashloanArbitrage is ReentrancyGuard, Ownable {
    uint public minimumProfit;

    address public router1;
    address public router2;

    constructor(
        address _router1,
        address _router2,
        uint _minimumProfit,
        address initialOwner
    ) Ownable(initialOwner) {
        router1 = _router1;
        router2 = _router2;
        minimumProfit = _minimumProfit;
    }

    function setMinimumProfit(uint _profit) external onlyOwner {
        minimumProfit = _profit;
    }

    function executeArbitrage(
        address tokenBorrow,
        uint borrowAmount,
        address[] calldata path1,
        address[] calldata path2,
        uint deadline
    ) external onlyOwner nonReentrant {
        uint balanceBefore = IERC20(tokenBorrow).balanceOf(address(this));

        // --- Swap 1 ---
        IERC20(tokenBorrow).approve(router1, borrowAmount);

        IPancakeRouter(router1).swapExactTokensForTokens(
            borrowAmount,
            1,
            path1,
            address(this),
            deadline
        );

        uint intermediateBalance = IERC20(path1[path1.length - 1]).balanceOf(
            address(this)
        );

        IERC20(path1[path1.length - 1]).approve(router2, intermediateBalance);

        // --- Swap 2 ---
        address[] memory reversePath = path2;

        IPancakeRouter(router2).swapExactTokensForTokens(
            intermediateBalance,
            1,
            reversePath,
            address(this),
            deadline
        );

        uint finalBalance = IERC20(tokenBorrow).balanceOf(address(this));

        require(
            finalBalance >= balanceBefore + minimumProfit,
            "Unprofitable trade"
        );
    }

    function withdrawToken(address token) external onlyOwner {
        uint balance = IERC20(token).balanceOf(address(this));
        IERC20(token).transfer(msg.sender, balance);
    }

    receive() external payable {}
}
