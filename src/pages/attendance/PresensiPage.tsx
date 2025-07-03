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
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
  Fab,
} from "@mui/material";
import {
  ArrowBack,
  CameraAlt,
  SendRounded,
  RestartAlt,
  LogoutRounded,
  LocationOff,
  Assignment,
  MyLocation,
  GpsFixed,
  LocationSearching,
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
  const [showOutsideRadiusDialog, setShowOutsideRadiusDialog] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isHighAccuracy, setIsHighAccuracy] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isMounted = useRef<boolean>(true);
  const isInitializing = useRef<boolean>(false);
  const mapRef = useRef<L.Map | null>(null);

  const officeLocation: [number, number] = [
    parseFloat(import.meta.env.VITE_OFFICE_LAT),
    parseFloat(import.meta.env.VITE_OFFICE_LNG),
  ];

  const maxRadius = parseInt(import.meta.env.VITE_MAX_RADIUS, 10);

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

  // Get user location with options
  const getUserLocation = (enableHighAccuracy: boolean = false) => {
    if (!navigator.geolocation) {
      showNotification(
        "Geolocation is not supported by this browser.",
        "error"
      );
      return;
    }

    setIsGettingLocation(true);
    setIsHighAccuracy(enableHighAccuracy);

    const options: PositionOptions = {
      enableHighAccuracy,
      timeout: enableHighAccuracy ? 30000 : 10000, // 30s for high accuracy, 10s for normal
      maximumAge: enableHighAccuracy ? 0 : 30000, // No cache for high accuracy
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLoc: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setUserLocation(userLoc);
        setLocationAccuracy(position.coords.accuracy);

        const distance = calculateDistance(
          userLoc[0],
          userLoc[1],
          officeLocation[0],
          officeLocation[1]
        );
        setDistanceToOffice(distance);
        setIsWithinRadius(distance <= maxRadius);
        setIsGettingLocation(false);

        // Pan map to new location if map is available
        if (mapRef.current) {
          mapRef.current.setView(userLoc, 16);
        }

        showNotification(
          `Location updated ${
            enableHighAccuracy ? "(High Accuracy)" : ""
          }. Accuracy: ${Math.round(position.coords.accuracy)}m`,
          "success"
        );
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = "Error accessing your location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location services.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }

        showNotification(errorMessage, "error");
      },
      options
    );
  };

  // Handle location button click
  const handleLocationButtonClick = () => {
    getUserLocation(true); // Always use high accuracy when manually requested
  };

  // Consolidated useEffect for initialization and cleanup
  useEffect(() => {
    isMounted.current = true;

    // Fetch attendance and get initial location
    fetchTodayAttendance();
    getUserLocation(false); // Start with normal accuracy

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

  // Show dialog when user is outside radius and has captured image
  useEffect(() => {
    if (capturedImage && isWithinRadius === false) {
      setShowOutsideRadiusDialog(true);
    }
  }, [capturedImage, isWithinRadius]);

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
    setShowOutsideRadiusDialog(false);
    if (isMounted.current) {
      initializeCamera();
    }
  };

  const handleLeaveRequest = () => {
    stopCameraStream();
    navigate("/leave-request-form");
  };

  const handleDialogClose = () => {
    setShowOutsideRadiusDialog(false);
  };

  const handleStayOnPage = () => {
    setShowOutsideRadiusDialog(false);
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
              ref={mapRef}
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
                <Popup>
                  <div>
                    <strong>Your Location</strong>
                    <br />
                    Accuracy:{" "}
                    {locationAccuracy
                      ? `${Math.round(locationAccuracy)}m`
                      : "Unknown"}
                    <br />
                    {isHighAccuracy && <em>High Accuracy Mode</em>}
                  </div>
                </Popup>
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

          {/* Location Button */}
          <Tooltip
            title={
              isGettingLocation ? "Getting location..." : "Get precise location"
            }
          >
            <Fab
              size="small"
              color="primary"
              sx={{
                position: "absolute",
                bottom: 50,
                right: 16,
                zIndex: 1000,
                bgcolor: "white",
                color: isGettingLocation ? "#1976d2" : "#666",
                "&:hover": { bgcolor: "#f5f5f5" },
                boxShadow: 2,
              }}
              onClick={handleLocationButtonClick}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <LocationSearching />
              ) : locationAccuracy && locationAccuracy < 20 ? (
                <GpsFixed />
              ) : (
                <MyLocation />
              )}
            </Fab>
          </Tooltip>

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
                {locationAccuracy && (
                  <span style={{ opacity: 0.8, fontSize: "0.75em" }}>
                    {" "}
                    • Accuracy: {Math.round(locationAccuracy)}m
                  </span>
                )}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Main action button */}
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
          disabled={
            !!capturedImage &&
            (actionButtonDisabled || isWithinRadius === false)
          }
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
            isWithinRadius === false ? (
              "Tidak Dapat Presensi"
            ) : isCheckOut ? (
              "Check Out"
            ) : (
              "Check In"
            )
          ) : (
            "Take Photo"
          )}
        </Button>
      </Container>

      {/* Outside Radius Dialog */}
      <Dialog
        open={showOutsideRadiusDialog}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            pb: 1,
            color: "#d32f2f",
          }}
        >
          <LocationOff sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h6" component="span" fontWeight="bold">
            Lokasi di Luar Radius
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Anda berada di luar radius kantor
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Jarak Anda dari kantor:{" "}
              <strong>{Math.round(distanceToOffice || 0)}m</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Presensi hanya dapat dilakukan dalam radius {maxRadius}m dari
              kantor. Jika Anda perlu bekerja dari lokasi lain, silakan ajukan
              permohonan izin.
            </Typography>
          </Box>
        </DialogContent>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "stretch",
            px: 3,
            pb: 3,
            gap: 1,
          }}
        >
          <Button
            onClick={handleStayOnPage}
            variant="outlined"
            fullWidth
            sx={{
              borderRadius: 2,
              textTransform: "none",
              justifyContent: "center",
            }}
          >
            Keluar
          </Button>
          <Button
            onClick={handleLeaveRequest}
            variant="contained"
            startIcon={<Assignment />}
            fullWidth
            sx={{
              borderRadius: 2,
              textTransform: "none",
              justifyContent: "center",
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
            }}
          >
            Ajukan Izin
          </Button>
        </Box>
      </Dialog>

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
