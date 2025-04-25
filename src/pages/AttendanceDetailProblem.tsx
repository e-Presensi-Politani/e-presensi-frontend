import React from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WarningIcon from "@mui/icons-material/Warning";
import BottomNav from "../components/BottomNav";

interface AttendanceDetailProps {
  name?: string;
  date?: string;
  checkIn?: string;
  checkOut?: string;
  totalHours?: number;
  status?: string;
}

const AttendanceDetailProblem: React.FC<AttendanceDetailProps> = ({
  name = "M. Ghozi Syah Putra",
  date = "Senin, 06 Januari 2025",
  checkIn = "09:00",
  checkOut = "16:00",
  totalHours = 7,
  status = "Jam Kerja Kurang",
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleRequestPermission = () => {
    navigate("/under-development");
  };

  return (
    <Box
      sx={{
        bgcolor: "#f5f5f5",
        width: "100vw",
        height: "100vh",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#FFC107",
          p: 2,
          color: "black",
          display: "flex",
          alignItems: "center",
        }}
      >
        <IconButton onClick={handleBack} sx={{ color: "black" }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 1 }}>
          Detail Presensi
        </Typography>
      </Box>

      {/* Warning Banner */}
      <Container maxWidth="sm" sx={{ mt: 2, mb: 2, px: 1 }}>
        <Paper
          sx={{
            bgcolor: "#FFC107",
            borderRadius: 2,
            p: 2,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", mr: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                border: "2px solid black",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WarningIcon sx={{ fontSize: 30, color: "black" }} />
            </Box>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Jam Kerja Kurang!
            </Typography>
            <Typography variant="body2">
              {date}
              <br />
              {totalHours} Jam
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Attendance Details */}
      <Container maxWidth="sm" sx={{ px: 1 }}>
        <Paper sx={{ borderRadius: 2, mb: 2 }}>
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ fontWeight: "normal" }}
                  >
                    Nama
                  </TableCell>
                  <TableCell align="right">{name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ fontWeight: "normal" }}
                  >
                    Absen Masuk
                  </TableCell>
                  <TableCell align="right">{checkIn}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ fontWeight: "normal" }}
                  >
                    Absen Keluar
                  </TableCell>
                  <TableCell align="right">{checkOut}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ fontWeight: "normal" }}
                  >
                    Total
                  </TableCell>
                  <TableCell align="right">{totalHours} Jam</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ fontWeight: "normal" }}
                  >
                    Status
                  </TableCell>
                  <TableCell align="right">{status}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Permission Request Button */}
        <Button
          fullWidth
          variant="contained"
          sx={{
            bgcolor: "#FFC107",
            color: "black",
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: "bold",
            "&:hover": {
              bgcolor: "#e6ad00",
            },
          }}
          onClick={handleRequestPermission}
        >
          Ajukan Izin
        </Button>
      </Container>

      {/* Bottom Navigation */}
      <Box sx={{ flexGrow: 1 }} />
      <BottomNav />
    </Box>
  );
};

export default AttendanceDetailProblem;
