import React, { useState, useEffect } from "react";
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
import BottomNav from "../components/BottomNav";

// Sample attendance data (you would fetch this from an API)
const attendanceData = [
  { name: "Hadir", value: 42.9, color: "#4CAF50" },
  { name: "Sakit", value: 25.8, color: "#FFC107" },
  { name: "Izin", value: 17.2, color: "#03A9F4" },
  { name: "Terlambat", value: 14.2, color: "#F44336" },
];

const DashboardPage: React.FC = () => {
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));
  const [userData, setUserData] = useState<any>(null);

  // Get user data from localStorage (assuming it was stored during login)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  // For demo purposes only - normally this would come from your backend
  const checkInTime = "07:00";
  const checkOutTime = "17:00";

  return (
    <Box
      sx={{
        bgcolor: "#f5f5f5",
        minHeight: "100vh",
        width: "100vw",
        padding: 0,
        margin: 0,
      }}
    >
      {/* Header with user info */}
      <Box
        sx={{
          bgcolor: "#0073e6",
          width: "100vw",
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
              src={userData?.profileImage}
            >
              {userData?.fullName?.charAt(0) || "U"}
            </Avatar>
            <Box ml={2}>
              <Typography variant="h5" fontWeight="bold">
                {userData?.fullName}
              </Typography>
              <Typography variant="body1">{userData?.role}</Typography>
              <Typography variant="body2">{userData?.guid}</Typography>
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
                <IconButton color="primary">
                  <Person />
                </IconButton>
                <Typography variant="body2" color="textSecondary">
                  Profil
                </Typography>
              </Grid>
              <Grid sx={{ textAlign: "center" }}>
                <IconButton color="error">
                  <CalendarToday />
                </IconButton>
                <Typography variant="body2" color="textSecondary">
                  Cuti
                </Typography>
              </Grid>
              <Grid sx={{ textAlign: "center" }}>
                <IconButton color="warning">
                  <Description />
                </IconButton>
                <Typography variant="body2" color="textSecondary">
                  Histori
                </Typography>
              </Grid>
              <Grid sx={{ textAlign: "center" }}>
                <IconButton color="info">
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

      <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
        <Grid container spacing={2} justifyContent="center" alignItems="center">
          <Grid>
            <Button
              variant="contained"
              startIcon={<AssignmentTurnedIn />}
              sx={{
                width: "43vw",
                bgcolor: "#4CAF50",
                color: "white",
                p: 2,
                borderRadius: 2,
                textTransform: "none",
                justifyContent: "flex-start",
                "&:hover": {
                  bgcolor: "#388E3C",
                },
              }}
            >
              <Box>
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
              fullWidth
              variant="contained"
              startIcon={<AssignmentTurnedIn />}
              sx={{
                width: "43vw",
                bgcolor: "#F44336",
                color: "white",
                p: 2,
                borderRadius: 2,
                textTransform: "none",
                justifyContent: "flex-start",
                "&:hover": {
                  bgcolor: "#D32F2F",
                },
              }}
            >
              <Box>
                <Typography variant="body1" fontWeight="bold" align="left">
                  Pulang
                </Typography>
                <Typography variant="body2" align="left">
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
            bgcolor: "white",
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Rekap Kehadiran
          </Typography>
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
        </Paper>
      </Container>

      {/* Bottom navigation */}
      <BottomNav />
    </Box>
  );
};

export default DashboardPage;
