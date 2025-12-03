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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
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
  AddCircleOutline,
  Clear,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../utils/toastSlice";
import {
  setBusinessInfo,
  updateBusinessField,
} from "../utils/businessInfoSlice";
import axiosInstance from "../utils/axiosInstance";
import { addSection, addTable, updateSection } from "../utils/page2Slice";
import { store } from "../utils/store";

export default function BusinessInfoSection({ fullTranscript }) {
  const dispatch = useDispatch();
  const finalInfo = useSelector((state) => state.businessInfo || {});
  const [hasNewData, setHasNewData] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [editingKey, setEditingKey] = useState(null);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [loadingKey, setLoadingKey] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [extracting, setExtracting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { transcript: "" },
  });

  useEffect(() => {
    if (Object.keys(finalInfo).length > 0) {
      reset({ transcript: "" });
    }
  }, [finalInfo, reset]);

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
        `/api/transcribe/ai/refine`,
        {
          field: fieldKey,
          prompt: cleanPrompt,
          currentValue: finalInfo[fieldKey],
          fullTranscript: fullTranscript?.trim(),
        },
        { skipLoader: true }
      );

      let updatedValue =
        res.data?.refined?.updatedValue || res.data?.updatedValue || res.data;

      if (typeof updatedValue === "string") {
        try {
          const t = updatedValue.trim();
          if (
            (t.startsWith("{") && t.endsWith("}")) ||
            (t.startsWith("[") && t.endsWith("]"))
          ) {
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
          message: `${fieldKey
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())} refined!`,
          severity: "success",
        })
      );
    } catch (err) {
      const msg = err.response?.data?.message || "Refinement failed";
      dispatch(showToast({ message: msg, severity: "error" }));
      if (err.response?.data?.error === "INSUFFICIENT_TOKENS") {
        window.dispatchEvent(
          new CustomEvent("insufficientTokens", { detail: err.response.data })
        );
      }
    } finally {
      setLoadingKey(null);
    }
  };

  const handleCopyField = (key, text) => {
    const str =
      typeof text === "object" ? JSON.stringify(text, null, 2) : String(text);
    navigator.clipboard.writeText(str);
    dispatch(
      showToast({
        message: `${key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())} copied!`,
        severity: "info",
      })
    );
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExtractInfo = async (data) => {
    const input = data.transcript.trim();
    if (!input) return;

    try {
      setExtracting(true);
      setParseError(null);

      const res = await axiosInstance.post(`/api/transcribe/ai/extract`, {
        transcript: input,
      });

      let result = res.data;
      if (typeof result === "string") {
        try {
          result = JSON.parse(result);
        } catch {
          setParseError("Invalid JSON from server");
          return;
        }
      }
      setHasNewData(true); // ✅ Badge show karo
      if (result.error === "INSUFFICIENT_TOKENS") {
        window.dispatchEvent(
          new CustomEvent("insufficientTokens", { detail: result })
        );
        dispatch(
          showToast({
            message: result.message || "Not enough tokens!",
            severity: "error",
          })
        );
        return;
      }

      const normalized = {};
      Object.entries(result.data || result || {}).forEach(([k, v]) => {
        normalized[k] = normalizeValue(v);
      });

      dispatch(setBusinessInfo(normalized));
      dispatch(
        showToast({ message: "Extracted successfully!", severity: "success" })
      );
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
  const pdfPage3Data = store.getState((s) => s.page);
  const orderedSections = pdfPage3Data?.page2.create.orderedSections;
  // ✅ Add field to PDF function (empty for now)
  const handleAddToPdf = async (fieldKey, fieldValue) => {
    try {
      console.log("Adding to PDF:", fieldKey, fieldValue);
      const generateId = () => crypto.randomUUID(); // or nanoid if available

      if (fieldKey === "deliverables") {
        const rows = fieldValue.map((row) => ({
          id: generateId(),
          col1: row.item || "",
          col2: row.estimated_time || "",
        }));

        dispatch(addTable({ T_ID: "123", rows }));
      } else if (fieldKey === "quotation") {
        const rows = fieldValue.map((row) => ({
          id: generateId(),
          col1: row.item || "",
          col2: row.quantity || 0,
          col3: row.estimated_cost_pkr || "",
        }));
        dispatch(
          addTable({ columnCount: 3, T_ID: "321", rows, type: "quotation" })
        );
      } else {
        // TODO: Implement PDF section addition logic
        if (orderedSections.some((item) => item.id === fieldKey)) {
          dispatch(
            updateSection({
              id: fieldKey,
              type: "title",
              title: fieldKey
                .replace(/_/g, " ") // remove "_"
                .replace(/\b\w/g, (c) => c.toUpperCase()),
              content: fieldValue.trim(),
            })
          );
        } else {
          dispatch(
            addSection({
              id: fieldKey,
              type: "title",
              title: fieldKey
                .replace(/_/g, " ") // remove "_"
                .replace(/\b\w/g, (c) => c.toUpperCase()), // capitalize every word
              content: fieldValue.trim(),
            })
          );
        }
      }

      dispatch(
        showToast({
          message: `${fieldKey
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())} added to PDF`,
          severity: "success",
        })
      );
    } catch (error) {
      console.log("error", error);
    }
  };

  const getIcon = (key) => {
    if (key.includes("business")) return <Business />;
    if (key.includes("solution") || key.includes("objective"))
      return <Lightbulb />;
    return <Info />;
  };

  // ✅ Check if field is auto-added (deliverables or quotation)
  const isAutoAdded = (key) => {
    return key === "deliverables" || key === "quotation";
  };

  const isAddBtn = (key) => {
    return (
      key === "brand_name" ||
      key === "brand_tagline" ||
      key === "business_type" ||
      key === "industry" ||
      key === "industry_title" ||
      key === "target_audience"
    );
  };

  // ✅ UPDATED RENDER VALUE WITH TABLE SUPPORT
  const renderValue = (value, key) => {
    // Empty check
    if (
      !value ||
      value === "" ||
      (typeof value === "object" && Object.keys(value).length === 0)
    ) {
      return (
        <Typography color="text.disabled" sx={{ fontStyle: "italic" }}>
          - No data -
        </Typography>
      );
    }

    // ✅ DELIVERABLES TABLE
    if (key === "deliverables" && Array.isArray(value)) {
      const isDeliverableTable = value.length > 0;
      console.log("Array", Array.isArray(value));
      console.log("value", value);
      if (isDeliverableTable) {
        return (
          <TableContainer
            component={Paper}
            sx={{
              boxShadow: "0 4px 12px rgba(102,126,234,0.15)",
              borderRadius: 3,
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "rgba(102,126,234,0.08)" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#667eea" }}>
                    Deliverable
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#667eea" }}>
                    Estimated Delivery Time
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {value.map((item, i) => (
                  <TableRow
                    key={i}
                    sx={{ "&:hover": { bgcolor: "rgba(102,126,234,0.03)" } }}
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>
                        {item.item || "-"}
                      </Typography>
                      {item.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {item.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 500 }}>
                        {item.estimated_time || "-"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }
    }

    // ✅ QUOTATION TABLE
    if (key === "quotation" && Array.isArray(value)) {
      const isQuotationTable = value.length > 0;

      if (isQuotationTable) {
        const total = value.reduce(
          (sum, item) => sum + (item.estimated_cost_pkr || 0),
          0
        );

        return (
          <TableContainer
            component={Paper}
            sx={{
              boxShadow: "0 4px 12px rgba(102,126,234,0.15)",
              borderRadius: 3,
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "rgba(102,126,234,0.08)" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#667eea" }}>
                    Item
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: "#667eea" }}
                    align="center"
                  >
                    Quantity
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: "#667eea" }}
                    align="right"
                  >
                    Estimated Cost (PKR)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {value.map((item, i) => (
                  <TableRow
                    key={i}
                    sx={{ "&:hover": { bgcolor: "rgba(102,126,234,0.03)" } }}
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>
                        {item.item || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontWeight: 500 }}>
                        {item.quantity || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 600, color: "#667eea" }}>
                        {item.estimated_cost_pkr
                          ? `PKR ${item.estimated_cost_pkr.toLocaleString()}`
                          : "PKR 0"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Total Row */}
                {total > 0 && (
                  <TableRow sx={{ bgcolor: "rgba(102,126,234,0.05)" }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                      Total
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          color: "#667eea",
                        }}
                      >
                        PKR {total.toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }
    }

    // Multi-line strings
    if (typeof value === "string" && value.includes("\n")) {
      return (
        <Typography
          component="div"
          sx={{ whiteSpace: "pre-wrap", fontWeight: 500, lineHeight: 1.8 }}
        >
          {value}
        </Typography>
      );
    }

    // Regular arrays
    if (Array.isArray(value)) {
      return (
        <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
          {value.map((item, i) => (
            <Typography
              component="li"
              key={i}
              sx={{ fontWeight: 500, mb: 0.5 }}
            >
              {typeof item === "object" ? JSON.stringify(item) : item}
            </Typography>
          ))}
        </Box>
      );
    }

    // Objects
    if (typeof value === "object") {
      return (
        <Box sx={{ ml: 2 }}>
          {Object.entries(value).map(([k, v]) => (
            <Box key={k} sx={{ mb: 1 }}>
              <Typography sx={{ fontWeight: 700, color: "#667eea" }}>
                {k}:
              </Typography>
              <Typography sx={{ ml: 2 }}>{String(v)}</Typography>
            </Box>
          ))}
        </Box>
      );
    }

    return <Typography sx={{ fontWeight: 500 }}>{value}</Typography>;
  };

  const entries = Object.entries(finalInfo).filter(
    ([k]) => !k.endsWith("_prompt")
  );

  return (
    <Fade in timeout={600}>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Tabs */}
        <Paper
          elevation={4}
          sx={{ borderRadius: 4, overflow: "hidden", mb: 4 }}
        >
          <Tabs
            value={tabValue}
            onChange={(event, newValue) => {
              setTabValue(newValue);
              if (newValue === 1) {
                setHasNewData(false); // ✅ Tab 1 pe click = badge hat jaye
              }
            }}
            variant="fullWidth"
            sx={{
              bgcolor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "& .MuiTab-root": { color: "#000", fontWeight: 600 },
              "& .Mui-selected": {
                color: "#000 !important",
                bgcolor: "rgba(255,255,255,0.15)",
              },
            }}
          >
            <Tab
              icon={<Description />}
              label="Paste Transcript"
              iconPosition="start"
            />
            <Tab
              icon={
                <Badge
                  variant="dot"
                  color="error"
                  invisible={!hasNewData} // ✅ hasNewData false = badge hidden
                  sx={{
                    "& .MuiBadge-dot": {
                      right: -2,
                      top: 2,
                    },
                  }}
                >
                  <Insights />
                </Badge>
              }
              label="Extracted Insights"
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Tab 1: Input */}
        {tabValue === 0 && (
          <Paper
            sx={{
              p: 5,
              borderRadius: 4,
              background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            }}
          >
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
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                startIcon={
                  extracting ? <CircularProgress size={28} /> : <AutoAwesome />
                }
                sx={{
                  py: 2,
                  px: 8,
                  borderRadius: 4,
                  fontWeight: 800,
                  fontSize: "1.2rem",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              textAlign: "start",
            }}
          >
            {parseError && (
              <Paper
                sx={{
                  p: 3,
                  bgcolor: "rgba(244,67,54,0.05)",
                  border: "2px solid rgba(244,67,54,0.3)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ErrorOutline sx={{ mr: 2, color: "#f44336" }} />
                  <Typography color="error" fontWeight={600}>
                    {parseError}
                  </Typography>
                </Box>
              </Paper>
            )}
            {entries?.length > 0 && (
              <Button
                onClick={() => {
                  dispatch(
                    showToast({
                      message: "Data cleared successfully.",
                      servity: "success",
                    })
                  ),
                    dispatch(setBusinessInfo({}));
                }}
              >
                Clear All Data <Clear />
              </Button>
            )}
            {entries.length > 0 ? (
              entries.map(([key, value]) => {
                const promptKey = `${key}_prompt`;
                const prompt = finalInfo[promptKey];
                const hasValue =
                  value &&
                  (typeof value !== "object" || Object.keys(value).length > 0);

                return (
                  <Paper
                    key={key}
                    elevation={6}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      width: "100%",
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                      border: "1px solid rgba(102,126,234,0.15)",
                      transition: "0.3s",
                      "&:hover": {
                        boxShadow: "0 16px 40px rgba(102,126,234,0.22)",
                      },
                    }}
                  >
                    {console.log("hasValue", value)}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
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
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {hasValue && (
                          <>
                            {/* Add to PDF Button with Auto-Added Badge */}
                            {isAddBtn(key) ? null : isAutoAdded(key) ? (
                              <Badge
                                badgeContent="Auto Added"
                                color="success"
                                sx={{
                                  "& .MuiBadge-badge": {
                                    fontSize: "0.65rem",
                                    height: 18,
                                    minWidth: 18,
                                    padding: "0 6px",
                                  },
                                }}
                              >
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<AddCircleOutline />}
                                  onClick={() => handleAddToPdf(key, value)}
                                  sx={{
                                    borderColor: "#4caf50",
                                    color: "#4caf50",
                                    textTransform: "none",
                                    fontWeight: 600,
                                  }}
                                >
                                  Add to PDF
                                </Button>
                              </Badge>
                            ) : (
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<AddCircleOutline />}
                                onClick={() => handleAddToPdf(key, value)}
                                sx={{
                                  borderColor: "#667eea",
                                  color: "#667eea",
                                  textTransform: "none",
                                  fontWeight: 600,
                                  "&:hover": {
                                    borderColor: "#5568d3",
                                    bgcolor: "rgba(102,126,234,0.05)",
                                  },
                                }}
                              >
                                Add to PDF
                              </Button>
                            )}

                            {/* Copy Button */}
                            <Tooltip
                              title={copiedKey === key ? "Copied!" : "Copy"}
                            >
                              <IconButton
                                onClick={() => handleCopyField(key, value)}
                              >
                                {copiedKey === key ? (
                                  <CheckCircle sx={{ color: "#4caf50" }} />
                                ) : (
                                  <ContentCopy sx={{ color: "#667eea" }} />
                                )}
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Box sx={{ minHeight: 80, mb: prompt ? 3 : 0 }}>
                      {/* ✅ Pass key to renderValue */}
                      {renderValue(value, key)}
                    </Box>

                    {prompt && (
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          bgcolor: "rgba(255,152,0,0.08)",
                          border: "2px dashed rgba(255,152,0,0.3)",
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            color: "#f57c00",
                            mb: 2,
                            display: "flex",
                            alignItems: "center",
                          }}
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
                                  dispatch(
                                    updateBusinessField({
                                      key: promptKey,
                                      value: editedPrompt,
                                    })
                                  );
                                  setEditingKey(null);
                                }}
                              >
                                Save
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={() => setEditingKey(null)}
                              >
                                Cancel
                              </Button>
                            </Box>
                          </>
                        ) : (
                          <>
                            <Typography
                              sx={{
                                mb: 2,
                                whiteSpace: "pre-wrap",
                                lineHeight: 1.7,
                              }}
                            >
                              {prompt}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 2 }}>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleSendPrompt(key, prompt)}
                                disabled={loadingKey === key}
                                startIcon={
                                  loadingKey === key ? (
                                    <CircularProgress size={18} />
                                  ) : null
                                }
                                sx={{
                                  bgcolor: "#ff9800",
                                  "&:hover": { bgcolor: "#f57c00" },
                                }}
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
              <Paper
                sx={{
                  p: 10,
                  textAlign: "center",
                  border: "2px dashed rgba(102,126,234,0.3)",
                  borderRadius: 4,
                }}
              >
                <AutoAwesome
                  sx={{ fontSize: 80, color: "#667eea", opacity: 0.4 }}
                />
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
