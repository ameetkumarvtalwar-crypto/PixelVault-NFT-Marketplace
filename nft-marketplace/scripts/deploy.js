// scripts/deploy.js
// Run with:  npx hardhat run scripts/deploy.js --network hardhat
//       or:  npx hardhat run scripts/deploy.js --network sepolia

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Compile & deploy the contract
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const marketplace    = await NFTMarketplace.deploy();
  await marketplace.waitForDeployment();

  const address = await marketplace.getAddress();
  console.log("\n✅  NFTMarketplace deployed to:", address);
  console.log("\n👉  Copy this address into frontend/src/config.js → CONTRACT_ADDRESS\n");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
