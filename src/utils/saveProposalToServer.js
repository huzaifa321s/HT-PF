// src/utils/saveProposalToServer.js

import axiosInstance from "./axiosInstance";
import { store } from "./store";


export const saveProposalToServer = async () => {
  try {
    // Get Full Persisted Redux State
    const state = store.getState();

    // Only send required slices
    const payload = {
      businessInfo: state.businessInfo,
      form: state.form,
      pages: state.pages,
      customContent: state.customContent,
      blankContent: state.blankContent,
      pricing: state.pricing,
      paymentTerms: state.paymentTerms,
    };

    // Token
    const token = sessionStorage.getItem("token");
console.log('==-token',token)
    const res = await axiosInstance.post(
      "/api/proposals/save",
      payload,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log("Saved Successfully:", res.data);
    return res.data;

  } catch (err) {
    console.error("Save Failed:", err);
    throw err;
  }
};
