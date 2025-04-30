import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleBack = () => {
    navigate("/profile");
  };

  const handleSave = () => {
    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Semua field harus diisi");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Password baru dan konfirmasi password tidak cocok");
      return;
    }

    // Here you would typically call an API to update the password
    alert("Password berhasil diubah");
    navigate("/profile");
  };

  return (
    <Box sx={{ bgcolor: "#ffffff", width: "100vw", height: "100vh" }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          height: 64,
          bgcolor: "#1976D2",
          color: "white",
          display: "flex",
          alignItems: "center",
          borderRadius: 0,
        }}
      >
        <IconButton onClick={handleBack} sx={{ color: "white", ml: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, textAlign: "center", mr: 4 }}
        >
          Ganti Password
        </Typography>
      </Paper>

      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
        {/* Old Password Field */}
        <Typography variant="body1" sx={{ mb: 1, color: "black" }}>
          Password Lama
        </Typography>
        <TextField
          fullWidth
          type="password"
          placeholder="Masukkan Password Lama Anda"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon sx={{ color: "#1976D2" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              bgcolor: "white",
              borderRadius: 2,
              border: "1px solid #e0e0e0",
            },
          }}
        />

        {/* New Password Field */}
        <Typography variant="body1" sx={{ mb: 1, color: "black" }}>
          Password Baru
        </Typography>
        <TextField
          fullWidth
          type="password"
          placeholder="Masukkan Password Baru Anda"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon sx={{ color: "#1976D2" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              bgcolor: "white",
              borderRadius: 2,
              border: "1px solid #e0e0e0",
            },
          }}
        />

        {/* Confirm New Password Field */}
        <Typography variant="body1" sx={{ mb: 1, color: "black" }}>
          Konfirmasi Password Baru
        </Typography>
        <TextField
          fullWidth
          type="password"
          placeholder="Konfirmasi Password Baru Anda"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon sx={{ color: "#1976D2" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 4,
            "& .MuiOutlinedInput-root": {
              bgcolor: "white",
              borderRadius: 2,
              border: "1px solid #e0e0e0",
            },
          }}
        />

        {/* Save Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleSave}
          sx={{
            bgcolor: "#1976D2",
            color: "white",
            py: 1.5,
            borderRadius: 4,
            textTransform: "none",
            fontSize: "1rem",
          }}
        >
          Simpan
        </Button>
      </Box>

      {/* Custom Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default ChangePasswordPage;
