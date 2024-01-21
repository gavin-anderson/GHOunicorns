// ModalComponent.jsx
import React, { useState } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";
import zIndex from "@mui/material/styles/zIndex";

const ModalComponent = ({ selectedPosition, open, handleClose }) => {
  const [amount, setAmount] = useState("");
  // console.log(selectedPosition, "SHHHHHHHHH");

  const handleSubmit = () => {
    // console.log(amount); // Handle submit action here
    handleClose(); // Close the modal after submit
  };

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
        <TextField
          sx={{ color: "white" }}
          autoFocus
          margin="dense"
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
              // Changes the label color
              color: "white",
            },
            "& .MuiOutlinedInput-input": {
              // Changes the input text color
              color: "white",
            },
          }}
        />
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
