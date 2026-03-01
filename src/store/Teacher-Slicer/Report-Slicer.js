import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  reportData: null,
  isLoading: false,
  error: null
};

const BASE_URL = "https://attendance-management-system-backen.vercel.app/api/v1/teacher";

// Get subject attendance report
export const getSubjectAttendanceReport = createAsyncThunk(
  "attendanceReport/getBySubject",
  async ({ subjectId, teacherId, fromDate, toDate }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/attendance/report/${subjectId}`,
        {
          params: {
            teacherId,
            fromDate,
            toDate
          }
        }
      );

      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Export attendance report
export const exportAttendanceReport = createAsyncThunk(
  "attendanceReport/export",
  async ({ subjectId, teacherId, fromDate, toDate, format = 'csv' }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/attendance/report/${subjectId}/export`,
        {
          params: {
            teacherId,
            fromDate,
            toDate,
            format
          },
          responseType: 'blob' // For file download
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const attendanceReportSlicer = createSlice({
  name: "attendanceReport",
  initialState: initialState,
  reducers: {
    clearReport: (state) => {
      state.reportData = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Report
      .addCase(getSubjectAttendanceReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSubjectAttendanceReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reportData = action.payload.data;
        state.error = null;
      })
      .addCase(getSubjectAttendanceReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to generate report';
        state.reportData = null;
      });
  }
});

export const { clearReport } = attendanceReportSlicer.actions;
export default attendanceReportSlicer.reducer;
