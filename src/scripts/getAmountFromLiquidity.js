const BigNumber = require("bignumber.js");

const FixedPoint96 = {
  Q96: new BigNumber(2).pow(96),
  RESOLUTION: 96,
};

class LiquidityAmounts {
  static toUint128(x) {
    let y = x.integerValue(BigNumber.ROUND_DOWN);
    if (y.gte(new BigNumber(2).pow(128).minus(1))) {
      throw new Error("Value overflows uint128");
    }
    return y.toNumber();
  }

  static getLiquidityForAmount0(sqrtRatioAX96, sqrtRatioBX96, amount0) {
    if (sqrtRatioAX96.gte(sqrtRatioBX96)) {
      [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
    }
    const intermediate = sqrtRatioAX96
      .times(sqrtRatioBX96)
      .dividedBy(FixedPoint96.Q96);
    return this.toUint128(
      new BigNumber(amount0)
        .times(intermediate)
        .dividedBy(sqrtRatioBX96.minus(sqrtRatioAX96))
    );
  }

  static getLiquidityForAmount1(sqrtRatioAX96, sqrtRatioBX96, amount1) {
    if (sqrtRatioAX96.gte(sqrtRatioBX96)) {
      [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
    }
    return this.toUint128(
      new BigNumber(amount1)
        .times(FixedPoint96.Q96)
        .dividedBy(sqrtRatioBX96.minus(sqrtRatioAX96))
    );
  }

  static getLiquidityForAmounts(
    sqrtRatioX96,
    sqrtRatioAX96,
    sqrtRatioBX96,
    amount0,
    amount1
  ) {
    if (sqrtRatioAX96.gte(sqrtRatioBX96)) {
      [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
    }

    let liquidity;
    if (sqrtRatioX96.lte(sqrtRatioAX96)) {
      liquidity = this.getLiquidityForAmount0(
        sqrtRatioAX96,
        sqrtRatioBX96,
        amount0
      );
    } else if (sqrtRatioX96.lt(sqrtRatioBX96)) {
      const liquidity0 = this.getLiquidityForAmount0(
        sqrtRatioX96,
        sqrtRatioBX96,
        amount0
      );
      const liquidity1 = this.getLiquidityForAmount1(
        sqrtRatioAX96,
        sqrtRatioX96,
        amount1
      );
      liquidity = BigNumber.min(liquidity0, liquidity1);
    } else {
      liquidity = this.getLiquidityForAmount1(
        sqrtRatioAX96,
        sqrtRatioBX96,
        amount1
      );
    }

    return liquidity.toNumber();
  }

  static getAmount0ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity) {
    if (sqrtRatioAX96.gte(sqrtRatioBX96)) {
      [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
    }

    const num = new BigNumber(liquidity)
      .shiftedBy(FixedPoint96.RESOLUTION)
      .times(sqrtRatioBX96.minus(sqrtRatioAX96))
      .dividedBy(sqrtRatioBX96);

    return num.dividedBy(sqrtRatioAX96).toNumber();
  }

  static getAmount1ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity) {
    if (sqrtRatioAX96.gte(sqrtRatioBX96)) {
      [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
    }

    return new BigNumber(liquidity)
      .times(sqrtRatioBX96.minus(sqrtRatioAX96))
      .dividedBy(FixedPoint96.Q96)
      .toNumber();
  }

  static getAmountsForLiquidity(
    sqrtRatioX96,
    sqrtRatioAX96,
    sqrtRatioBX96,
    liquidity
  ) {
    sqrtRatioAX96 = new BigNumber(sqrtRatioAX96);
    sqrtRatioBX96 = new BigNumber(sqrtRatioBX96);
    sqrtRatioX96 = new BigNumber(sqrtRatioX96);
    if (sqrtRatioAX96.gte(sqrtRatioBX96)) {
      [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
    }

    let amount0, amount1;
    if (sqrtRatioX96.lte(sqrtRatioAX96)) {
      amount0 = this.getAmount0ForLiquidity(
        sqrtRatioAX96,
        sqrtRatioBX96,
        liquidity
      );
    } else if (sqrtRatioX96.lt(sqrtRatioBX96)) {
      amount0 = this.getAmount0ForLiquidity(
        sqrtRatioX96,
        sqrtRatioBX96,
        liquidity
      );
      amount1 = this.getAmount1ForLiquidity(
        sqrtRatioAX96,
        sqrtRatioX96,
        liquidity
      );
    } else {
      amount1 = this.getAmount1ForLiquidity(
        sqrtRatioAX96,
        sqrtRatioBX96,
        liquidity
      );
    }

    return [amount0, amount1];
  }
}

module.exports = LiquidityAmounts;
