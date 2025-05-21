// Updated ProfilePage.tsx
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
import FileService from "../../services/FileService";
import defaultProfileImage from "../../assets/default-pp.png";
import ReportGenerator from "../../components/ReportGenerator";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user: authUser } = useAuth();
  const {
    fetchUserByGuid,
    selectedUser,
    loading: loadingUser,
    error: userError,
    clearError: clearUserError,
    removeUserProfilePhoto,
    uploadProfilePhoto,
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
      if (!selectedUser?.guid) return;

      // Reset photo error if any
      setPhotoError(null);

      // First try to use the profileImage field if it exists
      if (selectedUser.profileImage) {
        const photoUrl = FileService.getFileViewUrl(selectedUser.profileImage);
        console.log("Using profile image GUID:", selectedUser.profileImage);
        console.log("Profile photo URL:", photoUrl);

        // Add timestamp to prevent caching issues
        const urlWithTimestamp = `${photoUrl}?t=${new Date().getTime()}`;
        setPhotoURL(urlWithTimestamp);
        return;
      }

      // Otherwise check if there's a profile photo available for this user
      const url = await FileService.getProfilePhotoUrl(selectedUser.guid);
      if (url) {
        console.log("Retrieved profile photo URL:", url);

        // Add timestamp to prevent caching issues
        const urlWithTimestamp = `${url}?t=${new Date().getTime()}`;
        setPhotoURL(urlWithTimestamp);
      } else {
        console.log("No profile photo available for user");
        setPhotoURL(null);
      }
    } catch (error) {
      console.error("Error loading profile photo:", error);
      setPhotoError("Gagal memuat foto profil");
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

  // Handle photo file selection - UPDATED to use UserContext
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // Reset error state
    setPhotoError(null);

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setPhotoError("Hanya file JPG, JPEG, PNG, dan WEBP yang diperbolehkan.");
      return;
    }

    // Validate file size (1MB limit)
    if (file.size > 1024 * 1024) {
      setPhotoError("Ukuran file harus kurang dari 1MB.");
      return;
    }

    try {
      setUploadingPhoto(true);

      // Use the uploadProfilePhoto function from UserContext
      await uploadProfilePhoto(file);
      console.log("Profile photo uploaded successfully");

      // Refresh user data to get updated profile image
      if (authUser?.guid) {
        await fetchUserByGuid(authUser.guid);
      }
    } catch (error: any) {
      console.error("Error uploading profile photo:", error);
      setPhotoError(error.message || "Gagal mengunggah foto profil");
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
    if (!authUser?.guid) return;

    try {
      setUploadingPhoto(true);
      setPhotoError(null);

      // Use removeProfilePhoto from UserContext
      await removeUserProfilePhoto(authUser.guid);
      console.log("Profile photo removed successfully");

      // Clear the photo URL to update UI immediately
      setPhotoURL(null);

      // Refresh user data to ensure we have the latest profile state
      if (authUser.guid) {
        await fetchUserByGuid(authUser.guid);
      }
    } catch (error: any) {
      console.error("Error removing profile photo:", error);
      setPhotoError(error.message || "Gagal menghapus foto profil");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Get real statistics data
  const statsData = getStatsData();

  const loading = loadingUser || loadingStatistics;
  const error = userError || statisticsError || photoError;

  const clearError = () => {
    clearUserError();
    clearStatisticsError();
    setPhotoError(null);
  };

  if (loading && !uploadingPhoto) {
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
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }} onClose={clearError}>
            {error}
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
            {/* Add key to force re-render when photoURL changes */}
            <Avatar
              key={photoURL || "default-image"}
              sx={{
                width: 100,
                height: 100,
                // bgcolor: "#ff6347",
                border: "4px solid white",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              }}
              alt={selectedUser?.fullName || "User"}
              src={photoURL || defaultProfileImage}
              imgProps={{
                // Add error handling in case image fails to load
                onError: (e) => {
                  console.log("Error loading image, using default");
                  const imgElement = e.target as HTMLImageElement;
                  imgElement.src = defaultProfileImage;
                },
              }}
            />
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
