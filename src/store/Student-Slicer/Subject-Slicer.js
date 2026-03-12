import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  subjectDetails: null,
  isLoading: false,
  error: null
};

const BASE_URL = "https://attendance-management-system-backen.vercel.app/api/v1/teacher";

// Get subject details by ID
export const getSubjectDetails = createAsyncThunk(
  "studentSubject/getDetails",
  async (subjectId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/subject/specific/${subjectId}`
      );

      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

const studentSubjectSlicer = createSlice({
  name: "studentSubject",
  initialState: initialState,
  reducers: {
    clearSubjectDetails: (state) => {
      state.subjectDetails = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSubjectDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSubjectDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subjectDetails = action.payload.data || null;
      })
      .addCase(getSubjectDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch subject details";
        state.subjectDetails = null;
      });
  },
});

export const { clearSubjectDetails } = studentSubjectSlicer.actions;
export default studentSubjectSlicer.reducer;