// src/components/PdfPage2.jsx
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
  Rect,
  Defs,
  LinearGradient,
  Stop,
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
} from "@mui/material";
import {
  Save,
  RefreshOutlined,
  Warning as WarningIcon,
  Add,
  Delete,
  Edit,
} from "@mui/icons-material";
import {
  setSections,
  updateSection,
  addSection,
  deleteSection,
  resetPage2,
} from "../src/utils/page2Slice";
import axiosInstance from "../src/utils/axiosInstance";
import { showToast } from "../src/utils/toastSlice";

// ====================== PDF STYLES ======================
const styles = StyleSheet.create({
  page: {
    position: "relative",
    fontFamily: "Helvetica",
    paddingTop: 120, // Space for fixed header
    paddingBottom: 90, // Space for fixed footer
    paddingHorizontal: 60,
  },

  // Fixed Header (repeats on every page)
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  headerSvg: {
    width: "100%",
    height: 70,
  },
  headerLogo: {
    position: "absolute",
    right: 24,
    top: 10,
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "#fff",
  },

  // Logo + Company Name (below header)
  logoContainer: {
    marginTop: 20,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoTextContainer: {
    flexDirection: "column",
  },
  logoTitle: {
    color: "#FF8C00",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  logoSubtitle: {
    color: "#000",
    fontSize: 9,
    letterSpacing: 2,
  },

  dividerLine: {
    width: "100%",
    height: 1,
    backgroundColor: "#000",
    marginBottom: 25,
  },

  sectionContainer: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 10,
  },
  sectionDesc: {
    fontSize: 13,
    lineHeight: 1.8,
    color: "#4a4a4a",
  },
  sectionDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#ddd",
    marginTop: 18,
  },

  // Fixed Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 60,
    right: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 10,
    color: "#666",
  },
  pageNumber: {
    fontSize: 10,
    color: "#666",
  },
});

// ====================== PDF DOCUMENT (WITH REPEATING HEADER) ======================
const PdfDocument2 = ({ sections }) => (
  <Document>
    <Page size="A4" style={styles.page} wrap>
      {/* ====== FIXED HEADER ON EVERY PAGE ====== */}
      {/* ====== BEST & SAFEST HEADER (No Gradient = Zero Errors) ====== */}
      <View fixed style={styles.header}>
        <Svg
          width="100%"
          height="70"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <Polygon points="0,0 100,0 65,100 0,100" fill="#FF8C00" />
          <Polygon points="85,0 100,0 100,100 70,100" fill="#1A1A1A" />
        </Svg>
        <Image style={styles.headerLogo} src="/download.jpg" />
      </View>

      {/* ====== Company Logo + Name (Only on first page - optional) ====== */}
      <View style={styles.logoContainer}>
        <Image style={styles.logo} src="/download.jpg" />
        <View style={styles.logoTextContainer}>
          <Text style={styles.logoTitle}>HUMANTEK</Text>
          <Text style={styles.logoSubtitle}>IT SERVICES & SOLUTIONS</Text>
        </View>
      </View>

      <View style={styles.dividerLine} />

      {/* ====== ALL SECTIONS (auto wrap + clean page break) ====== */}
      {sections.map((section, index) => (
        <View
          key={section.id}
          style={styles.sectionContainer}
          // Optional: Force new page after every 4-5 sections if needed
          // break={index > 0 && index % 5 === 0}
        >
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionDesc}>{section.desc}</Text>
          {index < sections.length - 1 && (
            <View style={styles.sectionDivider} />
          )}
        </View>
      ))}

      {/* ====== FIXED FOOTER ON EVERY PAGE ====== */}
      {/* <View fixed style={styles.footer}>
        <Text style={styles.footerText}>
          © 2025 Humantek IT Services & Solutions
        </Text>
        <Text
          render={({ pageNumber }) => `Page ${pageNumber + 1}`}
          style={styles.pageNumber}
        />
      </View> */}
    </Page>
  </Document>
);

// ====================== MAIN COMPONENT (UNCHANGED LOGIC) ======================
const PdfPage2 = ({ mode = "dev", selectedFont = "'Poppins', sans-serif" }) => {
  const dispatch = useDispatch();
  const sections = useSelector((state) => state.page2.sections);

  const [localSections, setLocalSections] = useState(sections);
  const [editingId, setEditingId] = useState(null);
  const [newSection, setNewSection] = useState({ title: "", desc: "" });
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    setLocalSections(sections);
  }, [sections]);

  const handleEditToggle = (id) => {
    setEditingId(editingId === id ? null : id);
  };

  const handleSectionChange = (id, field, value) => {
    setLocalSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveSection = (id) => {
    const section = localSections.find((s) => s.id === id);
    dispatch(updateSection({ id, title: section.title, desc: section.desc }));
    setEditingId(null);
    dispatch(
      showToast({
        message: "Section updated successfully",
        severity: "success",
      })
    );
  };

  const handleDeleteSection = (id) => {
    dispatch(deleteSection(id));
    dispatch(showToast({ message: "Section deleted", severity: "info" }));
  };

  const handleAddSection = () => {
    if (!newSection.title.trim()) return;
    const section = {
      id: Date.now(),
      title: newSection.title,
      desc: newSection.desc,
    };
    dispatch(addSection(section));
    setNewSection({ title: "", desc: "" });
    dispatch(
      showToast({ message: "Section added successfully", severity: "success" })
    );
  };

  const handleReset = async () => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    try {
      dispatch(resetPage2());
      await axiosInstance.post(`/api/proposals/pages/reset/page2/${user.id}`);
      setShowResetDialog(false);
      setEditingId(null);
      setNewSection({ title: "", desc: "" });
      dispatch(
        showToast({ message: "Page reset to default", severity: "success" })
      );
    } catch (err) {
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
      "&.Mui-focused fieldset": { borderColor: "#FF8C00" },
    },
    "& .MuiInputBase-input": { fontFamily: selectedFont },
    "& .MuiInputLabel-root": { fontFamily: selectedFont },
    "& .MuiInputLabel-root.Mui-focused": { color: "#FF8C00" },
  };

  // ====================== DEV MODE (Editor + Preview) ======================
  if (mode === "dev") {
    return (
      <Box
        sx={{ width: "100%", height: "100vh", display: "flex", gap: 3, p: 3 }}
      >
        {/* Left: Editor */}
        <Paper
          elevation={3}
          sx={{
            width: "450px",
            p: 3,
            overflowY: "auto",
            backgroundColor: "#f9f9f9",
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#FF8C00",
                  fontFamily: selectedFont,
                }}
              >
                Edit Page 2 - Additional Info
              </Typography>
              <Divider sx={{ my: 1 }} />
            </Box>

            <Button
              variant="outlined"
              color="warning"
              startIcon={<RefreshOutlined />}
              onClick={() => setShowResetDialog(true)}
              fullWidth
            >
              Reset to Default
            </Button>

            <Divider />

            {/* Existing Sections */}
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Existing Sections
            </Typography>
            {localSections.map((section) => (
              <Paper
                key={section.id}
                elevation={2}
                sx={{
                  p: 2,
                  backgroundColor:
                    editingId === section.id ? "#fff3e0" : "#fff",
                }}
              >
                {editingId === section.id ? (
                  <Stack spacing={2}>
                    <TextField
                      label="Title"
                      value={section.title}
                      onChange={(e) =>
                        handleSectionChange(section.id, "title", e.target.value)
                      }
                      sx={textFieldSx}
                    />
                    <TextField
                      multiline
                      rows={4}
                      label="Description"
                      value={section.desc}
                      onChange={(e) =>
                        handleSectionChange(section.id, "desc", e.target.value)
                      }
                      sx={textFieldSx}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={() => handleSaveSection(section.id)}
                        sx={{
                          bgcolor: "#FF8C00",
                          "&:hover": { bgcolor: "#e67e00" },
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {section.title}
                      </Typography>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleEditToggle(section.id)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteSection(section.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ color: "#666", mt: 1 }}>
                      {section.desc.substring(0, 120)}...
                    </Typography>
                  </>
                )}
              </Paper>
            ))}

            <Divider />

            {/* Add New Section */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Add New Section
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Title"
                  value={newSection.title}
                  onChange={(e) =>
                    setNewSection({ ...newSection, title: e.target.value })
                  }
                  sx={textFieldSx}
                />
                <TextField
                  multiline
                  rows={3}
                  label="Description"
                  value={newSection.desc}
                  onChange={(e) =>
                    setNewSection({ ...newSection, desc: e.target.value })
                  }
                  sx={textFieldSx}
                />
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddSection}
                  disabled={!newSection.title.trim()}
                  sx={{ bgcolor: "#FF8C00", "&:hover": { bgcolor: "#e67e00" } }}
                >
                  Add Section
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>

        {/* Right: PDF Preview */}
        <Box sx={{ flex: 1, border: "2px solid #ddd", borderRadius: 2 }}>
          <PDFViewer style={{ width: "100%", height: "100%" }}>
            <PdfDocument2 sections={localSections} />
          </PDFViewer>
        </Box>

        {/* Reset Dialog */}
        <Dialog
          open={showResetDialog}
          onClose={() => setShowResetDialog(false)}
        >
          <DialogTitle>
            <WarningIcon color="warning" sx={{ mr: 1 }} /> Confirm Reset
          </DialogTitle>
          <DialogContent>
            <Typography>Are you sure? All changes will be lost.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowResetDialog(false)}>Cancel</Button>
            <Button onClick={handleReset} variant="contained" color="warning">
              Reset
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // ====================== PRODUCTION MODE (Full PDF) ======================
  return (
    <Box sx={{ width: "100%", height: "100vh" }}>
      <PDFViewer style={{ width: "100%", height: "100%" }}>
        <PdfDocument2 sections={localSections} />
      </PDFViewer>
    </Box>
  );
};

export { PdfDocument2, PdfPage2 };
