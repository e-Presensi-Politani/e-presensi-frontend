import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Paper,
  Container,
  Button,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  CameraAlt,
  Home,
  CalendarToday,
  Description,
  Person
} from '@mui/icons-material';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PresensiPage: React.FC = () => {
  const navigate = useNavigate();
  const [navValue, setNavValue] = useState(0);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');

  // Office location - example coordinates
  const officeLocation: [number, number] = [-6.594, 106.784]; // Example coordinates for Politeknik Pertanian
  const maxRadius = 200; // Maximum radius in meters for attendance

  useEffect(() => {
    // Get user's current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error("Error getting location:", error);
        showNotification('Error accessing your location. Please enable location services.', 'error');
      }
    );
  }, []);

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setShowAlert(true);
  };

  const handleCameraCapture = () => {
    // In a real app, this would access the device camera
    // For this example, we'll simulate a camera capture with a placeholder
    setLoading(true);
    setTimeout(() => {
      setCapturedImage('/api/placeholder/150/150');
      setLoading(false);
      showNotification('Photo captured successfully', 'success');
    }, 1500);
  };

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  const handleNavChange = (event: React.SyntheticEvent, newValue: number) => {
    setNavValue(newValue);
    switch (newValue) {
      case 0:
        navigate('/dashboard');
        break;
      case 1:
        navigate('/cuti');
        break;
      case 2:
        navigate('/report');
        break;
      case 3:
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  // Simple distance calculation (haversine formula)
  const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1[0] * Math.PI / 180;
    const φ2 = point2[0] * Math.PI / 180;
    const Δφ = (point2[0] - point1[0]) * Math.PI / 180;
    const Δλ = (point2[1] - point1[1]) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', bgcolor: '#f5f5f5' }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ bgcolor: '#0073e6' }}>
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            aria-label="back"
            onClick={handleBackClick}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Presensi
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container sx={{ flex: 1, display: 'flex', flexDirection: 'column', my: 2, overflow: 'auto' }}>
        {/* User Profile Section */}
        <Paper 
          elevation={2} 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 3,
            mb: 2,
            borderRadius: 2
          }}
        >
          <Box sx={{ position: 'relative', mb: 2 }}>
            <Avatar
              src={capturedImage || undefined}
              sx={{ 
                width: 100, 
                height: 100,
                border: '3px solid #fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            {loading && (
              <CircularProgress
                size={110}
                thickness={2}
                sx={{
                  position: 'absolute',
                  top: -5,
                  left: -5,
                  zIndex: 1,
                  color: '#0073e6'
                }}
              />
            )}
          </Box>

          <Button
            variant="contained"
            startIcon={<CameraAlt />}
            onClick={handleCameraCapture}
            disabled={loading}
            sx={{
              bgcolor: '#0073e6',
              borderRadius: 6,
              px: 3,
              py: 1,
              textTransform: 'none',
              mb: 2,
              '&:hover': {
                bgcolor: '#0066cc'
              }
            }}
          >
            Absen Masuk
          </Button>
        </Paper>

        {/* Map Section */}
        <Paper 
          elevation={2} 
          sx={{ 
            flex: 1,
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
            height: 300
          }}
        >
          {userLocation ? (
            <MapContainer 
              center={userLocation} 
              zoom={16} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Office location with radius */}
              <Circle 
                center={officeLocation}
                radius={maxRadius}
                pathOptions={{ fillColor: 'blue', fillOpacity: 0.2, color: '#0073e6' }}
              />
              
              {/* Office marker */}
              <Marker position={officeLocation}>
                <Popup>Campus Location</Popup>
              </Marker>
              
              {/* User location */}
              <Marker position={userLocation}>
                <Popup>Your Location</Popup>
              </Marker>
            </MapContainer>
          ) : (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                flexDirection: 'column',
                p: 2
              }}
            >
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" align="center">
                Getting your location...
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>

      {/* Bottom Navigation */}
      <Paper sx={{ width: '100%' }} elevation={3}>
        <BottomNavigation
          value={navValue}
          onChange={handleNavChange}
          showLabels
        >
          <BottomNavigationAction label="Home" icon={<Home />} />
          <BottomNavigationAction label="Cuti" icon={<CalendarToday />} />
          <BottomNavigationAction label="Report" icon={<Description />} />
          <BottomNavigationAction label="Profil" icon={<Person />} />
        </BottomNavigation>
      </Paper>

      {/* Notification */}
      <Snackbar 
        open={showAlert} 
        autoHideDuration={4000} 
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowAlert(false)} 
          severity={alertSeverity}
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PresensiPage;