"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  useMediaQuery,
  Chip,
  alpha,
  Button,
  Badge
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { usePathname, useRouter } from "next/navigation";
import axiosInstance from "../utils/axiosInstance";

const expandedDrawerWidth = 280;
const collapsedDrawerWidth = 88;

export default function DashboardLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const profileOpen = Boolean(anchorEl);
  
  const router = useRouter();
  const pathname = usePathname();
  const EDITOR_PATHS = ["/create-proposal", "/edit-proposal"];
  const isEditor = EDITOR_PATHS.some(p => pathname.startsWith(p));
  const isStudio = pathname.startsWith("/proposal-studio");
  
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const storedUser = JSON.parse(sessionStorage.getItem("user") || "null");
      if (storedUser?.role === "admin") {
        const res = await axiosInstance.get("/api/notifications/unread-count");
        if (res.data?.success) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  useEffect(() => {
    if (mounted && user?.role === "admin") {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [mounted, user, pathname]);

  useEffect(() => {
    setMounted(true);
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "null");
    setUser(storedUser);
    const saved = localStorage.getItem("mainSidebarCollapsed");
    if (saved !== null) setIsCollapsed(saved === "true");
  }, []);

  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("mainSidebarCollapsed", newState);
      return newState;
    });
  };

  const currentDrawerWidth = isCollapsed && !isMobile ? collapsedDrawerWidth : expandedDrawerWidth;

  const role = user?.role || "agent";

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleNav = (path) => {
    router.push(path);
    setMobileOpen(false);
  };
  const handleProfileOpen = (e) => setAnchorEl(e.currentTarget);
  const handleProfileClose = () => setAnchorEl(null);
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard", path: role === "admin" ? "/dashboard" : "/agent-dashboard", icon: <DashboardIcon /> },
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
          {
            label: "Notifications",
            path: "/admin/notifications",
            icon: (
              <Badge badgeContent={unreadCount} color="error" variant="dot">
                <NotificationsIcon />
              </Badge>
            ),
          },
        ]
      : []),
    {
      label: "Trash",
      path: "/trash",
      icon: <DeleteOutlineIcon />,
    },
    {
      label: "Documentation",
      path: "/docs",
      icon: <MenuBookIcon />,
    },
  ];

  const drawerContent = (
    <Box
      sx={{
        width: currentDrawerWidth,
        bgcolor: "#0a0a0a",
        borderRight: "1px solid rgba(243, 168, 51, 0.1)",
        color: "#fff",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
        overflowX: "hidden",
      }}
    >
      {/* Drawer Header (Project Logo) */}
      <Box sx={{ px: isCollapsed ? 2 : 2, py: isCollapsed ? 2 : 2.5, display: "flex", flexDirection: "column", alignItems: isCollapsed ? "center" : "flex-start", transition: "all 0.3s ease", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "space-between", width: "100%", gap: isCollapsed ? 0 : 1.5 }}>
          {isCollapsed ? (
            <Box
              component="img"
              src="/download.jpg"
              alt="Humantek Logo"
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid rgba(243, 168, 51, 0.5)",
                boxShadow: "0 4px 12px rgba(243, 168, 51, 0.2)",
                transition: "all 0.3s ease"
              }}
            />
          ) : (
            <Box
              component="img"
              src="/ht-logo-cropped.png"
              alt="Humantek Logo"
              sx={{
                width: "100%",
                maxWidth: "215px",
                height: "auto",
                objectFit: "contain",
                transition: "all 0.3s ease"
              }}
            />
          )}
          
          {!isCollapsed && !isMobile && (
            <IconButton onClick={toggleSidebar} sx={{ color: "#f3a833", opacity: 0.5, "&:hover": { opacity: 1 } }} size="small">
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Box>
        
        {isCollapsed && !isMobile && (
          <IconButton onClick={toggleSidebar} sx={{ color: "#f3a833", mt: 2, opacity: 0.5, "&:hover": { opacity: 1 } }} size="small">
            <ChevronRightIcon />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

      {/* Navigation Items */}
      <List sx={{ px: 2, py: 2, flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Tooltip key={item.path} title={isCollapsed ? item.label : ""} placement="right" arrow>
              <ListItemButton
                selected={isActive}
                onClick={() => handleNav(item.path)}
                sx={{
                  borderRadius: 10,
                  mb: 1,
                  py: 1.5,
                  px: isCollapsed ? 1 : 2,
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  transition: "all 0.3s ease",
                  "&.Mui-selected": {
                    bgcolor: "rgba(243, 168, 51, 0.15)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.8)",
                    "&:hover": { bgcolor: "rgba(243, 168, 51, 0.25)" },
                  },
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.05)",
                    transform: isCollapsed ? "scale(1.05)" : "translateX(4px)",
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? "#f3a833" : "#94a3b8", minWidth: isCollapsed ? 0 : 40, mr: isCollapsed ? 0 : 2, justifyContent: "center", transition: "all 0.3s ease" }}>{item.icon}</ListItemIcon>
                {!isCollapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: "0.95rem", color: isActive ? "#f3a833" : "#f8fafc", whiteSpace: "nowrap" }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

      {/* Bottom Actions */}
      <List sx={{ px: 2, py: 2 }}>
        <Tooltip title={isCollapsed ? "Logout" : ""} placement="right" arrow>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 10,
              px: isCollapsed ? 1 : 2,
              justifyContent: isCollapsed ? "center" : "flex-start",
              transition: "all 0.3s ease",
              background: "rgba(244, 67, 54, 0.2)",
              "&:hover": { bgcolor: "rgba(244, 67, 54, 0.3)", transform: isCollapsed ? "scale(1.05)" : "translateX(4px)" },
            }}
          >
            <ListItemIcon sx={{ color: "#fff", minWidth: isCollapsed ? 0 : 40, mr: isCollapsed ? 0 : 2, justifyContent: "center", transition: "all 0.3s ease" }}><LogoutIcon /></ListItemIcon>
            {!isCollapsed && <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: "0.95rem" }} />}
          </ListItemButton>
        </Tooltip>
      </List>
      

    </Box>
  );

  // During SSR/hydration, show a dark skeleton instead of blank null.
  // Returning null here = black screen for the entire mount phase.
  if (!mounted) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#000000" }}>
        {/* Sidebar skeleton */}
        <Box
          sx={{
            width: expandedDrawerWidth,
            bgcolor: "#0a0a0a",
            borderRight: "1px solid rgba(243,168,51,0.1)",
            flexShrink: 0,
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            p: 2,
            gap: 1,
          }}
        >
          <Box sx={{ height: 56, bgcolor: "rgba(255,255,255,0.04)", borderRadius: 2, mb: 2 }} />
          {[1, 2, 3, 4, 5].map((i) => (
            <Box key={i} sx={{ height: 44, bgcolor: "rgba(255,255,255,0.03)", borderRadius: 2 }} />
          ))}
        </Box>
        {/* Main area skeleton */}
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Box sx={{ height: 64, bgcolor: "rgba(0,0,0,0.8)", borderBottom: "1px solid rgba(243,168,51,0.2)" }} />
          <Box sx={{ flexGrow: 1, p: 4, display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ height: 120, bgcolor: "rgba(255,255,255,0.03)", borderRadius: 3 }} />
            <Box sx={{ height: 200, bgcolor: "rgba(255,255,255,0.02)", borderRadius: 3 }} />
          </Box>
        </Box>
      </Box>
    );
  }

  if (isStudio) {
    return <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>{children}</Box>;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#000000' }}>
      {/* Sidebar / Drawer */}
      <Box component="nav" sx={{ width: { md: currentDrawerWidth }, flexShrink: { md: 0 }, transition: "width 0.3s ease" }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: expandedDrawerWidth, border: 'none' },
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: currentDrawerWidth, border: 'none', transition: "width 0.3s ease", overflowX: "hidden" },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          transition: "width 0.3s ease",
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* Top Header */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            color: '#f8fafc',
            borderBottom: '1px solid rgba(243, 168, 51, 0.2)',
            zIndex: theme.zIndex.drawer - 1
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isMobile && (
                <IconButton color="inherit" onClick={handleDrawerToggle} edge="start" sx={{ mr: 2 }}>
                  <MenuIcon />
                </IconButton>
              )}
              <Typography variant="h6" fontWeight="700" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Dashboard
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {role === "admin" && (
                <Tooltip title="Notifications" arrow>
                  <IconButton
                    onClick={() => handleNav("/admin/notifications")}
                    sx={{
                      color: "#f8fafc",
                      bgcolor: "#141414",
                      borderRadius: 3,
                      p: 1,
                      border: "1px solid rgba(243, 168, 51, 0.2)",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                        borderColor: "#f3a833"
                      }
                    }}
                  >
                    <Badge badgeContent={unreadCount} color="error">
                      <NotificationsIcon sx={{ fontSize: 20, color: unreadCount > 0 ? "#f3a833" : "#f8fafc" }} />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Account" arrow>
                <Button
                  onClick={handleProfileOpen}
                  endIcon={<KeyboardArrowDownIcon />}
                  sx={{
                    color: '#f8fafc',
                    textTransform: 'none',
                    bgcolor: '#141414',
                    borderRadius: 3,
                    px: 2,
                    py: 0.8,
                    border: '1px solid rgba(243, 168, 51, 0.2)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#f3a833', fontSize: '0.9rem' }}>
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </Avatar>
                  {!isMobile && (
                    <Typography variant="body2" fontWeight={600} sx={{ ml: 1 }}>
                      {user?.name?.split(" ")[0] || "User"}
                    </Typography>
                  )}
                </Button>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={profileOpen}
                onClose={handleProfileClose}
                disableScrollLock={true}
                PaperProps={{
                  elevation: 8,
                  sx: { mt: 1.5, minWidth: 240, borderRadius: 3, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.7)" },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <Box sx={{ p: 3, background: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)", color: "#fff" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Avatar sx={{ width: 48, height: 48, bgcolor: "#141414", color: "#f3a833", fontWeight: 700 }}>
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>{user?.name || "User"}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>{user?.email || "user@example.com"}</Typography>
                    </Box>
                  </Box>
                  <Chip
                    icon={role === "admin" ? <AdminPanelSettingsIcon sx={{ fontSize: 14 }} /> : <PersonIcon sx={{ fontSize: 14 }} />}
                    label={role === "admin" ? "BDM" : "Agent"}
                    size="small"
                    sx={{ height: 24, fontSize: "0.75rem", fontWeight: 600, background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}
                  />
                </Box>
                <Box sx={{ p: 1 }}>
                  <MenuItem onClick={() => { handleNav("/profile"); handleProfileClose(); }} sx={{ py: 1.5, px: 2, borderRadius: 2, mb: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 0, mr: 2 }}><AccountCircleIcon color="primary" fontSize="small" /></ListItemIcon>
                    <Typography variant="body2" fontWeight={600}>My Profile</Typography>
                  </MenuItem>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 2, borderRadius: 2 }}>
                    <ListItemIcon sx={{ minWidth: 0, mr: 2 }}><LogoutIcon color="error" fontSize="small" /></ListItemIcon>
                    <Typography color="error" variant="body2" fontWeight={600}>Logout</Typography>
                  </MenuItem>
                </Box>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ flexGrow: 1, p: isEditor ? 0 : { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
