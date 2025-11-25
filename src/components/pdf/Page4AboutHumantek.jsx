// src/components/pdf/Page4AboutHumantek.jsx
import { Box, Typography, IconButton, Button, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Tooltip } from "@mui/material";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  Add,
  Delete,
  Edit,
  Save,
  DragIndicator,
  Title as TitleIcon,
  Image as ImageIcon,
  TextFields as TextFieldsIcon,
  List as ListIcon,
  Warning as WarningIcon,
  RefreshOutlined,
} from "@mui/icons-material";

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
import EditImageDialog from "../EditImageDialog";
import CustomHeaderFooter from "../CustomHeaderFooter";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../utils/toastSlice";
import {
  updateTitle,
  updateSubtitle,
  addElement,
  editElementContent,
  editSectionField,
  deleteElement,
  reorderElements,
  updateImageDimensions,
  resetPage,
} from "../../utils/page3Slice";
import axiosInstance from "../../utils/axiosInstance";

// === A4 Page Constants ===
const A4_HEIGHT_PX = 1123;
const MIN_PAGE_HEIGHT = A4_HEIGHT_PX;
const MAX_PAGE_HEIGHT = A4_HEIGHT_PX;

// Sortable Components
const SortableTitle = ({ element, mode, selectedFont, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: element.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(element.content);

  const handleSave = () => {
    onEdit(element.id, value);
    setIsEditing(false);
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, position: "relative" }}>
        {mode === "dev" && (
          <Box {...attributes} {...listeners} sx={{ cursor: "grab", display: "flex", alignItems: "center", "&:active": { cursor: "grabbing" } }}>
            <DragIndicator sx={{ color: "text.secondary" }} />
          </Box>
        )}
        {isEditing && mode === "dev" ? (
          <TextField fullWidth value={value} onChange={(e) => setValue(e.target.value)} size="small" sx={{ flex: 1 }} />
        ) : (
          <Typography variant="h4" sx={{ fontWeight: "bold", fontFamily: selectedFont, textAlign: "center", flex: 1 }}>
            {element.content}
          </Typography>
        )}
        {mode === "dev" && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton size="small" onClick={() => (isEditing ? handleSave() : setIsEditing(true))}>
              {isEditing ? <Save fontSize="small" /> : <Edit fontSize="small" />}
            </IconButton>
            
          </Box>
        )}
      </Box>
    </Box>
  );
};

const SortableMainHeading = ({ element, mode, selectedFont, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: element.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, marginTop: "2rem", marginBottom: "1rem" };
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(element.content);

  const handleSave = () => {
    onEdit(element.id, value);
    setIsEditing(false);
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, position: "relative" }}>
        {mode === "dev" && (
          <Box {...attributes} {...listeners} sx={{ cursor: "grab", display: "flex", alignItems: "center", "&:active": { cursor: "grabbing" } }}>
            <DragIndicator sx={{ color: "text.secondary" }} />
          </Box>
        )}
        {isEditing && mode === "dev" ? (
          <TextField fullWidth value={value} onChange={(e) => setValue(e.target.value)} size="small" sx={{ flex: 1 }} />
        ) : (
          <Typography variant="h3" sx={{ fontWeight: "bold", fontFamily: selectedFont, textAlign: "center", flex: 1 }}>
            {element.content}
          </Typography>
        )}
        {mode === "dev" && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton size="small" onClick={() => (isEditing ? handleSave() : setIsEditing(true))}>
              {isEditing ? <Save fontSize="small" /> : <Edit fontSize="small" />}
            </IconButton>
            
          </Box>
        )}
      </Box>
    </Box>
  );
};

const SortableText = ({ element, mode, selectedFont, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: element.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, marginTop: "1rem" };
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(element.content);

  const handleSave = () => {
    onEdit(element.id, value);
    setIsEditing(false);
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, position: "relative" }}>
        {mode === "dev" && (
          <Box {...attributes} {...listeners} sx={{ cursor: "grab", display: "flex", alignItems: "center", "&:active": { cursor: "grabbing" } }}>
            <DragIndicator sx={{ color: "text.secondary" }} />
          </Box>
        )}
        {isEditing && mode === "dev" ? (
          <TextField fullWidth multiline rows={4} value={value} onChange={(e) => setValue(e.target.value)} sx={{ flex: 1 }} />
        ) : (
          <Typography sx={{ fontFamily: selectedFont, flex: 1,fontSize:15 }}>
            {element.content}
          </Typography>
        )}
        {mode === "dev" && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton size="small" onClick={() => (isEditing ? handleSave() : setIsEditing(true))}>
              {isEditing ? <Save fontSize="small" /> : <Edit fontSize="small" />}
            </IconButton>
            
          </Box>
        )}
      </Box>
    </Box>
  );
};

const SortableImage = ({ element, mode, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: element.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, marginTop: "2rem" };

  return (
    <Box ref={setNodeRef} style={style}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
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
            <DragIndicator sx={{ color: "text.secondary" }} />
          </Box>
        )}
        <Box
          sx={{
            width: element.dimensions?.width || "100%",
            height: element.dimensions?.height || "100%",
            border: "1px solid #ccc",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f9f9f9",
            overflow: "hidden",
            position: "relative",
            maxWidth: "100%",
          }}
        >
          <img src={element.content} alt="Content" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {mode === "dev" && (
            <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 1, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 1, padding: 0.5 }}>
              <IconButton size="small" onClick={() => onEdit(element)}>
                <Edit fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const SortableSection = ({ element, mode, selectedFont, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: element.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, marginTop: "2rem" };
  const [editState, setEditState] = useState({ title: false, desc: false });
  const [data, setData] = useState({ title: element.title, desc: element.desc });

  const handleSave = (field) => {
    onEdit(element.id, field, data[field]);
    setEditState((prev) => ({ ...prev, [field]: false }));
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <Box sx={{ position: "relative" }}>
        {mode === "dev" && (
          <Box
            {...attributes}
            {...listeners}
            sx={{
              cursor: "grab",
              display: "flex",
              alignItems: "center",
              position: "absolute",
              left: -40,
              top: 0,
              "&:active": { cursor: "grabbing" },
            }}
          >
            <DragIndicator sx={{ color: "text.secondary" }} />
          </Box>
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          {editState.title && mode === "dev" ? (
            <TextField fullWidth value={data.title} onChange={(e) => setData((prev) => ({ ...prev, title: e.target.value }))} size="small" />
          ) : (
            <Typography variant="h5" sx={{ fontWeight: "bold", fontFamily: selectedFont, flex: 1 }}>
              {element.title}
            </Typography>
          )}
          {mode === "dev" && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton size="small" onClick={() => editState.title ? handleSave("title") : setEditState((prev) => ({ ...prev, title: true }))}>
                {editState.title ? <Save fontSize="small" /> : <Edit fontSize="small" />}
              </IconButton>

            </Box>
          )}
        </Box>
        {editState.desc && mode === "dev" ? (
          <TextField fullWidth multiline minRows={3} value={data.desc} onChange={(e) => setData((prev) => ({ ...prev, desc: e.target.value }))} sx={{ mt: 1 }} />
        ) : (
          <Typography sx={{ fontFamily: selectedFont, lineHeight: 1.8, mt: 1 }}>
            {element.desc}
          </Typography>
        )}
        {mode === "dev" && !editState.title && (
          <IconButton size="small" onClick={() => editState.desc ? handleSave("desc") : setEditState((prev) => ({ ...prev, desc: true }))} sx={{ mt: 1 }}>
            {editState.desc ? <Save fontSize="small" /> : <Edit fontSize="small" />}
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

const Page4AboutHumantek = ({
  mode = "prod",
  selectedFont = "'Poppins', sans-serif",
  selectedLayout = {},
}) => {
  const pageRef = useRef(null);
  const dispatch = useDispatch();
  const { title, subtitle, elements } = useSelector((state) => state.page3);

  const [editState, setEditState] = useState({ title: false, subtitle: false });
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  const [editDialog, setEditDialog] = useState({ open: false, elementId: null, dimensions: { width: "", height: "" } });
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  const [hasShownLimitModal, setHasShownLimitModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));


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



  const safeAdd = (addFn) => {
    if (isLimitExceeded) {
      if (!hasShownLimitModal) setShowLimitModal(true);
      return;
    }
    addFn();
  };

  // === FIXED: Sirf image ke liye content bhejo, baaki slice khud default set karega ===
  const handleAddElement = (type, imageUrl = null) => {
    safeAdd(() => {
      if (type === "image") {
        const hasImage = elements.some(el => el.type === "image");
        if (hasImage) {
          dispatch(showToast({ message: "You cannot add another image.", severity: "error" }));
          return;
        }
        dispatch(addElement({ type, content: imageUrl || "/about-HT.png" }));
      } else {
        // Sirf type bhejo → slice me default content set hoga
        dispatch(addElement({ type }));
      }
      setAddMenuAnchor(null);
    });
  };

  const handleDeleteElement = (id) => dispatch(deleteElement(id));
  const handleEditContent = (id, content) => dispatch(editElementContent({ id, content }));
  const handleEditSection = (id, field, value) => dispatch(editSectionField({ id, field, value }));
  const handleEditElement = (el) => el.type === "image" && setEditDialog({ open: true, elementId: el.id, dimensions: el.dimensions || {} });
  const handleSaveImageDimensions = () => {
    dispatch(updateImageDimensions({ id: editDialog.elementId, dimensions: editDialog.dimensions }));
    setEditDialog({ open: false, elementId: null, dimensions: { width: "", height: "" } });
  };

  const handleDragElement = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    dispatch(reorderElements({ activeId: active.id, overId: over.id }));
  };
const handleReset = async () => {
  if (!window.confirm("Are you sure you want to reset this page to default?")) return;

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  try {
    // 🔹 1. Send default data to backend to reset DB
await axiosInstance.post(`/api/proposals/pages/reset/${user.id}`, {
  title,
  subtitle,
  elements
});

    // 🔹 2. Reset Redux store
    dispatch(resetPage());

    dispatch(showToast({ message: "Page reset to default", severity: "success" }));
  } catch (err) {
    console.error(err);
    dispatch(showToast({ message: "Failed to reset page", severity: "error" }));
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
          px: 6.7,
          py: 5,
          minHeight: `${MIN_PAGE_HEIGHT}px`,
          maxHeight: `${MAX_PAGE_HEIGHT}px`,
          overflow: "hidden",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          fontFamily: selectedFont,
          position: "relative",
        }}
      >
        {isLimitExceeded && mode === "dev" && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2, borderRadius: 2 }}>
            Page height limit exceeded! You can edit/delete but cannot add new elements.
          </Alert>
        )}

        <Box sx={{ padding: "20px", width: "100%", maxWidth: "100%", marginX: "auto", boxSizing: "border-box" }}>
          <Box sx={{ textAlign: "center", mb: 3, display: "flex", alignItems: "center", gap: 2, justifyContent: "center"}}>
            {editState.title && mode === "dev" ? (
              <TextField fullWidth value={title} onChange={e => dispatch(updateTitle(e.target.value))} size="small" />
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: selectedFont }}>{title}</Typography>
            )}
            {mode === "dev" && (
              <IconButton size="small" onClick={() => setEditState(p => ({ ...p, title: !p.title }))}>
                {editState.title ? <Save /> : <Edit />}
              </IconButton>
            )}
          </Box>

          <Box sx={{ mt:"3rem", display: "flex", alignItems: "center", gap: 2 }}>
            {editState.subtitle && mode === "dev" ? (
              <TextField fullWidth value={subtitle} onChange={e => dispatch(updateSubtitle(e.target.value))} size="small" />
            ) : (
              <Typography variant="h6" sx={{ fontWeight:600, fontFamily: selectedFont }}>{subtitle}</Typography>
            )}
            {mode === "dev" && (
              <IconButton size="small" onClick={() => setEditState(p => ({ ...p, subtitle: !p.subtitle }))}>
                {editState.subtitle ? <Save /> : <Edit />}
              </IconButton>
            )}
          </Box>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragElement}>
            <SortableContext items={elements.map(el => el.id)} strategy={verticalListSortingStrategy}>
              {elements.map(el => {
                if (el.type === "title") return <SortableTitle key={el.id} element={el} mode={mode} selectedFont={selectedFont} onEdit={handleEditContent} onDelete={handleDeleteElement} />;
                if (el.type === "mainHeading") return <SortableMainHeading key={el.id} element={el} mode={mode} selectedFont={selectedFont} onEdit={handleEditContent} onDelete={handleDeleteElement} />;
                if (el.type === "text") return <SortableText key={el.id} element={el} mode={mode} selectedFont={selectedFont} onEdit={handleEditContent} onDelete={handleDeleteElement} />;
                if (el.type === "image") return <SortableImage key={el.id} element={el} mode={mode} onEdit={handleEditElement} onDelete={handleDeleteElement} />;
                if (el.type === "section") return <SortableSection key={el.id} element={el} mode={mode} selectedFont={selectedFont} onEdit={handleEditSection} onDelete={handleDeleteElement} />;
                return null;
              })}
            </SortableContext>
          </DndContext>

    
        </Box>

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
    Page About Humantek
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
            <Typography sx={{ fontSize: "1rem", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              This page has exceeded the A4 height limit of <strong>{MAX_PAGE_HEIGHT}px</strong>.
            </Typography>
            <Typography sx={{ mt: 2, fontSize: "1rem", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              You can still <strong>edit or delete</strong> elements.
            </Typography>
            <Typography sx={{ mt: 1, fontSize: "1rem", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
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
                  "&:hover": { background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)", transform: "translateY(-2px)", boxShadow: "0 12px 32px rgba(102, 126, 234, 0.5)" },
                  transition: "all 0.3s ease",
                }}
              >
                Got it
              </Button>
            </Tooltip>
          </DialogActions>
        </Dialog>

        <EditImageDialog editDialog={editDialog} setEditDialog={setEditDialog} handleSaveImageDimensions={handleSaveImageDimensions} />
      </Box>
    </CustomHeaderFooter>
  );
};

export default Page4AboutHumantek;