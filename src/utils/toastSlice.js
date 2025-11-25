// toastSlice.js
import { createSlice } from '@reduxjs/toolkit';

const toastSlice = createSlice({
  name: 'toast',
  initialState: {
    open: false,
    message: '',
    severity: 'success', // 'success', 'error', 'warning', 'info',
    duration:3000,
    loading:false
  },
  reducers: {
    showToast: (state, action) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity || 'success';
      state.duration = action.payload.duration || 3000
      state.loading = action.payload.loading || false
    },
    hideToast: (state) => {
      state.open = false;
      state.message = '';
      state.loading = false;
      
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;