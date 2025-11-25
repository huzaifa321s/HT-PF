import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  OutlinedInput,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Tooltip,
  Fade,
} from "@mui/material";
import { UploadFile as UploadFileIcon } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import ProposalDocument from "../components/pdf/ProposalDocument";
import axiosInstance from "../utils/axiosInstance";

const EditProposal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const pdfRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [mode, setMode] = useState("dev");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [openPdfDialog, setOpenPdfDialog] = useState(false);
  const [openSaveModal, setOpenSaveModal] = useState(false);
  const [formDataToSave, setFormDataToSave] = useState(null);
  const [isHovered, setIsHovered] = useState({}); // For button hover states

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      clientName: "",
      clientEmail: "",
      projectTitle: "",
      businessDescription: "",
      proposedSolution: "",
      developmentPlatforms: [],
      projectDuration: "",
      chargeAmount: "",
      advancePercent: "",
      additionalCosts: "",
      timelineMilestones: "",
      callOutcome: "",
      terms: "",
      yourName: "",
      yourEmail: "",
      yourPhone: "",
      status: "",
      notes: "",
      pdfPath: "",
    },
  });

  // Fetch proposal
  useEffect(() => {
    const fetchProposal = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `${import.meta.env.VITE_APP_BASE_URL}/api/proposals/get-single-proposal/${id}`
        );
        const data = res.data.data;
        reset(data);
      } catch (err) {
        console.error("Error fetching proposal:", err);
        setSnackbar({
          open: true,
          message: "Failed to load proposal.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProposal();
  }, [id, reset]);

  // Open Save Modal
  const onSubmit = async (data) => {
    setFormDataToSave(data);
    setOpenSaveModal(true);
  };

  // Save only form (Keep Old PDF)
  const saveWithoutPdf = async () => {
    try {
      setLoading(true);
      await axiosInstance.put(
        `${import.meta.env.VITE_APP_BASE_URL}/api/proposals/update-proposal/${id}`,
        formDataToSave
      );
      setSnackbar({
        open: true,
        message: "Proposal saved successfully! (Old PDF kept)",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to save proposal.",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setOpenSaveModal(false);
    }
  };

  // Save + Generate New PDF
  const saveWithNewPdf = async () => {
    setPdfLoading(true);
    setMode("prod");
    try {
      const formData = formDataToSave;
      const pdfPages = pdfRef.current?.querySelectorAll(".pdf-page");
      if (!pdfPages?.length) throw new Error("No .pdf-page found!");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      for (let i = 0; i < pdfPages.length; i++) {
        const canvas = await html2canvas(pdfPages[i], {
          scale: 3,
          useCORS: true,
          backgroundColor: "#fff",
        });
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
      }
      const pdfBlob = pdf.output("blob");
      const filename = `${formData.projectTitle || "Proposal"}_proposal.pdf`;
      const uploadData = new FormData();
      uploadData.append("pdfFile", pdfBlob, filename);
      uploadData.append("proposalId", id);
      const uploadRes = await axiosInstance.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/proposals/upload-pdf`,
        uploadData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (!uploadRes.data.success) throw new Error("PDF upload failed");
      formData.pdfPath = uploadRes.data.filePath;
      await axiosInstance.put(
        `${import.meta.env.VITE_APP_BASE_URL}/api/proposals/update-proposal/${id}`,
        formData
      );
      const serverPdfUrl = `${import.meta.env.VITE_APP_BASE_URL}/${uploadRes.data.filePath}`;
      setPdfUrl(serverPdfUrl);
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      setSnackbar({
        open: true,
        message: "Proposal saved & New PDF generated successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("PDF Error:", err);
      setSnackbar({
        open: true,
        message: "PDF generation failed: " + err.message,
        severity: "error",
      });
    } finally {
      setPdfLoading(false);
      setMode("dev");
      setOpenSaveModal(false);
    }
  };

  // View PDF in Dialog
  const handleViewPdf = () => {
    const current = getValues();
    if (current.pdfPath) {
      setPdfUrl(`${import.meta.env.VITE_APP_BASE_URL}/${current.pdfPath}`);
      setOpenPdfDialog(true);
    }
  };

  const handleClosePdfDialog = () => {
    setOpenPdfDialog(false);
    setPdfUrl(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#f5f7fa",
        }}
      >
        <CircularProgress
          size={60}
          thickness={5}
          sx={{ color: "#667eea" }}
        />
        <Typography
          variant="h6"
          sx={{
            ml: 2,
            fontWeight: 600,
            color: "#667eea",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Loading Proposal...
        </Typography>
      </Box>
    );
  }

  const formData = getValues();

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
        py: 8,
        px: { xs: 2, sm: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 5,
            background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
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
              background: "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
              backgroundSize: "200% 100%",
              animation: loading || pdfLoading ? "shimmer 2s infinite" : "none",
            },
            "@keyframes shimmer": {
              "0%": { backgroundPosition: "-200% 0" },
              "100%": { backgroundPosition: "200% 0" },
            },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
              mb: 4,
              textAlign: "center",
            }}
          >
            Edit Proposal
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mb: 5, textAlign: "center" }}
          >
            Update your proposal details and generate a professional PDF
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {/* === CLIENT INFORMATION === */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#667eea",
                    mb: 2,
                  }}
                >
                  Client Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="clientName"
                      control={control}
                      rules={{ required: "Client Name is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Client Name *"
                          fullWidth
                          error={!!errors.clientName}
                          helperText={errors.clientName?.message}
                          variant="outlined"
                          sx={{
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
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="clientEmail"
                      control={control}
                      rules={{ required: "Client Email is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Client Email *"
                          fullWidth
                          type="email"
                          error={!!errors.clientEmail}
                          helperText={errors.clientEmail?.message}
                          variant="outlined"
                          sx={{
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
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
              {/* === PROJECT INFORMATION === */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#667eea",
                    mb: 2,
                  }}
                >
                  Project Information
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Controller
                    name="projectTitle"
                    control={control}
                    rules={{ required: "Project Title is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Project Title *"
                        fullWidth
                        error={!!errors.projectTitle}
                        helperText={errors.projectTitle?.message}
                        variant="outlined"
                        sx={{
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
                    )}
                  />
                  <Controller
                    name="businessDescription"
                    control={control}
                    rules={{ required: "Business Description is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Business Description *"
                        fullWidth
                        multiline
                        rows={4}
                        error={!!errors.businessDescription}
                        helperText={errors.businessDescription?.message}
                        variant="outlined"
                        sx={{
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
                    )}
                  />
                  <Controller
                    name="proposedSolution"
                    control={control}
                    rules={{ required: "Proposed Solution is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Proposed Solution *"
                        fullWidth
                        multiline
                        rows={4}
                        error={!!errors.proposedSolution}
                        helperText={errors.proposedSolution?.message}
                        variant="outlined"
                        sx={{
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
                    )}
                  />
                  <Controller
                    name="developmentPlatforms"
                    control={control}
                    rules={{ required: "At least one platform is required" }}
                    render={({ field }) => (
                      <FormControl
                        fullWidth
                        variant="outlined"
                        error={!!errors.developmentPlatforms}
                      >
                        <InputLabel>Development Platforms *</InputLabel>
                        <Select
                          {...field}
                          multiple
                          input={<OutlinedInput label="Development Platforms *" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip
                                  key={value}
                                  label={value}
                                  size="small"
                                  sx={{
                                    bgcolor: "rgba(102, 126, 234, 0.15)",
                                    color: "#667eea",
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                          sx={{
                            borderRadius: 2,
                            bgcolor: "#fff",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "rgba(102, 126, 234, 0.3)",
                              borderWidth: 2,
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "rgba(102, 126, 234, 0.5)",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#667eea",
                            },
                          }}
                        >
                          {[
                            "WordPress",
                            "Shopify",
                            "Webflow",
                            "React",
                            "Next.js",
                            "Laravel",
                          ].map((value) => (
                            <MenuItem key={value} value={value}>
                              {value}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.developmentPlatforms && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 1 }}
                          >
                            {errors.developmentPlatforms.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Box>
              </Box>
              {/* === FINANCIAL DETAILS === */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#667eea",
                    mb: 2,
                  }}
                >
                  Financial Details
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {[
                    { name: "projectDuration", label: "Project Duration *" },
                    { name: "chargeAmount", label: "Charge Amount ($) *" },
                    { name: "advancePercent", label: "Advance (%) *" },
                    { name: "additionalCosts", label: "Additional Costs" },
                  ].map((item) => (
                    <Controller
                      key={item.name}
                      name={item.name}
                      control={control}
                      rules={{
                        required: item.label.includes("*")
                          ? `${item.label.replace(" *", "")} is required`
                          : false,
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={item.label}
                          fullWidth
                          error={!!errors[item.name]}
                          helperText={errors[item.name]?.message}
                          variant="outlined"
                          sx={{
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
                      )}
                    />
                  ))}
                </Box>
              </Box>
              {/* === TIMELINE / MILESTONES === */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#667eea",
                    mb: 2,
                  }}
                >
                  Timeline / Milestones
                </Typography>
                <Controller
                  name="timelineMilestones"
                  control={control}
                  rules={{ required: "Timeline/Milestones is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={4}
                      label="Timeline / Milestones *"
                      error={!!errors.timelineMilestones}
                      helperText={errors.timelineMilestones?.message}
                      variant="outlined"
                      sx={{
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
                  )}
                />
              </Box>
              {/* === ADDITIONAL DETAILS === */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#667eea",
                    mb: 2,
                  }}
                >
                  Additional Details
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Controller
                    name="callOutcome"
                    control={control}
                    rules={{ required: "Call Outcome is required" }}
                    render={({ field }) => (
                      <FormControl
                        fullWidth
                        variant="outlined"
                        error={!!errors.callOutcome}
                      >
                        <InputLabel>Call Outcome *</InputLabel>
                        <Select
                          {...field}
                          input={<OutlinedInput label="Call Outcome *" />}
                          sx={{
                            borderRadius: 2,
                            bgcolor: "#fff",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "rgba(102, 126, 234, 0.3)",
                              borderWidth: 2,
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "rgba(102, 126, 234, 0.5)",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#667aea",
                            },
                          }}
                        >
                          {["Interested", "No Fit", "Flaked", "Follow-up"].map(
                            (val) => (
                              <MenuItem key={val} value={val}>
                                {val}
                              </MenuItem>
                            )
                          )}
                        </Select>
                        {errors.callOutcome && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 1 }}
                          >
                            {errors.callOutcome.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                  <Controller
                    name="terms"
                    control={control}
                    rules={{ required: "Terms & Conditions is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Terms & Conditions *"
                        fullWidth
                        multiline
                        rows={4}
                        error={!!errors.terms}
                        helperText={errors.terms?.message}
                        variant="outlined"
                        sx={{
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
                    )}
                  />
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Notes / Remarks"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        sx={{
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
                    )}
                  />
                </Box>
              </Box>
              {/* === YOUR INFORMATION === */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#667eea",
                    mb: 2,
                  }}
                >
                  Your Information
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {["yourName", "yourEmail", "yourPhone"].map((field) => (
                    <Controller
                      key={field}
                      name={field}
                      control={control}
                      rules={{
                        required: `${field.replace("your", "Your ")} is required`,
                      }}
                      render={({ field: input }) => (
                        <TextField
                          {...input}
                          label={`${field.replace("your", "Your ")} *`}
                          fullWidth
                          error={!!errors[field]}
                          helperText={errors[field]?.message}
                          variant="outlined"
                          sx={{
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
                      )}
                    />
                  ))}
                </Box>
              </Box>
              <Divider sx={{ my: 4 }} />
              {/* === ACTION BUTTONS === */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Tooltip title="Cancel and go back" arrow>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    sx={{
                      py: 1.5,
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
                        boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                      },
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={() => setIsHovered({ ...isHovered, cancel: true })}
                    onMouseLeave={() =>
                      setIsHovered({ ...isHovered, cancel: false })
                    }
                  >
                    Cancel
                  </Button>
                </Tooltip>
                <Tooltip title="View the previously generated PDF" arrow>
                  <Button
                    variant="contained"
                    onClick={handleViewPdf}
                    disabled={!formData.pdfPath}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: 3,
                      textTransform: "none",
                      fontSize: "1rem",
                      fontWeight: 600,
                      background:
                        "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
                      boxShadow: "0 8px 24px rgba(76, 175, 80, 0.4)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #45a049 0%, #357a38 100%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 12px 32px rgba(76, 175, 80, 0.5)",
                      },
                      "&:disabled": {
                        background:
                          "linear-gradient(135deg, #ccc 0%, #999 100%)",
                      },
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={() =>
                      setIsHovered({ ...isHovered, viewPdf: true })
                    }
                    onMouseLeave={() =>
                      setIsHovered({ ...isHovered, viewPdf: false })
                    }
                  >
                    View Downloaded PDF
                  </Button>
                </Tooltip>
                <Tooltip title="Save changes to the proposal" arrow>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={loading || pdfLoading}
                    sx={{
                      py: 1.5,
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
                      "&:disabled": {
                        background:
                          "linear-gradient(135deg, #ccc 0%, #999 100%)",
                      },
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={() =>
                      setIsHovered({ ...isHovered, save: true })
                    }
                    onMouseLeave={() =>
                      setIsHovered({ ...isHovered, save: false })
                    }
                    startIcon={
                      loading || pdfLoading ? (
                        <CircularProgress size={20} sx={{ color: "#fff" }} />
                      ) : (
                        <UploadFileIcon />
                      )
                    }
                  >
                    {loading || pdfLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          </form>
        </Paper>
        {/* === LIVE PDF PREVIEW === */}
        <Box sx={{ mt: 10 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mx: 2,
                fontWeight: 600,
                color: "#667eea",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {mode === "prod" ? "View" : "Edit"} Mode
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={mode === "prod"}
                  onChange={(e) =>
                    setMode(e.target.checked ? "prod" : "dev")
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#667eea",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#667eea",
                    },
                  }}
                />
              }
              
              
            />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
              mb: 2,
              textAlign: "center",
            }}
          >
            Live PDF Template Preview
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              mb: 4,
              textAlign: "center",
            }}
          >
            This is the same template that will generate the final PDF when you choose "Use New PDF".
          </Typography>
          <Paper
            elevation={8}
            sx={{
              p: 5,
              bgcolor: "#ffffff",
              border: "3px dashed #667eea",
              borderRadius: 3,
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              },
            }}
          >
            <div ref={pdfRef}>
              <ProposalDocument formData={formData} pdfRef={pdfRef} mode={mode} />
            </div>
          </Paper>
        </Box>
        {/* === SNACKBAR === */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{
              width: "100%",
              bgcolor: snackbar.severity === "success" ? "#4caf50" : "#f44336",
              color: "#fff",
              "& .MuiAlert-icon": {
                color: "#fff",
              },
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        {/* === SAVE CONFIRMATION MODAL === */}
        <Dialog
          open={openSaveModal}
          onClose={() => setOpenSaveModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              bgcolor: "#fff",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              color: "#667eea",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Which PDF do you want to keep?
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: "text.secondary", mb: 3 }}>
              You have made changes to the proposal. Please choose which PDF to save:
            </DialogContentText>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={saveWithoutPdf}
                disabled={loading}
                sx={{
                  py: 1.5,
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
                    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                  },
                  "&:disabled": {
                    borderColor: "#ccc",
                    color: "#ccc",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Keep Old PDF
              </Button>
              <Button
                variant="contained"
                onClick={saveWithNewPdf}
                disabled={pdfLoading}
                sx={{
                  py: 1.5,
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
                  "&:disabled": {
                    background:
                      "linear-gradient(135deg, #ccc 0%, #999 100%)",
                  },
                  transition: "all 0.3s ease",
                }}
                startIcon={
                  pdfLoading ? (
                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                  ) : null
                }
              >
                {pdfLoading
                  ? "Generating New PDF..."
                  : "Use New PDF (Preview Below)"}
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenSaveModal(false)}
              sx={{
                color: "#667eea",
                fontWeight: 600,
                "&:hover": {
                  color: "#5568d3",
                },
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
        {/* === PDF VIEWER DIALOG === */}
        <Dialog
          open={openPdfDialog}
          onClose={handleClosePdfDialog}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              height: "95vh",
              m: 2,
              borderRadius: 3,
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontWeight: 700,
              color: "#667eea",
            }}
          >
            <Typography variant="h6">Final Generated PDF</Typography>
            <Button
              onClick={handleClosePdfDialog}
              sx={{
                color: "#667eea",
                fontWeight: 600,
                "&:hover": {
                  color: "#5568d3",
                },
              }}
            >
              Close
            </Button>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                width="100%"
                height="100%"
                title="Final PDF"
                style={{ border: "none" }}
              />
            ) : (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography
                  sx={{
                    color: "#667eea",
                    fontWeight: 600,
                  }}
                >
                  PDF not available.
                </Typography>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
};

export default EditProposal;