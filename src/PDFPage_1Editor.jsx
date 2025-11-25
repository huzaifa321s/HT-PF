// src/components/editors/PdfPage1Editor.jsx
import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Paper, Stack, Divider } from "@mui/material";
import { Save, RefreshOutlined, Warning as WarningIcon } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { PDFViewer } from "@react-pdf/renderer";

import CombinedPdfDocument from "../CombinedPdfDocument";

import { setBrandName, setBrandTagline, setProjectBrief, resetPage1 } from "../../utils/page1Slice";
import axiosInstance from "../../utils/axiosInstance";
import { showToast } from "../../utils/toastSlice";

const PdfPage1Editor = ({ selectedFont = "'Poppins', sans-serif" }) => {
  const dispatch = useDispatch();
  const pageDataRT = useSelector((state) => state.page1Slice);

  const [data, setData] = useState({
    brandName: pageDataRT.brandName,
    brandTagline: pageDataRT.brandTagline,
  });

  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    setData({
      brandName: pageDataRT.brandName,
      brandTagline: pageDataRT.brandTagline,
    });
  }, [pageDataRT]);

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (field) => {
    if (field === "brandName") dispatch(setBrandName(data.brandName));
    if (field === "brandTagline") dispatch(setBrandTagline(data.brandTagline));

    dispatch(showToast({ message: `${field} updated`, severity: "success" }));
  };

  return (
    <Box sx={{ width: "100%", height: "100vh", display: "flex", gap: 3, p: 3 }}>

      {/* Left Side Form */}
      <Paper sx={{ width: 400, p: 3, overflowY: "auto" }}>

        <Typography variant="h5" sx={{ mb: 1, fontWeight: 700, color: "#FF8C00" }}>
          Edit Page 1
        </Typography>
        <Divider />

        <Stack spacing={3} mt={2}>

          <TextField
            fullWidth
            label="Brand Name"
            value={data.brandName}
            onChange={(e) => handleChange("brandName", e.target.value)}
          />
          <Button variant="contained" onClick={() => handleSave("brandName")}>
            <Save /> Save
          </Button>

          <Divider />
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Brand Tagline"
            value={data.brandTagline}
            onChange={(e) => handleChange("brandTagline", e.target.value)}
          />
          <Button variant="contained" onClick={() => handleSave("brandTagline")}>
            <Save /> Save
          </Button>

        </Stack>
      </Paper>

      {/* Right Side PDF Viewer */}
      <Box sx={{ flex: 1 }}>
        <PDFViewer width="100%" height="100%">
          <CombinedPdfDocument {...data} />
        </PDFViewer>
      </Box>

    </Box>
  );
};

export default PdfPage1Editor;
