import React from "react";
import { Paper, IconButton } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import EventNoteIcon from "@mui/icons-material/EventNote";
import HistoryIcon from "@mui/icons-material/DescriptionOutlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import { useLocation, useNavigate } from "react-router-dom";

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Handler for navigation
  const goTo = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "space-around",
        p: 1,
        borderTop: "1px solid #e0e0e0",
        zIndex: 1000,
        bgcolor: "#fff",
      }}
    >
      {/* Dashboard */}
      <IconButton
        onClick={() => goTo("/dashboard")}
        color={location.pathname === "/dashboard" ? "primary" : "default"}
      >
        <HomeIcon />
      </IconButton>

      {/* Leave Request */}
      <IconButton
        onClick={() => goTo("/leave-request")}
        color={location.pathname === "/leave-request" ? "error" : "default"}
      >
        <EventNoteIcon />
      </IconButton>

      {/* Fingerprint: only on Dashboard */}
      {location.pathname === "/dashboard" && (
        <IconButton
          onClick={() => goTo("/presensi")}
          sx={{
            backgroundColor: "#0073e6",
            color: "white",
            borderRadius: "50%",
            p: 1,
            transform: "scale(1.2)",
            "&:hover": { backgroundColor: "#0066cc" },
          }}
        >
          <FingerprintIcon />
        </IconButton>
      )}

      {/* History */}
      <IconButton
        onClick={() => goTo("/history")}
        color={location.pathname === "/history" ? "warning" : "default"}
      >
        <HistoryIcon />
      </IconButton>

      {/* Profile */}
      <IconButton
        onClick={() => goTo("/profile")}
        color={location.pathname === "/profile" ? "info" : "default"}
      >
        <AccountCircleIcon />
      </IconButton>
    </Paper>
  );
};

export default BottomNav;
