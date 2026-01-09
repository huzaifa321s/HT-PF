// src/components/UnifiedPdfEditor.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Document,
  PDFViewer,
} from "@react-pdf/renderer";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Button,
  Typography,
  Divider,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  ExpandMore,
  Visibility,
  Edit,
  Download,
  Description,
} from "@mui/icons-material";
import { PdfPage1 } from "./Page1pdf";
import PdfPage1Editor from "./PDFPage_1Editor";

// // Import all your PDF page components
// import { PdfDocument as Page1 } from "./PdfPage1";
// import { PdfDocument2 as Page2 } from "./PdfPage2";
// import { PdfDocument3 as Page3 } from "./PdfPage3";
// import { PdfDocument4 as Page4 } from "./PdfPage4";

// // Import all your page editors
// import { PdfPage1 } from "./PdfPage1";
// import { PdfPage2 } from "./PdfPage2";
// import { PdfPage3 } from "./PdfPage3";
// import { PdfPage4 } from "./PdfPage4";

// Combined PDF Document with all pages
const CombinedPdfDocument = (mode) => {
  const page1Data = useSelector((state) => state.page1Slice);
  const page2Data = useSelector((state) => state.page2);
  const page3Data = useSelector((state) => state.page3);
  const page4Data = useSelector((state) => state.pricing?.pageData?.["default-pricing-page"]);

  return (
    <Document>
      {/* Page 1 - Cover */}
      {/* <Page1
        brandName={page1Data?.brandName}
        brandTagline={page1Data?.brandTagline}
      /> */}

      <PdfPage1 mode={mode} brandName={page1Data?.brandName}
        brandTagline={page1Data?.brandTagline}/>

      {/* Page 2 - Additional Info */}
      {/* <Page2 sections={page2Data?.sections || []} /> */}

      {/* Page 3 - About Humantek */}
      {/* <Page3
        title={page3Data?.title}
        subtitle={page3Data?.subtitle}
        elements={page3Data?.elements || []}
      /> */}

      {/* Page 4 - Pricing */}
      {/* {page4Data && (
        <Page4
          pageTitle={page4Data.pageTitle}
          heading={page4Data.heading}
          subheading={page4Data.subheading}
          gridPackages={page4Data.gridPackages || []}
        />
      )} */}
    </Document>
  );
};

// Main Unified Editor Component
const UnifiedPdfEditor = () => {
  const [viewMode, setViewMode] = useState("split"); // 'edit', 'preview', 'split'
  const [activeTab, setActiveTab] = useState(0);

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // Page configurations
  const pages = [
    { id: 1, name: "Cover Page", icon: <Description />, editor: PdfPage1Editor },
    // { id: 2, name: "Additional Info", icon: <Description />, editor: PdfPage2 },
    // { id: 3, name: "About Humantek", icon: <Description />, editor: PdfPage3 },
    // { id: 4, name: "Pricing", icon: <Description />, editor: PdfPage4 },
  ];

  const ActiveEditor = pages[activeTab].editor;

  return (
    <Box sx={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Navigation Bar */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 0,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#FF8C00" }}>
          📄 Proposal Editor
        </Typography>

        {/* View Mode Toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="edit">
            <Edit fontSize="small" sx={{ mr: 1 }} />
            Edit Only
          </ToggleButton>
          <ToggleButton value="split">
            <Description fontSize="small" sx={{ mr: 1 }} />
            Split View
          </ToggleButton>
          <ToggleButton value="preview">
            <Visibility fontSize="small" sx={{ mr: 1 }} />
            Preview Only
          </ToggleButton>
        </ToggleButtonGroup>

        <Button
          variant="contained"
          startIcon={<Download />}
          sx={{
            backgroundColor: "#FF8C00",
            "&:hover": { backgroundColor: "#e67e00" },
          }}
        >
          Download PDF
        </Button>
      </Paper>

      {/* Page Navigation Tabs */}
      <Paper elevation={1} sx={{ borderRadius: 0 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": { minHeight: 60 },
            "& .Mui-selected": { color: "#FF8C00" },
            "& .MuiTabs-indicator": { backgroundColor: "#FF8C00" },
          }}
        >
          {pages.map((page, index) => (
            <Tab
              key={page.id}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {page.icon}
                  <Box>
                    <Typography variant="caption" sx={{ display: "block" }}>
                      Page {page.id}
                    </Typography>
                    <Typography variant="body2">{page.name}</Typography>
                  </Box>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* EDIT ONLY MODE */}
        {viewMode === "dev" && (
          <Box sx={{ width: "100%", height: "100%", overflow: "auto", p: 3 }}>
            <ActiveEditor mode="dev" />
          </Box>
        )}

        {/* SPLIT VIEW MODE */}
        {viewMode === "split" && (
          <>
            {/* Left: Editor Panel */}
            <Paper
              elevation={3}
              sx={{
                width: "450px",
                height: "100%",
                overflow: "auto",
                borderRadius: 0,
                borderRight: "2px solid #ddd",
              }}
            >
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  ✏️ Edit Page {activeTab + 1}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <ActiveEditor mode="dev" />
              </Box>
            </Paper>

            {/* Right: PDF Preview */}
            <Box sx={{ flex: 1, height: "100%", backgroundColor: "#f5f5f5" }}>
              <PDFViewer style={{ width: "100%", height: "100%", border: "none" }}>
                <CombinedPdfDocument mode={viewMode} />
              </PDFViewer>
            </Box>
          </>
        )}

        {/* PREVIEW ONLY MODE */}
        {viewMode === "preview" && (
          <Box sx={{ width: "100%", height: "100%" }}>
            <PDFViewer style={{ width: "100%", height: "100%", border: "none" }}>
              <CombinedPdfDocument mode="prod"/>
            </PDFViewer>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// ============= ALTERNATIVE APPROACH: Accordion-Based Editor =============
const AccordionPdfEditor = () => {
  const [expanded, setExpanded] = useState("page1");

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ width: "100%", height: "100vh", display: "flex", gap: 3, p: 3 }}>
      {/* Left: Accordion Editors */}
      <Paper
        elevation={3}
        sx={{
          width: "500px",
          height: "100%",
          overflow: "auto",
          p: 2,
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: "#FF8C00" }}>
          📝 Edit All Pages
        </Typography>

        <Accordion expanded={expanded === "page1"} onChange={handleChange("page1")}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography sx={{ fontWeight: 600 }}>Page 1 - Cover Page</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <PdfPage1 mode="dev" />
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === "page2"} onChange={handleChange("page2")}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography sx={{ fontWeight: 600 }}>Page 2 - Additional Info</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <PdfPage2 mode="dev" />
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === "page3"} onChange={handleChange("page3")}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography sx={{ fontWeight: 600 }}>Page 3 - About Humantek</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <PdfPage3 mode="dev" />
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === "page4"} onChange={handleChange("page4")}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography sx={{ fontWeight: 600 }}>Page 4 - Pricing</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <PdfPage4 mode="dev" pageId="default-pricing-page" />
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Right: Full PDF Preview */}
      <Box sx={{ flex: 1, border: "2px solid #ddd", borderRadius: 2 }}>
        <PDFViewer style={{ width: "100%", height: "100%", border: "none" }}>
          <CombinedPdfDocument />
        </PDFViewer>
      </Box>
    </Box>
  );
};

// ============= ALTERNATIVE APPROACH: Vertical Scroll Editor =============
const VerticalScrollEditor = () => {
  return (
    <Box sx={{ width: "100%", height: "100vh", display: "flex", gap: 3, p: 3 }}>
      {/* Left: Scrollable Editors */}
      <Paper
        elevation={3}
        sx={{
          width: "500px",
          height: "100%",
          overflow: "auto",
          p: 3,
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: "#FF8C00" }}>
          📄 Edit All Pages
        </Typography>

        <Stack spacing={4} divider={<Divider />}>
          {/* Page 1 Section */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Page 1: Cover Page
            </Typography>
            <PdfPage1 mode="dev" />
          </Box>

          {/* Page 2 Section */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Page 2: Additional Info
            </Typography>
            <PdfPage2 mode="dev" />
          </Box>

          {/* Page 3 Section */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Page 3: About Humantek
            </Typography>
            <PdfPage3 mode="dev" />
          </Box>

          {/* Page 4 Section */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Page 4: Pricing
            </Typography>
            <PdfPage4 mode="dev" pageId="default-pricing-page" />
          </Box>
        </Stack>
      </Paper>

      {/* Right: Full PDF Preview */}
      <Box sx={{ flex: 1, border: "2px solid #ddd", borderRadius: 2 }}>
        <PDFViewer style={{ width: "100%", height: "100%", border: "none" }}>
          <CombinedPdfDocument />
        </PDFViewer>
      </Box>
    </Box>
  );
};

export { UnifiedPdfEditor, AccordionPdfEditor, VerticalScrollEditor };
export default UnifiedPdfEditor;