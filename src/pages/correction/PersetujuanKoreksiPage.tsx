// src/pages/correction/PersetujuanKoreksiPage.tsx
import React, { useEffect } from "react";
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
import { useUsers } from "../../contexts/UserContext";
import {
  Correction,
  CORRECTION_TYPE_LABELS,
  CorrectionType,
} from "../../types/corrections";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { User } from "../../types/users";

const PersetujuanKoreksiPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    pendingCorrections,
    loading: correctionsLoading,
    error: correctionsError,
    fetchPendingCorrections,
    clearError: clearCorrectionsError,
  } = useCorrections();

  const {
    users,
    loading: usersLoading,
    error: usersError,
    fetchUsers,
    clearError: clearUsersError,
  } = useUsers();

  const loading = correctionsLoading || usersLoading;
  const error = correctionsError || usersError;

  // Format dates for display in Indonesian
  const formatDate = (date: string | Date) => {
    return format(
      typeof date === "string" ? new Date(date) : date,
      "dd MMMM yyyy",
      { locale: id }
    );
  };

  useEffect(() => {
    // Fetch users when component mounts
    fetchUsers();
    fetchPendingCorrections();
  }, []);

  const handleBack = () => {
    navigate("/kajur-dashboard");
  };

  const handleDetail = (guid: string) => {
    navigate(`/persetujuan-koreksi-detail/${guid}`);
  };

  // Function to get user by ID
  const getUserById = (userId: string): User | undefined => {
    return users.find((user) => user.guid === userId);
  };

  // Function to get user data with default fallbacks
  const getUserData = (userId: string) => {
    const user = getUserById(userId);
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

  // Get initial for avatar
  const getInitial = (name: string) => {
    return name && name !== "Unknown" ? name.charAt(0).toUpperCase() : "U";
  };

  // Get the formatted correction type label
  const getCorrectionTypeLabel = (type: string): string => {
    if (type in CorrectionType) {
      return CORRECTION_TYPE_LABELS[type as CorrectionType] || type;
    }
    return type || "Tipe tidak tersedia";
  };

  // Clear errors from both contexts
  const handleClearError = () => {
    clearCorrectionsError();
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
            Persetujuan Koreksi
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container maxWidth="sm" sx={{ mt: 2 }}>
        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={handleClearError}>
            {error}
          </Alert>
        )}

        {/* Loading indicator */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4, overflow: "hidden" }}>
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
            {pendingCorrections.map((correction: Correction) => {
              // Get user data from users array
              const userData = getUserData(correction.userId);

              return (
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
                        {getInitial(userData.name)}
                      </Avatar>
                      <Box sx={{ ml: 2 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "medium" }}
                        >
                          {userData.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {userData.nip}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getCorrectionTypeLabel(correction.type)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(correction.createdAt)}
                        </Typography>
                      </Box>
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

export default PersetujuanKoreksiPage;
