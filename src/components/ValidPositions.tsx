import { Box, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import fetchPositions from "../scripts/fetchPositions";
import { ethers } from "ethers";
import getPrice from "../scripts/getPrice";
import getTokenDecimals from "../scripts/getTokenDecimals";
import { calcAmount0 } from "../scripts/getAmount";
import { calcAmount1 } from "../scripts/getAmount";
import LiquidityAmounts from "../scripts/getAmountFromLiquidity";

export default function ValidPositions({ walletAddress }) {
  const [positionsInfo, setPositionsInfo] = useState([]);
  const [tokenDecimals, setTokenDecimals] = useState({});
  const [finalPrices, setFinalPrices] = useState([]);
  console.log(positionsInfo, "POSITIONS INFO");
  console.log(finalPrices, "FINAL PRICES");
  console.log(tokenDecimals, "TOKEN DECIMALS");
  const [amounts, setAmounts] = useState({ amount0: null, amount1: null });
  const [currentTick, setCurrentTick] = useState();

  useEffect(() => {
    if (
      positionsInfo.length &&
      finalPrices &&
      Object.keys(tokenDecimals).length
    ) {
      // assuming finalPrices is an array with the same length as positionsInfo
      let calculatedAmounts = positionsInfo.map((position, index) => {
        const liquidity = position.liquidity[0]; // assuming liquidity is an array and you need the first element
        // const currentPrice = finalPrices[index]; // corresponding price from finalPrices
        // const priceUpper = position.tickUpper;
        // const token0Decimal = tokenDecimals["token0"];
        //   const token1Decimal = tokenDecimals["token1"];
        const sqrtRatioAX96 = position["tickUpper"];
        const sqrtRatioBX96 = position["tickLower"];
        const sqrtRatioX96 = currentTick;

        const amounts = LiquidityAmounts.getAmountsForLiquidity(
          liquidity,
          sqrtRatioAX96,
          sqrtRatioBX96,
          sqrtRatioX96
          //   token0Decimal,
          //   token1Decimal
        );
        // const amount1 = calcAmount1(
        //   liquidity,
        //   currentPrice,
        //   priceUpper
        //   //   token0Decimal,
        //   //   token1Decimal
        // );

        console.log(amounts, "AMOUNTSSSSSSS");

        return { amounts };
      });

      setAmounts(amounts);
    }
  }, [positionsInfo, finalPrices, tokenDecimals]);

  useEffect(() => {
    const getPositions = async (address) => {
      const fetchedPositions = await fetchPositions(address);
      setPositionsInfo(fetchedPositions); // Assuming fetchedPositions is an array of position objects.
    };

    if (walletAddress) {
      getPositions("0x1FEa87245184b19600Dde132151EEb00eC6E1771");
    }
  }, [walletAddress]);

  useEffect(() => {
    const getDecimals = async (positions) => {
      let decimalsInfo = {};
      for (const position of positions) {
        const token0decimal = await getTokenDecimals(position.token0);
        const token1decimal = await getTokenDecimals(position.token1);
        decimalsInfo["token0"] = token0decimal;
        decimalsInfo["token1"] = token1decimal;
      }
      console.log(decimalsInfo, "DEVIMAL");
      setTokenDecimals(decimalsInfo);
    };

    if (positionsInfo.length > 0) {
      getDecimals(positionsInfo);
    }
  }, [positionsInfo]); // This will run when positionsInfo is updated.

  //  useEffect to fetch prices
  useEffect(() => {
    const fetchPrices = async () => {
      let pricesPromises = positionsInfo.map((position) =>
        getPrice(position.token0, position.token1, position.fee).then((res) => {
          const price = res?.sqrtPriceX96._hex;
          setCurrentTick(res.tick);
          return price ** 2 / 2 ** 192; // assuming this is the correct calculation for your use case
        })
      );

      Promise.all(pricesPromises)
        .then((prices) => setFinalPrices(prices))
        .catch((error) => console.error("Error fetching prices:", error));
    };

    if (positionsInfo.length > 0) {
      fetchPrices();
    }
  }, [positionsInfo]); // This will run when positionsInfo is updated.

  return (
    <Box>
      <Box sx={{ position: "relative", zIndex: 1 }}>
        {/* Icon and the rest of your content */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {/* <CreditCardIcon sx={{ fontSize: 'large', mr: 1 }} /> */}
          <Typography variant="subtitle1" gutterBottom>
            VISA
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Active Balance
        </Typography>
        <Typography variant="h4" sx={{ my: 1 }}>
          € 45.720
        </Typography>
        <Typography variant="body2">F Alexandra</Typography>
        <Typography variant="body2">05/24</Typography>
      </Box>
    </Box>
  );
}
