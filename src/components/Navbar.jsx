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
import BusinessIcon from "@mui/icons-material/Business"; // BDM icon
import { useLocation, useNavigate } from "react-router";

const Navbar = ({ onNavigate, currentPath }) => {
  const theme = useTheme();
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
    // else window.location.href = path;
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
  console.log("user.role", user?.role);
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
            label: "BDMs Management",
            path: "/admin/bdms",
            icon: <AssessmentIcon />,
          },
        ]
      : []),
  ];

  const drawer = (
    <Box
      sx={{
        width: 260,
        bgcolor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#fff",
        height: "100%",
        px: 1,
      }}
      onClick={() => setMobileOpen(false)}
    >
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar sx={{ bgcolor: "#f5f7fa", color: "#667eea" }}>
          {user?.name?.[0]?.toUpperCase() || "U"}
        </Avatar>
        <Box>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{ color: "#fff" }}
          >
            Proposal System
          </Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.7)">
            {role === "admin" ? "Admin Panel" : "Agent Dashboard"}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.3)" }} />

      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={activePath === item.path}
            onClick={() => handleNav(item.path)}
            sx={{
              borderRadius: 2,
              mb: 1,
              "&.Mui-selected": {
                bgcolor: "rgba(255,255,255,0.2)",
              },
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.3)" }} />

      <List>
        <ListItemButton
          onClick={() => handleNav("/settings")}
          sx={{
            borderRadius: 2,
            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
          }}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>

        {location.pathname !== "/create-proposal" && (
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            <ListItemIcon sx={{ color: "#fff" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={6}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#fff",
          width: "100vw",
          left: "50%",
          ml: "-50vw",
          position: "relative",
        }}
      >
        <Toolbar sx={{ display: "flex", gap: 2 }}>
          {/* Mobile menu */}
          <IconButton
            color="inherit"
            edge="start"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ mr: 1, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box
            onClick={() => handleNav("/")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
            }}
          >
            <Avatar sx={{ bgcolor: "#f5f7fa", color: "#667eea" }}>P</Avatar>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Proposal Management
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop nav */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
            {navItems.map((item) => {
              const isActive = activePath === item.path;
              return (
                <Button
                  key={item.path}
                  startIcon={item.icon}
                  onClick={() => handleNav(item.path)}
                  sx={{
                    color: isActive ? "#fff" : "rgba(255,255,255,0.9)",
                    background: isActive
                      ? "rgba(255,255,255,0.2)"
                      : "transparent",
                    textTransform: "none",
                    px: 2,
                    fontWeight: isActive ? 700 : 500,
                    borderRadius: 2,
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* Profile Dropdown */}
          <Box sx={{ ml: 2 }}>
            <Tooltip title="Account">
              <IconButton
                onClick={handleProfileOpen}
                size="small"
                color="inherit"
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "#f5f7fa",
                    color: "#667eea",
                  }}
                >
                  {user?.name?.[0]?.toUpperCase() || ""}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={profileOpen}
              onClose={handleProfileClose}
              PaperProps={{ elevation: 6, sx: { mt: 1.5, minWidth: 200 } }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem
                onClick={() => {
                  handleNav("/profile");
                  handleProfileClose();
                }}
                sx={{
                  "&:hover": { backgroundColor: "rgba(102, 126, 234,0.1)" },
                }}
              >
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>

              <Divider />
              {location.pathname !== "/create-proposal" && (
                <MenuItem
                  onClick={handleLogout}
                  sx={{ "&:hover": { backgroundColor: "rgba(255,0,0,0.1)" } }}
                >
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <Typography color="error">Logout</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
