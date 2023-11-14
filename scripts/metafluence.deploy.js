const { ethers } = require("hardhat");

async function main() {
  const Metafluence = await ethers.deployContract("MetafluenceBurnable");
  const meto = await Metafluence.waitForDeployment();
  console.log(`Metafluence Token deployed at address ${meto.target}`);
}

main().catch((err) => {
  console.log(err);
  process.exitCode = 1;
});
