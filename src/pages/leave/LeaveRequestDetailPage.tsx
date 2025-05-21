// LeaveRequestDetailPage.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  IconButton,
  Divider,
  Grid,
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
import { LeaveRequestTypeLabels } from "../../types/leave-request-enums";
import FileService from "../../services/FileService";
import defaultProfileImage from "../../assets/default-pp.png";

const LeaveRequestDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [downloadingFile, setDownloadingFile] = useState<boolean>(false); // Add state for download indication
  const [downloadError, setDownloadError] = useState<string | null>(null); // Add state for download errors

  // Add state for profile photo
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const {
    selectedRequest,
    loading: leaveLoading,
    error: leaveError,
    fetchLeaveRequestByGuid,
    clearSelectedRequest,
  } = useLeaveRequests();

  const {
    selectedUser,
    loading: userLoading,
    error: userError,
    fetchUserByGuid,
    clearSelectedUser,
  } = useUsers();

  // Use the FileContext hook for file operations
  const { downloadFile } = useFiles();

  // Use refs to track whether we've already initiated fetches
  const requestFetchedRef = useRef<boolean>(false);
  const userFetchedRef = useRef<boolean>(false);

  // For tracking current request ID to prevent duplicate fetches
  const currentRequestIdRef = useRef<string | null>(null);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (id && id !== currentRequestIdRef.current) {
      // Update our ref to mark that we're fetching this request
      currentRequestIdRef.current = id;

      // Only fetch if we don't have the data or it's for a different request
      if (!selectedRequest || selectedRequest.guid !== id) {
        requestFetchedRef.current = true;
        fetchLeaveRequestByGuid(id);
      }
    }

    // Cleanup function
    return () => {
      // We only want to clear data if we're navigating away
      // In case of StrictMode double-mounting, this will be called immediately
      // so we don't want to clear data in that case
      setTimeout(() => {
        // If the component is truly unmounted, the current ID won't match
        if (currentRequestIdRef.current !== id) {
          clearSelectedRequest();
          clearSelectedUser();
          requestFetchedRef.current = false;
          userFetchedRef.current = false;
        }
      }, 0); // Schedule this check for the next event loop
    };
  }, [id]);

  // Modified useEffect for fetching user data - remove console.logs
  useEffect(() => {
    if (
      selectedRequest?.userId &&
      selectedRequest.userId !== currentUserIdRef.current
    ) {
      // Update our ref to track the current user ID
      currentUserIdRef.current = selectedRequest.userId;

      // Only fetch if we don't have this user or we have a different user
      if (!selectedUser || selectedUser.guid !== selectedRequest.userId) {
        userFetchedRef.current = true;
        fetchUserByGuid(selectedRequest.userId);
      }
    }
  }, [selectedRequest?.userId]);

  // Load profile photo when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      loadProfilePhoto();
    }
  }, [selectedUser]);

  // Load profile photo function
  const loadProfilePhoto = async () => {
    try {
      if (!selectedUser?.guid) return;

      // Reset photo error if any
      setPhotoError(null);

      // First try to use the profileImage field if it exists
      if (selectedUser.profileImage) {
        const photoUrl = FileService.getFileViewUrl(selectedUser.profileImage);

        // Add timestamp to prevent caching issues
        const urlWithTimestamp = `${photoUrl}?t=${new Date().getTime()}`;
        setPhotoURL(urlWithTimestamp);
        return;
      }

      // Otherwise check if there's a profile photo available for this user
      const url = await FileService.getProfilePhotoUrl(selectedUser.guid);
      if (url) {
        // Add timestamp to prevent caching issues
        const urlWithTimestamp = `${url}?t=${new Date().getTime()}`;
        setPhotoURL(urlWithTimestamp);
      } else {
        setPhotoURL(null);
      }
    } catch (error) {
      console.error("Error loading profile photo:", error);
      setPhotoError("Gagal memuat foto profil");
    }
  };

  const handleBack = () => {
    navigate("/leave-request");
  };

  // Update the attachment download handler to use FileContext
  const handleDownloadAttachment = async () => {
    if (selectedRequest?.attachmentId) {
      setDownloadingFile(true);
      setDownloadError(null);

      try {
        // Use the FileContext's downloadFile method that handles auth
        await downloadFile(
          selectedRequest.attachmentId,
          selectedRequest.attachment?.originalName
        );
      } catch (error: any) {
        console.error("Error downloading attachment:", error);
        setDownloadError(error.message || "Failed to download attachment");
      } finally {
        setDownloadingFile(false);
      }
    }
  };

  const loading = leaveLoading || userLoading || downloadingFile;
  const error = leaveError || userError || downloadError || photoError;

  if (loading && !downloadingFile) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !downloadingFile) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!id || !selectedRequest) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        {/* <Alert severity="warning">Leave request not found or invalid ID</Alert> */}
      </Box>
    );
  }

  const formattedStartDate = format(
    new Date(selectedRequest.startDate),
    "dd/MM/yyyy"
  );
  const formattedEndDate = format(
    new Date(selectedRequest.endDate),
    "dd/MM/yyyy"
  );

  const userFullName =
    selectedUser?.fullName || selectedRequest.userName || "User";
  const userPosition = selectedUser?.position || "Position not available";
  const userNip = selectedUser?.nip || "NIP not available";
  const userDepartment =
    selectedUser?.department || selectedRequest.departmentName || "Department";

  // Get first letter for avatar if no photo is available
  const userInitial = userFullName ? userFullName.charAt(0) : "U";

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", width: "100%", pb: 7 }}>
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
          Detail Pengajuan
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 2 }}>
        {downloadError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setDownloadError(null)}
          >
            {downloadError}
          </Alert>
        )}

        {photoError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setPhotoError(null)}
          >
            {photoError}
          </Alert>
        )}

        <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
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
            {/* Updated Avatar to use photoURL or default image */}
            <Avatar
              key={photoURL || "default-image"}
              src={photoURL || defaultProfileImage}
              alt={userFullName}
              sx={{
                width: 80,
                height: 80,
                border: "3px solid #ff",
              }}
              imgProps={{
                // Add error handling in case image fails to load
                onError: (e) => {
                  console.log("Error loading image, falling back to initials");
                  const imgElement = e.target as HTMLImageElement;
                  imgElement.src = ""; // Clear the src to show the fallback
                },
              }}
            >
              {/* Only show initial if no image is loaded */}
              {!photoURL && (
                <Typography sx={{ color: "#fff", fontWeight: "bold" }}>
                  {userInitial}
                </Typography>
              )}
            </Avatar>
          </Box>

          <Box
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
              {userFullName}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
              {userNip}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {userPosition}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, textAlign: "center" }}
            >
              {userDepartment}
            </Typography>

            <Divider sx={{ width: "100%", my: 1 }} />

            <Box sx={{ width: "100%", px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                Jenis Pengajuan
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {LeaveRequestTypeLabels[selectedRequest.type] ||
                  selectedRequest.type}
              </Typography>
            </Box>

            <Divider sx={{ width: "100%", my: 1 }} />

            <Grid
              container
              sx={{
                width: "100%",
                py: 1,
                justifyContent: "space-between",
              }}
            >
              <Grid>
                <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                  Mulai
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {formattedStartDate}
                </Typography>
              </Grid>
              <Grid sx={{ textAlign: "right" }}>
                <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                  Selesai
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {formattedEndDate}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ width: "100%", my: 1 }} />

            <Box sx={{ width: "100%", px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                Keterangan
              </Typography>
              <Typography variant="body1">{selectedRequest.reason}</Typography>
            </Box>

            <Divider sx={{ width: "100%", my: 1 }} />

            <Box sx={{ width: "100%", px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                Status
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: "bold",
                  color:
                    selectedRequest.status === "APPROVED"
                      ? "success.main"
                      : selectedRequest.status === "REJECTED"
                      ? "error.main"
                      : "warning.main",
                }}
              >
                {selectedRequest.status === "APPROVED"
                  ? "Disetujui"
                  : selectedRequest.status === "REJECTED"
                  ? "Ditolak"
                  : "Menunggu Persetujuan"}
              </Typography>
            </Box>

            {selectedRequest.comments && (
              <>
                <Divider sx={{ width: "100%", my: 1 }} />
                <Box sx={{ width: "100%", px: 2, py: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                    Catatan Reviewer
                  </Typography>
                  <Typography variant="body1">
                    {selectedRequest.comments}
                  </Typography>
                </Box>
              </>
            )}

            {selectedRequest.attachment && (
              <>
                <Divider sx={{ width: "100%", my: 1 }} />
                <Box
                  sx={{
                    width: "100%",
                    px: 2,
                    py: 1,
                    display: "flex",
                    alignItems: "center",
                    cursor: downloadingFile ? "default" : "pointer",
                  }}
                  onClick={
                    downloadingFile ? undefined : handleDownloadAttachment
                  }
                >
                  <Avatar
                    sx={{ width: 36, height: 36, bgcolor: "#0073e6", mr: 1.5 }}
                  >
                    <InsertDriveFileIcon fontSize="small" />
                  </Avatar>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "medium",
                      display: "flex",
                      alignItems: "center",
                      "&:hover": {
                        textDecoration: downloadingFile ? "none" : "underline",
                      },
                    }}
                  >
                    {downloadingFile ? (
                      <>
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                        Downloading...
                      </>
                    ) : (
                      selectedRequest.attachment.originalName
                    )}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </Container>

      <BottomNav />
    </Box>
  );
};

export default LeaveRequestDetailPage;
