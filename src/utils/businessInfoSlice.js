// src/utils/businessInfoSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {};

const businessInfoSlice = createSlice({
  name: "businessInfo",
  initialState,
  reducers: {
    setBusinessInfo: (state, action) => {
      return action.payload || {}; // full clean replace
    },
    updateBusinessField: (state, action) => {
      const { key, value } = action.payload;
      state[key] = value; // update single field
    },
  },
});

export const { setBusinessInfo, updateBusinessField } = businessInfoSlice.actions;
export default businessInfoSlice.reducer;
