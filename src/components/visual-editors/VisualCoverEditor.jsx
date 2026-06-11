"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Button, IconButton, Tooltip, Stack, Chip } from "@mui/material";
import { CloudUpload, Delete, Edit, Link as LinkIcon } from "@mui/icons-material";
import { setBrandName, setBrandTagline, setClientLogo, setClientLogoFit, setClientSectionVisibility } from "../../utils/page1Slice";
import { updateField } from "../../utils/proposalSlice";
import { showToast } from "../../utils/toastSlice";
import debounce from "lodash.debounce";
import { COVER_BG, LOGO } from "../../utils/pdfImageAssets";
import { resolveImageUrl } from "../../utils/resolveImageUrl";
import { uploadImageFile } from "../../utils/uploadImage";

const VisualCoverEditor = ({ isStudioMode = true }) => {
  const dispatch = useDispatch();
  const currentMode = useSelector((state) => state.page1Slice.currentMode || "create");
  const page1 = useSelector((state) => state.page1Slice[currentMode] || state.page1Slice);

  // Also get proposal data for Client Section
  const formDataRT = useSelector((state) => state.proposal);
  const clientName = formDataRT?.clientName || "Valued Client";
  const date = formDataRT?.date || "January 2026";
  // Sync brand name from the proposal form field
  const proposalBrandName = formDataRT?.brandName || "";


  const [localName, setLocalName] = useState(page1.brandName || "Your Brand");
  const [localTagline, setLocalTagline] = useState(page1.brandTagline || "Your Tagline Here");
  const [localLogo, setLocalLogo] = useState(page1.clientLogo || null);
  const clientLogoFit = page1.clientLogoFit || "contain";
  const [localClientName, setLocalClientName] = useState(clientName);
  const [localDate, setLocalDate] = useState(date);

  const nameRef = useRef(null);
  const taglineRef = useRef(null);
  const clientNameRef = useRef(null);
  const dateRef = useRef(null);

  // Sync brandName and tagline via state (safe — those fields use EditableText pattern)
  useEffect(() => {
    if (page1.brandTagline && page1.brandTagline !== localTagline && document.activeElement !== taglineRef.current) {
      setLocalTagline(page1.brandTagline);
    }
    if (page1.clientLogo !== localLogo) {
      setLocalLogo(page1.clientLogo || null);
    }
  }, [page1.brandTagline, page1.clientLogo]);

  // Sync brand name directly to DOM ref (from proposal form field)
  useEffect(() => {
    const name = proposalBrandName || page1.brandName;
    if (name && nameRef.current && document.activeElement !== nameRef.current) {
      nameRef.current.textContent = name;
      // Also keep page1Slice in sync
      if (proposalBrandName && proposalBrandName !== page1.brandName) {
        dispatch(setBrandName(proposalBrandName));
      }
    }
  }, [proposalBrandName, page1.brandName]);

  // Sync clientName directly to DOM ref to avoid React re-render cursor bug
  useEffect(() => {
    if (clientNameRef.current && document.activeElement !== clientNameRef.current) {
      clientNameRef.current.textContent = clientName;
    }
  }, [clientName]);

  // Sync date directly to DOM ref
  useEffect(() => {
    if (dateRef.current && document.activeElement !== dateRef.current) {
      dateRef.current.textContent = date;
    }
  }, [date]);

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
    // Do NOT call setLocalClientName — would trigger re-render and reset cursor position
    debouncedSaveClientName(e.currentTarget.textContent);
  };

  const handleDateInput = (e) => {
    // Do NOT call setLocalDate — same reason
    debouncedSaveDate(e.currentTarget.textContent);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        dispatch(showToast({ message: "Image size should be less than 5MB", severity: "error" }));
        return;
      }
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const base64Url = reader.result;
          dispatch(setClientLogo(base64Url));
          setLocalLogo(base64Url);
          dispatch(showToast({ message: "Logo added to UI successfully!", severity: "success" }));
        };
        reader.onerror = (err) => {
          console.error(err);
          dispatch(showToast({ message: "Failed to read logo file", severity: "error" }));
        };
      } catch (err) {
        console.error(err);
        dispatch(showToast({ message: "Failed to load logo", severity: "error" }));
      }
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
      <img
        src={COVER_BG}
        alt=""
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          zIndex: 1,
        }}
      />
      {/* Visual Indicator of Edit Mode */}
      {isStudioMode && (
        <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 50 }}>
          <Typography variant="caption" sx={{ bgcolor: "rgba(0,0,0,0.5)", color: "white", px: 1, py: 0.5, borderRadius: '10px' }}>
            <Edit sx={{ fontSize: 12, mr: 0.5, verticalAlign: "middle" }} />
            Click text to edit
          </Typography>
        </Box>
      )}

      {/* Top Left Logo Area (HT Logo) */}
      <Box sx={{ position: "absolute", top: "60px", left: "67px", zIndex: 2 }}>
        <img src={LOGO} alt="Logo" style={{ width: "200px", height: "200px", objectFit: "contain" }} />
      </Box>

      {/* Main Content Area */}
      <Box sx={{ position: "absolute", top: "470px", left: "67px", right: "27px", zIndex: 2 }}>

        {/* Brand Name + Decorative Line + Form Field badge */}
        <Box sx={{ position: "relative", mb: 0 }}>
          {isStudioMode && (
            <Chip
              icon={<LinkIcon sx={{ fontSize: "12px !important", color: "#60a5fa !important" }} />}
              label="Form Field"
              size="small"
              sx={{
                position: "absolute",
                top: -20,
                left: 0,
                bgcolor: "rgba(96,165,250,0.15)",
                color: "#60a5fa",
                fontWeight: 600,
                border: "1px solid rgba(96,165,250,0.35)",
                fontSize: "10px",
                height: 20,
                zIndex: 2,
              }}
            />
          )}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              ref={nameRef}
              contentEditable={isStudioMode}
              suppressContentEditableWarning
              onInput={handleNameInput}
              sx={{
                color: "white",
                fontSize: 24,
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
            />
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
              fontSize: 63,
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
        <Typography sx={{ color: "white", fontSize: 22, fontWeight: 600, mt: "53px" }}>
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
            <Box sx={{ position: "relative", "&:hover .logo-overlay": { opacity: 1 }, "&:hover .logo-controls": { opacity: 1 } }}>
              <Box sx={{
                width: "94px", height: "94px", borderRadius: "47px",
                backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
                border: clientLogoFit === "fill" ? "none" : "5px solid #FFFFFF", overflow: "hidden"
              }}>
                {localLogo ? (
                  <img src={resolveImageUrl(localLogo)} alt="Client Logo" style={{ width: "100%", height: "100%", objectFit: clientLogoFit === "fill" ? "cover" : "contain" }} />
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
              {isStudioMode && localLogo && (
                <Box className="logo-controls" sx={{ position: "absolute", bottom: -24, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 0.5, opacity: 0, transition: "opacity 0.2s" }}>
                  <Button
                    size="small"
                    onClick={() => dispatch(setClientLogoFit("fit"))}
                    variant={clientLogoFit === "fit" ? "contained" : "outlined"}
                    sx={{ minWidth: 0, px: 1, py: 0, fontSize: 10, borderRadius: "4px", borderColor: "#f3a833", color: clientLogoFit === "fit" ? "#fff" : "#f3a833", bgcolor: clientLogoFit === "fit" ? "#f3a833" : "transparent", "&:hover": { bgcolor: "#f3a833", color: "#fff" } }}
                  >Fit</Button>
                  <Button
                    size="small"
                    onClick={() => dispatch(setClientLogoFit("fill"))}
                    variant={clientLogoFit === "fill" ? "contained" : "outlined"}
                    sx={{ minWidth: 0, px: 1, py: 0, fontSize: 10, borderRadius: "4px", borderColor: "#f3a833", color: clientLogoFit === "fill" ? "#fff" : "#f3a833", bgcolor: clientLogoFit === "fill" ? "#f3a833" : "transparent", "&:hover": { bgcolor: "#f3a833", color: "#fff" } }}
                  >Fill</Button>
                </Box>
              )}
            </Box>

            {/* Client Details */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <Typography sx={{ color: "#FFFFFF", fontSize: 15, textTransform: "uppercase", letterSpacing: 1.3, opacity: 0.8 }}>
                Prepared for:
              </Typography>
              {/* Client name row with Form Field badge to the right */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box ref={clientNameRef} contentEditable={isStudioMode} suppressContentEditableWarning onInput={handleClientNameInput}
                  sx={{ color: "#FF8C00", fontSize: 28, fontWeight: "bold", outline: "none", minWidth: "80px", borderBottom: isStudioMode ? "1px dashed transparent" : "none", "&:hover, &:focus": isStudioMode ? { borderBottom: "1px dashed rgba(255,140,0,0.5)", bgcolor: "rgba(255,140,0,0.05)" } : {} }}
                />
                {isStudioMode && (
                  <Chip
                    icon={<LinkIcon sx={{ fontSize: "12px !important", color: "#60a5fa !important" }} />}
                    label="Form Field"
                    size="small"
                    sx={{
                      bgcolor: "rgba(96,165,250,0.15)",
                      color: "#60a5fa",
                      fontWeight: 600,
                      border: "1px solid rgba(96,165,250,0.35)",
                      fontSize: "10px",
                      height: 20,
                      flexShrink: 0,
                    }}
                  />
                )}
              </Box>
              <Box ref={dateRef} contentEditable={isStudioMode} suppressContentEditableWarning onInput={handleDateInput}
                sx={{ color: "#FFFFFF", fontSize: 15, opacity: 0.7, outline: "none", minWidth: "60px", borderBottom: isStudioMode ? "1px dashed transparent" : "none", "&:hover, &:focus": isStudioMode ? { borderBottom: "1px dashed rgba(255,255,255,0.3)", bgcolor: "rgba(255,255,255,0.05)" } : {} }}
              />
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
