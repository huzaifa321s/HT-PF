// src/pages/ProposalPage.jsx
import React, { useEffect, useState } from "react";
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
} from "@mui/material";
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
import ViewProposalModal from "../components/modals/ViewProposalModal";
import DeleteConfirmModal from "../components/modals/DeleteConfirmModal";
import { useNavigate } from "react-router";
import axiosInstance from "../utils/axiosInstance";

const ProposalPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [proposals, setProposals] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [proposalID, setProposalID] = useState(null);
  const [length, setLength] = useState(0);
 const [totalCount,setTotalCount] = useState(0);
  const handleView = (id) => {
    setOpen(true);
    setProposalID(id);
  };

  const handleEdit = (id) => navigate(`/edit-proposal/${id}`);

  const handleDownload = async (id) => {
    try {
      const res = await axiosInstance.get(
        `/api/proposals/get-single-proposal/${id}`
      );
      const pdfPath = res.data.data.pdfPath;
      if (!pdfPath) {
        alert("PDF not found for this proposal.");
        return;
      }
      const pdfUrl = `${import.meta.env.VITE_APP_BASE_URL}/${pdfPath}`;
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error opening PDF:", error);
      alert("Failed to open PDF. Please try again.");
    }
  };

  const handleDelete = (id, currentLength) => {
    setDeleteModalOpen(true);
    setLength(currentLength);
    setProposalID(id);
  };

  const statusConfig = {
    'Approved': {
      color: 'success',
      icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
      bgColor: alpha('#4caf50', 0.1),
      textColor: '#2e7d32',
    },
    'Pending Review': {
      color: 'warning',
      icon: <PendingIcon sx={{ fontSize: 16 }} />,
      bgColor: alpha('#ff9800', 0.1),
      textColor: '#e65100',
    },
    'Draft': {
      color: 'default',
      icon: <DraftsIcon sx={{ fontSize: 16 }} />,
      bgColor: alpha('#757575', 0.1),
      textColor: '#424242',
    },
  };

  const fetchProposals = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/api/proposals/get-all-proposals?page=${pageNumber}&limit=5`
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
  };

  useEffect(() => {
    fetchProposals(page);
  }, [page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const statsCards = [
    {
      title: 'Total Proposals',
      value: totalCount,
      icon: <DescriptionIcon />,
      color: '#667eea',
      bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
  ];

  return (
    <Box
      sx={{
        background: "linear-gradient(180deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
        py: 6,
        px: { xs: 2, sm: 3, md: 4 },
        width: "100vw",
        position: "relative",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
      }}
    >
      {/* Modals */}
      <ViewProposalModal
        open={open}
        id={proposalID}
        handleClose={() => setOpen(false)}
      />
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
          <Box sx={{ mb: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  mr: 2,
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                }}
              >
                <AssessmentIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h3"
                  fontWeight="800"
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: '-0.5px',
                  }}
                >
                  Your Proposals
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                  Manage and track all your business proposals
                </Typography>
              </Box>
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
                      boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
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
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: 5,
              background: "#fff",
              boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
              border: '1px solid rgba(102, 126, 234, 0.1)',
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
                onClick={() => navigate("/create-proposal")}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: '1rem',
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 12px 32px rgba(102,126,234,0.3)",
                  transition: 'all 0.3s ease',
                  "&:hover": {
                    background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                    transform: 'translateY(-2px)',
                    boxShadow: "0 16px 40px rgba(102,126,234,0.4)",
                  },
                }}
              >
                Create New Proposal
              </Button>
            </Box>

            <Divider sx={{ mb: 4, borderColor: "rgba(102,126,234,0.15)" }} />

            {/* Loading */}
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
                <CircularProgress
                  size={60}
                  thickness={4}
                  sx={{ color: "#667eea" }}
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
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                  onClick={() => navigate("/create-proposal")}
                  sx={{
                    px: 6,
                    py: 2,
                    borderRadius: 3,
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: '1.1rem',
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 12px 32px rgba(102,126,234,0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                    },
                  }}
                >
                  Create Your First Proposal
                </Button>
              </Box>
            ) : (
              <>
                {/* Table */}
                <TableContainer sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: "linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)" }}>
                        {["Title", "Client", "Platform", "Date", "Status", "Actions"].map(
                          (header) => (
                            <TableCell
                              key={header}
                              sx={{
                                fontWeight: "700",
                                fontSize: "0.95rem",
                                py: 3,
                                color: "#333",
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
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
                      {proposals.map((proposal, index) => (
                        <TableRow
                          key={proposal._id}
                          hover
                          sx={{
                            "&:hover": { 
                              bgcolor: "rgba(102,126,234,0.04)",
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
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  fontSize: '0.9rem',
                                  fontWeight: 700,
                                }}
                              >
                                {proposal.projectTitle.charAt(0)}
                              </Avatar>
                              <Typography fontWeight={600} sx={{ fontSize: '0.95rem' }}>
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
                            {proposal.developmentPlatforms?.length > 0 ? (
                              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                {proposal.developmentPlatforms.map((plat, i) => (
                                  <Chip
                                    key={i}
                                    label={plat}
                                    size="small"
                                    sx={{
                                      borderRadius: 2,
                                      fontWeight: 600,
                                      fontSize: '0.75rem',
                                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                      border: '1px solid rgba(102, 126, 234, 0.3)',
                                      color: '#667eea',
                                    }}
                                  />
                                ))}
                              </Stack>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
                              {proposal.date}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={statusConfig[proposal.callOutcome]?.icon}
                              label={proposal.callOutcome}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                borderRadius: 2,
                                px: 1,
                                background: statusConfig[proposal.callOutcome]?.bgColor,
                                color: statusConfig[proposal.callOutcome]?.textColor,
                                border: 'none',
                              }}
                            />
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
                                    bgcolor: alpha('#667eea', 0.1),
                                    '&:hover': { bgcolor: alpha('#667eea', 0.2) },
                                  }}
                                >
                                  <EditIcon sx={{ color: "#667eea", fontSize: 20 }} />
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
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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