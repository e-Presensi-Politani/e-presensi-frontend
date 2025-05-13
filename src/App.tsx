import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { UsersProvider } from "./contexts/UserContext";
import { AttendanceProvider } from "./contexts/AttendanceContext";
import { DepartmentProvider } from "./contexts/DepartmentContext";
import { LeaveRequestsProvider } from "./contexts/LeaveRequestsContext";
import { CorrectionsProvider } from "./contexts/CorrectionsContext";

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
import LeaveRequestFormPage from "./pages/leave/LeaveRequestFormPage";
import KajurDashboardPage from "./pages/dashboard/KajurDashboardPage";
import ChangePasswordPage from "./pages/auth/ChangePasswordPage";
import PersetujuanPage from "./pages/leave/PersetujuanPage";
import PersetujuanDetailPage from "./pages/leave/PersetujuanDetailPage";
import RejectApplicationForm from "./pages/leave/RejectPage";
import PengajuanDetailPage from "./pages/leave/LeaveRequestDetailPage";
import StatusPengajuanKoreksi from "./pages/correction/StatusCorrectionPage";
import CorrectionDetailPage from "./pages/correction/DetailCorrectionPage";

function App() {
  return (
    <AuthProvider>
      <DepartmentProvider>
        <LeaveRequestsProvider>
          <UsersProvider>
            <AttendanceProvider>
              <CorrectionsProvider>
                <Router>
                  <Routes>
                    {/* Public route */}
                    <Route path="/" element={<LoginPage />} />

                    {/* Protected routes for all authenticated users */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route
                        path="/change-password"
                        element={<ChangePasswordPage />}
                      />
                    </Route>

                    {/* Routes exclusively for dosen */}
                    <Route
                      element={<ProtectedRoute allowedRoles={["dosen"]} />}
                    >
                      <Route path="/dashboard" element={<DashboardPage />} />
                    </Route>

                    {/* Routes accessible by both dosen and kajur */}
                    <Route
                      element={
                        <ProtectedRoute allowedRoles={["dosen", "kajur"]} />
                      }
                    >
                      <Route path="/presensi" element={<PresensiPage />} />
                      <Route
                        path="/history"
                        element={<PresensiHistoryPage />}
                      />
                      <Route
                        path="/leave-request"
                        element={<LeaveRequestPage />}
                      />
                      <Route
                        path="/detail-request/:id"
                        element={<PengajuanDetailPage />}
                      />
                      <Route
                        path="/attendance-present/:guid"
                        element={<AttendanceDetailPresent />}
                      />
                      <Route
                        path="/attendance-absent/:guid"
                        element={<AttendanceDetailAbsent />}
                      />
                      <Route
                        path="/attendance-problem/:guid"
                        element={<AttendanceDetailProblem />}
                      />
                      <Route
                        path="/attendance-correction/:attendanceId"
                        element={<AttendanceCorrection />}
                      />
                      <Route
                        path="/leave-request-form"
                        element={<LeaveRequestFormPage />}
                      />
                      <Route
                        path="/status-koreksi"
                        element={<StatusPengajuanKoreksi />}
                      />
                      <Route
                        path="/detail-koreksi"
                        element={<CorrectionDetailPage/>}
                      />
                    </Route>

                    {/* Protected routes for kajur (department head) only */}
                    <Route
                      element={<ProtectedRoute allowedRoles={["kajur"]} />}
                    >
                      <Route
                        path="/kajur-dashboard"
                        element={<KajurDashboardPage />}
                      />
                      <Route
                        path="/persetujuan"
                        element={<PersetujuanPage />}
                      />
                      <Route
                        path="/persetujuan-detail/:guid"
                        element={<PersetujuanDetailPage />}
                      />
                      <Route
                        path="/reject-pengajuan"
                        element={<RejectApplicationForm />}
                      />
                    </Route>

                    {/* Other routes */}
                    <Route
                      path="/under-development"
                      element={<UnderDevelopmentPage />}
                    />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Router>
              </CorrectionsProvider>
            </AttendanceProvider>
          </UsersProvider>
        </LeaveRequestsProvider>
      </DepartmentProvider>
    </AuthProvider>
  );
}

export default App;
