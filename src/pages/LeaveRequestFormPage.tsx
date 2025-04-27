import React, { useState } from "react";
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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

type LeaveType = "Cuti" | "WFH" | "WFA" | "DL";

interface FormData {
  leaveType: LeaveType | "";
  startDate: Date | null;
  endDate: Date | null;
  file: File | null;
  notes: string;
}

const LeaveRequestFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    leaveType: "",
    startDate: null,
    endDate: null,
    file: null,
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState<string>("");

  const handleLeaveTypeChange = (event: SelectChangeEvent) => {
    setFormData({
      ...formData,
      leaveType: event.target.value as LeaveType,
    });
    if (errors.leaveType) {
      const { leaveType, ...rest } = errors;
      setErrors(rest);
    }
  };

  const handleStartDateChange = (date: Date | null) => {
    setFormData({
      ...formData,
      startDate: date,
    });
    if (errors.startDate) {
      const { startDate, ...rest } = errors;
      setErrors(rest);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setFormData({
      ...formData,
      endDate: date,
    });
    if (errors.endDate) {
      const { endDate, ...rest } = errors;
      setErrors(rest);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      // Check file size (2MB = 2 * 1024 * 1024 bytes)
      if (selectedFile.size > 2 * 1024 * 1024) {
        setErrors({
          ...errors,
          file: "File size exceeds 2MB limit",
        });
        return;
      }

      // Check file type
      const validTypes = ["application/pdf", "image/jpeg", "image/jpg"];
      if (!validTypes.includes(selectedFile.type)) {
        setErrors({
          ...errors,
          file: "Only PDF, JPG, and JPEG files are allowed",
        });
        return;
      }

      setFormData({
        ...formData,
        file: selectedFile,
      });
      setFileName(selectedFile.name);

      if (errors.file) {
        const { file, ...rest } = errors;
        setErrors(rest);
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Submit logic here - would normally send to an API
      console.log("Form submitted:", formData);

      // Navigate to the leave request list page after submission
      navigate("/leave-request");
    }
  };

  const handleBack = () => {
    navigate("/leave-request");
  };

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", width: "100vw", pb: 8 }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#1976d2",
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

      {/* Form Content */}
      <Container sx={{ py: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            mb: 2,
          }}
        >
          <FormControl fullWidth error={!!errors.leaveType} sx={{ mb: 3 }}>
            <InputLabel id="leave-type-label">Jenis Pengajuan</InputLabel>
            <Select
              labelId="leave-type-label"
              id="leave-type"
              value={formData.leaveType}
              label="Jenis Pengajuan"
              onChange={handleLeaveTypeChange}
            >
              <MenuItem value="Cuti">Cuti</MenuItem>
              <MenuItem value="WFH">Work From Home (WFH)</MenuItem>
              <MenuItem value="WFA">Work From Anywhere (WFA)</MenuItem>
              <MenuItem value="DL">Dinas Luar (DL)</MenuItem>
            </Select>
            {errors.leaveType && (
              <FormHelperText>{errors.leaveType}</FormHelperText>
            )}
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ mb: 3 }}>
              <DatePicker
                label="Tanggal Mulai"
                value={formData.startDate}
                onChange={handleStartDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.startDate,
                    helperText: errors.startDate,
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <DatePicker
                label="Tanggal Selesai"
                value={formData.endDate}
                onChange={handleEndDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.endDate,
                    helperText: errors.endDate,
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
                border: errors.file ? "1px solid #f44336" : undefined,
                color: errors.file ? "#f44336" : undefined,
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
            {errors.file && (
              <FormHelperText error>{errors.file}</FormHelperText>
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
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSubmit}
            sx={{
              py: 1.5,
              borderRadius: 6,
              textTransform: "none",
              fontSize: 16,
            }}
          >
            Kirim
          </Button>
        </Paper>
      </Container>

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default LeaveRequestFormPage;
