import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Tooltip,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { showToast } from "../utils/toastSlice";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function LayoutPreviewDialog({
  previewOpen,
  setPreviewOpen,
  previewImage,
  layout,
  setSelectedLayout,
}) {
  const dispatch = useDispatch();

  const handleSetLayout = () => {
    dispatch(
      showToast({
        message: `Layout <b>${layout.name}</b> has been applied successfully!`,
        severity: "success",
      })
    );
    setSelectedLayout(layout);
    setPreviewOpen(false);
  };

  return (
    <Dialog
      open={previewOpen}
      onClose={() => setPreviewOpen(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          overflow: "hidden",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background:
              "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s infinite",
          },
          "@keyframes shimmer": {
            "0%": { backgroundPosition: "-200% 0" },
            "100%": { backgroundPosition: "200% 0" },
          },
        },
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2.5,
          background: "rgba(255,255,255,0.9)",
          borderBottom: "2px solid rgba(102, 126, 234, 0.3)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(102, 126, 234, 0.15)",
              borderRadius: "50%",
              width: 48,
              height: 48,
              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 24, color: "#667eea" }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Set BG Layout — {layout?.name || "Untitled"}
          </Typography>
        </Box>
        <Tooltip title="Apply this layout" arrow>
          <Button
            variant="contained"
            onClick={handleSetLayout}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 32px rgba(102, 126, 234, 0.5)",
              },
              transition: "all 0.3s ease",
            }}
            startIcon={<CheckCircleIcon />}
          >
            Set BG Layout
          </Button>
        </Tooltip>
      </Box>

      <Divider sx={{ borderColor: "rgba(102, 126, 234, 0.3)" }} />

      {/* Image Preview Section */}
      <DialogContent
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 3,
          background: "rgba(255,255,255,0.7)",
        }}
      >
        <motion.img
          key={previewImage}
          src={previewImage}
          alt="Layout Preview"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            maxWidth: "600px",
            maxHeight: "60vh",
            borderRadius: "16px",
            border: "2px solid rgba(102, 126, 234, 0.3)",
            boxShadow: "0 6px 24px rgba(0,0,0,0.15)",
          }}
        />
      </DialogContent>

      <Divider sx={{ borderColor: "rgba(102, 126, 234, 0.3)" }} />

      {/* Footer */}
      <DialogActions sx={{ justifyContent: "center", py: 2 }}>
        <Tooltip title="Close the preview" arrow>
          <Button
            variant="outlined"
            onClick={() => setPreviewOpen(false)}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              borderColor: "#667eea",
              color: "#667eea",
              "&:hover": {
                borderColor: "#5568d3",
                color: "#5568d3",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Close
          </Button>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
}