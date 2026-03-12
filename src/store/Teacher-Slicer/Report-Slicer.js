import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  reportData: null,
  studentAttendanceDetails: null,
  isLoading: false,
  studentDetailsLoading: false,
  error: null
};

const BASE_URL = "https://attendance-management-system-backen.vercel.app/api/v1/teacher";

// Get subject attendance report
export const getSubjectAttendanceReport = createAsyncThunk(
  "attendanceReport/getBySubject",
  async ({ subjectId, teacherId, fromDate, toDate }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/reports/${subjectId}`,
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

// Get student attendance details by roll number and subject
export const getStudentAttendanceDetails = createAsyncThunk(
  "attendanceReport/getStudentDetails",
  async ({ rollNo, subjectId, teacherId, fromDate, toDate }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/reports/studentAttendanceDetail/${rollNo}/${subjectId}`,
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
        `${BASE_URL}/report/${subjectId}/export`,
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
    },
    clearStudentDetails: (state) => {
      state.studentAttendanceDetails = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Subject Report
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
      })

      // Get Student Attendance Details
      .addCase(getStudentAttendanceDetails.pending, (state) => {
        state.studentDetailsLoading = true;
        state.error = null;
      })
      .addCase(getStudentAttendanceDetails.fulfilled, (state, action) => {
        state.studentDetailsLoading = false;
        state.studentAttendanceDetails = action.payload.data;
        state.error = null;
      })
      .addCase(getStudentAttendanceDetails.rejected, (state, action) => {
        state.studentDetailsLoading = false;
        state.error = action.payload?.message || 'Failed to fetch student details';
        state.studentAttendanceDetails = null;
      });
  }
});

export const { clearReport, clearStudentDetails } = attendanceReportSlicer.actions;
export default attendanceReportSlicer.reducer;