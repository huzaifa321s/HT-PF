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
  Badge,
  Tabs,
  Tab,
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
import AddIcon from "@mui/icons-material/Add";
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
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);

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

  const activeTabValue = React.useMemo(() => {
    if (navItems.some(item => item.path === pathname)) return pathname;
    const prefixMatch = navItems.find((item) => {
      if (item.path === "/" || item.path === "") return false;
      return pathname.startsWith(item.path);
    });
    if (prefixMatch) return prefixMatch.path;
    if (pathname.startsWith("/admin/bdo/")) return "/admin/bdms";
    if (pathname.startsWith("/edit-proposal/")) return role === "admin" ? "/admin/proposals" : "/your-proposals";
    return navItems[0]?.path || "";
  }, [navItems, pathname, role]);

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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#000000', width: '100%', overflowX: 'hidden' }}>
      {/* Sidebar / Drawer */}
      {!isMobile && (
        <Box component="nav" sx={{ width: currentDrawerWidth, flexShrink: 0, transition: "width 0.3s ease" }}>
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
        </Box>
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: isMobile ? "100%" : `calc(100% - ${currentDrawerWidth}px)`,
          maxWidth: isMobile ? "100%" : `calc(100% - ${currentDrawerWidth}px)`,
          overflowX: "hidden",
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {isMobile && (
                <Box
                  component="img"
                  src="/download.jpg"
                  alt="Humantek Logo"
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid rgba(243, 168, 51, 0.5)",
                  }}
                />
              )}
              <Typography variant="h6" fontWeight="700" sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
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
        <Box
          sx={{
            flexGrow: 1,
            p: isEditor ? 0 : { xs: 2, md: 4 },
            pb: isMobile ? "80px" : undefined,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {children}
        </Box>
      </Box>

      {/* TikTok / Instagram style Bottom Navigation Bar for Mobile View */}
      {isMobile && mounted && (
        <>
          <Box
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              height: 64,
              bgcolor: "#090909",
              borderTop: "1px solid rgba(243, 168, 51, 0.15)",
              zIndex: 1000,
              boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.4)",
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              px: 2,
              pb: "safe-area-inset-bottom", // Mobile Notch safe area
            }}
          >
            {/* Tab 1: Home */}
            <Box
              onClick={() => handleNav(role === "admin" ? "/dashboard" : "/agent-dashboard")}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                color: pathname === (role === "admin" ? "/dashboard" : "/agent-dashboard") ? "#f3a833" : "#94a3b8",
                transition: "color 0.2s",
                "&:active": { transform: "scale(0.95)" },
              }}
            >
              <DashboardIcon sx={{ fontSize: "1.4rem" }} />
              <Typography sx={{ fontSize: "10px", fontWeight: 700, mt: 0.5 }}>Home</Typography>
            </Box>

            {/* Tab 2: Proposals */}
            <Box
              onClick={() => handleNav(role === "admin" ? "/admin/proposals" : "/your-proposals")}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                color: pathname === (role === "admin" ? "/admin/proposals" : "/your-proposals") ? "#f3a833" : "#94a3b8",
                transition: "color 0.2s",
                "&:active": { transform: "scale(0.95)" },
              }}
            >
              <DescriptionIcon sx={{ fontSize: "1.4rem" }} />
              <Typography sx={{ fontSize: "10px", fontWeight: 700, mt: 0.5 }}>Proposals</Typography>
            </Box>

            {/* Tab 3: Highlighted Center Create Button (Branded Gold Style) */}
            <Box
              onClick={() => handleNav("/create-proposal")}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                "&:active": { transform: "scale(0.9)" },
                transition: "transform 0.15s ease",
              }}
            >
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
                  boxShadow: "0 4px 14px rgba(243, 168, 51, 0.55)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AddIcon sx={{ color: "#000", fontSize: "1.5rem", fontWeight: "bold" }} />
              </Box>
            </Box>

            {/* Tab 4: Notifications (Inbox) */}
            <Box
              onClick={() => handleNav(role === "admin" ? "/admin/notifications" : "/docs")}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                color: pathname === (role === "admin" ? "/admin/notifications" : "/docs") ? "#f3a833" : "#94a3b8",
                transition: "color 0.2s",
                "&:active": { transform: "scale(0.95)" },
              }}
            >
              {role === "admin" ? (
                <Badge badgeContent={unreadCount} color="error" variant="dot">
                  <NotificationsIcon sx={{ fontSize: "1.4rem" }} />
                </Badge>
              ) : (
                <MenuBookIcon sx={{ fontSize: "1.4rem" }} />
              )}
              <Typography sx={{ fontSize: "10px", fontWeight: 700, mt: 0.5 }}>
                {role === "admin" ? "Inbox" : "Docs"}
              </Typography>
            </Box>

            {/* Tab 5: Menu/More */}
            <Box
              onClick={() => setMenuDrawerOpen(true)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                color: menuDrawerOpen ? "#f3a833" : "#94a3b8",
                transition: "color 0.2s",
                "&:active": { transform: "scale(0.95)" },
              }}
            >
              <MenuIcon sx={{ fontSize: "1.4rem" }} />
              <Typography sx={{ fontSize: "10px", fontWeight: 700, mt: 0.5 }}>Menu</Typography>
            </Box>
          </Box>

          {/* TikTok style Bottom sheet for the Menu */}
          <Drawer
            anchor="bottom"
            open={menuDrawerOpen}
            onClose={() => setMenuDrawerOpen(false)}
            PaperProps={{
              sx: {
                bgcolor: "#121212",
                color: "#f8fafc",
                borderTopLeftRadius: "20px",
                borderTopRightRadius: "20px",
                borderTop: "1px solid rgba(243, 168, 51, 0.2)",
                boxShadow: "0 -10px 40px rgba(0,0,0,0.8)",
                px: 2.5,
                pb: 4,
                pt: 1,
              }
            }}
          >
            {/* Pull Bar */}
            <Box
              sx={{
                width: 36,
                height: 4,
                bgcolor: "rgba(255, 255, 255, 0.2)",
                borderRadius: 2,
                mx: "auto",
                my: 1.5,
              }}
            />

            {/* User Header Info */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, mt: 1 }}>
              <Avatar
                src="/download.jpg"
                sx={{
                  width: 48,
                  height: 48,
                  border: "2px solid #f3a833",
                  bgcolor: "#000",
                }}
              />
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                  {user?.name || "Humantek Team"}
                </Typography>
                <Typography sx={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                  {user?.email || "humantek@gmail.com"}
                </Typography>
              </Box>
              <Chip
                label={role}
                size="small"
                sx={{
                  ml: "auto",
                  bgcolor: "rgba(243, 168, 51, 0.15)",
                  color: "#f3a833",
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  height: 20,
                  border: "1px solid rgba(243, 168, 51, 0.3)",
                }}
              />
            </Box>

            <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)", mb: 2 }} />

            {/* Bottom Sheet Menu Options */}
            <List sx={{ p: 0 }}>
              {role === "admin" && (
                <ListItemButton
                  onClick={() => {
                    handleNav("/admin/bdms");
                    setMenuDrawerOpen(false);
                  }}
                  sx={{
                    borderRadius: "12px",
                    py: 1.5,
                    mb: 1,
                    "&:hover": { bgcolor: "rgba(243, 168, 51, 0.08)" },
                  }}
                >
                  <ListItemIcon sx={{ color: "#f3a833", minWidth: 40 }}>
                    <AssessmentIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="BDOs Management"
                    primaryTypographyProps={{ sx: { fontSize: "0.9rem", fontWeight: 600 } }}
                  />
                </ListItemButton>
              )}

              <ListItemButton
                onClick={() => {
                  handleNav("/trash");
                  setMenuDrawerOpen(false);
                }}
                sx={{
                  borderRadius: "12px",
                  py: 1.5,
                  mb: 1,
                  "&:hover": { bgcolor: "rgba(243, 168, 51, 0.08)" },
                }}
              >
                <ListItemIcon sx={{ color: "#ef4444", minWidth: 40 }}>
                  <DeleteOutlineIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Trash"
                  primaryTypographyProps={{ sx: { fontSize: "0.9rem", fontWeight: 600 } }}
                />
              </ListItemButton>

              <ListItemButton
                onClick={() => {
                  handleNav("/profile");
                  setMenuDrawerOpen(false);
                }}
                sx={{
                  borderRadius: "12px",
                  py: 1.5,
                  mb: 1,
                  "&:hover": { bgcolor: "rgba(243, 168, 51, 0.08)" },
                }}
              >
                <ListItemIcon sx={{ color: "#94a3b8", minWidth: 40 }}>
                  <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Profile settings"
                  primaryTypographyProps={{ sx: { fontSize: "0.9rem", fontWeight: 600 } }}
                />
              </ListItemButton>

              <ListItemButton
                onClick={() => {
                  handleNav("/docs");
                  setMenuDrawerOpen(false);
                }}
                sx={{
                  borderRadius: "12px",
                  py: 1.5,
                  mb: 1,
                  "&:hover": { bgcolor: "rgba(243, 168, 51, 0.08)" },
                }}
              >
                <ListItemIcon sx={{ color: "#c084fc", minWidth: 40 }}>
                  <MenuBookIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Documentation"
                  primaryTypographyProps={{ sx: { fontSize: "0.9rem", fontWeight: 600 } }}
                />
              </ListItemButton>

              <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)", my: 1.5 }} />

              <ListItemButton
                onClick={() => {
                  handleLogout();
                  setMenuDrawerOpen(false);
                }}
                sx={{
                  borderRadius: "12px",
                  py: 1.5,
                  bgcolor: "rgba(239, 68, 68, 0.05)",
                  border: "1px solid rgba(239, 68, 68, 0.15)",
                  "&:hover": { bgcolor: "rgba(239, 68, 68, 0.12)" },
                }}
              >
                <ListItemIcon sx={{ color: "#ef4444", minWidth: 40 }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{ sx: { fontSize: "0.9rem", fontWeight: 700, color: "#ef4444" } }}
                />
              </ListItemButton>
            </List>
          </Drawer>
        </>
      )}
    </Box>
  );
}
