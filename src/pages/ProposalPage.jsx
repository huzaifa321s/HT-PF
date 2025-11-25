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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import ViewProposalModal from "../components/modals/ViewProposalModal";
import DeleteConfirmModal from "../components/modals/DeleteConfirmModal";
import { useNavigate } from "react-router";
import axiosInstance from "../utils/axiosInstance";

const ProposalPage = () => {
  const [proposals, setProposals] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [proposalID, setProposalID] = useState(null);
  const [length, setLength] = useState(0);
  const navigate = useNavigate();

  const handleView = (id) => {
    setOpen(true);
    setProposalID(id);
  };

  const handleEdit = (id) => navigate(`/edit-proposal/${id}`);

  const handleDownload = async (id) => {
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_APP_BASE_URL}/api/proposals/get-single-proposal/${id}`
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

  const statusColor = (status) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Pending Review":
        return "warning";
      case "Draft":
        return "default";
      default:
        return "primary";
    }
  };

  const fetchProposals = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_APP_BASE_URL}/api/proposals/get-all-proposals?page=${pageNumber}&limit=5`
      );
      setProposals(res.data.proposals || []);
      setTotalPages(res.data.totalPages || 1);
      setLength(res.data.proposals?.length || 0);
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

  return (
    <Box
      sx={{
        background: "linear-gradient(180deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
        py: 8,
        px: { xs: 2, sm: 3, md: 4 },
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
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          Your Proposals
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Manage, review, and track all proposals created by your team in one place.
        </Typography>

        <Paper
          elevation={12}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 5,
            background: "#fff",
            boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Proposal List
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/create-proposal")}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.4,
                fontWeight: 700,
                textTransform: "none",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 12px 32px rgba(102,126,234,0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                },
              }}
            >
              Create New Proposal
            </Button>
          </Box>

          <Divider sx={{ mb: 4, borderColor: "rgba(102,126,234,0.2)" }} />

          {/* Loading */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress
                size={50}
                thickness={4}
                sx={{ color: "#667eea" }}
              />
            </Box>
          ) : proposals.length === 0 ? (
            /* Empty State */
            <Box sx={{ textAlign: "center", py: 10, px: 4 }}>
              <Typography
                variant="h5"
                color="text.secondary"
                gutterBottom
                fontWeight={500}
              >
                No Proposals Found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                It looks like you haven't created any proposals yet. Start by creating your first one!
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate("/create-proposal")}
                sx={{
                  px: 5,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 600,
                  textTransform: "none",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: "rgba(102,126,234,0.05)" }}>
                      {["Title", "Client", "Platform", "Date", "Status", "Actions"].map(
                        (header) => (
                          <TableCell
                            key={header}
                            sx={{
                              fontWeight: "bold",
                              fontSize: "15px",
                              py: 2.5,
                              color: "#333",
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
                          "&:hover": { bgcolor: "rgba(102,126,234,0.1)" },
                          transition: "0.2s",
                        }}
                      >
                        <TableCell>
                          <Typography fontWeight={500}>{proposal.projectTitle}</Typography>
                        </TableCell>
                        <TableCell>{proposal.clientName}</TableCell>
                        <TableCell>
                          {proposal.developmentPlatforms?.length > 0 ? (
                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                              {proposal.developmentPlatforms.map((plat, i) => (
                                <Chip
                                  key={i}
                                  label={plat}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{
                                    borderColor: "#667eea",
                                    color: "#667eea",
                                  }}
                                />
                              ))}
                            </Stack>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>{proposal.date}</TableCell>
                        <TableCell>
                          <Chip
                            label={proposal.status}
                            color={statusColor(proposal.status)}
                            size="small"
                            sx={{
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton onClick={() => handleView(proposal._id)}>
                              <VisibilityIcon color="action" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleEdit(proposal._id)}>
                              <EditIcon sx={{ color: "#667eea" }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download PDF">
                            <IconButton
                              onClick={() => handleDownload(proposal._id)}
                              sx={{ color: "#4caf50" }}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => handleDelete(proposal._id, proposals.length)}
                              sx={{ color: "#f44336" }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
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
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default ProposalPage;
