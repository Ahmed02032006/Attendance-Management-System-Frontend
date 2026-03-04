import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  dashboardSubjects: [],
  dashboardAttendance: {},
  teacherStats: {
    totalCourses: 0,
    totalStudents: 0,
    totalAttendanceRecords: 0,
    todayAttendance: 0,
    averageAttendance: 0,
    attendanceRate: 0,
    mostActiveSubject: 'N/A',
    attendanceBySubject: {},
    attendanceTrend: []
  },
  isLoading: false,
  statsLoading: false,
};

// Get dashboard subjects for a user
export const getDashboardSubjects = createAsyncThunk(
  "dashboard/getSubjects",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://attendance-management-system-backen.vercel.app/api/v1/teacher/dashboard/subjects/${userId}`
      );

      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get dashboard attendance data for a user
export const getDashboardAttendance = createAsyncThunk(
  "dashboard/getAttendance",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://attendance-management-system-backen.vercel.app/api/v1/teacher/dashboard/attendance/${userId}`
      );

      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get teacher stats
export const getTeacherStats = createAsyncThunk(
  "dashboard/getStats",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://attendance-management-system-backen.vercel.app/api/v1/teacher/dashboard/stats/${userId}`
      );

      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const dashboardSlicer = createSlice({
  name: "dashboard",
  initialState: initialState,
  reducers: {
    clearDashboard: (state) => {
      state.dashboardSubjects = [];
      state.dashboardAttendance = {};
      state.teacherStats = {
        totalCourses: 0,
        totalStudents: 0,
        totalAttendanceRecords: 0,
        todayAttendance: 0,
        averageAttendance: 0,
        attendanceRate: 0,
        mostActiveSubject: 'N/A',
        attendanceBySubject: {},
        attendanceTrend: []
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Dashboard Subjects
      .addCase(getDashboardSubjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDashboardSubjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardSubjects = action.payload.data || [];
      })
      .addCase(getDashboardSubjects.rejected, (state, action) => {
        state.isLoading = false;
        state.dashboardSubjects = [];
      })
      
      // Get Dashboard Attendance
      .addCase(getDashboardAttendance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDashboardAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardAttendance = action.payload.data || {};
      })
      .addCase(getDashboardAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.dashboardAttendance = {};
      })
      
      // Get Teacher Stats
      .addCase(getTeacherStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(getTeacherStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.teacherStats = action.payload.data || {
          totalCourses: 0,
          totalStudents: 0,
          totalAttendanceRecords: 0,
          todayAttendance: 0,
          averageAttendance: 0,
          attendanceRate: 0,
          mostActiveSubject: 'N/A',
          attendanceBySubject: {},
          attendanceTrend: []
        };
      })
      .addCase(getTeacherStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.teacherStats = {
          totalCourses: 0,
          totalStudents: 0,
          totalAttendanceRecords: 0,
          todayAttendance: 0,
          averageAttendance: 0,
          attendanceRate: 0,
          mostActiveSubject: 'N/A',
          attendanceBySubject: {},
          attendanceTrend: []
        };
      });
  },
});

export const { clearDashboard } = dashboardSlicer.actions;
export default dashboardSlicer.reducer;