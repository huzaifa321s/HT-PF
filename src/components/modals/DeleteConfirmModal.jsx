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
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
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
  const [isHovered, setIsHovered] = useState({}); // For button hover states
  const dispatch = useDispatch();

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.delete(
        `${import.meta.env.VITE_APP_BASE_URL}/api/proposals/delete-proposal/${id}`
      );

      if (res.data.success) {
        dispatch(
          showToast({
            message: "✅ Proposal deleted successfully!",
            severity: "success",
          })
        );
        if (length === 1) {
          fetchProposals(1);
        }
        handleClose();
        setProposals((prev) => prev.filter((p) => p._id !== id));
      } else {
        dispatch(
          showToast({
            message: "❌ Failed to delete proposal.",
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
    <>
      {/* Confirmation Dialog */}
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
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            p: 1,
            background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
            position: "relative",
            overflow: "hidden",
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
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Confirm Deletion
        </DialogTitle>

        <DialogContent sx={{ textAlign: "center", py: 2 }}>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", mb: 1 }}
          >
            Are you sure you want to delete this proposal?
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "#f44336" }}
          >
            This action cannot be undone.
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
          <Tooltip title="Cancel and close the dialog" arrow>
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{
                px: 3,
                py: 1.5,
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
              onMouseEnter={() =>
                setIsHovered({ ...isHovered, cancel: true })
              }
              onMouseLeave={() =>
                setIsHovered({ ...isHovered, cancel: false })
              }
            >
              Cancel
            </Button>
          </Tooltip>
          <Tooltip title="Permanently delete the proposal" arrow>
            <Button
              onClick={handleDelete}
              variant="contained"
              disabled={loading}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 3,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                background:
                  "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
                boxShadow: "0 8px 24px rgba(244, 67, 54, 0.4)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 32px rgba(244, 67, 54, 0.5)",
                },
                "&:disabled": {
                  background:
                    "linear-gradient(135deg, #ccc 0%, #999 100%)",
                },
                transition: "all 0.3s ease",
              }}
              startIcon={
                loading ? (
                  <CircularProgress size={20} sx={{ color: "#fff" }} />
                ) : (
                  <DeleteIcon />
                )
              }
              onMouseEnter={() =>
                setIsHovered({ ...isHovered, delete: true })
              }
              onMouseLeave={() =>
                setIsHovered({ ...isHovered, delete: false })
              }
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </Tooltip>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteConfirmModal;