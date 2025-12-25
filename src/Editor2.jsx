// src/components/PdfPage3Editor.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  Add,
  Edit,
  Save,
  RefreshOutlined,
  Description,
  TextFields,
  CheckCircle,
  Warning,
  CloudUpload,
  Image as ImageIcon,
  AutoAwesome,
  DoneAll,
} from "@mui/icons-material";

import {
  updateTitle,
  updateSubtitle,
  editElementContent,
  addElement,
  resetPage,
} from "../src/utils/page3Slice";

import { showToast } from "../src/utils/toastSlice";
import axiosInstance from "../src/utils/axiosInstance";
import debounce from "lodash.debounce";

const PdfPage3Editor = ({ selectedFont = "'Poppins', sans-serif", mode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useDispatch();
  const page3 =
    mode === "edit-doc"
      ? useSelector((s) => s.page3.edit)
      : useSelector((s) => s.page3.create);

  const [data, setData] = useState(page3);
  const [edit, setEdit] = useState(null);
  const [resetDialog, setResetDialog] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => setData(page3), [page3]);

  const autoSave = useCallback(
    debounce(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 600),
    []
  );

  const update = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    autoSave();
  };

  const saveField = (field) => {
    if (field === "title") dispatch(updateTitle(data.title));
    if (field === "subtitle") dispatch(updateSubtitle(data.subtitle));
    setEdit(null);
    dispatch(
      showToast({ message: "Updated successfully", severity: "success" })
    );
  };

  const updateElement = (id, value) => {
    setData((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === id ? { ...el, content: value } : el
      ),
    }));
    autoSave();
  };

  const saveElement = (id) => {
    const element = data.elements.find((x) => x.id === id);
    dispatch(editElementContent({ id, content: element.content }));
    setEdit(null);
    dispatch(
      showToast({ message: "Content saved successfully", severity: "success" })
    );
  };

  const handleImageUpload = (id, file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      dispatch(
        showToast({
          message: "Please upload a valid image file",
          severity: "error",
        })
      );
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      dispatch(
        showToast({
          message: "Image size should be less than 5MB",
          severity: "error",
        })
      );
      return;
    }

    setUploading(true);

    // Convert image to base64 or create object URL
    const reader = new FileReader();

    reader.onload = (e) => {
      const imagePath = e.target.result; // base64 string

      // Update element with new image path
      setData((prev) => ({
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === id ? { ...el, content: imagePath } : el
        ),
      }));

      dispatch(
        editElementContent({
          id,
          content: imagePath,
          type: "image",
          dimensions: { width: "85%", height: "100%" },
        })
      );
      dispatch(
        showToast({
          message: "Image uploaded successfully",
          severity: "success",
        })
      );
      autoSave();
      setUploading(false);
    };

    reader.onerror = () => {
      dispatch(
        showToast({ message: "Image upload failed", severity: "error" })
      );
      setUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const reset = async () => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    try {
      dispatch(resetPage());
      await axiosInstance.post(`/api/proposals/pages/reset/${user.id}`);
      dispatch(
        showToast({ message: "Page reset successfully", severity: "success" })
      );
      setResetDialog(false);
    } catch {
      dispatch(showToast({ message: "Reset failed", severity: "error" }));
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
    p: { xs: 1.5, sm: 3, md: 4 },
    background: "linear-gradient(135deg, #f5f7ff 0%, #f0f2ff 100%)",
    border: "2px solid #e0e7ff",
    borderRadius: 3,
    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.1)",
  };

  const inputStyle = {
    mb: 2,
    fontFamily: selectedFont,
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
        <CardContent sx={{ p: { xs: 1, sm: 3, md: 4 } }}>
          {sectionHeader(<Description />, "About Humantek")}
          <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
            Craft your company story with precision
          </Typography>

          {/* Auto-save Notification */}
          {saved && (
            <Alert
              icon={<CheckCircle sx={{ color: "#4caf50" }} />}
              severity="success"
              sx={{
                mb: 3,
                borderRadius: 4,
                bgcolor: "rgba(76,175,80,0.1)",
                border: "1px solid rgba(76,175,80,0.3)",
                fontWeight: 600,
              }}
            >
              Changes saved automatically
            </Alert>
          )}

          {/* Action Bar */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={2}
            alignItems="center"
            sx={{ mb: 4 }}
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
                px: 3,
                py: 1.5,
                "&:hover": {
                  borderColor: colorScheme.secondary,
                  bgcolor: "rgba(102,126,234,0.1)",
                },
              }}
              fullWidth
            >
              Reset This Page
            </Button>

            <Chip
              icon={<CheckCircle sx={{ color: "#4caf50" }} />}
              label="Auto-Saving Enabled"
              sx={{
                bgcolor: "rgba(76,175,80,0.15)",
                color: "#2e7d32",
                fontWeight: 700,
                height: 40,
                fontSize: "0.75rem",
                width: { xs: "100%", sm: "auto" },
              }}
            />
          </Stack>

          {/* Title Field */}
          <Box sx={{ mb: 4 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Page Title
              </Typography>
              <IconButton
                onClick={() =>
                  edit === "title" ? saveField("title") : setEdit("title")
                }
                sx={{
                  bgcolor:
                    edit === "title"
                      ? "rgba(76,175,80,0.15)"
                      : "rgba(102,126,234,0.1)",
                  color: edit === "title" ? "#2e7d32" : "#667eea",
                  "&:hover": {
                    bgcolor:
                      edit === "title"
                        ? "rgba(76,175,80,0.25)"
                        : "rgba(102,126,234,0.2)",
                  },
                }}
              >
                {edit === "title" ? <Save /> : <Edit />}
              </IconButton>
            </Stack>

            {edit === "title" ? (
              <TextField
                fullWidth
                value={data.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Who We Are"
                sx={inputStyle}
                autoFocus
              />
            ) : (
              <Typography variant="h5" fontWeight={700} color="text.primary">
                {data.title || "(No title set)"}
              </Typography>
            )}
          </Box>

          {/* Subtitle Field */}
          <Box sx={{ mb: 4 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Subtitle
              </Typography>
              <IconButton
                onClick={() =>
                  edit === "subtitle"
                    ? saveField("subtitle")
                    : setEdit("subtitle")
                }
                sx={{
                  bgcolor:
                    edit === "subtitle"
                      ? "rgba(76,175,80,0.15)"
                      : "rgba(102,126,234,0.1)",
                  color: edit === "subtitle" ? "#2e7d32" : "#667eea",
                  "&:hover": {
                    bgcolor:
                      edit === "subtitle"
                        ? "rgba(76,175,80,0.25)"
                        : "rgba(102,126,234,0.2)",
                  },
                }}
              >
                {edit === "subtitle" ? <Save /> : <Edit />}
              </IconButton>
            </Stack>

            {edit === "subtitle" ? (
              <TextField
                fullWidth
                multiline
                rows={2}
                value={data.subtitle}
                onChange={(e) => update("subtitle", e.target.value)}
                placeholder="e.g. Driving innovation with passion and purpose"
                sx={inputStyle}
                autoFocus
              />
            ) : (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontSize: "1.1rem", lineHeight: 1.7 }}
              >
                {data.subtitle || "(No subtitle)"}
              </Typography>
            )}
          </Box>

          {/* Content Blocks */}
          <Typography
            variant="h6"
            fontWeight={800}
            mb={3}
            sx={{
              background: colorScheme.gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Content Blocks
          </Typography>

          {data.elements.map((el, i) => (
            <Card
              key={el.id}
              elevation={0}
              sx={{
                mb: 3,
                borderRadius: 2,
                border: "1px solid #e0e7ff",
                bgcolor: "#f8f9fa",
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    {el.type === "image" ? (
                      <ImageIcon sx={{ color: "#667eea", fontSize: 24 }} />
                    ) : (
                      <TextFields sx={{ color: "#667eea", fontSize: 24 }} />
                    )}
                    <Typography fontWeight={700} color="#667eea">
                      {el.type === "image"
                        ? `Image Block #${i + 1}`
                        : `Text Block #${i + 1}`}
                    </Typography>
                  </Stack>
                  {el.type !== "image" && (
                    <IconButton
                      onClick={() =>
                        edit === el.id ? saveElement(el.id) : setEdit(el.id)
                      }
                      sx={{
                        bgcolor:
                          edit === el.id
                            ? "rgba(76,175,80,0.15)"
                            : "rgba(102,126,234,0.1)",
                        color: edit === el.id ? "#2e7d32" : "#667eea",
                        "&:hover": {
                          bgcolor:
                            edit === el.id
                              ? "rgba(76,175,80,0.25)"
                              : "rgba(102,126,234,0.2)",
                        },
                      }}
                    >
                      {edit === el.id ? <Save /> : <Edit />}
                    </IconButton>
                  )}
                </Stack>

                {el.type === "image" ? (
                  <Box>
                    {/* Image Preview */}
                    <Box
                      sx={{
                        width: "100%",
                        maxHeight: 300,
                        mb: 2,
                        borderRadius: 3,
                        overflow: "hidden",
                        border: "2px dashed rgba(102,126,234,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "rgba(102,126,234,0.05)",
                      }}
                    >
                      {el.content ? (
                        <img
                          src={el.content}
                          alt="Preview"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "300px",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <Typography color="text.secondary">
                          No image uploaded
                        </Typography>
                      )}
                    </Box>

                    {/* Upload Button */}
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={uploading ? null : <CloudUpload />}
                      disabled={uploading}
                      sx={{
                        borderRadius: 10,
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        background: colorScheme.gradient,
                        "&:hover": {
                          background: colorScheme.hoverGradient,
                        },
                      }}
                      fullWidth
                    >
                      {uploading ? "Uploading..." : "Upload New Image"}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(el.id, file);
                        }}
                      />
                    </Button>
                  </Box>
                ) : edit === el.id ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    value={el.content}
                    onChange={(e) => updateElement(el.id, e.target.value)}
                    sx={inputStyle}
                    autoFocus
                  />
                ) : (
                  <Typography
                    sx={{
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.8,
                      color: "text.primary",
                      fontSize: "1.05rem",
                    }}
                  >
                    {el.content || "(Empty block)"}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Reset Dialog */}
      <Dialog
        open={resetDialog}
        onClose={() => setResetDialog(false)}
        open={resetDialog}
        onClose={() => setResetDialog(false)}
        maxWidth="sm"
        fullScreen={isMobile}
        sx={{ borderRadius: isMobile ? 0 : 5 }}
        fullWidth
      >
        <DialogTitle
          sx={{ bgcolor: "#667eea", color: "white", py: 3, fontWeight: 700 }}
        >
          <Box display="flex" alignItems="center">
            <Warning sx={{ mr: 1 }} />
            Reset About Humantek Page?
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
            This action cannot be undone!
          </Alert>
          <Typography>
            All content including title, subtitle, and text blocks will be
            permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2, flexDirection: isMobile ? "column" : "row" }}>
          <Button onClick={() => setResetDialog(false)} size="large" sx={{ borderRadius: 10 }} fullWidth>
            Cancel
          </Button>
          <Button
            onClick={reset}
            variant="contained"
            color="error"
            size="large"
            sx={{ px: 5, fontWeight: 700, borderRadius: 10 }}
            fullWidth
          >
            Yes, Reset Page
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PdfPage3Editor;