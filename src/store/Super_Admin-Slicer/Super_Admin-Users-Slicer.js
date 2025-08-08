import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    allUsers: null,
    isLoading: false,
    isError: false,
    errorMessage: "",
};

export const getAllUsers = createAsyncThunk(
    "admin/getAllUser",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/v1/superAdmin/user/all"
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

const superAdminUserSlicer = createSlice({
    name: "superAdminUsers",
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllUsers.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = null;
            }).addCase(getAllUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.allUsers = action.payload?.data || [];
            }).addCase(getAllUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message || "An error occurred";
            });
    },
});

export default superAdminUserSlicer.reducer;