import React from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
} from "@mui/material";
import HelpIcon from "@mui/icons-material/Help";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BottomNav from "../../components/BottomNav";

const StatusPengajuanKoreksi: React.FC = () => {
  const statusItems = [
    { title: "Jam Kerja Kurang", date: "10 Januari 2025", status: "pending" },
    { title: "Terlambat", date: "09 Januari 2025", status: "approved" },
    { title: "Terlambat", date: "08 Januari 2025", status: "rejected" },
  ];

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
        <Typography variant="h6">Status Pengajuan Koreksi</Typography>
      </Box>

      {/* Content */}
      <Container sx={{ pt: 2, pb: 8 }}>
        {statusItems.map((item, index) => (
          <Card
            key={index}
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
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.date}
                </Typography>
              </Box>
              {item.status === "pending" && (
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
              {item.status === "approved" && (
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
              {item.status === "rejected" && (
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
        ))}
      </Container>

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default StatusPengajuanKoreksi;