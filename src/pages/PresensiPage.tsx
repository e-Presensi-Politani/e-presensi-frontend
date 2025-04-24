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
} from "@mui/material";
import {
  ArrowBack,
  CameraAlt
} from "@mui/icons-material";
import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import BottomNav from "../components/BottomNav";

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

// ... imports tetap

const PresensiPage: React.FC = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success"
  );
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const officeLocation: [number, number] = [
    -0.1693371254374395, 100.66447587819418,
  ];
  const maxRadius = 450;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error("Error getting location:", error);
        showNotification(
          "Error accessing your location. Please enable location services.",
          "error"
        );
      }
    );

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

    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const showNotification = (message: string, severity: "success" | "error") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setShowAlert(true);
  };

  const handleBackClick = () => {
    navigate("/dashboard");
  };

  const calculateDistance = (
    point1: [number, number],
    point2: [number, number]
  ): number => {
    const R = 6371e3;
    const φ1 = (point1[0] * Math.PI) / 180;
    const φ2 = (point2[0] * Math.PI) / 180;
    const Δφ = ((point2[0] - point1[0]) * Math.PI) / 180;
    const Δλ = ((point2[1] - point1[1]) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
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
        }}
      >
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
          }}
        >
          {capturedImage ? (
            <Box sx={{ width: "100%", height: "100%" }}>
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
        </Paper>

        <Paper
          elevation={2}
          sx={{
            flex: 1,
            borderRadius: 2,
            overflow: "hidden",
            position: "relative",
            height: 300,
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
        </Paper>

        <Button
          variant="contained"
          startIcon={<CameraAlt />}
          onClick={handleCameraCapture}
          sx={{
            bgcolor: "#0073e6",
            borderRadius: 6,
            mt: 2,
            px: 3,
            py: 1,
            textTransform: "none",
            mb: 2,
            "&:hover": { bgcolor: "#0066cc" },
          }}
        >
          Absen Masuk
        </Button>
      </Container>

      {/* Replaced default BottomNavigation with custom BottomNav */}
      <BottomNav />

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
