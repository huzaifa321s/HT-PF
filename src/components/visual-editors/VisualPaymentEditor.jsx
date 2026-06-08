"use client";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Button, IconButton } from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { updateTitle, addTerm, updateTerm, deleteTerm, restoreTerm } from "../../utils/paymentTermsPageSlice";
import { showToast } from "../../utils/toastSlice";
import debounce from "lodash.debounce";
import EditableText from "../EditableText";
import { HEADER_IMG, FOOTER_IMG } from "../../utils/pdfImageAssets";

const PAGE_CONTENT_HEIGHT = 850;

const estimateTermHeight = (term) => {
  const charsPerLine = 80;
  const lines = Math.ceil(term.length / charsPerLine) || 1;
  return lines * 22 + 40; // 22px per line + 40px for paddings/border
};

const splitTermsByHeight = (terms) => {

  const pages = [];
  let currentPage = [];
  let currentHeight = 150; // Initial overhead for title

  terms.forEach((term, index) => {
    const termH = estimateTermHeight(term);
    if (currentHeight + termH > PAGE_CONTENT_HEIGHT && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      currentHeight = 50; // Smaller overhead for continuation page
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: isStudioMode ? "20px" : "0px", alignItems: "center" }}>
      {pages.map((pageTerms, pageIdx) => {
        const isFirstPage = pageIdx === 0;

        return (
          <Box
            id={isStudioMode && !isThumbnail ? `page-${pageIdPrefix}-${pageIdx}` : undefined}
            key={pageIdx}
            sx={{
              position: "relative", width: "100%", maxWidth: "800px", height: "1131px",
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
            <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: "50px", zIndex: 1, pointerEvents: "none" }}>
              <div style={{ width: "100%", height: "100%", backgroundImage: `url(${HEADER_IMG})`, backgroundSize: "cover", backgroundPosition: "center" }} />
            </Box>

            {/* Footer Overlay */}
            <Box sx={{ position: "absolute", top: 1071, left: 0, right: 0, height: "60px", zIndex: 1, pointerEvents: "none" }}>
              <div style={{ width: "100%", height: "100%", backgroundImage: `url(${FOOTER_IMG})`, backgroundSize: "cover", backgroundPosition: "center" }} />
            </Box>

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
                    fontSize: 28, fontWeight: "bold", color: "#000", textAlign: "center", mb: "30px", outline: "none", border: isStudioMode ? "1px dashed transparent" : "none",
                    "&:hover, &:focus": isStudioMode ? { border: "1px dashed #FF8C00", bgcolor: "rgba(255,140,0,0.05)", borderRadius: '10px' } : {}
                  }}
                />
              ) : (
                <Typography sx={{ fontSize: 18, color: "#000", textAlign: "center", mb: "30px" }}>
                  {paymentData.title || "Payment Terms"} (Continued)
                </Typography>
              )}

              {/* Terms List */}
              <Box sx={{ mt: "20px", flexGrow: 1 }}>
                {pageTerms.length > 0 ? pageTerms.map((item, idx) => (
                  <Box key={item.globalIndex} sx={{ position: "relative", mb: "0px", "&:hover .term-actions": { opacity: 1 } }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                      <Typography sx={{ width: "25px", fontSize: 12, fontWeight: "bold", color: "#000", textAlign: "right", pt: "2px" }}>
                        {item.globalIndex + 1}.
                      </Typography>
                      <EditableText
                        value={item.term}
                        isStudioMode={isStudioMode}
                        onInput={(e) => debouncedUpdateTerm(item.globalIndex, e.currentTarget.textContent)}
                        sx={{
                          flex: 1, fontSize: 12, lineHeight: 1.8, color: "#333333", textAlign: "justify", ml: "5px", outline: "none", border: isStudioMode ? "1px dashed transparent" : "none", minHeight: 20,
                          "&:hover, &:focus": isStudioMode ? { border: "1px dashed #FF8C00", bgcolor: "rgba(255,140,0,0.05)", borderRadius: '10px' } : {}
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
                  <Typography sx={{ fontSize: 12, color: "#333333", ml: "5px" }}>No payment terms added yet.</Typography>
                ) : null}
              </Box>

              {/* Add Term Button (Only on last page) */}
              {isStudioMode && pageIdx === pages.length - 1 && (
                <Box sx={{ textAlign: "center", mt: 4, pt: 4, borderTop: "1px dashed #ddd" }}>
                  <Button variant="outlined" startIcon={<Add />} onClick={handleAddTerm} sx={{ color: "#FF8C00", borderColor: "#FF8C00", borderStyle: "dashed" }}>
                    Add Term
                  </Button>
                </Box>
              )}
            </Box>

          </Box>
        );
      })}
    </Box>
  );
};

export default VisualPaymentEditor;
