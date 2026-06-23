"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton,
  Chip,
  Button,
  Tooltip,
  Divider,
  Pagination,
  CircularProgress,
  Stack,
  Avatar,
  Fade,
  alpha,
  TextField,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DescriptionIcon from "@mui/icons-material/Description";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { useDispatch } from "react-redux";
import { showToast } from "@/utils/toastSlice";
import { useDebounce } from "use-debounce";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import PermanentDeleteModal from "@/components/modals/PermanentDeleteModal";

dayjs.extend(relativeTime);

const DAYS_UNTIL_PURGE = 30;

const TrashPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  let user = {};
  try {
    user = JSON.parse(sessionStorage.getItem("user") || "{}");
  } catch (e) {}
  const isAdmin = user.role === "admin";

  const [proposals, setProposals] = useState([]);
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  const [permDeleteOpen, setPermDeleteOpen] = useState(false);
  const [permDeleteId, setPermDeleteId] = useState(null);

  // Helper to update URL params
  const updateUrlParams = useCallback(
    (paramsUpdate) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      Object.entries(paramsUpdate).forEach(([key, value]) => {
        if (value) {
          current.set(key, value);
        } else {
          current.delete(key);
        }
      });
      const query = current.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const fetchTrash = useCallback(async () => {
    try {
      setLoading(true);
      const urlPage = parseInt(searchParams.get("page")) || 1;
      const urlSearch = searchParams.get("search") || "";

      const res = await axiosInstance.get("/api/proposals/get-trash", {
        params: { page: urlPage, limit: 5, search: urlSearch },
      });

      setProposals(res.data.proposals || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
      setPage(urlPage);
      if (urlSearch !== searchTerm) setSearchTerm(urlSearch);
    } catch (error) {
      console.error("Error fetching trash:", error);
      setProposals([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  // Sync debounced search to URL
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (debouncedSearch !== currentSearch) {
      updateUrlParams({ search: debouncedSearch, page: "" });
    }
  }, [debouncedSearch, searchParams, updateUrlParams]);

  const handlePageChange = (_, value) => {
    updateUrlParams({ page: value === 1 ? "" : value.toString() });
  };

  const handleRestore = async (id) => {
    try {
      setRestoringId(id);
      const res = await axiosInstance.patch(`/api/proposals/restore/${id}`);
      if (res.data.success) {
        dispatch(
          showToast({ message: "✅ Proposal restored successfully!", severity: "success" })
        );
        setProposals((prev) => prev.filter((p) => p._id !== id));
        setTotalCount((c) => c - 1);
      } else {
        dispatch(
          showToast({ message: "❌ Failed to restore proposal.", severity: "error" })
        );
      }
    } catch (err) {
      console.error(err);
      dispatch(
        showToast({ message: "⚠️ Server error while restoring proposal.", severity: "error" })
      );
    } finally {
      setRestoringId(null);
    }
  };

  const openPermDelete = (id) => {
    setPermDeleteId(id);
    setPermDeleteOpen(true);
  };

  const handlePermDeleted = (id) => {
    setProposals((prev) => prev.filter((p) => p._id !== id));
    setTotalCount((c) => c - 1);
  };

  // Returns how many days until auto-purge
  const getDaysLeft = (deletedAt) => {
    if (!deletedAt) return null;
    const expiry = dayjs(deletedAt).add(DAYS_UNTIL_PURGE, "day");
    const daysLeft = expiry.diff(dayjs(), "day");
    return Math.max(0, daysLeft);
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{ minHeight: "100%", py: { xs: 2, md: 4 }, width: "100%", position: "relative" }}
    >
      {/* Permanent Delete Modal */}
      <PermanentDeleteModal
        open={permDeleteOpen}
        handleClose={() => setPermDeleteOpen(false)}
        id={permDeleteId}
        onDeleted={handlePermDeleted}
      />

      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        {/* Header */}
        <Fade in timeout={800}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              mb: 4,
              gap: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
                borderRadius: "50%",
                width: { xs: 56, md: 72 },
                height: { xs: 56, md: 72 },
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                border: "2px solid rgba(255,255,255,0.1)",
              }}
            >
              <DeleteOutlineIcon sx={{ fontSize: { xs: 28, md: 36 }, color: "#94a3b8" }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: "#f8fafc",
                  letterSpacing: "-0.5px",
                  fontSize: { xs: "1.75rem", md: "2.25rem" },
                }}
              >
                Trash
              </Typography>
              <Typography variant="body1" sx={{ color: "#94a3b8", mt: 0.5, fontSize: "1rem" }}>
                {totalCount} proposal{totalCount !== 1 ? "s" : ""} in trash
              </Typography>
            </Box>
          </Box>
        </Fade>

        {/* Auto-purge notice */}
        <Fade in timeout={1000}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1.5,
              p: 2,
              mb: 4,
              borderRadius: 3,
              background: "rgba(243, 168, 51, 0.06)",
              border: "1px solid rgba(243, 168, 51, 0.2)",
            }}
          >
            <InfoOutlinedIcon sx={{ color: "#f3a833", fontSize: 20, mt: 0.2, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ color: "#94a3b8", lineHeight: 1.7 }}>
              Items in the Trash are automatically <strong style={{ color: "#f3a833" }}>permanently deleted after {DAYS_UNTIL_PURGE} days</strong>. Restore a proposal to bring it back to your active proposals list.
            </Typography>
          </Box>
        </Fade>

        {/* Main Card */}
        <Fade in timeout={1200}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              background: "rgba(20, 20, 20, 0.8)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Search */}
            <Box sx={{ mb: 4 }}>
              <TextField
                placeholder="Search trashed proposals..."
                variant="outlined"
                size="small"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  maxWidth: 400,
                  "& .MuiInputBase-root": {
                    background: "#0a0a0a",
                    borderRadius: 2,
                    color: "#fff",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.1)",
                  },
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(243,168,51,0.4)",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Divider sx={{ mb: 4, borderColor: "rgba(255,255,255,0.06)" }} />

            {/* Table */}
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
                <CircularProgress size={56} thickness={4} sx={{ color: "#94a3b8" }} />
              </Box>
            ) : proposals.length === 0 ? (
              /* Empty State */
              <Box sx={{ textAlign: "center", py: 12, px: 4 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: "auto",
                    mb: 3,
                    background: "rgba(255,255,255,0.04)",
                    border: "2px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 60, color: "#374151" }} />
                </Avatar>
                <Typography variant="h5" fontWeight={700} sx={{ color: "#f8fafc", mb: 1 }}>
                  Trash is Empty
                </Typography>
                <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 400, mx: "auto", mb: 4 }}>
                  When you delete a proposal it will appear here. You can restore or permanently delete it from here.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => router.push(isAdmin ? "/admin/proposals" : "/your-proposals")}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: "rgba(255,255,255,0.12)",
                    color: "#94a3b8",
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.25)",
                      background: "rgba(255,255,255,0.04)",
                    },
                  }}
                >
                  Go to Proposals
                </Button>
              </Box>
            ) : (
              <>
                <TableContainer
                  sx={{
                    borderRadius: 3,
                    overflowX: "auto",
                    "&::-webkit-scrollbar": { height: 6 },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderRadius: 10,
                    },
                  }}
                >
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow
                        sx={{
                          background: "rgba(255,255,255,0.03)",
                        }}
                      >
                        {["Title", "Client", ...(isAdmin ? ["Deleted By"] : []), "Deleted", "Expires In", "Actions"].map(
                          (header) => (
                            <TableCell
                              key={header}
                              align={header === "Actions" ? "center" : "left"}
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                py: 2.5,
                                color: "#64748b",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                borderBottom: "1px solid rgba(255,255,255,0.06)",
                              }}
                            >
                              {header}
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <AnimatePresence>
                        {proposals.map((proposal) => {
                          const daysLeft = getDaysLeft(proposal.deletedAt);
                          const isExpiringSoon = daysLeft !== null && daysLeft <= 7;

                          return (
                            <TableRow
                              key={proposal._id}
                              component={motion.tr}
                              variants={tableRowVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              layout
                              sx={{
                                "&:hover": {
                                  bgcolor: "rgba(255,255,255,0.02)",
                                },
                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                                transition: "all 0.2s ease",
                              }}
                            >
                              {/* Title */}
                              <TableCell>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                  {!isMobile && (
                                    <Avatar
                                      sx={{
                                        width: 36,
                                        height: 36,
                                        background: "rgba(255,255,255,0.06)",
                                        fontSize: "0.85rem",
                                        fontWeight: 700,
                                        color: "#94a3b8",
                                      }}
                                    >
                                      {proposal.projectTitle?.charAt(0)?.toUpperCase() || "?"}
                                    </Avatar>
                                  )}
                                  <Box>
                                    <Typography
                                      fontWeight={600}
                                      sx={{
                                        fontSize: isMobile ? "0.8rem" : "0.9rem",
                                        color: "#94a3b8",
                                        textDecoration: "line-through",
                                        textDecorationColor: "rgba(148,163,184,0.4)",
                                      }}
                                    >
                                      {proposal.projectTitle}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              {/* Client */}
                              <TableCell>
                                <Typography sx={{ fontSize: "0.9rem", color: "#64748b" }}>
                                  {proposal.clientName}
                                </Typography>
                              </TableCell>

                              {/* Deleted By (admin only) */}
                              {isAdmin && (
                                <TableCell>
                                  <Chip
                                    label={
                                      proposal.deletedBy?.name ||
                                      proposal.createdBy?.name ||
                                      "Unknown"
                                    }
                                    size="small"
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: "0.75rem",
                                      bgcolor: "rgba(255,255,255,0.05)",
                                      color: "#64748b",
                                      border: "1px solid rgba(255,255,255,0.08)",
                                    }}
                                  />
                                </TableCell>
                              )}

                              {/* Deleted At */}
                              <TableCell>
                                <Typography sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                                  {proposal.deletedAt
                                    ? dayjs(proposal.deletedAt).format("MMM D, YYYY")
                                    : "N/A"}
                                </Typography>
                                <Typography sx={{ fontSize: "0.75rem", color: "#475569" }}>
                                  {proposal.deletedAt ? dayjs(proposal.deletedAt).fromNow() : ""}
                                </Typography>
                              </TableCell>

                              {/* Days Until Purge */}
                              <TableCell>
                                {daysLeft !== null ? (
                                  <Chip
                                    label={daysLeft === 0 ? "Today" : `${daysLeft}d left`}
                                    size="small"
                                    sx={{
                                      fontWeight: 700,
                                      fontSize: "0.75rem",
                                      bgcolor: isExpiringSoon
                                        ? "rgba(244, 67, 54, 0.12)"
                                        : "rgba(255,255,255,0.05)",
                                      color: isExpiringSoon ? "#f44336" : "#64748b",
                                      border: `1px solid ${
                                        isExpiringSoon
                                          ? "rgba(244,67,54,0.25)"
                                          : "rgba(255,255,255,0.08)"
                                      }`,
                                    }}
                                  />
                                ) : (
                                  <Typography sx={{ color: "#475569", fontSize: "0.85rem" }}>
                                    —
                                  </Typography>
                                )}
                              </TableCell>

                              {/* Actions */}
                              <TableCell align="center">
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  justifyContent="center"
                                >
                                  <Tooltip title="Restore to active proposals" arrow>
                                    <span>
                                      <IconButton
                                        onClick={() => handleRestore(proposal._id)}
                                        disabled={restoringId === proposal._id}
                                        sx={{
                                          bgcolor: alpha("#4caf50", 0.1),
                                          "&:hover": { bgcolor: alpha("#4caf50", 0.2) },
                                          "&:disabled": { opacity: 0.5 },
                                        }}
                                      >
                                        {restoringId === proposal._id ? (
                                          <CircularProgress size={18} sx={{ color: "#4caf50" }} />
                                        ) : (
                                          <RestoreIcon sx={{ color: "#4caf50", fontSize: 20 }} />
                                        )}
                                      </IconButton>
                                    </span>
                                  </Tooltip>

                                  <Tooltip title="Permanently delete — cannot be undone" arrow>
                                    <IconButton
                                      onClick={() => openPermDelete(proposal._id)}
                                      sx={{
                                        bgcolor: alpha("#f44336", 0.1),
                                        "&:hover": { bgcolor: alpha("#f44336", 0.2) },
                                      }}
                                    >
                                      <DeleteForeverIcon sx={{ color: "#f44336", fontSize: 20 }} />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      size="large"
                      showFirstButton
                      showLastButton
                      sx={{
                        "& .MuiPaginationItem-root": {
                          fontWeight: 600,
                          fontSize: "1rem",
                          borderRadius: 2,
                          color: "#64748b",
                          "&.Mui-selected": {
                            background: "rgba(255,255,255,0.08)",
                            color: "#f8fafc",
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Fade>
      </Box>
    </Box>
  );
};

export default TrashPage;
