import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/Home/LandingPage';
import Login from './pages/Auth/Login';
import SetPassword from './pages/Auth/SetPassword';
import AdmissionForm from './pages/Student/AdmissionForm';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdmissionManagement from './pages/Admin/AdmissionManagement';
import AdminStudents from './pages/Admin/Students';
import AdminFaculty from './pages/Admin/Faculty';
import AdminCourses from './pages/Admin/CoursesMain';
import AdminFinance from './pages/Admin/FinanceMain';

// Student Pages
import StudentDashboard from './pages/Student/Dashboard';
import StudentProfile from './pages/Student/Profile';
import StudentExamTimetable from './pages/Student/ExamTimetable';
import StudentFees from './pages/Student/Fees';
import StudentResults from './pages/Student/Results';
import StudentAssignments from './pages/Student/Assignments';
import StudentStudyMaterials from './pages/Student/StudyMaterials';

// Faculty Pages
import FacultyDashboard from './pages/Faculty/Dashboard';
import FacultyAttendance from './pages/Faculty/Attendance';
import FacultyMarks from './pages/Faculty/Marks';
import FacultyResults from './pages/Faculty/Results';
import FacultyAssignments from './pages/Faculty/Assignments';
import FacultyStudyMaterials from './pages/Faculty/StudyMaterials';
import FacultyLeaveManagement from './pages/Faculty/LeaveManagement';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/apply" element={<AdmissionForm />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <PrivateRoute allowedRoles={['admin']}>
          <DashboardLayout role="admin" />
        </PrivateRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="admissions" element={<AdmissionManagement />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="faculty" element={<AdminFaculty />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="finance" element={<AdminFinance />} />
      </Route>

      {/* Student Routes */}
      <Route path="/student" element={
        <PrivateRoute allowedRoles={['student']}>
          <DashboardLayout role="student" />
        </PrivateRoute>
      }>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="exam-timetable" element={<StudentExamTimetable />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="fees" element={<StudentFees />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="study-materials" element={<StudentStudyMaterials />} />
      </Route>

      {/* Faculty Routes */}
      <Route path="/faculty" element={
        <PrivateRoute allowedRoles={['faculty']}>
          <DashboardLayout role="faculty" />
        </PrivateRoute>
      }>
        <Route path="dashboard" element={<FacultyDashboard />} />
        <Route path="attendance" element={<FacultyAttendance />} />
        <Route path="marks" element={<FacultyMarks />} />
        <Route path="results" element={<FacultyResults />} />
        <Route path="assignments" element={<FacultyAssignments />} />
        <Route path="study-materials" element={<FacultyStudyMaterials />} />
        <Route path="leave-management" element={<FacultyLeaveManagement />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
