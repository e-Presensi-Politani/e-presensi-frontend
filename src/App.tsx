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
import AttendanceCorrection from "./pages/AttendanceCorrectionPage";
import LeaveRequestFormPage from "./pages/LeaveRequestFormPage";
import KajurDashboardPage from "./pages/KajurDashboardPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/kajur-dashboard" element={<KajurDashboardPage />} />
        <Route path="/presensi" element={<PresensiPage />} />
        <Route path="/history" element={<PresensiHistoryPage />} />
        <Route path="/under-development" element={<UnderDevelopmentPage />} />
        <Route path="/leave-request" element={<LeaveRequestPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/attendance-present" element={<AttendanceDetailPresent />} />
        <Route path="/attendance-absent" element={<AttendanceDetailAbsent />} />
        <Route path="/attendance-problem" element={<AttendanceDetailProblem />} />
        <Route path="/attendance-correction" element={<AttendanceCorrection />} />
        <Route path="/leave-request-form" element={<LeaveRequestFormPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
