import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "https://attendance-management-system-backen.vercel.app/api/v1/teacher/reports";

export const getCourseAttendanceReport = createAsyncThunk(
  "teacherReport/getCourseAttendance",
  async ({ subjectId, fromDate, toDate, teacherId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/course-attendance`,
        { params: { subjectId, fromDate, toDate, teacherId } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const exportAttendanceReport = createAsyncThunk(
  "teacherReport/exportAttendance",
  async ({ subjectId, fromDate, toDate, teacherId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/export-csv`,
        { 
          params: { subjectId, fromDate, toDate, teacherId },
          responseType: 'blob'
        }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_report_${subjectId}_${fromDate}_to_${toDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const teacherReportSlice = createSlice({
  name: "teacherReport",
  initialState: {
    reportData: null,
    isLoading: false,
    exportLoading: false,
    error: null
  },
  reducers: {
    clearReport: (state) => {
      state.reportData = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Course Attendance Report
      .addCase(getCourseAttendanceReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCourseAttendanceReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reportData = action.payload.data;
      })
      .addCase(getCourseAttendanceReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Export Attendance Report
      .addCase(exportAttendanceReport.pending, (state) => {
        state.exportLoading = true;
        state.error = null;
      })
      .addCase(exportAttendanceReport.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportAttendanceReport.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearReport } = teacherReportSlice.actions;
export default teacherReportSlice.reducer;