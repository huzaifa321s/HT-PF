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
    customPlatforms: [], // <-- add this
    businessType: "",
    industoryTitle: "",
    strategicProposal: [],
    brandTagline: "",
    sweeterFashionPresence: "",
    selectedBDM: null,
    recommended_services: [
        "UI/UX Design",
        "Website Development",
        "SEO Optimization",
        "Social Media Management",
        "Brand Identity Design"
    ],
    serviceCharges: [],
    timelineMilestones:
        "Week 1: Design\nWeeks 2-3: Frontend\nWeeks 4-5: Backend\nWeek 6: Deploy & QA",
    terms: "Payments due within 7 days. 30 days post-launch support.",
    callOutcome: "Interested",
    yourName: "Your Name",
    yourEmail: "your.email@example.com",
    date: new Date().toLocaleDateString(),
};

const proposalFormSlice = createSlice({
    name: "proposalForm",
    initialState,
    reducers: {
        updateField(state, action) {
            const { field, value } = action.payload;
            state[field] = value;
        },
        updateServices(state, action) {
            state.recommended_services = action.payload;
        },
        updateCharges(state, action) {

            state.serviceCharges = action.payload.serviceCharges
        },
        resetForm() {
            return initialState;
        },
        updateServiceLabel: (state, action) => {
            const { index, value } = action.payload;
            state.recommended_services[index] = value;
        },
        removeService(state, action) {
            const { index } = action.payload;

            if (index >= 0 && index < state.recommended_services.length) {
                state.recommended_services.splice(index, 1);
            }

            if (index >= 0 && index < state.serviceCharges.length) {
                state.serviceCharges.splice(index, 1);
            }
        },
        addCustomPlatform(state, action) {
            const { platformName } = action.payload;
            console.log('state.custom', state.customPlatforms);
            if (![...state.customPlatforms]?.includes(platformName)) {
                state.customPlatforms = [...state.customPlatforms, platformName];
                state.developmentPlatforms.push(platformName);
            }
        },
        addService(state, action) {
            const { serviceName } = action.payload;
            state.recommended_services.push(serviceName);
            state.serviceCharges.push(0);
        },
        updateServiceCharge: (state, action) => {
            const { index, value } = action.payload;
            state.serviceCharges[index] = value;
        },
        removeCustomPlatform(state, action) {
            const { platformName } = action.payload;
            state.customPlatforms = state.customPlatforms.filter(p => p !== platformName);
            state.developmentPlatforms = state.developmentPlatforms.filter(p => p !== platformName);
        },
    },
});

export const { updateField, removeCustomPlatform, addCustomPlatform, updateServices, updateCharges, resetForm, removeService, updateServiceCharge, updateServiceLabel, addService } =
    proposalFormSlice.actions;

export default proposalFormSlice.reducer;
