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
} from "@mui/material";
import {
  Person,
  ArrowBack,
  Edit,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "../../utils/axiosInstance";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const BDODetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Proposals State
  const [proposals, setProposals] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingProposals, setLoadingProposals] = useState(false);

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

  const statusConfig = {
    Interested: {
      color: "success",
      icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
      bgColor: alpha("#4caf50", 0.1),
      textColor: "#4caf50",
    },
    "No Fit": {
      color: "error",
      icon: <DeleteIcon sx={{ fontSize: 16 }} />,
      bgColor: alpha("#f44336", 0.1),
      textColor: "#ef5350",
    },
    Flaked: {
      color: "warning",
      icon: <PendingIcon sx={{ fontSize: 16 }} />,
      bgColor: alpha("#ff9800", 0.1),
      textColor: "#ffb74d",
    },
    "Follow-up": {
      color: "info",
      icon: <PendingIcon sx={{ fontSize: 16 }} />,
      bgColor: alpha("#2196f3", 0.1),
      textColor: "#64b5f6",
    },
  };

  const fetchProposals = async (pageNumber = 1) => {
    try {
      setLoadingProposals(true);
      const res = await axiosInstance.get(`/api/proposals/get-all-proposals`, {
        params: {
          page: pageNumber,
          limit: 5,
          createdBy: id,
        },
      });
      setProposals(res.data.proposals || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setProposals([]);
    } finally {
      setLoadingProposals(false);
    }
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
  }, [page]);

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
        alert("PDF not found.");
        return;
      }
      window.open(pdfPath, "_blank", "noopener,noreferrer");
    } catch {
      alert("Failed to open PDF.");
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
      <Container maxWidth="md">
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
              borderColor: "#f3a833",
              color: "#f3a833",
              "&:hover": {
                borderColor: "#eab308",
                color: "#eab308",
                background: "rgba(243, 168, 51,0.06)",
              },
            }}
          >
            Back
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
        <Paper
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 720,
            mx: "auto",
            p: { xs: 4, sm: 5, md: 6 },
            borderRadius: 5,
            textAlign: "center",
            background: "rgba(20, 20, 20, 0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(243, 168, 51, 0.2)",
            boxShadow: "0 20px 60px rgba(243, 168, 51,0.1)",
            transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
            position: "relative",
            overflow: "hidden",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 30px 80px rgba(243, 168, 51,0.2)",
              borderColor: "rgba(243, 168, 51,0.3)",
            },
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              background: colorScheme.gradient,
            },
          }}
        >
          {loading ? (
            <Box component={motion.div} variants={itemVariants} initial="hidden" animate="visible" sx={{ py: 10 }}>
              <CircularProgress size={56} sx={{ color: colorScheme.primary }} />
            </Box>
          ) : !data ? (
            <Box component={motion.div} variants={itemVariants} initial="hidden" animate="visible" sx={{ py: 10 }}>
              <Typography variant="h6" sx={{ color: "#94a3b8" }}>
                BDO not found
              </Typography>
            </Box>
          ) : (
            <>
              <Box
                component={motion.div}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    background: colorScheme.gradient,
                    boxShadow: "0 12px 28px rgba(0,0,0,0.8)",
                  }}
                >
                  <Person sx={{ fontSize: 42, color: "#fff" }} />
                </Avatar>
              </Box>

              <motion.div variants={itemVariants} initial="hidden" animate="visible">
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    background: colorScheme.gradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "-0.5px",
                    mb: 1,
                  }}
                >
                  {data.name}
                </Typography>
              </motion.div>
              <motion.div variants={itemVariants} initial="hidden" animate="visible">
                <Typography variant="body1" sx={{ color: "#94a3b8", mb: 3 }}>
                  {data.email}
                </Typography>
              </motion.div>

              <Divider sx={{ mb: 4, borderColor: "rgba(243, 168, 51,0.15)" }} />

              <motion.div variants={itemVariants} initial="hidden" animate="visible">
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  justifyContent="center"
                  alignItems="center"
                  sx={{ mb: 3 }}
                >
                <Chip
                  label={`Created: ${formatTS(data.createdAt)}`}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    background: "rgba(243, 168, 51,0.1)",
                    color: "#f3a833",
                  }}
                />
                <Chip
                  label={`Updated: ${formatTS(data.updatedAt)}`}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    background: "rgba(245, 158, 11,0.1)",
                    color: "#f59e0b",
                  }}
                />
              </Stack>
              </motion.div>

              <motion.div variants={itemVariants} initial="hidden" animate="visible">
                <Box
                  sx={{
                    mt: 2,
                    p: 3,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #1a1a1a 0%, #111111 100%)",
                    border: "1px solid rgba(243, 168, 51, 0.15)",
                  }}
                >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
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
              </motion.div>

              <motion.div variants={itemVariants} initial="hidden" animate="visible">
                <Box
                  sx={{
                    mt: 4,
                    p: { xs: 2.5, sm: 4 },
                    borderRadius: 4,
                    background: "#0a0a0a",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                    border: "1px solid rgba(243, 168, 51, 0.2)",
                    textAlign: "left",
                  }}
                >
                <Typography variant="h5" fontWeight="700" sx={{ mb: 3, color: "#f3a833" }}>
                  Proposals by {data.name}
                </Typography>

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
                      <Table>
                        <TableHead>
                          <TableRow
                            sx={{ background: "rgba(243, 168, 51, 0.08)" }}
                          >
                            {["Title", "Client", "Date", "Status", "Actions"].map(
                              (h) => (
                                <TableCell
                                  key={h}
                                  sx={{ fontWeight: "700", color: "#f8fafc" }}
                                >
                                  {h}
                                </TableCell>
                              )
                            )}
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
                                  "&:hover": {
                                    bgcolor: "rgba(243, 168, 51, 0.1) !important",
                                  },
                                }}
                              >
                              <TableCell sx={{ color: "#f8fafc", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <Typography fontWeight={600}>
                                  {proposal.projectTitle}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{proposal.clientName}</TableCell>
                              <TableCell sx={{ color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{proposal.date}</TableCell>
                              <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <Chip
                                  icon={statusConfig[proposal.callOutcome]?.icon}
                                  label={proposal.callOutcome}
                                  size="small"
                                  sx={{
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    background:
                                      statusConfig[proposal.callOutcome]?.bgColor,
                                    color:
                                      statusConfig[proposal.callOutcome]
                                        ?.textColor,
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <Stack direction="row" spacing={1}>
                                  <Tooltip title="View">
                                    <IconButton
                                      onClick={() =>
                                        handleViewProposal(proposal._id)
                                      }
                                      size="small"
                                    >
                                      <VisibilityIcon
                                        fontSize="small"
                                        color="primary"
                                      />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Download">
                                    <IconButton
                                      onClick={() => handleDownload(proposal._id)}
                                      size="small"
                                    >
                                      <DownloadIcon
                                        fontSize="small"
                                        color="success"
                                      />
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
              </Box>
              </motion.div>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default BDODetails;
