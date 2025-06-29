import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  IconButton,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Avatar,
  Divider,
} from "@mui/material";
import {
  ArrowBack,
  Assessment,
  People,
  Settings,
  CheckCircle,
  Group,
} from "@mui/icons-material";
import BottomNav from "../../components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../contexts/UserContext";
import { useAuth } from "../../contexts/AuthContext";
import { useStatistics } from "../../contexts/StatisticsContext";
import { User } from "../../types/users";
import {
  ReportPeriod,
  ReportFormat,
  BulkReportScope,
  GenerateBulkReportParams,
} from "../../types/statistics";
import Swal from "sweetalert2";

const JurusanPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const {
    fetchUsersByDepartment,
    loading: usersLoading,
    error: usersError,
    clearError: clearUsersError,
  } = useUsers();
  const {
    generateBulkReport,
    downloadReport,
    loading: statsLoading,
    error: statsError,
    clearError: clearStatsError,
  } = useStatistics();

  const [departmentMembers, setDepartmentMembers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [reportParams, setReportParams] = useState<GenerateBulkReportParams>({
    format: ReportFormat.EXCEL,
    period: ReportPeriod.MONTHLY,
    scope: BulkReportScope.DEPARTMENT,
    startDate: "",
    endDate: "",
    title: "",
    includeInactive: false,
    separateSheets: true,
    includeSummary: true,
  });
  const [userSelectionDialog, setUserSelectionDialog] = useState(false);

  useEffect(() => {
    clearUsersError();
    clearStatsError();

    if (currentUser?.department) {
      const fetchMembers = async () => {
        try {
          const results = await fetchUsersByDepartment(currentUser.department!);
          setDepartmentMembers(results);
        } catch (err) {
          console.error("Error fetching department members:", err);
          setDepartmentMembers([]);
        }
      };

      fetchMembers();
    }

    // Set default date range (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setReportParams((prev) => ({
      ...prev,
      startDate: firstDay.toISOString().split("T")[0],
      endDate: lastDay.toISOString().split("T")[0],
      title: `Laporan Kehadiran ${
        currentUser?.department || "Jurusan"
      } - ${now.toLocaleString("id-ID", { month: "long", year: "numeric" })}`,
      departmentName: currentUser?.department,
    }));
  }, [currentUser]);

  const handleBack = () => {
    navigate("/kajur-dashboard");
  };

  const handleParamChange = (
    field: keyof GenerateBulkReportParams,
    value: any
  ) => {
    setReportParams((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Reset specific settings when scope changes
    if (field === "scope") {
      if (value === BulkReportScope.DEPARTMENT) {
        setSelectedUsers([]);
      }
    }

    // Update date range when period changes
    if (field === "period") {
      const now = new Date();
      let startDate = "";
      let endDate = "";

      switch (value) {
        case ReportPeriod.DAILY:
          startDate = endDate = now.toISOString().split("T")[0];
          break;
        case ReportPeriod.WEEKLY:
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          startDate = weekStart.toISOString().split("T")[0];
          endDate = weekEnd.toISOString().split("T")[0];
          break;
        case ReportPeriod.MONTHLY:
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          startDate = monthStart.toISOString().split("T")[0];
          endDate = monthEnd.toISOString().split("T")[0];
          break;
        default:
          break;
      }

      if (startDate && endDate) {
        setReportParams((prev) => ({
          ...prev,
          startDate,
          endDate,
        }));
      }
    }
  };

  const handleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleGenerateReport = async () => {
    try {
      let finalParams = { ...reportParams };

      if (reportParams.scope === BulkReportScope.SPECIFIC_USERS) {
        if (selectedUsers.length === 0) {
          await Swal.fire({
            icon: "warning",
            title: "Perhatian!",
            text: "Pilih minimal satu pengguna untuk laporan",
            confirmButtonText: "OK",
            confirmButtonColor: "#4285f4",
          });
          return;
        }
        finalParams.userIds = selectedUsers;
      }

      // Show loading alert
      Swal.fire({
        title: "Generating Report...",
        text: "Mohon tunggu, laporan sedang dibuat",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await generateBulkReport(finalParams);

      if (response.success) {
        // Automatically download the report
        if (response.data.downloadUrl) {
          downloadReport(response.data.downloadUrl);
        }

        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Laporan berhasil dibuat dan sedang diunduh!",
          confirmButtonText: "OK",
          confirmButtonColor: "#4285f4",
        });
      }
    } catch (error) {
      console.error("Error generating report:", error);

      await Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Terjadi kesalahan saat membuat laporan. Silakan coba lagi.",
        confirmButtonText: "OK",
        confirmButtonColor: "#4285f4",
      });
    }
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  const isKajur =
    currentUser?.role?.toLowerCase().includes("kajur") ||
    currentUser?.role?.toLowerCase().includes("kepala") ||
    currentUser?.role?.toLowerCase().includes("head");

  const loading = usersLoading || statsLoading;
  const error = usersError || statsError;

  return (
    <Box sx={{ bgcolor: "#f5f5f5", width: "100%", minHeight: "100vh", pb: 7 }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: "#4285f4" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack}>
            <ArrowBack />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, textAlign: "center", mr: 4 }}
          >
            Laporan Jurusan
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 2 }}>
        {/* Error Display */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => {
              clearUsersError();
              clearStatsError();
            }}
          >
            {error}
          </Alert>
        )}

        {/* Department Info */}
        {currentUser?.department && (
          <Card sx={{ mb: 3, bgcolor: "primary.main", color: "white" }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Group sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6">{currentUser.department}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {departmentMembers.length} anggota terdaftar
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Report Generation Form */}
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
            >
              <Assessment />
              Generate Laporan Kehadiran
            </Typography>

            <Grid container spacing={3}>
              {/* Report Title */}
              <Grid>
                <TextField
                  fullWidth
                  label="Judul Laporan"
                  value={reportParams.title}
                  onChange={(e) => handleParamChange("title", e.target.value)}
                  placeholder="Masukkan judul laporan..."
                />
              </Grid>

              {/* Format and Period */}
              <Grid>
                <FormControl fullWidth>
                  <InputLabel>Format</InputLabel>
                  <Select
                    value={reportParams.format}
                    label="Format"
                    onChange={(e) =>
                      handleParamChange("format", e.target.value)
                    }
                  >
                    <MenuItem value={ReportFormat.EXCEL}>
                      Excel (.xlsx)
                    </MenuItem>
                    <MenuItem value={ReportFormat.PDF}>PDF</MenuItem>
                    <MenuItem value={ReportFormat.CSV}>CSV</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid>
                <FormControl fullWidth>
                  <InputLabel>Periode</InputLabel>
                  <Select
                    value={reportParams.period}
                    label="Periode"
                    onChange={(e) =>
                      handleParamChange("period", e.target.value)
                    }
                  >
                    <MenuItem value={ReportPeriod.DAILY}>Harian</MenuItem>
                    <MenuItem value={ReportPeriod.WEEKLY}>Mingguan</MenuItem>
                    <MenuItem value={ReportPeriod.MONTHLY}>Bulanan</MenuItem>
                    <MenuItem value={ReportPeriod.CUSTOM}>Custom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Date Range */}
              <Grid>
                <TextField
                  fullWidth
                  type="date"
                  label="Tanggal Mulai"
                  value={reportParams.startDate}
                  onChange={(e) =>
                    handleParamChange("startDate", e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid>
                <TextField
                  fullWidth
                  type="date"
                  label="Tanggal Selesai"
                  value={reportParams.endDate}
                  onChange={(e) => handleParamChange("endDate", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Scope Selection */}
              <Grid>
                <FormControl fullWidth>
                  <InputLabel>Cakupan Laporan</InputLabel>
                  <Select
                    value={reportParams.scope}
                    label="Cakupan Laporan"
                    onChange={(e) => handleParamChange("scope", e.target.value)}
                  >
                    <MenuItem value={BulkReportScope.DEPARTMENT}>
                      Seluruh Jurusan ({departmentMembers.length} orang)
                    </MenuItem>
                    <MenuItem value={BulkReportScope.SPECIFIC_USERS}>
                      Pilih Pengguna Tertentu
                    </MenuItem>
                    {isKajur && (
                      <MenuItem value={BulkReportScope.ALL_USERS}>
                        Semua Pengguna (Seluruh Sistem)
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>

              {/* User Selection Button */}
              {reportParams.scope === BulkReportScope.SPECIFIC_USERS && (
                <Grid>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<People />}
                    onClick={() => setUserSelectionDialog(true)}
                    sx={{ py: 1.5 }}
                  >
                    Pilih Pengguna ({selectedUsers.length} dipilih)
                  </Button>
                </Grid>
              )}

              {/* Advanced Options */}
              <Grid>
                <Divider sx={{ my: 2 }} />
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Settings fontSize="small" />
                  Opsi Lanjutan
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                      checked={reportParams.separateSheets || false}
                      onChange={(e) =>
                        handleParamChange("separateSheets", e.target.checked)
                      }
                    />
                    <Typography variant="body2">
                      Pisahkan sheet untuk setiap pengguna
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                      checked={reportParams.includeSummary || false}
                      onChange={(e) =>
                        handleParamChange("includeSummary", e.target.checked)
                      }
                    />
                    <Typography variant="body2">
                      Sertakan ringkasan laporan
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                      checked={reportParams.includeInactive || false}
                      onChange={(e) =>
                        handleParamChange("includeInactive", e.target.checked)
                      }
                    />
                    <Typography variant="body2">
                      Sertakan pengguna tidak aktif
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Generate Button */}
              <Grid>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <Assessment />
                  }
                  onClick={handleGenerateReport}
                  disabled={loading}
                  sx={{ py: 1.5 }}
                >
                  {loading ? "Generating..." : "Generate Laporan"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>

      {/* User Selection Dialog */}
      <Dialog
        open={userSelectionDialog}
        onClose={() => setUserSelectionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Pilih Pengguna untuk Laporan</DialogTitle>
        <DialogContent>
          <List>
            {departmentMembers.map((user) => (
              <ListItem key={user.guid} dense>
                <ListItemIcon>
                  <Checkbox
                    checked={selectedUsers.includes(user.guid)}
                    onChange={() => handleUserSelection(user.guid)}
                  />
                </ListItemIcon>
                <Avatar
                  src={user.profileImageUrl || undefined}
                  sx={{ width: 32, height: 32, mr: 2, bgcolor: "#ff7043" }}
                >
                  {getInitial(user.fullName)}
                </Avatar>
                <ListItemText
                  primary={user.fullName}
                  secondary={`${user.nip} • ${user.role || "Staff"}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserSelectionDialog(false)}>Batal</Button>
          <Button
            variant="contained"
            onClick={() => setUserSelectionDialog(false)}
            startIcon={<CheckCircle />}
          >
            Konfirmasi ({selectedUsers.length})
          </Button>
        </DialogActions>
      </Dialog>

      <BottomNav />
    </Box>
  );
};

export default JurusanPage;
