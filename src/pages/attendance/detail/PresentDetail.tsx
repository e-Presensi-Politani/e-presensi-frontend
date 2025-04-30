import React from "react";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../../components/BottomNav";

const AttendanceDetailPresent: React.FC = () => {
  const navigate = useNavigate();

  // Mock data
  const attendanceData = {
    date: "Senin, 01 Januari 2025",
    checkIn: "07:00",
    checkOut: "15:30",
    total: "8 Jam, 30 Menit",
    status: "Hadir",
    name: "M. Ghozi Syah Putra",
  };

  const handleBack = () => {
    navigate("/history");
  };

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
        {/* Success Banner */}
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
            <Typography variant="body2">Senin, 01 Januari 2025</Typography>
            <Typography variant="body2">8 Jam, 30 Menit</Typography>
          </Box>
        </Paper>

        {/* Attendance Details */}
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
                    {attendanceData.name}
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
                    {attendanceData.checkIn}
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
                    {attendanceData.checkOut}
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
                    {attendanceData.total}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Status
                  </TableCell>
                  <TableCell align="right">{attendanceData.status}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default AttendanceDetailPresent;
