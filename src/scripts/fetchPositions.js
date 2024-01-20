import { ethers } from "ethers";
import INONFUNGIBLE_POSITION_MANAGER from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import { PositionInfo } from "./PositionInfo";
import JSBI from "jsbi";

const provider = new ethers.providers.JsonRpcProvider(
  "https://eth-sepolia.g.alchemy.com/v2/qeWtlwJXxgXcvDcGk6YHnaIWnAQcOWuK"
);

const NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS =
  "0x1238536071E1c677A632429e3655c799b22cDA52";

const nfpmContract = new ethers.Contract(
  NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
  INONFUNGIBLE_POSITION_MANAGER.abi,
  provider
);

export default async function fetchPositions(address) {
  const numPositions = await nfpmContract.balanceOf(address);
  const calls = [];

  for (let i = 0; i < numPositions; i++) {
    calls.push(nfpmContract.tokenOfOwnerByIndex(address, i));
  }

  const positionIds = await Promise.all(calls);

  const positionCalls = [];

  for (let id of positionIds) {
    positionCalls.push(nfpmContract.positions(id));
  }

  const callResponses = await Promise.all(positionCalls);

  const positionInfos = callResponses.map((position) => {
    return {
      tickLower: position.tickLower,
      tickUpper: position.tickUpper,
      liquidity: JSBI.BigInt(position.liquidity),
      feeGrowthInside0LastX128: JSBI.BigInt(position.feeGrowthInside0LastX128),
      feeGrowthInside1LastX128: JSBI.BigInt(position.feeGrowthInside1LastX128),
      tokensOwed0: JSBI.BigInt(position.tokensOwed0),
      tokensOwed1: JSBI.BigInt(position.tokensOwed1),
      token0: position.token0, // Include token0 address
      token1: position.token1, // Include token1 address
      fee: position.fee,
    };
  });

  return positionInfos;
}

// export default async function getPositionAmounts() {

// let position = await nfpmContract.positions(tokenID);
// let fee = position.fee / 10000;

// }
