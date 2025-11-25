// src/components/TokenAlert.jsx
import React, { useState, useEffect } from "react";
import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Badge,
  IconButton,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Slide,
  Fade,
} from "@mui/material";
import {
  Notifications,
  Warning,
  Error as ErrorIcon,
  Info,
  Close,
  CreditCard,
  AutoAwesome,
} from "@mui/icons-material";
import axiosInstance from "../utils/axiosInstance";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function TokenAlert({ userId }) {
  const [tokenStats, setTokenStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/api/transcribe/tokens/stats", {
          skipLoader: true,
        });
        setTokenStats(res.data);
      } catch (err) {
        console.error("Global token stats error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axiosInstance.get("/api/transcribe/notifications", {
          skipLoader: true,
        });
        const unread = (res.data.notifications || []).filter((n) => !n.read);
        setNotifications(unread);
        if (unread.length > 0 && !showAlert) {
          setCurrentAlert(unread[0]);
          setShowAlert(true);
        }
      } catch (err) {
        console.error("Global notifications error:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [showAlert]);

  useEffect(() => {
    const handleInsufficientTokens = (event) => {
      if (event.detail?.error === "GLOBAL_INSUFFICIENT_TOKENS") {
        setCurrentAlert({
          type: "final",
          title: "System Out of Tokens!",
          message:
            event.detail.message ||
            "The entire system has run out of tokens. Contact admin immediately.",
          action: "CONTACT_ADMIN",
        });
        setShowAlert(true);
      }
    };
    window.addEventListener("insufficientTokens", handleInsufficientTokens);
    return () =>
      window.removeEventListener("insufficientTokens", handleInsufficientTokens);
  }, []);

  const getAlertSeverity = (type) =>
    type === "final" ? "error" : type === "critical" ? "warning" : "info";

  const getAlertIcon = (type) =>
    type === "final" ? (
      <ErrorIcon />
    ) : type === "critical" ? (
      <Warning />
    ) : (
      <Info />
    );

  const handleAlertAction = () => {
    if (currentAlert?.action === "CONTACT_ADMIN") {
      window.open(
        "mailto:admin@yourcompany.com?subject=URGENT: System Out of Tokens",
        "_blank"
      );
    }
    setShowAlert(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await axiosInstance.put(
        `/api/transcribe/notifications/${notificationId}/read`
      );
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleSnackbarClose = () => {
    setShowAlert(false);
    if (currentAlert?._id) markAsRead(currentAlert._id);
  };

  // Dynamic chip style based on alertLevel
  const getBalanceChipStyle = () => {
    const level = tokenStats?.alertLevel || "normal";
    if (level === "critical")
      return {
        bg: "rgba(255, 152, 0, 0.18)",
        border: "#ef6c00",
        color: "#e65100",
        message: "Tokens running low — use wisely!",
      };
    if (level === "final")
      return {
        bg: "rgba(244, 67, 54, 0.22)",
        border: "#d32f2f",
        color: "#c62828",
        message: "URGENT: System almost out of tokens!",
      };
    return {
      bg: "rgba(76, 175, 80, 0.15)",
      border: "#2e7d32",
      color: "#1b5e20",
      message: "All services active!",
    };
  };

  const style = getBalanceChipStyle();

  return (
    <>
      {/* MAIN TOKEN DISPLAY */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2.5,
          background: "white",
          flexWrap: "wrap",
          py: 1.5,
          px: 2,
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        {loading ? (
          <CircularProgress size={22} />
        ) : tokenStats ? (
          <Fade in timeout={600}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>

              {/* ONLY REMAINING TOKENS CHIP */}
              <Chip
                icon={<CreditCard sx={{ color: "#1976d2" }} />}
                label={
                  <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1.45 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "1.22rem", color: "#1a1a1a" }}>
                      {tokenStats.remaining?.groq_cloud.toLocaleString()} tokens left (Groq Cloud)
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: "1.12rem", color: "#e91e63" }}>
                      {tokenStats.remaining?.deepgram.toLocaleString()} tokens left (Deepgram)
                    </Typography>
                    <Typography sx={{ fontSize: "0.86rem", color: style.color, fontWeight: 600, opacity: 0.95 }}>
                      <b>{style.message}</b>
                    </Typography>
                  </Box>
                }
                sx={{
                  height: "auto",
                  py: 2.6,
                  px: 3.5,
                  bgcolor: style.bg,
                  border: `3.5px solid ${style.border}`,
                  borderRadius: 6,
                  boxShadow: "0 12px 35px rgba(0,0,0,0.22)",
                  "& .MuiChip-label": { padding: 0 },
                }}
              />

              {/* NOTIFICATION BELL */}
              <IconButton
                onClick={() => setNotificationOpen(true)}
                sx={{
                  color: notifications.length > 0 ? "#d32f2f" : "text.secondary",
                  bgcolor: notifications.length > 0 ? "rgba(211, 47, 47, 0.12)" : "transparent",
                  "&:hover": {
                    bgcolor: notifications.length > 0 ? "rgba(211, 47, 47, 0.22)" : "rgba(0,0,0,0.1)",
                  },
                  boxShadow: notifications.length > 0 ? "0 0 18px rgba(211, 47, 47, 0.35)" : "none",
                  transition: "all 0.3s ease",
                  p: 1.5,
                }}
              >
                <Badge badgeContent={notifications.length} color="error">
                  <Notifications fontSize="large" />
                </Badge>
              </IconButton>

            </Box>
          </Fade>
        ) : null}
      </Box>

      {/* Snackbar Alert */}
      <Snackbar
        open={showAlert}
        autoHideDuration={10000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={Transition}
        sx={{ mt: 9 }}
      >
        <Alert
          severity={getAlertSeverity(currentAlert?.type)}
          icon={getAlertIcon(currentAlert?.type)}
          action={
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                variant="contained"
                onClick={handleAlertAction}
                sx={{
                  fontWeight: 700,
                  bgcolor: "white",
                  color: currentAlert?.type === "final" ? "#d32f2f" : "#f57c00",
                }}
              >
                {currentAlert?.action === "CONTACT_ADMIN" ? "Contact Admin" : "View"}
              </Button>
              <IconButton size="small" onClick={handleSnackbarClose}>
                <Close fontSize="small" />
              </IconButton>
            </Box>
          }
          sx={{
            minWidth: 480,
            borderRadius: 5,
            boxShadow: "0 15px 50px rgba(0,0,0,0.35)",
            bgcolor: "background.paper",
            border: `3px solid ${currentAlert?.type === "final" ? "#d32f2f" : "#ef6c00"}`,
          }}
        >
          <AlertTitle
            sx={{
              fontWeight: 800,
              fontSize: "1.28rem",
              color: currentAlert?.type === "final" ? "#d32f2f" : "#ef6c00",
            }}
          >
            {currentAlert?.title}
          </AlertTitle>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {currentAlert?.message}
          </Typography>
        </Alert>
      </Snackbar>

      {/* Notifications Dialog */}
      <Dialog
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: 6,
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            boxShadow: "0 25px 70px rgba(0,0,0,0.25)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "8px",
              background: "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
              borderRadius: "6px 6px 0 0",
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.6rem", textAlign: "center", py: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5 }}>
            <AutoAwesome sx={{ color: "#667eea", fontSize: 36 }} />
            System Notifications
            <Badge badgeContent={notifications.length} color="error" sx={{ ml: 1 }} />
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: "rgba(255,255,255,0.96)", py: 4 }}>
          {notifications.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Notifications sx={{ fontSize: 90, color: "text.disabled", mb: 3, opacity: 0.5 }} />
              <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 700 }}>
                All caught up!
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                No pending notifications
              </Typography>
            </Box>
          ) : (
            notifications.map((notif) => (
              <Fade in key={notif._id} timeout={500}>
                <Alert
                  severity={getAlertSeverity(notif.type)}
                  sx={{
                    mb: 2.5,
                    borderRadius: 4,
                    border: `3px solid ${notif.type === "final" ? "#d32f2f" : "#ef6c00"}`,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                  }}
                  action={
                    <IconButton size="small" onClick={() => markAsRead(notif._id)}>
                      <Close fontSize="small" />
                    </IconButton>
                  }
                >
                  <AlertTitle sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                    {notif.title}
                  </AlertTitle>
                  <Typography variant="body2">{notif.message}</Typography>
                </Alert>
              </Fade>
            ))
          )}
        </DialogContent>
        <DialogActions sx={{ p: 4, bgcolor: "rgba(102, 126, 234, 0.06)" }}>
          <Button
            onClick={() => setNotificationOpen(false)}
            variant="contained"
            size="large"
            sx={{
              px: 5,
              py: 1.8,
              borderRadius: 4,
              fontWeight: 700,
              fontSize: "1.1rem",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 10px 30px rgba(102, 126, 234, 0.4)",
              "&:hover": { transform: "translateY(-3px)", boxShadow: "0 15px 40px rgba(102, 126, 234, 0.5)" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}