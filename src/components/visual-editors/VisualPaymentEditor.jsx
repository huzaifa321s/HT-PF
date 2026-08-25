"use client";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Button, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { updateTitle, addTerm, updateTerm, deleteTerm, restoreTerm } from "../../utils/paymentTermsPageSlice";
import { showToast } from "../../utils/toastSlice";
import debounce from "lodash.debounce";
import EditableText from "../EditableText";
import { HEADER_IMG, FOOTER_IMG } from "../../utils/pdfImageAssets";

const PAGE_CONTENT_HEIGHT = 900;
const TITLE_OVERHEAD = 85;
const TERM_BASE_HEIGHT = 60;

const estimateTermHeight = (term) => {
  const charsPerLine = 75;
  const lines = Math.ceil(term.length / charsPerLine) || 1;
  return (lines - 1) * 33 + TERM_BASE_HEIGHT;
};

const splitTermsByHeight = (terms) => {
  const pages = [];
  let currentPage = [];
  let currentHeight = TITLE_OVERHEAD;

  terms.forEach((term, index) => {
    const termH = estimateTermHeight(term);
    if (currentHeight + termH > PAGE_CONTENT_HEIGHT && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      currentHeight = 40; // Overhead for continuation page
    }
    currentPage.push({ term, globalIndex: index });
    currentHeight += termH;
  });

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }
  if (pages.length === 0) {
    pages.push([]);
  }
  return pages;
};

const VisualPaymentEditor = ({ isStudioMode = true, isThumbnail = false, onPageCountChange, pageIdPrefix = "Payment Terms" }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const currentMode = useSelector((state) => state.paymentTerms.currentMode || "create");
  const paymentData = useSelector((state) => state.paymentTerms[currentMode] || state.paymentTerms);
  const terms = paymentData.terms || [];

  const debouncedUpdateTitle = useCallback(debounce((val) => dispatch(updateTitle(val)), 500), [dispatch]);
  const handleTitleInput = (e) => debouncedUpdateTitle(e.currentTarget.textContent);

  const debouncedUpdateTerm = useCallback(debounce((idx, val) => dispatch(updateTerm({ index: idx, value: val })), 500), [dispatch]);

  const handleAddTerm = () => {
    dispatch(addTerm("Start typing new term here..."));
  };

  const pages = splitTermsByHeight(terms);

  React.useEffect(() => {
    if (onPageCountChange) {
      onPageCountChange(pages.length);
    }
  }, [pages.length, onPageCountChange]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: isStudioMode ? "20px" : "0px", alignItems: "center", width: "100%" }}>
      {pages.map((pageTerms, pageIdx) => {
        const isFirstPage = pageIdx === 0;

        return (
          <Box key={pageIdx} sx={{ position: "relative", width: "100%", maxWidth: "800px" }}>
            <Box
              id={isStudioMode && !isThumbnail ? `page-${pageIdPrefix}-${pageIdx}` : undefined}
              sx={{
                position: "relative", width: "100%", height: "1131px",
                backgroundColor: "#ffffff", boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
                fontFamily: "'Liberation Serif', Times, serif", pt: "50px", pb: "90px", px: "60px",
                overflow: "hidden"
              }}
            >
              {isStudioMode && isFirstPage && (
                <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 50 }}>
                  <Typography variant="caption" sx={{ bgcolor: "rgba(0,0,0,0.5)", color: "white", px: 1, py: 0.5, borderRadius: '10px' }}>
                    <Edit sx={{ fontSize: 12, mr: 0.5, verticalAlign: "middle" }} /> Click text to edit
                  </Typography>
                </Box>
              )}

              {/* Header Overlay */}
              <Box sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "50px",
                zIndex: 1,
                pointerEvents: "none",
                backgroundImage: `url(${HEADER_IMG})`,
                backgroundSize: "cover",
                backgroundPosition: "top center",
                backgroundRepeat: "no-repeat"
              }} />

              {/* Footer Overlay */}
              <Box sx={{
                position: "absolute",
                top: 1071,
                left: 0,
                right: 0,
                height: "60px",
                zIndex: 1,
                pointerEvents: "none",
                backgroundImage: `url(${FOOTER_IMG})`,
                backgroundSize: "cover",
                backgroundPosition: "bottom center",
                backgroundRepeat: "no-repeat"
              }} />

              {/* Content Layer (positive stacking context) */}
              <Box sx={{ position: "relative", zIndex: 2 }}>
                <Box sx={{ height: 50 }} />

                <Box sx={{ width: "100%", height: "1px", backgroundColor: "#000", my: "25px" }} />

                {/* Title */}
                {isFirstPage ? (
                  <EditableText
                    value={paymentData.title}
                    fallback="Payment Terms"
                    isStudioMode={isStudioMode}
                    onInput={handleTitleInput}
                    sx={{
                      fontSize: 30, fontWeight: "bold", color: "#000", textAlign: "center", mb: "30px", outline: "none",
                      "&:hover, &:focus": isStudioMode ? { outline: "1px dashed rgba(243,168,51,0.6)", outlineOffset: "2px", borderRadius: "4px" } : {}
                    }}
                  />
                ) : (
                  <Typography sx={{ fontSize: 20, color: "#000", textAlign: "center", mb: "30px" }}>
                    {paymentData.title || "Payment Terms"} (Continued)
                  </Typography>
                )}

                {/* Terms List */}
                <Box sx={{ mt: "20px", flexGrow: 1 }}>
                  {pageTerms.length > 0 ? pageTerms.map((item, idx) => (
                    <Box key={item.globalIndex} sx={{ position: "relative", mb: "0px", "&:hover .term-actions": { opacity: 1 } }}>
                      <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                        <Typography sx={{ width: "25px", fontSize: 14, fontWeight: "bold", color: "#000", textAlign: "right", pt: "2px" }}>
                          {item.globalIndex + 1}.
                        </Typography>
                        <EditableText
                          value={item.term}
                          isStudioMode={isStudioMode}
                          onInput={(e) => debouncedUpdateTerm(item.globalIndex, e.currentTarget.textContent)}
                          sx={{
                            flex: 1, fontSize: 14, lineHeight: 1.8, color: "#333333", textAlign: "justify", ml: "5px", outline: "none", minHeight: 20,
                            "&:hover, &:focus": isStudioMode ? { outline: "1px dashed rgba(243,168,51,0.6)", outlineOffset: "2px", borderRadius: "4px" } : {}
                          }}
                        />
                      </Box>

                      {isStudioMode && (
                        <Box className="term-actions" sx={{ position: "absolute", right: -30, top: 0, opacity: 0, transition: "opacity 0.2s" }}>
                          <IconButton size="small" color="error" onClick={() => {
                            dispatch(deleteTerm(item.globalIndex));
                            dispatch(showToast({
                              message: "Term deleted",
                              severity: "info",
                              undoAction: restoreTerm({ index: item.globalIndex, value: item.term })
                            }));
                          }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      )}

                      {/* Professional Bottom Border */}
                      {idx < pageTerms.length - 1 && (
                        <Box sx={{ width: "calc(100% - 30px)", height: "1px", backgroundColor: "#e0e0e0", ml: "30px", mt: "15px", mb: "15px" }} />
                      )}
                    </Box>
                  )) : isFirstPage ? (
                    <Typography sx={{ fontSize: 14, color: "#333333", ml: "5px" }}>No payment terms added yet.</Typography>
                  ) : null}
                </Box>
              </Box>
            </Box>

            {/* Floating Add Term button on the right side of the last page */}
            {isStudioMode && pageIdx === pages.length - 1 && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: isMobile ? "-45px" : "90px",
                  left: isMobile ? "50%" : "100%",
                  transform: isMobile ? "translateX(-50%)" : "none",
                  ml: isMobile ? "0px" : "20px",
                  zIndex: 100,
                }}
              >
                <Button variant="outlined" startIcon={<Add />} onClick={handleAddTerm} sx={{ color: "#FF8C00", borderColor: "#FF8C00", borderStyle: "dashed", whiteSpace: "nowrap", bgcolor: "#141414" }}>
                  Add Term
                </Button>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default VisualPaymentEditor;
