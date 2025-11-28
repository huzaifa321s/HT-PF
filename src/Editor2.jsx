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

const PdfPage3Editor = ({ selectedFont = "'Poppins', sans-serif" ,mode}) => {
  const dispatch = useDispatch();
  const page3 = mode === 'edit-doc' ? useSelector((s) => s.page3.edit) : useSelector((s) => s.page3.create);

  const [data, setData] = useState(page3);
  const [edit, setEdit] = useState(null);
  const [resetDialog, setResetDialog] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => setData(page3), [page3]);

  const autoSave = useCallback(
    debounce(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 600),
    []
  );

  const inputStyle = {
    fontFamily: selectedFont,
    "& .MuiOutlinedInput-root": {
      borderRadius: 4,
      bgcolor: "white",
      fontSize: "1.05rem",
    },
  };

  const update = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    autoSave();
  };

  const saveField = (field) => {
    if (field === "title") dispatch(updateTitle(data.title));
    if (field === "subtitle") dispatch(updateSubtitle(data.subtitle));
    setEdit(null);
    dispatch(showToast({ message: "Updated successfully", severity: "success" }));
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
    dispatch(showToast({ message: "Content saved successfully", severity: "success" }));
  };

  const reset = async () => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    try {
      dispatch(resetPage());
      await axiosInstance.post(`/api/proposals/pages/reset/${user.id}`);
      dispatch(showToast({ message: "Page reset successfully", severity: "success" }));
      setResetDialog(false);
    } catch {
      dispatch(showToast({ message: "Reset failed", severity: "error" }));
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", px: { xs: 1, md: 2 }, py: 1 }}>
      {/* Premium Header */}
      <Paper
        elevation={10}
        sx={{
          p: 4,
          mb: 4,
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
            background: "linear-gradient(90deg, #f093fb 0%, #f5576c 100%)",
          },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" justifyContent={'center'}>
          <Description sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h4" fontWeight={900}>
              About Humantek
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
              Craft your company story with precision
            </Typography>
          </Box>
        </Stack>
      </Paper>

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
      <Paper
        elevation={6}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 5,
          background: "linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%)",
          border: "1px solid rgba(102,126,234,0.2)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
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
              px: 3,
              py: 3,
              height:50,
              "&:hover": {
                borderColor: "#764ba2",
                bgcolor: "rgba(102,126,234,0.1)",
              },
            }}
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
              fontSize: "0.6rem",
            }}
          />
        </Stack>
      </Paper>

      {/* Title Field */}
      <Card
        elevation={6}
        sx={{
          mb: 3,
          borderRadius: 5,
          border: "1px solid rgba(102,126,234,0.15)",
          transition: "0.3s",
          "&:hover": { boxShadow: "0 12px 32px rgba(102,126,234,0.15)" },
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Page Title
            </Typography>
            <IconButton
              onClick={() => (edit === "title" ? saveField("title") : setEdit("title"))}
              sx={{
                bgcolor: edit === "title" ? "rgba(76,175,80,0.15)" : "rgba(102,126,234,0.1)",
                color: edit === "title" ? "#2e7d32" : "#667eea",
                "&:hover": { bgcolor: edit === "title" ? "rgba(76,175,80,0.25)" : "rgba(102,126,234,0.2)" },
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
        </CardContent>
      </Card>

      {/* Subtitle Field */}
      <Card
        elevation={6}
        sx={{
          mb: 4,
          borderRadius: 5,
          border: "1px solid rgba(102,126,234,0.15)",
          transition: "0.3s",
          "&:hover": { boxShadow: "0 12px 32px rgba(102,126,234,0.15)" },
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Subtitle
            </Typography>
            <IconButton
              onClick={() => (edit === "subtitle" ? saveField("subtitle") : setEdit("subtitle"))}
              sx={{
                bgcolor: edit === "subtitle" ? "rgba(76,175,80,0.15)" : "rgba(102,126,234,0.1)",
                color: edit === "subtitle" ? "#2e7d32" : "#667eea",
                "&:hover": { bgcolor: edit === "subtitle" ? "rgba(76,175,80,0.25)" : "rgba(102,126,234,0.2)" },
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
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
              {data.subtitle || "(No subtitle)"}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Content Blocks */}
      <Typography
        variant="h5"
        fontWeight={800}
        mb={3}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Content Blocks
      </Typography>

      {data.elements.map((el, i) => (
        <Card
          key={el.id}
          elevation={6}
          sx={{
            mb: 3,
            borderRadius: 5,
            border: "1px solid rgba(102,126,234,0.15)",
            transition: "0.3s",
            "&:hover": { boxShadow: "0 12px 32px rgba(102,126,234,0.15)" },
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextFields sx={{ color: "#667eea", fontSize: 28 }} />
                <Typography fontWeight={700} color="#667eea">
                  Text Block #{i + 1}
                </Typography>
              </Stack>
              <IconButton
                onClick={() => (edit === el.id ? saveElement(el.id) : setEdit(el.id))}
                sx={{
                  bgcolor: edit === el.id ? "rgba(76,175,80,0.15)" : "rgba(102,126,234,0.1)",
                  color: edit === el.id ? "#2e7d32" : "#667eea",
                  "&:hover": { bgcolor: edit === el.id ? "rgba(76,175,80,0.25)" : "rgba(102,126,234,0.2)" },
                }}
              >
                {edit === el.id ? <Save /> : <Edit />}
              </IconButton>
            </Stack>

            {edit === el.id ? (
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

      {/* Reset Dialog */}
      <Dialog open={resetDialog} onClose={() => setResetDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#667eea", color: "white", py: 3, fontWeight: 700 }}>
          <Warning sx={{ mr: 1, verticalAlign: "middle" }} />
          Reset About Humantek Page?
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
            This action cannot be undone!
          </Alert>
          <Typography>
            All content including title, subtitle, and text blocks will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={() => setResetDialog(false)} size="large">
            Cancel
          </Button>
          <Button
            onClick={reset}
            variant="contained"
            color="error"
            size="large"
            sx={{ px: 5, fontWeight: 700 }}
          >
            Yes, Reset Page
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PdfPage3Editor;