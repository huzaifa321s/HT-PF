"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Box,
  CircularProgress,
  Switch,
  Typography,
} from "@mui/material";
import {
  Settings,
  ArrowBack,
  ZoomIn,
  ZoomOut,
  Save,
  Download,
  MenuOpen,
  PictureAsPdf,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import { useRouter, usePathname } from "next/navigation";

// IMPORT YOUR EDITORS
import VisualCoverEditor from "./visual-editors/VisualCoverEditor";
import VisualAboutEditor from "./visual-editors/VisualAboutEditor";
import VisualAdditionalInfoEditor from "./visual-editors/VisualAdditionalInfoEditor";
import VisualPricingEditor from "./visual-editors/VisualPricingEditor";
import VisualPaymentEditor from "./visual-editors/VisualPaymentEditor";
import VisualContactEditor from "./visual-editors/VisualContactEditor";
import EditorSidebar from "./EditorSidebar";

import { useSelector, useDispatch } from "react-redux";
import {
  setDBDataP2,
  setMode,
  toggleInclusion as togglePage2Inclusion,
} from "../utils/page2Slice";

import { pdf } from "@react-pdf/renderer";
import CombinedPdfDocument from "./CombinedPdf";

import axiosInstance from "../utils/axiosInstance";
import {
  setDBDataP3,
  setMode2,
  toggleAboutPageInclusion,
} from "../utils/page3Slice";
import {
  setDBDataPricing,
  setMode3,
  togglePricingPageInclusion,
} from "../utils/pricingReducer";
import {
  setDBTerms,
  setMode4,
  togglePaymentPageInclusion,
} from "../utils/paymentTermsPageSlice";
import { setDBData, setMode1 } from "../utils/page1Slice";
import { Provider } from "react-redux";
import { store } from "../utils/store";
import { motion, AnimatePresence } from "framer-motion";

const UnifiedPdfEditor = ({ pdfPages, mode = "doc", clientName: propClientName, date: propDate, isStudioMode = true, zoomLevel = 100 }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const [activePageId, setActivePageId] = useState("Cover Page-0");
  const [pageCounts, setPageCounts] = useState({});

  const handlePageCountChange = useCallback((name, count) => {
    setPageCounts(prev => {
      if (prev[name] === count) return prev;
      return { ...prev, [name]: count };
    });
  }, []);
  const [loading, setLoading] = useState(true);
  const [isNavigatingToEdit, setIsNavigatingToEdit] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const formDataRT = useSelector((state) => state.proposal);
  const isEditMode = mode === "edit-doc";

  // Edit mode mein DB data load karo
  useEffect(() => {
    if (isEditMode && pdfPages?.page1) dispatch(setDBData(pdfPages.page1));
    if (isEditMode && pdfPages?.page3) dispatch(setDBDataP2(pdfPages.page3));
    if (isEditMode && pdfPages?.page2) dispatch(setDBDataP3(pdfPages.page2));
    if (isEditMode && pdfPages?.pricingPage) dispatch(setDBDataPricing(pdfPages.pricingPage));
    if (isEditMode && pdfPages?.paymentTerms) dispatch(setDBTerms(pdfPages.paymentTerms));
  }, [isEditMode, pdfPages, dispatch]);

  useEffect(() => {
    if (mode === "edit-doc") {
      dispatch(setMode("edit"));
      dispatch(setMode1("edit"));
      dispatch(setMode2("edit"));
      dispatch(setMode3("edit"));
      dispatch(setMode4("edit"));
    } else {
      dispatch(setMode("create"));
      dispatch(setMode1("create"));
      dispatch(setMode2("create"));
      dispatch(setMode3("create"));
      dispatch(setMode4("create"));
    }
  }, [dispatch, mode]);

  // Redux Data
  const page1 = useSelector((s) => isEditMode ? s.page1Slice.edit : s.page1Slice.create);
  const page2 = isEditMode ? useSelector((s) => s.page3.edit) : useSelector((s) => s.page3.create);
  const page3 = useSelector((s) => isEditMode ? s.page2.edit : s.page2.create);
  const pricingPage = isEditMode ? useSelector((s) => s.pricing.edit) : useSelector((s) => s.pricing.create);
  const paymentTerms = isEditMode ? useSelector((s) => s.paymentTerms.edit) : useSelector((s) => s.paymentTerms.create);
  const contactPage = useSelector((s) => s.contact);

  const pages = useMemo(() => [
    { 
      name: "Cover Page", 
      editor: (isThumbnail = false, currentStudioMode = isStudioMode) => <VisualCoverEditor isStudioMode={currentStudioMode} />
    },
    { 
      name: "About HT", 
      editor: (isThumbnail = false, currentStudioMode = isStudioMode) => <VisualAboutEditor isStudioMode={currentStudioMode} />
    },
    { 
      name: "Additional Info", 
      editor: (isThumbnail = false, currentStudioMode = isStudioMode) => <VisualAdditionalInfoEditor isStudioMode={currentStudioMode} onPageCountChange={!isThumbnail ? (c) => handlePageCountChange("Additional Info", c) : undefined} pageIdPrefix="Additional Info" />
    },
    { 
      name: "Pricing", 
      editor: (isThumbnail = false, currentStudioMode = isStudioMode) => <VisualPricingEditor isStudioMode={currentStudioMode} onPageCountChange={!isThumbnail ? (c) => handlePageCountChange("Pricing", c) : undefined} pageIdPrefix="Pricing" />
    },
    { 
      name: "Payment Terms", 
      editor: (isThumbnail = false, currentStudioMode = isStudioMode) => <VisualPaymentEditor isStudioMode={currentStudioMode} onPageCountChange={!isThumbnail ? (c) => handlePageCountChange("Payment Terms", c) : undefined} pageIdPrefix="Payment Terms" />
    },
    { 
      name: "Contact", 
      editor: (isThumbnail = false, currentStudioMode = isStudioMode) => <VisualContactEditor isStudioMode={currentStudioMode} />
    },
  ], [isStudioMode, handlePageCountChange]);

  const visiblePages = useMemo(() => {
    return pages.filter((page, index) => {
      if (index === 1 && page2?.includeInPdf === false) return false;
      if (page.name === "Additional Info" && page3?.includeInPdf === false) return false;
      if (page.name === "Pricing" && pricingPage?.includeInPdf === false) return false;
      if (page.name === "Payment Terms" && paymentTerms?.includeInPdf === false) return false;
      return true;
    });
  }, [pages, page2?.includeInPdf, page3?.includeInPdf, pricingPage?.includeInPdf, paymentTerms?.includeInPdf]);



  const scrollRef = useRef(null);

  const visibilityMap = useRef({});
  const isAutoScrolling = useRef(false);
  const activePageIdRef = useRef(activePageId);
  const debounceTimer = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      let maxRatio = 0;
      let mostVisibleId = null;

      entries.forEach(entry => {
        const id = entry.target.id;
        if (id && id.startsWith('page-')) {
          visibilityMap.current[id] = entry.intersectionRatio;
        }
      });

      if (isAutoScrolling.current) return;

      Object.entries(visibilityMap.current).forEach(([id, ratio]) => {
        if (ratio > maxRatio) {
          maxRatio = ratio;
          mostVisibleId = id.replace('page-', '');
        }
      });

      if (mostVisibleId && maxRatio > 0.05 && mostVisibleId !== activePageIdRef.current) {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
          setActivePageId(mostVisibleId);
          activePageIdRef.current = mostVisibleId;
        }, 150);
      }
    }, {
      root: scrollRef.current,
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    });

    visiblePages.forEach(p => {
      const count = pageCounts[p.name] || 1;
      for (let i = 0; i < count; i++) {
        const el = document.getElementById(`page-${p.name}-${i}`);
        if (el) observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
      visibilityMap.current = {};
    };
  }, [visiblePages, pageCounts]);

  const scrollToSlide = (uniqueId) => {
    setActivePageId(uniqueId);
    activePageIdRef.current = uniqueId;
    isAutoScrolling.current = true;
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    const el = document.getElementById(`page-${uniqueId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Re-enable observer after smooth scroll animation completes
    setTimeout(() => {
      isAutoScrolling.current = false;
    }, 800);
  };

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  const pageSettings = [
    { name: "About HT", state: page2?.includeInPdf, action: toggleAboutPageInclusion },
    { name: "Additional Info", state: page3?.includeInPdf, action: togglePage2Inclusion },
    { name: "Pricing", state: pricingPage?.includeInPdf, action: togglePricingPageInclusion },
    { name: "Payment Terms", state: paymentTerms?.includeInPdf, action: togglePaymentPageInclusion },
  ];

  return (
    <div className="h-full flex-1 bg-[#0a0a0a] flex flex-col overflow-hidden font-sans">


      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Navigator */}
        <EditorSidebar 
          pages={pages}
          visiblePages={visiblePages}
          activePageId={activePageId}
          pageCounts={pageCounts}
          scrollToSlide={scrollToSlide}
          pageSettings={pageSettings}
          dispatch={dispatch}
        />

        {/* Main Canvas Area */}
        <div className="flex-1 relative overflow-hidden bg-[#0a0a0a] flex flex-col">
          
          {/* Floating Scroll Buttons on the left side of canvas */}
          <div className="absolute left-6 bottom-8 z-50 flex flex-col gap-3">
            <button
              onClick={scrollToTop}
              className="w-6 h-6 flex items-center justify-center bg-[#141414] text-[#f3a833] rounded-full shadow hover:bg-[#f3a833] hover:text-[#0a0a0a] hover:scale-110 transition-all border border-[#f3a833]/20 cursor-pointer"
              title="Go to Top"
            >
              <ArrowUpward className="w-3 h-3" />
            </button>
            <button
              onClick={scrollToBottom}
              className="w-6 h-6 flex items-center justify-center bg-[#141414] text-[#f3a833] rounded-full shadow hover:bg-[#f3a833] hover:text-[#0a0a0a] hover:scale-110 transition-all border border-[#f3a833]/20 cursor-pointer"
              title="Go to Bottom"
            >
              <ArrowDownward className="w-3 h-3" />
            </button>
          </div>

          <div
            id="canvas-area"
            ref={scrollRef}
            className="flex-1 overflow-y-auto overflow-x-hidden p-8 flex flex-col items-center custom-scrollbar"
            style={{
              scrollBehavior: 'smooth'
            }}
          >
            <div 
              id="pdf-export-container"
              style={{ 
                transform: `scale(${zoomLevel / 100})`, 
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out'
              }}
              className={`flex flex-col w-full max-w-[800px] ${isStudioMode ? "gap-12" : "gap-0"}`}
            >
              <AnimatePresence>
                {visiblePages.map((page, index) => {
                  const isClonedPageType = ["Additional Info", "Pricing", "Payment Terms"].includes(page.name);
                  return (
                    <motion.div
                      id={!isClonedPageType ? `page-${page.name}-0` : undefined}
                      key={page.name}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="w-full flex justify-center relative group"
                    >
                    {/* Page Number / Label */}
                    <div className="absolute -left-12 top-0 bottom-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-slate-600 font-bold uppercase tracking-widest rotate-[-90deg] whitespace-nowrap text-xs">
                        {page.name}
                      </span>
                    </div>

                    {page.editor ? page.editor() : null}
                  </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UnifiedPdfEditor;
