// src/UnifiedPDFEditor.jsx
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
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Visibility,
  Edit,
  Download,
  Description,
  AutoFixHigh,
  Settings,
  ViewQuilt,
  PictureAsPdf,
} from "@mui/icons-material";

// IMPORT YOUR EDITORS
import PdfPage1Editor from "./Editor1";
import PdfPage2Editor from "./Editor2";
import PdfPageEditor2 from "./Editor3";
import PdfPricingEditor from "./Editor4";
import PdfPaymentTermsEditorPage from "./Editor5";

import { useSelector, useDispatch } from "react-redux";
import {
  setDBDataP2,
  setMode,
  toggleInclusion as togglePage2Inclusion,
} from "./utils/page2Slice";

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
  const dispatch = useDispatch();
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isVerySmall = useMediaQuery("(max-width:350px)");

  const [viewMode, setViewMode] = useState("split");
  const [activeTab, setActiveTab] = useState(0);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log("mode", mode);
  const formDataRT = useSelector((state) => state.proposal);
  const isEditMode = mode === "edit-doc";

  // Styles from ProposalFormwithStepper
  const colorScheme = {
    primary: "#667eea",
    secondary: "#764ba2",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#f44336",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    hoverGradient: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
  };

  const cardStyle = {
    mb: 3,
    p: { xs: 0, sm: 3, md: 4 },
    background: "linear-gradient(135deg, #f5f7ff 0%, #f0f2ff 100%)",
    border: "2px solid #e0e7ff",
    borderRadius: 3,
    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.1)",
  };

  // Edit mode mein DB data load karo
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
  const page1 = useSelector((s) =>
    isEditMode ? s.page1Slice.edit : s.page1Slice.create
  );
  const page2 = isEditMode
    ? useSelector((s) => s.page3.edit)
    : useSelector((s) => s.page3.create);
  const page3 = useSelector((s) =>
    isEditMode ? s.page2.edit : s.page2.create
  );
  const pricingPage = isEditMode
    ? useSelector((s) => s.pricing.edit)
    : useSelector((s) => s.pricing.create);
  const paymentTerms = isEditMode
    ? useSelector((s) => s.paymentTerms.edit)
    : useSelector((s) => s.paymentTerms.create);
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
        bgcolor: "#fff",
        borderRadius: 0,
      }}
    >
      {/* Super Clean Top Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 3 },
          background: colorScheme.gradient,
          color: "white",
          borderRadius: 0,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Box display="flex" alignItems="center" width={isMobile ? "100%" : "auto"} justifyContent={isMobile ? "space-between" : "flex-start"}>
            <Box display="flex" alignItems="center">
              <AutoFixHigh sx={{ mr: 1.5, fontSize: { xs: 24, sm: 30 } }} />
              <Box>
                <Typography variant={isMobile ? "subtitle1" : "h5"} fontWeight={800}>
                  Unified Editor
                </Typography>
                {!isVerySmall && (
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Customize proposal
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Mobile View Mode Toggle (Shown here for better space usage on mobile) */}
            {isMobile && (
              <ToggleButtonGroup
                size="small"
                value={viewMode}
                exclusive
                onChange={(_, v) => v && setViewMode(v)}
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.2)",
                  "& .MuiToggleButton-root": {
                    color: "white",
                    px: 1,
                    py: 0.5,
                    border: "none",
                    "&.Mui-selected": {
                      bgcolor: "white",
                      color: colorScheme.primary,
                    },
                  },
                }}
              >
                <ToggleButton value="edit">
                  <Edit fontSize="small" />
                </ToggleButton>
                <ToggleButton value="split">
                  <ViewQuilt fontSize="small" />
                </ToggleButton>
                <ToggleButton value="preview">
                  <PictureAsPdf fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ width: isMobile ? "100%" : "auto", justifyContent: isMobile ? "center" : "flex-end" }}>


            {/* Desktop View Mode Toggle */}
            {!isMobile && (
              <ToggleButtonGroup
                size="small"
                value={viewMode}
                exclusive
                onChange={(_, v) => v && setViewMode(v)}
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,0.2)",
                  "& .MuiToggleButton-root": {
                    color: "white",
                    px: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    border: "none",
                    "&.Mui-selected": {
                      bgcolor: "white",
                      color: colorScheme.primary,
                      fontWeight: 700,
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.9)",
                      },
                    },
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                  },
                }}
              >
                <ToggleButton value="edit">
                  <Edit sx={{ mr: 1, fontSize: 18 }} /> Edit
                </ToggleButton>
                <ToggleButton value="split">
                  <ViewQuilt sx={{ mr: 1, fontSize: 18 }} /> Split
                </ToggleButton>
                <ToggleButton value="preview">
                  <PictureAsPdf sx={{ mr: 1, fontSize: 18 }} /> Preview
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Tabs */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          borderBottom: "1px solid #e0e7ff",
          bgcolor: "#fff",
        }}
      >
        {(viewMode === "edit" || viewMode === "split") && (
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: { xs: 48, sm: 56 },
              "& .MuiTab-root": {
                fontWeight: 600,
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                textTransform: "none",
                color: "text.secondary",
                minHeight: { xs: 48, sm: 56 },
                px: { xs: 2, sm: 3 },
                "&.Mui-selected": {
                  color: colorScheme.primary,
                },
              },
              "& .MuiTabs-indicator": {
                bgcolor: colorScheme.primary,
                height: 3,
                borderRadius: "3px 3px 0 0",
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
          bgcolor: "#f5f7ff", // Light background for content area
        }}
      >
        {/* Editor Panel with Page Switches Inside */}
        {(viewMode === "edit" || viewMode === "split") && (
          <Box
            sx={{
              width: { xs: "100%", md: viewMode === "edit" ? "100%" : "50%" },
              height: { xs: viewMode === "split" ? "50%" : "100%", md: "100%" },
              overflowY: "auto",
              bgcolor: "#fff",
              borderRight:
                viewMode === "split" ? "1px solid #e0e7ff" : "none",
              borderBottom: { xs: viewMode === "split" ? "1px solid #e0e7ff" : "none", md: "none" },
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Page Inclusion Switches – Styled as Card */}
            <Box sx={{ p: { xs: 2, sm: 3 }, pb: 0 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid #e0e7ff",
                  background: "linear-gradient(135deg, #f8f9ff 0%, #fff 100%)",
                }}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Stack direction="row" alignItems="center" mb={2}>
                    <Settings
                      sx={{ color: colorScheme.primary, mr: 1, fontSize: 20 }}
                    />
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color="text.primary"
                    >
                      Page Visibility Settings
                    </Typography>
                  </Stack>

                  <Stack spacing={1}>
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
                      <Box
                        key={item.name}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 1,
                          borderRadius: 2,
                          bgcolor: "white",
                          border: "1px solid #f0f0f0",
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={item.state ?? true}
                              onChange={() => dispatch(item.action())}
                              sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": {
                                  color: colorScheme.primary,
                                  "& + .MuiSwitch-track": {
                                    backgroundColor: colorScheme.primary,
                                  },
                                },
                              }}
                            />
                          }
                          label={
                            <Typography
                              variant="body2"
                              fontWeight={500}
                              color="text.secondary"
                              fontSize={isVerySmall ? "0.75rem" : "0.875rem"}
                            >
                              {item.name}
                            </Typography>
                          }
                          sx={{ m: 0 }}
                        />
                        <Chip
                          label={item.state === false ? "Hidden" : "Visible"}
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            bgcolor:
                              item.state === false
                                ? "rgba(244,67,54,0.1)"
                                : "rgba(76,175,80,0.1)",
                            color:
                              item.state === false
                                ? "#f44336"
                                : "#4caf50",
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            {/* Actual Page Editor */}
            <Box sx={{ flex: 1, p: 0 }}>
              {pages[activeTab].editor ? (
                React.createElement(pages[activeTab].editor)
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    mt: 10,
                    color: "text.secondary",
                    p: 4,
                  }}
                >
                  <Description sx={{ fontSize: 80, mb: 2, opacity: 0.2 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Preview only
                  </Typography>
                  <Typography variant="body2">
                    Editing is not available for <b>{pages[activeTab]?.name}</b>
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* PDF Preview */}
        {(viewMode === "split" || viewMode === "preview") && (
          <Box
            sx={{
              flex: 1,
              height: { xs: viewMode === "split" ? "50%" : "100%", md: "100%" },
              bgcolor: "#2d3436", // Darker background for PDF preview
              overflow: "hidden",
              position: "relative",
              display: "flex",
              flexDirection: "column",
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
                  color: "#fff",
                }}
              >
                <CircularProgress
                  sx={{ color: colorScheme.primary }}
                  size={60}
                  thickness={4}
                />
                <Typography mt={3} variant="h6" fontWeight={500}>
                  Generating PDF Preview...
                </Typography>
              </Box>
            ) : pdfUrl ? (
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer
                  fileUrl={pdfUrl}
                  plugins={[defaultLayoutPluginInstance]}
                  initialPage={mapTabToPdfPage()}
                  defaultScale={isMobile ? 0.5 : (viewMode === "preview" ? 1.1 : 0.9)}
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

      {/* Footer / Status Bar */}
      <Box
        sx={{
          p: 1,
          bgcolor: "#fff",
          borderTop: "1px solid #e0e7ff",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          Page Counts: Info: {page3Pages} | Pricing: {pricingPages} | Payment:{" "}
          {paymentPages}
        </Typography>
      </Box>
    </Box>
  );
};

export default UnifiedPdfEditor;
