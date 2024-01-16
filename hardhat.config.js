require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // networks: {
  //   hardhat: {
  //     forking: {
  //       url: "https://goerli.infura.io/v3/YOUR_INFURA_PROJECT_ID",
  //       blockNumber: BLOCK_NUMBER_TO_FORK, // Optional: Specify a specific block to fork from (Optional?)
  //     },
  //     accounts: {
  //       accountsBalance: "10000000000000000000000" // Amount of ETH (in wei) to allocate to each account
  //     }
  //   }
  // },
  solidity: "0.8.21",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200 // Adjust the number of runs to suit your contract
    },
    viaIR: true // Enable compilation via Yul IR
  }
};
