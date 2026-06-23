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
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useDispatch } from "react-redux";
import { showToast } from "../../utils/toastSlice";
import axiosInstance from "../../utils/axiosInstance";

// Slide Transition for Dialog
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DeleteConfirmModal = ({
  open,
  handleClose,
  id,
  setProposals,
  length,
  fetchProposals,
}) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleTrash = async () => {
    try {
      setLoading(true);
      // Soft-delete: move to trash (NOT permanent delete)
      const res = await axiosInstance.patch(
        `/api/proposals/trash/${id}`
      );

      if (res.data.success) {
        dispatch(
          showToast({
            message: "🗑️ Proposal moved to trash. You can restore it anytime.",
            severity: "success",
          })
        );
        handleClose();
        setProposals((prev) => {
          const next = prev.filter((p) => p._id !== id);
          if (next.length === 0) {
            try {
              fetchProposals(1);
            } catch {}
          }
          return next;
        });
      } else {
        dispatch(
          showToast({
            message: "❌ Failed to move proposal to trash.",
            severity: "error",
          })
        );
      }
    } catch (error) {
      console.error(error);
      dispatch(
        showToast({
          message: "⚠️ Server error while moving proposal to trash.",
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
            boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
            p: 1,
            background: "linear-gradient(135deg, #141414 0%, #1a1a1a 100%)",
            border: "1px solid rgba(243, 168, 51, 0.2)",
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
                "linear-gradient(90deg, #f3a833 0%, #f59e0b 50%, #fbbf24 100%)",
              backgroundSize: "200% 100%",
              animation: loading ? "shimmer 2s infinite" : "none",
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
            background: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Move to Trash?
        </DialogTitle>

        <DialogContent sx={{ textAlign: "center", py: 2.5 }}>
          {/* Trash icon visual */}
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(243, 168, 51, 0.08)",
              border: "2px solid rgba(243, 168, 51, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 36, color: "#f3a833" }} />
          </Box>
          <Typography
            variant="body1"
            sx={{ color: "#f8fafc", mb: 1, fontWeight: 600 }}
          >
            Move this proposal to Trash?
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#94a3b8" }}
          >
            It will be safely stored in the Trash. You can restore it anytime or permanently delete it from there.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "center",
            gap: 1.5,
          }}
        >
          <Tooltip title="Cancel — keep proposal" arrow>
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

          <Tooltip title="Move to Trash (can be restored)" arrow>
            <Button
              onClick={handleTrash}
              variant="contained"
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={18} sx={{ color: "#fff" }} />
                ) : (
                  <DeleteOutlineIcon />
                )
              }
              sx={{
                px: 3,
                py: 1.2,
                borderRadius: 3,
                textTransform: "none",
                fontSize: "0.95rem",
                fontWeight: 600,
                background:
                  "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
                boxShadow: "0 8px 24px rgba(243, 168, 51, 0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #eab308 0%, #d97706 100%)",
                  boxShadow: "0 12px 32px rgba(243, 168, 51, 0.45)",
                  transform: "translateY(-1px)",
                },
                "&:disabled": {
                  background: "linear-gradient(135deg, #555 0%, #333 100%)",
                  boxShadow: "none",
                },
                transition: "all 0.2s ease",
              }}
            >
              {loading ? "Moving..." : "Move to Trash"}
            </Button>
          </Tooltip>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteConfirmModal;
