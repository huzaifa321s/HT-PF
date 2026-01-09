import React, { useEffect, useState } from "react";
import {
    Typography,
    Box,
    Button,
    Chip,
    Skeleton,
    Stack,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
    Divider,
    Container,
    IconButton,
    Dialog,
    DialogTitle,
    Grid,
    DialogContent,
} from "@mui/material";
import {
    ExpandMore,
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
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router";
import axiosInstance from "../utils/axiosInstance";

const ProposalDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);
    const [proposal, setProposal] = useState({});
    const [pdfUrl, setPdfUrl] = useState("");
    const [showPdf, setShowPdf] = useState(false);
    const [expanded, setExpanded] = useState("client");

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

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const colorScheme = {
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        hoverGradient: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
    };

    const formatCurrency = (amount, currencyCode) => {
        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: currencyCode || "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(amount || 0);
        } catch (e) {
            return `$${amount || 0}`;
        }
    };

    const InfoRow = ({ label, value, icon }) => (
        <Box
            sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
                mb: 2,
                flexDirection: { xs: "column", sm: "row" },
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {icon &&
                    React.cloneElement(icon, {
                        sx: { fontSize: 20, color: "#667eea" },
                    })}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minWidth: { xs: "unset", sm: 120 }, fontWeight: 600 }}
                >
                    {label}:
                </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 500, ml: { xs: 4, sm: 0 } }}>
                {value || "N/A"}
            </Typography>
        </Box>
    );

    const AccordionSection = ({ panel, title, icon, children }) => (
        <Accordion
            expanded={expanded === panel}
            onChange={handleChange(panel)}
            sx={{
                mb: 2,
                borderRadius: "12px !important",
                "&:before": { display: "none" },
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.08)",
                overflow: "hidden",
                border: "1px solid #e0e7ff",
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                    background: expanded === panel ? colorScheme.gradient : "#fff",
                    color: expanded === panel ? "#fff" : "#333",
                    transition: "all 0.3s ease",
                    "& .MuiAccordionSummary-expandIconWrapper": {
                        color: expanded === panel ? "#fff" : "#667eea",
                    },
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {React.cloneElement(icon, {
                        sx: { fontSize: 24, color: expanded === panel ? "#fff" : "#667eea" },
                    })}
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                        {title}
                    </Typography>
                </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: { xs: 2, sm: 4 }, bgcolor: "#fff" }}>
                {children}
            </AccordionDetails>
        </Accordion>
    );

    return (
        <Box sx={{ bgcolor: "#fff", minHeight: "100vh" }}>
            <Container maxWidth="md" sx={{ py: { xs: 2, md: 5 } }}>
                {/* Header / Navigation */}
                <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{
                            bgcolor: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            "&:hover": { bgcolor: "#f5f7ff" },
                        }}
                    >
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h4" fontWeight={800} color="#333">
                        Proposal Details
                    </Typography>
                </Box>

                {/* Main Card */}
                <Paper
                    sx={{
                        borderRadius: 4,
                        overflow: "hidden",
                        boxShadow: "0 10px 40px rgba(102, 126, 234, 0.1)",
                        border: "1px solid #e0e7ff",
                    }}
                >
                    {/* Banner Section */}
                    <Box
                        sx={{
                            background: colorScheme.gradient,
                            p: { xs: 3, sm: 5 },
                            color: "#fff",
                        }}
                    >
                        {isLoading ? (
                            <Stack spacing={2}>
                                <Skeleton width="60%" height={40} sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
                                <Skeleton width="40%" height={24} sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
                            </Stack>
                        ) : (
                            <>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                                    <Box>
                                        <Typography
                                            variant="h3"
                                            fontWeight={800}
                                            sx={{ fontSize: { xs: "1.8rem", sm: "2.5rem" }, mb: 1 }}
                                        >
                                            {proposal?.projectTitle || "Untitled Proposal"}
                                        </Typography>
                                        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 2 }}>
                                            {proposal?.brandName && (
                                                <Chip
                                                    label={proposal.brandName}
                                                    sx={{
                                                        bgcolor: "rgba(255,255,255,0.2)",
                                                        color: "#fff",
                                                        fontWeight: 700,
                                                        backdropFilter: "blur(4px)",
                                                    }}
                                                />
                                            )}
                                            <Chip
                                                label={proposal?.callOutcome || "N/A"}
                                                color={
                                                    proposal?.callOutcome === "Interested"
                                                        ? "success"
                                                        : proposal?.callOutcome === "No Fit"
                                                            ? "error"
                                                            : "secondary"
                                                }
                                                sx={{ fontWeight: 700 }}
                                            />
                                        </Box>
                                    </Box>

                                    <Stack direction="row" spacing={2}>
                                        <Button
                                            variant="contained"
                                            startIcon={<Edit />}
                                            onClick={() => navigate(`/edit-proposal/${id}`)}
                                            sx={{
                                                bgcolor: "rgba(255,255,255,0.2)",
                                                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                                                backdropFilter: "blur(4px)",
                                                textTransform: "none",
                                                fontWeight: 700,
                                                borderRadius: 2,
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    </Stack>
                                </Box>

                                {proposal?.isAdmin && proposal?.creatorName && (
                                    <Typography
                                        variant="body2"
                                        sx={{ mt: 3, opacity: 0.9, fontWeight: 500, display: "flex", alignItems: "center", gap: 1 }}
                                    >
                                        <Person sx={{ fontSize: 16 }} /> Created by: {proposal.creatorName}
                                    </Typography>
                                )}
                            </>
                        )}
                    </Box>

                    {/* Content Area */}
                    <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: "#fff" }}>
                        {isLoading ? (
                            <Stack spacing={3}>
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 3 }} />
                                ))}
                            </Stack>
                        ) : (
                            <Box>
                                {/* Client Info */}
                                <AccordionSection
                                    panel="client"
                                    title="Client Information"
                                    icon={<Business />}
                                >
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <InfoRow label="Client Name" value={proposal?.clientName} icon={<Person />} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <InfoRow label="Email" value={proposal?.clientEmail} icon={<Email />} />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <InfoRow label="Date" value={proposal?.date} icon={<CalendarToday />} />
                                        </Grid>
                                    </Grid>
                                </AccordionSection>

                                {/* Project Details */}
                                <AccordionSection
                                    panel="project"
                                    title="Project Details"
                                    icon={<Description />}
                                >
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                                            Business Description
                                        </Typography>
                                        <Paper variant="outlined" sx={{ p: 2.5, mb: 4, bgcolor: "#fff", borderRadius: 3, borderStyle: "dashed" }}>
                                            <Typography variant="body1" sx={{ whiteSpace: "pre-line", lineHeight: 1.8, color: "#334155" }}>
                                                {proposal?.businessDescription || "No description provided."}
                                            </Typography>
                                        </Paper>

                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                                            Proposed Solution
                                        </Typography>
                                        <Paper variant="outlined" sx={{ p: 2.5, bgcolor: "#fff", borderRadius: 3, borderStyle: "dashed" }}>
                                            <Typography variant="body1" sx={{ whiteSpace: "pre-line", lineHeight: 1.8, color: "#334155" }}>
                                                {proposal?.proposedSolution || "No solution provided."}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                </AccordionSection>

                                {/* Financial */}
                                <AccordionSection
                                    panel="financial"
                                    title="Financial Details"
                                    icon={<AttachMoney />}
                                >
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 3,
                                                    bgcolor: "#fff",
                                                    borderRadius: 3,
                                                    textAlign: "center",
                                                    border: "1px solid #e0e7ff",
                                                }}
                                            >
                                                <Typography variant="caption" sx={{ color: "#667eea", fontWeight: 700, textTransform: "uppercase" }}>
                                                    Advance Payment
                                                </Typography>
                                                <Typography variant="h4" fontWeight={800} sx={{ color: "#1e293b", mt: 1 }}>
                                                    {proposal?.advancePercent || 0}%
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 3,
                                                    bgcolor: "#fff",
                                                    borderRadius: 3,
                                                    textAlign: "center",
                                                    border: "1px solid #e0e7ff",
                                                }}
                                            >
                                                <Typography variant="caption" sx={{ color: "#667eea", fontWeight: 700, textTransform: "uppercase" }}>
                                                    Total Project Cost
                                                </Typography>
                                                <Typography variant="h4" fontWeight={800} sx={{ color: "#1e293b", mt: 1 }}>
                                                    {formatCurrency(proposal?.additionalCosts, proposal?.selectedCurrency)}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </AccordionSection>

                                {/* Contact Info */}
                                <AccordionSection
                                    panel="contact"
                                    title={user?.role === 'admin' && user?.id === proposal?.createdBy?._id ? "Your Contact Info" : "Agent Contact Info"}
                                    icon={<Info />}
                                >
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <InfoRow label="Agent Name" value={proposal?.yourName} icon={<Person />} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <InfoRow label="Agent Email" value={proposal?.yourEmail} icon={<Email />} />
                                        </Grid>
                                    </Grid>
                                </AccordionSection>
                            </Box>
                        )}
                    </Box>

                    {/* Footer Actions */}
                    <Divider />
                    <Box
                        sx={{
                            p: 4,
                            bgcolor: "#fff",
                            display: "flex",
                            justifyContent: "center",
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
                                px: 6,
                                py: 1.5,
                                borderRadius: 3,
                                fontWeight: 700,
                                fontSize: "1.1rem",
                                textTransform: "none",
                                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                                "&:hover": {
                                    background: colorScheme.hoverGradient,
                                    boxShadow: "0 12px 30px rgba(102, 126, 234, 0.4)",
                                },
                            }}
                        >
                            Preview Generated PDF
                        </Button>
                    </Box>
                </Paper>

                {/* PDF Viewer Dialog */}
                <Dialog
                    open={showPdf}
                    onClose={() => setShowPdf(false)}
                    maxWidth="lg"
                    fullWidth
                    PaperProps={{
                        sx: { height: "90vh", borderRadius: 4 },
                    }}
                >
                    <DialogTitle
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: colorScheme.gradient,
                            color: "#fff",
                        }}
                    >
                        <Typography variant="h6" fontWeight={700}>
                            Proposal Document Preview
                        </Typography>
                        <IconButton onClick={() => setShowPdf(false)} sx={{ color: "#fff" }}>
                            <ExpandMore sx={{ transform: "rotate(180deg)" }} />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ p: 0, bgcolor: "#525659" }}>
                        {pdfUrl ? (
                            <iframe
                                src={pdfUrl}
                                width="100%"
                                height="100%"
                                title="Proposal PDF"
                                style={{ border: "none" }}
                            />
                        ) : (
                            <Box sx={{ p: 10, textAlign: "center", color: "#fff" }}>
                                <Typography variant="h5">PDF not found.</Typography>
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>
            </Container>
        </Box>
    );
};

export default ProposalDetails;
