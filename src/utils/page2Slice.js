// src/redux/slices/page2Slice.js
import { createSlice } from "@reduxjs/toolkit";

const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

const initialState = {
  // === HEADER ===
  header: {
    pageTitle: "Creative Proposal for Trendfumes",
    heading: "Premium Digital Branding & Animation Package",
    subheading: "Elevate your fragrance brand with stunning visuals and engaging motion content",
  },

  // === DYNAMIC CONTENT SECTIONS ===
  orderedSections: [
    {
      id: 1,
      type: "title",
      title: "Project Brief",
      content: `Trendfumes, an evolving fragrance brand, is seeking high-quality design and animation 
services to strengthen its digital branding and improve audience engagement. 
This proposal outlines Humantek’s tailored creative package covering posters, banners, and 
animated videos — all designed to reflect Trendfumes’ premium and modern brand positioning.`,
    },
    {
      id: 2,
      type: "numbered",
      title: "",
      content: `1. Posters
• Aesthetic and brand-consistent visuals for Instagram & Facebook.
• Balanced mix of product showcases, lifestyle shots, and promotional creatives.
• Optimized for both feed and story formats.

2. Banners
• High-impact designs for website headers, social media, and ad campaigns.
• Clean typography with a luxury-driven, minimal design style.

3. Animated Videos
• Short motion-graphic videos (15–30 seconds).
• Visually engaging animations to highlight perfumes, offers, or brand storytelling.
• Suitable for Instagram Reels, Stories, and Ads.`,
    },
    {
      id: 3,
      type: "bullets",
      title: "Why Choose Humantek",
      content: `• 8+ years specializing in luxury & lifestyle branding
• Worked with 50+ premium brands
• 100% client satisfaction rate
• On-time delivery guaranteed`,
    },
  ],

  // === UNLIMITED DYNAMIC TABLES (Item - Value) ===
  tables: [
    // Example: Services Table
    {
      id: generateId(),
      headers: { col1: "Recommended Services", col2: "Charges (PKR)" },
      rows: [
        { id: generateId(), col1: "Website Design", col2: "85,000" },
        { id: generateId(), col1: "Mobile App (Android + iOS)", col2: "180,000" },
        { id: generateId(), col1: "Logo & Brand Identity", col2: "35,000" },
        { id: generateId(), col1: "Social Media Creative Kit", col2: "45,000" },
        { id: generateId(), col1: "Admin Dashboard", col2: "60,000" },
      ],
    },
    // Example: Timeline Table
    {
      id: generateId(),
      headers: { col1: "Project Deliverables", col2: "Estimated Timeline" },
      rows: [
        { id: generateId(), col1: "Project Kickoff & Requirement Gathering", col2: "Week 1" },
        { id: generateId(), col1: "UI/UX Design & Client Approval", col2: "Week 2-4" },
        { id: generateId(), col1: "Development Phase", col2: "Week 5-10" },
        { id: generateId(), col1: "Testing & QA", col2: "Week 11" },
        { id: generateId(), col1: "Client Review & Revisions", col2: "Week 12" },
        { id: generateId(), col1: "Final Delivery & Deployment", col2: "Week 13" },
        { id: generateId(), col1: "30 Days Post-Launch Support", col2: "Week 14-17" },
      ],
    },
  ],
};

const page2Slice = createSlice({
  name: "page2",
  initialState,
  reducers: {
    // === HEADER ===
    updatePageHeader: (state, action) => {
      const { field, value } = action.payload;
      state.header = state.header || {};
      state.header[field] = value;
    },

    // === SECTIONS ===
    addSection: (state, action) => {
      state.orderedSections ??= [];
      const { type, title = "", content = "" } = action.payload;
      state.orderedSections.push({
        id: generateId(),
        type,
        title: type === "plain" || type === "numbered" ? "" : title,
        content,
      });
    },

    updateSection: (state, action) => {
      const { id, type, title, content } = action.payload;
      state.orderedSections = (state.orderedSections || []).map((sec) =>
        sec.id === id
          ? {
              ...sec,
              type: type ?? sec.type,
              title: (type === "plain" || type === "numbered") ? "" : (title ?? sec.title),
              content: content ?? sec.content,
            }
          : sec
      );
    },

    deleteSection: (state, action) => {
      state.orderedSections = (state.orderedSections || []).filter((sec) => sec.id !== action.payload);
    },

    moveSectionUp: (state, action) => {
      const index = state.orderedSections.findIndex((s) => s.id === action.payload);
      if (index > 0) {
        [state.orderedSections[index - 1], state.orderedSections[index]] = [
          state.orderedSections[index],
          state.orderedSections[index - 1],
        ];
      }
    },

    moveSectionDown: (state, action) => {
      const index = state.orderedSections.findIndex((s) => s.id === action.payload);
      if (index >= 0 && index < state.orderedSections.length - 1) {
        [state.orderedSections[index], state.orderedSections[index + 1]] = [
          state.orderedSections[index + 1],
          state.orderedSections[index],
        ];
      }
    },

    // === TABLES (UNLIMITED) ===
    addTable: (state) => {
      state.tables.push({
        id: generateId(),
        headers: { col1: "Item", col2: "Value" },
        rows: [],
      });
    },

    addTableRow: (state, action) => {
      const table = state.tables.find((t) => t.id === action.payload);
      if (table) {
        table.rows.push({ id: generateId(), col1: "New Item", col2: "" });
      }
    },

    updateTableRow: (state, action) => {
      const { tableId, rowId, col1, col2 } = action.payload;
      const table = state.tables.find((t) => t.id === tableId);
      if (table) {
        const row = table.rows.find((r) => r.id === rowId);
        if (row) {
          if (col1 !== undefined) row.col1 = col1;
          if (col2 !== undefined) row.col2 = col2;
        }
      }
    },

    deleteTableRow: (state, action) => {
      const { tableId, rowId } = action.payload;
      const table = state.tables.find((t) => t.id === tableId);
      if (table) {
        table.rows = table.rows.filter((r) => r.id !== rowId);
      }
    },

    deleteTable: (state, action) => {
      state.tables = state.tables.filter((t) => t.id !== action.payload);
    },

    updateTableHeaders: (state, action) => {
      const { tableId, col1, col2 } = action.payload;
      const table = state.tables.find((t) => t.id === tableId);
      if (table) {
        if (col1 !== undefined) table.headers.col1 = col1;
        if (col2 !== undefined) table.headers.col2 = col2;
      }
    },

    // === RESET ===
    resetPage2: () => initialState,
  },
});

// Export all actions
export const {
  updatePageHeader,
  addSection,
  updateSection,
  deleteSection,
  moveSectionUp,
  moveSectionDown,
  addTable,
  addTableRow,
  updateTableRow,
  deleteTableRow,
  deleteTable,
  updateTableHeaders,
  resetPage2,
} = page2Slice.actions;

export default page2Slice.reducer;