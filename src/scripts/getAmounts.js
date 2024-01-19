const ethers = require("ethers");
const provider = new ethers.providers.JsonRpcProvider(
  "https://eth-sepolia.g.alchemy.com/v2/qeWtlwJXxgXcvDcGk6YHnaIWnAQcOWuK"
);
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

const getPrice = async (token0, token1, feeAmount) => {
  try {
    const factory = new ethers.Contract(
      "0x0227628f3F023bb0B980b67D528571c95c6DaC1c",
      factoryABI,
      provider
    );
    const poolAddress = await factory.getPool(token0, token1, feeAmount);
    const pool = new ethers.Contract(poolAddress, poolABI, provider);
    const slot0 = await pool.slot0();
    console.log("slot0", slot0);
    return slot0;
  } catch (error) {
    console.log(error, "this is the error for getPrice");
  }
};

export default getPrice;
