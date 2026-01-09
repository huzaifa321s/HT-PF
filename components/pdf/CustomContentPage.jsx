// src/components/pdf/CustomContentPage.jsx
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  Grid,
  Alert,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ImageIcon from "@mui/icons-material/Image";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import TitleIcon from "@mui/icons-material/Title";
import ListIcon from "@mui/icons-material/List";
import WarningIcon from "@mui/icons-material/Warning";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CustomHeaderFooter from "../CustomHeaderFooter";
import { useDispatch, useSelector } from "react-redux";
import {
  updatePageTitle,
  updateFooterText,
  deleteFooter,
  updateListStyle,
  addMainHeading,
  addSection,
  addStandaloneImage,
  updateMainHeading,
  updateStandaloneImageDimensions,
  updateSectionHeading,
  deleteElement,
  reorderElements,
  addItemToSection,
  updateSectionItem,
  updateSectionItemDimensions,
  deleteSectionItem,
  reorderSectionItems,
} from "../../utils/customContentSlice";

// === A4 Constants ===
const A4_HEIGHT_PX = 1123;
const MAX_PAGE_HEIGHT = A4_HEIGHT_PX;

// Sortable Main Heading Component
const SortableMainHeading = ({ element, mode, selectedFont, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: element.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, my: 2 };

  return (
    <Box ref={setNodeRef} style={style}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {mode === "dev" && (
          <Box
            {...attributes}
            {...listeners}
            sx={{
              cursor: "grab",
              display: "flex",
              alignItems: "center",
              position: "absolute",
              left: 0,
              "&:active": { cursor: "grabbing" },
            }}
          >
            <DragIndicatorIcon sx={{ color: "text.secondary" }} />
          </Box>
        )}
        <Typography variant="h3" sx={{ fontWeight: "bold", fontFamily: selectedFont, textAlign: "center" }}>
          {element.content}
        </Typography>
        {mode === "dev" && (
          <Box sx={{ display: "flex", gap: 1, position: "absolute", right: 0 }}>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(element); }}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(element.id); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Sortable Standalone Image Component
const SortableStandaloneImage = ({ element, mode, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: element.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, marginBottom: "2rem" };

  return (
    <Box ref={setNodeRef} style={style}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {mode === "dev" && (
          <Box
            {...attributes}
            {...listeners}
            sx={{
              cursor: "grab",
              display: "flex",
              alignItems: "center",
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              "&:active": { cursor: "grabbing" },
            }}
          >
            <DragIndicatorIcon sx={{ color: "text.secondary" }} />
          </Box>
        )}
        <Box sx={{ textAlign: "center", flex: 1 }}>
          <img
            src={element.content}
            alt="Standalone"
            style={{
              width: element.dimensions?.width || "500px",
              height: element.dimensions?.height || "auto",
              maxWidth: "100%",
              borderRadius: "6px",
              objectFit: "contain",
            }}
          />
        </Box>
        {mode === "dev" && (
          <Box sx={{ display: "flex", gap: 1, position: "absolute", right: 0, top: 0 }}>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(element); }}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(element.id); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Sortable Section Component
const SortableSection = ({
  element,
  index,
  totalElements,
  mode,
  selectedFont,
  listStyle,
  onEditHeading,
  onDeleteSection,
  onEditItem,
  onDeleteItem,
  onAddItemMenu,
  onDragItem,
  isLimitExceeded,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: element.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);

  return (
    <Box ref={setNodeRef} style={style} sx={{ mb: 6 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, position: "relative" }}>
        {mode === "dev" && (
          <Box
            {...attributes}
            {...listeners}
            sx={{
              cursor: "grab",
              display: "flex",
              alignItems: "center",
              mr: 1,
              "&:active": { cursor: "grabbing" },
            }}
          >
            <DragIndicatorIcon sx={{ color: "text.secondary" }} />
          </Box>
        )}
        <Typography variant="h5" sx={{ fontWeight: "bold", flex: 1, fontFamily: selectedFont }}>
          {element.heading}
        </Typography>
        {mode === "dev" && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEditHeading(element.id, element.heading); }}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDeleteSection(element.id); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => onDragItem(element.id, event)}>
        <SortableContext items={element.items.map((_, idx) => `${element.id}-${idx}`)} strategy={verticalListSortingStrategy}>
          <Box component={listStyle.includes("decimal") ? "ol" : "ul"} sx={{ pl: 4, m: 0, listStyleType: listStyle }}>
            {element.items.map((item, itemIndex) => (
              <SortableItem
                key={`${element.id}-${itemIndex}`}
                id={`${element.id}-${itemIndex}`}
                item={item}
                sectionId={element.id}
                itemIndex={itemIndex}
                mode={mode}
                selectedFont={selectedFont}
                listStyle={listStyle}
                onEdit={onEditItem}
                onDelete={onDeleteItem}
              />
            ))}
          </Box>
        </SortableContext>
      </DndContext>

      {mode === "dev" && (
        <>
          <Button
            startIcon={<AddIcon />}
            size="small"
            onClick={(e) => setAddMenuAnchor(e.currentTarget)}
            sx={{ ml: 4, mt: 1 }}
            disabled={isLimitExceeded}
          >
            Add Item
          </Button>
          <Menu anchorEl={addMenuAnchor} open={Boolean(addMenuAnchor)} onClose={() => setAddMenuAnchor(null)}>
            <MenuItem onClick={() => { onAddItemMenu(element.id, "text"); setAddMenuAnchor(null); }} disabled={isLimitExceeded}>
              <TextFieldsIcon fontSize="small" sx={{ mr: 1 }} /> Add Text
            </MenuItem>
            <MenuItem>
              <label
                htmlFor={`img-upload-item-${element.id}`}
                style={{
                  cursor: isLimitExceeded ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  opacity: isLimitExceeded ? 0.5 : 1,
                }}
              >
                <ImageIcon fontSize="small" sx={{ mr: 1 }} /> Add Image
              </label>
              <input
                id={`img-upload-item-${element.id}`}
                type="file"
                accept="image/*"
                hidden
                disabled={isLimitExceeded}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    onAddItemMenu(element.id, "image", url);
                    setAddMenuAnchor(null);
                  }
                }}
              />
            </MenuItem>
          </Menu>
        </>
      )}

      {index !== totalElements - 1 && (
        <Box component="hr" sx={{ border: "none", height: "3px", backgroundColor: "#000", mt: 5 }} />
      )}
    </Box>
  );
};

// Sortable Item Component
const SortableItem = ({ id, item, sectionId, itemIndex, mode, selectedFont, listStyle, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginBottom: "0.75rem",
    fontFamily: selectedFont,
    fontSize: "1rem",
    fontWeight: 400,
    display: item.type === "image" ? "flex" : "list-item",
    listStyleType: item.type === "image" ? "none" : undefined,
    position: "relative",
  };

  return (
    <Box ref={setNodeRef} style={style} component="li">
      <Box sx={{ display: "flex", alignItems: item.type === "image" ? "center" : "flex-start", gap: 1, width: "100%" }}>
        {mode === "dev" && (
          <Box
            {...attributes}
            {...listeners}
            sx={{
              cursor: "grab",
              display: "inline-flex",
              alignItems: "center",
              "&:active": { cursor: "grabbing" },
              position: "absolute",
              left: item.type === "image" ? "-30px" : "-30px",
              top: item.type === "image" ? "50%" : "0",
              transform: item.type === "image" ? "translateY(-50%)" : "none",
            }}
          >
            <DragIndicatorIcon sx={{ fontSize: "1rem", color: "text.secondary" }} />
          </Box>
        )}

        {item.type === "image" ? (
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <img
              src={item.content}
              alt="Section visual"
              style={{
                width: item.dimensions?.width || "400px",
                height: item.dimensions?.height || "auto",
                maxWidth: "100%",
                borderRadius: "6px",
                objectFit: "contain",
              }}
            />
          </Box>
        ) : (
          <span style={{ flex: 1 }}>{item.content}</span>
        )}

        {mode === "dev" && (
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              opacity: 0.7,
              "&:hover": { opacity: 1 },
              position: item.type === "image" ? "absolute" : "relative",
              right: item.type === "image" ? 0 : "auto",
              top: item.type === "image" ? 0 : "auto",
            }}
          >
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(sectionId, item, itemIndex); }}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(sectionId, itemIndex); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const CustomContentPage = ({ mode = "dev", selectedFont = "Poppins", selectedLayout }) => {
  const dispatch = useDispatch();
  const { pageTitle, footerText, listStyle, elements } = useSelector((state) => state.customContent);

  const pageRef = useRef(null);
  const [editDialog, setEditDialog] = useState({
    open: false,
    type: "",
    value: "",
    elementId: null,
    itemIndex: null,
    dimensions: { width: "", height: "" },
  });
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);

  // === Height Limit States ===
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  const [hasShownLimitModal, setHasShownLimitModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // === Height Check ===
  const checkPageHeight = () => {
    if (!pageRef.current) return;
    requestAnimationFrame(() => {
      const height = pageRef.current.scrollHeight;
      const exceeded = height > MAX_PAGE_HEIGHT;
      setIsLimitExceeded(exceeded);
      if (exceeded && !hasShownLimitModal) {
        setShowLimitModal(true);
        setHasShownLimitModal(true);
      }
    });
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


  useEffect(() => {
    const timer = setTimeout(checkPageHeight, 300);
    return () => clearTimeout(timer);
  }, [elements, pageTitle, footerText]);

  // === Safe Add Functions ===
  const safeAddMainElement = (type, imageUrl = null) => {
    if (isLimitExceeded) {
      if (!hasShownLimitModal) {
        setShowLimitModal(true);
        setHasShownLimitModal(true);
      }
      return;
    }
    if (type === "mainHeading") dispatch(addMainHeading());
    else if (type === "section") dispatch(addSection());
    else if (type === "standaloneImage") dispatch(addStandaloneImage(imageUrl));
    setAddMenuAnchor(null);
  };

  const safeAddItemMenu = (elementId, type, imageUrl = null) => {
    if (isLimitExceeded) return;
    dispatch(addItemToSection({ sectionId: elementId, type, content: imageUrl }));
  };

  const handleEditPageTitle = () => {
    setEditDialog({ open: true, type: "pageTitle", value: pageTitle, elementId: null, itemIndex: null, dimensions: { width: "", height: "" } });
  };

  const openEdit = (elementId, type, value, itemIndex = null) => {
    if (typeof value === "object") {
      if (value.type === "image") {
        setEditDialog({
          open: true,
          type: "image",
          value: value.content,
          elementId,
          itemIndex,
          dimensions: value.dimensions || { width: "400px", height: "auto" },
        });
      } else {
        setEditDialog({
          open: true,
          type,
          value: value.content || value.heading || value,
          elementId,
          itemIndex,
          dimensions: { width: "", height: "" },
        });
      }
    } else {
      setEditDialog({ open: true, type, value, elementId, itemIndex, dimensions: { width: "", height: "" } });
    }
  };

  const closeEdit = () => {
    setEditDialog({ open: false, type: "", value: "", elementId: null, itemIndex: null, dimensions: { width: "", height: "" } });
  };

  const handleSave = () => {
    if (editDialog.type === "pageTitle") {
      dispatch(updatePageTitle(editDialog.value));
    } else if (editDialog.type === "footer") {
      dispatch(updateFooterText(editDialog.value));
    } else if (editDialog.type === "mainHeading") {
      dispatch(updateMainHeading({ id: editDialog.elementId, content: editDialog.value }));
    } else if (editDialog.type === "standaloneImage") {
      dispatch(updateStandaloneImageDimensions({ id: editDialog.elementId, dimensions: editDialog.dimensions }));
    } else if (editDialog.type === "heading") {
      dispatch(updateSectionHeading({ id: editDialog.elementId, heading: editDialog.value }));
    } else if (editDialog.type === "image") {
      dispatch(updateSectionItemDimensions({ sectionId: editDialog.elementId, itemIndex: editDialog.itemIndex, dimensions: editDialog.dimensions }));
    } else if (editDialog.type === "item") {
      dispatch(updateSectionItem({ sectionId: editDialog.elementId, itemIndex: editDialog.itemIndex, content: editDialog.value }));
    }
    closeEdit();
  };

  const handleDeleteItem = (elementId, index) => {
    dispatch(deleteSectionItem({ sectionId: elementId, itemIndex: index }));
  };

  const handleDeleteElement = (elementId) => {
    dispatch(deleteElement(elementId));
  };

  const handleDragElement = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    dispatch(reorderElements({ activeId: active.id, overId: over.id }));
  };

  const handleDragItem = (elementId, event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeIndex = parseInt(active.id.split("-")[1]);
    const overIndex = parseInt(over.id.split("-")[1]);
    dispatch(reorderSectionItems({ sectionId: elementId, activeIndex, overIndex }));
  };

  return (
    <CustomHeaderFooter selectedLayout={selectedLayout}>
      <Box
        ref={pageRef}
        sx={{
          fontFamily: selectedFont,
          minHeight: `${A4_HEIGHT_PX}px`,
          maxHeight: `${A4_HEIGHT_PX}px`,
          overflow: "hidden",
          py: 3,
          position: "relative",
        }}
      >
        {isLimitExceeded && mode === "dev" && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3, borderRadius: 2 }}>
            Page height limit exceeded! You can edit/delete but cannot add new content.
          </Alert>
        )}

        <Box sx={{ textAlign: "center", my: 10 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              cursor: mode === "dev" ? "pointer" : "default",
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              fontFamily: selectedFont,
              "&:hover": mode === "dev" ? { color: "primary.main", "& .edit-icon": { opacity: 1 } } : {},
            }}
            onClick={mode === "dev" ? handleEditPageTitle : undefined}
          >
            {pageTitle}
            {mode === "dev" && (
              <EditIcon className="edit-icon" fontSize="small" sx={{ opacity: 0, transition: "opacity 0.2s", fontSize: "1.2rem" }} />
            )}
          </Typography>
        </Box>

        {mode === "dev" && (
          <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Typography>List Style:</Typography>
              <select
                value={listStyle}
                onChange={(e) => dispatch(updateListStyle(e.target.value))}
                style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc" }}
              >
                <option value="disc">Disc</option>
                <option value="circle">Circle</option>
                <option value="square">Square</option>
                <option value="decimal">Decimal</option>
                <option value="decimal-leading-zero">Decimal Leading Zero</option>
              </select>
            </Box>

            <Button
              startIcon={<AddIcon />}
              variant="contained"
              size="small"
              onClick={(e) => setAddMenuAnchor(e.currentTarget)}
              disabled={isLimitExceeded}
            >
              Add Element
            </Button>

            <Menu anchorEl={addMenuAnchor} open={Boolean(addMenuAnchor)} onClose={() => setAddMenuAnchor(null)}>
              <MenuItem onClick={() => safeAddMainElement("mainHeading")} disabled={isLimitExceeded}>
                <TitleIcon fontSize="small" sx={{ mr: 1 }} /> Add Main Heading
              </MenuItem>
              <MenuItem onClick={() => safeAddMainElement("section")} disabled={isLimitExceeded}>
                <ListIcon fontSize="small" sx={{ mr: 1 }} /> Add Section
              </MenuItem>
              <MenuItem>
                <label
                  htmlFor="img-upload-standalone"
                  style={{
                    cursor: isLimitExceeded ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    opacity: isLimitExceeded ? 0.5 : 1,
                  }}
                >
                  <ImageIcon fontSize="small" sx={{ mr: 1 }} /> Add Image
                </label>
                <input
                  id="img-upload-standalone"
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={isLimitExceeded}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      safeAddMainElement("standaloneImage", url);
                    }
                  }}
                />
              </MenuItem>
            </Menu>
          </Box>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragElement}>
          <SortableContext items={elements.map((el) => el.id)} strategy={verticalListSortingStrategy}>
            {elements.map((element, idx) => {
              if (element.type === "mainHeading") {
                return (
                  <SortableMainHeading
                    key={element.id}
                    element={element}
                    mode={mode}
                    selectedFont={selectedFont}
                    onEdit={() => openEdit(element.id, "mainHeading", element.content)}
                    onDelete={handleDeleteElement}
                  />
                );
              } else if (element.type === "standaloneImage") {
                return (
                  <SortableStandaloneImage
                    key={element.id}
                    element={element}
                    mode={mode}
                    onEdit={() => openEdit(element.id, "standaloneImage", element)}
                    onDelete={handleDeleteElement}
                  />
                );
              } else if (element.type === "section") {
                return (
                  <SortableSection
                    key={element.id}
                    element={element}
                    index={idx}
                    totalElements={elements.length}
                    mode={mode}
                    selectedFont={selectedFont}
                    listStyle={listStyle}
                    onEditHeading={(id, heading) => openEdit(id, "heading", heading)}
                    onDeleteSection={handleDeleteElement}
                    onEditItem={(id, item, index) => openEdit(id, "item", item, index)}
                    onDeleteItem={handleDeleteItem}
                    onAddItemMenu={safeAddItemMenu}
                    onDragItem={handleDragItem}
                    isLimitExceeded={isLimitExceeded}
                  />
                );
              }
              return null;
            })}
          </SortableContext>
        </DndContext>

        {footerText && (
          <Box sx={{ mt: 6 }}>
            <Box sx={{ width: "100%", height: 1, backgroundColor: "#000", mb: 2 }} />
            <Box sx={{ display: "flex", alignItems: "flex-start", backgroundColor: "#fff", padding: 2 }}>
              <Typography sx={{ fontFamily: selectedFont, fontSize: "0.95rem", fontWeight: 500, fontStyle: "italic", flex: 1 }}>
                {footerText}
              </Typography>
              {mode === "dev" && (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton size="small" onClick={() => openEdit(null, "footer", footerText)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => dispatch(deleteFooter())}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>
        )}

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
              "@keyframes shimmer": { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
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
    {pageTitle}
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
            <Typography sx={{ mb: 2 }}>This page has exceeded the A4 height limit of <strong>{MAX_PAGE_HEIGHT}px</strong>.</Typography>
            <Typography>You can still <strong>edit or delete</strong> elements.</Typography>
            <Typography sx={{ mt: 1 }}>To add more: delete some content or clone this page.</Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button onClick={() => setShowLimitModal(false)} variant="contained" sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              Got it
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={editDialog.open} onClose={closeEdit} maxWidth="sm" fullWidth>
          <DialogTitle>
            Edit {editDialog.type === "pageTitle" ? "Page Title" : editDialog.type === "mainHeading" ? "Main Heading" : editDialog.type === "standaloneImage" ? "Image" : editDialog.type === "heading" ? "Heading" : editDialog.type === "item" ? "Item" : editDialog.type === "image" ? "Image" : "Footer"}
          </DialogTitle>
          <DialogContent>
            {editDialog.type === "image" || editDialog.type === "standaloneImage" ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>Set image dimensions (e.g., 400px, 50%, auto)</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Width" placeholder="e.g., 400px, 50%" value={editDialog.dimensions.width} onChange={(e) => setEditDialog(prev => ({ ...prev, dimensions: { ...prev.dimensions, width: e.target.value } }))} helperText="Width of image" />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Height" placeholder="e.g., 300px, auto" value={editDialog.dimensions.height} onChange={(e) => setEditDialog(prev => ({ ...prev, dimensions: { ...prev.dimensions, height: e.target.value } }))} helperText="Height of image" />
                  </Grid>
                </Grid>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>Tip: Use "auto" for one dimension to maintain aspect ratio</Typography>
              </Box>
            ) : (
              <TextField
                fullWidth
                multiline
                rows={editDialog.type === "item" || editDialog.type === "footer" ? 3 : 1}
                value={editDialog.value}
                onChange={(e) => setEditDialog({ ...editDialog, value: e.target.value })}
                sx={{ mt: 2 }}
                autoFocus
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEdit}>Cancel</Button>
            <Button onClick={handleSave} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </CustomHeaderFooter>
  );
};

export default CustomContentPage;