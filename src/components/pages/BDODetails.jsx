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
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  Person,
  ArrowBack,
  Edit,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
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
    lightBg: "linear-gradient(135deg, #0a0a0a 0%, #111111 100%)",
  };

  const handleEdit = () => {
    if (typeof window !== "undefined") {
      window.history.replaceState({ editBdm: data }, '');
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
      const res = await axiosInstance.get(
        `/api/proposals/get-single-proposal/${proposalId}`
      );
      const pdfPath = res.data.data.pdfPath;
      if (!pdfPath) {
        dispatch(showToast({ message: "PDF not found.", severity: "error" }));
        return;
      }
      window.open(pdfPath, "_blank", "noopener,noreferrer");
    } catch {
      dispatch(showToast({ message: "Failed to open PDF.", severity: "error" }));
    }
  };

  const formatTS = (ts) =>
    ts ? format(new Date(ts), "dd MMM yyyy, hh:mm a") : "—";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        py: { xs: 4, md: 8 },
        minHeight: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      <Container maxWidth="lg">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4, alignItems: "center" }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => router.back()}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 700,
                borderColor: "rgba(243, 168, 51, 0.5)",
                color: "#f3a833",
                "&:hover": {
                  borderColor: "#eab308",
                  background: "rgba(243, 168, 51,0.1)",
                },
              }}
            >
              Back to BDOs
            </Button>

            {data && (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={handleEdit}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
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

          {loading ? (
            <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={56} sx={{ color: colorScheme.primary }} />
            </Box>
          ) : !data ? (
            <Box sx={{ py: 10, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: "#94a3b8" }}>
                BDO not found
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Left Column: Profile & Stats */}
              <Grid item xs={12} md={4}>
                <Stack spacing={3}>
                  <Card
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                      background: "#0a0a0a",
                      border: "1px solid rgba(243, 168, 51, 0.2)",
                      borderRadius: 4,
                      boxShadow: "0 4px 20px rgba(243, 168, 51, 0.1)",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <Box sx={{ height: 6, background: colorScheme.gradient }} />
                    <CardContent sx={{ p: 4, textAlign: "center" }}>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          background: colorScheme.gradient,
                          boxShadow: "0 8px 24px rgba(243, 168, 51, 0.3)",
                          mx: "auto",
                          mb: 2,
                        }}
                      >
                        <Person sx={{ fontSize: 40, color: "#fff" }} />
                      </Avatar>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 800,
                          color: "#f8fafc",
                          mb: 0.5,
                        }}
                      >
                        {data.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
                        {data.email}
                      </Typography>
                      
                      <Divider sx={{ mb: 3, borderColor: "rgba(255,255,255,0.05)" }} />
                      
                      <Stack spacing={1.5} alignItems="center">
                        <Chip
                          label={`Created: ${formatTS(data.createdAt)}`}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            borderRadius: 1.5,
                            background: "rgba(243, 168, 51,0.08)",
                            color: "#f3a833",
                            width: "100%",
                          }}
                        />
                        <Chip
                          label={`Updated: ${formatTS(data.updatedAt)}`}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            borderRadius: 1.5,
                            background: "rgba(255, 255, 255, 0.05)",
                            color: "#94a3b8",
                            width: "100%",
                          }}
                        />
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                      background: "linear-gradient(135deg, #111111 0%, #0a0a0a 100%)",
                      border: "1px solid rgba(243, 168, 51, 0.15)",
                      borderRadius: 4,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                    }}
                  >
                    <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#94a3b8", mb: 0.5 }}>
                          Total Proposals
                        </Typography>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 800,
                            background: colorScheme.gradient,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          {data.totalProposals}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                          background: "rgba(243, 168, 51, 0.1)",
                        }}
                      >
                        <DescriptionIcon sx={{ fontSize: 32, color: "#f3a833" }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>

              {/* Right Column: Proposals */}
              <Grid item xs={12} md={8}>
                <Card
                  component={motion.div}
                  variants={itemVariants}
                  sx={{
                    background: "#0a0a0a",
                    border: "1px solid rgba(243, 168, 51, 0.2)",
                    borderRadius: 4,
                    boxShadow: "0 4px 20px rgba(243, 168, 51, 0.1)",
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography variant="h5" fontWeight="700" sx={{ color: "#f3a833" }}>
                    Proposals by {data.name}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    mb: 4,
                    p: 3,
                    borderRadius: 4,
                    background: "rgba(0, 0, 0, 0.2)",
                    border: "1px solid rgba(243, 168, 51, 0.2)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", md: "center" },
                      gap: 2,
                      mb: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, color: "#f8fafc" }}>
                      Filters
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<FilterAltOffIcon />}
                      disabled={!hasActiveFilters}
                      onClick={handleClearFilters}
                      sx={{
                        borderRadius: 3,
                        textTransform: "none",
                        fontWeight: 700,
                        borderColor: alpha(colorScheme.primary, 0.35),
                        color: colorScheme.primary,
                        background: "#141414",
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
                              "& .MuiInputBase-root": {
                                background: "#141414",
                                borderRadius: 2,
                                color: "#fff",
                              },
                              "& .MuiInputLabel-root": { color: "#94a3b8" },
                              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(243, 168, 51, 0.2)" },
                              "& .MuiIconButton-root": { color: "#94a3b8" },
                              "& .MuiSvgIcon-root": { color: "#94a3b8" },
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Box>
                </Box>

                {loadingProposals ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                  </Box>
                ) : proposals.length === 0 ? (
                  <Typography
                    variant="body1"
                    sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}
                  >
                    No proposals found.
                  </Typography>
                ) : (
                  <>
                    <TableContainer sx={{ overflowX: "auto" }}>
                      <Table sx={{ minWidth: 800 }}>
                        <TableHead>
                          <TableRow sx={{ background: "rgba(243, 168, 51, 0.08)" }}>
                            {["Title", "Client", "Client Email", "Date", "Actions"].map((h) => (
                              <TableCell key={h} sx={{ fontWeight: "700", color: "#f8fafc" }}>
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
                                sx={{
                                  "&:hover": { bgcolor: "rgba(243, 168, 51, 0.1) !important" },
                                }}
                              >
                                <TableCell sx={{ color: "#f8fafc", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                  <Typography fontWeight={600}>{proposal.projectTitle}</Typography>
                                </TableCell>
                                <TableCell sx={{ color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{proposal.clientName}</TableCell>
                                <TableCell sx={{ color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{proposal.clientEmail}</TableCell>
                                <TableCell sx={{ color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                  {proposal.createdAt ? dayjs(proposal.createdAt).format("MMM D, YYYY") : "N/A"}
                                </TableCell>
                                <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                  <Stack direction="row" spacing={1}>
                                    <Tooltip title="View">
                                      <IconButton onClick={() => handleViewProposal(proposal._id)} size="small">
                                        <VisibilityIcon fontSize="small" sx={{ color: colorScheme.primary }} />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Download">
                                      <IconButton onClick={() => handleDownload(proposal._id)} size="small">
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
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mt: 3,
                        }}
                      >
                        <Pagination
                          count={totalPages}
                          page={page}
                          onChange={(e, v) => setPage(v)}
                          color="primary"
                        />
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

export default BDODetails;
