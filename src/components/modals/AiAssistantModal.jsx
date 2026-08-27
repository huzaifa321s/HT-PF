"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Box, TextField, Chip, Alert, IconButton, Paper } from "@mui/material";
import {
  AutoAwesome,
  OpenInNew,
  CheckCircle,
  Close,
} from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { showToast } from "../../utils/toastSlice";
import {
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
          message: `Prompt sent to ${platform.toUpperCase()} & copied to clipboard!`,
          severity: "success",
        })
      );
    } catch (err) {
      dispatch(
        showToast({
          message: "Could not launch AI platform. Please try again.",
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
              AI Proposal Generator (Auto-Pasted to ChatGPT)
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
              100% Free • No API keys needed • Auto-submits directly in ChatGPT
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "#94a3b8", "&:hover": { color: "#f8fafc" } }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3.5 }, bgcolor: "#111111" }}>
        {/* Status notification */}
        <Alert
          severity="info"
          icon={<CheckCircle fontSize="inherit" />}
          sx={{
            mb: 3,
            bgcolor: "rgba(16, 185, 129, 0.1)",
            color: "#34d399",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            fontSize: "13px",
            "& .MuiAlert-icon": { color: "#10b981" },
          }}
        >
          <strong>ChatGPT is running in your new tab!</strong> Once it finishes generating the proposal, simply <strong>copy the JSON code block</strong> and paste it below.
        </Alert>

        {/* Step 2 Box: Paste AI JSON */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            bgcolor: "rgba(20, 20, 20, 0.8)",
            borderRadius: 2.5,
            border: parseResult?.success
              ? "1px solid rgba(16, 185, 129, 0.6)"
              : parseResult && !parseResult.success
                ? "1px solid rgba(244, 63, 94, 0.5)"
                : "1px solid rgba(243, 168, 51, 0.3)",
            transition: "border-color 0.3s ease",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: 1 }}>
              <Box component="span" sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: "#f3a833", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800 }}>
                1
              </Box>
              Paste ChatGPT's JSON Response
            </Typography>
            {parseResult?.success && (
              <Chip
                label={`${parseResult.data.sections.length} Sections Recognized`}
                color="success"
                size="small"
                sx={{ fontWeight: 700, fontSize: "11px" }}
              />
            )}
          </Box>

          <TextField
            fullWidth
            multiline
            autoFocus
            rows={6}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='Paste the JSON here... { "sections": [ ... ], "tables": [] }'
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#0a0a0a",
                color: "#e2e8f0",
                fontFamily: "monospace",
                fontSize: "12px",
                borderRadius: 2,
                "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
                "&:hover fieldset": { borderColor: "rgba(243, 168, 51, 0.4)" },
                "&.Mui-focused fieldset": { borderColor: "#f3a833" },
              },
            }}
          />

          {/* Validation Status */}
          {parseResult?.success && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: "rgba(16, 185, 129, 0.08)", borderRadius: 1.5, border: "1px solid rgba(16, 185, 129, 0.2)" }}>
              <Typography variant="caption" sx={{ color: "#34d399", fontWeight: 700, display: "block", mb: 1 }}>
                ✓ Ready to auto-fill into proposal:
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

        {/* Re-Launch / Manual Platform Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: "rgba(20, 20, 20, 0.5)",
            borderRadius: 2,
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mb: 1 }}>
            Need to re-send prompt or use another AI?
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleCopyAndLaunch("chatgpt")}
              startIcon={<OpenInNew />}
              sx={{
                borderColor: "rgba(16, 163, 127, 0.5)",
                color: "#10a37f",
                "&:hover": { borderColor: "#10a37f", bgcolor: "rgba(16, 163, 127, 0.1)" },
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 1.5,
              }}
            >
              Re-Launch ChatGPT
            </Button>

            <Button
              size="small"
              variant="outlined"
              onClick={() => handleCopyAndLaunch("claude")}
              startIcon={<OpenInNew />}
              sx={{
                borderColor: "rgba(217, 119, 6, 0.5)",
                color: "#f59e0b",
                "&:hover": { borderColor: "#f59e0b", bgcolor: "rgba(217, 119, 6, 0.1)" },
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 1.5,
              }}
            >
              Open Claude
            </Button>

            <Button
              size="small"
              variant="outlined"
              onClick={() => handleCopyAndLaunch("deepseek")}
              startIcon={<OpenInNew />}
              sx={{
                borderColor: "rgba(59, 130, 246, 0.5)",
                color: "#60a5fa",
                "&:hover": { borderColor: "#60a5fa", bgcolor: "rgba(59, 130, 246, 0.1)" },
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 1.5,
              }}
            >
              Open DeepSeek
            </Button>
          </Box>
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
          Apply to Proposal & Auto-Fill All Pages
        </Button>
      </DialogActions>
    </Dialog>
  );
}
