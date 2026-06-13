"use client";
import React, { useEffect, useState } from "react";
import {
    Typography,
    Box,
    Button,
    Chip,
    Skeleton,
    Stack,
    Paper,
    Divider,
    Container,
    IconButton,
    Dialog,
    DialogTitle,
    Grid,
    DialogContent,
    alpha,
} from "@mui/material";
import {
    Person,
    Business,
    Description,
    AttachMoney,
    Info,
    CalendarToday,
    Email,
    Edit,
    Visibility,
    ArrowBack,
    Download,
    Close,
} from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import axiosInstance from "../../utils/axiosInstance";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { showToast } from "../../utils/toastSlice";
import { updateField } from "../../utils/proposalSlice";
import { setDBData, setMode1 } from "../../utils/page1Slice";
import { setDBDataP2, setMode } from "../../utils/page2Slice";
import { setDBDataP3, setMode2 } from "../../utils/page3Slice";
import { setDBDataPricing, setMode3 } from "../../utils/pricingReducer";
import { setDBTerms, setMode4 } from "../../utils/paymentTermsPageSlice";
import dynamic from "next/dynamic";
import { Backdrop, CircularProgress } from "@mui/material";

const UnifiedPdfEditor = dynamic(() => import("../UnifiedPDFEditor"), { ssr: false });

const ProposalDetails = () => {
    const { id } = useParams();
    const router = useRouter();
    const [isLoading, setLoading] = useState(false);
    const [proposal, setProposal] = useState({});
    const [pdfUrl, setPdfUrl] = useState("");
    const [showPdf, setShowPdf] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [downloadingProposal, setDownloadingProposal] = useState(null);
    const dispatch = useDispatch();

    const user = JSON.parse(sessionStorage.getItem("user") || "{}");

    useEffect(() => {
        const fetchProposal = async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get(
                    `/api/proposals/get-single-proposal/${id}`
                );
                setProposal({ ...res.data.data, isAdmin: res.data.isAdmin });
                if (res.data.data.pdfPath) {
                    setPdfUrl(`${res.data.data.pdfPath}`);
                }
            } catch (error) {
                console.error("Error fetching proposal:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProposal();
    }, [id]);

    const colorScheme = {
        primary: "#f3a833",
        secondary: "#f59e0b",
        gradient: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
        hoverGradient: "linear-gradient(135deg, #eab308 0%, #d97706 100%)",
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    const formatCurrency = (amount) => {
        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(amount || 0);
        } catch (e) {
            return `$${amount || 0}`;
        }
    };
    const formatDateTime = (iso) => {
        try {
            return format(new Date(iso), "dd MMM yyyy, hh:mm a");
        } catch {
            return "N/A";
        }
    };

    const InfoRow = ({ label, value, icon }) => (
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
            <Box
                sx={{
                    p: 1,
                    borderRadius: 2,
                    background: alpha("#f3a833", 0.1),
                    color: "#f3a833",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {React.cloneElement(icon, { sx: { fontSize: 20 } })}
            </Box>
            <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                    {label}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: "#f8fafc" }}>
                    {value || "N/A"}
                </Typography>
            </Box>
        </Box>
    );

    const SectionCard = ({ title, icon, children }) => (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 3, sm: 4 },
                height: "100%",
                background: "rgba(20, 20, 20, 0.6)",
                border: "1px solid rgba(243, 168, 51, 0.15)",
                borderRadius: 4,
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                    border: "1px solid rgba(243, 168, 51, 0.3)",
                },
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 3,
                        background: colorScheme.gradient,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(243, 168, 51, 0.4)",
                    }}
                >
                    {React.cloneElement(icon, { sx: { fontSize: 24 } })}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#f8fafc" }}>
                    {title}
                </Typography>
            </Box>
            {children}
        </Paper>
    );

    // ✅ Build a Google Drive direct download URL from a view/webViewLink
    const getDriveDownloadUrl = (url) => {
        if (!url) return "";
        // Google Drive view link: https://drive.google.com/file/d/FILE_ID/view?...
        const match = url.match(/\/file\/d\/([^/]+)/);
        if (match) return `https://drive.google.com/uc?export=download&id=${match[1]}`;
        // Fallback (old Vercel Blob URLs)
        return url.includes("?") ? `${url}&download=1` : `${url}?download=1`;
    };

    // ✅ Build a Google Drive embeddable preview URL
    const getDrivePreviewUrl = (url) => {
        if (!url) return "";
        // Google Drive view link → preview link
        const match = url.match(/\/file\/d\/([^/]+)/);
        if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
        // Fallback (Vercel Blob or other URLs)
        return url;
    };

    const handleDownload = () => {
        if (!pdfUrl) return;
        const downloadUrl = getDriveDownloadUrl(pdfUrl);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", "");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const generatePdfOnTheFly = async (forceDownload = false) => {
        try {
            setIsGeneratingPdf(true);

            // 1. Seed Redux store with proposal metadata and page details
            dispatch(updateField({ field: "clientName", value: proposal.clientName }));
            dispatch(updateField({ field: "date", value: proposal.date }));
            dispatch(updateField({ field: "additionalCosts", value: proposal.additionalCosts }));
            dispatch(updateField({ field: "chargeAmount", value: proposal.chargeAmount }));
            dispatch(updateField({ field: "advancePercent", value: proposal.advancePercent }));
            dispatch(updateField({ field: "brandName", value: proposal.brandName }));

            if (proposal.pdfPages?.page1) dispatch(setDBData(proposal.pdfPages.page1));
            if (proposal.pdfPages?.page3) dispatch(setDBDataP2(proposal.pdfPages.page3));
            if (proposal.pdfPages?.page2) dispatch(setDBDataP3(proposal.pdfPages.page2));
            if (proposal.pdfPages?.pricingPage) dispatch(setDBDataPricing(proposal.pdfPages.pricingPage));
            if (proposal.pdfPages?.paymentTerms) dispatch(setDBTerms(proposal.pdfPages.paymentTerms));

            dispatch(setMode("edit"));
            dispatch(setMode1("edit"));
            dispatch(setMode2("edit"));
            dispatch(setMode3("edit"));
            dispatch(setMode4("edit"));

            // 2. Mount offscreen editor
            setDownloadingProposal(proposal);

            // 3. Wait for mount & styles
            await new Promise((resolve) => setTimeout(resolve, 1500));

            if (document.fonts && document.fonts.ready) {
                await document.fonts.ready;
            }

            const container = document.getElementById("pdf-export-container");
            if (!container) throw new Error("Could not find the offscreen PDF container");

            const html2canvas = (await import("html2canvas-pro")).default;
            const { jsPDF } = await import("jspdf");
            const { convertImagesToBase64, restoreOriginalImages, ensureAllAssetsConverted } = await import("../../utils/imageToBase64");

            const PAGE_PX_HEIGHT = 1131;
            const PAGE_PX_WIDTH = 800;

            const origWidth = container.style.width;
            const origMaxWidth = container.style.maxWidth;
            container.style.width = `${PAGE_PX_WIDTH}px`;
            container.style.maxWidth = `${PAGE_PX_WIDTH}px`;

            await new Promise(r => setTimeout(r, 100));

            const originalSources = await convertImagesToBase64(container);

            let attempts = 0;
            while (!ensureAllAssetsConverted(container) && attempts < 10) {
                await new Promise((r) => setTimeout(r, 200));
                attempts++;
            }

            await new Promise(r => setTimeout(r, 200));

            const preloadAllImages = async (cont) => {
                const imgs = Array.from(cont.querySelectorAll('img'));
                await Promise.all(
                    imgs.map(async (img) => {
                        if (img.src && !img.src.startsWith('data:')) {
                            await new Promise((resolve) => {
                                const temp = new Image();
                                temp.crossOrigin = 'anonymous';
                                temp.onload = resolve;
                                temp.onerror = resolve;
                                temp.src = img.src;
                            });
                        }
                        if (!img.complete || img.naturalWidth === 0) {
                            await new Promise((resolve) => {
                                img.onload = resolve;
                                img.onerror = resolve;
                                setTimeout(resolve, 8000);
                            });
                        }
                        if (typeof img.decode === 'function') {
                            try { await img.decode(); } catch (_) { }
                        }
                    })
                );
                await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
            };

            await preloadAllImages(container);
            await new Promise(r => setTimeout(r, 600));

            let fullCanvas;
            try {
                fullCanvas = await html2canvas(container, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: false,
                    logging: false,
                    scrollX: 0,
                    scrollY: 0,
                    backgroundColor: "#ffffff",
                    width: PAGE_PX_WIDTH,
                    height: container.scrollHeight,
                    windowWidth: PAGE_PX_WIDTH,
                    windowHeight: container.scrollHeight,
                    imageTimeout: 15000,
                    onclone: async (clonedDoc) => {
                        const clonedBody = clonedDoc.body;
                        clonedBody.style.width = `${PAGE_PX_WIDTH}px`;
                        clonedBody.style.minWidth = `${PAGE_PX_WIDTH}px`;

                        const clonedContainer = clonedDoc.getElementById("pdf-export-container");
                        if (clonedContainer) {
                            clonedContainer.style.width = `${PAGE_PX_WIDTH}px`;
                            clonedContainer.style.maxWidth = `${PAGE_PX_WIDTH}px`;
                            clonedContainer.style.transform = "none";
                        }

                        const clonedImgs = Array.from(clonedDoc.querySelectorAll('img'));
                        await Promise.all(
                            clonedImgs.map(async (img) => {
                                if (!img.complete || img.naturalWidth === 0) {
                                    await new Promise((resolve) => {
                                        img.onload = resolve;
                                        img.onerror = resolve;
                                        setTimeout(resolve, 10000);
                                    });
                                }
                                if (typeof img.decode === 'function') {
                                    try { await img.decode(); } catch (_) { }
                                }
                            })
                        );
                    }
                });
            } finally {
                container.style.width = origWidth;
                container.style.maxWidth = origMaxWidth;
                restoreOriginalImages(originalSources);
            }

            const SCALE = 2;
            const pageCanvasHeight = PAGE_PX_HEIGHT * SCALE;
            const pageCanvasWidth = PAGE_PX_WIDTH * SCALE;
            const totalPages = Math.max(1, Math.round(fullCanvas.height / pageCanvasHeight));

            const PDF_W = 595.28;
            const PDF_H = 841.89;

            const pdfDoc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });

            for (let i = 0; i < totalPages; i++) {
                const sliceY = i * pageCanvasHeight;
                const sliceHeight = Math.min(pageCanvasHeight, fullCanvas.height - sliceY);
                if (sliceHeight <= 0) break;

                const pageCanvas = document.createElement("canvas");
                pageCanvas.width = pageCanvasWidth;
                pageCanvas.height = sliceHeight;

                const ctx = pageCanvas.getContext("2d");
                ctx.drawImage(
                    fullCanvas,
                    0, sliceY,
                    pageCanvasWidth, sliceHeight,
                    0, 0,
                    pageCanvasWidth, sliceHeight
                );

                const imgData = pageCanvas.toDataURL("image/jpeg", 0.95);
                const imgH = (sliceHeight / pageCanvasWidth) * PDF_W;

                if (i > 0) pdfDoc.addPage();
                pdfDoc.addImage(imgData, "JPEG", 0, 0, PDF_W, Math.min(imgH, PDF_H));
            }

            const brandName = proposal.brandName?.trim() || "Client";
            const fileName = `${brandName} Proposal.pdf`;

            if (forceDownload) {
                pdfDoc.save(fileName);
            }

            const blob = pdfDoc.output("blob");
            const formDataUpload = new FormData();
            formDataUpload.append("pdfFile", blob, fileName);
            formDataUpload.append("proposalId", id);

            const uploadRes = await axiosInstance.post(
                `/api/proposals/upload-pdf`,
                formDataUpload,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (uploadRes.data.success) {
                const newPdfUrl = uploadRes.data.filePath;
                await axiosInstance.put(
                    `/api/proposals/update-proposal/${id}`,
                    {
                        pdfPath: newPdfUrl,
                    }
                );
                setPdfUrl(newPdfUrl);
                dispatch(showToast({ message: "PDF generated and saved successfully!", severity: "success" }));
                return newPdfUrl;
            } else {
                throw new Error("PDF upload failed");
            }
        } catch (error) {
            console.error("PDF generation failed:", error);
            dispatch(showToast({ message: "Failed to generate PDF: " + error.message, severity: "error" }));
        } finally {
            setIsGeneratingPdf(false);
            setDownloadingProposal(null);
        }
    };

    const handlePreview = async () => {
        if (pdfUrl) {
            setShowPdf(true);
            return;
        }

        try {
            const generatedUrl = await generatePdfOnTheFly();
            if (generatedUrl) {
                setShowPdf(true);
            }
        } catch (error) {
            console.error("Preview PDF generation failed:", error);
        }
    };

    const handleDownloadClick = async () => {
        if (pdfUrl) {
            handleDownload();
            return;
        }

        try {
            await generatePdfOnTheFly(true);
        } catch (error) {
            console.error("Download PDF generation failed:", error);
        }
    };

    return (
        <Box sx={{ minHeight: "100%", position: "relative" }}>
            {/* Background ambient light */}
            <Box
                sx={{
                    position: "absolute",
                    top: -100,
                    right: -100,
                    width: 400,
                    height: 400,
                    background: "radial-gradient(circle, rgba(243,168,51,0.1) 0%, rgba(0,0,0,0) 70%)",
                    borderRadius: "50%",
                    pointerEvents: "none",
                }}
            />

            <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 }, position: "relative", zIndex: 1 }}>
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    
                    {/* Header / Navigation */}
                    <motion.div variants={itemVariants}>
                        <Box sx={{ mb: 5, display: "flex", alignItems: "center", gap: 2 }}>
                            <IconButton
                                onClick={() => router.back()}
                                sx={{
                                    bgcolor: "#141414",
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                                    border: "1px solid rgba(243, 168, 51,0.2)",
                                    "&:hover": { bgcolor: "rgba(30, 30, 30, 0.8)", borderColor: "#f3a833" },
                                    color: "#f3a833",
                                }}
                            >
                                <ArrowBack />
                            </IconButton>
                            <Box>
                                <Typography variant="h4" fontWeight={800} color="#f8fafc">
                                    Proposal Details
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Review all the information associated with this proposal.
                                </Typography>
                            </Box>
                        </Box>
                    </motion.div>

                    {/* Banner Section */}
                    <motion.div variants={itemVariants}>
                        <Paper
                            sx={{
                                borderRadius: 4,
                                overflow: "hidden",
                                background: colorScheme.gradient,
                                p: { xs: 3, sm: 5 },
                                mb: 4,
                                color: "#fff",
                                boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                                position: "relative",
                            }}
                        >
                            {/* Decorative element */}
                            <Box
                                sx={{
                                    position: "absolute",
                                    right: -50,
                                    bottom: -50,
                                    opacity: 0.1,
                                    transform: "rotate(-15deg)",
                                }}
                            >
                                <Description sx={{ fontSize: 240 }} />
                            </Box>

                            {isLoading ? (
                                <Stack spacing={2}>
                                    <Skeleton width="60%" height={50} sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
                                    <Skeleton width="40%" height={30} sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
                                </Stack>
                            ) : (
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 3, position: "relative", zIndex: 1 }}>
                                    <Box>
                                        <Typography
                                            variant="h3"
                                            fontWeight={800}
                                            sx={{ fontSize: { xs: "2rem", sm: "2.5rem" }, mb: 2, textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}
                                        >
                                            {proposal?.projectTitle || "Untitled Proposal"}
                                        </Typography>
                                        
                                        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
                                            {proposal?.brandName && (
                                                <Chip
                                                    label={proposal.brandName}
                                                    sx={{
                                                        bgcolor: "rgba(255,255,255,0.25)",
                                                        color: "#fff",
                                                        fontWeight: 700,
                                                        backdropFilter: "blur(8px)",
                                                        border: "1px solid rgba(255,255,255,0.1)",
                                                    }}
                                                />
                                            )}
                                            <Chip
                                                label={proposal?.callOutcome || "N/A"}
                                                sx={{ 
                                                    fontWeight: 700,
                                                    bgcolor: proposal?.callOutcome === "Interested" ? "#4caf50" : proposal?.callOutcome === "No Fit" ? "#f44336" : "rgba(255,255,255,0.2)",
                                                    color: "#fff",
                                                    border: "1px solid rgba(255,255,255,0.1)",
                                                }}
                                            />
                                            {proposal?.createdAt && (
                                                <Chip
                                                    icon={<CalendarToday sx={{ color: "#fff" }} />}
                                                    label={`Created: ${formatDateTime(proposal.createdAt)}`}
                                                    sx={{
                                                        bgcolor: "transparent",
                                                        color: "#fff",
                                                        fontWeight: 600,
                                                        "& .MuiChip-icon": { color: "rgba(255,255,255,0.8)" }
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        startIcon={<Edit />}
                                        onClick={() => router.push(`/edit-proposal/${id}`)}
                                        sx={{
                                            borderRadius: 3,
                                            background: "#fff",
                                            color: "#f3a833",
                                            boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
                                            "&:hover": { background: "#f8fafc" },
                                            textTransform: "none",
                                            fontWeight: 800,
                                            px: 4,
                                            py: 1.5,
                                            fontSize: "1.05rem",
                                        }}
                                    >
                                        Edit Proposal
                                    </Button>
                                </Box>
                            )}
                        </Paper>
                    </motion.div>

                    {/* Dashboard Grid */}
                    <Grid container spacing={4} sx={{ mb: 4 }}>
                        {/* Client Info */}
                        <Grid item xs={12}>
                            <motion.div variants={itemVariants} style={{ height: "100%" }}>
                                <SectionCard title="Client Information" icon={<Business />}>
                                    <Stack spacing={1}>
                                        <InfoRow label="Client Name" value={proposal?.clientName} icon={<Person />} />
                                        <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", my: 1 }} />
                                        <InfoRow label="Email Address" value={proposal?.clientEmail} icon={<Email />} />
                                        <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", my: 1 }} />
                                        <InfoRow label="Proposal Date" value={proposal?.date} icon={<CalendarToday />} />
                                    </Stack>
                                </SectionCard>
                            </motion.div>
                        </Grid>

                        {/* Agent Info */}
                        <Grid item xs={12}>
                            <motion.div variants={itemVariants}>
                                <SectionCard title={user?.role === 'admin' && user?.id === proposal?.createdBy?._id ? "Your Contact Info" : "Agent Contact Info"} icon={<Info />}>
                                    <Grid container spacing={4}>
                                        <Grid item xs={12} sm={6}>
                                            <InfoRow label="Agent Name" value={proposal?.yourName} icon={<Person />} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <InfoRow label="Agent Email" value={proposal?.yourEmail} icon={<Email />} />
                                        </Grid>
                                    </Grid>
                                </SectionCard>
                            </motion.div>
                        </Grid>
                    </Grid>

                    {/* PDF Actions */}
                    <motion.div variants={itemVariants}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                background: "rgba(20, 20, 20, 0.8)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid rgba(243, 168, 51, 0.2)",
                                borderRadius: 4,
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                justifyContent: "center",
                                alignItems: "center",
                                gap: 3,
                                boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                            }}
                        >
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<Visibility />}
                                onClick={handlePreview}
                                disabled={isLoading}
                                sx={{
                                    background: colorScheme.gradient,
                                    px: 5,
                                    py: 1.5,
                                    borderRadius: 3,
                                    fontWeight: 700,
                                    fontSize: "1.1rem",
                                    textTransform: "none",
                                    boxShadow: "0 8px 24px rgba(243, 168, 51, 0.3)",
                                    "&:hover": {
                                        background: colorScheme.hoverGradient,
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 12px 30px rgba(243, 168, 51, 0.4)",
                                    },
                                    transition: "all 0.2s ease",
                                    width: { xs: "100%", sm: "auto" }
                                }}
                            >
                                Preview PDF
                            </Button>

                            <Button
                                variant="outlined"
                                size="large"
                                startIcon={<Download />}
                                onClick={handleDownloadClick}
                                disabled={isLoading}
                                sx={{
                                    borderColor: "#f3a833",
                                    color: "#f3a833",
                                    px: 5,
                                    py: 1.5,
                                    borderRadius: 3,
                                    fontWeight: 700,
                                    fontSize: "1.1rem",
                                    textTransform: "none",
                                    borderWidth: 2,
                                    "&:hover": {
                                        borderColor: "#f59e0b",
                                        background: alpha("#f3a833", 0.1),
                                        borderWidth: 2,
                                    },
                                    width: { xs: "100%", sm: "auto" }
                                }}
                            >
                                Download PDF
                            </Button>
                        </Paper>
                    </motion.div>
                </motion.div>

                {/* PDF Viewer Dialog */}
                <Dialog
                    open={showPdf}
                    onClose={() => setShowPdf(false)}
                    maxWidth="lg"
                    fullWidth
                    PaperProps={{
                        sx: { 
                            height: "90vh", 
                            borderRadius: 4,
                            background: "#2a2a2a",
                            border: "1px solid rgba(243, 168, 51, 0.2)"
                        },
                    }}
                >
                    <DialogTitle
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: colorScheme.gradient,
                            color: "#fff",
                            py: 2,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Description sx={{ fontSize: 28 }} />
                            <Typography variant="h6" component="span" fontWeight={800}>
                                Document Preview
                            </Typography>
                        </Box>
                        <IconButton onClick={() => setShowPdf(false)} sx={{ color: "#fff", bgcolor: "rgba(0,0,0,0.2)", "&:hover": { bgcolor: "rgba(0,0,0,0.3)" } }}>
                            <Close />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ p: 0, bgcolor: "#525659", display: "flex", flexDirection: "column" }}>
                        {pdfUrl ? (
                            <Box sx={{ flexGrow: 1, width: "100%", height: "100%" }}>
                                <iframe
                                    src={getDrivePreviewUrl(pdfUrl)}
                                    width="100%"
                                    height="100%"
                                    title="Proposal PDF"
                                    style={{ border: "none", display: "block" }}
                                    allow="autoplay"
                                />
                            </Box>
                        ) : (
                            <Box sx={{ p: 10, textAlign: "center", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                                <Description sx={{ fontSize: 64, opacity: 0.5 }} />
                                <Typography variant="h5" fontWeight={600}>PDF not generated yet.</Typography>
                                <Typography variant="body1" color="text.secondary">Go to Edit Proposal and click Save With PDF.</Typography>
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>
            </Container>

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 101, display: 'flex', flexDirection: 'column', gap: 2 }}
                open={isGeneratingPdf}
            >
                <CircularProgress color="inherit" size={60} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Generating PDF Document...
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Please wait, rendering pages and assets
                </Typography>
            </Backdrop>

            {/* Offscreen PDF Renderer */}
            {downloadingProposal && (
                <Box
                    sx={{
                        position: "absolute",
                        left: "-9999px",
                        top: "-9999px",
                        width: "800px",
                        height: "auto",
                        overflow: "visible",
                        zIndex: -9999,
                    }}
                >
                    <div id="pdf-export-container">
                        <UnifiedPdfEditor
                            pdfPages={downloadingProposal.pdfPages}
                            mode="edit-doc"
                            clientName={downloadingProposal.clientName || "Client"}
                            date={downloadingProposal.date || new Date().toISOString()}
                            isStudioMode={false}
                            zoomLevel={100}
                        />
                    </div>
                </Box>
            )}
        </Box>
    );
};

export default ProposalDetails;
