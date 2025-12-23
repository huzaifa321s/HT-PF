// src/components/editors/PdfPage1Editor.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Card,
  CardContent,
} from "@mui/material";
import {
  Save,
  RefreshOutlined,
  WarningAmber,
  CheckCircle,
  AutoAwesome,
  DoneAll,
  Person, // Added for section header icon
  Business, // Added for section header icon
} from "@mui/icons-material";

import { setBrandName, setBrandTagline, resetPage1 } from "../src/utils/page1Slice";
import { showToast } from "../src/utils/toastSlice";
import axiosInstance from "../src/utils/axiosInstance";
import debounce from "lodash.debounce";

const PdfPage1Editor = ({ mode }) => {
  const dispatch = useDispatch();
  const page1 = useSelector((state) =>
    mode === "edit-doc" ? state.page1Slice.edit : state.page1Slice.create
  );

  // Local state (for instant UI response)
  const [local, setLocal] = useState({
    brandName: page1.brandName || "",
    brandTagline: page1.brandTagline || "",
  });

  const [isSaving, setIsSaving] = useState(false); // Visual saving indicator
  const [justSaved, setJustSaved] = useState(false); // Success flash
  const [resetDialog, setResetDialog] = useState(false);

  // Sync Redux → Local state (only when Redux actually changes)
  useEffect(() => {
    setLocal({
      brandName: page1.brandName || "",
      brandTagline: page1.brandTagline || "",
    });
  }, [page1.brandName, page1.brandTagline]);

  // Faster + smoother auto-save (300ms)
  const debouncedSave = useCallback(
    debounce((data) => {
      dispatch(setBrandName(data.brandName));
      dispatch(setBrandTagline(data.brandTagline));
      setIsSaving(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);
    }, 300),
    [dispatch]
  );

  const handleChange = (field, value) => {
    setIsSaving(true);
    const newData = { ...local, [field]: value };
    setLocal(newData);
    debouncedSave(newData);
  };

  const handleSaveNow = () => {
    debouncedSave.flush(); // Force immediate save
    dispatch(showToast({ message: "Saved instantly!", severity: "success" }));
  };

  const handleReset = async () => {
    try {
      dispatch(resetPage1());
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      await axiosInstance.post(`/api/proposals/pages/reset/page1/${user.id}`);
      setResetDialog(false);
      dispatch(
        showToast({ message: "Cover page reset successfully!", severity: "success" })
      );
    } catch (err) {
      dispatch(showToast({ message: "Reset failed!", severity: "error" }));
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
        p: { xs: 1.5, sm: 3 },
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        bgcolor: "#fff",
      }}
    >
      <Card sx={cardStyle}>
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {sectionHeader(<Business />, "Cover Page Editor")}

          <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
            Your brand’s first impression starts here
          </Typography>

          {/* Saving Status */}
          {isSaving && (
            <Alert
              icon={<AutoAwesome sx={{ color: "#667eea" }} />}
              severity="info"
              sx={{
                mb: 3,
                borderRadius: 4,
                bgcolor: "rgba(102,126,234,0.08)",
                border: "1px solid rgba(102,126,234,0.3)",
              }}
            >
              <LinearProgress
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "rgba(102,126,234,0.1)",
                  "& .MuiLinearProgress-bar": {
                    background: "linear-gradient(90deg, #667eea, #764ba2)",
                  },
                }}
              />
              <Typography variant="body2" mt={1} fontWeight={600}>
                Saving your changes...
              </Typography>
            </Alert>
          )}

          {justSaved && (
            <Alert
              icon={<DoneAll sx={{ color: "#4caf50" }} />}
              severity="success"
              sx={{
                mb: 3,
                borderRadius: 4,
                bgcolor: "rgba(76,175,80,0.1)",
                border: "1px solid rgba(76,175,80,0.3)",
              }}
            >
              <Typography fontWeight={600}>All changes saved instantly!</Typography>
            </Alert>
          )}

          {/* Brand Name */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Brand Name
            </Typography>
            <TextField
              fullWidth
              value={local.brandName}
              onChange={(e) => handleChange("brandName", e.target.value)}
              placeholder="e.g. Nexus Digital Solutions"
              variant="outlined"
              sx={inputStyle}
              helperText="Appears as the main title on cover page"
            />
          </Box>

          {/* Brand Tagline */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Brand Tagline
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={local.brandTagline}
              onChange={(e) => handleChange("brandTagline", e.target.value)}
              placeholder="e.g. Building Tomorrow's Digital Experiences Today"
              variant="outlined"
              sx={inputStyle}
              helperText="Keep it short, powerful & memorable (under 12 words recommended)"
            />
          </Box>

          {/* Action Buttons */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="flex-end"
            alignItems="center"
          >
            <Button
              variant="outlined"
              startIcon={<RefreshOutlined />}
              onClick={() => setResetDialog(true)}
              sx={{
                borderRadius: 10,
                borderColor: colorScheme.primary,
                color: colorScheme.primary,
                fontWeight: 600,
                px: 4,
                py: 1.5,
                "&:hover": {
                  borderColor: colorScheme.secondary,
                  bgcolor: "rgba(102,126,234,0.08)",
                },
              }}
              fullWidth
            >
              Reset Page
            </Button>

            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveNow}
              sx={{
                borderRadius: 10,
                fontWeight: 700,
                px: 4,
                py: 1.5,
                background: colorScheme.gradient,
                boxShadow: 6,
                "&:hover": {
                  background: colorScheme.hoverGradient,
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 32px rgba(102, 126, 234, 0.5)",
                },
              }}
              fullWidth
            >
              Save Changes Now
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetDialog}
        onClose={() => setResetDialog(false)}
        maxWidth="sm"
        sx={{ borderRadius: 5 }}
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#667eea", color: "white", py: 3 }}>
          <Box display="flex" alignItems="center">
            <WarningAmber sx={{ mr: 1 }} />
            Confirm Reset
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Are you sure you want to reset the cover page?
          </Typography>
          <Typography color="text.secondary" paragraph>
            This will permanently delete your current brand name and tagline.
          </Typography>
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            This action cannot be undone!
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <Button onClick={() => setResetDialog(false)} size="large" sx={{ borderRadius: 10 }} fullWidth>
            Cancel
          </Button>
          <Button
            onClick={handleReset}
            variant="contained"
            color="error"
            size="large"
            sx={{ px: 4, fontWeight: 600, borderRadius: 10 }}
            fullWidth
          >
            Yes, Reset Everything
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PdfPage1Editor;