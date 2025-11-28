import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Chip,
  Skeleton,
  Stack,
  Slide,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Divider,
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
  Phone,
  Edit,
  Visibility,
} from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axiosInstance from "../../utils/axiosInstance";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ViewProposalModal = ({ open, handleClose, id }) => {
  const [isLoading, setLoading] = useState(false);
  const [proposal, setProposal] = useState({});
  const [pdfUrl, setPdfUrl] = useState("");
  const [showPdf, setShowPdf] = useState(false);
  const [expanded, setExpanded] = useState("client");
  const navigate = useNavigate();
const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  useEffect(() => {
    const fetchProposal = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `${import.meta.env.VITE_APP_BASE_URL}/api/proposals/get-single-proposal/${id}`
        );
        setProposal({ ...res.data.data, isAdmin: res.data.isAdmin });
        if (res.data.data.pdfPath) {
          setPdfUrl(`${import.meta.env.VITE_APP_BASE_URL}/${res.data.data.pdfPath}`);
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

  const InfoRow = ({ label, value, icon }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
      {icon && React.cloneElement(icon, { 
        sx: { fontSize: 18, color: "#667eea" } 
      })}
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
        {label}:
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value || "N/A"}
      </Typography>
    </Box>
  );

  const AccordionSection = ({ panel, title, icon, children }) => (
    <Accordion
      expanded={expanded === panel}
      onChange={handleChange(panel)}
      sx={{
        mb: 1,
        borderRadius: 2,
        "&:before": { display: "none" },
        boxShadow: "0 2px 8px rgba(102, 126, 234, 0.08)",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          background: expanded === panel ? colorScheme.gradient : "#f5f7ff",
          color: expanded === panel ? "#fff" : "#333",
          borderRadius: 2,
          "& .MuiAccordionSummary-expandIconWrapper": {
            color: expanded === panel ? "#fff" : "#667eea",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {React.cloneElement(icon, {
            sx: { fontSize: 22, color: expanded === panel ? "#fff" : "#667eea" },
          })}
          <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 3, bgcolor: "#fafbff" }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );

  return (
    <>
      {/* Main Proposal Dialog */}
      <Dialog
        open={open && !showPdf}
        onClose={handleClose}
        TransitionComponent={Transition}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            maxHeight: "90vh",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            background: colorScheme.gradient,
            color: "#fff",
            pb: 2,
          }}
        >
          {isLoading ? (
            <Skeleton width="60%" height={32} sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
          ) : (
            <>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {proposal?.projectTitle || "Untitled Proposal"}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
                {proposal?.brandName && (
                  <Chip
                    label={proposal.brandName}
                    size="small"
                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff" }}
                  />
                )}
                <Chip
                  label={proposal?.callOutcome || "N/A"}
                  size="small"
                  color={
                    proposal?.callOutcome === "Interested"
                      ? "success"
                      : proposal?.callOutcome === "No Fit"
                      ? "error"
                      : "default"
                  }
                  sx={{ bgcolor: "rgba(255,255,255,0.3)", color: "#fff" }}
                />
              </Box>
              {proposal?.isAdmin && proposal?.creatorName && (
                <Typography variant="caption" sx={{ display: "block", mt: 1, opacity: 0.9 }}>
                  Created by: {proposal.creatorName}
                </Typography>
              )}
            </>
          )}
        </DialogTitle>

        {/* Content */}
        <DialogContent sx={{ p: 3, bgcolor: "#fafbff" }}>
          {isLoading ? (
            <Stack spacing={2}>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} height={60} sx={{ borderRadius: 2 }} />
              ))}
            </Stack>
          ) : (
            <Box sx={{marginTop:5}}>
              {/* Client Info */}
              <AccordionSection
                panel="client"
                title="Client Information"
                icon={<Business />}
                
              >
                <InfoRow label="Client Name" value={proposal?.clientName} icon={<Person />} />
                <InfoRow label="Email" value={proposal?.clientEmail} icon={<Email />} />
                <InfoRow label="Date" value={proposal?.date} icon={<CalendarToday />} />
              </AccordionSection>

              {/* Project Details */}
              <AccordionSection
                panel="project"
                title="Project Details"
                icon={<Description />}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Business Description
                  </Typography>
                  <Paper sx={{ p: 2, mb: 2, bgcolor: "#fff", borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>
                      {proposal?.businessDescription || "No description provided."}
                    </Typography>
                  </Paper>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Proposed Solution
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: "#fff", borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>
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
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                  <Paper sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, textAlign: "center" }}>
                    <Typography variant="caption" color="text.secondary">
                      Advance Percent
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="#667eea">
                      {proposal?.advancePercent || 0}%
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, textAlign: "center" }}>
                    <Typography variant="caption" color="text.secondary">
                      Additional Costs
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="#667eea">
                      ${proposal?.additionalCosts || 0}
                    </Typography>
                  </Paper>
                </Box>
              </AccordionSection>
{console.log('proposal.created',proposal.createdBy)}
              {/* Contact Info */}
              <AccordionSection
                panel="contact"
                title={user?.role === 'admin' && user?.id === proposal?.createdBy?._id  ? `Your Contact Info` :  `Agent Contact Info`}
                icon={<Info />}
              >
                <InfoRow label="Name" value={proposal?.yourName} icon={<Person />} />
                <InfoRow label="Email" value={proposal?.yourEmail} icon={<Email />} />
              </AccordionSection>
            </Box>
          )}
        </DialogContent>

        {/* Footer */}
        <DialogActions
          sx={{
            p: 3,
            justifyContent: "space-between",
            bgcolor: "#f5f7ff",
            borderTop: "1px solid #e0e7ff",
          }}
        >
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 600,
              borderColor: "#667eea",
              color: "#667eea",
            }}
          >
            Close
          </Button>

          {!isLoading && (
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                startIcon={<Visibility />}
                onClick={() => setShowPdf(true)}
                disabled={!pdfUrl}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  fontWeight: 600,
                  background: colorScheme.gradient,
                  "&:hover": { background: colorScheme.hoverGradient },
                  textTransform: "none",
                }}
              >
                View PDF
              </Button>

                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => navigate(`/edit-proposal/${proposal?._id}`)}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    fontWeight: 600,
                    background: colorScheme.gradient,
                    "&:hover": { background: colorScheme.hoverGradient },
                    textTransform: "none",
                  }}
                >
                  Edit
                </Button>

            </Stack>
          )}
        </DialogActions>
      </Dialog>

      {/* PDF Viewer Dialog */}
      <Dialog
        open={showPdf}
        onClose={() => setShowPdf(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: "95vh", m: 2, borderRadius: 4 },
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
          <Typography variant="h6" fontWeight={600}>
            Proposal PDF
          </Typography>
          <Button
            onClick={() => setShowPdf(false)}
            sx={{ color: "#fff", textTransform: "none" }}
          >
            Close
          </Button>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              width="100%"
              height="100%"
              title="Proposal PDF"
              style={{ border: "none" }}
            />
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography>PDF not available.</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ViewProposalModal;