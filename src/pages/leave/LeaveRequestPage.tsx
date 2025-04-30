import React from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Fab,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HelpIcon from "@mui/icons-material/Help";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import BottomNav from "../../components/BottomNav";
import { useNavigate } from "react-router-dom";

interface LeaveRequestItemProps {
  type: string;
  date: string;
  status: "pending" | "approved" | "rejected";
}

const LeaveRequestItem: React.FC<LeaveRequestItemProps> = ({
  type,
  date,
  status,
}) => {
  return (
    <Card
      sx={{
        mb: 2,
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: 2,
      }}
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
            {date}
          </Typography>
        </Box>
        {status === "pending" && (
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
        {status === "approved" && (
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
        {status === "rejected" && (
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

const LeaveRequestPage: React.FC = () => {
  const navigate = useNavigate();

  const handleForm = () => {
    navigate("/leave-request-form");
  };

  return (
    <Box sx={{ bgcolor: "#f5f5f5", height: "100vh", width: "100vw", pb: 8 }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#1976d2",
          color: "white",
          py: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h6">Pengajuan</Typography>
      </Box>

      {/* Content */}
      <Container sx={{ pt: 2, pb: 8 }}>
        <LeaveRequestItem type="Cuti" date="10 Januari 2025" status="pending" />

        <LeaveRequestItem type="WFH" date="09 Januari 2025" status="approved" />

        <LeaveRequestItem
          type="Cuti"
          date="08 Januari 2025"
          status="rejected"
        />
      </Container>

      {/* Upload File Button*/}
      <Fab
        onClick={handleForm}
        color="primary"
        size="medium"
        aria-label="Ajukan Izin"
        sx={{
          position: "fixed",
          bottom: 80,
          right: 24,
        }}
      >
        <UploadFileIcon />
      </Fab>

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default LeaveRequestPage;
