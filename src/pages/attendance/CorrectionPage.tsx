import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  IconButton,
  Button,
  TextField,
  MenuItem,
  FormControl,
  Select,
  SelectChangeEvent,
  InputAdornment,
  styled,
  CircularProgress,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import BottomNav from "../../components/BottomNav";
import { useCorrections } from "../../contexts/CorrectionsContext";
import { useAttendance } from "../../contexts/AttendanceContext";
import { format } from "date-fns";
import { CreateCorrectionDto } from "../../types/corrections";

// Custom styled MenuItem for wrapping text
const StyledMenuItem = styled(MenuItem)({
  whiteSpace: "normal",
  wordBreak: "break-word",
  lineHeight: "1.25",
  padding: "12px 16px",
  minHeight: "unset",
});

// Custom styled Typography for Select's displayed value
const SelectDisplayText = styled(Typography)({
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  lineHeight: "1.2",
});

const AttendanceCorrectionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { attendanceId } = useParams<{ attendanceId: string }>();
  const { createCorrection, loading, error, clearError } = useCorrections();
  const { selectedAttendance, fetchAttendanceById } = useAttendance();

  const [permissionType, setPermissionType] = useState<string>(
    "Pengajuan Penggunaan Jam Istirahat sebagai Jam Kerja"
  );
  const [requestDate, setRequestDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [description, setDescription] = useState<string>("");

  // Fetch attendance data if attendanceId is provided
  useEffect(() => {
    if (attendanceId) {
      fetchAttendanceById(attendanceId);
    }
  }, [attendanceId, fetchAttendanceById]);

  // Set request date based on selected attendance
  useEffect(() => {
    if (selectedAttendance) {
      setRequestDate(format(new Date(selectedAttendance.date), "yyyy-MM-dd"));
    }
  }, [selectedAttendance]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = async () => {
    if (!attendanceId) {
      console.error("No attendance ID found");
      return;
    }

    const correctionData: CreateCorrectionDto = {
      attendanceId,
      correctionType: permissionType,
      requestDate: new Date(requestDate),
      description,
    };

    try {
      await createCorrection(correctionData);
      navigate("/attendance-problem", {
        state: {
          success: true,
          message: "Pengajuan izin berhasil dikirim",
        },
      });
    } catch (err) {
      console.error("Failed to submit correction request", err);
      // Error is handled by the context and displayed in the UI
    }
  };

  const handlePermissionTypeChange = (event: SelectChangeEvent) => {
    setPermissionType(event.target.value);
  };

  // Function to shorten displayed text for mobile
  const getDisplayText = (text: string) => {
    // For mobile display, we'll use the styled component with ellipsis
    return <SelectDisplayText>{text}</SelectDisplayText>;
  };

  return (
    <Box
      sx={{
        bgcolor: "#f5f5f5",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#0073e6",
          height: "4vh",
          p: 2,
          color: "white",
          display: "flex",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <IconButton onClick={handleBack} sx={{ color: "white", padding: 0.5 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, textAlign: "center", mr: 4 }}
        >
          Pengajuan Izin
        </Typography>
      </Box>

      {/* Form Content */}
      <Container
        maxWidth="sm"
        sx={{
          mt: 2,
          mb: 10,
          px: { xs: 2, sm: 3 },
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Permission Type */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", mb: 1 }}
            color="textSecondary"
          >
            Jenis Pengajuan
          </Typography>
          <FormControl fullWidth>
            <Select
              value={permissionType}
              onChange={handlePermissionTypeChange}
              displayEmpty
              variant="outlined"
              renderValue={(value) => getDisplayText(value as string)}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
              sx={{
                bgcolor: "white",
                borderRadius: 1,
                boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
                ".MuiOutlinedInput-notchedOutline": { border: "none" },
                height: { xs: "auto", sm: "56px" },
                minHeight: "56px",
                ".MuiSelect-select": {
                  py: 1.5,
                  display: "flex",
                  alignItems: "center",
                },
              }}
              IconComponent={KeyboardArrowDownIcon}
            >
              <StyledMenuItem value="Pengajuan Penggunaan Jam Istirahat sebagai Jam Kerja">
                Penggunaan Jam Istirahat sebagai Jam Kerja
              </StyledMenuItem>
              <StyledMenuItem value="Izin Cepat Pulang">
                Izin Cepat Pulang
              </StyledMenuItem>
              <StyledMenuItem value="Izin Terlambat Datang">
                Izin Terlambat Datang
              </StyledMenuItem>
              <StyledMenuItem value="Lupa Absen Check-in">
                Lupa Absen Check-in
              </StyledMenuItem>
              <StyledMenuItem value="Lupa Absen Check-out">
                Lupa Absen Check-out
              </StyledMenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Date */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", mb: 1 }}
            color="textSecondary"
          >
            Tanggal Pengajuan
          </Typography>
          <TextField
            fullWidth
            type="date"
            value={requestDate}
            onChange={(e) => setRequestDate(e.target.value)}
            sx={{
              bgcolor: "white",
              borderRadius: 1,
              boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarTodayIcon sx={{ color: "#999", fontSize: 20 }} />
                </InputAdornment>
              ),
              sx: { height: "56px" },
            }}
          />
        </Box>

        {/* Description */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", mb: 1 }}
            color="textSecondary"
          >
            Keterangan Izin
          </Typography>
          <Paper
            sx={{
              borderRadius: 1,
              boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
              position: "relative",
            }}
          >
            <TextField
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Masukan keterangan izin ..."
              sx={{
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "& .MuiInputBase-input": { fontSize: "0.95rem" },
              }}
            />
            <IconButton
              sx={{
                position: "absolute",
                right: 8,
                bottom: 8,
                color: "#0073e6",
                padding: "4px",
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Paper>
        </Box>

        {/* Submit Button */}
        <Button
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: "#0073e6",
            color: "white",
            py: { xs: 1.5, sm: 2 },
            borderRadius: 1,
            textTransform: "none",
            fontWeight: "bold",
            boxShadow: "0px 4px 8px rgba(0,115,230,0.3)",
            fontSize: "1rem",
            "&:hover": {
              bgcolor: "#0066cc",
            },
            mt: "auto",
          }}
          onClick={handleSubmit}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            "Kirim"
          )}
        </Button>
      </Container>

      {/* Bottom Navigation */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <BottomNav />
      </Box>
    </Box>
  );
};

export default AttendanceCorrectionPage;
