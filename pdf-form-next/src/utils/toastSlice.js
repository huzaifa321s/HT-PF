// toastSlice.js
import { createSlice } from '@reduxjs/toolkit';

const toastSlice = createSlice({
  name: 'toast',
  initialState: {
    open: false,
    message: '',
    severity: 'success', // 'success', 'error', 'warning', 'info',
    duration:3000,
    loading:false,
    undoAction: null
  },
  reducers: {
    showToast: (state, action) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity || 'success';
      state.undoAction = action.payload.undoAction || null;
      state.duration = action.payload.duration || (state.undoAction ? 6000 : 3000);
      state.loading = action.payload.loading || false;
    },
    hideToast: (state) => {
      state.open = false;
      state.message = '';
      state.loading = false;
      state.undoAction = null;
    },
    clearUndoAction: (state) => {
      state.undoAction = null;
    }
  },
});

export const { showToast, hideToast, clearUndoAction } = toastSlice.actions;
export default toastSlice.reducer;