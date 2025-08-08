import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Initial State
const initialState = {
  teachers: null,
  isLoading: false,
  isError: false,
  errorMessage: null,
};

// Create Teacher
export const createTeacher = createAsyncThunk(
  "teacher/createTeacher",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/admin/teacher/create",
        formData
      );
      if (response.status !== 201) {
        return rejectWithValue(response.data);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Server Error" });
    }
  }
);

// Get Teachers by School ID
export const getTeachersBySchoolId = createAsyncThunk(
  "teacher/getTeachersBySchoolId",
  async (schoolId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/admin/teacher/get/${schoolId}`
      );
      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Server Error" });
    }
  }
);

export const updateTeacher = createAsyncThunk(
  "teacher/updateTeacher",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/v1/admin/teacher/update/${id}`,
        formData
      );
      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Server Error" });
    }
  }
);

export const changeTeacherStatus = createAsyncThunk(
  "teacher/changeTeacherStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/v1/admin/teacher/status/change/${id}`,
        { status }
      );
      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Server Error" });
    }
  }
);

const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createTeacher.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(createTeacher.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(createTeacher.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || "Failed to create teacher";
      }).addCase(getTeachersBySchoolId.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(getTeachersBySchoolId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teachers = action.payload?.data || null;
      })
      .addCase(getTeachersBySchoolId.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || "Failed to fetch teachers";
      }).addCase(updateTeacher.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(updateTeacher.fulfilled, (state, action) => {
        state.isLoading = false;

        const updatedTeacher = action.payload?.data;
        if (state.teachers && updatedTeacher?._id) {
          const index = state.teachers.findIndex(
            (teacher) => teacher._id === updatedTeacher._id
          );
          if (index !== -1) {
            state.teachers[index] = {
              ...state.teachers[index],
              status: updatedTeacher.status,
            };
          }
        }
      })
      .addCase(updateTeacher.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || "Failed to update teacher";
      })
      .addCase(changeTeacherStatus.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(changeTeacherStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedTeachers = state.teachers.map(teacher => {
          if (teacher._id === action.payload.data._id) {
            return { ...teacher, status: action.payload.data.status };
          }
          return teacher;
        });
        state.teachers = updatedTeachers;
      })
      .addCase(changeTeacherStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload?.message || 'Failed to update teacher status';
      });;
  },
});

export default teacherSlice.reducer;