import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PhotoType } from "../types";
import { fetchPhotos as fetchPhotosApi } from "../api";

export const fetchPhotos = createAsyncThunk<PhotoType[]>(
  "photos/fetchPhotos",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchPhotosApi();
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Ошибка загрузки");
    }
  }
);

type PhotosState = {
  items: PhotoType[];
  loading: boolean;
  error: string | null;
};

const initialState: PhotosState = {
  items: [],
  loading: false,
  error: null,
};

export const photosSlice = createSlice({
  name: "photos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPhotos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPhotos.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items = action.payload;
      })
      .addCase(fetchPhotos.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string | null) ?? "Ошибка загрузки";
      });
  },
});

export default photosSlice.reducer;
