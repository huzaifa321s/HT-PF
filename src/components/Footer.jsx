"use client";
// src/components/Footer.jsx
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
import { usePathname } from "next/navigation";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderIcon from "@mui/icons-material/Folder";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import { Facebook, Twitter, LinkedIn, Instagram } from "@mui/icons-material"; // Added social icons for fuller look
import { motion } from "framer-motion";

const Footer = () => {
  const theme = useTheme();

  let user = null;
  if (typeof window !== "undefined") {
    try {
      user = JSON.parse(sessionStorage.getItem("user") || "null");
    } catch (e) {
      console.warn("sessionStorage access failed in Footer:", e);
    }
  }
  const role = user?.role || "agent";
  const pathname = usePathname();

  // Styles from ProposalFormwithStepper
  const colorScheme = {
    primary: "#f3a833",
    secondary: "#f59e0b",
    gradient: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
    hoverGradient: "linear-gradient(135deg, #eab308 0%, #d97706 100%)",
    lightBg: "linear-gradient(135deg, #f5f7ff 0%, #f0f2ff 100%)",
  };

  // Common full-width footer wrapper
  const FullWidthFooter = ({ children, hasShimmer = true }) => (
    <Box
      component="footer"
      sx={{

        background: colorScheme.lightBg,
        color: "#2d3748",
        py: { xs: 6, md: 8 },
        position: "relative",
        overflow: "hidden",
        width: "100%",
        mt: 0,
        mb: 0,
        borderTop: "1px solid #e0e7ff",
        boxShadow: "0 -4px 20px rgba(243, 168, 51, 0.05)",
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
      {children}
    </Box>
  );

  const quickLinks = [
    {
      label: "Dashboard",
      path: "/",
      icon: <DashboardIcon sx={{ fontSize: 18 }} />,
      show: pathname !== "/dashboard",
    },
    {
      label: "Create Proposal",
      path: "/create-proposal",
      icon: <DescriptionIcon sx={{ fontSize: 18 }} />,
      show: pathname !== "/create-proposal",
    },
    {
      label: role === "admin" ? "All Proposals" : "Your Proposals",
      path: role === "admin" ? "/admin/proposals" : "/your-proposals",
      icon: <FolderIcon sx={{ fontSize: 18 }} />,
      show:
        pathname !== "/your-proposals" &&
        pathname !== "/admin/proposals",
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
          <Box
            sx={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Logo/Icon */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: colorScheme.gradient,
                boxShadow: "0 8px 20px rgba(243, 168, 51, 0.3)",
                mb: 2,
                p: 0.5,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  bgcolor: "#141414",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="/download.webp"
                  alt="icon"
                  style={{
                    width: "32px",
                    height: "32px",
                    objectFit: "contain",
                    borderRadius: "50%",
                  }}
                />
              </Box>
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                background: colorScheme.gradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
                mb: 1,
              }}
            >
              Proposal Management System
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#94a3b8",
                fontSize: "0.95rem",
                mb: 3,
                maxWidth: 500,
              }}
            >
              Streamlining your workflow with premium tools. ©{" "}
              {new Date().getFullYear()} — Internal Use Only
            </Typography>

            {/* Status Chip */}
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
              label="System Online"
              size="small"
              sx={{
                background: alpha("#4caf50", 0.1),
                color: "#2e7d32",
                fontWeight: 600,
                border: `1px solid ${alpha("#4caf50", 0.2)}`,
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
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="flex-start" component={motion.div} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }}>
          {/* Left - Brand */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                gap: "14px",
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: colorScheme.gradient,
                  boxShadow: "0 4px 15px rgba(243, 168, 51, 0.3)",
                  p: "2px",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 2.5,
                    bgcolor: "#141414",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src="/download.webp"
                    alt="icon"
                    style={{
                      width: "28px",
                      height: "28px",
                      objectFit: "contain",
                      borderRadius: "50%",
                    }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    background: colorScheme.gradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1.2,
                  }}
                >
                  Proposal
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: "#2d3748",
                    lineHeight: 1.2,
                    fontSize: "1rem",
                  }}
                >
                  Management System
                </Typography>
              </Box>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: "#94a3b8",
                lineHeight: 1.7,
                mb: 3,
                maxWidth: 300,
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
                  background: alpha("#f3a833", 0.1),
                  color: "#f3a833",
                  border: `1px solid ${alpha("#f3a833", 0.2)}`,
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
                  color: "#2e7d32",
                  border: `1px solid ${alpha("#4caf50", 0.2)}`,
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
                  color: "#1565c0",
                  border: `1px solid ${alpha("#2196f3", 0.2)}`,
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              />
            </Stack>
          </Grid>

          {/* Center - Quick Links */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                background: colorScheme.gradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 3,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                fontSize: "0.85rem",
              }}
            >
              Quick Access
            </Typography>
            <Stack spacing={1}>
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.path}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    color: "#94a3b8",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    padding: "8px 12px",
                    borderRadius: 2,
                    "&:hover": {
                      color: colorScheme.primary,
                      background: "white",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                      transform: "translateX(5px)",
                      "& .link-icon": {
                        color: colorScheme.primary,
                      },
                    },
                  }}
                >
                  <Box
                    className="link-icon"
                    sx={{
                      display: "flex",
                      color: "#a0aec0",
                      transition: "color 0.2s",
                    }}
                  >
                    {link.icon}
                  </Box>
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>


        </Grid>

        <Divider
          sx={{
            my: 4,
            borderColor: "#e0e7ff",
          }}
        />

        {/* Bottom Section */}
        <Grid container spacing={2} alignItems="center">
          {/* Left Section - Copyright */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#94a3b8",
                fontSize: "0.9rem",
                textAlign: { xs: "center", md: "left" },
                fontWeight: 500,
              }}
            >
              © {new Date().getFullYear()} Proposal Management System
            </Typography>
          </Grid>

          {/* Center Section - Socials (Optional) */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              sx={{ opacity: 0.7 }}
            >
              {[Facebook, Twitter, LinkedIn, Instagram].map((Icon, i) => (
                <IconButton
                  key={i}
                  size="small"
                  sx={{
                    color: "#a0aec0",
                    "&:hover": { color: colorScheme.primary, bgcolor: "#141414" },
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* Right Section - Status Indicator */}
          <Grid size={{ xs: 12, md: 4 }}>
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
                  padding: "6px 14px",
                  borderRadius: 20,
                  background: alpha("#4caf50", 0.1),
                  border: `1px solid ${alpha("#4caf50", 0.2)}`,
                }}
              >
                <CheckCircleIcon
                  sx={{ fontSize: 14, color: "#2e7d32" }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "#2e7d32",
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
        0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
        70% { box-shadow: 0 0 0 6px rgba(76, 175, 80, 0); }
        100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
      }
    `}
      </style>
    </FullWidthFooter>
  );
};

export default Footer;


