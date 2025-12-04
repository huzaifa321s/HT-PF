// src/components/Footer.jsx
import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  Stack,
  Chip,
  IconButton,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useLocation } from "react-router";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderIcon from "@mui/icons-material/Folder";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const user =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("user") || "null")
      : null;
  const role = user?.role || "agent";
  const location = useLocation();

  // Common full-width footer wrapper
  const FullWidthFooter = ({ children, hasShimmer = true }) => (
    <Box
      component="footer"
      sx={{
        mb: 0,
        background: "linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%)",
        color: "#e0e0e0",
        py: { xs: 5, md: 6 },
        position: "relative",
        overflow: "hidden",
        width: "100vw",
        left: "50%",
        right: "50%",
        ml: "-50vw",
        mr: "-50vw",
        mb: "-30px",
        borderTop: "3px solid",
        borderImage: "linear-gradient(90deg, #667eea 0%, #764ba2 100%) 1",
        "&::before": hasShimmer
          ? {
            content: '""',
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent)",
            animation: "shimmer 8s infinite",
          }
          : {},
        "@keyframes shimmer": {
          "0%": { left: "-100%" },
          "100%": { left: "100%" },
        },
      }}
    >
      {children}
    </Box>
  );

  const quickLinks = [
    {
      label: "Dashboard",
      path: "/",
      icon: <DashboardIcon sx={{ fontSize: 18 }} />,
      show: location.pathname !== "/dashboard",
    },
    {
      label: "Create Proposal",
      path: "/create-proposal",
      icon: <DescriptionIcon sx={{ fontSize: 18 }} />,
      show: location.pathname !== "/create-proposal",
    },
    {
      label: role === "admin" ? "All Proposals" : "Your Proposals",
      path: role === "admin" ? "/admin/proposals" : "/your-proposals",
      icon: <FolderIcon sx={{ fontSize: 18 }} />,
      show:
        location.pathname !== "/your-proposals" &&
        location.pathname !== "/admin/proposals",
    },
    {
      label: "Agents Management",
      path: "/admin/bdms",
      icon: <PeopleIcon sx={{ fontSize: 18 }} />,
      show: role === "admin",
    },
  ].filter((link) => link.show);

  // Agent ka simple footer
  if (role === "agent") {
    return (
      <FullWidthFooter hasShimmer={false}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", }}>
            {/* Logo/Icon */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 70,
                height: 70,
                borderRadius: "50%",
                background: "#fff",
                boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4)",
                mb: 2,
              }}
            >
              <img
                src="/download.jpg"
                alt="icon"
                style={{
                  width: "24px",
                  height: "24px",
                  objectFit: "contain",
                  borderRadius: 100,
                }}
              />
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
                mb: 1,
                ml: 2
              }}
            >
              Proposal Management System
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#b0bec5",
                opacity: 0.8,
                fontSize: "0.95rem",
                mb: 2,
              }}
            >
              © {new Date().getFullYear()} — Internal Use Only
            </Typography>

            {/* Status Chip */}
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
              label="System Online"
              size="small"
              sx={{
                background: alpha("#4caf50", 0.15),
                color: "#4caf50",
                fontWeight: 600,
                border: `1px solid ${alpha("#4caf50", 0.3)}`,
              }}
            />
          </Box>
        </Container>
      </FullWidthFooter>
    );
  }

  // Admin / Manager / etc. ka rich footer
  return (
    <FullWidthFooter hasShimmer={true}>
      <Container maxWidth="lg">
        <Grid container spacing={5} alignItems="flex-start">
          {/* Left - Brand */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: '14px' }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                <img
                  src="/download.jpg"
                  alt="icon"
                  style={{
                    width: "24px",
                    height: "24px",
                    objectFit: "contain",
                    borderRadius: 100,
                  }}
                />
              </Box>

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
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: "#b0bec5",
                lineHeight: 1.7,
                opacity: 0.85,
                mb: 2,
              }}
            >
              Streamlining proposal creation, review, and internal collaboration
              with efficiency and transparency.
            </Typography>

            {/* Feature Pills */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<SpeedIcon sx={{ fontSize: 14 }} />}
                label="Fast"
                size="small"
                sx={{
                  background: alpha("#667eea", 0.1),
                  color: "#667eea",
                  border: `1px solid ${alpha("#667eea", 0.3)}`,
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              />
              <Chip
                icon={<SecurityIcon sx={{ fontSize: 14 }} />}
                label="Secure"
                size="small"
                sx={{
                  background: alpha("#4caf50", 0.1),
                  color: "#4caf50",
                  border: `1px solid ${alpha("#4caf50", 0.3)}`,
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              />
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                label="Reliable"
                size="small"
                sx={{
                  background: alpha("#2196f3", 0.1),
                  color: "#2196f3",
                  border: `1px solid ${alpha("#2196f3", 0.3)}`,
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              />
            </Stack>
          </Grid>

          {/* Center - Quick Links */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: "#90caf9",
                mb: 2.5,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                fontSize: "0.9rem",
              }}
            >
              Quick Access
            </Typography>
            <Stack spacing={1.5}>
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.path}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    color: "#e0e0e0",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    padding: "8px 12px",
                    borderRadius: 2,
                    background: "transparent",
                    "&:hover": {
                      color: "#667eea",
                      transform: "translateX(8px)",
                      background: alpha("#667eea", 0.08),
                      "& .link-icon": {
                        transform: "scale(1.2) rotate(5deg)",
                      },
                    },
                  }}
                >
                  <Box
                    className="link-icon"
                    sx={{
                      display: "flex",
                      transition: "transform 0.3s ease",
                      color: "#90caf9",
                    }}
                  >
                    {link.icon}
                  </Box>
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Right - System Info */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: "#90caf9",
                mb: 2.5,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                fontSize: "0.9rem",
                textAlign: { xs: "left", md: "right" },
              }}
            >
              System Status
            </Typography>
            <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
              <Stack
                spacing={1.5}
                alignItems={{ xs: "flex-start", md: "flex-end" }}
              >
                {/* Version Badge */}
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    padding: "6px 16px",
                    borderRadius: 2,
                    background: alpha("#667eea", 0.1),
                    border: `1px solid ${alpha("#667eea", 0.3)}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#b0bec5",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    Version: 1.0.3
                  </Typography>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#4caf50",
                      boxShadow: "0 0 8px rgba(76, 175, 80, 0.6)",
                      animation: "pulse 2s infinite",
                    }}
                  />
                </Box>

                {/* Environment Badge */}
                <Chip
                  label="Production (Internal)"
                  size="small"
                  sx={{
                    background: alpha("#ff9800", 0.15),
                    color: "#ffa726",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    border: `1px solid ${alpha("#ff9800", 0.3)}`,
                  }}
                />

                {/* Access Badge */}
                <Chip
                  icon={<SecurityIcon sx={{ fontSize: 14 }} />}
                  label="Restricted Access"
                  size="small"
                  sx={{
                    background: alpha("#f44336", 0.15),
                    color: "#ef5350",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    border: `1px solid ${alpha("#f44336", 0.3)}`,
                  }}
                />
              </Stack>
            </Box>
          </Grid>
        </Grid>

        <Divider
          sx={{
            my: 4,
            borderColor: "rgba(255,255,255,0.12)",
            borderWidth: 1,
          }}
        />

        {/* Bottom Section - 3 Equal Columns */}
        <Grid container spacing={2} alignItems="center">
          {/* Left Section - Copyright */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="body2"
              sx={{
                color: "#b0bec5",
                opacity: 0.7,
                fontSize: "0.9rem",
                textAlign: { xs: "center", md: "left" },
              }}
            >
              © {new Date().getFullYear()} Proposal Management System
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#b0bec5",
                opacity: 0.5,
                fontSize: "0.8rem",
                textAlign: { xs: "center", md: "left" },
                display: "block",
              }}
            >
              Strictly for Internal Use Only
            </Typography>
          </Grid>

          {/* Center Section - Empty/Placeholder */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: "center" }}>
              {/* You can add center content here if needed */}
            </Box>
          </Grid>

          {/* Right Section - Status Indicator */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", md: "flex-end" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  padding: "4px 12px",
                  borderRadius: 2,
                  background: alpha("#4caf50", 0.1),
                  border: `1px solid ${alpha("#4caf50", 0.3)}`,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#4caf50",
                    boxShadow: "0 0 6px rgba(76, 175, 80, 0.8)",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "#4caf50",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                  }}
                >
                  All Systems Operational
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Pulse Animation */}
      <style>
        {`
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.7;
          transform: scale(1.1);
        }
      }
    `}
      </style>
    </FullWidthFooter>
  );
};

export default Footer;
