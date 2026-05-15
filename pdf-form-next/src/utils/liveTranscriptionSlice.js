// src/redux/slices/liveTranscriptionSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  historyRT: [],   
  lastEntry: null, 
  isLive: false,   
};

const liveTranscriptionSlice = createSlice({
  name: "liveTranscription",
  initialState,
  reducers: {
    setLiveStatus: (state, action) => {
      state.isLive = action.payload;
    },

    addTranscriptEntry: (state, action) => {
      const entry = action.payload;
  if (!Array.isArray(state.historyRT)) state.historyRT = [];

      // maintain immutability
      state.historyRT = [...state.historyRT, entry];
      state.lastEntry = entry;
    },

    setFullHistory: (state, action) => {
      // optional helper: replace entire history
      state.historyRT = action.payload;
      state.lastEntry =
        action.payload.length > 0
          ? action.payload[action.payload.length - 1]
          : null;
    },

    clearTranscriptionLT: (state) => {
      state.historyRT = [];
      state.lastEntry = null;
      state.isLive = false;
    },
  },
});

export const {
  setLiveStatus,
  addTranscriptEntry,
  setFullHistory,
  clearTranscriptionLT,
} = liveTranscriptionSlice.actions;

export default liveTranscriptionSlice.reducer;
