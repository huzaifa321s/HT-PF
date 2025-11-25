import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Typography,
  Grid,
  Box,
  Button,
  Chip,
  Skeleton,
  Stack,
  Slide,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axiosInstance from "../../utils/axiosInstance";

// Smooth transition
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ViewProposalModal = ({ open, handleClose, id }) => {
  const [isLoading, setLoading] = useState(false);
  const [proposal, setProposal] = useState({});
  const [pdfUrl, setPdfUrl] = useState("");
  const [showPdf, setShowPdf] = useState(false);
  const navigate = useNavigate();

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

  const handleViewPDF = () => {
    if (pdfUrl) setShowPdf(true);
  };

  const handleClosePdf = () => setShowPdf(false);

  return (
    <>
      {/* Main Proposal Dialog */}
      <Dialog
        open={open && !showPdf}
        onClose={handleClose}
        TransitionComponent={Transition}
        keepMounted
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 5,
            bgcolor: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            maxHeight: "90vh",
            p: { xs: 3, sm: 4 },
            m: { xs: 1, sm: 2 },
            boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
            overflowY: "auto",
          },
        }}
      >
        {/* Header */}
        <DialogTitle sx={{ pb: 1 }}>
          {isLoading ? (
            <Skeleton width="60%" height={40} />
          ) : (
            <>
              <Typography
                variant="h5"
                fontWeight={700}
                gutterBottom
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {proposal?.projectTitle || "Untitled Proposal"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Client: <b>{proposal?.clientName || "N/A"}</b>
              </Typography>

              {proposal?.isAdmin && proposal?.creatorName && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Created By: <b>{proposal.creatorName}</b>
                </Typography>
              )}
            </>
          )}
        </DialogTitle>

        <Divider sx={{ my: 2 }} />

        {/* Content */}
        <DialogContent dividers sx={{ px: { xs: 2, sm: 4 }, py: 3 }}>
          {isLoading ? (
            <Stack spacing={2}>
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} height={60} sx={{ borderRadius: 2 }} />
              ))}
            </Stack>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {/* Project Info */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Project Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Platform(s)
                    </Typography>
                    <Typography variant="body1">
                      {proposal?.developmentPlatforms?.join(", ") || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1">{proposal?.date || "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={proposal?.status || "Pending"}
                      color={
                        proposal?.status === "Approved"
                          ? "success"
                          : proposal?.status === "Rejected"
                          ? "error"
                          : proposal?.status === "In Review"
                          ? "warning"
                          : "default"
                      }
                      size="small"
                      sx={{ mt: 0.5, fontWeight: 600 }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Other Sections: Business Overview, Proposed Solution, Financial Details, Timeline, Terms, Contact Info */}
              {["Business Overview", "Proposed Solution", "Timeline / Milestones", "Terms & Conditions"].map(
                (section) => (
                  <Box key={section}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {section}
                    </Typography>
                    <Box
                      sx={{
                        bgcolor: "rgba(255,255,255,0.9)",
                        p: 2.5,
                        borderRadius: 3,
                        border: "1px solid rgba(102, 126, 234, 0.3)",
                        boxShadow: "0 8px 24px rgba(102, 126, 234, 0.1)",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-line", lineHeight: 1.6 }}
                      >
                        {proposal?.[
                          section === "Business Overview"
                            ? "businessDescription"
                            : section === "Proposed Solution"
                            ? "proposedSolution"
                            : section === "Timeline / Milestones"
                            ? "timelineMilestones"
                            : "terms"
                        ] || `No ${section.toLowerCase()} provided.`}
                      </Typography>
                    </Box>
                  </Box>
                )
              )}

              {/* Financial Details */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Financial Details
                </Typography>
                <Grid container spacing={3}>
                  {[
                    ["Charge Amount ($)", proposal?.chargeAmount || "N/A"],
                    ["Advance (%)", `${proposal?.advancePercent || "N/A"}%`],
                    ["Additional Costs", proposal?.additionalCosts || "N/A"],
                    ["Project Duration", proposal?.projectDuration || "N/A"],
                  ].map(([label, value]) => (
                    <Grid item xs={12} sm={6} md={3} key={label}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography variant="body1">{value}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Contact Info */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Contact Information
                </Typography>
                <Box sx={{ pl: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {proposal?.yourName || "N/A"}
                  </Typography>
                  <Typography variant="body2">{proposal?.yourEmail || "N/A"}</Typography>
                  <Typography variant="body2">{proposal?.yourPhone || "N/A"}</Typography>
                </Box>
              </Box>

              {/* Call Outcome */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Call Outcome
                </Typography>
                <Typography variant="body1">{proposal?.callOutcome || "N/A"}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        {/* Footer */}
        <DialogActions
          sx={{
            p: { xs: 2, sm: 3 },
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={handleClose}
            sx={{
              borderRadius: 3,
              px: 4,
              textTransform: "none",
              fontWeight: 600,
              background: "rgba(255,255,255,0.8)",
            }}
          >
            Close
          </Button>

          {!isLoading && (
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleViewPDF}
                disabled={!pdfUrl}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  '&:hover': { background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)" },
                }}
              >
                View PDF
              </Button>
              {!proposal.isAdmin && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/edit-proposal/${proposal?._id}`)}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    '&:hover': { background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)" },
                  }}
                >
                  Edit Proposal
                </Button>
              )}
            </Stack>
          )}
        </DialogActions>
      </Dialog>

      {/* PDF Viewer Dialog */}
      <Dialog
        open={showPdf}
        onClose={handleClosePdf}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: "95vh", m: 2, borderRadius: 5, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" },
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#667eea" }}>
            Proposal PDF
          </Typography>
          <Button onClick={handleClosePdf} color="inherit">
            Close
          </Button>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              width="100%"
              height="1100px"
              title="Final PDF"
              style={{ border: "none", borderRadius: 5 }}
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
