import { ethers } from "ethers";
import uni_position_abi from "../../contracts/UniPositionInfo.sol/UniPositionInfo.json";
import valuation_abi from "../../contracts/Valuation.sol/Valuation.json";

const gho_contracts = {
  gho_token_contract: "0x5A54bAE9E734E2910faC936e345e0a9F5D723d6e",
  gho_unicorn_contract: "0x81654f6c5c042Ed42976153f4BC681d863047AF3",
  uni_position_contract: "0x252219eA4b9992DE941Ac0AD1EFb27DA64272408",
  valuation_contract: "0x8e1fF06c1b0d753296De67F4401172870706Df47",
};

// Connect to MetaMask Wallet
async function connectWallet() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      return new ethers.providers.Web3Provider(window.ethereum);
    } catch (error) {
      console.error("Error connecting to MetaMask", error);
      return null;
    }
  } else {
    console.log(
      "MetaMask is not installed. Please consider installing it: https://metamask.io/download.html"
    );
    return null;
  }
}

// Read from a contract
async function readFromContract(contractAddress, contractABI) {
  const provider = await connectWallet();
  if (!provider) return;

  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  try {
    const data = await contract.someReadOnlyFunction();
    return data;
  } catch (error) {
    console.error("Error reading from the contract:", error);
  }
}

async function readPositionInfo(position_id) {
  const provider = await connectWallet();
  if (!provider) return;
  console.log("PROVIDERRRR", provider);

  const contract = new ethers.Contract(
    gho_contracts.uni_position_contract,
    uni_position_abi,
    provider
  );
  try {
    const data = await contract.getPositionInfo(position_id);

    return data;
  } catch (error) {
    console.error("Error reading from the contract:", error);
  }
}

async function readTwapInfo(poolAdd) {
  const provider = await connectWallet();
  if (!provider) return;

  const contract = new ethers.Contract(
    gho_contracts.uni_position_contract,
    uni_position_abi,
    provider
  );
  try {
    const data = await contract.getTWAP(poolAdd, 250);
    return data;
  } catch (error) {
    console.error("Error reading from the contract:", error);
  }
}

async function getFPrice(token0, token1, amount0, amount1, gPrice) {
  const provider = await connectWallet();
  if (!provider) return;

  const contract = new ethers.Contract(
    gho_contracts.valuation_contract,
    valuation_abi,
    provider
  );
  try {
    const data = await contract.evaluate(
      token0,
      token1,
      amount0,
      amount1,
      gPrice
    );
    return data;
  } catch (error) {
    console.error("Error reading from the contract:", error);
  }
}

// Write to a contract
async function writeToContract(contractAddress, contractABI) {
  const provider = await connectWallet();
  if (!provider) return;

  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  try {
    const tx = await contract.yourWriteFunction();
    await tx.wait();
    console.log("Transaction successful!");
  } catch (error) {
    console.error("Error writing to the contract:", error);
  }
}

export {
  connectWallet,
  readFromContract,
  writeToContract,
  readPositionInfo,
  readTwapInfo,
  getFPrice,
};
