import { useRef, useState, useEffect } from "react";
import { Box, Grid, Paper, Button, Snackbar, Alert } from "@mui/material";
import axios from "axios";
import { io } from "socket.io-client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Import sections
import YourInfoSection from "../components/form-sections/YourInfoSection";
import ClientInfoSection from "../components/form-sections/ClientInfoSection";
import ProjectDetailsSection from "../components/form-sections/ProjectDetailsSection";
import TimelineCostsSection from "../components/form-sections/TimelineCostsSection";
import AdditionalDetailsSection from "../components/form-sections/AdditionalDetailsSection";
import PDFPreview from "../components/pdf/ProposalDocument";
import EmailPreview from "../components/EmailPreview";

export default function ProposalFormPage() {
  const pdfRef = useRef();
  const inputRefs = useRef([]);
  const [isLoading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const TOTAL_INPUTS = 40;

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    projectTitle: "React-Based E-Commerce Website",
    businessDescription: "",
    proposedSolution: "",
    developmentPlatforms: [],
    projectDuration: "6 weeks",
    chargeAmount: "800",
    advancePercent: "50",
    additionalCosts: "",
    brandName: "",
    proposedBy: "Humantek",
    projectBrief: "",
    businessType: "",
    industoryTitle: "",
    strategicProposal: [],
    brandTagline: "",
    selectedBDM: null,
    recommended_services: [],
    serviceCharges: [],
    timelineMilestones:
      "Week 1: Design\nWeeks 2-3: Frontend\nWeeks 4-5: Backend\nWeek 6: Deploy & QA",
    terms: "Payments due within 7 days. 30 days post-launch support.",
    callOutcome: "Interested",
    yourName: "Your Name",
    yourEmail: "your.email@example.com",
    date: new Date().toLocaleDateString(),
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [currency, setCurrency] = useState("USD");
  const [customPlatform, setCustomPlatform] = useState("");
  const [platformOptions, setPlatformOptions] = useState([
    "WordPress",
    "Shopify",
    "Webflow",
    "Wix",
    "Squarespace",
    "Joomla",
    "React",
    "Next.js",
    "Vue.js",
    "Laravel",
    "Node.js",
  ]);

  // Initialize input refs
  useEffect(() => {
    inputRefs.current = Array(TOTAL_INPUTS).fill(null);
  }, []);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get(`${import.meta.env.VITE_APP_BASE_URL}/api/get-creds`);
        if (res.data?.success) {
          setFormData((prev) => ({
            ...prev,
            yourName: res.data.data.name,
            yourEmail: res.data.data.email,
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  // SSE for audio upload processing
  useEffect(() => {
    const evtSource = new EventSource(`${import.meta.env.VITE_APP_BASE_URL}/api/transcribe/sse`);

    evtSource.onmessage = (e) => {
      const { event, data } = JSON.parse(e.data);

      if (
        event === "upload_status" ||
        event === "transcription_status" ||
        event === "pipeline_status"
      ) {
        if (!processing) setProcessing(true);
      }

      if (event === "complete") {
        setFormData((prev) => ({
          ...prev,
          businessDescription: data.data.extracted.business_details,
          proposedSolution: data.data.extracted.proposed_solution,
          recommended_services: data.data.extracted.recommended_services,
          projectBrief: data.data.extracted.project_brief,
          brandName: data.data.extracted.brand_name,
          brandTagline: data.data.extracted.brand_tagline,
          businessType: data.data.extracted.business_type,
          industoryTitle: data.data.extracted.industry_title,
          strategicProposal: data.data.extracted.strategic_proposal,
        }));
        setProcessing(false);
      }

      if (event === "error") {
        setProcessing(false);
      }
    };

    return () => evtSource.close();
  }, [processing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "developmentPlatforms"
          ? typeof value === "string"
            ? value.split(",")
            : value
          : value,
    }));
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        const prev = inputRefs.current[index - 1];
        if (prev) {
          if (prev.focus) prev.focus();
          else prev.querySelector("input")?.focus();
        }
      } else {
        const next = inputRefs.current[index + 1];
        if (next) {
          if (next.focus) next.focus();
          else next.querySelector("input")?.focus();
        }
      }
    }
  };

  const handleCurrencyChange = (event, newCurrency) => {
    if (newCurrency !== null) setCurrency(newCurrency);
  };

  const handleAddCustom = () => {
    const trimmed = customPlatform.trim();
    if (!trimmed) return;
    if (!platformOptions.includes(trimmed)) {
      setPlatformOptions((prev) => [...prev, trimmed]);
    }
    if (!formData.developmentPlatforms.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        developmentPlatforms: [...prev.developmentPlatforms, trimmed],
      }));
    }
    setCustomPlatform("");
  };

  const generatePdf = async (filename = "Proposal.pdf") => {
    if (!pdfRef.current) {
      console.warn("❌ PDF ref not found!");
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/proposals/create-proposal`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const normalPageHeight = pdf.internal.pageSize.getHeight();
      const secondPageHeight = normalPageHeight * 1.2;

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      let pageCount = 1;

      if (res.data.success) {
        setSnackbar({
          open: true,
          message: "✅ Proposal created successfully!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "⚠️ Failed to create proposal. Please try again.",
          severity: "warning",
        });
      }

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= normalPageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        const currentPageHeight = pageCount === 1 ? secondPageHeight : normalPageHeight;
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= currentPageHeight;
        pageCount++;
      }

      pdf.save(filename);
      setSnackbar({
        open: true,
        message: "PDF generated successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("❌ PDF generation error:", err);
      alert("PDF generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    await generatePdf(`${formData.clientName || "proposal"}_proposal.pdf`);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Left: Form */}
        <Grid item xs={12} md={5}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              maxWidth: 1200,
              mx: "auto",
              p: { xs: 3, sm: 4, md: 5 },
              bgcolor: "#ffffff",
              borderRadius: 3,
              boxShadow: 4,
              minHeight: "120vh",
              border: processing ? "3px solid" : "none",
              borderColor: "primary.main",
              animation: processing ? "pulse 2s infinite" : "none",
              "@keyframes pulse": {
                "0%, 100%": { borderColor: "primary.main", opacity: 1 },
                "50%": { borderColor: "primary.light", opacity: 0.7 },
              },
            }}
          >
            <YourInfoSection
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              inputRefs={inputRefs}
              handleKeyDown={handleKeyDown}
            />

            <ClientInfoSection
              formData={formData}
              handleChange={handleChange}
              inputRefs={inputRefs}
              handleKeyDown={handleKeyDown}
            />

            <ProjectDetailsSection
              formData={formData}
              handleChange={handleChange}
              processing={processing}
              platformOptions={platformOptions}
              customPlatform={customPlatform}
              setCustomPlatform={setCustomPlatform}
              handleAddCustom={handleAddCustom}
              inputRefs={inputRefs}
              handleKeyDown={handleKeyDown}
              setFormData={setFormData}
            />

            <TimelineCostsSection
              formData={formData}
              handleChange={handleChange}
              currency={currency}
              handleCurrencyChange={handleCurrencyChange}
              setFormData={setFormData}
              inputRefs={inputRefs}
              handleKeyDown={handleKeyDown}
            />

            <AdditionalDetailsSection
              formData={formData}
              handleChange={handleChange}
              inputRefs={inputRefs}
              handleKeyDown={handleKeyDown}
              isLoading={isLoading}
              processing={processing}
              handleSubmit={handleSubmit}
            />
          </Box>

          <EmailPreview formData={formData} />
        </Grid>

        {/* Right: PDF Preview */}
        <Grid item xs={12} md={7}>
          <PDFPreview ref={pdfRef} formData={formData} />

          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                const html = pdfRef.current?.outerHTML;
                const w = window.open();
                if (w) {
                  w.document.write(html || "");
                  w.document.close();
                }
              }}
            >
              Open Preview
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}