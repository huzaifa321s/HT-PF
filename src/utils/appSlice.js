// src/utils/appSlice.js
import { createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
  name: 'app',
  initialState: {
    pauseRecording: null, // Store pauseRecording function
    pdfURL: ''
  },
  reducers: {
    setPauseRecording: (state, action) => {
      state.pauseRecording = action.payload;
    },
    setURL: (state, action) =>{
      state.pdfURL = action.payload.url
}
  },
});

export const { setPauseRecording ,setURL} = appSlice.actions;
export default appSlice.reducer;