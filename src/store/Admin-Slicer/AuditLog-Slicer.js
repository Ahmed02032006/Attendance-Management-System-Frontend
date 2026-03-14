import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "https://attendance-management-system-backen.vercel.app/api/v1/admin";

const initialState = {
  teacherAuditLogs: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  },
  isLoading: false,
  isCreating: false,
  error: null
};

// Create a new audit log
export const createAuditLog = createAsyncThunk(
  "auditLogs/create",
  async (logData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/audit/logs`,
        logData
      );

      if (response.status !== 201) {
        return rejectWithValue(response.data);
      }

      return response.data;
    } catch (error) {
      console.error("Error creating audit log:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get audit logs for a specific teacher
export const getTeacherAuditLogs = createAsyncThunk(
  "auditLogs/getByTeacher",
  async ({ teacherId, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/audit/logs/teacher/${teacherId}?page=${page}&limit=${limit}`
      );
      
      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching teacher audit logs:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const auditLogSlicer = createSlice({
  name: "auditLog",
  initialState: initialState,
  reducers: {
    clearTeacherAuditLogs: (state) => {
      state.teacherAuditLogs = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Audit Log
      .addCase(createAuditLog.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createAuditLog.fulfilled, (state) => {
        state.isCreating = false;
      })
      .addCase(createAuditLog.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })

      // Get Teacher Audit Logs
      .addCase(getTeacherAuditLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTeacherAuditLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teacherAuditLogs = action.payload.data.logs || [];
        state.pagination = action.payload.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 20
        };
      })
      .addCase(getTeacherAuditLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTeacherAuditLogs } = auditLogSlicer.actions;
export default auditLogSlicer.reducer;