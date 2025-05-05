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
} from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  ReportProblem as WarningIcon,
} from "@mui/icons-material";
import BottomNav from "../../components/BottomNav";
import { useAttendance } from "../../contexts/AttendanceContext";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
} from "date-fns";
import { id } from "date-fns/locale/id";

// Define the type for monthMap entries
interface MonthMapEntry {
  startDate: string;
  endDate: string;
}

const HistoryPage: React.FC = () => {
  // Get current month and year to initialize the month selector
  const currentDate = new Date();
  const currentMonthYear = format(currentDate, "MMMM yyyy", { locale: id });
  const [month, setMonth] = useState<string>(currentMonthYear);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { attendanceRecords, fetchMyAttendanceRecords, loading, error } =
    useAttendance();
  const itemsPerPage = 5;

  // Dynamically generate monthMap for the year 2025
  const startDate = new Date(2025, 0, 1); // January 2025
  const endDate = new Date(2025, 11, 31); // December 2025
  const monthsInYear = eachMonthOfInterval({ start: startDate, end: endDate });
  const monthMap: { [key: string]: MonthMapEntry } = monthsInYear.reduce(
    (acc, monthDate) => {
      const monthYear = format(monthDate, "MMMM yyyy", { locale: id });
      acc[monthYear] = {
        startDate: format(startOfMonth(monthDate), "yyyy-MM-dd"),
        endDate: format(endOfMonth(monthDate), "yyyy-MM-dd"),
      };
      return acc;
    },
    {} as { [key: string]: MonthMapEntry }
  );

  // Fetch attendance records when month changes, with cleanup to prevent multiple requests
  useEffect(() => {
    const { startDate, endDate } = monthMap[month];
    let isMounted = true;

    const fetchRecords = async () => {
      if (isMounted) {
        await fetchMyAttendanceRecords({ startDate, endDate });
      }
    };

    fetchRecords();

    // Cleanup function to prevent updates after unmount
    return () => {
      isMounted = false;
    };
  }, [month, fetchMyAttendanceRecords]);

  const handleMonthChange = (event: SelectChangeEvent) => {
    setMonth(event.target.value);
    setPage(1); // Reset to first page when month changes
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Handle navigation based on status
  const handleDetailClick = (status: string) => {
    switch (status.toLowerCase()) {
      case "present":
        navigate("/attendance-present");
        break;
      case "absent":
        navigate("/attendance-absent");
        break;
      case "late":
      case "earlydeparture":
        navigate("/attendance-problem");
        break;
      default:
        navigate("/attendance-present");
    }
  };

  // Render status icon based on attendance status
  const renderStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "present":
        return <CheckIcon style={{ color: "#4CAF50" }} />;
      case "absent":
        return <CloseIcon style={{ color: "#F44336" }} />;
      case "late":
      case "earlydeparture":
        return <WarningIcon style={{ color: "#FFC107" }} />;
      default:
        return null;
    }
  };

  // Format attendance data for display
  const formatAttendanceTime = (attendance: any) => {
    if (!attendance.checkInTime && !attendance.checkOutTime) return "--:--";
    const checkIn = attendance.checkInTime
      ? format(new Date(attendance.checkInTime), "HH:mm")
      : "--:--";
    const checkOut = attendance.checkOutTime
      ? format(new Date(attendance.checkOutTime), "HH:mm")
      : "--:--";
    return `${checkIn} - ${checkOut}`;
  };

  // Calculate paginated data
  const totalPages = Math.ceil(attendanceRecords.length / itemsPerPage);
  const paginatedData = attendanceRecords.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

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
            value={month}
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
            {Object.keys(monthMap).map((monthYear) => (
              <MenuItem key={monthYear} value={monthYear}>
                {monthYear}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Container>

      {/* Attendance list */}
      <Container maxWidth="sm" sx={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : paginatedData.length === 0 ? (
          <Typography align="center">Tidak ada data presensi</Typography>
        ) : (
          <List sx={{ p: 0 }}>
            {paginatedData.map((item, index) => (
              <Paper
                key={item.guid}
                elevation={1}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                onClick={() => handleDetailClick(item.status)}
              >
                <ListItem sx={{ px: 2, py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {renderStatusIcon(item.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={format(new Date(item.date), "EEEE, dd MMMM yyyy", {
                      locale: id,
                    })}
                    secondary={formatAttendanceTime(item)}
                    primaryTypographyProps={{ fontWeight: "medium" }}
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
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

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default HistoryPage;
