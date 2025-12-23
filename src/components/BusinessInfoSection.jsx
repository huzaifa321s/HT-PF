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
  Card,
  CardContent,
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
  setHasNewInsights,
} from "../utils/businessInfoSlice";
import axiosInstance from "../utils/axiosInstance";
import { addSection, addTable, updateSection } from "../utils/page2Slice";
import { store } from "../utils/store";

export default function BusinessInfoSection({ fullTranscript }) {
  const dispatch = useDispatch();
  const businessInfoState = useSelector((state) => state.businessInfo || {});
  const finalInfo = businessInfoState.data || {};
  const hasNewInsights = businessInfoState.hasNewInsights || false;
  // const [hasNewData, setHasNewData] = useState(false);
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

  // Styles from ProposalFormwithStepper
  const colorScheme = {
    primary: "#667eea",
    secondary: "#764ba2",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    hoverGradient: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
    lightBg: "linear-gradient(135deg, #f5f7ff 0%, #f0f2ff 100%)",
  };

  const cardStyle = {
    mb: 3,
    p: { xs: 2, sm: 3, md: 4 },
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

  console.log("finalInfo", finalInfo);
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
      // setHasNewData(true); // ✅ Badge show karo
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
      const generateId = () => crypto.randomUUID();
      if (normalized?.deliverables?.length > 0) {
        console.log("datassssss");
        const rows = normalized?.deliverables?.map((row) => ({
          id: generateId(),
          col1: row.item || "",
          col2: row.estimated_time || "",
        }));
        dispatch(addTable({ title: "Deliverables", T_ID: "123", rows }));
        dispatch(
          showToast({
            message: `${"deliverables"
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())} added to PDF`,
            severity: "success",
          })
        );
      }

      if (normalized?.quotation?.length > 0) {
        const rows = normalized?.quotation.map((row) => ({
          id: generateId(),
          col1: row.item || "",
          col2: row.quantity || 0,
          col3: row.estimated_cost_pkr || "",
        }));
        dispatch(
          addTable({
            title: "Quotation",
            columnCount: 3,
            T_ID: "321",
            rows,
            type: "quotation",
          })
        );
        dispatch(
          showToast({
            message: `${"quotation"
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())} added to PDF`,
            severity: "success",
          })
        );
      }
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

        dispatch(
          addTable({ title: "Deliverables", columnCount: 2, T_ID: "123", rows })
        );
      } else if (fieldKey === "quotation") {
        const rows = fieldValue.map((row) => ({
          id: generateId(),
          col1: row.item || "",
          col2: row.quantity || 0,
          col3: row.estimated_cost_pkr || "",
        }));
        dispatch(
          addTable({
            title: "Quotation",
            columnCount: 3,
            T_ID: "321",
            rows,
            type: "quotation",
          })
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
            elevation={0}
            sx={{
              boxShadow: "0 4px 12px rgba(102,126,234,0.15)",
              borderRadius: 3,
              border: "1px solid #e0e7ff",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ background: colorScheme.gradient }}>
                  <TableCell sx={{ fontWeight: 700, color: "#fff" }}>
                    Deliverable
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#fff" }}>
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
            elevation={0}
            sx={{
              boxShadow: "0 4px 12px rgba(102,126,234,0.15)",
              borderRadius: 3,
              border: "1px solid #e0e7ff",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ background: colorScheme.gradient }}>
                  <TableCell sx={{ fontWeight: 700, color: "#fff" }}>
                    Item
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: "#fff" }}
                    align="center"
                  >
                    Quantity
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: "#fff" }}
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

  const entries = Object.entries(finalInfo || {}).filter(
    ([k]) => !k.endsWith("_prompt")
  );

  return (
    <Fade in timeout={600}>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Tabs */}
        <Paper
          elevation={4}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            mb: 4,
            background: "#fff",
            border: "1px solid #e0e7ff",
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(event, newValue) => {
              setTabValue(newValue);
              if (newValue === 1) {
                dispatch(setHasNewInsights(false)); // ✅ Tab 1 pe click = badge hat jaye
              }
            }}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                color: "text.secondary",
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1rem",
                py: 2,
                "&.Mui-selected": {
                  color: colorScheme.primary,
                  background: "rgba(102, 126, 234, 0.05)",
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: colorScheme.primary,
                height: 3,
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
                  invisible={!hasNewInsights} // ✅ hasNewData false = badge hidden
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
          <Card elevation={0} sx={cardStyle}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: colorScheme.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 3,
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                  }}
                >
                  <AutoAwesome sx={{ fontSize: 32, color: "#fff" }} />
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      background: colorScheme.gradient,
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
                    minLength: {
                      value: 100,
                      message: "Minimum 100 characters",
                    },
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
                      sx={inputStyle}
                    />
                  )}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={extracting}
                  startIcon={
                    extracting ? (
                      <CircularProgress size={28} color="inherit" />
                    ) : (
                      <AutoAwesome />
                    )
                  }
                  sx={{
                    py: 1.5,
                    px: 6,
                    borderRadius: 3,
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    background: colorScheme.gradient,
                    textTransform: "none",
                    boxShadow: "0 8px 20px rgba(102, 126, 234, 0.4)",
                    "&:hover": {
                      background: colorScheme.hoverGradient,
                      boxShadow: "0 12px 24px rgba(102, 126, 234, 0.5)",
                    },
                  }}
                >
                  {extracting ? "Analyzing..." : "Extract with AI"}
                </Button>
              </form>
            </CardContent>
          </Card>
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
                  border: "1px solid rgba(244,67,54,0.3)",
                  borderRadius: 3,
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
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    dispatch(
                      showToast({
                        message: "Data cleared successfully.",
                        severity: "success",
                      })
                    );
                    dispatch(setBusinessInfo({}));
                  }}
                  startIcon={<Clear />}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Clear All Data
                </Button>
              </Box>
            )}
            {entries.length > 0 ? (
              entries.map(([key, value]) => {
                const promptKey = `${key}_prompt`;
                const prompt = finalInfo[promptKey];
                const hasValue =
                  value &&
                  (typeof value !== "object" || Object.keys(value).length > 0);

                return (
                  <Card
                    key={key}
                    elevation={0}
                    sx={{
                      ...cardStyle,
                      p: 0, // Reset padding for CardContent
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 30px rgba(102, 126, 234, 0.2)",
                        borderColor: colorScheme.primary,
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                      {console.log("hasValue", value)}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 3,
                          flexWrap: "wrap",
                          gap: 2,
                        }}
                      >
                        <Chip
                          icon={getIcon(key)}
                          label={key.replace(/_/g, " ")}
                          sx={{
                            textTransform: "capitalize",
                            fontWeight: 700,
                            fontSize: "1rem",
                            py: 2.5,
                            px: 1,
                            borderRadius: 3,
                            background: "rgba(102,126,234,0.1)",
                            color: colorScheme.primary,
                            border: "1px solid rgba(102,126,234,0.2)",
                            "& .MuiChip-icon": { color: colorScheme.primary },
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
                                      borderRadius: 2,
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
                                    borderColor: colorScheme.primary,
                                    color: colorScheme.primary,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    "&:hover": {
                                      borderColor: colorScheme.secondary,
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
                                  sx={{
                                    border: "1px solid #e0e7ff",
                                    borderRadius: 2,
                                  }}
                                >
                                  {copiedKey === key ? (
                                    <CheckCircle sx={{ color: "#4caf50" }} />
                                  ) : (
                                    <ContentCopy
                                      sx={{ color: colorScheme.primary }}
                                    />
                                  )}
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </Box>

                      <Divider sx={{ mb: 3, borderColor: "#e0e7ff" }} />

                      <Box sx={{ minHeight: 80, mb: prompt ? 3 : 0 }}>
                        {/* ✅ Pass key to renderValue */}
                        {renderValue(value, key)}
                      </Box>

                      {prompt && (
                        <Box
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            bgcolor: "#fff9f0",
                            border: "1px dashed #ffb74d",
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
                                onChange={(e) =>
                                  setEditedPrompt(e.target.value)
                                }
                                sx={{
                                  mb: 2,
                                  "& .MuiOutlinedInput-root": {
                                    bgcolor: "#fff",
                                  },
                                }}
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
                                  sx={{
                                    bgcolor: "#f57c00",
                                    "&:hover": { bgcolor: "#ef6c00" },
                                  }}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="outlined"
                                  onClick={() => setEditingKey(null)}
                                  sx={{ color: "#f57c00", borderColor: "#f57c00" }}
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
                                  color: "#4a4a4a",
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
                                    boxShadow: "none",
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
                                  sx={{
                                    color: "#f57c00",
                                    borderColor: "#f57c00",
                                    "&:hover": {
                                      borderColor: "#ef6c00",
                                      bgcolor: "rgba(255,152,0,0.05)",
                                    },
                                  }}
                                >
                                  Edit
                                </Button>
                              </Box>
                            </>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card
                elevation={0}
                sx={{
                  ...cardStyle,
                  textAlign: "center",
                  py: 10,
                  border: "2px dashed #e0e7ff",
                  background: "transparent",
                }}
              >
                <AutoAwesome
                  sx={{ fontSize: 80, color: "#e0e7ff", mb: 2 }}
                />
                <Typography variant="h5" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  No data extracted yet
                </Typography>
                <Typography color="text.secondary">
                  Go to the first tab and paste a transcript to begin
                </Typography>
              </Card>
            )}
          </Box>
        )}
      </Box>
    </Fade>
  );
}
