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
  Switch,
  FormControlLabel,
  Stack,
} from "@mui/material";
import {
  Visibility,
  Edit,
  Download,
  Description,
  AutoFixHigh,
} from "@mui/icons-material";

// IMPORT YOUR EDITORS
import PdfPage1Editor from "./Editor1";
import PdfPage2Editor from "./Editor2";
import PdfPageEditor2 from "./Editor3";
import PdfPricingEditor from "./Editor4";
import PdfPaymentTermsEditorPage from "./Editor5";

import { useSelector, useDispatch } from "react-redux"; // ← dispatch add kiya
import {
  setDBDataP2,
  setMode,
  toggleInclusion as togglePage2Inclusion,
} from "./utils/page2Slice"; // ← yeh action import kiya

import { pdf } from "@react-pdf/renderer";
import CombinedPdfDocument from "./CombinedPdf";

// PDF Viewer
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import axiosInstance from "./utils/axiosInstance";
import {
  setDBDataP3,
  setMode2,
  toggleAboutPageInclusion,
} from "./utils/page3Slice";
import {
  setDBDataPricing,
  setMode3,
  togglePricingPageInclusion,
} from "./utils/pricingReducer";
import {
  setDBTerms,
  setMode4,
  togglePaymentPageInclusion,
} from "./utils/paymentTermsPageSlice";
import { setDBData, setMode1 } from "./utils/page1Slice";

const UnifiedPdfEditor = ({ pdfPages, mode = "doc" }) => {
  const dispatch = useDispatch(); // ← add kiya
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const [viewMode, setViewMode] = useState("split");
  const [activeTab, setActiveTab] = useState(0);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log("mode", mode);
  const formDataRT = useSelector((state) => state.proposal);
  const isEditMode = mode === "edit-doc";

  // // Edit mode mein DB data load karo
  useEffect(() => {
    if (isEditMode && pdfPages?.page1) {
      dispatch(setDBData(pdfPages.page1));
    }
    if (isEditMode && pdfPages?.page3) {
      dispatch(setDBDataP2(pdfPages.page3));
    }

    if (isEditMode && pdfPages?.page2) {
      dispatch(setDBDataP3(pdfPages.page2));
    }

    if (isEditMode && pdfPages?.pricingPage) {
      dispatch(setDBDataPricing(pdfPages.pricingPage));
    }
       if (isEditMode && pdfPages?.paymentTerms) {
        dispatch(setDBTerms(pdfPages.paymentTerms));
      }
  }, [isEditMode, pdfPages, dispatch]);



  useEffect(() => {
    if (mode === "edit-doc") {
      dispatch(setMode("edit"));
      dispatch(setMode1("edit"));
      dispatch(setMode2("edit"));
      dispatch(setMode3("edit"));
      dispatch(setMode4("edit"));
    } else {
      console.log("else");
      dispatch(setMode("create"));
      dispatch(setMode1("create"));
      dispatch(setMode2("create"));
      dispatch(setMode3("create"));
      dispatch(setMode4("create"));
    }
  }, [dispatch, mode]);

  // Redux Data
  console.log(
    "3444444444444",
    useSelector((s) => s.pricing)
  );
  // ✅ Direct access without currentMode variable
  const page1 = useSelector((s) =>
    isEditMode ? s.page1Slice.edit : s.page1Slice.create
  );
  const page2 = isEditMode
    ? useSelector((s) => s.page3.edit)
    : useSelector((s) => s.page3.create);
  const page3 = useSelector((s) =>
    isEditMode ? s.page2.edit : s.page2.create
  );
  console.log("page2", page2);
  console.log("page3", page3);
  const pricingPage = isEditMode ? useSelector((s) => s.pricing.edit) : useSelector((s) => s.pricing.create);
  const paymentTerms = isEditMode ? useSelector((s) => s.paymentTerms.edit) : useSelector((s) => s.paymentTerms.create);
  const contactPage = useSelector((s) => s.contact);

  // Safe page counts
  const page3Pages = useMemo(
    () => Math.max(1, page3?.currentPages || 1),
    [page3?.currentPages]
  );
  const pricingPages = useMemo(
    () => Math.max(1, pricingPage?.currentPages || 1),
    [pricingPage?.currentPages]
  );
  const paymentPages = useMemo(
    () => Math.max(1, paymentTerms?.currentPages || 1),
    [paymentTerms?.currentPages]
  );

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
    const currentPage = pages[activeTab];
    if (!currentPage) return 0;

    const map = {
      "Cover Page": pageOffsets.coverPage,
      "About HT": pageOffsets.aboutHT,
      "Additional Info": pageOffsets.additionalInfo,
      Pricing: pageOffsets.pricing,
      "Payment Terms": pageOffsets.paymentTerms,
      Contact: pageOffsets.contact,
    };
    return map[currentPage.name] ?? 0;
  }, [activeTab, pageOffsets]);

  // Jab bhi koi page hide/show ho → activeTab safe rakho

  const pages = useMemo(
    () => [
      { name: "Cover Page", editor: () => <PdfPage1Editor mode={mode} /> },
      { name: "About HT", editor: () => <PdfPage2Editor mode={mode} /> },
      { name: "Additional Info", editor: () => <PdfPageEditor2 mode={mode} /> },
      { name: "Pricing", editor: () => <PdfPricingEditor mode={mode} /> },
      {
        name: "Payment Terms",
        editor: () => <PdfPaymentTermsEditorPage mode={mode} />,
      },
      { name: "Contact", editor: null },
    ],
    [mode]
  );
  const visiblePages = useMemo(() => {
    return pages.filter((page, index) => {
      if (index === 1 && page2?.includeInPdf === false) return false; // About HT
      if (page.name === "Additional Info" && page3?.includeInPdf === false)
        return false;
      if (page.name === "Pricing" && pricingPage?.includeInPdf === false)
        return false;
      if (page.name === "Payment Terms" && paymentTerms?.includeInPdf === false)
        return false;
      return true;
    });
  }, [
    pages,
    page2?.includeInPdf,
    page3?.includeInPdf,
    pricingPage?.includeInPdf,
    paymentTerms?.includeInPdf,
  ]);
  useEffect(() => {
    if (visiblePages.length === 0) return;

    const currentPage = pages[activeTab];
    const isCurrentVisible = visiblePages.includes(currentPage);

    if (!isCurrentVisible) {
      // Agar current tab hide ho gaya → first visible tab pe jao
      const newIndex = pages.indexOf(visiblePages[0]);
      setActiveTab(newIndex);
    }
  }, [visiblePages, activeTab, pages]);
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
        />
      ).toBlob();

      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error("PDF Generation Error:", e);
    } finally {
      setLoading(false);
    }
  }, [
    page1,
    page2,
    page3,
    pricingPage,
    paymentTerms,
    contactPage,
    formDataRT,
    pdfUrl,
  ]);

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
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f8f9ff",
        borderRadius: 10,
      }}
    >
      {/* Super Clean Top Toolbar */}
      <Paper
        elevation={12}
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: 5,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          boxShadow: "0 8px 32px rgba(102,126,234,0.4)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={(_, v) => v && setViewMode(v)}
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              "& .MuiToggleButton-root": {
                color: "white",
                "&.Mui-selected": {
                  bgcolor: "rgba(255,255,255,0.3)",
                  fontWeight: 700,
                },
              },
            }}
          >
            <ToggleButton value="edit">Edit</ToggleButton>
            <ToggleButton value="split">Split</ToggleButton>
            <ToggleButton value="preview">Preview</ToggleButton>
          </ToggleButtonGroup>

          {(viewMode === "edit" || viewMode === "split") && (
            <Chip
              icon={<AutoFixHigh fontSize="small" />}
              label={`Page ${mapTabToPdfPage() + 1} / ${
                pageOffsets.contact + 1
              }`}
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.25)",
                color: "white",
                fontWeight: 600,
              }}
            />
          )}
        </Stack>
      </Paper>

      {/* Tabs */}
      <Paper elevation={8} sx={{ borderRadius: 0 }}>
        {(viewMode === "edit" || viewMode === "split") && (
          <Tabs
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
            {visiblePages.map((page) => {
              const index = pages.indexOf(page);
              return <Tab key={index} label={page.name} value={index} />;
            })}
          </Tabs>
        )}
      </Paper>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          overflow: "hidden",
        }}
      >
        {/* Editor Panel with Page Switches Inside */}
        {(viewMode === "edit" || viewMode === "split") && (
          <Paper
            sx={{
              width: { xs: "100%", md: viewMode === "edit" ? "100%" : "50%" },
              overflowY: "auto",
              bgcolor: "#fdfbff",
              borderRight:
                viewMode === "split" ? "3px solid #667eea33" : "none",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Page Inclusion Switches – Ab Editor ke andar hi */}

            <Paper
              elevation={2}
              sx={{
                m: 2,
                p: 2,
                borderRadius: 3,
                bgcolor: "#e8f5e8",
                border: "1px solid #4caf50",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                color="success.dark"
                mb={1.5}
              >
                Include Pages in PDF
              </Typography>
              <Stack spacing={1.5}>
                {[
                  {
                    name: "Additional Info",
                    state: page3?.includeInPdf,
                    action: togglePage2Inclusion,
                  },
                  {
                    name: "About HT",
                    state: page2?.includeInPdf,
                    action: toggleAboutPageInclusion,
                  },
                  {
                    name: "Pricing",
                    state: pricingPage?.includeInPdf,
                    action: togglePricingPageInclusion,
                  },
                  {
                    name: "Payment Terms",
                    state: paymentTerms?.includeInPdf,
                    action: togglePaymentPageInclusion,
                  },
                ].map((item) => (
                  <Stack
                    key={item.name}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={item.state ?? true}
                          onChange={() => dispatch(item.action())}
                          color="success"
                        />
                      }
                      label={
                        <Typography variant="body2">{item.name}</Typography>
                      }
                      sx={{ m: 0 }}
                    />
                    <Chip
                      label={item.state === false ? "Hidden" : "Included"}
                      color={item.state === false ? "error" : "success"}
                      size="small"
                      sx={{ width: 82 }}
                    />
                  </Stack>
                ))}
              </Stack>
            </Paper>

            {/* Actual Page Editor */}
            <Box sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
              {pages[activeTab].editor ? (
                React.createElement(pages[activeTab].editor)
              ) : (
                <Box sx={{ textAlign: "center", mt: 10, color: "#aaa" }}>
                  <Description sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6">
                    Preview only — editing not available for{" "}
                    <b>{pages[activeTab]?.name}</b>
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        )}

        {/* PDF Preview – Same as before */}
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
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ff6b6b",
                }}
              >
                <Typography variant="h5">Failed to generate PDF</Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Optional tiny debug bar (can be removed anytime) */}
      <Paper
        sx={{ p: 0.8, bgcolor: "rgba(102,126,234,0.08)", fontSize: "0.75rem" }}
      >
        <Typography variant="caption" color="#667eea">
          Pages: Info:{page3Pages} | Pricing:{pricingPages} | Payment:
          {paymentPages}
        </Typography>
      </Paper>
    </Box>
  );
};

export default UnifiedPdfEditor;
