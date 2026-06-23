"use client";
import React, { useState, forwardRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Slide,
  CircularProgress,
  Tooltip,
  Box,
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useDispatch } from "react-redux";
import { showToast } from "../../utils/toastSlice";
import axiosInstance from "../../utils/axiosInstance";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PermanentDeleteModal = ({ open, handleClose, id, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handlePermanentDelete = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.delete(
        `/api/proposals/permanent-delete/${id}`
      );

      if (res.data.success) {
        dispatch(
          showToast({
            message: "🗑️ Proposal permanently deleted.",
            severity: "success",
          })
        );
        handleClose();
        if (onDeleted) onDeleted(id);
      } else {
        dispatch(
          showToast({
            message: "❌ Failed to permanently delete proposal.",
            severity: "error",
          })
        );
      }
    } catch (error) {
      console.error(error);
      dispatch(
        showToast({
          message: "⚠️ Server error while deleting proposal.",
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      keepMounted
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 20px 60px rgba(0,0,0,0.9)",
          p: 1,
          background: "linear-gradient(135deg, #1a0a0a 0%, #1f1010 100%)",
          border: "1px solid rgba(244, 67, 54, 0.3)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background:
              "linear-gradient(90deg, #f44336 0%, #d32f2f 50%, #b71c1c 100%)",
            backgroundSize: "200% 100%",
            animation: loading ? "shimmer 1.5s infinite" : "none",
          },
          "@keyframes shimmer": {
            "0%": { backgroundPosition: "-200% 0" },
            "100%": { backgroundPosition: "200% 0" },
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: "1.2rem",
          textAlign: "center",
          pb: 0,
          color: "#f44336",
        }}
      >
        Permanent Deletion
      </DialogTitle>

      <DialogContent sx={{ textAlign: "center", py: 2.5 }}>
        {/* Warning icon */}
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(244, 67, 54, 0.1)",
            border: "2px solid rgba(244, 67, 54, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <DeleteForeverIcon sx={{ fontSize: 36, color: "#f44336" }} />
        </Box>

        <Typography
          variant="body1"
          sx={{ color: "#f8fafc", mb: 1.5, fontWeight: 600 }}
        >
          This cannot be undone.
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
            p: 1.5,
            borderRadius: 2,
            background: "rgba(244, 67, 54, 0.08)",
            border: "1px solid rgba(244, 67, 54, 0.2)",
            textAlign: "left",
          }}
        >
          <WarningAmberIcon sx={{ color: "#f59e0b", fontSize: 18, mt: 0.2, flexShrink: 0 }} />
          <Typography variant="body2" sx={{ color: "#94a3b8", lineHeight: 1.6 }}>
            This proposal will be <strong style={{ color: "#f44336" }}>permanently removed</strong> from the database. The PDF file on Google Drive will remain but the proposal data will be lost forever.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "center",
          gap: 1.5,
        }}
      >
        <Tooltip title="Cancel — keep in trash" arrow>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              px: 3,
              py: 1.2,
              borderRadius: 3,
              textTransform: "none",
              fontSize: "0.95rem",
              fontWeight: 600,
              borderColor: "rgba(255,255,255,0.15)",
              color: "#94a3b8",
              "&:hover": {
                borderColor: "rgba(255,255,255,0.3)",
                color: "#f8fafc",
                background: "rgba(255,255,255,0.05)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Cancel
          </Button>
        </Tooltip>

        <Tooltip title="Permanently delete — cannot be undone" arrow>
          <Button
            onClick={handlePermanentDelete}
            variant="contained"
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={18} sx={{ color: "#fff" }} />
              ) : (
                <DeleteForeverIcon />
              )
            }
            sx={{
              px: 3,
              py: 1.2,
              borderRadius: 3,
              textTransform: "none",
              fontSize: "0.95rem",
              fontWeight: 700,
              background:
                "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
              boxShadow: "0 8px 24px rgba(244, 67, 54, 0.35)",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                boxShadow: "0 12px 32px rgba(244, 67, 54, 0.5)",
                transform: "translateY(-1px)",
              },
              "&:disabled": {
                background: "linear-gradient(135deg, #555 0%, #333 100%)",
                boxShadow: "none",
              },
              transition: "all 0.2s ease",
            }}
          >
            {loading ? "Deleting..." : "Delete Forever"}
          </Button>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
};

export default PermanentDeleteModal;
