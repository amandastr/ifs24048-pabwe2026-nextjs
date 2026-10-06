import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/states/authSlice";
import postsReducer from "@/features/posts/states/postsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;