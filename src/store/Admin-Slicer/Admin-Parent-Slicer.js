import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  parents: null,
  isLoading: false,
  isError: false,
  errorMessage: null,
  successMessage: null,
};

export const getParentsBySchoolId = createAsyncThunk(
  "parent/getBySchoolId",
  async (schoolId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/admin/parent/get/school/${schoolId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Server Error" });
    }
  }
);

// Create Parent
export const createParent = createAsyncThunk(
  "parent/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/v1/admin/parent/create`, formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Server Error" });
    }
  }
);

const parentSlice = createSlice({
  name: "parent",
  initialState,
  reducers: {
    clearParentMessages: (state) => {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getParentsBySchoolId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getParentsBySchoolId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.parents = action.payload.data;
      })
      .addCase(getParentsBySchoolId.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message;
      }).addCase(createParent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createParent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(createParent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message;
      });
  },
});

export const { clearParentMessages } = parentSlice.actions;
export default parentSlice.reducer;
