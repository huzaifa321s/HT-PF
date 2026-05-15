// src/store/customContentSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { arrayMove } from '@dnd-kit/sortable';

const initialState = {
  pageTitle: 'Custom Content Page',
  footerText: "Together, we'll position SQ Logistics as a trusted logistics partner across Pakistan's major business hubs.",
  listStyle: 'disc',
  elements: [
    {
      id: 'element-1',
      type: 'section',
      heading: 'Title',
      items: [
        { type: 'text', content: 'Subtitle' },
        { type: 'text', content: 'Description 1' },
        { type: 'text', content: 'Description 2' },
        { type: 'text', content: 'Description 3' },
        { type: 'text', content: 'Description 4' },
      ],
    },
    {
      id: 'element-2',
      type: 'section',
      heading: 'Section Title',
      items: [
        { type: 'text', content: 'Point 1' },
        { type: 'text', content: 'Point 2' },
        { type: 'text', content: 'Point 3' },
      ],
    },
  ],
};

const customContentSlice = createSlice({
  name: 'customContent',
  initialState,
  reducers: {
    // === Page Title ===
    updatePageTitle: (state, action) => {
      state.pageTitle = action.payload;
    },

    // === Footer ===
    updateFooterText: (state, action) => {
      state.footerText = action.payload;
    },

    deleteFooter: (state) => {
      state.footerText = '';
    },

    // === List Style ===
    updateListStyle: (state, action) => {
      state.listStyle = action.payload;
    },

    // === Add Main Elements ===
    addMainHeading: (state) => {
      const newId = `element-${Date.now()}`;
      state.elements.push({
        id: newId,
        type: 'mainHeading',
        content: 'New Main Heading',
      });
    },

    addSection: (state) => {
      const newId = `element-${Date.now()}`;
      state.elements.push({
        id: newId,
        type: 'section',
        heading: 'New Section',
        items: [{ type: 'text', content: 'New item' }],
      });
    },

    addStandaloneImage: (state, action) => {
      const newId = `element-${Date.now()}`;
      state.elements.push({
        id: newId,
        type: 'standaloneImage',
        content: action.payload || 'https://via.placeholder.com/500x300',
        dimensions: { width: '100%', height: 'auto' },
      });
    },

    // === Update Main Elements ===
    updateMainHeading: (state, action) => {
      const { id, content } = action.payload;
      const element = state.elements.find(el => el.id === id);
      if (element && element.type === 'mainHeading') {
        element.content = content;
      }
    },

    updateStandaloneImageDimensions: (state, action) => {
      const { id, dimensions } = action.payload;
      const element = state.elements.find(el => el.id === id);
      if (element && element.type === 'standaloneImage') {
        element.dimensions = dimensions;
      }
    },

    updateSectionHeading: (state, action) => {
      const { id, heading } = action.payload;
      const element = state.elements.find(el => el.id === id);
      if (element && element.type === 'section') {
        element.heading = heading;
      }
    },

    // === Delete Elements ===
    deleteElement: (state, action) => {
      state.elements = state.elements.filter(el => el.id !== action.payload);
    },

    // === Reorder Elements ===
    reorderElements: (state, action) => {
      const { activeId, overId } = action.payload;
      const oldIndex = state.elements.findIndex(el => el.id === activeId);
      const newIndex = state.elements.findIndex(el => el.id === overId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        state.elements = arrayMove(state.elements, oldIndex, newIndex);
      }
    },

    // === Section Items ===
    addItemToSection: (state, action) => {
      const { sectionId, type, content } = action.payload;
      const section = state.elements.find(el => el.id === sectionId);
      
      if (section && section.type === 'section') {
        const newItem = type === 'image'
          ? {
              type: 'image',
              content: content || 'https://via.placeholder.com/400x200',
              dimensions: { width: '400px', height: 'auto' },
            }
          : { type: 'text', content: content || 'New item' };
        
        section.items.push(newItem);
      }
    },

    updateSectionItem: (state, action) => {
      const { sectionId, itemIndex, content } = action.payload;
      const section = state.elements.find(el => el.id === sectionId);
      
      if (section && section.type === 'section' && section.items[itemIndex]) {
        if (section.items[itemIndex].type === 'text') {
          section.items[itemIndex].content = content;
        }
      }
    },

    updateSectionItemDimensions: (state, action) => {
      const { sectionId, itemIndex, dimensions } = action.payload;
      const section = state.elements.find(el => el.id === sectionId);
      
      if (section && section.type === 'section' && section.items[itemIndex]) {
        if (section.items[itemIndex].type === 'image') {
          section.items[itemIndex].dimensions = dimensions;
        }
      }
    },

    deleteSectionItem: (state, action) => {
      const { sectionId, itemIndex } = action.payload;
      const section = state.elements.find(el => el.id === sectionId);
      
      if (section && section.type === 'section') {
        section.items = section.items.filter((_, index) => index !== itemIndex);
      }
    },

    reorderSectionItems: (state, action) => {
      const { sectionId, activeIndex, overIndex } = action.payload;
      const section = state.elements.find(el => el.id === sectionId);
      
      if (section && section.type === 'section') {
        section.items = arrayMove(section.items, activeIndex, overIndex);
      }
    },

    // === Reset ===
    resetCustomContent: (state) => {
      return initialState;
    },

    // === Load Custom State ===
    loadCustomContent: (state, action) => {
      return { ...initialState, ...action.payload };
    },
  },
});

export const {
  updatePageTitle,
  updateFooterText,
  deleteFooter,
  updateListStyle,
  addMainHeading,
  addSection,
  addStandaloneImage,
  updateMainHeading,
  updateStandaloneImageDimensions,
  updateSectionHeading,
  deleteElement,
  reorderElements,
  addItemToSection,
  updateSectionItem,
  updateSectionItemDimensions,
  deleteSectionItem,
  reorderSectionItems,
  resetCustomContent,
  loadCustomContent,
} = customContentSlice.actions;

export default customContentSlice.reducer;