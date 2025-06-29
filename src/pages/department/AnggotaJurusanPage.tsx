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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BottomNav from "../../components/BottomNav";
import DepartmentReportGenerator from "../../components/DepartmentReportGenerator";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../contexts/UserContext";
import { useAuth } from "../../contexts/AuthContext";
import { User } from "../../types/users";

const AnggotaJurusanPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { fetchUsersByDepartment, loading, error, clearError } = useUsers();

  const [departmentMembers, setDepartmentMembers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  useEffect(() => {
    // Clear any previous errors when component mounts
    clearError();

    // Fetch users by department if current user has a department
    if (currentUser?.department) {
      const fetchMembers = async () => {
        try {
          const results = await fetchUsersByDepartment(currentUser.department!);
          // Filter out the current user from the list to show only other department members
          const filteredMembers = results.filter(
            (user) => user.guid !== currentUser.guid
          );
          setDepartmentMembers(filteredMembers);
        } catch (err) {
          console.error("Error fetching department members:", err);
          setDepartmentMembers([]);
        }
      };

      fetchMembers();
    }
  }, []);

  const handleBack = () => {
    navigate("/kajur-dashboard");
  };

  const handleAnggotaClick = (user: User) => {
    // Check if current user is kajur (department head)
    if (
      currentUser?.role?.toLowerCase().includes("kajur") ||
      currentUser?.role?.toLowerCase().includes("kepala") ||
      currentUser?.role?.toLowerCase().includes("head")
    ) {
      // Open report generation dialog for the selected user
      setSelectedUser(user);
      setReportDialogOpen(true);
    } else {
      // For non-kajur users, just show user info or navigate to user detail
      console.log("Clicked member:", user.guid);
      // You can navigate to a user detail page if needed
      // navigate(`/user/${user.guid}`);
    }
  };

  const handleCloseReportDialog = () => {
    setReportDialogOpen(false);
    setSelectedUser(null);
  };

  const handleGenerateReportFromDialog = () => {
    setReportDialogOpen(false);
    // The DepartmentReportGenerator will handle the report generation
  };

  // Get initial for avatar
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  // Check if current user is kajur
  const isKajur =
    currentUser?.role?.toLowerCase().includes("kajur") ||
    currentUser?.role?.toLowerCase().includes("kepala") ||
    currentUser?.role?.toLowerCase().includes("head");

  return (
    <Box sx={{ bgcolor: "#f5f5f5", width: "100%", minHeight: "100vh", pb: 7 }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: "#4285f4" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, textAlign: "center", mr: 4 }}
          >
            Anggota Jurusan
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container maxWidth="sm" sx={{ mt: 2 }}>
        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Department Report Generator - Only for Kajur */}
        {isKajur && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Generate Laporan Jurusan
            </Typography>
            <DepartmentReportGenerator />
          </Box>
        )}

        {/* Loading State */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 4,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Department Info */}
            {currentUser?.department && (
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 2,
                  fontWeight: 500,
                  color: "#666",
                  textAlign: "center",
                }}
              >
                {currentUser.department}
              </Typography>
            )}

            {/* Members List */}
            <List sx={{ p: 0 }}>
              {departmentMembers.length === 0 ? (
                <Paper
                  elevation={1}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 2,
                  }}
                >
                  <Typography color="text.secondary">
                    Tidak ada anggota jurusan lain yang ditemukan
                  </Typography>
                </Paper>
              ) : (
                departmentMembers.map((anggota) => (
                  <Paper
                    onClick={() => handleAnggotaClick(anggota)}
                    key={anggota.guid}
                    elevation={1}
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      overflow: "hidden",
                      cursor: "pointer",
                      position: "relative",
                      "&:hover": {
                        bgcolor: "#f8f9fa",
                      },
                    }}
                  >
                    <ListItem
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        py: 2,
                        px: 2,
                      }}
                    >
                      <Avatar
                        src={anggota.profileImageUrl || undefined}
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: "#ff7043",
                          mr: 2,
                        }}
                      >
                        {getInitial(anggota.fullName)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 500,
                            color: "#333",
                            mb: 0.5,
                          }}
                        >
                          {anggota.fullName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "0.875rem" }}
                        >
                          {anggota.nip}
                        </Typography>
                        {anggota.role && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#666",
                              fontSize: "0.75rem",
                              display: "block",
                            }}
                          >
                            {anggota.role}
                          </Typography>
                        )}
                      </Box>

                      {/* Report Icon - Only visible for Kajur */}
                      {isKajur && (
                        <IconButton
                          sx={{
                            bgcolor: "#e3f2fd",
                            color: "#1976d2",
                            "&:hover": {
                              bgcolor: "#bbdefb",
                            },
                          }}
                          size="small"
                        >
                          <AssessmentIcon fontSize="small" />
                        </IconButton>
                      )}
                    </ListItem>
                  </Paper>
                ))
              )}
            </List>
          </>
        )}
      </Container>

      {/* Report Generation Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={handleCloseReportDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#1976d2", color: "white" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <AssessmentIcon />
            <Box>
              <Typography variant="h6">Generate Laporan</Typography>
              {selectedUser && (
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedUser.fullName}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Anda akan membuat laporan kehadiran untuk:
          </Typography>

          {selectedUser && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Avatar
                src={selectedUser.profileImageUrl || undefined}
                sx={{ width: 48, height: 48, bgcolor: "#ff7043" }}
              >
                {getInitial(selectedUser.fullName)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {selectedUser.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedUser.nip}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedUser.role}
                </Typography>
              </Box>
            </Box>
          )}

          <Alert severity="info" sx={{ mt: 2 }}>
            Klik "Lanjutkan" untuk membuka form generate laporan
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseReportDialog} variant="outlined">
            Batal
          </Button>
          <Button
            onClick={handleGenerateReportFromDialog}
            variant="contained"
            startIcon={<AssessmentIcon />}
          >
            Lanjutkan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Individual Report Generator - Rendered when user is selected */}
      {selectedUser && !reportDialogOpen && (
        <Box
          sx={{
            position: "fixed",
            bottom: 80,
            left: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <DepartmentReportGenerator
            selectedUser={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        </Box>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default AnggotaJurusanPage;
