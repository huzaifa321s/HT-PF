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
        // Seed the Redux proposal slice with fetched clientName & date
        // so VisualCoverEditor shows correct initial values
        if (data?.clientName) dispatch(updateField({ field: "clientName", value: data.clientName }));
        if (data?.date) dispatch(updateField({ field: "date", value: data.date }));
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

      // 1. Prepare UI for Capture
      setIsStudioMode(false);
      setZoomLevel(100);

      // Wait a moment for React to re-render without studio UI
      await new Promise(resolve => setTimeout(resolve, 500));

      const element = document.getElementById("pdf-export-container");
      if (!element) throw new Error("Could not find the PDF container");

      // 2. Generate PDF using html2pdf
      const html2pdf = (await import("html2pdf.js")).default;
      
      const opt = {
        margin:       0,
        filename:     fileName,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'pt', format: [595, 841.18125], orientation: 'portrait' }
      };

      const worker = html2pdf().set(opt).from(element);
      
      // Get the Blob for uploading to backend
      const blob = await worker.toPdf().outputPdf('blob');

      // Trigger user download
      worker.save();

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
                {page1?.brandName || formData?.projectTitle || "Untitled Project"}
              </Typography>
              {page1?.brandTagline && (
                <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5, fontStyle: "italic" }}>
                  "{page1.brandTagline}"
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
            {(formData?.additionalCosts || reduxProposal?.additionalCosts || formData?.chargeAmount || reduxProposal?.chargeAmount) ? (
              <Box sx={{ p: 2, bgcolor: "#1a1a1a", borderRadius: 2, border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>
                    Total Cost
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#10b981", mt: 0.5 }}>
                    {formData?.additionalCosts || reduxProposal?.additionalCosts || formData?.chargeAmount || reduxProposal?.chargeAmount || "—"}
                  </Typography>
                </Box>
                {(formData?.selectedCurrency || reduxProposal?.selectedCurrency) && (
                  <Chip size="small" label={formData?.selectedCurrency || reduxProposal?.selectedCurrency} sx={{ bgcolor: "rgba(16, 185, 129, 0.1)", color: "#10b981", fontWeight: "bold" }} />
                )}
              </Box>
            ) : null}

            {/* Advance Payment */}
            {(() => {
              const advPct = parseFloat(reduxProposal?.advancePercent || formData?.advancePercent || 0);
              const rawTotal = reduxProposal?.additionalCosts || formData?.additionalCosts || reduxProposal?.chargeAmount || formData?.chargeAmount || "";
              const numericTotal = parseFloat(String(rawTotal).replace(/[^0-9.]/g, "")) || 0;
              const advanceCost = numericTotal > 0 && advPct > 0 ? Math.round(numericTotal * advPct / 100) : null;
              const currency = formData?.selectedCurrency === "USD" ? "$" : "PKR ";
              if (!advPct) return null;
              return (
                <>
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

                  {advanceCost !== null && (
                    <Box sx={{ p: 2, bgcolor: "#1a1a1a", borderRadius: 2, border: "1px solid rgba(243,168,51,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>
                          Advance Cost ({advPct}%)
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#f3a833", mt: 0.5 }}>
                          {currency}{advanceCost.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                          Remaining: {currency}{(numericTotal - advanceCost).toLocaleString()}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={`${100 - advPct}% on delivery`}
                        sx={{ bgcolor: "rgba(100,116,139,0.15)", color: "#94a3b8", border: "1px solid rgba(100,116,139,0.2)", fontSize: 10, fontWeight: 600 }}
                      />
                    </Box>
                  )}
                </>
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
