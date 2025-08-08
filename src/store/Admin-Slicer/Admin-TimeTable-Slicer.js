import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  isError: false,
  errorMessage: null,
  successMessage: null,
  timeTables: [],
  singleTimetable: null,
};

export const createTimeTable = createAsyncThunk(
  "timetable/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/v1/admin/timeTable/create`, formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Server Error" });
    }
  }
);

export const getTimetablesBySchoolId = createAsyncThunk(
  "timetable/getBySchoolId",
  async (schoolId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/admin/timeTable/get/${schoolId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Server Error" });
    }
  }
);

export const getTimetableById = createAsyncThunk(
  "timetable/getById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/admin/timeTable/single/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Server Error" });
    }
  }
);

export const updateTimetable = createAsyncThunk(
  "timetable/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/v1/admin/timeTable/update/${id}`, formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Server Error" });
    }
  }
);

export const deleteTimetable = createAsyncThunk(
  "timetable/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/v1/admin/timeTable/delete/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Server Error" });
    }
  }
);

const adminTimeTableSlice = createSlice({
  name: "adminTimeTable",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get all by school ID
      .addCase(getTimetablesBySchoolId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTimetablesBySchoolId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.timeTables = action.payload.data;
      })
      .addCase(getTimetablesBySchoolId.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message;
      })

      // Get single timetable
      .addCase(getTimetableById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTimetableById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.singleTimetable = action.payload.data;
      })
      .addCase(getTimetableById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message;
      })

      // Create timetable
      .addCase(createTimeTable.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTimeTable.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Timetable created successfully";
        state.timeTables.unshift(action.payload.data); // optionally add to list
      })
      .addCase(createTimeTable.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message;
      })

      // Update timetable
      .addCase(updateTimetable.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTimetable.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Timetable updated successfully";
        const updated = action.payload.data;
        state.timeTables = state.timeTables.map((item) =>
          item._id === updated._id ? updated : item
        );
      })
      .addCase(updateTimetable.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message;
      })

      // Delete timetable
      .addCase(deleteTimetable.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteTimetable.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
        const id = action.meta.arg;
        state.timeTables = state.timeTables.filter((item) => item._id !== id);
      })
      .addCase(deleteTimetable.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message;
      });
  },
});

export default adminTimeTableSlice.reducer;