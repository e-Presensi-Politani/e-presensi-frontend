import React from "react";
import { Box, Container, Typography, Paper, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

const AttendanceDetailAbsent: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    // Navigate back to the history page
    navigate("/history");
  };

  return (
    <Box
      sx={{
        bgcolor: "#f5f5f5",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#E5323E",
          p: 2,
          color: "white",
          display: "flex",
          alignItems: "center",
        }}
      >
        <IconButton color="inherit" onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Detail Presensi</Typography>
      </Box>

      {/* Attendance Status Card */}
      <Container maxWidth="sm" sx={{ mt: 2 }}>
        <Paper
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "#E5323E",
            color: "white",
          }}
        >
          <Box
            sx={{
              p: 3,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                border: "2px solid white",
                borderRadius: 1,
                p: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: 48,
                height: 48,
                mr: 3,
              }}
            >
              <CloseIcon sx={{ fontSize: 30 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Tidak Hadir
              </Typography>
              <Typography variant="body2">Selasa, 02 Januari 2025</Typography>
              <Typography variant="body2">--:--</Typography>
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* You can add more details here if needed */}

      {/* Bottom Navigation */}
      <Box sx={{ flexGrow: 1 }} />
      <BottomNav />
    </Box>
  );
};

export default AttendanceDetailAbsent;
