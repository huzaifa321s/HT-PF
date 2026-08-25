"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Box,
  CircularProgress,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Button,
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
import VisualImagePage from "./visual-editors/VisualImagePage";
import EditorSidebar from "./EditorSidebar";
import { ARTBOARD_1, ARTBOARD_2, ARTBOARD_3, ARTBOARD_4, ARTBOARD_5 } from "../utils/pdfImageAssets";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
  const [visibilityDialogOpen, setVisibilityDialogOpen] = useState(false);

  const formDataRT = useSelector((state) => state.proposal);
  const isEditMode = mode === "edit-doc";

  // Edit mode mein DB data load karo
  useEffect(() => {
    // If there are unsaved edits (e.g. user just completed Edit/Create form and redirected here),
    // we should NOT overwrite the Redux slices with the old DB data.
    if (formDataRT?.isUnsavedEdit) {
      return;
    }
    if (isEditMode && pdfPages?.page1) dispatch(setDBData(pdfPages.page1));
    if (isEditMode && pdfPages?.page3) dispatch(setDBDataP2(pdfPages.page3));
    if (isEditMode && pdfPages?.page2) dispatch(setDBDataP3(pdfPages.page2));
    if (isEditMode && pdfPages?.pricingPage) dispatch(setDBDataPricing(pdfPages.pricingPage));
    if (isEditMode && pdfPages?.paymentTerms) dispatch(setDBTerms(pdfPages.paymentTerms));
  }, [isEditMode, pdfPages, dispatch, formDataRT?.isUnsavedEdit]);

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
      cycle: 1171,
      editor: (isThumbnail = false, currentStudioMode = isStudioMode) => <VisualCoverEditor isStudioMode={currentStudioMode} />
    },
    { 
      name: "About HT", 
      cycle: 1171,
      editor: (isThumbnail = false, currentStudioMode = isStudioMode) => <VisualAboutEditor isStudioMode={currentStudioMode} />
    },
    {
      name: "Artboard 1",
      cycle: 1171,
      editor: () => <VisualImagePage src={ARTBOARD_1} alt="Artboard 1" />
    },
    {
      name: "Artboard 2",
      cycle: 1171,
      editor: () => <VisualImagePage src={ARTBOARD_2} alt="Artboard 2" />
    },
    {
      name: "Artboard 3",
      cycle: 1171,
      editor: () => <VisualImagePage src={ARTBOARD_3} alt="Artboard 3" />
    },
    {
      name: "Artboard 4",
      cycle: 1171,
      editor: () => <VisualImagePage src={ARTBOARD_4} alt="Artboard 4" />
    },
    {
      name: "Artboard 5",
      cycle: 1171,
      editor: () => <VisualImagePage src={ARTBOARD_5} alt="Artboard 5" />
    },
    { 
      name: "Additional Info", 
      cycle: 1171,
      editor: (isThumbnail = false, currentStudioMode = isStudioMode) => <VisualAdditionalInfoEditor isStudioMode={currentStudioMode} isThumbnail={isThumbnail} onPageCountChange={!isThumbnail ? (c) => handlePageCountChange("Additional Info", c) : undefined} pageIdPrefix="Additional Info" />
    },
    { 
      name: "Pricing", 
      cycle: 1171,
      editor: (isThumbnail = false, currentStudioMode = isStudioMode) => <VisualPricingEditor isStudioMode={currentStudioMode} isThumbnail={isThumbnail} onPageCountChange={!isThumbnail ? (c) => handlePageCountChange("Pricing", c) : undefined} pageIdPrefix="Pricing" />
    },
    { 
      name: "Payment Terms", 
      cycle: 1151,
      editor: (isThumbnail = false, currentStudioMode = isStudioMode) => <VisualPaymentEditor isStudioMode={currentStudioMode} isThumbnail={isThumbnail} onPageCountChange={!isThumbnail ? (c) => handlePageCountChange("Payment Terms", c) : undefined} pageIdPrefix="Payment Terms" />
    },
    { 
      name: "Contact", 
      cycle: 1171,
      editor: (isThumbnail = false, currentStudioMode = isStudioMode) => <VisualContactEditor isStudioMode={currentStudioMode} />
    },
  ], [isStudioMode, handlePageCountChange]);

  const visiblePages = useMemo(() => {
    return pages.filter((page) => {
      if (page.name === "About HT" && page2?.includeInPdf === false) return false;
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

    if (isMobile) {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    } else {
      const el = document.getElementById(`page-${uniqueId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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

  const mobileTabPages = useMemo(() => {
    const list = [];
    pages.forEach((page) => {
      const isVisible = visiblePages.some((vp) => vp.name === page.name);
      if (!isVisible) return;
      const count = pageCounts[page.name] || 1;
      for (let i = 0; i < count; i++) {
        const uniqueId = `${page.name}-${i}`;
        list.push({
          id: uniqueId,
          label: count > 1 ? `${page.name} (${i + 1})` : page.name,
        });
      }
    });
    return list;
  }, [pages, visiblePages, pageCounts]);

  const activePageIndex = useMemo(() => {
    const idx = mobileTabPages.findIndex((p) => p.id === activePageId);
    return idx !== -1 ? idx : 0;
  }, [mobileTabPages, activePageId]);

  const activeTabPagesCount = useMemo(() => {
    if (!isMobile) return 1;
    const activePageName = activePageId.split("-")[0];
    const page = pages.find((p) => p.name === activePageName);
    if (!page) return 1;
    return pageCounts[page.name] || 1;
  }, [pages, activePageId, pageCounts, isMobile]);

  return (
    <div className="h-full flex-1 bg-[#0a0a0a] flex flex-col overflow-hidden font-sans relative">


      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Navigator */}
        {!isMobile && (
          <EditorSidebar 
            pages={pages}
            visiblePages={visiblePages}
            activePageId={activePageId}
            pageCounts={pageCounts}
            scrollToSlide={scrollToSlide}
            pageSettings={pageSettings}
            dispatch={dispatch}
          />
        )}

        {/* Main Canvas Area */}
        <div className="flex-1 relative overflow-hidden bg-[#0a0a0a] flex flex-col">
          
          {/* Floating Scroll Buttons on the left side of canvas */}
          {(!isMobile || !isStudioMode) && (
            <div className={`absolute z-50 flex flex-col gap-3 ${isMobile ? "left-4 bottom-20" : "left-6 bottom-8"}`}>
              <button
                onClick={scrollToTop}
                className={`${isMobile ? "w-5 h-5" : "w-6 h-6"} flex items-center justify-center bg-[#141414] text-[#f3a833] rounded-[8px] shadow hover:bg-[#f3a833] hover:text-[#0a0a0a] hover:scale-110 transition-all border border-[#f3a833]/20 cursor-pointer`}
                title="Go to Top"
              >
                <ArrowUpward className={isMobile ? "w-2.5 h-2.5" : "w-3 h-3"} />
              </button>
              <button
                onClick={scrollToBottom}
                className={`${isMobile ? "w-5 h-5" : "w-6 h-6"} flex items-center justify-center bg-[#141414] text-[#f3a833] rounded-[8px] shadow hover:bg-[#f3a833] hover:text-[#0a0a0a] hover:scale-110 transition-all border border-[#f3a833]/20 cursor-pointer`}
                title="Go to Bottom"
              >
                <ArrowDownward className={isMobile ? "w-2.5 h-2.5" : "w-3 h-3"} />
              </button>
            </div>
          )}

          <div
            id="canvas-area"
            ref={scrollRef}
            className={`flex-1 overflow-y-auto overflow-x-hidden ${isMobile ? "p-4" : "p-8"} flex flex-col items-center custom-scrollbar`}
            style={{
              scrollBehavior: 'smooth'
            }}
          >
            <Box
              sx={(isMobile && isStudioMode) ? {
                width: `${800 * (zoomLevel / 100)}px`,
                height: `${(activeTabPagesCount * 1131 + (activeTabPagesCount - 1) * 48 + 120) * (zoomLevel / 100)}px`,
                position: "relative",
                display: "flex",
                justifyContent: "center",
                margin: "auto",
              } : {
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div 
                id="pdf-export-container"
                style={{ 
                  transform: `scale(${zoomLevel / 100})`, 
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out',
                  width: "800px",
                  minWidth: "800px",
                }}
              className={`flex flex-col ${isStudioMode ? "gap-10" : "gap-0"}`}
            >
              <AnimatePresence>
                {visiblePages.map((page, index) => {
                  const isClonedPageType = ["Additional Info", "Pricing", "Payment Terms"].includes(page.name);
                  const activePageName = activePageId.split("-")[0];
                  const isPageHiddenOnMobile = isMobile && isStudioMode && page.name !== activePageName;
                  return (
                    <motion.div
                      id={!isClonedPageType ? `page-${page.name}-0` : undefined}
                      key={page.name}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className={`w-full flex justify-center relative group pdf-page-container ${isPageHiddenOnMobile ? "hidden" : ""}`}
                      style={{ pageBreakInside: "avoid", pageBreakAfter: "auto" }}
                    >
                    {/* Page Number / Label */}
                    {!isMobile && (
                      <div className="absolute -left-12 top-0 bottom-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-slate-600 font-bold uppercase tracking-widest rotate-[-90deg] whitespace-nowrap text-xs">
                          {page.name}
                        </span>
                      </div>
                    )}

                    {page.editor ? page.editor() : null}
                  </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </Box>
          {isMobile && <Box sx={{ height: 80, flexShrink: 0 }} />}
        </div>
        </div>

      </div>

      {/* Bottom Tabs Navigation for Mobile View */}
      {isMobile && isStudioMode && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: "rgba(10, 10, 10, 0.95)",
            borderTop: "1px solid rgba(243, 168, 51, 0.2)",
            zIndex: 1000,
            backdropFilter: "blur(20px)",
            boxShadow: "0 -5px 25px rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            px: 1,
          }}
        >
          <Tooltip title="Page Visibility" arrow>
            <IconButton
              onClick={() => setVisibilityDialogOpen(true)}
              sx={{
                color: "#f3a833",
                bgcolor: "rgba(243, 168, 51, 0.05)",
                borderRadius: "10px",
                p: 1.2,
                mr: 1,
                border: "1px solid rgba(243, 168, 51, 0.2)",
                "&:hover": {
                  bgcolor: "rgba(243, 168, 51, 0.1)",
                }
              }}
            >
              <Settings className="w-5 h-5" />
            </IconButton>
          </Tooltip>

          <Tabs
            value={activePageIndex}
            onChange={(e, newIdx) => {
              const targetPage = mobileTabPages[newIdx];
              if (targetPage) {
                scrollToSlide(targetPage.id);
              }
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              flex: 1,
              minWidth: 0,
              "& .MuiTab-root": {
                color: "#94a3b8",
                textTransform: "none",
                fontSize: "0.8rem",
                fontWeight: 700,
                py: 1.5,
                minWidth: 80,
                minHeight: 48,
              },
              "& .Mui-selected": {
                color: "#f3a833 !important",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#f3a833",
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            {mobileTabPages.map((tab, idx) => (
              <Tab key={tab.id} label={tab.label} />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Page Visibility Dialog for Mobile View */}
      {isMobile && isStudioMode && (
        <Dialog
          open={visibilityDialogOpen}
          onClose={() => setVisibilityDialogOpen(false)}
          PaperProps={{
            sx: {
              bgcolor: "#111",
              border: "1px solid rgba(243, 168, 51, 0.2)",
              borderRadius: "16px",
              color: "#f8fafc",
              p: 1.5,
              minWidth: { xs: "90vw", sm: "380px" },
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, fontSize: "1.1rem", borderBottom: "1px solid rgba(255,255,255,0.08)", pb: 1.5 }}>
            Page Visibility
          </DialogTitle>
          <DialogContent sx={{ mt: 2, pb: 1 }}>
            <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mb: 2 }}>
              Toggle which pages to include in the generated PDF:
            </Typography>
            <div className="space-y-4">
              {pageSettings.map((ps) => (
                <div key={ps.name} className="flex items-center justify-between p-2.5 rounded-xl bg-[#181818] border border-white/5">
                  <span className="text-sm font-semibold text-slate-300">{ps.name}</span>
                  <Switch
                    size="small"
                    checked={ps.state ?? true}
                    onChange={() => dispatch(ps.action())}
                    sx={{
                      "& .MuiSwitch-switchBase": { color: "#cbd5e1" },
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#f3a833",
                        "& + .MuiSwitch-track": { backgroundColor: "#f3a833", opacity: 0.5 },
                      },
                      "& .MuiSwitch-track": { backgroundColor: "#e2e8f0" }
                    }}
                  />
                </div>
              ))}
            </div>
          </DialogContent>
          <DialogActions sx={{ px: 3, pt: 1, pb: 2 }}>
            <Button
              onClick={() => setVisibilityDialogOpen(false)}
              sx={{
                color: "#000",
                bgcolor: "#f3a833",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "8px",
                px: 3,
                "&:hover": {
                  bgcolor: "#d98f1f",
                }
              }}
            >
              Done
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default UnifiedPdfEditor;
