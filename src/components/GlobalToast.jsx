"use client";
// src/components/GlobalToast.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Snackbar, Box, LinearProgress, Button, useMediaQuery, useTheme } from "@mui/material";
import {
  CheckCircleOutline,
  ErrorOutline,
  WarningAmberOutlined,
  InfoOutlined,
  Close,
} from "@mui/icons-material";
import { hideToast, clearUndoAction } from "../utils/toastSlice";

const SEVERITY_CONFIG = {
  success: {
    icon: CheckCircleOutline,
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.35)",
    glow: "rgba(16, 185, 129, 0.25)",
    progressBar: "linear-gradient(90deg, #10b981, #34d399)",
    label: "Success",
  },
  error: {
    icon: ErrorOutline,
    color: "#f43f5e",
    bg: "rgba(244, 63, 94, 0.12)",
    border: "rgba(244, 63, 94, 0.35)",
    glow: "rgba(244, 63, 94, 0.25)",
    progressBar: "linear-gradient(90deg, #f43f5e, #fb7185)",
    label: "Error",
  },
  warning: {
    icon: WarningAmberOutlined,
    color: "#f3a833",
    bg: "rgba(243, 168, 51, 0.12)",
    border: "rgba(243, 168, 51, 0.35)",
    glow: "rgba(243, 168, 51, 0.25)",
    progressBar: "linear-gradient(90deg, #f3a833, #f59e0b)",
    label: "Warning",
  },
  info: {
    icon: InfoOutlined,
    color: "#38bdf8",
    bg: "rgba(56, 189, 248, 0.12)",
    border: "rgba(56, 189, 248, 0.35)",
    glow: "rgba(56, 189, 248, 0.25)",
    progressBar: "linear-gradient(90deg, #38bdf8, #7dd3fc)",
    label: "Info",
  },
};

export default function GlobalToast() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    open,
    message,
    severity = "success",
    duration = 3000,
    loading,
    undoAction,
  } = useSelector((state) => state.toast);

  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
  const Icon = config.icon;

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    dispatch(hideToast());
  };

  const handleUndo = () => {
    if (undoAction) {
      dispatch(undoAction);
      dispatch(clearUndoAction());
      dispatch(hideToast());
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={loading ? null : duration}
      onClose={handleClose}
      anchorOrigin={
        isMobile
          ? { vertical: "top", horizontal: "center" }
          : { vertical: "top", horizontal: "right" }
      }
      sx={{
        top: { xs: "16px !important", sm: "24px !important" },
        right: { xs: "auto", sm: "24px !important" },
        left: isMobile ? "50% !important" : "auto",
        transform: isMobile ? "translateX(-50%) !important" : "none",
        zIndex: 99999,
      }}
    >
      <Box
        sx={{
          minWidth: isMobile ? "90vw" : 340,
          maxWidth: isMobile ? "90vw" : 420,
          position: "relative",
          borderRadius: "16px",
          background: "linear-gradient(135deg, rgba(15,15,15,0.97) 0%, rgba(20,20,20,0.97) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${config.border}`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03), 0 0 20px ${config.glow}`,
          overflow: "hidden",
          animation: "toastSlideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          "@keyframes toastSlideIn": {
            from: { opacity: 0, transform: "translateY(-20px) scale(0.92)" },
            to: { opacity: 1, transform: "translateY(0) scale(1)" },
          },
          "&:hover": {
            boxShadow: `0 12px 40px rgba(0,0,0,0.7), 0 0 28px ${config.glow}`,
            transform: "translateY(-2px)",
            transition: "all 0.25s ease",
          },
          transition: "all 0.25s ease",
        }}
      >
        {/* Top accent line */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: config.progressBar,
            borderRadius: "16px 16px 0 0",
          }}
        />

        {/* Loading progress bar */}
        {loading && (
          <LinearProgress
            sx={{
              position: "absolute",
              top: "2px",
              left: 0,
              right: 0,
              height: 3,
              bgcolor: "rgba(255,255,255,0.05)",
              "& .MuiLinearProgress-bar": {
                background: config.progressBar,
              },
            }}
          />
        )}

        {/* Main content */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            p: "14px 16px",
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: config.bg,
              border: `1px solid ${config.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ fontSize: 20, color: config.color }} />
          </Box>

          {/* Text */}
          <Box sx={{ flex: 1, minWidth: 0, pt: "2px" }}>
            <Box
              sx={{
                fontSize: "11px",
                fontWeight: 700,
                color: config.color,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                mb: 0.3,
                lineHeight: 1,
              }}
            >
              {config.label}
            </Box>
            <Box
              sx={{
                fontSize: "13.5px",
                fontWeight: 500,
                color: "#e2e8f0",
                lineHeight: 1.5,
                wordBreak: "break-word",
              }}
              dangerouslySetInnerHTML={{ __html: message }}
            />

            {/* Undo button */}
            {undoAction && (
              <Button
                size="small"
                onClick={handleUndo}
                sx={{
                  mt: 1,
                  px: 1.5,
                  py: 0.4,
                  fontSize: "11px",
                  fontWeight: 700,
                  color: config.color,
                  bgcolor: config.bg,
                  border: `1px solid ${config.border}`,
                  borderRadius: "8px",
                  textTransform: "none",
                  lineHeight: 1.4,
                  minHeight: "auto",
                  "&:hover": {
                    bgcolor: `${config.bg}`,
                    filter: "brightness(1.3)",
                  },
                }}
              >
                ↩ UNDO
              </Button>
            )}
          </Box>

          {/* Close button */}
          <Box
            onClick={handleClose}
            sx={{
              flexShrink: 0,
              width: 24,
              height: 24,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#64748b",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.08)",
                color: "#e2e8f0",
              },
            }}
          >
            <Close sx={{ fontSize: 15 }} />
          </Box>
        </Box>
      </Box>
    </Snackbar>
  );
}
