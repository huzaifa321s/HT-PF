// src/pages/AgentDashboard.jsx
import React, { useState } from "react";
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
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router";




const AgentDashboard = ({ onNavigate }) => {
  const [isHovered, setIsHovered] = useState({});
const navigate = useNavigate();
  const handleNav = (path) => {
    if (onNavigate && typeof onNavigate === "function") onNavigate(path);
    // else window.location.href = path;
    else navigate(path);
  };

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");


  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
        py: 8,
        px: { xs: 2, sm: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        {/* Welcome Section */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            mb: 4,
            borderRadius: 5,
            background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
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
              animation: "shimmer 2s 3",
            },
            "@keyframes shimmer": {
              "0%": { backgroundPosition: "-200% 0" },
              "100%": { backgroundPosition: "200% 0" },
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(102, 126, 234, 0.15)",
                borderRadius: "50%",
                width: 64,
                height: 64,
                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
              }}
            >
              <AccountCircleIcon sx={{ fontSize: 36, color: "#667eea" }} />
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
                Welcome {user.name || "Agent"}!
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                Manage your proposals and track your progress.
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Divider sx={{ my: 4, borderColor: "rgba(102, 126, 234, 0.3)" }} />

        {/* Quick Actions */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#667eea",
            mb: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Quick Actions
        </Typography>

        <Grid container spacing={3}>
          {/* Create Proposal */}
          <Grid item xs={12} sm={6}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 5 }}>
                <AddCircleOutlineIcon
                  sx={{ fontSize: 50, color: "#667eea", mb: 2, opacity: 0.8 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#667eea" }}>
                  Create New Proposal
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                  Start drafting a new client proposal
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 3 }}>
                <Tooltip title="Create a new proposal" arrow>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleNav("/create-proposal")}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: 3,
                      textTransform: "none",
                      fontSize: "1rem",
                      fontWeight: 600,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 12px 32px rgba(102, 126, 234, 0.5)",
                      },
                      transition: "all 0.3s ease",
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
          <Grid item xs={12} sm={6}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 5 }}>
                <DescriptionIcon
                  sx={{ fontSize: 50, color: "#667eea", mb: 2, opacity: 0.8 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#667eea" }}>
                  Your Proposals
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                  View, edit, or download your submitted proposals
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 3 }}>
                <Tooltip title="View all your proposals" arrow>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => handleNav("/your-proposals")}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: 3,
                      textTransform: "none",
                      fontSize: "1rem",
                      fontWeight: 600,
                      borderColor: "#667eea",
                      color: "#667eea",
                      "&:hover": {
                        borderColor: "#5568d3",
                        color: "#5568d3",
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                      },
                      transition: "all 0.3s ease",
                    }}
                    startIcon={<DescriptionIcon />}
                  >
                    View All Proposals
                  </Button>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>

          {/* Profile */}
          <Grid item xs={12} sm={6}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 5 }}>
                <AccountCircleIcon
                  sx={{ fontSize: 50, color: "#667eea", mb: 2, opacity: 0.8 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#667eea" }}>
                  My Profile
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                  Update your personal information
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 3 }}>
                <Tooltip title="Update your profile" arrow>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => handleNav("/profile")}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: 3,
                      textTransform: "none",
                      fontSize: "1rem",
                      fontWeight: 600,
                      borderColor: "#667eea",
                      color: "#667eea",
                      "&:hover": {
                        borderColor: "#5568d3",
                        color: "#5568d3",
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                      },
                      transition: "all 0.3s ease",
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

      </Box>
    </Box>
  );
};

export default AgentDashboard;
