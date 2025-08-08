import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isAuthenticated: false,
  allUsers: null,
  user: null,
  isLoading: false,
  isInitialAuthCheckComplete: false, // Add this flag
  isError: false,
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/auth/register/",
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

export const dynamicRegisterUser = createAsyncThunk(
  "auth/dynamicRegisterUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/auth/dynamicRegisterUser/",
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
        "http://localhost:5000/api/v1/auth/login/",
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
        "http://localhost:5000/api/v1/auth/logout/",
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
  "http://localhost:5173/auth/check-auth",
  async () => {
    const response = await axios.get("http://localhost:5000/api/v1/auth/check-auth/", {
      withCredentials: true,
      headers: {
        "Cache-Control": "no-cache, must-revalidate, proxy-revalidate",
      },
    });

    return response.data;
  }
);

export const getAllUsers = createAsyncThunk(
  "auth/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/auth/allUsers",
        {
          withCredentials: true,
          headers: {
            "Cache-Control": "no-cache, must-revalidate, proxy-revalidate",
          }
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const authSlicer = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {},
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
      .addCase(dynamicRegisterUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(dynamicRegisterUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(dynamicRegisterUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || "An error occurred";
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action?.payload.success ? action.payload.user : null;
        state.isError = false;
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
      })
      .addCase(checkAuthUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialAuthCheckComplete = true; // Set this flag
        state.isAuthenticated = true;
        state.user = action?.payload.success ? action.payload.user : null;
        state.isError = false;
      })
      .addCase(checkAuthUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialAuthCheckComplete = true; // Set this flag even on failure
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
      })
      .addCase(logOutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
      }).addCase(getAllUsers.pending, (state) => {
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.allUsers = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
      });
  },
});

export default authSlicer.reducer;
