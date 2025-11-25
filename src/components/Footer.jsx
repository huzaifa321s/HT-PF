// src/components/Footer.jsx
import React from "react";
import { Box, Container, Grid, Typography, Link, Divider } from "@mui/material";
import { useLocation } from "react-router";

const Footer = () => {
  // Get user role from sessionStorage
  const user =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("user") || "null")
      : null;
  const role = user?.role || "agent";
  const location = useLocation();

  // Agar agent hai to sirf simple footer dikhao
  if (role === "agent") {
    return (
      <Box
        component="footer"
        sx={{
          mt: 6,
          background: "linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%)",
          color: "#e0e0e0",
          py: 4,
          position: "relative",
          overflow: "hidden",
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
            animation: "shimmer 2s 2",
          },
          "@keyframes shimmer": {
            "0%": { backgroundPosition: "-200% 0" },
            "100%": { backgroundPosition: "200% 0" },
          },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
              }}
            >
              Proposal Management System
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#b0bec5", mt: 1, opacity: 0.7 }}
            >
              © {new Date().getFullYear()} — Internal Use Only
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        background: "linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%)",
        color: "#e0e0e0",
        py: 4,
        position: "relative",
        overflow: "hidden",
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
        },
        width: "100vw",
        ml: { xs: "-50vw", sm: "-50vw" },
        left: "50%",
        position: "relative",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left Section - App Info */}
          <Grid item xs={12} sm={4}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
              }}
            >
              Proposal Management System
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#b0bec5", mt: 0.5, opacity: 0.7 }}
            >
              Streamlining proposal creation and internal collaboration.
            </Typography>
          </Grid>

          {/* Center Section - Quick Links */}
          <Grid
            item
            xs={12}
            sm={4}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 0.5,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: "#90caf9",
                mb: 0.5,
              }}
            >
              Quick Access
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2,
                flexWrap: "wrap",
                justifyContent: { xs: "flex-start", sm: "center" },
              }}
            >
              {location.pathname !== "/dashboard" && (
                <Link
                  href="/dashboard"
                  color="inherit"
                  underline="none"
                  sx={{
                    color: "#e0e0e0",
                    fontSize: "0.9rem",
                    "&:hover": {
                      color: "#667eea",
                      transform: "translateY(-2px)",
                      transition: "all 0.3s ease",
                    },
                  }}
                >
                  Dashboard
                </Link>
              )}
              {location.pathname !== "/create-proposal" && (
                <Link
                  href="/create-proposal"
                  color="inherit"
                  underline="none"
                  sx={{
                    colorlibs: true,
                    color: "#e0e0e0",
                    fontSize: "0.9rem",
                    "&:hover": {
                      color: "#667eea",
                      transform: "translateY(-2px)",
                      transition: "all 0.3s ease",
                    },
                  }}
                >
                  Create Proposal
                </Link>
              )}
              {location.pathname !== "/your-proposals" ||
                (location.pathname !== "/admin/proposals" && (
                  <Link
                    href={
                      role !== "admin" ? "/your-proposals" : "/admin/proposals"
                    }
                    color="inherit"
                    underline="none"
                    sx={{
                      color: "#e0e0e0",
                      fontSize: "0.9rem",
                      "&:hover": {
                        color: "#667eea",
                        transform: "translateY(-2px)",
                        transition: "all 0.3s ease",
                      },
                    }}
                  >
                    {role === "admin" ? "Total" : "Your"} Proposals
                  </Link>
                ))}
              <Link
                href="/reports"
                color="inherit"
                underline="none"
                sx={{
                  color: "#e0e0e0",
                  fontSize: "0.9rem",
                  "&:hover": {
                    color: "#667eea",
                    transform: "translateY(-2px)",
                    transition: "all 0.3s ease",
                  },
                }}
              >
                Agents Management
              </Link>
            </Box>
          </Grid>

          {/* Right Section - System Info */}
          <Grid
            item
            xs={12}
            sm={4}
            sx={{
              textAlign: { xs: "left", sm: "right" },
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: "#90caf9",
                mb: 0.5,
              }}
            >
              System Info
            </Typography>
            <Typography variant="body2" sx={{ color: "#b0bec5", opacity: 0.8 }}>
              Version: 1.0.3 (Internal Build)
            </Typography>
            <Typography variant="body2" sx={{ color: "#b0bec5", opacity: 0.6 }}>
              Internal Use Only
            </Typography>
          </Grid>
        </Grid>

        <Divider
          sx={{
            my: 3,
            borderColor: "rgba(255,255,255,0.15)",
          }}
        />

        <Box
          sx={{
            textAlign: "center",
            fontSize: "0.85rem",
            color: "#b0bec5",
            opacity: 0.7,
          }}
        >
          © {new Date().getFullYear()} Proposal Management System — For Internal
          Use Only
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
