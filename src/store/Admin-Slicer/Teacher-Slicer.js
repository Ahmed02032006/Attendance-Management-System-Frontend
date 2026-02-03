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
  async (_, { rejectWithValue }) => { // Fix: Changed parameter structure
    try {
      console.log("Fetching teachers...");
      
      const response = await axios.get(
        'https://attendance-management-system-backen.vercel.app/api/v1/admin/teachers/users'
      );
      
      console.log("Response received:", response);
      
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
      console.log("Creating teacher:", formData);
      
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
      console.log("Updating teacher:", id, formData);
      
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
      console.log("Deleting teacher:", id);
      
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
    // Optional: Add any synchronous reducers if needed
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
        console.log("getTeachersByUser pending...");
      })
      .addCase(getTeachersByUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teachers = action.payload.data || [];
        console.log("getTeachersByUser fulfilled:", action.payload);
      })
      .addCase(getTeachersByUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.log("getTeachersByUser rejected:", action.payload);
      })

      // Create Teacher
      .addCase(createTeacher.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        console.log("createTeacher pending...");
      })
      .addCase(createTeacher.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add new teacher to the beginning of the list
        if (action.payload.data) {
          state.teachers.unshift(action.payload.data);
        }
        console.log("createTeacher fulfilled:", action.payload);
      })
      .addCase(createTeacher.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.log("createTeacher rejected:", action.payload);
      })

      // Update Teacher
      .addCase(updateTeacher.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        console.log("updateTeacher pending...");
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
        console.log("updateTeacher fulfilled:", action.payload);
      })
      .addCase(updateTeacher.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.log("updateTeacher rejected:", action.payload);
      })

      // Delete Teacher
      .addCase(deleteTeacher.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        console.log("deleteTeacher pending...");
      })
      .addCase(deleteTeacher.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teachers = state.teachers.filter(
          teacher => teacher._id !== action.payload.deletedId
        );
        console.log("deleteTeacher fulfilled:", action.payload);
      })
      .addCase(deleteTeacher.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.log("deleteTeacher rejected:", action.payload);
      });
  },
});

// Export the actions if you add any reducers
export const { clearTeachers } = teacherSlicer.actions;

export default teacherSlicer.reducer;