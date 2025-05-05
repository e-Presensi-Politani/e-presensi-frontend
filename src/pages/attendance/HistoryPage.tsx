import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  MenuItem,
  Select,
  SelectChangeEvent,
  Pagination,
  FormControl,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  ReportProblem as WarningIcon,
} from "@mui/icons-material";
import BottomNav from "../../components/BottomNav";
import { useAttendance } from "../../contexts/AttendanceContext";
import { WorkingStatus } from "../../types/enums";
import { format, parse, startOfMonth, endOfMonth } from "date-fns";
import { id } from "date-fns/locale";

const HistoryPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "MMMM yyyy", { locale: id })
  );
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const navigate = useNavigate();

  // Get attendance context
  const {
    attendanceRecords,
    fetchMyAttendanceRecords,
    loading,
    error,
    clearError,
  } = useAttendance();

  // Generate month options for the past year (12 months)
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      options.push(format(date, "MMMM yyyy", { locale: id }));
    }

    return options;
  };

  const monthOptions = generateMonthOptions();

  useEffect(() => {
    // Parse the selected month string back into a Date object
    const selectedDate = parse(selectedMonth, "MMMM yyyy", new Date(), {
      locale: id,
    });

    // Calculate start and end of selected month
    const start = format(startOfMonth(selectedDate), "yyyy-MM-dd");
    const end = format(endOfMonth(selectedDate), "yyyy-MM-dd");

    // Fetch attendance records for the selected month
    fetchMyAttendanceRecords({
      startDate: start,
      endDate: end,
    });
  }, [selectedMonth, fetchMyAttendanceRecords]);

  const handleMonthChange = (event: SelectChangeEvent) => {
    setSelectedMonth(event.target.value);
    setPage(1); // Reset to first page when changing month
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Calculate total number of pages
  const totalPages = Math.ceil(attendanceRecords.length / pageSize);

  // Get records for current page
  const currentRecords = attendanceRecords.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Map status from API to UI status
  const mapStatusToUIStatus = (
    status: string
  ): "present" | "absent" | "warning" => {
    switch (status) {
      case WorkingStatus.PRESENT:
        return "present";
      case WorkingStatus.ABSENT:
        return "absent";
      case WorkingStatus.LATE:
      case WorkingStatus.EARLY_DEPARTURE:
        return "warning";
      case WorkingStatus.REMOTE_WORKING:
      case WorkingStatus.ON_LEAVE:
      case WorkingStatus.OFFICIAL_TRAVEL:
        return "present"; // These are valid attendance statuses
      default:
        return "warning";
    }
  };

  // Function to format time for display
  const formatAttendanceTime = (record: any) => {
    if (!record.checkInTime && !record.checkOutTime) {
      return "--:--";
    }

    const checkIn = record.checkInTime
      ? format(new Date(record.checkInTime), "HH:mm")
      : "--:--";

    const checkOut = record.checkOutTime
      ? format(new Date(record.checkOutTime), "HH:mm")
      : "--:--";

    return `${checkIn} - ${checkOut}`;
  };

  // Updated function to handle navigation based on status
  const handleDetailClick = (record: any) => {
    const status = mapStatusToUIStatus(record.status);

    // Store the selected attendance in context
    navigate(`/attendance-detail/${record.guid}`);
  };

  // Function to render status icon
  const renderStatusIcon = (status: "present" | "absent" | "warning") => {
    switch (status) {
      case "present":
        return <CheckIcon style={{ color: "#4CAF50" }} />;
      case "absent":
        return <CloseIcon style={{ color: "#F44336" }} />;
      case "warning":
        return <WarningIcon style={{ color: "#FFC107" }} />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#f5f5f5",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
        pb: 8,
      }}
    >
      {/* Header */}
      <Box
        sx={{ bgcolor: "#1976D2", p: 2, color: "white", textAlign: "center" }}
      >
        <Typography variant="h6">Riwayat Presensi</Typography>
      </Box>

      {/* Month selector */}
      <Container maxWidth="sm" sx={{ mt: 2, mb: 2 }}>
        <FormControl fullWidth>
          <Select
            value={selectedMonth}
            onChange={handleMonthChange}
            sx={{
              bgcolor: "#1976D2",
              color: "white",
              borderRadius: 2,
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: "transparent",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "transparent",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "transparent",
              },
              ".MuiSvgIcon-root": { color: "white" },
            }}
          >
            {monthOptions.map((month) => (
              <MenuItem key={month} value={month}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Container>

      {/* Error message */}
      {error && (
        <Container maxWidth="sm" sx={{ mt: 1, mb: 1 }}>
          <Alert severity="error" onClose={clearError}>
            {error}
          </Alert>
        </Container>
      )}

      {/* Loading indicator */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Attendance list */}
          <Container maxWidth="sm" sx={{ flex: 1, overflowY: "auto" }}>
            {currentRecords.length > 0 ? (
              <List sx={{ p: 0 }}>
                {currentRecords.map((record, index) => {
                  const uiStatus = mapStatusToUIStatus(record.status);
                  const formattedDate = format(
                    new Date(record.date),
                    "EEEE, dd MMMM yyyy",
                    { locale: id }
                  );

                  return (
                    <Paper
                      key={record.guid || index}
                      elevation={1}
                      sx={{
                        mb: 2,
                        borderRadius: 2,
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                      onClick={() => handleDetailClick(record)}
                    >
                      <ListItem sx={{ px: 2, py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {renderStatusIcon(uiStatus)}
                        </ListItemIcon>
                        <ListItemText
                          primary={formattedDate}
                          secondary={formatAttendanceTime(record)}
                          primaryTypographyProps={{ fontWeight: "medium" }}
                        />
                      </ListItem>
                    </Paper>
                  );
                })}
              </List>
            ) : (
              <Box sx={{ textAlign: "center", my: 4 }}>
                <Typography>
                  {attendanceRecords.length === 0
                    ? "Tidak ada data absensi pada bulan ini"
                    : "Tidak ada data untuk ditampilkan"}
                </Typography>
              </Box>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  size="medium"
                />
              </Box>
            )}
          </Container>
        </>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default HistoryPage;
