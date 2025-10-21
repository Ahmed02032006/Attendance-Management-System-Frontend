import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  subjects: [],
  isLoading: false,
  currentSubject: null
};

// Get subjects by user ID
export const getSubjectsByUser = createAsyncThunk(
  "subjects/getByUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://attendance-management-system-backen.vercel.app/api/v1/teacher/subject/user/${userId}`
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

// Create new subject
export const createSubject = createAsyncThunk(
  "subjects/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "https://attendance-management-system-backen.vercel.app/api/v1/teacher/subject/",
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

// Update subject
export const updateSubject = createAsyncThunk(
  "subjects/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `https://attendance-management-system-backen.vercel.app/api/v1/teacher/subject/${id}`,
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

// Delete subject
export const deleteSubject = createAsyncThunk(
  "subjects/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `https://attendance-management-system-backen.vercel.app/api/v1/teacher/subject/${id}`
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

const subjectSlicer = createSlice({
  name: "subjects",
  initialState: initialState,
  reducers: {
    clearSubjects: (state) => {
      state.subjects = [];
      state.currentSubject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Subjects by User
      .addCase(getSubjectsByUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSubjectsByUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subjects = action.payload.data || [];
      })
      .addCase(getSubjectsByUser.rejected, (state, action) => {
        state.isLoading = false;
        state.subjects = [];
      })
      
      // Create Subject
      .addCase(createSubject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createSubject.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add new subject to the beginning of the list
        state.subjects.unshift(action.payload.data);
      })
      .addCase(createSubject.rejected, (state, action) => {
        state.isLoading = false;
      })
      
      // Update Subject
      .addCase(updateSubject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateSubject.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the subject in the list
        const updatedSubject = action.payload.data;
        const index = state.subjects.findIndex(subject => subject._id === updatedSubject._id);
        if (index !== -1) {
          state.subjects[index] = updatedSubject;
        }
      })
      .addCase(updateSubject.rejected, (state, action) => {
        state.isLoading = false;
      })
      
      // Delete Subject
      .addCase(deleteSubject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subjects = state.subjects.filter(
          subject => subject._id !== action.payload.deletedId
        );
      })
      .addCase(deleteSubject.rejected, (state, action) => {
        state.isLoading = false;
      });
  },
});

export const { clearSubjects } = subjectSlicer.actions;
export default subjectSlicer.reducer;