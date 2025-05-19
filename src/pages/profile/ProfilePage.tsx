import React, { useEffect } from "react";
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
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import { useAuth } from "../../contexts/AuthContext";
import { useUsers } from "../../contexts/UserContext";
import { useStatistics } from "../../contexts/StatisticsContext";
import { ReportPeriod } from "../../types/statistics";

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

    // Calculate total attendance as a fraction
    const totalDays = statistics.totalDays || 0;
    const presentDays = statistics.present || 0;
    const totalAttendance = `${presentDays}/${totalDays} hari`;

    // Calculate average work hours
    const averageWorkHours = statistics.averageWorkHours
      ? `${statistics.averageWorkHours.toFixed(1)} Jam`
      : "N/A";

    // Calculate missed or permit absences (combining onLeave and absent)
    const missedOrPermit = (statistics.onLeave || 0) + (statistics.absent || 0);

    // Calculate attendance percentage
    const attendancePercentage =
      totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    return {
      totalKehadiran: totalAttendance,
      rataJamKerja: averageWorkHours,
      izinLupaAbsen: missedOrPermit,
      presentaseKehadiran: attendancePercentage,
    };
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

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Get real statistics data
  const statsData = getStatsData();

  const loading = loadingUser || loadingStatistics;
  const error = userError || statisticsError;

  const clearError = () => {
    clearUserError();
    clearStatisticsError();
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
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Avatar */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2, mt: 2 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: "#ff6347",
              border: "4px solid white",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
            alt={selectedUser?.fullName || "User"}
            src={selectedUser?.profileImage}
          >
            {selectedUser?.fullName?.charAt(0) || "U"}
          </Avatar>
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
              { label: "Department", value: selectedUser?.department || "N/A" },
              { label: "Position", value: selectedUser?.position || "N/A" },
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
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid>
            <Card
              sx={{
                bgcolor: "#4CAF50",
                color: "white",
                height: "12vh",
                width: "44vw",
              }}
            >
              <CardContent sx={{ textAlign: "center", py: { xs: 1, sm: 2 } }}>
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
                width: "44vw",
              }}
            >
              <CardContent sx={{ textAlign: "center", py: { xs: 1, sm: 2 } }}>
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
                width: "44vw",
              }}
            >
              <CardContent sx={{ textAlign: "center", py: { xs: 1, sm: 2 } }}>
                <Typography variant="body2" sx={{ mb: 1 }} noWrap>
                  Izin/Lupa Absen
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
                width: "44vw",
              }}
            >
              <CardContent sx={{ textAlign: "center", py: { xs: 1, sm: 2 } }}>
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
              width: { xs: "100%", sm: "80%" },
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
              width: { xs: "100%", sm: "80%" },
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
