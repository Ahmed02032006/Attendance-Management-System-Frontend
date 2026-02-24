import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  subjects: [],
  isLoading: false,
  currentSubject: null,
  registeredStudents: [], // New state for registered students
  studentsLoading: false
};

const BASE_URL = "https://attendance-management-system-backen.vercel.app/api/v1/teacher";

// Get subjects by user ID
export const getSubjectsByUser = createAsyncThunk(
  "subjects/getByUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/subject/user/${userId}`
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

// Create new subject
export const createSubject = createAsyncThunk(
  "subjects/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/subject/`,
        formData
      );

      if (response.status !== 201) {
        return rejectWithValue(response.data);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

// Update subject
export const updateSubject = createAsyncThunk(
  "subjects/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/subject/${id}`,
        formData
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

// Delete subject
export const deleteSubject = createAsyncThunk(
  "subjects/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/subject/${id}`
      );

      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return { ...response.data, deletedId: id };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

// Reset subject attendance
export const resetSubjectAttendance = createAsyncThunk(
  "subjects/resetAttendance",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/subject/reset-attendance/${id}`
      );

      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return { ...response.data, subjectId: id };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

// NEW: Get registered students by subject ID
export const getRegisteredStudents = createAsyncThunk(
  "subjects/getRegisteredStudents",
  async ({ subjectId, teacherId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/subject/${subjectId}/registered-students?teacherId=${teacherId}`
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

// NEW: Add registered students to a subject
export const addRegisteredStudents = createAsyncThunk(
  "subjects/addRegisteredStudents",
  async ({ subjectId, teacherId, students }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/subject/${subjectId}/registered-students`,
        { teacherId, students }
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

// NEW: Update a registered student
export const updateRegisteredStudent = createAsyncThunk(
  "subjects/updateRegisteredStudent",
  async ({ subjectId, studentId, teacherId, registrationNo, studentName }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/subject/${subjectId}/registered-students/${studentId}`,
        { teacherId, registrationNo, studentName }
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

// NEW: Delete a registered student
export const deleteRegisteredStudent = createAsyncThunk(
  "subjects/deleteRegisteredStudent",
  async ({ subjectId, studentId, teacherId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/subject/${subjectId}/registered-students/${studentId}?teacherId=${teacherId}`
      );

      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return { ...response.data, subjectId, studentId };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
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
      state.registeredStudents = [];
    },
    clearRegisteredStudents: (state) => {
      state.registeredStudents = [];
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
      })

      // Reset Subject
      .addCase(resetSubjectAttendance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetSubjectAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(resetSubjectAttendance.rejected, (state) => {
        state.isLoading = false;
      })

      // NEW: Get Registered Students
      .addCase(getRegisteredStudents.pending, (state) => {
        state.studentsLoading = true;
      })
      .addCase(getRegisteredStudents.fulfilled, (state, action) => {
        state.studentsLoading = false;
        state.registeredStudents = action.payload.data || [];
      })
      .addCase(getRegisteredStudents.rejected, (state, action) => {
        state.studentsLoading = false;
        state.registeredStudents = [];
      })

      // NEW: Add Registered Students
      .addCase(addRegisteredStudents.pending, (state) => {
        state.studentsLoading = true;
      })
      .addCase(addRegisteredStudents.fulfilled, (state, action) => {
        state.studentsLoading = false;
        // Update the specific subject's registered students count in the list
        const subjectIndex = state.subjects.findIndex(
          s => s.id === action.payload.data?.subjectId
        );
        if (subjectIndex !== -1) {
          state.subjects[subjectIndex].registeredStudentsCount = 
            action.payload.data?.totalRegisteredStudents || 0;
        }
      })
      .addCase(addRegisteredStudents.rejected, (state, action) => {
        state.studentsLoading = false;
      })

      // NEW: Delete Registered Student
      .addCase(deleteRegisteredStudent.pending, (state) => {
        state.studentsLoading = true;
      })
      .addCase(deleteRegisteredStudent.fulfilled, (state, action) => {
        state.studentsLoading = false;
        // Update the registered students list if we're viewing it
        if (state.registeredStudents?.registeredStudents) {
          state.registeredStudents.registeredStudents = 
            state.registeredStudents.registeredStudents.filter(
              s => s._id !== action.payload.studentId
            );
        }
        // Update the count in subjects list
        const subjectIndex = state.subjects.findIndex(
          s => s.id === action.payload.subjectId
        );
        if (subjectIndex !== -1) {
          state.subjects[subjectIndex].registeredStudentsCount = 
            action.payload.data?.remainingStudents || 0;
        }
      })
      .addCase(deleteRegisteredStudent.rejected, (state, action) => {
        state.studentsLoading = false;
      });
  },
});

export const { clearSubjects, clearRegisteredStudents } = subjectSlicer.actions;
export default subjectSlicer.reducer;