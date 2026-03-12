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
import adminTrashReducer from "./Admin-Slicer/Trash-Slicer.js";
// ===== >
import studentSubjectReducer from "./Student-Slicer/Subject-Slicer.js";

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
    studentSubject: studentSubjectReducer,
    // ===== >
    adminTeacher: adminTeacherReducer,
    adminTrash: adminTrashReducer,
  },
});

export default store;
