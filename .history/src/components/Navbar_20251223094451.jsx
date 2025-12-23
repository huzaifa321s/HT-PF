// src/components/Navbar.jsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
  Badge,
  Chip,
  alpha,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import AssessmentIcon from "@mui/icons-material/Assessment";
import GroupIcon from "@mui/icons-material/Group";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BusinessIcon from "@mui/icons-material/Business";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LightModeIcon from "@mui/icons-material/LightMode";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useLocation, useNavigate } from "react-router";

const Navbar = ({ onNavigate, currentPath }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const profileOpen = Boolean(anchorEl);
  const navigate = useNavigate();
  const user =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("user") || "null")
      : null;
  const role = user?.role || "agent";
  const location = useLocation();
  const activePath =
    currentPath ??
    (typeof window !== "undefined" ? window.location.pathname : "/");

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);
  const handleNav = (path) => {
    if (onNavigate && typeof onNavigate === "function") onNavigate(path);
    else navigate(path);
    setMobileOpen(false);
  };
  const handleProfileOpen = (e) => setAnchorEl(e.currentTarget);
  const handleProfileClose = () => setAnchorEl(null);
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/", icon: <DashboardIcon /> },
    {
      label: "Create Proposal",
      path: "/create-proposal",
      icon: <AddCircleOutlineIcon />,
    },
    {
      label: role === "admin" ? "Total Proposals" : "Your Proposals",
      path: role === "admin" ? "/admin/proposals" : "/your-proposals",
      icon: <DescriptionIcon />,
    },
    ...(role === "admin"
      ? [
        {
          label: "BDOs Management",
          path: "/admin/bdms",
          icon: <AssessmentIcon />,
        },
      ]
      : []),
  ];

  const drawer = (
    <Box
      sx={{
        width: 280,
        background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
        color: "#fff",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      onClick={() => setMobileOpen(false)}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          p: 3,
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: 50,
              height: 50,
              bgcolor: "#fff",
              color: "#667eea",
              fontWeight: 800,
              fontSize: "1.3rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            {user?.name?.[0]?.toUpperCase() || "U"}
          </Avatar>
        </Box>
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          sx={{ color: "#fff" }}
        >
          {user?.name || "User"}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.75rem" }}
        >
          {user?.email || "user@example.com"}
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

      {/* Navigation Items */}
      <List sx={{ px: 2, py: 2, flex: 1 }}>
        {navItems.map((item) => {
          const isActive = activePath === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={isActive}
              onClick={() => handleNav(item.path)}
              sx={{
                borderRadius: 2.5,
                mb: 1,
                py: 1.5,
                transition: "all 0.3s ease",
                "&.Mui-selected": {
                  bgcolor: "rgba(255,255,255,0.25)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)",
                  },
                },
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                  transform: "translateX(4px)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "#fff",
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.95rem",
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

      {/* Bottom Actions */}
      <List sx={{ px: 2, py: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2.5,
            transition: "all 0.3s ease",
            background: "rgba(244, 67, 54, 0.2)",
            "&:hover": {
              bgcolor: "rgba(244, 67, 54, 0.3)",
              transform: "translateX(4px)",
            },
          }}
        >
          <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontSize: "0.95rem" }}
          />
        </ListItemButton>
      </List>

      {/* Footer Badge */}
      <Box
        sx={{
          p: 2,
          textAlign: "center",
          background: "rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem" }}
        >
          Proposal System v1.0.3
        </Typography>
      </Box>
    </Box>
  );
  const isSmall = useMediaQuery("(max-width:1325px)");
  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#fff",
          width: "100vw",
          left: "50%",
          ml: "-50vw",
          // mt: "-30px",
          position: "relative",
          boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Toolbar sx={{ display: "flex", gap: 2, py: 1.5 }}>
          {/* Mobile menu */}
          <IconButton
            color="inherit"
            edge="start"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{
              mr: 1,
              display: isSmall ? "inline-flex" : "none",
              background: "rgba(255,255,255,0.1)",
              "&:hover": {
                background: "rgba(255,255,255,0.2)",
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box
            onClick={() => handleNav("/")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              cursor: "pointer",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          >
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

            <Box sx={{ display: isSmall ? "none" : "block" }}>
              <Typography
                variant="h6"
                fontWeight="800"
                sx={{
                  fontSize: "1.1rem",
                  letterSpacing: "-0.5px",
                  color: "#fff",
                }}
              >
                Proposal Management System
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "0.7rem",
                  fontWeight: 500,
                }}
              >
                {role === "admin"
                  ? "Business Development Manager"
                  : "Business Development Officer"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop nav */}
          <Box sx={{ display: isSmall ? "none" : "flex", gap: 1 }}>
            {navItems.map((item) => {
              const isActive = activePath === item.path;
              return (
                <Button
                  key={item.path}
                  startIcon={item.icon}
                  onClick={() => handleNav(item.path)}
                  sx={{
                    color: "#fff",
                    background: isActive
                      ? "rgba(255,255,255,0.25)"
                      : "transparent",
                    textTransform: "none",
                    px: 2.5,
                    py: 1,
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "0.95rem",
                    borderRadius: 2.5,
                    transition: "all 0.3s ease",
                    boxShadow: isActive
                      ? "0 4px 12px rgba(0,0,0,0.15)"
                      : "none",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.2)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* Action Icons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
            {/* Profile Dropdown */}
            <Tooltip title="Account" arrow>
              <Button
                onClick={handleProfileOpen}
                endIcon={<KeyboardArrowDownIcon />}
                sx={{
                  color: "#fff",
                  textTransform: "none",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 3,
                  px: 2,
                  py: 0.8,
                  gap: 1,
                  "&:hover": {
                    background: "rgba(255,255,255,0.2)",
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "#fff",
                    color: "#667eea",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                  }}
                >
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </Avatar>
                {!isMobile && (
                  <Typography variant="body2" fontWeight={600}>
                    {user?.name?.split(" ")[0] || "User"}
                  </Typography>
                )}
              </Button>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={profileOpen}
              onClose={handleProfileClose}
              PaperProps={{
                elevation: 8,
                sx: {
                  mt: 1.5,
                  minWidth: 240,
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              {/* Profile Header */}
              <Box
                sx={{
                  p: 3,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#fff",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: "#fff",
                      color: "#667eea",
                      fontWeight: 700,
                      fontSize: "1.2rem",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {user?.name || "User"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.9, display: "block" }}
                    >
                      {user?.email || "user@example.com"}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  icon={
                    role === "admin" ? (
                      <AdminPanelSettingsIcon sx={{ fontSize: 14 }} />
                    ) : (
                      <PersonIcon sx={{ fontSize: 14 }} />
                    )
                  }
                  label={role === "admin" ? "BDM" : "Agent"}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    background: "rgba(255,255,255,0.2)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                />
              </Box>

              <Box sx={{ p: 1 }}>
                <MenuItem
                  onClick={() => {
                    handleNav("/profile");
                    handleProfileClose();
                  }}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderRadius: 2,
                    gap: 2,
                    mb: 0.5,
                    "&:hover": {
                      backgroundColor: alpha("#667eea", 0.08),
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0 }}>
                    <AccountCircleIcon
                      fontSize="small"
                      sx={{ color: "#667eea" }}
                    />
                  </ListItemIcon>
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    My Profile
                  </Typography>
                </MenuItem>

                <Divider sx={{ my: 1 }} />

                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderRadius: 2,
                    gap: 2,
                    "&:hover": {
                      backgroundColor: alpha("#f44336", 0.08),
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0 }}>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <Typography color="error" variant="body2" fontWeight={600}>
                    Logout
                  </Typography>
                </MenuItem>
              </Box>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: 280,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
