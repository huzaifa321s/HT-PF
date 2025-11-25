// src/components/BusinessInfoSection.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  Fade,
  Button,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Business,
  Info,
  Lightbulb,
  Edit,
  Save,
  Close,
  ContentCopy,
} from "@mui/icons-material";
import axios from "axios";
import axiosInstance from "../utils/axiosInstance";

export default function BusinessInfoSection({ businessInfo, fullTranscript }) {
  const [businessInformation, setBusinessInfo] = useState(businessInfo);
  const [editingKey, setEditingKey] = useState(null);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [loadingKey, setLoadingKey] = useState(null);
  const [inputText, setInputText] = useState("");
  const [extracting, setExtracting] = useState(false);

  const handleSendPrompt = async (fieldKey, prompt) => {
    try {
      setLoadingKey(fieldKey);
      const cleanPrompt = prompt.replace(/\r?\n/g, " ").trim();
      const res = await axiosInstance.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/transcribe/ai/refine`,
        {
          field: fieldKey,
          prompt: cleanPrompt,
          currentValue: businessInformation[fieldKey],
          fullTranscript: fullTranscript?.replace(/\r?\n/g, " ").trim(),
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const updatedValue =
        res.data?.refined?.updatedValue || res.data?.updatedValue;

      if (updatedValue) {
        let finalValue = updatedValue;
        if (typeof updatedValue === "string") {
          try {
            const maybeJSON = updatedValue.trim();
            if (
              (maybeJSON.startsWith("{") && maybeJSON.endsWith("}")) ||
              (maybeJSON.startsWith("[") && maybeJSON.endsWith("]"))
            ) {
              finalValue = JSON.parse(maybeJSON);
            }
          } catch {
            // keep as string
          }
        }
        setBusinessInfo((prev) => ({
          ...prev,
          [fieldKey]: finalValue,
          [`${fieldKey}_prompt`]: cleanPrompt,
        }));
      } else {
        console.warn("No updatedValue returned from backend for", fieldKey);
      }
    } catch (err) {
      console.error("Prompt refinement failed:", err.response?.data || err);
    } finally {
      setLoadingKey(null);
    }
  };

  const handleCopyField = (text) => {
    navigator.clipboard.writeText(
      typeof text === "object" ? JSON.stringify(text, null, 2) : String(text)
    );
  };

  const handleExtractInfo = async () => {
    if (!inputText.trim()) return;
    try {
      setExtracting(true);
      const res = await axiosInstance.post(`${import.meta.env.VITE_APP_BASE_URL}/api/ai/extract`, {
        text: inputText,
      });
      setBusinessInfo(res.data.businessInfo || {});
    } catch (err) {
      console.error("Extraction failed:", err);
    } finally {
      setExtracting(false);
    }
  };

  if (!businessInformation || Object.keys(businessInformation).length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          color: "text.secondary",
          maxWidth: "700px",
          mx: "auto",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          No business info available yet.
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Paste your full transcript or polished transcript below to extract
          structured business information.
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={6}
          placeholder="Paste transcript or business details here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleExtractInfo}
          disabled={extracting}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            bgcolor: "#1976d2",
            "&:hover": { bgcolor: "#1259a7" },
          }}
        >
          {extracting ? "Extracting Info..." : "Extract Business Info"}
        </Button>
      </Box>
    );
  }

  const getIcon = (key) => {
    if (key.includes("business")) return <Business fontSize="small" />;
    if (key.includes("solution")) return <Lightbulb fontSize="small" />;
    return <Info fontSize="small" />;
  };

  const renderValue = (value) => {
    if (
      value == null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === "object" && Object.keys(value).length === 0)
    ) {
      return (
        <Typography variant="body2" color="text.disabled">
          — No data —
        </Typography>
      );
    }

    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return value.map((item, i) => (
          <Typography key={i} variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
            • {item}
          </Typography>
        ));
      } else {
        return Object.entries(value).map(([subKey, subValue]) => (
          <Box key={subKey} sx={{ mb: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: "#1976d2",
                mb: 0.3,
                textTransform: "capitalize",
              }}
            >
              {subKey}
            </Typography>
            <Typography
              variant="body2"
              sx={{ ml: 1, color: "text.primary", fontWeight: 500 }}
            >
              {Array.isArray(subValue) ? subValue.join(", ") : subValue}
            </Typography>
          </Box>
        ));
      }
    }

    return (
      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
        {value}
      </Typography>
    );
  };

  const entries = Object.entries(businessInformation).filter(
    ([key]) => !key.endsWith("_prompt")
  );

  return (
    <Fade in timeout={600}>
      <Box sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, bgcolor: "background.default" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: "black" }}>
          Extracted Business Information
        </Typography>
        <Grid container spacing={2}>
          {entries.map(([key, value]) => {
            const promptKey = `${key}_prompt`;
            const prompt = businessInformation[promptKey];
            const hasValue =
              value && (typeof value !== "object" || Object.keys(value).length > 0);

            return (
              <Grid item xs={12} sm={6} md={4} key={key} flex={true} flexDirection={'column'}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    height: "100%",
                    minHeight: "280px",
                    minWidth:"350px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    bgcolor:
                      key.includes("solution") || key.includes("business")
                        ? "rgba(25, 118, 210, 0.06)"
                        : "background.paper",
                    transition: "all 0.3s ease",
                    "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
                  }}
                >
                  {/* Field Section */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1.5,
                      }}
                    >
                      <Chip
                        icon={getIcon(key)}
                        label={key.replace(/_/g, " ")}
                        size="small"
                        sx={{
                          textTransform: "capitalize",
                          fontWeight: 600,
                          bgcolor: "rgba(25, 118, 210, 0.1)",
                          color: "#1976d2",
                        }}
                      />
                      {hasValue && (
                        <Tooltip title="Copy field content">
                          <IconButton size="small" onClick={() => handleCopyField(value)}>
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    <Divider sx={{ mb: 1.5 }} />
                    <Box
                      sx={{
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                        fontSize: { xs: "0.9rem", md: "0.95rem" },
                        lineHeight: 1.6,
                        color: "text.secondary",
                        maxHeight: "150px",
                        overflowY: "auto",
                        scrollbarWidth: "thin",
                        "&::-webkit-scrollbar": { width: "6px" },
                        "&::-webkit-scrollbar-thumb": {
                          background: "rgba(0,0,0,0.2)",
                          borderRadius: "3px",
                        },
                      }}
                    >
                      {renderValue(value)}
                    </Box>
                  </Box>

                  {/* Prompt Section */}
                  {prompt && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "rgba(255, 215, 0, 0.08)",
                        border: "1px solid rgba(255, 215, 0, 0.3)",
                        flex: 1, // ← Grow to fill remaining space
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: "#ff9800",
                            textTransform: "capitalize",
                          }}
                        >
                          {key.replace(/_/g, " ")} Prompt
                        </Typography>
                        {editingKey === key ? (
                          <Box>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => {
                                setBusinessInfo((prev) => ({
                                  ...prev,
                                  [promptKey]: editedPrompt,
                                }));
                                setEditingKey(null);
                              }}
                            >
                              <Save fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setEditingKey(null)}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingKey(key);
                              setEditedPrompt(prompt);
                            }}
                          >
                            <Edit fontSize="small" sx={{ color: "#ff9800" }} />
                          </IconButton>
                        )}
                      </Box>

                      {editingKey === key ? (
                        <TextField
                          multiline
                          fullWidth
                          minRows={3}
                          value={editedPrompt}
                          onChange={(e) => setEditedPrompt(e.target.value)}
                          sx={{
                            mb: 1,
                            flexGrow: 1, // ← Expand to fill space
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": { borderColor: "rgba(255,152,0,0.4)" },
                              "&:hover fieldset": { borderColor: "#ff9800" },
                            },
                          }}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            whiteSpace: "pre-wrap",
                            mb: 1,
                            flex: 1, // ← Text grows too
                          }}
                        >
                          {prompt}
                        </Typography>
                      )}

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleSendPrompt(key, prompt)}
                        disabled={loadingKey === key}
                        sx={{
                          textTransform: "none",
                          borderColor: "#ff9800",
                          color: "#ff9800",
                          fontWeight: 600,
                          "&:hover": {
                            bgcolor: "rgba(255, 152, 0, 0.1)",
                            borderColor: "#ff9800",
                          },
                        }}
                      >
                        {loadingKey === key
                          ? "Processing..."
                          : "Send this prompt to correct this field"}
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Fade>
  );
}