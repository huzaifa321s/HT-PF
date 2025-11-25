// src/store/page3Slice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  title: 'Proposal for Brand Name',
  subtitle: 'About Humantek',
  elements: [
    {
      id: 'text-1',
      type: 'text',
      content:
        'At Humantek, we specialize in delivering tailored technology and digital solutions for businesses across various industries. With a team of 200+ talented professionals, we have successfully delivered highquality websites, applications, and digital experiences to global clients. Some of our esteemed clients include industry leaders in ecommerce, technology, and manufacturing.',
    },
    {
      id: 'text-2',
      type: 'text',
      content:
        'We pride ourselves on creating scalable, modern, and result-oriented solutions that empower businesses to achieve their goals effectively.',
    },
    {
      id: 'image-1',
      type: 'image',
      content: '/about-HT.png',
      dimensions: { width: '85%', height: '100%' },
    },
  ],
};

const page3Slice = createSlice({
  name: 'page3',
  initialState,
  reducers: {
    updateTitle: (state, action) => {
      state.title = action.payload;
    },
    updateSubtitle: (state, action) => {
      state.subtitle = action.payload;
    },

    // === Fixed: Default Content for Non-Image Elements ===
    addElement: (state, action) => {
      const { type, content = '', title = '', desc = '' } = action.payload;
      const newId = `${type}-${Date.now()}`;
      let newEl = { id: newId, type };

      if (type === 'title') {
        newEl.content = content || 'New Title';
      }
      else if (type === 'mainHeading') {
        newEl.content = content || 'New Main Heading';
      }
      else if (type === 'text') {
        newEl.content = content || 'Enter your text here...';
      }
      else if (type === 'section') {
        newEl.title = title || 'Section Title';
        newEl.desc = desc || 'Section description goes here...';
      }
      else if (type === 'image') {
        newEl.content = content || '/about-HT.png';
        newEl.dimensions = { width: '100%', height: '300px' };
      }

      state.elements.push(newEl);
    },

    editElementContent: (state, action) => {
      const { id, content } = action.payload;
      const el = state.elements.find(e => e.id === id);
      if (el && el.type !== 'section') el.content = content;
    },
    editSectionField: (state, action) => {
      const { id, field, value } = action.payload;
      const el = state.elements.find(e => e.id === id);
      if (el && el.type === 'section') el[field] = value;
    },
    deleteElement: (state, action) => {
      state.elements = state.elements.filter(el => el.id !== action.payload);
    },
    reorderElements: (state, action) => {
      const { activeId, overId } = action.payload;
      const oldIdx = state.elements.findIndex(el => el.id === activeId);
      const newIdx = state.elements.findIndex(el => el.id === overId);
      if (oldIdx !== -1 && newIdx !== -1) {
        const [moved] = state.elements.splice(oldIdx, 1);
        state.elements.splice(newIdx, 0, moved);
      }
    },
    updateImageDimensions: (state, action) => {
      const { id, dimensions } = action.payload;
      const el = state.elements.find(e => e.id === id);
      if (el && el.type === 'image') el.dimensions = dimensions;
    },
    resetPage: () => initialState, 
  },
});

export const {
  updateTitle,
  updateSubtitle,
  addElement,
  editElementContent,
  editSectionField,
  deleteElement,
  reorderElements,
  updateImageDimensions,
  resetPage,
} = page3Slice.actions;

export default page3Slice.reducer;