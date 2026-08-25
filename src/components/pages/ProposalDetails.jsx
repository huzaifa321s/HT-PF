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
    const dispatch = useDispatch();
    const [user, setUser] = useState(null);

    useEffect(() => {
        try {
            const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
            setUser(storedUser);
        } catch (e) {
            console.warn("sessionStorage access failed in ProposalDetails:", e);
        }
    }, []);

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    };

    const formatDateTime = (iso) => {
        try {
            return format(new Date(iso), "dd MMM yyyy, hh:mm a");
        } catch {
            return "N/A";
        }
    };

    const InfoRow = ({ label, value, icon }) => (
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, py: 1.5 }}>
            <Box
                sx={{
                    p: 1.2,
                    borderRadius: 2.5,
                    bgcolor: "rgba(243, 168, 51, 0.12)",
                    color: "#f3a833",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    mt: 0.25,
                }}
            >
                {React.cloneElement(icon, { sx: { fontSize: 20 } })}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 600,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        display: "block",
                        mb: 0.5,
                    }}
                >
                    {label}
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        fontWeight: 600,
                        color: "#f8fafc",
                        fontSize: "1rem",
                        wordBreak: "break-word",
                    }}
                >
                    {value || "N/A"}
                </Typography>
            </Box>
        </Box>
    );

    const SectionCard = ({ title, icon, children }) => (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 3, sm: 3.5 },
                height: "100%",
                background: "rgba(20, 20, 20, 0.65)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(243, 168, 51, 0.18)",
                borderRadius: 4,
                boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                "&:hover": {
                    border: "1px solid rgba(243, 168, 51, 0.35)",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                },
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.75, mb: 2.5, pb: 2, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <Box
                    sx={{
                        p: 1.25,
                        borderRadius: 3,
                        background: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
                        color: "#000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 14px rgba(243, 168, 51, 0.35)",
                    }}
                >
                    {React.cloneElement(icon, { sx: { fontSize: 22 } })}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.15rem", color: "#f8fafc" }}>
                    {title}
                </Typography>
            </Box>
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
                {children}
            </Box>
        </Paper>
    );

    // Google Drive direct download URL
    const getDriveDownloadUrl = (url) => {
        if (!url) return "";
        const match = url.match(/\/file\/d\/([^/]+)/);
        if (match) return `https://drive.google.com/uc?export=download&id=${match[1]}`;
        return url.includes("?") ? `${url}&download=1` : `${url}?download=1`;
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

    const handleViewPdf = () => {
        if (!pdfUrl) return;
        window.open(pdfUrl, "_blank", "noopener,noreferrer");
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
                    background: "radial-gradient(circle, rgba(243,168,51,0.08) 0%, rgba(0,0,0,0) 70%)",
                    borderRadius: "50%",
                    pointerEvents: "none",
                }}
            />

            <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, position: "relative", zIndex: 1 }}>
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    
                    {/* 1. Simple Sticky Header */}
                    <motion.div variants={itemVariants}>
                        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
                            <IconButton
                                onClick={() => router.back()}
                                sx={{
                                    bgcolor: "#141414",
                                    border: "1px solid rgba(243, 168, 51, 0.25)",
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                                    "&:hover": { bgcolor: "rgba(30, 30, 30, 0.9)", borderColor: "#f3a833" },
                                    color: "#f3a833",
                                    p: 1.25,
                                }}
                            >
                                <ArrowBack />
                            </IconButton>
                            <Box>
                                <Typography variant="h4" fontWeight={800} color="#f8fafc" sx={{ fontSize: { xs: "1.75rem", sm: "2rem" } }}>
                                    Proposal Details
                                </Typography>
                                <Typography variant="body2" color="#94a3b8" sx={{ mt: 0.5 }}>
                                    Review all the information associated with this proposal.
                                </Typography>
                            </Box>
                        </Box>
                    </motion.div>

                    {/* 2. Hero Title Card (Main Focus) */}
                    <motion.div variants={itemVariants}>
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                background: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
                                p: { xs: 3, sm: 4.5 },
                                mb: 4,
                                color: "#fff",
                                boxShadow: "0 20px 40px rgba(243, 168, 51, 0.25), 0 8px 24px rgba(0,0,0,0.4)",
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            {/* Decorative Watermark */}
                            <Box
                                sx={{
                                    position: "absolute",
                                    right: -30,
                                    bottom: -30,
                                    opacity: 0.12,
                                    transform: "rotate(-12deg)",
                                    pointerEvents: "none",
                                }}
                            >
                                <Description sx={{ fontSize: 240, color: "#fff" }} />
                            </Box>

                            {isLoading ? (
                                <Stack spacing={2}>
                                    <Skeleton width="60%" height={50} sx={{ bgcolor: "rgba(255,255,255,0.25)" }} />
                                    <Skeleton width="40%" height={30} sx={{ bgcolor: "rgba(255,255,255,0.25)" }} />
                                </Stack>
                            ) : (
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: { xs: "column", md: "row" },
                                        justifyContent: "space-between",
                                        alignItems: { xs: "flex-start", md: "center" },
                                        gap: 3,
                                        position: "relative",
                                        zIndex: 1,
                                    }}
                                >
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="h3"
                                            sx={{
                                                fontWeight: 800,
                                                fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
                                                mb: 2,
                                                color: "#fff",
                                                textShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                                letterSpacing: "-0.5px",
                                            }}
                                        >
                                            {proposal?.projectTitle || "Untitled Proposal"}
                                        </Typography>

                                        <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap", alignItems: "center" }}>
                                            {proposal?.brandName && (
                                                <Chip
                                                    label={proposal.brandName}
                                                    sx={{
                                                        bgcolor: "rgba(255,255,255,0.25)",
                                                        color: "#fff",
                                                        fontWeight: 700,
                                                        fontSize: "0.85rem",
                                                        backdropFilter: "blur(8px)",
                                                        border: "1px solid rgba(255,255,255,0.2)",
                                                    }}
                                                />
                                            )}
                                            {proposal?.createdAt && (
                                                <Chip
                                                    icon={<CalendarToday sx={{ color: "#fff !important", fontSize: "16px !important" }} />}
                                                    label={`Created: ${formatDateTime(proposal.createdAt)}`}
                                                    sx={{
                                                        bgcolor: "rgba(0,0,0,0.15)",
                                                        color: "#fff",
                                                        fontWeight: 600,
                                                        fontSize: "0.85rem",
                                                        border: "1px solid rgba(255,255,255,0.1)",
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
                                            background: "#ffffff",
                                            color: "#d97706",
                                            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                                            "&:hover": { background: "#f8fafc", transform: "translateY(-2px)", boxShadow: "0 12px 28px rgba(0,0,0,0.3)" },
                                            textTransform: "none",
                                            fontWeight: 800,
                                            px: 3.5,
                                            py: 1.4,
                                            fontSize: "1rem",
                                            transition: "all 0.2s ease",
                                            alignSelf: { xs: "stretch", md: "center" },
                                        }}
                                    >
                                        Edit Proposal
                                    </Button>
                                </Box>
                            )}
                        </Paper>
                    </motion.div>

                    {/* 3. Two Equal Information Cards (Side-by-Side on Desktop) */}
                    <Grid container spacing={3.5} sx={{ mb: 4.5 }}>
                        {/* Client Info */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <motion.div variants={itemVariants} style={{ height: "100%" }}>
                                <SectionCard title="Client Information" icon={<Business />}>
                                    <Stack spacing={0.5}>
                                        <InfoRow label="Client Name" value={proposal?.clientName} icon={<Person />} />
                                        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                                        <InfoRow label="Email Address" value={proposal?.clientEmail} icon={<Email />} />
                                        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                                        <InfoRow label="Proposal Date" value={proposal?.date} icon={<CalendarToday />} />
                                    </Stack>
                                </SectionCard>
                            </motion.div>
                        </Grid>

                        {/* Agent Info */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <motion.div variants={itemVariants} style={{ height: "100%" }}>
                                <SectionCard
                                    title={user?.role === "admin" && user?.id === proposal?.createdBy?._id ? "Your Contact Info" : "Agent Contact Info"}
                                    icon={<Info />}
                                >
                                    <Stack spacing={0.5}>
                                        <InfoRow label="Agent Name" value={proposal?.yourName} icon={<Person />} />
                                        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                                        <InfoRow label="Agent Email" value={proposal?.yourEmail} icon={<Email />} />
                                    </Stack>
                                </SectionCard>
                            </motion.div>
                        </Grid>
                    </Grid>

                    {/* 4. Primary Actions (Centered on desktop, full-width on mobile) */}
                    <motion.div variants={itemVariants}>
                        {pdfUrl ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", sm: "row" },
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 2.5,
                                    mt: 2,
                                    mb: 4,
                                }}
                            >
                                {/* View PDF - Primary Filled Button */}
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<OpenInNewIcon />}
                                    onClick={handleViewPdf}
                                    disabled={isLoading}
                                    sx={{
                                        background: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
                                        color: "#000",
                                        px: { xs: 4, sm: 6 },
                                        py: 1.75,
                                        borderRadius: 3.5,
                                        fontWeight: 800,
                                        fontSize: "1.05rem",
                                        textTransform: "none",
                                        boxShadow: "0 10px 25px rgba(243, 168, 51, 0.35)",
                                        "&:hover": {
                                            background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 14px 30px rgba(243, 168, 51, 0.5)",
                                        },
                                        transition: "all 0.2s ease",
                                        width: { xs: "100%", sm: "auto" },
                                        minWidth: { sm: "200px" },
                                    }}
                                >
                                    View PDF
                                </Button>

                                {/* Download PDF - Secondary Outlined Button */}
                                <Button
                                    variant="outlined"
                                    size="large"
                                    startIcon={<Download />}
                                    onClick={handleDownloadClick}
                                    disabled={isLoading}
                                    sx={{
                                        borderColor: "rgba(243, 168, 51, 0.8)",
                                        borderWidth: 2,
                                        color: "#f3a833",
                                        px: { xs: 4, sm: 6 },
                                        py: 1.75,
                                        borderRadius: 3.5,
                                        fontWeight: 800,
                                        fontSize: "1.05rem",
                                        textTransform: "none",
                                        "&:hover": {
                                            borderColor: "#f59e0b",
                                            borderWidth: 2,
                                            background: "rgba(243, 168, 51, 0.1)",
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 8px 20px rgba(243, 168, 51, 0.2)",
                                        },
                                        transition: "all 0.2s ease",
                                        width: { xs: "100%", sm: "auto" },
                                        minWidth: { sm: "200px" },
                                    }}
                                >
                                    Download PDF
                                </Button>
                            </Box>
                        ) : (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: { xs: 4, sm: 5 },
                                    background: "rgba(20, 20, 20, 0.6)",
                                    border: "1px dashed rgba(243, 168, 51, 0.3)",
                                    borderRadius: 4,
                                    textAlign: "center",
                                    maxWidth: 600,
                                    mx: "auto",
                                    mt: 2,
                                }}
                            >
                                <Description sx={{ fontSize: 48, color: "#f3a833", opacity: 0.8, mb: 1.5 }} />
                                <Typography variant="h6" fontWeight={700} color="#f8fafc" sx={{ mb: 0.5 }}>
                                    No PDF Generated Yet
                                </Typography>
                                <Typography variant="body2" color="#94a3b8" sx={{ mb: 3 }}>
                                    Open this proposal in Proposal Studio to generate and save the final PDF.
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<Edit />}
                                    onClick={() => router.push(`/proposal-studio/${id}`)}
                                    sx={{
                                        background: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
                                        color: "#000",
                                        px: 5,
                                        py: 1.5,
                                        borderRadius: 3,
                                        fontWeight: 800,
                                        fontSize: "1rem",
                                        textTransform: "none",
                                        boxShadow: "0 8px 24px rgba(243, 168, 51, 0.3)",
                                        "&:hover": {
                                            background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
                                            transform: "translateY(-2px)",
                                        },
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    Open in Proposal Studio
                                </Button>
                            </Paper>
                        )}
                    </motion.div>
                </motion.div>
            </Container>
        </Box>
    );
};

export default ProposalDetails;
