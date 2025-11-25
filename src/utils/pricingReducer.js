// src/utils/pricingReducer.js
import { createSlice } from '@reduxjs/toolkit';

const defaultPackage = {
  title: 'New Package',
  subtitle: 'Package description...',
  price: '0',
  color: '#000',
  items: ['New Feature'],

};

const initialState = {
  pageTitle: 'Service Packages & Quotation',
  heading: 'Performance Marketing Packages',
  subheading: "Maximize Your Brand's Impact with Our Performance Marketing Packages.\nTailored for Startups, Scaling Brands, & Market Leaders ready to Dominate with Precision.",
  elements: [],      // text, mainHeading, standalone package
  gridPackages: [],  // 2-3 column packages
  currentPages: 1
};

const pricingSlice = createSlice({
  name: 'pricing',
  initialState,
  reducers: {

    // ========== PAGE TEXT ==========
    updatePageTitle: (state, action) => {
      state.pageTitle = action.payload;
    },
    updateHeading: (state, action) => {
      state.heading = action.payload;
    },
    updateSubheading: (state, action) => {
      state.subheading = action.payload;
    },

    // ========== GRID PACKAGES ==========
    addGridPackage: (state) => {
      const newId = Date.now();
      state.gridPackages.push({
        id: newId,
        ...defaultPackage,
      });
    },

    updateGridPackage: (state, action) => {
      const { id, field, value } = action.payload;
      const pkg = state.gridPackages.find(p => p.id === id);
      if (pkg) pkg[field] = value;
    },

    updateGridPackageItem: (state, action) => {
      const { pkgId, index, value } = action.payload;
      const pkg = state.gridPackages.find(p => p.id === pkgId);
      if (pkg && pkg.items[index] !== undefined) {
        pkg.items[index] = value;
      }
    },
    setCurrentPages: (state, action) => {
      state.currentPages = action.payload.currentPages
    },

    addItemToGridPackage: (state, action) => {
      const { pkgId } = action.payload;
      const pkg = state.gridPackages.find(p => p.id === pkgId);
      if (pkg) pkg.items.push('New Feature');
    },

    deleteItemFromGridPackage: (state, action) => {
      const { pkgId, index } = action.payload;
      const pkg = state.gridPackages.find(p => p.id === pkgId);
      if (pkg) pkg.items.splice(index, 1);
    },

    deleteGridPackage: (state, action) => {
      const { pkgId } = action.payload;
      state.gridPackages = state.gridPackages.filter(p => p.id !== pkgId);
    },

    // ========== ELEMENTS (text, heading, standalone package) ==========
    addElement: (state, action) => {
      const { type } = action.payload;
      const newId = `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      if (type === 'mainHeading') {
        state.elements.push({ id: newId, type: 'mainHeading', content: 'New Main Heading' });
      } else if (type === 'text') {
        state.elements.push({ id: newId, type: 'text', content: 'New paragraph text...' });
      } else if (type === 'package') {
        state.elements.push({ id: newId, type: 'package', ...defaultPackage });
      }
    },

    updateElementContent: (state, action) => {
      const { id, content } = action.payload;
      const el = state.elements.find(e => e.id === id);
      if (el && (el.type === 'mainHeading' || el.type === 'text')) {
        el.content = content;
      }
    },

    updateStandalonePackage: (state, action) => {
      const { id, field, value } = action.payload;
      const el = state.elements.find(e => e.id === id && e.type === 'package');
      if (el) el[field] = value;
    },

    updateStandalonePackageItem: (state, action) => {
      const { elementId, index, value } = action.payload;
      const el = state.elements.find(e => e.id === elementId && e.type === 'package');
      if (el && el.items[index] !== undefined) {
        el.items[index] = value;
      }
    },

    addItemToStandalonePackage: (state, action) => {
      const { elementId } = action.payload;
      const el = state.elements.find(e => e.id === elementId && e.type === 'package');
      if (el) el.items.push('New Feature');
    },

    deleteItemFromStandalonePackage: (state, action) => {
      const { elementId, index } = action.payload;
      const el = state.elements.find(e => e.id === elementId && e.type === 'package');
      if (el) el.items.splice(index, 1);
    },

    deleteElement: (state, action) => {
      const { elementId } = action.payload;
      state.elements = state.elements.filter(el => el.id !== elementId);
    },

    // ========== DRAG & DROP REORDER (only elements + grid packages together) ==========
    reorderElements: (state, action) => {
      const { activeId, overId } = action.payload;

      // Find in elements
      const elIndex = state.elements.findIndex(e => e.id === activeId);
      const gridIndex = state.gridPackages.findIndex(p => p.id === activeId);

      if (elIndex !== -1) {
        const [moved] = state.elements.splice(elIndex, 1);
        const targetIndex = state.elements.findIndex(e => e.id === overId);
        state.elements.splice(targetIndex === -1 ? state.elements.length : targetIndex, 0, moved);
      } else if (gridIndex !== -1) {
        const [moved] = state.gridPackages.splice(gridIndex, 1);
        const targetIndex = state.gridPackages.findIndex(p => p.id === overId);
        state.gridPackages.splice(targetIndex === -1 ? state.gridPackages.length : targetIndex, 0, moved);
      }
    },

    // ========== RESET ==========
    resetPageData: () => initialState,
  },
});

export const {
  updatePageTitle,
  updateHeading,
  updateSubheading,
  addGridPackage,
  updateGridPackage,
  updateGridPackageItem,
  addItemToGridPackage,
  deleteItemFromGridPackage,
  deleteGridPackage,
  addElement,
  updateElementContent,
  updateStandalonePackage,
  updateStandalonePackageItem,
  addItemToStandalonePackage,
  deleteItemFromStandalonePackage,
  deleteElement,
  reorderElements,
  resetPageData,
  setCurrentPages
} = pricingSlice.actions;

export default pricingSlice.reducer;