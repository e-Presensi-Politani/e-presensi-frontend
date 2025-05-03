import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Fab,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HelpIcon from "@mui/icons-material/Help";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import BottomNav from "../../components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useLeaveRequests } from "../../contexts/LeaveRequestsContext";
import { format } from "date-fns";
import {
  LeaveRequestStatus,
  LeaveRequestTypeLabels,
} from "../../types/leave-request-enums";
import { LeaveRequest } from "../../types/leave-requests";

interface LeaveRequestItemProps {
  leaveRequest: LeaveRequest;
  onClick?: () => void;
}

const LeaveRequestItem: React.FC<LeaveRequestItemProps> = ({
  leaveRequest,
  onClick,
}) => {
  const { type, startDate, status } = leaveRequest;
  const formattedDate = format(new Date(startDate), "dd MMMM yyyy");

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
            {LeaveRequestTypeLabels[type] || type}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formattedDate}
          </Typography>
        </Box>
        {status === LeaveRequestStatus.PENDING && (
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
        {status === LeaveRequestStatus.APPROVED && (
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
        {status === LeaveRequestStatus.REJECTED && (
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
  const { myRequests, loading, error, fetchMyRequests, clearError } =
    useLeaveRequests();

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleForm = () => {
    navigate("/leave-request-form");
  };

  const handleDetail = (guid: string) => {
    // Navigasi langsung dengan parameter ID tanpa menyimpan di localStorage
    navigate(`/detail-request/${guid}`);
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
          color: "white",
          py: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h6">Pengajuan</Typography>
      </Box>

      {/* Content */}
      <Container sx={{ pt: 2, pb: 8 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : myRequests.length > 0 ? (
          myRequests.map((request) => (
            <LeaveRequestItem
              key={request.guid}
              leaveRequest={request}
              onClick={() => handleDetail(request.guid)}
            />
          ))
        ) : (
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography color="textSecondary">
              Belum ada pengajuan. Klik tombol + untuk membuat pengajuan baru.
            </Typography>
          </Box>
        )}
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

export default LeaveRequestPage;
