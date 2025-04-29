import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  AppBar,
  Toolbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WarningIcon from "@mui/icons-material/Warning";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";

const RejectApplicationForm = () => {
  const [reason, setReason] = useState("");
    const navigate = useNavigate();
  
    const handleBack = () => {
      navigate("/cuti-detail");
    };

  const handleSubmit = () => {
    console.log("Rejection reason:", reason);
    // Add form submission logic here
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f5f5f5",
      }}
    >
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: "#e53935" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, textAlign: "center", mr: 4 }}
          >
            Tolak Pengajuan
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box sx={{ p: 2, flex: 1 }}>
        <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: "#000" }}>
          Alasan Penolakan Pengajuan
        </Typography>

        <Paper
          elevation={1}
          sx={{
            p: 2,
            borderRadius: 2,
            mb: 2,
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <WarningIcon color="error" sx={{ mr: 1, mt: 1 }} />
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Masukan Alasan Penolakan..."
            variant="standard"
            InputProps={{ disableUnderline: true }}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Paper>

        <Button
          variant="contained"
          fullWidth
          sx={{
            bgcolor: "#e53935",
            color: "white",
            py: 1.5,
            borderRadius: 8,
            textTransform: "none",
            fontSize: "16px",
            "&:hover": {
              bgcolor: "#c62828",
            },
          }}
          onClick={handleSubmit}
        >
          Tolak
        </Button>
      </Box>

      {/* Bottom Navigation */}
     <BottomNav />
    </Box>
  );
};

export default RejectApplicationForm;
