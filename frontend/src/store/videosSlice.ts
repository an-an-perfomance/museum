import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { VideoType } from "../types";
import { fetchVideos as fetchVideosApi } from "../api";

export type FetchVideosParams = { offset?: number; limit?: number };

export const fetchVideos = createAsyncThunk<
  { videos: VideoType[]; total: number },
  FetchVideosParams | void
>(
  "videos/fetchVideos",
  async (params, { rejectWithValue }) => {
    try {
      const offset = params?.offset ?? 0;
      const limit = params?.limit ?? 50;
      return await fetchVideosApi(offset, limit);
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Ошибка загрузки");
    }
  }
);

export type VideosState = {
  items: VideoType[];
  total: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
};

const initialState: VideosState = {
  items: [],
  total: 0,
  loading: false,
  loadingMore: false,
  error: null,
};

export const videosSlice = createSlice({
  name: "videos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideos.pending, (state, action) => {
        const offset = action.meta.arg?.offset ?? 0;
        if (offset === 0) {
          state.loading = true;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = null;
        const { videos, total } = action.payload;
        state.total = total;
        if (action.meta.arg?.offset) {
          state.items = [...state.items, ...videos];
        } else {
          state.items = videos;
        }
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = (action.payload as string | null) ?? "Ошибка загрузки";
      });
  },
});

export default videosSlice.reducer;
