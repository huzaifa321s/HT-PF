// src/store/pagesSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  pages: [
    { id: uuidv4(), name: "Page2BrandedCover", type: "Page2BrandedCover" },
    { id: uuidv4(), name: "Page4AboutHumantek", type: "Page4AboutHumantek" },
    { id: uuidv4(), name: "Page3AdditionalInfo", type: "Page3AdditionalInfo" },
    { id: uuidv4(), name: "PricingTable", type: "PricingTable" },
    { id: uuidv4(), name: "PaymentTermsPage", type: "PaymentTermsPage" },
    { id: uuidv4(), name: "Page5Contact", type: "Page5Contact" },
  ],
};

const pagesSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {
    addPage: (state, action) => {
      const { afterIndex, type } = action.payload;
      const newPage = {
        id: uuidv4(),
        name: type,
        type,
      };
      state.pages.splice(afterIndex + 1, 0, newPage);
    },

    clonePage: (state, action) => {
      const index = action.payload;
      const pageToClone = state.pages[index];
      if (pageToClone) {
        const newPage = { ...pageToClone, id: uuidv4() };
        state.pages.splice(index + 1, 0, newPage);
      }
    },

    clonePageWithData: (state, action) => {
      const { afterIndex, type } = action.payload;
      const newPage = {
        id: uuidv4(),
        name: type,
        type: type,
      };
      state.pages.splice(afterIndex + 1, 0, newPage);
    },

    clonePageWithPrevData: (state, action) => {
      const { currentPageIndex } = action.payload;
      const pageToClone = state.pages[currentPageIndex];
      if (pageToClone) {
        const clonedPage = {
          ...pageToClone,
          id: uuidv4(),
          name: pageToClone.type + " (Copy)",
        };
        state.pages.splice(currentPageIndex + 1, 0, clonedPage);
      }
    },
    // Simple action - sirf naya page banaye
    // src/store/pagesSlice.js
// src/utils/pagesSlice.js (ya jahan bhi hai)

addPricingContinuationPage: (state, action) => {
  const { afterIndex, carriedElement, newPageId } = action.payload;

  const pageId = newPageId || uuidv4();

  state.pages.splice(afterIndex + 1, 0, {
    id: pageId,
    name: "Pricing Table (Continued)",
    type: "PricingTable",
    isContinuation: true,
    carriedElement, // temporary store
  });
},
    // NEW: Add blank pricing page after current index
    addBlankPricingPage: (state, action) => {
      const { afterIndex, newPageId } = action.payload;
      const newPage = {
        id: newPageId,
        name: "blankPage",
        type: "blankPage",
      };
      state.pages.splice(afterIndex + 1, 0, newPage);
    },
    // Add this action if not already there
    addPricingPageAfter: (state, action) => {
      const { afterIndex } = action.payload;
      const count = state.pages.filter(p => p.type === "PricingTable").length + 1;
      const newPage = {
        id: uuidv4(),
        name: `Pricing Table${count > 1 ? ` (${count})` : ''}`,
        type: "PricingTable",
      };

      state.pages.splice(afterIndex + 1, 0, newPage);
    },
    deletePage: (state, action) => {
      const index = action.payload;
      if (state.pages.length > 1) {
        state.pages.splice(index, 1);
      }
    },

    reorderPages: (state, action) => {
      const { oldIndex, newIndex } = action.payload;
      if (oldIndex === newIndex) return;
      const [moved] = state.pages.splice(oldIndex, 1);
      state.pages.splice(newIndex, 0, moved);
    },

    updatePageOrder: (state, action) => {
      state.pages = action.payload;
    },

    resetPages: () => initialState,
  },
});

export const {
  addPage,
  clonePage,
  clonePageWithData,
  clonePageWithPrevData,
  addBlankPricingPage,
  deletePage,
  reorderPages,
  addPricingPageAfter,
  addPricingContinuationPage,
  updatePageOrder,
  resetPages
} = pagesSlice.actions;

export default pagesSlice.reducer;