import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    isLoading: false,
    isError: false,
    errorMessage: null,
    successMessage: null,
    users: [],
    currentUser: null,
};

// Create Other User
export const createOtherUser = createAsyncThunk(
    "otherUser/create",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                `http://localhost:5000/api/v1/admin/otherUser/create`,
                formData
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Server Error" });
        }
    }
);

// Get All Other Users by School ID
export const getOtherUsersBySchoolId = createAsyncThunk(
    "otherUser/getBySchoolId",
    async (schoolId, { rejectWithValue }) => {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/v1/admin/otherUser/get/school/${schoolId}`
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Server Error" });
        }
    }
);

// Get Single Other User by ID
export const getOtherUserById = createAsyncThunk(
    "otherUser/getById",
    async (userId, { rejectWithValue }) => {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/v1/admin/otherUser/${userId}`
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Server Error" });
        }
    }
);

// Update Other User
export const updateOtherUser = createAsyncThunk(
    "otherUser/update",
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const res = await axios.put(
                `http://localhost:5000/api/v1/admin/otherUser/update/${id}`,
                formData
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Server Error" });
        }
    }
);

// Delete Other User
export const deleteOtherUser = createAsyncThunk(
    "otherUser/delete",
    async (userId, { rejectWithValue }) => {
        try {
            const res = await axios.delete(
                `http://localhost:5000/api/v1/admin/otherUser/delete/${userId}`
            );
            return { ...res.data, deletedUserId: userId };
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Server Error" });
        }
    }
);

// Update Other User Status
export const updateOtherUserStatus = createAsyncThunk(
    "otherUser/updateStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const res = await axios.put(
                `http://localhost:5000/api/v1/admin/otherUser/update-status/${id}`,
                { status }
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Server Error" });
        }
    }
);

const otherUserSlice = createSlice({
    name: "otherUser",
    initialState,
    reducers: {
        clearOtherUserMessages: (state) => {
            state.errorMessage = null;
            state.successMessage = null;
        },
        setCurrentUser: (state, action) => {
            state.currentUser = action.payload;
        },
        clearCurrentUser: (state) => {
            state.currentUser = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Other User
            .addCase(createOtherUser.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = null;
            })
            .addCase(createOtherUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.successMessage = action.payload.message;
                state.users.unshift(action.payload.data); // Add new user to the beginning
            })
            .addCase(createOtherUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message;
            })

            // Get All Other Users by School ID
            .addCase(getOtherUsersBySchoolId.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(getOtherUsersBySchoolId.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload.data;
            })
            .addCase(getOtherUsersBySchoolId.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message;
            })

            // Get Single Other User by ID
            .addCase(getOtherUserById.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(getOtherUserById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentUser = action.payload.data;
            })
            .addCase(getOtherUserById.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message;
            })

            // Update Other User
            .addCase(updateOtherUser.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = null;
                state.successMessage = null;
            })
            .addCase(updateOtherUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.successMessage = action.payload.message;
                // Update the user in the users array
                state.users = state.users.map((user) =>
                    user._id === action.payload.data._id ? action.payload.data : user
                );
                // Also update currentUser if it's the one being edited
                if (state.currentUser && state.currentUser._id === action.payload.data._id) {
                    state.currentUser = action.payload.data;
                }
            })
            .addCase(updateOtherUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message;
            })

            // Delete Other User
            .addCase(deleteOtherUser.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = null;
                state.successMessage = null;
            })
            .addCase(deleteOtherUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.successMessage = action.payload.message;
                // Remove deleted user from the users array
                state.users = state.users.filter(
                    (user) => user._id !== action.payload.deletedUserId
                );
                // Clear currentUser if it's the one being deleted
                if (state.currentUser && state.currentUser._id === action.payload.deletedUserId) {
                    state.currentUser = null;
                }
            })
            .addCase(deleteOtherUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message;
            })

            // Update Other User Status
            .addCase(updateOtherUserStatus.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = null;
                state.successMessage = null;
            })
            .addCase(updateOtherUserStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.successMessage = action.payload.message;
                // Update the user's status in the users array
                state.users = state.users.map((user) =>
                    user._id === action.payload.data._id ? action.payload.data : user
                );
                // Also update currentUser if it's the one being updated
                if (state.currentUser && state.currentUser._id === action.payload.data._id) {
                    state.currentUser = action.payload.data;
                }
            })
            .addCase(updateOtherUserStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message;
            });
    },
});

export const { clearOtherUserMessages, setCurrentUser, clearCurrentUser } =
    otherUserSlice.actions;
export default otherUserSlice.reducer;