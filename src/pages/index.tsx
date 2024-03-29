"use client";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Paper from "@mui/material/Paper";
import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
import NavBar from "../components/NavBar";
import { Button, Typography } from "@mui/material";
import ValidPositions from "../components/ValidPositions";
import { useAccount } from "wagmi";

const CustomTab = styled(Tab)({
  minWidth: 300, // adjust as needed

  width: "", // adjust as needed
  marginRight: 30, // adds space between tabs
  color: "white",

  "&:hover": {
    background:
      "linear-gradient(90deg, rgba(67,79,101,1) 0%, rgba(73,116,255,1) 84%, rgba(0,212,255,1) 100%)", // the color when hovering over a tab
    borderRadius: 50,
  },
  "&.Mui-selected": {
    background:
      "linear-gradient(90deg, rgba(67,79,101,1) 0%, rgba(73,116,255,1) 84%, rgba(0,212,255,1) 100%)", // the color when a tab is selected
    color: "white",
    borderRadius: 50,
  },
  "&.Mui-focusVisible": {
    background:
      "linear-gradient(90deg, rgba(67,79,101,1) 0%, rgba(73,116,255,1) 84%, rgba(0,212,255,1) 100%)", // the color when a tab is focused
    borderRadius: 50,
  },
});

const CustomTabs = styled(Tabs)({
  "& .MuiTabs-flexContainer": {
    backgroundColor: "#14233D",
    borderRadius: 50,
    padding: "20px",
  },
  "& .MuiTabs-indicator": {
    backgroundColor: "transparent",
  },
});

export default function HomePage() {
  const [value, setValue] = useState(0);
  const [walletAddress, setWalletAddress] = useState("");
  const { address, isConnecting, isDisconnected } = useAccount();

  useEffect(() => {
    setWalletAddress(address || "");
  }, [address]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <NavBar></NavBar>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          alignItems: "center",
          justifyContent: "flex-start",
          background:
            "radial-gradient(circle, #051937, #182342, #272e4d, #363958, #454464);",
          pt: "5vh", // 1/3rd from the top
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CustomTabs value={value} onChange={handleChange} variant="fullWidth">
            <CustomTab
              iconPosition="start"
              icon={<AddBoxIcon></AddBoxIcon>}
              label="Create"
            />
            ManageHistoryIcon
            <CustomTab
              iconPosition="start"
              icon={<ManageHistoryIcon></ManageHistoryIcon>}
              label="Manage"
            />
          </CustomTabs>
          <Paper
            sx={{
              mt: 2, // space between tabs and content
              mb: 2, // space at the bottom
              p: 3,
              borderRadius: "16px",
              bgcolor: "#14233D", // The solid background color
              color: "white",
              position: "relative",
              overflow: "hidden", // Ensures the pseudo-element doesn't overflow
              "&::after": {
                // Create the gradient overlay
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0))",
                borderRadius: "16px", // Ensure the overlay has the same border radius
              },
            }}
          >
            {value === 0 && (
              <div>
                {walletAddress !== "" ? (
                  <ValidPositions
                    walletAddress={walletAddress}
                  ></ValidPositions>
                ) : (
                  <div>
                    <Paper
                      sx={{
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "30px",
                        background: "#0e1a2e",
                        padding: "30px",
                        color: "white",
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                        Please connect your wallet.
                      </Typography>
                      <Typography variant="subtitle1" gutterBottom>
                        In order to see valid positions to borrow GHO against,
                        you must connect a wallet.
                      </Typography>
                    </Paper>
                  </div>
                )}
              </div>
            )}
            {value === 1 && <Box>Content for Manage</Box>}
          </Paper>
        </Box>
      </Box>
    </>
  );
}
