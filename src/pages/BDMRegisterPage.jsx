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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import axiosInstance from "../utils/axiosInstance";
import { Group } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { showToast } from "../utils/toastSlice";

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
  // pagination state
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10); // you can adjust default page size

  const fetchBDMs = async (p = 1) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/api/bdms/get-all-bdms?page=${p}&limit=${limit}`
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
  }, []);

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

  const handleEdit = (bdm) => {
    setEditId(bdm._id);
    setFormData({ name: bdm.name, email: bdm.email, password: "" });
    setError("");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

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
    } catch (error) {
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
      sx={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
        py: 8,
        px: { xs: 2, sm: 3, md: 4 },
        width: "100vw",
        position: "relative",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(102, 126, 234, 0.15)",
              borderRadius: "50%",
              width: 64,
              height: 64,
              mr: 2,
              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
            }}
          >
            <Group sx={{ fontSize: 36, color: "#667eea" }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
              }}
            >
              Manage BDOs
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 0.5 }}
            >
              Register, edit, or delete Business Development Managers.
            </Typography>
          </Box>
        </Box>

        {/* Form */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            mb: 4,
            borderRadius: 5,
            background: "linear-gradient(135deg, #ffffff 0%, #f9fbfd 100%)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            border: "3px solid transparent",
            position: "relative",
            overflow: "hidden",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            },
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              background:
                "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
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
            sx={{ fontWeight: 700, color: "#667eea", mb: 3 }}
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
                  bgcolor: "#fff",
                  "& fieldset": {
                    borderColor: "rgba(102, 126, 234, 0.3)",
                    borderWidth: 2,
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(102, 126, 234, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#667eea",
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
                  bgcolor: "#fff",
                  "& fieldset": {
                    borderColor: "rgba(102, 126, 234, 0.3)",
                    borderWidth: 2,
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(102, 126, 234, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#667eea",
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
                  bgcolor: "#fff",
                  "& fieldset": {
                    borderColor: "rgba(102, 126, 234, 0.3)",
                    borderWidth: 2,
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(102, 126, 234, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#667eea",
                  },
                },
              }}
            />
            {error && (
              <Typography variant="body2" sx={{ color: "#d32f2f", mb: 2 }}>
                {error}
              </Typography>
            )}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  py: 1.2,
                  px: 4,
                  borderRadius: 3,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 32px rgba(102, 126, 234, 0.5)",
                  },
                  transition: "all 0.3s ease",
                }}
                startIcon={<SaveIcon />}
              >
                {editId ? "Update" : "Register"}
              </Button>
              {editId && (
                <Button
                  variant="outlined"
                  onClick={handleCancelEdit}
                  sx={{
                    py: 1.2,
                    px: 4,
                    borderRadius: 3,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    borderColor: "#667eea",
                    color: "#667eea",
                    "&:hover": {
                      borderColor: "#5568d3",
                      color: "#5568d3",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                  startIcon={<CloseIcon />}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* BDM List */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 5,
            background: "linear-gradient(135deg, #ffffff 0%, #f9fbfd 100%)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            border: "3px solid transparent",
            position: "relative",
            overflow: "hidden",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            },
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              background:
                "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
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
            sx={{ fontWeight: 700, color: "#667eea", mb: 3 }}
          >
            BDO List
          </Typography>
          <Divider sx={{ mb: 4, bgcolor: "rgba(102, 126, 234, 0.3)" }} />

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress size={50} sx={{ color: "#667eea" }} />
            </Box>
          ) : bdms.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <Typography
                variant="h5"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                No BDOs Found
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: "rgba(102, 126, 234, 0.15)" }}>
                      {["Name", "Email", "Actions"].map((h) => (
                        <TableCell
                          key={h}
                          sx={{
                            fontWeight: "bold",
                            py: 2.5,
                            color: "#667eea",
                            fontSize: "1rem",
                          }}
                          align={h === "Actions" ? "center" : "left"}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bdms.map((bdm) => (
                      <TableRow
                        key={bdm._id}
                        hover
                        sx={{
                          "&:hover": {
                            bgcolor: "rgba(102, 126, 234, 0.1)",
                            transform: "translateY(-2px)",
                            transition: "all 0.3s ease",
                          },
                        }}
                      >
                        <TableCell>
                          <Typography
                            fontWeight={500}
                            sx={{ color: "text.primary" }}
                          >
                            {bdm.name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: "text.primary" }}>
                          {bdm.email}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit" arrow>
                            <IconButton
                              onClick={() => handleEdit(bdm)}
                              sx={{
                                "&:hover": {
                                  bgcolor: "rgba(102, 126, 234, 0.2)",
                                  transform: "scale(1.1)",
                                  transition: "all 0.3s ease",
                                },
                              }}
                            >
                              <EditIcon sx={{ color: "#667eea" }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete" arrow>
                            <IconButton
                              onClick={() => handleDelete(bdm._id)}
                              sx={{
                                "&:hover": {
                                  bgcolor: "rgba(102, 126, 234, 0.2)",
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
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
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
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: "90%", sm: 400 },
                bgcolor: "linear-gradient(135deg, #ffffff 0%, #f9fbfd 100%)",
                borderRadius: 3,
                background: "#fff",
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
                p: 4,
                outline: "none",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#667eea", mb: 2 }}
              >
                Confirm Delete
              </Typography>
              <Typography variant="body1" sx={{ color: "text.primary", mb: 3 }}>
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
                    borderColor: "#667eea",
                    color: "#667eea",
                    "&:hover": {
                      borderColor: "#5568d3",
                      color: "#5568d3",
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
