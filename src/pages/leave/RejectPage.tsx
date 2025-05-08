// src/pages/leave/RejectPage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useLocation } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import { useLeaveRequests } from "../../contexts/LeaveRequestsContext";
import { LeaveRequestStatus } from "../../types/leave-requests";

// Helper function to get URL parameters
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const RejectApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const requestId = query.get("id");

  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {
    selectedRequest,
    loading,
    error: fetchError,
    fetchLeaveRequestByGuid,
    reviewLeaveRequest,
  } = useLeaveRequests();

  useEffect(() => {
    // Fetch the leave request data when component mounts
    if (requestId) {
      fetchLeaveRequestByGuid(requestId);
    }
  }, [requestId]);

  const handleBack = () => {
    // Navigate back to the previous page
    navigate(-1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requestId) {
      setError("Request ID not found");
      return;
    }

    if (!reason.trim()) {
      setError("Alasan penolakan harus diisi");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await reviewLeaveRequest(requestId, {
        status: LeaveRequestStatus.REJECTED,
        comments: reason,
      });

      // Navigate back to dashboard on success
      navigate("/kajur-dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to reject request");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Combine loading states
  const isLoading = loading || isSubmitting;

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", pb: 7 }}>
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
            Alasan Penolakan
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container maxWidth="sm" sx={{ mt: 2 }}>
        {(fetchError || error) && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {fetchError || error}
          </Alert>
        )}

        {isLoading && !fetchError ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : !selectedRequest && !isSubmitting ? (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography>Pengajuan tidak ditemukan</Typography>
          </Paper>
        ) : (
          <form onSubmit={handleSubmit}>
            <Paper
              elevation={1}
              sx={{
                p: 3,
                borderRadius: 2,
              }}
            >
              <Typography variant="body1" sx={{ mb: 3, fontWeight: "medium" }}>
                Mohon berikan alasan mengapa pengajuan ini ditolak:
              </Typography>

              <TextField
                multiline
                rows={6}
                fullWidth
                placeholder="Tulis alasan penolakan di sini..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                sx={{ mb: 3 }}
                required
                disabled={isSubmitting}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: "#f44336",
                  "&:hover": { bgcolor: "#d32f2f" },
                  py: 1.5,
                  borderRadius: 1,
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Memproses..." : "Kirim Penolakan"}
              </Button>
            </Paper>
          </form>
        )}
      </Container>

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default RejectApplicationForm;
