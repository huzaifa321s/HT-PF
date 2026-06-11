
"use client";
import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { ArrowBackIos, Save, Download, ZoomIn, ZoomOut, Settings, Close, Description, AttachMoney, CalendarMonth, Business, AutoAwesome, ContentCopy } from "@mui/icons-material";
import { Drawer, IconButton, Divider, List, ListItem, ListItemIcon, ListItemText, Stack, Chip } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import UnifiedPdfEditor from "../UnifiedPDFEditor";
import axiosInstance from "../../utils/axiosInstance";
import { motion } from "framer-motion";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store } from "../../utils/store";
import { updateField, setFullFormData } from "../../utils/proposalSlice";
import { historyManager } from "../../utils/historyManager";
import { showToast } from "../../utils/toastSlice";

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
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  // Toast notifications handled globally via Redux showToast

  // Redux Data to compile PDF
  const isNew = id === "new";
  const page1 = useSelector((s) => isNew ? s.page1Slice.create : s.page1Slice.edit);
  const page2 = useSelector((s) => isNew ? s.page3.create : s.page3.edit);
  const page3 = useSelector((s) => isNew ? s.page2.create : s.page2.edit);
  const pricingPage = useSelector((s) => isNew ? s.pricing.create : s.pricing.edit);
  const paymentTerms = useSelector((s) => isNew ? s.paymentTerms.create : s.paymentTerms.edit);
  const contactPage = useSelector((s) => s.contact);

  // AI Response from either create or edit mode
  const originalAiResponse = useSelector((s) => isNew ? s.page2?.create?.originalAiResponse : s.page2?.edit?.originalAiResponse);

  // Live-edited client info from Redux (updated by VisualCoverEditor)
  const reduxProposal = useSelector((s) => s.proposal);
  const dispatch = useDispatch();

  // Undo / Redo Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if Ctrl or Cmd is pressed
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" || e.key === "Z") {
          if (e.shiftKey) {
            // Ctrl + Shift + Z = Redo
            e.preventDefault();
            const nextState = historyManager.redo();
            if (nextState) dispatch({ type: "RESTORE_SNAPSHOT", payload: nextState });
          } else {
            // Ctrl + Z = Undo
            e.preventDefault();
            const prevState = historyManager.undo();
            if (prevState) dispatch({ type: "RESTORE_SNAPSHOT", payload: prevState });
          }
        } else if (e.key === "y" || e.key === "Y") {
          // Ctrl + Y = Redo
          e.preventDefault();
          const nextState = historyManager.redo();
          if (nextState) dispatch({ type: "RESTORE_SNAPSHOT", payload: nextState });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!id) return;

      if (id === "new") {
        setFormData(reduxProposal);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axiosInstance.get(`/api/proposals/get-single-proposal/${id}`);
        const data = res.data.data;

        if (reduxProposal?.isUnsavedEdit) {
          // Merge Redux edited data over the database data for the UI
          setFormData({ ...data, ...reduxProposal });
        } else {
          // Standard load: use DB data and seed Redux
          setFormData(data);
          if (data?.clientName) dispatch(updateField({ field: "clientName", value: data.clientName }));
          if (data?.date) dispatch(updateField({ field: "date", value: data.date }));
          if (data?.additionalCosts) dispatch(updateField({ field: "additionalCosts", value: data.additionalCosts }));
          if (data?.chargeAmount) dispatch(updateField({ field: "chargeAmount", value: data.chargeAmount }));
          if (data?.advancePercent != null) dispatch(updateField({ field: "advancePercent", value: data.advancePercent }));
          if (data?.brandName) dispatch(updateField({ field: "brandName", value: data.brandName }));
        }
      } catch (err) {
        console.error("Error fetching proposal:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [id]);

  // Preload AND decode all <img> elements before html2canvas capture.
  // img.complete can be true while the browser is still decoding pixel data
  // (this is especially common with large base64 data-URI images like HEADER_IMG / FOOTER_IMG).
  // img.decode() returns a promise that only resolves once the image is fully decoded
  // and ready to be painted — so we use that as the authoritative signal.
  async function preloadAllImages(container) {
    const imgs = Array.from(container.querySelectorAll('img'));
    await Promise.all(
      imgs.map(async (img) => {
        // 1. If the src is not a data-URI, force a reload into a temp Image first
        if (img.src && !img.src.startsWith('data:')) {
          await new Promise((resolve) => {
            const temp = new Image();
            temp.crossOrigin = 'anonymous';
            temp.onload = resolve;
            temp.onerror = resolve;
            temp.src = img.src;
          });
        }
        // 2. Wait for the image to be loaded (handles not-yet-loaded case)
        if (!img.complete || img.naturalWidth === 0) {
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
            setTimeout(resolve, 8000); // hard timeout
          });
        }
        // 3. Force full decode — this is the key step that guarantees pixel data is ready
        if (typeof img.decode === 'function') {
          try {
            await img.decode();
          } catch (_) { /* ignore — e.g. already decoded or broken image */ }
        }
      })
    );
    // 4. Flush two animation frames so the browser paints the decoded pixels
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }

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

      // Ensure all custom fonts are completely loaded before capturing
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

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

      // Convert ALL images (both <img> tags AND CSS background-image divs) to base64 data URLs
      // in the LIVE DOM before html2canvas captures. This guarantees zero network requests
      // during capture, fixing the blank image issue caused by html2canvas's hidden iframe
      // racing against network fetches.
      const { convertImagesToBase64, restoreOriginalImages, ensureAllImagesConverted, ensureAllAssetsConverted } = await import("../../utils/imageToBase64");
      const originalSources = await convertImagesToBase64(container);
      // Ensure all <img> tags have been replaced with data URLs before capture
      // Wait briefly and re-check if any image still has a non‑data URL (race condition)
      let attempts = 0;
      while (!ensureAllAssetsConverted(container) && attempts < 10) {
        await new Promise((r) => setTimeout(r, 200)); // 200 ms back‑off
        attempts++;
      }

      // Ensure all images are fully decoded and painted before capture
      await preloadAllImages(container);
      // Extra settle time after decode before html2canvas runs
      await new Promise(r => setTimeout(r, 300));
      let fullCanvas;
      try {
        fullCanvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false,
          scrollX: 0,
          scrollY: 0,
          backgroundColor: "#ffffff",
          width: PAGE_PX_WIDTH,
          height: container.scrollHeight,
          windowWidth: PAGE_PX_WIDTH,
          windowHeight: container.scrollHeight,
          imageTimeout: 15000,
          onclone: async (clonedDoc) => {
            const clonedBody = clonedDoc.body;
            clonedBody.style.width = `${PAGE_PX_WIDTH}px`;
            clonedBody.style.minWidth = `${PAGE_PX_WIDTH}px`;

            const clonedContainer = clonedDoc.getElementById("pdf-export-container");
            if (clonedContainer) {
              clonedContainer.style.width = `${PAGE_PX_WIDTH}px`;
              clonedContainer.style.maxWidth = `${PAGE_PX_WIDTH}px`;
              clonedContainer.style.transform = "none";
            }

            // Critical: decode all images inside the CLONED document.
            // html2canvas clones the DOM into a hidden iframe; images there
            // need to be decoded independently of the original DOM.
            const clonedImgs = Array.from(clonedDoc.querySelectorAll('img'));
            await Promise.all(
              clonedImgs.map(async (img) => {
                if (!img.complete || img.naturalWidth === 0) {
                  await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                    setTimeout(resolve, 10000);
                  });
                }
                if (typeof img.decode === 'function') {
                  try { await img.decode(); } catch (_) {}
                }
              })
            );
          }
        });
      } finally {
        container.style.width = origWidth;
        container.style.maxWidth = origMaxWidth;
        restoreOriginalImages(originalSources);
      }

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

      // 2. Scan and upload base64 images to Google Drive before saving to DB
      let updatedPage1 = page1 ? JSON.parse(JSON.stringify(page1)) : null;
      let updatedPage2 = page2 ? JSON.parse(JSON.stringify(page2)) : null;

      // Helper to convert base64 to File
      const base64ToFile = (base64String, filename) => {
        const arr = base64String.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
      };

      const { uploadImageFile } = await import("../../utils/uploadImage");

      // Check page 1 logo
      if (updatedPage1?.clientLogo && updatedPage1.clientLogo.startsWith("data:image/")) {
        try {
          dispatch(showToast({ message: "Uploading client logo to Google Drive...", severity: "info" }));
          const file = base64ToFile(updatedPage1.clientLogo, "client-logo");
          const url = await uploadImageFile(file);
          updatedPage1.clientLogo = url;
          // Sync with Redux for future edit sessions
          const { setClientLogo } = await import("../../utils/page1Slice");
          dispatch(setClientLogo(url));
        } catch (err) {
          console.error("Failed to upload client logo:", err);
          dispatch(showToast({ message: "Failed to upload logo to Google Drive", severity: "error" }));
        }
      }

      // Check page 2 (About Page) image elements
      if (updatedPage2?.elements?.length > 0) {
        const updatedElements = [];
        for (const el of updatedPage2.elements) {
          if (el.type === "image" && el.content && el.content.startsWith("data:image/")) {
            try {
              dispatch(showToast({ message: "Uploading block image to Google Drive...", severity: "info" }));
              const file = base64ToFile(el.content, `about-image-${el.id}`);
              const url = await uploadImageFile(file);
              updatedElements.push({ ...el, content: url });
              // Sync with Redux for future edit sessions
              const { editElementContent } = await import("../../utils/page3Slice");
              dispatch(editElementContent({ id: el.id, content: url }));
            } catch (err) {
              console.error(`Failed to upload element ${el.id} image:`, err);
              dispatch(showToast({ message: "Failed to upload image block to Google Drive", severity: "error" }));
              updatedElements.push(el);
            }
          } else {
            updatedElements.push(el);
          }
        }
        updatedPage2.elements = updatedElements;
      }

      const finalPdfPages = {
        page1: updatedPage1,
        page2: updatedPage2,
        page3,
        pricingPage,
        paymentTerms,
        contactPage,
      };

      const finalData = { ...formData, clientName: liveClientName, date: liveDate };
      let currentId = id;

      // 3. Create Proposal if Draft
      if (id === "new") {
        const createRes = await axiosInstance.post("/api/proposals/create-proposal", {
          data: finalData,
          pdfPages: finalPdfPages
        });
        if (!createRes.data.success) throw new Error("Failed to create proposal record");
        currentId = createRes.data.data._id;
      }

      // 4. Upload PDF to server
      const formDataUpload = new FormData();
      formDataUpload.append("pdfFile", blob, fileName);
      formDataUpload.append("proposalId", currentId);

      const uploadRes = await axiosInstance.post(
        `/api/proposals/upload-pdf`,
        formDataUpload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (!uploadRes.data.success) throw new Error("PDF upload failed");

      // 5. Update Database if not newly created
      // (If it was just created, the upload-pdf route already saves the pdfPath to it)
      if (id !== "new") {
        await axiosInstance.put(
          `/api/proposals/update-proposal/${currentId}`,
          {
            data: finalData, // persist live edits
            pdfPages: finalPdfPages,
            pdfPath: uploadRes.data.filePath,
          }
        );
      }

      dispatch(showToast({ message: "PDF generated and saved successfully!", severity: "success" }));

      if (id === "new") {
        router.replace(`/proposal-studio/${currentId}`);
      }

      // Clear the unsaved edit flag since the DB is now in sync
      if (reduxProposal?.isUnsavedEdit) {
        dispatch(setFullFormData({ isUnsavedEdit: false }));
      }
    } catch (err) {
      console.error("Generate PDF Error:", err);
      dispatch(showToast({ message: "Failed to generate PDF: " + err.message, severity: "error" }));
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
          <div className="bg-[#0a0a0a]/50 border border-[#f3a833]/20 px-2 py-1 rounded-[10px] flex items-center gap-2 mr-2 shrink-0">
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
              className={`text-[11px] font-bold px-1.5 py-0.5 rounded-[10px] transition-colors min-w-[2.5rem] text-center ${zoomLevel === 100 ? 'text-[#f3a833] bg-[#f3a833]/10' : 'text-slate-400 hover:text-white hover:bg-[#1f1f1f]'}`}
              title="Fit to Screen"
            >
              100%
            </button>
          </div>

          <button
            onClick={() => setIsStudioMode(!isStudioMode)}
            className={`px-3 py-1.5 rounded-[10px] text-[12px] font-medium flex items-center space-x-1 transition-colors ${isStudioMode ? 'bg-[#f3a833]/20 text-[#f3a833]' : 'bg-[#141414] text-slate-400 hover:bg-[#1f1f1f]'}`}
          >
            <Settings className="w-4 h-4" />
            <span>Studio Mode: {isStudioMode ? 'ON' : 'OFF'}</span>
          </button>

          <Button
            variant="outlined"
            onClick={() => setAiDrawerOpen(true)}
            startIcon={<AutoAwesome />}
            sx={{
              color: "#c084fc",
              borderColor: "rgba(192, 132, 252, 0.5)",
              "&:hover": { borderColor: "#c084fc", bgcolor: "rgba(192, 132, 252, 0.1)" },
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 10
            }}
          >
            AI Data
          </Button>

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
              borderRadius: 10
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
          mode={id === "new" ? "doc" : "edit-doc"}
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
              borderRadius: 10
            }}
          >
            {saving ? "Generating & Saving..." : "Generate Final PDF"}
          </Button>
        </Box>
      </Drawer>

      {/* Right Drawer for AI Response Recovery */}
      <Drawer
        anchor="right"
        open={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: "50%" },
            bgcolor: "#111111",
            color: "#f8fafc",
            borderLeft: "1px solid rgba(192, 132, 252, 0.2)",
            boxShadow: "-10px 0 40px rgba(0,0,0,0.8)"
          }
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#0a0a0a" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AutoAwesome sx={{ color: "#c084fc" }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#f8fafc" }}>
              Original AI Response
            </Typography>
          </Box>
          <IconButton onClick={() => setAiDrawerOpen(false)} sx={{ color: "#94a3b8" }}>
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ p: 3, flex: 1, overflowY: "auto" }}>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 4 }}>
            Here is the raw AI response that was initially generated. If you deleted a section from the visual editor, you can copy its original content from here and recreate it.
          </Typography>

          {originalAiResponse && Array.isArray(originalAiResponse) ? (
            <Stack spacing={3}>
              {originalAiResponse.map((sec, idx) => (
                <Box key={idx} sx={{ p: 3, bgcolor: "#1a1a1a", borderRadius: 2, border: "1px solid rgba(255,255,255,0.05)", position: "relative" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box>
                      <Chip label={sec.type} size="small" sx={{ mb: 1, bgcolor: "rgba(192,132,252,0.1)", color: "#c084fc", fontWeight: 600, textTransform: "uppercase", fontSize: "10px" }} />
                      {sec.title && (
                        <Typography variant="h6" sx={{ color: "#f3a833", fontWeight: 700 }}>
                          {sec.title}
                        </Typography>
                      )}
                    </Box>
                    <IconButton
                      onClick={async () => {
                        try {
                          const htmlBlob = new Blob([sec.content || ""], { type: "text/html" });
                          const textBlob = new Blob([(sec.content || "").replace(/<[^>]+>/g, '')], { type: "text/plain" });
                          const data = [new ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob })];
                          await navigator.clipboard.write(data);
                          dispatch(showToast({ message: "Content copied to clipboard!", severity: "success" }));
                        } catch (err) {
                          // Fallback
                          navigator.clipboard.writeText(sec.content || "");
                          dispatch(showToast({ message: "Content copied!", severity: "success" }));
                        }
                      }}
                      sx={{ color: "#94a3b8", "&:hover": { color: "#c084fc", bgcolor: "rgba(192,132,252,0.1)" } }}
                      title="Copy HTML Content"
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", mb: 2 }} />
                  {sec.content ? (
                    <Box
                      className="ai-response-content"
                      dangerouslySetInnerHTML={{ __html: sec.content }}
                      sx={{
                        color: "#cbd5e1",
                        fontSize: "14px",
                        lineHeight: 1.6,
                        "& p": { m: 0, mb: 1 },
                        "& ul, & ol": { pl: 3, mt: 0, mb: 1 },
                        "& li": { mb: 0.5 }
                      }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ color: "#64748b", fontStyle: "italic" }}>
                      No content
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          ) : (
            <Box sx={{ p: 4, textAlign: "center", bgcolor: "#1a1a1a", borderRadius: 2, border: "1px solid rgba(255,255,255,0.05)" }}>
              <Typography variant="body1" sx={{ color: "#94a3b8" }}>
                No AI response data found for this proposal.
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Toast notifications handled globally by GlobalToast via Redux */}
    </Box>
  );
}
