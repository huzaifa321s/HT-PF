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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
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

  const handleView = (id) => {
    setOpen(true);
    setProposalID(id);
  };

  const handleDownload = async (id, clientName) => {
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_APP_BASE_URL}/api/proposals/get-single-proposal/${id}`
      );
      const pdfPath = res.data.data.pdfPath;
      if (!pdfPath) {
        alert("PDF not found.");
        return;
      }
      const pdfUrl = `${import.meta.env.VITE_APP_BASE_URL}/${pdfPath}`;
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

  const statusColor = (status) => {
    switch (status) {
      case "Approved": return "success";
      case "Pending Review": return "warning";
      case "Draft": return "default";
      default: return "primary";
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

  return (
    <Box sx={{ backgroundColor: "#f8fafc", minHeight: "100vh", py: 8, px: { xs: 2, sm: 3, md: 4 } }}>
      <ViewProposalModal open={open} id={proposalID} handleClose={() => setOpen(false)} />
      <DeleteConfirmModal
        open={deleteModalOpen}
        handleClose={() => setDeleteModalOpen(false)}
        id={proposalID}
        setProposals={setProposals}
        length={length}
        fetchProposals={() => fetchProposals(page)}
      />

      <Box sx={{ maxWidth: 1500, mx: "auto" }}>
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          All Proposals
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          View and manage proposals from all team members.
        </Typography>

        <Paper elevation={6} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, bgcolor: "#fff" }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Team Proposal List
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress size={50} />
            </Box>
          ) : proposals.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <Typography variant="h5" color="text.secondary">
                No Proposals Found
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f7fa" }}>
                      {["Title", "Client", "Agent", "Platform", "Date", "Status", "Actions"].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: "bold", py: 2.5 }} align={h === "Actions" ? "center" : "left"}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {proposals.map((p) => (
                      <TableRow key={p._id} hover sx={{ "&:hover": { bgcolor: "#f9fbfd" } }}>
                        
                        <TableCell><Typography fontWeight={500}>{p.projectTitle}</Typography></TableCell>
                        <TableCell>{p.clientName}</TableCell>
                        <TableCell>
                          <Chip label={p.createdBy?.name || "--"} color="secondary" size="small" />
                        </TableCell>
                        <TableCell>
                          {p.developmentPlatforms?.length > 0 ? (
                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                              {p.developmentPlatforms.map((plat, i) => (
                                <Chip key={i} label={plat} size="small" color="primary" variant="outlined" />
                              ))}
                            </Stack>
                          ) : "—"}
                        </TableCell>
                        <TableCell>{p.date}</TableCell>
                        <TableCell>
                          <Chip label={p.status} color={statusColor(p.status)} size="small" sx={{ fontWeight: 600 }} />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View"><IconButton onClick={() => handleView(p._id)}><VisibilityIcon /></IconButton></Tooltip>
                          <Tooltip title="Download PDF"><IconButton onClick={() => handleDownload(p._id, p.clientName)} color="success"><DownloadIcon /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton onClick={() => handleDelete(p._id, proposals.length)} color="error"><DeleteIcon /></IconButton></Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" size="large" showFirstButton showLastButton />
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminProposalsPage;