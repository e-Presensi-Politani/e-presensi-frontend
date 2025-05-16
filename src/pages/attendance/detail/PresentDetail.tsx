import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Container,
  IconButton,
  CircularProgress,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BottomNav from "../../../components/BottomNav";
import { useAttendance } from "../../../contexts/AttendanceContext";
import { useAuth } from "../../../contexts/AuthContext";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import { WorkingStatus } from "../../../types/enums";
import {
  WorkingStatusLabels,
  WorkingStatusColors,
} from "../../../types/working-status";

const AttendanceDetailPresent: React.FC = () => {
  const navigate = useNavigate();
  const { guid } = useParams<{ guid: string }>();
  const { fetchAttendanceById, selectedAttendance, loading, error } =
    useAttendance();
  const { user } = useAuth();

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

  const checkInTime = selectedAttendance.checkInTime
    ? format(new Date(selectedAttendance.checkInTime), "HH:mm")
    : "--:--";
  const checkOutTime = selectedAttendance.checkOutTime
    ? format(new Date(selectedAttendance.checkOutTime), "HH:mm")
    : "--:--";
  const totalHours = selectedAttendance.workHours
    ? `${selectedAttendance.workHours} Jam${
        selectedAttendance.workHours >= 1 ? ", 0 Menit" : ""
      }`
    : "0 Jam, 0 Menit";
  const attendanceDate = format(
    new Date(selectedAttendance.date),
    "EEEE, dd MMMM yyyy",
    { locale: id }
  );

  // Menentukan status dalam bahasa Indonesia
  const statusText = selectedAttendance.status
    ? WorkingStatusLabels[selectedAttendance.status as WorkingStatus] ||
      selectedAttendance.status
    : "Tidak Diketahui";

  // Menentukan warna status
  const statusColor =
    selectedAttendance.status &&
    (selectedAttendance.status as WorkingStatus) in WorkingStatusColors
      ? WorkingStatusColors[selectedAttendance.status as WorkingStatus]
      : "default";

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
          bgcolor: "#4CAF50",
          height: "4vh",
          p: 2,
          color: "white",
          display: "flex",
          alignItems: "center",
        }}
      >
        <IconButton color="inherit" onClick={handleBack}>
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
        <Paper
          elevation={2}
          sx={{
            bgcolor: "#4CAF50",
            color: "white",
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
            }}
          >
            <CheckCircleIcon sx={{ color: "#4CAF50", fontSize: 40 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Absensi Berhasil
            </Typography>
            <Typography variant="body2">{attendanceDate}</Typography>
            <Typography variant="body2">{totalHours}</Typography>
          </Box>
        </Paper>
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ borderBottom: "1px solid #e0e0e0" }}
                  >
                    Nama
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ borderBottom: "1px solid #e0e0e0" }}
                  >
                    {user?.fullName || selectedAttendance.userId}
                  </TableCell>
                </TableRow>
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
                    {checkInTime}
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
                    {checkOutTime}
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
                    {totalHours}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Status
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={statusText}
                      color={
                        statusColor as
                          | "success"
                          | "warning"
                          | "error"
                          | "info"
                          | "default"
                      }
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
      <BottomNav />
    </Box>
  );
};

export default AttendanceDetailPresent;
