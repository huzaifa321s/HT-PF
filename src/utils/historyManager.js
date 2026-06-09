// src/utils/historyManager.js
import { debounce } from "lodash";

class HistoryManager {
  constructor() {
    this.past = [];
    this.future = [];
    this.present = null;
    this.isRestoring = false;
    
    // Configurable limit to prevent memory overflow
    this.maxHistory = 50;
  }

  // Initialize the history with the first state
  init(initialState) {
    if (!this.present) {
      this.present = JSON.stringify(initialState);
    }
  }

  // Push a new state snapshot to the past
  push(newState) {
    // If we are currently restoring from an undo/redo, don't record the state change as a new user action
    if (this.isRestoring) {
      this.isRestoring = false;
      return;
    }

    const stateStr = JSON.stringify(newState);
    
    // Ignore if the state hasn't actually changed
    if (this.present === stateStr) return;

    if (this.present) {
      this.past.push(this.present);
      // Enforce history limit
      if (this.past.length > this.maxHistory) {
        this.past.shift();
      }
    }
    
    this.present = stateStr;
    // Any new action clears the future (redo) stack
    this.future = [];
  }

  canUndo() {
    return this.past.length > 0;
  }

  canRedo() {
    return this.future.length > 0;
  }

  undo() {
    if (!this.canUndo()) return null;

    // Move current present to future
    if (this.present) {
      this.future.push(this.present);
    }
    
    // Pop from past and make it present
    const previousState = this.past.pop();
    this.present = previousState;
    this.isRestoring = true; // Set flag so the middleware ignores the upcoming RESTORE action
    
    return JSON.parse(previousState);
  }

  redo() {
    if (!this.canRedo()) return null;

    // Move current present to past
    if (this.present) {
      this.past.push(this.present);
    }
    
    // Pop from future and make it present
    const nextState = this.future.pop();
    this.present = nextState;
    this.isRestoring = true; // Set flag so the middleware ignores the upcoming RESTORE action

    return JSON.parse(nextState);
  }
  
  clear() {
    this.past = [];
    this.future = [];
    this.present = null;
    this.isRestoring = false;
  }
}

export const historyManager = new HistoryManager();

// Debounced version of push to avoid recording every single keystroke
export const debouncedPushToHistory = debounce((state) => {
  // Extract only the PDF visual editor slices we want to track
  const trackableState = {
    page1Slice: state.page1Slice,
    page2: state.page2,
    page3: state.page3,
    pricing: state.pricing,
    paymentTerms: state.paymentTerms,
  };
  historyManager.push(trackableState);
}, 1000); // 1-second debounce
