// src/components/DepartmentReportGenerator.tsx
import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  SelectChangeEvent,
  Typography,
  Avatar,
  Box,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { ReportPeriod, ReportFormat } from "../types/statistics";
import { useStatistics } from "../contexts/StatisticsContext";
import { User } from "../types/users";

interface DepartmentReportGeneratorProps {
  selectedUser?: User | null;
  onClose?: () => void;
}

const DepartmentReportGenerator: React.FC<DepartmentReportGeneratorProps> = ({
  selectedUser,
  onClose,
}) => {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState<ReportPeriod>(ReportPeriod.MONTHLY);
  const [format, setFormat] = useState<ReportFormat>(ReportFormat.EXCEL);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [title, setTitle] = useState<string>("Laporan Kehadiran Jurusan");
  const [isGenerating, setIsGenerating] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const { generateReport, downloadReport } = useStatistics();

  const handleOpen = () => {
    // Set default dates based on current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setStartDate(firstDayOfMonth.toISOString().split("T")[0]);
    setEndDate(lastDayOfMonth.toISOString().split("T")[0]);

    // Set title based on selected user
    if (selectedUser) {
      setTitle(`Laporan Kehadiran - ${selectedUser.fullName}`);
    } else {
      setTitle("Laporan Kehadiran Jurusan");
    }

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const handlePeriodChange = (event: SelectChangeEvent<ReportPeriod>) => {
    const selectedPeriod = event.target.value as ReportPeriod;
    setPeriod(selectedPeriod);

    // Set default dates based on selected period
    const now = new Date();
    const userName = selectedUser ? ` - ${selectedUser.fullName}` : "";

    if (selectedPeriod === ReportPeriod.DAILY) {
      setStartDate(now.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
      setTitle(`Laporan Harian${userName}`);
    } else if (selectedPeriod === ReportPeriod.WEEKLY) {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(now);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      setStartDate(startOfWeek.toISOString().split("T")[0]);
      setEndDate(endOfWeek.toISOString().split("T")[0]);
      setTitle(`Laporan Mingguan${userName}`);
    } else if (selectedPeriod === ReportPeriod.MONTHLY) {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      setStartDate(firstDayOfMonth.toISOString().split("T")[0]);
      setEndDate(lastDayOfMonth.toISOString().split("T")[0]);
      setTitle(`Laporan Bulanan${userName}`);
    } else if (selectedPeriod === ReportPeriod.CUSTOM) {
      // Keep current dates for custom period
      setTitle(`Laporan Kustom${userName}`);
    }
  };

  const handleFormatChange = (event: SelectChangeEvent<ReportFormat>) => {
    setFormat(event.target.value as ReportFormat);
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);

      // Prepare parameters for generateReport (for department/admin use)
      const reportParams = {
        format,
        period,
        startDate,
        endDate,
        title,
        // Add user filter if specific user is selected
        ...(selectedUser && { userGuid: selectedUser.guid }),
      };

      const response = await generateReport(reportParams);

      // Download the report with correct API path
      await downloadReport(response.data.downloadUrl);

      const userText = selectedUser ? ` untuk ${selectedUser.fullName}` : "";
      setSnackbarMessage(`Berhasil membuat dan mengunduh laporan${userText}!`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleClose();
    } catch (error) {
      console.error("Error generating department report:", error);
      setSnackbarMessage("Gagal membuat laporan. Silakan coba lagi.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={<DownloadIcon />}
        onClick={handleOpen}
        sx={{
          width: "100%",
          py: 1.5,
          textTransform: "none",
          borderRadius: 1,
          boxShadow: 2,
          mb: 1,
          bgcolor: "#1976D2",
        }}
      >
        {selectedUser
          ? `Generate Laporan - ${selectedUser.fullName}`
          : "Generate Laporan Jurusan"}
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: "#1976D2", color: "white" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {selectedUser && (
              <Avatar
                src={selectedUser.profileImageUrl || undefined}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "#fff",
                  color: "#1976D2",
                }}
              >
                {getInitial(selectedUser.fullName)}
              </Avatar>
            )}
            <Box>
              <Typography variant="h6">
                {selectedUser ? "Laporan Individual" : "Laporan Jurusan"}
              </Typography>
              {selectedUser && (
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedUser.fullName} - {selectedUser.nip}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pb: 1.5 }}>
          <Grid container spacing={2}>
            <Grid>
              <TextField
                fullWidth
                label="Judul Laporan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                variant="outlined"
                sx={{ mt: 2 }}
              />
            </Grid>

            <Grid>
              <FormControl fullWidth>
                <InputLabel id="period-select-label">Periode</InputLabel>
                <Select
                  labelId="period-select-label"
                  value={period}
                  label="Periode"
                  onChange={handlePeriodChange}
                >
                  <MenuItem value={ReportPeriod.DAILY}>Harian</MenuItem>
                  <MenuItem value={ReportPeriod.WEEKLY}>Mingguan</MenuItem>
                  <MenuItem value={ReportPeriod.MONTHLY}>Bulanan</MenuItem>
                  <MenuItem value={ReportPeriod.CUSTOM}>Kustom</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid>
              <FormControl fullWidth>
                <InputLabel id="format-select-label">Format</InputLabel>
                <Select
                  labelId="format-select-label"
                  value={format}
                  label="Format"
                  onChange={handleFormatChange}
                >
                  <MenuItem value={ReportFormat.EXCEL}>Excel</MenuItem>
                  <MenuItem value={ReportFormat.PDF}>PDF</MenuItem>
                  <MenuItem value={ReportFormat.CSV}>CSV</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid>
              <TextField
                fullWidth
                label="Tanggal Mulai"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid>
              <TextField
                fullWidth
                label="Tanggal Selesai"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={isGenerating}
          >
            Batal
          </Button>
          <Button
            onClick={handleGenerate}
            variant="contained"
            startIcon={
              isGenerating ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <DownloadIcon />
              )
            }
            disabled={isGenerating}
          >
            {isGenerating ? "Mengunduh..." : "Generate"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DepartmentReportGenerator;
