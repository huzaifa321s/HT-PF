// src/utils/transcriptSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  polishedTranscript: "",
};

const transcriptSlice = createSlice({
  name: "transcript",
  initialState,
  reducers: {
    setPolishedTranscript: (state, action) => {
      state.polishedTranscript = action.payload;
    },
    clearTranscript: (state) => {
      state.polishedTranscript = "";
    },
  },
});

export const { setPolishedTranscript, clearTranscript } = transcriptSlice.actions;
export default transcriptSlice.reducer;
