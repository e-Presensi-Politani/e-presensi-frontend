import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  IconButton,
  Typography,
  Paper,
  Container,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isCheckOut, setIsCheckOut] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isMounted = useRef<boolean>(true);
  const isInitializing = useRef<boolean>(false);

  const officeLocation: [number, number] = [
    -0.1693371254374395, 100.66447587819418,
  ];
  const maxRadius = 450; // in meters

  // Stop the camera stream function
  const stopCameraStream = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => {
        if (track.readyState === "live") {
          track.stop();
        }
      });
      setVideoStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // Initialize the camera
  const initializeCamera = async () => {
    if (!isMounted.current) {
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showNotification("Your browser does not support camera access.", "error");
      return;
    }

    if (videoStream || isInitializing.current) {
      return;
    }

    isInitializing.current = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setVideoStream(stream);

      if (videoRef.current && isMounted.current) {
        videoRef.current.srcObject = stream;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Video playback started successfully
            })
            .catch((error) => {
              if (!(error.name === "AbortError")) {
                showNotification("Error playing camera stream.", "error");
              }
            });
        }
      }
    } catch (error) {
      showNotification(
        "Unable to access camera. Please allow camera permissions in your browser settings.",
        "error"
      );
    } finally {
      isInitializing.current = false;
    }
  };

  // Consolidated useEffect for initialization and cleanup
  useEffect(() => {
    isMounted.current = true;

    // Fetch attendance and geolocation
    fetchTodayAttendance();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLoc: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setUserLocation(userLoc);
        const distance = calculateDistance(
          userLoc[0],
          userLoc[1],
          officeLocation[0],
          officeLocation[1]
        );
        setDistanceToOffice(distance);
        setIsWithinRadius(distance <= maxRadius);
      },
      (_) => {
        showNotification(
          "Error accessing your location. Please enable location services.",
          "error"
        );
      }
    );

    // Initialize camera only if no captured image
    if (!capturedImage) {
      initializeCamera();
    }

    return () => {
      isMounted.current = false;
      stopCameraStream();
    };
  }, [capturedImage]);

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
    stopCameraStream();
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

    const imageURL = canvas.toDataURL("image/jpeg");
    setCapturedImage(imageURL);

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

    stopCameraStream();
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setImageFile(null);
    if (isMounted.current) {
      initializeCamera();
    }
  };

  const submitAttendance = async () => {
    if (!userLocation || !imageFile) {
      showNotification("Location or image data not available", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isCheckOut) {
        const checkOutData: CheckOutDto = {
          latitude: userLocation[0],
          longitude: userLocation[1],
          notes: "", // Empty string instead of notes
        };
        await checkOut(checkOutData, imageFile);
        showNotification("Check-out successful!", "success");
      } else {
        const checkInData: CheckInDto = {
          latitude: userLocation[0],
          longitude: userLocation[1],
          notes: "", // Empty string instead of notes
        };
        await checkIn(checkInData, imageFile);
        showNotification("Check-in successful!", "success");
      }

      setTimeout(() => {
        if (isMounted.current) {
          stopCameraStream();
          navigate("/dashboard");
        }
      }, 2000);
    } catch (error) {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  const canCheckIn =
    !todayAttendance?.checkInTime && userLocation && isWithinRadius !== null;
  const canCheckOut =
    todayAttendance?.checkInTime &&
    !todayAttendance?.checkOutTime &&
    userLocation &&
    isWithinRadius !== null;
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
      <Box
        sx={{
          bgcolor: "#1976d2",
          height: "5vh",
          p: 2,
          color: "white",
          display: "flex",
          alignItems: "center",
        }}
      >
        <IconButton color="inherit" onClick={handleBackClick}>
          <ArrowBack />
        </IconButton>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, textAlign: "center", mr: 4 }}
        >
          Presensi
        </Typography>
      </Box>

      <Container
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          my: 2,
          overflow: "auto",
        }}
      >

        <Paper
          elevation={2}
          sx={{
            height: "40%",
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
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
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
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
          onClick={capturedImage ? submitAttendance : handleCameraCapture}
          disabled={!!capturedImage && actionButtonDisabled}
          sx={{
            bgcolor: isCheckOut ? "#ff9800" : "#0073e6",
            borderRadius: 6,
            py: 1.5,
            textTransform: "none",
            "&:hover": { bgcolor: isCheckOut ? "#f57c00" : "#0066cc" },
            "&.Mui-disabled": { bgcolor: "#ccc", color: "#666" },
          }}
        >
          {attendanceLoading || isSubmitting ? (
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
      </Container>

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
