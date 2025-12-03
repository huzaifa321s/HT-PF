// src/pages/AdminProposalsPage.jsx
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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AssignmentIcon from "@mui/icons-material/Assignment";
import axiosInstance from "../utils/axiosInstance";
import ViewProposalModal from "../components/modals/ViewProposalModal";
import DeleteConfirmModal from "../components/modals/DeleteConfirmModal";
import { useNavigate } from "react-router";

const AdminProposalsPage = () => {
  const [proposals, setProposals] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [proposalID, setProposalID] = useState(null);
  const [length, setLength] = useState(0);
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
 const [totalCount,setTotalCount] = useState(0)
  // ✅ Same color scheme as EditProposal
  const colorScheme = {
    primary: "#667eea",
    secondary: "#764ba2",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    hoverGradient: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
    lightBg: "linear-gradient(135deg, #f5f7ff 0%, #f0f2ff 100%)",
  };

  const handleView = (id) => {
    setOpen(true);
    setProposalID(id);
  };

  const handleNavigate = (id) => {
    navigate(`/edit-proposal/${id}`);
  };

  const handleDownload = async (id, clientName) => {
    try {
      const res = await axiosInstance.get(
        `/api/proposals/get-single-proposal/${id}`
      );
      const pdfPath = res.data.data.pdfPath;
      if (!pdfPath) {
        alert("PDF not found.");
        return;
      }
      const pdfUrl = pdfPath;
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      alert("Failed to open PDF.");
    }
  };

  const handleDelete = (id, currentLength) => {
    setDeleteModalOpen(true);
    setLength(currentLength);
    setProposalID(id);
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
      setProposals([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals(page);
  }, [page]);

  const handlePageChange = (event, value) => setPage(value);

  // ✅ Status color mapping
  const getStatusColor = (outcome) => {
    const statusMap = {
      Interested: { color: "success", bg: "#e8f5e9" },
      "No Fit": { color: "error", bg: "#ffebee" },
      Flaked: { color: "warning", bg: "#fff3e0" },
      "Follow-up": { color: "info", bg: "#e3f2fd" },
    };
    return statusMap[outcome] || { color: "default", bg: "#f5f5f5" };
  };

  return (
    <Box
      sx={{
        bgcolor: "#f5f7fa",
        minHeight: "100vh",
        py: 6,
        width: "100vw",
        position: "relative",
        left: "50%",
        right: "50%",
        ml: "-50vw",
        mr: "-50vw",
      }}
    >
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
        fetchProposals={() => fetchProposals(page)}
      />

      <Box sx={{ maxWidth: 1600, mx: "auto", px: { xs: 2, md: 4 } }}>
        {/* ✅ Enhanced Header with Gradient */}
        <Fade in timeout={600}>
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  mr: 2,
                  background: colorScheme.gradient,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AssignmentIcon sx={{ fontSize: 28, color: "#fff" }} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: colorScheme.gradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.5px",
                }}
              >
                All Proposals
              </Typography>
            </Box>
            <Typography
              variant="subtitle1"
              sx={{
                color: "text.secondary",
                fontSize: "1.05rem",
                pl: 7,
              }}
            >
              View and manage proposals from all team members
            </Typography>
          </Box>
        </Fade>

        {/* ✅ Enhanced Stats Cards (Optional) */}
        <Fade in timeout={800}>
          <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
            <Card
              sx={{
                flex: 1,
                minWidth: 200,
                background: colorScheme.lightBg,
                border: "2px solid #e0e7ff",
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.1)",
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight={700} color={colorScheme.primary}>
                  {totalCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Proposals
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Fade>

        {/* ✅ Main Table Card */}
        <Zoom in timeout={600}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              background: colorScheme.lightBg,
              border: "2px solid #e0e7ff",
              boxShadow: "0 8px 32px rgba(102, 126, 234, 0.12)",
            }}
          >
            <Box
              sx={{
                p: 3,
                background: colorScheme.gradient,
                color: "#fff",
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                Team Proposal List
              </Typography>
            </Box>

            <Box sx={{ p: 3, bgcolor: "#fff" }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                  <CircularProgress size={50} sx={{ color: colorScheme.primary }} />
                </Box>
              ) : proposals.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 10 }}>
                  <AssignmentIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h5" color="text.secondary" fontWeight={600}>
                    No Proposals Found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Create your first proposal to get started
                  </Typography>
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow
                          sx={{
                            background: alpha(colorScheme.primary, 0.08),
                            "& th": {
                              fontWeight: 700,
                              color: colorScheme.primary,
                              fontSize: "0.95rem",
                              py: 2.5,
                            },
                          }}
                        >
                          <TableCell>Project</TableCell>
                          <TableCell>Client</TableCell>
                          <TableCell>Created By</TableCell>
                          <TableCell>Platforms</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {proposals.map((p, index) => (
                          <TableRow
                            key={p._id}
                            sx={{
                              transition: "all 0.3s ease",
                              "&:hover": {
                                bgcolor: alpha(colorScheme.primary, 0.04),
                                transform: "scale(1.002)",
                              },
                              animation: `fadeIn 0.4s ease ${index * 0.1}s both`,
                              "@keyframes fadeIn": {
                                from: { opacity: 0, transform: "translateY(10px)" },
                                to: { opacity: 1, transform: "translateY(0)" },
                              },
                            }}
                          >
                            {/* Project Title */}
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                
                                  
                                
                                <Box>
                                  <Typography fontWeight={600} fontSize="0.95rem">
                                    {p.projectTitle}
                                  </Typography>
                                  {p.brandName && (
                                    <Typography variant="caption" color="text.secondary">
                                      {p.brandName}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>

                            {/* Client */}
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <BusinessIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                <Typography fontSize="0.9rem">{p.clientName}</Typography>
                              </Box>
                            </TableCell>

                            {/* Created By */}
                            <TableCell>
                              <Chip
                                avatar={
                                  <Avatar
                                    sx={{
                                      bgcolor: p.createdBy?._id === user?.id ? colorScheme.primary : colorScheme.secondary,
                                      width: 24,
                                      height: 24,
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    {p.createdBy?.name?.charAt(0)?.toUpperCase() || "?"}
                                  </Avatar>
                                }
                                label={p.createdBy?._id === user?.id ? "You" : p.createdBy?.name || "Unknown"}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  bgcolor: p.createdBy?._id === user?.id
                                    ? alpha(colorScheme.primary, 0.1)
                                    : alpha(colorScheme.secondary, 0.1),
                                  color: p.createdBy?._id === user?.id ? colorScheme.primary : colorScheme.secondary,
                                }}
                              />
                            </TableCell>

                            {/* Platforms */}
                            <TableCell>
                              {p.developmentPlatforms?.length > 0 ? (
                                <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                                  {p.developmentPlatforms.map((plat, i) => (
                                    <Chip
                                      key={i}
                                      label={plat}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        borderColor: colorScheme.primary,
                                        color: colorScheme.primary,
                                        fontWeight: 500,
                                        fontSize: "0.75rem",
                                      }}
                                    />
                                  ))}
                                </Stack>
                              ) : (
                                <Typography variant="body2" color="text.disabled">
                                  —
                                </Typography>
                              )}
                            </TableCell>

                            {/* Date */}
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <CalendarTodayIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                                <Typography fontSize="0.85rem" color="text.secondary">
                                  {p.date}
                                </Typography>
                              </Box>
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                              <Chip
                                label={p.callOutcome}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  bgcolor: getStatusColor(p.callOutcome).bg,
                                  color: getStatusColor(p.callOutcome).color === "success" ? "#2e7d32" :
                                         getStatusColor(p.callOutcome).color === "error" ? "#d32f2f" :
                                         getStatusColor(p.callOutcome).color === "warning" ? "#ed6c02" : "#0288d1",
                                  border: "none",
                                }}
                              />
                            </TableCell>

                            {/* Actions */}
                            <TableCell align="center">
                              <Stack direction="row" spacing={0.5} justifyContent="center">
                                <Tooltip title="View Details" arrow>
                                  <IconButton
                                    onClick={() => handleView(p._id)}
                                    size="small"
                                    sx={{
                                      color: colorScheme.primary,
                                      "&:hover": { bgcolor: alpha(colorScheme.primary, 0.1) },
                                    }}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Edit Proposal" arrow>
                                  <IconButton
                                    onClick={() => handleNavigate(p._id)}
                                    size="small"
                                    sx={{
                                      color: "#2e7d32",
                                      "&:hover": { bgcolor: alpha("#2e7d32", 0.1) },
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Download PDF" arrow>
                                  <IconButton
                                    onClick={() => handleDownload(p._id, p.clientName)}
                                    size="small"
                                    sx={{
                                      color: "#0288d1",
                                      "&:hover": { bgcolor: alpha("#0288d1", 0.1) },
                                    }}
                                  >
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Delete" arrow>
                                  <IconButton
                                    onClick={() => handleDelete(p._id, proposals.length)}
                                    size="small"
                                    sx={{
                                      color: "#d32f2f",
                                      "&:hover": { bgcolor: alpha("#d32f2f", 0.1) },
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* ✅ Enhanced Pagination */}
                  {totalPages > 1 && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
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
                            "&.Mui-selected": {
                              background: colorScheme.gradient,
                              color: "#fff",
                              "&:hover": {
                                background: colorScheme.hoverGradient,
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Paper>
        </Zoom>
      </Box>
    </Box>
  );
};

export default AdminProposalsPage;