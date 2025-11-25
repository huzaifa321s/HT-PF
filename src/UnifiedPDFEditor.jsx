import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Button,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Visibility, Edit, Download, Description, AutoFixHigh } from "@mui/icons-material";

// IMPORT YOUR EDITORS
import PdfPage1Editor from "./Editor1";
import PdfPage2Editor from "./Editor2";
import PdfPageEditor2 from "./Editor3";
import PdfPricingEditor from "./Editor4";
import PdfPaymentTermsEditorPage from "./Editor5";

import { useSelector } from "react-redux";
import { pdf } from "@react-pdf/renderer";
import CombinedPdfDocument from "./CombinedPdf";

// PDF Viewer
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import axiosInstance from "./utils/axiosInstance";

const UnifiedPdfEditor = () => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const [viewMode, setViewMode] = useState("split");
  const [activeTab, setActiveTab] = useState(0);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const formDataRT = useSelector((state) => state.proposal);

  // Redux Data
  const page1 = useSelector((s) => s.page1Slice);
  const page2 = useSelector((s) => s.page3);
  const page3 = useSelector((s) => s.page2);
  const pricingPage = useSelector((s) => s.pricing);
  const paymentTerms = useSelector((s) => s.paymentTerms);
  const contactPage = useSelector((s) => s.contact);
  
  // Safe page counts
  const page3Pages = useMemo(() => Math.max(1, page3?.currentPages || 1), [page3?.currentPages]);
  const pricingPages = useMemo(() => Math.max(1, pricingPage?.currentPages || 1), [pricingPage?.currentPages]);
  const paymentPages = useMemo(() => Math.max(1, paymentTerms?.currentPages || 1), [paymentTerms?.currentPages]);

  // Page offsets
  const pageOffsets = useMemo(() => {
    return {
      coverPage: 0,
      aboutHT: 1,
      additionalInfo: 2,
      pricing: 3 + page3Pages - 1,
      paymentTerms: 3 + page3Pages + pricingPages - 1,
      contact: 3 + page3Pages + pricingPages + paymentPages - 1,
    };
  }, [page3Pages, pricingPages, paymentPages]);

  const mapTabToPdfPage = useCallback(() => {
    const map = {
      0: pageOffsets.coverPage,
      1: pageOffsets.aboutHT,
      2: pageOffsets.additionalInfo,
      3: pageOffsets.pricing,
      4: pageOffsets.paymentTerms,
      5: pageOffsets.contact,
    };
    return map[activeTab] || 0;
  }, [activeTab, pageOffsets]);

  const pages = useMemo(
    () => [
      { name: "Cover Page", editor: PdfPage1Editor },
      { name: "About HT", editor: PdfPage2Editor },
      { name: "Additional Info", editor: PdfPageEditor2 },
      { name: "Pricing", editor: PdfPricingEditor },
      { name: "Payment Terms", editor: PdfPaymentTermsEditorPage },
      { name: "Contact", editor: null },
    ],
    []
  );

  const generatePdf = useCallback(async () => {
    try {
      setLoading(true);
      const blob = await pdf(
        <CombinedPdfDocument
          paymentTerms={paymentTerms}
          pricingPage={pricingPage}
          page1Data={page1}
          page2Data={page2}
          page3Data={page3}
          contactData={contactPage}
          formDataRT={formDataRT}
        />
      ).toBlob();

      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error("PDF Generation Error:", e);
    } finally {
      setLoading(false);
    }
  }, [page1, page2, page3, pricingPage, paymentTerms, contactPage, formDataRT, pdfUrl]);

  useEffect(() => {
    generatePdf();
  }, []);

  useEffect(() => {
    const timer = setTimeout(generatePdf, 800);
    return () => clearTimeout(timer);
  }, [page1, page2, page3, pricingPage, paymentTerms, contactPage]);
useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/api/get-creds");

        if (res.data?.success && res.data.data) {
          const { name, email } = res.data.data;

          // Only update if values exist
          const updatedData = {};
          if (name) updatedData.yourName = name;
          if (email) updatedData.yourEmail = email;

         
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f8f9ff" }}>
      {/* Premium Toolbar */}
      <Paper
        elevation={12}
        sx={{
          p: 2.5,
          borderRadius: 0,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          boxShadow: "0 8px 32px rgba(102,126,234,0.4)",
          zIndex: 10,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3, alignItems: "center", justifyContent: "space-between" }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, v) => v && setViewMode(v)}
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              borderRadius:10,
              "& .MuiToggleButton-root": {
                color: "white",
                border: "1px solid rgba(255,255,255,0.3)",
                "&.Mui-selected": {
                  bgcolor: "rgba(255,255,255,0.3)",
                  fontWeight: 700,
                  
                },
              },
            }}
          >
            <ToggleButton value="edit" sx={{borderRadius:10}}><Edit sx={{ mr: 1 }} /> Edit Only</ToggleButton>
            <ToggleButton value="split" sx={{borderRadius:10}}><Description sx={{ mr: 1 }} /> Split View</ToggleButton>
            <ToggleButton value="preview" sx={{borderRadius:10}}><Visibility sx={{ mr: 1 }} /> Preview Only</ToggleButton>
          </ToggleButtonGroup>

        {(viewMode === "edit" || viewMode === "split") &&   <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
             <Chip
              icon={<AutoFixHigh />}
              label={`Editor Page ${mapTabToPdfPage() + 1} of ${pageOffsets.contact + 1}`}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 600,
                fontSize: "1rem",
              }}
            />
            
          </Box>}
        </Box>
      </Paper>

      {/* Debug Info Bar */}
      <Paper
        sx={{
          p: 1.5,
          bgcolor: "rgba(102,126,234,0.08)",
          borderBottom: "1px solid rgba(102,126,234,0.2)",
          fontSize: "0.85rem",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
          <Typography variant="caption" color="#667eea" fontWeight={600}>
            Pages → Info: {page3Pages} | Pricing: {pricingPages} | Payment: {paymentPages}
          </Typography>
          <Typography variant="caption" color="#667eea" fontWeight={600}>
            Offsets → Cover:0 | About:1 | Info:2 | Pricing:{pageOffsets.pricing} | Payment:{pageOffsets.paymentTerms} | Contact:{pageOffsets.contact}
          </Typography>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper elevation={8} sx={{ borderRadius: 0 }}>
       {(viewMode === "edit" || viewMode === "split") &&  <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            bgcolor: "white",
            "& .MuiTab-root": {
              fontWeight: 600,
              color: "#667eea",
              "&.Mui-selected": {
                color: "#764ba2",
                bgcolor: "rgba(102,126,234,0.1)",
              },
            },
            "& .MuiTabs-indicator": {
              bgcolor: "#764ba2",
              height: 4,
              borderRadius: 2,
            },
          }}
        >
          {pages.map((p, i) => (
            <Tab key={i} label={p.name} />
          ))}
        </Tabs>}
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: { xs: "column", md: "row" }, overflow: "hidden" }}>
        {/* Editor Panel */}
        {(viewMode === "edit" || viewMode === "split") && (
          <Paper
            sx={{
              width: { xs: "100%", md: viewMode === "edit" ? "100%" : "50%" },
              overflowY: "auto",
              bgcolor: "#fdfbff",
              borderRight: viewMode === "split" ? "3px solid #667eea33" : "none",
              p: { xs: 2, sm: 3 },
            }}
          >
 
            {pages[activeTab].editor ? (
              React.createElement(pages[activeTab].editor)
            ) : (
              <Box sx={{ textAlign: "center", mt: 10, color: "#aaa" }}>
                <Description sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6">Preview only — editing is not available for <b>{pages[activeTab]?.name}</b> page</Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* PDF Preview */}
        {(viewMode === "split" || viewMode === "preview") && (
          <Box
            sx={{
              flex: 1,
              bgcolor: "#1a1a2e",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {loading ? (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ddd",
                }}
              >
                <CircularProgress color="inherit" size={60} thickness={5} />
                <Typography mt={3} variant="h6">
                  loading your proposal...
                </Typography>
              </Box>
            ) : pdfUrl ? (
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer
                  fileUrl={pdfUrl}
                  plugins={[defaultLayoutPluginInstance]}
                  initialPage={mapTabToPdfPage()}
                  defaultScale={viewMode === "preview" ? 1.1 : 1.0}
                  theme="dark"
                />
              </Worker>
            ) : (
              <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff6b6b" }}>
                <Typography variant="h5">Failed to generate PDF</Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UnifiedPdfEditor;