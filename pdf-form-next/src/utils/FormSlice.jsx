// src/features/proposal/proposalFormSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Step 1: Your & Client Information
  yourName: '',
  yourEmail: '',
  clientName: '',
  clientEmail: '',

  // Step 2: Project Details
  brandName: '',
  projectTitle: '',
  businessDescription: '',
  proposedSolution: '',
  developmentPlatforms: [], // array of selected platforms like ["SEO Optimization", "React Native"]
  customPlatform: '', // temporary field for adding custom platform

  // Step 3: Timeline and Costs
  projectDuration: '',
  advancePercent: '',
  additionalCosts: '',
  timelineMilestones: '',
  currency: 'PKR', // USD or PKR
  recommendedServices: [], // ["Website Development", "SEO", ...]
  serviceCharges: [],      // [50000, 15000, ...]

  // Step 4: Additional Details
  callOutcome: '',
  date: '', // auto-filled when switch is on
  terms: '',

  // Extra (if needed later)
  isLoading: false,
  pdfGenerated: false,
};

export const proposalFormSlice = createSlice({
  name: 'proposalForm',
  initialState,
  reducers: {
    // Generic field updater (for simple text fields)
    updateField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },

    // Development Platforms
    setDevelopmentPlatforms: (state, action) => {
      state.developmentPlatforms = action.payload;
    },
    addCustomPlatform: (state) => {
      if (state.customPlatform.trim()) {
        state.developmentPlatforms.push(state.customPlatform.trim());
        state.customPlatform = '';
      }
    },
    removePlatform: (state, action) => {
      state.developmentPlatforms = state.developmentPlatforms.filter(
        (_, index) => index !== action.payload
      );
    },

    // Services & Charges (parallel arrays)
    addService: (state, action) => {
      const serviceName = action.payload || 'New Service';
      state.recommendedServices.push(serviceName);
      state.serviceCharges.push(0);
    },
    updateServiceLabel: (state, action) => {
      const { index, value } = action.payload;
      if (state.recommendedServices[index] !== undefined) {
        state.recommendedServices[index] = value;
      }
    },
    updateServiceCharge: (state, action) => {
      const { index, value } = action.payload;
      if (state.serviceCharges[index] !== undefined) {
        state.serviceCharges[index] = Number(value) || 0;
      }
    },
    removeService: (state, action) => {
      const index = action.payload;
      state.recommendedServices.splice(index, 1);
      state.serviceCharges.splice(index, 1);
    },

    // Currency Toggle
    setCurrency: (state, action) => {
      state.currency = action.payload; // "USD" or "PKR"
    },

    // Date Auto-fill
    toggleDateAuto: (state) => {
      if (state.date) {
        state.date = '';
      } else {
        state.date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      }
    },

    // Reset entire form
    resetForm: () => initialState,

    // Load form data (e.g., from localStorage or API)
    loadFormData: (state, action) => {
      return { ...state, ...action.payload };
    },

    // Loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setPdfGenerated: (state, action) => {
      state.pdfGenerated = action.payload;
    },
  },
});

// Export Actions
export const {
  updateField,
  setDevelopmentPlatforms,
  addCustomPlatform,
  removePlatform,
  addService,
  updateServiceLabel,
  updateServiceCharge,
  removeService,
  setCurrency,
  toggleDateAuto,
  resetForm,
  loadFormData,
  setLoading,
  setPdfGenerated,
} = proposalFormSlice.actions;

// Selectors
export const selectFormData = (state) => state.proposalForm;
export const selectTotalAmount = (state) =>
  state.proposalForm.serviceCharges.reduce((sum, charge) => sum + (Number(charge) || 0), 0);

export default proposalFormSlice.reducer;