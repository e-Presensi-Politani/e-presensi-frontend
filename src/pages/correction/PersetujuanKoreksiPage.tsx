// src/pages/correction/PersetujuanKoreksiPage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  IconButton,
  List,
  ListItem,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import { useCorrections } from "../../contexts/CorrectionsContext";
import { useAuth } from "../../contexts/AuthContext";
import { Correction } from "../../types/corrections";

const PersetujuanKoreksiPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    pendingCorrections,
    loading,
    error,
    fetchPendingCorrections,
    clearError,
  } = useCorrections();
  const { user } = useAuth();
  const [departmentId, setDepartmentId] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    // Set the department ID from the user's department if available
    if (user && user.departmentId) {
      setDepartmentId(user.departmentId);
    }
  }, [user]);

  useEffect(() => {
    // Fetch pending corrections when component mounts or when departmentId changes
    if (departmentId) {
      fetchPendingCorrections(departmentId);
    }
  }, [departmentId, fetchPendingCorrections]);

  const handleBack = () => {
    navigate("/kajur-dashboard"); // Navigate back to the dashboard
  };

  const handleDetail = (guid: string) => {
    navigate(`/persetujuan-koreksi-detail/${guid}`); // Navigate to detail page
  };

  // Get initial for avatar
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  // Get correction type label
  const getCorrectionTypeLabel = (type: string) => {
    switch (type) {
      case "LATE":
        return "Terlambat";
      case "MISSING_HOURS":
        return "Jam Kerja Kurang";
      case "ABSENT":
        return "Tidak Hadir";
      default:
        return type;
    }
  };

  return (
    <Box sx={{ bgcolor: "#f5f5f5", width: "100%", minHeight: "100vh", pb: 7 }}>
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
            Persetujuan Koreksi
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container maxWidth="sm" sx={{ mt: 2 }}>
        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Loading indicator */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : pendingCorrections.length === 0 ? (
          <Paper
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 2,
              textAlign: "center",
            }}
          >
            <Typography variant="body1">
              Tidak ada koreksi yang perlu disetujui saat ini.
            </Typography>
          </Paper>
        ) : (
          <List sx={{ p: 0 }}>
            {pendingCorrections.map((correction: Correction) => (
              <Paper
                onClick={() => handleDetail(correction.guid)}
                key={correction.guid}
                elevation={1}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                <ListItem
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    py: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: "#ff7043",
                      }}
                    >
                      {getInitial(correction.user?.name || "")}
                    </Avatar>
                    <Box sx={{ ml: 2 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "medium" }}
                      >
                        {correction.user?.name || "Unknown User"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {correction.user?.nip || correction.userId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getCorrectionTypeLabel(correction.type)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(correction.createdAt).toLocaleDateString(
                          "id-ID"
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </Container>

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default PersetujuanKoreksiPage;
