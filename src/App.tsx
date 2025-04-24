import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PresensiPage from "./pages/PresensiPage";
import PresensiHistoryPage from "./pages/HistoryPage";
import NotFoundPage from "./pages/NotFoundPage";
import UnderDevelopmentPage from "./pages/UnderDevelopmentPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/presensi" element={<PresensiPage />} />
        <Route path="/history" element={<PresensiHistoryPage />} />
        <Route path="/under-development" element={<UnderDevelopmentPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
