import React, { useState } from "react";
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
} from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  ReportProblem as WarningIcon,
} from "@mui/icons-material";
import BottomNav from "../../components/BottomNav";

const HistoryPage: React.FC = () => {
  const [month, setMonth] = useState("Januari 2025");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const handleMonthChange = (event: SelectChangeEvent) => {
    setMonth(event.target.value);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  // Updated function to handle navigation based on status
  const handleDetailClick = (status: string) => {
    switch (status) {
      case "present":
        navigate("/attendance-present");
        break;
      case "absent":
        navigate("/attendance-absent");
        break;
      case "warning":
        navigate("/attendance-problem");
        break;
      default:
        navigate("/attendance-present");
    }
  };

  // Sample attendance data
  const attendanceData = [
    {
      date: "Rabu, 01 Januari 2025",
      time: "07:00 - 15:30",
      status: "present",
    },
    {
      date: "Kamis, 02 Januari 2025",
      time: "--:--",
      status: "absent",
    },
    {
      date: "Jum'at, 03 Januari 2025",
      time: "08:00 - 16:00",
      status: "present",
    },
    {
      date: "Senin, 06 Januari 2025",
      time: "09:00 - 16:00",
      status: "warning",
    },
    {
      date: "Selasa, 07 Januari 2025",
      time: "--:-- - 16:00",
      status: "warning",
    },
  ];

  // Function to render status icon
  const renderStatusIcon = (status: string) => {
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
        width: "100%", // Changed from 100vw to 100%
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden", // Added to prevent horizontal scrolling
        pb: 8, // Add padding for bottom nav
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
            <MenuItem value="Januari 2025">Januari 2025</MenuItem>
            <MenuItem value="Februari 2025">Februari 2025</MenuItem>
            <MenuItem value="Maret 2025">Maret 2025</MenuItem>
          </Select>
        </FormControl>
      </Container>

      {/* Attendance list */}
      <Container maxWidth="sm" sx={{ flex: 1, overflowY: "auto" }}>
        <List sx={{ p: 0 }}>
          {attendanceData.map((item, index) => (
            <Paper
              key={index}
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
                  primary={item.date}
                  secondary={item.time}
                  primaryTypographyProps={{ fontWeight: "medium" }}
                />
              </ListItem>
            </Paper>
          ))}
        </List>

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <Pagination
            count={4}
            page={page}
            onChange={handlePageChange}
            size="medium"
          />
        </Box>
      </Container>

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default HistoryPage;
