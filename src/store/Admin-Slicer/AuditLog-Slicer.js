import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "https://attendance-management-system-backen.vercel.app/api/v1/admin";

const initialState = {
  auditLogs: [],
  teacherAuditLogs: [],
  auditSummary: null,
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

// Get all audit logs (admin view)
export const getAllAuditLogs = createAsyncThunk(
  "auditLogs/getAll",
  async ({ page = 1, limit = 20, teacherId, action, status, startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      let url = `${API_BASE_URL}/audit/logs?page=${page}&limit=${limit}`;
      
      if (teacherId) url += `&teacherId=${teacherId}`;
      if (action) url += `&action=${action}`;
      if (status) url += `&status=${status}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await axios.get(url);
      
      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get audit logs for a specific teacher
export const getTeacherAuditLogs = createAsyncThunk(
  "auditLogs/getByTeacher",
  async ({ teacherId, page = 1, limit = 20, action, status, startDate, endDate }, { rejectWithValue }) => {
    try {
      let url = `${API_BASE_URL}/audit/logs/teacher/${teacherId}?page=${page}&limit=${limit}`;
      
      if (action) url += `&action=${action}`;
      if (status) url += `&status=${status}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await axios.get(url);
      
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

// Get audit summary for a teacher
export const getTeacherAuditSummary = createAsyncThunk(
  "auditLogs/getTeacherSummary",
  async (teacherId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/audit/logs/teacher/${teacherId}/summary`);
      
      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching audit summary:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const auditLogSlicer = createSlice({
  name: "auditLog",
  initialState: initialState,
  reducers: {
    clearAuditLogs: (state) => {
      state.auditLogs = [];
      state.teacherAuditLogs = [];
      state.auditSummary = null;
      state.error = null;
    },
    clearTeacherAuditLogs: (state) => {
      state.teacherAuditLogs = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Audit Log
      .addCase(createAuditLog.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createAuditLog.fulfilled, (state, action) => {
        state.isCreating = false;
        // Optionally add the new log to the beginning of the list
        if (action.payload.data) {
          state.auditLogs.unshift(action.payload.data);
        }
      })
      .addCase(createAuditLog.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })

      // Get All Audit Logs
      .addCase(getAllAuditLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllAuditLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.auditLogs = action.payload.data.logs || [];
        state.pagination = action.payload.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 20
        };
      })
      .addCase(getAllAuditLogs.rejected, (state, action) => {
        state.isLoading = false;
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
      })

      // Get Teacher Audit Summary
      .addCase(getTeacherAuditSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTeacherAuditSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.auditSummary = action.payload.data;
      })
      .addCase(getTeacherAuditSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAuditLogs, clearTeacherAuditLogs } = auditLogSlicer.actions;
export default auditLogSlicer.reducer;