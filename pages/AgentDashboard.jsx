// src/pages/AgentDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Tooltip,
  Container,
  CircularProgress,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AssessmentIcon from "@mui/icons-material/Assessment";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router";

const AgentDashboard = ({ onNavigate }) => {
  const [isHovered, setIsHovered] = useState({});
  const [usage, setUsage] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await axiosInstance.get("/api/tokens/usage", { skipLoader: true });
        if (res.data.success) {
          setUsage(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch usage:", err);
      } finally {
        setLoadingUsage(false);
      }
    };
    fetchUsage();
  }, []);
  const handleNav = (path) => {
    if (onNavigate && typeof onNavigate === "function") onNavigate(path);
    // else window.location.href = path;
    else navigate(path);
  };

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  // Styles from ProposalFormwithStepper
  const colorScheme = {
    primary: "#667eea",
    secondary: "#764ba2",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    hoverGradient: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
    lightBg: "linear-gradient(135deg, #f5f7ff 0%, #f0f2ff 100%)",
  };

  const cardStyle = {
    background: "linear-gradient(135deg, #ffffff 0%, #f9fbfd 100%)",
    border: "1px solid #e0e7ff",
    borderRadius: 4,
    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.1)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 12px 30px rgba(102, 126, 234, 0.2)",
      borderColor: colorScheme.primary,
    },
  };

  return (
    <Box
      sx={{
        background: colorScheme.lightBg,
        minHeight: "100vh",
        py: { xs: 4, md: 8 },
        px: { xs: 2, md: 4 },
        width: "100%",
        position: "relative",
      }}
    >
      <Container maxWidth="lg">
        {/* Welcome Section */}
        <Paper
          elevation={0}
          sx={{
            ...cardStyle,
            p: { xs: 3, md: 5 },
            mb: 6,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: colorScheme.gradient,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: 3,
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: colorScheme.gradient,
                borderRadius: "50%",
                width: { xs: 64, md: 80 },
                height: { xs: 64, md: 80 },
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
              }}
            >
              <AccountCircleIcon
                sx={{ fontSize: { xs: 32, md: 40 }, color: "#fff" }}
              />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: colorScheme.gradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.5px",
                  mb: 1,
                  fontSize: { xs: "1.75rem", md: "2.25rem" },
                }}
              >
                Welcome , {user.name || "Agent"}!
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "text.secondary", fontSize: "1.1rem" }}
              >
                Ready to create some amazing proposals today?
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Usage Section */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: "#2d3748",
            mb: 4,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          System Usage
        </Typography>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* AssemblyAI Usage */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ ...cardStyle, p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssessmentIcon color="primary" /> Transcription Usage
              </Typography>
              {loadingUsage ? (
                <CircularProgress size={20} />
              ) : usage ? (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Remaining: {usage.percentage}%</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {Math.floor((usage.remaining || 0) / 3600)} Hours Remaining
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700} color={usage.status === 'red' ? 'error' : 'primary'}>
                      {usage.level}
                    </Typography>
                  </Box>
                  <Box sx={{ height: 8, bgcolor: '#eee', borderRadius: 4, overflow: 'hidden', mb: 1 }}>
                    <Box sx={{ height: '100%', width: `${usage.percentage}%`, background: colorScheme.gradient }} />
                  </Box>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                    Total Used: {usage.formattedUsage}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="error">Failed to load usage</Typography>
              )}
            </Paper>
          </Grid>

          {/* Groq Usage */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ ...cardStyle, p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AddCircleOutlineIcon sx={{ color: '#a855f7' }} /> AI Smart Paste Usage
              </Typography>
              {loadingUsage ? (
                <CircularProgress size={20} />
              ) : usage?.groq ? (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Remaining: {usage.groq.percentage}%</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#a855f7' }}>
                        {Math.floor((usage.groq.remaining || 0) / 3000)} Requests Remaining
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700} color={usage.groq.status === 'red' ? 'error' : '#a855f7'}>
                      {usage.groq.level}
                    </Typography>
                  </Box>
                  <Box sx={{ height: 8, bgcolor: '#eee', borderRadius: 4, overflow: 'hidden', mb: 1 }}>
                    <Box sx={{ height: '100%', width: `${usage.groq.percentage}%`, background: 'linear-gradient(135deg, #a855f7 0%, #764ba2 100%)' }} />
                  </Box>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                    Total Tokens Used: {usage.groq.used.toLocaleString()}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="error">Failed to load usage</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 6, borderColor: "#e0e7ff" }} />

        {/* Quick Actions */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: "#2d3748",
            mb: 4,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          Quick Actions
        </Typography>

        <Grid container spacing={4}>
          {/* Create Proposal */}
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={0} sx={cardStyle}>
              <CardContent sx={{ textAlign: "center", py: 5 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: "rgba(102, 126, 234, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  <AddCircleOutlineIcon
                    sx={{ fontSize: 32, color: colorScheme.primary }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: "#2d3748", mb: 1 }}
                >
                  Create New Proposal
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start drafting a new client proposal.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 4 }}>
                <Tooltip title="Create a new proposal" arrow>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleNav("/create-proposal")}
                    sx={{
                      borderRadius: 10,
                      px: 4,
                      py: 1,
                      background: colorScheme.gradient,
                      textTransform: "none",
                      fontWeight: 600,
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                      "&:hover": {
                        background: colorScheme.hoverGradient,
                        boxShadow: "0 8px 20px rgba(102, 126, 234, 0.4)",
                      },
                    }}
                    startIcon={<AddCircleOutlineIcon />}
                  >
                    Create Proposal
                  </Button>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>

          {/* View Proposals */}
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={0} sx={cardStyle}>
              <CardContent sx={{ textAlign: "center", py: 5 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: "rgba(102, 126, 234, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  <DescriptionIcon
                    sx={{ fontSize: 32, color: colorScheme.primary }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: "#2d3748", mb: 1 }}
                >
                  Your Proposals
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View, edit, or download your submissions.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 4 }}>
                <Tooltip title="View all your proposals" arrow>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => handleNav("/your-proposals")}
                    sx={{
                      borderRadius: 10,
                      px: 4,
                      py: 1,
                      borderColor: colorScheme.primary,
                      color: colorScheme.primary,
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": {
                        borderColor: colorScheme.secondary,
                        bgcolor: "rgba(102, 126, 234, 0.05)",
                      },
                    }}
                    startIcon={<DescriptionIcon />}
                  >
                    View All
                  </Button>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>

          {/* Profile */}
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={0} sx={cardStyle}>
              <CardContent sx={{ textAlign: "center", py: 5 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: "rgba(102, 126, 234, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  <AccountCircleIcon
                    sx={{ fontSize: 32, color: colorScheme.primary }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: "#2d3748", mb: 1 }}
                >
                  My Profile
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Update your personal information.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 4 }}>
                <Tooltip title="Update your profile" arrow>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => handleNav("/profile")}
                    sx={{
                      borderRadius: 10,
                      px: 4,
                      py: 1,
                      borderColor: colorScheme.primary,
                      color: colorScheme.primary,
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": {
                        borderColor: colorScheme.secondary,
                        bgcolor: "rgba(102, 126, 234, 0.05)",
                      },
                    }}
                    startIcon={<AccountCircleIcon />}
                  >
                    Go to Profile
                  </Button>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AgentDashboard;
