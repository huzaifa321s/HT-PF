// src/redux/slices/page2Slice.js
import { createSlice } from "@reduxjs/toolkit";

const generateId = () => Date.now() + Math.floor(Math.random() * 1000);


const modeDefaults = {
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
This proposal outlines Humantek's tailored creative package covering posters, banners, and 
animated videos — all designed to reflect Trendfumes' premium and modern brand positioning.`,
    },
    {
      id: 2,
      type: "numbered",
      title: "Diliverables",
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

  // === UNLIMITED DYNAMIC TABLES (2-column and 3-column) ===
  tables: [
    // Example: 2-column Services Table
    {
      id: 1,
      columnCount: 2,
      headers: { col1: "Recommended Services", col2: "Charges (PKR)" },
      rows: [
        { id: generateId(), col1: "Website Design", col2: "85,000" },
        { id: generateId(), col1: "Mobile App (Android + iOS)", col2: "180,000" },
        { id: generateId(), col1: "Logo & Brand Identity", col2: "35,000" },
        { id: generateId(), col1: "Social Media Creative Kit", col2: "45,000" },
        { id: generateId(), col1: "Admin Dashboard", col2: "60,000" },
      ],
    },
    // Example: 3-column Timeline Table
    {
      id: generateId(),
      columnCount: 3,
      headers: { col1: "Phase", col2: "Deliverable", col3: "Timeline" },
      rows: [
        { id: generateId(), col1: "Planning", col2: "Project Kickoff & Requirement Gathering", col3: "Week 1" },
        { id: generateId(), col1: "Design", col2: "UI/UX Design & Client Approval", col3: "Week 2-4" },
        { id: generateId(), col1: "Development", col2: "Development Phase", col3: "Week 5-10" },
        { id: generateId(), col1: "Testing", col2: "Testing & QA", col3: "Week 11" },
        { id: generateId(), col1: "Review", col2: "Client Review & Revisions", col3: "Week 12" },
        { id: generateId(), col1: "Launch", col2: "Final Delivery & Deployment", col3: "Week 13" },
        { id: generateId(), col1: "Support", col2: "30 Days Post-Launch Support", col3: "Week 14-17" },
      ],
    },
  ],
  includeInPdf: true,
}

const initialState = {
 currentMode: "create", // ✅ Track current mode
  create: { ...modeDefaults },
  edit: { ...modeDefaults },
};

const page2Slice = createSlice({
  name: "page2",
  initialState,
  reducers: {
    // ✅ Set mode action
    setMode: (state, action) => {
      state.currentMode = action.payload; // "create" or "edit"
    },

    // ✅ Ab saare actions currentMode ke data pe work karenge
    updatePageHeader: (state, action) => {
      const mode = state.currentMode;
      const { field, value } = action.payload;
      state[mode].header = state[mode].header || {};
      state[mode].header[field] = value;
    },

    addSection: (state, action) => {
      const mode = state.currentMode;
      state[mode].orderedSections ??= [];
      const { type, title = "", content = "" } = action.payload;
      state[mode].orderedSections.push({
        id: generateId(),
        type,
        title: type === "plain" ? "" : title,
        content,
      });
    },

    toggleInclusion: (state) => {
      const mode = state.currentMode;
      state[mode].includeInPdf = !state[mode].includeInPdf;
    },

    updateSection: (state, action) => {
      const mode = state.currentMode;
      const { id, type, title, content } = action.payload;
      state[mode].orderedSections = (state[mode].orderedSections || []).map((sec) =>
        sec.id === id
          ? {
              ...sec,
              type: type ?? sec.type,
             title: type === "plain" ? "" : (title ?? sec.title),
              content: content ?? sec.content,
            }
          : sec
      );
    },

    deleteSection: (state, action) => {
      const mode = state.currentMode;
      state[mode].orderedSections = (state[mode].orderedSections || []).filter(
        (sec) => sec.id !== action.payload
      );
    },

    moveSectionUp: (state, action) => {
      const mode = state.currentMode;
      const index = state[mode].orderedSections.findIndex((s) => s.id === action.payload);
      if (index > 0) {
        [state[mode].orderedSections[index - 1], state[mode].orderedSections[index]] = [
          state[mode].orderedSections[index],
          state[mode].orderedSections[index - 1],
        ];
      }
    },

    moveSectionDown: (state, action) => {
      const mode = state.currentMode;
      const index = state[mode].orderedSections.findIndex((s) => s.id === action.payload);
      if (index >= 0 && index < state[mode].orderedSections.length - 1) {
        [state[mode].orderedSections[index], state[mode].orderedSections[index + 1]] = [
          state[mode].orderedSections[index + 1],
          state[mode].orderedSections[index],
        ];
      }
    },

    addTable: (state, action) => {
      const mode = state.currentMode;
      const columnCount = action.payload?.columnCount || 2;
      
      if (action.payload?.T_ID) {
        state[mode].tables.push({
          id: action.payload.T_ID,
          type: action.payload.type === 'quotation' ? 'Quotation' : "",
          columnCount,
          headers: columnCount === 3 
            ? { col1: "Item", col2: "Quantity", col3: "Estimated Cost (PKR)" }
            : { col1: "Deliverable", col2: "Estimated Delivery Time" },
          rows: action.payload.rows,
        });
      } else {
        state[mode].tables.push({
          id: generateId(),
          columnCount,
          headers: columnCount === 3
            ? { col1: "Column 1", col2: "Column 2", col3: "Column 3" }
            : { col1: "Item", col2: "Value" },
          rows: [],
        });
      }
    },

    addTableRow: (state, action) => {
      const mode = state.currentMode;
      console.log('mss',mode)
      const table = state[mode].tables.find((t) => t.id === action.payload);
      if (table) {
        const newRow = { id: generateId(), col1: "New Item", col2: "" };
        if (table.columnCount === 3) {
          newRow.col3 = "";
        }
        table.rows.push(newRow);
      }
    },

    updateTableRow: (state, action) => {
      const mode = state.currentMode;
      const { tableId, rowId, col1, col2, col3 } = action.payload;
      const table = state[mode].tables.find((t) => t.id === tableId);
      if (table) {
        const row = table.rows.find((r) => r.id === rowId);
        if (row) {
          if (col1 !== undefined) row.col1 = col1;
          if (col2 !== undefined) row.col2 = col2;
          if (col3 !== undefined && table.columnCount === 3) row.col3 = col3;
        }
      }
    },

    deleteTableRow: (state, action) => {
      const mode = state.currentMode;
      const { tableId, rowId } = action.payload;
      const table = state[mode].tables.find((t) => t.id === tableId);
      if (table) {
        table.rows = table.rows.filter((r) => r.id !== rowId);
      }
    },
    
    deleteTable: (state, action) => {
      const mode = state.currentMode;
      console.log('mode',mode)
      console.log('tac',state[mode].tables)
      state[mode].tables = state[mode].tables.filter((t) => t.id !== action.payload);
    },

    updateTableHeaders: (state, action) => {
      const mode = state.currentMode;
      const { tableId, col1, col2, col3 } = action.payload;
      const table = state[mode].tables.find((t) => t.id === tableId);
      if (table) {
        if (col1 !== undefined) table.headers.col1 = col1;
        if (col2 !== undefined) table.headers.col2 = col2;
        if (col3 !== undefined && table.columnCount === 3) table.headers.col3 = col3;
      }
    },

    // ✅ Set DB data for edit mode
    setDBDataP2: (state, action) => {
      state.edit = { ...action.payload };
    },

    // ✅ Reset specific mode
    resetPage2: (state, action) => {
      const mode = action.payload || state.currentMode;
      state[mode] = { ...modeDefaults };
    },
  },
});

// ✅ Export setMode action
export const {
  setMode,
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
  toggleInclusion,
  deleteTable,
  setDBDataP2,
  updateTableHeaders,
  resetPage2,
} = page2Slice.actions;

export default page2Slice.reducer;