import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Button,
  IconButton,
  Divider,
  Grid,
  AppBar,
  Toolbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

interface CutiDetailProps {
  id?: string;
}

const CutiDetailPage: React.FC<CutiDetailProps> = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleReject = () => {
    // Handle reject logic
    console.log("Request rejected");
    navigate("/reject-pengajuan");
  };

  const handleApprove = () => {
    // Handle approve logic
    console.log("Request approved");
    navigate("/kajur-dashboard");
  };

  // Sample data for the detail page
  const cutiDetail = {
    name: "M. Ghozi Syah Putra",
    employeeId: "2125432302",
    department: "Rekayasa Pertanian dan Komputer",
    startDate: "10/01/2025",
    endDate: "12/01/2025",
    description: "-",
    attachmentFile: "surat_pengajuan_cuti.pdf",
  };

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", width: "100vw", pb: 7 }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: "#0073e6" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, textAlign: "center", mr: 4 }}
          >
            Cuti
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ mt: 2 }}>
        <Paper
          elevation={1}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {/* Profile Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "#ff5722",
              py: 3,
              position: "relative",
            }}
          >
            <Avatar
              src="/path-to-avatar.jpg"
              alt="Profile"
              sx={{
                width: 80,
                height: 80,
                bgcolor: "#fff",
                border: "3px solid #fff",
              }}
            >
              <Typography sx={{ color: "#555", fontWeight: "bold" }}>
                M
              </Typography>
            </Avatar>
          </Box>

          {/* User Info */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
              {cutiDetail.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
              {cutiDetail.employeeId}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, textAlign: "center" }}
            >
              {cutiDetail.department}
            </Typography>

            <Divider sx={{ width: "100%", my: 1 }} />

            {/* Date Range */}
            <Grid
              container
              sx={{
                width: "100%",
                px: 2,
                py: 1,
                justifyContent: "space-between",
              }}
            >
              <Grid>
                <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                  Mulai
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {cutiDetail.startDate}
                </Typography>
              </Grid>
              <Grid sx={{ textAlign: "right" }}>
                <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                  Selesai
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {cutiDetail.endDate}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ width: "100%", my: 1 }} />

            {/* Description */}
            <Box sx={{ width: "100%", px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                Keterangan
              </Typography>
              <Typography variant="body1">{cutiDetail.description}</Typography>
            </Box>

            <Divider sx={{ width: "100%", my: 1 }} />

            {/* Attachment */}
            <Box
              sx={{
                width: "100%",
                px: 2,
                py: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "#0073e6",
                  mr: 1.5,
                }}
              >
                <InsertDriveFileIcon fontSize="small" />
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                {cutiDetail.attachmentFile}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 2,
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            fullWidth
            sx={{
              bgcolor: "#f44336",
              "&:hover": { bgcolor: "#d32f2f" },
              py: 1.5,
              borderRadius: 1,
            }}
            onClick={handleReject}
          >
            Tolak
          </Button>
          <Button
            variant="contained"
            fullWidth
            sx={{
              bgcolor: "#4caf50",
              "&:hover": { bgcolor: "#388e3c" },
              py: 1.5,
              borderRadius: 1,
            }}
            onClick={handleApprove}
          >
            Setuju
          </Button>
        </Box>
      </Container>

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default CutiDetailPage;
