import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { loginApi, registerApi, logoutApi } from "../api/authApi";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthLogin: boolean;
  isAuthRegister: boolean;
  isAuthLogout: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthLogin: false,
  isAuthRegister: false,
  isAuthLogout: false,
  error: null,
};

export const asyncLogin = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const result = await loginApi(payload);
      if (result.status !== "success" || !result.data) {
        return rejectWithValue(result.message || "Login gagal");
      }
      return result.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login gagal";
      return rejectWithValue(message);
    }
  }
);

export const asyncRegister = createAsyncThunk(
  "auth/register",
  async (
    payload: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await registerApi(payload);
      if (result.status !== "success") {
        return rejectWithValue(result.message || "Registrasi gagal");
      }
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registrasi gagal";
      return rejectWithValue(message);
    }
  }
);

export const asyncLogout = createAsyncThunk("auth/logout", async () => {
  await logoutApi();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(asyncLogin.pending, (state) => {
        state.isLoading = true;
        state.isAuthLogin = true;
        state.error = null;
      })
      .addCase(asyncLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthLogin = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(asyncLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthLogin = false;
        state.error = (action.payload as string) || "Login gagal";
      });

    builder
      .addCase(asyncRegister.pending, (state) => {
        state.isLoading = true;
        state.isAuthRegister = true;
        state.error = null;
      })
      .addCase(asyncRegister.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthRegister = false;
      })
      .addCase(asyncRegister.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthRegister = false;
        state.error = (action.payload as string) || "Registrasi gagal";
      });

    builder
      .addCase(asyncLogout.pending, (state) => {
        state.isAuthLogout = true;
      })
      .addCase(asyncLogout.fulfilled, (state) => {
        state.isAuthLogout = false;
        state.user = null;
        state.token = null;
      })
      .addCase(asyncLogout.rejected, (state) => {
        state.isAuthLogout = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearAuthError, setUser } = authSlice.actions;
export default authSlice.reducer;