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
    <> {/* Full width container */}
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            mb: 4,
            borderRadius: 5,
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            border: "3px solid transparent",
            position: "relative",
            overflow: "hidden",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
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
              animation: loading ? "shimmer 2s infinite" : "none",
            },
            "@keyframes shimmer": {
              "0%": { backgroundPosition: "-200% 0" },
              "100%": { backgroundPosition: "200% 0" },
            },
            width: "100%",
            maxWidth: "md", // Form width restricted to md
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 4,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(102, 126, 234, 0.15)",
                borderRadius: "50%",
                width: 64,
                height: 64,
                mr: 2,
                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
              }}
            >
              <LoginIcon sx={{ fontSize: 36, color: "#667eea" }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.5px",
                }}
              >
                {isAdminLogin ? "Admin Login" : "Login"}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
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
    </>
  );
};

export default Login;
