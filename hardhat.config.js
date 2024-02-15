require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-toolbox");
require("solidity-coverage");

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      // Configuration for the Hardhat Network
    },
    // specify other networks here, like Rinkeby or Mainnet
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    // Mocha configuration
    timeout: 200000 // Example timeout configuration
  }
};
