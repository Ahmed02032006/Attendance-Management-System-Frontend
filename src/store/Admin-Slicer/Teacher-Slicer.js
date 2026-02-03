import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  teachers: [],
  isLoading: false,
};

// Get All teachers
export const getTeachersByUser = createAsyncThunk(
  "teachers/getByUser",
  async ({ rejectWithValue }) => {
    try {
      console.log("check 123");
      
      const response = await axios.get(
        'https://attendance-management-system-backen.vercel.app/api/v1/admin/teachers/users'
      );
      console.log("=========================");
      console.log("IN SLICER");
      console.log("=========================");
      console.log(response);
      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
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
      return rejectWithValue(error.response.data);
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
      return rejectWithValue(error.response.data);
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
      return rejectWithValue(error.response.data);
    }
  }
);

const teacherSlicer = createSlice({
  name: "adminTeacher",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTeachersByUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTeachersByUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teachers = action.payload.data || [];
      })
      .addCase(getTeachersByUser.rejected, (state, action) => {
        state.isLoading = false;
        state.teachers = [];
      })

      // Create Teacher
      .addCase(createTeacher.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTeacher.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add new teacher to the beginning of the list
        state.teachers.unshift(action.payload.data);
      })
      .addCase(createTeacher.rejected, (state, action) => {
        state.isLoading = false;
      })

      // Update Teacher
      .addCase(updateTeacher.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTeacher.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedTeachers = action.payload.data;
        const index = state.teachers.findIndex(teacher => teacher._id === updatedTeachers._id);
        if (index !== -1) {
          state.teachers[index] = updatedTeachers;
        }
      })
      .addCase(updateTeacher.rejected, (state, action) => {
        state.isLoading = false;
      })

      // Delete Teacher
      .addCase(deleteTeacher.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteTeacher.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teachers = state.teachers.filter(
          teacher => teacher._id !== action.payload.deletedId
        );
      })
      .addCase(deleteTeacher.rejected, (state, action) => {
        state.isLoading = false;
      });
  },
});

export default teacherSlicer.reducer;