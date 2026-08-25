"use client";
import React, { useState, useEffect } from "react";
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
  Stack,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  Paper,
} from "@mui/material";
import {
  AutoAwesome,
  ContentCopy,
  OpenInNew,
  CheckCircle,
  Close,
  Psychology,
  HelpOutline,
} from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { showToast } from "../../utils/toastSlice";
import {
  buildProposalPrompt,
  copyPromptAndOpenAI,
  parseAiProposalJson,
} from "../../utils/aiPromptHelper";

export default function AiAssistantModal({
  open,
  handleClose,
  initialBrief = "",
  onApply,
}) {
  const [brief, setBrief] = useState(initialBrief || "");
  const [jsonInput, setJsonInput] = useState("");
  const [parseResult, setParseResult] = useState(null);
  const [copiedPlatform, setCopiedPlatform] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (open) {
      setBrief(initialBrief || "");
      setJsonInput("");
      setParseResult(null);
      setCopiedPlatform(null);
    }
  }, [open, initialBrief]);

  // Live JSON validation whenever jsonInput changes
  useEffect(() => {
    if (!jsonInput.trim()) {
      setParseResult(null);
      return;
    }
    const result = parseAiProposalJson(jsonInput);
    setParseResult(result);
  }, [jsonInput]);

  const handleCopyAndLaunch = async (platform) => {
    if (!brief.trim()) {
      dispatch(
        showToast({
          message: "Please enter your project brief first.",
          severity: "warning",
        })
      );
      return;
    }

    try {
      await copyPromptAndOpenAI(brief, platform, "Humantek");
      setCopiedPlatform(platform);
      dispatch(
        showToast({
          message: `Prompt copied to clipboard! Paste it into ${platform.toUpperCase()} (Ctrl + V).`,
          severity: "success",
        })
      );
    } catch (err) {
      dispatch(
        showToast({
          message: "Could not copy to clipboard. Please copy manually.",
          severity: "error",
        })
      );
    }
  };

  const handleApplyContent = () => {
    if (!parseResult || !parseResult.success) {
      dispatch(
        showToast({
          message: "Please paste a valid JSON output first.",
          severity: "error",
        })
      );
      return;
    }

    if (onApply && typeof onApply === "function") {
      onApply(parseResult.data, brief);
    }

    dispatch(
      showToast({
        message: `Successfully applied ${parseResult.data.sections.length} proposal sections!`,
        severity: "success",
      })
    );
    handleClose();
  };

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
              width: 38,
              height: 38,
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
              AI Proposal Generator
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
              100% Free • Works with ChatGPT, Claude, DeepSeek & Gemini
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "#94a3b8", "&:hover": { color: "#f8fafc" } }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3.5 }, bgcolor: "#111111" }}>
        {/* Step 1 Box */}
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
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#f3a833", display: "flex", alignItems: "center", gap: 1 }}>
              <Box component="span" sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: "#f3a833", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800 }}>
                1
              </Box>
              Project Brief & AI Launch
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              {brief.length} characters
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={3}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="e.g. Social media marketing and branding proposal for ABC Tech. Scope includes Instagram management, LinkedIn ads, content creation, and monthly reporting..."
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#0a0a0a",
                color: "#f8fafc",
                borderRadius: 2,
                fontSize: "14px",
                "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
                "&:hover fieldset": { borderColor: "rgba(243, 168, 51, 0.4)" },
                "&.Mui-focused fieldset": { borderColor: "#f3a833" },
              },
            }}
          />

          <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
            <Button
              variant="contained"
              onClick={() => handleCopyAndLaunch("chatgpt")}
              startIcon={<OpenInNew />}
              sx={{
                bgcolor: "#10a37f",
                "&:hover": { bgcolor: "#0d8c6d" },
                color: "#fff",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: 2,
                px: 2,
              }}
            >
              Copy Prompt & Open ChatGPT
            </Button>

            <Button
              variant="outlined"
              onClick={() => handleCopyAndLaunch("claude")}
              startIcon={<OpenInNew />}
              sx={{
                borderColor: "rgba(217, 119, 6, 0.5)",
                color: "#f59e0b",
                "&:hover": { borderColor: "#f59e0b", bgcolor: "rgba(217, 119, 6, 0.1)" },
                fontWeight: 700,
                textTransform: "none",
                borderRadius: 2,
                px: 2,
              }}
            >
              Open Claude
            </Button>

            <Button
              variant="outlined"
              onClick={() => handleCopyAndLaunch("deepseek")}
              startIcon={<OpenInNew />}
              sx={{
                borderColor: "rgba(59, 130, 246, 0.5)",
                color: "#60a5fa",
                "&:hover": { borderColor: "#60a5fa", bgcolor: "rgba(59, 130, 246, 0.1)" },
                fontWeight: 700,
                textTransform: "none",
                borderRadius: 2,
                px: 2,
              }}
            >
              Open DeepSeek
            </Button>
          </Box>

          {copiedPlatform && (
            <Alert
              severity="success"
              icon={<CheckCircle fontSize="inherit" />}
              sx={{
                mt: 2,
                bgcolor: "rgba(16, 185, 129, 0.1)",
                color: "#34d399",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                fontSize: "13px",
                py: 0.5,
              }}
            >
              Prompt copied! Just press <strong>Ctrl + V</strong> in {copiedPlatform.toUpperCase()}, wait for it to generate the JSON, then copy and paste it below.
            </Alert>
          )}
        </Paper>

        {/* Step 2 Box */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            bgcolor: "rgba(20, 20, 20, 0.8)",
            borderRadius: 2.5,
            border: parseResult?.success
              ? "1px solid rgba(16, 185, 129, 0.5)"
              : parseResult && !parseResult.success
              ? "1px solid rgba(244, 63, 94, 0.5)"
              : "1px solid rgba(255, 255, 255, 0.08)",
            transition: "border-color 0.3s ease",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: 1 }}>
              <Box component="span" sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: "#a855f7", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800 }}>
                2
              </Box>
              Paste AI Response (JSON)
            </Typography>
            {parseResult?.success && (
              <Chip
                label={`${parseResult.data.sections.length} Sections Ready`}
                color="success"
                size="small"
                sx={{ fontWeight: 700, fontSize: "11px" }}
              />
            )}
          </Box>

          <TextField
            fullWidth
            multiline
            rows={5}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='Paste the AI response here... { "sections": [ ... ], "tables": [] }'
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#0a0a0a",
                color: "#e2e8f0",
                fontFamily: "monospace",
                fontSize: "12px",
                borderRadius: 2,
                "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
                "&:hover fieldset": { borderColor: "rgba(168, 85, 247, 0.4)" },
                "&.Mui-focused fieldset": { borderColor: "#a855f7" },
              },
            }}
          />

          {/* Validation Status */}
          {parseResult?.success && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: "rgba(16, 185, 129, 0.08)", borderRadius: 1.5, border: "1px solid rgba(16, 185, 129, 0.2)" }}>
              <Typography variant="caption" sx={{ color: "#34d399", fontWeight: 700, display: "block", mb: 1 }}>
                ✓ Successfully parsed the following sections:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                {parseResult.data.sections.map((sec, i) => (
                  <Chip
                    key={i}
                    label={sec.title || `Section ${i + 1}`}
                    size="small"
                    sx={{
                      bgcolor: sec.type === "heading" ? "rgba(243, 168, 51, 0.15)" : "rgba(255,255,255,0.06)",
                      color: sec.type === "heading" ? "#f3a833" : "#cbd5e1",
                      border: sec.type === "heading" ? "1px solid rgba(243, 168, 51, 0.3)" : "1px solid rgba(255,255,255,0.1)",
                      fontSize: "11px",
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {parseResult && !parseResult.success && (
            <Alert severity="error" sx={{ mt: 2, bgcolor: "rgba(244, 63, 94, 0.1)", color: "#fb7185", border: "1px solid rgba(244, 63, 94, 0.3)", fontSize: "12px", py: 0.5 }}>
              {parseResult.error}
            </Alert>
          )}
        </Paper>
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
          disabled={!parseResult?.success}
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
          Apply to Proposal & Auto-Fill
        </Button>
      </DialogActions>
    </Dialog>
  );
}
