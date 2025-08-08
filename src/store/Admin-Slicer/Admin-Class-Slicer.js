import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Initial State
const initialState = {
    classes: null,
    currentClass: null,
    isLoading: false,
    isError: false,
    errorMessage: null,
    successMessage: null,
};

// Create Class
export const createClass = createAsyncThunk(
    "class/createClass",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                "http://localhost:5000/api/v1/admin/class/create",
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

// Get Classes by School ID
export const getClassesBySchoolId = createAsyncThunk(
    "class/getClassesBySchoolId",
    async (schoolId, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/v1/admin/class/get/school/${schoolId}`
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

// Get Single Class by ID
export const getClassById = createAsyncThunk(
    "class/getClassById",
    async (classId, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/v1/admin/class/get/${classId}`
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

// Update Class
export const updateClass = createAsyncThunk(
    "class/updateClass",
    async ({ classId, formData }, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `http://localhost:5000/api/v1/admin/class/update/${classId}`,
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

// Delete Class
export const deleteClass = createAsyncThunk(
    "class/deleteClass",
    async (classId, { rejectWithValue }) => {
        try {
            const response = await axios.delete(
                `http://localhost:5000/api/v1/admin/class/delete/${classId}`
            );
            if (response.status !== 200) {
                return rejectWithValue(response.data);
            }
            return { classId, ...response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Server Error" });
        }
    }
);

// Add Teacher to Class
export const addTeacherToClass = createAsyncThunk(
    "class/addTeacherToClass",
    async ({ classId, teacherData }, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `http://localhost:5000/api/v1/admin/class/addTeacher/${classId}`,
                {
                    teacherId: teacherData.teacherId,
                    subject: teacherData.subject
                }
            );
            if (response.status !== 200 && response.status !== 201) {
                return rejectWithValue(response.data);
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Server Error" });
        }
    }
);

// Remove Teacher from Class
export const removeTeacherFromClass = createAsyncThunk(
    "class/removeTeacherFromClass",
    async ({ classId, teacherEmail }, { rejectWithValue }) => {
        try {
            const response = await axios.delete(
                `http://localhost:5000/api/v1/admin/class/removeTeacher/${classId}/${teacherEmail}`
            );
            if (response.status !== 200) {
                return rejectWithValue(response.data);
            }
            return { classId, teacherId, ...response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Server Error" });
        }
    }
);


const classSlice = createSlice({
    name: "class",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Create Class
            .addCase(createClass.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = null;
                state.successMessage = null;
            })
            .addCase(createClass.fulfilled, (state, action) => {
                state.isLoading = false;
                state.successMessage = action.payload?.message || "Class created successfully";
                if (action.payload?.data) {
                    state.classes = state.classes
                        ? [...state.classes, action.payload.data]
                        : [action.payload.data];
                }
            })
            .addCase(createClass.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message || "Failed to create class";
            })

            // Get Classes by School ID
            .addCase(getClassesBySchoolId.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = null;
            })
            .addCase(getClassesBySchoolId.fulfilled, (state, action) => {
                state.isLoading = false;
                state.classes = action.payload?.data || null;
            })
            .addCase(getClassesBySchoolId.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message || "Failed to fetch classes";
            })

            // Get Single Class
            .addCase(getClassById.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = null;
            })
            .addCase(getClassById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentClass = action.payload?.data || null;
            })
            .addCase(getClassById.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message || "Failed to fetch class details";
            })

            // Update Class
            .addCase(updateClass.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = null;
                state.successMessage = null;
            })
            .addCase(updateClass.fulfilled, (state, action) => {
                state.isLoading = false;
                state.successMessage = action.payload?.message || "Class updated successfully";
                if (action.payload?.data && state.classes) {
                    state.classes = state.classes.map(cls =>
                        cls._id === action.payload.data._id ? action.payload.data : cls
                    );
                }
                if (action.payload?.data && state.currentClass?._id === action.payload.data._id) {
                    state.currentClass = action.payload.data;
                }
            })
            .addCase(updateClass.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message || "Failed to update class";
            })

            // Delete Class
            .addCase(deleteClass.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = null;
                state.successMessage = null;
            })
            .addCase(deleteClass.fulfilled, (state, action) => {
                state.isLoading = false;
                state.successMessage = action.payload?.message || "Class deleted successfully";
                if (state.classes) {
                    state.classes = state.classes.filter(
                        cls => cls._id !== action.payload.classId
                    );
                }
                if (state.currentClass?._id === action.payload.classId) {
                    state.currentClass = null;
                }
            })
            .addCase(deleteClass.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message || "Failed to delete class";
            })
            // Add Teacher to Class
            .addCase(addTeacherToClass.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = null;
                state.successMessage = null;
            })
            .addCase(addTeacherToClass.fulfilled, (state, action) => {
                state.isLoading = false;
                state.successMessage = action.payload?.message || "Teacher added to class successfully";
                if (action.payload?.data && state.classes) {
                    state.classes = state.classes.map(cls =>
                        cls._id === action.payload.data._id ? action.payload.data : cls
                    );
                }
                if (action.payload?.data && state.currentClass?._id === action.payload.data._id) {
                    state.currentClass = action.payload.data;
                }
            })
            .addCase(addTeacherToClass.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message || "Failed to add teacher to class";
            })

            // Remove Teacher from Class
            .addCase(removeTeacherFromClass.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = null;
                state.successMessage = null;
            })
            .addCase(removeTeacherFromClass.fulfilled, (state, action) => {
                state.isLoading = false;
                state.successMessage = action.payload?.message || "Teacher removed from class successfully";
                if (action.payload?.updatedClass && state.classes) {
                    state.classes = state.classes.map(cls =>
                        cls._id === action.payload.updatedClass._id ? action.payload.updatedClass : cls
                    );
                }
                if (action.payload?.updatedClass && state.currentClass?._id === action.payload.updatedClass._id) {
                    state.currentClass = action.payload.updatedClass;
                }
            })
            .addCase(removeTeacherFromClass.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message || "Failed to remove teacher from class";
            });
    },
});

export default classSlice.reducer;