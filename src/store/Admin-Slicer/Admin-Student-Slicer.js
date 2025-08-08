import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  students: null,
  isLoading: false,
  isError: false,
  errorMessage: null,
  successMessage: null,
};

// Get Students by School ID
export const getStudentsBySchoolId = createAsyncThunk(
  "student/getBySchoolId",
  async (schoolId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/admin/student/get/school/${schoolId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Server Error" });
    }
  }
);

// Create Student
export const createStudent = createAsyncThunk(
  "student/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/v1/admin/student/create`, formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Server Error" });
    }
  }
);

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    clearStudentMessages: (state) => {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStudentsBySchoolId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getStudentsBySchoolId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students = action.payload.data;
      })
      .addCase(getStudentsBySchoolId.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message;
      })
      .addCase(createStudent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
        state.students = [action.payload.data, ...(state.students || [])];
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message;
      });
  },
});

export const { clearStudentMessages } = studentSlice.actions;
export default studentSlice.reducer;
