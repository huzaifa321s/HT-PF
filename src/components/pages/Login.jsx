"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton
} from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import axiosInstance from "../../utils/axiosInstance";
import { useDispatch } from "react-redux";
import { showToast } from "../../utils/toastSlice";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { loadStoreFromBackend, persistor, store } from "../../utils/store";
import { motion } from "framer-motion";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const isAdminLogin = pathname === "/admin-login";
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user") || "null");
    if (token && user) {
      if (user.role === "admin") {
        router.replace("/dashboard");
      } else if (user.role === "agent") {
        router.replace("/agent-dashboard");
      }
    }
  }, [router]);

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

      await persistor.purge();
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(user));

      if (!sessionStorage.getItem("tabId")) {
        sessionStorage.setItem("tabId", crypto.randomUUID());
      }

      dispatch(showToast({ message: "Login successful!", severity: "success" }));
      await loadStoreFromBackend(user.id, store.dispatch);
      if (user.role === "admin") {
        router.push("/dashboard");
      } else if (user.role === "agent") {
        router.push("/agent-dashboard");
      } else {
        router.push("/dashboard");
      }

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
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100vw", overflow: "hidden", bgcolor: "#0a0a0a" }}>
      
      {/* LEFT SIDE: BRANDING (Hidden on Mobile) */}
      {!isMobile && (
        <Box
          sx={{
            flex: 1,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            p: 6,
            background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
            borderRight: "1px solid rgba(255,255,255,0.05)"
          }}
        >
          {/* Animated Background Orbs */}
          <Box
            component={motion.div}
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            sx={{
              position: "absolute", top: "10%", left: "-10%", width: "40vw", height: "40vw",
              background: "radial-gradient(circle, #f3a833 0%, rgba(0,0,0,0) 70%)", filter: "blur(80px)", zIndex: 0,
            }}
          />
          <Box
            component={motion.div}
            animate={{ scale: [1, 1.5, 1], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            sx={{
              position: "absolute", bottom: "-10%", right: "10%", width: "40vw", height: "40vw",
              background: "radial-gradient(circle, #f3a833 0%, rgba(0,0,0,0) 70%)", filter: "blur(100px)", zIndex: 0,
            }}
          />

          {/* Company Logo (Centered in left panel) */}
          <Box sx={{ position: "relative", zIndex: 1, my: "auto", display: "flex", justifyContent: "center", width: "100%" }}>
            <Box
              component="img"
              src="/ht-logo-cropped.png"
              alt="Humantek Logo"
              sx={{
                width: "100%",
                maxWidth: "215px",
                height: "auto",
                objectFit: "contain"
              }}
            />
          </Box>

          {/* Bottom Info */}
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              © {new Date().getFullYear()} Humantek. All rights reserved.
            </Typography>
          </Box>
        </Box>
      )}

      {/* RIGHT SIDE: LOGIN FORM */}
      <Box
        sx={{
          flex: { xs: 1, md: 0.8, lg: 0.6 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#111111",
          p: { xs: 4, sm: 8, md: 12 },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 440 }}>
          
          {/* Mobile Logo */}
          {isMobile && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 6, width: "100%" }}>
              <Box
                component="img"
                src="/ht-logo-cropped.png"
                alt="Humantek Logo"
                sx={{
                  width: "100%",
                  maxWidth: "215px",
                  height: "auto",
                  objectFit: "contain"
                }}
              />
            </Box>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff", mb: 1, fontSize: { xs: "2rem", sm: "2.5rem" } }}>
              {isAdminLogin ? "Admin Login" : "Welcome Back"}
            </Typography>
            <Typography variant="body1" sx={{ color: "#a0a0a0", mb: 5 }}>
              Enter your credentials to access your account.
            </Typography>

            {error && (
              <Alert
                severity="error"
                icon={false}
                sx={{
                  mb: 4, borderRadius: 2, bgcolor: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.2)",
                  "& .MuiAlert-message": { width: "100%", textAlign: "center", fontWeight: 600 },
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
              
              {/* Modern Input Styling fixing autofill border bug */}
              <TextField
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <EmailOutlinedIcon sx={{ color: '#a0a0a0', mr: 1.5 }} />,
                }}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    color: "#fff",
                    bgcolor: "rgba(255, 255, 255, 0.03)",
                    borderRadius: 2,
                    height: 56,
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)", borderWidth: 1, transition: "all 0.2s" },
                    "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                    "&.Mui-focused fieldset": { borderColor: "#f3a833", borderWidth: 2 },
                  },
                  "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active": {
                    WebkitBoxShadow: "0 0 0 1000px #1a1a1a inset !important",
                    WebkitTextFillColor: "white !important",
                    transition: "background-color 5000s ease-in-out 0s",
                  },
                }}
              />

              <TextField
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <LockOutlinedIcon sx={{ color: '#a0a0a0', mr: 1.5 }} />,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "#a0a0a0" }}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 4,
                  "& .MuiOutlinedInput-root": {
                    color: "#fff",
                    bgcolor: "rgba(255, 255, 255, 0.03)",
                    borderRadius: 2,
                    height: 56,
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)", borderWidth: 1, transition: "all 0.2s" },
                    "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                    "&.Mui-focused fieldset": { borderColor: "#f3a833", borderWidth: 2 },
                  },
                  "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active": {
                    WebkitBoxShadow: "0 0 0 1000px #1a1a1a inset !important",
                    WebkitTextFillColor: "white !important",
                    transition: "background-color 5000s ease-in-out 0s",
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                endIcon={!loading && <ArrowForwardIcon />}
                sx={{
                  height: 56,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  background: "#f3a833",
                  color: "#000",
                  boxShadow: "0 4px 14px rgba(243, 168, 51, 0.3)",
                  "&:hover": {
                    background: "#e09b2d",
                    boxShadow: "0 6px 20px rgba(243, 168, 51, 0.5)",
                    transform: "translateY(-2px)",
                  },
                  "&:disabled": { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" },
                  transition: "all 0.3s ease",
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Sign In"}
              </Button>

              {isAdminLogin && (
                <Box sx={{ mt: 5, textAlign: "center" }}>
                  <Typography variant="body2" sx={{ color: "#a0a0a0" }}>
                    Logging in as an Agent?{" "}
                    <Link
                      component="button"
                      type="button"
                      onClick={() => router.push("/login")}
                      sx={{
                        fontWeight: 600, color: "#f3a833", textDecoration: "none",
                        "&:hover": { color: "#ffb443", textDecoration: "underline" },
                      }}
                    >
                      Click here
                    </Link>
                  </Typography>
                </Box>
              )}
            </Box>
          </motion.div>
        </Box>
      </Box>

    </Box>
  );
};

export default Login;
