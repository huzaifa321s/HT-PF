// src/components/PdfPaymentTermsEditorPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Tooltip,
  Divider,
  Alert,
  useMediaQuery,
} from "@mui/material";

import {
  Add,
  Save,
  Cancel,
  Edit,
  Delete,
  RefreshOutlined,
  Info,
  WarningAmber,
  DescriptionOutlined,
  CheckCircle,
  Receipt, // Added for section header
} from "@mui/icons-material";

import { useSelector, useDispatch } from "react-redux";

import {
  updateTitle,
  addTerm,
  addMultipleTerms,
  updateTerm,
  deleteTerm,
  resetTerms,
} from "../src/utils/paymentTermsPageSlice";

import { showToast } from "../src/utils/toastSlice";
import axiosInstance from "../src/utils/axiosInstance";

const PdfPaymentTermsEditorPage = ({
  selectedFont = "'Poppins', sans-serif",
  mode,
}) => {
  const dispatch = useDispatch();
  const paymentTerms =
    mode === "edit-doc"
      ? useSelector((s) => s.paymentTerms.edit)
      : useSelector((s) => s.paymentTerms.create);

  // ✅ Hooks sab se pehle - top level pe
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const isVerySmall = useMediaQuery("(max-width:400px)");

  const [title, setTitle] = useState("Payment Terms");
  const [terms, setTerms] = useState([]);
  const [editTitleMode, setEditTitleMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTerm, setNewTerm] = useState("");
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    setTitle(paymentTerms.title || "Payment Terms");
    setTerms(paymentTerms.terms || []);
  }, [paymentTerms]);

  const saveTitle = () => {
    dispatch(updateTitle(title));
    setEditTitleMode(false);
    dispatch(showToast({ message: "Title updated!", severity: "success" }));
  };

  const startEditTerm = (i) => {
    setEditIndex(i);
    setEditValue(terms[i]);
  };

  const saveTerm = () => {
    if (!editValue.trim()) {
      return dispatch(
        showToast({ message: "Term cannot be empty", severity: "warning" })
      );
    }
    dispatch(updateTerm({ index: editIndex, value: editValue.trim() }));
    setEditIndex(null);
    dispatch(showToast({ message: "Term updated!", severity: "success" }));
  };

  const addNewTerm = () => {
    if (!newTerm.trim()) {
      return dispatch(
        showToast({ message: "Please enter a term", severity: "warning" })
      );
    }
    dispatch(addTerm(newTerm.trim()));
    dispatch(showToast({ message: "New term added!", severity: "success" }));
    setNewTerm("");
    setShowAddDialog(false);
  };

  const deleteSingleTerm = (i) => {
    dispatch(deleteTerm(i));
    dispatch(showToast({ message: "Term deleted", severity: "info" }));
  };

  const resetAllTerms = async () => {
    setShowResetDialog(false);
  };

  const handleTermsPaste = (e) => {
    const text = e.clipboardData.getData("text");
    if (!text) return;

    // Split by lines
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);

    if (lines.length > 1 || (lines.length === 1 && (text.includes("•") || text.includes("*")))) {
      e.preventDefault();

      // If it's a single line but contains multiple bullets, split by bullets
      let termsToProcess = lines;
      if (lines.length === 1 && (text.includes("•") || text.includes("*"))) {
        termsToProcess = text.split(/[\u2022\*]/).map(t => t.trim()).filter(t => t.length > 0);
      }

      const cleanedTerms = termsToProcess.map(line => {
        return line
          .replace(/^\d+[\.\)]\s*/, "") // Remove "1. " or "1) "
          .replace(/^[\u2022\u25CF\u00B7\*\-\+]\s*/, "") // Remove bullets
          .trim();
      }).filter(line => line.length > 0);

      if (cleanedTerms.length > 0) {
        dispatch(addMultipleTerms(cleanedTerms));
        dispatch(showToast({
          message: `${cleanedTerms.length} terms detected and added!`,
          severity: "success"
        }));
        setShowAddDialog(false);
        setNewTerm("");
      }
    }
  };

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

  const inputStyle = {
    mb: 2,
    fontFamily: selectedFont,
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      background: "#fff",
      "&:hover": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: colorScheme.primary,
        },
      },
    },
  };

  const sectionHeader = (icon, title) => (
    <Box sx={{ display: "flex", alignItems: "center", mb: 3, mt: 2 }}>
      <Box
        sx={{
          p: 1.5,
          mr: 2,
          background: colorScheme.gradient,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {React.cloneElement(icon, {
          sx: { fontSize: 20, color: "#fff" },
        })}
      </Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          background: colorScheme.gradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {title}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        overflowX: "hidden",
        bgcolor: "#fff",
      }}
    >
      <Card sx={cardStyle}>
        <CardContent>
          {sectionHeader(<Receipt />, "Payment Terms Editor")}
          <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
            Define clear payment conditions — updates instantly in your PDF
          </Typography>

          {/* Auto-save Alert */}
          <Alert
            icon={<CheckCircle sx={{ color: "#4caf50" }} />}
            severity="success"
            sx={{
              borderRadius: 4,
              bgcolor: "rgba(76,175,80,0.1)",
              border: "1px solid rgba(76,175,80,0.3)",
              fontWeight: 600,
              mb: 4,
            }}
          >
            All changes are saved automatically and appear instantly in your
            proposal PDF.
          </Alert>

          {/* Action Buttons */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 2, sm: 3 }}
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 4 }}
          >
            <Button
              fullWidth={isSmallScreen}
              variant="outlined"
              startIcon={<RefreshOutlined />}
              onClick={() => setShowResetDialog(true)}
              sx={{
                borderRadius: 10,
                borderColor: colorScheme.primary,
                color: colorScheme.primary,
                fontWeight: 600,
                px: { xs: 3, sm: 4 },
                py: 1.5,
                "&:hover": {
                  borderColor: colorScheme.secondary,
                  bgcolor: "rgba(102,126,234,0.1)",
                },
              }}
            >
              Reset Page
            </Button>

            <Button
              fullWidth={isSmallScreen}
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowAddDialog(true)}
              sx={{
                borderRadius: 10,
                px: { xs: 4, sm: 6 },
                py: 1.5,
                fontWeight: 700,
                background: colorScheme.gradient,
                boxShadow: 6,
                "&:hover": {
                  background: colorScheme.hoverGradient,
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 32px rgba(102,126,234,0.5)",
                },
              }}
            >
              Add New Term
            </Button>
          </Stack>

          {/* Quick Add / Paste Area */}
          <Box sx={{ mb: 5, mt: -1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Fast Paste: Paste multiple terms or bullets here..."
              onPaste={handleTermsPaste}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  bgcolor: "rgba(102, 126, 234, 0.04)",
                  border: "1px dashed #667eea",
                  "&:hover": {
                    bgcolor: "rgba(102, 126, 234, 0.08)",
                  }
                }
              }}
              helperText="Paste multiple lines or a bulleted list to auto-detect and add them instantly."
            />
          </Box>

          {/* Page Title Editor */}
          <Box sx={{ mb: 4 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6" fontWeight={800}>
                Page Title
              </Typography>

              {editTitleMode ? (
                <Stack direction="row" spacing={1}>
                  <IconButton
                    color="success"
                    onClick={saveTitle}
                    size={isVerySmall ? "small" : "medium"}
                  >
                    <Save />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setEditTitleMode(false);
                      setTitle(paymentTerms.title);
                    }}
                    size="small"
                  >
                    <Cancel />
                  </IconButton>
                </Stack>
              ) : (
                <Tooltip title="Edit title">
                  <IconButton
                    onClick={() => setEditTitleMode(true)}
                    sx={{
                      bgcolor: "rgba(102,126,234,0.1)",
                      color: "#667eea",
                    }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>

            {editTitleMode ? (
              <TextField
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                sx={inputStyle}
              />
            ) : (
              <Typography
                variant={{ xs: "h5", sm: "h4" }}
                fontWeight={700}
                sx={{
                  fontFamily: selectedFont,
                  mt: 1,
                  fontSize: { xs: "1.6rem", sm: "2rem" },
                  wordBreak: "break-word",
                  color: "text.primary",
                }}
              >
                {title}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2 }}>
            <Chip
              label={`Total Terms: ${terms.length}`}
              sx={{
                bgcolor: "rgba(102,126,234,0.15)",
                color: "#667eea",
                fontWeight: 700,
                fontSize: { xs: "0.85rem", sm: "1rem" },
              }}
            />
          </Divider>

          {/* Terms List */}
          <Box
            sx={{ flex: 1, overflowY: "auto", pr: { xs: 0, sm: 1 }, pb: 2 }}
          >
            <Stack spacing={{ xs: 2.5, sm: 3 }}>
              {terms.length === 0 ? (
                <Box
                  sx={{
                    p: { xs: 6, sm: 10 },
                    textAlign: "center",
                    border: "2px dashed rgba(102,126,234,0.3)",
                    borderRadius: 5,
                    bgcolor: "rgba(102,126,234,0.02)",
                  }}
                >
                  <Info
                    sx={{
                      fontSize: { xs: 60, sm: 80 },
                      color: "#667eea",
                      opacity: 0.4,
                      mb: 3,
                    }}
                  />
                  <Typography
                    variant={{ xs: "h6", sm: "h5" }}
                    color="text.secondary"
                    fontWeight={600}
                  >
                    No payment terms added yet
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mt={1}
                    px={2}
                  >
                    Click "Add New Term" to define your payment conditions
                  </Typography>
                </Box>
              ) : (
                terms.map((t, i) => (
                  <Card
                    key={i}
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      border: "1px solid #e0e7ff",
                      bgcolor: "#f8f9fa",
                    }}
                  >
                    <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        mb={2}
                      >
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          fontWeight={600}
                        >
                          Term #{i + 1}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          {editIndex === i ? (
                            <>
                              <IconButton color="success" onClick={saveTerm}>
                                <Save />
                              </IconButton>
                              <IconButton onClick={() => setEditIndex(null)}>
                                <Cancel />
                              </IconButton>
                            </>
                          ) : (
                            <>
                              <IconButton
                                onClick={() => startEditTerm(i)}
                                sx={{
                                  bgcolor: "rgba(102,126,234,0.1)",
                                  color: "#667eea",
                                }}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                onClick={() => deleteSingleTerm(i)}
                                sx={{
                                  bgcolor: "rgba(244,67,54,0.1)",
                                  color: "#f44336",
                                }}
                              >
                                <Delete />
                              </IconButton>
                            </>
                          )}
                        </Stack>
                      </Stack>

                      {editIndex === i ? (
                        <TextField
                          fullWidth
                          multiline
                          rows={{ xs: 5, sm: 6 }}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                          sx={inputStyle}
                        />
                      ) : (
                        <Typography
                          variant="body1"
                          sx={{
                            fontFamily: selectedFont,
                            lineHeight: 1.9,
                            fontSize: { xs: "1rem", sm: "1.05rem" },
                            color: "text.primary",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {t}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </Stack>
          </Box>

          {/* Dialogs — Mobile Optimized */}
          <Dialog
            open={showAddDialog}
            onClose={() => setShowAddDialog(false)}
            maxWidth="md"
            fullWidth
            fullScreen={isSmallScreen}
            sx={{ borderRadius: 5 }}
          >
            <DialogTitle
              sx={{
                bgcolor: "#667eea",
                color: "white",
                py: 3,
                fontWeight: 700,
              }}
            >
              Add New Payment Term
            </DialogTitle>
            <DialogContent sx={{ pt: 4, pb: 2, mt: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={7}
                placeholder="e.g. 50% advance payment required upon project confirmation..."
                value={newTerm}
                onPaste={handleTermsPaste}
                onChange={(e) => setNewTerm(e.target.value)}
                autoFocus
                sx={inputStyle}
              />
            </DialogContent>
            <DialogActions
              sx={{
                p: 3,
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Button
                onClick={() => setShowAddDialog(false)}
                size="large"
                fullWidth={isSmallScreen}
                sx={{ borderRadius: 10 }}
              >
                Cancel
              </Button>
              <Button
                onClick={addNewTerm}
                variant="contained"
                size="large"
                fullWidth={isSmallScreen}
                sx={{
                  px: 6,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": { background: "#5568d3" },
                  borderRadius: 10,
                }}
              >
                Add Term
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={showResetDialog}
            onClose={() => setShowResetDialog(false)}
            maxWidth="sm"
            fullWidth
            fullScreen={isSmallScreen}
            sx={{ borderRadius: 5 }}
          >
            <DialogTitle
              sx={{
                bgcolor: "#667eea",
                color: "white",
                py: 3,
                fontWeight: 700,
              }}
            >
              <WarningAmber sx={{ mr: 1 }} /> Reset Payment Terms Page?
            </DialogTitle>
            <DialogContent sx={{ pt: 4 }}>
              <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
                This action cannot be undone!
              </Alert>
              <Typography>
                All custom payment terms and title will be permanently deleted
                and restored to default.
              </Typography>
            </DialogContent>
            <DialogActions
              sx={{
                p: 3,
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Button
                onClick={() => setShowResetDialog(false)}
                size="large"
                fullWidth={isSmallScreen}
                sx={{ borderRadius: 10 }}
              >
                Cancel
              </Button>
              <Button
                onClick={resetAllTerms}
                variant="contained"
                color="error"
                size="large"
                fullWidth={isSmallScreen}
                sx={{ px: 5, fontWeight: 700, borderRadius: 10 }}
              >
                Yes, Reset Page
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PdfPaymentTermsEditorPage;