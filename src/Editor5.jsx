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
  IconButton,
  Chip,
  Tooltip,
  Divider,
  Alert,
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
} from "@mui/icons-material";

import { useSelector, useDispatch } from "react-redux";

import {
  updateTitle,
  addTerm,
  updateTerm,
  deleteTerm,
  resetTerms,
} from "../src/utils/paymentTermsPageSlice";

import { showToast } from "../src/utils/toastSlice";
import axiosInstance from "../src/utils/axiosInstance";

const PdfPaymentTermsEditorPage = ({ selectedFont = "'Poppins', sans-serif" }) => {
  const dispatch = useDispatch();
  const paymentTerms = useSelector((s) => s.paymentTerms);

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
      return dispatch(showToast({ message: "Term cannot be empty", severity: "warning" }));
    }
    dispatch(updateTerm({ index: editIndex, value: editValue.trim() }));
    setEditIndex(null);
    dispatch(showToast({ message: "Term updated!", severity: "success" }));
  };

  const addNewTerm = () => {
    if (!newTerm.trim()) {
      return dispatch(showToast({ message: "Please enter a term", severity: "warning" }));
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
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    try {
      await axiosInstance.post(`/api/proposals/pages/reset/paymentTermsPage/${user.id}`);
      dispatch(resetTerms());
      dispatch(showToast({ message: "Page reset successfully!", severity: "success" }));
    } catch {
      dispatch(showToast({ message: "Reset failed", severity: "error" }));
    }
    setShowResetDialog(false);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, height: "100%", display: "flex", flexDirection: "column" ,overflowY:'auto'}}>
      <Stack spacing={4} sx={{ flex: 1}}>

        {/* Premium Gradient Header */}
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 5,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: "6px",
              background: "linear-gradient(90deg, #f093fb 0%, #f5576c 100%)",
            },
          }}
        >
          <Typography variant="h4" fontWeight={900} gutterBottom>
            Payment Terms Editor
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
            Define clear payment conditions — updates instantly in your PDF
          </Typography>
        </Paper>

        {/* Stats & Action Buttons */}
        <Paper
          elevation={6}
          sx={{
            p: 3,
            borderRadius: 5,
            background: "linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%)",
            border: "1px solid rgba(102,126,234,0.2)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            justifyContent="space-between"
            alignItems="center"
          >
            <Chip
              icon={<DescriptionOutlined />}
              label={`Total Terms: ${terms.length}`}
              sx={{
                bgcolor: "rgba(102,126,234,0.15)",
                color: "#667eea",
                fontWeight: 700,
                fontSize: "1rem",
                height: 40,
              }}
            />

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshOutlined />}
                onClick={() => setShowResetDialog(true)}
                sx={{
                  borderRadius: 4,
                  border: "2px solid #667eea",
                  color: "#667eea",
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  "&:hover": {
                    borderColor: "#764ba2",
                    bgcolor: "rgba(102,126,234,0.1)",
                  },
                }}
              >
                Reset Page
              </Button>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowAddDialog(true)}
                sx={{
                  borderRadius: 4,
                  px: 6,
                  py: 1.8,
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 8px 25px rgba(102,126,234,0.4)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                    transform: "translateY(-3px)",
                    boxShadow: "0 12px 32px rgba(102,126,234,0.5)",
                  },
                }}
              >
                Add New Term
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Page Title Editor */}
        <Card
          elevation={8}
          sx={{
            borderRadius: 5,
            border: "1px solid rgba(102,126,234,0.15)",
            transition: "0.3s",
            "&:hover": { boxShadow: "0 12px 32px rgba(102,126,234,0.18)" },
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Page Title
              </Typography>

              {editTitleMode ? (
                <Stack direction="row" spacing={1}>
                  <IconButton color="success" onClick={saveTitle} sx={{ bgcolor: "rgba(76,175,80,0.15)" }}>
                    <Save />
                  </IconButton>
                  <IconButton onClick={() => { setEditTitleMode(false); setTitle(paymentTerms.title); }}>
                    <Cancel />
                  </IconButton>
                </Stack>
              ) : (
                <Tooltip title="Edit title">
                  <IconButton
                    onClick={() => setEditTitleMode(true)}
                    sx={{ bgcolor: "rgba(102,126,234,0.1)", color: "#667eea" }}
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
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "white" } }}
              />
            ) : (
              <Typography variant="h4" fontWeight={700} sx={{ fontFamily: selectedFont, mt: 1 }}>
                {title}
              </Typography>
            )}
          </CardContent>
        </Card>

        <Divider sx={{ my: 2 }}>
          <Chip
            label="Payment Terms List"
            sx={{
              bgcolor: "rgba(102,126,234,0.15)",
              color: "#667eea",
              fontWeight: 700,
            }}
          />
        </Divider>

        {/* Terms List */}
        <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
          <Stack spacing={3}>
            {terms.length === 0 ? (
              <Paper
                sx={{
                  p: 10,
                  textAlign: "center",
                  border: "2px dashed rgba(102,126,234,0.3)",
                  borderRadius: 5,
                  bgcolor: "rgba(102,126,234,0.02)",
                }}
              >
                <Info sx={{ fontSize: 80, color: "#667eea", opacity: 0.4, mb: 3 }} />
                <Typography variant="h5" color="text.secondary" fontWeight={600}>
                  No payment terms added yet
                </Typography>
                <Typography variant="body1" color="text.secondary" mt={1}>
                  Click "Add New Term" to define your payment conditions
                </Typography>
              </Paper>
            ) : (
              terms.map((t, i) => (
                <Card
                  key={i}
                  elevation={8}
                  sx={{
                    borderRadius: 5,
                    border: "1px solid rgba(102,126,234,0.15)",
                    transition: "0.3s",
                    "&:hover": { boxShadow: "0 16px 40px rgba(102,126,234,0.2)" },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                        Term #{i + 1}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        {editIndex === i ? (
                          <>
                            <IconButton color="success" onClick={saveTerm} sx={{ bgcolor: "rgba(76,175,80,0.15)" }}>
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
                              sx={{ bgcolor: "rgba(102,126,234,0.1)", color: "#667eea" }}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              onClick={() => deleteSingleTerm(i)}
                              sx={{ bgcolor: "rgba(244,67,54,0.1)", color: "#f44336" }}
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
                        rows={6}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "white" } }}
                      />
                    ) : (
                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily: selectedFont,
                          lineHeight: 1.9,
                          fontSize: "1.05rem",
                          color: "text.primary",
                          whiteSpace: "pre-wrap",
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

        {/* Auto-save Alert */}
        <Alert
          icon={<CheckCircle sx={{ color: "#4caf50" }} />}
          severity="success"
          sx={{
            borderRadius: 4,
            bgcolor: "rgba(76,175,80,0.1)",
            border: "1px solid rgba(76,175,80,0.3)",
            fontWeight: 600,
          }}
        >
          All changes are saved automatically and appear instantly in your proposal PDF.
        </Alert>
      </Stack>

      {/* Add Term Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#667eea", color: "white", py: 3, fontWeight: 700 }}>
          Add New Payment Term
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={7}
            placeholder="e.g. 50% advance payment required upon project confirmation..."
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            autoFocus
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "white" } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={() => setShowAddDialog(false)} size="large">
            Cancel
          </Button>
          <Button
            onClick={addNewTerm}
            variant="contained"
            size="large"
            sx={{
              px: 6,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": { background: "#5568d3" },
            }}
          >
            Add Term
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onClose={() => setShowResetDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#667eea", color: "white", py: 3, fontWeight: 700 }}>
          <WarningAmber sx={{ mr: 1 }} />
          Reset Payment Terms Page?
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
            This action cannot be undone!
          </Alert>
          <Typography>
            All custom payment terms and title will be permanently deleted and restored to default.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={() => setShowResetDialog(false)} size="large">
            Cancel
          </Button>
          <Button
            onClick={resetAllTerms}
            variant="contained"
            color="error"
            size="large"
            sx={{ px: 5, fontWeight: 700 }}
          >
            Yes, Reset Page
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PdfPaymentTermsEditorPage;