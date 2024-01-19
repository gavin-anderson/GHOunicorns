// Import JSBI library
import JSBI from "jsbi";

// Define the PositionInfo interface
export interface PositionInfo {
  tickLower: number;
  tickUpper: number;
  liquidity: JSBI;
  feeGrowthInside0LastX128: JSBI;
  feeGrowthInside1LastX128: JSBI;
  tokensOwed0: JSBI;
  tokensOwed1: JSBI;
}
