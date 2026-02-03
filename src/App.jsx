import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layout/Auth_Layout/AuthLayout';
import RegisterPage from './page/Auth_Pages/RegisterPage';
import LoginPage from './page/Auth_Pages/LoginPage';
import ForgotPasswordPage from './page/Auth_Pages/ForgotPasswordPage';
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from 'react';
import { checkAuthUser } from './store/Auth-Slicer/Auth-Slicer';
import { ToastContainer } from 'react-toastify';
import CheckAuth from './common/check-auth';
import TeacherDashboardLayout from './layout/Teacher_Dashboard_Layout/TeacherDashboardLayout';
import TeacherDashboard_Page from './page/Teacher_Pages/TeacherDashboard_Page';
import TeacherSubjects_Page from './page/Teacher_Pages/TeacherSubjects_Page';
import TeacherAttendance_Page from './page/Teacher_Pages/TeacherAttendance_Page';
import StudentAttendance_Page from './page/Student_Pages/StudentAttendance_Page';
import QRScanner_Page from './page/Student_Pages/QR_Scanner';
import AdminTeachers_Page from './page/Admin_Pages/AdminTeachers_Page';
import AdminDashboardLayout from './layout/Admin_Dashboard_Layout/AdminDashboardLayout';

const App = () => {

  const { isAuthenticated, user, isInitialAuthCheckComplete } = useSelector(
    (state) => state.auth
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuthUser());
  }, [dispatch]);

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={1000} 
        // hideProgressBar={true} 
        pauseOnHover={false}
        toastStyle={{ fontFamily: "Poppins" }}
        draggable={false}
      />
      <Routes>

        {/* =====>] By Default [< ===== */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />

        {/* =====>] All Authentication Routes [<===== */}
        <Route path='/auth' element={<CheckAuth isInitialAuthCheckComplete={isInitialAuthCheckComplete} isAuthenticated={isAuthenticated} user={user} >
          <AuthLayout />
        </CheckAuth>}>
          <Route path="register" element={<RegisterPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="forgotPassword" element={<ForgotPasswordPage />} />
        </Route>

        {/* =====>] Teachers Routes [<===== */}
        <Route path='/teacher' element={<CheckAuth isInitialAuthCheckComplete={isInitialAuthCheckComplete} isAuthenticated={isAuthenticated} user={user} >
          <TeacherDashboardLayout />
        </CheckAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard_Page />} />
          <Route path="subject" element={<TeacherSubjects_Page />} />
          <Route path="attendance" element={<TeacherAttendance_Page />} />
        </Route>

        {/* =====>] Admin Routes [<===== */}
        <Route path='/admin' element={<CheckAuth isInitialAuthCheckComplete={isInitialAuthCheckComplete} isAuthenticated={isAuthenticated} user={user} >
          <AdminDashboardLayout />
        </CheckAuth>}>
          <Route index element={<Navigate to="teacher" replace />} />
          <Route path="teacher" element={<AdminTeachers_Page />} />
        </Route>

        {/* =====>] Students Routes [<===== */}
        <Route path="scan-attendance" element={<QRScanner_Page />} />
        <Route path="student-attendance" element={<StudentAttendance_Page />} />
      </Routes>
    </>
  )
}

export default App

