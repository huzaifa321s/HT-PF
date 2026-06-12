// src/utils/pricingReducer.js
import { createSlice } from '@reduxjs/toolkit';

const defaultPackage = {
  title: 'New Package',
  subtitle: 'Package description...',
  price: '0',
  color: '#000',
  items: ['New Feature'],
  currency: '$'
};


const modeDefaults = {
  pageTitle: 'Service Packages & Quotation',
  heading: 'Performance Marketing Packages',
  subheading: "Maximize Your Brand's Impact with Our Performance Marketing Packages.\nTailored for Startups, Scaling Brands, & Market Leaders ready to Dominate with Precision.",
  elements: [{ id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, type: 'package', ...defaultPackage }],
  gridPackages: [],
  currentPages: 1,
  includeInPdf: true,
  showTotal: true,
  totalLabel: 'TOTAL PLAN INVESTMENT',
  totalValue: '$ 0',
}

const initialState = {
  currentMode: "create", // ✅ Track current mode
  create: { ...modeDefaults },
  edit: { ...modeDefaults },
};


const pricingSlice = createSlice({
  name: 'pricing',
  initialState,
  reducers: {
    setMode3: (state, action) => {
      state.currentMode = action.payload; // "create" or "edit"
    },
    // ========== PAGE TEXT ==========
    updatePageTitle: (state, action) => {
      const mode = state.currentMode;
      state[mode].pageTitle = action.payload;
    },
    updateHeading: (state, action) => {
      const mode = state.currentMode;
      state[mode].heading = action.payload;
    },
    updateSubheading: (state, action) => {
      const mode = state.currentMode;
      state[mode].subheading = action.payload;
    },
    toggleShowTotal: (state) => {
      const mode = state.currentMode;
      state[mode].showTotal = !state[mode].showTotal;
    },
    updateTotalLabel: (state, action) => {
      const mode = state.currentMode;
      state[mode].totalLabel = action.payload;
    },
    updateTotalValue: (state, action) => {
      const mode = state.currentMode;
      state[mode].totalValue = action.payload;
    },

    // ========== GRID PACKAGES ==========
    addGridPackage: (state) => {
      const newId = Date.now();
      const mode = state.currentMode;
      state[mode].gridPackages.push({
        id: newId,
        ...defaultPackage,
      });
    },

    updateGridPackage: (state, action) => {
      const { id, field, value } = action.payload;
      const mode = state.currentMode;
      const pkg = state[mode].gridPackages.find(p => p.id === id);
      if (pkg) pkg[field] = value;
    },

    updateGridPackageItem: (state, action) => {
      const { pkgId, index, value } = action.payload;
      const mode = state.currentMode;
      const pkg = state[mode].gridPackages.find(p => p.id === pkgId);
      if (pkg && pkg.items[index] !== undefined) {
        pkg.items[index] = value;
      }
    },

    updateGridPackageItemAlign: (state, action) => {
      const { pkgId, index, value } = action.payload;
      const mode = state.currentMode;
      const pkg = state[mode].gridPackages.find(p => p.id === pkgId);
      if (pkg) {
        if (!pkg.itemAligns) pkg.itemAligns = [];
        pkg.itemAligns[index] = value;
      }
    },

    setPageCount: (state, action) => {
      const mode = state.currentMode;
      state[mode].currentPages = action.payload; // Direct value
    },

    addItemToGridPackage: (state, action) => {
      const { pkgId } = action.payload;
      const mode = state.currentMode;
      const pkg = state[mode].gridPackages.find(p => p.id === pkgId);
      if (pkg) {
        pkg.items.push('New Feature');
        if (!pkg.itemAligns) pkg.itemAligns = [];
        pkg.itemAligns.push('left');
      }
    },

    addMultipleItemsToGridPackage: (state, action) => {
      const { pkgId, items } = action.payload;
      const mode = state.currentMode;
      const pkg = state[mode].gridPackages.find(p => p.id === pkgId);
      if (pkg && Array.isArray(items)) {
        pkg.items.push(...items);
        if (!pkg.itemAligns) pkg.itemAligns = [];
        items.forEach(() => pkg.itemAligns.push('left'));
      }
    },

    deleteItemFromGridPackage: (state, action) => {
      const { pkgId, index } = action.payload;
      const mode = state.currentMode;
      const pkg = state[mode].gridPackages.find(p => p.id === pkgId);
      if (pkg) {
        pkg.items.splice(index, 1);
        if (pkg.itemAligns) pkg.itemAligns.splice(index, 1);
      }
    },

    deleteGridPackage: (state, action) => {
      const { pkgId } = action.payload;
      const mode = state.currentMode;
      state[mode].gridPackages = state[mode].gridPackages.filter(p => p.id !== pkgId);
    },

    restoreGridPackage: (state, action) => {
      const { pkg, index } = action.payload;
      const mode = state.currentMode;
      if (index !== undefined && index >= 0) {
        state[mode].gridPackages.splice(index, 0, pkg);
      } else {
        state[mode].gridPackages.push(pkg);
      }
    },

    restoreGridPackageItem: (state, action) => {
      const { pkgId, item, align, index } = action.payload;
      const mode = state.currentMode;
      const pkg = state[mode].gridPackages.find(p => p.id === pkgId);
      if (pkg) {
        if (index !== undefined && index >= 0) {
          pkg.items.splice(index, 0, item);
          if (pkg.itemAligns) pkg.itemAligns.splice(index, 0, align || 'left');
        } else {
          pkg.items.push(item);
          if (pkg.itemAligns) pkg.itemAligns.push(align || 'left');
        }
      }
    },

    // ========== ELEMENTS (text, heading, standalone package) ==========
    addElement: (state, action) => {
      const { type } = action.payload;
      const newId = `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const mode = state.currentMode;

      if (type === 'mainHeading') {
        state[mode].elements.push({ id: newId, type: 'mainHeading', content: 'New Main Heading' });
      } else if (type === 'text') {
        state[mode].elements.push({ id: newId, type: 'text', content: 'New paragraph text...' });
      } else if (type === 'package') {
        state[mode].elements.push({ id: newId, type: 'package', ...defaultPackage });
      }
    },

    updateElementContent: (state, action) => {
      const { id, content } = action.payload;
      const mode = state.currentMode;

      const el = state[mode].elements.find(e => e.id === id);
      if (el && (el.type === 'mainHeading' || el.type === 'text')) {
        el.content = content;
      }
    },

    updateStandalonePackage: (state, action) => {
      const { id, field, value } = action.payload;
      const mode = state.currentMode;

      const el = state[mode].elements.find(e => e.id === id && e.type === 'package');
      if (el) el[field] = value;
    },

    updateStandalonePackageItem: (state, action) => {
      const { elementId, index, value } = action.payload;
      const mode = state.currentMode;

      const el = state[mode].elements.find(e => e.id === elementId && e.type === 'package');
      if (el && el.items[index] !== undefined) {
        el.items[index] = value;
      }
    },

    updateStandalonePackageItemAlign: (state, action) => {
      const { elementId, index, value } = action.payload;
      const mode = state.currentMode;

      const el = state[mode].elements.find(e => e.id === elementId && e.type === 'package');
      if (el) {
        if (!el.itemAligns) el.itemAligns = [];
        el.itemAligns[index] = value;
      }
    },

    addItemToStandalonePackage: (state, action) => {
      const { elementId } = action.payload;
      const mode = state.currentMode;

      const el = state[mode].elements.find(e => e.id === elementId && e.type === 'package');
      if (el) {
        el.items.push('New Feature');
        if (!el.itemAligns) el.itemAligns = [];
        el.itemAligns.push('left');
      }
    },

    addMultipleItemsToStandalonePackage: (state, action) => {
      const { elementId, items } = action.payload;
      const mode = state.currentMode;

      const el = state[mode].elements.find(e => e.id === elementId && e.type === 'package');
      if (el && Array.isArray(items)) {
        el.items.push(...items);
        if (!el.itemAligns) el.itemAligns = [];
        items.forEach(() => el.itemAligns.push('left'));
      }
    },

    deleteItemFromStandalonePackage: (state, action) => {
      const { elementId, index } = action.payload;
      const mode = state.currentMode;

      const el = state[mode].elements.find(e => e.id === elementId && e.type === 'package');
      if (el) {
        el.items.splice(index, 1);
        if (el.itemAligns) el.itemAligns.splice(index, 1);
      }
    },

    deleteElement: (state, action) => {
      const { elementId } = action.payload;
      const mode = state.currentMode;

      state[mode].elements = state[mode].elements.filter(el => el.id !== elementId);
    },

    restoreElement: (state, action) => {
      const { element, index } = action.payload;
      const mode = state.currentMode;
      if (index !== undefined && index >= 0) {
        state[mode].elements.splice(index, 0, element);
      } else {
        state[mode].elements.push(element);
      }
    },

    restoreStandalonePackageItem: (state, action) => {
      const { elementId, item, align, index } = action.payload;
      const mode = state.currentMode;
      const el = state[mode].elements.find(e => e.id === elementId && e.type === 'package');
      if (el) {
        if (index !== undefined && index >= 0) {
          el.items.splice(index, 0, item);
          if (el.itemAligns) el.itemAligns.splice(index, 0, align || 'left');
        } else {
          el.items.push(item);
          if (el.itemAligns) el.itemAligns.push(align || 'left');
        }
      }
    },

    // ========== DRAG & DROP REORDER (only elements + grid packages together) ==========
    reorderElements: (state, action) => {
      const { activeId, overId } = action.payload;
      const mode = state.currentMode;

      // Find in elements
      const elIndex = state[mode].elements.findIndex(e => e.id === activeId);
      const gridIndex = state[mode].gridPackages.findIndex(p => p.id === activeId);

      if (elIndex !== -1) {
        const [moved] = state[mode].elements.splice(elIndex, 1);
        const targetIndex = state[mode].elements.findIndex(e => e.id === overId);
        state[mode].elements.splice(targetIndex === -1 ? state[mode].elements.length : targetIndex, 0, moved);
      } else if (gridIndex !== -1) {
        const [moved] = state[mode].gridPackages.splice(gridIndex, 1);
        const targetIndex = state[mode].gridPackages.findIndex(p => p.id === overId);
        state[mode].gridPackages.splice(targetIndex === -1 ? state[mode].gridPackages.length : targetIndex, 0, moved);
      }
    },
    togglePricingPageInclusion: (state) => {
      const mode = state.currentMode;

      state[mode].includeInPdf = !state[mode].includeInPdf;
    },
    setDBDataPricing: (state, action) => {
      state.edit = { ...action.payload };
    },
    // ========== RESET ==========
    resetPageData: () => initialState,
  },
});

export const {
  updatePageTitle,
  updateHeading,
  updateSubheading,
  toggleShowTotal,
  updateTotalLabel,
  updateTotalValue,
  addGridPackage,
  updateGridPackage,
  updateGridPackageItem,
  updateGridPackageItemAlign,
  addItemToGridPackage,
  deleteItemFromGridPackage,
  deleteGridPackage,
  restoreGridPackage,
  restoreGridPackageItem,
  togglePricingPageInclusion,
  addElement,
  updateElementContent,
  updateStandalonePackage,
  updateStandalonePackageItem,
  updateStandalonePackageItemAlign,
  addItemToStandalonePackage,
  deleteItemFromStandalonePackage,
  deleteElement,
  restoreElement,
  restoreStandalonePackageItem,
  reorderElements,
  setMode3,
  resetPageData,
  setDBDataPricing,
  setPageCount,
  addMultipleItemsToGridPackage,
  addMultipleItemsToStandalonePackage,
} = pricingSlice.actions;

export default pricingSlice.reducer;