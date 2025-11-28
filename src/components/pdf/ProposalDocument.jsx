// src/components/pdf/ProposalDocument.jsx
import {
  Box,
  Paper,
  Button,
  Grid,
  Typography,
  IconButton,
  Tooltip,
  Pagination,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useState, useRef, memo, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Page2BrandedCover from "./Page2BrandedCover";
import Page3AdditionalInfo from "./Page3AdditionalInfo";
import Page4AboutHumantek from "./Page4AboutHumantek";
import Page5Contact from "./Page5Contact";
import PaymentTermsPage from "./PaymentTermsPage";
// import PricingTable from "./PricingTable";
import CustomContentPage from "./CustomContentPage";
import BlankContentPage from "./BlankContentPage";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../utils/toastSlice";
import { clonePage, deletePage, resetPages } from "../../utils/pagesSlice";
import axiosInstance from "../../utils/axiosInstance";
import {
  loadStoreFromBackend,
  saveStoreToBackend,
} from "../../utils/store";
import { RefreshOutlined } from "@mui/icons-material";
import BlankPage from "./BlankPage";

const ProposalDocument = ({ formData, pdfRef, mode = "dev" }) => {
  const dispatch = useDispatch();
  const pages = useSelector((state) => state.pages.pages); // Redux se pages

  const [selectedPage, setSelectedPage] = useState(0);
  const pageRefs = useRef([]);

  // === Page Renderer ===
  const renderPage = (page, index) => {
    const props = { formData, mode, pageId: page.id }; // ✅ Pass pageId
    switch (page.type) {
      case "Page2BrandedCover":
        return <Page2BrandedCover key={page.id} {...props} />;
      case "Page3AdditionalInfo":
        return <Page3AdditionalInfo key={page.id} {...props} />;
      case "Page4AboutHumantek":
        return <Page4AboutHumantek key={page.id} {...props} />;
      case "PricingTable":
        return <></>;
      case "PaymentTermsPage":
        return <PaymentTermsPage key={page.id} {...props} />;
      case "Page5Contact":
        return <Page5Contact key={page.id} {...props} />;
      case "CustomContentPage":
        return <CustomContentPage key={page.id} {...props} />;
      case "BlankContentPage":
        return <BlankContentPage key={page.id} {...props} />;
        case "blankPage":
        return <BlankPage key={page.id} {...props} />;
      default:
        return null;
    }
  };

  // === Page Controls ===
  const handleClonePage = (index) => {
    dispatch(clonePage(index));
    dispatch(showToast({ message: `Page ${index + 1} cloned`, severity: "success" }));
  };

  const handleDeletePage = (index) => {
    if (pages.length > 1) {
      dispatch(deletePage(index));
      if (selectedPage >= pages.length - 1) setSelectedPage(pages.length - 2);
      dispatch(showToast({ message: `Page ${index + 1} deleted`, severity: "success" }));
    }
  };

  const scrollToPage = (index) => {
    pageRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setSelectedPage(index);
  };

  const handleNextPage = (currentIndex) => {
    if (currentIndex < pages.length - 1) {
      scrollToPage(currentIndex + 1);
    }
  };

  const handlePrevPage = (currentIndex) => {
    if (currentIndex > 0) {
      scrollToPage(currentIndex - 1);
    }
  };

  // Load Redux store from backend on app start
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    if (user.id) {
      loadStoreFromBackend(user.id, dispatch);
    }
  }, [dispatch]);

  // Watch slices for auto-save
  const businessInfo = useSelector((s) => s.businessInfo);
  const form = useSelector((s) => s.form);
  const pagesRT = useSelector((s) => s.pages);
  const customContent = useSelector((s) => s.customContent);
  const blankContent = useSelector((s) => s.blankContent);
  const pricing = useSelector((s) => s.pricing);
  const paymentTerms = useSelector((s) => s.paymentTerms);
  const currentMode = useSelector((s) => s.page1Slice.currentMode);
  const page1 = useSelector((s) => s.page1Slice);
  const page2 = useSelector((s) => s.page2);
  const page3 = useSelector((s) => s.page3);

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (user.id) {
        saveStoreToBackend(user.id);
      }
    }, 1200);

    return () => clearTimeout(timeout);
  }, [
    businessInfo,
    form,
    pagesRT,
    customContent,
    blankContent,
    pricing,
    paymentTerms,
    page1Slice,
    page2,
    page3,
  ]);

  // Confirm Reset Modal
  const [openConfirm, setOpenConfirm] = useState(false);
  const handleOpenConfirm = () => setOpenConfirm(true);
  const handleCloseConfirm = () => setOpenConfirm(false);

  const ConfirmResetModal = () => (
    <Dialog open={openConfirm} onClose={handleCloseConfirm}>
      <DialogTitle>Reset Pages Order</DialogTitle>
      <DialogContent>
        <DialogContentText>
          All cloned and custom/blank content pages will be deleted except original pages.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseConfirm} variant="outlined" size="small">Cancel</Button>
        <Button onClick={handleReset} variant="contained" color="warning" size="small">Reset Pages Order</Button>
      </DialogActions>
    </Dialog>
  );

  const handleReset = async () => {
    handleCloseConfirm();
    try {
      await axiosInstance.post(`/api/proposals/pages/reset/all_pages_order/${user.id}`, {
        businessInfo,
        form,
        pagesRT,
        customContent,
        blankContent,
        pricing,
        paymentTerms,
        page1Slice,
        page2,
        page3,
      });

      dispatch(resetPages());
      dispatch(showToast({ message: "Pages reset to default", severity: "success" }));
    } catch (err) {
      console.error(err);
      dispatch(showToast({ message: "Failed to reset pages", severity: "error" }));
    }
  };


  return (
    <Grid item xs={12} md={8}>
      {/* Toolbar - Reset Button */}
      {mode === "dev" && (
        <Paper
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            mb: 2,
            borderRadius: 5,
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            boxShadow: "0 10px 30px rgba(102,126,234,0.08)",
            transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 20px 40px rgba(102,126,234,0.15)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Page Editor
            </Typography>

            {/* Reset Button - Inside Toolbar */}
            <Button
              size="small"
              onClick={handleOpenConfirm}
              color="warning"
              startIcon={<RefreshOutlined fontSize="small" />}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                borderRadius: 2,
                px: 2,
              }}
            >
              Reset All Pages to Default
            </Button>
          </Box>
        </Paper>
      )}

      {/* Confirm Reset Modal - Rendered inside dev mode, but not affecting layout */}
      {mode === "dev" && <ConfirmResetModal />}

      {/* Pages */}
      <Paper
        sx={{
          p: 0,
          mb: 2,
          textAlign: "start",
          maxWidth: "210mm",
          mx: "auto",
          borderRadius: 5,
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          boxShadow: "0 10px 30px rgba(102,126,234,0.08)",
          transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: "0 20px 40px rgba(102,126,234,0.15)",
          },
        }}
      >
        <Box ref={pdfRef}>
          {pages.map((page, index) => (
            <Box
              key={index}
              ref={(el) => (pageRefs.current[index] = el)}
              sx={{
                position: "relative",
                mb: 4,
                overflow: "hidden",
                pageBreakAfter: "always",
                boxSizing: "border-box",
                width: "100%",
              }}
              onClick={() => setSelectedPage(index)}
            >
              {console.log("page",page)}
              {renderPage(page, index)}
              {mode === "dev" && (
                <>
                  {/* Top Right Controls - Page Number, Clone, Delete */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      background: "rgba(255,255,255,0.9)",
                      borderRadius: "8px",
                      px: 1.5,
                      py: 0.5,
                      zIndex: 1000,
                      border: "1px solid black",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "#000" }}
                    >
                      Page {index + 1}
                    </Typography>
                    <Tooltip title="Clone Page">
                      <IconButton
                        size="small"
                        onClick={() => handleClonePage(index)}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Page">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeletePage(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Bottom Navigation - Prev/Next Buttons */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 20,
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      gap: 2,
                      zIndex: 1000,
                    }}
                  >
                    <Tooltip title="Previous Page">
                      <span>
                        <IconButton
                          onClick={() => handlePrevPage(index)}
                          disabled={index === 0}
                          sx={{
                            background: "rgba(255,255,255,0.95)",
                            border: "1px solid #ddd",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            "&:hover": {
                              background: "rgba(102,126,234,0.1)",
                              borderColor: "#667eea",
                            },
                            "&.Mui-disabled": {
                              background: "rgba(200,200,200,0.3)",
                            },
                          }}
                        >
                          <ArrowBackIcon />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Next Page">
                      <span>
                        <IconButton
                          onClick={() => handleNextPage(index)}
                          disabled={index === pages.length - 1}
                          sx={{
                            background: "rgba(255,255,255,0.95)",
                            border: "1px solid #ddd",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            "&:hover": {
                              background: "rgba(102,126,234,0.1)",
                              borderColor: "#667eea",
                            },
                            "&.Mui-disabled": {
                              background: "rgba(200,200,200,0.3)",
                            },
                          }}
                        >
                          <ArrowForwardIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </>
              )}
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Pagination Section - Moved to Bottom */}
      {mode === "dev" && (
        <Paper
          elevation={6}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 5,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 3,
            flexWrap: "wrap",
            maxWidth: 720,
            mx: "auto",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 28px 50px rgba(0,0,0,0.2)",
            },
          }}
        >
          <Typography
            variant="body1"
            sx={{ fontWeight: 700, color: "#fff", fontSize: "1rem" }}
          >
            Go To Page
          </Typography>
          <Stack spacing={2}>
            <Pagination
              count={pages.length}
              page={selectedPage + 1}
              onChange={(_, page) => scrollToPage(page - 1)}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              siblingCount={1}
              boundaryCount={1}
              sx={{
                "& .MuiPaginationItem-root": {
                  borderRadius: "8px",
                  fontWeight: 600,
                  color: "#667eea",
                  background: "#fff",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                    color: "#fff",
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 32px rgba(102,126,234,0.5)",
                  },
                },
                "& .Mui-selected": {
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#fff",
                },
              }}
            />
          </Stack>
        </Paper>
      )}
    </Grid>
  );
};

export default memo(ProposalDocument);