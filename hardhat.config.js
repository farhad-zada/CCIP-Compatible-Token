require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.2",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    bsc: {
      url: process.env.BSC_RPC,
      chainId: process.env.BSC_CID * 1,
      accounts: [process.env.PKEY],
    },
    tbsc: {
      url: process.env.TBSC_RPC,
      chainId: process.env.TBSC_CID * 1,
      accounts: [process.env.PKEY],
    },
  },
};
