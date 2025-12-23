// src/utils/paymentTermsSlice.js
import { createSlice } from '@reduxjs/toolkit';



const modeDefaults = {
  title: "Payment Terms",
  terms: [
    "Payments will be made upfront to get the services started.",
    "Project Termination: If the client fails to respond within 15 days, Humantek reserves the right to terminate the project.",
    "Delivery: The project will only be delivered after full payment is cleared.",
    "Revisions: Up to three revisions per design phase are allowed. Additional revisions will incur charges.",
    "Payment Delays: Services will be paused if payments are delayed.",
    "Communication: Operating hours: 9 AM to 5 PM Pakistan Time. Urgent matters will be addressed within 48 hours.",
    "Change of Mind: Not accepted as a valid reason for cancellation or refund.",
    "Legal Jurisdiction: This Agreement is governed by the laws of Pakistan.",
    "Out-of-Scope Work: Any requests or deliverables outside the agreed package will incur additional charges and require approval from senior management.",
  ],
  currentPages: 1,
  includeInPdf: true,
}

const initialState = {
  currentMode: "create", // ✅ Track current mode
  create: { ...modeDefaults },
  edit: { ...modeDefaults },
};

const paymentTermsSlice = createSlice({
  name: 'paymentTerms',
  initialState,
  reducers: {
    setMode4: (state, action) => {
      state.currentMode = action.payload; // "create" or "edit"
    },
    updateTitle: (state, action) => {
      const mode = state.currentMode;
      state[mode].title = action.payload;
    },
    addTerm: (state, action) => {
      const mode = state.currentMode;
      state[mode].terms.push(action.payload);
    },
    addMultipleTerms: (state, action) => {
      const mode = state.currentMode;
      const termsToAdd = Array.isArray(action.payload) ? action.payload : [action.payload];
      state[mode].terms.push(...termsToAdd);
    },
    updateTerm: (state, action) => {
      const mode = state.currentMode;
      const { index, value } = action.payload;
      state[mode].terms[index] = value;
    },
    setCurrentPagesPT: (state, action) => {
      const mode = state.currentMode;
      state[mode].currentPages = action.payload.currentPages
    },
    deleteTerm: (state, action) => {
      const mode = state.currentMode;
      state[mode].terms = state[mode].terms.filter((_, i) => i !== action.payload);
    },
    togglePaymentPageInclusion: (state) => {
      const mode = state.currentMode;
      state[mode].includeInPdf = !state[mode].includeInPdf;
    },
    setDBTerms: (state, action) => {
      state.edit = { ...action.payload };
    },
    resetTerms: (state) => {
      const mode = state.currentMode;
      state[mode] = modeDefaults
    },

  },
});

export const { setMode4, updateTitle, setCurrentPagesPT, togglePaymentPageInclusion, addTerm, addMultipleTerms, updateTerm, deleteTerm, resetTerms, setDBTerms } = paymentTermsSlice.actions;
export default paymentTermsSlice.reducer;