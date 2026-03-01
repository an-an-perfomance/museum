import { configureStore } from "@reduxjs/toolkit";
import photosReducer from "./photosSlice";
import videosReducer from "./videosSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    photos: photosReducer,
    videos: videosReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
