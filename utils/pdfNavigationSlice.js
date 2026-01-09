import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    offsets: {
        "Cover Page": 1,
        "About HT": 1,
        "Additional Info": 1,
        Pricing: 1,
        "Payment Terms": 1,
        Contact: 1,
    },
};

const pdfNavigationSlice = createSlice({
    name: "pdfNavigation",
    initialState,
    reducers: {
        setOffset: (state, action) => {
            const { section, offset } = action.payload;
            // We only want to set the offset if it's the first page of the section
            // and potentially handle updates if the PDF structure changes
            state.offsets[section] = offset - 1; // react-pdf-viewer is 0-indexed
        },
    },
});

export const { setOffset } = pdfNavigationSlice.actions;
export default pdfNavigationSlice.reducer;
