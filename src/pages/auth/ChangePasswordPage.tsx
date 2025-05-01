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
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import { useAuth } from "../../contexts/AuthContext";

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { changePassword, loading } = useAuth();

  // Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [formErrors, setFormErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const handleBack = () => {
    navigate("/profile");
  };

  const validateForm = () => {
    const errors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};
    let isValid = true;

    // Check required fields
    if (!currentPassword) {
      errors.currentPassword = "Password lama harus diisi";
      isValid = false;
    }

    if (!newPassword) {
      errors.newPassword = "Password baru harus diisi";
      isValid = false;
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password minimal 8 karakter";
      isValid = false;
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Konfirmasi password harus diisi";
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Password baru dan konfirmasi tidak cocok";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await changePassword(currentPassword, newPassword, confirmPassword);

      // Show success message
      setSnackbar({
        open: true,
        message: "Password berhasil diubah",
        severity: "success",
      });

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Navigate back after a short delay
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Gagal mengubah password",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ bgcolor: "#ffffff", width: "100%", height: "100vh" }}>
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
        {/* Current Password Field */}
        <Typography variant="body1" sx={{ mb: 1, color: "black" }}>
          Password Lama
        </Typography>
        <TextField
          fullWidth
          type="password"
          placeholder="Masukkan Password Lama Anda"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          error={!!formErrors.currentPassword}
          helperText={formErrors.currentPassword}
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
          error={!!formErrors.newPassword}
          helperText={formErrors.newPassword}
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
          error={!!formErrors.confirmPassword}
          helperText={formErrors.confirmPassword}
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
          disabled={loading}
          sx={{
            bgcolor: "#1976D2",
            color: "white",
            py: 1.5,
            borderRadius: 4,
            textTransform: "none",
            fontSize: "1rem",
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Simpan"}
        </Button>
      </Box>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Custom Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default ChangePasswordPage;
