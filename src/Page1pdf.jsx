// src/components/PdfPage1.jsx
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
  Defs,
  LinearGradient,
  Stop,
  Rect,
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
} from "@mui/material";
import {
  Edit,
  Save,
  RefreshOutlined,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  setBrandName,
  setBrandTagline,
  setProjectBrief,
  resetPage1,
} from "../src/utils/page1Slice";
import axiosInstance from "../src/utils/axiosInstance";
import { showToast } from "../src/utils/toastSlice";

// PDF Styles - Exact match to Page2BrandedCover
const styles = StyleSheet.create({
  page: {
    position: "relative",
    fontFamily: "Helvetica",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
  },
  logoContainer: {
    position: "absolute",
    top: 100,
    left: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  logoTextContainer: {
    flexDirection: "column",
  },
  logoTitle: {
    color: "#FF8C00",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  logoSubtitle: {
    color: "#fff",
    fontSize: 10,
    letterSpacing: 2.5,
  },
  mainContainer: {
    position: "absolute",
    top: 380,
    left: 50,
    right: 60,
  },
  brandNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  brandName: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  decorativeLine: {
    width: 300,
    height: 5,
    left:3
  },
  brandTagline: {
    color: "#FF8C00",
    fontSize: 76,
    fontWeight: "bold",
    lineHeight: 1.1,
    marginTop: 10,
    marginBottom: 30,
  },
  proposalBy: {
    color: "#FFF",
    fontSize: 15,
    left:10,
    fontWeight: "bold",
    marginTop: 40,
  },
  proposalByOrange: {
    color: "#FF8C00",
  },
});

// PDF Document Component
const PdfDocument = ({ brandName, brandTagline }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Background Image - Must be first */}
      <View style={styles.backgroundImage}>
        <Image src="/newBg.png" style={{ width: "100%", height: "100%" }} />
      </View>

      {/* Logo - Top Left */}
      <View style={styles.logoContainer}>
        <Image style={styles.logo} src="/download.jpg" />
        <View style={styles.logoTextContainer}>
          <Text style={styles.logoTitle}>HUMANTEK</Text>
          <Text style={styles.logoSubtitle}>IT SERVICES & SOLUTIONS</Text>
        </View>
      </View>

      {/* Main Content - Vertically Centered */}
      <View style={styles.mainContainer}>
        {/* Brand Name */}
        <View style={styles.brandNameContainer}>
          <Text style={styles.brandName}>{brandName}</Text>
            {/* Decorative Line - SVG Gradient */}
        <View style={styles.decorativeLine}>
          <Svg width="300" height="4">
            <Defs>
              <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#FFA94D" stopOpacity="1" />
                <Stop offset="50%" stopColor="#FFD9A3" stopOpacity="1" />
                <Stop offset="100%" stopColor="#FFD9A3" stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="400" height="5" fill="url(#grad)" rx="2" />
          </Svg>
        </View>
        </View>
        
      

        {/* Brand Tagline - Large */}
        <Text style={styles.brandTagline}>{brandTagline}</Text>

        {/* Proposal By */}
        <Text style={styles.proposalBy}>
          Proposal by <Text style={styles.proposalByOrange}>Humantek</Text>
        </Text>
      </View>
    </Page>
  </Document>
);

// Main Component with Edit Mode
const PdfPage1 = ({ mode = "dev", selectedFont = "'Poppins', sans-serif" }) => {
  const dispatch = useDispatch();
  const pageDataRT = useSelector((state) => state.page1Slice);

  // Local state synced with Redux
  const [data, setData] = useState({
    brandName: pageDataRT.brandName,
    brandTagline: pageDataRT.brandTagline,
    projectBrief: pageDataRT.projectBrief,
  });

  const [showResetDialog, setShowResetDialog] = useState(false);

  // Keep local state synced with Redux
  useEffect(() => {
    setData({
      brandName: pageDataRT.brandName,
      brandTagline: pageDataRT.brandTagline,
      projectBrief: pageDataRT.projectBrief,
    });
  }, [pageDataRT.brandName, pageDataRT.brandTagline, pageDataRT.projectBrief]);

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (field) => {
    if (field === "brandName") {
      dispatch(setBrandName(data.brandName));
    } else if (field === "brandTagline") {
      dispatch(setBrandTagline(data.brandTagline));
    } else if (field === "projectBrief") {
      dispatch(setProjectBrief(data.projectBrief));
    }
    dispatch(
      showToast({ message: `${field} updated successfully`, severity: "success" })
    );
  };

  const handleReset = async () => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");

    try {
      dispatch(resetPage1());
      await new Promise((resolve) => setTimeout(resolve, 0));
      await axiosInstance.post(`/api/proposals/pages/reset/page1/${user.id}`);

      setShowResetDialog(false);
      dispatch(
        showToast({ message: "Page reset to default", severity: "success" })
      );
    } catch (err) {
      console.error(err);
      dispatch(
        showToast({ message: "Failed to reset page", severity: "error" })
      );
    }
  };

  const textFieldSx = {
    fontFamily: selectedFont,
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "rgba(0,0,0,0.23)" },
      "&:hover fieldset": { borderColor: "#FF8C00" },
      "&.Mui-focused fieldset": {
        borderColor: "#FF8C00",
        boxShadow: "0 0 0 2px rgba(255,140,0,0.1)",
      },
    },
    "& .MuiInputBase-input": { fontFamily: selectedFont },
    "& .MuiInputLabel-root": { fontFamily: selectedFont },
    "& .MuiInputLabel-root.Mui-focused": { color: "#FF8C00" },
  };

  // Dev Mode - Edit Form + PDF Preview
  if (mode === "dev") {
    return (
      <Box sx={{ width: "100%", height: "100vh", display: "flex", gap: 3, p: 3 }}>
        {/* Left Side - Edit Form */}
        <Paper
          elevation={3}
          sx={{
            width: "400px",
            p: 3,
            overflowY: "auto",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Stack spacing={3}>
            {/* Header */}
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#FF8C00",
                  fontFamily: selectedFont,
                  mb: 1,
                }}
              >
                Edit Page 1
              </Typography>
              <Divider />
            </Box>

            {/* Reset Button */}
            <Button
              fullWidth
              variant="outlined"
              color="warning"
              startIcon={<RefreshOutlined />}
              onClick={() => setShowResetDialog(true)}
            >
              Reset to Default
            </Button>

            {/* Brand Name Field */}
            <Box>
              <TextField
                fullWidth
                label="Brand Name"
                value={data.brandName}
                onChange={(e) => handleChange("brandName", e.target.value)}
                sx={textFieldSx}
              />
              <Button
                fullWidth
                variant="contained"
                startIcon={<Save />}
                onClick={() => handleSave("brandName")}
                sx={{
                  mt: 1,
                  backgroundColor: "#FF8C00",
                  "&:hover": { backgroundColor: "#e67e00" },
                }}
              >
                Save Brand Name
              </Button>
            </Box>

            <Divider />

            {/* Brand Tagline Field */}
            <Box>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Brand Tagline"
                value={data.brandTagline}
                onChange={(e) => handleChange("brandTagline", e.target.value)}
                sx={textFieldSx}
              />
              <Button
                fullWidth
                variant="contained"
                startIcon={<Save />}
                onClick={() => handleSave("brandTagline")}
                sx={{
                  mt: 1,
                  backgroundColor: "#FF8C00",
                  "&:hover": { backgroundColor: "#e67e00" },
                }}
              >
                Save Tagline
              </Button>
            </Box>

            <Divider />

            {/* Info Box */}
            <Paper
              sx={{
                p: 2,
                backgroundColor: "#fff3e0",
                border: "1px solid #FF8C00",
              }}
            >
              <Typography variant="body2" sx={{ color: "#e65100" }}>
                <strong>Tip:</strong> Changes will be reflected in the PDF
                preview on the right after saving.
              </Typography>
            </Paper>
          </Stack>
        </Paper>

        {/* Right Side - PDF Preview */}
        <Box sx={{ flex: 1, border: "2px solid #ddd", borderRadius: 2 }}>
          <PDFViewer style={{ width: "100%", height: "100%", border: "none" }}>
            <PdfDocument
              brandName={data.brandName}
              brandTagline={data.brandTagline}
            />
          </PDFViewer>
        </Box>

        {/* Reset Confirmation Dialog */}
        <Dialog
          open={showResetDialog}
          onClose={() => setShowResetDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WarningIcon color="warning" />
              <Typography variant="h6">Confirm Reset</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to reset this page to default? All your
              changes will be lost.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowResetDialog(false)}>Cancel</Button>
            <Button onClick={handleReset} color="warning" variant="contained">
              Reset
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Production Mode - Full Screen PDF Viewer
  return (
    <Box sx={{ width: "100%", height: "100vh" }}>
      <PDFViewer style={{ width: "100%", height: "100%", border: "none" }}>
        <PdfDocument
          brandName={data.brandName}
          brandTagline={data.brandTagline}
        />
      </PDFViewer>
    </Box>
  );
};

export { PdfDocument, PdfPage1 };