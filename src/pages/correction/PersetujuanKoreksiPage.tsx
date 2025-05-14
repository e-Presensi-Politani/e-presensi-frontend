// src/pages/attendance/PersetujuanKoreksiPage.tsx
import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  IconButton,
  List,
  ListItem,
  AppBar,
  Toolbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";

// Mock data for our UI demonstration
const mockCorrections = [
  {
    id: "1",
    userId: "2124323029",
    userName: "M. Ghozi Syah Putra",
    type: "Jam Kerja Kurang",
  },
  {
    id: "2",
    userId: "2124323029",
    userName: "M. Ghozi Syah Putra",
    type: "Terlambat",
  },
  {
    id: "3",
    userId: "2124323029",
    userName: "M. Ghozi Syah Putra",
    type: "Jam Kerja Kurang",
  },
  {
    id: "4",
    userId: "2124323029",
    userName: "M. Ghozi Syah Putra",
    type: "Terlambat",
  },
];

const PersetujuanKoreksiPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/kajur-dashboard"); // Navigate back to the dashboard
  };

  const handleDetail = (id: string) => {
    navigate(`/persetujuan-koreksi-detail/${id}`); // Navigate to detail page
  };

  // Get initial for avatar
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <Box sx={{ bgcolor: "#f5f5f5", width: "100%", minHeight: "100vh", pb: 7 }}>
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
            Persetujuan Koreksi
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container maxWidth="sm" sx={{ mt: 2 }}>
        {mockCorrections.length === 0 ? (
          <Paper
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 2,
              textAlign: "center",
            }}
          >
            <Typography variant="body1">
              Tidak ada koreksi yang perlu disetujui saat ini.
            </Typography>
          </Paper>
        ) : (
          <List sx={{ p: 0 }}>
            {mockCorrections.map((correction) => (
              <Paper
                onClick={() => handleDetail(correction.id)}
                key={correction.id}
                elevation={1}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                <ListItem
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    py: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: "#ff7043",
                      }}
                    >
                      {getInitial(correction.userName)}
                    </Avatar>
                    <Box sx={{ ml: 2 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "medium" }}
                      >
                        {correction.userName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {correction.userId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {correction.type}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </Container>

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default PersetujuanKoreksiPage;