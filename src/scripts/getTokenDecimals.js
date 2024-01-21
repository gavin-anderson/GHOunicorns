const ethers = require("ethers");
import ERC20_ABI from "../abi/erc20.json";

const provider = new ethers.providers.JsonRpcProvider(
  "https://eth-sepolia.g.alchemy.com/v2/qeWtlwJXxgXcvDcGk6YHnaIWnAQcOWuK"
);

async function getTokenDecimals(tokenAddress) {
  // console.log("ARE WE GHERE");
  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  return await tokenContract.decimals();
}

export default getTokenDecimals;
