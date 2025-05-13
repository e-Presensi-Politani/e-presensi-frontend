// src/pages/correction/DetailCorrectionPage.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import { useUsers } from "../../contexts/UserContext";
import { useCorrections } from "../../contexts/CorrectionsContext";
import { format } from "date-fns";
import { User } from "../../types/users";

const CorrectionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { guid } = useParams<{ guid: string }>();
  const {
    selectedCorrection,
    loading: correctionLoading,
    error: correctionError,
  } = useCorrections();
  const { selectedUser, loading: userLoading, error: userError } = useUsers();
  const [isLoading, setIsLoading] = useState(true);

  // Get user data for the correction
  const getUserData = (user?: User | null) => {
    if (!user) {
      return {
        name: "Unknown",
        nip: "Unknown",
        position: "Unknown",
        department: "Unknown",
      };
    }
    return {
      name: user.fullName || "Unknown",
      nip: user.nip || "Unknown",
      position: user.position || "Unknown",
      department: user.department || "Unknown",
    };
  };

  // Using the context functions directly but NOT including them in useEffect dependencies
  const { fetchCorrectionById } = useCorrections();
  const { fetchUserByGuid } = useUsers();

  // Create a memoized loader function
  const loadData = useCallback(async () => {
    if (!guid) {
      navigate("/status-koreksi");
      return;
    }

    setIsLoading(true);
    try {
      // First fetch the correction
      const correction = await fetchCorrectionById(guid);

      // Then fetch the associated user if userId exists
      if (correction && correction.userId) {
        await fetchUserByGuid(correction.userId);
      }
    } catch (err) {
      console.error("Failed to load correction details:", err);
    } finally {
      setIsLoading(false);
    }
  }, [guid, navigate]); // Only depends on guid and navigate

  useEffect(() => {
    loadData();

    // Cleanup function to handle component unmount
    return () => {
      // You could clear the selected correction here if needed
    };
  }, [loadData]); // Only depend on the memoized function

  const handleBack = () => {
    navigate("/status-koreksi");
  };

  // Get user info from the fetched user
  const userData = getUserData(selectedUser);

  // Get first letter for avatar
  const userInitial =
    userData.name !== "Unknown" ? userData.name.charAt(0).toUpperCase() : "U";

  // Combined loading state
  const loading = isLoading || correctionLoading || userLoading;

  // Combined error state
  const error = correctionError || userError;

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!selectedCorrection) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Koreksi tidak ditemukan</Alert>
      </Box>
    );
  }

  // Format the date
  const formattedDate = selectedCorrection.createdAt
    ? format(new Date(selectedCorrection.createdAt), "dd/MM/yyyy")
    : "-";

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
              {userData.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
              {userData.nip}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {userData.position}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, textAlign: "center" }}
            >
              {userData.department}
            </Typography>

            <Divider sx={{ width: "100%", my: 1 }} />

            {/* Date Section */}
            <Box sx={{ width: "100%", px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                Tanggal Pengajuan
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {formattedDate}
              </Typography>
            </Box>

            <Divider sx={{ width: "100%", my: 1 }} />

            {/* Permission Type */}
            <Box sx={{ width: "100%", px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                Izin
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {selectedCorrection.type || "Tipe tidak tersedia"}
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
                  color:
                    selectedCorrection.status === "APPROVED"
                      ? "success.main"
                      : selectedCorrection.status === "REJECTED"
                      ? "error.main"
                      : "warning.main",
                }}
              >
                {selectedCorrection.status === "PENDING"
                  ? "Menunggu"
                  : selectedCorrection.status === "APPROVED"
                  ? "Disetujui"
                  : "Ditolak"}
              </Typography>
            </Box>

            <Divider sx={{ width: "100%", my: 1 }} />

            {/* Reason */}
            <Box sx={{ width: "100%", px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                Alasan
              </Typography>
              <Typography variant="body1">
                {selectedCorrection.description ||
                  "Tidak ada alasan yang diberikan"}
              </Typography>
            </Box>

            {/* Show reviewer notes if available */}
            {selectedCorrection.reviewNote && (
              <>
                <Divider sx={{ width: "100%", my: 1 }} />
                <Box sx={{ width: "100%", px: 2, py: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                    Catatan Reviewer
                  </Typography>
                  <Typography variant="body1">
                    {selectedCorrection.reviewNote}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default CorrectionDetailPage;
