import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  teachers: [],
  isLoading: false,
  error: null
};

// Get All teachers
export const getTeachersByUser = createAsyncThunk(
  "teachers/getByUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        'https://attendance-management-system-backen.vercel.app/api/v1/admin/teachers/users'
      );
      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching teachers:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create new Teacher
export const createTeacher = createAsyncThunk(
  "teachers/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "https://attendance-management-system-backen.vercel.app/api/v1/admin/teachers/users",
        formData
      );

      if (response.status !== 201) {
        return rejectWithValue(response.data);
      }

      return response.data;
    } catch (error) {
      console.error("Error creating teacher:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update Teacher
export const updateTeacher = createAsyncThunk(
  "teachers/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `https://attendance-management-system-backen.vercel.app/api/v1/admin/teachers/users/${id}`,
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

// Delete Teacher
export const deleteTeacher = createAsyncThunk(
  "teachers/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `https://attendance-management-system-backen.vercel.app/api/v1/admin/teachers/users/${id}`
      );

      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return { ...response.data, deletedId: id };
    } catch (error) {
      console.error("Error deleting teacher:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const teacherSlicer = createSlice({
  name: "adminTeacher",
  initialState: initialState,
  reducers: {
    clearTeachers: (state) => {
      state.teachers = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Teachers
      .addCase(getTeachersByUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTeachersByUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teachers = action.payload.data || [];
        console.log("action.payload");
        console.log(action.payload);
        
      })
      .addCase(getTeachersByUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Teacher
      .addCase(createTeacher.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTeacher.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          state.teachers.unshift(action.payload.data);
        }
      })
      .addCase(createTeacher.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

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
      })

      // Delete Teacher
      .addCase(deleteTeacher.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTeacher.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teachers = state.teachers.filter(
          teacher => teacher._id !== action.payload.deletedId
        );
      })
      .addCase(deleteTeacher.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Export the actions if you add any reducers
export const { clearTeachers } = teacherSlicer.actions;
export default teacherSlicer.reducer;