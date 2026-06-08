"use client";
import { useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Box, Grid, Paper, Button } from "@mui/material";
import { showToast } from "../../utils/toastSlice";
import axios from "axios";
import { io } from "socket.io-client";
import html2canvas from "html2canvas-pro";
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
  const dispatch = useDispatch();
  const pdfRef = useRef();
  const inputRefs = useRef([]);
  const [isLoading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const TOTAL_INPUTS = 40;

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    projectTitle: "React-Based E-Commerce Website",
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
        const res = await axiosInstance.get(`/api/get-creds`);
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
    const evtSource = new EventSource(`/api/transcribe/sse`);

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
      // Ensure all custom fonts are completely loaded before capturing
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const res = await axiosInstance.post(
        `/api/proposals/create-proposal`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      const targetElement = pdfRef.current;
      const PAGE_PX_WIDTH = 800; // Expected desktop width

      // STEP 1: Convert all <img> tags to base64 so html2canvas gets inline data.
      const { convertImagesToBase64, restoreOriginalImages } = await import("../../utils/imageToBase64");
      const originalSources = await convertImagesToBase64(targetElement);

      // STEP 2: Pre-fetch ALL Cloudinary URLs as base64 data URLs BEFORE html2canvas runs.
      // html2canvas clones the DOM into a hidden iframe and independently re-fetches every
      // CSS background-image from the network. That refetch races against rendering, causing blank images.
      // By converting to data URLs here, we swap every background-image url(https://...) with url(data:...)
      // in onclone so html2canvas never makes a network request.
      const pdfImageAssets = await import("../../utils/pdfImageAssets");
      const cloudinaryUrls = Object.values(pdfImageAssets).filter(
        val => typeof val === "string" && val.startsWith("http")
      );
      const urlToDataUrl = {};
      await Promise.all(
        cloudinaryUrls.map(async (src) => {
          try {
            const res = await fetch(src, { cache: "force-cache" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const blob = await res.blob();
            const dataUrl = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            urlToDataUrl[src] = dataUrl;
          } catch (e) {
            console.warn("[PDF] Failed to pre-fetch image as base64:", src, e.message);
          }
        })
      );

      let canvas;
      try {
        canvas = await html2canvas(targetElement, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          scrollY: -window.scrollY,
          backgroundColor: "#ffffff",
          logging: false,
          imageTimeout: 0,
          onclone: (clonedDoc) => {
            const clonedBody = clonedDoc.body;
            clonedBody.style.width = `${PAGE_PX_WIDTH}px`;
            clonedBody.style.minWidth = `${PAGE_PX_WIDTH}px`;

            // CRITICAL: Replace every CSS background-image Cloudinary URL with a data URL
            // so html2canvas never makes a network request inside the iframe.
            if (Object.keys(urlToDataUrl).length > 0) {
              const allEls = clonedDoc.querySelectorAll("*");
              allEls.forEach((el) => {
                const bg = el.style.backgroundImage;
                if (bg && bg.includes("res.cloudinary.com")) {
                  let newBg = bg;
                  Object.entries(urlToDataUrl).forEach(([cloudUrl, dataUrl]) => {
                    if (newBg.includes(cloudUrl)) {
                      newBg = newBg.replace(cloudUrl, dataUrl);
                    }
                  });
                  el.style.backgroundImage = newBg;
                }
              });
            }
          }
        });
      } finally {
        restoreOriginalImages(originalSources);
      }

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
        dispatch(showToast({ message: "✅ Proposal created successfully!", severity: "success" }));
      } else {
        dispatch(showToast({ message: "⚠️ Failed to create proposal. Please try again.", severity: "warning" }));
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
      dispatch(showToast({ message: "PDF generated successfully!", severity: "success" }));
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

      {/* Toast notifications handled globally by GlobalToast via Redux */}
    </Box>
  );
}