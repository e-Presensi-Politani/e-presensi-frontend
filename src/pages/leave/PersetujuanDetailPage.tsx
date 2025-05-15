// src/pages/leave/PersetujuanDetailPage.tsx
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
  Grid,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useNavigate, useParams } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import { useLeaveRequests } from "../../contexts/LeaveRequestsContext";
import { useUsers } from "../../contexts/UserContext";
import { useFiles } from "../../contexts/FileContext"; // Import useFiles hook
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  LeaveRequestType,
  LeaveRequestStatus,
} from "../../types/leave-requests";

const PersetujuanDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { guid } = useParams<{ guid: string }>();
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<boolean>(false);

  const {
    selectedRequest,
    loading,
    error: fetchError,
    fetchLeaveRequestByGuid,
    reviewLeaveRequest,
    clearSelectedRequest,
  } = useLeaveRequests();

  const { users, fetchUsers } = useUsers();

  // Use FileContext for file-related operations
  const { downloadFile } = useFiles();

  // Get user data for the request
  const getUserData = (userId?: string) => {
    if (!userId) return { name: "Unknown", nip: "Unknown" };
    const user = users.find((u) => u.guid === userId);
    return {
      name: user?.fullName || "Unknown",
      nip: user?.nip || "Unknown",
      department: user?.department || "Unknown",
    };
  };

  useEffect(() => {
    // Fetch the leave request data when component mounts
    if (guid) {
      fetchLeaveRequestByGuid(guid);
      fetchUsers();
    }

    // Clear selected request when component unmounts
    return () => {
      clearSelectedRequest();
    };
  }, [guid]);

  const handleBack = () => {
    navigate("/persetujuan");
  };

  const handleReject = () => {
    // Navigate to rejection form with the request ID
    navigate(`/reject-pengajuan?id=${guid}`);
  };

  const handleApprove = async () => {
    if (!guid) return;

    setProcessing(true);
    setError(null);

    try {
      await reviewLeaveRequest(guid, {
        status: LeaveRequestStatus.APPROVED,
        comments: "Disetujui",
      });
      navigate("/kajur-dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to approve request");
    } finally {
      setProcessing(false);
    }
  };

  // Function to handle attachment download using FileContext
  const handleDownloadAttachment = async () => {
    if (selectedRequest?.attachmentId) {
      setDownloadingFile(true);
      try {
        // Use the new downloadFile method that handles auth
        await downloadFile(
          selectedRequest.attachmentId,
          selectedRequest.attachment?.originalName
        );
      } catch (err: any) {
        setError(err.message || "Failed to download file");
      } finally {
        setDownloadingFile(false);
      }
    }
  };

  // Format dates for display
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    return format(new Date(date), "dd MMMM yyyy", { locale: id });
  };

  // Get leave request type label
  const getTypeLabel = (type?: LeaveRequestType) => {
    if (!type) return "Unknown";
    switch (type) {
      case LeaveRequestType.LEAVE:
        return "Cuti";
      case LeaveRequestType.WFH:
        return "Work From Home";
      case LeaveRequestType.DL:
        return "Dinas Luar";
      case LeaveRequestType.WFA:
        return "Work From Anywhere";
      default:
        return type;
    }
  };

  // Get initial for avatar
  const getInitial = (name?: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  // Get user info from the request
  const userData = getUserData(selectedRequest?.userId);

  // Combine loading states
  const isLoading = loading || processing || downloadingFile;

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
            {getTypeLabel(selectedRequest?.type)}
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
        ) : !selectedRequest ? (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography>Pengajuan tidak ditemukan</Typography>
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
                  src={selectedRequest.userName ? undefined : undefined}
                  alt="Profile"
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "#ff5722",
                    border: "3px solid #ff5722",
                  }}
                >
                  <Typography sx={{ color: "#fff", fontWeight: "bold" }}>
                    {getInitial(userData.name)}
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
                  sx={{ mb: 2, textAlign: "center" }}
                >
                  {userData.department}
                </Typography>

                <Divider sx={{ width: "100%", my: 1 }} />

                {/* Date Range */}
                <Grid
                  container
                  sx={{
                    width: "100%",
                    justifyContent: "space-between",
                  }}
                >
                  <Grid>
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      Mulai
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {formatDate(selectedRequest.startDate)}
                    </Typography>
                  </Grid>
                  <Grid sx={{ textAlign: "right" }}>
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      Selesai
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {formatDate(selectedRequest.endDate)}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ width: "100%", my: 1 }} />

                {/* Type of leave request */}
                <Box sx={{ width: "100%", px: 2, py: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                    Jenis Pengajuan
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {getTypeLabel(selectedRequest.type)}
                  </Typography>
                </Box>

                <Divider sx={{ width: "100%", my: 1 }} />

                {/* Description */}
                <Box sx={{ width: "100%", px: 2, py: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                    Keterangan
                  </Typography>
                  <Typography variant="body1">
                    {selectedRequest.reason || "-"}
                  </Typography>
                </Box>

                <Divider sx={{ width: "100%", my: 1 }} />

                {/* Attachment - Updated to use FileContext */}
                {selectedRequest.attachmentId && (
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
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "medium",
                        cursor: downloadingFile ? "default" : "pointer",
                        "&:hover": {
                          textDecoration: downloadingFile
                            ? "none"
                            : "underline",
                        },
                        display: "flex",
                        alignItems: "center",
                      }}
                      onClick={
                        downloadingFile ? undefined : handleDownloadAttachment
                      }
                    >
                      {downloadingFile ? (
                        <>
                          <CircularProgress size={16} sx={{ mr: 1 }} />
                          Downloading...
                        </>
                      ) : (
                        selectedRequest.attachment?.originalName || "Attachment"
                      )}
                    </Typography>
                  </Box>
                )}
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

export default PersetujuanDetailPage;
