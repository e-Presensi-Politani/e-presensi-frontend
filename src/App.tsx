import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PresensiPage from "./pages/PresensiPage";
import PresensiHistoryPage from "./pages/HistoryPage";
import NotFoundPage from "./pages/NotFoundPage";
import UnderDevelopmentPage from "./pages/UnderDevelopmentPage";
import LeaveRequestPage from "./pages/LeaveRequestPage";
import ProfilePage from "./pages/ProfilePage";
import AttendanceDetailPresent from "./pages/AttendanceDetailPresent";
import AttendanceDetailAbsent from "./pages/AttendanceDetailAbsent";
import AttendanceDetailProblem from "./pages/AttendanceDetailProblem";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/presensi" element={<PresensiPage />} />
        <Route path="/history" element={<PresensiHistoryPage />} />
        <Route path="/under-development" element={<UnderDevelopmentPage />} />
        <Route path="/leave-request" element={<LeaveRequestPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/attendance-present" element={<AttendanceDetailPresent />} />
        <Route path="/attendance-absent" element={<AttendanceDetailAbsent />} />
        <Route path="/attendance-problem" element={<AttendanceDetailProblem />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
