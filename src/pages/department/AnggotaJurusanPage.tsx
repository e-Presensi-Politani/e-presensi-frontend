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
import BottomNav from "../../components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../contexts/UserContext";
import { useAuth } from "../../contexts/AuthContext";
import { User } from "../../types/users";

const AnggotaJurusanPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { fetchUsersByDepartment, loading, error, clearError } = useUsers();

  const [departmentMembers, setDepartmentMembers] = useState<User[]>([]);

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

  const handleAnggotaClick = (userGuid: string) => {
    // Navigate to user detail page or handle member click
    console.log("Clicked member:", userGuid);
    // You can navigate to a user detail page if needed
    // navigate(`/user/${userGuid}`);
  };

  // Get initial for avatar
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

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
                    onClick={() => handleAnggotaClick(anggota.guid)}
                    key={anggota.guid}
                    elevation={1}
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      overflow: "hidden",
                      cursor: "pointer",
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
                    </ListItem>
                  </Paper>
                ))
              )}
            </List>
          </>
        )}
      </Container>

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default AnggotaJurusanPage;
