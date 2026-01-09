// src/components/pdf/Page2BrandedCover.jsx
import {
  Box,
  Typography,
  Container,
  TextField,
  IconButton,
  Button,
  Stack,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
} from "@mui/material";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  Add,
  Delete,
  Edit,
  Save,
  DragIndicator,
  Title as TitleIcon,
  Image as ImageIcon,
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
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import EditImageDialog from "../EditImageDialog";
import { useDispatch, useSelector } from "react-redux";
import {
  resetPage1,
  setBrandName,
  setBrandTagline,
  setProjectBrief,
} from "../../utils/page1Slice";
import axiosInstance from "../../utils/axiosInstance";
import { showToast } from "../../utils/toastSlice";

// === A4 Constants ===
const A4_HEIGHT_PX = 1123; // Standard A4 height in PDF (px)
const MAX_PAGE_HEIGHT = A4_HEIGHT_PX;

// TextField styling separated for reuse
const getTextFieldSx = (selectedFont) => ({
  fontFamily: selectedFont,
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.6)" },
    "&.Mui-focused fieldset": {
      borderColor: "#FF8C00",
      boxShadow: "0 0 0 2px rgba(255,140,0,0.3)",
    },
  },
  "& .MuiInputBase-input": { color: "#000", fontFamily: selectedFont },
  "& .MuiInputLabel-root": { fontFamily: selectedFont, color: "#fff" },
});

// Sortable Main Heading Component
const SortableMainHeading = ({
  element,
  mode,
  selectedFont,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    mY: "2rem",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(element.content);
  const handleSave = () => {
    onEdit(element.id, value);
    setIsEditing(false);
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          gap: 2,
        }}
      >
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
            <DragIndicator sx={{ color: "#fff" }} />
          </Box>
        )}

        {isEditing && mode === "dev" ? (
          <TextField
            value={value}
            onChange={(e) => setValue(e.target.value)}
            size="small"
            sx={getTextFieldSx(selectedFont)}
          />
        ) : (
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              fontFamily: selectedFont,
              textAlign: "center",
              color: "#fff",
              fontSize: 48,
            }}
          >
            {element.content}
          </Typography>
        )}

        {mode === "dev" && (
          <Box sx={{ display: "flex", gap: 1, position: "absolute", right: 0 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={isEditing ? <Save /> : <Edit />}
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              sx={{ color: "#fff", borderColor: "#fff" }}
            >
              {isEditing ? "Save" : "Edit"}
            </Button>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(element.id)}
            >
              <Delete />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Sortable Standalone Image Component
const SortableStandaloneImage = ({ element, mode, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginTop: "2rem",
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
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
            <DragIndicator sx={{ color: "#fff" }} />
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
          <Box
            sx={{
              display: "flex",
              gap: 1,
              position: "absolute",
              right: 0,
              top: 0,
            }}
          >
            <Button
              size="small"
              variant="contained"
              startIcon={<Edit />}
              onClick={() => onEdit(element)}
              sx={{ color: "#fff", borderColor: "#fff" }}
            >
              Edit
            </Button>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(element.id)}
            >
              <Delete />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Sortable Section Component
const SortableSection = ({ element, mode, selectedFont, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginTop: "2rem",
  };

  const [editState, setEditState] = useState({ title: false, desc: false });
  const [data, setData] = useState({
    title: element.title,
    desc: element.desc,
  });

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
            <DragIndicator sx={{ color: "#fff" }} />
          </Box>
        )}

        <Stack direction="row" alignItems="center" spacing={1}>
          {mode === "dev" && (
            <>
              <Button
                size="small"
                variant="outlined"
                startIcon={editState.title ? <Save /> : <Edit />}
                onClick={() =>
                  editState.title
                    ? handleSave("title")
                    : setEditState((prev) => ({ ...prev, title: true }))
                }
                sx={{ color: "#fff", borderColor: "#fff" }}
              >
                {editState.title ? "Save" : "Edit"}
              </Button>
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(element.id)}
              >
                <Delete />
              </IconButton>
            </>
          )}
          {editState.title && mode === "dev" ? (
            <TextField
              value={data.title}
              onChange={(e) =>
                setData((prev) => ({ ...prev, title: e.target.value }))
              }
              size="small"
              sx={getTextFieldSx(selectedFont)}
            />
          ) : (
            <Typography
              sx={{
                color: "#fff",
                fontSize: 24,
                fontWeight: 700,
                fontFamily: selectedFont,
              }}
            >
              {element.title}
            </Typography>
          )}

          <Box
            sx={{
              height: "3px",
              width: "250px",
              background:
                "linear-gradient(to right, transparent, #FFA94D, #FFD9A3)",
              borderRadius: "2px",
            }}
          />
        </Stack>

        {editState.desc && mode === "dev" ? (
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={data.desc}
            onChange={(e) =>
              setData((prev) => ({ ...prev, desc: e.target.value }))
            }
            sx={{
              ...getTextFieldSx(selectedFont),
              mt: 1.5,
              backgroundColor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
              fontFamily: selectedFont,
              whiteSpace: "normal",
              wordBreak: "break-word",
              overflow: "visible",
            }}
          />
        ) : (
          <Typography
            sx={{
              color: "#E0E0E0",
              fontSize: 15,
              lineHeight: 1.9,
              mt: 2,
              fontWeight: 400,
              fontFamily: selectedFont,
              whiteSpace: "normal",
              wordBreak: "break-word",
              overflow: "visible",
            }}
          >
            {element.desc}
          </Typography>
        )}

        {mode === "dev" && !editState.title && (
          <Button
            size="small"
            variant="outlined"
            startIcon={editState.desc ? <Save /> : <Edit />}
            onClick={() =>
              editState.desc
                ? handleSave("desc")
                : setEditState((prev) => ({ ...prev, desc: true }))
            }
            sx={{ mt: 1, color: "#fff", borderColor: "#fff" }}
          >
            {editState.desc ? "Save" : "Edit"}
          </Button>
        )}
      </Box>
    </Box>
  );
};

const Page2BrandedCover = ({
  formData,
  mode = "prod",
  selectedFont = "'Poppins', sans-serif",
}) => {
  const dispatch = useDispatch();
  const pageRef = useRef(null);
  const pageDataRT = useSelector((state) => state.page1Slice);
  console.log("pagedataRT", pageDataRT);

  // ✅ FIX: Sync local state with Redux whenever Redux updates
  const [data, setData] = useState({
    brandName: pageDataRT.brandName,
    brandTagline: pageDataRT.brandTagline,
    projectBrief: pageDataRT.projectBrief,
  });

  // ✅ Keep local state synced with Redux
  useEffect(() => {
    setData({
      brandName: pageDataRT.brandName,
      brandTagline: pageDataRT.brandTagline,
      projectBrief: pageDataRT.projectBrief,
    });
  }, [pageDataRT.brandName, pageDataRT.brandTagline, pageDataRT.projectBrief]);

  const [elements, setElements] = useState(formData?.customElements || []);

  const [editState, setEditState] = useState({
    brandName: false,
    brandTagline: false,
    projectBrief: false,
  });

  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  const [editDialog, setEditDialog] = useState({
    open: false,
    elementId: null,
    dimensions: { width: "", height: "" },
  });

  // === Height Limit States ===
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  const [hasShownLimitModal, setHasShownLimitModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleEditToggle = (field) => {
    setEditState((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const safeAdd = (addFn) => {
    if (isLimitExceeded) {
      if (!hasShownLimitModal) {
        setShowLimitModal(true);
        setHasShownLimitModal(true);
      }
      return;
    }
    addFn();
  };

  const handleAddElement = (type, imageUrl = null) => {
    safeAdd(() => {
      const newId = `element-${Date.now()}`;
      if (type === "mainHeading") {
        setElements([
          ...elements,
          { id: newId, type: "mainHeading", content: "New Main Heading" },
        ]);
      } else if (type === "section") {
        setElements([
          ...elements,
          {
            id: newId,
            type: "section",
            title: "New Section",
            desc: "Description...",
          },
        ]);
      } else if (type === "standaloneImage") {
        setElements([
          ...elements,
          {
            id: newId,
            type: "standaloneImage",
            content: imageUrl || "https://via.placeholder.com/500x300",
            dimensions: { width: "100%", height: "auto" },
          },
        ]);
      }
      setAddMenuAnchor(null);
    });
  };

  const handleDeleteElement = (elementId) => {
    setElements(elements.filter((el) => el.id !== elementId));
  };

  const handleEditElement = (element) => {
    if (element.type === "standaloneImage") {
      setEditDialog({
        open: true,
        elementId: element.id,
        dimensions: element.dimensions || { width: "500px", height: "auto" },
      });
    }
  };

  const handleEditMainHeading = (id, content) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, content } : el)));
  };

  const handleEditSection = (id, field, value) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, [field]: value } : el))
    );
  };

  const handleSaveImageDimensions = () => {
    setElements(
      elements.map((el) =>
        el.id === editDialog.elementId
          ? { ...el, dimensions: editDialog.dimensions }
          : el
      )
    );
    setEditDialog({
      open: false,
      elementId: null,
      dimensions: { width: "", height: "" },
    });
  };

  const handleDragElement = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = elements.findIndex((el) => el.id === active.id);
    const newIndex = elements.findIndex((el) => el.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    setElements(arrayMove(elements, oldIndex, newIndex));
  };

  const textFieldSx = getTextFieldSx(selectedFont);

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
  }, [elements, data]);

  // ✅ FIX: Reset handler now properly syncs state
  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset this page to default?"))
      return;

    const user = JSON.parse(sessionStorage.getItem("user") || "{}");

    try {
      // 🔹 1. Reset Redux store FIRST
      dispatch(resetPage1());

      // 🔹 2. Get the fresh default data from Redux (after reset)
      // Wait a tick for Redux to update
      await new Promise((resolve) => setTimeout(resolve, 0));

      // 🔹 3. Send reset request to backend
      await axiosInstance.post(`/api/proposals/pages/reset/page1/${user.id}`);

      // 🔹 4. Clear local edit states
      setEditState({
        brandName: false,
        brandTagline: false,
        projectBrief: false,
      });

      // 🔹 5. Reset elements to default
      setElements(formData?.customElements || []);

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
    <Box
      ref={pageRef}
      className="pdf-page"
      sx={{
        backgroundImage: "url(/newBg.png)",
        minHeight: `${A4_HEIGHT_PX}px`,
        maxHeight: `${A4_HEIGHT_PX}px`,
        width: "100%",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#fff",
        pageBreakAfter: "always",
        position: "relative",
        overflow: "hidden",
        fontFamily: selectedFont,
      }}
    >
      {mode === "dev" && (
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Button size="small" onClick={handleReset} color="warning">
            Reset Page Data To Default <RefreshOutlined fontSize="small" />
          </Button>
        </Box>
      )}

      {/* Warning Banner */}
      {isLimitExceeded && mode === "dev" && (
        <Alert
          severity="warning"
          icon={<WarningIcon />}
          sx={{ m: 2, borderRadius: 2 }}
        >
          Page height limit exceeded! You can edit/delete but cannot add new
          elements.
        </Alert>
      )}

      {/* Logo */}
      <Box sx={{ position: "absolute", top: 100, left: 50, zIndex: 10 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(10px)",
            }}
          >
            <Box
              component="img"
              src="/download.jpg"
              alt="Logo"
              sx={{
                width: 50,
                height: 50,
                objectFit: "contain",
                borderRadius: "50%",
              }}
            />
          </Box>
          <Box>
            <Typography
              sx={{
                color: "#FF8C00",
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: 1.5,
                fontFamily: selectedFont,
              }}
            >
              HUMANTEK
            </Typography>
            <Typography
              sx={{
                color: "#fff",
                fontSize: 10,
                letterSpacing: 2.5,
                fontFamily: selectedFont,
              }}
            >
              IT SERVICES & SOLUTIONS
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* MAIN CONTENT */}
      <Container
        sx={{
          position: "relative",
          pt: "220px",
          px: 6,
          pb: 8,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          marginLeft: 4,
        }}
      >
   <Box
  sx={{
    width: "100%",
    height: "100%", // full page height
    mt: "calc((70vh - 300px) / 2)", // 300px = approx height of the box content
    mb: "calc((70vh - 300px) / 2)",

    boxSizing: "border-box",
  }}
>
        {/* Brand Name with Decorative Line */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {editState.brandName && mode === "dev" ? (
            <TextField
              value={data.brandName}
              onChange={(e) => {
                handleChange("brandName", e.target.value);
                dispatch(setBrandName(e.target.value));
              }}
              
              size="small"
              sx={{ ...textFieldSx, maxWidth: 300,color:'#000' }}
            />
          ) : (
            <Typography
              sx={{
                color: "#FFF",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: "uppercase",
                fontFamily: selectedFont,
              }}
            >
              {data.brandName}
            </Typography>
          )}
          {mode === "dev" && (
            <Button
              size="small"
              variant="outlined"
              startIcon={editState.brandName ? <Save /> : <Edit />}
              onClick={() => handleEditToggle("brandName")}
            >
              {editState.brandName ? "Save" : "Edit"}
            </Button>
          )}
          <Box
            sx={{
              flexGrow: 1,
              height: "5px",
              maxWidth: "400px",
              background:
                "linear-gradient(to right, #FFA94D, #FFD9A3, transparent)",
                marginTop:2,
              borderRadius: "2px",
            }}
          />
        </Box>

        {/* Tagline - Now wraps safely */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
            {editState.brandTagline && mode === "dev" ? (
              <TextField
                fullWidth
                value={data.brandTagline}
                onChange={(e) => {
                  handleChange("brandTagline", e.target.value);
                  dispatch(setBrandTagline(e.target.value));
                }}
                size="small"
                sx={{
                  fontSize: 32,
                  fontWeight: 700,
                  "& .MuiInputBase-input": {
                    color: "#000 !important",
                    fontSize: { xs: 32, md: 48, lg: 68 },
                    fontWeight: 900,
                    lineHeight: 1.1,
                  },
                  
                }}
              
              />
            ) : (
              <Typography
                sx={{
                  color: "#FF8C00",
                  fontSize: { xs: 32, sm: 48, md: 68, lg: 76 },
                  fontWeight: 900,
                  lineHeight: 1.1,
                  fontFamily: selectedFont,
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  overflow: "visible",
                }}
              >
                {data.brandTagline}
              </Typography>
            )}
                     {mode === "dev" && (
            <Box sx={{ alignSelf: "flex-start" }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={editState.brandTagline ? <Save /> : <Edit />}
                onClick={() => handleEditToggle("brandTagline")}
                sx={{ whiteSpace: "nowrap" }}
              >
                {editState.brandTagline ? "Save" : "Edit"}
              </Button>
            </Box>
          )}
          </Box>

 
        </Box>
             <Typography
              sx={{
                color: "#FFF",
                fontSize: 15,
                marginTop:5,
                fontWeight: 700,
                fontFamily: selectedFont,
              }}
            >
              Proposal by <span style={{color:"#FF8C00"}}>Humantek</span>
            </Typography>
</Box>
        {/* Dynamic Elements with Drag and Drop */}
        {/* <Box sx={{ flexGrow: 1, mt: 4 }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragElement}
          >
            <SortableContext
              items={elements.map((el) => el.id)}
              strategy={verticalListSortingStrategy}
            >
              {elements.map((element) => {
                if (element.type === "mainHeading") {
                  return (
                    <SortableMainHeading
                      key={element.id}
                      element={element}
                      mode={mode}
                      selectedFont={selectedFont}
                      onEdit={handleEditMainHeading}
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
                      element={element}
                      mode={mode}
                      selectedFont={selectedFont}
                      onEdit={handleEditSection}
                      onDelete={handleDeleteElement}
                    />
                  );
                }
                return null;
              })}
            </SortableContext>
          </DndContext>
        </Box> */}

        {/* Add Element Button */}
        {/* {mode === "dev" && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={(e) =>
                !isLimitExceeded && setAddMenuAnchor(e.currentTarget)
              }
              disabled={isLimitExceeded}
              sx={{
                backgroundColor: "#FF8C00",
                color: "#fff",
                textTransform: "none",
                "&:hover": { backgroundColor: "#e67e00" },
                fontFamily: selectedFont,
              }}
            >
              Add Element
            </Button>

            <Menu
              anchorEl={addMenuAnchor}
              open={Boolean(addMenuAnchor)}
              onClose={() => setAddMenuAnchor(null)}
            >
              <MenuItem
                onClick={() => handleAddElement("mainHeading")}
                disabled={isLimitExceeded}
              >
                <TitleIcon fontSize="small" sx={{ mr: 1 }} />
                Add Main Heading
              </MenuItem>
              <MenuItem
                onClick={() => handleAddElement("section")}
                disabled={isLimitExceeded}
              >
                <ListIcon fontSize="small" sx={{ mr: 1 }} />
                Add Section
              </MenuItem>
              <MenuItem disabled={isLimitExceeded}>
                <label
                  htmlFor="img-upload-standalone"
                  style={{
                    cursor: isLimitExceeded ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <ImageIcon fontSize="small" sx={{ mr: 1 }} />
                  Add Image
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
                      handleAddElement("standaloneImage", url);
                    }
                  }}
                />
              </MenuItem>
            </Menu>
          </Box>
        )} */}
      </Container>

      {/* Limit Exceeded Modal (Only Once) */}
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
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            },
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              background:
                "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
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
            flexDirection: "column",
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
            Page 1
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
            This page has exceeded the A4 height limit of{" "}
            <strong>{MAX_PAGE_HEIGHT}px</strong>.
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
        <DialogActions
          sx={{
            justifyContent: "center",
            pb: 2,
            background: "rgba(255,255,255,0.9)",
          }}
        >
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
                  background:
                    "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
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

      {/* ✅ Project Brief pinned absolutely at bottom */}
      {/* <Box
        sx={{
          position: "absolute",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          width: "85%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center", // vertical center alignment
            gap: 2, // space between text and line
            mt: 4, // top margin
            width: "100%",
          }}
        >
          <Typography
            sx={{
              color: "#fff",
              fontSize: 32,
              fontWeight: 800,
              fontFamily: selectedFont,
              lineHeight: 1,
            }}
          >
            Project Brief
          </Typography>
          <Box
            sx={{
              flexGrow: 1, // line takes remaining space
              height: 3,
              marginTop:3,
              maxWidth: 250, // optional max width
              background:
                "linear-gradient(to right, #FFA94D, #FFD9A3, transparent)",
              borderRadius: 2,
            }}
          />
        </Box>

        {editState.projectBrief && mode === "dev" ? (
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={data.projectBrief}
            onChange={(e) => {
              handleChange("projectBrief", e.target.value);
              dispatch(setProjectBrief(e.target.value));
            }}
            sx={{
              ...textFieldSx,
              mt: 1,
              backgroundColor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
            }}
          />
        ) : (
          <Typography
            sx={{
              color: "#E0E0E0",
              fontSize: 15,
              lineHeight: 1.9,
              mt: 3.5,
              fontWeight: 400,
              fontFamily: selectedFont,
            }}
          >
            {data.projectBrief}
          </Typography>
        )}

        {mode === "dev" && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleEditToggle("projectBrief")}
            startIcon={editState.projectBrief ? <Save /> : <Edit />}
            sx={{ mt: 1 }}
          >
            {editState.projectBrief ? "Save" : "Edit"}
          </Button>
        )}
      </Box> */}
      {/* Image Dimensions Edit Dialog */}
      <EditImageDialog
        editDialog={editDialog}
        setEditDialog={setEditDialog}
        handleSaveImageDimensions={handleSaveImageDimensions}
      />
    </Box>
  );
};

export default Page2BrandedCover;
