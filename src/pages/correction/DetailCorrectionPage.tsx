import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  IconButton,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";

interface CorrectionDetailProps {
  fullName: string;
  id: string;
  department: string;
  date: string;
  permissionType: string;
  status: string;
  reason: string;
}

const CorrectionDetailPage: React.FC<CorrectionDetailProps> = ({
  fullName = "M. Ghozi Syah Putra",
  id = "21254323029",
  department = "Rekayasa Pertanian dan Komputer",
  date = "10/01/2025",
  permissionType = "Penggunaan Jam Istirahat sebagai Jam Kerja",
  status = "Terlambat",
  reason = "Ban motor bocor",
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/status-koreksi"); // Go back to previous page
  };

  // Get first letter for avatar
  const userInitial = fullName ? fullName.charAt(0).toUpperCase() : "U";

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", width: "100%", pb: 7 }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#1976d2",
          height: "5vh",
          p: 2,
          color: "white",
          display: "flex",
          alignItems: "center",
        }}
      >
        <IconButton color="inherit" onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, textAlign: "center", mr: 4 }}
        >
          Koreksi
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 2 }}>
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
          {/* Profile Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "#fff",
              py: 3,
              position: "relative",
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "#ff5722",
                border: "3px solid #ff5722",
              }}
            >
              <Typography variant="h4" sx={{ color: "#fff" }}>
                {userInitial}
              </Typography>
            </Avatar>
          </Box>

          {/* User Details */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
              {fullName}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
              {id}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, textAlign: "center" }}
            >
              {department}
            </Typography>

            <Divider sx={{ width: "100%", my: 1 }} />

            {/* Date Section */}
            <Box sx={{ width: "100%", px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                Tanggal Pengajuan
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {date}
              </Typography>
            </Box>

            <Divider sx={{ width: "100%", my: 1 }} />

            {/* Permission Type */}
            <Box sx={{ width: "100%", px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                Izin
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {permissionType}
              </Typography>
            </Box>

            <Divider sx={{ width: "100%", my: 1 }} />

            {/* Status */}
            <Box sx={{ width: "100%", px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                Status
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: "bold",
                  color: status === "Terlambat" ? "error.main" : "success.main",
                }}
              >
                {status}
              </Typography>
            </Box>

            <Divider sx={{ width: "100%", my: 1 }} />

            {/* Reason */}
            <Box sx={{ width: "100%", px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                Alasan
              </Typography>
              <Typography variant="body1">{reason}</Typography>
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default CorrectionDetailPage;
