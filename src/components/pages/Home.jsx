"use client";
// Home.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Divider,
  Card,
  CardContent,
  CardActions,
  useTheme,
  CircularProgress,
  Container,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import AssessmentIcon from "@mui/icons-material/Assessment";
import GroupIcon from "@mui/icons-material/Group";
import axiosInstance from "../../utils/axiosInstance";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const Home = ({ onNavigate }) => {
  const theme = useTheme();
  const [totalProposals, setTotalProposals] = useState(null); // null = loading
  const [totalBDMs, setTotalBDMs] = useState(0);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const handleNav = (path) => {
    if (onNavigate && typeof onNavigate === "function") onNavigate(path);
    else router.push(path);
  };

  useEffect(() => {
    const fetchTotalProposals = async () => {
      try {
        const response = await axiosInstance.get(
          "/api/proposals/total-proposals",
          { skipLoader: true }
        );
        setTotalProposals(response.data.data);
      } catch (error) {
        console.error("Failed to fetch total proposals:", error);
        setTotalProposals("Error");
      } finally {
        setLoading(false);
      }
    };

    fetchTotalProposals();
  }, []);

  useEffect(() => {
    const fetchBDMCount = async () => {
      try {
        const res = await axiosInstance.get("/api/bdms/get-total-bdms", {
          skipLoader: true,
        });
        setTotalBDMs(res.data.total);
      } catch (error) {
        console.error("Failed to fetch total BDOs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBDMCount();
  }, []);



  // Styles from ProposalFormwithStepper
  const colorScheme = {
    primary: "#f3a833",
    secondary: "#f59e0b",
    gradient: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
    hoverGradient: "linear-gradient(135deg, #eab308 0%, #d97706 100%)",
    lightBg: "linear-gradient(135deg, #f5f7ff 0%, #f0f2ff 100%)",
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
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
        {/* Header */}
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
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "center", md: "center" },
              gap: 4,
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
              <DescriptionIcon sx={{ fontSize: { xs: 40, md: 52 }, color: "#fff", transform: "rotate(5deg)" }} />
            </Box>
            <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  background: colorScheme.gradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-1px",
                  fontSize: { xs: "2rem", md: "2.75rem" },
                  mb: 1,
                }}
              >
                Admin Dashboard
              </Typography>
              <Typography variant="h6" sx={{ color: "#94a3b8", fontWeight: 500 }}>
                Manage, track, and collaborate on project proposals within your team.
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Stats Section */}
        <Grid container spacing={4} sx={{ mb: 6 }} component={motion.div} variants={containerVariants}>
          {/* Total Proposals Stat */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              component={motion.div}
              variants={itemVariants}
              elevation={0}
              sx={{
                ...cardStyle,
                p: 4,
                textAlign: "center",
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
              {loading ? (
                <CircularProgress
                  size={40}
                  thickness={5}
                  sx={{ color: colorScheme.primary }}
                />
              ) : (
                <>
                  <Typography
                    variant="h2"
                    fontWeight="800"
                    sx={{
                      background: colorScheme.gradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 1,
                    }}
                  >
                    {totalProposals}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="#94a3b8"
                    fontWeight="600"
                  >
                    Total Proposals
                  </Typography>
                </>
              )}
            </Paper>
          </Grid>

          {/* Total BDMs Stat */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              component={motion.div}
              variants={itemVariants}
              elevation={0}
              sx={{
                ...cardStyle,
                p: 4,
                textAlign: "center",
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
              {loading ? (
                <CircularProgress
                  size={40}
                  thickness={5}
                  sx={{ color: colorScheme.primary }}
                />
              ) : (
                <>
                  <Typography
                    variant="h2"
                    fontWeight="800"
                    sx={{
                      background: colorScheme.gradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 1,
                    }}
                  >
                    {totalBDMs}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="#94a3b8"
                    fontWeight="600"
                  >
                    Total BDOs
                  </Typography>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>



        {/* Quick Actions Section */}
        <Typography
          component={motion.h5}
          variants={itemVariants}
          variant="h5"
          sx={{
            fontWeight: 800,
            color: "#f8fafc",
            mb: 4,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          Quick Actions
        </Typography>

        <Grid container spacing={3} component={motion.div} variants={containerVariants}>
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={0} sx={cardStyle} component={motion.div} variants={itemVariants}>
              <CardContent sx={{ textAlign: "center", py: 5 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
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
                  Start a new client proposal from scratch.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 4 }}>
                <Button
                  variant="contained"
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
                  onClick={() => handleNav("/create-proposal")}
                >
                  Create Now
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={0} sx={cardStyle} component={motion.div} variants={itemVariants}>
              <CardContent sx={{ textAlign: "center", py: 5 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
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
                  View All Proposals
                </Typography>
                <Typography variant="body2" color="#94a3b8">
                  Review, edit, or download past submissions.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 4 }}>
                <Button
                  variant="outlined"
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
                  onClick={() => handleNav("/admin/proposals")}
                >
                  View All
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={0} sx={cardStyle} component={motion.div} variants={itemVariants}>
              <CardContent sx={{ textAlign: "center", py: 5 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    bgcolor: "rgba(243, 168, 51, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  <AssessmentIcon
                    sx={{ fontSize: 32, color: colorScheme.primary }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: "#f8fafc", mb: 1 }}
                >
                  BDOs Management
                </Typography>
                <Typography variant="body2" color="#94a3b8">
                  Manage Business Development Officers.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 4 }}>
                <Button
                  variant="outlined"
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
                  onClick={() => handleNav("/admin/bdms")}
                >
                  Manage
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;