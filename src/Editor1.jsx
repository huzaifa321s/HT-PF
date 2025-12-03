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
} from "@mui/material";
import {
  Save,
  RefreshOutlined,
  WarningAmber,
  CheckCircle,
  AutoAwesome,
  DoneAll,
} from "@mui/icons-material";

import { setBrandName, setBrandTagline, resetPage1 } from "../src/utils/page1Slice";
import { showToast } from "../src/utils/toastSlice";
import axiosInstance from "../src/utils/axiosInstance";
import debounce from "lodash.debounce";

const PdfPage1Editor = ({mode}) => {
  const dispatch = useDispatch();
  const page1 = useSelector((state) => mode === 'edit-doc' ? state.page1Slice.edit : state.page1Slice.create);

  // Local state (for instant UI response)
  const [local, setLocal] = useState({
    brandName: page1.brandName || "",
    brandTagline: page1.brandTagline || "",
  });

  const [isSaving, setIsSaving] = useState(false);     // Visual saving indicator
  const [justSaved, setJustSaved] = useState(false);   // Success flash
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
      dispatch(showToast({ message: "Cover page reset successfully!", severity: "success" }));
    } catch (err) {
      dispatch(showToast({ message: "Reset failed!", severity: "error" }));
    }
  };

  return (
 <Box
      sx={{
        p: { xs: 2, sm: 3 },
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        bgcolor: "#f8f9ff",
      }}
    >
      <Stack spacing={3}>

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
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              background: "linear-gradient(90deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)",
            },
          }}
        >
          <Typography variant="h4" fontWeight={900} gutterBottom sx={{ fontSize: { xs: "1.8rem", md: "2.2rem" } }}>
            Cover Page Editor
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 500 }}>
            Your brand’s first impression starts here
          </Typography>
        </Paper>

        {/* Saving Status */}
        {isSaving && (
          <Alert
            icon={<AutoAwesome sx={{ color: "#667eea" }} />}
            severity="info"
            sx={{
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
              borderRadius: 4,
              bgcolor: "rgba(76,175,80,0.1)",
              border: "1px solid rgba(76,175,80,0.3)",
            }}
          >
            <Typography fontWeight={600}>All changes saved instantly!</Typography>
          </Alert>
        )}

        {/* Brand Name */}
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 5,
            border: "1px solid rgba(102,126,234,0.15)",
            transition: "0.3s",
            "&:hover": { boxShadow: "0 12px 32px rgba(102,126,234,0.15)" },
          }}
        >
          <Typography
            variant="h6"
            fontWeight="medium"
            gutterBottom
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Brand Name
          </Typography>
          <TextField
            fullWidth
            value={local.brandName}
            onChange={(e) => handleChange("brandName", e.target.value)}
            placeholder="e.g. Nexus Digital Solutions"
            variant="outlined"
            size="large"
            sx={{
              mt: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 4,
                fontSize: "1.4rem",
                fontWeight: 400,
                bgcolor: "white",
                "&:hover": { borderColor: "#667eea" },
              },
            }}
          />
          <Typography variant="body2" color="text.secondary" mt={2}>
            Appears as the main title on cover page
          </Typography>
        </Paper>

        {/* Brand Tagline */}
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 5,
            border: "1px solid rgba(102,126,234,0.15)",
            transition: "0.3s",
            "&:hover": { boxShadow: "0 12px 32px rgba(102,126,234,0.15)" },
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Brand Tagline
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={5}
            value={local.brandTagline}
            onChange={(e) => handleChange("brandTagline", e.target.value)}
            placeholder="e.g. Building Tomorrow's Digital Experiences Today"
            variant="outlined"
            sx={{
              mt: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 4,
                bgcolor: "white",
              },
              "& textarea": { lineHeight: 1.8, fontSize: "1.1rem" },
            }}
          />
          <Typography variant="body2" color="text.secondary" mt={2}>
            Keep it short, powerful & memorable (under 12 words recommended)
          </Typography>
        </Paper>

        {/* Action Buttons */}
        <Paper
          elevation={6}
          sx={{
            p: 4,
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
            <Button
              variant="outlined"
              startIcon={<RefreshOutlined />}
              onClick={() => setResetDialog(true)}
              sx={{
                borderRadius: 4,
                border: "2px solid #667eea",
                color: "#667eea",
                fontWeight: 600,
                px: 4,
                py: 1.5,
                "&:hover": {
                  borderColor: "#764ba2",
                  bgcolor: "rgba(102,126,234,0.08)",
                },
              }}
              fullWidth={{ xs: true, sm: false }}
            >
              Reset Page
            </Button>

            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveNow}
              sx={{
                borderRadius: 4,
                fontWeight: 700,
                fontSize: "0.9rem",
                px: 3,
                height:70,
                py: 3,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 8px 25px rgba(102,126,234,0.4)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                  transform: "translateY(-3px)",
                  boxShadow: "0 12px 32px rgba(102,126,234,0.5)",
                },
              }}
              fullWidth={{ xs: true, sm: false }}
            >
              Save Changes Now
            </Button>
          </Stack>
        </Paper>


      </Stack>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialog} onClose={() => setResetDialog(false)} maxWidth="sm" sx={{borderRadius:5}} fullWidth>
        <DialogTitle sx={{ bgcolor: "#667eea", color: "white", py: 3 }}>
          <WarningAmber sx={{ mr: 1, verticalAlign: "middle" }} />
          Confirm Reset
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
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={() => setResetDialog(false)} size="large">
            Cancel
          </Button>
          <Button
            onClick={handleReset}
            variant="contained"
            color="error"
            size="large"
            sx={{ px: 4, fontWeight: 600,borderRadius:5 }}
          >
            Yes, Reset Everything
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PdfPage1Editor;