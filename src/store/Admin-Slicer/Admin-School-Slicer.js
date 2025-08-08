import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    schools: null,
    specificSchool: null,
    isLoading: false,
    isSchoolLoading: false,
    isError: false,
    currentSchoolId: null,
};

export const getSchoolsByUserId = createAsyncThunk(
    "admin/getSchoolsByUserId",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/v1/admin/school/user/${id}`
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

export const getSchoolsById = createAsyncThunk(
    "admin/getSchoolsById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/v1/admin/school/${id}`
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

export const createNewSchool = createAsyncThunk("admin/getSchoolsByUserId",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `http://localhost:5000/api/v1/admin/school/create/`, formData
            );

            if (response.status !== 200) {
                return rejectWithValue(response.data);
            }

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    });

const adminSchoolSlicer = createSlice({
    name: "adminSchool",
    initialState: initialState,
    reducers: {
        setCurrentSchoolId: (state, action) => {
            state.currentSchoolId = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getSchoolsByUserId.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = null;
            })
            .addCase(getSchoolsByUserId.fulfilled, (state, action) => {
                state.isLoading = false;
                state.schools = action.payload?.data || [];
            })
            .addCase(getSchoolsByUserId.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message || "An error occurred";
            }).addCase(getSchoolsById.pending, (state) => {
                state.isSchoolLoading = true;
                state.isError = false;
                state.errorMessage = null;
                state.specificSchool = null;
            })
            .addCase(getSchoolsById.fulfilled, (state, action) => {
                state.specificSchool = action.payload?.data || [];
                state.isSchoolLoading = false;
            })
            .addCase(getSchoolsById.rejected, (state, action) => {
                state.isSchoolLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message || "An error occurred";
            });
    },
});

export default adminSchoolSlicer.reducer;
export const { setCurrentSchoolId } = adminSchoolSlicer.actions;
