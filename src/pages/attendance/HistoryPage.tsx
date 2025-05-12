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
  HelpOutline as UnknownIcon,
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
  const [month, setMonth] = useState<string>(
    format(new Date(), "MMMM yyyy", { locale: id })
  );
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { attendanceRecords, fetchMyAttendanceRecords, loading, error } =
    useAttendance();
  const itemsPerPage = 5;

  const startDate = new Date(2025, 0, 1);
  const endDate = new Date(2025, 11, 31);
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

  useEffect(() => {
    const { startDate, endDate } = monthMap[month];
    let isMounted = true;

    const fetchRecords = async () => {
      if (isMounted) {
        await fetchMyAttendanceRecords({ startDate, endDate });
      }
    };

    fetchRecords();

    return () => {
      isMounted = false;
    };
  }, [month, fetchMyAttendanceRecords]);

  const handleMonthChange = (event: SelectChangeEvent) => {
    setMonth(event.target.value);
    setPage(1);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleDetailClick = (status: string, guid: string) => {
    switch (status.toLowerCase()) {
      case "present":
      case "on_leave":
      case "official_travel":
      case "remote_working":
        navigate(`/attendance-present/${guid}`);
        break;
      case "absent":
        navigate(`/attendance-absent/${guid}`);
        break;
      case "late":
      case "early_departure":
        navigate(`/attendance-problem/${guid}`);
        break;
      default:
        navigate(`/attendance-present/${guid}`);
    }
  };

  const renderStatusIcon = (status: string) => {
    const normalizedStatus = status ? status.toLowerCase().trim() : "";
    switch (normalizedStatus) {
      case "present":
      case "remote_working":
        return <CheckIcon style={{ color: "#4CAF50" }} />;
      case "absent":
        return <CloseIcon style={{ color: "#F44336" }} />;
      case "late":
      case "early_departure":
        return <WarningIcon style={{ color: "#FFC107" }} />;
      default:
        return <UnknownIcon style={{ color: "#757575" }} />;
    }
  };

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
      <Box
        sx={{ bgcolor: "#1976D2", p: 2, color: "white", textAlign: "center" }}
      >
        <Typography variant="h6">Riwayat Presensi</Typography>
      </Box>
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
          <Typography align="center" sx={{ color: "black" }}>
            Tidak ada data presensi
          </Typography>
        ) : (
          <List sx={{ p: 0 }}>
            {paginatedData.map((item) => (
              <Paper
                key={item.guid}
                elevation={1}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                onClick={() => handleDetailClick(item.status, item.guid)}
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
      <BottomNav />
    </Box>
  );
};

export default HistoryPage;
