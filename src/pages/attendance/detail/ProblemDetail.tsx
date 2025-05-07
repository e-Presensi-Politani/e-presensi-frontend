import React, { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  Snackbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WarningIcon from "@mui/icons-material/Warning";
import BottomNav from "../../../components/BottomNav";
import { useAttendance } from "../../../contexts/AttendanceContext";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";

const AttendanceDetailProblem: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { guid } = useParams<{ guid: string }>();
  const { fetchAttendanceById, selectedAttendance, loading, error } =
    useAttendance();

  // Handle success message from correction submission
  const [showSuccessMessage, setShowSuccessMessage] =
    React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState<string>("");

  useEffect(() => {
    // Check if there's a success message in the location state
    if (location.state && location.state.success) {
      setShowSuccessMessage(true);
      setSuccessMessage(location.state.message || "Pengajuan berhasil");
    }
  }, [location.state]);

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
    navigate(-1);
  };

  const handleRequestPermission = () => {
    if (guid) {
      navigate(`/attendance-correction/${guid}`);
    } else {
      console.error("No attendance GUID available");
    }
  };

  const handleCloseSnackbar = () => {
    setShowSuccessMessage(false);
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
  const totalHours = selectedAttendance.workHours || 0;
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
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Box
        sx={{
          bgcolor: "#FFC107",
          height: "4vh",
          p: 2,
          color: "black",
          display: "flex",
          alignItems: "center",
        }}
      >
        <IconButton onClick={handleBack} sx={{ color: "black" }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, textAlign: "center", mr: 4 }}
        >
          Detail Presensi
        </Typography>
      </Box>
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
              {attendanceDate}
              <br />
              {totalHours} Jam
            </Typography>
          </Box>
        </Paper>
      </Container>
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
                  <TableCell align="right">
                    {selectedAttendance.userId}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ fontWeight: "normal" }}
                  >
                    Absen Masuk
                  </TableCell>
                  <TableCell align="right">{checkInTime}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ fontWeight: "normal" }}
                  >
                    Absen Keluar
                  </TableCell>
                  <TableCell align="right">{checkOutTime}</TableCell>
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
                  <TableCell align="right">
                    {selectedAttendance.status}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
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
            "&:hover": { bgcolor: "#e6ad00" },
          }}
          onClick={handleRequestPermission}
        >
          Ajukan Izin
        </Button>
      </Container>
      <Box sx={{ flexGrow: 1 }} />
      <BottomNav />
    </Box>
  );
};

export default AttendanceDetailProblem;
