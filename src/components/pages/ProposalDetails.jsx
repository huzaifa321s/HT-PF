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
    Grid,
    alpha,
} from "@mui/material";
import {
    Person,
    Business,
    Description,
    Info,
    CalendarToday,
    Email,
    Edit,
    ArrowBack,
    Download,
} from "@mui/icons-material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useRouter, useParams } from "next/navigation";
import axiosInstance from "../../utils/axiosInstance";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { showToast } from "../../utils/toastSlice";

const ProposalDetails = () => {
    const { id } = useParams();
    const router = useRouter();
    const [isLoading, setLoading] = useState(false);
    const [proposal, setProposal] = useState({});
    const [pdfUrl, setPdfUrl] = useState("");
    const [showPdf, setShowPdf] = useState(false);
    const dispatch = useDispatch();

    let user = {};
    try {
        user = JSON.parse(sessionStorage.getItem("user") || "{}");
    } catch (e) {
        console.warn("sessionStorage access failed in ProposalDetails:", e);
    }

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

    // ✅ Open the saved Drive PDF link in a new tab (no re-generation)
    const handleViewPdf = () => {
        if (!pdfUrl) return;
        window.open(getDrivePreviewUrl(pdfUrl), "_blank", "noopener,noreferrer");
    };

    const handleDownloadClick = () => {
        if (pdfUrl) {
            handleDownload();
        } else {
            dispatch(showToast({ message: "No PDF generated yet. Please generate it from Proposal Studio.", severity: "warning" }));
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
                            {pdfUrl ? (
                                <>
                                    {/* Open saved Drive PDF in new tab */}
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<OpenInNewIcon />}
                                        onClick={handleViewPdf}
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
                                        View PDF
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
                                </>
                            ) : (
                                <Box sx={{ textAlign: "center" }}>
                                    <Description sx={{ fontSize: 48, color: "#f3a833", opacity: 0.6, mb: 1.5 }} />
                                    <Typography variant="h6" fontWeight={700} color="#f8fafc" sx={{ mb: 0.5 }}>
                                        No PDF Generated Yet
                                    </Typography>
                                    <Typography variant="body2" color="#94a3b8" sx={{ mb: 3 }}>
                                        Open this proposal in the Studio, then click &quot;Save with PDF&quot; to generate and save it.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<Edit />}
                                        onClick={() => router.push(`/proposal-studio/${id}`)}
                                        sx={{
                                            background: colorScheme.gradient,
                                            px: 5,
                                            py: 1.5,
                                            borderRadius: 3,
                                            fontWeight: 700,
                                            fontSize: "1rem",
                                            textTransform: "none",
                                            boxShadow: "0 8px 24px rgba(243, 168, 51, 0.3)",
                                            "&:hover": {
                                                background: colorScheme.hoverGradient,
                                                transform: "translateY(-2px)",
                                            },
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        Open in Proposal Studio
                                    </Button>
                                </Box>
                            )}
                        </Paper>
                    </motion.div>
                </motion.div>
            </Container>
        </Box>
    );
};

export default ProposalDetails;
