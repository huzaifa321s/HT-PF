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

const ProposalDetails = () => {
    const { id } = useParams();
    const router = useRouter();
    const [isLoading, setLoading] = useState(false);
    const [proposal, setProposal] = useState({});
    const [pdfUrl, setPdfUrl] = useState("");
    const [showPdf, setShowPdf] = useState(false);

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

    const handleDownload = () => {
        if (!pdfUrl) return;
        // Force Vercel Blob to serve as an attachment to bypass popup blockers
        const downloadUrl = pdfUrl.includes("?") ? `${pdfUrl}&download=1` : `${pdfUrl}?download=1`;
        
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", ""); // Suggest download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                                onClick={() => setShowPdf(true)}
                                disabled={!pdfUrl}
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
                                onClick={handleDownload}
                                disabled={!pdfUrl}
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
                                    src={pdfUrl}
                                    width="100%"
                                    height="100%"
                                    title="Proposal PDF"
                                    style={{ border: "none", display: "block" }}
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
        </Box>
    );
};

export default ProposalDetails;
