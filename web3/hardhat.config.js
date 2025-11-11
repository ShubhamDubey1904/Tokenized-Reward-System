require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

const { AMOY_RPC_URL, PRIVATE_KEY, API_KEY } = process.env;

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
        optimizer: { enabled: true, runs: 200 },
        viaIR: false,
        metadata: { bytecodeHash: "none" },
        evmVersion: "paris",
      },
  },
  networks: {
    polygonAmoy: {
      url: AMOY_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 80002,
      gas: "auto",
    },
  },
  etherscan: {
    apiKey: API_KEY,
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api.etherscan.io/v2/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
};
