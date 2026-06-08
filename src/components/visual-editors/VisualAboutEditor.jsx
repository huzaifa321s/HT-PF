"use client";
import React, { useCallback, useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, IconButton, Tooltip, Button, Alert, Chip } from "@mui/material";
import { Add, Delete, Edit, Image as ImageIcon, Link as LinkIcon } from "@mui/icons-material";
import { updateTitle, updateSubtitle, editElementContent, addElement, deleteElement, restoreElement } from "../../utils/page3Slice";
import { showToast } from "../../utils/toastSlice";
import debounce from "lodash.debounce";
import EditableText from "../EditableText";
import { HEADER_IMG, FOOTER_IMG } from "../../utils/pdfImageAssets";
import { resolveImageUrl } from "../../utils/resolveImageUrl";
import { uploadImageFile } from "../../utils/uploadImage";

const ImageResizer = ({ element, isStudioMode, onDimensionsChange, onUpload }) => {
  const [localWidth, setLocalWidth] = useState(parseInt(element.dimensions?.width || "90"));
  const [localHeight, setLocalHeight] = useState(element.dimensions?.height || "auto");
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setLocalWidth(parseInt(element.dimensions?.width || "90"));
    setLocalHeight(element.dimensions?.height || "auto");
  }, [element.dimensions?.width, element.dimensions?.height]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const parentRect = containerRef.current.parentElement.getBoundingClientRect();
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate Width
      const newWidthPx = e.clientX - parentRect.left;
      let newWidthPercent = (newWidthPx / parentRect.width) * 100;
      newWidthPercent = Math.max(20, Math.min(100, newWidthPercent));
      
      // Calculate Height
      const newHeightPx = e.clientY - rect.top;
      const newHeight = Math.max(100, newHeightPx); // Min 100px height
      
      setLocalWidth(newWidthPercent);
      setLocalHeight(`${newHeight}px`);
      onDimensionsChange(element.id, Math.round(newWidthPercent), Math.round(newHeight));
    };
    
    const handleMouseUp = () => setIsResizing(false);
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, element.id, onDimensionsChange]);

  return (
    <Box sx={{ width: "100%", position: "relative", my: "18px" }}>
      <Box ref={containerRef} sx={{ position: "relative", width: `${localWidth}%`, mx: "auto" }}>
        
        {element.content ? (
          <img src={resolveImageUrl(element.content)} alt="Block" style={{ width: "100%", height: localHeight, display: "block", objectFit: "fill" }} />
        ) : (
          <Box sx={{ width: "100%", minHeight: 350, bgcolor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed #ccc" }}>
            <Typography color="text.secondary">No Image Uploaded</Typography>
          </Box>
        )}

        {isStudioMode && (
          <Box className="img-overlay" sx={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            bgcolor: "rgba(0,0,0,0.4)", borderRadius: '10px',
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            opacity: 0, transition: "opacity 0.2s", "&:hover": { opacity: 1 }
          }}>
            <Button variant="contained" component="label" startIcon={<ImageIcon />} sx={{ bgcolor: "#FF8C00", "&:hover": { bgcolor: "#e67e22" } }}>
              Change Image
              <input type="file" hidden accept="image/*" onChange={(e) => onUpload(element.id, e)} />
            </Button>
            <Typography variant="caption" sx={{ color: "white", mt: 1, fontWeight: "bold" }}>Width: {Math.round(localWidth)}%</Typography>
          </Box>
        )}

        {/* Drag Handle Corner */}
        {isStudioMode && (
          <Box
            onMouseDown={handleMouseDown}
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 16,
              height: 16,
              bgcolor: "#FF8C00",
              cursor: "nwse-resize",
              borderTopLeftRadius: 8,
              borderBottomRightRadius: 4, // curves inside the image slightly
              zIndex: 10,
              "&:hover": { transform: "scale(1.2)" },
              transition: "transform 0.1s",
              boxShadow: "-2px -2px 5px rgba(0,0,0,0.2)"
            }}
          >
            {/* Inner diagonal lines to look like a drag handle */}
            <Box sx={{ position: "absolute", bottom: 2, right: 2, width: 6, height: 6, borderBottom: "2px solid white", borderRight: "2px solid white" }} />
          </Box>
        )}

      </Box>
    </Box>
  );
};

const VisualAboutEditor = ({ isStudioMode = true }) => {
  const dispatch = useDispatch();
  const currentMode = useSelector((state) => state.page3.currentMode || "create");
  const page3 = useSelector((state) => state.page3[currentMode] || state.page3);
  const elements = page3.elements || [];

  // Sync brand name from proposal form field
  const brandName = useSelector((state) => state.proposal?.brandName || state.page1Slice?.create?.brandName || state.page1Slice?.edit?.brandName || "");

  // Derive the heading: if the stored title looks like a default or is empty, use brandName
  const derivedTitle = (() => {
    const stored = page3.title || "";
    if (!stored || stored === "About Humantek" || stored === "Proposal for Humantek" || stored.startsWith("About ") || stored.startsWith("Proposal for ")) {
      return brandName ? `Proposal for ${brandName}` : "Proposal for Humantek";
    }
    return stored;
  })();

  // Keep Redux in sync when brandName changes and title is default
  useEffect(() => {
    if (brandName) {
      const isDefaultOrSynced = !page3.title || 
                                page3.title === "About Humantek" || 
                                page3.title === "Proposal for Humantek" || 
                                page3.title.startsWith("About ") ||
                                page3.title.startsWith("Proposal for ");
                                
      // Only dispatch if it's actually changing to avoid infinite loops
      const newTitle = `Proposal for ${brandName}`;
      if (isDefaultOrSynced && page3.title !== newTitle) {
        dispatch(updateTitle(newTitle));
      }
    }
  }, [brandName, page3.title, dispatch]);

  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContentHeight(entry.borderBoxSize?.[0]?.blockSize || entry.contentRect.height);
      }
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [elements]);

  const isOverflowing = contentHeight > 850;
  const hasImage = elements.some(e => e.type === "image");
  const textElementsCount = elements.filter(e => e.type === "text").length;

  const debouncedUpdateTitle = useCallback(debounce((val) => dispatch(updateTitle(val)), 500), [dispatch]);
  const debouncedUpdateSubtitle = useCallback(debounce((val) => dispatch(updateSubtitle(val)), 500), [dispatch]);
  const debouncedUpdateElement = useCallback(debounce((id, val) => dispatch(editElementContent({ id, content: val }))), [dispatch]);
  const debouncedUpdateWidth = useCallback(debounce((id, val) => dispatch(editElementContent({ id, width: `${val}%` }))), [dispatch]);
  
  const handleTitleInput = (e) => debouncedUpdateTitle(e.currentTarget.textContent);
  const handleSubtitleInput = (e) => debouncedUpdateSubtitle(e.currentTarget.textContent);
  const handleElementInput = (id, e) => debouncedUpdateElement(id, e.currentTarget.textContent);

  const handleAddTextElement = () => {
    if (isOverflowing || textElementsCount >= 2) return;
    const imageIndex = elements.findIndex(e => e.type === "image");
    dispatch(addElement({ type: "text", content: "Start typing new content here...", index: imageIndex !== -1 ? imageIndex : undefined }));
  };

  const handleImageUpload = async (id, e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        dispatch(showToast({ message: "Uploading to Google Drive...", severity: "info" }));
        const imageUrl = await uploadImageFile(file);
        dispatch(editElementContent({ id, content: imageUrl }));
        dispatch(showToast({ message: "Image uploaded to Google Drive!", severity: "success" }));
      } catch (err) {
        console.error(err);
        dispatch(showToast({ message: err.message || "Failed to upload to Google Drive", severity: "error" }));
      }
    }
  };

  const handleDimensionsChange = (id, newWidth, newHeight) => {
    dispatch(editElementContent({ id, width: `${newWidth}%`, height: `${newHeight}px` }));
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      
      {isOverflowing && isStudioMode && (
        <Alert severity="warning" sx={{ width: "100%", maxWidth: "800px", mb: 2, borderRadius: '10px' }}>
          <strong>Page Overflow Warning:</strong> Your content exceeds a single A4 page. Please remove text or reduce image size to fit perfectly.
        </Alert>
      )}

      <Box
        sx={{
          position: "relative", width: "100%", maxWidth: "800px", height: "1131px",
          margin: "0 auto", backgroundColor: "#ffffff", boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", pt: "100px", pb: "90px", px: "60px",
          overflow: "hidden" 
        }}
      >
        {/* Header Overlay */}
        <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: "50px", zIndex: 1, pointerEvents: "none" }}>
          <div style={{ width: "100%", height: "100%", backgroundImage: `url(${HEADER_IMG})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        </Box>

        {/* Footer Overlay */}
        <Box sx={{ position: "absolute", top: 1071, left: 0, right: 0, height: "60px", zIndex: 1, pointerEvents: "none" }}>
          <div style={{ display: "block", width: "100%", height: "100%", backgroundImage: `url(${FOOTER_IMG})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        </Box>
        {isStudioMode && (
          <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 50 }}>
            <Typography variant="caption" sx={{ bgcolor: "rgba(0,0,0,0.5)", color: "white", px: 1, py: 0.5, borderRadius: '10px' }}>
              <Edit sx={{ fontSize: 12, mr: 0.5, verticalAlign: "middle" }} /> Click text to edit
            </Typography>
          </Box>
        )}

        <Box ref={contentRef} sx={{ width: "100%", position: "relative", zIndex: 2 }}>


          <Box sx={{ position: "relative", width: "100%", textAlign: "center", "&:hover .title-actions": { opacity: 1 } }}>
            {/* Form Field badge — studio mode only */}
            {isStudioMode && (
              <Chip
                icon={<LinkIcon sx={{ fontSize: "12px !important", color: "#60a5fa !important" }} />}
                label="Form Field"
                size="small"
                sx={{
                  position: "absolute",
                  top: -14,
                  left: "50%",
                  transform: "translateX(-50%)",
                  bgcolor: "rgba(96,165,250,0.1)",
                  color: "#60a5fa",
                  fontWeight: 600,
                  border: "1px solid rgba(96,165,250,0.3)",
                  fontSize: "10px",
                  height: 20,
                  zIndex: 2,
                }}
              />
            )}
            <EditableText
              value={derivedTitle}
              fallback="Proposal for Humantek"
              isStudioMode={isStudioMode}
              onInput={handleTitleInput}
              sx={{
                fontSize: 36, fontWeight: "800", color: "#1a1a1a", mb: "5px", outline: "none", border: isStudioMode ? "1px dashed transparent" : "none",
                textAlign: "center",
                "&:hover, &:focus": isStudioMode ? { border: "1px dashed #FF8C00", bgcolor: "rgba(255,140,0,0.05)", borderRadius: '10px' } : {}
              }}
            />
          </Box>

          {page3.subtitle !== undefined && (
            <EditableText
              value={page3.subtitle}
              isStudioMode={isStudioMode}
              onInput={handleSubtitleInput}
              sx={{
                fontSize: 18, fontWeight: "600", color: "#1a1a1a", mb: "20px", outline: "none", border: isStudioMode ? "1px dashed transparent" : "none",
                "&:hover, &:focus": isStudioMode ? { border: "1px dashed #FF8C00", bgcolor: "rgba(255,140,0,0.05)", borderRadius: '10px' } : {}
              }}
            />
          )}

          <Box sx={{ flexGrow: 1 }}>
            {elements.length > 0 ? elements.map((element, idx) => (
              <Box key={element.id} sx={{ mb: 2, position: "relative", "&:hover .element-actions": { opacity: 1 } }}>
                
                {isStudioMode && element.type !== "image" && (
                  <Box className="element-actions" sx={{ position: "absolute", top: 0, left: -40, opacity: 0, transition: "opacity 0.2s" }}>
                    <Tooltip title="Delete Block">
                      <IconButton size="small" color="error" onClick={() => {
                        dispatch(deleteElement(element.id));
                        dispatch(showToast({
                          message: "Block deleted",
                          severity: "info",
                          undoAction: restoreElement({ element, index: idx })
                        }));
                      }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}

                {element.type === "text" && (
                  <EditableText
                    value={element.content}
                    isStudioMode={isStudioMode}
                    onInput={(e) => debouncedUpdateElement(element.id, e.currentTarget.textContent)}
                    sx={{
                      fontSize: 13, color: "#4a4a4a", lineHeight: 1.8, outline: "none", minHeight: "20px", whiteSpace: "pre-wrap",
                      border: isStudioMode ? "1px dashed transparent" : "none",
                      "&:hover, &:focus": isStudioMode ? { border: "1px dashed #f3a833", bgcolor: "rgba(243, 168, 51,0.05)", borderRadius: '10px' } : {}
                    }}
                  />
                )}

                {element.type === "image" && isStudioMode && textElementsCount < 2 && (
                  <Box sx={{ width: "100%", textAlign: "center", mb: 2 }}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      startIcon={<Add />} 
                      onClick={handleAddTextElement} 
                      disabled={isOverflowing}
                      sx={{ color: "#FF8C00", borderColor: "#FF8C00", borderStyle: "dashed", "&.Mui-disabled": { borderColor: "#ccc" } }}
                    >
                      {isOverflowing ? "Page is Full" : "Add Text Block Here"}
                    </Button>
                  </Box>
                )}

                {element.type === "image" && (
                  <ImageResizer 
                    element={element} 
                    isStudioMode={isStudioMode} 
                    onDimensionsChange={handleDimensionsChange} 
                    onUpload={handleImageUpload} 
                  />
                )}
              </Box>
            )) : (
              <Typography sx={{ fontSize: 12, lineHeight: 1.8, color: "#333333", textAlign: "justify" }}>
                Welcome to Humantek – Your trusted partner in digital transformation and IT excellence.
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {isStudioMode && (
        <Box sx={{ width: "100%", maxWidth: "800px", textAlign: "center", mt: 4, pt: 4, borderTop: "1px dashed #ddd" }}>
          {!hasImage && textElementsCount < 2 && (
            <Button 
              variant="outlined" 
              startIcon={<Add />} 
              onClick={handleAddTextElement} 
              disabled={isOverflowing}
              sx={{ color: "#FF8C00", borderColor: "#FF8C00", borderStyle: "dashed", mr: 2, "&.Mui-disabled": { borderColor: "#ccc" } }}
            >
              {isOverflowing ? "Page is Full" : "Add Text Block"}
            </Button>
          )}
          
          {!hasImage && (
            <Button variant="outlined" component="label" startIcon={<ImageIcon />} sx={{ color: "#FF8C00", borderColor: "#FF8C00", borderStyle: "dashed" }}>
              Add Image Block
              <input type="file" hidden accept="image/*" onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  try {
                    dispatch(showToast({ message: "Uploading to Google Drive...", severity: "info" }));
                    const imageUrl = await uploadImageFile(file);
                    dispatch(addElement({ type: "image", content: imageUrl }));
                    dispatch(showToast({ message: "Image uploaded to Google Drive!", severity: "success" }));
                  } catch (err) {
                    console.error(err);
                    dispatch(showToast({ message: err.message || "Failed to upload to Google Drive", severity: "error" }));
                  }
                }
              }} />
            </Button>
          )}
        </Box>
      )}

    </Box>
  );
};

export default VisualAboutEditor;
