// src/pages/Login.jsx
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Container,
  Link,
  Tooltip,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router";
import axiosInstance from "../utils/axiosInstance";
import { useDispatch } from "react-redux";
import { showToast } from "../utils/toastSlice";
import LoginIcon from "@mui/icons-material/Login";
import { loadStoreFromBackend, persistor, store } from "../utils/store";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isAdminLogin = location.pathname === "/admin-login";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/auth/login", formData);
      const user = res.data.user;

      // 🔹 Purge previous user's persisted store
      await persistor.purge();

      // 🔹 Save new user to sessionStorage (tab-specific)
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(user));

      // 🔹 Assign new tabId if not present
      if (!sessionStorage.getItem("tabId")) {
        sessionStorage.setItem("tabId", crypto.randomUUID());
      }

      dispatch(showToast({ message: "Login successful!", severity: "success" }));

      // 🔹 Load new user's Redux store from backend
      await loadStoreFromBackend(user.id, store.dispatch);

      // 🔹 Navigate after login
      navigate("/");

    } catch (err) {
      dispatch(
        showToast({
          message: err.response?.data?.message || "Internal server error",
          severity: "error",
        })
      );
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", // Gradient moved to background
        m: 0,
        p: 0,
        overflow: "hidden",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2.5, sm: 4, md: 5 },
          borderRadius: { xs: 3, sm: 5 },
          bgcolor: "rgba(255, 255, 255, 0.9)", // Glassy white card
          backdropFilter: "blur(10px)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          position: "relative",
          "&:hover": {
            transform: { xs: "none", sm: "translateY(-8px)" },
            boxShadow: { xs: "0 10px 20px rgba(0,0,0,0.1)", sm: "0 20px 40px rgba(0,0,0,0.15)" },
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: { xs: "4px", sm: "6px" },
            background:
              "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
            backgroundSize: "200% 100%",
            animation: loading ? "shimmer 2s infinite" : "none",
            borderTopLeftRadius: { xs: 12, sm: 20 },
            borderTopRightRadius: { xs: 12, sm: 20 },
          },
          "@keyframes shimmer": {
            "0%": { backgroundPosition: "-200% 0" },
            "100%": { backgroundPosition: "200% 0" },
          },
          width: "100%",
          maxWidth: { xs: "90%", sm: "480px" }, // Adjusted max-width
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: { xs: 3, sm: 4 },
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(102, 126, 234, 0.15)",
              borderRadius: "50%",
              width: { xs: 56, sm: 64 },
              height: { xs: 56, sm: 64 },
              mr: { xs: 0, sm: 2 },
              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
            }}
          >
            <LoginIcon sx={{ fontSize: { xs: 32, sm: 36 }, color: "#667eea" }} />
          </Box>
          <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
                fontSize: { xs: "1.75rem", sm: "2.125rem" },
              }}
            >
              {isAdminLogin ? "Admin Login" : "Login"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mt: 0.5,
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
              }}
            >
              Login to manage your proposals
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 3,
              bgcolor: "rgba(244, 67, 54, 0.9)",
              color: "#fff",
              "& .MuiAlert-message": {
                fontSize: "1rem",
                fontWeight: 600,
                background:
                  "linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              },
            }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mx: "auto", width: "100%", maxWidth: 480 }}>
          <TextField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            variant="outlined"
            InputProps={{
              sx: { fontSize: "1rem", lineHeight: 1.8, fontFamily: '"Inter", "Roboto", sans-serif' },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.9)",
                "& fieldset": { borderColor: "rgba(102, 126, 234, 0.3)", borderWidth: 2 },
                "&:hover fieldset": { borderColor: "rgba(102, 126, 234, 0.5)" },
                "&.Mui-focused fieldset": { borderColor: "#667eea" },
              },
              "& input:-webkit-autofill": {
                WebkitBoxShadow: "0 0 0 1000px white inset !important",
                WebkitTextFillColor: "black !important",
              },
            }}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            variant="outlined"
            InputProps={{
              sx: { fontSize: "1rem", lineHeight: 1.8, fontFamily: '"Inter", "Roboto", sans-serif' },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.9)",
                "& fieldset": { borderColor: "rgba(102, 126, 234, 0.3)", borderWidth: 2 },
                "&:hover fieldset": { borderColor: "rgba(102, 126, 234, 0.5)" },
                "&.Mui-focused fieldset": { borderColor: "#667eea" },
              },
              "& input:-webkit-autofill": {
                WebkitBoxShadow: "0 0 0 1000px white inset !important",
                WebkitTextFillColor: "black !important",
              },
            }}
          />

          <Tooltip title="Login to your account" arrow>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.8,
                borderRadius: 3,
                textTransform: "none",
                fontSize: "1.1rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 32px rgba(102, 126, 234, 0.5)",
                },
                "&:disabled": { background: "linear-gradient(135deg, #ccc 0%, #999 100%)" },
                transition: "all 0.3s ease",
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Login"}
            </Button>
          </Tooltip>

          {isAdminLogin && (
            <Typography align="center" sx={{ mt: 3, color: "text.secondary" }}>
              Agent?{" "}
              <Link
                component="button"
                variant="body1"
                onClick={() => navigate("/login")}
                sx={{
                  fontWeight: 600,
                  color: "#667eea",
                  "&:hover": { color: "#5568d3", textDecoration: "underline" },
                }}
              >
                Login here
              </Link>
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
