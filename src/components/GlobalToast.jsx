// src/components/GlobalToast.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Snackbar, Alert, Box, LinearProgress } from "@mui/material";
import { hideToast } from "../utils/toastSlice";

export default function GlobalToast() {
  const dispatch = useDispatch();
  const {
    open,
    message,
    severity,
    duration = 3000,
    loading,
  } = useSelector((state) => state.toast);

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    dispatch(hideToast());
  };

  
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{ maxWidth: 400 }}
    >
      <Box
        sx={{
          width: "100%",
          position: "relative",
          borderRadius: 5,
          background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          },
        }}
      >
        {/* Top Loader */}
        {loading && (
          <LinearProgress
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 5,
              borderRadius: 1,
              bgcolor: "rgba(0,0,0,0.08)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 1,
                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 2px 10px rgba(102, 126, 234, 0.4)",
              },
            }}
          />
        )}
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderRadius: 5,
            bgcolor:
              severity === "success"
                ? "rgba(76, 175, 80, 0.9)"
                : severity === "error"
                ? "rgba(244, 67, 54, 0.9)"
                : severity === "warning"
                ? "rgba(255, 152, 0, 0.9)"
                : "rgba(102, 126, 234, 0.9)",
            color: "#fff",
            "& .MuiAlert-message": {
              fontSize: "1rem",
              fontWeight: 600,
              background: "linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            },
            "& .MuiAlert-action": {
              color: "#fff",
              "&:hover": {
                transform: "scale(1.1)",
                transition: "all 0.3s ease",
              },
            },
            transition: "all 0.3s ease",
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: message }} />
        </Alert>
      </Box>
    </Snackbar>
  );
}
