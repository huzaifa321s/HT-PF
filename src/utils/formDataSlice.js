import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  clientName: "",
  clientEmail: "",
  projectTitle: "React-Based E-Commerce Website",
  businessDescription: "",
  proposedSolution: "",
  developmentPlatforms: [],
  projectDuration: "6 weeks",
  chargeAmount: "800",
  advancePercent: "50",
  additionalCosts: "",
  brandName: "",
  proposedBy: "Humantek",
  projectBrief: "",
  businessType: "",
  industoryTitle: "",
  strategicProposal: [],
  brandTagline: "",
  sweeterFashionPresence: "",
  selectedBDM: null,
  recommended_services: [],
  serviceCharges: [],
  timelineMilestones:
    "Week 1: Design\nWeeks 2-3: Frontend\nWeeks 4-5: Backend\nWeek 6: Deploy & QA",
  terms: "Payments due within 7 days. 30 days post-launch support.",
  callOutcome: "Interested",
  yourName: "Your Name",
  yourEmail: "your.email@example.com",
  date: new Date().toLocaleDateString(),
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setFormDataRT: (state, action) => {
      return { ...state, ...action.payload };
    },
    updateFormFieldRT: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    addServiceRT: (state, action) => {
      const { serviceName } = action.payload;
      state.recommended_services.push(serviceName);
      state.serviceCharges.push(0);
    },
    updateServiceLabelRT: (state, action) => {
      const { index, value } = action.payload;
      state.recommended_services[index] = value;
    },
    removeServiceRT: (state, action) => {
      const { index } = action.payload;
      state.recommended_services.splice(index, 1);
      state.serviceCharges.splice(index, 1);
    },
    updateServiceChargeRT: (state, action) => {
      const { index, value } = action.payload;
      state.serviceCharges[index] = value;
    },
    resetFormDataRT: () => initialState,
  },
});

export const {
  setFormDataRT,
  updateFormFieldRT,
  addServiceRT,
  removeServiceRT,
  updateServiceLabelRT,
  updateServiceChargeRT,
  resetFormDataRT,
} = formSlice.actions;
export default formSlice.reducer;