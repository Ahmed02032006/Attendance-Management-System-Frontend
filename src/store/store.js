import { configureStore } from "@reduxjs/toolkit";
// ===== >
import authReducer from "./Auth-Slicer/Auth-Slicer.js";
// ===== >
import teacherDashboardReducer from "./Teacher-Slicer/Dashboard-Slicer.js";
import teacherAttendanceReducer from "./Teacher-Slicer/Attendance-Slicer.js";
import teacherSubjectReducer from "./Teacher-Slicer/Subject-Slicer.js";
import teacherUserReducer from "./Teacher-Slicer/User-Slicer.js";
import teacherReportReducer from "./Teacher-Slicer/Report-Slicer.js";
// ===== >
import adminTeacherReducer from "./Admin-Slicer/Teacher-Slicer.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    // ===== >
    teacherDashboard: teacherDashboardReducer,
    teacherAttendance: teacherAttendanceReducer,
    teacherSubject: teacherSubjectReducer,
    teacherUser: teacherUserReducer,
    teacherReport: teacherReportReducer,
    // ===== >
    adminTeacher: adminTeacherReducer,
  },
});

export default store;
