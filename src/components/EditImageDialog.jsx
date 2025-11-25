import React, { useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Button,
  Typography,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

export default function EditImageDialog({
  editDialog,
  setEditDialog,
  handleSaveImageDimensions,
}) {
  const widthRef = useRef(null);

  // Preset options
  const presets = [
    { label: "Square (200×200)", width: "200px", height: "200px" },
    { label: "Landscape (400×300)", width: "400px", height: "300px" },
    { label: "Full Width", width: "100%", height: "auto" },
    { label: "Small Thumbnail", width: "150px", height: "150px" },
  ];

  useEffect(() => {
    if (editDialog.open && widthRef.current) {
      setTimeout(() => widthRef.current.focus(), 200);
    }
  }, [editDialog.open]);

  const handlePresetChange = (preset) => {
    setEditDialog((prev) => ({
      ...prev,
      dimensions: { width: preset?.width, height: preset?.height },
    }));
  };

  return (
    <Dialog
      open={editDialog.open}
      onClose={() =>
        setEditDialog({
          open: false,
          elementId: null,
          dimensions: { width: "", height: "" },
        })
      }
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
    >
      <DialogTitle sx={{ textAlign: "center", fontWeight: 600, pb: 1 }}>
        🖼️ Edit Image Dimensions
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Adjust width or height below, or pick a preset size.
          </Typography>
        </Box>

        {/* Preset Selection */}
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Preset Sizes</InputLabel>
          <Select
            value=""
            label="Preset Sizes"
            onChange={(e) => handlePresetChange(presets[e.target.value])}
          >
            {presets.map((preset, index) => (
              <MenuItem key={index} value={index}>
                {preset.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              inputRef={widthRef}
              fullWidth
              size="small"
              label="Width"
              placeholder="e.g. 400px or 50%"
              value={editDialog.dimensions?.width}
              onChange={(e) =>
                setEditDialog((prev) => ({
                  ...prev,
                  dimensions: { ...prev.dimensions, width: e.target.value },
                }))
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              label="Height"
              placeholder="e.g. 300px or auto"
              value={editDialog.dimensions?.height}
              onChange={(e) =>
                setEditDialog((prev) => ({
                  ...prev,
                  dimensions: { ...prev.dimensions, height: e.target.value },
                }))
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        {editDialog.elementId && (
          <Box
            sx={{
              mt: 3,
              textAlign: "center",
              border: "1px dashed #ccc",
              borderRadius: 2,
              p: 1.5,
              backgroundColor: "#fafafa",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Current: {editDialog.dimensions?.width || "auto"} ×{" "}
              {editDialog.dimensions?.height || "auto"}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button
          onClick={() =>
            setEditDialog({
              open: false,
              elementId: null,
              dimensions: { width: "", height: "" },
            })
          }
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={handleSaveImageDimensions}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
