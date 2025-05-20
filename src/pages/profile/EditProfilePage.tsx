// src/pages/profile/EditProfilePage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Container,
  TextField,
  IconButton,
  Grid,
  CircularProgress,
  Alert,
  FormHelperText,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useUsers } from "../../contexts/UserContext";
import { UpdateUserDto } from "../../types/users";

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const {
    fetchUserByGuid,
    selectedUser,
    updateUser,
    loading,
    error,
    clearError,
  } = useUsers();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    department: "",
    position: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [_, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch user details when component mounts
  useEffect(() => {
    if (authUser?.guid) {
      fetchUserByGuid(authUser.guid);
    }

    return () => {
      clearError();
    };
  }, []);

  // Set form data when user details are loaded
  useEffect(() => {
    if (selectedUser) {
      setFormData({
        fullName: selectedUser.fullName || "",
        email: selectedUser.email || "",
        phoneNumber: selectedUser.phoneNumber || "",
        department: selectedUser.department || "",
        position: selectedUser.position || "",
      });

      if (selectedUser.profileImage) {
        setPreviewUrl(selectedUser.profileImage);
      }
    }
  }, [selectedUser]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field if any
    if (formErrors[name]) {
      const newErrors = { ...formErrors };
      delete newErrors[name];
      setFormErrors(newErrors);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setFormErrors({
          ...formErrors,
          profileImage: "Only JPG, JPEG, and PNG files are allowed",
        });
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setFormErrors({
          ...formErrors,
          profileImage: "File size exceeds 2MB limit",
        });
        return;
      }

      setProfileImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Clear error if any
      if (formErrors.profileImage) {
        const { profileImage, ...rest } = formErrors;
        setFormErrors(rest);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Phone number validation is optional but should be numeric if provided
    if (formData.phoneNumber && !/^\d+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number should contain only digits";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm() && selectedUser) {
      try {
        // Prepare update data
        const updateData: UpdateUserDto = {
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber || undefined,
          department: formData.department || undefined,
          position: formData.position || undefined,
        };

        // TODO: Handle profile image upload
        // This would typically require a separate API call or including
        // the image in a FormData object. For now, we're just updating the text fields.

        await updateUser(selectedUser.guid, updateData);

        setSuccessMessage("Profile updated successfully!");

        // Navigate back to profile after short delay
        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      } catch (err) {
        console.error("Failed to update profile:", err);
      }
    }
  };

  const handleBack = () => {
    navigate("/profile");
  };

  if (loading && !selectedUser) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "#f5f5f5",
        minHeight: "100vh",
        width: "100%",
        pb: 8,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#1976D2",
          p: 2,
          color: "white",
          display: "flex",
          alignItems: "center",
        }}
      >
        <IconButton color="inherit" onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, textAlign: "center", pr: 4 }}
        >
          Edit Profile
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        {/* Success Message */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Avatar and Upload Button */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box sx={{ position: "relative" }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: "#ff6347",
                border: "4px solid white",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              }}
              alt={formData.fullName || "User"}
              src={previewUrl || undefined}
            >
              {formData.fullName?.charAt(0) || "U"}
            </Avatar>
            <IconButton
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                bgcolor: "#1976D2",
                color: "white",
                "&:hover": {
                  bgcolor: "#0d5ca9",
                },
                padding: "8px",
              }}
              component="label"
            >
              <CameraAltIcon fontSize="small" />
              <input
                type="file"
                hidden
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleImageChange}
              />
            </IconButton>
          </Box>

          {formErrors.profileImage && (
            <FormHelperText error sx={{ mt: 1 }}>
              {formErrors.profileImage}
            </FormHelperText>
          )}

          <Typography variant="caption" sx={{ mt: 1, color: "text.secondary" }}>
            Tap the camera icon to change profile photo
          </Typography>
        </Box>

        {/* Profile Form */}
        <Paper elevation={1} sx={{ borderRadius: 2, padding: 3, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid sx={{ width: { xs: "100%", sm: "48%" } }}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                error={!!formErrors.fullName}
                helperText={formErrors.fullName}
              />
            </Grid>

            <Grid sx={{ width: { xs: "100%", sm: "48%" } }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                InputProps={{
                  sx: { borderRadius: 1.5 },
                }}
              />
            </Grid>

            <Grid sx={{ width: { xs: "100%", sm: "48%" } }}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                error={!!formErrors.phoneNumber}
                helperText={formErrors.phoneNumber}
                InputProps={{
                  sx: { borderRadius: 1.5 },
                }}
              />
            </Grid>

            <Grid sx={{ width: { xs: "100%", sm: "48%" } }}>
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                InputProps={{
                  sx: { borderRadius: 1.5 },
                }}
              />
            </Grid>

            <Grid sx={{ width: { xs: "100%", sm: "48%" } }}>
              <TextField
                fullWidth
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                InputProps={{
                  sx: { borderRadius: 1.5 },
                }}
              />
            </Grid>

            {/* NIP is displayed as read-only */}
            <Grid sx={{ width: { xs: "100%", sm: "48%" } }}>
              <TextField
                fullWidth
                label="NIP"
                value={selectedUser?.nip || ""}
                disabled
                InputProps={{
                  sx: { borderRadius: 1.5 },
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Submit Button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            py: 1.5,
            textTransform: "none",
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Save Changes"
          )}
        </Button>
      </Container>
    </Box>
  );
};

export default EditProfilePage;
