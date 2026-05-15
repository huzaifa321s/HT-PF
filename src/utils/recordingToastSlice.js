// src/utils/recordingToastSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { showToast } from './toastSlice';

const recordingToastSlice = createSlice({
  name: 'recordingToast',
  initialState: {
    open: false,
    transcription: '',
    transcriptionHistory: [],
    status: 'Listening...',
    isRecording: false,
    isPaused: false,
    isMinimized: false,
    pauseTime: null,
    
  },
  reducers: {
    showRecordingToast: (state, action) => {
      state.open = true;
      state.transcription = action.payload.transcription || '';
      state.status = action.payload.status || 'Listening...';
      state.isRecording = true;
      state.isPaused = false;
      state.isMinimized = false;
    },
    updateTranscription: (state, action) => {
      if (state.transcription.text) {
        state.transcriptionHistory.push(state.transcription.text);
      }
      state.transcription = action.payload;
    },
    updateStatus: (state, action) => {
      state.status = action.payload;
    },
    pauseRecordingRT: (state) => {
      if (!state.isRecording || state.isPaused) return;
      state.isPaused = true;
      state.status = 'Paused';
      state.pauseTime = Date.now();
    },
    resumeRecordingRT: (state) => {
      state.isPaused = false;
      state.status = 'Listening...';
    },
    stopRecordingRT: (state) => {
      state.open = false;
      state.transcription = '';
      state.transcriptionHistory = [];
      state.status = 'Listening...';
      state.isRecording = false;
      state.isPaused = false;
      state.isMinimized = false;
      state.pauseTime = null;
    },
    toggleMinimize: (state) => {
      state.isMinimized = !state.isMinimized;
    },
  },
});

export const {
  showRecordingToast,
  updateTranscription,
  updateStatus,
  pauseRecordingRT,
  resumeRecordingRT,
  stopRecordingRT,
  toggleMinimize,
} = recordingToastSlice.actions;

// Thunk to handle pauseRecording logic
export const pauseRecordingWithToast = (pauseRecording, socketRef) => (dispatch, getState) => {
  const { recordingToast } = getState();
  if (!recordingToast.isRecording || recordingToast.isPaused) return;
  dispatch(pauseRecordingRT());
  console.log("hhhhhhhhhhhhh")
  if (pauseRecording) {
    pauseRecording(); // Call App.jsx's pauseRecording
  }
  if (socketRef?.current) {
    socketRef.current.emit('pause_recording'); // Emit socket event
  }
  dispatch(showToast({ message: '⏸️ Recording paused', severity: 'warning' }));
};

export default recordingToastSlice.reducer;