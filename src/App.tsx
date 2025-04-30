import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
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
import PersetujuanPage from "./pages/PersetujuanPage";
import CutiDetailPage from "./pages/CutiDetailPage";
import RejectApplicationForm from "./pages/RejectPengajuanPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/" element={<LoginPage />} />

          {/* Protected routes for all authenticated users */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Route>

          {/* Protected routes for regular users (dosen) */}
          <Route element={<ProtectedRoute allowedRoles={["dosen"]} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/presensi" element={<PresensiPage />} />
            <Route path="/history" element={<PresensiHistoryPage />} />
            <Route path="/leave-request" element={<LeaveRequestPage />} />
            <Route
              path="/attendance-present"
              element={<AttendanceDetailPresent />}
            />
            <Route
              path="/attendance-absent"
              element={<AttendanceDetailAbsent />}
            />
            <Route
              path="/attendance-problem"
              element={<AttendanceDetailProblem />}
            />
            <Route
              path="/attendance-correction"
              element={<AttendanceCorrection />}
            />
            <Route
              path="/leave-request-form"
              element={<LeaveRequestFormPage />}
            />
          </Route>

          {/* Protected routes for kajur (department head) */}
          <Route element={<ProtectedRoute allowedRoles={["kajur"]} />}>
            <Route path="/kajur-dashboard" element={<KajurDashboardPage />} />
            <Route path="/persetujuan" element={<PersetujuanPage />} />
            <Route path="/cuti-detail" element={<CutiDetailPage />} />
            <Route
              path="/reject-pengajuan"
              element={<RejectApplicationForm />}
            />
          </Route>

          {/* Other routes */}
          <Route path="/under-development" element={<UnderDevelopmentPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
