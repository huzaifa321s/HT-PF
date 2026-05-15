"use client";
// src/pages/BDMRegisterPage.jsx
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
    Tooltip,
    Divider,
    CircularProgress,
    Button,
    TextField,
    Modal,
    Fade,
    Pagination,
    Stack,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
  } from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import axiosInstance from "../../utils/axiosInstance";
import { Group } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { showToast } from "../../utils/toastSlice";
import { usePathname, useRouter } from "next/navigation";
import VisibilityIcon from "@mui/icons-material/Visibility";

const BDMRegisterPage = () => {
  const [bdms, setBdms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [editId, setEditId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();
  // pagination state
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10); // you can adjust default page size
  const [sortBy, setSortBy] = useState("latest"); // latest, oldest, most-proposals

  const containerVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const listItemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: "easeOut",
      },
    },
  };

  const fetchBDMs = async (p = 1) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/api/bdms/get-all-bdms?page=${p}&limit=${limit}&sortBy=${sortBy}`
      );
      setBdms(res.data.bdms || []);
      setPage(res.data.page || p);
      setPages(res.data.pages || 1);
    } catch (error) {
      setBdms([]);
      console.error("Failed to fetch BDMs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBDMs(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || (!editId && !formData.password)) {
      setError("All fields are required.");
      return;
    }

    try {
      if (editId) {
        // Update BDM
        await axiosInstance.put(`/api/bdms/update-bdm/${editId}`, {
          name: formData.name,
          email: formData.email,
          ...(formData.password && { password: formData.password }),
        });
        dispatch(
          showToast({
            message: `BDM <b>${formData.name}</b> has been successfully updated.`,
            severity: "success",
          })
        );

        // after update, refetch current page
        fetchBDMs(page);
      } else {
        dispatch(
          showToast({
            message: `BDM <b>${formData.name}</b> has been registered.`,
            severity: "success",
          })
        );
        // Create new BDM -> after create go to first page (new item will be at top)
        await axiosInstance.post("/api/bdms/register-bdm", formData);
        fetchBDMs(1);
      }
      setFormData({ name: "", email: "", password: "" });
      setEditId(null);
      setError("");
    } catch (error) {
      dispatch(
        showToast({
          message: error.response?.data?.message || "Failed to save BDO.",
          severity: "error",
        })
      );
      setError(error.response?.data?.message || "Failed to save BDO.");
    }
  };

  const handleView = (id) => {
    router.push(`/admin/bdo/${id}`);
  };

  const handleEdit = (bdm) => {
    setEditId(bdm._id);
    setFormData({ name: bdm.name, email: bdm.email, password: "" });
    setError("");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.history.state?.editBdm) {
      handleEdit(window.history.state.editBdm);
      // Clear the state so it doesn't persist if we navigate away and back without intention
      window.history.replaceState({}, document.title);
    }
  }, []);

  const handleDelete = (id) => {
    setDeleteModalOpen(true);
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/api/bdms/delete-bdm/${deleteId}`);
      dispatch(
        showToast({
          message: `BDO has been deleted successfully.`,
          severity: "success",
        })
      );
      // after delete, refetch current page (if current page becomes empty and page>1, go to previous page)
      const newTotalOnPage = bdms.length - 1;
      if (newTotalOnPage === 0 && page > 1) {
        fetchBDMs(page - 1);
      } else {
        fetchBDMs(page);
      }
      setDeleteModalOpen(false);
      setDeleteId(null);
    } catch {
      setError("Failed to delete BDM.");
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({ name: "", email: "", password: "" });
    setError("");
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchBDMs(value);
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
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Header */}
        <Box component={motion.div} variants={cardVariants} initial="hidden" animate="visible" sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <Box
            component={motion.div}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(243, 168, 51, 0.15)",
              borderRadius: "50%",
              width: 64,
              height: 64,
              mr: 2,
              boxShadow: "0 4px 20px rgba(243, 168, 51, 0.3)",
            }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Group sx={{ fontSize: 36, color: "#f3a833" }} />
          </Box>
          <Box>
            <Typography
              component={motion.div}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              variant="h4"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
                fontSize: { xs: "1.75rem", sm: "2.125rem" },
              }}
            >
              Manage BDOs
            </Typography>
            <Typography
              component={motion.div}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              variant="body2"
              sx={{ color: "#94a3b8", mt: 0.5 }}
            >
              Register, edit, or delete Business Development Officers.
            </Typography>
          </Box>
        </Box>

        {/* Form */}
        <Paper
          component={motion.div}
          elevation={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.05 }}
          sx={{
            p: { xs: 3, sm: 4 },
            mb: 5,
            borderRadius: 4,
            background: "rgba(20, 20, 20, 0.8)",
            backdropFilter: "blur(20px)",
            border: '1px solid rgba(243, 168, 51, 0.2)',
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            overflow: "hidden",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 20px 40px rgba(243, 168, 51, 0.15)",
            },
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background:
                "linear-gradient(90deg, #f3a833 0%, #f59e0b 50%, #fbbf24 100%)",
              backgroundSize: "200% 100%",
              animation: loading ? "shimmer 2s infinite" : "none",
            },
            "@keyframes shimmer": {
              "0%": { backgroundPosition: "-200% 0" },
              "100%": { backgroundPosition: "200% 0" },
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#f3a833", mb: 3 }}
          >
            {editId ? "Edit BDO" : "Register New BDO"}
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              variant="outlined"
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#141414",
                  "& fieldset": {
                    borderColor: "rgba(243, 168, 51, 0.3)",
                    borderWidth: 2,
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(243, 168, 51, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#f3a833",
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              variant="outlined"
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#141414",
                  "& fieldset": {
                    borderColor: "rgba(243, 168, 51, 0.3)",
                    borderWidth: 2,
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(243, 168, 51, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#f3a833",
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label={editId ? "New Password (Optional)" : "Password"}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              variant="outlined"
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#141414",
                  "& fieldset": {
                    borderColor: "rgba(243, 168, 51, 0.3)",
                    borderWidth: 2,
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(243, 168, 51, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#f3a833",
                  },
                },
              }}
            />
            {error && (
              <Typography component={motion.div} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} variant="body2" sx={{ color: "#d32f2f", mb: 2 }}>
                {error}
              </Typography>
            )}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                component={motion.button}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                variant="contained"
                fullWidth={true}
                sx={{
                  py: 1.2,
                  px: 4,
                  borderRadius: 3,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
                  boxShadow: "0 8px 24px rgba(243, 168, 51, 0.4)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #eab308 0%, #d97706 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 32px rgba(243, 168, 51, 0.5)",
                  },
                  transition: "all 0.3s ease",
                }}
                startIcon={<SaveIcon />}
              >
                {editId ? "Update" : "Register"}
              </Button>
              {editId && (
                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  variant="outlined"
                  fullWidth={true}
                  onClick={handleCancelEdit}
                  sx={{
                    py: 1.2,
                    px: 4,
                    borderRadius: 3,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    borderColor: "#f3a833",
                    color: "#f3a833",
                    "&:hover": {
                      borderColor: "#eab308",
                      color: "#eab308",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                  startIcon={<CloseIcon />}
                >
                  Cancel
                </Button>
              )}
            </Stack>
          </Box>
        </Paper>

        {/* BDM List */}
        <Paper
          component={motion.div}
          elevation={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.15 }}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            background: "rgba(20, 20, 20, 0.8)",
            backdropFilter: "blur(20px)",
            border: '1px solid rgba(243, 168, 51, 0.2)',
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            overflow: "hidden",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 20px 40px rgba(243, 168, 51, 0.15)",
            },
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background:
                "linear-gradient(90deg, #f3a833 0%, #f59e0b 50%, #fbbf24 100%)",
              backgroundSize: "200% 100%",
              animation: loading ? "shimmer 2s infinite" : "none",
            },
            "@keyframes shimmer": {
              "0%": { backgroundPosition: "-200% 0" },
              "100%": { backgroundPosition: "200% 0" },
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#f3a833", mb: 3 }}
          >
            BDO List
          </Typography>

          <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => {
                  setPage(1);
                  setSortBy(e.target.value);
                }}
              >
                <MenuItem value="latest">Last Registered</MenuItem>
                <MenuItem value="oldest">First Registered</MenuItem>
                <MenuItem value="most-proposals">Most Proposals</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ mb: 4, bgcolor: "rgba(243, 168, 51, 0.3)" }} />

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress size={50} sx={{ color: "#f3a833" }} />
            </Box>
          ) : bdms.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <Typography
                variant="h5"
                sx={{
                  color: "#94a3b8",
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                No BDOs Found
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer
                sx={{
                  overflowX: "auto",
                  "&::-webkit-scrollbar": { height: 6 },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "rgba(243, 168, 51,0.2)",
                    borderRadius: 10,
                  },
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: "rgba(243, 168, 51, 0.15)" }}>
                      {["Name", "Email", "Actions"].map((h) => (
                        <TableCell
                          key={h}
                          sx={{
                            fontWeight: "bold",
                            py: 2.5,
                            color: "#f3a833",
                            fontSize: "1rem",
                            minWidth: h === "Actions" ? 150 : 200,
                          }}
                          align={h === "Actions" ? "center" : "left"}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bdms.map((bdm, index) => (
                      <TableRow
                        component={motion.tr}
                        key={bdm._id}
                        hover
                        variants={listItemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{
                          duration: 0.35,
                          delay: index * 0.03,
                        }}
                        sx={{
                          "&:hover": {
                            bgcolor: "rgba(243, 168, 51, 0.1)",
                            transform: "translateY(-2px)",
                            transition: "all 0.3s ease",
                          },
                        }}
                      >
                        <TableCell>
                          <Typography
                            fontWeight={500}
                            sx={{ color: "#f8fafc" }}
                          >
                            {bdm.name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: "#f8fafc" }}>
                          {bdm.email}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View" arrow>
                            <IconButton
                              onClick={() => handleView(bdm._id)}
                              sx={{
                                "&:hover": {
                                  bgcolor: "rgba(243, 168, 51, 0.2)",
                                  transform: "scale(1.1)",
                                  transition: "all 0.3s ease",
                                },
                              }}
                            >
                              <VisibilityIcon sx={{ color: "#4caf50" }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit" arrow>
                            <IconButton
                              onClick={() => handleEdit(bdm)}
                              sx={{
                                "&:hover": {
                                  bgcolor: "rgba(243, 168, 51, 0.2)",
                                  transform: "scale(1.1)",
                                  transition: "all 0.3s ease",
                                },
                              }}
                            >
                              <EditIcon sx={{ color: "#f3a833" }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete" arrow>
                            <IconButton
                              onClick={() => handleDelete(bdm._id)}
                              sx={{
                                "&:hover": {
                                  bgcolor: "rgba(243, 168, 51, 0.2)",
                                  transform: "scale(1.1)",
                                  transition: "all 0.3s ease",
                                },
                              }}
                            >
                              <DeleteIcon sx={{ color: "#d32f2f" }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination
                  count={pages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            </>
          )}
        </Paper>

        {/* Delete Confirmation Modal */}
        <Modal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          closeAfterTransition
        >
          <Fade in={deleteModalOpen}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: "90%", sm: 400 },
                bgcolor: "linear-gradient(135deg, #1a1a1a 0%, #111111 100%)",
                borderRadius: 3,
                background: "#141414",
                boxShadow: "0 8px 24px rgba(243, 168, 51, 0.4)",
                p: 4,
                outline: "none",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#f3a833", mb: 2 }}
              >
                Confirm Delete
              </Typography>
              <Typography variant="body1" sx={{ color: "#f8fafc", mb: 3 }}>
                Are you sure you want to delete this BDO? This action cannot be
                undone.
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setDeleteModalOpen(false)}
                  sx={{
                    py: 1,
                    px: 3,
                    borderRadius: 3,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    borderColor: "#f3a833",
                    color: "#f3a833",
                    "&:hover": {
                      borderColor: "#eab308",
                      color: "#eab308",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={confirmDelete}
                  sx={{
                    py: 1,
                    px: 3,
                    borderRadius: 3,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    background:
                      "linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #b71c1c 0%, #d32f2f 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 32px rgba(211, 47, 47, 0.5)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </Fade>
        </Modal>
      </Box>
    </Box>
  );
};

export default BDMRegisterPage;
