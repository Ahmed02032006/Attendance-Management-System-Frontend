import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Initial State
const initialState = {
    subjects: null,
    isLoading: false,
    isError: false,
    errorMessage: null,
    successMessage: null,
};

// Create Subject
export const createSubject = createAsyncThunk(
    "subject/createSubject",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                "http://localhost:5000/api/v1/admin/subject/create",
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

// Get Subjects by School ID
export const getSubjectsBySchoolId = createAsyncThunk(
    "subject/getSubjectsBySchoolId",
    async (schoolId, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/v1/admin/subject/get/${schoolId}`
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

// Delete Subject by ID
export const deleteSubject = createAsyncThunk(
    "subject/deleteSubject",
    async (subjectId, { rejectWithValue }) => {
        try {
            const response = await axios.delete(
                `http://localhost:5000/api/v1/admin/subject/delete/${subjectId}`
            );
            if (response.status !== 200) {
                return rejectWithValue(response.data);
            }
            return { ...response.data, id: subjectId };
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Server Error" });
        }
    }
);

// Update Subject
export const updateSubject = createAsyncThunk(
    "subject/updateSubject",
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `http://localhost:5000/api/v1/admin/subject/update/${id}`,
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

const subjectSlice = createSlice({
    name: "subject",
    initialState,
    reducers: {
        clearSubjectMessages: (state) => {
            state.errorMessage = null;
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create
            .addCase(createSubject.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = null;
            })
            .addCase(createSubject.fulfilled, (state, action) => {
                state.isLoading = false;
                state.successMessage = action.payload.message;
                state.subjects = [action.payload.data, ...(state.subjects || [])];
            })
            .addCase(createSubject.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message || "Failed to create subject";
            })

            // Get by School ID
            .addCase(getSubjectsBySchoolId.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = null;
            })
            .addCase(getSubjectsBySchoolId.fulfilled, (state, action) => {
                state.isLoading = false;
                state.subjects = action.payload?.data || [];
            })
            .addCase(getSubjectsBySchoolId.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message || "Failed to fetch subjects";
            })

            // Delete
            .addCase(deleteSubject.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = null;
            })
            .addCase(deleteSubject.fulfilled, (state, action) => {
                state.isLoading = false;
                state.successMessage = action.payload.message;
                state.subjects = state.subjects?.filter((subj) => subj._id !== action.payload.id);
            })
            .addCase(deleteSubject.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message || "Failed to delete subject";
            })

            // Update
            .addCase(updateSubject.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = null;
            })
            .addCase(updateSubject.fulfilled, (state, action) => {
                state.isLoading = false;
                state.successMessage = action.payload.message;
                state.subjects = state.subjects?.map((subj) =>
                    subj._id === action.payload.data._id ? action.payload.data : subj
                );
            })
            .addCase(updateSubject.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message || "Failed to update subject";
            });
    },
});

export const { clearSubjectMessages } = subjectSlice.actions;
export default subjectSlice.reducer;
