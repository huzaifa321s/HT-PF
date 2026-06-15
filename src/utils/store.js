// src/utils/store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { combineReducers } from "redux";
import { debouncedPushToHistory, historyManager } from "./historyManager";
import toastReducer from "./toastSlice";
import page1SliceReducer from "./page1Slice";
import page2Reducer from "./page2Slice";
import page3Reducer from "./page3Slice";
import pricingReducer from "./pricingReducer";
import paymentTermsReducer from "./paymentTermsPageSlice";
import axiosInstance from "./axiosInstance";
import proposalReducer from "./proposalSlice";
import pdfNavigationReducer from "./pdfNavigationSlice";

const mainReducer = combineReducers({
  toast: toastReducer,
  page1Slice: page1SliceReducer,
  page2: page2Reducer,
  page3: page3Reducer,
  pricing: pricingReducer,
  paymentTerms: paymentTermsReducer,
  proposal: proposalReducer,
  pdfNavigation: pdfNavigationReducer,
});

// Higher-order root reducer to handle global RESTORE actions
const rootReducer = (state, action) => {
  if (action.type === "RESTORE_SNAPSHOT") {
    // Merge the restored PDF slice states over the current state
    return mainReducer({
      ...state,
      ...action.payload
    }, action);
  }
  return mainReducer(state, action);
};

// Middleware to capture state changes and push to history
const historyMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Ignore specific actions that shouldn't trigger history saves
  const ignoreActions = ["RESTORE_SNAPSHOT", "persist/PERSIST", "persist/REHYDRATE", "pdfNavigation/", "toast/"];
  const shouldIgnore = ignoreActions.some(prefix => action.type.startsWith(prefix));
  
  if (!shouldIgnore && !historyManager.isRestoring) {
    debouncedPushToHistory(store.getState());
  }
  
  return result;
};

// Fallback UUID v4 generator for non-secure contexts (HTTP) or older browsers/webviews
export const generateUUID = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// makeStore is called once per client - we build it lazily
// so that sessionStorage is only accessed in the browser
const makeStore = () => {
  // SSR-safe: only access sessionStorage on client
  let persistConfig;

  if (typeof window !== "undefined") {
    const storageSession =
      require("redux-persist/lib/storage/session").default;

    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const tabId =
      sessionStorage.getItem("tabId") || generateUUID();
    sessionStorage.setItem("tabId", tabId);
    const persistKey = user.id
      ? `root_${user.id}_${tabId}`
      : `root_guest_${tabId}`;

    persistConfig = {
      key: persistKey,
      storage: storageSession,
      whitelist: [
        "pricing",
        "paymentTerms",
        "page1Slice",
        "page2",
        "page3",
        "proposal",
      ],
    };

    const persistedReducer = persistReducer(persistConfig, rootReducer);

    const store = configureStore({
      reducer: persistedReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }).concat(historyMiddleware),
    });

    store.persistor = persistStore(store);
    return store;
  }

  // Server side: no persistence
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(historyMiddleware),
  });
};

export const store = makeStore();
export const persistor = store.persistor;

// Helper to get full Redux state
export const getReduxState = () => store.getState();

// Load store from backend per user
export const loadStoreFromBackend = async (userId, dispatch) => {
  try {
    const res = await axiosInstance.get(`/api/proposals/get/${userId}`, {
      skipLoader: true,
    });
    const data = res.data;
    if (!data) return;

    if (data.page1Slice)
      dispatch({ type: "page1Slice/setPage1", payload: data.page1Slice });
    if (data.page2)
      dispatch({ type: "page2/setPage2", payload: data.page2 });
    if (data.page3)
      dispatch({ type: "page3/setPage3", payload: data.page3 });
    if (data.pricing)
      dispatch({ type: "pricing/setPricing", payload: data.pricing });
    if (data.paymentTerms)
      dispatch({ type: "paymentTerms/setPaymentTerms", payload: data.paymentTerms });
    if (data.proposal)
      dispatch({ type: "proposal/setProposal", payload: data.proposal });

    console.log("Redux store loaded from backend ✔");
  } catch (err) {
    console.error("Failed to load store from backend", err);
  }
};

// Save store to backend
export const saveStoreToBackend = async (userId) => {
  try {
    const reduxStore = store.getState();
    const payload = {
      proposal: reduxStore.proposal,
      page1Slice: reduxStore.page1Slice,
      page2: reduxStore.page2,
      page3: reduxStore.page3,
      pricing: reduxStore.pricing,
      paymentTerms: reduxStore.paymentTerms,
    };

    await axiosInstance.post(
      `/api/proposals/save`,
      { userId, data: payload },
      { skipLoader: true }
    );

    console.log("Redux slices synced with backend ✔");
  } catch (err) {
    console.error("Failed to sync store to backend", err);
  }
};
