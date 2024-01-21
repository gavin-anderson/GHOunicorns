// ModalComponent.jsx
import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";
import zIndex from "@mui/material/styles/zIndex";
import { ethers } from "ethers";

const ModalComponent = ({ selectedPosition, open, handleClose }) => {
  const [amount, setAmount] = useState(1);
  const [positionDetails, setPositionDetails] = useState();
  // console.log(selectedPosition, "SHHHHHHHHH");

  useEffect(() => {
    if (selectedPosition) {
      setPositionDetails(selectedPosition);
    }
  }, [selectedPosition]);

  console.log(selectedPosition, "MODALLLLLLLL");

  const handleSubmit = (event) => {
    // console.log(amount); // Handle submit action here

    handleClose(); // Close the modal after submit
  };

  function handleChange(event) {
    setAmount(event.target.value);
  }

  function getReadableValue(value) {
    const formattedValue = ethers.utils.formatUnits(value, 18);
    // Assuming formattedValue is a string representing a number, e.g., "123.456789"
    let num = parseFloat(formattedValue);
    let roundedValue = num.toFixed(2); // This will be a string "123.46"

    // If you need to work with it as a number again
    let roundedNumber = parseFloat(roundedValue);

    return (roundedNumber * 0.75) / amount;
  }

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    zIndex: "9999",
    background: "#363958",
    color: "white",
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography id="modal-title" variant="h6" component="h2">
          Borrow GHO
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end", // Aligns the child elements (TextField and Typography) to the right
          }}
        >
          <TextField
            autoFocus
            margin="dense"
            onChange={handleChange}
            id="amount"
            label="Enter Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "white",
                  borderRadius: "20px",
                },
                "&:hover fieldset": {
                  borderColor: "white",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white",
                },
              },
              "& .MuiInputLabel-root": {
                color: "white",
              },
              "& .MuiOutlinedInput-input": {
                color: "white",
              },
            }}
          />
          {positionDetails && getReadableValue(positionDetails.finalValue) < 1 && (
            <Typography
              sx={{
                mt: 1, // Margin top for spacing
                color: "#f24b5c", // Adjust color as needed
                fontSize: "0.8rem", // Adjust font size as needed
              }}
            >
              Health Factor: {getReadableValue(positionDetails.finalValue)}
            </Typography>
          )}
          {positionDetails && getReadableValue(positionDetails.finalValue) > 1 && (
            <Typography
              sx={{
                mt: 1, // Margin top for spacing
                color: "green", // Adjust color as needed
                fontSize: "0.8rem", // Adjust font size as needed
              }}
            >
              Health Factor: {getReadableValue(positionDetails.finalValue)}
            </Typography>
          )}
        </Box>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{ mt: 2, borderRadius: "30px" }}
        >
          Submit Amount
        </Button>
      </Box>
    </Modal>
  );
};

export default ModalComponent;
