// // src/components/pdf/Page3AdditionalInfo.jsx
// import React, { useState, useRef, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   IconButton,
//   TextField,
//   Button,
//   Stack,
//   Alert,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Tooltip,
//   Divider,
// } from "@mui/material";
// import {
//   Edit,
//   Delete,
//   Save,
//   Add,
//   Warning as WarningIcon,
//   RefreshOutlined,
// } from "@mui/icons-material";
// import CustomHeaderFooter from "../CustomHeaderFooter";

// import { useSelector, useDispatch } from "react-redux";
// import {
//   // setSections,
//   updateSection,
//   addSection,
//   deleteSection,
//   resetPage2,
// } from "../../utils/page2Slice";
// import axiosInstance from "../../utils/axiosInstance";
// import { showToast } from "../../utils/toastSlice";

// // === A4 Constants ===
// const A4_HEIGHT_PX = 1123;
// const MAX_PAGE_HEIGHT = A4_HEIGHT_PX;

// const Page3AdditionalInfo = ({
//   selectedFont = "'Poppins', sans-serif",
//   selectedLayout = {},
//   mode = "prod",
// }) => {
//   const pageRef = useRef(null);
//   const dispatch = useDispatch();

//   // Redux state
//   const mainHeading = useSelector((state) => state.page2.mainHeading);
//   const sections = useSelector((state) => state.page2.sections);

//   const [editingHeading, setEditingHeading] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [newSection, setNewSection] = useState({ title: "", desc: "" });

//   // Height limit states
//   const [isLimitExceeded, setIsLimitExceeded] = useState(false);
//   const [hasShownLimitModal, setHasShownLimitModal] = useState(false);
//   const [showLimitModal, setShowLimitModal] = useState(false);

//   const fontStyle = { fontFamily: selectedFont };

//   // === Section Handlers ===
//   const handleEdit = (id) => setEditingId(id);

//   const handleSave = (id, updated) => {
//     setEditingId(null);
//     dispatch(updateSection({ id, title: updated.title, desc: updated.desc }));
//   };

//   const handleDelete = (id) => dispatch(deleteSection(id));

//   const safeAdd = () => {
//     if (isLimitExceeded) {
//       if (!hasShownLimitModal) {
//         setShowLimitModal(true);
//         setHasShownLimitModal(true);
//       }
//       return;
//     }
//     if (!newSection.title.trim()) return;

//     const newSec = {
//       id: Date.now(),
//       title: newSection.title,
//       desc: newSection.desc,
//     };
//     dispatch(addSection(newSec));
//     setNewSection({ title: "", desc: "" });
//   };

//   // === Page Height Checker ===
//   const checkPageHeight = () => {
//     if (!pageRef.current) return;
//     requestAnimationFrame(() => {
//       const height = pageRef.current.scrollHeight;
//       const exceeded = height > MAX_PAGE_HEIGHT;
//       setIsLimitExceeded(exceeded);

//       if (exceeded && !hasShownLimitModal) {
//         setShowLimitModal(true);
//         setHasShownLimitModal(true);
//       }
//     });
//   };

//   useEffect(() => {
//     const handleScroll = () => {
//       if (!pageRef.current) return;
//       const rect = pageRef.current.getBoundingClientRect();
//       const inView = rect.top < window.innerHeight && rect.bottom > 0;

//       if (inView) {
//         const height = pageRef.current.scrollHeight;
//         const exceeded = height > MAX_PAGE_HEIGHT;
//         setIsLimitExceeded(exceeded);

//         if (exceeded && !hasShownLimitModal) {
//           setShowLimitModal(true);
//           setHasShownLimitModal(true);
//         }
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, [hasShownLimitModal]);

//   const handleReset = async () => {
//     if (!window.confirm("Are you sure you want to reset this page to default?"))
//       return;

//     const user = JSON.parse(sessionStorage.getItem("user") || "{}");

//     try {
//       await axiosInstance.post(`/api/proposals/pages/reset/page2/${user.id}`, {
//         mainHeading,
//         sections,
//       });

//       dispatch(resetPage2());
//       dispatch(
//         showToast({ message: "Page reset to default", severity: "success" })
//       );
//     } catch (err) {
//       console.error(err);
//       dispatch(
//         showToast({ message: "Failed to reset page", severity: "error" })
//       );
//     }
//   };

//   return (
//     <CustomHeaderFooter >
//       {mode === "dev" && (
//         <Box sx={{ textAlign: "center", mb: 2 }}>
//           <Button size="small" onClick={handleReset} color="warning">
//             Reset Page Data To Default <RefreshOutlined fontSize="small" />
//           </Button>
//         </Box>
//       )}
//       <Box
//         ref={pageRef}
//         sx={{
//           px: 10,
//           py: 4,
//           minHeight: `${A4_HEIGHT_PX}px`,
//           maxHeight: `${A4_HEIGHT_PX}px`,
//           overflow: "hidden",
//           flexGrow: 1,
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "flex-start",
//           ...fontStyle,
//           position: "relative",
//         }}
//       >
//         <Divider
//           sx={{
//             mb: 2,
//             height: "1px",
//             backgroundColor: "#000",
//             border: "none",
//           }}
//         />

//         {/* Warning Banner */}
//         {isLimitExceeded && mode === "dev" && (
//           <Alert
//             severity="warning"
//             icon={<WarningIcon />}
//             sx={{ mb: 2, borderRadius: 2 }}
//           >
//             Page height limit exceeded! You can edit/delete but cannot add new
//             sections.
//           </Alert>
//         )}

//         {/* === Dynamic Sections with Proper Nested List Styling === */}
//         {sections.map((section, index) => {
//           const isEditing = editingId === section.id;

//           // Special handling for Deliverables section to show clean nested list
//           const isDeliverables = section.title.toLowerCase().includes("deliverables");

//           return (
//             <Box key={section.id} sx={{ mb: 5 }}>
//               {isEditing ? (
//                 <>
//                   <TextField
//                     fullWidth
//                     label="Title"
//                     value={section.title}
//                     onChange={(e) =>
//                       dispatch(updateSection({ id: section.id, title: e.target.value }))
//                     }
//                     sx={{ mb: 2 }}
//                   />
//                   <TextField
//                     fullWidth
//                     multiline
//                     minRows={3}
//                     label="Description"
//                     value={section.desc}
//                     onChange={(e) =>
//                       dispatch(updateSection({ id: section.id, desc: e.target.value }))
//                     }
//                     sx={{ mb: 2 }}
//                   />
//                   {mode === "dev" && (
//                     <Stack direction="row" spacing={1}>
//                       <Button
//                         variant="contained"
//                         color="success"
//                         startIcon={<Save />}
//                         onClick={() => handleSave(section.id, section)}
//                       >
//                         Save
//                       </Button>
//                       <Button
//                         variant="outlined"
//                         color="error"
//                         startIcon={<Delete />}
//                         onClick={() => handleDelete(section.id)}
//                       >
//                         Delete
//                       </Button>
//                     </Stack>
//                   )}
//                 </>
//               ) : (
//                 <>
//                   <Typography
//                     variant="h6"
//                     sx={{
//                       color: "#1a1a1a",
//                       fontWeight: 700,
//                       mb: 2,
//                       fontSize: 24,
//                       ...fontStyle,
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "space-between",
//                     }}
//                   >
//                     {section.title}
//                     {mode === "dev" && (
//                       <Box>
//                         <IconButton size="small" onClick={() => handleEdit(section.id)}>
//                           <Edit fontSize="small" />
//                         </IconButton>
//                         <IconButton
//                           size="small"
//                           color="error"
//                           onClick={() => handleDelete(section.id)}
//                         >
//                           <Delete fontSize="small" />
//                         </IconButton>
//                       </Box>
//                     )}
//                   </Typography>

//                   {/* Special Styling for Deliverables */}
//                   {isDeliverables ? (
//                     <Box
//                       component="div"
//                       sx={{
//                         lineHeight: 1.9,
//                         color: "#4a4a4a",
//                         fontSize: 16,
//                         ...fontStyle,
//                         "& ul": {
//                           listStyle: "none",
//                           paddingLeft: 0,
//                           margin: 0,
//                         },
//                         "& li": {
//                           position: "relative",
//                           paddingLeft: "28px",
//                           marginBottom: "12px",
//                         },
//                         "& li:before": {
//                           content: '""',
//                           position: "absolute",
//                           left: 0,
//                           top: "8px",
//                           width: "8px",
//                           height: "8px",
//                           borderRadius: "50%",
//                           backgroundColor: "#FF8C00",
//                         },
//                         "& strong": {
//                           color: "#1a1a1a",
//                           fontWeight: 600,
//                         },
//                       }}
//                       dangerouslySetInnerHTML={{
//                         __html: section.desc
//                           .replace(/\d+\.\s/g, '<strong>$&</strong>') // Bold numbers like 1., 2.
//                           .replace(/\n/g, "<br/>"),
//                       }}
//                     />
//                   ) : (
//                     <Typography
//                       variant="body1"
//                       sx={{
//                         lineHeight: 1.8,
//                         mb: 2,
//                         color: "#4a4a4a",
//                         fontSize: 16,
//                         ...fontStyle,
//                       }}
//                     >
//                       {section.desc}
//                     </Typography>
//                   )}
//                 </>
//               )}

//               {/* Divider after each section */}
//               <Divider
//                 sx={{
//                   my: 2,
//                   height: "1px",
//                   backgroundColor: "#000",
//                   border: "none",
//                 }}
//               />
//             </Box>
//           );
//         })}

//         {/* === Add Section (Dev Mode) === */}
//         {mode === "dev" && (
//           <Box
//             sx={{
//               mt: 1,
              
//             }}
//           >
//             <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
//               Add New Section
//             </Typography>
//             <TextField
//               label="Title"
//               fullWidth
//               value={newSection.title}
//               onChange={(e) =>
//                 setNewSection({ ...newSection, title: e.target.value })
//               }
//               sx={{ mb: 1 }}
//               disabled={isLimitExceeded}
//             />
//             <TextField
//               label="Description"
//               fullWidth
//               multiline
//               minRows={2}
//               value={newSection.desc}
//               onChange={(e) =>
//                 setNewSection({ ...newSection, desc: e.target.value })
//               }
//               sx={{ mb: 1 }}
//               disabled={isLimitExceeded}
//             />
//             <Button
//               variant="contained"
//               startIcon={<Add />}
//               onClick={safeAdd}
//               sx={{ color: "white" }}
//               disabled={!newSection.title.trim() || isLimitExceeded}
//             >
//               Add Section
//             </Button>
//           </Box>
//         )}

//         {/* === Limit Exceeded Modal === */}
//         <Dialog
//           open={showLimitModal}
//           onClose={() => setShowLimitModal(false)}
//           maxWidth="sm"
//           fullWidth
//           PaperProps={{
//             sx: {
//               borderRadius: 5,
//               overflow: "hidden",
//               background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
//             },
//           }}
//         >
//           <DialogTitle
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               gap: 1,
//               flexDirection: "column",
//               textAlign: "center",
//               fontWeight: 700,
//             }}
//           >
//             <WarningIcon sx={{ color: "#f44336", fontSize: 30 }} />
//             <Typography
//               variant="subtitle1"
//               sx={{
//                 background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//                 WebkitBackgroundClip: "text",
//                 WebkitTextFillColor: "transparent",
//                 fontWeight: 700,
//               }}
//             >
//               Page Limit Exceeded
//             </Typography>
//           </DialogTitle>

//           <DialogContent>
//             <Typography>
//               This page has exceeded the A4 height limit of{" "}
//               <strong>{MAX_PAGE_HEIGHT}px</strong>.
//             </Typography>
//             <Typography>
//               You can still <strong>edit or delete</strong> elements.
//             </Typography>
//             <Typography>
//               To add more: delete some content or clone this page.
//             </Typography>
//           </DialogContent>
//           <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
//             <Button
//               onClick={() => setShowLimitModal(false)}
//               variant="contained"
//             >
//               Got it
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Box>
//     </CustomHeaderFooter>
//   );
// };

// export default Page3AdditionalInfo;

import React from 'react'

const Page3AdditionalInfo = () => {
  return (
    <div>Page3AdditionalInfo</div>
  )
}

export default Page3AdditionalInfo