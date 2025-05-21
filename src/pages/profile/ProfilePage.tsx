// src/pages/profile/ProfilePage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  Container,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Badge,
  IconButton,
  Tooltip,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import { useAuth } from "../../contexts/AuthContext";
import { useUsers } from "../../contexts/UserContext";
import { useStatistics } from "../../contexts/StatisticsContext";
import { ReportPeriod } from "../../types/statistics";
import ReportGenerator from "../../components/ReportGenerator";
import UsersService from "../../services/UsersService";
import FileService from "../../services/FileService";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user: authUser } = useAuth();
  const {
    fetchUserByGuid,
    selectedUser,
    loading: loadingUser,
    error: userError,
    clearError: clearUserError,
  } = useUsers();
  const {
    statistics,
    loading: loadingStatistics,
    error: statisticsError,
    fetchMyStatistics,
    clearError: clearStatisticsError,
  } = useStatistics();

  // State for profile photo
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // File input reference
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Calculate stats based on actual statistics data
  const getStatsData = () => {
    if (!statistics) {
      return {
        totalKehadiran: "N/A",
        rataJamKerja: "N/A",
        izinLupaAbsen: 0,
        presentaseKehadiran: 0,
      };
    }

    // Count remote, dl (dinas luar), and cuti as present
    const presentDays = statistics.present || 0;
    const remoteDays = statistics.remoteWorking || 0;
    const dlDays = statistics.officialTravel || 0;
    const cutiDays = statistics.onLeave || 0;

    // Total days that count as "present" now includes remote, dl, and cuti
    const effectivePresentDays = presentDays + remoteDays + dlDays + cutiDays;

    // Total days is unchanged
    const totalDays = statistics.totalDays || 0;

    // Format the attendance fraction
    const totalAttendance = `${effectivePresentDays}/${totalDays} hari`;

    // Calculate average work hours
    const averageWorkHours = statistics.averageWorkHours
      ? `${statistics.averageWorkHours.toFixed(1)} Jam`
      : "N/A";

    // Only count "absent" as missed absences (not cuti, remote, or dl)
    const missedOrPermit = statistics.absent || 0;

    // Calculate attendance percentage with our new definition of "present"
    const attendancePercentage =
      totalDays > 0 ? Math.round((effectivePresentDays / totalDays) * 100) : 0;

    return {
      totalKehadiran: totalAttendance,
      rataJamKerja: averageWorkHours,
      izinLupaAbsen: missedOrPermit,
      presentaseKehadiran: attendancePercentage,
    };
  };

  // Load profile photo
  const loadProfilePhoto = async () => {
    try {
      if (selectedUser?.guid) {
        if (selectedUser.profileImage) {
          // If the user already has a profile image GUID, get its URL
          const photoUrl = FileService.getFileViewUrl(
            selectedUser.profileImage
          );
          setPhotoURL(photoUrl);
        } else if (selectedUser.guid) {
          // Otherwise check if there's a profile photo available for this user
          const url = await FileService.getProfilePhotoUrl(selectedUser.guid);
          setPhotoURL(url);
        }
      }
    } catch (error) {
      console.error("Error loading profile photo:", error);
      setPhotoError("Failed to load profile photo");
    }
  };

  // Fetch user details and statistics when component mounts
  useEffect(() => {
    if (authUser?.guid) {
      fetchUserByGuid(authUser.guid);
    }

    // Fetch statistics for the current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    fetchMyStatistics({
      startDate: firstDayOfMonth.toISOString().split("T")[0],
      endDate: lastDayOfMonth.toISOString().split("T")[0],
      period: ReportPeriod.MONTHLY,
    });

    // Clear any errors when component unmounts
    return () => {
      clearUserError();
      clearStatisticsError();
    };
  }, [authUser?.guid]);

  // Load profile photo when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      loadProfilePhoto();
    }
  }, [selectedUser]);

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Handle clicking the photo upload button
  const handlePhotoButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Handle photo file selection
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // Reset error state
    setPhotoError(null);

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setPhotoError("Only JPG, JPEG, PNG, and WEBP files are allowed.");
      return;
    }

    // Validate file size (1MB limit)
    if (file.size > 1024 * 1024) {
      setPhotoError("File size must be less than 1MB.");
      return;
    }

    try {
      setUploadingPhoto(true);

      // Upload the photo
      const response = await UsersService.uploadProfilePhoto(file);

      if (response) {
        // Refresh user data to get updated profile image
        if (authUser?.guid) {
          await fetchUserByGuid(authUser.guid);
        }

        // Update the photo URL
        if (response.guid) {
          const url = FileService.getFileViewUrl(response.guid);
          setPhotoURL(url);
        }
      }
    } catch (error: any) {
      console.error("Error uploading profile photo:", error);
      setPhotoError(error.message || "Failed to upload profile photo");
    } finally {
      setUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle removing profile photo
  const handleRemovePhoto = async () => {
    try {
      setUploadingPhoto(true);
      await UsersService.removeProfilePhoto();

      // Refresh user data
      if (authUser?.guid) {
        await fetchUserByGuid(authUser.guid);
      }

      // Clear photo URL
      setPhotoURL(null);
    } catch (error) {
      console.error("Error removing profile photo:", error);
      setPhotoError("Failed to remove profile photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Get real statistics data
  const statsData = getStatsData();

  const loading = loadingUser || loadingStatistics;
  const error = userError || statisticsError;

  const clearError = () => {
    clearUserError();
    clearStatisticsError();
    setPhotoError(null);
  };

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

  return (
    <Box
      sx={{
        bgcolor: "#f5f5f5",
        minHeight: "100vh",
        overflow: "hidden",
        width: "100%",
        pb: 8,
      }}
    >
      {/* Header */}
      <Box
        sx={{ bgcolor: "#1976D2", p: 2, color: "white", textAlign: "center" }}
      >
        <Typography variant="h6">Profile</Typography>
      </Box>

      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Error Alert */}
        {(error || photoError) && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }} onClose={clearError}>
            {error || photoError}
          </Alert>
        )}

        {/* Avatar with Badge for photo upload */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
            mt: 3,
          }}
        >
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              <Tooltip title="Change profile photo">
                <IconButton
                  onClick={handlePhotoButtonClick}
                  disabled={uploadingPhoto}
                  sx={{
                    bgcolor: "#1976D2",
                    color: "white",
                    "&:hover": { bgcolor: "#1565C0" },
                  }}
                  size="small"
                >
                  <PhotoCameraIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            }
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: "#ff6347",
                border: "4px solid white",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              }}
              alt={selectedUser?.fullName || "User"}
              src={photoURL || undefined}
            >
              {selectedUser?.fullName?.charAt(0) || "U"}
            </Avatar>
          </Badge>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoChange}
            style={{ display: "none" }}
            accept="image/jpeg,image/png,image/jpg,image/webp"
          />

          {/* Profile photo actions */}
          <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
            {photoURL && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={handleRemovePhoto}
                disabled={uploadingPhoto}
                sx={{ textTransform: "none", fontSize: "0.75rem" }}
              >
                Remove Photo
              </Button>
            )}
            {uploadingPhoto && <CircularProgress size={24} sx={{ ml: 1 }} />}
          </Box>
        </Box>

        {/* Info */}
        <Paper
          elevation={1}
          sx={{ borderRadius: 2, overflow: "hidden", mb: 2 }}
        >
          <List disablePadding>
            {[
              { label: "Nama", value: selectedUser?.fullName || "N/A" },
              { label: "NIP", value: selectedUser?.nip || "N/A" },
              { label: "Email", value: selectedUser?.email || "N/A" },
              { label: "Jurusan", value: selectedUser?.department || "N/A" },
              { label: "Jabatan", value: selectedUser?.position || "N/A" },
            ].map((item, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={item.label}
                    secondary={item.value}
                    primaryTypographyProps={{
                      variant: "body2",
                      color: "text.secondary",
                    }}
                    secondaryTypographyProps={{
                      variant: "body1",
                      fontWeight: "medium",
                    }}
                  />
                </ListItem>
                {index < 4 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>

        {/* Stats */}
        <Grid
          container
          spacing={1}
          sx={{ mb: 2, justifyContent: "center", alignItems: "center" }}
        >
          <Grid>
            <Card
              sx={{
                bgcolor: "#4CAF50",
                color: "white",
                height: "12vh",
                width: { xs: "44vw", sm: "40vw" },
                pb: { xs: 0, sm: 1 },
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }} noWrap>
                  Total Kehadiran
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {statsData.totalKehadiran}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid>
            <Card
              sx={{
                bgcolor: "#FFC107",
                color: "white",
                height: "12vh",
                width: { xs: "44vw", sm: "40vw" },
                pb: { sm: 1 },
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }} noWrap>
                  Rata-rata Jam Kerja
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {statsData.rataJamKerja}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid>
            <Card
              sx={{
                bgcolor: "#F44336",
                color: "white",
                height: "12vh",
                width: { xs: "44vw", sm: "40vw" },
                pb: { sm: 1 },
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }} noWrap>
                  Tidak Hadir
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {statsData.izinLupaAbsen}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid>
            <Card
              sx={{
                bgcolor: "#00BCD4",
                color: "white",
                height: "12vh",
                width: { xs: "44vw", sm: "40vw" },
                pb: { sm: 1 },
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                  noWrap
                >
                  Persentase Kehadiran
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {statsData.presentaseKehadiran}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Report Generator Button */}
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <ReportGenerator />
        </Box>

        {/* Edit Profile Button */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<EditIcon />}
            onClick={() => navigate("/edit-profile")}
            sx={{
              width: "100%",
              py: 1.5,
              textTransform: "none",
              borderRadius: 1,
              boxShadow: 2,
            }}
          >
            Edit Profile
          </Button>
        </Box>

        {/* Change Password Button */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<LockIcon />}
            endIcon={<KeyboardArrowRightIcon />}
            onClick={handleChangePassword}
            sx={{
              width: "100%",
              py: 1.5,
              textTransform: "none",
              borderRadius: 1,
              boxShadow: 2,
            }}
          >
            Ganti Password
          </Button>
        </Box>

        {/* Logout Button */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              width: "100%",
              bgcolor: "#F44336",
              py: 1.5,
              textTransform: "none",
              borderRadius: 1,
              boxShadow: 2,
            }}
          >
            Logout
          </Button>
        </Box>
      </Container>

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default ProfilePage;
