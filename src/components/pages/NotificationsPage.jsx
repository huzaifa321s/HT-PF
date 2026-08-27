"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Button,
  Pagination,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import AddBoxIcon from "@mui/icons-material/AddBox";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import axiosInstance from "../../utils/axiosInstance";

const NotificationsPage = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previouslyUnread, setPreviouslyUnread] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const limit = 10;

  const containerVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  // Helper to compute time elapsed
  const timeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const fetchNotifications = async (p = 1) => {
    try {
      setLoading(true);
      const userSession = JSON.parse(sessionStorage.getItem("user") || "null");
      const adminId = userSession?.id;

      const res = await axiosInstance.get(`/api/notifications?page=${p}&limit=${limit}`);
      if (res.data?.success) {
        const list = res.data.notifications || [];
        setNotifications(list);
        setPage(res.data.page || p);
        setPages(res.data.pages || 1);

        // Track which ones were unread on this load (before we call mark-read)
        if (p === 1 && adminId) {
          const unread = list
            .filter((n) => !n.readBy.includes(adminId))
            .map((n) => n._id);
          setPreviouslyUnread(unread);

          // Mark as read in the background
          if (unread.length > 0) {
            await axiosInstance.post("/api/notifications/mark-read");
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Get icons and colors based on notification type
  const getNotificationConfig = (type) => {
    switch (type) {
      case "proposal_created":
        return {
          icon: <AddBoxIcon sx={{ color: "#f3a833" }} />,
          bg: "rgba(243, 168, 51, 0.1)",
        };
      case "proposal_updated":
        return {
          icon: <EditIcon sx={{ color: "#2196f3" }} />,
          bg: "rgba(33, 150, 243, 0.1)",
        };
      case "proposal_deleted":
        return {
          icon: <DeleteIcon sx={{ color: "#f44336" }} />,
          bg: "rgba(244, 67, 54, 0.1)",
        };
      default:
        return {
          icon: <InfoIcon sx={{ color: "#9e9e9e" }} />,
          bg: "rgba(158, 158, 158, 0.1)",
        };
    }
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
      }}
    >
      <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: { xs: 2.5, sm: 3.5, md: 4 }, gap: { xs: 1.5, sm: 2 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(243, 168, 51, 0.15)",
              borderRadius: "50%",
              width: { xs: 44, sm: 54, md: 56 },
              height: { xs: 44, sm: 54, md: 56 },
              minWidth: { xs: 44, sm: 54, md: 56 },
              boxShadow: "0 4px 20px rgba(243, 168, 51, 0.3)",
              flexShrink: 0,
            }}
          >
            <NotificationsIcon sx={{ fontSize: { xs: 22, sm: 28, md: 30 }, color: "#f3a833" }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
                fontSize: { xs: "1.3rem", sm: "1.65rem", md: "2.125rem" },
                lineHeight: 1.2,
              }}
            >
              Activity Notifications
            </Typography>
            <Typography variant="body2" sx={{ color: "#94a3b8", mt: { xs: 0.25, md: 0.5 }, fontSize: { xs: "0.78rem", sm: "0.85rem" } }}>
              Track proposal changes and agent actions across the portal in real-time.
            </Typography>
          </Box>
        </Box>

        <Card
          sx={{
            borderRadius: { xs: 3, md: 4 },
            background: "rgba(20, 20, 20, 0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(243, 168, 51, 0.2)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #f3a833 0%, #f59e0b 50%, #fbbf24 100%)",
            },
          }}
        >
          <CardContent sx={{ p: { xs: 1.5, sm: 3, md: 4 }, "&:last-child": { pb: { xs: 2, sm: 3, md: 4 } } }}>
            {loading && notifications.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                <CircularProgress size={45} sx={{ color: "#f3a833" }} />
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
                <NotificationsIcon sx={{ fontSize: { xs: 44, sm: 60 }, color: "rgba(243,168,51,0.25)", mb: 2 }} />
                <Typography variant="h6" sx={{ color: "#94a3b8", fontWeight: 600, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                  All Caught Up!
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", mt: 1, fontSize: { xs: "0.78rem", sm: "0.875rem" } }}>
                  No activities recorded yet. When agents create or manage proposals, you will see notifications here.
                </Typography>
              </Box>
            ) : (
              <>
                <List disablePadding>
                  {notifications.map((notif, index) => {
                    const isNew = previouslyUnread.includes(notif._id);
                    const config = getNotificationConfig(notif.type);
                    return (
                      <React.Fragment key={notif._id}>
                        {index > 0 && <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />}
                        <ListItem
                          component={motion.div}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: index * 0.05 }}
                          alignItems="flex-start"
                          sx={{
                            py: { xs: 2, sm: 2.5 },
                            px: { xs: 1.25, sm: 2.5, md: 3 },
                            transition: "all 0.25s ease",
                            borderLeft: isNew ? "4px solid #f3a833" : "4px solid transparent",
                            bgcolor: isNew ? "rgba(243, 168, 51, 0.03)" : "transparent",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: { xs: "stretch", sm: "flex-start" },
                            gap: { xs: 1.5, sm: 0 },
                            "&:hover": {
                              bgcolor: "rgba(255, 255, 255, 0.02)",
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: { xs: 1.25, sm: 2 }, flex: 1, minWidth: 0 }}>
                            <ListItemAvatar sx={{ mt: 0.25, minWidth: 0, mr: { xs: 0, sm: 0.5 } }}>
                              <Avatar
                                sx={{
                                  bgcolor: config.bg,
                                  width: { xs: 36, sm: 44 },
                                  height: { xs: 36, sm: 44 },
                                  "& .MuiSvgIcon-root": {
                                    fontSize: { xs: 18, sm: 22 },
                                  },
                                }}
                              >
                                {config.icon}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              disableTypography
                              sx={{ my: 0, minWidth: 0, flex: 1 }}
                              primary={
                                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight={700}
                                    sx={{ color: "#f8fafc", fontSize: { xs: "0.92rem", sm: "1.05rem" }, wordBreak: "break-word" }}
                                  >
                                    {notif.title}
                                  </Typography>
                                  {isNew && (
                                    <Chip
                                      label="NEW"
                                      size="small"
                                      sx={{
                                        height: 16,
                                        fontSize: "0.6rem",
                                        fontWeight: 800,
                                        bgcolor: "#f3a833",
                                        color: "#000",
                                      }}
                                    />
                                  )}
                                </Stack>
                              }
                              secondary={
                                <Stack spacing={0.8} sx={{ mt: 0.5 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{ color: "#cbd5e1", lineHeight: 1.45, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                                  >
                                    {notif.message}
                                  </Typography>
                                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#f3a833", fontWeight: 700, fontSize: { xs: "0.72rem", sm: "0.75rem" } }}
                                    >
                                      {timeAgo(notif.createdAt)}
                                    </Typography>
                                    {notif.triggeredBy && (
                                      <>
                                        <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#475569" }} />
                                        <Typography
                                          variant="caption"
                                          sx={{ color: "#94a3b8", fontSize: { xs: "0.72rem", sm: "0.75rem" } }}
                                        >
                                          By: {notif.triggeredBy.name || notif.triggeredBy.email}
                                        </Typography>
                                      </>
                                    )}
                                  </Stack>
                                </Stack>
                              }
                            />
                          </Box>
                          {notif.proposalId && notif.type !== "proposal_deleted" && (
                            <Button
                              variant="outlined"
                              size="small"
                              endIcon={<ArrowForwardIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                              onClick={() => router.push(`/admin/proposals/${notif.proposalId._id || notif.proposalId}`)}
                              sx={{
                                mt: { xs: 0.5, sm: 0.5 },
                                ml: { xs: 0, sm: 2 },
                                width: { xs: "100%", sm: "auto" },
                                alignSelf: { xs: "stretch", sm: "center" },
                                textTransform: "none",
                                borderColor: "rgba(243, 168, 51, 0.4)",
                                color: "#f3a833",
                                borderRadius: 2,
                                py: { xs: 0.6, sm: 0.75 },
                                px: 1.5,
                                fontSize: { xs: "0.78rem", sm: "0.85rem" },
                                "&:hover": {
                                  borderColor: "#f3a833",
                                  bgcolor: "rgba(243, 168, 51, 0.05)",
                                },
                              }}
                            >
                              View Proposal
                            </Button>
                          )}
                        </ListItem>
                      </React.Fragment>
                    );
                  })}
                </List>

                {pages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <Pagination
                      count={pages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      sx={{
                        "& .MuiPaginationItem-root": {
                          color: "#94a3b8",
                          "&.Mui-selected": {
                            bgcolor: "rgba(243, 168, 51, 0.2)",
                            color: "#f3a833",
                            borderColor: "#f3a833",
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default NotificationsPage;
