import React, { useEffect, useState } from "react";
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
import { format } from "date-fns";
import { LeaveRequestTypeLabels } from "../../types/leave-request-enums";
import { User } from "../../types/users";

interface LeaveRequestDetailPageProps {
  id?: string;
}

const LeaveRequestDetailPage: React.FC<LeaveRequestDetailPageProps> = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    selectedRequest,
    loading: leaveLoading,
    error: leaveError,
    fetchLeaveRequestByGuid,
    getAttachmentDownloadUrl,
    clearSelectedRequest,
  } = useLeaveRequests();

  const {
    selectedUser,
    loading: userLoading,
    error: userError,
    fetchUserByGuid,
    clearSelectedUser,
  } = useUsers();

  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    // Get the GUID from URL params or localStorage
    const guid = id || localStorage.getItem("selectedLeaveRequestGuid");

    if (guid) {
      fetchLeaveRequestByGuid(guid);
    }

    // Clean up when component unmounts
    return () => {
      clearSelectedRequest();
      clearSelectedUser();
      localStorage.removeItem("selectedLeaveRequestGuid");
    };
  }, [id]);

  // Fetch user data once we have the leave request
  useEffect(() => {
    if (selectedRequest?.userId) {
      fetchUserByGuid(selectedRequest.userId);
    }
  }, [selectedRequest?.userId]);

  // Update local user data state when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      setUserData(selectedUser);
    }
  }, [selectedUser]);

  const handleBack = () => {
    navigate("/leave-request");
  };

  const handleDownloadAttachment = () => {
    if (selectedRequest?.attachmentId) {
      window.open(
        getAttachmentDownloadUrl(selectedRequest.attachmentId),
        "_blank"
      );
    }
  };

  // Show loading state
  const loading = leaveLoading || userLoading;
  if (loading) {
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

  // Show error state
  const error = leaveError || userError;
  if (error) {
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

  // Show not found state
  if (!selectedRequest) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Alert severity="warning">Leave request not found</Alert>
      </Box>
    );
  }

  // Format dates
  const formattedStartDate = format(
    new Date(selectedRequest.startDate),
    "dd/MM/yyyy"
  );
  const formattedEndDate = format(
    new Date(selectedRequest.endDate),
    "dd/MM/yyyy"
  );

  // Get user information from either the userData or the selectedRequest
  const userName = userData?.fullName || selectedRequest.userName || "User";
  const userEmail = userData?.email || "";
  const userNip = userData?.nip || selectedRequest.userId || "";
  const userDepartment =
    userData?.department || selectedRequest.departmentName || "Department";
  const userPosition = userData?.position || "";

  // Get avatar initial
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

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
          Detail Pengajuan
        </Typography>
      </Box>

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
              bgcolor: "#fff",
              py: 3,
              position: "relative",
            }}
          >
            <Avatar
              src={userData?.profileImage}
              alt="Profile"
              sx={{
                width: 80,
                height: 80,
                bgcolor: "#ff5722",
                border: "3px solid #ff5722",
              }}
            >
              <Typography sx={{ color: "#fff", fontWeight: "bold" }}>
                {getInitial(userName)}
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
              {userName}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
              {userNip}
            </Typography>
            {userEmail && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                {userEmail}
              </Typography>
            )}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.5, textAlign: "center" }}
            >
              {userDepartment}
            </Typography>
            {userPosition && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, textAlign: "center" }}
              >
                {userPosition}
              </Typography>
            )}

            <Divider sx={{ width: "100%", my: 1 }} />

            {/* Request Type */}
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

            {/* Date Range */}
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

            {/* Reason */}
            <Box sx={{ width: "100%", px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                Keterangan
              </Typography>
              <Typography variant="body1">{selectedRequest.reason}</Typography>
            </Box>

            <Divider sx={{ width: "100%", my: 1 }} />

            {/* Review Status */}
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
                    cursor: "pointer",
                  }}
                  onClick={handleDownloadAttachment}
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
                    {selectedRequest.attachment.originalName}
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

export default LeaveRequestDetailPage;
