import React, { useState } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  InputAdornment,
  CssBaseline,
  Paper,
  useMediaQuery,
  Theme,
  Alert,
} from "@mui/material";
import { AccountCircle, Lock } from "@mui/icons-material";
import { AuthService } from "../services/AuthService";
import axios from "axios";

// Define types for login
interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    guid: string;
    fullName: string;
    email: string;
    role: string;
    profileImage?: string;
  };
}

const LoginPage: React.FC = () => {
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

  // State for form inputs
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });

  // State for error handling
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Call AuthService to handle login
      const response = await AuthService.login(
        credentials.email,
        credentials.password
      );

      // Store tokens in localStorage
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);

      // Store user data
      localStorage.setItem("user", JSON.stringify(response.user));

      // Redirect to dashboard or home page
      window.location.href = "/dashboard"; // Change this to your app's post-login route
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(
          err.response.data.message ||
            "Login failed. Please check your credentials."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };


  // Handle password reset
  const handleForgotPassword = () => {
    // Implement password reset logic or navigation
    console.log("Forgot password clicked");
  };

  return (
    <Box
      sx={{
        bgcolor: "#0073e6",
        minHeight: "100vh",
        width: "100%",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <CssBaseline />

      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          gap: { md: 6 },
          height: "100%",
        }}
      >
        {/* Logo and illustration section */}
        <Box
          sx={{
            mb: { xs: 4, md: 0 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: { md: "1" },
          }}
        >
          <Box
            component="img"
            src="/src/assets/login.svg"
            alt="Login Illustration"
            sx={{
              width: { xs: "80%", sm: "60%", md: "80%" },
              maxWidth: { xs: 240, md: 320 },
              height: "auto",
              mt: 8,
              mb: 2,
            }}
          />
          <Typography
            component="h1"
            variant="h5"
            sx={{
              color: "white",
              fontWeight: 500,
              fontSize: { xs: "1.5rem", md: "2rem" },
              mt: 2,
            }}
          >
            e-Presensi Politani
          </Typography>
        </Box>

        {/* Login form container */}
        <Container
          component={Paper}
          maxWidth={isDesktop ? "sm" : "xs"}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            borderBottomLeftRadius: { xs: "0%", md: 15 },
            borderBottomRightRadius: { xs: "0%", md: 15 },
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            width: { xs: "calc(100% - 10px)", md: "400px" },
            flex: { md: "1" },
            height: { xs: "100vh", md: "auto" },
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Email input */}
            <TextField
              fullWidth
              name="email"
              placeholder="Email"
              variant="outlined"
              value={credentials.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle />
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: "#f9f9f9",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            {/* Password input */}
            <TextField
              fullWidth
              name="password"
              placeholder="Password"
              type="password"
              variant="outlined"
              value={credentials.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: "#f9f9f9",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            {/* Forgot password link */}
            <Typography
              variant="body2"
              align="left"
              sx={{
                color: "#666",
                cursor: "pointer",
                mb: 2,
              }}
              onClick={handleForgotPassword}
            >
              Forget Password?
            </Typography>

            {/* Login button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                bgcolor: "#0073e6",
                borderRadius: 6,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": {
                  bgcolor: "#0066cc",
                },
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Box>
        </Container>
      </Container>
    </Box>
  );
};

export default LoginPage;
