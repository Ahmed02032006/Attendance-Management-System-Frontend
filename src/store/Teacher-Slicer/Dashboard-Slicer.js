import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  dashboardSubjects: [],
  dashboardAttendance: {},
  isLoading: false,
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

const dashboardSlicer = createSlice({
  name: "dashboard",
  initialState: initialState,
  reducers: {
    clearDashboard: (state) => {
      state.dashboardSubjects = [];
      state.dashboardAttendance = {};
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
      });
  },
});

export const { clearDashboard } = dashboardSlicer.actions;
export default dashboardSlicer.reducer;