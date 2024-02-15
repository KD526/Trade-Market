require("@nomicfoundation/hardhat-ethers");
require("solidity-coverage");

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      // Configuration for the Hardhat Network
    },
    // You can specify other networks here, like Rinkeby or Mainnet
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    // Mocha configuration, if you want to specify timeout or other settings
    timeout: 200000 // Example timeout configuration
  }
  // You can add other configurations like etherscan API keys if you plan to verify contracts
};
