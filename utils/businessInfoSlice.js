// src/utils/businessInfoSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: {},
  hasNewInsights: false,
};

const businessInfoSlice = createSlice({
  name: "businessInfo",
  initialState,
  reducers: {
    setBusinessInfo: (state, action) => {
      state.data = action.payload || {};
      state.hasNewInsights = true;
    },
    updateBusinessField: (state, action) => {
      const { key, value } = action.payload;
      if (!state.data) state.data = {};
      state.data[key] = value;
    },
    setHasNewInsights: (state, action) => {
      state.hasNewInsights = action.payload;
    },
  },
});

export const { setBusinessInfo, updateBusinessField, setHasNewInsights } = businessInfoSlice.actions;
export default businessInfoSlice.reducer;
