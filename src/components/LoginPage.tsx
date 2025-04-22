import React from "react";
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
} from "@mui/material";
import { AccountCircle, Lock } from "@mui/icons-material";

const LoginPage: React.FC = () => {
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

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
        overflow: "hidden", // Prevents scrollbars if content exactly matches viewport
        position: "fixed", // Forces the box to cover the entire viewport
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
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {/* Email input */}
            <TextField
              fullWidth
              placeholder="Email"
              variant="outlined"
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
              placeholder="Password"
              type="password"
              variant="outlined"
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
            >
              Forget Password?
            </Typography>

            {/* Login button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
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
              Login
            </Button>
          </Box>
        </Container>
      </Container>
    </Box>
  );
};

export default LoginPage;
