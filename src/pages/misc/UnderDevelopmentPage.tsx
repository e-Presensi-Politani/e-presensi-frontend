import React from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  LinearProgress,
  useTheme,
} from "@mui/material";
import {
  Construction as ConstructionIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const UnderDevelopmentPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <ConstructionIcon
            sx={{
              fontSize: 80,
              color: theme.palette.primary.main,
              mb: 2,
            }}
          />

          <Typography
            variant="h5"
            component="h1"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            Halaman Sedang Dikembangkan
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            paragraph
            sx={{ mb: 3, maxWidth: 450 }}
          >
            Maaf, fitur ini masih dalam proses pengembangan dan akan segera
            tersedia. Terima kasih atas kesabaran Anda.
          </Typography>

          <Box sx={{ width: "100%", mb: 3 }}>
            <LinearProgress
              variant="indeterminate"
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: theme.palette.grey[200],
                "& .MuiLinearProgress-bar": {
                  bgcolor: theme.palette.primary.main,
                },
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Pengembangan dalam progres
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/dashboard")}
            sx={{
              borderRadius: 6,
              px: 2,
              py: 1,
              textTransform: "none",
              fontWeight: "medium",
            }}
          >
            Kembali ke Dashboard
          </Button>
        </Paper>

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Estimasi penyelesaian: Mei 2025
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            © {new Date().getFullYear()} e-Presensi Politani
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default UnderDevelopmentPage;
