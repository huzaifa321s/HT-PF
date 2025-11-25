// src/redux/slices/page1Slice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  brandName: "Brand Name",
  brandTagline: "Crafting Legacies That Last",
  projectBrief: "---",
  customElements: [],
};

const page1Slice = createSlice({
  name: "page1Slice",
  initialState,
  reducers: {
    setBrandName: (state, action) => {
        console.log('action.payload',action.payload)
      state.brandName = action.payload;
    },
    setBrandTagline: (state, action) => {
      state.brandTagline = action.payload;
    },
    setProjectBrief: (state, action) => {
      state.projectBrief = action.payload;
    },
    setCustomElements: (state, action) => {
      state.customElements = action.payload;
    },
    addCustomElement: (state, action) => {
      state.customElements.push(action.payload);
    },
    updateCustomElement: (state, action) => {
      const { id, data } = action.payload;
      state.customElements = state.customElements.map((el) =>
        el.id === id ? { ...el, ...data } : el
      );
    },
    deleteCustomElement: (state, action) => {
      state.customElements = state.customElements.filter(
        (el) => el.id !== action.payload
      );
    },
    resetPage1: () => initialState,
  },
});

export const {
  setBrandName,
  setBrandTagline,
  setProjectBrief,
  setCustomElements,
  addCustomElement,
  updateCustomElement,
  deleteCustomElement,
  resetPage1,
} = page1Slice.actions;

export default page1Slice.reducer;
