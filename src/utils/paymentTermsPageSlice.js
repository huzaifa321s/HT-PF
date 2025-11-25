// src/utils/paymentTermsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
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
  currentPages:1
};

const paymentTermsSlice = createSlice({
  name: 'paymentTerms',
  initialState,
  reducers: {
    updateTitle: (state, action) => {
      state.title = action.payload;
    },
    addTerm: (state, action) => {
      state.terms.push(action.payload);
    },
    updateTerm: (state, action) => {
      const { index, value } = action.payload;
      state.terms[index] = value;
    },
    setCurrentPagesPT:(state,action) =>{
     state.currentPages = action.payload.currentPages
    },
    deleteTerm: (state, action) => {
      state.terms = state.terms.filter((_, i) => i !== action.payload);
    },
    resetTerms: () => initialState,
  
  },
});

export const { updateTitle,setCurrentPagesPT, addTerm, updateTerm, deleteTerm, resetTerms } = paymentTermsSlice.actions;
export default paymentTermsSlice.reducer;