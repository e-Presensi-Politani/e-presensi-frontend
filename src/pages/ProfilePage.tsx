import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  Container,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

interface ProfileData {
  name: string;
  nip: string;
  email: string;
  programStudi: string;
  jurusan: string;
  totalKehadiran: string;
  rataJamKerja: string;
  izinLupaAbsen: number;
  presentaseKehadiran: number;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const [profileData] = useState<ProfileData>({
    name: "M. Ghozi Syah Putra",
    nip: "21254323029",
    email: "ghozi286@gmail.com",
    programStudi: "Teknologi Rekayasa Komputer",
    jurusan: "Rekayasa Pertanian dan Komputer",
    totalKehadiran: "18/20 hari",
    rataJamKerja: "8.2 Jam",
    izinLupaAbsen: 2,
    presentaseKehadiran: 90,
  });

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  return (
    <Box
      sx={{
        bgcolor: "#f5f5f5",
        minHeight: "100vh",
        width: "100vw",
        pb: 8,
      }}
    >
      {/* Header */}
      <Box
        sx={{ bgcolor: "#1976D2", p: 2, color: "white", textAlign: "center" }}
      >
        <Typography variant="h6">Profile</Typography>
      </Box>

      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Avatar */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: "#ff6347",
              border: "4px solid white",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
            alt={profileData.name}
          >
            {profileData.name.charAt(0)}
          </Avatar>
        </Box>

        {/* Info */}
        <Paper
          elevation={1}
          sx={{ borderRadius: 2, overflow: "hidden", mb: 2 }}
        >
          <List disablePadding>
            {[
              { label: "Nama", value: profileData.name },
              { label: "NIP", value: profileData.nip },
              { label: "Email", value: profileData.email },
              { label: "Program Studi", value: profileData.programStudi },
              { label: "Jurusan", value: profileData.jurusan },
            ].map((item, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={item.label}
                    secondary={item.value}
                    primaryTypographyProps={{
                      variant: "body2",
                      color: "text.secondary",
                    }}
                    secondaryTypographyProps={{
                      variant: "body1",
                      fontWeight: "medium",
                    }}
                  />
                </ListItem>
                {index < 4 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>

        {/* Stats */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid>
            <Card
              sx={{
                bgcolor: "#4CAF50",
                color: "white",
                height: "12vh",
                width: "44vw",
              }}
            >
              <CardContent sx={{ textAlign: "center", py: { xs: 1, sm: 2 } }}>
                <Typography variant="body2" sx={{ mb: 1 }} noWrap>
                  Total Kehadiran
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {profileData.totalKehadiran}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid>
            <Card
              sx={{
                bgcolor: "#FFC107",
                color: "white",
                height: "12vh",
                width: "44vw",
              }}
            >
              <CardContent sx={{ textAlign: "center", py: { xs: 1, sm: 2 } }}>
                <Typography variant="body2" sx={{ mb: 1 }} noWrap>
                  Rata-rata Jam Kerja
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {profileData.rataJamKerja}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid>
            <Card
              sx={{
                bgcolor: "#F44336",
                color: "white",
                height: "12vh",
                width: "44vw",
              }}
            >
              <CardContent sx={{ textAlign: "center", py: { xs: 1, sm: 2 } }}>
                <Typography variant="body2" sx={{ mb: 1 }} noWrap>
                  Izin/Lupa Absen
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {profileData.izinLupaAbsen}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid>
            <Card
              sx={{
                bgcolor: "#00BCD4",
                color: "white",
                height: "12vh",
                width: "44vw",
              }}
            >
              <CardContent sx={{ textAlign: "center", py: { xs: 1, sm: 2 } }}>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                  noWrap
                >
                  Persentase Kehadiran
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {profileData.presentaseKehadiran}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Change Password Button */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<LockIcon />}
            endIcon={<KeyboardArrowRightIcon />}
            onClick={handleChangePassword}
            sx={{
              width: { xs: "100%", sm: "80%" },
              py: 1.5,
              textTransform: "none",
              borderRadius: 1,
              boxShadow: 2,
            }}
          >
            Ganti Password
          </Button>
        </Box>
      </Container>

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default ProfilePage;
