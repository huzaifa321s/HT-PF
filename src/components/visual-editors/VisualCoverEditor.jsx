"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Button, IconButton, Tooltip, Stack } from "@mui/material";
import { CloudUpload, Delete, Edit } from "@mui/icons-material";
import { setBrandName, setBrandTagline, setClientLogo, setClientSectionVisibility } from "../../utils/page1Slice";
import { updateField } from "../../utils/proposalSlice";
import { showToast } from "../../utils/toastSlice";
import debounce from "lodash.debounce";

const VisualCoverEditor = ({ isStudioMode = true }) => {
  const dispatch = useDispatch();
  const currentMode = useSelector((state) => state.page1Slice.currentMode || "create");
  const page1 = useSelector((state) => state.page1Slice[currentMode] || state.page1Slice);

  // Also get proposal data for Client Section
  const formDataRT = useSelector((state) => state.proposal);
  const clientName = formDataRT?.clientName || "Valued Client";
  const date = formDataRT?.date || "January 2026";

  const [localName, setLocalName] = useState(page1.brandName || "Your Brand");
  const [localTagline, setLocalTagline] = useState(page1.brandTagline || "Your Tagline Here");
  const [localLogo, setLocalLogo] = useState(page1.clientLogo || null);
  const [localClientName, setLocalClientName] = useState(clientName);
  const [localDate, setLocalDate] = useState(date);

  const nameRef = useRef(null);
  const taglineRef = useRef(null);
  const clientNameRef = useRef(null);
  const dateRef = useRef(null);

  useEffect(() => {
    if (page1.brandName && page1.brandName !== localName && document.activeElement !== nameRef.current) {
      setLocalName(page1.brandName);
    }
    if (page1.brandTagline && page1.brandTagline !== localTagline && document.activeElement !== taglineRef.current) {
      setLocalTagline(page1.brandTagline);
    }
    if (page1.clientLogo !== localLogo) {
      setLocalLogo(page1.clientLogo || null);
    }
    if (clientName && document.activeElement !== clientNameRef.current) {
      setLocalClientName(clientName);
    }
    if (date && document.activeElement !== dateRef.current) {
      setLocalDate(date);
    }
  }, [page1.brandName, page1.brandTagline, page1.clientLogo, clientName, date]);

  const debouncedSaveName = useCallback(
    debounce((val) => dispatch(setBrandName(val)), 500),
    [dispatch]
  );

  const debouncedSaveTagline = useCallback(
    debounce((val) => dispatch(setBrandTagline(val)), 500),
    [dispatch]
  );

  const debouncedSaveClientName = useCallback(
    debounce((val) => dispatch(updateField({ field: "clientName", value: val })), 500),
    [dispatch]
  );

  const debouncedSaveDate = useCallback(
    debounce((val) => dispatch(updateField({ field: "date", value: val })), 500),
    [dispatch]
  );

  const handleNameInput = (e) => {
    const val = e.currentTarget.textContent;
    setLocalName(val);
    debouncedSaveName(val);
  };

  const handleTaglineInput = (e) => {
    const val = e.currentTarget.textContent;
    setLocalTagline(val);
    debouncedSaveTagline(val);
  };

  const handleClientNameInput = (e) => {
    const val = e.currentTarget.textContent;
    setLocalClientName(val);
    debouncedSaveClientName(val);
  };

  const handleDateInput = (e) => {
    const val = e.currentTarget.textContent;
    setLocalDate(val);
    debouncedSaveDate(val);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        dispatch(showToast({ message: "Image size should be less than 5MB", severity: "error" }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(setClientLogo(reader.result));
        setLocalLogo(reader.result);
        dispatch(showToast({ message: "Client Logo uploaded successfully!", severity: "success" }));
      };
      reader.readAsDataURL(file);
    }
  };

  const showClientSection = page1.showClientSection !== false;

  return (
    <Box
      sx={{
        position: "relative",
        width: "800px",
        height: "1131px",
        margin: "0 auto",
        backgroundColor: "#1a1a1a",
        boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
        overflow: "hidden",
        fontFamily: "'Oswald', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* Background Image — use <img> instead of CSS backgroundImage for reliable html2canvas rendering */}
      <img
        src="/newBg.png"
        alt=""
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          zIndex: 0,
        }}
      />
      {/* Visual Indicator of Edit Mode */}
      {isStudioMode && (
        <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 50 }}>
          <Typography variant="caption" sx={{ bgcolor: "rgba(0,0,0,0.5)", color: "white", px: 1, py: 0.5, borderRadius: 1 }}>
            <Edit sx={{ fontSize: 12, mr: 0.5, verticalAlign: "middle" }} />
            Click text to edit
          </Typography>
        </Box>
      )}

      {/* Top Left Logo Area (HT Logo) */}
      <Box sx={{ position: "absolute", top: "67px", left: "67px", display: "flex", flexDirection: "row", alignItems: "center", gap: "8px", zIndex: 1 }}>
        <img src="/download.jpg" alt="Logo" style={{ width: "67px", height: "67px", borderRadius: "34px", objectFit: "cover" }} />
        <Box>
          <Typography sx={{ color: "#F3A833", fontSize: 29, fontWeight: 900, letterSpacing: 0, lineHeight: 1, fontFamily: "'Inter', sans-serif" }}>HUMANTEK</Typography>
          <Typography sx={{ color: "white", fontSize: 13, letterSpacing: 3, mt: 0, lineHeight: 1 }}>IT SERVICES & SOLUTIONS</Typography>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ position: "absolute", top: "470px", left: "67px", right: "27px", zIndex: 1 }}>

        {/* Brand Name + Decorative Line */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 0 }}>
          <Box
            ref={nameRef}
            contentEditable={isStudioMode}
            suppressContentEditableWarning
            onInput={handleNameInput}
            sx={{
              color: "white",
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "'Unbounded', sans-serif",
              outline: "none",
              borderBottom: isStudioMode ? "1px dashed transparent" : "none",
              whiteSpace: "nowrap",
              "&:hover, &:focus": isStudioMode ? {
                borderBottom: "1px dashed rgba(243, 168, 51, 0.2)",
                bgcolor: "rgba(255,255,255,0.05)"
              } : {}
            }}
          >
            {localName}
          </Box>

          <Box
            sx={{
              flex: 1,
              height: 2,
              ml: 1.5,
              background: "linear-gradient(90deg, #F3A833 0%, #F3A833 70%, transparent 100%)",
              borderRadius: "1px"
            }}
          />
        </Box>

        {/* Brand Tagline */}
        <Box sx={{ mt: 1, mb: 0 }}>
          <Box
            ref={taglineRef}
            contentEditable={isStudioMode}
            suppressContentEditableWarning
            onInput={handleTaglineInput}
            sx={{
              color: "#F3A833",
              fontSize: 61,
              fontWeight: 900,
              lineHeight: 1.1,
              fontFamily: "'Unbounded', sans-serif",
              outline: "none",
              border: isStudioMode ? "1px dashed transparent" : "none",
              "&:hover, &:focus": isStudioMode ? {
                border: "1px dashed rgba(243,168,51,0.5)",
                bgcolor: "rgba(243,168,51,0.05)"
              } : {}
            }}
          >
            {localTagline?.trim().toLowerCase() === "crafting legacies that last" ? (
              <>
                <Box component="span" sx={{ color: "#F3A833", display: "block", whiteSpace: "nowrap" }}>
                  Crafting Legacies
                </Box>
                <Box component="span" sx={{ color: "#FFFFFF", display: "block", fontSize: "0.75em", mt: 1 }}>
                  That Last
                </Box>
              </>
            ) : (
              localTagline
            )}
          </Box>
        </Box>

        {/* Proposal By */}
        <Typography sx={{ color: "white", fontSize: 20, fontWeight: 600, mt: "53px" }}>
          Proposal by <span style={{ color: "#F3A833" }}>Humantek</span>
        </Typography>

        {/* Client Section */}
        {showClientSection ? (
          <Box
            sx={{
              display: "flex", flexDirection: "row", alignItems: "center",
              gap: "20px", mt: "53px", position: "relative",
              "&:hover .client-section-delete": { opacity: 1 }
            }}
          >
            {/* Delete entire client section button */}
            {isStudioMode && (
              <Tooltip title="Remove client info section" placement="top">
                <IconButton
                  className="client-section-delete"
                  onClick={() => {
                    dispatch(setClientSectionVisibility(false));
                    dispatch(showToast({
                      message: "Client info section removed",
                      severity: "info",
                      undoAction: setClientSectionVisibility(true)
                    }));
                  }}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: -28,
                    right: 0,
                    opacity: 0,
                    transition: "opacity 0.2s",
                    bgcolor: "rgba(220,38,38,0.85)",
                    color: "white",
                    p: 0.5,
                    "&:hover": { bgcolor: "rgba(220,38,38,1)", transform: "scale(1.1)" }
                  }}
                >
                  <Delete sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}

            {/* Client Logo */}
            <Box sx={{ position: "relative", "&:hover .logo-overlay": { opacity: 1 } }}>
              <Box sx={{ width: "94px", height: "94px", borderRadius: "47px", backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", border: "5px solid #FFFFFF", overflow: "hidden" }}>
                {localLogo ? (
                  <img src={localLogo} alt="Client Logo" style={{ maxWidth: "60px", maxHeight: "60px", objectFit: "contain" }} />
                ) : (
                  <Typography sx={{ fontSize: 10, color: "#ccc", textAlign: "center" }}>No Client<br />Logo</Typography>
                )}
              </Box>
              {isStudioMode && (
                <Box className="logo-overlay" component="label" sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, bgcolor: "rgba(0,0,0,0.6)", borderRadius: "47px", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s", cursor: "pointer", border: "5px solid transparent" }}>
                  <CloudUpload sx={{ color: "white", fontSize: 32 }} />
                  <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                </Box>
              )}
            </Box>

            {/* Client Details */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <Typography sx={{ color: "#FFFFFF", fontSize: 13, textTransform: "uppercase", letterSpacing: 1.3, opacity: 0.8 }}>
                Prepared for:
              </Typography>
              <Box ref={clientNameRef} contentEditable={isStudioMode} suppressContentEditableWarning onInput={handleClientNameInput}
                sx={{ color: "#FF8C00", fontSize: 26, fontWeight: "bold", outline: "none", minWidth: "80px", borderBottom: isStudioMode ? "1px dashed transparent" : "none", "&:hover, &:focus": isStudioMode ? { borderBottom: "1px dashed rgba(255,140,0,0.5)", bgcolor: "rgba(255,140,0,0.05)" } : {} }}
              >
                {localClientName}
              </Box>
              <Box ref={dateRef} contentEditable={isStudioMode} suppressContentEditableWarning onInput={handleDateInput}
                sx={{ color: "#FFFFFF", fontSize: 13, opacity: 0.7, outline: "none", minWidth: "60px", borderBottom: isStudioMode ? "1px dashed transparent" : "none", "&:hover, &:focus": isStudioMode ? { borderBottom: "1px dashed rgba(255,255,255,0.3)", bgcolor: "rgba(255,255,255,0.05)" } : {} }}
              >
                {localDate}
              </Box>
            </Box>
          </Box>
        ) : (
          isStudioMode && (
            <Box sx={{ mt: "53px" }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => dispatch(setClientSectionVisibility(true))}
                sx={{ color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.2)", borderStyle: "dashed", fontSize: 11, textTransform: "none", "&:hover": { borderColor: "#f3a833", color: "#f3a833" } }}
              >
                + Add Client Info
              </Button>
            </Box>
          )
        )}

      </Box>
    </Box>
  );
};

export default VisualCoverEditor;
