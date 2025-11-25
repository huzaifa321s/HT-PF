// // src/components/PdfPage4.jsx
// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   Page,
//   Text,
//   View,
//   Document,
//   StyleSheet,
//   PDFViewer,
//   Image,
//   Svg,
//   Polygon,
// } from "@react-pdf/renderer";
// import {
//   Box,
//   TextField,
//   Button,
//   Typography,
//   Paper,
//   Stack,
//   Divider,
//   IconButton,
//   Menu,
//   MenuItem,
// } from "@mui/material";
// import {
//   RefreshOutlined,
//   Add as AddIcon,
//   Delete as DeleteIcon,
//   DragIndicator,
// } from "@mui/icons-material";
// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   useSortable,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
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
//   deleteElement,
//   reorderElements,
//   resetPageData,
// } from "../src/utils/pricingReducer";

// // ====================== CONSTANTS ======================
// const MIN_PACKAGE_HEIGHT = 320; // Minimum package height in PDF points
// const MAX_PACKAGE_HEIGHT = 450; // Maximum package height before splitting
// const MAX_PAGE_CONTENT_HEIGHT = 650; // Max content height per page (A4 safe zone)
// const ITEM_HEIGHT = 20; // Approximate height per feature item

// // ====================== SORTABLE ITEM ======================
// const SortableItem = ({ id, children }) => {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.6 : 1,
//   };

//   return (
//     <div ref={setNodeRef} style={style}>
//       <Box sx={{ position: "relative" }}>
//         <Box
//           {...attributes}
//           {...listeners}
//           sx={{
//             position: "absolute",
//             left: -55,
//             top: 20,
//             cursor: "grab",
//             zIndex: 100,
//             bgcolor: "background.paper",
//             borderRadius: 2,
//             p: 0.5,
//           }}
//         >
//           <DragIndicator fontSize="large" color="action" />
//         </Box>
//         {children}
//       </Box>
//     </div>
//   );
// };

// // ====================== EDITABLE CARD ======================
// const EditableCard = ({ children }) => (
//   <Paper elevation={8} sx={{ p: 4, mb: 5, borderRadius: 4, bgcolor: "#ffffff", border: "1px solid #e0e0e0", minWidth: 420 }}>
//     {children}
//   </Paper>
// );

// // ====================== PDF STYLES ======================
// const styles = StyleSheet.create({
//   page: { paddingTop: 130, paddingBottom: 90, paddingHorizontal: 60 },
//   header: { position: "absolute", top: 0, left: 0, right: 0, height: 70 },
//   headerLogo: { position: "absolute", right: 24, top: 10, width: 52, height: 52, borderRadius: 26, borderWidth: 3, borderColor: "#fff" },
//   logoContainer: { marginTop: 20, marginBottom: 15, flexDirection: "row", alignItems: "center", gap: 12 },
//   logo: { width: 40, height: 40, borderRadius: 20 },
//   logoTitle: { color: "#FF8C00", fontSize: 20, fontWeight: "bold" },
//   logoSubtitle: { color: "#000", fontSize: 9 },
//   dividerLine: { width: "100%", height: 1, backgroundColor: "#000", marginBottom: 25 },
//   pageTitle: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 15 },
//   mainHeading: { fontSize: 32, fontWeight: "bold", color: "#FFA500", textAlign: "center", marginVertical: 15 },
//   subheading: { fontSize: 12, color: "#333", textAlign: "center", marginBottom: 25, lineHeight: 1.6 },
//   textContent: { fontSize: 11, color: "#333", marginBottom: 15, lineHeight: 1.6 },
//   gradientLine: { width: "80%", height: 3, backgroundColor: "#000", marginHorizontal: "auto", marginBottom: 30 },
  
//   // Standalone Package with min/max height constraints
//   standalonePackage: {
//     padding: 30,
//     border: "2px solid #e0e0e0",
//     borderRadius: 16,
//     backgroundColor: "#fff",
//     marginBottom: 40,
//     minHeight: MIN_PACKAGE_HEIGHT,
//   },
//   packageTitle: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 12 },
//   packageLine: { height: 4, backgroundColor: "#FFD700", marginBottom: 16 },
//   packageSubtitle: { fontSize: 11, color: "#FFD700", textAlign: "center", marginBottom: 16, fontWeight: "600" },
//   packagePrice: { fontSize: 28, fontWeight: "bold", color: "#FF8C00", textAlign: "center", marginBottom: 20 },
//   featuresTitle: { fontSize: 13, fontWeight: "bold", textAlign: "center", marginBottom: 12 },
//   featureItem: { fontSize: 10.5, marginBottom: 8, flexDirection: "row", alignItems: "flex-start" },
//   bullet: { marginRight: 10, fontWeight: "bold" },
  
//   // Grid Package with min/max height
//   gridRow: { flexDirection: "row", justifyContent: "space-between", gap: 20, marginTop: 30, flexWrap: "wrap" },
//   gridPackage: {
//     flex: 1,
//     minWidth: 240,
//     padding: 22,
//     border: "2px solid #e0e0e0",
//     borderRadius: 12,
//     backgroundColor: "white",
//     minHeight: MIN_PACKAGE_HEIGHT,
//   },
  
//   // Continuation indicators
//   continuationNote: {
//     fontSize: 9,
//     color: "#FF8C00",
//     fontStyle: "italic",
//     textAlign: "center",
//     marginTop: 8,
//     fontWeight: "bold",
//   },
  
//   footer: { position: "absolute", bottom: 30, left: 60, right: 60, flexDirection: "row", justifyContent: "space-between" },
//   footerText: { fontSize: 10, color: "#666" },
//   pageNumber: { fontSize: 10, color: "#666" },
// });

// // ====================== HELPER FUNCTIONS ======================

// // Calculate estimated height for a package based on content
// const estimatePackageHeight = (pkg) => {
//   const baseHeight = 220; // Title + subtitle + price + padding + margins
//   const itemsHeight = (pkg.items?.length || 0) * ITEM_HEIGHT;
//   const totalHeight = baseHeight + itemsHeight;
//   return totalHeight;
// };

// // Split a single package if it exceeds max height
// const splitPackage = (pkg) => {
//   const estimatedHeight = estimatePackageHeight(pkg);
  
//   if (estimatedHeight <= MAX_PACKAGE_HEIGHT) {
//     return [pkg]; // No split needed
//   }
  
//   // Calculate how many items fit in max height
//   const availableHeightForItems = MAX_PACKAGE_HEIGHT - 220; // Subtract base height
//   const itemsPerChunk = Math.floor(availableHeightForItems / ITEM_HEIGHT);
  
//   if (itemsPerChunk < 1) {
//     return [pkg]; // Return as is if can't fit even one item
//   }
  
//   const chunks = [];
//   const items = pkg.items || [];
  
//   // First chunk - includes header (title, subtitle, price)
//   chunks.push({
//     ...pkg,
//     items: items.slice(0, itemsPerChunk),
//     isSplit: true,
//     splitPosition: 'start',
//     originalId: pkg.id,
//   });
  
//   // Middle and end chunks - only show "Continued" and features
//   let remainingItems = items.slice(itemsPerChunk);
//   let chunkIndex = 1;
  
//   while (remainingItems.length > 0) {
//     const isLastChunk = remainingItems.length <= itemsPerChunk;
//     chunks.push({
//       ...pkg,
//       id: `${pkg.id}-chunk-${chunkIndex}`,
//       items: remainingItems.slice(0, itemsPerChunk),
//       isSplit: true,
//       splitPosition: isLastChunk ? 'end' : 'middle',
//       showHeader: false, // Don't show title/price again
//       originalId: pkg.id,
//     });
//     remainingItems = remainingItems.slice(itemsPerChunk);
//     chunkIndex++;
//   }
  
//   return chunks;
// };

// // Organize all packages into pages
// const organizePackagesIntoPages = (standalonePkgs, gridPkgs) => {
//   const pages = [];
//   let currentPage = { standalone: [], grid: [] };
//   let currentPageHeight = 0;
  
//   // Process standalone packages
//   standalonePkgs.forEach(pkg => {
//     const splitPkgs = splitPackage(pkg);
    
//     splitPkgs.forEach(splitPkg => {
//       const pkgHeight = estimatePackageHeight(splitPkg);
      
//       // Check if adding this package exceeds page limit
//       if (currentPageHeight + pkgHeight > MAX_PAGE_CONTENT_HEIGHT && currentPage.standalone.length > 0) {
//         pages.push({ ...currentPage });
//         currentPage = { standalone: [], grid: [] };
//         currentPageHeight = 0;
//       }
      
//       currentPage.standalone.push(splitPkg);
//       currentPageHeight += pkgHeight;
//     });
//   });
  
//   // Process grid packages (2 per row)
//   gridPkgs.forEach(pkg => {
//     const splitPkgs = splitPackage(pkg);
    
//     splitPkgs.forEach(splitPkg => {
//       const pkgHeight = estimatePackageHeight(splitPkg);
      
//       // Check if adding this package exceeds page limit
//       if (currentPageHeight + pkgHeight > MAX_PAGE_CONTENT_HEIGHT && (currentPage.standalone.length > 0 || currentPage.grid.length > 0)) {
//         pages.push({ ...currentPage });
//         currentPage = { standalone: [], grid: [] };
//         currentPageHeight = 0;
//       }
      
//       currentPage.grid.push(splitPkg);
//       currentPageHeight += pkgHeight / 2; // Grid packages are side-by-side, so take less vertical space
//     });
//   });
  
//   // Push last page if has content
//   if (currentPage.standalone.length > 0 || currentPage.grid.length > 0) {
//     pages.push(currentPage);
//   }
  
//   return pages.length > 0 ? pages : [{ standalone: [], grid: [] }];
// };

// // ====================== PDF DOCUMENT ======================
// const PdfDocument4 = ({ pageTitle, heading, subheading, elements, gridPackages }) => {
//   // Separate standalone packages and other elements
//   const standalonePkgs = elements.filter(el => el.type === "package");
//   const otherElements = elements.filter(el => el.type !== "package");
  
//   // Organize packages into pages
//   const organizedPages = organizePackagesIntoPages(standalonePkgs, gridPackages);
  
//   // Render a standalone package
//   const renderStandalone = (pkg) => (
//     <View key={pkg.id} style={styles.standalonePackage} wrap={false}>
//       {pkg.showHeader !== false && (
//         <>
//           <Text style={styles.packageTitle}>{pkg.title || "Premium Package"}</Text>
//           <View style={[styles.packageLine, { backgroundColor: pkg.color || "#FFD700" }]} />
//           <Text style={[styles.packageSubtitle, { color: pkg.color || "#FFD700" }]}>
//             {pkg.subtitle}
//           </Text>
//           <Text style={styles.packagePrice}>{pkg.price || "₹99,999"}</Text>
//         </>
//       )}
      
//       <Text style={styles.featuresTitle}>
//         {pkg.isSplit && pkg.splitPosition !== 'start' ? '...Continued' : "What's Included"}
//       </Text>
      
//       {(pkg.items || []).map((item, i) => (
//         <View key={i} style={styles.featureItem}>
//           <Text style={styles.bullet}>•</Text>
//           <Text style={{ flex: 1 }}>{item}</Text>
//         </View>
//       ))}
      
//       {pkg.isSplit && pkg.splitPosition !== 'end' && (
//         <Text style={styles.continuationNote}>→ Continued on next page</Text>
//       )}
//     </View>
//   );
  
//   // Render grid packages (2 per row)
//   const renderGridRow = (pkgs) => {
//     return (
//       <View style={styles.gridRow} wrap={false}>
//         {pkgs.map(pkg => (
//           <View key={pkg.id} style={styles.gridPackage}>
//             {pkg.showHeader !== false && (
//               <>
//                 <Text style={styles.packageTitle}>{pkg.title}</Text>
//                 <View style={[styles.packageLine, { backgroundColor: pkg.color || "#FFD700" }]} />
//                 <Text style={[styles.packageSubtitle, { color: pkg.color || "#FFD700" }]}>
//                   {pkg.subtitle}
//                 </Text>
//                 <Text style={styles.packagePrice}>{pkg.price}</Text>
//               </>
//             )}
            
//             <Text style={styles.featuresTitle}>
//               {pkg.isSplit && pkg.splitPosition !== 'start' ? '...Continued' : 'Includes:'}
//             </Text>
            
//             {(pkg.items || []).map((item, i) => (
//               <View key={i} style={styles.featureItem}>
//                 <Text style={styles.bullet}>•</Text>
//                 <Text style={{ flex: 1 }}>{item}</Text>
//               </View>
//             ))}
            
//             {pkg.isSplit && pkg.splitPosition !== 'end' && (
//               <Text style={styles.continuationNote}>→ Continued</Text>
//             )}
//           </View>
//         ))}
//       </View>
//     );
//   };
  
//   return (
//     <Document>
//       {organizedPages.map((pageContent, pageIndex) => {
//         const isFirstPage = pageIndex === 0;
//         const { standalone, grid } = pageContent;
        
//         // Group grid packages into rows of 2
//         const gridRows = [];
//         for (let i = 0; i < grid.length; i += 2) {
//           gridRows.push(grid.slice(i, i + 2));
//         }
        
//         return (
//           <Page key={pageIndex} size="A4" style={styles.page}>
//             {/* Header */}
//             <View fixed style={styles.header}>
//               <Svg width="100%" height="70" viewBox="0 0 100 100">
//                 <Polygon points="0,0 100,0 65,100 0,100" fill="#FF8C00" />
//                 <Polygon points="85,0 100,0 100,100 70,100" fill="#1A1A1A" />
//               </Svg>
//               <Image style={styles.headerLogo} src="/download.jpg" />
//             </View>
            
//             {/* Logo */}
//             <View style={styles.logoContainer}>
//               <Image style={styles.logo} src="/download.jpg" />
//               <View>
//                 <Text style={styles.logoTitle}>HUMANTEK</Text>
//                 <Text style={styles.logoSubtitle}>IT SERVICES & SOLUTIONS</Text>
//               </View>
//             </View>
            
//             <View style={styles.dividerLine} />
            
//             {/* Only show heading on first page */}
//             {isFirstPage && (
//               <>
//                 <Text style={styles.pageTitle}>{pageTitle}</Text>
//                 <Text style={styles.mainHeading}>{heading}</Text>
//                 <Text style={styles.subheading}>{subheading}</Text>
//                 <View style={styles.gradientLine} />
                
//                 {/* Other elements only on first page */}
//                 {otherElements.map(el => (
//                   el.type === "mainHeading" ? (
//                     <Text key={el.id} style={styles.mainHeading}>{el.content}</Text>
//                   ) : el.type === "text" ? (
//                     <Text key={el.id} style={styles.textContent}>{el.content}</Text>
//                   ) : null
//                 ))}
//               </>
//             )}
            
//             {/* Standalone packages for this page */}
//             {standalone.map(renderStandalone)}
            
//             {/* Grid packages for this page */}
//             {gridRows.map((row, rowIndex) => (
//               <View key={`grid-row-${pageIndex}-${rowIndex}`}>
//                 {renderGridRow(row)}
//               </View>
//             ))}
            
//             {/* Footer */}
//             <View fixed style={styles.footer}>
//               <Text style={styles.footerText}>© 2025 Humantek IT Services & Solutions</Text>
//               <Text style={styles.pageNumber}>Page {pageIndex + 1}</Text>
//             </View>
//           </Page>
//         );
//       })}
//     </Document>
//   );
// };

// // ====================== MAIN COMPONENT ======================
// const PdfPage4 = ({ mode = "dev", pageId = "default-pricing-page" }) => {
//   const dispatch = useDispatch();
//   const [addAnchor, setAddAnchor] = useState(null);
  
//   const pageData = useSelector(state => state.pricing?.pageData?.[pageId] || {
//     pageTitle: "Pricing & Packages",
//     heading: "Choose Your Perfect Plan",
//     subheading: "Flexible pricing for every business",
//     elements: [],
//     gridPackages: []
//   });
  
//   useEffect(() => {
//     dispatch(initializePage({ pageId }));
//   }, [pageId, dispatch]);
  
//   const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  
//   const allItemIds = [
//     ...pageData.elements.map(el => el.id),
//     ...pageData.gridPackages.map(pkg => pkg.id)
//   ];
  
//   const handleDragEnd = (event) => {
//     const { active, over } = event;
//     if (over && active.id !== over.id) {
//       dispatch(reorderElements({ pageId, activeId: active.id, overId: over.id }));
//     }
//   };
  
//   if (mode === "dev") {
//     return (
//       <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f5f5f5" }}>
//         {/* Left Sidebar */}
//         <Paper sx={{ width: 420, p: 4, overflowY: "auto", bgcolor: "#fff" }}>
//           <Stack spacing={3}>
//             <Typography variant="h5" sx={{ color: "#FF8C00", fontWeight: 800 }}>
//               Pricing Editor
//             </Typography>
//             <Button
//               variant="outlined"
//               color="warning"
//               fullWidth
//               startIcon={<RefreshOutlined />}
//               onClick={() => dispatch(resetPageData({ pageId }))}
//             >
//               Reset Page
//             </Button>
//             <Divider />
            
//             <TextField
//               label="Page Title"
//               value={pageData.pageTitle}
//               onChange={e => dispatch(updatePageTitle({ pageId, value: e.target.value }))}
//             />
//             <TextField
//               label="Main Heading"
//               value={pageData.heading}
//               onChange={e => dispatch(updateHeading({ pageId, value: e.target.value }))}
//             />
//             <TextField
//               label="Subheading"
//               multiline
//               rows={3}
//               value={pageData.subheading}
//               onChange={e => dispatch(updateSubheading({ pageId, value: e.target.value }))}
//             />
            
//             <Button
//               variant="contained"
//               size="large"
//               startIcon={<AddIcon />}
//               onClick={e => setAddAnchor(e.currentTarget)}
//             >
//               Add New Block
//             </Button>
//             <Menu anchorEl={addAnchor} open={Boolean(addAnchor)} onClose={() => setAddAnchor(null)}>
//               <MenuItem onClick={() => { dispatch(addElement({ pageId, type: "mainHeading" })); setAddAnchor(null); }}>
//                 Add Heading
//               </MenuItem>
//               <MenuItem onClick={() => { dispatch(addElement({ pageId, type: "text" })); setAddAnchor(null); }}>
//                 Add Text
//               </MenuItem>
//               <MenuItem onClick={() => { dispatch(addElement({ pageId, type: "package" })); setAddAnchor(null); }}>
//                 Add Standalone Package
//               </MenuItem>
//               <MenuItem onClick={() => { dispatch(addGridPackage({ pageId })); setAddAnchor(null); }}>
//                 Add Grid Package
//               </MenuItem>
//             </Menu>
            
//             <Divider />
//             <Paper sx={{ p: 2, bgcolor: "#FFF3E0" }}>
//               <Typography variant="caption" color="text.secondary">
//                 📏 <strong>Auto-Split Feature:</strong><br/>
//                 • Min Height: {MIN_PACKAGE_HEIGHT}px<br/>
//                 • Max Height: {MAX_PACKAGE_HEIGHT}px<br/>
//                 • Packages automatically split across pages when exceeding max height<br/>
//                 • Title & price shown only once, features continue on next page
//               </Typography>
//             </Paper>
//           </Stack>
//         </Paper>
        
//         {/* Editor + Preview */}
//         <Box sx={{ flex: 1, display: "flex" }}>
//           {/* Editable Blocks */}
//           <Box sx={{ width: "50%", p: 4, overflowY: "auto", bgcolor: "#fafafa" }}>
//             <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//               <SortableContext items={allItemIds} strategy={verticalListSortingStrategy}>
//                 {pageData.elements.map(el => (
//                   <SortableItem key={el.id} id={el.id}>
//                     <EditableCard>
//                       {el.type === "package" ? (
//                         <>
//                           <TextField
//                             fullWidth
//                             label="Package Title"
//                             value={el.title || ""}
//                             sx={{ mb: 2 }}
//                             onChange={e => dispatch(updateStandalonePackage({ pageId, id: el.id, field: "title", value: e.target.value }))}
//                           />
//                           <TextField
//                             fullWidth
//                             label="Subtitle"
//                             value={el.subtitle || ""}
//                             sx={{ mb: 2 }}
//                             onChange={e => dispatch(updateStandalonePackage({ pageId, id: el.id, field: "subtitle", value: e.target.value }))}
//                           />
//                           <TextField
//                             fullWidth
//                             label="Price"
//                             value={el.price || ""}
//                             sx={{ mb: 3 }}
//                             onChange={e => dispatch(updateStandalonePackage({ pageId, id: el.id, field: "price", value: e.target.value }))}
//                           />
//                           <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
//                             Features: ({el.items?.length || 0} items)
//                           </Typography>
//                           {el.items?.map((item, i) => (
//                             <Box key={i} sx={{ display: "flex", gap: 1, mb: 1 }}>
//                               <TextField
//                                 fullWidth
//                                 size="small"
//                                 value={item}
//                                 onChange={e => dispatch(updateStandalonePackageItem({ pageId, elementId: el.id, index: i, value: e.target.value }))}
//                               />
//                               <IconButton
//                                 color="error"
//                                 onClick={() => dispatch(deleteItemFromStandalonePackage({ pageId, elementId: el.id, index: i }))}
//                               >
//                                 <DeleteIcon />
//                               </IconButton>
//                             </Box>
//                           ))}
//                           <Button
//                             startIcon={<AddIcon />}
//                             onClick={() => dispatch(addItemToStandalonePackage({ pageId, elementId: el.id }))}
//                           >
//                             Add Feature
//                           </Button>
//                           <IconButton
//                             color="error"
//                             sx={{ ml: 2 }}
//                             onClick={() => dispatch(deleteElement({ pageId, elementId: el.id }))}
//                           >
//                             <DeleteIcon />
//                           </IconButton>
//                         </>
//                       ) : (
//                         <>
//                           <TextField
//                             fullWidth
//                             multiline
//                             label={el.type === "mainHeading" ? "Heading" : "Text"}
//                             value={el.content || ""}
//                             onChange={e => dispatch(updateElementContent({ pageId, id: el.id, content: e.target.value }))}
//                           />
//                           <IconButton
//                             color="error"
//                             sx={{ mt: 1 }}
//                             onClick={() => dispatch(deleteElement({ pageId, elementId: el.id }))}
//                           >
//                             <DeleteIcon />
//                           </IconButton>
//                         </>
//                       )}
//                     </EditableCard>
//                   </SortableItem>
//                 ))}
                
//                 {pageData.gridPackages.map(pkg => (
//                   <SortableItem key={pkg.id} id={pkg.id}>
//                     <EditableCard>
//                       <TextField
//                         fullWidth
//                         label="Grid Package Title"
//                         value={pkg.title || ""}
//                         sx={{ mb: 2 }}
//                         onChange={e => dispatch(updateGridPackage({ pageId, id: pkg.id, field: "title", value: e.target.value }))}
//                       />
//                       <TextField
//                         fullWidth
//                         label="Subtitle"
//                         value={pkg.subtitle || ""}
//                         sx={{ mb: 2 }}
//                         onChange={e => dispatch(updateGridPackage({ pageId, id: pkg.id, field: "subtitle", value: e.target.value }))}
//                       />
//                       <TextField
//                         fullWidth
//                         label="Price"
//                         value={pkg.price || ""}
//                         sx={{ mb: 3 }}
//                         onChange={e => dispatch(updateGridPackage({ pageId, id: pkg.id, field: "price", value: e.target.value }))}
//                       />
//                       <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
//                         Features: ({pkg.items?.length || 0} items)
//                       </Typography>
//                       {pkg.items?.map((item, i) => (
//                         <Box key={i} sx={{ display: "flex", gap: 1, mb: 1 }}>
//                           <TextField
//                             fullWidth
//                             size="small"
//                             value={item}
//                             onChange={e => dispatch(updateGridPackageItem({ pageId, pkgId: pkg.id, index: i, value: e.target.value }))}
//                           />
//                           <IconButton
//                             color="error"
//                             onClick={() => dispatch(deleteItemFromGridPackage({ pageId, pkgId: pkg.id, index: i }))}
//                           >
//                             <DeleteIcon />
//                           </IconButton>
//                         </Box>
//                       ))}
//                       <Button
//                         startIcon={<AddIcon />}
//                         onClick={() => dispatch(addItemToGridPackage({ pageId, pkgId: pkg.id }))}
//                       >
//                         Add Item
//                       </Button>
//                       <IconButton
//                         color="error"
//                         sx={{ ml: 2 }}
//                         onClick={() => dispatch(deleteGridPackage({ pageId, pkgId: pkg.id }))}
//                       >
//                         <DeleteIcon />
//                       </IconButton>
//                     </EditableCard>
//                   </SortableItem>
//                 ))}
//               </SortableContext>
//             </DndContext>
//           </Box>
          
//           {/* PDF Preview */}
//           <Box sx={{ width: "50%", borderLeft: "4px solid #333", bgcolor: "white" }}>
//             <PDFViewer style={{ width: "100%", height: "100%" }}>
//               <PdfDocument4 {...pageData} />
//             </PDFViewer>
//           </Box>
//         </Box>
//       </Box>
//     );
//   }
  
//   // Production Mode
//   return (
//     <Box sx={{ width: "100%", height: "100vh" }}>
//       <PDFViewer style={{ width: "100%", height: "100%" }}>
//         <PdfDocument4 {...pageData} />
//       </PDFViewer>
//     </Box>
//   );
// };

// export { PdfDocument4 };
// export default PdfPage4;