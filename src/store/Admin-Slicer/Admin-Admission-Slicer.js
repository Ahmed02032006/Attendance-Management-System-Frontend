import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  isError: false,
  errorMessage: null,
  successMessage: null,
  admission: null,
};

// Create Admission
export const createAdmission = createAsyncThunk(
  "admission/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/v1/admin/admission/create`, formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Server Error" });
    }
  }
);

// Get Students by School ID
export const getAdmissionBySchoolId = createAsyncThunk(
  "admission/getBySchoolId",
  async (schoolId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/admin/admission/get/school/${schoolId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Server Error" });
    }
  }
);

// Update Admission Status
export const updateAdmissionStatus = createAsyncThunk(
  "admission/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/v1/admin/admission/update-status/${id}`,
        { status }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Server Error" });
    }
  }
);

const admissionSlice = createSlice({
  name: "admission",
  initialState,
  reducers: {
    clearAdmissionMessages: (state) => {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAdmissionBySchoolId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAdmissionBySchoolId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.admission = action.payload.data;
      })
      .addCase(getAdmissionBySchoolId.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message;
      }).addCase(createAdmission.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createAdmission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(createAdmission.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message;
      }).addCase(updateAdmissionStatus.pending, (state) => {
        state.isLoading = true;
        state.successMessage = null;
        state.errorMessage = null;
      })
      .addCase(updateAdmissionStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;

        // Update the admission item in local state (including updated documents)
        if (state.admission) {
          state.admission = state.admission.map((app) =>
            app._id === action.payload.data._id ? action.payload.data : app
          );
        }
      })
      .addCase(updateAdmissionStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message;
      });;
  },
});

export const { clearAdmissionMessages } = admissionSlice.actions;
export default admissionSlice.reducer;
