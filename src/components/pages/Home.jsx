"use client";
// Home.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
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
import axiosInstance from "../../utils/axiosInstance";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const Home = ({ onNavigate }) => {
  const theme = useTheme();
  const [totalProposals, setTotalProposals] = useState(0);
  const [totalBDMs, setTotalBDMs] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  const router = useRouter();
  const handleNav = (path) => {
    if (onNavigate && typeof onNavigate === "function") onNavigate(path);
    else router.push(path);
  };

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const [proposalsRes, bdmsRes] = await Promise.all([
          axiosInstance.get("/api/proposals/total-proposals", { skipLoader: true }),
          axiosInstance.get("/api/bdms/get-total-bdms", { skipLoader: true })
        ]);
        setTotalProposals(proposalsRes.data.data ?? 0);
        setTotalBDMs(bdmsRes.data.total ?? 0);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        setTotalProposals("Error");
        setTotalBDMs("Error");
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
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
    width: "100%",
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
        overflowX: "hidden",
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
            p: { xs: 2.5, md: 6 },
            mb: { xs: 3, md: 5 },
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
              gap: { xs: 2.5, md: 4 },
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
        <Box
          component={motion.div}
          variants={containerVariants}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2.5,
            mb: 4,
            width: "100%",
          }}
        >
          {[
            { value: totalProposals, label: "Total Proposals" },
            { value: totalBDMs, label: "Total BDOs" },
          ].map((stat) => (
            <Paper
              key={stat.label}
              component={motion.div}
              variants={itemVariants}
              elevation={0}
              sx={{
                ...cardStyle,
                p: { xs: 3, md: 4 },
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                minWidth: 0,
                minHeight: { xs: 120, md: 160 },
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
              {statsLoading ? (
                <CircularProgress size={36} thickness={5} sx={{ color: colorScheme.primary }} />
              ) : (
                <>
                  <Typography
                    variant="h2"
                    fontWeight="800"
                    sx={{
                      background: colorScheme.gradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 0.5,
                      lineHeight: 1.1,
                      fontSize: { xs: "2.5rem", md: "3.5rem" },
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="subtitle1" color="#94a3b8" fontWeight="600" sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}>
                    {stat.label}
                  </Typography>
                </>
              )}
            </Paper>
          ))}
        </Box>

        {/* Quick Actions Section */}
        <Typography
          component={motion.h5}
          variants={itemVariants}
          variant="h5"
          sx={{
            fontWeight: 800,
            color: "#f8fafc",
            mb: { xs: 2.5, md: 4 },
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          Quick Actions
        </Typography>

        <Box
          component={motion.div}
          variants={containerVariants}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            flexWrap: { xs: "nowrap", sm: "wrap", md: "nowrap" },
            gap: 2.5,
            width: "100%",
          }}
        >
          {[
            {
              icon: <AddCircleOutlineIcon sx={{ fontSize: 32, color: colorScheme.primary }} />,
              title: "Create New Proposal",
              desc: "Start a new client proposal from scratch.",
              btnLabel: "Create Now",
              btnVariant: "contained",
              path: "/create-proposal",
            },
            {
              icon: <DescriptionIcon sx={{ fontSize: 32, color: colorScheme.primary }} />,
              title: "View All Proposals",
              desc: "Review, edit, or download past submissions.",
              btnLabel: "View All",
              btnVariant: "outlined",
              path: "/admin/proposals",
            },
            {
              icon: <AssessmentIcon sx={{ fontSize: 32, color: colorScheme.primary }} />,
              title: "BDOs Management",
              desc: "Manage Business Development Officers.",
              btnLabel: "Manage",
              btnVariant: "outlined",
              path: "/admin/bdms",
            },
          ].map((action) => (
            <Box
              key={action.title}
              component={motion.div}
              variants={itemVariants}
              sx={{
                flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)", md: "1 1 0" },
                minWidth: 0,
                display: "flex",
              }}
            >
              <Card
                elevation={0}
                sx={{
                  ...cardStyle,
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                <CardContent sx={{ textAlign: "center", py: { xs: 3.5, md: 5 }, px: { xs: 2.5, md: 3 }, flexGrow: 1 }}>
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
                      mb: 2.5,
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: "#f8fafc", mb: 1 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="#94a3b8">
                    {action.desc}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "center", pb: 3.5 }}>
                  <Button
                    variant={action.btnVariant}
                    sx={{
                      borderRadius: 10,
                      px: 4,
                      py: 1,
                      ...(action.btnVariant === "contained"
                        ? {
                            background: colorScheme.gradient,
                            textTransform: "none",
                            fontWeight: 600,
                            boxShadow: "0 4px 12px rgba(243, 168, 51, 0.3)",
                            "&:hover": {
                              background: colorScheme.hoverGradient,
                              boxShadow: "0 8px 20px rgba(243, 168, 51, 0.4)",
                            },
                          }
                        : {
                            borderColor: colorScheme.primary,
                            color: colorScheme.primary,
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": {
                              borderColor: colorScheme.secondary,
                              bgcolor: "rgba(243, 168, 51, 0.05)",
                            },
                          }),
                    }}
                    onClick={() => handleNav(action.path)}
                  >
                    {action.btnLabel}
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Home;