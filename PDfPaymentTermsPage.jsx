// src/components/PdfPaymentTermsPage.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
  Image,
  Svg,
  Polygon,
} from "@react-pdf/renderer";
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Paper,
  Stack,
  Divider,
  IconButton,
  Alert,
} from "@mui/material";
import {
  Save,
  RefreshOutlined,
  Warning as WarningIcon,
  Edit,
  Add,
  Delete,
} from "@mui/icons-material";
import {
  updateTitle,
  addTerm,
  updateTerm,
  deleteTerm,
  resetTerms,
} from "../src/utils/paymentTermsPageSlice";
import axiosInstance from "../src/utils/axiosInstance";
import { showToast } from "../src/utils/toastSlice";

// ====================== PDF STYLES ======================
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    paddingTop: 30,
    paddingBottom: 90,
    paddingHorizontal: 60,
    flexDirection: "column",
  },

  // Header (Fixed on all pages)
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 30,
  },

  // Logo & Title Area
  logoContainer: {
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: { width: 40, height: 40, borderRadius: 20 },
  logoTitle: { color: "#667eea", fontSize: 20, fontWeight: "bold" },
  logoSubtitle: { color: "#000", fontSize: 9 },

  dividerLine: { width: "100%", height: 1, backgroundColor: "#000", marginBottom: 25 },

  // Page Title
  mainTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 30,
    textAlign: "center",
  },

  // Terms List
  termsContainer: {
    marginTop: 20,
    flexGrow: 1,
  },
  termItem: {
    flexDirection: "row",
    marginBottom: 18,
    paddingLeft: 10,
  },
  termNumber: {
    width: 30,
    fontSize: 12,
    fontWeight: "bold",
    color: "#667eea",
  },
  termText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 1.8,
    color: "#333",
    textAlign: "justify",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 60,
    right: 60,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 10, color: "#666" },
  pageNumber: { fontSize: 10, color: "#666" },
});

// ====================== SMART PAGE SPLIT BY HEIGHT ======================
const splitTermsByHeight = (terms) => {
  const MAX_PAGE_HEIGHT = 650; // Maximum content height per page
  const TITLE_HEIGHT = 60; // Title + margin
  const TERM_BASE_HEIGHT = 40; // Base height for each term
  const LOGO_HEIGHT = 60; // Logo container height

  const pages = [];
  let currentPage = [];
  let currentHeight = TITLE_HEIGHT; // Start with title height

  terms.forEach((term, index) => {
    // Calculate term height based on text length
    const lines = Math.ceil(term.length / 70); // ~70 chars per line
    const termHeight = TERM_BASE_HEIGHT + (lines - 1) * 20;

    // Check if adding this term would exceed page height
    if (currentHeight + termHeight > MAX_PAGE_HEIGHT && currentPage.length > 0) {
      pages.push([...currentPage]);
      currentPage = [];
      currentHeight = TITLE_HEIGHT; // Reset for new page
    }

    currentPage.push(term);
    currentHeight += termHeight;
  });

  // Push last page if it has content
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  // If no terms, create empty page
  if (pages.length === 0) {
    pages.push([]);
  }

  return pages;
};

// ====================== PDF DOCUMENT WITH SMART LOGO PLACEMENT ======================
const PdfPaymentTermsDocument = ({ title, terms }) => {
  const pages = splitTermsByHeight(terms);
  const totalPages = pages.length;

  return (
    <Document>
      {pages.map((pageTerms, pageIndex) => {
        const isFirstPage = pageIndex === 0;
        const isLastPage = pageIndex === totalPages - 1;

        // Logo shows on last page if there are terms, otherwise on first page
        const showLogoOnThisPage = (isLastPage && pageTerms.length > 0) || (isFirstPage && totalPages === 1);

        // Calculate starting index for term numbering
        let termStartIndex = 0;
        for (let i = 0; i < pageIndex; i++) {
          termStartIndex += pages[i].length;
        }

        return (
          <Page key={pageIndex} size="A4" style={styles.page}>
            {/* Header - Fixed on all pages */}
            <View fixed style={styles.header}>
              <Svg width="100%" height="70" viewBox="0 0 100 100">
                <Polygon points="0,0 100,0 65,100 0,100" fill="#667eea" />
                <Polygon points="85,0 100,0 100,100 70,100" fill="#1A1A1A" />
              </Svg>
              <Image
                style={{
                  position: "absolute",
                  right: 24,
                  top: 10,
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  borderWidth: 3,
                  borderColor: "#fff"
                }}
                src="/download.jpg"
              />
            </View>

            {/* Title - Show on all pages */}
            <Text style={styles.mainTitle}>{title || "Payment Terms"}</Text>

            {/* Terms Container */}
            <View style={styles.termsContainer}>
              {pageTerms.length > 0 ? (
                pageTerms.map((term, idx) => {
                  const globalIndex = termStartIndex + idx + 1;
                  return (
                    <View key={globalIndex} style={styles.termItem}>
                      <Text style={styles.termNumber}>{globalIndex}.</Text>
                      <Text style={styles.termText}>{term}</Text>
                    </View>
                  );
                })
              ) : isFirstPage ? (
                <Text style={styles.termText}>No payment terms added yet.</Text>
              ) : null}
            </View>

            {/* Logo + Company Name - Smart Placement */}
            {showLogoOnThisPage && (
              <View style={styles.logoContainer}>
                <Image src="/download.jpg" />
                {/* <View>
                  <Text style={styles.logoTitle}>HUMANTEK</Text>
                  <Text style={styles.logoSubtitle}>IT SERVICES & SOLUTIONS</Text>
                </View> */}
              </View>
            )}

            {/* Footer - Fixed on all pages */}
            {/* <View fixed style={styles.footer}>
              <Text style={styles.footerText}>© 2025 Humantek IT Services & Solutions</Text>
              <Text render={({ pageNumber }) => `Page ${pageNumber}`} style={styles.pageNumber} />
            </View> */}
          </Page>
        );
      })}
    </Document>
  );
};

// ====================== MAIN COMPONENT ======================
const PdfPaymentTermsPage = ({
  mode = "dev",
  selectedFont = "'Poppins', sans-serif",
}) => {
  const dispatch = useDispatch();
  const paymentTermsData = useSelector((state) => state.paymentTerms);

  const [localData, setLocalData] = useState({
    title: paymentTermsData.title || "Payment Terms",
    terms: paymentTermsData.terms || [],
  });

  const [editingField, setEditingField] = useState(null);
  const [editingTermIndex, setEditingTermIndex] = useState(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTerm, setNewTerm] = useState("");
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    setLocalData({
      title: paymentTermsData.title || "Payment Terms",
      terms: paymentTermsData.terms || [],
    });
  }, [paymentTermsData]);

  const handleSaveTitle = () => {
    dispatch(updateTitle(localData.title));
    setEditingField(null);
    dispatch(showToast({ message: "Title updated", severity: "success" }));
  };

  const handleAddTerm = () => {
    if (!newTerm.trim()) return dispatch(showToast({ message: "Term cannot be empty", severity: "warning" }));
    dispatch(addTerm(newTerm.trim()));
    setShowAddDialog(false);
    setNewTerm("");
    dispatch(showToast({ message: "Term added", severity: "success" }));
  };

  const handleEditTerm = (index) => {
    setEditingTermIndex(index);
    setEditValue(localData.terms[index]);
  };

  const handleSaveTerm = (index) => {
    if (!editValue.trim()) return dispatch(showToast({ message: "Term cannot be empty", severity: "warning" }));
    dispatch(updateTerm({ index, value: editValue.trim() }));
    setEditingTermIndex(null);
    setEditValue("");
    dispatch(showToast({ message: "Term updated", severity: "success" }));
  };

  const handleDeleteTerm = (index) => {
    if (window.confirm("Delete this term?")) {
      dispatch(deleteTerm(index));
      dispatch(showToast({ message: "Term deleted", severity: "success" }));
    }
  };

  const handleReset = async () => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    try {
      await axiosInstance.post(`/api/proposals/pages/reset/paymentTermsPage/${user.id}`);
      dispatch(resetTerms());
      setShowResetDialog(false);
      dispatch(showToast({ message: "Page reset", severity: "success" }));
    } catch (err) {
      dispatch(showToast({ message: "Failed to reset", severity: "error" }));
    }
  };

  const textFieldSx = {
    fontFamily: selectedFont,
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "rgba(0,0,0,0.23)" },
      "&:hover fieldset": { borderColor: "#667eea" },
      "&.Mui-focused fieldset": { borderColor: "#667eea" },
    },
  };

  const totalPages = splitTermsByHeight(localData.terms).length;

  if (mode === "dev") {
    return (
      <Box sx={{ width: "100%", height: "100vh", display: "flex", gap: 3, p: 3 }}>
        {/* Editor Panel */}
        <Paper elevation={3} sx={{ width: "450px", p: 3, overflowY: "auto", bgcolor: "#f9f9f9" }}>
          <Stack spacing={3}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#667eea" }}>
              Edit Payment Terms
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Pages: {totalPages}
            </Typography>

            <Button variant="contained" color="success" startIcon={<Add />} onClick={() => setShowAddDialog(true)} fullWidth>
              Add New Term
            </Button>

            <Button variant="outlined" color="warning" startIcon={<RefreshOutlined />} onClick={() => setShowResetDialog(true)} fullWidth>
              Reset to Default
            </Button>

            <Divider />

            {/* Title Editor */}
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>Page Title</Typography>
                <IconButton size="small" onClick={() => editingField === "title" ? handleSaveTitle() : setEditingField("title")}>
                  {editingField === "title" ? <Save /> : <Edit />}
                </IconButton>
              </Box>
              {editingField === "title" ? (
                <TextField fullWidth value={localData.title} onChange={e => setLocalData({ ...localData, title: e.target.value })} sx={textFieldSx} />
              ) : (
                <Typography>{localData.title}</Typography>
              )}
            </Paper>

            <Divider />
            <Typography variant="h6" fontWeight={600}>Terms ({localData.terms.length})</Typography>

            {localData.terms.length === 0 ? (
              <Alert severity="info">No terms added yet.</Alert>
            ) : (
              localData.terms.map((term, index) => {
                // Calculate which page this term is on
                const pages = splitTermsByHeight(localData.terms.slice(0, index + 1));
                const termPage = pages.length;

                return (
                  <Paper key={index} elevation={2} sx={{ p: 2, bgcolor: editingTermIndex === index ? "#f5f7ff" : "#fff" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography fontWeight={600} variant="body2">
                        Term {index + 1} (Page {termPage})
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {editingTermIndex === index ? (
                          <IconButton size="small" color="success" onClick={() => handleSaveTerm(index)}><Save fontSize="small" /></IconButton>
                        ) : (
                          <IconButton size="small" color="primary" onClick={() => handleEditTerm(index)}><Edit fontSize="small" /></IconButton>
                        )}
                        <IconButton size="small" color="error" onClick={() => handleDeleteTerm(index)}><Delete fontSize="small" /></IconButton>
                      </Box>
                    </Box>
                    {editingTermIndex === index ? (
                      <TextField fullWidth multiline rows={3} value={editValue} onChange={e => setEditValue(e.target.value)} sx={textFieldSx} />
                    ) : (
                      <Typography variant="body2" color="text.secondary">{term}</Typography>
                    )}
                  </Paper>
                );
              })
            )}
          </Stack>
        </Paper>

        {/* PDF Preview */}
        <Box sx={{ flex: 1, border: "2px solid #ddd", borderRadius: 2 }}>
          <PDFViewer style={{ width: "100%", height: "100%" }}>
            <PdfPaymentTermsDocument title={localData.title} terms={localData.terms} />
          </PDFViewer>
        </Box>

        {/* Add Term Dialog */}
        <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Payment Term</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Term Content"
              value={newTerm}
              onChange={e => setNewTerm(e.target.value)}
              placeholder="Enter payment term details..."
              sx={{ ...textFieldSx, mt: 2 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              The term will be automatically placed on the appropriate page based on content height.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddTerm} variant="contained" color="success">Add Term</Button>
          </DialogActions>
        </Dialog>

        {/* Reset Dialog */}
        <Dialog open={showResetDialog} onClose={() => setShowResetDialog(false)}>
          <DialogTitle><WarningIcon color="warning" sx={{ mr: 1 }} /> Confirm Reset</DialogTitle>
          <DialogContent><Typography>All changes will be lost.</Typography></DialogContent>
          <DialogActions>
            <Button onClick={() => setShowResetDialog(false)}>Cancel</Button>
            <Button onClick={handleReset} variant="contained" color="warning">Reset</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Production Mode
  return (
    <Box sx={{ width: "100%", height: "100vh" }}>
      <PDFViewer style={{ width: "100%", height: "100%" }}>
        <PdfPaymentTermsDocument title={localData.title} terms={localData.terms} />
      </PDFViewer>
    </Box>
  );
};

export { PdfPaymentTermsDocument, PdfPaymentTermsPage };
export default PdfPaymentTermsPage;