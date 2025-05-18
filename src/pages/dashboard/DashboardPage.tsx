import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  IconButton,
  useMediaQuery,
  Theme,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  CalendarToday,
  Description,
  LocationOn,
  Person,
  AssignmentTurnedIn,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import { useAuth } from "../../contexts/AuthContext";
import { useUsers } from "../../contexts/UserContext";
import { useAttendance } from "../../contexts/AttendanceContext";
import { useStatistics } from "../../contexts/StatisticsContext";
import { ReportPeriod } from "../../types/statistics";

const DashboardPage: React.FC = () => {
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());
  const { user: authUser } = useAuth();
  const {
    fetchUserByGuid,
    selectedUser,
    loading: loadingUser,
    error: userError,
    clearError: clearUserError,
  } = useUsers();
  const {
    todayAttendance,
    fetchTodayAttendance,
    loading: loadingAttendance,
    error: attendanceError,
  } = useAttendance();
  const {
    statistics,
    loading: loadingStatistics,
    error: statisticsError,
    fetchMyStatistics,
    clearError: clearStatisticsError,
  } = useStatistics();
  const navigate = useNavigate();

  // Fetch user details, today's attendance, and statistics when component mounts
  useEffect(() => {
    if (authUser?.guid) {
      fetchUserByGuid(authUser.guid);
    }
    fetchTodayAttendance();

    // Fetch statistics for the current month up to today
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // Use today as the end date instead of the last day of the month
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    fetchMyStatistics({
      startDate: firstDayOfMonth.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
      period: ReportPeriod.MONTHLY,
    });

    return () => {
      clearUserError();
      clearStatisticsError();
    };
  }, [authUser?.guid]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("id-ID", options);
  };

  const formatCurrentTime = (date: Date): string => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Format time function
  const formatTime = (dateTime: Date | string | undefined): string => {
    if (!dateTime) return "--:--";

    try {
      const date = typeof dateTime === "string" ? new Date(dateTime) : dateTime;
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "--:--";
    }
  };

  // Handle attendance button clicks
  const handleAttendanceClick = () => {
    navigate("/presensi");
  };

  // Handle Quick Access icon clicks
  const handleProfile = () => {
    navigate("/profile");
  };

  const handleHistory = () => {
    navigate("/history");
  };

  const handleCuti = () => {
    navigate("/leave-request");
  };

  const handleLokasi = () => {
    navigate("/under-development");
  };

  // Determine button states based on today's attendance
  const hasCheckedIn = !!todayAttendance?.checkInTime;
  const hasCheckedOut = !!todayAttendance?.checkOutTime;

  // Get check-in and check-out times
  const checkInTime = formatTime(todayAttendance?.checkInTime);
  const checkOutTime = formatTime(todayAttendance?.checkOutTime);

  // Get the current day of the month to display in the chart title
  const currentDay = currentDateTime.getDate();
  const currentMonth = currentDateTime.toLocaleString("id-ID", {
    month: "long",
  });

  // Prepare chart data from statistics
  const getAttendanceChartData = () => {
    if (!statistics) {
      // Default data when statistics are not available
      return [
        { name: "Hadir", value: 0, color: "#4CAF50" },
        { name: "Cuti", value: 0, color: "#FFC107" },
        { name: "DL", value: 0, color: "#03A9F4" },
        { name: "Tanpa Keterangan", value: 0, color: "#F44336" },
        { name: "Other", value: 0, color: "#9E9E9E" },
      ];
    }

    const totalDays = statistics.totalDays || 1; // Avoid division by zero

    return [
      {
        name: "Hadir",
        value: parseFloat(((statistics.present / totalDays) * 100).toFixed(1)),
        color: "#4CAF50",
      },
      {
        name: "Cuti",
        value: parseFloat(((statistics.onLeave / totalDays) * 100).toFixed(1)),
        color: "#FFC107",
      },
      {
        name: "DL",
        value: parseFloat(
          ((statistics.officialTravel / totalDays) * 100).toFixed(1)
        ),
        color: "#03A9F4",
      },
      {
        name: "Tanpa Keterangan",
        value: parseFloat(((statistics.absent / totalDays) * 100).toFixed(1)),
        color: "#F44336",
      },
      {
        name: "Other",
        value: parseFloat(
          (
            ((statistics.late +
              statistics.earlyDeparture +
              statistics.remoteWorking) /
              totalDays) *
            100
          ).toFixed(1)
        ),
        color: "#9E9E9E",
      },
    ];
  };

  const attendanceData = getAttendanceChartData();

  const loading = loadingUser || loadingAttendance || loadingStatistics;
  const error = userError || attendanceError || statisticsError;
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
        width: "100%",
        padding: 0,
        margin: 0,
      }}
    >
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ m: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Header with user info */}
      <Box
        sx={{
          bgcolor: "#0073e6",
          width: "100%",
          color: "white",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3 },
          borderBottomLeftRadius: { xs: 10, sm: 15, md: 20 },
          borderBottomRightRadius: { xs: 10, sm: 15, md: 20 },
          boxSizing: "border-box",
        }}
      >
        <Container maxWidth="lg">
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              sx={{ width: 60, height: 60, bgcolor: "#ff7043" }}
              src={selectedUser?.profileImage}
            >
              {selectedUser?.fullName?.charAt(0) || "U"}
            </Avatar>
            <Box ml={2}>
              <Typography variant="h5" fontWeight="bold">
                {selectedUser?.fullName || "Loading..."}
              </Typography>
              <Typography variant="body1">
                {selectedUser?.role || "User"}
              </Typography>
              <Typography variant="body2">{selectedUser?.nip || ""}</Typography>
            </Box>
          </Box>

          {/* Quick action buttons */}
          <Paper
            elevation={2}
            sx={{
              backgroundColor: "white",
              borderRadius: 2,
              marginTop: 2,
              padding: 1,
            }}
          >
            <Grid container spacing={1} justifyContent="space-around">
              <Grid sx={{ textAlign: "center" }}>
                <IconButton color="primary" onClick={handleProfile}>
                  <Person />
                </IconButton>
                <Typography variant="body2" color="textSecondary">
                  Profil
                </Typography>
              </Grid>
              <Grid sx={{ textAlign: "center" }}>
                <IconButton color="error" onClick={handleCuti}>
                  <CalendarToday />
                </IconButton>
                <Typography variant="body2" color="textSecondary">
                  Cuti
                </Typography>
              </Grid>
              <Grid sx={{ textAlign: "center" }}>
                <IconButton color="warning" onClick={handleHistory}>
                  <Description />
                </IconButton>
                <Typography variant="body2" color="textSecondary">
                  Histori
                </Typography>
              </Grid>
              <Grid sx={{ textAlign: "center" }}>
                <IconButton color="info" onClick={handleLokasi}>
                  <LocationOn />
                </IconButton>
                <Typography variant="body2" color="textSecondary">
                  Lokasi
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
        <Paper
          elevation={1}
          sx={{
            borderRadius: 2,
            p: 1,
            mb: 2,
            bgcolor: "white",
            textAlign: "center",
          }}
        >
          <Typography variant="subtitle1" component="span">
            <Box
              component="span"
              sx={{ fontWeight: "medium", color: "text.primary" }}
            >
              {formatDate(currentDateTime)}
            </Box>
            <Box component="span" sx={{ mx: 1 }}>
              -{" "}
            </Box>
            <Box
              component="span"
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              {formatCurrentTime(currentDateTime)}
            </Box>
          </Typography>
        </Paper>

        <Grid container spacing={2} justifyContent="center" alignItems="center">
          <Grid>
            <Button
              variant="contained"
              startIcon={<AssignmentTurnedIn sx={{ ml: 2, scale: 1.5 }} />}
              onClick={handleAttendanceClick}
              disabled={hasCheckedIn || hasCheckedOut}
              sx={{
                width: "43vw",
                bgcolor: hasCheckedIn ? "#9E9E9E" : "#4CAF50",
                color: "white",
                p: 2,
                borderRadius: 2,
                textTransform: "none",
                justifyContent: "flex-start",
                "&:hover": {
                  bgcolor: hasCheckedIn ? "#9E9E9E" : "#388E3C",
                },
                "&.Mui-disabled": {
                  bgcolor: "#9E9E9E",
                  color: "white",
                },
              }}
            >
              <Box width="100%">
                <Typography variant="body1" fontWeight="bold" align="center">
                  Masuk
                </Typography>
                <Typography variant="body2" align="center">
                  {checkInTime}
                </Typography>
              </Box>
            </Button>
          </Grid>
          <Grid>
            <Button
              variant="contained"
              startIcon={<AssignmentTurnedIn sx={{ ml: 2, scale: 1.5 }} />}
              onClick={handleAttendanceClick}
              disabled={!hasCheckedIn || hasCheckedOut}
              sx={{
                width: "43vw",
                bgcolor: !hasCheckedIn || hasCheckedOut ? "#9E9E9E" : "#F44336",
                color: "white",
                p: 2,
                borderRadius: 2,
                textTransform: "none",
                justifyContent: "flex-start",
                "&:hover": {
                  bgcolor:
                    !hasCheckedIn || hasCheckedOut ? "#9E9E9E" : "#D32F2F",
                },
                "&.Mui-disabled": {
                  bgcolor: "#9E9E9E",
                  color: "white",
                },
              }}
            >
              <Box width="100%">
                <Typography variant="body1" fontWeight="bold" align="center">
                  Pulang
                </Typography>
                <Typography variant="body2" align="center">
                  {checkOutTime}
                </Typography>
              </Box>
            </Button>
          </Grid>
        </Grid>

        {/* Attendance chart */}
        <Paper
          elevation={1}
          sx={{
            borderRadius: 2,
            mt: 3,
            p: 3,
            mb: { xs: 7, sm: 6 },
            bgcolor: "white",
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Rekap Kehadiran {currentMonth} (1-{currentDay})
          </Typography>
          {loadingStatistics ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
              <CircularProgress />
            </Box>
          ) : statistics ? (
            <Box sx={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isDesktop ? 60 : 40}
                    outerRadius={isDesktop ? 100 : 80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ value }) => `${value}%`}
                    labelLine={false}
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary" align="center">
              Tidak ada data kehadiran untuk ditampilkan
            </Typography>
          )}
        </Paper>
      </Container>

      {/* Bottom navigation */}
      <BottomNav />
    </Box>
  );
};

export default DashboardPage;
