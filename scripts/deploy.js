const { ethers } = require("hardhat");

async function main() {

  // ✅ BSC MAINNET ROUTERS
  const PANCAKE_V2_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
  const PANCAKE_V3_ROUTER = "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4";
  const APESWAP_ROUTER     = "0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607";
  const BISWAP_ROUTER      = "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8";

  const FlashLoan = await ethers.getContractFactory("FlashLoanArbitrage");

  const contract = await FlashLoan.deploy(
    PANCAKE_V2_ROUTER,
    PANCAKE_V3_ROUTER,
    APESWAP_ROUTER,
    BISWAP_ROUTER
  );

  await contract.deployed();

  console.log("FlashLoanArbitrage deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});