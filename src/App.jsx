import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layout/Auth_Layout/AuthLayout';
import RegisterPage from './page/Auth_Pages/RegisterPage';
import LoginPage from './page/Auth_Pages/LoginPage';
import ForgotPasswordPage from './page/Auth_Pages/ForgotPasswordPage';
import OnboardingPage from './page/Onboarding_Pages/OnboardingPage';
import TermsAndConditionsPage from './page/Extra_Pages/TermsAndConditionsPage';
import ContactSupportPage from './page/Extra_Pages/ContactSupportPage';
import { useDispatch, useSelector } from "react-redux";
// ===========> Test Pages <===========
import { useEffect } from 'react';
import { checkAuthUser } from './store/Auth-Slicer/Auth-Slicer';
import { ToastContainer } from 'react-toastify';
import CheckAuth from './common/check-auth';
import AdminDashboardLayout from './layout/Admin_Dashboard_Layout/AdminDashboardLayout';
import CreateSchoolPage from './page/CreateSchool_Pages/CreateSchoolPage';
import AdminDashboard_Page from './page/Admin_Pages/AdminDashboard_Page';
import AdminManageTeacher_Page from './page/Admin_Pages/AdminManageTeacher_Page';
import AdminManageStudent_Page from './page/Admin_Pages/AdminManageStudent_Page';
import AccountantDashboardLayout from './layout/Accountant_Dashboard_Layout/AccountantDashboardLayout';
import SuperAdminDashboardLayout from './layout/Super_Admin_Dashboard_Layout/SuperAdminDashboardLayout';
import PrincipalDashboardLayout from './layout/Principal_Dashboard_Layout/PrincipalDashboardLayout';
import TeacherDashboardLayout from './layout/Teacher_Dashboard_Layout/TeacherDashboardLayout';
import StudentDasboardLayout from './layout/Student_Dashboard_Layout/StudentDasboardLayout';
import ParentDashboardLayout from './layout/Parent_Dashboard_Layout/ParentDashboardLayout';
import RegistrarDashboardLayout from './layout/Registrar_Dashboard_Layout/RegistrarDashboardLayout';
import AdminTeacherAttendance_Page from './page/Admin_Pages/AdminTeacherAttendance_Page';
import AdminStudentAttendance_Page from './page/Admin_Pages/AdminStudentAttendance_Page';
import AdminStudentAdmission_Page from './page/Admin_Pages/AdminStudentAdmission_Page';
import AdminAcademicClasses_Page from './page/Admin_Pages/AdminAcademicClasses_Page';
import AdminAcademicSubjects_Page from './page/Admin_Pages/AdminAcademicSubjects_Page';
import AdminAcademicTimeTable_Page from './page/Admin_Pages/AdminAcademicTimeTable_Page';
import AdminFinancePayments_Page from './page/Admin_Pages/AdminFinancePayments_Page';
import AccountantDashobard_Page from './page/Accountant_Pages/AccountantDashobard_Page';
import AccountantFees_Page from './page/Accountant_Pages/AccountantFees_Page';
import AccountantPayments_Page from './page/Accountant_Pages/AccountantPayments_Page';
import AccountantReports_Page from './page/Accountant_Pages/AccountantReports_Page';
import SuperAdminAuditLogs_Page from './page/SuperAdmin_Pages/SuperAdminAuditLogs_Page';
import SuperAdminSystemSchools_Page from './page/SuperAdmin_Pages/SuperAdminSystemSchools_Page';
import SuperAdminSystemUsers_Page from './page/SuperAdmin_Pages/SuperAdminSystemUsers_Page';
import SuperAdminSystemRoles_Page from './page/SuperAdmin_Pages/SuperAdminSystemRoles_Page';
import SuperAdminDashboard_Page from './page/SuperAdmin_Pages/SuperAdminDashboard_Page';
import PrincipalDashboard_Page from './page/Principal_Pages/PrincipalDashboard_Page';
import PrincipalManageTeacher_Page from './page/Principal_Pages/PrincipalManageTeacher_Page';
import PrincipalCreateTeacher_Page from './page/Principal_Pages/PrincipalCreateTeacher_Page';
import PrincipalCreateStudent_Page from './page/Principal_Pages/PrincipalCreateStudent_Page';
import PrincipalManageStudent_Page from './page/Principal_Pages/PrincipalManageStudent_Page';
import TeacherDashboard_Page from './page/Teacher_Pages/TeacherDashboard_Page';
import TeacherClasses_Page from './page/Teacher_Pages/TeacherClasses_Page';
import TeacherAttendance_Page from './page/Teacher_Pages/TeacherAttendance_Page';
import TeacherCreateExam_Page from './page/Teacher_Pages/TeacherCreateExam_Page';
import TeacherExamGrading_Page from './page/Teacher_Pages/TeacherExamGrading_Page';
import StudentDashboard_Page from './page/Student_Pages/StudentDashboard_Page';
import StudentTimeTable_Page from './page/Student_Pages/StudentTimeTable_Page';
import StudentExam_Page from './page/Student_Pages/StudentExam_Page';
import StudentAttendance_Page from './page/Student_Pages/StudentAttendance_Page';
import RegistrarDashboard_Page from './page/Registrar_Pages/RegistrarDashboard_Page';
import RegistrarAdmissions_Page from './page/Registrar_Pages/RegistrarAdmissions_Page';
import RegistrarRecords_Page from './page/Registrar_Pages/RegistrarRecords_Page';
import RegistrarDocuments_Page from './page/Registrar_Pages/RegistrarDocuments_Page';
import ParentDashboard_Page from './page/Parent_Pages/ParentDashboard_Page';
import ParentChildren_Page from './page/Parent_Pages/ParentChildren_Page';
import ParentAttendance_Page from './page/Parent_Pages/ParentAttendance_Page';
import ParentPayment_Page from './page/Parent_Pages/ParentPayment_Page';
import AdminManageParent_Page from './page/Admin_Pages/AdminManageParent_Page';

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
        // autoClose={1500} 
        // hideProgressBar={true} 
        // pauseOnHover={false}
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
          <Route path="termsAndConditions" element={<TermsAndConditionsPage />} />
        </Route>

        {/* =====>] All School Admin Routes [<===== */}
        <Route path='/admin' element={<CheckAuth isInitialAuthCheckComplete={isInitialAuthCheckComplete} isAuthenticated={isAuthenticated} user={user} >
          <AdminDashboardLayout />
        </CheckAuth>}>
          <Route index path="onboarding" element={<OnboardingPage />} />
          <Route path="contactSupport" element={<ContactSupportPage />} />
          <Route path="createSchool" element={<CreateSchoolPage />} />
          <Route path="dashboard/:id" index element={<AdminDashboard_Page />} />
          <Route path="teachers">
            <Route index element={<AdminManageTeacher_Page />} />
            <Route path="manage" element={<AdminManageTeacher_Page />} />
            <Route path="attendance" element={<AdminTeacherAttendance_Page />} />
          </Route>
          <Route path="students">
            <Route index element={<AdminManageStudent_Page />} />
            <Route path="manage" element={<AdminManageStudent_Page />} />
            <Route path="admissions" element={<AdminStudentAdmission_Page />} />
            <Route path="attendance" element={<AdminStudentAttendance_Page />} />
          </Route>
          <Route path="parents">
            <Route index element={<AdminManageParent_Page />} />
            <Route path="manage" element={<AdminManageParent_Page />} />
          </Route>
          <Route path="academic">
            <Route index element={<AdminAcademicClasses_Page />} />
            <Route path="classes" element={<AdminAcademicClasses_Page />} />
            <Route path="subjects" element={<AdminAcademicSubjects_Page />} />
            <Route path="timetable" element={<AdminAcademicTimeTable_Page />} />
          </Route>
          <Route path="finance">
            <Route index element={<AdminFinancePayments_Page />} />
            <Route path="payments" element={<AdminFinancePayments_Page />} />
          </Route>
        </Route>

        {/* =====>] All Accountant Routes [<===== */}
        <Route
          path='/accountant'
          element={
            <CheckAuth isInitialAuthCheckComplete={isInitialAuthCheckComplete} isAuthenticated={isAuthenticated} user={user}>
              <AccountantDashboardLayout />
            </CheckAuth>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AccountantDashobard_Page />} />
          <Route path="fees" element={<AccountantFees_Page />} />
          <Route path="payments" element={<AccountantPayments_Page />} />
          <Route path="reports" element={<AccountantReports_Page />} />
        </Route>

        {/* =====>] All Super Admin Routes [<===== */}
        <Route path='/superAdmin' element={<CheckAuth isInitialAuthCheckComplete={isInitialAuthCheckComplete} isAuthenticated={isAuthenticated} user={user} >
          <SuperAdminDashboardLayout />
        </CheckAuth>}>
          {/* <Route index element={<Navigate to="dashboard" replace />} /> */}
          <Route path="dashboard" index element={<SuperAdminDashboard_Page />} />
          <Route path="system">
            {/* <Route index element={<SuperAdminSystemSchools_Page />} /> */}
            <Route path="schools" element={<SuperAdminSystemSchools_Page />} />
            <Route path="users" element={<SuperAdminSystemUsers_Page />} />
            <Route path="roles" element={<SuperAdminSystemRoles_Page />} />
          </Route>
          <Route path="auditLogs" element={<SuperAdminAuditLogs_Page />} />
        </Route>

        {/* =====>] All Principal Admin Routes [<===== */}
        <Route path='/principal' element={<CheckAuth isInitialAuthCheckComplete={isInitialAuthCheckComplete} isAuthenticated={isAuthenticated} user={user} >
          <PrincipalDashboardLayout />
        </CheckAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" index element={<PrincipalDashboard_Page />} />
          <Route path="teachers">
            <Route index element={<PrincipalManageTeacher_Page />} />
            <Route path="manage" element={<PrincipalManageTeacher_Page />} />
            <Route path="create" element={<PrincipalCreateTeacher_Page />} />
          </Route>
          <Route path="students">
            <Route index element={<PrincipalManageStudent_Page />} />
            <Route path="manage" element={<PrincipalManageStudent_Page />} />
            <Route path="create" element={<PrincipalCreateStudent_Page />} />
          </Route>
        </Route>

        {/* =====>] All Teacher Admin Routes [<===== */}
        <Route path='/teacher' element={<CheckAuth isInitialAuthCheckComplete={isInitialAuthCheckComplete} isAuthenticated={isAuthenticated} user={user} >
          <TeacherDashboardLayout />
        </CheckAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard_Page />} />
          <Route path="classes" element={<TeacherClasses_Page />} />
          <Route path="attendance" element={<TeacherAttendance_Page />} />
          <Route path="exams">
            <Route index element={<TeacherCreateExam_Page />} />
            <Route path="create" element={<TeacherCreateExam_Page />} />
            <Route path="grading" element={<TeacherExamGrading_Page />} />
          </Route>
        </Route>

        {/* =====>] All Student Admin Routes [<===== */}
        <Route path='/student' element={<CheckAuth isInitialAuthCheckComplete={isInitialAuthCheckComplete} isAuthenticated={isAuthenticated} user={user} >
          <StudentDasboardLayout />
        </CheckAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard_Page />} />
          <Route path="timetable" element={<StudentTimeTable_Page />} />
          <Route path="exams" element={<StudentExam_Page />} />
          <Route path="attendance" element={<StudentAttendance_Page />} />
        </Route>

        {/* =====>] All Registrar Admin Routes [<===== */}
        <Route path='/registrar' element={<CheckAuth isInitialAuthCheckComplete={isInitialAuthCheckComplete} isAuthenticated={isAuthenticated} user={user} >
          <RegistrarDashboardLayout />
        </CheckAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<RegistrarDashboard_Page />} />
          <Route path="admissions" element={<RegistrarAdmissions_Page />} />
          <Route path="records" element={<RegistrarRecords_Page />} />
          <Route path="documents" element={<RegistrarDocuments_Page />} />
        </Route>

        {/* =====>] All Parent Admin Routes [<===== */}
        <Route path='/parent' element={<CheckAuth isInitialAuthCheckComplete={isInitialAuthCheckComplete} isAuthenticated={isAuthenticated} user={user} >
          <ParentDashboardLayout />
        </CheckAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ParentDashboard_Page />} />
          <Route path="children" element={<ParentChildren_Page />} />
          <Route path="attendance" element={<ParentAttendance_Page />} />
          <Route path="payments" element={<ParentPayment_Page />} />
        </Route>

      </Routes>
    </>
  )
}

export default App

