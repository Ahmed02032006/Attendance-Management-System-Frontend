import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  teachers: [],
  isLoading: false,
  error: null
};

// Update Teacher
export const updateTeacher = createAsyncThunk(
  "teachers/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `https://attendance-management-system-backen.vercel.app/api/v1/teacher/users/${id}`,
        formData
      );

      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return response.data;
    } catch (error) {
      console.error("Error updating teacher:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const teacherSlicer = createSlice({
  name: "TeacherUser",
  initialState: initialState,
  reducers: {
    clearTeachers: (state) => {
      state.teachers = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Update Teacher
      .addCase(updateTeacher.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTeacher.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedTeacher = action.payload.data;
        if (updatedTeacher) {
          const index = state.teachers.findIndex(teacher => teacher._id === updatedTeacher._id);
          if (index !== -1) {
            state.teachers[index] = updatedTeacher;
          }
        }
      })
      .addCase(updateTeacher.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Export the actions if you add any reducers
export const { clearTeachers } = teacherSlicer.actions;
export default teacherSlicer.reducer;