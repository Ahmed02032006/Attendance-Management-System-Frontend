import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    allSchools: null,
    isLoading: false,
    isError: false,
    errorMessage: "",
};

export const getAllSchools = createAsyncThunk(
    "admin/getSchoolsByUserId",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/v1/superAdmin/school/all"
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

export const updateSchoolVerificationStatus = createAsyncThunk(
    "superAdmin/updateSchoolVerificationStatus",
    async ({ schoolId, verificationStatus }, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `http://localhost:5000/api/v1/superAdmin/school/update-verification-status/${schoolId}`,
                { verificationStatus }
            );

            if (response.status !== 200) {
                return rejectWithValue(response.data);
            }

            return { 
                schoolId, 
                verificationStatus, 
                updatedSchool: response.data.data 
            };
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Network Error" });
        }
    }
);

const superAdminSchoolSlicer = createSlice({
    name: "superAdminSchool",
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllSchools.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = null;
            }).addCase(getAllSchools.fulfilled, (state, action) => {
                state.isLoading = false;
                state.allSchools = action.payload?.data || [];
            }).addCase(getAllSchools.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message || "An error occurred";
            }).addCase(updateSchoolVerificationStatus.pending, (state) => {
                state.isError = false;
                state.errorMessage = "";
            }).addCase(updateSchoolVerificationStatus.fulfilled, (state, action) => {
                if (state.allSchools) {
                    state.allSchools = state.allSchools.map(school =>
                        school._id === action.payload.schoolId
                            ? { ...school, verificationStatus: action.payload.verificationStatus }
                            : school
                    );
                }
            }).addCase(updateSchoolVerificationStatus.rejected, (state, action) => {
                state.isError = true;
                state.errorMessage = action.payload?.message || "Failed to update verification status";
            });
    },
});

export default superAdminSchoolSlicer.reducer;