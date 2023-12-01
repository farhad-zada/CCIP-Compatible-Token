const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const MetafluencePeripheral = await ethers.getContractFactory(
    "MetafluencePeripheral"
  );
  console.log("Deploying contract MetafluencePeripheral...");
  const metoperipheral = await upgrades.deployProxy(MetafluencePeripheral, [], {
    initializer: "initialize",
  });
  console.log(
    `Metafluence Peripheral Token deployed at address ${metoperipheral.target}`
  );
  console.log("Waiting for contract to be mined...");
  await metoperipheral.deploymentTransaction().wait(10);

  await hre.run("verify:verify", {
    address: metoperipheral.target,
    constructorArguments: [],
  });
}

main().catch((err) => {
  console.log(err);
  process.exitCode = 1;
});
