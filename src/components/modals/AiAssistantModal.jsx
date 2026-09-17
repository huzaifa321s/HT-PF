"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  TextField,
  Chip,
  IconButton,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  AutoAwesome,
  CheckCircle,
  Close,
  ElectricBolt,
} from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { showToast } from "../../utils/toastSlice";
import axiosInstance from "../../utils/axiosInstance";

export default function AiAssistantModal({
  open,
  handleClose,
  initialBrief = "",
  onApply,
}) {
  const [brief, setBrief] = useState(initialBrief || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (open) {
      setBrief(initialBrief || "");
      setIsGenerating(false);
      setGeneratedData(null);
    }
  }, [open, initialBrief]);

  // Direct 1-Click Generation with Gemini AI
  const handleGenerateWithGemini = async () => {
    if (!brief.trim()) {
      dispatch(
        showToast({
          message: "Please enter a project brief first.",
          severity: "warning",
        })
      );
      return;
    }

    setIsGenerating(true);
    setGeneratedData(null);

    try {
      const response = await axiosInstance.post(
        "/api/ai/generate-proposal",
        {
          projectBrief: brief.trim(),
          companyName: "Humantek",
        },
        { timeout: 60000 }
      );

      const data = response.data;

      if (!data || !data.sections || !Array.isArray(data.sections) || data.sections.length === 0) {
        throw new Error("Invalid proposal format received from AI.");
      }

      setGeneratedData(data);
      dispatch(
        showToast({
          message: `✨ Proposal successfully generated with ${data.sections.length} sections!`,
          severity: "success",
        })
      );
    } catch (err) {
      console.error("Gemini Generation Error:", err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.details ||
        err.message ||
        "Failed to generate proposal with Gemini AI.";

      dispatch(
        showToast({
          message: errorMsg,
          severity: "error",
        })
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyContent = () => {
    if (!generatedData || !generatedData.sections) {
      dispatch(
        showToast({
          message: "No generated proposal content to apply.",
          severity: "error",
        })
      );
      return;
    }

    if (onApply && typeof onApply === "function") {
      onApply(generatedData, brief);
    }

    dispatch(
      showToast({
        message: `Successfully applied ${generatedData.sections.length} proposal sections!`,
        severity: "success",
      })
    );
    handleClose();
  };

  const activeSections = generatedData?.sections || [];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#111111",
          color: "#f8fafc",
          borderRadius: 3,
          border: "1px solid rgba(243, 168, 51, 0.3)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.9)",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: "#0a0a0a",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          p: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: "rgba(243, 168, 51, 0.15)",
              border: "1px solid rgba(243, 168, 51, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f3a833",
            }}
          >
            <AutoAwesome fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#f8fafc", fontSize: "1.1rem" }}>
              Gemini AI Proposal Generator
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
              1-Click In-App Generation • Powered by Google Gemini Flash
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "#94a3b8", "&:hover": { color: "#f8fafc" } }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3.5 }, bgcolor: "#111111" }}>
        {/* Step 1: Project Brief */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            bgcolor: "rgba(20, 20, 20, 0.8)",
            borderRadius: 2.5,
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#f8fafc", mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
            Project Brief & Client Requirements
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={6}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            disabled={isGenerating}
            placeholder="Enter or paste your client's project brief, goals, deliverables, budget, and specific requirements here..."
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#0a0a0a",
                color: "#e2e8f0",
                fontSize: "13px",
                borderRadius: 2,
                "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
                "&:hover fieldset": { borderColor: "rgba(243, 168, 51, 0.4)" },
                "&.Mui-focused fieldset": { borderColor: "#f3a833" },
              },
            }}
          />

          {/* Action Button */}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={handleGenerateWithGemini}
              disabled={isGenerating || !brief.trim()}
              startIcon={isGenerating ? <CircularProgress size={18} color="inherit" /> : <ElectricBolt />}
              sx={{
                bgcolor: "#f3a833",
                color: "#000",
                fontWeight: 800,
                fontSize: "14px",
                textTransform: "none",
                borderRadius: 2,
                px: 3,
                py: 1.2,
                "&:hover": { bgcolor: "#d99322" },
                "&.Mui-disabled": { bgcolor: "rgba(243, 168, 51, 0.2)", color: "rgba(0,0,0,0.4)" },
              }}
            >
              {isGenerating ? "Generating Proposal..." : "Generate Proposal with Gemini AI"}
            </Button>
          </Box>
        </Paper>

        {/* Loading Banner */}
        {isGenerating && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              bgcolor: "rgba(243, 168, 51, 0.08)",
              borderRadius: 2.5,
              border: "1px solid rgba(243, 168, 51, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <CircularProgress size={28} sx={{ color: "#f3a833" }} />
            <Box>
              <Typography variant="body2" sx={{ color: "#f8fafc", fontWeight: 700 }}>
                Gemini AI is crafting your proposal...
              </Typography>
              <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                Structuring Scope of Work, Deliverables, Timeline, and Pricing packages.
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Generated Preview */}
        {generatedData && activeSections.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: "rgba(16, 185, 129, 0.08)",
              borderRadius: 2.5,
              border: "1px solid rgba(16, 185, 129, 0.4)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#34d399", display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircle fontSize="small" />
                {activeSections.length} Proposal Sections Generated!
              </Typography>
              <Chip
                label="Ready to Apply"
                color="success"
                size="small"
                sx={{ fontWeight: 700, fontSize: "11px" }}
              />
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
              {activeSections.map((sec, i) => (
                <Chip
                  key={i}
                  label={sec.title || `Section ${i + 1}`}
                  size="small"
                  sx={{
                    bgcolor: sec.type === "heading" ? "rgba(243, 168, 51, 0.2)" : "rgba(255,255,255,0.08)",
                    color: sec.type === "heading" ? "#f3a833" : "#e2e8f0",
                    border: sec.type === "heading" ? "1px solid rgba(243, 168, 51, 0.4)" : "1px solid rgba(255,255,255,0.1)",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                />
              ))}
            </Box>
          </Paper>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          bgcolor: "#0a0a0a",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          p: 2.5,
          justifyContent: "space-between",
        }}
      >
        <Button onClick={handleClose} sx={{ color: "#94a3b8", textTransform: "none" }}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleApplyContent}
          disabled={!generatedData || isGenerating}
          startIcon={<AutoAwesome />}
          sx={{
            bgcolor: "#f3a833",
            color: "#000",
            fontWeight: 800,
            fontSize: "14px",
            textTransform: "none",
            borderRadius: 2,
            px: 3,
            py: 1,
            "&:hover": { bgcolor: "#d99322" },
            "&.Mui-disabled": { bgcolor: "rgba(243, 168, 51, 0.2)", color: "rgba(0,0,0,0.4)" },
          }}
        >
          Apply to Proposal & Auto-Fill All Pages
        </Button>
      </DialogActions>
    </Dialog>
  );
}
