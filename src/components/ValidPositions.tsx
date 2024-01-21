import { Box, Button, Paper, Typography } from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import fetchPositions from "../scripts/fetchPositions";
import { ethers } from "ethers";
import getPrice from "../scripts/getPrice";
import getTokenDecimals from "../scripts/getTokenDecimals";
import LiquidityAmounts from "../scripts/getAmountFromLiquidity";
import CircularProgress from "@mui/material/CircularProgress"; // For MUI v5
import ModalComponent from "./BorrowModal";
import {
  readPositionInfo,
  connectWallet,
  readFromContract,
  writeToContract,
  readTwapInfo,
  getFPrice,
} from "../scripts/contractInteractions/contract";

export default function ValidPositions({ walletAddress }) {
  const [positionsInfo, setPositionsInfo] = useState([]);
  const [tokenDecimals, setTokenDecimals] = useState([]);
  const [finalPrices, setFinalPrices] = useState([]);
  const [finalPositionInfo, setFinalPositionInfo] = useState([]);
  const [finalContractInfo, setFinalContractInfo] = useState([]);
  const [positionInfoWithPrice, setPositionInfoWithPrice] = useState([]);

  const address_mapping = {
    "0x1300CdA0fC74a2cBE3F1D20674198435f2871A25": "USDT",
    "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8": "USDC",
    "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14": "WETH",
  };

  // console.log(positionsInfo, "POSITIONS INFO");
  // console.log(finalPrices, "FINAL PRICES");
  // console.log(tokenDecimals, "TOKEN DECIMALS");
  const [amounts, setAmounts] = useState({ amount0: null, amount1: null });
  const [currentTick, setCurrentTick] = useState();

  // states and variables for contract interactions
  const [contractData, setContractData] = useState([]);

  // functions that will read and write from contracts
  const handleReadFromContract = async () => {
    const data = await readFromContract(contractAddress, contractABI);
    if (data) {
      setContractData(data.toString());
    }
  };

  const handleWriteToContract = async () => {
    await writeToContract(contractAddress, contractABI);
  };

  useEffect(() => {
    if (
      positionsInfo.length > 0 &&
      finalPrices.length === positionsInfo.length &&
      Object.keys(tokenDecimals).length > 0
    ) {
      const combinedData = positionsInfo.map((position, index) => {
        return {
          id: position.id,
          tickUpper: position.tickUpper,
          tickLower: position.tickLower,
          currentPrice: finalPrices[index],
          token0decimal: tokenDecimals[index].token0,
          token1decimal: tokenDecimals[index].token1,
          liquidity: position.liquidity,
          token0address: position.token0,
          token1address: position.token1,
        };
      });
      setFinalPositionInfo(combinedData);
    }
  }, [positionsInfo, finalPrices, tokenDecimals]);

  useEffect(() => {
    const getPositions = async (address) => {
      const fetchedPositions = await fetchPositions(address);
      setPositionsInfo(fetchedPositions); // Assuming fetchedPositions is an array of position objects.
    };

    if (walletAddress) {
      getPositions(walletAddress);
    }
  }, [walletAddress]);

  useEffect(() => {
    const getDecimals = async (positions) => {
      let decimalsArray = []; // Array to store decimals info for each position

      for (const position of positions) {
        const token0decimal = await getTokenDecimals(position.token0);
        const token1decimal = await getTokenDecimals(position.token1);
        decimalsArray.push({
          token0: token0decimal,
          token1: token1decimal,
        });
      }
      setTokenDecimals(decimalsArray); // Set the array to state
    };

    if (positionsInfo.length > 0) {
      getDecimals(positionsInfo);
    }
  }, [positionsInfo]);

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

  //  GET VALUE ______________________________________________________________________
  useEffect(() => {
    const readAllPositionInfos = async () => {
      // This array will collect promises from calling readPositionInfo on each id
      const readPromises = finalPositionInfo.map((position) =>
        readPositionInfo(position.id)
      );

      try {
        // Wait for all readPositionInfo calls to finish
        const results = await Promise.all(readPromises);

        // Assuming you want to store the results in the contractData state
        // You might want to structure the data differently depending on your needs
        setContractData(
          results.map((result, index) => ({
            ...finalPositionInfo[index],
            details: {
              amount0: result.amount0,
              amount1: result.amount1,
              poolAdd: result.poolAdd,
            }, // or just 'result' if it's already a string
          }))
        );
      } catch (error) {
        console.error("Error fetching position details:", error);
      }
    };

    if (finalPositionInfo.length > 0) {
      readAllPositionInfos();
    }
  }, [finalPositionInfo]); // Depend on finalPositionInfo

  useEffect(() => {
    const twap = async () => {
      console.log(contractData, "Contract Data Before Mapping");

      // Make sure contractData is not empty and has the expected structure
      if (contractData && contractData.length > 0 && contractData[0].details) {
        const readPromises = contractData.map((position) => {
          // Make sure poolAdd exists before calling readTwapInfo
          if (position.details && position.details.poolAdd) {
            return readTwapInfo(position.details.poolAdd);
          } else {
            console.error("poolAdd not found in position details");
            return Promise.resolve(null); // Resolve to null if poolAdd is not found
          }
        });

        try {
          const results = await Promise.all(readPromises);
          const updatedContractData = results.map((result, index) => ({
            ...contractData[index],
            gPrice: result,
          }));

          setFinalContractInfo(updatedContractData);
          console.log(finalContractInfo, "Updated Contract Data");
        } catch (error) {
          console.error("Error fetching position details:", error);
        }
      } else {
        console.log("Contract Data is not ready or not structured as expected");
      }
    };

    if (finalPositionInfo.length > 0) {
      twap();
    }
  }, [contractData]);

  useEffect(() => {
    const getFinalPrice = async () => {
      // This array will collect promises from calling readPositionInfo on each id
      const readPromises = finalContractInfo.map((position) =>
        getFPrice(
          position.token0address,
          position.token1address,
          position.gPrice,
          position.details.amount0,
          position.details.amount1
        )
      );

      try {
        // Wait for all readPositionInfo calls to finish
        const results = await Promise.all(readPromises);

        // Assuming you want to store the results in the contractData state
        // You might want to structure the data differently depending on your needs
        setPositionInfoWithPrice(
          results.map((result, index) => ({
            ...finalContractInfo[index],
            finalValue: result, // or just 'result' if it's already a string
          }))
        );
        console.log(positionInfoWithPrice, "FINALLLLLLLLLLLLLLLLL");
      } catch (error) {
        console.error("Error fetching position details:", error);
      }
    };

    if (finalPositionInfo.length > 0) {
      getFinalPrice();
    }
  }, [finalContractInfo]); // Depend on finalPositionInfo

  //TEMP
  const shouldRenderAdditionalPapers = true;
  const [selectedPosition, setSelectedPosition] = useState();
  function handleViewDetails(position) {
    setSelectedPosition(position);
  }

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  function getReadableValue(value) {
    const formattedValue = ethers.utils.formatUnits(value, 18);
    // Assuming formattedValue is a string representing a number, e.g., "123.456789"
    let num = parseFloat(formattedValue);
    let roundedValue = num.toFixed(2); // This will be a string "123.46"

    // If you need to work with it as a number again
    let roundedNumber = parseFloat(roundedValue);

    return roundedNumber;
  }

  return (
    <Box>
      <ModalComponent
        selectedPosition={selectedPosition}
        open={open}
        handleClose={handleClose}
      />{" "}
      {/* First row with 1st Paper component */}
      <Box display="flex" justifyContent="space-between">
        <Paper
          sx={{
            padding: "30px",
            borderRadius: "30px",
            background: "#363958",
            color: "white",
          }}
        >
          <Typography variant="h6">Eligible Positions</Typography>
          {positionInfoWithPrice.length > 0 ? (
            <Box>
              {/* Map through finalPositions to render each position */}
              {finalPositionInfo.map((position, index) => (
                <Paper
                  key={index}
                  sx={{
                    bgcolor: "#14233D",
                    padding: "15px",
                    borderRadius: "20px",
                    color: "white",
                    marginTop: "10px",
                    marginBottom: "10px",
                    display: "flex", // Enables flexbox for this container
                    alignItems: "center", // Centers the items vertically
                    justifyContent: "space-between", // Puts maximum space between Typography and Button
                  }}
                >
                  <Box flex={1} pr={3}>
                    {" "}
                    {/* Box to wrap Typography for correct alignment and spacing */}
                    <Typography>
                      {address_mapping[position.token0address]}/
                      {address_mapping[position.token1address]}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      zIndex: "1000",
                      borderRadius: "30px",
                      cursor: "pointer", // Ensure the cursor is a pointer on hover
                      "&:hover": {
                        backgroundColor: "secondary.white", // Change the color on hover for better user feedback
                      },
                    }}
                    onClick={() => {
                      handleViewDetails(positionInfoWithPrice[index]); // Replace with your actual handler
                    }}
                  >
                    View Details
                  </Button>
                </Paper>
              ))}
            </Box>
          ) : (
            <CircularProgress sx={{ marginTop: "20px" }} color="inherit" />
          )}
        </Paper>
        {selectedPosition && (
          <Paper
            elevation={3}
            sx={{
              width: "500px",
              padding: "30px",
              borderRadius: "30px",
              background: "#363958",
              color: "white",
              marginLeft: "30px",
            }}
          >
            <Typography
              variant="h6"
              component="h2"
              sx={{ marginBottom: "20px" }}
            >
              Position Details
            </Typography>
            <Box
              sx={{
                bgcolor: "#14233D",
                padding: "15px",
                borderRadius: "20px",
                color: "white",
                marginTop: "10px",
                marginBottom: "10px",
              }}
            >
              <Typography sx={{ marginBottom: "10px" }}>Position ID</Typography>
              <Typography>
                <span
                  style={{
                    backgroundColor: "#363958",
                    color: "white",
                    padding: "5px",
                    borderRadius: "8px",
                  }}
                >
                  {selectedPosition.id}
                </span>{" "}
                {/* This adds a space between the spans */}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: "#14233D",
                padding: "15px",
                borderRadius: "20px",
                color: "white",
                marginTop: "10px",
                marginBottom: "10px",
              }}
            >
              <Typography sx={{ marginBottom: "10px" }}>Value</Typography>
              <Typography>
                <span
                  style={{
                    backgroundColor: "#363958",
                    color: "white",
                    padding: "7px",
                    borderRadius: "8px",
                  }}
                >
                  ${getReadableValue(selectedPosition.finalValue)}
                </span>{" "}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: "#14233D",
                padding: "15px",
                borderRadius: "20px",
                color: "white",
                marginTop: "10px",
                marginBottom: "10px",
              }}
            >
              <Typography sx={{ marginBottom: "10px" }}>
                Tick Information
              </Typography>
              <Typography>
                <span
                  style={{
                    backgroundColor: "green",
                    color: "white",
                    padding: "5px",
                    borderRadius: "8px",
                  }}
                >
                  {selectedPosition.tickUpper}
                </span>{" "}
                {/* This adds a space between the spans */}
                <span
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    padding: "5px",
                    borderRadius: "8px",
                  }}
                >
                  {selectedPosition.tickLower}
                </span>
              </Typography>
            </Box>
            {/* Button after the 3rd row */}
            <Button
              variant="contained"
              sx={{
                width: "100%",
                zIndex: "9999",
                borderRadius: "30px",
                marginTop: "20px",
              }}
              onClick={handleOpen}
            >
              Borrow GHO
            </Button>
          </Paper>
        )}
      </Box>
      {/* Second row with 3rd Paper component centered */}
      {shouldRenderAdditionalPapers && (
        <Box display="flex" justifyContent="center" marginTop={2}>
          <Paper> {/* Third Paper component content here */} </Paper>
        </Box>
      )}
    </Box>
  );
}
