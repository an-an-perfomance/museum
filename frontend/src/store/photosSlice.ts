import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PhotoType } from "../types";
import { fetchPhotos as fetchPhotosApi } from "../api";

export type FetchPhotosParams = { offset?: number; limit?: number };

export const fetchPhotos = createAsyncThunk<
  { photos: PhotoType[]; total: number },
  FetchPhotosParams | void
>(
  "photos/fetchPhotos",
  async (params, { rejectWithValue }) => {
    try {
      const offset = params?.offset ?? 0;
      const limit = params?.limit ?? 50;
      return await fetchPhotosApi(offset, limit);
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Ошибка загрузки");
    }
  }
);

type PhotosState = {
  items: PhotoType[];
  total: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
};

const initialState: PhotosState = {
  items: [],
  total: 0,
  loading: false,
  loadingMore: false,
  error: null,
};

export const photosSlice = createSlice({
  name: "photos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPhotos.pending, (state, action) => {
        const offset = action.meta.arg?.offset ?? 0;
        if (offset === 0) {
          state.loading = true;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchPhotos.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = null;
        const { photos, total } = action.payload;
        state.total = total;
        if (action.meta.arg?.offset) {
          state.items = [...state.items, ...photos];
        } else {
          state.items = photos;
        }
      })
      .addCase(fetchPhotos.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = (action.payload as string | null) ?? "Ошибка загрузки";
      });
  },
});

export default photosSlice.reducer;
