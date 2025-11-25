// File: PreviewConfirmDialog.jsx
import React, { forwardRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  Divider,
  Slide,
} from "@mui/material";

// Smooth slide-up transition
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PreviewConfirmDialog = ({
  open,
  onClose,
  onViewPDF,        // View PDF → scroll to preview
  onContinue,       // Skip preview → generate directly
  dontShowNext,
  setDontShowNext,
}) => {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 3,
          padding: "10px 5px 15px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", fontWeight: 700, fontSize: "22px", color: "#1976d2" }}>
        Preview Before Generating
      </DialogTitle>

      <Divider sx={{ mb: 1 }} />

      <DialogContent>
        <Typography sx={{ mb: 2, fontSize: "15px", color: "text.secondary", lineHeight: 1.6 }}>
          Would you like to <strong>preview your PDF</strong> before generating it?  
          You can check your layout, background, fonts, and text alignment before finalizing.
        </Typography>

        <Box
          sx={{
            backgroundColor: "#e3f2fd",
            border: "1px dashed #2196f3",
            borderRadius: 2,
            p: 2,
            mb: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" sx={{ color: "#1976d2", fontWeight: 600 }}>
            Tip: This helps ensure your PDF looks <strong>exactly</strong> as expected before export.
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={dontShowNext}
              onChange={(e) => setDontShowNext(e.target.checked)}
              color="primary"
            />
          }
          label="Don't show this dialog next time"
          sx={{
            mt: 1,
            "& .MuiTypography-root": { 
              fontSize: "14px", 
              color: "text.secondary",
              fontWeight: 500,
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
        <Button
          variant="outlined"
          onClick={onViewPDF}
          size="large"
          sx={{
            textTransform: "none",
            borderRadius: "12px",
            px: 4,
            py: 1.2,
            fontWeight: 600,
            border: "2px solid #1976d2",
            color: "#1976d2",
            "&:hover": {
              border: "2px solid #1565c0",
              backgroundColor: "#e3f2fd",
            },
          }}
        >
          View PDF Preview
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={onContinue}
          size="large"
          sx={{
            textTransform: "none",
            borderRadius: "12px",
            px: 4,
            py: 1.2,
            fontWeight: 600,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
            },
          }}
        >
          Continue Generating
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreviewConfirmDialog;