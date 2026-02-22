require("dotenv").config();
const { ethers } = require("ethers");

// ====== CONFIG ======
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";

// Token + Pair addresses
const PAIR_1 = "PAIR_ADDRESS_DEX_1";
const PAIR_2 = "PAIR_ADDRESS_DEX_2";
const TOKEN_BORROW = "TOKEN_ADDRESS";

// Flashloan amount (example: 1 token with 18 decimals)
const FLASH_AMOUNT = ethers.parseUnits("1", 18);

// ====== SETUP ======
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Minimal ABI for your flashloan contract
const contractABI = [
  "function executeFlashloan(address token, uint256 amount) external"
];

// Pancake-style pair ABI
const pairABI = [
  "function getReserves() view returns (uint112, uint112, uint32)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);
const pair1 = new ethers.Contract(PAIR_1, pairABI, provider);
const pair2 = new ethers.Contract(PAIR_2, pairABI, provider);

// ====== PRICE FORMULA ======
function getAmountOut(amountIn, reserveIn, reserveOut) {
  const amountInWithFee = amountIn * 997n;
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * 1000n + amountInWithFee;
  return numerator / denominator;
}

// ====== MAIN BOT ======
async function checkArbitrage() {
  try {
    console.log("Checking arbitrage...");

    const reserves1 = await pair1.getReserves();
    const reserves2 = await pair2.getReserves();

    // NOTE: adjust reserve order if needed
    const reserve1In = BigInt(reserves1[0]);
    const reserve1Out = BigInt(reserves1[1]);

    const reserve2In = BigInt(reserves2[0]);
    const reserve2Out = BigInt(reserves2[1]);

    const amountIn = BigInt(FLASH_AMOUNT.toString());

    // Swap 1
    const out1 = getAmountOut(amountIn, reserve1In, reserve1Out);

    // Swap 2
    const out2 = getAmountOut(out1, reserve2In, reserve2Out);

    // Flashloan fee (0.3% example)
    const flashFee = (amountIn * 3n) / 1000n;
    const repayment = amountIn + flashFee;

    const profit = out2 - repayment;

    console.log("Simulated Profit:", profit.toString());

    if (profit > 0n) {
      console.log("🔥 PROFITABLE — Executing Flashloan...");

      const tx = await contract.executeFlashloan(
        TOKEN_BORROW,
        FLASH_AMOUNT,
        { gasLimit: 800000 }
      );

      console.log("Transaction sent:", tx.hash);

      await tx.wait();

      console.log("✅ Flashloan Executed!");
    } else {
      console.log("❌ Not profitable.");
    }

  } catch (err) {
    console.error("Error:", err.message);
  }
}

// Run every 5 seconds
setInterval(checkArbitrage, 5000);