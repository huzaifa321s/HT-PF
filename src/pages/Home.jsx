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
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import AssessmentIcon from "@mui/icons-material/Assessment";
import GroupIcon from "@mui/icons-material/Group";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router";

const Home = ({ onNavigate }) => {
  const theme = useTheme();
  const [totalProposals, setTotalProposals] = useState(null); // null = loading
  const [totalBDMs, setTotalBDMs] = useState(0);
  const [loading, setLoading] = useState(true);
const  navigate = useNavigate();
  const handleNav = (path) => {
    if (onNavigate && typeof onNavigate === "function") onNavigate(path);
    // else window.location.href = path;
    else navigate(path);
  };

  useEffect(() => {
    const fetchTotalProposals = async () => {
      try {
        const response = await axiosInstance.get("/api/proposals/total-proposals");
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
      const res = await axiosInstance.get("/api/bdms/get-total-bdms");
      setTotalBDMs(res.data.total);
    } catch (error) {
      console.error("Failed to fetch total BDOs:", error);
    } finally {
      setLoading(false);
    }
  };
  fetchBDMCount();
}, []);


  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
        py: 6,
        px: 3,
          width: "100vw",
        position: "relative",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
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
            <DescriptionIcon sx={{ fontSize: 36, color: "#667eea" }} />
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
              Welcome to Proposal Management System
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 0.5 }}
            >
              Manage, track, and collaborate on project proposals within your team.
            </Typography>
          </Box>
        </Box>
<Box sx={{display:'flex',gap:2,alignItems:'center',flexWrap:'wrap'}}>
        {/* Total Proposals Stat */}
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 5,
                background: "linear-gradient(135deg, #ffffff 0%, #f9fbfd 100%)",
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
              }}
            >
              {loading ? (
                <CircularProgress
                  size={40}
                  thickness={5}
                  sx={{ color: "#667eea" }}
                />
              ) : (
                <>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {totalProposals}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mt: 1, fontWeight: 600 }}
                  >
                    Total Proposals
                  </Typography>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
{/* Total BDMs Stat */}
<Grid container item xs={12} sm={6} md={4}>
  <Paper
    elevation={3}
    sx={{
      p: 4,
      textAlign: "center",
      borderRadius: 5,
      background: "linear-gradient(135deg, #ffffff 0%, #f9fbfd 100%)",
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
    }}
  >
    {loading ? (
      <CircularProgress size={40} thickness={5} sx={{ color: "#667eea" }} />
    ) : (
      <>
        <Typography
          variant="h3"
          fontWeight="bold"
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {totalBDMs}
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mt: 1, fontWeight: 600 }}
        >
          Total BDOs
        </Typography>
      </>
    )}
  </Paper>
</Grid>
</Box>
        <Divider sx={{ my: 5, bgcolor: "rgba(102, 126, 234, 0.3)" }} />

        {/* Quick Actions Section */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#667eea",
            display: "flex",
            alignItems: "center",
            mb: 3,
          }}
        >
          Quick Actions
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 4,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 32px rgba(102, 126, 234, 0.3)",
                  bgcolor: "rgba(102, 126, 234, 0.05)",
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <AddCircleOutlineIcon
                  sx={{ fontSize: 40, mb: 1, color: "#667eea" }}
                />
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ color: "#667eea" }}
                >
                  Create New Proposal
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Start a new client proposal.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    py: 1.2,
                    px: 4,
                    borderRadius: 3,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 32px rgba(102, 126, 234, 0.5)",
                    },
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => handleNav("/create-proposal")}
                >
                  Open
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 4,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 32px rgba(102, 126, 234, 0.3)",
                  bgcolor: "rgba(102, 126, 234, 0.05)",
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <DescriptionIcon
                  sx={{ fontSize: 40, mb: 1, color: "#667eea" }}
                />
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ color: "#667eea" }}
                >
                  View All Proposals
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Review or edit past submissions.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    py: 1.2,
                    px: 4,
                    borderRadius: 3,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 32px rgba(102, 126, 234, 0.5)",
                    },
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => handleNav("/admin/proposals")}
                >
                  Open
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 4,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 32px rgba(102, 126, 234, 0.3)",
                  bgcolor: "rgba(102, 126, 234, 0.05)",
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <AssessmentIcon
                  sx={{ fontSize: 40, mb: 1, color: "#667eea" }}
                />
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ color: "#667eea" }}
                >
                  BDOs Management
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Open to manage BDOs.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    py: 1.2,
                    px: 4,
                    borderRadius: 3,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 32px rgba(102, 126, 234, 0.5)",
                    },
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => handleNav("/admin/bdms")}
                >
                  Open
                </Button>
              </CardActions>
            </Card>
          </Grid>

        </Grid>
      </Box>
    </Box>
  );
};

export default Home;