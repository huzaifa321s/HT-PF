// src/store.js

import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storageSession from "redux-persist/lib/storage/session";
import { combineReducers } from "redux";
import toastReducer from './toastSlice';
import recordingToastReducer from './recordingToastSlice';
import appReducer from './appSlice';
import businessInfoReducer from "./businessInfoSlice";
import transcriptReducer from "./transcriptSlice";
import formReducer from "./formDataSlice";
import liveTranscriptionReducer from "./liveTranscriptionSlice";
import page1SliceReducer from "./page1Slice";
import page2Reducer from "./page2Slice";
import page3Reducer from "./page3Slice";
import pricingReducer from "./pricingReducer";
import paymentTermsReducer from './paymentTermsPageSlice';
import blankContentReducer from './blankPageSlice';
import customContentReducer from './customContentSlice';
import pagesReducer from './pagesSlice';
import axiosInstance from "./axiosInstance";
import proposalReducer from './proposalSlice';
import pdfNavigationReducer from "./pdfNavigationSlice";

// ⬇️ Multi-tab safe key
const user = JSON.parse(sessionStorage.getItem("user") || "{}");
const tabId = sessionStorage.getItem("tabId") || crypto.randomUUID();
sessionStorage.setItem("tabId", tabId);

const persistKey = user.id ? `root_${user.id}_${tabId}` : `root_guest_${tabId}`;

const persistConfig = {
  key: persistKey,
  storage: storageSession,
  whitelist: [
    "businessInfo",
    "form",
    "pages",
    "pricing",
    "paymentTerms",
    "blankContent",
    "customContent",
    "page1Slice",
    "page2",
    "page3",
    "proposal"
  ],
};

const rootReducer = combineReducers({
  toast: toastReducer,
  recordingToast: recordingToastReducer,
  app: appReducer,
  businessInfo: businessInfoReducer,
  transcript: transcriptReducer,
  form: formReducer,
  liveTranscription: liveTranscriptionReducer,
  page1Slice: page1SliceReducer,
  page2: page2Reducer,
  page3: page3Reducer,
  pricing: pricingReducer,
  paymentTerms: paymentTermsReducer,
  blankContent: blankContentReducer,
  customContent: customContentReducer,
  pages: pagesReducer,
  proposal: proposalReducer,
  pdfNavigation: pdfNavigationReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);

// ⬇️ Helper to get full Redux state
export const getReduxState = () => store.getState();

// ⬇️ Load store from backend per user
export const loadStoreFromBackend = async (userId, dispatch) => {
  try {
    const res = await axiosInstance.get(`/api/proposals/get/${userId}`, { skipLoader: true });
    const data = res.data;
    if (!data) return;

    if (data.businessInfo) dispatch({ type: 'businessInfo/setBusinessInfo', payload: data.businessInfo });
    if (data.form) dispatch({ type: 'form/setForm', payload: data.form });
    if (data.pages) dispatch({ type: 'pages/setPages', payload: data.pages });
    if (data.page1Slice) dispatch({ type: 'page1Slice/setPage1', payload: data.page1Slice });
    console.log('data.page1slice', data.page1Slice)
    if (data.page2) dispatch({ type: 'page2/setPage2', payload: data.page2 });
    if (data.page3) dispatch({ type: 'page3/setPage3', payload: data.page3 });
    if (data.pricing) dispatch({ type: 'pricing/setPricing', payload: data.pricing });
    if (data.paymentTerms) dispatch({ type: 'paymentTerms/setPaymentTerms', payload: data.paymentTerms });
    if (data.blankContent) dispatch({ type: 'blankContent/setBlankContent', payload: data.blankContent });
    if (data.customContent) dispatch({ type: 'customContent/setCustomContent', payload: data.customContent });
    if (data.proposal) dispatch({ type: 'proposal/setProposal', payload: data.blankContent });
    console.log("Redux store loaded from backend ✔");
  } catch (err) {
    console.error("Failed to load store from backend", err);
  }
};

// ⬇️ Save store to backend
export const saveStoreToBackend = async (userId) => {
  try {
    const reduxStore = store.getState();
    const payload = {
      businessInfo: reduxStore.businessInfo,
      transcript: reduxStore.transcript,
      form: reduxStore.form,
      proposal: reduxStore.proposal,
      page1Slice: reduxStore.page1Slice,
      page2: reduxStore.page2,
      page3: reduxStore.page3,
      pricing: reduxStore.pricing,
      paymentTerms: reduxStore.paymentTerms,
      blankContent: reduxStore.blankContent,
      customContent: reduxStore.customContent,
      pages: reduxStore.pages
    };
    console.log('payload', payload)

    await axiosInstance.post(`/api/proposals/save`, { userId, data: payload }, { skipLoader: true });

    console.log("Redux slices synced with backend ✔");
  } catch (err) {
    console.error("Failed to sync store to backend", err);
  }
};
