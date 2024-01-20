const tickToPrice = (tick, tokenDecimals0, tokenDecimals1) => {
  const ratio = 1.0001 ** Number(tick);
  const decimalShift = 10 ** (Number(tokenDecimals0) - Number(tokenDecimals1));
  return ratio * decimalShift;
};

export const calcAmount0 = (
  liquidity: number,
  currentPrice: number,
  priceUpper: number,
  token0Decimals: number,
  token1Decimals: number
) => {
  console.log(
    liquidity,
    currentPrice,
    priceUpper,
    token0Decimals,
    token1Decimals,
    "PARAMTERSSSSS"
  );
  const upper = tickToPrice(priceUpper, token0Decimals, token1Decimals);
  const decimalAdjustment = 10 ** (token0Decimals - token1Decimals);
  const mathCurrentPrice = currentPrice / decimalAdjustment;
  const mathPriceUpper = upper / decimalAdjustment;

  const math =
    liquidity *
    ((Math.sqrt(mathPriceUpper) - Math.sqrt(mathCurrentPrice)) /
      (Math.sqrt(mathCurrentPrice) * Math.sqrt(mathPriceUpper)));
  const adjustedMath = math > 0 ? math : 0;
  return adjustedMath;
};

export const calcAmount1 = (
  liquidity: number,
  currentPrice: number,
  priceLower: number,
  token0Decimals: number,
  token1Decimals: number
) => {
  const lower = tickToPrice(priceLower, token0Decimals, token1Decimals);
  const decimalAdjustment = 10 ** (token0Decimals - token1Decimals);
  const mathCurrentPrice = currentPrice / decimalAdjustment;
  const mathPriceLower = lower / decimalAdjustment;

  const math =
    liquidity * (Math.sqrt(mathCurrentPrice) - Math.sqrt(mathPriceLower));
  const adjustedMath = math > 0 ? math : 0;
  return adjustedMath;
};
