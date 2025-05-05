import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Button,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import WarningIcon from "@mui/icons-material/Warning";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import HomeIcon from "@mui/icons-material/Home";
import FlightIcon from "@mui/icons-material/Flight";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import BottomNav from "../../components/BottomNav";
import { useAttendance } from "../../contexts/AttendanceContext";
import { WorkingStatus } from "../../types/enums";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const AttendanceDetailPage: React.FC = () => {
  const { id: attendanceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    selectedAttendance, 
    fetchAttendanceById, 
    loading, 
    error, 
    clearError 
  } = useAttendance();

  useEffect(() => {
    if (attendanceId) {
      fetchAttendanceById(attendanceId);
    }
    
    // Cleanup when component unmounts
    return () => {
      clearError();
    };
  }, [attendanceId, fetchAttendanceById, clearError]);

  const handleBack = () => {
    navigate("/history");
  };

  const handleRequestCorrection = () => {
    navigate(`/attendance-correction/${attendanceId}`);
  };

  // Function to determine the attendance status details
  const getAttendanceStatusInfo = () => {
    if (!selectedAttendance) return null;

    const status = selectedAttendance.status;
    let title = "";
    let color = "";
    let icon = null;
    
    switch (status) {
      case WorkingStatus.PRESENT:
        title = "Absensi Berhasil";
        color = "#4CAF50";
        icon = <CheckCircleIcon sx={{ color: "#4CAF50", fontSize: 40 }} />;
        break;
      case WorkingStatus.ABSENT:
        title = "Tidak Hadir";
        color = "#E5323E";
        icon = <CloseIcon sx={{ fontSize: 30 }} />;
        break;
      case WorkingStatus.LATE:
        title = "Terlambat";
        color = "#FFC107";
        icon = <WarningIcon sx={{ fontSize: 30, color: "black" }} />;
        break;
      case WorkingStatus.EARLY_DEPARTURE:
        title = "Pulang Awal";
        color = "#FFC107";
        icon = <WarningIcon sx={{ fontSize: 30, color: "black" }} />;
        break;
      case WorkingStatus.REMOTE_WORKING:
        title = "Kerja Jarak Jauh";
        color = "#2196F3";
        icon = <HomeIcon sx={{ fontSize: 30 }} />;
        break;
      case WorkingStatus.ON_LEAVE:
        title = "Cuti";
        color = "#9C27B0";
        icon = <BeachAccessIcon sx={{ fontSize: 30 }} />;
        break;
      case WorkingStatus.OFFICIAL_TRAVEL:
        title = "Dinas Luar";
        color = "#FF9800";
        icon = <FlightIcon sx={{ fontSize: 30 }} />;
        break;
      default:
        title = "Status Tidak Dikenal";
        color = "#757575";
        icon = <BusinessCenterIcon sx={{ fontSize: 30 }} />;
    }

    return { title, color, icon };
  };

  // Calculate total work hours and format
  const formatWorkHours = () => {
    if (!selectedAttendance) return "--:--";
    
    if (selectedAttendance.workHours !== undefined) {
      const hours = Math.floor(selectedAttendance.workHours);
      const minutes = Math.round((selectedAttendance.workHours - hours) * 60);
      
      if (minutes > 0) {
        return `${hours} Jam, ${minutes} Menit`;
      }
      return `${hours} Jam`;
    }
    
    return "--:--";
  };

  // Format date for display
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "--:--";
    return format(new Date(date), "EEEE, dd MMMM yyyy", { locale: id });
  };

  // Format time for display
  const formatTime = (date: Date | string | undefined) => {
    if (!date) return "--:--";
    return format(new Date(date), "HH:mm");
  };

  // Check if the attendance has issues that require correction
  const needsCorrection = () => {
    if (!selectedAttendance) return false;
    
    return (
      selectedAttendance.status === WorkingStatus.LATE ||
      selectedAttendance.status === WorkingStatus.EARLY_DEPARTURE ||
      (!selectedAttendance.checkInTime && selectedAttendance.status !== WorkingStatus.ABSENT) ||
      !selectedAttendance.checkOutTime
    );
  };

  const statusInfo = getAttendanceStatusInfo();

  if (loading) {
    return (
      <Box
        sx={{
          bgcolor: "#f5f5f5",
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          bgcolor: "#f5f5f5",
          width: "100%",
          height: "100vh",
          p: 2,
        }}
      >
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!selectedAttendance || !statusInfo) {
    return (
      <Box
        sx={{
          bgcolor: "#f5f5f5",
          width: "100%",
          height: "100vh",
          p: 2,
        }}
      >
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Alert severity="warning" sx={{ mt: 2 }}>
          Data tidak ditemukan
        </Alert>
      </Box>
    );
  }

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
      {/* Header */}
      <Box
        sx={{
          bgcolor: statusInfo.color,
          height: "4vh",
          p: 2,
          color: statusInfo.color === "#FFC107" || statusInfo.color === "#FF9800" ? "black" : "white",
          display: "flex",
          alignItems: "center",
        }}
      >
        <IconButton 
          color="inherit" 
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, textAlign: "center", mr: 4 }}
        >
          Detail Presensi
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ flex: 1, overflow: "auto", py: 2 }}>
        {/* Status Banner */}
        <Paper
          elevation={2}
          sx={{
            bgcolor: statusInfo.color,
            color: statusInfo.color === "#FFC107" || statusInfo.color === "#FF9800" ? "black" : "white",
            p: 3,
            borderRadius: 2,
            mb: 2,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              bgcolor: "white",
              width: 60,
              height: 60,
              borderRadius: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mr: 3,
              border: statusInfo.color === "#FFC107" ? "2px solid black" : "none",
            }}
          >
            {statusInfo.icon}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {statusInfo.title}
            </Typography>
            <Typography variant="body2">
              {formatDate(selectedAttendance.date)}
            </Typography>
            <Typography variant="body2">
              {formatWorkHours()}
            </Typography>
          </Box>
        </Paper>

        {/* Attendance Details */}
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden", mb: 2 }}>
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ borderBottom: "1px solid #e0e0e0" }}
                  >
                    Absen Masuk
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ borderBottom: "1px solid #e0e0e0" }}
                  >
                    {formatTime(selectedAttendance.checkInTime)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ borderBottom: "1px solid #e0e0e0" }}
                  >
                    Absen Keluar
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ borderBottom: "1px solid #e0e0e0" }}
                  >
                    {formatTime(selectedAttendance.checkOutTime)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ borderBottom: "1px solid #e0e0e0" }}
                  >
                    Total
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ borderBottom: "1px solid #e0e0e0" }}
                  >
                    {formatWorkHours()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ borderBottom: "1px solid #e0e0e0" }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ borderBottom: "1px solid #e0e0e0" }}
                  >
                    {statusInfo.title}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Diverifikasi
                  </TableCell>
                  <TableCell align="right">
                    {selectedAttendance.verified ? "Ya" : "Belum"}
                  </TableCell>
                </TableRow>
                {selectedAttendance.checkInNotes && (
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Catatan Masuk
                    </TableCell>
                    <TableCell align="right">
                      {selectedAttendance.checkInNotes}
                    </TableCell>
                  </TableRow>
                )}
                {selectedAttendance.checkOutNotes && (
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Catatan Keluar
                    </TableCell>
                    <TableCell align="right">
                      {selectedAttendance.checkOutNotes}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Correction Button - only show for late or early departure */}
        {needsCorrection() && (
          <Button
            fullWidth
            variant="contained"
            sx={{
              bgcolor: statusInfo.color,
              color: statusInfo.color === "#FFC107" || statusInfo.color === "#FF9800" ? "black" : "white",
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": {
                bgcolor: statusInfo.color === "#FFC107" ? "#e6ad00" : undefined,
              },
            }}
            onClick={handleRequestCorrection}
          >
            Ajukan Koreksi
          </Button>
        )}
      </Container>

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default AttendanceDetailPage;