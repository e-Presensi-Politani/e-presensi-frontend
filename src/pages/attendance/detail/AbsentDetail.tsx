import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import BottomNav from "../../../components/BottomNav";
import { useAttendance } from "../../../contexts/AttendanceContext";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";

const AttendanceDetailAbsent: React.FC = () => {
  const navigate = useNavigate();
  const { guid } = useParams<{ guid: string }>();
  const { fetchAttendanceById, selectedAttendance, loading, error } =
    useAttendance();

  useEffect(() => {
    if (guid) {
      let isMounted = true;
      fetchAttendanceById(guid).catch(() => {
        if (!isMounted) return;
      });
      return () => {
        isMounted = false;
      };
    }
  }, [guid, fetchAttendanceById]);

  const handleBack = () => {
    navigate("/history");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center" sx={{ mt: 4 }}>
        {error}
      </Typography>
    );
  }

  if (!selectedAttendance) {
    return (
      <Typography align="center" sx={{ mt: 4 }}>
        Data tidak ditemukan
      </Typography>
    );
  }

  const attendanceTime = selectedAttendance.checkInTime
    ? format(new Date(selectedAttendance.checkInTime), "HH:mm")
    : "--:--";
  const attendanceDate = format(
    new Date(selectedAttendance.date),
    "EEEE, dd MMMM yyyy",
    { locale: id }
  );

  return (
    <Box
      sx={{
        bgcolor: "#f5f5f5",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          bgcolor: "#E5323E",
          height: "4vh",
          p: 2,
          color: "white",
          display: "flex",
          alignItems: "center",
        }}
      >
        <IconButton color="inherit" onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, textAlign: "center", mr: 4 }}
        >
          Detail Presensi
        </Typography>
      </Box>
      <Container maxWidth="sm" sx={{ mt: 2 }}>
        <Paper
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "#E5323E",
            color: "white",
          }}
        >
          <Box sx={{ p: 3, display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                border: "2px solid white",
                borderRadius: 1,
                p: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: 48,
                height: 48,
                mr: 3,
              }}
            >
              <CloseIcon sx={{ fontSize: 30 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Tidak Hadir
              </Typography>
              <Typography variant="body2">{attendanceDate}</Typography>
              <Typography variant="body2">{attendanceTime}</Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
      <Box sx={{ flexGrow: 1 }} />
      <BottomNav />
    </Box>
  );
};

export default AttendanceDetailAbsent;
