"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Divider,
  Chip,
  Stack,
  Container,
  CircularProgress,
  Button,
  alpha,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Pagination,
  Tooltip,
  IconButton,
  Grid,
  Skeleton,
} from "@mui/material";
import {
  Person,
  ArrowBack,
  Edit,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
  Email,
  CalendarToday,
  Assessment,
  Badge,
} from "@mui/icons-material";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "../../utils/axiosInstance";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "use-debounce";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import { TextField, InputAdornment, useMediaQuery, useTheme } from "@mui/material";
import { useDispatch } from "react-redux";
import { showToast } from "../../utils/toastSlice";

const BDODetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Proposals State
  const [proposals, setProposals] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingProposals, setLoadingProposals] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [dateFilter, setDateFilter] = useState("");
  const hasActiveFilters = Boolean(searchTerm.trim() || dateFilter);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
  };

  const colorScheme = {
    primary: "#f3a833",
    secondary: "#f59e0b",
    gradient: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
    hoverGradient: "linear-gradient(135deg, #eab308 0%, #d97706 100%)",
  };

  const handleEdit = () => {
    if (typeof window !== "undefined") {
      window.history.replaceState({ editBdm: data }, "");
    }
    router.push("/admin/bdms");
  };

  const fetchProposals = async (pageNumber = 1, filtersOverride) => {
    try {
      setLoadingProposals(true);
      const params = {
        page: pageNumber,
        limit: 5,
        createdBy: id,
        search: filtersOverride?.search ?? debouncedSearchTerm,
        date: filtersOverride?.date ?? dateFilter,
      };
      const res = await axiosInstance.get(`/api/proposals/get-all-proposals`, { params });
      setProposals(res.data.proposals || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setProposals([]);
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleClearFilters = () => {
    setPage(1);
    setSearchTerm("");
    setDateFilter("");
    fetchProposals(1, { search: "", date: "" });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/api/bdms/details/${id}`);
        if (res.data?.success) {
          setData(res.data.data);
        } else {
          setData(null);
        }
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchData();
      fetchProposals(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProposals(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearchTerm, dateFilter]);

  const handleViewProposal = (proposalId) => {
    router.push(`/admin/proposals/${proposalId}`);
  };

  const handleDownload = async (proposalId) => {
    try {
      const res = await axiosInstance.get(`/api/proposals/get-single-proposal/${proposalId}`);
      const pdfPath = res.data.data.pdfPath;
      if (!pdfPath) {
        dispatch(showToast({ message: "PDF not found.", severity: "error" }));
        return;
      }
      // Build proper download URL (Google Drive or fallback)
      const driveMatch = pdfPath.match(/\/file\/d\/([^/]+)/);
      const downloadUrl = driveMatch
        ? `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`
        : pdfPath;
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch {
      dispatch(showToast({ message: "Failed to open PDF.", severity: "error" }));
    }
  };

  const formatTS = (ts) => (ts ? format(new Date(ts), "dd MMM yyyy, hh:mm a") : "—");

  // ── Reusable InfoRow (same as ProposalDetails) ──────────────────────────────
  const InfoRow = ({ label, value, icon }) => (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
      <Box
        sx={{
          p: 1,
          borderRadius: 2,
          background: alpha("#f3a833", 0.1),
          color: "#f3a833",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 20 } })}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.25 }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500, color: "#f8fafc" }}>
          {value || "N/A"}
        </Typography>
      </Box>
    </Box>
  );

  // ── Reusable SectionCard (same as ProposalDetails) ──────────────────────────
  const SectionCard = ({ title, icon, children }) => (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 4 },
        height: "100%",
        background: "rgba(20, 20, 20, 0.6)",
        border: "1px solid rgba(243, 168, 51, 0.15)",
        borderRadius: 4,
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
          border: "1px solid rgba(243, 168, 51, 0.3)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            background: colorScheme.gradient,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(243, 168, 51, 0.4)",
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 24 } })}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#f8fafc" }}>
          {title}
        </Typography>
      </Box>
      {children}
    </Paper>
  );

  return (
    <Box sx={{ minHeight: "100%", position: "relative" }}>
      {/* Background ambient light */}
      <Box
        sx={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(243,168,51,0.1) 0%, rgba(0,0,0,0) 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 }, position: "relative", zIndex: 1 }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">

          {/* ── Header / Navigation ─────────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <Box sx={{ mb: 5, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <IconButton
                  onClick={() => router.back()}
                  sx={{
                    bgcolor: "#141414",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                    border: "1px solid rgba(243, 168, 51,0.2)",
                    "&:hover": { bgcolor: "rgba(30, 30, 30, 0.8)", borderColor: "#f3a833" },
                    color: "#f3a833",
                  }}
                >
                  <ArrowBack />
                </IconButton>
                <Box>
                  <Typography variant="h4" fontWeight={800} color="#f8fafc">
                    BDO Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Review all information associated with this Business Development Officer.
                  </Typography>
                </Box>
              </Box>

              {data && (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={handleEdit}
                  sx={{
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    fontSize: "1rem",
                    background: colorScheme.gradient,
                    boxShadow: "0 4px 14px rgba(243, 168, 51, 0.4)",
                    "&:hover": {
                      background: colorScheme.hoverGradient,
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(243, 168, 51, 0.6)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Edit BDO
                </Button>
              )}
            </Box>
          </motion.div>

          {loading ? (
            <Stack spacing={3}>
              <Skeleton variant="rounded" height={160} sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: 4 }} />
              <Skeleton variant="rounded" height={200} sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: 4 }} />
              <Skeleton variant="rounded" height={400} sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: 4 }} />
            </Stack>
          ) : !data ? (
            <Box sx={{ py: 10, textAlign: "center" }}>
              <Typography variant="h6" sx={{ color: "#94a3b8" }}>BDO not found</Typography>
            </Box>
          ) : (
            <>
              {/* ── Hero Banner (same as ProposalDetails) ─────────────────── */}
              <motion.div variants={itemVariants}>
                <Paper
                  sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    background: colorScheme.gradient,
                    p: { xs: 3, sm: 5 },
                    mb: 4,
                    color: "#fff",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                    position: "relative",
                  }}
                >
                  {/* Decorative element */}
                  <Box
                    sx={{
                      position: "absolute",
                      right: -50,
                      bottom: -50,
                      opacity: 0.1,
                      transform: "rotate(-15deg)",
                    }}
                  >
                    <Person sx={{ fontSize: 240 }} />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: 3,
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <Box>
                      {/* Avatar + Name */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 2 }}>
                        <Avatar
                          sx={{
                            width: 64,
                            height: 64,
                            bgcolor: "rgba(255,255,255,0.25)",
                            border: "2px solid rgba(255,255,255,0.4)",
                            backdropFilter: "blur(8px)",
                          }}
                        >
                          <Person sx={{ fontSize: 36, color: "#fff" }} />
                        </Avatar>
                        <Box>
                          <Typography
                            variant="h3"
                            fontWeight={800}
                            sx={{ fontSize: { xs: "1.8rem", sm: "2.5rem" }, textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}
                          >
                            {data.name}
                          </Typography>
                          <Typography variant="body1" sx={{ opacity: 0.85, fontWeight: 500 }}>
                            {data.email}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Meta chips */}
                      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
                        <Chip
                          label="Business Development Officer"
                          sx={{
                            bgcolor: "rgba(255,255,255,0.25)",
                            color: "#fff",
                            fontWeight: 700,
                            backdropFilter: "blur(8px)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        />
                        <Chip
                          icon={<CalendarToday sx={{ color: "#fff !important", fontSize: "14px !important" }} />}
                          label={`Joined: ${formatTS(data.createdAt)}`}
                          sx={{
                            bgcolor: "transparent",
                            color: "#fff",
                            fontWeight: 600,
                            border: "1px solid rgba(255,255,255,0.2)",
                            "& .MuiChip-icon": { color: "rgba(255,255,255,0.8)" },
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Total Proposals badge */}
                    <Box
                      sx={{
                        px: 3,
                        py: 2,
                        borderRadius: 3,
                        bgcolor: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        textAlign: "center",
                        minWidth: 120,
                      }}
                    >
                      <Typography variant="h3" fontWeight={900} sx={{ color: "#fff", lineHeight: 1 }}>
                        {data.totalProposals}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, mt: 0.5 }}>
                        Proposals
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>

              {/* ── Info Cards Grid ────────────────────────────────────────── */}
              <Grid container spacing={4} sx={{ mb: 4 }}>
                {/* BDO Profile Info */}
                <Grid item xs={12} md={6}>
                  <motion.div variants={itemVariants} style={{ height: "100%" }}>
                    <SectionCard title="BDO Profile" icon={<Badge />}>
                      <Stack spacing={1}>
                        <InfoRow label="Full Name" value={data.name} icon={<Person />} />
                        <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", my: 1 }} />
                        <InfoRow label="Email Address" value={data.email} icon={<Email />} />
                        <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", my: 1 }} />
                        <InfoRow label="Member Since" value={formatTS(data.createdAt)} icon={<CalendarToday />} />
                      </Stack>
                    </SectionCard>
                  </motion.div>
                </Grid>

                {/* Performance Stats */}
                <Grid item xs={12} md={6}>
                  <motion.div variants={itemVariants} style={{ height: "100%" }}>
                    <SectionCard title="Performance Overview" icon={<Assessment />}>
                      <Stack spacing={1}>
                        <InfoRow label="Total Proposals Submitted" value={String(data.totalProposals ?? 0)} icon={<DescriptionIcon />} />
                        <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", my: 1 }} />
                        <InfoRow label="Last Activity" value={formatTS(data.updatedAt)} icon={<CalendarToday />} />
                        <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", my: 1 }} />
                        <InfoRow label="Account Status" value="Active" icon={<Badge />} />
                      </Stack>
                    </SectionCard>
                  </motion.div>
                </Grid>
              </Grid>

              {/* ── Proposals Table Card ───────────────────────────────────── */}
              <motion.div variants={itemVariants}>
                <Paper
                  elevation={0}
                  sx={{
                    background: "rgba(20, 20, 20, 0.6)",
                    border: "1px solid rgba(243, 168, 51, 0.15)",
                    borderRadius: 4,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                    overflow: "hidden",
                  }}
                >
                  {/* Card Header */}
                  <Box
                    sx={{
                      p: { xs: 3, sm: 4 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 2,
                      borderBottom: "1px solid rgba(243, 168, 51, 0.1)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                          background: colorScheme.gradient,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(243, 168, 51, 0.4)",
                        }}
                      >
                        <DescriptionIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color: "#f8fafc" }}>
                          Proposals by {data.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          All proposals submitted by this BDO
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Filters */}
                  <Box
                    sx={{
                      px: { xs: 3, sm: 4 },
                      py: 3,
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      background: "rgba(0,0,0,0.15)",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, color: "#f8fafc" }}>Filters</Typography>
                      <Button
                        variant="outlined"
                        startIcon={<FilterAltOffIcon />}
                        disabled={!hasActiveFilters}
                        onClick={handleClearFilters}
                        size="small"
                        sx={{
                          borderRadius: 3,
                          textTransform: "none",
                          fontWeight: 700,
                          borderColor: alpha(colorScheme.primary, 0.35),
                          color: colorScheme.primary,
                          "&:hover": {
                            borderColor: colorScheme.primary,
                            background: alpha(colorScheme.primary, 0.06),
                          },
                        }}
                      >
                        Clear Filters
                      </Button>
                    </Box>
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      <TextField
                        placeholder="Search by title, client name or email..."
                        variant="outlined"
                        size="small"
                        fullWidth={isMobile}
                        value={searchTerm}
                        onChange={(e) => {
                          setPage(1);
                          setSearchTerm(e.target.value);
                        }}
                        sx={{
                          flex: { xs: "1 1 100%", md: 2 },
                          minWidth: 260,
                          "& .MuiInputBase-root": {
                            background: "#141414",
                            borderRadius: 2,
                            color: "#fff",
                          },
                          "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(243, 168, 51, 0.2)" },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: "#94a3b8" }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Date"
                          value={dateFilter ? dayjs(dateFilter) : null}
                          onChange={(newValue) => {
                            setPage(1);
                            setDateFilter(newValue ? newValue.format("YYYY-MM-DD") : "");
                          }}
                          slotProps={{
                            textField: {
                              size: "small",
                              sx: {
                                flex: { xs: "1 1 100%", sm: "0 1 auto" },
                                minWidth: 180,
                                "& .MuiInputBase-root": { background: "#141414", borderRadius: 2, color: "#fff" },
                                "& .MuiInputLabel-root": { color: "#94a3b8" },
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(243, 168, 51, 0.2)" },
                                "& .MuiSvgIcon-root": { color: "#94a3b8" },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Box>
                  </Box>

                  {/* Table Content */}
                  <Box sx={{ p: { xs: 2, sm: 4 } }}>
                    {loadingProposals ? (
                      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                        <CircularProgress sx={{ color: colorScheme.primary }} />
                      </Box>
                    ) : proposals.length === 0 ? (
                      <Box sx={{ py: 8, textAlign: "center" }}>
                        <DescriptionIcon sx={{ fontSize: 56, color: "rgba(255,255,255,0.1)", mb: 2 }} />
                        <Typography variant="body1" sx={{ color: "#94a3b8" }}>
                          No proposals found.
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <TableContainer>
                          <Table sx={{ minWidth: 700 }}>
                            <TableHead>
                              <TableRow sx={{ background: "rgba(243, 168, 51, 0.08)" }}>
                                {["Title", "Client", "Client Email", "Date", "Actions"].map((h) => (
                                  <TableCell
                                    key={h}
                                    sx={{ fontWeight: 700, color: "#f8fafc", borderBottom: "1px solid rgba(243,168,51,0.15)" }}
                                  >
                                    {h}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <AnimatePresence>
                                {proposals.map((proposal) => (
                                  <TableRow
                                    key={proposal._id}
                                    component={motion.tr}
                                    variants={tableRowVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    layout
                                    hover
                                    sx={{ "&:hover": { bgcolor: "rgba(243, 168, 51, 0.06) !important" } }}
                                  >
                                    <TableCell sx={{ color: "#f8fafc", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                      <Typography fontWeight={600}>{proposal.projectTitle}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                      {proposal.clientName}
                                    </TableCell>
                                    <TableCell sx={{ color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                      {proposal.clientEmail || "N/A"}
                                    </TableCell>
                                    <TableCell sx={{ color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                      {proposal.createdAt ? dayjs(proposal.createdAt).format("MMM D, YYYY") : "N/A"}
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                      <Stack direction="row" spacing={1}>
                                        <Tooltip title="View Proposal">
                                          <IconButton
                                            onClick={() => handleViewProposal(proposal._id)}
                                            size="small"
                                            sx={{
                                              bgcolor: alpha(colorScheme.primary, 0.1),
                                              "&:hover": { bgcolor: alpha(colorScheme.primary, 0.2) },
                                            }}
                                          >
                                            <VisibilityIcon fontSize="small" sx={{ color: colorScheme.primary }} />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Download PDF">
                                          <IconButton
                                            onClick={() => handleDownload(proposal._id)}
                                            size="small"
                                            sx={{
                                              bgcolor: alpha("#4caf50", 0.1),
                                              "&:hover": { bgcolor: alpha("#4caf50", 0.2) },
                                            }}
                                          >
                                            <DownloadIcon fontSize="small" sx={{ color: "#4caf50" }} />
                                          </IconButton>
                                        </Tooltip>
                                      </Stack>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </AnimatePresence>
                            </TableBody>
                          </Table>
                        </TableContainer>

                        {totalPages > 1 && (
                          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                            <Pagination
                              count={totalPages}
                              page={page}
                              onChange={(e, v) => setPage(v)}
                              sx={{
                                "& .MuiPaginationItem-root": { color: "#94a3b8" },
                                "& .MuiPaginationItem-root.Mui-selected": {
                                  background: colorScheme.gradient,
                                  color: "#fff",
                                  fontWeight: 700,
                                },
                              }}
                            />
                          </Box>
                        )}
                      </>
                    )}
                  </Box>
                </Paper>
              </motion.div>
            </>
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

export default BDODetails;
