// src/pages/correction/PersetujuanKoreksiDetailPage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Button,
  IconButton,
  Divider,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import { useCorrections } from "../../contexts/CorrectionsContext";
import { useUsers } from "../../contexts/UserContext";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  CORRECTION_TYPE_LABELS,
  CorrectionType,
  CorrectionStatus,
} from "../../types/corrections";

const PersetujuanKoreksiDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { guid } = useParams<{ guid: string }>();
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {
    selectedCorrection,
    loading: correctionLoading,
    error: correctionError,
    fetchCorrectionById,
    reviewCorrection,
    clearSelectedCorrection,
  } = useCorrections();

  const {
    selectedUser,
    loading: userLoading,
    error: userError,
    fetchUserByGuid,
  } = useUsers();

  // Combined loading state
  const isLoading = correctionLoading || userLoading || processing;

  // Combined error state
  const fetchError = correctionError || userError;

  useEffect(() => {
    // Load data when component mounts
    if (guid) {
      loadData();
    }

    // Clear selected correction when component unmounts
    return () => {
      clearSelectedCorrection();
    };
  }, [guid]);

  // Load correction and user data
  const loadData = async () => {
    if (!guid) {
      navigate("/persetujuan-koreksi");
      return;
    }

    try {
      // First fetch the correction
      const correction = await fetchCorrectionById(guid);

      // Then fetch the associated user if userId exists
      if (correction && correction.userId) {
        await fetchUserByGuid(correction.userId);
      }
    } catch (err: any) {
      console.error("Failed to load correction details:", err);
    }
  };

  // Get user data for the correction
  const getUserData = () => {
    if (!selectedUser) {
      return {
        name: "Unknown",
        nip: "Unknown",
        position: "Unknown",
        department: "Unknown",
      };
    }
    return {
      name: selectedUser.fullName || "Unknown",
      nip: selectedUser.nip || "Unknown",
      position: selectedUser.position || "Unknown",
      department: selectedUser.department || "Unknown",
    };
  };

  const handleBack = () => {
    navigate("/persetujuan-koreksi");
  };

  const handleReject = async () => {
    if (!guid) return;

    setProcessing(true);
    setError(null);

    try {
      await reviewCorrection(guid, {
        status: CorrectionStatus.REJECTED,
      });
      navigate("/kajur-dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to reject correction");
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!guid) return;

    setProcessing(true);
    setError(null);

    try {
      await reviewCorrection(guid, {
        status: CorrectionStatus.APPROVED,
      });
      navigate("/kajur-dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to approve correction");
    } finally {
      setProcessing(false);
    }
  };

  // Format date
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "N/A";
    return format(new Date(date), "dd MMMM yyyy", { locale: id });
  };

  // Get the formatted correction type label
  const getCorrectionTypeLabel = (type: string): string => {
    if (type in CorrectionType) {
      return CORRECTION_TYPE_LABELS[type as CorrectionType] || type;
    }
    return type || "Tipe tidak tersedia";
  };

  // Get user info
  const userData = getUserData();

  // Get first letter for avatar
  const userInitial =
    userData.name !== "Unknown" ? userData.name.charAt(0).toUpperCase() : "U";

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", width: "100%", pb: 7 }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: "#0073e6" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBack}
            disabled={isLoading}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, textAlign: "center", mr: 4 }}
          >
            Koreksi
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ mt: 2 }}>
        {(fetchError || error) && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {fetchError || error}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : !selectedCorrection ? (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography>Koreksi tidak ditemukan</Typography>
          </Paper>
        ) : (
          <>
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
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {userData.nip}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
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
                    {formatDate(selectedCorrection.createdAt)}
                  </Typography>
                </Box>

                <Divider sx={{ width: "100%", my: 1 }} />

                {/* Correction Type */}
                <Box sx={{ width: "100%", px: 2, py: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                    Jenis Koreksi
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {getCorrectionTypeLabel(selectedCorrection.type)}
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
                    {selectedCorrection.reason ||
                      "Tidak ada alasan yang diberikan"}
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
                disabled={isLoading}
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
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Setuju"}
              </Button>
            </Box>
          </>
        )}
      </Container>

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default PersetujuanKoreksiDetailPage;
