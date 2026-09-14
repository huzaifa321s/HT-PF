// src/hooks/useBitrixPrefill.js
// Detects ?bitrixDealId & ?bitrixBrief URL params when the agent opens the proposal maker
// from a Bitrix24 link, then calls the backend to:
//  1. Run SambaNova AI on the brief
//  2. Pre-fill the proposal editor (proposalRT in MongoDB)
// Returns { isPrefilling, prefillDone, prefillError, dealInfo }

"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axiosInstance from "../utils/axiosInstance";

export const useBitrixPrefill = ({ userId, reset, getValues, dispatch, showToast }) => {
  const searchParams = useSearchParams();

  const [isPrefilling, setIsPrefilling] = useState(false);
  const [prefillDone, setPrefillDone]   = useState(false);
  const [prefillError, setPrefillError] = useState(null);
  const [dealInfo, setDealInfo]         = useState(null);

  useEffect(() => {
    // Read URL params set by the Bitrix24 link
    const bitrixDealId = searchParams.get("bitrixDealId");
    const bitrixBrief  = searchParams.get("bitrixBrief");   // URL-encoded brief text
    const clientName   = searchParams.get("clientName")  || "";
    const clientEmail  = searchParams.get("clientEmail") || "";
    const brandName    = searchParams.get("brandName")   || "";
    const projectTitle = searchParams.get("projectTitle")|| "";

    // Only run if we have a brief and userId is ready
    if (!bitrixBrief || !userId) return;

    const decodedBrief = decodeURIComponent(bitrixBrief);

    const runPrefill = async () => {
      setIsPrefilling(true);
      setPrefillError(null);

      try {
        if (dispatch && showToast) {
          dispatch(showToast({
            message: "⏳ Bitrix24 brief detected — generating proposal with AI...",
            severity: "info",
          }));
        }

        // Call backend: AI generates content and saves to proposalRT
        const res = await axiosInstance.post("/api/bitrix/generate-from-brief", {
          brief:        decodedBrief,
          userId,
          dealId:       bitrixDealId || null,
          clientName,
          clientEmail,
          brandName,
          projectTitle,
          companyName:  "Humantek",
        });

        if (res.data?.success) {
          // Pre-fill the react-hook-form fields so the agent sees them immediately
          if (reset && getValues) {
            const prefilled = {};
            if (clientName)   prefilled.clientName   = clientName;
            if (clientEmail)  prefilled.clientEmail  = clientEmail;
            if (brandName)    prefilled.brandName    = brandName;
            if (projectTitle) prefilled.projectTitle = projectTitle;
            if (decodedBrief) prefilled.projectBrief = decodedBrief;

            if (Object.keys(prefilled).length > 0) {
              reset({ ...getValues(), ...prefilled });
            }
          }

          setDealInfo({ bitrixDealId, clientName, clientEmail, brandName, projectTitle });
          setPrefillDone(true);

          if (dispatch && showToast) {
            dispatch(showToast({
              message: `✅ Proposal pre-filled from Bitrix24 deal! (${res.data.sectionsCount} sections generated)`,
              severity: "success",
            }));
          }

          // Clean up the URL params so a page refresh doesn't re-trigger
          try {
            const url = new URL(window.location.href);
            url.searchParams.delete("bitrixDealId");
            url.searchParams.delete("bitrixBrief");
            url.searchParams.delete("clientName");
            url.searchParams.delete("clientEmail");
            url.searchParams.delete("brandName");
            url.searchParams.delete("projectTitle");
            window.history.replaceState({}, "", url.toString());
          } catch (_) {}

        } else {
          throw new Error(res.data?.error || "Prefill failed");
        }
      } catch (err) {
        console.error("[Bitrix Prefill] Error:", err);
        const msg = err.response?.data?.message || err.message || "Failed to generate from Bitrix24 brief";
        setPrefillError(msg);

        if (dispatch && showToast) {
          dispatch(showToast({
            message: `❌ Bitrix AI prefill failed: ${msg}`,
            severity: "error",
          }));
        }
      } finally {
        setIsPrefilling(false);
      }
    };

    runPrefill();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // Re-run only when userId becomes available

  return { isPrefilling, prefillDone, prefillError, dealInfo };
};
