import React, { useState, useEffect } from "react";
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
  const [userRole, setUserRole] = useState<string>("dosen"); // Default role

  // Get user role from localStorage on component mount
  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.role) {
          setUserRole(user.role);
        }
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }
  }, []);

  // Determine home path based on user role
  const getHomePath = () => {
    return userRole === "kajur" ? "/kajur-dashboard" : "/dashboard";
  };

  // Handler for navigation
  const goTo = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  // Current home path based on user role
  const homePath = getHomePath();

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
      {/* Dashboard - redirects based on user role */}
      <IconButton
        onClick={() => goTo(homePath)}
        color={location.pathname === homePath ? "primary" : "default"}
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
      {(location.pathname === "/dashboard" ||
        location.pathname === "/kajur-dashboard") && (
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
