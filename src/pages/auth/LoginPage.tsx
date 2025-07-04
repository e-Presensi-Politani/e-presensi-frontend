import React, { useState, useRef, useEffect } from "react";
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
  IconButton,
} from "@mui/material";
import {
  AccountCircle,
  Lock,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import loginSvg from "../../assets/images/login-logo.png";

// Define types for login
interface LoginCredentials {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();

  // Ref for form container to scroll to it on mobile
  const formRef = useRef<HTMLDivElement>(null);

  // State for form inputs
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });

  // State for error handling
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // State for password visibility
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = () => {
      const accessToken = localStorage.getItem("access_token");
      const user = localStorage.getItem("user");

      if (accessToken && user) {
        try {
          const userData = JSON.parse(user);

          // Check if token is still valid (not expired)
          const tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));
          const currentTime = Math.floor(Date.now() / 1000);

          if (tokenPayload.exp > currentTime) {
            // Token is still valid, redirect to appropriate dashboard
            if (userData.role === "kajur") {
              navigate("/kajur-dashboard", { replace: true });
            } else {
              // Default for "dosen" or any other role
              navigate("/dashboard", { replace: true });
            }
          } else {
            // Token expired, clear localStorage
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");
          }
        } catch (error) {
          console.error("Error parsing token or user data:", error);
          // Clear invalid data
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
        }
      }
    };

    checkAuthStatus();
  }, [navigate]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle password visibility toggle
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle input focus on mobile - scroll to form
  const handleInputFocus = () => {
    if (isMobile && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Use the login function from AuthContext
      await login(credentials.email, credentials.password);

      // Get user from localStorage to determine redirect
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        // Redirect based on user role
        if (user.role === "kajur") {
          navigate("/kajur-dashboard");
        } else {
          // Default for "dosen" or any other role
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.");
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
            src={loginSvg}
            alt="Login Illustration"
            sx={{
              width: { xs: "80%", sm: "60%", md: "80%" },
              maxWidth: { xs: 320, md: 320 },
              height: "auto",
              mt: 8,
              mb: 4,
            }}
          />
        </Box>

        {/* Login form container */}
        <Container
          ref={formRef}
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
              onFocus={handleInputFocus}
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
              type={showPassword ? "text" : "password"}
              variant="outlined"
              value={credentials.password}
              onChange={handleChange}
              onFocus={handleInputFocus}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      sx={{
                        color: "#666",
                        "&:hover": {
                          color: "#0073e6",
                        },
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
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
              disabled={loading || authLoading}
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
              {loading || authLoading ? "Logging in..." : "Login"}
            </Button>
          </Box>
        </Container>
      </Container>
    </Box>
  );
};

export default LoginPage;
