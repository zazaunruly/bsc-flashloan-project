require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Testing flash loan with account:", deployer.address);

  const FLASHLOAN_ADDRESS = "PASTE_YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE";

  const flashloan = await ethers.getContractAt("FlashLoanPancake", FLASHLOAN_ADDRESS);

  // Example token on Testnet (WBNB)
  const TOKEN_ADDRESS = "0xae13d989dac2f0debff460ac112a837c89baa7cd";
  const AMOUNT_TO_BORROW = ethers.utils.parseUnits("0.01", 18);

  console.log(`Attempting flash loan of ${AMOUNT_TO_BORROW.toString()} tokens...`);

  const tx = await flashloan.executeFlashLoan(TOKEN_ADDRESS, AMOUNT_TO_BORROW);
  await tx.wait();

  console.log("Flash loan executed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Flash loan test failed:", err);
    process.exit(1);
  });