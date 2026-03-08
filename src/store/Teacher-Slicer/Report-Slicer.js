import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  reportData: null,
  isLoading: false,
  error: null,
  selectedStudent: null
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

// Get student attendance details
export const getStudentAttendanceDetail = createAsyncThunk(
  "studentAttendanceDetail/getByStudent",
  async ({ rollNo, subjectId, teacherId, fromDate, toDate }, { rejectWithValue }) => {
    try {
      // Build URL with path parameters
      let url = `${BASE_URL}/reports/studentAttendanceDetail/${rollNo}/${subjectId}`;

      // Build query parameters
      const params = {};
      if (teacherId) params.teacherId = teacherId;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await axios.get(url, { params });

      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Clear selected student
export const clearSelectedStudent = createAsyncThunk(
  "studentAttendanceDetail/clearSelected",
  async () => {
    return null;
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
    setSelectedStudent: (state, action) => {
      state.selectedStudent = action.payload;
    },
    clearStudentDetail: (state) => {
      state.studentDetail = null;
      state.error = null;
    },
    resetStudentDetailState: (state) => {
      state.studentDetail = null;
      state.isLoading = false;
      state.error = null;
      state.selectedStudent = null;
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
      })
      // Get Student Detail
      .addCase(getStudentAttendanceDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getStudentAttendanceDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.studentDetail = action.payload.data;
        state.error = null;
      })
      .addCase(getStudentAttendanceDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch student attendance details';
        state.studentDetail = null;
      })
      // Clear Selected Student
      .addCase(clearSelectedStudent.fulfilled, (state) => {
        state.selectedStudent = null;
        state.studentDetail = null;
      });
  }
});

export const { clearReport, setSelectedStudent,clearStudentDetail,resetStudentDetailState } = attendanceReportSlicer.actions;
export default attendanceReportSlicer.reducer;
