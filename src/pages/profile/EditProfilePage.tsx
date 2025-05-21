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
  Badge,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useUsers } from "../../contexts/UserContext";
import { UpdateUserDto } from "../../types/users";
import FileService from "../../services/FileService";
import defaultProfileImage from "../../assets/default-pp.png";

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const {
    fetchUserByGuid,
    selectedUser,
    updateUser,
    uploadProfilePhoto,
    removeUserProfilePhoto,
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
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [_, setPhotoChanged] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Renamed from photoError

  // File input reference
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch user details when component mounts
  useEffect(() => {
    if (authUser?.guid) {
      fetchUserByGuid(authUser.guid);
    }

    return () => {
      clearError();
    };
  }, []);

  // Load profile photo
  const loadProfilePhoto = async () => {
    try {
      if (!selectedUser?.guid) return;

      // Reset error message if any
      setErrorMessage(null);

      // First try to use the profileImage field if it exists
      if (selectedUser.profileImage) {
        const photoUrl = FileService.getFileViewUrl(selectedUser.profileImage);
        const urlWithTimestamp = `${photoUrl}?t=${new Date().getTime()}`;
        setPhotoURL(urlWithTimestamp);
        return;
      }

      // Otherwise check if there's a profile photo available for this user
      const url = await FileService.getProfilePhotoUrl(selectedUser.guid);
      if (url) {
        const urlWithTimestamp = `${url}?t=${new Date().getTime()}`;
        setPhotoURL(urlWithTimestamp);
      } else {
        setPhotoURL(null);
      }
    } catch (error) {
      setErrorMessage("Failed to load profile photo");
    }
  };

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

      // Load the profile photo
      loadProfilePhoto();
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

  // Handle clicking the photo upload button
  const handlePhotoButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Reset error state
    setErrorMessage(null);

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Only JPG, JPEG, PNG, and WEBP files are allowed");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("File size exceeds 2MB limit");
      return;
    }

    try {
      setUploadingPhoto(true);

      // Upload the photo
      await uploadProfilePhoto(file);

      // Refresh user data to get updated profile image
      if (authUser?.guid) {
        await fetchUserByGuid(authUser.guid);
      }

      setPhotoChanged(true);
      setSuccessMessage("Profile photo uploaded successfully");
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to upload profile photo");
    } finally {
      setUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle removing profile photo
  const handleRemovePhoto = async () => {
    if (!authUser?.guid) return;

    try {
      setUploadingPhoto(true);
      setErrorMessage(null);

      // Use removeProfilePhoto from UserContext
      await removeUserProfilePhoto(authUser.guid);

      // Clear the photo URL to update UI immediately
      setPhotoURL(null);

      // Refresh user data to ensure we have the latest profile state
      if (authUser.guid) {
        await fetchUserByGuid(authUser.guid);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to remove profile photo");
    } finally {
      setUploadingPhoto(false);
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
        const updateData: UpdateUserDto = {
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber || undefined,
          department: formData.department || undefined,
          position: formData.position || undefined,
        };

        await updateUser(selectedUser.guid, updateData);
        setSuccessMessage("Profile updated successfully!");

        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      } catch (err) {
        setErrorMessage("Failed to update profile. Please try again.");
      }
    }
  };

  const handleBack = () => {
    navigate("/profile");
  };

  const displayError = error || errorMessage;

  if (loading && !selectedUser && !uploadingPhoto) {
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
        {displayError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => {
              clearError();
              setErrorMessage(null);
            }}
          >
            {displayError}
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
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              <Tooltip title="Change profile photo">
                <IconButton
                  onClick={handlePhotoButtonClick}
                  disabled={uploadingPhoto}
                  sx={{
                    bgcolor: "#1976D2",
                    color: "white",
                    "&:hover": { bgcolor: "#0d5ca9" },
                  }}
                  size="small"
                >
                  <PhotoCameraIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            }
          >
            {uploadingPhoto ? (
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "4px solid white",
                  borderRadius: "50%",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                }}
              >
                <CircularProgress size={40} />
              </Box>
            ) : (
              <Avatar
                key={photoURL || "default-image"}
                sx={{
                  width: 100,
                  height: 100,
                  border: "4px solid white",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                }}
                alt={formData.fullName || "User"}
                src={photoURL || defaultProfileImage}
                imgProps={{
                  onError: (e) => {
                    const imgElement = e.target as HTMLImageElement;
                    imgElement.src = defaultProfileImage;
                  },
                }}
              >
                {formData.fullName?.charAt(0) || "U"}
              </Avatar>
            )}
          </Badge>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: "none" }}
            accept="image/jpeg,image/png,image/jpg,image/webp"
          />

          {/* Remove photo button */}
          {photoURL && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={handleRemovePhoto}
              disabled={uploadingPhoto}
              sx={{ mt: 2, borderRadius: 2 }}
            >
              Remove Photo
            </Button>
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
                InputProps={{
                  sx: { borderRadius: 1.5 },
                }}
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
          disabled={loading || uploadingPhoto}
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
