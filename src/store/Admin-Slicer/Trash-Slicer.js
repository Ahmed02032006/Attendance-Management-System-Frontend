import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = 'https://attendance-management-system-backen.vercel.app/api/v1/admin/trash';

const initialState = {
  trashItems: [],
  selectedTrashItem: null,
  isLoading: false,
  error: null,
  summary: {
    totalItems: 0,
    totalAttendanceRecords: 0,
    totalRegisteredStudents: 0,
    totalClassSchedules: 0,
    byDeletionType: {
      teacher: 0,
      admin: 0
    },
    expiredItems: 0
  }
};

// ==================== GET ALL TRASH ITEMS ====================
export const getTrashItems = createAsyncThunk(
  "trash/getItems",
  async (filters = {}, { rejectWithValue }) => {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.deletedFrom) queryParams.append('deletedFrom', filters.deletedFrom);
      if (filters.teacherId) queryParams.append('teacherId', filters.teacherId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

      const url = queryParams.toString() 
        ? `${API_BASE_URL}?${queryParams.toString()}`
        : API_BASE_URL;

      const response = await axios.get(url);

      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching trash items:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ==================== GET SINGLE TRASH ITEM DETAILS ====================
export const getTrashItemDetails = createAsyncThunk(
  "trash/getItemDetails",
  async (trashId, { rejectWithValue }) => {
    try {
      if (!trashId) {
        return rejectWithValue("Trash ID is required");
      }

      const response = await axios.get(`${API_BASE_URL}/${trashId}`);

      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching trash item details:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ==================== MOVE SUBJECT TO TRASH ====================
export const moveToTrash = createAsyncThunk(
  "trash/moveToTrash",
  async ({ subjectId, userId, deletedFrom }, { rejectWithValue }) => {
    try {
      if (!subjectId || !userId || !deletedFrom) {
        return rejectWithValue("Subject ID, User ID, and deletedFrom are required");
      }

      const response = await axios.post(
        `${API_BASE_URL}/move/${subjectId}`,
        { userId, deletedFrom }
      );

      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return response.data;
    } catch (error) {
      console.error("Error moving to trash:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ==================== RECOVER FROM TRASH ====================
export const recoverFromTrash = createAsyncThunk(
  "trash/recover",
  async ({ trashId, userId }, { rejectWithValue }) => {
    try {
      if (!trashId || !userId) {
        return rejectWithValue("Trash ID and User ID are required");
      }

      const response = await axios.post(
        `${API_BASE_URL}/recover/${trashId}`,
        { userId }
      );

      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return { ...response.data, recoveredId: trashId };
    } catch (error) {
      console.error("Error recovering from trash:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ==================== PERMANENT DELETE FROM TRASH ====================
export const permanentDeleteFromTrash = createAsyncThunk(
  "trash/permanentDelete",
  async (trashId, { rejectWithValue }) => {
    try {
      if (!trashId) {
        return rejectWithValue("Trash ID is required");
      }

      const response = await axios.delete(`${API_BASE_URL}/${trashId}`);

      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return { ...response.data, deletedId: trashId };
    } catch (error) {
      console.error("Error permanently deleting from trash:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ==================== BULK PERMANENT DELETE FROM TRASH ====================
export const bulkPermanentDeleteFromTrash = createAsyncThunk(
  "trash/bulkPermanentDelete",
  async (trashIds, { rejectWithValue }) => {
    try {
      if (!trashIds || !Array.isArray(trashIds) || trashIds.length === 0) {
        return rejectWithValue("Please provide an array of trash IDs");
      }

      // Note: You'll need to add this endpoint to your backend
      const response = await axios.post(`${API_BASE_URL}/bulk-delete`, { trashIds });

      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return { ...response.data, deletedIds: trashIds };
    } catch (error) {
      console.error("Error bulk deleting from trash:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ==================== CLEAR ALL FILTERS ====================
export const clearTrashFilters = createAsyncThunk(
  "trash/clearFilters",
  async (_, { dispatch }) => {
    dispatch(setFilters({}));
    return await dispatch(getTrashItems({})).unwrap();
  }
);

const trashSlicer = createSlice({
  name: "adminTrash",
  initialState: initialState,
  reducers: {
    clearTrash: (state) => {
      state.trashItems = [];
      state.selectedTrashItem = null;
      state.error = null;
      state.summary = initialState.summary;
    },
    clearSelectedTrashItem: (state) => {
      state.selectedTrashItem = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    setSelectedTrashItem: (state, action) => {
      state.selectedTrashItem = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // ========== GET TRASH ITEMS ==========
      .addCase(getTrashItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTrashItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trashItems = action.payload.data?.items || [];
        state.summary = action.payload.data?.summary || initialState.summary;
      })
      .addCase(getTrashItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ========== GET TRASH ITEM DETAILS ==========
      .addCase(getTrashItemDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTrashItemDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTrashItem = action.payload.data || null;
      })
      .addCase(getTrashItemDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ========== MOVE TO TRASH ==========
      .addCase(moveToTrash.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(moveToTrash.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add the new trash item to the list if it's returned in the response
        if (action.payload.data) {
          const newItem = {
            id: action.payload.data.trashId,
            subject: action.payload.data.subject,
            statistics: action.payload.data.statistics,
            deletion: {
              deletedBy: action.payload.data.deletedBy,
              deletedAt: action.payload.data.deletedAt,
              expiresAt: action.payload.data.expiresAt,
              daysRemaining: action.payload.data.daysRemaining
            }
          };
          state.trashItems.unshift(newItem);
          
          // Update summary
          state.summary.totalItems += 1;
          state.summary.totalAttendanceRecords += action.payload.data.statistics.attendanceRecords;
          state.summary.totalRegisteredStudents += action.payload.data.statistics.registeredStudents;
          state.summary.totalClassSchedules += action.payload.data.statistics.classSchedules;
          
          if (action.payload.data.deletedBy?.role === 'Teacher') {
            state.summary.byDeletionType.teacher += 1;
          } else if (action.payload.data.deletedBy?.role === 'Admin') {
            state.summary.byDeletionType.admin += 1;
          }
        }
      })
      .addCase(moveToTrash.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ========== RECOVER FROM TRASH ==========
      .addCase(recoverFromTrash.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(recoverFromTrash.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove the recovered item from trash items list
        const recoveredId = action.payload.recoveredId;
        const recoveredItem = state.trashItems.find(item => item.id === recoveredId);
        
        if (recoveredItem) {
          // Update summary before removing
          state.summary.totalItems -= 1;
          state.summary.totalAttendanceRecords -= recoveredItem.statistics?.attendanceRecords || 0;
          state.summary.totalRegisteredStudents -= recoveredItem.statistics?.registeredStudents || 0;
          state.summary.totalClassSchedules -= recoveredItem.statistics?.classSchedules || 0;
          
          if (recoveredItem.deletion?.deletedBy?.role === 'Teacher') {
            state.summary.byDeletionType.teacher -= 1;
          } else if (recoveredItem.deletion?.deletedBy?.role === 'Admin') {
            state.summary.byDeletionType.admin -= 1;
          }
        }
        
        // Remove from list
        state.trashItems = state.trashItems.filter(
          item => item.id !== recoveredId
        );
        
        // Clear selected item if it was the recovered one
        if (state.selectedTrashItem?.id === recoveredId) {
          state.selectedTrashItem = null;
        }
      })
      .addCase(recoverFromTrash.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ========== PERMANENT DELETE FROM TRASH ==========
      .addCase(permanentDeleteFromTrash.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(permanentDeleteFromTrash.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.payload.deletedId;
        const deletedItem = state.trashItems.find(item => item.id === deletedId);
        
        if (deletedItem) {
          // Update summary before removing
          state.summary.totalItems -= 1;
          state.summary.totalAttendanceRecords -= deletedItem.statistics?.attendanceRecords || 0;
          state.summary.totalRegisteredStudents -= deletedItem.statistics?.registeredStudents || 0;
          state.summary.totalClassSchedules -= deletedItem.statistics?.classSchedules || 0;
          
          if (deletedItem.deletion?.deletedBy?.role === 'Teacher') {
            state.summary.byDeletionType.teacher -= 1;
          } else if (deletedItem.deletion?.deletedBy?.role === 'Admin') {
            state.summary.byDeletionType.admin -= 1;
          }
          
          if (deletedItem.deletion?.isExpired) {
            state.summary.expiredItems -= 1;
          }
        }
        
        state.trashItems = state.trashItems.filter(
          item => item.id !== deletedId
        );
        
        if (state.selectedTrashItem?.id === deletedId) {
          state.selectedTrashItem = null;
        }
      })
      .addCase(permanentDeleteFromTrash.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ========== BULK PERMANENT DELETE FROM TRASH ==========
      .addCase(bulkPermanentDeleteFromTrash.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bulkPermanentDeleteFromTrash.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedIds = action.payload.deletedIds || [];
        
        // Remove all deleted items
        state.trashItems = state.trashItems.filter(
          item => !deletedIds.includes(item.id)
        );
        
        if (state.selectedTrashItem && deletedIds.includes(state.selectedTrashItem.id)) {
          state.selectedTrashItem = null;
        }
      })
      .addCase(bulkPermanentDeleteFromTrash.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearTrash, 
  clearSelectedTrashItem, 
  clearError,
  setFilters,
  setSelectedTrashItem 
} = trashSlicer.actions;

export default trashSlicer.reducer;