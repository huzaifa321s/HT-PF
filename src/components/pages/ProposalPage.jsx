"use client";
// src/components/pages/ProposalPage.jsx
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
  Backdrop,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { useDebounce } from "use-debounce";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useDispatch } from "react-redux";
import { showToast } from "@/utils/toastSlice";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { updateField } from "@/utils/proposalSlice";
import { setDBData, setMode1 } from "@/utils/page1Slice";
import { setDBDataP2, setMode } from "@/utils/page2Slice";
import { setDBDataP3, setMode2 } from "@/utils/page3Slice";
import { setDBDataPricing, setMode3 } from "@/utils/pricingReducer";
import { setDBTerms, setMode4 } from "@/utils/paymentTermsPageSlice";

const UnifiedPdfEditor = dynamic(() => import("@/components/UnifiedPDFEditor"), { ssr: false });

const ProposalPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  let user = {};
  try {
    user = JSON.parse(sessionStorage.getItem("user") || "{}");
  } catch (e) {
    console.warn("sessionStorage access failed in ProposalPage:", e);
  }
  const isAdmin = user.role === "admin";

  const [proposals, setProposals] = useState([]);
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [proposalID, setProposalID] = useState(null);
  const [length, setLength] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pdfGeneratingId, setPdfGeneratingId] = useState(null);
  const [downloadingProposal, setDownloadingProposal] = useState(null);

  // Filters local states
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [dateFilter, setDateFilter] = useState(searchParams.get("date") || "");
  const [ownershipFilter, setOwnershipFilter] = useState(searchParams.get("view") || "");

  const hasActiveFilters = Boolean(searchTerm.trim() || dateFilter || (isAdmin && ownershipFilter));

  const handleView = (id) => {
    router.push(`/admin/proposals/${id}`);
  };

  const handleEdit = (id) => router.push(`/edit-proposal/${id}`);

  // Helper to dynamically update the URL Search Params
  const updateUrlParams = useCallback((paramsUpdate) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    Object.entries(paramsUpdate).forEach(([key, value]) => {
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.replace(`${pathname}${query}`, { scroll: false });
  }, [router, pathname, searchParams]);

  const handleDownload = async (id) => {
    try {
      setPdfGeneratingId(id);

      // 1. Fetch proposal details
      const res = await axiosInstance.get(`/api/proposals/get-single-proposal/${id}`);
      const proposalData = res.data.data;

      if (!proposalData) {
        throw new Error("Proposal data not found");
      }

      // If PDF already exists, download it instantly and skip generation!
      if (proposalData.pdfPath) {
        // Build proper download URL (Google Drive or fallback)
        let downloadUrl = proposalData.pdfPath;
        const driveMatch = proposalData.pdfPath.match(/\/file\/d\/([^/]+)/);
        if (driveMatch) {
          downloadUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
        } else {
          downloadUrl = proposalData.pdfPath.includes("?")
            ? `${proposalData.pdfPath}&download=1`
            : `${proposalData.pdfPath}?download=1`;
        }

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", "");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setPdfGeneratingId(null);
        return;
      }

      // 2. Seed Redux store with proposal metadata and page details
      dispatch(updateField({ field: "clientName", value: proposalData.clientName }));
      dispatch(updateField({ field: "date", value: proposalData.date }));
      dispatch(updateField({ field: "additionalCosts", value: proposalData.additionalCosts }));
      dispatch(updateField({ field: "chargeAmount", value: proposalData.chargeAmount }));
      dispatch(updateField({ field: "advancePercent", value: proposalData.advancePercent }));
      dispatch(updateField({ field: "brandName", value: proposalData.brandName }));

      if (proposalData.pdfPages?.page1) dispatch(setDBData(proposalData.pdfPages.page1));
      if (proposalData.pdfPages?.page3) dispatch(setDBDataP2(proposalData.pdfPages.page3));
      if (proposalData.pdfPages?.page2) dispatch(setDBDataP3(proposalData.pdfPages.page2));
      if (proposalData.pdfPages?.pricingPage) dispatch(setDBDataPricing(proposalData.pdfPages.pricingPage));
      if (proposalData.pdfPages?.paymentTerms) dispatch(setDBTerms(proposalData.pdfPages.paymentTerms));

      dispatch(setMode("edit"));
      dispatch(setMode1("edit"));
      dispatch(setMode2("edit"));
      dispatch(setMode3("edit"));
      dispatch(setMode4("edit"));

      // 3. Render the offscreen UnifiedPdfEditor
      setDownloadingProposal(proposalData);

      // 4. Wait for React mount and styles reflow/layout
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // 5. Find offscreen container
      const container = document.getElementById("pdf-export-container");
      if (!container) {
        throw new Error("Could not find the offscreen PDF container");
      }

      // 6. Load packages dynamically on client side
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");
      const { convertImagesToBase64, restoreOriginalImages, ensureAllImagesConverted, ensureAllAssetsConverted } = await import("@/utils/imageToBase64");

      const PAGE_PX_HEIGHT = 1131;
      const PAGE_PX_WIDTH = 800;

      const origWidth = container.style.width;
      const origMaxWidth = container.style.maxWidth;
      container.style.width = `${PAGE_PX_WIDTH}px`;
      container.style.maxWidth = `${PAGE_PX_WIDTH}px`;

      await new Promise(r => setTimeout(r, 100));

      // 7. Convert images to base64 and preload
      const originalSources = await convertImagesToBase64(container);

      let attempts = 0;
      while (!ensureAllAssetsConverted(container) && attempts < 10) {
        await new Promise((r) => setTimeout(r, 200));
        attempts++;
      }

      await new Promise(r => setTimeout(r, 200));

      const preloadAllImages = async (cont) => {
        const imgs = Array.from(cont.querySelectorAll('img'));
        await Promise.all(
          imgs.map(async (img) => {
            // 1. Force reload non-data-URI images into a temp Image first
            if (img.src && !img.src.startsWith('data:')) {
              await new Promise((resolve) => {
                const temp = new Image();
                temp.crossOrigin = 'anonymous';
                temp.onload = resolve;
                temp.onerror = resolve;
                temp.src = img.src;
              });
            }
            // 2. Wait for image to load if not yet complete
            if (!img.complete || img.naturalWidth === 0) {
              await new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
                setTimeout(resolve, 8000); // hard timeout
              });
            }
            // 3. Force full pixel decode — key fix for base64 header/footer images
            if (typeof img.decode === 'function') {
              try { await img.decode(); } catch (_) { }
            }
          })
        );
        // 4. Flush two rAF cycles so decoded pixels are painted
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      };

      // Ensure all images are fully decoded and painted before capture
      await preloadAllImages(container);
      // Extra settle time
      await new Promise(r => setTimeout(r, 600));
      let fullCanvas;
      try {
        fullCanvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false,
          scrollX: 0,
          scrollY: 0,
          backgroundColor: "#ffffff",
          width: PAGE_PX_WIDTH,
          height: container.scrollHeight,
          windowWidth: PAGE_PX_WIDTH,
          windowHeight: container.scrollHeight,
          imageTimeout: 15000,
          onclone: async (clonedDoc) => {
            const clonedBody = clonedDoc.body;
            clonedBody.style.width = `${PAGE_PX_WIDTH}px`;
            clonedBody.style.minWidth = `${PAGE_PX_WIDTH}px`;

            const clonedContainer = clonedDoc.getElementById("pdf-export-container");
            if (clonedContainer) {
              clonedContainer.style.width = `${PAGE_PX_WIDTH}px`;
              clonedContainer.style.maxWidth = `${PAGE_PX_WIDTH}px`;
              clonedContainer.style.transform = "none";
            }

            // Critical: decode all images inside the CLONED document.
            // html2canvas clones the DOM into a hidden iframe; images there
            // need to be decoded independently of the original DOM.
            const clonedImgs = Array.from(clonedDoc.querySelectorAll('img'));
            await Promise.all(
              clonedImgs.map(async (img) => {
                if (!img.complete || img.naturalWidth === 0) {
                  await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                    setTimeout(resolve, 10000);
                  });
                }
                if (typeof img.decode === 'function') {
                  try { await img.decode(); } catch (_) { }
                }
              })
            );
          }
        });
      } finally {
        container.style.width = origWidth;
        container.style.maxWidth = origMaxWidth;
        restoreOriginalImages(originalSources);
      }

      // 8. Slice canvas and compile A4 PDF doc
      const SCALE = 2;
      const pageCanvasHeight = PAGE_PX_HEIGHT * SCALE;
      const pageCanvasWidth = PAGE_PX_WIDTH * SCALE;
      const totalPages = Math.max(1, Math.round(fullCanvas.height / pageCanvasHeight));

      const PDF_W = 595.28;
      const PDF_H = 841.89;

      const pdfDoc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });

      for (let i = 0; i < totalPages; i++) {
        const sliceY = i * pageCanvasHeight;
        const sliceHeight = Math.min(pageCanvasHeight, fullCanvas.height - sliceY);
        if (sliceHeight <= 0) break;

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = pageCanvasWidth;
        pageCanvas.height = sliceHeight;

        const ctx = pageCanvas.getContext("2d");
        ctx.drawImage(
          fullCanvas,
          0, sliceY,
          pageCanvasWidth, sliceHeight,
          0, 0,
          pageCanvasWidth, sliceHeight
        );

        const imgData = pageCanvas.toDataURL("image/jpeg", 0.95);
        const imgH = (sliceHeight / pageCanvasWidth) * PDF_W;

        if (i > 0) pdfDoc.addPage();
        pdfDoc.addImage(imgData, "JPEG", 0, 0, PDF_W, Math.min(imgH, PDF_H));
      }

      const brandName = proposalData.brandName?.trim() || "Client";
      const fileName = `${brandName} Proposal.pdf`;
      pdfDoc.save(fileName);

      // 9. Upload PDF back to server and database (keep it synced)
      const blob = pdfDoc.output("blob");
      const formDataUpload = new FormData();
      formDataUpload.append("pdfFile", blob, fileName);
      formDataUpload.append("proposalId", id);

      const uploadRes = await axiosInstance.post(
        `/api/proposals/upload-pdf`,
        formDataUpload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (uploadRes.data.success) {
        await axiosInstance.put(
          `/api/proposals/update-proposal/${id}`,
          {
            pdfPath: uploadRes.data.filePath,
          }
        );
      }

      dispatch(showToast({ message: "PDF downloaded successfully!", severity: "success" }));
    } catch (error) {
      console.error("PDF generation failed:", error);
      dispatch(showToast({ message: "Failed to generate PDF: " + error.message, severity: "error" }));
    } finally {
      setPdfGeneratingId(null);
      setDownloadingProposal(null);
    }
  };

  const handleDelete = (id, currentLength) => {
    setDeleteModalOpen(true);
    setLength(currentLength);
    setProposalID(id);
  };

  // Main fetch proposals which pulls parameters directly from URL Search Params
  const fetchProposals = useCallback(async () => {
    try {
      setLoading(true);
      const urlPage = parseInt(searchParams.get("page")) || 1;
      const urlSearch = searchParams.get("search") || "";
      const urlDate = searchParams.get("date") || "";
      const urlView = searchParams.get("view") || "";

      const params = {
        page: urlPage,
        limit: 5,
        search: urlSearch,
        date: urlDate,
      };

      if (isAdmin && urlView === "mine") {
        params.createdBy = user.id;
      }

      const res = await axiosInstance.get(
        `/api/proposals/get-all-proposals`, {
        params
      }
      );
      setProposals(res.data.proposals || []);
      setTotalPages(res.data.totalPages || 1);
      setLength(res.data.proposals?.length || 0);
      setTotalCount(res.data.totalCount || 0);

      // Sync local UI states with the loaded URL parameters (handles initial load or history navigation)
      setPage(urlPage);
      if (urlSearch !== searchTerm) setSearchTerm(urlSearch);
      if (urlDate !== dateFilter) setDateFilter(urlDate);
      if (urlView !== ownershipFilter) setOwnershipFilter(urlView);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      setProposals([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [searchParams, isAdmin, user.id]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // Sync debounced search to URL
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (debouncedSearchTerm !== currentSearch) {
      updateUrlParams({ search: debouncedSearchTerm, page: "" });
    }
  }, [debouncedSearchTerm, searchParams, updateUrlParams]);

  const handleDateChange = (newValue) => {
    const formatted = newValue ? newValue.format("YYYY-MM-DD") : "";
    setDateFilter(formatted);
    updateUrlParams({ date: formatted, page: "" });
  };

  const handleOwnershipChange = (e) => {
    const val = e.target.value;
    setOwnershipFilter(val);
    updateUrlParams({ view: val, page: "" });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDateFilter("");
    setOwnershipFilter("");
    updateUrlParams({ search: "", date: "", view: "", page: "" });
  };

  const handlePageChange = (event, value) => {
    updateUrlParams({ page: value === 1 ? "" : value.toString() });
  };

  // Animation Variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
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
    lightBg: "linear-gradient(135deg, #f5f7ff 0%, #f0f2ff 100%)",
  };

  const headers = isAdmin
    ? ["Title", "Client", "Client Email", "Created By", "Date", "Actions"]
    : ["Title", "Client", "Client Email", "Date", "Actions"];

  const statsCards = [
    {
      title: isAdmin ? 'Total Proposals' : 'Your Proposals',
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
                {isAdmin ? "All Proposals" : "Your Proposals"}
              </Typography>
              <Typography variant="body1" sx={{ color: "#94a3b8", mt: 1, fontSize: "1.1rem" }}>
                {isAdmin
                  ? "Manage and track all business proposals across the team"
                  : "Manage and track all your business proposals"}
              </Typography>
            </Box>
          </Box>
        </Fade>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 5 }} component={motion.div} variants={itemVariants}>
          {statsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                component={motion.div}
                whileHover={{
                  y: -10,
                  boxShadow: '0 20px 40px rgba(243, 168, 51, 0.25)',
                }}
                sx={{
                  background: stat.bgGradient,
                  color: 'white',
                  borderRadius: 4,
                  boxShadow: '0 12px 28px rgba(0,0,0,0.8)',
                  transition: 'box-shadow 0.3s ease',
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
            </Grid>
          ))}
        </Grid>

        {/* Main Table Card */}
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
                  {isAdmin ? "All Team Proposals" : "All Proposals"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {totalCount} total proposals found
                </Typography>
              </Box>
              <Button
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
                  transition: 'box-shadow 0.3s ease',
                  border: 'none',
                  cursor: 'pointer',
                  "&:hover": {
                    background: "linear-gradient(135deg, #eab308 0%, #d97706 100%)",
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
                background: "rgba(0, 0, 0, 0.2)",
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
                    borderColor: alpha(colorScheme.primary, 0.35),
                    color: colorScheme.primary,
                    background: "#141414",
                    "&:hover": {
                      borderColor: colorScheme.primary,
                      background: alpha(colorScheme.primary, 0.06),
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    flex: { xs: "1 1 100%", md: 2 },
                    minWidth: 260,
                    "& .MuiInputBase-root": {
                      background: "#141414",
                      borderRadius: 2,
                      color: "#fff",
                    },
                    "& .MuiInputLabel-root": { color: "#94a3b8" },
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

                {isAdmin && (
                  <FormControl
                    size="small"
                    sx={{
                      flex: { xs: "1 1 100%", sm: 1 },
                      minWidth: 180,
                      "& .MuiInputBase-root": {
                        background: "#141414",
                        borderRadius: 2,
                        color: "#fff",
                      },
                      "& .MuiInputLabel-root": { color: "#94a3b8" },
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(243, 168, 51, 0.2)" },
                      "& .MuiSvgIcon-root": { color: "#94a3b8" },
                    }}
                  >
                    <InputLabel sx={{ color: "#94a3b8" }}>View</InputLabel>
                    <Select
                      value={ownershipFilter}
                      label="View"
                      onChange={handleOwnershipChange}
                    >
                      <MenuItem value="">All Proposals</MenuItem>
                      <MenuItem value="mine">My Proposals</MenuItem>
                    </Select>
                  </FormControl>
                )}

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Date"
                    value={dateFilter ? dayjs(dateFilter) : null}
                    onChange={handleDateChange}
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
                        {headers.map((header) => (
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
                                  {proposal.projectTitle.charAt(0).toUpperCase()}
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
                                {proposal.clientEmail || "N/A"}
                              </Typography>
                            </TableCell>

                            {isAdmin && (
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip
                                    avatar={
                                      <Avatar
                                        sx={{
                                          bgcolor: proposal.createdBy?._id === user?.id ? '#f3a833' : '#f59e0b',
                                          width: 24,
                                          height: 24,
                                          fontSize: "0.75rem",
                                        }}
                                      >
                                        {proposal.createdBy?.name?.charAt(0)?.toUpperCase() || "?"}
                                      </Avatar>
                                    }
                                    label={proposal.createdBy?._id === user?.id ? "You" : proposal.createdBy?.name || "Unknown"}
                                    size="small"
                                    sx={{
                                      fontWeight: 600,
                                      bgcolor: proposal.createdBy?._id === user?.id
                                        ? alpha('#f3a833', 0.1)
                                        : alpha('#f59e0b', 0.1),
                                      color: proposal.createdBy?._id === user?.id ? '#f3a833' : '#f59e0b',
                                    }}
                                  />
                                  {proposal.createdBy?._id && proposal.createdBy?._id !== user?.id && (
                                    <Tooltip title="View BDO" arrow>
                                      <IconButton
                                        size="small"
                                        onClick={() => router.push(`/admin/bdo/${proposal.createdBy?._id}`)}
                                        sx={{
                                          ml: 0.5,
                                          bgcolor: alpha('#f3a833', 0.1),
                                          '&:hover': { bgcolor: alpha('#f3a833', 0.2) },
                                        }}
                                      >
                                        <VisibilityIcon sx={{ color: '#f3a833', fontSize: 18 }} />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              </TableCell>
                            )}

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
                                <Tooltip title="Move to Trash" arrow>
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
                      </AnimatePresence>
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
      {/* Offscreen PDF render container */}
      {downloadingProposal && (
        <Box sx={{ position: "absolute", left: "-9999px", top: "-9999px", width: "800px", zIndex: -1000, pointerEvents: "none" }}>
          <UnifiedPdfEditor
            pdfPages={downloadingProposal.pdfPages}
            mode="edit-doc"
            clientName={downloadingProposal.clientName}
            date={downloadingProposal.date || downloadingProposal.createdAt}
            isStudioMode={false}
            zoomLevel={100}
          />
        </Box>
      )}

      {/* Dynamic PDF compilation backdrop loader */}
      <Backdrop
        sx={{
          color: '#f3a833',
          zIndex: (theme) => theme.zIndex.drawer + 101,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
        }}
        open={pdfGeneratingId !== null}
      >
        <CircularProgress color="inherit" size={60} thickness={4} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 700 }}>
            Generating High-Quality PDF
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
            Converting and slicing pages to A4 for a pixel-perfect print...
          </Typography>
        </Box>
      </Backdrop>
    </Box>
  );
};

export default ProposalPage;
