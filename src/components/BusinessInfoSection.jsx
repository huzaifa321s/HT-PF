// src/pages/BusinessInfoSection.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
  Chip,
  Fade,
  Button,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Business,
  Info,
  Lightbulb,
  Edit,
  Save,
  ContentCopy,
  CheckCircle,
  ErrorOutline,
  AutoAwesome,
  Description,
  Insights,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../utils/toastSlice";
import { setBusinessInfo, updateBusinessField } from "../utils/businessInfoSlice";
import axiosInstance from "../utils/axiosInstance";

export default function BusinessInfoSection({ fullTranscript }) {
  const dispatch = useDispatch();
  const finalInfo = useSelector((state) => state.businessInfo || {});

  const [tabValue, setTabValue] = useState(0);
  const [editingKey, setEditingKey] = useState(null);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [loadingKey, setLoadingKey] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [extracting, setExtracting] = useState(false);
console.log('tabval',tabValue)
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { transcript: "" },
  });

useEffect(()=>{
if (Object.keys(finalInfo).length > 0) {
      reset({ transcript: "" });
    }
},[finalInfo, reset])
  const normalizeValue = (value) => {
    if (value == null) return "";
    if (typeof value === "string") return value.trim();
    if (Array.isArray(value)) return value.map(normalizeValue);
    if (typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, normalizeValue(v)])
      );
    }
    return String(value);
  };

  const handleSendPrompt = async (fieldKey, prompt) => {
    try {
      setLoadingKey(fieldKey);
      const cleanPrompt = prompt.trim();

      const res = await axiosInstance.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/transcribe/ai/refine`,
        {
          field: fieldKey,
          prompt: cleanPrompt,
          currentValue: finalInfo[fieldKey],
          fullTranscript: fullTranscript?.trim(),
        },
        { skipLoader: true }
      );

      let updatedValue = res.data?.refined?.updatedValue || res.data?.updatedValue || res.data;

      if (typeof updatedValue === "string") {
        try {
          const t = updatedValue.trim();
          if ((t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"))) {
            updatedValue = JSON.parse(t);
          }
        } catch (e) {
          // ignore parse error
        }
      }

      const newInfo = {
        ...finalInfo,
        [fieldKey]: normalizeValue(updatedValue),
        [`${fieldKey}_prompt`]: cleanPrompt,
      };

      dispatch(setBusinessInfo(newInfo));
      dispatch(
        showToast({
          message: `${fieldKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} refined!`,
          severity: "success",
        })
      );
    } catch (err) {
      const msg = err.response?.data?.message || "Refinement failed";
      dispatch(showToast({ message: msg, severity: "error" }));
      if (err.response?.data?.error === "INSUFFICIENT_TOKENS") {
        window.dispatchEvent(new CustomEvent("insufficientTokens", { detail: err.response.data }));
      }
    } finally {
      setLoadingKey(null);
    }
  };

  const handleCopyField = (key, text) => {
    const str = typeof text === "object" ? JSON.stringify(text, null, 2) : String(text);
    navigator.clipboard.writeText(str);
    dispatch(showToast({
      message: `${key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} copied!`,
      severity: "info",
    }));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExtractInfo = async (data) => {
    const input = data.transcript.trim();
    if (!input) return;

    try {
      setExtracting(true);
      setParseError(null);

      const res = await axiosInstance.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/transcribe/ai/extract`,
        { transcript: input }
      );

      let result = res.data;
      if (typeof result === "string") {
        try {
          result = JSON.parse(result);
        } catch {
          setParseError("Invalid JSON from server");
          return;
        }
      }

      if (result.error === "INSUFFICIENT_TOKENS") {
        window.dispatchEvent(new CustomEvent("insufficientTokens", { detail: result }));
        dispatch(showToast({ message: result.message || "Not enough tokens!", severity: "error" }));
        return;
      }

      const normalized = {};
      Object.entries(result.data || result || {}).forEach(([k, v]) => {
        normalized[k] = normalizeValue(v);
      });

      dispatch(setBusinessInfo(normalized));
      dispatch(showToast({ message: "Extracted successfully!", severity: "success" }));
      reset({ transcript: "" });
      setTabValue(1); // Auto switch to results
    } catch (err) {
      const msg = err.response?.data?.message || "Extraction failed";
      setParseError(msg);
      dispatch(showToast({ message: msg, severity: "error" }));
    } finally {
      setExtracting(false);
    }
  };

  const getIcon = (key) => {
    if (key.includes("business")) return <Business />;
    if (key.includes("solution") || key.includes("objective")) return <Lightbulb />;
    return <Info />;
  };

  const renderValue = (value) => {
    if (!value || value === "" || (typeof value === "object" && Object.keys(value).length === 0)) {
      return <Typography color="text.disabled" sx={{ fontStyle: "italic" }}>- No data -</Typography>;
    }

    if (typeof value === "string" && value.includes("\n")) {
      return <Typography component="div" sx={{ whiteSpace: "pre-wrap", fontWeight: 500, lineHeight: 1.8 }}>{value}</Typography>;
    }

    if (Array.isArray(value)) {
      return (
        <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
          {value.map((item, i) => (
            <Typography component="li" key={i} sx={{ fontWeight: 500, mb: 0.5 }}>{item}</Typography>
          ))}
        </Box>
      );
    }

    if (typeof value === "object") {
      return (
        <Box sx={{ ml: 2 }}>
          {Object.entries(value).map(([k, v]) => (
            <Box key={k} sx={{ mb: 1 }}>
              <Typography sx={{ fontWeight: 700, color: "#667eea" }}>{k}:</Typography>
              <Typography sx={{ ml: 2 }}>{String(v)}</Typography>
            </Box>
          ))}
        </Box>
      );
    }

    return <Typography sx={{ fontWeight: 500 }}>{value}</Typography>;
  };

  const entries = Object.entries(finalInfo).filter(([k]) => !k.endsWith("_prompt"));

  return (
    <Fade in timeout={600}>
      <Box sx={{ p: { xs: 2, md: 4 } }}>

        {/* Tabs */}
        <Paper elevation={4} sx={{ borderRadius: 4, overflow: "hidden", mb: 4 }}>
          <Tabs
            value={tabValue}
       onChange={(event, newValue) => {
    console.log("Tab changed to:", newValue);  // Yeh ab dikhega!
    setTabValue(newValue);                     // Yeh ZAROORI hai!
  }}
            variant="fullWidth"
            
            sx={{
              bgcolor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "& .MuiTab-root": { color: "blank", fontWeight: 600 },
              "& .Mui-selected": { color: "black !important", bgcolor: "rgba(255,255,255,0.15)" },
            }}
          >
            <Tab icon={<Description />} label="Paste Transcript" iconPosition="start" />
            <Tab
              icon={<Insights />}
              label="Extracted Insights"
              iconPosition="start"

            />
          </Tabs>
        </Paper>

        {/* Tab 1: Input */}
        {tabValue === 0 && (
          <Paper sx={{ p: 5, borderRadius: 4, background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: "rgba(102,126,234,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 3,
                }}
              >
                <AutoAwesome sx={{ fontSize: 40, color: "#667eea" }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Extract Business Info
                </Typography>
                <Typography color="text.secondary">
                  Paste your transcript to analyze with AI
                </Typography>
              </Box>
            </Box>

            <form onSubmit={handleSubmit(handleExtractInfo)}>
              <Controller
                name="transcript"
                control={control}
                rules={{
                  required: "Transcript required",
                  minLength: { value: 100, message: "Minimum 100 characters" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    minRows={12}
                    maxRows={20}
                    placeholder="Paste your full client conversation or transcript here..."
                    error={!!errors.transcript}
                    helperText={errors.transcript?.message}
                    sx={{
                      mb: 4,
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "white",
                        borderRadius: 3,
                        fontSize: "1.05rem",
                      },
                    }}
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={extracting}
                startIcon={extracting ? <CircularProgress size={28} /> : <AutoAwesome />}
                sx={{
                  py: 2,
                  px: 8,
                  borderRadius: 4,
                  fontWeight: 800,
                  fontSize: "1.2rem",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                  },
                }}
              >
                {extracting ? "Analyzing..." : "Extract with AI"}
              </Button>
            </form>
          </Paper>
        )}

        {/* Tab 2: Results */}
        {tabValue === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {parseError && (
              <Paper sx={{ p: 3, bgcolor: "rgba(244,67,54,0.05)", border: "2px solid rgba(244,67,54,0.3)" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ErrorOutline sx={{ mr: 2, color: "#f44336" }} />
                  <Typography color="error" fontWeight={600}>
                    {parseError}
                  </Typography>
                </Box>
              </Paper>
            )}

            {entries.length > 0 ? (
              entries.map(([key, value]) => {
                const promptKey = `${key}_prompt`;
                const prompt = finalInfo[promptKey];
                const hasValue = value && (typeof value !== "object" || Object.keys(value).length > 0);

                return (
                  <Paper
                    key={key}
                    elevation={6}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      width: "100%",
                      background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                      border: "1px solid rgba(102,126,234,0.15)",
                      transition: "0.3s",
                      "&:hover": { boxShadow: "0 16px 40px rgba(102,126,234,0.22)" },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Chip
                        icon={getIcon(key)}
                        label={key.replace(/_/g, " ")}
                        sx={{
                          textTransform: "capitalize",
                          fontWeight: 700,
                          bgcolor: "rgba(102,126,234,0.12)",
                          color: "#667eea",
                        }}
                      />
                      {hasValue && (
                        <Tooltip title={copiedKey === key ? "Copied!" : "Copy"}>
                          <IconButton onClick={() => handleCopyField(key, value)}>
                            {copiedKey === key ? <CheckCircle sx={{ color: "#4caf50" }} /> : <ContentCopy sx={{ color: "#667eea" }} />}
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Box sx={{ minHeight: 80, mb: prompt ? 3 : 0 }}>
                      {renderValue(value)}
                    </Box>

                    {prompt && (
                      <Box sx={{ p: 3, borderRadius: 3, bgcolor: "rgba(255,152,0,0.08)", border: "2px dashed rgba(255,152,0,0.3)" }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700, color: "#f57c00", mb: 2, display: "flex", alignItems: "center" }}
                        >
                          <Lightbulb sx={{ fontSize: 22, mr: 1 }} />
                          {key.replace(/_/g, " ")} Prompt
                        </Typography>

                        {editingKey === key ? (
                          <>
                            <TextField
                              multiline
                              fullWidth
                              minRows={4}
                              value={editedPrompt}
                              onChange={(e) => setEditedPrompt(e.target.value)}
                              sx={{ mb: 2 }}
                            />
                            <Box sx={{ display: "flex", gap: 2 }}>
                              <Button
                                variant="contained"
                                startIcon={<Save />}
                                onClick={() => {
                                  dispatch(updateBusinessField({ key: promptKey, value: editedPrompt }));
                                  setEditingKey(null);
                                }}
                              >
                                Save
                              </Button>
                              <Button variant="outlined" onClick={() => setEditingKey(null)}>
                                Cancel
                              </Button>
                            </Box>
                          </>
                        ) : (
                          <>
                            <Typography sx={{ mb: 2, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                              {prompt}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 2 }}>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleSendPrompt(key, prompt)}
                                disabled={loadingKey === key}
                                startIcon={loadingKey === key ? <CircularProgress size={18} /> : null}
                                sx={{ bgcolor: "#ff9800", "&:hover": { bgcolor: "#f57c00" } }}
                              >
                                Refine
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Edit />}
                                onClick={() => {
                                  setEditingKey(key);
                                  setEditedPrompt(prompt);
                                }}
                              >
                                Edit
                              </Button>
                            </Box>
                          </>
                        )}
                      </Box>
                    )}
                  </Paper>
                );
              })
            ) : (
              <Paper sx={{ p: 10, textAlign: "center", border: "2px dashed rgba(102,126,234,0.3)", borderRadius: 4 }}>
                <AutoAwesome sx={{ fontSize: 80, color: "#667eea", opacity: 0.4 }} />
                <Typography variant="h5" color="text.secondary" sx={{ mt: 3 }}>
                  No data extracted yet
                </Typography>
                <Typography color="text.secondary">
                  Go to the first tab and paste a transcript to begin
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </Box>
    </Fade>
  );
}