// src/store/blankContentSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { arrayMove } from '@dnd-kit/sortable';

const initialState = {
  pageTitle: 'Custom Page Builder',
  elements: [
    // Example structure:
    // { id: "element-1", type: "mainHeading", content: "Main Title" }
    // { id: "element-2", type: "standaloneImage", content: "url", dimensions: { width: "500px", height: "auto" } }
    // { id: "element-3", type: "section", title: "Section Title", blocks: [] }
    // blocks: [{ id: "blk-1", type: "heading|text|image", content: "...", dimensions: {...} }]
  ],
};

const blankContentSlice = createSlice({
  name: 'blankContent',
  initialState,
  reducers: {
    // === Page Title ===
    updatePageTitle: (state, action) => {
      state.pageTitle = action.payload;
    },

    // === Add Elements ===
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
        title: 'New Section Title',
        blocks: [],
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

    // === Update Elements ===
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

    updateSectionTitle: (state, action) => {
      const { id, title } = action.payload;
      const element = state.elements.find(el => el.id === id);
      if (element && element.type === 'section') {
        element.title = title;
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

    // === Section Blocks ===
    addBlockToSection: (state, action) => {
      const { sectionId, type, content } = action.payload;
      const section = state.elements.find(el => el.id === sectionId);
      
      if (section && section.type === 'section') {
        const newBlock = {
          id: `blk-${Date.now()}`,
          type,
          content: content || (
            type === 'heading' ? 'New Heading' :
            type === 'text' ? 'New paragraph text...' :
            'https://via.placeholder.com/400x200?text=Image'
          ),
          dimensions: type === 'image' ? { width: '400px', height: 'auto' } : null,
        };
        section.blocks.push(newBlock);
      }
    },

    updateBlock: (state, action) => {
      const { sectionId, blockId, content } = action.payload;
      const section = state.elements.find(el => el.id === sectionId);
      
      if (section && section.type === 'section') {
        const block = section.blocks.find(b => b.id === blockId);
        if (block) {
          block.content = content;
        }
      }
    },

    updateBlockDimensions: (state, action) => {
      const { sectionId, blockId, dimensions } = action.payload;
      const section = state.elements.find(el => el.id === sectionId);
      
      if (section && section.type === 'section') {
        const block = section.blocks.find(b => b.id === blockId);
        if (block && block.type === 'image') {
          block.dimensions = dimensions;
        }
      }
    },

    deleteBlock: (state, action) => {
      const { sectionId, blockId } = action.payload;
      const section = state.elements.find(el => el.id === sectionId);
      
      if (section && section.type === 'section') {
        section.blocks = section.blocks.filter(b => b.id !== blockId);
      }
    },

    reorderBlocks: (state, action) => {
      const { sectionId, activeId, overId } = action.payload;
      const section = state.elements.find(el => el.id === sectionId);
      
      if (section && section.type === 'section') {
        const oldIndex = section.blocks.findIndex(b => b.id === activeId);
        const newIndex = section.blocks.findIndex(b => b.id === overId);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          section.blocks = arrayMove(section.blocks, oldIndex, newIndex);
        }
      }
    },
  },
});

export const {
  updatePageTitle,
  addMainHeading,
  addSection,
  addStandaloneImage,
  updateMainHeading,
  updateStandaloneImageDimensions,
  updateSectionTitle,
  deleteElement,
  reorderElements,
  addBlockToSection,
  updateBlock,
  updateBlockDimensions,
  deleteBlock,
  reorderBlocks,
} = blankContentSlice.actions;

export default blankContentSlice.reducer;