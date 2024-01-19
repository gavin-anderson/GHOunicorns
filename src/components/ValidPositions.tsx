import { Box, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import fetchPositions from "../scripts/fetchPositions";
import { ethers } from "ethers";
import getPrice from "../scripts/getAmounts";

export default function ValidPositions({ walletAddress }) {
  const [positions, setPositions] = useState(null);
  const [poolAddress, setPoolAddress] = useState();
  console.log(poolAddress, "SHHHH");
  console.log(positions, "SHH");

  useEffect(() => {
    // get pool address
    const getPoolAddress = async (token0address, token1Address, fee) => {
      const factoryABI = [
        `  function getPool(
        address tokenA,
        address tokenB,
        uint24 fee
      ) external view returns (address pool)`,
      ];

      const factoryAddress = "0x0227628f3F023bb0B980b67D528571c95c6DaC1c";

      const provider = new ethers.providers.JsonRpcProvider(
        "https://eth-sepolia.g.alchemy.com/v2/qeWtlwJXxgXcvDcGk6YHnaIWnAQcOWuK"
      );

      const factoryContract = new ethers.Contract(
        factoryAddress,
        factoryABI,
        provider
      );

      if (factoryContract) {
        const poolAddy = await factoryContract.functions.getPool(
          token0address,
          token1Address,
          fee
        );
        return poolAddy;
      }
    };

    const getPositions = async (address) => {
      const positions = await fetchPositions(address);
      setPositions(positions);
      //   let pool = [];
      //   for (const position of positions) {
      //     let poolAddy = await getPoolAddress(
      //       position.token0,
      //       position.token1,
      //       position.fee
      //     );

      //     setPoolAddress(poolAddy);
      //   }

      await getPrice(
        positions[0].token0,
        positions[0].token1,
        positions[0].fee
      ).then((res) => {
        console.log(res, "AHAHAHAHAHH");
        const price = res?.sqrtPriceX96._hex;
        const calcPrice = price ** 2 / 2 ** 192;
        console.log(calcPrice, "FINALLLL PRICE");
      });
    };

    if (walletAddress) {
      getPositions("0x1FEa87245184b19600Dde132151EEb00eC6E1771");
    }
  }, [walletAddress]);

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
