import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Paper,
  Container,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  ArrowBack,
  CameraAlt,
  SendRounded,
  RestartAlt,
  LogoutRounded,
} from "@mui/icons-material";
import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import BottomNav from "../../components/BottomNav";
import { useAttendance } from "../../contexts/AttendanceContext";
import { CheckInDto, CheckOutDto } from "../../types/attendance";

// Fix Leaflet icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const PresensiPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    checkIn,
    checkOut,
    todayAttendance,
    loading: attendanceLoading,
    error: attendanceError,
    fetchTodayAttendance,
  } = useAttendance();

  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success"
  );
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isWithinRadius, setIsWithinRadius] = useState<boolean | null>(null);
  const [distanceToOffice, setDistanceToOffice] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showNotesDialog, setShowNotesDialog] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isCheckOut, setIsCheckOut] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const officeLocation: [number, number] = [
    -0.1693371254374395, 100.66447587819418,
  ];
  const maxRadius = 450; // in meters

  useEffect(() => {
    // Fetch today's attendance when component mounts
    fetchTodayAttendance();

    // Get user's current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLoc: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setUserLocation(userLoc);

        // Calculate distance to office
        const distance = calculateDistance(
          userLoc[0],
          userLoc[1],
          officeLocation[0],
          officeLocation[1]
        );

        setDistanceToOffice(distance);
        setIsWithinRadius(distance <= maxRadius);
      },
      (error) => {
        console.error("Error getting location:", error);
        showNotification(
          "Error accessing your location. Please enable location services.",
          "error"
        );
      }
    );

    // Initialize camera stream
    const getCameraStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setVideoStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing the camera:", error);
        showNotification(
          "Unable to access camera. Please check permissions.",
          "error"
        );
      }
    };

    getCameraStream();

    // Cleanup function
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Check if user has already checked in and set the mode
  useEffect(() => {
    if (todayAttendance?.checkInTime && !todayAttendance?.checkOutTime) {
      setIsCheckOut(true);
    } else {
      setIsCheckOut(false);
    }
  }, [todayAttendance]);

  // Show error notification from attendance context
  useEffect(() => {
    if (attendanceError) {
      showNotification(attendanceError, "error");
    }
  }, [attendanceError]);

  // Calculate distance between two points using the Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const showNotification = (message: string, severity: "success" | "error") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setShowAlert(true);
  };

  const handleBackClick = () => {
    navigate("/dashboard");
  };

  const handleCameraCapture = () => {
    if (!videoStream || !videoRef.current) {
      showNotification("No camera stream available.", "error");
      return;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      showNotification("Failed to capture image.", "error");
      return;
    }

    const videoElement = videoRef.current;
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Get image as URL and Blob
    const imageURL = canvas.toDataURL("image/jpeg");
    setCapturedImage(imageURL);

    // Convert to file for upload
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "check-in-photo.jpg", {
            type: "image/jpeg",
          });
          setImageFile(file);
        }
      },
      "image/jpeg",
      0.8
    );
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setImageFile(null);
  };

  const handleAttendanceAction = () => {
    if (!capturedImage) {
      showNotification("Please capture a photo first", "error");
      return;
    }

    if (!userLocation) {
      showNotification("Location data not available", "error");
      return;
    }

    // Open notes dialog
    setShowNotesDialog(true);
  };

  const submitAttendance = async () => {
    if (!userLocation || !imageFile) {
      return;
    }

    setIsSubmitting(true);
    setShowNotesDialog(false);

    try {
      if (isCheckOut) {
        // Handle check-out
        const checkOutData: CheckOutDto = {
          latitude: userLocation[0],
          longitude: userLocation[1],
          notes: notes,
        };

        await checkOut(checkOutData, imageFile);
        showNotification("Check-out successful!", "success");
      } else {
        // Handle check-in
        const checkInData: CheckInDto = {
          latitude: userLocation[0],
          longitude: userLocation[1],
          notes: notes,
        };

        await checkIn(checkInData, imageFile);
        showNotification("Check-in successful!", "success");
      }

      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Attendance action error:", error);
      // Error notifications are handled by useEffect watching attendanceError
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine check-in availability
  const canCheckIn =
    !todayAttendance?.checkInTime && userLocation && isWithinRadius !== null;

  // Determine check-out availability
  const canCheckOut =
    todayAttendance?.checkInTime &&
    !todayAttendance?.checkOutTime &&
    userLocation &&
    isWithinRadius !== null;

  // Button should be disabled if:
  // - We're loading
  // - Not within radius
  // - No photo captured
  // - Currently submitting
  // - Can neither check in nor check out
  const actionButtonDisabled =
    attendanceLoading ||
    !capturedImage ||
    isSubmitting ||
    (isCheckOut ? !canCheckOut : !canCheckIn) ||
    (!canCheckIn && !canCheckOut);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        bgcolor: "#f5f5f5",
      }}
    >
      <AppBar position="static" sx={{ bgcolor: "#0073e6" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={handleBackClick}
          >
            <ArrowBack />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, textAlign: "center" }}
          >
            Presensi
          </Typography>
        </Toolbar>
      </AppBar>

      <Container
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          my: 2,
          overflow: "auto",
          pb: 5,
        }}
      >
        {/* Attendance status message */}
        {todayAttendance?.checkInTime && !todayAttendance?.checkOutTime && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            You checked in today at{" "}
            {new Date(todayAttendance.checkInTime).toLocaleTimeString()}. Don't
            forget to check out.
          </Alert>
        )}

        {todayAttendance?.checkInTime && todayAttendance?.checkOutTime && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            You have completed your attendance for today. Check-in:{" "}
            {new Date(todayAttendance.checkInTime).toLocaleTimeString()},
            Check-out:{" "}
            {new Date(todayAttendance.checkOutTime).toLocaleTimeString()}
          </Alert>
        )}

        {/* Camera view */}
        <Paper
          elevation={2}
          sx={{
            height: "30vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 0,
            mb: 2,
            borderRadius: 2,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {capturedImage ? (
            <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
              <img
                src={capturedImage}
                alt="Captured"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <IconButton
                sx={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  backgroundColor: "white",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                }}
                onClick={resetCamera}
              >
                <RestartAlt />
              </IconButton>
            </Box>
          ) : (
            videoStream && (
              <video
                ref={videoRef}
                autoPlay
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            )
          )}

          {!capturedImage && (
            <IconButton
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
                backgroundColor: "white",
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}
              onClick={handleCameraCapture}
            >
              <CameraAlt />
            </IconButton>
          )}
        </Paper>

        {/* Map view */}
        <Paper
          elevation={2}
          sx={{
            flex: 1,
            borderRadius: 2,
            overflow: "hidden",
            position: "relative",
            height: 300,
            mb: 2,
          }}
        >
          {userLocation ? (
            <MapContainer
              center={userLocation}
              zoom={16}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Circle
                center={officeLocation}
                radius={maxRadius}
                pathOptions={{
                  fillColor: "blue",
                  fillOpacity: 0.2,
                  color: "#0066cc",
                }}
              />
              <Marker position={userLocation}>
                <Popup>Your Location</Popup>
              </Marker>
              <Marker position={officeLocation}>
                <Popup>Office Location</Popup>
              </Marker>
            </MapContainer>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                flexDirection: "column",
                p: 2,
              }}
            >
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" align="center">
                Getting your location...
              </Typography>
            </Box>
          )}

          {/* Location status indicator */}
          {isWithinRadius !== null && (
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: isWithinRadius
                  ? "rgba(76, 175, 80, 0.8)"
                  : "rgba(211, 47, 47, 0.8)",
                color: "white",
                p: 1,
                zIndex: 1000,
              }}
            >
              <Typography variant="body2" align="center">
                {isWithinRadius
                  ? `Within range (${Math.round(
                      distanceToOffice || 0
                    )}m from office)`
                  : `Outside range (${Math.round(
                      distanceToOffice || 0
                    )}m from office)`}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Action Button */}
        <Button
          variant="contained"
          startIcon={
            capturedImage ? (
              isCheckOut ? (
                <LogoutRounded />
              ) : (
                <SendRounded />
              )
            ) : (
              <CameraAlt />
            )
          }
          onClick={capturedImage ? handleAttendanceAction : handleCameraCapture}
          disabled={!!capturedImage && actionButtonDisabled}
          sx={{
            bgcolor: isCheckOut ? "#ff9800" : "#0073e6",
            borderRadius: 6,
            py: 1.5,
            textTransform: "none",
            mb: 2,
            "&:hover": { bgcolor: isCheckOut ? "#f57c00" : "#0066cc" },
            "&.Mui-disabled": {
              bgcolor: "#ccc",
              color: "#666",
            },
          }}
        >
          {attendanceLoading ? (
            <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
          ) : capturedImage ? (
            isCheckOut ? (
              "Check Out"
            ) : (
              "Check In"
            )
          ) : (
            "Take Photo"
          )}
        </Button>

        {/* Status message */}
        {userLocation && !isWithinRadius && (
          <Typography
            variant="body2"
            color="error"
            align="center"
            sx={{ mb: 2 }}
          >
            You must be within {maxRadius}m of the office to{" "}
            {isCheckOut ? "check out" : "check in"}.
          </Typography>
        )}

        {todayAttendance?.checkInTime && todayAttendance?.checkOutTime && (
          <Typography variant="body2" color="text.secondary" align="center">
            You've completed your attendance for today.
          </Typography>
        )}
      </Container>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onClose={() => setShowNotesDialog(false)}>
        <DialogTitle>
          {isCheckOut ? "Add Check-out Notes" : "Add Check-in Notes"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="notes"
            label="Notes (optional)"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={`Add any relevant notes for your ${
              isCheckOut ? "check-out" : "check-in"
            }`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNotesDialog(false)}>Cancel</Button>
          <Button
            onClick={submitAttendance}
            variant="contained"
            disabled={isSubmitting}
            sx={{ bgcolor: isCheckOut ? "#ff9800" : "#0073e6" }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Submit"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={showAlert}
        autoHideDuration={4000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowAlert(false)}
          severity={alertSeverity}
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PresensiPage;
