// src/components/pdf/PaymentTermsPage.jsx
import { Box, Typography, TextField, Button, Alert, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip } from "@mui/material";
import React, { useState, useRef, useEffect } from "react";
import CustomHeaderFooter from "../CustomHeaderFooter";
import WarningIcon from "@mui/icons-material/Warning";
import EditIcon from "@mui/icons-material/Edit";
import { useDispatch, useSelector } from "react-redux";
import { updateTitle, addTerm, updateTerm, deleteTerm, resetTerms } from "../../utils/paymentTermsPageSlice";
import { showToast } from "../../utils/toastSlice";
import axiosInstance from "../../utils/axiosInstance";
import { RefreshOutlined } from "@mui/icons-material";

// === A4 Constants ===
const A4_HEIGHT_PX = 1123;
const MAX_PAGE_HEIGHT = A4_HEIGHT_PX;

const PaymentTermsPage = ({
  mode = "dev",
  selectedFont = "'Poppins', sans-serif",
  selectedLayout = {},
}) => {
  const dispatch = useDispatch();
  const { title, terms } = useSelector(state => state.paymentTerms);

  const pageRef = useRef(null);
  const [newTerm, setNewTerm] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  // Limit States
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  const [hasShownLimitModal, setHasShownLimitModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // === Height Checker ===
  const checkPageHeight = () => {
    if (!pageRef.current) return;
    const height = pageRef.current.scrollHeight;
    const exceeded = height > MAX_PAGE_HEIGHT;

    setIsLimitExceeded(exceeded);

    if (exceeded && !hasShownLimitModal) {
      setShowLimitModal(true);
      setHasShownLimitModal(true);
    }
  };

  useEffect(() => {
  const handleScroll = () => {
    if (!pageRef.current) return;
    const rect = pageRef.current.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;

    if (inView) {
      const height = pageRef.current.scrollHeight;
      const exceeded = height > MAX_PAGE_HEIGHT;
      setIsLimitExceeded(exceeded);

      if (exceeded && !hasShownLimitModal) {
        setShowLimitModal(true);
        setHasShownLimitModal(true);
      }
    }
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [hasShownLimitModal]);


  // === Safe Add ===
  const safeAdd = (addFn) => {
    if (isLimitExceeded) {
      if (!hasShownLimitModal) setShowLimitModal(true);
      return;
    }
    addFn();
  };

  // === CRUD Handlers (Redux Dispatch) ===
  const handleAdd = () => {
    if (newTerm.trim() === "") return;
    safeAdd(() => {
      dispatch(addTerm(newTerm.trim()));
      setNewTerm("");
    });
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditValue(terms[index]);
  };

  const handleSave = (index) => {
    dispatch(updateTerm({ index, value: editValue }));
    setEditIndex(null);
  };

  const handleDelete = (index) => {
    dispatch(deleteTerm(index));
  };

  const handleSaveTitle = () => {
    dispatch(updateTitle(tempTitle));
    setIsEditingTitle(false);
  };

  
    const handleReset = async () => {
      if (!window.confirm("Are you sure you want to reset this page to default?"))
        return;
  
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  
      try {
        // 🔹 1. Send default data to backend to reset DB
        await axiosInstance.post(`/api/proposals/pages/reset/paymentTermsPage/${user.id}`, {
          title, terms
        });
  
        // 🔹 2. Reset Redux store
        dispatch(resetTerms());
  
        dispatch(
          showToast({ message: "Page reset to default", severity: "success" })
        );
      } catch (err) {
        console.error(err);
        dispatch(
          showToast({ message: "Failed to reset page", severity: "error" })
        );
      }
    };


  return (
    <CustomHeaderFooter selectedLayout={selectedLayout}>
      {mode === 'dev' && (
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Button size="small" onClick={handleReset} color="warning">
                  Reset Page Data To Default <RefreshOutlined fontSize="small" />
                </Button>
              </Box>
            )}
      <Box
        ref={pageRef}
        sx={{
          px: 10,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          fontFamily: selectedFont,
          position: "relative",
        }}
      >
        {/* Warning Banner */}
        {isLimitExceeded && mode === "dev" && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2, borderRadius: 2 }}>
            Page height limit exceeded! You can edit/delete but cannot add new terms.
          </Alert>
        )}

        <Box sx={{ padding: "20px", width: "100%", maxWidth: "100%", margin: "0 auto", boxSizing: "border-box" }}>
          {/* Editable Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            {isEditingTitle && mode === "dev" ? (
              <>
                <TextField
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  size="small"
                  sx={{ flex: 1, maxWidth: 400 }}
                />
                <Button onClick={handleSaveTitle} size="small" variant="contained" sx={{ textTransform: "none" }}>
                  Save
                </Button>
                <Button onClick={() => { setIsEditingTitle(false); setTempTitle(title); }} size="small" sx={{ textTransform: "none" }}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    fontSize: "22px",
                    color: "#000",
                    fontFamily: selectedFont,
                  }}
                >
                  {title}
                </Typography>
                {mode === "dev" && (
                  <IconButton size="small" onClick={() => { setIsEditingTitle(true); setTempTitle(title); }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </>
            )}
          </Box>

          {/* Terms List */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {terms.map((term, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  borderBottom: index < terms.length - 1 ? "1px solid #e0e0e0" : "none",
                }}
              >
                {editIndex === index && mode !== "prod" ? (
                  <>
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      multiline
                      rows={2}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      sx={{
                        "& .MuiInputBase-input": {
                          fontSize: "15px",
                          fontFamily: selectedFont,
                        },
                      }}
                    />
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        onClick={() => handleSave(index)}
                        size="small"
                        sx={{
                          backgroundColor: "#4CAF50",
                          color: "#fff",
                          textTransform: "none",
                          "&:hover": { backgroundColor: "#43A047" },
                          fontFamily: selectedFont,
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => setEditIndex(null)}
                        size="small"
                        sx={{
                          backgroundColor: "#9E9E9E",
                          color: "#fff",
                          textTransform: "none",
                          "&:hover": { backgroundColor: "#757575" },
                          fontFamily: selectedFont,
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography
                      sx={{
                        fontSize: "15px",
                        color: "#111",
                        fontFamily: selectedFont,
                        lineHeight: 1.5,
                      }}
                    >
                      {term}
                    </Typography>

                    {mode !== "prod" && (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          onClick={() => handleEdit(index)}
                          size="small"
                          sx={{
                            backgroundColor: "#1976d2",
                            color: "#fff",
                            textTransform: "none",
                            fontFamily: selectedFont,
                            "&:hover": { backgroundColor: "#1565c0" },
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(index)}
                          size="small"
                          sx={{
                            backgroundColor: "#d32f2f",
                            color: "#fff",
                            textTransform: "none",
                            fontFamily: selectedFont,
                            "&:hover": { backgroundColor: "#c62828" },
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            ))}
          </Box>

          {/* Add New Term */}
          {mode !== "prod" && (
            <Box sx={{ mt: 4 }}>
              <TextField
                fullWidth
                placeholder="Add new term..."
                variant="outlined"
                size="small"
                multiline
                rows={2}
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                disabled={isLimitExceeded}
                sx={{
                  fontFamily: selectedFont,
                  "& .MuiInputBase-input": {
                    fontSize: "15px",
                    fontFamily: selectedFont,
                  },
                }}
              />
              <Button
                onClick={handleAdd}
                disabled={isLimitExceeded || newTerm.trim() === ""}
                sx={{
                  mt: 2,
                  backgroundColor: isLimitExceeded || newTerm.trim() === "" ? "#ccc" : "#000",
                  color: "#fff",
                  textTransform: "none",
                  fontFamily: selectedFont,
                  "&:hover": {
                    backgroundColor: isLimitExceeded || newTerm.trim() === "" ? "#ccc" : "#333",
                  },
                  cursor: isLimitExceeded || newTerm.trim() === "" ? "not-allowed" : "pointer",
                }}
              >
                Add Term
              </Button>
            </Box>
          )}
        </Box>

        {/* Height Limit Modal */}
        <Dialog
          open={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 5,
              overflow: "hidden",
              background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "6px",
                background: "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 2s infinite",
              },
              "@keyframes shimmer": {
                "0%": { backgroundPosition: "-200% 0" },
                "100%": { backgroundPosition: "200% 0" },
              },
            },
          }}
        >
                   <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexDirection: "column", // stack icon and text vertically
              textAlign: "center",
              fontWeight: 700,
            }}
          >
            <WarningIcon sx={{ color: "#f44336", fontSize: 30 }} />
            <Typography
              variant="h6"
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 700,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 700,
              }}
            >
              Page Limit Exceeded
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography sx={{ mb: 2 }}>
              This page has exceeded the A4 height limit of <strong>{MAX_PAGE_HEIGHT}px</strong>.
            </Typography>
            <Typography>You can still <strong>edit or delete</strong> elements.</Typography>
            <Typography sx={{ mt: 1 }}>To add more: delete some content or clone this page.</Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              onClick={() => setShowLimitModal(false)}
              variant="contained"
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": { background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)" },
              }}
            >
              Got it
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </CustomHeaderFooter>
  );
};

export default PaymentTermsPage;