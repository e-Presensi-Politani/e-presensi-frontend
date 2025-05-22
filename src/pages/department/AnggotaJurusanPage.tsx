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
import BottomNav from "../../components/BottomNav";
import { useNavigate } from "react-router-dom";



// Sample data for demonstration
const anggotaJurusan = [
  {
    id: 1,
    name: "M. Ghozi Syah Putra",
    nip: "2124323029",
  },
  {
    id: 2,
    name: "M. Ghozi Syah Putra",
    nip: "2124323029",
  },
  {
    id: 3,
    name: "M. Ghozi Syah Putra",
    nip: "2124323029",
  },
  {
    id: 4,
    name: "M. Ghozi Syah Putra",
    nip: "2124323029",
  },
];

const AnggotaJurusanPage: React.FC = () => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/kajur-dashboard");
  };

  const handleAnggotaClick = (id: number) => {
    // Handle member click
    console.log("Clicked member:", id);
  };

  // Get initial for avatar
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <Box sx={{ bgcolor: "#f5f5f5", width: "100%", minHeight: "100vh", pb: 7 }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: "#4285f4" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, textAlign: "center", mr: 4 }}
          >
            Anggota Jurusan
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container maxWidth="sm" sx={{ mt: 2 }}>
        <List sx={{ p: 0 }}>
          {anggotaJurusan.map((anggota) => (
            <Paper
              onClick={() => handleAnggotaClick(anggota.id)}
              key={anggota.id}
              elevation={1}
              sx={{
                mb: 2,
                borderRadius: 2,
                overflow: "hidden",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "#f8f9fa",
                },
              }}
            >
              <ListItem
                sx={{
                  display: "flex",
                  alignItems: "center",
                  py: 2,
                  px: 2,
                }}
              >
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "#ff7043",
                    mr: 2,
                  }}
                >
                  {getInitial(anggota.name)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 500,
                      color: "#333",
                      mb: 0.5,
                    }}
                  >
                    {anggota.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.875rem" }}
                  >
                    {anggota.nip}
                  </Typography>
                </Box>
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

export default AnggotaJurusanPage;
