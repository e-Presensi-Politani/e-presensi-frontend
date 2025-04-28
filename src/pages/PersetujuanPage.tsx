import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  IconButton,
  Chip,
  List,
  ListItem,
  AppBar,
  Toolbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

// Define types for our approval items
interface ApprovalItem {
  id: number;
  name: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  status: "Cuti" | "WFH" | "DL" | "WFA";
}

const PersetujuanPage: React.FC = () => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/kajur-dashboard");
  };

  // Sample data based on the image
  const approvalItems: ApprovalItem[] = [
    {
      id: 1,
      name: "M. Ghozi Syah Putra",
      employeeId: "2124323029",
      startDate: "10 Januari 2025",
      endDate: "12 Januari 2025",
      status: "Cuti",
    },
    {
      id: 2,
      name: "M. Ghozi Syah Putra",
      employeeId: "2124323029",
      startDate: "10 Januari 2025",
      endDate: "12 Januari 2025",
      status: "WFH",
    },
    {
      id: 3,
      name: "M. Ghozi Syah Putra",
      employeeId: "2124323029",
      startDate: "10 Januari 2025",
      endDate: "12 Januari 2025",
      status: "DL",
    },
    {
      id: 4,
      name: "M. Ghozi Syah Putra",
      employeeId: "2124323029",
      startDate: "10 Januari 2025",
      endDate: "12 Januari 2025",
      status: "WFA",
    },
    {
      id: 5,
      name: "M. Ghozi Syah Putra",
      employeeId: "2124323029",
      startDate: "10 Januari 2025",
      endDate: "12 Januari 2025",
      status: "Cuti",
    },
    {
      id: 6,
      name: "M. Ghozi Syah Putra",
      employeeId: "2124323029",
      startDate: "10 Januari 2025",
      endDate: "12 Januari 2025",
      status: "Cuti",
    },
  ];

  // Get status color based on status type
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Cuti":
        return "#0073e6"; // Blue
      case "WFH":
        return "#4CAF50"; // Green
      case "DL":
        return "#F44336"; // Red
      case "WFA":
        return "#FFC107"; // Yellow/Amber
      default:
        return "#0073e6"; // Default blue
    }
  };

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", pb: 7 }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: "#0073e6" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, textAlign: "center", mr: 4 }}
          >
            Persetujuan
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Approval Items List */}
      <Container maxWidth="sm" sx={{ mt: 2 }}>
        <List sx={{ p: 0 }}>
          {approvalItems.map((item) => (
            <Paper
              key={item.id}
              elevation={1}
              sx={{
                mb: 2,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <ListItem
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  py: 1.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    src="/path-to-avatar.jpg"
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "#ff7043",
                    }}
                  >
                    M
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "medium" }}
                    >
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.employeeId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.startDate} - {item.endDate}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={item.status}
                  sx={{
                    bgcolor: getStatusColor(item.status),
                    color: "white",
                    fontWeight: "bold",
                    minWidth: 60,
                  }}
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      </Container>

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default PersetujuanPage;
