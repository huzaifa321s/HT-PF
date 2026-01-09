// src/redux/slices/page1Slice.js
import { createSlice } from "@reduxjs/toolkit";

const modeDefaults = {
  brandName: "Brand Name",
  brandTagline: "Crafting Legacies That Last",
  projectBrief: "---",
  customElements: [],
  includeInPdf: true,
  clientLogo: null,
};

const initialState = {
  currentMode: "create", // ✅ Track current mode
  create: { ...modeDefaults },
  edit: { ...modeDefaults },
};

const page1Slice = createSlice({
  name: "page1Slice",
  initialState,
  reducers: {
    // ✅ Set mode (create ya edit)
    setMode1: (state, action) => {
      state.currentMode = action.payload; // "create" or "edit"
    },

    // ✅ All actions ab current mode ke data pe work karenge
    setBrandName: (state, action) => {
      const mode = state.currentMode;
      state[mode].brandName = action.payload;
    },

    setBrandTagline: (state, action) => {
      const mode = state.currentMode;
      state[mode].brandTagline = action.payload;
    },

    setProjectBrief: (state, action) => {
      const mode = state.currentMode;
      state[mode].projectBrief = action.payload;
    },

    setClientLogo: (state, action) => {
      const mode = state.currentMode;
      state[mode].clientLogo = action.payload;
    },

    setCustomElements: (state, action) => {
      const mode = state.currentMode;
      state[mode].customElements = action.payload;
    },

    addCustomElement: (state, action) => {
      const mode = state.currentMode;
      state[mode].customElements.push(action.payload);
    },

    updateCustomElement: (state, action) => {
      const mode = state.currentMode;
      const { id, data } = action.payload;
      state[mode].customElements = state[mode].customElements.map((el) =>
        el.id === id ? { ...el, ...data } : el
      );
    },

    deleteCustomElement: (state, action) => {
      const mode = state.currentMode;
      state[mode].customElements = state[mode].customElements.filter(
        (el) => el.id !== action.payload
      );
    },

    // ✅ Set DB data for edit mode
    setDBData: (state, action) => {
      state.edit = { ...action.payload };
    },

    // ✅ Reset specific mode
    resetPage1: (state, action) => {
      const mode = action.payload || state.currentMode;
      state[mode] = { ...modeDefaults };
    },
  },
});

export const {
  setMode1,
  setBrandName,
  setBrandTagline,
  setProjectBrief,
  setCustomElements,
  addCustomElement,
  updateCustomElement,
  deleteCustomElement,
  setDBData,
  setClientLogo,
  resetPage1,
} = page1Slice.actions;

export default page1Slice.reducer;