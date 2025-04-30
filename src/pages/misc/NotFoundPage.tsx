import React from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  useTheme,
} from "@mui/material";
import {
  SentimentDissatisfied as SadFaceIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const NotFoundPage: React.FC = () => {
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
          <SadFaceIcon
            sx={{
              fontSize: 100,
              color: theme.palette.primary.main,
              mb: 2,
            }}
          />

          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            404
          </Typography>

          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 1 }}>
            Halaman Tidak Ditemukan
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            paragraph
            sx={{ mb: 3 }}
          >
            Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/dashboard")}
            sx={{
              borderRadius: 6,
              px: 3,
              py: 1,
              textTransform: "none",
              fontWeight: "medium",
            }}
          >
            Kembali ke Beranda
          </Button>
        </Paper>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 4 }}
        >
          © {new Date().getFullYear()} e-Presensi Politani
        </Typography>
      </Container>
    </Box>
  );
};

export default NotFoundPage;
