
// // src/components/pdf/PricingTable.jsx
// import React, { useRef, useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   IconButton,
//   TextField,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Menu,
//   MenuItem,
//   Popover,
//   Alert,
// } from "@mui/material";
// import EditIcon from "@mui/icons-material/Edit";
// import AddIcon from "@mui/icons-material/Add";
// import DeleteIcon from "@mui/icons-material/Delete";
// import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
// import TitleIcon from "@mui/icons-material/Title";
// import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
// import ImageIcon from "@mui/icons-material/Image";
// import ListIcon from "@mui/icons-material/List";
// import ColorLensIcon from "@mui/icons-material/ColorLens";
// import WarningIcon from "@mui/icons-material/Warning";
// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   useSortable,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import EditImageDialog from "../EditImageDialog";
// import CustomHeaderFooter from "../CustomHeaderFooter";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   initializePage,
//   updatePageTitle,
//   updateHeading,
//   updateSubheading,
//   addGridPackage,
//   updateGridPackage,
//   updateGridPackageItem,
//   addItemToGridPackage,
//   deleteItemFromGridPackage,
//   deleteGridPackage,
//   addElement,
//   updateElementContent,
//   updateStandalonePackage,
//   updateStandalonePackageItem,
//   addItemToStandalonePackage,
//   deleteItemFromStandalonePackage,
//   updateImageDimensions,
//   deleteElement,
//   reorderElements,
//   resetPageData,
// } from "../../utils/pricingReducer";
// import axiosInstance from "../../utils/axiosInstance";
// import { RefreshOutlined } from "@mui/icons-material";
// import { showToast } from "../../utils/toastSlice";
// import { addPricingContinuationPage } from "../../utils/pagesSlice";
// import { v4 as uuidv4 } from 'uuid';

// // === A4 Constants ===
// const A4_HEIGHT_PX = 1123;
// const MAX_PAGE_HEIGHT = A4_HEIGHT_PX;

// // ==================== Sortable Components ====================
// const SortableMainHeading = ({ element, mode, selectedFont, onDelete, pageId }) => {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: element.id });
//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.5 : 1,
//   };
//   const [isEditing, setIsEditing] = useState(false);
//   const [value, setValue] = useState(element.content);
//   const dispatch = useDispatch();

//   const handleSave = () => {
//     dispatch(updateElementContent({ pageId, id: element.id, content: value }));
//     setIsEditing(false);
//   };

//   const handleCancel = () => {
//     setValue(element.content);
//     setIsEditing(false);
//   };

//   return (
//     <Box ref={setNodeRef} style={style} sx={{ maxWidth: 900, mx: "auto" }}>
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           gap: 2,
//           justifyContent: "center",
//           position: "relative",
//           mb: 2,
//         }}
//       >
//         {mode === "dev" && (
//           <Box
//             {...attributes}
//             {...listeners}
//             sx={{
//               cursor: "grab",
//               position: "absolute",
//               left: 0,
//               "&:active": { cursor: "grabbing" },
//             }}
//           >
//             <DragIndicatorIcon sx={{ color: "text.secondary" }} />
//           </Box>
//         )}
//         {isEditing && mode === "dev" ? (
//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               gap: 1,
//               width: "100%",
//               maxWidth: 600,
//             }}
//           >
//             <TextField
//               fullWidth
//               value={value}
//               onChange={(e) => setValue(e.target.value)}
//               size="small"
//               autoFocus
//             />
//             <Button size="small" variant="contained" onClick={handleSave}>
//               Save
//             </Button>
//             <Button size="small" onClick={handleCancel}>
//               Cancel
//             </Button>
//           </Box>
//         ) : (
//           <Typography
//             variant="h3"
//             sx={{
//               fontWeight: "bold",
//               fontFamily: selectedFont,
//               textAlign: "center",
//               color: "#333",
//             }}
//           >
//             {element.content}
//           </Typography>
//         )}
//         {mode === "dev" && !isEditing && (
//           <Box sx={{ display: "flex", gap: 1 }}>
//             <IconButton size="small" onClick={() => setIsEditing(true)}>
//               <EditIcon fontSize="small" />
//             </IconButton>
//             <IconButton
//               size="small"
//               color="error"
//               onClick={() => onDelete(element.id)}
//             >
//               <DeleteIcon fontSize="small" />
//             </IconButton>
//           </Box>
//         )}
//       </Box>
//     </Box>
//   );
// };

// const SortableText = ({ element, mode, selectedFont, onDelete, pageId }) => {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: element.id });
//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.5 : 1,
//     marginTop: "1rem",
//     marginBottom: "1rem",
//   };
//   const [isEditing, setIsEditing] = useState(false);
//   const [value, setValue] = useState(element.content);
//   const dispatch = useDispatch();

//   const handleSave = () => {
//     dispatch(updateElementContent({ pageId, id: element.id, content: value }));
//     setIsEditing(false);
//   };

//   const handleCancel = () => {
//     setValue(element.content);
//     setIsEditing(false);
//   };

//   return (
//     <Box ref={setNodeRef} style={style} sx={{ maxWidth: 900, mx: "auto" }}>
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "flex-start",
//           gap: 2,
//           position: "relative",
//         }}
//       >
//         {mode === "dev" && (
//           <Box
//             {...attributes}
//             {...listeners}
//             sx={{
//               cursor: "grab",
//               position: "absolute",
//               left: -40,
//               top: 0,
//               "&:active": { cursor: "grabbing" },
//             }}
//           >
//             <DragIndicatorIcon sx={{ color: "text.secondary" }} />
//           </Box>
//         )}
//         {isEditing && mode === "dev" ? (
//           <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
//             <TextField
//               fullWidth
//               multiline
//               rows={3}
//               value={value}
//               onChange={(e) => setValue(e.target.value)}
//               size="small"
//               autoFocus
//             />
//             <Box sx={{ display: "flex", gap: 1 }}>
//               <Button size="small" variant="contained" onClick={handleSave}>
//                 Save
//               </Button>
//               <Button size="small" onClick={handleCancel}>
//                 Cancel
//               </Button>
//             </Box>
//           </Box>
//         ) : (
//           <Typography
//             variant="body1"
//             sx={{
//               flex: 1,
//               fontFamily: selectedFont,
//               color: "#444",
//               lineHeight: 1.7,
//             }}
//           >
//             {element.content}
//           </Typography>
//         )}
//         {mode === "dev" && !isEditing && (
//           <Box sx={{ display: "flex", gap: 1 }}>
//             <IconButton size="small" onClick={() => setIsEditing(true)}>
//               <EditIcon fontSize="small" />
//             </IconButton>
//             <IconButton
//               size="small"
//               color="error"
//               onClick={() => onDelete(element.id)}
//             >
//               <DeleteIcon fontSize="small" />
//             </IconButton>
//           </Box>
//         )}
//       </Box>
//     </Box>
//   );
// };

// const SortableImage = ({ element, mode, onEdit, onDelete }) => {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: element.id });
//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.5 : 1,
//     marginTop: "2rem",
//     marginBottom: "1rem",
//   };

//   return (
//     <Box ref={setNodeRef} style={style} sx={{ maxWidth: 900, mx: "auto" }}>
//       <Box
//         sx={{
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           position: "relative",
//         }}
//       >
//         {mode === "dev" && (
//           <Box
//             {...attributes}
//             {...listeners}
//             sx={{
//               cursor: "grab",
//               position: "absolute",
//               left: 0,
//               top: "50%",
//               transform: "translateY(-50%)",
//               "&:active": { cursor: "grabbing" },
//             }}
//           >
//             <DragIndicatorIcon sx={{ color: "text.secondary" }} />
//           </Box>
//         )}
//         <Box
//           sx={{
//             width: element.dimensions?.width || "500px",
//             height: element.dimensions?.height || "auto",
//             border: "1px solid #ccc",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             backgroundColor: "#f9f9f9",
//             overflow: "hidden",
//             position: "relative",
//             borderRadius: 2,
//           }}
//         >
//           <img
//             src={element.content}
//             alt="Content"
//             style={{ width: "100%", height: "100%", objectFit: "contain" }}
//           />
//           {mode === "dev" && (
//             <Box
//               sx={{
//                 position: "absolute",
//                 top: 8,
//                 right: 8,
//                 display: "flex",
//                 gap: 1,
//                 backgroundColor: "rgba(255,255,255,0.9)",
//                 borderRadius: 1,
//                 padding: 0.5,
//               }}
//             >
//               <IconButton size="small" onClick={() => onEdit(element)}>
//                 <EditIcon fontSize="small" />
//               </IconButton>
//               <IconButton
//                 size="small"
//                 color="error"
//                 onClick={() => onDelete(element.id)}
//               >
//                 <DeleteIcon fontSize="small" />
//               </IconButton>
//             </Box>
//           )}
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// const SortableStandalonePackage = ({
//   element,
//   mode,
//   selectedFont,
//   onEdit,
//   onDelete,
//   onEditItem,
//   onDeleteItem,
//   onAddItem,
//   onColorChange,
//   pageId,
// }) => {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: element.id });
//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.5 : 1,
//     marginTop: "2rem",
//     marginBottom: "2rem",
//   };
//   const [colorAnchor, setColorAnchor] = useState(null);
//   const dispatch = useDispatch();

//   const handleFieldEdit = (field) => {
//     const newValue = prompt(`Edit ${field}:`, element[field]);
//     if (newValue !== null && newValue !== element[field]) {
//       dispatch(
//         updateStandalonePackage({ pageId, id: element.id, field, value: newValue })
//       );
//     }
//   };

//   return (
//     <Box ref={setNodeRef} style={style} sx={{ maxWidth: 600, mx: "auto" }}>
//       <Box
//         sx={{
//           p: 4,
//           border: "2px solid #e0e0e0",
//           borderRadius: 3,
//           backgroundColor: "white",
//           boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
//           position: "relative",
//         }}
//       >
//         {mode === "dev" && (
//           <Box
//             {...attributes}
//             {...listeners}
//             sx={{
//               cursor: "grab",
//               display: "flex",
//               alignItems: "center",
//               position: "absolute",
//               left: -40,
//               top: 20,
//               "&:active": { cursor: "grabbing" },
//             }}
//           >
//             <DragIndicatorIcon sx={{ color: "text.secondary" }} />
//           </Box>
//         )}
//         <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
//           <Typography
//             variant="h5"
//             sx={{
//               fontWeight: "bold",
//               fontSize: "1.4rem",
//               flex: 1,
//               fontFamily: selectedFont,
//               whiteSpace: "normal",
//               wordBreak: "break-word",
//               overflow: "visible",
//             }}
//           >
//             {element.title}
//           </Typography>
//           {mode === "dev" && (
//             <>
//               <IconButton size="small" onClick={() => handleFieldEdit("title")}>
//                 <EditIcon fontSize="small" />
//               </IconButton>
//               <IconButton
//                 size="small"
//                 onClick={(e) => setColorAnchor(e.currentTarget)}
//               >
//                 <ColorLensIcon fontSize="small" />
//               </IconButton>
//               <IconButton
//                 size="small"
//                 color="error"
//                 onClick={() => onDelete(element.id)}
//               >
//                 <DeleteIcon fontSize="small" />
//               </IconButton>
//             </>
//           )}
//         </Box>
//         <Box
//           sx={{
//             height: 4,
//             width: "100%",
//             backgroundColor: element.color || "#FFD700",
//             mb: 2,
//             borderRadius: "2px",
//           }}
//         />
//         <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
//           <Typography
//             variant="body2"
//             sx={{
//               color: element.color || "#FFD700",
//               fontSize: "0.9rem",
//               mb: 3,
//               fontWeight: 500,
//               flex: 1,
//               fontFamily: selectedFont,
//             }}
//           >
//             {element.subtitle}
//           </Typography>
//           {mode === "dev" && (
//             <IconButton
//               size="small"
//               onClick={() => handleFieldEdit("subtitle")}
//             >
//               <EditIcon fontSize="small" />
//             </IconButton>
//           )}
//         </Box>
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//           <Typography
//             variant="h5"
//             sx={{
//               fontWeight: "bold",
//               mb: 2,
//               fontSize: "1.2rem",
//               fontFamily: selectedFont,
//             }}
//           >
//             {element.price}
//           </Typography>
//           {mode === "dev" && (
//             <IconButton size="small" onClick={() => handleFieldEdit("price")}>
//               <EditIcon fontSize="small" />
//             </IconButton>
//           )}
//         </Box>
//         <Typography
//           variant="h6"
//           sx={{
//             fontWeight: "bold",
//             mb: 1.5,
//             fontSize: "1rem",
//             fontFamily: selectedFont,
//           }}
//         >
//           What's Included:
//         </Typography>
//         <Box component="ul" sx={{ pl: 0, m: 0, listStyle: "none" }}>
//           {element?.items?.map((item, idx) => (
//             <Box
//               component="li"
//               key={idx}
//               sx={{
//                 display: "flex",
//                 fontSize: "0.9rem",
//                 mb: 1,
//                 lineHeight: 1.5,
//                 color: "#333",
//                 "&:hover .actions": { opacity: 1 },
//                 fontFamily: selectedFont,
//               }}
//             >
//               <Box component="span" sx={{ mr: 1.5, fontWeight: "bold" }}>
//                 •
//               </Box>
//               <Box component="span" sx={{ flex: 1 }}>
//                 {item}
//               </Box>
//               {mode === "dev" && (
//                 <Box
//                   className="actions"
//                   sx={{
//                     opacity: 0,
//                     display: "flex",
//                     transition: "opacity 0.2s",
//                   }}
//                 >
//                   <IconButton
//                     size="small"
//                     onClick={() => onEditItem(element.id, idx, item)}
//                   >
//                     <EditIcon fontSize="small" />
//                   </IconButton>
//                   <IconButton
//                     size="small"
//                     color="error"
//                     onClick={() => onDeleteItem(element.id, idx)}
//                   >
//                     <DeleteIcon fontSize="small" />
//                   </IconButton>
//                 </Box>
//               )}
//             </Box>
//           ))}
//         </Box>
//         {mode === "dev" && (
//           <Button
//             startIcon={<AddIcon />}
//             size="small"
//             onClick={() => onAddItem(element.id)}
//             sx={{ mt: 1, fontFamily: selectedFont }}
//           >
//             Add Feature
//           </Button>
//         )}
//       </Box>
//       <Popover
//         open={Boolean(colorAnchor)}
//         anchorEl={colorAnchor}
//         onClose={() => setColorAnchor(null)}
//         anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//       >
//         <Box
//           sx={{
//             p: 1,
//             display: "grid",
//             gridTemplateColumns: "repeat(4, 1fr)",
//             gap: 1,
//           }}
//         >
//           {[
//             "#FFD700",
//             "#FFA500",
//             "#FF6347",
//             "#FF4500",
//             "#DC143C",
//             "#32CD32",
//             "#1E90FF",
//             "#9932CC",
//             "#00CED1",
//             "#FF69B4",
//           ].map((color) => (
//             <Box
//               key={color}
//               sx={{
//                 width: 30,
//                 height: 30,
//                 bgcolor: color,
//                 borderRadius: 1,
//                 cursor: "pointer",
//                 border: "2px solid",
//                 borderColor: element.color === color ? "#000" : "transparent",
//               }}
//               onClick={() => {
//                 onColorChange(element.id, color);
//                 setColorAnchor(null);
//               }}
//             />
//           ))}
//         </Box>
//       </Popover>
//     </Box>
//   );
// };

// // ==================== Main Component ====================
// const PricingTable = ({
//   mode = "dev",
//   selectedFont = "'Poppins', sans-serif",
//   selectedLayout = {},
//   pageId
// }) => {
//   const dispatch = useDispatch();

//   // ✅ Initialize page data if not exists
//   useEffect(() => {
//     dispatch(initializePage({ pageId }));
//   }, [pageId, dispatch]);
//   // ✅ Get THIS page's data only
//   const pageData = useSelector((state) => state.pricing.pageData[pageId] || {
//     pageTitle: 'Service Packages & Quotation',
//     heading: 'Performance Marketing Packages',
//     subheading: "Maximize Your Brand's Impact with Our Performance Marketing Packages.\nTailored for Startups, Scaling Brands, & Market Leaders ready to Dominate with Precision.",
//     gridPackages: [],
//     elements: []
//   });
// const clonedPage = useSelector((state) => state.pricing.pageData[pageId]);

//   const { pageTitle, heading, subheading, gridPackages, elements } = pageData;
//   const pages = useSelector((state) => state.pages.pages);
// console.log('pages',pages)
//   const pageRef = useRef(null);
//   const [editDialog, setEditDialog] = useState({
//     open: false,
//     field: "", value: "", elementId: null, packageId: null, itemIndex: null,
//   });
//   const [addMenuAnchor, setAddMenuAnchor] = useState(null);
//   const [imageDialog, setImageDialog] = useState({
//     open: false, elementId: null, dimensions: { width: "", height: "" },
//   });
//   const [showLimitModal, setShowLimitModal] = useState(false);
//   const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  
//   const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

//   // Height check
//   useEffect(() => {
//     const check = () => {
//       if (!pageRef.current) return;
//       const height = pageRef.current.scrollHeight;
//       const exceeded = height > MAX_PAGE_HEIGHT;
//       setIsLimitExceeded(exceeded);
//       if (exceeded && !showLimitModal) setShowLimitModal(true);
//     };
//     check();
//   }, [elements, gridPackages, showLimitModal]);

//   // ✅ Handle carried element on new continuation page
//   useEffect(() => {
//     const currentPage = pages.find(p => p.id === pageId);
    
//     if (currentPage?.isContinuation && currentPage?.carriedElement && elements.length === 0) {
//       // Add carried element with new unique ID
//       dispatch(addElement({
//         pageId,
//         elementData: {
//           ...currentPage.carriedElement,
//           id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
//         }
//       }));
//     }
//   }, [pageId, pages, elements.length, dispatch]);
//           const currentPageIndex = pages.findIndex(p => p.id === pageId);

//     console.log('page----------------',pageId,currentPageIndex)

//   // ✅ SMART ADD → Auto Clone with FULL DATA Copy
//   const smartAdd = (addAction) => {
//     if (isLimitExceeded) return;

//     const prevHeight = pageRef.current?.scrollHeight || 0;

//     if (typeof addAction === "function") addAction();
//     else dispatch(addAction);

//     setTimeout(() => {
//       const newHeight = pageRef.current?.scrollHeight || 0;

//       if (newHeight > MAX_PAGE_HEIGHT && prevHeight <= MAX_PAGE_HEIGHT) {
//         const lastElement = elements[elements.length - 1];
//         if (!lastElement) return;
// console.log('lastElement',lastElement)
//         const currentPageIndex = pages.findIndex(p => p.id === pageId);
//         const newPageId = uuidv4();

//         // Create continuation page with carried element
//         dispatch(addPricingContinuationPage({
//           afterIndex: currentPageIndex,
//           carriedElement: lastElement,
//           newPageId,
//         }));

//         // ✅ Remove from current page (with pageId)
//         dispatch(deleteElement({ pageId, elementId: lastElement.id }));

//         dispatch(showToast({
//           message: "Last item moved to new page!",
//           severity: "success",
//         }));

//         setTimeout(() => {
//           window.scrollBy({ top: 200, behavior: "smooth" });
//         }, 500);
//       }
//     }, 500);
//   };

//   // ✅ All Add Handlers with pageId
//   const handleAddGridPackage = () => smartAdd(addGridPackage({ pageId }));
//   const handleAddStandalonePackage = () => smartAdd(addElement({ pageId, type: "package" }));
//   const handleAddMainHeading = () => smartAdd(addElement({ pageId, type: "mainHeading" }));
//   const handleAddText = () => smartAdd(addElement({ pageId, type: "text" }));
//   const handleAddImage = (url) => smartAdd(addElement({ pageId, type: "image", url }));
//   const handleAddItemToPackage = (pkgId) => smartAdd(() => dispatch(addItemToGridPackage({ pageId, pkgId })));

//   // ✅ Delete handlers with pageId
//   const handleDeletePackage = (pkgId) => dispatch(deleteGridPackage({ pageId, pkgId }));
//   const handleDeleteItemFromPackage = (pkgId, index) => dispatch(deleteItemFromGridPackage({ pageId, pkgId, index }));
//   const handleDeleteElement = (elementId) => dispatch(deleteElement({ pageId, elementId }));

//   const handleDragElement = ({ active, over }) => {
//     if (!over || active.id === over.id) return;
//     dispatch(reorderElements({ pageId, activeId: active.id, overId: over.id }));
//   };

//   // ✅ Reset Function with pageId
//   const handleReset = async () => {
//     if (!window.confirm("Are you sure you want to reset this page to default?")) return;

//     const user = JSON.parse(sessionStorage.getItem("user") || "{}");

//     try {
//       await axiosInstance.post(`/api/proposals/pages/reset/pricing/${user.id}`, {
//         pageId,
//         pageData: { pageTitle, heading, subheading, gridPackages, elements },
//       });
//       dispatch(resetPageData({ pageId }));
//       dispatch(showToast({ message: "Page reset to default", severity: "success" }));
//     } catch (err) {
//       console.error(err);
//       dispatch(showToast({ message: "Failed to reset page", severity: "error" }));
//     }
//   };

//   // ✅ Edit Handlers with pageId
//   const handleEditMain = (field, value) => setEditDialog({ open: true, field, value, elementId: null, packageId: null, itemIndex: null });
  
//   const handleSaveMain = () => {
//     if (editDialog.field === "heading") dispatch(updateHeading({ pageId, value: editDialog.value }));
//     if (editDialog.field === "subheading") dispatch(updateSubheading({ pageId, value: editDialog.value }));
//     if (editDialog.field === "pageTitle") dispatch(updatePageTitle({ pageId, value: editDialog.value }));
//     setEditDialog({ open: false });
//   };

//   const handleEditPackage = (pkgId, field, value) => setEditDialog({ open: true, field, value, packageId: pkgId });
  
//   const handleSavePackage = () => {
//     dispatch(updateGridPackage({ 
//       pageId, 
//       id: editDialog.packageId, 
//       field: editDialog.field, 
//       value: editDialog.value 
//     }));
//     setEditDialog({ open: false });
//   };

//   const handleEditItem = (pkgId, index, value) => setEditDialog({ open: true, field: "item", value, packageId: pkgId, itemIndex: index });
  
//   const handleSaveItem = () => {
//     dispatch(updateGridPackageItem({ 
//       pageId, 
//       pkgId: editDialog.packageId, 
//       index: editDialog.itemIndex, 
//       value: editDialog.value 
//     }));
//     setEditDialog({ open: false });
//   };

//   const handleEditStandaloneItem = (elementId, index, value) => setEditDialog({ open: true, field: "standaloneItem", value, elementId, itemIndex: index });
  
//   const handleSaveStandaloneItem = () => {
//     dispatch(updateStandalonePackageItem({ 
//       pageId, 
//       elementId: editDialog.elementId, 
//       index: editDialog.itemIndex, 
//       value: editDialog.value 
//     }));
//     setEditDialog({ open: false });
//   };

//   const handleColorChange = (elementId, color) => dispatch(updateStandalonePackage({ pageId, id: elementId, field: "color", value: color }));

//   const handleSaveImageDimensions = () => {
//     dispatch(updateImageDimensions({ pageId, id: imageDialog.elementId, dimensions: imageDialog.dimensions }));
//     setImageDialog({ open: false, elementId: null, dimensions: { width: "", height: "" } });
//   };
// const pricingTableCount = pages.filter(page => page.type === "PricingTable").length;
// const firstPricingIndex = pages.findIndex(p => p.type === "PricingTable");
//   return (
//     <CustomHeaderFooter >
//       {mode === 'dev' && (
//         <Box sx={{ textAlign: "center", mb: 2 }}>
//           <Button size="small" onClick={handleReset} color="warning">
//             Reset Page Data To Default <RefreshOutlined fontSize="small" />
//           </Button>
//         </Box>
//       )}
           
//       <Box
//         ref={pageRef}
//         sx={{
//           px: 6.7,
//           py: 5,
//           minHeight: `${MAX_PAGE_HEIGHT}px`,
//           maxHeight: `${MAX_PAGE_HEIGHT}px`,
//           overflow: "hidden",
//           flexGrow: 1,
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "flex-start",
//           fontFamily: selectedFont,
//           position: "relative",
//         }}
//       >
//         {isLimitExceeded && mode === "dev" && (
//           <Alert
//             severity="warning"
//             icon={<WarningIcon />}
//             sx={{ mb: 2, borderRadius: 2, maxWidth: 900, mx: "auto" }}
//           >
//             Page height limit exceeded! You can edit/delete but cannot add new
//             content.
//           </Alert>
//         )}

//         {/* Page Title */}
//         <Box sx={{ maxWidth: 900, mb: 1 }}>
//           <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//             <Typography
//               variant="h4"
//               sx={{ color: "#333", fontWeight: 600, fontFamily: selectedFont }}
//             >
//               {pageTitle}
//             </Typography>
//             {mode === "dev" && (
//               <IconButton
//                 size="small"
//                 onClick={() => handleEditMain("pageTitle", pageTitle)}
//               >
//                 <EditIcon fontSize="small" />
//               </IconButton>
//             )}
//           </Box>
//         </Box>

//         {/* Heading & Subheading */}
//         {pages.filter(p => p.type === "PricingTable").length < 2 && firstPricingIndex (
//         <Box sx={{ textAlign: "center", mb: 6, maxWidth: 900, mx: "auto" }}>
//           <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
//             <Typography
//               variant="h2"
//               sx={{
//                 fontWeight: "bold",
//                 color: "#FFA500",
//                 my:4,
//                 fontSize: { xs: "2rem", md: "3rem" },
//                 fontFamily: selectedFont,
//               }}
//             >
//               {heading}
//             </Typography>
//             {mode === "dev" && (
//               <IconButton
//                 size="small"
//                 onClick={() => handleEditMain("heading", heading)}
//               >
//                 <EditIcon fontSize="small" />
//               </IconButton>
//             )}
//           </Box>
//           <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
//             <Typography
//               variant="h6"
//               sx={{
//                 color: "#333",
//                 fontSize: { xs: "0.9rem", md: "1rem" },
//                 fontWeight: 500,
//                 whiteSpace: "pre-line",
//                 fontFamily: selectedFont,
//               }}
//             >
//               {subheading}
//             </Typography>
//             {mode === "dev" && (
//               <IconButton
//                 size="small"
//                 onClick={() => handleEditMain("subheading", subheading)}
//               >
//                 <EditIcon fontSize="small" />
//               </IconButton>
//             )}
//           </Box>
//           <Box
//             sx={{
//               flexGrow: 1,
//               height: "4px",
//               maxWidth: "500px",
//               mx: "auto",
//               my: 3,
//               background: "linear-gradient(to right, white, black 50%, white)",
//               borderRadius: "2px",
//             }}
//           />
//         </Box>
//         )}

//         {/* Draggable Elements */}
//         <DndContext
//           sensors={sensors}
//           collisionDetection={closestCenter}
//           onDragEnd={handleDragElement}
//         >
//           <SortableContext
//             items={elements?.map((el) => el.id)}
//             strategy={verticalListSortingStrategy}
//           >
//             {console.log('elements',elements.length)}
//             {elements?.map((element) => {
//               if (element.type === "mainHeading")
//                 return (
//                   <SortableMainHeading
//                     key={element.id}
//                     element={element}
//                     mode={mode}
//                     selectedFont={selectedFont}
//                     onDelete={handleDeleteElement}
//                   />
//                 );
//               if (element.type === "text")
//                 return (
//                   <SortableText
//                     key={element.id}
//                     element={element}
//                     mode={mode}
//                     selectedFont={selectedFont}
//                     onDelete={handleDeleteElement}
//                   />
//                 );
//               if (element.type === "image")
//                 return (
//                   <SortableImage
//                     key={element.id}
//                     element={element}
//                     mode={mode}
//                     onEdit={(el) =>
//                       setImageDialog({
//                         open: true,
//                         elementId: el.id,
//                         dimensions: el.dimensions || {
//                           width: "500px",
//                           height: "auto",
//                         },
//                       })
//                     }
//                     onDelete={handleDeleteElement}
//                   />
//                 );
//               if (element.type === "package")
//                 return (
//                   <SortableStandalonePackage
//                     key={element.id}
//                     element={element}
//                     mode={mode}
//                     selectedFont={selectedFont}
//                     onEditItem={handleEditStandaloneItem}
//                     onDelete={handleDeleteElement}
//                     onDeleteItem={(id, idx) =>
//                       dispatch(
//                         deleteItemFromStandalonePackage({
//                           elementId: id,
//                           index: idx,
//                         })
//                       )
//                     }
//                     onAddItem={(id) => dispatch(addItemToStandalonePackage(id))}
//                     onColorChange={handleColorChange}
//                   />
//                 );
//               return null;
//             })}
//           </SortableContext>
//         </DndContext>

//         {/* Add Standalone Package Button */}
//         {mode === "dev" && (
//           <Box sx={{ textAlign: "center", my: 4, maxWidth: 900, mx: "auto" }}>
//             <Button
//               variant="contained"
//               color="primary"
//               startIcon={<AddIcon />}
//               onClick={handleAddStandalonePackage}
//               disabled={isLimitExceeded}
//               sx={{ fontFamily: selectedFont, fontWeight: "bold" }}
//             >
//               Add Standalone Package
//             </Button>
//           </Box>
//         )}

//         {/* Grid Packages */}
//         {gridPackages?.length > 0 && (
//           <Box
//             sx={{
//               display: "grid",
//               gridTemplateColumns: {
//                 xs: "1fr",
//                 sm: "repeat(auto-fit, minmax(280px, 1fr))",
//               },
//               gap: 3,
//               maxWidth: 1200,
//               mx: "auto",
//               justifyContent: "center",
//               mb: 6,
//               p: 3,
//             }}
//           >
//             {gridPackages?.map((pkg) => (
//               <Box
//                 key={pkg.id}
//                 sx={{
//                   p: 4,
//                   border: "2px solid #e0e0e0",
//                   borderRadius: 3,
//                   backgroundColor: "white",
//                   display: "flex",
//                   flexDirection: "column",
//                   justifyContent: "space-between",
//                   boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
//                 }}
//               >
//                 <Box sx={{ display: "flex", alignItems: "center", mb: 1, justifyContent: "space-between" }}>
//                   <Typography
//                     variant="h5"
//                     sx={{
//                       fontWeight: "bold",
//                       fontSize: "1.4rem",
//                       fontFamily: selectedFont,
//                       whiteSpace: "normal",
//                       wordBreak: "break-word",
//                       overflow: "visible",
//                     }}
//                   >
//                     {pkg.title}
//                   </Typography>
//                   {mode === "dev" && (
//                     <>
//                       <IconButton
//                         size="small"
//                         onClick={() => handleEditPackage(pkg.id, "title", pkg.title)}
//                       >
//                         <EditIcon fontSize="small" />
//                       </IconButton>
//                       <IconButton
//                         size="small"
//                         color="error"
//                         onClick={() => handleDeletePackage(pkg.id)}
//                       >
//                         <DeleteIcon fontSize="small" />
//                       </IconButton>
//                     </>
//                   )}
//                 </Box>
//                 <Box
//                   sx={{
//                     height: 4,
//                     width: "100%",
//                     backgroundColor: pkg.color || "#FFD700",
//                     mb: 2,
//                     borderRadius: "2px",
//                   }}
//                 />
//                 <Typography
//                   variant="body2"
//                   sx={{
//                     color: pkg.color || "#FFD700",
//                     fontSize: "0.9rem",
//                     mb: 3,
//                     fontWeight: 500,
//                     minHeight: "40px",
//                     fontFamily: selectedFont,
//                   }}
//                 >
//                   {pkg.subtitle}
//                   {mode === "dev" && (
//                     <IconButton
//                       size="small"
//                       onClick={() => handleEditPackage(pkg.id, "subtitle", pkg.subtitle)}
//                     >
//                       <EditIcon fontSize="small" />
//                     </IconButton>
//                   )}
//                 </Typography>
//                 <Typography
//                   variant="h5"
//                   sx={{
//                     fontWeight: "bold",
//                     mb: 2,
//                     fontSize: "1.2rem",
//                     fontFamily: selectedFont,
//                   }}
//                 >
//                   {pkg.price}
//                   {mode === "dev" && (
//                     <IconButton
//                       size="small"
//                       onClick={() => handleEditPackage(pkg.id, "price", pkg.price)}
//                     >
//                       <EditIcon fontSize="small" />
//                     </IconButton>
//                   )}
//                 </Typography>
//                 <Typography
//                   variant="h6"
//                   sx={{
//                     fontWeight: "bold",
//                     mb: 1.5,
//                     fontSize: "1rem",
//                     fontFamily: selectedFont,
//                   }}
//                 >
//                   What's Included:
//                 </Typography>
//                 <Box component="ul" sx={{ pl: 0, m: 0, listStyle: "none" }}>
//                   {pkg?.items?.map((item, idx) => (
//                     <Box
//                       component="li"
//                       key={idx}
//                       sx={{
//                         display: "flex",
//                         fontSize: "0.9rem",
//                         mb: 1,
//                         lineHeight: 1.5,
//                         color: "#333",
//                         "&:hover .actions": { opacity: 1 },
//                         fontFamily: selectedFont,
//                       }}
//                     >
//                       <Box component="span" sx={{ mr: 1.5, fontWeight: "bold" }}>
//                         •
//                       </Box>
//                       <Box component="span" sx={{ flex: 1 }}>
//                         {item}
//                       </Box>
//                       {mode === "dev" && (
//                         <Box
//                           className="actions"
//                           sx={{
//                             opacity: 0,
//                             display: "flex",
//                             transition: "opacity 0.2s",
//                           }}
//                         >
//                           <IconButton
//                             size="small"
//                             onClick={() => handleEditItem(pkg.id, idx, item)}
//                           >
//                             <EditIcon fontSize="small" />
//                           </IconButton>
//                           <IconButton
//                             size="small"
//                             color="error"
//                             onClick={() => handleDeleteItemFromPackage(pkg.id, idx)}
//                           >
//                             <DeleteIcon fontSize="small" />
//                           </IconButton>
//                         </Box>
//                       )}
//                     </Box>
//                   ))}
//                 </Box>
//                 {mode === "dev" && (
//                   <Button
//                     startIcon={<AddIcon />}
//                     size="small"
//                     onClick={() => handleAddItemToPackage(pkg.id)}
//                     disabled={isLimitExceeded}
//                     sx={{ mt: 1, fontFamily: selectedFont }}
//                   >
//                     Add Feature
//                   </Button>
//                 )}
//               </Box>
//             ))}
//           </Box>
//         )}

//         {/* Add Element Menu */}
//         {mode === "dev" && (
//           <Box sx={{ textAlign: "center", mt: 4, maxWidth: 900, mx: "auto" }}>
//             <Button
//               variant="outlined"
//               startIcon={<AddIcon />}
//               onClick={(e) => !isLimitExceeded && setAddMenuAnchor(e.currentTarget)}
//               disabled={isLimitExceeded}
//               sx={{ fontFamily: selectedFont }}
//             >
//               Add Element
//             </Button>
//             <Menu
//               anchorEl={addMenuAnchor}
//               open={Boolean(addMenuAnchor)}
//               onClose={() => setAddMenuAnchor(null)}
//             >
//               <MenuItem onClick={() => { handleAddMainHeading(); setAddMenuAnchor(null); }} disabled={isLimitExceeded}>
//                 <TitleIcon fontSize="small" sx={{ mr: 1 }} /> Add Heading
//               </MenuItem>
//               <MenuItem onClick={() => { handleAddText(); setAddMenuAnchor(null); }} disabled={isLimitExceeded}>
//                 <FormatAlignLeftIcon fontSize="small" sx={{ mr: 1 }} /> Add Text
//               </MenuItem>
//               <MenuItem onClick={() => { handleAddGridPackage(); setAddMenuAnchor(null); }} disabled={isLimitExceeded}>
//                 <ListIcon fontSize="small" sx={{ mr: 1 }} /> Add Grid Package
//               </MenuItem>
//               <MenuItem onClick={() => { handleAddStandalonePackage(); setAddMenuAnchor(null); }} disabled={isLimitExceeded}>
//                 <ListIcon fontSize="small" sx={{ mr: 1 }} /> Add Standalone Package
//               </MenuItem>
//               <MenuItem disabled={isLimitExceeded}>
//                 <label
//                   htmlFor="img-upload"
//                   style={{
//                     cursor: isLimitExceeded ? "not-allowed" : "pointer",
//                     display: "flex",
//                     alignItems: "center",
//                     width: "100%",
//                   }}
//                 >
//                   <ImageIcon fontSize="small" sx={{ mr: 1 }} /> Add Image
//                 </label>
//                 <input
//                   id="img-upload"
//                   type="file"
//                   accept="image/*"
//                   hidden
//                   disabled={isLimitExceeded}
//                   onChange={(e) => {
//                     const file = e.target.files?.[0];
//                     if (file) {
//                       handleAddImage(URL.createObjectURL(file));
//                       setAddMenuAnchor(null);
//                     }
//                   }}
//                 />
//               </MenuItem>
//             </Menu>
//           </Box>
//         )}


//         {/* Edit Dialog */}
//         {mode === "dev" && (
//           <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false })} maxWidth="sm" fullWidth>
//             <DialogTitle>Edit {editDialog.field === "item" || editDialog.field === "standaloneItem" ? "Feature" : editDialog.field}</DialogTitle>
//             <DialogContent>
//               <TextField
//                 fullWidth
//                 multiline
//                 rows={["subheading", "subtitle", "pageTitle", "item", "standaloneItem"].includes(editDialog.field) ? 3 : 1}
//                 value={editDialog.value}
//                 onChange={(e) => setEditDialog((prev) => ({ ...prev, value: e.target.value }))}
//                 sx={{ mt: 2, fontFamily: selectedFont }}
//               />
//             </DialogContent>
//             <DialogActions>
//               <Button onClick={() => setEditDialog({ open: false })}>Cancel</Button>
//               <Button
//                 onClick={() => {
//                   if (editDialog.packageId) {
//                     if (editDialog.field === "item") handleSaveItem();
//                     else handleSavePackage();
//                   } else if (editDialog.elementId && editDialog.field === "standaloneItem") {
//                     handleSaveStandaloneItem();
//                   } else {
//                     handleSaveMain();
//                   }
//                 }}
//                 variant="contained"
//               >
//                 Save
//               </Button>
//             </DialogActions>
//           </Dialog>
//         )}

//         {/* Image Dimensions Dialog */}
//         {mode === "dev" && (
//           <EditImageDialog
//             editDialog={imageDialog}
//             setEditDialog={setImageDialog}
//             handleSaveImageDimensions={handleSaveImageDimensions}
//           />
//         )}
//       </Box>
//     </CustomHeaderFooter>
//   );
// };

// export default PricingTable;