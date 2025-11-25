// src/utils/appSlice.js
import { createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
  name: 'app',
  initialState: {
    pauseRecording: null, // Store pauseRecording function
  },
  reducers: {
    setPauseRecording: (state, action) => {
      state.pauseRecording = action.payload;
    },
  },
});

export const { setPauseRecording } = appSlice.actions;
export default appSlice.reducer;