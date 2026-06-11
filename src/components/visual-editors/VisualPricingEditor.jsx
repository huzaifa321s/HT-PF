"use client";
import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Button, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { Add, Delete, Edit, ColorLens } from "@mui/icons-material";
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
  let currentPage = { standalone: [], grid: [] };

  const getRowsCount = (page) => {
    return page.standalone.length + Math.ceil(page.grid.length / 2);
  };

  const startNewPage = () => {
    if (currentPage.standalone.length > 0 || currentPage.grid.length > 0) {
      pages.push(currentPage);
    }
    currentPage = { standalone: [], grid: [] };
  };

  standalonePkgs.forEach((pkg) => {
    if (getRowsCount(currentPage) >= 2) {
      startNewPage();
    }
    currentPage.standalone.push({ ...pkg, isSplit: false, itemOffset: 0 });
  });

  gridPkgs.forEach((pkg) => {
    const isStartingNewRow = (currentPage.grid.length % 2 === 0);
    if (isStartingNewRow && getRowsCount(currentPage) >= 2) {
      startNewPage();
    }
    currentPage.grid.push({ ...pkg, isSplit: false, itemOffset: 0 });
  });

  if (currentPage.standalone.length > 0 || currentPage.grid.length > 0 || pages.length === 0) {
    pages.push(currentPage);
  }

  return pages;
};

const PackageVisualBox = ({ 
  pkg, 
  isGrid, 
  onUpdate, 
  onAddItem, 
  onUpdateItem, 
  onAlignChange, 
  onDeleteItem, 
  onDelete, 
  onColorChange, 
  isStudioMode, 
  itemOffset = 0,
  totalPkgs = 1
}) => {
  const dispatch = useDispatch();
  const [colorAnchor, setColorAnchor] = useState(null);

  const handleFieldInput = (field, e) => onUpdate(field, e.currentTarget.textContent);

  // Dynamic sizing based on number of packages to ensure everything fits on a single page
  let padding = isGrid ? "20px" : "28px";
  let marginB = isGrid ? 0 : "30px";
  let itemMarginB = "8px";
  let titleSize = 22;
  let subtitleSize = 13;
  let priceSize = 17;
  let itemSize = 13;
  let headerBarHeight = 4;

  if (totalPkgs === 2) {
    padding = isGrid ? "14px" : "18px";
    marginB = isGrid ? 0 : "16px";
    itemMarginB = "5px";
    titleSize = 18;
    subtitleSize = 12;
    priceSize = 15;
    itemSize = 12;
    headerBarHeight = 3;
  } else if (totalPkgs >= 3) {
    padding = isGrid ? "10px" : "12px";
    marginB = isGrid ? 0 : "8px";
    itemMarginB = "3px";
    titleSize = 15;
    subtitleSize = 11;
    priceSize = 13;
    itemSize = 11;
    headerBarHeight = 2;
  }

  return (
    <Box
      sx={{
        border: "2px solid #e0e0e0",
        borderRadius: isGrid ? "12px" : "16px",
        padding: padding,
        mb: marginB,
        mt: isGrid ? 0 : "15px",
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
            sx={{ fontSize: titleSize, fontWeight: "bold", color: "#1a1a1a", textAlign: "center", mb: totalPkgs >= 3 ? 0.5 : 1, outline: "none", border: isStudioMode ? "1px dashed transparent" : "none", "&:focus": isStudioMode ? { border: "1px dashed #FF8C00", bgcolor: "rgba(255,140,0,0.05)" } : {} }}
          />

          <Box sx={{ height: headerBarHeight, backgroundColor: pkg.color || "#000", mb: totalPkgs >= 3 ? 1 : 1.5 }} />

          <EditableText
            value={pkg.subtitle}
            fallback="Subtitle"
            isStudioMode={isStudioMode}
            onInput={(e) => handleFieldInput("subtitle", e)}
            sx={{ fontSize: subtitleSize, textAlign: "start", color: pkg.color || "#000", fontWeight: "bold", mb: totalPkgs >= 3 ? 1 : 1.5, outline: "none", border: isStudioMode ? "1px dashed transparent" : "none", "&:focus": isStudioMode ? { border: "1px dashed #FF8C00", bgcolor: "rgba(255,140,0,0.05)" } : {} }}
          />

          <EditableText
            value={pkg.price ? `${pkg.currency || "$"} ${pkg.price}` : ""}
            fallback="0 / Month"
            isStudioMode={isStudioMode}
            onInput={(e) => handleFieldInput("price", e)}
            sx={{ fontSize: priceSize, fontWeight: "bold", color: "#000", textAlign: "start", mb: totalPkgs >= 3 ? 1 : 2, outline: "none", border: isStudioMode ? "1px dashed transparent" : "none", "&:focus": isStudioMode ? { border: "1px dashed #FF8C00", bgcolor: "rgba(255,140,0,0.05)" } : {} }}
          />
        </>
      )}

      <Typography sx={{ fontSize: itemSize + 1, fontWeight: "bold", color: "#1a1a1a", textAlign: "start", mb: totalPkgs >= 3 ? 1 : 1.5 }}>
        {pkg.isContinued ? "...Continued" : isGrid ? "Includes:" : "What's Included"}
      </Typography>

      {pkg.items?.map((item, localI) => {
        const i = localI + itemOffset;

        return (
          <Box key={i} sx={{ display: "flex", mb: itemMarginB, position: "relative", "&:hover .item-actions": { opacity: 1 } }}>
            <Typography sx={{ mr: 1, fontWeight: "bold", fontSize: itemSize - 0.5, color: "#1a1a1a" }}>•</Typography>
            <EditableText
              value={item}
              fallback="Feature"
              isStudioMode={isStudioMode}
              onInput={(e) => onUpdateItem(i, e.currentTarget.textContent)}
              sx={{ flexGrow: 1, fontSize: itemSize, textAlign: "left", outline: "none", color: "#333", borderBottom: isStudioMode ? "1px dashed transparent" : "none", "&:focus": isStudioMode ? { borderBottom: "1px dashed #FF8C00", bgcolor: "rgba(255,140,0,0.05)" } : {} }}
            />
            {isStudioMode && (
              <Box className="item-actions" sx={{ position: "absolute", top: -30, left: 0, opacity: 0, transition: "opacity 0.2s", zIndex: 10, bgcolor: "#141414", boxShadow: 1, borderRadius: '10px', display: "flex", gap: 0.5, p: 0.5 }}>
                <IconButton size="small" color="error" onClick={() => {
                  onDeleteItem(i);
                  dispatch(showToast({
                    message: "Feature deleted",
                    severity: "info",
                    undoAction: isGrid ? restoreGridPackageItem({ pkgId: pkg.id, item, align: "left", index: i }) : restoreStandalonePackageItem({ elementId: pkg.id, item, align: "left", index: i })
                  }));
                }} sx={{ p: 0.5 }}><Delete sx={{ fontSize: 12 }} /></IconButton>
              </Box>
            )}
          </Box>
        );
      })}

      {pkg.continueNext && (
        <Typography sx={{ fontSize: itemSize, color: "#94a3b8", textAlign: "center", mt: 1, fontStyle: "italic", fontWeight: "bold" }}>→ Continued on next page</Typography>
      )}

      {isStudioMode && !pkg.continueNext && (
        <Button size="small" onClick={onAddItem} sx={{ position: "absolute", bottom: totalPkgs >= 3 ? 2 : 4, right: totalPkgs >= 3 ? 8 : 12, zIndex: 10, fontSize: itemSize - 1, py: totalPkgs >= 3 ? 0.25 : 0.5 }} startIcon={<Add sx={{ fontSize: 12 }} />}>Add Feature</Button>
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
            <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: "50px", zIndex: 1, overflow: "hidden" }}>
              <img src={HEADER_IMG} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
            </Box>
            {/* Footer */}
            <Box sx={{ position: "absolute", top: 1071, left: 0, right: 0, height: "60px", zIndex: 1, overflow: "hidden" }}>
              <img src={FOOTER_IMG} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "bottom" }} />
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

          // Calculate sizes based on vertical rows count on this page
          const totalPkgs = page.standalone.length + Math.ceil(page.grid.length / 2);
          
          let pageTitleSize = 22;
          let pageTitleMb = "10px";
          let headingSize = 30;
          let headingMt = "10px";
          let headingMb = "20px";
          let subheadingSize = 14;
          let dividerMy = "15px";
          let textElMb = 2;
          let mainHeadingSize = 30;
          let textFontSize = 13;
          let gridGap = "20px";
          let gridRowMb = "30px";

          if (totalPkgs === 2) {
            pageTitleSize = 18;
            pageTitleMb = "6px";
            headingSize = 24;
            headingMt = "6px";
            headingMb = "12px";
            subheadingSize = 12;
            dividerMy = "10px";
            textElMb = 1.5;
            mainHeadingSize = 24;
            textFontSize = 12;
            gridGap = "12px";
            gridRowMb = "16px";
          } else if (totalPkgs >= 3) {
            pageTitleSize = 16;
            pageTitleMb = "4px";
            headingSize = 20;
            headingMt = "4px";
            headingMb = "8px";
            subheadingSize = 11;
            dividerMy = "6px";
            textElMb = 1;
            mainHeadingSize = 20;
            textFontSize = 11;
            gridGap = "8px";
            gridRowMb = "8px";
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
                    sx={{ fontSize: pageTitleSize, fontWeight: "bold", color: "#333333", mb: pageTitleMb, outline: "none", border: isStudioMode ? "1px dashed transparent" : "none", "&:focus": isStudioMode ? { border: "1px dashed #FF8C00", bgcolor: "rgba(255,140,0,0.05)" } : {} }}
                  />

                  <EditableText
                    value={pricingData.heading}
                    fallback="Choose Your Perfect Plan"
                    isStudioMode={isStudioMode}
                    onInput={(e) => handleInput(updateHeading, e)}
                    sx={{ fontWeight: "bold", color: "#000", textAlign: "center", fontSize: headingSize, mt: headingMt, mb: headingMb, outline: "none", border: isStudioMode ? "1px dashed transparent" : "none", "&:focus": isStudioMode ? { border: "1px dashed #FF8C00", bgcolor: "rgba(255,140,0,0.05)" } : {} }}
                  />

                  <EditableText
                    value={pricingData.subheading}
                    fallback="Flexible options designed for your needs"
                    isStudioMode={isStudioMode}
                    onInput={(e) => handleInput(updateSubheading, e)}
                    sx={{ fontSize: subheadingSize, color: "#000", textAlign: "center", lineHeight: 1.6, outline: "none", border: isStudioMode ? "1px dashed transparent" : "none", "&:focus": isStudioMode ? { border: "1px dashed #FF8C00", bgcolor: "rgba(255,140,0,0.05)" } : {} }}
                  />

                  <Box sx={{ height: "1px", backgroundColor: "#000", my: dividerMy }} />

                  {textElements.map((el) => (
                    <Box key={el.id} sx={{ position: "relative", mb: textElMb, "&:hover .text-actions": { opacity: 1 } }}>
                      <EditableText
                        value={el.content}
                        isStudioMode={isStudioMode}
                        onInput={(e) => debouncedUpdateContent(el.id, e.currentTarget.textContent)}
                        sx={{ fontSize: el.type === "mainHeading" ? mainHeadingSize : textFontSize, fontWeight: el.type === "mainHeading" ? "bold" : "normal", textAlign: el.type === "mainHeading" ? "center" : "left", color: "#333333", lineHeight: 1.6, outline: "none", border: isStudioMode ? "1px dashed transparent" : "none", minHeight: 20, "&:focus": isStudioMode ? { border: "1px dashed #FF8C00", bgcolor: "rgba(255,140,0,0.05)" } : {} }}
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
                <PackageVisualBox key={`${pkg.id}-${pkg.itemOffset || 0}`} pkg={pkg} isGrid={false} isStudioMode={isStudioMode} itemOffset={pkg.itemOffset} totalPkgs={totalPkgs}
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
                  <Box key={`row-${rowIdx}`} sx={{ display: "flex", gap: gridGap, mb: gridRowMb, mt: "15px", justifyContent: isCenteredRow ? "center" : "flex-start" }}>
                    {row.filter(p => p.type !== "placeholder").map((pkg, colIdx) => (
                      <PackageVisualBox key={`${pkg.id}-${pkg.itemOffset || 0}`} pkg={pkg} isGrid={true} isStudioMode={isStudioMode} itemOffset={pkg.itemOffset} totalPkgs={totalPkgs}
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
              {/* Floating Add Content Block button on the right side of the last page */}
              {isStudioMode && !isThumbnail && pageIdx === pages.length - 1 && (
                <Box sx={{ position: "absolute", bottom: "80px", left: "100%", ml: "20px", zIndex: 100, pointerEvents: "auto" }}>
                  <Button variant="outlined" startIcon={<Add />} onClick={(e) => setAddAnchor(e.currentTarget)} sx={{ color: "#FF8C00", borderColor: "#FF8C00", borderStyle: "dashed", whiteSpace: "nowrap", bgcolor: "#141414" }}>
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
