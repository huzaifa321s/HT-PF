// src/context/RecordingContext.js
import React, { createContext } from 'react';
import { useDispatch } from 'react-redux';
import { showToast } from '../utils/toastSlice'; // Assuming you have this

export const RecordingContext = createContext();

export const RecordingProvider = ({
  children,
  isRecording,
  setIsRecording,
  isPaused,
  setIsPaused,
  pauseTime,
  setPauseTime,
  pauseRecording,
  socketRef,
}) => {

  return (
    <RecordingContext.Provider
      value={{
        pauseRecording,
        isRecording,
        setIsRecording,
        isPaused,
        setIsPaused,
        pauseTime,
        setPauseTime,
        socketRef,
      }}
    >
      {children}
    </RecordingContext.Provider>
  );
};