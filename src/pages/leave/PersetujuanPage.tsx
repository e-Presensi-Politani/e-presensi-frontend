// src/pages/leave/PersetujuanPage.tsx
import React, { useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  IconButton,
  Chip,
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
import { useLeaveRequests } from "../../contexts/LeaveRequestsContext";
import { useUsers } from "../../contexts/UserContext"; // Import UserContext
import { LeaveRequest, LeaveRequestType } from "../../types/leave-requests";
import { format } from "date-fns";

const PersetujuanPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    pendingRequests,
    loading: leaveLoading,
    error: leaveError,
    fetchPendingRequests,
    clearError: clearLeaveError,
  } = useLeaveRequests();
  const {
    users,
    loading: usersLoading,
    error: usersError,
    fetchUsers,
    clearError: clearUsersError,
  } = useUsers(); // Use UserContext

  // Track the loading state for both data sources
  const loading = leaveLoading || usersLoading;
  // Combine error messages from both contexts
  const error = leaveError || usersError;

  // Format dates for display
  const formatDate = (date: Date) => {
    return format(new Date(date), "dd MMMM yyyy");
  };

  useEffect(() => {
    // Fetch both pending requests and users when component mounts
    fetchPendingRequests();
    fetchUsers();
  }, []);

  const handleBack = () => {
    navigate("/kajur-dashboard");
  };

  const handleDetail = (guid: string) => {
    navigate(`/persetujuan-detail/${guid}`);
  };

  // Function to get user name by ID
  const getUserName = (userId: string) => {
    const user = users.find((user) => user.guid === userId);
    return user ? user.fullName : "Nama tidak tersedia";
  };

  // Function to get user name by ID
  const getUserNIP = (userId: string) => {
    const user = users.find((user) => user.guid === userId);
    return user ? user.nip : "NIP tidak tersedia";
  };

  // Get status color based on leave request type
  const getStatusColor = (type: LeaveRequestType) => {
    switch (type) {
      case LeaveRequestType.LEAVE:
        return "#0073e6"; // Blue for Cuti
      case LeaveRequestType.WFH:
        return "#4CAF50"; // Green for Work From Home
      case LeaveRequestType.DL:
        return "#F44336"; // Red for Dinas Luar
      case LeaveRequestType.WFA:
        return "#FFC107"; // Yellow/Amber for Work From Anywhere
      default:
        return "#0073e6"; // Default blue
    }
  };

  // Convert LeaveRequestType to display text
  const getTypeLabel = (type: LeaveRequestType) => {
    switch (type) {
      case LeaveRequestType.LEAVE:
        return "Cuti";
      case LeaveRequestType.WFH:
        return "WFH";
      case LeaveRequestType.DL:
        return "DL";
      case LeaveRequestType.WFA:
        return "WFA";
      default:
        return type;
    }
  };

  // Get initial for avatar
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  // Clear errors from both contexts
  const handleClearError = () => {
    clearLeaveError();
    clearUsersError();
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
            Persetujuan
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container maxWidth="sm" sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" onClose={handleClearError} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : pendingRequests.length === 0 ? (
          <Paper
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 2,
              textAlign: "center",
            }}
          >
            <Typography variant="body1">
              Tidak ada permohonan yang perlu disetujui saat ini.
            </Typography>
          </Paper>
        ) : (
          <List sx={{ p: 0 }}>
            {pendingRequests.map((request: LeaveRequest) => {
              // Get user name from users array
              const userName = getUserName(request.userId);
              const nip = getUserNIP(request.userId);

              return (
                <Paper
                  onClick={() => handleDetail(request.guid)}
                  key={request.guid}
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
                      alignItems: "center",
                      justifyContent: "space-between",
                      py: 1.5,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: "#ff7043",
                        }}
                      >
                        {getInitial(userName)}
                      </Avatar>
                      <Box sx={{ ml: 2 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "medium" }}
                        >
                          {userName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {nip}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(request.startDate)} -{" "}
                          {formatDate(request.endDate)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "fix", alignItems: "right", ml: -5 }}>
                      <Chip
                        label={getTypeLabel(request.type)}
                        sx={{
                          bgcolor: getStatusColor(request.type),
                          borderRadius: 2,
                          color: "white",
                          fontWeight: "bold",
                          minWidth: 60,
                          mb: 4,
                          mr: "-2px",
                        }}
                      />
                    </Box>
                  </ListItem>
                </Paper>
              );
            })}
          </List>
        )}
      </Container>

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default PersetujuanPage;
