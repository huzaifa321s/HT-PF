"use client";
import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Button, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { Add, Delete, Edit, ColorLens, FormatAlignLeft, FormatAlignCenter, FormatAlignRight } from "@mui/icons-material";
import {
  updatePageTitle,
  updateHeading,
  updateSubheading,
  addElement,
  updateElementContent,
  deleteElement,
  updateStandalonePackage,
  addItemToStandalonePackage,
  updateStandalonePackageItem,
  updateStandalonePackageItemAlign,
  deleteItemFromStandalonePackage,
  addGridPackage,
  updateGridPackage,
  addItemToGridPackage,
  updateGridPackageItem,
  updateGridPackageItemAlign,
  deleteItemFromGridPackage,
  deleteGridPackage,
  restoreGridPackage,
  restoreGridPackageItem,
  restoreElement,
  restoreStandalonePackageItem
} from "../../utils/pricingReducer";
import { showToast } from "../../utils/toastSlice";
import debounce from "lodash.debounce";
import EditableText from "../EditableText";
import { HEADER_IMG, FOOTER_IMG } from "../../utils/pdfImageAssets";

const COLORS = ["#FFD700", "#FFA500", "#FF6347", "#FF4500", "#DC143C", "#32CD32", "#1E90FF", "#9932CC", "#00CED1", "#FF69B4", "#000000"];

const PAGE_MARGIN_TOP = 100;
const PAGE_MARGIN_BOTTOM = 80;
const PAGE_CONTENT_HEIGHT = 712 - PAGE_MARGIN_TOP - PAGE_MARGIN_BOTTOM;
const MIN_PACKAGE_HEIGHT = 320;
const ITEM_HEIGHT = 22;
const BASE_PACKAGE_HEIGHT = 200;

const estimateItemHeight = (text) => {
  const lines = Math.ceil(text.length / 90);
  return lines * ITEM_HEIGHT;
};

const estimatePackageHeight = (pkg) => {
  let height = BASE_PACKAGE_HEIGHT;
  if (pkg.items) {
    pkg.items.forEach((item) => {
      height += estimateItemHeight(item);
    });
  }
  if (pkg.isContinued) height += 20;
  if (pkg.continueNext) height += 20;
  return height;
};

const splitPackage = (pkg, maxFirstChunkHeight, maxSubsequentChunkHeight = 420) => {
  if (estimatePackageHeight(pkg) <= maxFirstChunkHeight) {
    return [{ ...pkg, isSplit: false, itemOffset: 0 }];
  }
  const chunks = [];
  const items = pkg.items || [];
  let currentChunkItems = [];
  let currentHeight = BASE_PACKAGE_HEIGHT + (pkg.isContinued ? 20 : 0);
  let currentOffset = 0;
  let isFirstChunk = true;

  items.forEach((item, idx) => {
    const itemH = estimateItemHeight(item);
    const currentMaxHeight = isFirstChunk ? maxFirstChunkHeight : maxSubsequentChunkHeight;

    if (currentHeight + itemH + (idx === items.length - 1 && currentChunkItems.length > 0 ? 20 : 0) > currentMaxHeight) {
      if (currentChunkItems.length === 0) {
        currentChunkItems.push(item);
        currentHeight += itemH;
      } else {
        chunks.push({
          ...pkg,
          items: currentChunkItems,
          isSplit: true,
          splitPart: chunks.length === 0 ? "start" : "middle",
          showHeader: chunks.length === 0,
          continueNext: true,
          itemOffset: currentOffset,
        });
        currentOffset += currentChunkItems.length;
        currentChunkItems = [item];
        currentHeight = BASE_PACKAGE_HEIGHT + 30 + itemH;
        isFirstChunk = false;
      }
    } else {
      currentChunkItems.push(item);
      currentHeight += itemH;
    }
  });

  if (currentChunkItems.length > 0) {
    chunks.push({
      ...pkg,
      items: currentChunkItems,
      isSplit: true,
      splitPart: "end",
      showHeader: false,
      continueNext: false,
      isContinued: chunks.length > 0,
      itemOffset: currentOffset,
    });
  }
  return chunks;
};

const organizeIntoPages = (standalonePkgs, gridPkgs) => {
  const pages = [];
  let firstPageExtraHeight = 220;
  let currentPage = { standalone: [], grid: [], heightUsed: firstPageExtraHeight };

  const startNewPage = () => {
    // Only push if there's actually content, or if it's the very first page and it's empty
    if (currentPage.standalone.length || currentPage.grid.length || pages.length === 0) {
      pages.push(currentPage);
    }
    currentPage = { standalone: [], grid: [], heightUsed: 0 };
  };

  const addPackageChunks = (chunks) => {
    chunks.forEach((chunk) => {
      const h = estimatePackageHeight(chunk) + 30;
      if (currentPage.heightUsed + h > PAGE_CONTENT_HEIGHT && (currentPage.standalone.length > 0 || currentPage.grid.length > 0)) {
        startNewPage();
      }
      if (chunk.type === "grid") {
        currentPage.grid.push(chunk);
      } else {
        currentPage.standalone.push(chunk);
      }
      currentPage.heightUsed += h;
    });
  };

  standalonePkgs.forEach((pkg) => {
    let availableHeight = PAGE_CONTENT_HEIGHT - currentPage.heightUsed;
    if (availableHeight < 250) {
      startNewPage();
      availableHeight = PAGE_CONTENT_HEIGHT;
    }
    const chunks = splitPackage(pkg, availableHeight, 420);
    addPackageChunks(chunks.map(c => ({ ...c, type: "standalone" })));
  });

  gridPkgs.forEach((pkg, index) => {
    const isFirstInRow = (currentPage.grid.length % 2 === 0);
    let availableHeight = PAGE_CONTENT_HEIGHT - currentPage.heightUsed;
    if (isFirstInRow && availableHeight < 250) {
      startNewPage();
      availableHeight = PAGE_CONTENT_HEIGHT;
    }

    const chunks = splitPackage(pkg, availableHeight, 380);

    chunks.forEach((chunk) => {
      const pkgHeight = estimatePackageHeight(chunk) + 30;

      // Force continuation chunks to start on a new cloned page
      if (chunk.isContinued) {
        startNewPage();
      }

      const isFirst = (currentPage.grid.length % 2 === 0);
      if (!isFirst) {
        currentPage.grid.push({ ...chunk, type: "grid" });
        return;
      }
      if (currentPage.heightUsed + pkgHeight > PAGE_CONTENT_HEIGHT && (currentPage.standalone.length > 0 || currentPage.grid.length > 0)) {
        startNewPage();
      }
      currentPage.grid.push({ ...chunk, type: "grid" });
      currentPage.heightUsed += pkgHeight;

      // Force continued chunks to sit alone on their row by adding a placeholder
      if (chunk.isContinued) {
        currentPage.grid.push({ type: "placeholder" });
      }
    });
  });

  if (currentPage.standalone.length || currentPage.grid.length || pages.length === 0) {
    pages.push(currentPage);
  }

  return pages;
};

const PackageVisualBox = ({ pkg, isGrid, onUpdate, onAddItem, onUpdateItem, onAlignChange, onDeleteItem, onDelete, onColorChange, isStudioMode, itemOffset = 0 }) => {
  const dispatch = useDispatch();
  const [colorAnchor, setColorAnchor] = useState(null);

  const handleFieldInput = (field, e) => onUpdate(field, e.currentTarget.textContent);

  return (
    <Box
      sx={{
        border: "2px solid #e0e0e0",
        borderRadius: isGrid ? "12px" : "16px",
        padding: isGrid ? "20px" : "28px",
        mb: isGrid ? 0 : "30px",
        backgroundColor: "#ffffff",
        position: "relative",
        flex: "none",
        width: isGrid ? "calc(50% - 10px)" : "100%",
        minWidth: isGrid ? "240px" : "auto",
        "&:hover .pkg-actions": { opacity: 1 }
      }}
    >
      {isStudioMode && (
        <Box className="pkg-actions" sx={{ position: "absolute", top: 10, right: 10, opacity: 0, transition: "opacity 0.2s", display: "flex", gap: 1, zIndex: 10, bgcolor: "rgba(20, 20, 20, 0.8)", borderRadius: '10px' }}>
          <IconButton size="small" onClick={(e) => setColorAnchor(e.currentTarget)}><ColorLens fontSize="small" /></IconButton>
          <IconButton size="small" color="error" onClick={onDelete}><Delete fontSize="small" /></IconButton>
        </Box>
      )}

      <Menu anchorEl={colorAnchor} open={Boolean(colorAnchor)} onClose={() => setColorAnchor(null)}>
        <Box sx={{ p: 1, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1 }}>
          {COLORS.map((c) => (
            <Box key={c} onClick={() => { onColorChange(c); setColorAnchor(null); }} sx={{ width: 24, height: 24, bgcolor: c, borderRadius: "50%", cursor: "pointer", border: pkg.color === c ? "2px solid #000" : "none" }} />
          ))}
        </Box>
      </Menu>

      {pkg.showHeader !== false && (
        <>
          <EditableText
            value={pkg.title}
            fallback="Package Title"
            isStudioMode={isStudioMode}
            onInput={(e) => handleFieldInput("title", e)}
            sx={{ fontSize: 20, fontWeight: "bold", color: "#1a1a1a", textAlign: "center", mb: 1, outline: "none", border: isStudioMode ? "1px dashed transparent" : "none", "&:focus": isStudioMode ? { border: "1px dashed #FF8C00", bgcolor: "rgba(255,140,0,0.05)" } : {} }}
          />

          <Box sx={{ height: 4, backgroundColor: pkg.color || "#000", mb: 1.5 }} />

          <EditableText
            value={pkg.subtitle}
            fallback="Subtitle"
            isStudioMode={isStudioMode}
            onInput={(e) => handleFieldInput("subtitle", e)}
            sx={{ fontSize: 11, textAlign: "start", color: pkg.color || "#000", fontWeight: "bold", mb: 1.5, outline: "none", border: isStudioMode ? "1px dashed transparent" : "none", "&:focus": isStudioMode ? { border: "1px dashed #FF8C00", bgcolor: "rgba(255,140,0,0.05)" } : {} }}
          />

          <EditableText
            value={pkg.price ? `${pkg.currency || "PKR"} ${pkg.price}` : ""}
            fallback="0 / Month"
            isStudioMode={isStudioMode}
            onInput={(e) => handleFieldInput("price", e)}
            sx={{ fontSize: 15, fontWeight: "bold", color: "#000", textAlign: "start", mb: 2, outline: "none", border: isStudioMode ? "1px dashed transparent" : "none", "&:focus": isStudioMode ? { border: "1px dashed #FF8C00", bgcolor: "rgba(255,140,0,0.05)" } : {} }}
          />
        </>
      )}

      <Typography sx={{ fontSize: 13, fontWeight: "bold", color: "#1a1a1a", textAlign: "start", mb: 1.5 }}>
        {pkg.isContinued ? "...Continued" : isGrid ? "Includes:" : "What's Included"}
      </Typography>

      {pkg.items?.map((item, localI) => {
        const i = localI + itemOffset;
        const align = pkg.itemAligns?.[localI] || "left";
        let toolbarPositionStyles = { left: 0 };
        if (align === "center") toolbarPositionStyles = { left: "50%", transform: "translateX(-50%)" };
        if (align === "right") toolbarPositionStyles = { right: 0, left: "auto" };

        return (
          <Box key={i} sx={{ display: "flex", mb: 1, position: "relative", "&:hover .item-actions": { opacity: 1 } }}>
            <Typography sx={{ mr: 1, fontWeight: "bold", fontSize: 10.5, color: "#1a1a1a" }}>•</Typography>
            <EditableText
              value={item}
              fallback="Feature"
              isStudioMode={isStudioMode}
              onInput={(e) => onUpdateItem(i, e.currentTarget.textContent)}
              sx={{ flexGrow: 1, fontSize: 11, textAlign: align, outline: "none", color: "#333", borderBottom: isStudioMode ? "1px dashed transparent" : "none", "&:focus": isStudioMode ? { borderBottom: "1px dashed #FF8C00", bgcolor: "rgba(255,140,0,0.05)" } : {} }}
            />
            {isStudioMode && (
              <Box className="item-actions" sx={{ position: "absolute", top: -30, ...toolbarPositionStyles, opacity: 0, transition: "opacity 0.2s", zIndex: 10, bgcolor: "#141414", boxShadow: 1, borderRadius: '10px', display: "flex", gap: 0.5, p: 0.5 }}>
                <IconButton size="small" onClick={() => onAlignChange(i, "left")} sx={{ p: 0.5, bgcolor: align === "left" ? "#FF8C00" : "transparent" }}><FormatAlignLeft sx={{ fontSize: 12, color: align === "left" ? "#fff" : "inherit" }} /></IconButton>
                <IconButton size="small" onClick={() => onAlignChange(i, "center")} sx={{ p: 0.5, bgcolor: align === "center" ? "#FF8C00" : "transparent" }}><FormatAlignCenter sx={{ fontSize: 12, color: align === "center" ? "#fff" : "inherit" }} /></IconButton>
                <IconButton size="small" onClick={() => onAlignChange(i, "right")} sx={{ p: 0.5, bgcolor: align === "right" ? "#FF8C00" : "transparent" }}><FormatAlignRight sx={{ fontSize: 12, color: align === "right" ? "#fff" : "inherit" }} /></IconButton>
                <IconButton size="small" color="error" onClick={() => {
                  onDeleteItem(i);
                  const align = pkg.itemAligns?.[localI] || "left";
                  dispatch(showToast({
                    message: "Feature deleted",
                    severity: "info",
                    undoAction: isGrid ? restoreGridPackageItem({ pkgId: pkg.id, item, align, index: i }) : restoreStandalonePackageItem({ elementId: pkg.id, item, align, index: i })
                  }));
                }} sx={{ p: 0.5 }}><Delete sx={{ fontSize: 12 }} /></IconButton>
              </Box>
            )}
          </Box>
        );
      })}

      {pkg.continueNext && (
        <Typography sx={{ fontSize: 11, color: "#94a3b8", textAlign: "center", mt: 1, fontStyle: "italic", fontWeight: "bold" }}>→ Continued on next page</Typography>
      )}

      {isStudioMode && !pkg.continueNext && (
        <Button size="small" onClick={onAddItem} sx={{ mt: 1, fontSize: 10 }} startIcon={<Add sx={{ fontSize: 12 }} />}>Add Feature</Button>
      )}
    </Box>
  );
};


const VisualPricingEditor = ({ isStudioMode = true, isThumbnail = false, onPageCountChange, pageIdPrefix = "Pricing" }) => {
  const dispatch = useDispatch();
  const currentMode = useSelector((state) => state.pricing.currentMode || "create");
  const pricingData = useSelector((state) => state.pricing[currentMode] || state.pricing);
  const elements = pricingData.elements || [];
  const gridPackages = pricingData.gridPackages || [];

  const textElements = elements.filter(e => e.type !== "package");
  const standalonePkgs = elements.filter(e => e.type === "package");

  const [addAnchor, setAddAnchor] = useState(null);

  const debouncedUpdate = useCallback(debounce((action, val) => dispatch(action(val)), 500), [dispatch]);
  const handleInput = (action, e) => debouncedUpdate(action, e.currentTarget.textContent);
  
  const debouncedUpdateContent = useCallback(debounce((id, val) => dispatch(updateElementContent({ id, content: val })), 500), [dispatch]);

  const handleAddMenu = (action) => {
    dispatch(action);
    setAddAnchor(null);
  };

  const pages = React.useMemo(() => {
    return organizeIntoPages(standalonePkgs, gridPackages);
  }, [standalonePkgs, gridPackages]);

  React.useEffect(() => {
    if (onPageCountChange) {
      onPageCountChange(pages.length);
    }
  }, [pages.length, onPageCountChange]);

  const gap = isStudioMode ? 40 : 0;
  const exactContainerHeight = (pages.length * 1131) + ((pages.length - 1) * gap) + (isStudioMode ? 120 : 0);

  return (
    <Box sx={{ position: "relative", width: "100%", maxWidth: "800px", height: exactContainerHeight, margin: "0 auto", fontFamily: "'Liberation Serif', Times, serif" }}>
      
      {/* Background Pages with Cloned Headers */}
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none" }}>
        {Array.from({ length: pages.length }).map((_, i) => (
          <Box key={i} sx={{ position: "absolute", top: i * (1131 + gap), left: 0, right: 0, height: 1131, backgroundColor: "#ffffff", boxShadow: "0 10px 40px rgba(0,0,0,0.8)" }}>
            {/* Header */}
            <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: "50px" }}>
              <img src={HEADER_IMG} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Box>
            {/* Footer */}
            <Box sx={{ position: "absolute", top: 1071, left: 0, right: 0, height: "60px" }}>
              <img src={FOOTER_IMG} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
            </Box>
          </Box>
        ))}
      </Box>

      {/* Content Layer */}
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
        {pages.map((page, pageIdx) => {
          const gridChunks = [];
          for (let i = 0; i < page.grid.length; i += 2) {
            gridChunks.push(page.grid.slice(i, i + 2));
          }

          return (
            <Box key={pageIdx} id={isStudioMode && !isThumbnail ? `page-${pageIdPrefix}-${pageIdx}` : undefined} sx={{ position: "absolute", top: pageIdx * (1131 + gap), left: 0, right: 0, height: 1131, pt: "100px", pb: "80px", px: "50px", pointerEvents: "none", "& > *": { pointerEvents: isThumbnail ? "none" : "auto" } }}>
              {isStudioMode && pageIdx === 0 && (
                <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 50 }}>
                  <Typography variant="caption" sx={{ bgcolor: "rgba(0,0,0,0.5)", color: "white", px: 1, py: 0.5, borderRadius: '10px' }}>
                    <Edit sx={{ fontSize: 12, mr: 0.5, verticalAlign: "middle" }} /> Click text to edit
                  </Typography>
                </Box>
              )}

              {/* Page 1 Specific Headings */}
              {pageIdx === 0 && (
                <>
                  <EditableText
                    value={pricingData.pageTitle}
                    fallback="Pricing Plans"
                    isStudioMode={isStudioMode}
                    onInput={(e) => handleInput(updatePageTitle, e)}
                    sx={{ fontSize: 20, fontWeight: "bold", color: "#333333", mb: "10px", outline: "none", border: isStudioMode ? "1px dashed transparent" : "none", "&:focus": isStudioMode ? { border: "1px dashed #FF8C00", bgcolor: "rgba(255,140,0,0.05)" } : {} }}
                  />

                  <EditableText
                    value={pricingData.heading}
                    fallback="Choose Your Perfect Plan"
                    isStudioMode={isStudioMode}
                    onInput={(e) => handleInput(updateHeading, e)}
                    sx={{ fontWeight: "bold", color: "#000", textAlign: "center", fontSize: 28, mt: "10px", mb: "20px", outline: "none", border: isStudioMode ? "1px dashed transparent" : "none", "&:focus": isStudioMode ? { border: "1px dashed #FF8C00", bgcolor: "rgba(255,140,0,0.05)" } : {} }}
                  />

                  <EditableText
                    value={pricingData.subheading}
                    fallback="Flexible options designed for your needs"
                    isStudioMode={isStudioMode}
                    onInput={(e) => handleInput(updateSubheading, e)}
                    sx={{ fontSize: 12, color: "#000", textAlign: "center", lineHeight: 1.6, outline: "none", border: isStudioMode ? "1px dashed transparent" : "none", "&:focus": isStudioMode ? { border: "1px dashed #FF8C00", bgcolor: "rgba(255,140,0,0.05)" } : {} }}
                  />

                  <Box sx={{ height: "1px", backgroundColor: "#000", my: "15px" }} />

                  {textElements.map((el) => (
                    <Box key={el.id} sx={{ position: "relative", mb: 2, "&:hover .text-actions": { opacity: 1 } }}>
                      <EditableText
                        value={el.content}
                        isStudioMode={isStudioMode}
                        onInput={(e) => debouncedUpdateContent(el.id, e.currentTarget.textContent)}
                        sx={{ fontSize: el.type === "mainHeading" ? 28 : 11, fontWeight: el.type === "mainHeading" ? "bold" : "normal", textAlign: el.type === "mainHeading" ? "center" : "left", color: "#333333", lineHeight: 1.6, outline: "none", border: isStudioMode ? "1px dashed transparent" : "none", minHeight: 20, "&:focus": isStudioMode ? { border: "1px dashed #FF8C00", bgcolor: "rgba(255,140,0,0.05)" } : {} }}
                      />
                      {isStudioMode && (
                        <Box className="text-actions" sx={{ position: "absolute", right: -30, top: 0, opacity: 0 }}>
                          <IconButton size="small" color="error" onClick={() => {
                            const index = elements.findIndex(e => e.id === el.id);
                            dispatch(deleteElement({ elementId: el.id }));
                            dispatch(showToast({
                              message: "Block deleted",
                              severity: "info",
                              undoAction: restoreElement({ element: el, index })
                            }));
                          }}><Delete fontSize="small" /></IconButton>
                        </Box>
                      )}
                    </Box>
                  ))}
                </>
              )}

              {/* Standalone Packages for this chunk */}
              {page.standalone.map((pkg) => (
                <PackageVisualBox key={`${pkg.id}-${pkg.itemOffset || 0}`} pkg={pkg} isGrid={false} isStudioMode={isStudioMode} itemOffset={pkg.itemOffset}
                  onUpdate={(field, val) => dispatch(updateStandalonePackage({ id: pkg.id, field, value: val }))}
                  onAddItem={() => dispatch(addItemToStandalonePackage({ elementId: pkg.id }))}
                  onUpdateItem={(idx, val) => dispatch(updateStandalonePackageItem({ elementId: pkg.id, index: idx, value: val }))}
                  onAlignChange={(idx, align) => dispatch(updateStandalonePackageItemAlign({ elementId: pkg.id, index: idx, value: align }))}
                  onDeleteItem={(idx) => dispatch(deleteItemFromStandalonePackage({ elementId: pkg.id, index: idx }))}
                  onDelete={() => {
                    const index = elements.findIndex(e => e.id === pkg.id);
                    const originalPkg = elements[index];
                    dispatch(deleteElement({ elementId: pkg.id }));
                    if (originalPkg) {
                      dispatch(showToast({
                        message: "Package deleted",
                        severity: "info",
                        undoAction: restoreElement({ element: originalPkg, index })
                      }));
                    }
                  }}
                  onColorChange={(color) => dispatch(updateStandalonePackage({ id: pkg.id, field: "color", value: color }))}
                />
              ))}

              {/* Grid Packages for this chunk */}
              {gridChunks.map((row, rowIdx) => {
                const isCenteredRow = row.some(p => p.isContinued);
                return (
                  <Box key={`row-${rowIdx}`} sx={{ display: "flex", gap: "20px", mb: "30px", justifyContent: isCenteredRow ? "center" : "flex-start" }}>
                    {row.filter(p => p.type !== "placeholder").map((pkg, colIdx) => (
                      <PackageVisualBox key={`${pkg.id}-${pkg.itemOffset || 0}`} pkg={pkg} isGrid={true} isStudioMode={isStudioMode} itemOffset={pkg.itemOffset}
                        onUpdate={(field, val) => dispatch(updateGridPackage({ id: pkg.id, field, value: val }))}
                        onAddItem={() => dispatch(addItemToGridPackage({ pkgId: pkg.id }))}
                        onUpdateItem={(idx, val) => dispatch(updateGridPackageItem({ pkgId: pkg.id, index: idx, value: val }))}
                        onAlignChange={(idx, align) => dispatch(updateGridPackageItemAlign({ pkgId: pkg.id, index: idx, value: align }))}
                        onDeleteItem={(idx) => dispatch(deleteItemFromGridPackage({ pkgId: pkg.id, index: idx }))}
                        onDelete={() => {
                          const index = gridPackages.findIndex(p => p.id === pkg.id);
                          const originalPkg = gridPackages[index];
                          dispatch(deleteGridPackage({ pkgId: pkg.id }));
                          if (originalPkg) {
                            dispatch(showToast({
                              message: "Grid Package deleted",
                              severity: "info",
                              undoAction: restoreGridPackage({ pkg: originalPkg, index })
                            }));
                          }
                        }}
                        onColorChange={(color) => dispatch(updateGridPackage({ id: pkg.id, field: "color", value: color }))}
                      />
                    ))}
                  </Box>
                );
              })}

              {/* Only show add button on last page at the bottom */}
              {isStudioMode && !isThumbnail && pageIdx === pages.length - 1 && (
                <Box sx={{ textAlign: "center", mt: 4, pt: 4, borderTop: "1px dashed #ddd" }}>
                  <Button variant="outlined" startIcon={<Add />} onClick={(e) => setAddAnchor(e.currentTarget)} sx={{ color: "#FF8C00", borderColor: "#FF8C00", borderStyle: "dashed", pointerEvents: "auto" }}>
                    Add Content Block
                  </Button>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      <Menu anchorEl={addAnchor} open={Boolean(addAnchor)} onClose={() => setAddAnchor(null)} sx={{ pointerEvents: "auto" }}>
        <MenuItem onClick={() => handleAddMenu(addElement({ type: "mainHeading" }))}>Heading Block</MenuItem>
        <MenuItem onClick={() => handleAddMenu(addElement({ type: "text" }))}>Text Block</MenuItem>
        <MenuItem onClick={() => handleAddMenu(addElement({ type: "package" }))}>Standalone Package</MenuItem>
        <MenuItem onClick={() => handleAddMenu(addGridPackage())}>Grid Package (2 per row)</MenuItem>
      </Menu>

    </Box>
  );
};

export default VisualPricingEditor;
