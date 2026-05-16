"use client";
import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Typography, Snackbar, Alert } from "@mui/material";
import { ArrowBackIos, Save, Download, ZoomIn, ZoomOut, Settings, Close, Description, AttachMoney, CalendarMonth, Business } from "@mui/icons-material";
import { Drawer, IconButton, Divider, List, ListItem, ListItemIcon, ListItemText, Stack, Chip } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import UnifiedPdfEditor from "../UnifiedPDFEditor";
import axiosInstance from "../../utils/axiosInstance";
import { motion } from "framer-motion";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store } from "../../utils/store";
import { updateField } from "../../utils/proposalSlice";

export default function ProposalStudio() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);
  const [isStudioMode, setIsStudioMode] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Redux Data to compile PDF
  const page1 = useSelector((s) => s.page1Slice.edit);
  const page2 = useSelector((s) => s.page3.edit);
  const page3 = useSelector((s) => s.page2.edit);
  const pricingPage = useSelector((s) => s.pricing.edit);
  const paymentTerms = useSelector((s) => s.paymentTerms.edit);
  const contactPage = useSelector((s) => s.contact);
  // Live-edited client info from Redux (updated by VisualCoverEditor)
  const reduxProposal = useSelector((s) => s.proposal);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProposal = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/api/proposals/get-single-proposal/${id}`);
        const data = res.data.data;
        setFormData(data);
        // Seed the Redux proposal slice with fetched data
        // so visual editors and the drawer show correct initial values
        if (data?.clientName) dispatch(updateField({ field: "clientName", value: data.clientName }));
        if (data?.date) dispatch(updateField({ field: "date", value: data.date }));
        if (data?.additionalCosts) dispatch(updateField({ field: "additionalCosts", value: data.additionalCosts }));
        if (data?.chargeAmount) dispatch(updateField({ field: "chargeAmount", value: data.chargeAmount }));
        if (data?.advancePercent != null) dispatch(updateField({ field: "advancePercent", value: data.advancePercent }));
        if (data?.selectedCurrency) dispatch(updateField({ field: "selectedCurrency", value: data.selectedCurrency }));
        if (data?.brandName) dispatch(updateField({ field: "brandName", value: data.brandName }));
      } catch (err) {
        console.error("Error fetching proposal:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [id]);

  const saveWithNewPdf = async () => {
    try {
      setSaving(true);
      const brandName = formData?.brandName?.trim() || "Client";
      const fileName = `${brandName} Proposal.pdf`;
      // Use live-edited values from Redux (updated by VisualCoverEditor inline edits)
      const liveClientName = reduxProposal?.clientName || formData?.clientName || "Client";
      const liveDate = reduxProposal?.date || formData?.date || "";

      // 1. Prepare UI for Capture — remove studio decorations & gaps
      setIsStudioMode(false);
      setZoomLevel(100);

      // Wait for React to re-render without studio UI (gap becomes 0)
      await new Promise(resolve => setTimeout(resolve, 600));

      // Scroll the canvas area to top so html2canvas sees everything
      const canvasArea = document.getElementById("canvas-area");
      if (canvasArea) canvasArea.scrollTop = 0;
      window.scrollTo(0, 0);

      const container = document.getElementById("pdf-export-container");
      if (!container) throw new Error("Could not find the PDF container");

      // 2. Capture the entire container as one big canvas (using html2canvas-pro for better rendering)
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      // Each visual page is 800px wide × 1131px tall, gap is 0 in non-studio mode
      const PAGE_PX_HEIGHT = 1131;
      const PAGE_PX_WIDTH = 800;

      // Force container to exact page width during capture (prevents flex expansion)
      const origWidth = container.style.width;
      const origMaxWidth = container.style.maxWidth;
      container.style.width = `${PAGE_PX_WIDTH}px`;
      container.style.maxWidth = `${PAGE_PX_WIDTH}px`;

      // Small wait for reflow
      await new Promise(r => setTimeout(r, 100));

      const fullCanvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: null,
        width: PAGE_PX_WIDTH,
        height: container.scrollHeight,
        windowWidth: PAGE_PX_WIDTH,
        windowHeight: container.scrollHeight,
      });

      // Restore original styles
      container.style.width = origWidth;
      container.style.maxWidth = origMaxWidth;

      // 3. Slice canvas into exact A4 pages
      const SCALE = 2; // matches html2canvas scale
      const pageCanvasHeight = PAGE_PX_HEIGHT * SCALE;
      const pageCanvasWidth = PAGE_PX_WIDTH * SCALE;
      const totalPages = Math.max(1, Math.round(fullCanvas.height / pageCanvasHeight));

      // A4 dimensions in points
      const PDF_W = 595.28;
      const PDF_H = 841.89;

      const pdfDoc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });

      for (let i = 0; i < totalPages; i++) {
        const sliceY = i * pageCanvasHeight;
        const sliceHeight = Math.min(pageCanvasHeight, fullCanvas.height - sliceY);
        if (sliceHeight <= 0) break;

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = pageCanvasWidth;
        pageCanvas.height = sliceHeight;

        const ctx = pageCanvas.getContext("2d");
        ctx.drawImage(
          fullCanvas,
          0, sliceY,                        // source x, y
          pageCanvasWidth, sliceHeight,      // source width, height (crop to exact page width)
          0, 0,                              // dest x, y
          pageCanvasWidth, sliceHeight       // dest width, height
        );

        const imgData = pageCanvas.toDataURL("image/jpeg", 0.95);
        const imgH = (sliceHeight / pageCanvasWidth) * PDF_W;

        if (i > 0) pdfDoc.addPage();
        pdfDoc.addImage(imgData, "JPEG", 0, 0, PDF_W, Math.min(imgH, PDF_H));
      }

      // Get blob for upload and trigger download
      const blob = pdfDoc.output("blob");
      pdfDoc.save(fileName);

      // 3. Upload to server
      const formDataUpload = new FormData();
      formDataUpload.append("pdfFile", blob, fileName);
      formDataUpload.append("proposalId", id);

      const uploadRes = await axiosInstance.post(
        `/api/proposals/upload-pdf`,
        formDataUpload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (!uploadRes.data.success) throw new Error("PDF upload failed");

      // 4. Update Database
      const pdfPages = {
        page1,
        page2,
        page3,
        pricingPage,
        paymentTerms,
        contactPage,
      };

      await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_APP_BASE_URL}api/proposals/update-proposal/${id}`,
        {
          data: { ...formData, clientName: liveClientName, date: liveDate }, // persist live edits
          pdfPages,
          pdfPath: uploadRes.data.filePath,
        }
      );
      setSnackbar({ open: true, message: "PDF generated and saved successfully!", severity: "success" });
    } catch (err) {
      console.error("Generate PDF Error:", err);
      setSnackbar({ open: true, message: "Failed to generate PDF: " + err.message, severity: "error" });
    } finally {
      setIsStudioMode(true);
      setSaving(false);
      setDrawerOpen(false); // Close drawer after generating
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "#0a0a0a" }}>
        <CircularProgress size={60} sx={{ color: "#f3a833" }} />
      </Box>
    );
  }

  if (!formData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "#0a0a0a" }}>
        <Typography variant="h5" color="error">Proposal not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100vh", bgcolor: "#0a0a0a", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Top Action Bar */}
      <Box 
        sx={{ 
          p: 2, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(243, 168, 51, 0.2)",
          background: "rgba(20, 20, 20, 0.8)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 1000
        }}
      >
        <Button
          onClick={() => router.back()}
          startIcon={<ArrowBackIos />}
          sx={{ color: "#f8fafc", textTransform: "none" }}
        >
          Back
        </Button>
        <Typography variant="h6" sx={{ color: "#f3a833", fontWeight: 700 }}>
          Proposal Studio
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {/* Zoom Controls */}
          <div className="bg-[#0a0a0a]/50 border border-[#f3a833]/20 px-2 py-1 rounded flex items-center gap-2 mr-2 shrink-0">
            <button
              onClick={() => setZoomLevel(prev => Math.max(20, prev - 10))}
              className="text-slate-400 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="20"
              max="150"
              step="5"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="w-16 accent-[#f3a833] cursor-pointer h-1.5"
              title="Adjust Zoom"
            />
            <button
              onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
              className="text-slate-400 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-700 mx-0.5"></div>
            <button
              onClick={() => setZoomLevel(100)}
              className={`text-[11px] font-bold px-1.5 py-0.5 rounded transition-colors min-w-[2.5rem] text-center ${zoomLevel === 100 ? 'text-[#f3a833] bg-[#f3a833]/10' : 'text-slate-400 hover:text-white hover:bg-[#1f1f1f]'}`}
              title="Fit to Screen"
            >
              100%
            </button>
          </div>

          <button
            onClick={() => setIsStudioMode(!isStudioMode)}
            className={`px-3 py-1.5 rounded text-[12px] font-medium flex items-center space-x-1 transition-colors ${isStudioMode ? 'bg-[#f3a833]/20 text-[#f3a833]' : 'bg-[#141414] text-slate-400 hover:bg-[#1f1f1f]'}`}
          >
            <Settings className="w-4 h-4" />
            <span>Studio Mode: {isStudioMode ? 'ON' : 'OFF'}</span>
          </button>

          <Button
            variant="contained"
            onClick={() => setDrawerOpen(true)}
            startIcon={<Download />}
            sx={{
              bgcolor: "#10b981",
              "&:hover": { bgcolor: "#059669" },
              fontWeight: 700,
              textTransform: "none",
              ml: 2,
              borderRadius: 2
            }}
          >
            Review & Generate
          </Button>
        </Box>
      </Box>

      {/* Editor Area */}
      <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <UnifiedPdfEditor
          pdfPages={formData?.pdfPages}
          mode="edit-doc"
          clientName={formData?.clientName || "Client"}
          date={formData?.date || new Date().toISOString()}
          isStudioMode={isStudioMode}
          zoomLevel={zoomLevel}
        />
      </Box>

      {/* Right Drawer for PDF Generation */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => !saving && setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 400 },
            bgcolor: "#111111", // Deep dark background
            borderLeft: "1px solid rgba(243, 168, 51, 0.15)",
            color: "#f8fafc",
          }
        }}
      >
        <Box sx={{ p: 3, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#f3a833" }}>
            Generate PDF
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)} disabled={saving} sx={{ color: "#94a3b8" }}>
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ p: 3, flex: 1, overflowY: "auto" }}>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
            Review the details below before generating the final PDF document. These details are pulled from your form.
          </Typography>

          <Stack spacing={2} sx={{ mb: 4 }}>
            {/* Client Info */}
            <Box sx={{ p: 2, bgcolor: "#1a1a1a", borderRadius: 2, border: "1px solid rgba(255,255,255,0.05)" }}>
              <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>
                Client
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                {reduxProposal?.clientName || formData?.clientName || "Unknown Client"}
              </Typography>
              {(formData?.clientEmail || reduxProposal?.clientEmail) && (
                <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>
                  {formData?.clientEmail || reduxProposal?.clientEmail}
                </Typography>
              )}
            </Box>

            {/* Brand / Project */}
            <Box sx={{ p: 2, bgcolor: "#1a1a1a", borderRadius: 2, border: "1px solid rgba(255,255,255,0.05)" }}>
              <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>
                Brand / Project
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                {page1?.brandName !== "Brand Name" && page1?.brandName ? page1.brandName : (formData?.brandName || formData?.projectTitle || "Untitled Project")}
              </Typography>
              {(page1?.brandTagline !== "Crafting Legacies That Last" && page1?.brandTagline ? page1.brandTagline : formData?.brandTagline) && (
                <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5, fontStyle: "italic" }}>
                  "{page1?.brandTagline !== "Crafting Legacies That Last" && page1?.brandTagline ? page1.brandTagline : formData?.brandTagline}"
                </Typography>
              )}
            </Box>

            {/* Services & Charges */}
            {(formData?.recommended_services?.length > 0 || formData?.chargeAmount) ? (
              <Box sx={{ p: 2, bgcolor: "#1a1a1a", borderRadius: 2, border: "1px solid rgba(255,255,255,0.05)" }}>
                <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", mb: 1, display: "block" }}>
                  Services & Charges
                </Typography>
                {formData?.recommended_services?.length > 0 ? (
                  <Stack spacing={1}>
                    {formData.recommended_services.map((service, idx) => (
                      <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ color: "#f8fafc", fontWeight: 500 }}>
                          {service}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#10b981", fontWeight: 700 }}>
                          {formData.selectedCurrency === "USD" ? "$" : "₨"}{formData.serviceCharges?.[idx] || "0"}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" sx={{ color: "#f8fafc", fontWeight: 500 }}>
                      Service Charge
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#10b981", fontWeight: 700 }}>
                      {formData.selectedCurrency === "USD" ? "$" : "₨"}{formData.chargeAmount || "0"}
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : null}

            {/* Total Cost */}
            {(() => {
              // Calculate dynamic total from gridPackages if they exist
              let dynamicTotal = 0;
              if (pricingPage?.gridPackages?.length > 0) {
                pricingPage.gridPackages.forEach(pkg => {
                   const cost = parseFloat(String(pkg.price).replace(/[^0-9.]/g, ""));
                   if (!isNaN(cost)) dynamicTotal += cost;
                });
              }
              
              // Respect true value from the database ONLY
              let rawTotal = "";
              if (dynamicTotal > 0) {
                rawTotal = dynamicTotal;
              } else if (formData?.additionalCosts !== undefined && formData?.additionalCosts !== null && formData?.additionalCosts !== "") {
                rawTotal = formData.additionalCosts;
              } else if (formData?.chargeAmount !== undefined && formData?.chargeAmount !== null && formData?.chargeAmount !== "") {
                rawTotal = formData.chargeAmount;
              }
              
              if (rawTotal === "" || rawTotal === null) return null;
              
              return (
                <Box sx={{ p: 2, bgcolor: "#1a1a1a", borderRadius: 2, border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>
                      Total Cost
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#10b981", mt: 0.5 }}>
                      {(formData?.selectedCurrency || reduxProposal?.selectedCurrency) === "USD" ? "$" : "₨ "}{rawTotal.toLocaleString ? rawTotal.toLocaleString() : rawTotal}
                    </Typography>
                  </Box>
                  {(formData?.selectedCurrency || reduxProposal?.selectedCurrency) && (
                    <Chip size="small" label={formData?.selectedCurrency || reduxProposal?.selectedCurrency} sx={{ bgcolor: "rgba(16, 185, 129, 0.1)", color: "#10b981", fontWeight: "bold" }} />
                  )}
                </Box>
              );
            })()}

            {/* Advance Percentage */}
            {(() => {
              let advPct = 0;
              if (formData?.advancePercent !== undefined && formData?.advancePercent !== null && formData?.advancePercent !== "") {
                advPct = parseFloat(formData.advancePercent);
              }
              
              if (isNaN(advPct)) advPct = 0;
              
              return (
                <Box sx={{ p: 2, bgcolor: "#1a1a1a", borderRadius: 2, border: "1px solid rgba(243,168,51,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>
                      Advance Payment
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#f3a833", mt: 0.5 }}>
                      {advPct}%
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label="Upfront"
                    sx={{ bgcolor: "rgba(243,168,51,0.12)", color: "#f3a833", border: "1px solid rgba(243,168,51,0.3)", fontWeight: 700 }}
                  />
                </Box>
              );
            })()}

            {/* Date */}
            <Box sx={{ p: 2, bgcolor: "#1a1a1a", borderRadius: 2, border: "1px solid rgba(255,255,255,0.05)" }}>
              <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>
                Proposal Date
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                {reduxProposal?.date || formData?.date || new Date().toISOString().split('T')[0]}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ p: 3, borderTop: "1px solid rgba(255,255,255,0.05)", bgcolor: "rgba(0,0,0,0.2)" }}>
          <Button
            fullWidth
            size="large"
            variant="contained"
            onClick={saveWithNewPdf}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Download />}
            sx={{
              bgcolor: "#f3a833",
              color: "#000",
              "&:hover": { bgcolor: "#f59e0b" },
              fontWeight: 800,
              textTransform: "none",
              py: 1.5,
              borderRadius: 2
            }}
          >
            {saving ? "Generating & Saving..." : "Generate Final PDF"}
          </Button>
        </Box>
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
