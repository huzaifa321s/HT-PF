// src/components/pdf/BlankContentPage.jsx
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Menu,
  MenuItem,
  Stack,
  Divider,
  Grid,
  Alert,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CustomHeaderFooter from "../CustomHeaderFooter";
import { useDispatch, useSelector } from "react-redux";
import {
  updatePageTitle,
  addMainHeading,
  addSection,
  addStandaloneImage,
  updateMainHeading,
  updateStandaloneImageDimensions,
  updateSectionTitle,
  deleteElement,
  reorderElements,
  addBlockToSection,
  updateBlock,
  updateBlockDimensions,
  deleteBlock,
  reorderBlocks,
} from "../../utils/blankPageSlice";

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
  section,
  mode,
  selectedFont,
  onEditTitle,
  onDelete,
  onEditBlock,
  onDeleteBlock,
  onAddBlock,
  onDragBlock,
  onImageUpload,
  isLimitExceeded,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [menuAnchor, setMenuAnchor] = useState(null);

  return (
    <Box ref={setNodeRef} style={style}>
      <Box sx={{ border: "1px dashed rgba(0,0,0,0.2)", borderRadius: 2, p: 2, mb: 4, background: "rgba(255,255,255,0.85)" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
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
          <Typography
            variant="h6"
            sx={{
              cursor: mode === "dev" ? "pointer" : "default",
              "&:hover": mode === "dev" ? { color: "primary.main" } : {},
              flex: 1,
            }}
            onClick={() => mode === "dev" && onEditTitle(section.id)}
          >
            {section.title}
          </Typography>
          {mode === "dev" && (
            <Stack direction="row" spacing={1}>
              <IconButton onClick={(e) => { e.stopPropagation(); onDelete(section.id); }} size="small">
                <DeleteIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}
                color="primary"
                size="small"
                disabled={isLimitExceeded}
              >
                <AddIcon />
              </IconButton>
            </Stack>
          )}
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {section.blocks.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
            No blocks yet. Click + to add content.
          </Typography>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => onDragBlock(section.id, e)}>
            <SortableContext items={section.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              {section.blocks.map((block) => (
                <SortableItem
                  key={block.id}
                  id={block.id}
                  type={block.type}
                  content={block.content}
                  dimensions={block.dimensions}
                  onEdit={() => onEditBlock(section.id, block.id)}
                  onDelete={() => onDeleteBlock(section.id, block.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
        {mode === "dev" && (
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
            <MenuItem onClick={() => { onAddBlock(section.id, "heading"); setMenuAnchor(null); }} disabled={isLimitExceeded}>
              Add Heading
            </MenuItem>
            <MenuItem onClick={() => { onAddBlock(section.id, "text"); setMenuAnchor(null); }} disabled={isLimitExceeded}>
              Add Text
            </MenuItem>
            <MenuItem>
              <label
                htmlFor={`img-upload-${section.id}`}
                style={{
                  cursor: isLimitExceeded ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  opacity: isLimitExceeded ? 0.5 : 1,
                }}
              >
                <ImageIcon fontSize="small" sx={{ mr: 1 }} /> Add Image
              </label>
              <input
                id={`img-upload-${section.id}`}
                type="file"
                accept="image/*"
                hidden
                disabled={isLimitExceeded}
                onChange={(e) => { onImageUpload(e, section.id); setMenuAnchor(null); }}
              />
            </MenuItem>
          </Menu>
        )}
      </Box>
    </Box>
  );
};

const SortableItem = ({ id, content, type, dimensions, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "1rem",
    borderRadius: "8px",
    backgroundColor: "white",
    boxShadow: isDragging ? "0 5px 15px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.15)",
    marginBottom: "0.75rem",
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "default",
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            {...attributes}
            {...listeners}
            sx={{
              cursor: "grab",
              display: "flex",
              alignItems: "center",
              "&:active": { cursor: "grabbing" },
            }}
          >
            <DragIndicatorIcon sx={{ color: "text.secondary" }} />
          </Box>
          <Typography variant="subtitle2">
            {type === "heading" ? "Heading" : type === "text" ? "Text" : "Image"}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(id); }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(id); }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
      {type === "heading" && (
        <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>
          {content}
        </Typography>
      )}
      {type === "text" && (
        <Typography variant="body1" sx={{ mt: 1 }}>
          {content}
        </Typography>
      )}
      {type === "image" && (
        <Box sx={{ mt: 1, textAlign: "center" }}>
          <img
            src={content}
            alt="Section visual"
            style={{
              width: dimensions?.width || "100%",
              height: dimensions?.height || "auto",
              maxWidth: "100%",
              borderRadius: "6px",
              objectFit: "contain",
            }}
          />
        </Box>
      )}
    </Box>
  );
};

const BlankContentPage = ({ mode = "dev", selectedFont = "Poppins", selectedLayout }) => {
  const dispatch = useDispatch();
  const { pageTitle, elements } = useSelector((state) => state.blankContent);

  const pageRef = useRef(null);
  const [editDialog, setEditDialog] = useState({
    open: false,
    id: null,
    type: "",
    value: "",
    elementId: null,
    dimensions: { width: "", height: "" },
  });
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);

  // === Height Limit States ===
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  const [hasShownLimitModal, setHasShownLimitModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // === Height Check Function ===
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
  }, [elements, pageTitle]);

  // === Safe Add Functions (Redux) ===
  const safeAddElement = (type, imageUrl = null) => {
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

  const safeAddBlock = (sectionId, type, uploadedImage = null) => {
    if (isLimitExceeded) return;
    dispatch(addBlockToSection({ sectionId, type, content: uploadedImage }));
  };

  const handleEditPageTitle = () => {
    setEditDialog({
      open: true,
      id: "page-title",
      type: "pageTitle",
      value: pageTitle,
      elementId: null,
      dimensions: { width: "", height: "" },
    });
  };

  const handleDeleteElement = (elementId) => {
    dispatch(deleteElement(elementId));
  };

  const handleEditElement = (element) => {
    if (element.type === "mainHeading") {
      setEditDialog({
        open: true,
        id: element.id,
        type: "mainHeading",
        value: element.content,
        elementId: element.id,
        dimensions: { width: "", height: "" },
      });
    } else if (element.type === "standaloneImage") {
      setEditDialog({
        open: true,
        id: element.id,
        type: "standaloneImage",
        value: element.content,
        elementId: element.id,
        dimensions: element.dimensions || { width: "500px", height: "auto" },
      });
    }
  };

  const handleEditSectionTitle = (sectionId) => {
    const section = elements.find((el) => el.id === sectionId);
    if (section) {
      setEditDialog({
        open: true,
        id: sectionId,
        type: "sectionTitle",
        value: section.title,
        elementId: sectionId,
        dimensions: { width: "", height: "" },
      });
    }
  };

  const handleDeleteBlock = (sectionId, blockId) => {
    dispatch(deleteBlock({ sectionId, blockId }));
  };

  const handleEditBlock = (sectionId, blockId) => {
    const section = elements.find((el) => el.id === sectionId);
    const block = section?.blocks.find((b) => b.id === blockId);
    if (block) {
      setEditDialog({
        open: true,
        id: blockId,
        type: block.type,
        value: block.content,
        elementId: sectionId,
        dimensions: block.dimensions || { width: "400px", height: "auto" },
      });
    }
  };

  const handleSaveEdit = () => {
    if (editDialog.type === "pageTitle") {
      dispatch(updatePageTitle(editDialog.value));
    } else if (editDialog.type === "mainHeading") {
      dispatch(updateMainHeading({ id: editDialog.elementId, content: editDialog.value }));
    } else if (editDialog.type === "standaloneImage") {
      dispatch(updateStandaloneImageDimensions({ id: editDialog.elementId, dimensions: editDialog.dimensions }));
    } else if (editDialog.type === "sectionTitle") {
      dispatch(updateSectionTitle({ id: editDialog.id, title: editDialog.value }));
    } else if (editDialog.type === "image") {
      dispatch(updateBlockDimensions({ sectionId: editDialog.elementId, blockId: editDialog.id, dimensions: editDialog.dimensions }));
    } else {
      dispatch(updateBlock({ sectionId: editDialog.elementId, blockId: editDialog.id, content: editDialog.value }));
    }
    setEditDialog({ open: false, id: null, type: "", value: "", elementId: null, dimensions: { width: "", height: "" } });
  };

  const handleDragElement = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    dispatch(reorderElements({ activeId: active.id, overId: over.id }));
  };

  const handleDragBlock = (sectionId, event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    dispatch(reorderBlocks({ sectionId, activeId: active.id, overId: over.id }));
  };

  const handleImageUpload = (e, sectionId) => {
    const file = e.target.files?.[0];
    if (file && !isLimitExceeded) {
      const url = URL.createObjectURL(file);
      safeAddBlock(sectionId, "image", url);
    }
  };

  return (
    <CustomHeaderFooter selectedLayout={selectedLayout}>
      <Box
        ref={pageRef}
        sx={{
          fontFamily: selectedFont,
          padding: "2rem",
          minHeight: `${A4_HEIGHT_PX}px`,
          maxHeight: `${A4_HEIGHT_PX}px`,
          overflow: "hidden",
          py: 10,
          position: "relative",
        }}
      >
        {/* Warning Banner */}
        {isLimitExceeded && mode === "dev" && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3, borderRadius: 2 }}>
            Page height limit exceeded! You can edit/delete but cannot add new content.
          </Alert>
        )}

        {/* Centered and Editable Page Title */}
        <Box sx={{ textAlign: "center", mt: 10 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              cursor: mode === "dev" ? "pointer" : "default",
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              my: 3,
              "&:hover": mode === "dev" ? { color: "primary.main" } : {},
            }}
            onClick={mode === "dev" ? handleEditPageTitle : undefined}
          >
            {pageTitle}
            {mode === "dev" && <EditIcon fontSize="small" sx={{ opacity: 0.7 }} />}
          </Typography>
        </Box>

        {/* Add Element Button */}
        {mode === "dev" && (
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Button startIcon={<AddIcon />} variant="contained" onClick={(e) => setAddMenuAnchor(e.currentTarget)} disabled={isLimitExceeded}>
              Add Element
            </Button>
            <Menu anchorEl={addMenuAnchor} open={Boolean(addMenuAnchor)} onClose={() => setAddMenuAnchor(null)}>
              <MenuItem onClick={() => safeAddElement("mainHeading")} disabled={isLimitExceeded}>
                <TitleIcon fontSize="small" sx={{ mr: 1 }} /> Add Main Heading
              </MenuItem>
              <MenuItem onClick={() => safeAddElement("section")} disabled={isLimitExceeded}>
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
                      safeAddElement("standaloneImage", url);
                    }
                  }}
                />
              </MenuItem>
            </Menu>
          </Box>
        )}

        {elements.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 8 }}>
            No content yet — Click "Add Element" to start building your page.
          </Typography>
        )}

        {/* Elements with Drag and Drop */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragElement}>
          <SortableContext items={elements.map((el) => el.id)} strategy={verticalListSortingStrategy}>
            {elements.map((element) => {
              if (element.type === "mainHeading") {
                return (
                  <SortableMainHeading
                    key={element.id}
                    element={element}
                    mode={mode}
                    selectedFont={selectedFont}
                    onEdit={handleEditElement}
                    onDelete={handleDeleteElement}
                  />
                );
              } else if (element.type === "standaloneImage") {
                return (
                  <SortableStandaloneImage
                    key={element.id}
                    element={element}
                    mode={mode}
                    onEdit={handleEditElement}
                    onDelete={handleDeleteElement}
                  />
                );
              } else if (element.type === "section") {
                return (
                  <SortableSection
                    key={element.id}
                    section={element}
                    mode={mode}
                    selectedFont={selectedFont}
                    onEditTitle={handleEditSectionTitle}
                    onDelete={handleDeleteElement}
                    onEditBlock={handleEditBlock}
                    onDeleteBlock={handleDeleteBlock}
                    onAddBlock={safeAddBlock}
                    onDragBlock={handleDragBlock}
                    onImageUpload={handleImageUpload}
                    isLimitExceeded={isLimitExceeded}
                  />
                );
              }
              return null;
            })}
          </SortableContext>
        </DndContext>

        {/* Limit Exceeded Modal */}
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
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": { transform: "translateY(-8px)", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" },
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
    Blank Content Page
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

          <DialogContent sx={{ background: "rgba(255,255,255,0.7)", pt: 2 }}>
            <Typography
              sx={{
                fontSize: "1rem",
                color: "text.primary",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              This page has exceeded the A4 height limit of <strong>{MAX_PAGE_HEIGHT}px</strong>.
            </Typography>
            <Typography
              sx={{
                mt: 2,
                fontSize: "1rem",
                color: "text.primary",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              You can still <strong>edit or delete</strong> elements.
            </Typography>
            <Typography
              sx={{
                mt: 1,
                fontSize: "1rem",
                color: "text.primary",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              To add more: delete some content or clone this page.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 2, background: "rgba(255,255,255,0.9)" }}>
            <Tooltip title="Close the dialog" arrow>
              <Button
                onClick={() => setShowLimitModal(false)}
                variant="contained"
                sx={{
                  textTransform: "none",
                  borderRadius: 3,
                  fontSize: "1rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 32px rgba(102, 126, 234, 0.5)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Got it
              </Button>
            </Tooltip>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog
          open={editDialog.open}
          onClose={() => setEditDialog({ open: false, id: null, type: "", value: "", elementId: null, dimensions: { width: "", height: "" } })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Edit{" "}
            {editDialog.type === "pageTitle"
              ? "Page Title"
              : editDialog.type === "mainHeading"
              ? "Main Heading"
              : editDialog.type === "standaloneImage"
              ? "Image"
              : editDialog.type === "sectionTitle"
              ? "Section Title"
              : editDialog.type === "image"
              ? "Image"
              : editDialog.type}
          </DialogTitle>
          <DialogContent>
            {editDialog.type === "image" || editDialog.type === "standaloneImage" ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Set image dimensions (e.g., 400px, 50%, auto)
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Width"
                      placeholder="e.g., 400px, 50%"
                      value={editDialog.dimensions.width}
                      onChange={(e) =>
                        setEditDialog((prev) => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, width: e.target.value },
                        }))
                      }
                      helperText="Width of image"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Height"
                      placeholder="e.g., 300px, auto"
                      value={editDialog.dimensions.height}
                      onChange={(e) =>
                        setEditDialog((prev) => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, height: e.target.value },
                        }))
                      }
                      helperText="Height of image"
                    />
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <TextField
                fullWidth
                multiline={editDialog.type === "text"}
                rows={editDialog.type === "text" ? 4 : 1}
                value={editDialog.value}
                onChange={(e) => setEditDialog((prev) => ({ ...prev, value: e.target.value }))}
                sx={{ mt: 2 }}
                autoFocus
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setEditDialog({ open: false, id: null, type: "", value: "", elementId: null, dimensions: { width: "", height: "" } })
              }
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSaveEdit}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </CustomHeaderFooter>
  );
};

export default BlankContentPage;