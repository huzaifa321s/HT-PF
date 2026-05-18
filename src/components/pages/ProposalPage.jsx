"use client";
// src/pages/ProposalPage.jsx
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
  Card,
  CardContent,
  Avatar,
  Fade,
  Zoom,
  alpha,
  Grid,
  useMediaQuery,
  useTheme,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  InputAdornment,
} from "@mui/material";
import { motion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import DraftsIcon from "@mui/icons-material/Drafts";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { useDebounce } from "use-debounce";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useDispatch } from "react-redux";
import { showToast } from "@/utils/toastSlice";
import dayjs from "dayjs";

const ProposalPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const dispatch = useDispatch();

  const [proposals, setProposals] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [proposalID, setProposalID] = useState(null);
  const [length, setLength] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [dateFilter, setDateFilter] = useState("");
  const hasActiveFilters = Boolean(searchTerm.trim() || dateFilter);
  const handleView = (id) => {
    router.push(`/admin/proposals/${id}`);
  };

  const handleEdit = (id) => router.push(`/edit-proposal/${id}`);

  const handleDownload = async (id) => {
    try {
      const res = await axiosInstance.get(
        `/api/proposals/get-single-proposal/${id}`
      );
      const pdfPath = res.data.data.pdfPath;
      if (!pdfPath) {
        dispatch(showToast({ message: "PDF not found for this proposal.", severity: "error" }));
        return;
      }
      
      // Force Vercel Blob to serve as an attachment to bypass popup blockers
      const downloadUrl = pdfPath.includes("?") ? `${pdfPath}&download=1` : `${pdfPath}?download=1`;
      
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", ""); // Suggest download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error opening PDF:", error);
      dispatch(showToast({ message: "Failed to open PDF. Please try again.", severity: "error" }));
    }
  };

  const handleDelete = (id, currentLength) => {
    setDeleteModalOpen(true);
    setLength(currentLength);
    setProposalID(id);
  };



  const fetchProposals = useCallback(async (pageNumber = 1, filtersOverride) => {
    try {
      setLoading(true);
      const params = {
        page: pageNumber,
        limit: 5,
        search: filtersOverride?.search ?? debouncedSearchTerm,
        date: filtersOverride?.date ?? dateFilter,
      };
      const res = await axiosInstance.get(
        `/api/proposals/get-all-proposals`, {
        params
      }
      );
      setProposals(res.data.proposals || []);
      setTotalPages(res.data.totalPages || 1);
      setLength(res.data.proposals?.length || 0);
      setTotalCount(res.data.totalCount)
    } catch (error) {
      console.error("Error fetching proposals:", error);
      setProposals([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, dateFilter]);

  useEffect(() => {
    fetchProposals(page);
  }, [page, fetchProposals]);

  const handleClearFilters = () => {
    setPage(1);
    setSearchTerm("");
    setDateFilter("");
    fetchProposals(1, { search: "", date: "" });
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const statsCards = [
    {
      title: 'Total Proposals',
      value: totalCount,
      icon: <DescriptionIcon />,
      color: '#f3a833',
      bgGradient: 'linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)',
    },
  ];

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{
        minHeight: "100%",
        py: { xs: 2, md: 4 },
        width: "100%",
        position: "relative",
      }}
    >
      {/* Modals */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        handleClose={() => setDeleteModalOpen(false)}
        id={proposalID}
        setProposals={setProposals}
        length={length}
        fetchProposals={fetchProposals}
      />

      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        {/* Header Section */}
        <Fade in timeout={800}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              mb: 5,
              gap: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
                borderRadius: "50%",
                width: { xs: 56, md: 72 },
                height: { xs: 56, md: 72 },
                boxShadow: "0 8px 24px rgba(243, 168, 51, 0.4)",
              }}
            >
              <AssessmentIcon sx={{ fontSize: { xs: 28, md: 36 }, color: "#fff" }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.5px",
                  fontSize: { xs: "1.75rem", md: "2.25rem" },
                }}
              >
                Your Proposals
              </Typography>
              <Typography variant="body1" sx={{ color: "#94a3b8", mt: 1, fontSize: "1.1rem" }}>
                Manage and track all your business proposals
              </Typography>
            </Box>
          </Box>
        </Fade>

        {/* Stats Cards */}
        <Fade in timeout={1000}>
          <Grid container spacing={3} sx={{ mb: 5 }}>
            {statsCards.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Zoom in timeout={600 + index * 100}>
                  <Card
                    sx={{
                      background: stat.bgGradient,
                      color: 'white',
                      borderRadius: 4,
                      boxShadow: '0 12px 28px rgba(0,0,0,0.8)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontWeight: 600 }}>
                            {stat.title}
                          </Typography>
                          <Typography variant="h3" fontWeight="800">
                            {stat.value}
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                            width: 56,
                            height: 56,
                          }}
                        >
                          {stat.icon}
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Fade>

        {/* Main Content */}
        <Fade in timeout={1200}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              background: "rgba(20, 20, 20, 0.8)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
              border: '1px solid rgba(243, 168, 51, 0.2)',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight="700" sx={{ mb: 0.5 }}>
                  All Proposals
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {proposals.length} total proposals found
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push("/create-proposal")}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: '1rem',
                  background: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
                  boxShadow: "0 12px 32px rgba(243, 168, 51,0.3)",
                  transition: 'all 0.3s ease',
                  "&:hover": {
                    background: "linear-gradient(135deg, #eab308 0%, #d97706 100%)",
                    transform: 'translateY(-2px)',
                    boxShadow: "0 16px 40px rgba(243, 168, 51,0.4)",
                  },
                }}
              >
                Create New Proposal
              </Button>
            </Box>

            <Box
              sx={{
                mb: 4,
                p: 3,
                borderRadius: 4,
                background: "rgba(245, 247, 255, 0.6)",
                border: "1px solid rgba(243, 168, 51, 0.2)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
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
                    borderColor: alpha("#f3a833", 0.35),
                    color: "#f3a833",
                    background: "#141414",
                    "&:hover": {
                      borderColor: "#f3a833",
                      background: alpha("#f3a833", 0.06),
                    },
                  }}
                >
                  Clear All Filters
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
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#111" }} />
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
                      setDateFilter(
                        newValue ? newValue.format("YYYY-MM-DD") : ""
                      );
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
                          },
                          "& .MuiIconButton-root": { color: "#000" },
                          "& .MuiSvgIcon-root": { color: "#000" },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </Box>

            <Divider sx={{ mb: 4, borderColor: "rgba(243, 168, 51,0.15)" }} />

            {/* Loading */}
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
                <CircularProgress
                  size={60}
                  thickness={4}
                  sx={{ color: "#f3a833" }}
                />
              </Box>
            ) : proposals.length === 0 ? (
              /* Empty State */
              <Box sx={{ textAlign: "center", py: 12, px: 4 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 3,
                    background: 'linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)',
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: 64 }} />
                </Avatar>
                <Typography
                  variant="h5"
                  color="text.primary"
                  gutterBottom
                  fontWeight={700}
                >
                  No Proposals Found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                  Start creating professional proposals for your clients and track them all in one place.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => router.push("/create-proposal")}
                  sx={{
                    px: 6,
                    py: 2,
                    borderRadius: 3,
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: '1.1rem',
                    background: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
                    boxShadow: "0 12px 32px rgba(243, 168, 51,0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #eab308 0%, #d97706 100%)",
                    },
                  }}
                >
                  Create Your First Proposal
                </Button>
              </Box>
            ) : (
              <>
                {/* Table */}
                <TableContainer
                  sx={{
                    borderRadius: 3,
                    overflowX: 'auto',
                    "&::-webkit-scrollbar": { height: 6 },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "rgba(243, 168, 51,0.2)",
                      borderRadius: 10,
                    },
                  }}
                >
                  <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                      <TableRow sx={{ background: "linear-gradient(135deg, rgba(243, 168, 51, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)" }}>
                        {["Title", "Client", "Client Email", "Date", "Actions"].map(
                          (header) => (
                            <TableCell
                              key={header}
                              sx={{
                                fontWeight: "700",
                                fontSize: "0.95rem",
                                py: 3,
                                color: "#f8fafc",
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                minWidth: header === "Title" ? 200 : header === "Actions" ? 220 : 120,
                              }}
                              align={header === "Actions" ? "center" : "left"}
                            >
                              {header}
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {proposals.map((proposal) => (
                        <TableRow
                          key={proposal._id}
                          hover
                          sx={{
                            "&:hover": {
                              bgcolor: "rgba(243, 168, 51,0.04)",
                              '& .action-buttons': {
                                opacity: 1,
                              },
                            },
                            transition: "all 0.2s ease",
                            borderBottom: '1px solid rgba(0,0,0,0.06)',
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              {!isMobile && <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  background: 'linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)',
                                  fontSize: '0.9rem',
                                  fontWeight: 700,
                                }}
                              >
                                {proposal.projectTitle.charAt(0)}
                              </Avatar>}
                              <Typography fontWeight={600} sx={{ fontSize: isMobile ? '0.75rem' : '0.95rem' }}>
                                {proposal.projectTitle}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>
                              {proposal.clientName}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>
                              {proposal.clientEmail}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
                              {proposal.createdAt ? dayjs(proposal.createdAt).format("MMM D, YYYY") : "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Stack
                              direction="row"
                              spacing={0.5}
                              justifyContent="center"
                              className="action-buttons"
                              sx={{
                                opacity: isMobile ? 1 : 0.7,
                                transition: 'opacity 0.2s ease',
                              }}
                            >
                              <Tooltip title="View Details" arrow>
                                <IconButton
                                  onClick={() => handleView(proposal._id)}
                                  sx={{
                                    bgcolor: alpha('#2196f3', 0.1),
                                    '&:hover': { bgcolor: alpha('#2196f3', 0.2) },
                                  }}
                                >
                                  <VisibilityIcon sx={{ color: '#2196f3', fontSize: 20 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit" arrow>
                                <IconButton
                                  onClick={() => handleEdit(proposal._id)}
                                  sx={{
                                    bgcolor: alpha('#f3a833', 0.1),
                                    '&:hover': { bgcolor: alpha('#f3a833', 0.2) },
                                  }}
                                >
                                  <EditIcon sx={{ color: "#f3a833", fontSize: 20 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download PDF" arrow>
                                <IconButton
                                  onClick={() => handleDownload(proposal._id)}
                                  sx={{
                                    bgcolor: alpha('#4caf50', 0.1),
                                    '&:hover': { bgcolor: alpha('#4caf50', 0.2) },
                                  }}
                                >
                                  <DownloadIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete" arrow>
                                <IconButton
                                  onClick={() => handleDelete(proposal._id, proposals.length)}
                                  sx={{
                                    bgcolor: alpha('#f44336', 0.1),
                                    '&:hover': { bgcolor: alpha('#f44336', 0.2) },
                                  }}
                                >
                                  <DeleteIcon sx={{ color: '#f44336', fontSize: 20 }} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
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
                      color="primary"
                      size="large"
                      showFirstButton
                      showLastButton
                      sx={{
                        "& .MuiPaginationItem-root": {
                          fontWeight: 600,
                          fontSize: '1rem',
                          borderRadius: 2,
                          "&.Mui-selected": {
                            background: 'linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)',
                            color: 'white',
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

export default ProposalPage;
