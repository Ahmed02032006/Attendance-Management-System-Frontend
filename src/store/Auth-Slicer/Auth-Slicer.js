import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  isInitialAuthCheckComplete: false,
  isError: false,
  errorMessage: null, // Added missing property
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "https://attendance-management-system-backen.vercel.app/api/v1/auth/register/",
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

export const loginUser = createAsyncThunk(
  "auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "https://attendance-management-system-backen.vercel.app/api/v1/auth/login/",
        formData,
        { withCredentials: true }
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

export const logOutUser = createAsyncThunk(
  "auth/logOut",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "https://attendance-management-system-backen.vercel.app/api/v1/auth/logout/",
        {},
        { withCredentials: true }
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

export const checkAuthUser = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try { // Added try-catch block
      const response = await axios.get(
        "https://attendance-management-system-backen.vercel.app/api/v1/auth/check-auth/", 
        {
          withCredentials: true,
          headers: {
            "Cache-Control": "no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );

      if (response.status !== 200) {
        return rejectWithValue(response.data);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Network error" });
    }
  }
);

const authSlicer = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    // Optional: Add a clearError reducer if needed
    clearError: (state) => {
      state.isError = false;
      state.errorMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || "An error occurred";
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action?.payload.success ? action.payload.user : null;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.isError = true;
        state.errorMessage = action.payload?.message || "An error occurred";
      })
      .addCase(checkAuthUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(checkAuthUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialAuthCheckComplete = true;
        state.isAuthenticated = true;
        console.log(action?.payload);
        state.user = action?.payload.success ? action.payload.user : null;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(checkAuthUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialAuthCheckComplete = true;
        state.isAuthenticated = false;
        state.user = null;
        state.isError = true;
        state.errorMessage = action.payload?.message || "An error occurred";
      })
      .addCase(logOutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logOutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(logOutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || "An error occurred";
      });
  },
});

export const { clearError } = authSlicer.actions;
export default authSlicer.reducer; 