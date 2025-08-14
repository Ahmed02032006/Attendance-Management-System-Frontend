import { configureStore } from "@reduxjs/toolkit";
// ===== >
import authReducer from "./Auth-Slicer/Auth-Slicer.js";
// ===== >
import adminSchoolReducer from "./Admin-Slicer/Admin-School-Slicer.js";
import adminTeacherReducer from "./Admin-Slicer/Admin-Teacher-Slicer.js";
import adminClassReducer from "./Admin-Slicer/Admin-Class-Slicer.js";
import adminSubjectReducer from "./Admin-Slicer/Admin-Subject-Slicer.js";
import adminAdmissionReducer from "./Admin-Slicer/Admin-Admission-Slicer.js";
import adminStudentReducer from "./Admin-Slicer/Admin-Student-Slicer.js";
import adminParentReducer from "./Admin-Slicer/Admin-Parent-Slicer.js";
import adminTimeTableReducer from "./Admin-Slicer/Admin-TimeTable-Slicer.js";
import adminOtherUsersReducer from "./Admin-Slicer/Admin-OtherUser-Slicer.js";
// ===== >
import superAdminSchoolReducer from "./Super_Admin-Slicer/Super_Admin-Schools-Slicer.js";
import superAdminUserReducer from "./Super_Admin-Slicer/Super_Admin-Users-Slicer.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    // ===== >
    adminSchool: adminSchoolReducer,
    adminTeacher: adminTeacherReducer,
    adminClass: adminClassReducer,
    adminSubject: adminSubjectReducer,
    adminAdmission: adminAdmissionReducer,
    adminStudent: adminStudentReducer,
    adminParent: adminParentReducer,
    adminTimeTable: adminTimeTableReducer,
    adminOtherUsers: adminOtherUsersReducer,
    // ===== >
    superAdminSchool: superAdminSchoolReducer,
    superAdminUser: superAdminUserReducer,
  },
});

export default store;
