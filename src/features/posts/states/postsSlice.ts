import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getPostsApi,
  getPostDetailApi,
  addPostApi,
  likePostApi,
  addCommentApi,
} from "../api/postApi";
import type { Post } from "@/types";

interface PostsState {
  posts: Post[];
  post: Post | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  post: null,
  isLoading: false,
  error: null,
};

export const asyncGetPosts = createAsyncThunk(
  "posts/getPosts",
  async (isMe: boolean = false, { rejectWithValue }) => {
    try {
      const result = await getPostsApi(isMe);
      if (result.status !== "success") {
        return rejectWithValue(result.message || "Gagal mengambil postingan");
      }
      return result.data?.posts || [];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal mengambil postingan";
      return rejectWithValue(message);
    }
  }
);

export const asyncGetPostDetail = createAsyncThunk(
  "posts/getPostDetail",
  async (id: number | string, { rejectWithValue }) => {
    try {
      const result = await getPostDetailApi(id);
      if (result.status !== "success" || !result.data?.post) {
        return rejectWithValue(result.message || "Gagal mengambil detail");
      }
      return result.data.post;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal mengambil detail";
      return rejectWithValue(message);
    }
  }
);

export const asyncAddPost = createAsyncThunk(
  "posts/addPost",
  async (description: string, { rejectWithValue }) => {
    try {
      const result = await addPostApi(description);
      if (result.status !== "success") {
        return rejectWithValue(result.message || "Gagal menambah postingan");
      }
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menambah postingan";
      return rejectWithValue(message);
    }
  }
);

export const asyncLikePost = createAsyncThunk(
  "posts/likePost",
  async ({ id, like }: { id: number | string; like: 0 | 1 }, { rejectWithValue }) => {
    try {
      const result = await likePostApi(id, like);
      if (result.status !== "success") {
        return rejectWithValue(result.message || "Gagal like");
      }
      return { id, like };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal like";
      return rejectWithValue(message);
    }
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearPostsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(asyncGetPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(asyncGetPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
      })
      .addCase(asyncGetPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Gagal mengambil data";
      });

    builder
      .addCase(asyncGetPostDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(asyncGetPostDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.post = action.payload;
      })
      .addCase(asyncGetPostDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Gagal mengambil detail";
      });
  },
});

export const { clearPostsError } = postsSlice.actions;
export default postsSlice.reducer;