"use client";
// src/pages/AgentDashboard.jsx
import { useState, useEffect } from "react";
import { Box, Typography, Paper, Button, Grid, Card, CardContent, CardActions, Tooltip, Container } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const AgentDashboard = ({ onNavigate }) => {
  const router = useRouter();


  const handleNav = (path) => {
    if (onNavigate && typeof onNavigate === "function") onNavigate(path);
    // else window.location.href = path;
    else router.push(path);
  };

  const [user, setUser] = useState({});

  useEffect(() => {
    try {
      const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
      setUser(storedUser);
    } catch (e) {
      console.warn("sessionStorage access failed in AgentDashboard:", e);
    }
  }, []);

  // Styles from ProposalFormwithStepper
  const colorScheme = {
    primary: "#f3a833",
    secondary: "#f59e0b",
    gradient: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
    hoverGradient: "linear-gradient(135deg, #eab308 0%, #d97706 100%)",
    lightBg: "linear-gradient(135deg, #f5f7ff 0%, #f0f2ff 100%)",
  };

  const cardStyle = {
    background: "rgba(20, 20, 20, 0.8)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(243, 168, 51, 0.2)",
    borderRadius: 5,
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      transform: "translateY(-6px)",
      boxShadow: "0 20px 40px rgba(243, 168, 51, 0.15)",
      borderColor: "rgba(243, 168, 51, 0.3)",
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{
        minHeight: "100%",
        py: { xs: 2, md: 4 },
        width: "100%",
        position: "relative",
      }}
    >
      <Container maxWidth="lg">
        {/* Welcome Section */}
        <Paper
          component={motion.div}
          variants={itemVariants}
          elevation={0}
          sx={{
            ...cardStyle,
            p: { xs: 4, md: 6 },
            mb: 5,
            position: "relative",
            overflow: "hidden",
            background: "#0a0a0a",
          }}
        >
          {/* Subtle decorative background blob */}
          <Box
            sx={{
              position: "absolute",
              top: "-50%",
              right: "-10%",
              width: "400px",
              height: "400px",
              background: "radial-gradient(circle, rgba(243, 168, 51,0.1) 0%, rgba(255,255,255,0) 70%)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: 4,
              textAlign: { xs: "center", sm: "left" },
              position: "relative",
              zIndex: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: colorScheme.gradient,
                borderRadius: "24px",
                width: { xs: 72, md: 96 },
                height: { xs: 72, md: 96 },
                boxShadow: "0 16px 32px rgba(243, 168, 51, 0.4)",
                transform: "rotate(-5deg)",
              }}
            >
              <AccountCircleIcon sx={{ fontSize: { xs: 40, md: 52 }, color: "#fff", transform: "rotate(5deg)" }} />
            </Box>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  background: colorScheme.gradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-1px",
                  mb: 1,
                  fontSize: { xs: "2rem", md: "2.75rem" },
                }}
              >
                Welcome back, {user.name?.split(" ")[0] || "Agent"}!
              </Typography>
              <Typography variant="h6" sx={{ color: "#94a3b8", fontWeight: 500 }}>
                Ready to create some amazing proposals today?
              </Typography>
            </Box>
          </Box>
        </Paper>



        {/* Quick Actions */}
        <Typography
          component={motion.h5}
          variants={itemVariants}
          variant="h5"
          sx={{
            fontWeight: 800,
            color: "#f8fafc",
            mb: 3,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <AddCircleOutlineIcon sx={{ color: colorScheme.primary }} /> Quick Actions
        </Typography>

        <Grid container spacing={3} component={motion.div} variants={containerVariants}>
          {/* Create Proposal */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card elevation={0} sx={cardStyle} component={motion.div} variants={itemVariants}>
              <CardContent sx={{ textAlign: "center", py: 5 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: "rgba(243, 168, 51, 0.1)",
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
                  sx={{ color: "#f8fafc", mb: 1 }}
                >
                  Create New Proposal
                </Typography>
                <Typography variant="body2" color="#94a3b8">
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
                      boxShadow: "0 4px 12px rgba(243, 168, 51, 0.3)",
                      "&:hover": {
                        background: colorScheme.hoverGradient,
                        boxShadow: "0 8px 20px rgba(243, 168, 51, 0.4)",
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
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card elevation={0} sx={cardStyle} component={motion.div} variants={itemVariants}>
              <CardContent sx={{ textAlign: "center", py: 5 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: "rgba(243, 168, 51, 0.1)",
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
                  sx={{ color: "#f8fafc", mb: 1 }}
                >
                  Your Proposals
                </Typography>
                <Typography variant="body2" color="#94a3b8">
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
                        bgcolor: "rgba(243, 168, 51, 0.05)",
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
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card elevation={0} sx={cardStyle} component={motion.div} variants={itemVariants}>
              <CardContent sx={{ textAlign: "center", py: 5 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: "rgba(243, 168, 51, 0.1)",
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
                  sx={{ color: "#f8fafc", mb: 1 }}
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
                        bgcolor: "rgba(243, 168, 51, 0.05)",
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
