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
  Task,
  Person,
  AssignmentTurnedIn,
  CheckBox,
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
import { useLeaveRequests } from "../../contexts/LeaveRequestsContext";
import { useCorrections } from "../../contexts/CorrectionsContext";
import { useStatistics } from "../../contexts/StatisticsContext";
import { ReportPeriod } from "../../types/statistics";
import FileService from "../../services/FileService";
import defaultProfileImage from "../../assets/default-pp.png";

const KajurDashboardPage: React.FC = () => {
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
    pendingRequests,
    fetchPendingRequests,
    loading: loadingLeaveRequests,
    error: leaveRequestsError,
  } = useLeaveRequests();
  const {
    pendingCorrections,
    fetchPendingCorrections,
    loading: loadingCorrections,
    error: correctionsError,
  } = useCorrections();
  const {
    statistics,
    loading: loadingStatistics,
    error: statisticsError,
    fetchMyStatistics,
    clearError: clearStatisticsError,
  } = useStatistics();
  const navigate = useNavigate();

  // New state for profile photo
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

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
      setPhotoError("Gagal memuat foto profil");
    }
  };

  // Fetch user details, today's attendance, pending leave requests, and pending corrections when component mounts
  useEffect(() => {
    if (authUser?.guid) {
      fetchUserByGuid(authUser.guid);
    }
    fetchTodayAttendance();
    fetchPendingRequests();
    fetchPendingCorrections(); // Fetch pending corrections for the Kajur

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

  // Load profile photo when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      loadProfilePhoto();
    }
  }, [selectedUser]);

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

  const handleKoreksi = () => {
    navigate("/persetujuan-koreksi");
  };

  const handleCuti = () => {
    navigate("/leave-request");
  };

  const handlePersetujuan = () => {
    navigate("/persetujuan");
  };

  // Determine button states based on today's attendance
  const hasCheckedIn = !!todayAttendance?.checkInTime;
  const hasCheckedOut = !!todayAttendance?.checkOutTime;

  // Get check-in and check-out times
  const checkInTime = formatTime(todayAttendance?.checkInTime);
  const checkOutTime = formatTime(todayAttendance?.checkOutTime);

  // Determine count of pending approval requests
  const pendingApprovalCount = pendingRequests?.length || 0;

  // Determine count of pending correction requests
  const pendingCorrectionCount = pendingCorrections?.length || 0;

  // Get the current day of the month to display in the chart title
  const currentMonth = currentDateTime.toLocaleString("id-ID", {
    month: "long",
  });

  // Updated function to include Remote Working as a separate category
  const getAttendanceChartData = () => {
    if (!statistics) {
      // Default data when statistics are not available
      return [
        { name: "Hadir", value: 0, color: "#4CAF50" },
        { name: "Cuti", value: 0, color: "#FFC107" },
        { name: "Remote", value: 0, color: "#ff7043" },
        { name: "DL", value: 0, color: "#03A9F4" },
        { name: "Tanpa Keterangan", value: 0, color: "#F44336" },
        { name: "Other", value: 0, color: "#9E9E9E" },
      ];
    }

    // Menghitung total semua kategori untuk memastikan pembagian yang tepat
    const totalAttendance =
      statistics.present +
      statistics.onLeave +
      statistics.officialTravel +
      statistics.absent +
      statistics.late +
      statistics.earlyDeparture +
      statistics.remoteWorking;

    // Jika totalAttendance adalah 0, gunakan data default untuk menghindari pembagian dengan nol
    if (totalAttendance === 0) {
      return [
        { name: "Hadir", value: 0, color: "#4CAF50" },
        { name: "Cuti", value: 0, color: "#FFC107" },
        { name: "Remote", value: 0, color: "#ff7043" },
        { name: "DL", value: 0, color: "#03A9F4" },
        { name: "Tanpa Keterangan", value: 0, color: "#F44336" },
        { name: "Other", value: 0, color: "#9E9E9E" },
      ];
    }

    // Menghitung persentase berdasarkan total kehadiran, bukan total hari
    const presentPercentage = (statistics.present / totalAttendance) * 100;
    const onLeavePercentage = (statistics.onLeave / totalAttendance) * 100;
    const officialTravelPercentage =
      (statistics.officialTravel / totalAttendance) * 100;
    const absentPercentage = (statistics.absent / totalAttendance) * 100;
    const remoteWorkingPercentage =
      (statistics.remoteWorking / totalAttendance) * 100;

    // Menggabungkan late dan earlyDeparture untuk kategori Other (tidak termasuk remoteWorking)
    const otherPercentage =
      ((statistics.late + statistics.earlyDeparture) / totalAttendance) * 100;

    // Membuat array data dengan persentase yang sudah dihitung
    let chartData = [
      {
        name: "Hadir",
        value: parseFloat(presentPercentage.toFixed(1)),
        color: "#4CAF50",
      },
      {
        name: "Cuti",
        value: parseFloat(onLeavePercentage.toFixed(1)),
        color: "#FFC107",
      },
      {
        name: "Remote",
        value: parseFloat(remoteWorkingPercentage.toFixed(1)),
        color: "#ff7043",
      },
      {
        name: "DL",
        value: parseFloat(officialTravelPercentage.toFixed(1)),
        color: "#03A9F4",
      },
      {
        name: "Tanpa Keterangan",
        value: parseFloat(absentPercentage.toFixed(1)),
        color: "#F44336",
      },
      {
        name: "Other",
        value: parseFloat(otherPercentage.toFixed(1)),
        color: "#9E9E9E",
      },
    ];

    // Menghitung total persentase setelah pembulatan
    const totalPercentage = chartData.reduce(
      (sum, item) => sum + item.value,
      0
    );

    // Menyesuaikan nilai kategori terbesar untuk memastikan total tepat 100%
    if (totalPercentage !== 100) {
      const diff = 100 - totalPercentage;

      // Mencari kategori dengan nilai tertinggi untuk menambahkan/mengurangi selisih
      let highestValueIndex = 0;
      let highestValue = chartData[0].value;

      for (let i = 1; i < chartData.length; i++) {
        if (chartData[i].value > highestValue) {
          highestValue = chartData[i].value;
          highestValueIndex = i;
        }
      }

      // Menyesuaikan nilai kategori terbesar
      chartData[highestValueIndex].value = parseFloat(
        (chartData[highestValueIndex].value + diff).toFixed(1)
      );
    }

    return chartData;
  };

  const attendanceData = getAttendanceChartData();

  const loading =
    loadingUser ||
    loadingAttendance ||
    loadingLeaveRequests ||
    loadingCorrections ||
    loadingStatistics;
  const error =
    userError ||
    attendanceError ||
    leaveRequestsError ||
    correctionsError ||
    statisticsError ||
    photoError;

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
              sx={{ width: 60, height: 60 }}
              src={photoURL || defaultProfileImage}
              alt={selectedUser?.fullName || "User"}
              imgProps={{
                // Add error handling in case image fails to load
                onError: (e) => {
                  const imgElement = e.target as HTMLImageElement;
                  imgElement.src = defaultProfileImage;
                },
              }}
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
              <Grid sx={{ textAlign: "center", position: "relative" }}>
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <IconButton color="warning" onClick={handleKoreksi}>
                    <Task />
                  </IconButton>
                  {pendingCorrectionCount > 0 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bgcolor: "error.main",
                        color: "white",
                        borderRadius: "50%",
                        width: 16,
                        height: 16,
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {pendingCorrectionCount > 99
                        ? "99+"
                        : pendingCorrectionCount}
                    </Box>
                  )}
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Koreksi
                </Typography>
              </Grid>
              <Grid sx={{ textAlign: "center", position: "relative" }}>
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <IconButton color="info" onClick={handlePersetujuan}>
                    <CheckBox />
                  </IconButton>
                  {pendingApprovalCount > 0 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bgcolor: "error.main",
                        color: "white",
                        borderRadius: "50%",
                        width: 16,
                        height: 16,
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {pendingApprovalCount > 99 ? "99+" : pendingApprovalCount}
                    </Box>
                  )}
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Approval
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
          <Typography
            variant="body1"
            gutterBottom
            fontWeight="medium"
            align="center"
          >
            Rekap Kehadiran {currentMonth}
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

export default KajurDashboardPage;
