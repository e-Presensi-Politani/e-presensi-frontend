import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import PresensiPage from "./pages/attendance/PresensiPage";
import PresensiHistoryPage from "./pages/attendance/HistoryPage";
import NotFoundPage from "./pages/misc/NotFoundPage";
import UnderDevelopmentPage from "./pages/misc/UnderDevelopmentPage";
import LeaveRequestPage from "./pages/leave/LeaveRequestPage";
import ProfilePage from "./pages/profile/ProfilePage";
import AttendanceDetailPresent from "./pages/attendance/detail/PresentDetail";
import AttendanceDetailAbsent from "./pages/attendance/detail/AbsentDetail";
import AttendanceDetailProblem from "./pages/attendance/detail/ProblemDetail";
import AttendanceCorrection from "./pages/attendance/CorrectionPage";
import LeaveRequestFormPage from "./pages/leave/LeaveFormPage";
import KajurDashboardPage from "./pages/dashboard/KajurDashboardPage";
import ChangePasswordPage from "./pages/auth/ChangePasswordPage";
import PersetujuanPage from "./pages/leave/PersetujuanPage";
import PersetujuanDetailPage from "./pages/leave/PersetujuanDetailPage";
import RejectApplicationForm from "./pages/leave/RejectPage";

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

          {/* Routes exclusively for dosen */}
          <Route element={<ProtectedRoute allowedRoles={["dosen"]} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Routes accessible by both dosen and kajur */}
          <Route element={<ProtectedRoute allowedRoles={["dosen", "kajur"]} />}>
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

          {/* Protected routes for kajur (department head) only */}
          <Route element={<ProtectedRoute allowedRoles={["kajur"]} />}>
            <Route path="/kajur-dashboard" element={<KajurDashboardPage />} />
            <Route path="/persetujuan" element={<PersetujuanPage />} />
            <Route path="/persetujuan-detail" element={<PersetujuanDetailPage />} />
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
