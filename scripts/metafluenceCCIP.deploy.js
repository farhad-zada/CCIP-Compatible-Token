/**
 * Here we test the upgraded version of Meto CCIP token
 */

const { ethers } = require("hardhat");

async function main() {
  const MetafluenceCCIP = await ethers.deployContract("MetafluenceCCIP");
  const metoccip = await MetafluenceCCIP.waitForDeployment();
  console.log(`Metafluence CCIP Token deployed at address ${metoccip.target}`);
}

main().catch((err) => {
  console.log(err);
  process.exitCode = 1;
});
