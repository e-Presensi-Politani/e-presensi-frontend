// src/pages/correction/StatusCorrectionPage.tsx
import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HelpIcon from "@mui/icons-material/Help";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BottomNav from "../../components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useCorrections } from "../../contexts/CorrectionsContext";
import { Correction } from "../../types/corrections";
import { format } from "date-fns";

interface CorrectionItemProps {
  correction: Correction;
  onClick?: () => void;
}

const CorrectionItem: React.FC<CorrectionItemProps> = ({
  correction,
  onClick,
}) => {
  const { type, createdAt, status } = correction;
  const formattedDate = format(new Date(createdAt), "dd MMMM yyyy");

  return (
    <Card
      sx={{
        mb: 2,
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: 2,
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      <CardContent
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 1.5,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: "medium" }}
          >
            {type}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formattedDate}
          </Typography>
        </Box>
        {status === "PENDING" && (
          <Box
            sx={{
              bgcolor: "#FFEBBC",
              borderRadius: "8px",
              width: 36,
              height: 36,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <HelpIcon sx={{ color: "#F9A825" }} />
          </Box>
        )}
        {status === "APPROVED" && (
          <Box
            sx={{
              bgcolor: "#D7F5DB",
              borderRadius: "8px",
              width: 36,
              height: 36,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CheckCircleIcon sx={{ color: "#4CAF50" }} />
          </Box>
        )}
        {status === "REJECTED" && (
          <Box
            sx={{
              bgcolor: "#FEEBEE",
              borderRadius: "8px",
              width: 36,
              height: 36,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CancelIcon sx={{ color: "#F44336" }} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const StatusCorrectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { corrections, loading, error, fetchMyCorrections, clearError } =
    useCorrections();

  useEffect(() => {
    fetchMyCorrections();
  }, []);

  const handleBack = () => {
    navigate("/history");
  };

  const handleDetail = (guid: string) => {
    navigate(`/correction-detail/${guid}`);
  };

  return (
    <Box
      sx={{
        bgcolor: "#f5f5f5",
        minHeight: "100vh",
        width: "100%",
        pb: 8,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#1976d2",
          height: "5vh",
          p: 2,
          color: "white",
          display: "flex",
          alignItems: "center",
        }}
      >
        <IconButton color="inherit" onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, textAlign: "center", mr: 4 }}
        >
          Status Pengajuan Koreksi
        </Typography>
      </Box>

      {/* Content */}
      <Container sx={{ pt: 2, pb: 8 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : corrections.length > 0 ? (
          corrections.map((correction) => (
            <CorrectionItem
              key={correction.guid}
              correction={correction}
              onClick={() => handleDetail(correction.guid)}
            />
          ))
        ) : (
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography color="textSecondary">
              Belum ada pengajuan koreksi. Silakan buat pengajuan baru dari menu
              utama.
            </Typography>
          </Box>
        )}
      </Container>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={clearError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={clearError} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default StatusCorrectionPage;
