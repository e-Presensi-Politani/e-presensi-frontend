import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  SelectChangeEvent,
  FormHelperText,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import { useLeaveRequests } from "../../contexts/LeaveRequestsContext";
import { useAuth } from "../../contexts/AuthContext";
import { useDepartment } from "../../contexts/DepartmentContext";
import { LeaveRequestType } from "../../types/leave-requests";

interface FormData {
  leaveType: LeaveRequestType | "";
  startDate: Date | null;
  endDate: Date | null;
  file: File | null;
  notes: string;
  departmentId: string;
}

const LeaveRequestFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { createLeaveRequest, loading, error, clearError } = useLeaveRequests();
  const { user: authUser } = useAuth();
  const { departments, fetchDepartmentsByMember } = useDepartment();

  // Create refs for the DatePickers to manage focus
  const startDateRef = useRef<HTMLDivElement | null>(null);
  const endDateRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState<FormData>({
    leaveType: "",
    startDate: null,
    endDate: null,
    file: null,
    notes: "",
    departmentId: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch department details using the user's id
  useEffect(() => {
    if (authUser?.guid) {
      fetchDepartmentsByMember(authUser.guid);
    }
  }, [authUser, fetchDepartmentsByMember]);

  // Update department ID when department data is loaded
  useEffect(() => {
    if (departments && departments.length > 0) {
      setFormData((prev) => ({
        ...prev,
        departmentId: departments[0].guid,
      }));
    }
  }, [departments]);

  const handleLeaveTypeChange = (event: SelectChangeEvent) => {
    setFormData({
      ...formData,
      leaveType: event.target.value as LeaveRequestType,
    });
    if (formErrors.leaveType) {
      const { leaveType, ...rest } = formErrors;
      setFormErrors(rest);
    }

    // Programmatically move focus to the "Tanggal Mulai" DatePicker
    setTimeout(() => {
      if (startDateRef.current) {
        const input = startDateRef.current.querySelector("input");
        if (input) {
          input.focus();
        }
      }
    }, 100); // Slight delay to ensure Select menu is closed
  };

  const handleStartDateChange = (date: Date | null) => {
    setFormData({
      ...formData,
      startDate: date,
    });
    if (formErrors.startDate) {
      const { startDate, ...rest } = formErrors;
      setFormErrors(rest);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setFormData({
      ...formData,
      endDate: date,
    });
    if (formErrors.endDate) {
      const { endDate, ...rest } = formErrors;
      setFormErrors(rest);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.size > 2 * 1024 * 1024) {
        setFormErrors({
          ...formErrors,
          file: "File size exceeds 2MB limit",
        });
        return;
      }

      const validTypes = ["application/pdf", "image/jpeg", "image/jpg"];
      if (!validTypes.includes(selectedFile.type)) {
        setFormErrors({
          ...formErrors,
          file: "Only PDF, JPG, and JPEG files are allowed",
        });
        return;
      }

      setFormData({
        ...formData,
        file: selectedFile,
      });
      setFileName(selectedFile.name);

      if (formErrors.file) {
        const { file, ...rest } = formErrors;
        setFormErrors(rest);
      }
    }
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      notes: event.target.value,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.leaveType) {
      newErrors.leaveType = "Jenis pengajuan harus dipilih";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Tanggal mulai harus diisi";
    }

    if (!formData.endDate) {
      newErrors.endDate = "Tanggal selesai harus diisi";
    } else if (
      formData.startDate &&
      formData.endDate &&
      formData.endDate < formData.startDate
    ) {
      newErrors.endDate = "Tanggal selesai tidak boleh sebelum tanggal mulai";
    }

    if (!formData.file) {
      newErrors.file = "Berkas pendukung harus diunggah";
    }

    if (!formData.departmentId) {
      newErrors.departmentId = "Department information is missing";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        if (
          !formData.file ||
          !formData.startDate ||
          !formData.endDate ||
          !formData.leaveType ||
          !formData.departmentId
        ) {
          return;
        }

        await createLeaveRequest(
          {
            departmentId: formData.departmentId,
            type: formData.leaveType as LeaveRequestType,
            startDate: formData.startDate,
            endDate: formData.endDate,
            reason: formData.notes,
          },
          formData.file
        );

        setSubmitSuccess(true);

        setTimeout(() => {
          navigate("/leave-request");
        }, 1500);
      } catch (err) {
        console.error("Failed to submit leave request:", err);
      }
    }
  };

  const handleBack = () => {
    navigate("/leave-request");
  };

  const handleCloseSnackbar = () => {
    clearError();
  };

  const renderDepartmentSelection = () => {
    if (departments && departments.length > 1) {
      return (
        <FormControl fullWidth error={!!formErrors.departmentId} sx={{ mb: 3 }}>
          <InputLabel id="department-label">Department</InputLabel>
          <Select
            labelId="department-label"
            id="department"
            value={formData.departmentId}
            label="Department"
            onChange={(event) => {
              setFormData({
                ...formData,
                departmentId: event.target.value,
              });
              if (formErrors.departmentId) {
                const { departmentId, ...rest } = formErrors;
                setFormErrors(rest);
              }
              setTimeout(() => {
                document.getElementById("form-container")?.focus();
              }, 10);
            }}
            sx={{
              "& fieldset": {
                borderRadius: 2,
              },
            }}
          >
            {departments.map((dept) => (
              <MenuItem key={dept.guid} value={dept.guid}>
                {dept.name}
              </MenuItem>
            ))}
          </Select>
          {formErrors.departmentId && (
            <FormHelperText>{formErrors.departmentId}</FormHelperText>
          )}
        </FormControl>
      );
    }
    return null;
  };

  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh", width: "100%", pb: 6 }}>
      <Box
        sx={{
          bgcolor: "#1976d2",
          height: "4vh",
          color: "white",
          py: 2,
          display: "flex",
          alignItems: "center",
        }}
      >
        <IconButton sx={{ color: "white", ml: 1 }} onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ mx: "auto", pr: 4 }}>
          Pengajuan Izin
        </Typography>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      {submitSuccess && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Pengajuan berhasil dikirim!
        </Alert>
      )}

      <Container sx={{ py: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 0,
            borderRadius: 2,
            mb: 2,
          }}
          tabIndex={-1}
          id="form-container"
        >
          {renderDepartmentSelection()}

          <FormControl fullWidth error={!!formErrors.leaveType} sx={{ mb: 3 }}>
            <InputLabel id="leave-type-label">Jenis Pengajuan</InputLabel>
            <Select
              labelId="leave-type-label"
              id="leave-type"
              value={formData.leaveType}
              label="Jenis Pengajuan"
              onChange={handleLeaveTypeChange}
              MenuProps={{
                disablePortal: false,
                disableScrollLock: true,
                onClose: () => {
                  setTimeout(() => {
                    if (startDateRef.current) {
                      const input = startDateRef.current.querySelector("input");
                      if (input) {
                        input.focus();
                      }
                    }
                  }, 100);
                },
              }}
              sx={{
                "& fieldset": {
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem value={LeaveRequestType.LEAVE}>Cuti</MenuItem>
              <MenuItem value={LeaveRequestType.WFH}>
                Work From Home (WFH)
              </MenuItem>
              <MenuItem value={LeaveRequestType.WFA}>
                Work From Anywhere (WFA)
              </MenuItem>
              <MenuItem value={LeaveRequestType.DL}>Dinas Luar (DL)</MenuItem>
            </Select>
            {formErrors.leaveType && (
              <FormHelperText>{formErrors.leaveType}</FormHelperText>
            )}
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ mb: 3 }} ref={startDateRef}>
              <DatePicker
                label="Tanggal Mulai"
                value={formData.startDate}
                onChange={handleStartDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.startDate,
                    helperText: formErrors.startDate,
                    InputProps: {
                      id: "startDate",
                    },
                  },
                  popper: {
                    disablePortal: false,
                    modifiers: [
                      {
                        name: "preventOverflow",
                        enabled: true,
                      },
                    ],
                  },
                }}
                sx={{
                  "& fieldset": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }} ref={endDateRef}>
              <DatePicker
                label="Tanggal Selesai"
                value={formData.endDate}
                onChange={handleEndDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.endDate,
                    helperText: formErrors.endDate,
                    InputProps: {
                      id: "endDate",
                    },
                  },
                  popper: {
                    disablePortal: false,
                    modifiers: [
                      {
                        name: "preventOverflow",
                        enabled: true,
                      },
                    ],
                  },
                }}
                sx={{
                  "& fieldset": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          </LocalizationProvider>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Upload Berkas
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<AttachFileIcon />}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                py: 1.5,
                borderRadius: 2,
                border: formErrors.file ? "1px solid #f44336" : undefined,
                color: formErrors.file ? "#f44336" : undefined,
              }}
            >
              {fileName || "File Upload (PDF/JPG, max 2MB)"}
              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg"
                onChange={handleFileChange}
              />
            </Button>
            {formErrors.file && (
              <FormHelperText error>{formErrors.file}</FormHelperText>
            )}
          </Box>

          <TextField
            fullWidth
            id="notes"
            label="Keterangan"
            multiline
            rows={4}
            value={formData.notes}
            onChange={handleNotesChange}
            placeholder="Masukan Keterangan ..."
            sx={{ mb: 3 }}
            InputProps={{
              sx: {
                borderRadius: 2,
              },
            }}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 3,
              textTransform: "none",
              fontSize: 16,
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Kirim"}
          </Button>

          {(!departments || departments.length === 0) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Anda belum terdaftar di departemen manapun - Harap hubungi
              administrator.
            </Alert>
          )}
        </Paper>
      </Container>

      <BottomNav />
    </Box>
  );
};

export default LeaveRequestFormPage;
