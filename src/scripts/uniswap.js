//IMPORTING ETHERS
const ethers = require("ethers");
//SETTING THE PROVIDER OF YOUR BEST CHOICE
const provider = new ethers.providers.WebSocketProvider(
  "https://eth-sepolia.g.alchemy.com/v2/qeWtlwJXxgXcvDcGk6YHnaIWnAQcOWuK"
);
//HUMAN READABLE ABI FROM ETHERS
const poolABI = [
  `  function slot0(
        ) external view returns
        (uint160 sqrtPriceX96,
        int24 tick,
        uint16 observationIndex,
        uint16 observationCardinality,
        uint16 observationCardinalityNext,
        uint8 feeProtocol,
        bool unlocked)`,
];

const factoryABI = [
  `  function getPool(
        address tokenA,
        address tokenB,
        uint24 fee
      ) external view returns (address pool)`,
];

export const getPrice = async (token0, token1, feeAmount) => {
  try {
    const factory = new ethers.Contract(factoryAddress, factoryABI, provider);
    const poolAddress = await factory.getPool(token0, token1, feeAmount);
    const pool = new ethers.Contract(poolAddress, poolABI, provider);
    const slot0 = pool.slot0();
    console.log("slot0", slot0);
    return slot0;
  } catch (error) {
    console.log(error, "this is the error for getPrice");
  }
};
