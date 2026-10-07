import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types";

interface UsersState {
  users: User[];
  user: User | null;
  profile: User | null;
  isProfile: boolean;
  isChangeProfile: boolean;
  isChangeProfilePhoto: boolean;
  isChangeProfilePassword: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  user: null,
  profile: null,
  isProfile: false,
  isChangeProfile: false,
  isChangeProfilePhoto: false,
  isChangeProfilePassword: false,
  isLoading: false,
  error: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsersError(state) {
      state.error = null;
    },
    setProfile(state, action: PayloadAction<User | null>) {
      state.profile = action.payload;
    },
  },
  extraReducers: () => {},
});

export const { clearUsersError, setProfile } = usersSlice.actions;
export default usersSlice.reducer;