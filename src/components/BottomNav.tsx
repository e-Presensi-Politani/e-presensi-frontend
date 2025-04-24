import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { DescriptionOutlined as HistoryIcon } from "@mui/icons-material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(0);

  // Set nilai berdasarkan path URL
  useEffect(() => {
    switch (location.pathname) {
      case "/dashboard":
        setValue(0);
        break;
      case "/feature-coming-soon":
        setValue(1);
        break;
      case "/history":
        setValue(2);
        break;
      case "/feature-coming-soon":
        setValue(3);
        break;
      default:
        setValue(0);
    }
  }, [location.pathname]);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    switch (newValue) {
      case 0:
        navigate("/dashboard");
        break;
      case 1:
        navigate("/under-development");
        break;
      case 2:
        navigate("/history");
        break;
      case 3:
        navigate("/under-development");
        break;
    }
  };

  return (
    <BottomNavigation
      value={value}
      onChange={handleChange}
      sx={{
        width: "100%",
        position: "fixed",
        bottom: 0,
        zIndex: 10,
        borderTop: "1px solid #ccc",
        bgcolor: "#fff",
      }}
    >
      <BottomNavigationAction label="Home" icon={<HomeIcon />} />
      <BottomNavigationAction label="Cuti" icon={<EventNoteIcon />} />
      <BottomNavigationAction label="Riwayat" icon={<HistoryIcon />} />
      <BottomNavigationAction label="Profil" icon={<AccountCircleIcon />} />
    </BottomNavigation>
  );
};

export default BottomNav;
