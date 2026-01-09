// src/components/PdfPage3.jsx
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Save,
  RefreshOutlined,
  Warning as WarningIcon,
  Edit,
  Add,
} from "@mui/icons-material";
import {
  updateTitle,
  updateSubtitle,
  editElementContent,
  resetPage,
  addElement,
} from "../src/utils/page3Slice";
import axiosInstance from "../src/utils/axiosInstance";
import { showToast } from "../src/utils/toastSlice";

// ====================== PDF STYLES ======================
const styles = StyleSheet.create({
  page: {
    position: "relative",
    fontFamily: "Helvetica",
    paddingTop: 30,
    paddingBottom: 90,
    paddingHorizontal: 60,
    flexDirection: "column",
  },

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 70,
    zIndex: 10,
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

  logoContainer: {
    marginTop: 10,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
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

  titleContainer: {
    textAlign: "center",
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 20,
    textAlign: "left",
  },

  contentArea: {
    flexGrow: 1,
    flexShrink: 1,
  },

  textContent: {
    fontSize: 12,
    lineHeight: 1.8,
    color: "#333",
    marginBottom: 16,
    textAlign: "justify",
  },

  imageContainer: {
    width: "100%",
    maxHeight: 220,
    marginVertical: 18,
    alignItems: "center",
  },
  image: {
    width: "90%",
    height: "auto",
    maxHeight: 220,
    objectFit: "contain",
  },

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

// ====================== HELPER: Split Elements into Pages ======================
const splitElementsIntoPages = (elements) => {
  const pages = [];
  let currentPage = [];
  let currentHeight = 0;
  const MAX_HEIGHT = 600; // Approximate max content height per page

  elements.forEach((element) => {
    let elementHeight = 0;

    if (element.type === "text") {
      // Rough estimate: 12px font, 1.8 line height, ~50 chars per line
      const lines = Math.ceil(element.content.length / 50);
      elementHeight = lines * 12 * 1.8 + 16; // +16 for marginBottom
    } else if (element.type === "image") {
      elementHeight = 220 + 36; // maxHeight + margins
    }

    if (currentHeight + elementHeight > MAX_HEIGHT && currentPage.length > 0) {
      pages.push([...currentPage]);
      currentPage = [];
      currentHeight = 0;
    }

    currentPage.push(element);
    currentHeight += elementHeight;
  });

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages.length > 0 ? pages : [[]];
};

// ====================== PDF DOCUMENT - Multi-Page ======================
const PdfDocument3 = ({ title, subtitle, elements }) => {
  const pages = splitElementsIntoPages(elements);

  return (
    <Document>
      {pages.map((pageElements, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page} wrap={false}>
          {/* Title on first page only */}
          {pageIndex === 0 && (
            <>
              <View style={styles.titleContainer}>
                <Text style={styles.mainTitle}>{title || "About Humantek"}</Text>
              </View>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </>
          )}

          {/* Content Area */}
          <View style={styles.contentArea}>
            {pageElements.length > 0 ? (
              pageElements.map((element) => (
                <View key={element.id}>
                  {element.type === "text" && (
                    <Text style={styles.textContent}>{element.content}</Text>
                  )}
                  {element.type === "image" && (
                    <View style={styles.imageContainer}>
                      <Image style={styles.image} src={element.content} />
                    </View>
                  )}
                </View>
              ))
            ) : (
              pageIndex === 0 && (
                <Text style={styles.textContent}>
                  Welcome to Humantek – Your trusted partner in digital transformation and IT excellence.
                </Text>
              )
            )}
          </View>

          {/* Footer */}
          {/* <View fixed style={styles.footer}>
            <Text style={styles.footerText}>© 2025 Humantek IT Services & Solutions</Text>
            <Text style={styles.pageNumber}>Page {pageIndex + 3}</Text>
          </View> */}
        </Page>
      ))}
    </Document>
  );
};

// ====================== MAIN COMPONENT ======================
const PdfPage3 = ({ mode = "dev", selectedFont = "'Poppins', sans-serif" }) => {
  const dispatch = useDispatch();
  const page3Data = useSelector((state) => state.page3);

  const [localData, setLocalData] = useState({
    title: page3Data.title || "About Humantek",
    subtitle: page3Data.subtitle || "",
    elements: page3Data.elements || [],
  });

  const [editingField, setEditingField] = useState(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newElementType, setNewElementType] = useState("text");
  const [newElementContent, setNewElementContent] = useState("");
  const [targetPageIndex, setTargetPageIndex] = useState(0);

  useEffect(() => {
    setLocalData({
      title: page3Data.title || "About Humantek",
      subtitle: page3Data.subtitle || "",
      elements: page3Data.elements || [],
    });
  }, [page3Data]);

  const handleFieldChange = (field, value) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleElementChange = (id, value) => {
    setLocalData((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === id ? { ...el, content: value } : el
      ),
    }));
  };

  const handleSaveField = (field) => {
    if (field === "title") dispatch(updateTitle(localData.title));
    if (field === "subtitle") dispatch(updateSubtitle(localData.subtitle));
    setEditingField(null);
    dispatch(showToast({ message: "Updated successfully", severity: "success" }));
  };

  const handleSaveElement = (id) => {
    const element = localData.elements.find((el) => el.id === id);
    dispatch(editElementContent({ id, content: element.content }));
    setEditingField(null);
    dispatch(showToast({ message: "Content saved", severity: "success" }));
  };

  const handleAddElement = () => {
    if (!newElementContent.trim()) {
      dispatch(showToast({ message: "Content cannot be empty", severity: "warning" }));
      return;
    }

    const pages = splitElementsIntoPages(localData.elements);
    let insertIndex = 0;

    // Calculate insert position based on target page
    for (let i = 0; i < targetPageIndex && i < pages.length; i++) {
      insertIndex += pages[i].length;
    }

    const newElement = {
      id: `element_${Date.now()}`,
      type: newElementType,
      content: newElementContent,
    };

    dispatch(addElement({ element: newElement, index: insertIndex }));
    
    setShowAddDialog(false);
    setNewElementContent("");
    setTargetPageIndex(0);
    dispatch(showToast({ message: "Element added successfully", severity: "success" }));
  };

  const handleReset = async () => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    try {
      dispatch(resetPage());
      await axiosInstance.post(`/api/proposals/pages/reset/page3/${user.id}`);
      setShowResetDialog(false);
      dispatch(showToast({ message: "Page reset", severity: "success" }));
    } catch (err) {
      dispatch(showToast({ message: "Reset failed", severity: "error" }));
    }
  };

  const textFieldSx = {
    fontFamily: selectedFont,
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "rgba(0,0,0,0.23)" },
      "&:hover fieldset": { borderColor: "#FF8C00" },
      "&.Mui-focused fieldset": { borderColor: "#FF8C00" },
    },
  };

  const totalPages = splitElementsIntoPages(localData.elements).length;

  // ====================== DEV MODE (Editor + Preview) ======================
  if (mode === "dev") {
    return (
      <Box sx={{ width: "100%", height: "100vh", display: "flex", gap: 3, p: 3 }}>
        <Paper elevation={3} sx={{ width: "450px", p: 3, overflowY: "auto", bgcolor: "#f9f9f9" }}>
          <Stack spacing={3}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#FF8C00" }}>
              Edit Page 3 - About Humantek
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Pages: {totalPages}
            </Typography>
            <Divider />

            <Button
              variant="contained"
              color="success"
              startIcon={<Add />}
              onClick={() => setShowAddDialog(true)}
              fullWidth
            >
              Add New Element
            </Button>

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

            {/* Title */}
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle1" fontWeight={600}>Page Title</Typography>
                <IconButton
                  size="small"
                  onClick={() =>
                    editingField === "title"
                      ? handleSaveField("title")
                      : setEditingField("title")
                  }
                >
                  {editingField === "title" ? <Save /> : <Edit />}
                </IconButton>
              </Box>
              {editingField === "title" ? (
                <TextField
                  fullWidth
                  value={localData.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  sx={textFieldSx}
                />
              ) : (
                <Typography>{localData.title}</Typography>
              )}
            </Paper>

            {/* Subtitle */}
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle1" fontWeight={600}>Subtitle</Typography>
                <IconButton
                  size="small"
                  onClick={() =>
                    editingField === "subtitle"
                      ? handleSaveField("subtitle")
                      : setEditingField("subtitle")
                  }
                >
                  {editingField === "subtitle" ? <Save /> : <Edit />}
                </IconButton>
              </Box>
              {editingField === "subtitle" ? (
                <TextField
                  fullWidth
                  value={localData.subtitle}
                  onChange={(e) => handleFieldChange("subtitle", e.target.value)}
                  sx={textFieldSx}
                />
              ) : (
                <Typography>{localData.subtitle || "(No subtitle)"}</Typography>
              )}
            </Paper>

            <Divider />
            <Typography variant="h6" fontWeight={600}>Content Elements</Typography>

            {localData.elements.map((el, index) => {
              // Calculate which page this element is on
              const pages = splitElementsIntoPages(localData.elements.slice(0, index + 1));
              const elementPage = pages.length;

              return (
                <Paper
                  key={el.id}
                  elevation={2}
                  sx={{ p: 2, bgcolor: editingField === el.id ? "#fff3e0" : "#fff" }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography fontWeight={600}>
                      {el.type === "text" ? "Text Block" : "Image"} (Page {elementPage})
                    </Typography>
                    {el.type === "text" && (
                      <IconButton
                        size="small"
                        onClick={() =>
                          editingField === el.id
                            ? handleSaveElement(el.id)
                            : setEditingField(el.id)
                        }
                      >
                        {editingField === el.id ? <Save /> : <Edit />}
                      </IconButton>
                    )}
                  </Box>
                  {el.type === "text" ? (
                    editingField === el.id ? (
                      <TextField
                        fullWidth
                        multiline
                        rows={5}
                        value={el.content}
                        onChange={(e) => handleElementChange(el.id, e.target.value)}
                        sx={textFieldSx}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {el.content.substring(0, 120)}...
                      </Typography>
                    )
                  ) : (
                    <Box
                      sx={{
                        height: 100,
                        bgcolor: "#f0f0f0",
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography color="gray">Image Preview</Typography>
                    </Box>
                  )}
                </Paper>
              );
            })}
          </Stack>
        </Paper>

        {/* PDF Preview */}
        <Box sx={{ flex: 1, border: "2px solid #ddd", borderRadius: 2 }}>
          <PDFViewer style={{ width: "100%", height: "100%" }}>
            <PdfDocument3
              title={localData.title}
              subtitle={localData.subtitle}
              elements={localData.elements}
            />
          </PDFViewer>
        </Box>

        {/* Add Element Dialog */}
        <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Element</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Element Type</InputLabel>
                <Select
                  value={newElementType}
                  onChange={(e) => setNewElementType(e.target.value)}
                  label="Element Type"
                >
                  <MenuItem value="text">Text Block</MenuItem>
                  <MenuItem value="image">Image</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Add to Page</InputLabel>
                <Select
                  value={targetPageIndex}
                  onChange={(e) => setTargetPageIndex(e.target.value)}
                  label="Add to Page"
                >
                  {Array.from({ length: totalPages + 1 }, (_, i) => (
                    <MenuItem key={i} value={i}>
                      Page {i + 1} {i >= totalPages ? "(New Page)" : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={6}
                label={newElementType === "text" ? "Text Content" : "Image URL"}
                value={newElementContent}
                onChange={(e) => setNewElementContent(e.target.value)}
                placeholder={
                  newElementType === "text"
                    ? "Enter your text content here..."
                    : "https://example.com/image.jpg"
                }
                sx={textFieldSx}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddElement} variant="contained" color="success">
              Add Element
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reset Dialog */}
        <Dialog open={showResetDialog} onClose={() => setShowResetDialog(false)}>
          <DialogTitle>
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            Confirm Reset
          </DialogTitle>
          <DialogContent>
            <Typography>All changes will be lost.</Typography>
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

  // ====================== PRODUCTION MODE ======================
  return (
    <Box sx={{ width: "100%", height: "100vh" }}>
      <PDFViewer style={{ width: "100%", height: "100%" }}>
        <PdfDocument3
          title={localData.title}
          subtitle={localData.subtitle}
          elements={localData.elements}
        />
      </PDFViewer>
    </Box>
  );
};

export { PdfDocument3, PdfPage3 };
export default PdfPage3;