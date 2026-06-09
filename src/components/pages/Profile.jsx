"use client";
// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Divider,
  Chip,
  Stack,
  Container,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { format } from "date-fns";
import axiosInstance from "../../utils/axiosInstance";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { showToast } from "../../utils/toastSlice";
import { Edit, Save, Cancel, Lock, Person, Email, CalendarMonth } from "@mui/icons-material";

const Profile = () => {
  const dispatch = useDispatch();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Loading...",
    email: "loading@inhouse.com",
    updatedAt: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [debouncedEmail, setDebouncedEmail] = useState("");

  // Debounce email input
  useEffect(() => {
    if (!isEditing) {
      setDebouncedEmail("");
      setEmailExists(false);
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedEmail(editForm.email.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [editForm.email, isEditing]);

  // Check email uniqueness on debounced email change
  useEffect(() => {
    const checkEmail = async () => {
      const email = debouncedEmail.toLowerCase();
      if (!email) {
        setEmailExists(false);
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailExists(false);
        return;
      }

      setCheckingEmail(true);
      try {
        const userSession = JSON.parse(sessionStorage.getItem("user") || "null");
        const res = await axiosInstance.get("/api/check-user-email", {
          params: { email, excludeId: userSession?.id },
        });
        if (res.data?.success && res.data.exists) {
          setEmailExists(true);
        } else {
          setEmailExists(false);
        }
      } catch (err) {
        console.error("Error checking user email:", err);
      } finally {
        setCheckingEmail(false);
      }
    };

    checkEmail();
  }, [debouncedEmail]);

  // Styles from ProposalFormwithStepper
  const colorScheme = {
    primary: "#f3a833",
    secondary: "#f59e0b",
    gradient: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
    hoverGradient: "linear-gradient(135deg, #eab308 0%, #d97706 100%)",
    lightBg: "linear-gradient(135deg, #f5f7ff 0%, #f0f2ff 100%)",
  };

  const inputStyle = {
    mb: 3,
    "& .MuiOutlinedInput-root": {
      color: "#fff",
      bgcolor: "rgba(255, 255, 255, 0.03)",
      borderRadius: 2.5,
      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)", borderWidth: 1, transition: "all 0.2s" },
      "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
      "&.Mui-focused fieldset": { borderColor: "#f3a833", borderWidth: 2 },
    },
    "& .MuiInputLabel-root": {
      color: "#a0a0a0",
      "&.Mui-focused": { color: "#f3a833" },
    },
  };

  // Fetch profile data role-wise
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userSession = JSON.parse(sessionStorage.getItem("user") || "null");
        setIsAdmin(userSession?.role === "admin");

        const endpoint = "/api/get-creds";
        const res = await axiosInstance.get(endpoint);

        if (res.data && res.data.success && res.data.data) {
          setProfileData({
            name: res.data.data.name || "User",
            email: res.data.data.email || "user@inhouse.com",
            updatedAt: res.data.data.updatedAt || new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setProfileData({
          name: "User",
          email: "user@inhouse.com",
          updatedAt: new Date().toISOString(),
        });
      }
    };

    fetchProfile();
  }, []);

  const handleStartEdit = () => {
    setEditForm({
      name: profileData.name,
      email: profileData.email,
      password: "",
      confirmPassword: "",
    });
    setFormError("");
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validate name and email
    if (!editForm.name.trim()) {
      setFormError("Name is required.");
      return;
    }
    if (!editForm.email.trim()) {
      setFormError("Email is required.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }

    // Validate password if supplied
    if (editForm.password) {
      if (editForm.password.length < 6) {
        setFormError("Password must be at least 6 characters long.");
        return;
      }
      if (editForm.password !== editForm.confirmPassword) {
        setFormError("Passwords do not match.");
        return;
      }
    }

    setSaving(true);
    try {
      const res = await axiosInstance.put("/api/update-profile", {
        name: editForm.name,
        email: editForm.email,
        password: editForm.password || undefined,
      });

      if (res.data && res.data.success) {
        // Update local state
        setProfileData({
          name: res.data.data.name,
          email: res.data.data.email,
          updatedAt: res.data.data.updatedAt,
        });

        // Sync local storage user details (header updates dynamically)
        const userSession = JSON.parse(sessionStorage.getItem("user") || "null");
        if (userSession) {
          userSession.name = res.data.data.name;
          userSession.email = res.data.data.email;
          sessionStorage.setItem("user", JSON.stringify(userSession));
        }

        dispatch(showToast({ message: "Profile updated successfully!", severity: "success" }));
        setIsEditing(false);
      } else {
        setFormError(res.data?.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setFormError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = profileData.updatedAt
    ? format(new Date(profileData.updatedAt), "dd MMMM yyyy, h:mm a")
    : "Not available";

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      sx={{
        display: "flex",
        justifyContent: "center",
        py: { xs: 4, md: 8 },
        minHeight: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 650,
            mx: "auto",
            p: { xs: 4, sm: 5, md: 6 },
            borderRadius: 5,
            textAlign: "center",
            background: "rgba(20, 20, 20, 0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(243, 168, 51, 0.2)",
            boxShadow: "0 20px 60px rgba(243, 168, 51,0.1)",
            transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
            position: "relative",
            overflow: "hidden",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 30px 80px rgba(243, 168, 51,0.2)",
              borderColor: "rgba(243, 168, 51,0.3)",
            },
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              background: colorScheme.gradient,
            },
          }}
        >
          {isEditing ? (
            /* ================= EDIT MODE ================= */
            <Box component="form" onSubmit={handleSave} noValidate>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: colorScheme.gradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.5px",
                  mb: 1,
                }}
              >
                Edit Profile
              </Typography>
              <Typography variant="body1" color="text.secondary" fontWeight={500} sx={{ mb: 4 }}>
                Update your administrative details below
              </Typography>

              <Divider sx={{ mb: 4, borderColor: "rgba(243,168,51,0.15)" }} />

              {formError && (
                <Alert
                  severity="error"
                  variant="outlined"
                  sx={{
                    mb: 3,
                    borderRadius: 2.5,
                    bgcolor: "rgba(244, 67, 54, 0.05)",
                    borderColor: "rgba(244, 67, 54, 0.2)",
                    color: "#f87171",
                    textAlign: "left",
                    "& .MuiAlert-icon": { color: "#f87171" },
                  }}
                >
                  {formError}
                </Alert>
              )}

              {/* Name Input */}
              <TextField
                label="Full Name"
                fullWidth
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                InputProps={{
                  startAdornment: <Person sx={{ color: "#a0a0a0", mr: 1.5 }} />,
                }}
                sx={inputStyle}
              />

              {/* Email Input */}
              <TextField
                label="Email Address"
                fullWidth
                required
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                InputProps={{
                  startAdornment: <Email sx={{ color: "#a0a0a0", mr: 1.5 }} />,
                  endAdornment: checkingEmail && (
                    <InputAdornment position="end">
                      <CircularProgress size={20} sx={{ color: "#f3a833" }} />
                    </InputAdornment>
                  )
                }}
                error={emailExists}
                helperText={emailExists ? "This email address is already in use by another account." : ""}
                sx={inputStyle}
              />

              {/* New Password Input */}
              <TextField
                label="New Password"
                fullWidth
                type="password"
                placeholder="Leave blank to keep current"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                InputProps={{
                  startAdornment: <Lock sx={{ color: "#a0a0a0", mr: 1.5 }} />,
                }}
                sx={inputStyle}
                helperText="Password must be at least 6 characters"
                FormHelperTextProps={{ sx: { color: "text.secondary", ml: 1 } }}
              />

              {/* Confirm Password Input */}
              {editForm.password && (
                <TextField
                  label="Confirm New Password"
                  fullWidth
                  required
                  type="password"
                  value={editForm.confirmPassword}
                  onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                  InputProps={{
                    startAdornment: <Lock sx={{ color: "#a0a0a0", mr: 1.5 }} />,
                  }}
                  sx={inputStyle}
                />
              )}

              {/* Buttons Stack */}
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.2,
                    textTransform: "none",
                    fontWeight: 700,
                    color: "#fff",
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    "&:hover": {
                      borderColor: "rgba(255, 255, 255, 0.4)",
                      bgcolor: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving || emailExists}
                  startIcon={saving ? <CircularProgress size={18} sx={{ color: "#000" }} /> : <Save />}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.2,
                    textTransform: "none",
                    fontWeight: 700,
                    background: colorScheme.gradient,
                    color: "#000",
                    boxShadow: "0 8px 20px rgba(243, 168, 51, 0.2)",
                    "&:hover": {
                      background: colorScheme.hoverGradient,
                      boxShadow: "0 12px 28px rgba(243, 168, 51, 0.3)",
                    },
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </Stack>
            </Box>
          ) : (
            /* ================= VIEW MODE ================= */
            <>
              {/* Avatar */}
              <Box
                sx={{
                  position: "relative",
                  display: "inline-block",
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: -4,
                    borderRadius: "50%",
                    background: colorScheme.gradient,
                    opacity: 0.5,
                    filter: "blur(8px)",
                  }}
                />
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    position: "relative",
                    bgcolor: "#141414",
                    color: colorScheme.primary,
                    fontSize: 48,
                    fontWeight: 800,
                    border: "4px solid #fff",
                    boxShadow: "0 10px 30px rgba(243, 168, 51, 0.2)",
                  }}
                >
                  {profileData.name[0]?.toUpperCase() || "U"}
                </Avatar>
              </Box>

              {/* Name */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: colorScheme.gradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.5px",
                  mb: 1,
                }}
              >
                {profileData.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                {isAdmin ? "Administrator Account" : "Account Details"}
              </Typography>

              <Divider sx={{ my: 4, borderColor: "rgba(243,168,51,0.15)" }} />

              {/* Profile Info Cards */}
              <Stack spacing={3} sx={{ mb: 4 }}>
                {/* Email */}
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: "rgba(243, 168, 51,0.05)",
                    border: "1px solid rgba(243, 168, 51,0.1)",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    textAlign: "left",
                    "&:hover": {
                      background: "rgba(243, 168, 51,0.1)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Avatar sx={{ bgcolor: "rgba(243, 168, 51,0.1)", color: colorScheme.primary, width: 48, height: 48 }}>
                    <Email />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: colorScheme.primary,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "0.5px",
                        mb: 0.5,
                      }}
                    >
                      Email Address
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "#f8fafc",
                        wordBreak: "break-all",
                        fontSize: "1.1rem",
                      }}
                    >
                      {profileData.email}
                    </Typography>
                  </Box>
                </Box>

                {/* Last Updated */}
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: "rgba(76,175,80,0.05)",
                    border: "1px solid rgba(76,175,80,0.1)",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    textAlign: "left",
                    "&:hover": {
                      background: "rgba(76,175,80,0.1)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Avatar sx={{ bgcolor: "rgba(76,175,80,0.1)", color: "#4caf50", width: 48, height: 48 }}>
                    <CalendarMonth />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#4caf50",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "0.5px",
                        mb: 0.5,
                      }}
                    >
                      Last Updated
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "#f8fafc",
                        fontSize: "1.1rem",
                      }}
                    >
                      {formattedDate}
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              {/* Status & Actions Stack */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
                <Chip
                  label={isAdmin ? "System Admin" : "Active Agent"}
                  size="medium"
                  sx={{
                    fontWeight: 700,
                    px: 2,
                    py: 2.5,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
                    color: "#fff",
                    boxShadow: "0 8px 20px rgba(76,175,80,0.3)",
                    fontSize: "0.9rem",
                  }}
                />
                {isAdmin && (
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={handleStartEdit}
                    sx={{
                      fontWeight: 700,
                      borderRadius: 3,
                      px: 4,
                      py: 1.2,
                      textTransform: "none",
                      background: colorScheme.gradient,
                      color: "#000",
                      boxShadow: "0 8px 20px rgba(243, 168, 51,0.2)",
                      "&:hover": {
                        background: colorScheme.hoverGradient,
                        boxShadow: "0 12px 28px rgba(243, 168, 51, 0.3)",
                      },
                    }}
                  >
                    Edit Profile
                  </Button>
                )}
              </Stack>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Profile;