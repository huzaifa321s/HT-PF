import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import axiosInstance from "../../src/utils/axiosInstance";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormHelperText,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
} from "@mui/material";
import {
  Person,
  Business,
  Description,
  AttachMoney,
  Info,
  CheckCircle,
  ArrowBack,
  ArrowForward,
  Save,
  EditDocument,
  ArrowBackIos,
} from "@mui/icons-material";
import UnifiedPdfEditor from "../UnifiedPDFEditor";
import { pdfDetector } from "../utils/PdfChangeDetector";
import { store } from "../utils/store";
import { pdf } from "@react-pdf/renderer";
import CombinedPdfDocument from "../CombinedPdf";
import { useDispatch, useSelector } from "react-redux";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

// ✅ Email Validation Function
const isValidEmail = (email) => {
  if (!email || email.trim() === "") return false;

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) return false;

  // ✅ Block common fake/example domains
  const blockedDomains = [
    "example.com",
    "test.com",
    "demo.com",
    "sample.com",
    "fake.com",
    "dummy.com",
    "temp.com",
    "tempmail.com",
    "throwaway.email",
    "10minutemail.com",
    "guerrillamail.com",
  ];

  const domain = email.split("@")[1]?.toLowerCase();

  if (blockedDomains.includes(domain)) {
    return false;
  }

  return true;
};

const getEmailErrorMessage = (email) => {
  if (!email || email.trim() === "") {
    return "Client email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }

  const domain = email.split("@")[1]?.toLowerCase();
  const blockedDomains = [
    "example.com",
    "test.com",
    "demo.com",
    "sample.com",
    "fake.com",
    "dummy.com",
    "temp.com",
    "tempmail.com",
    "throwaway.email",
    "10minutemail.com",
    "guerrillamail.com",
  ];

  if (blockedDomains.includes(domain)) {
    return `Cannot use ${domain}. Please provide a real email address`;
  }

  return null;
};

const EditProposal = () => {
  const { id } = useParams();
  const { reset } = useForm();
  const pdfRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [errors, setErrors] = useState({});

  const page1 = useSelector((s) => s.page1Slice.edit);
  const page2 = useSelector((s) => s.page3.edit);
  const page3 = useSelector((s) => s.page2.edit);
  const pricingPage = useSelector((s) => s.pricing.edit);
  const paymentTerms = useSelector((s) => s.paymentTerms.edit);
  const contactPage = useSelector((s) => s.contact);

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    brandName: "",
    projectTitle: "",
    businessDescription: "",
    proposedSolution: "",
    advancePercent: "",
    additionalCosts: "",
    callOutcome: "",
    yourName: "Your Name",
    yourEmail: "your@email.com",
    date: new Date().toISOString().split("T")[0],
    selectedCurrency: "",
  });

  const formDataToSave = {
    clientName: formData.clientName,
    clientEmail: formData.clientEmail,
    brandName: formData.brandName,
    projectTitle: formData.projectTitle,
    businessDescription: formData.businessDescription,
    proposedSolution: formData.proposedSolution,
    advancePercent: formData.advancePercent,
    additionalCosts: formData.additionalCosts,
    callOutcome: formData.callOutcome,
    date: formData.date,
  };
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  // Fetch proposal on mount
  useEffect(() => {
    const fetchProposal = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `/api/proposals/get-single-proposal/${id}`
        );
        const data = res.data.data;

        const updatedData = {
          clientName: data.clientName || "",
          clientEmail: data.clientEmail || "",
          brandName: data.brandName || "",
          projectTitle: data.projectTitle || "",
          businessDescription: data.businessDescription || "",
          proposedSolution: data.proposedSolution || "",
          advancePercent: data.advancePercent || "",
          additionalCosts: data.additionalCosts || "",
          callOutcome: data.callOutcome || "",
          date: data.date
            ? data.date.split("T")[0]
            : new Date().toISOString().split("T")[0],
          yourName: "Your Name",
          yourEmail: "your@email.com",
          pdfPages: data.pdfPages,
          selectedCurrency: data.selectedCurrency,
        };
        setSelectedCurrency(data.selectedCurrency);
        setFormData(updatedData);
        reset(updatedData);

        setTimeout(() => {
          pdfDetector.takeSnapshot(store);
        }, 100);
      } catch (err) {
        console.error("Error fetching proposal:", err);
        setSnackbar({
          open: true,
          message: "Failed to load proposal.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [id, reset]);

  const colorScheme = {
    primary: "#667eea",
    secondary: "#764ba2",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    hoverGradient: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
  };

  const cardStyle = {
    mb: 3,
    p: { xs: 2, sm: 3, md: 4 },
    background: "linear-gradient(135deg, #f5f7ff 0%, #f0f2ff 100%)",
    border: "2px solid #e0e7ff",
    borderRadius: 3,
    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.1)",
  };

  const inputStyle = {
    mb: 2,
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      background: "#fff",
      "&:hover": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: colorScheme.primary,
        },
      },
    },
  };

  const fieldRefs = {
    clientName: useRef(null),
    clientEmail: useRef(null),
    projectTitle: useRef(null),
    businessDescription: useRef(null),
    proposedSolution: useRef(null),
    callOutcome: useRef(null),
  };

  const stepFields = {
    0: ["clientName", "clientEmail"],
    1: ["projectTitle", "businessDescription", "proposedSolution"],
    2: [],
    3: ["callOutcome"],
  };

  const sectionHeader = (icon, title) => (
    <Box sx={{ display: "flex", alignItems: "center", mb: 3, mt: 2 }}>
      <Box
        sx={{
          p: 1.5,
          mr: 2,
          background: colorScheme.gradient,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 24, color: "#fff" } })}
      </Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          background: colorScheme.gradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {title}
      </Typography>
    </Box>
  );

  const [selectedCurrency, setSelectedCurrency] = useState();
  console.log("formData.selectedCurrency", selectedCurrency);
  const handleCurrencyChange = (event, newCurrency) => {
    if (newCurrency !== null) {
      setSelectedCurrency(newCurrency);
      // Agar form data ko update karna hai:
      formData.selectedCurrency = newCurrency;
    }
  };
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // ✅ UPDATED: Validate Step with Email Check
  const validateStep = async () => {
    const fields = stepFields[activeStep];
    const newErrors = {};

    fields.forEach((field) => {
      // ✅ Special validation for clientEmail
      if (field === "clientEmail") {
        const emailError = getEmailErrorMessage(formData[field]);
        if (emailError) {
          newErrors[field] = emailError;
        }
      } else {
        // Normal validation for other fields
        if (!formData[field] || formData[field].trim() === "") {
          newErrors[field] = `${field
            .replace(/([A-Z])/g, " $1")
            .trim()} is required`;
        }
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = fields.find((f) => newErrors[f]);
      if (fieldRefs[firstError]?.current) {
        fieldRefs[firstError].current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setTimeout(() => fieldRefs[firstError].current.focus(), 300);
      }
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleStepClick = (stepIndex) => setActiveStep(stepIndex);

  const saveWithoutPdf = async () => {
    try {
      setLoading(true);

      const hasChanges = pdfDetector.hasChanges(store);

      const dataToSend = {
        data: { ...formDataToSave, selectedCurrency },
      };

      if (hasChanges) {
        const pdfPages = {
          page1,
          page2,
          page3,
          pricingPage,
          paymentTerms,
          contactPage,
          selec,
        };
        dataToSend.pdfPages = pdfPages;
      }

      await axiosInstance.put(
        `${
          import.meta.env.VITE_APP_BASE_URL
        }api/proposals/update-proposal/${id}`,
        dataToSend
      );

      pdfDetector.takeSnapshot(store);

      setSnackbar({
        open: true,
        message: "Proposal saved successfully! (Old PDF kept)",
        severity: "success",
      });
    } catch (error) {
      console.error("Save Error:", error);
      setSnackbar({
        open: true,
        message: "Failed to save proposal.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveWithNewPdf = async () => {
    try {
      setPdfLoading(true);

      const brandName = formDataToSave?.brandName?.trim() || "Client";
      const fileName = `${brandName} Proposal.pdf`;

      const blob = await pdf(
        <CombinedPdfDocument
          paymentTerms={paymentTerms}
          pricingPage={pricingPage}
          page1Data={page1}
          page2Data={page2}
          page3Data={page3}
          contactData={contactPage}
        />
      ).toBlob();

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      const formDataUpload = new FormData();
      formDataUpload.append("pdfFile", blob, fileName);
      formDataUpload.append("proposalId", id);

      const uploadRes = await axiosInstance.post(
        `/api/proposals/upload-pdf`,
        formDataUpload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (!uploadRes.data.success) throw new Error("PDF upload failed");

      const pdfPages = {
        page1,
        page2,
        page3,
        pricingPage,
        paymentTerms,
        contactPage,
      };

      await axiosInstance.put(
        `${
          import.meta.env.VITE_APP_BASE_URL
        }api/proposals/update-proposal/${id}`,
        {
          data: { ...formDataToSave, selectedCurrency },
          pdfPages,
          pdfPath: uploadRes.data.filePath,
        }
      );

      pdfDetector.takeSnapshot(store);

      setSnackbar({
        open: true,
        message: "Proposal saved & New PDF generated successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("PDF Error:", err);
      setSnackbar({
        open: true,
        message: "PDF generation failed: " + err.message,
        severity: "error",
      });
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSubmit = async () => {
    const hasChanges = pdfDetector.hasChanges(store);

    if (!hasChanges) {
      await saveWithoutPdf();
    } else {
      await saveWithNewPdf();
    }
  };

  const isStepAccessible = (stepIndex) => {
    for (let i = 0; i < stepIndex; i++) {
      const fields = stepFields[i];
      const hasError = fields.some(
        (field) => !formData[field] || formData[field].trim() === ""
      );
      if (hasError) return false;
    }
    return true;
  };

  const steps = [
    {
      label: "Your & Client Information",
      icon: <Person />,
      content: (
        <>
          {sectionHeader(<Person />, "Your Information")}
          <TextField
            label="Your Name *"
            fullWidth
            value={formData.yourName}
            disabled
            sx={inputStyle}
          />
          <TextField
            label="Your Email *"
            fullWidth
            value={formData.yourEmail}
            disabled
            sx={inputStyle}
          />

          {sectionHeader(<Business />, "Client Information")}
          <TextField
            label="Client Name *"
            fullWidth
            value={formData.clientName}
            onChange={(e) => handleChange("clientName", e.target.value)}
            inputRef={fieldRefs.clientName}
            error={!!errors.clientName}
            helperText={errors.clientName}
            sx={inputStyle}
          />
          <TextField
            label="Client Email *"
            type="email"
            fullWidth
            value={formData.clientEmail}
            onChange={(e) => handleChange("clientEmail", e.target.value)}
            inputRef={fieldRefs.clientEmail}
            error={!!errors.clientEmail}
            helperText={errors.clientEmail}
            sx={inputStyle}
          />
        </>
      ),
    },
    {
      label: "Project Details",
      icon: <Description />,
      content: (
        <>
          {sectionHeader(<Description />, "Project Details")}
          <TextField
            label="Brand Name"
            fullWidth
            value={formData.brandName}
            onChange={(e) => handleChange("brandName", e.target.value)}
            sx={inputStyle}
          />
          <TextField
            label="Project Title *"
            fullWidth
            value={formData.projectTitle}
            onChange={(e) => handleChange("projectTitle", e.target.value)}
            inputRef={fieldRefs.projectTitle}
            error={!!errors.projectTitle}
            helperText={errors.projectTitle}
            sx={inputStyle}
          />
          <TextField
            label="Business Description *"
            multiline
            rows={3}
            fullWidth
            value={formData.businessDescription}
            onChange={(e) =>
              handleChange("businessDescription", e.target.value)
            }
            inputRef={fieldRefs.businessDescription}
            error={!!errors.businessDescription}
            helperText={errors.businessDescription}
            sx={inputStyle}
          />
          <TextField
            label="Proposed Solution *"
            multiline
            rows={3}
            fullWidth
            value={formData.proposedSolution}
            onChange={(e) => handleChange("proposedSolution", e.target.value)}
            inputRef={fieldRefs.proposedSolution}
            error={!!errors.proposedSolution}
            helperText={errors.proposedSolution}
            sx={inputStyle}
          />
        </>
      ),
    },
    {
      label: "Costs",
      icon: <AttachMoney />,
      content: (
        <>
          {sectionHeader(<AttachMoney />, "Costs")}
          {/* Currency Toggle - 5 Currencies */}
          <Box sx={{ mb: 4, display: "flex", justifyContent: "start" }}>
            <ToggleButtonGroup
              value={selectedCurrency}
              exclusive
              onChange={handleCurrencyChange}
              aria-label="currency selection"
              sx={{
                gap: 1,
                flexWrap: "wrap",
                "& .MuiToggleButton-root": {
                  px: { xs: 1.5, sm: 2 },
                  py: 0.5,
                  fontSize: { xs: "0.4rem", sm: "0.6rem" },
                  fontWeight: 700,
                  border: "2px solid",
                  borderColor: colorScheme.primary,
                  borderRadius: 3,
                  minWidth: 90,
                  "&.Mui-selected": {
                    background: colorScheme.gradient,
                    color: "#fff",
                    "&:hover": {
                      background: colorScheme.hoverGradient,
                    },
                  },
                  "&:hover": {
                    background: `${colorScheme.primary}15`,
                  },
                },
              }}
            >
              <ToggleButton value="USD">
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Typography sx={{ fontSize: "1.4rem" }}>$</Typography>
                  <Typography>USD</Typography>
                </Box>
              </ToggleButton>

              <ToggleButton value="PKR">
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Typography sx={{ fontSize: "1.4rem" }}>₨</Typography>
                  <Typography>PKR</Typography>
                </Box>
              </ToggleButton>
              <ToggleButton value="GBP">
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Typography sx={{ fontSize: "1.4rem" }}>£</Typography>
                  <Typography>GBP</Typography>
                </Box>
              </ToggleButton>

              <ToggleButton value="EUR">
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Typography sx={{ fontSize: "1.4rem" }}>€</Typography>
                  <Typography>EUR</Typography>
                </Box>
              </ToggleButton>

              <ToggleButton value="AED">
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Typography sx={{ fontSize: "1.3rem", fontWeight: 800 }}>
                    د.إ
                  </Typography>
                  <Typography>AED</Typography>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <TextField
            label="Advance Percentage"
            type="number"
            fullWidth
            value={formData.advancePercent}
            onChange={(e) => {
              // Only allow numbers
              const numericValue = e.target.value.replace(/[^0-9]/g, "");
              // Limit to 100
              const limitedValue = numericValue
                ? Math.min(parseInt(numericValue), 100).toString()
                : "";

              handleChange("advancePercent", limitedValue);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography
                    sx={{ fontWeight: 600, color: colorScheme.primary }}
                  >
                    %
                  </Typography>
                </InputAdornment>
              ),
              endAdornment: formData.advancePercent && (
                <InputAdornment position="end">
                  <Typography variant="caption" sx={{ color: "#999" }}>
                    / 100
                  </Typography>
                </InputAdornment>
              ),
            }}
            placeholder="Enter percentage (e.g., 50)"
            sx={{
              ...inputStyle,
              "& input:-webkit-autofill": {
                WebkitBoxShadow: "0 0 0 100px #fff inset !important",
                WebkitTextFillColor: "#000 !important",
                caretColor: "#000",
              },
              "& .MuiInputBase-root": {
                backgroundColor: "#fff !important",
              },
            }}
          />
          <TextField
            label={`Additional Costs (${selectedCurrency})`}
            type="text"
            fullWidth
            value={formData.additionalCosts}
            onChange={(e) => {
              const numericValue = e.target.value.replace(/[^0-9]/g, "");

              handleChange("additionalCosts", numericValue);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "1.4rem",
                      color: colorScheme.primary,
                    }}
                  >
                    {selectedCurrency === "USD" && "$"}
                    {selectedCurrency === "GBP" && "£"}
                    {selectedCurrency === "EUR" && "€"}
                    {selectedCurrency === "AED" && "د.إ"}
                    {selectedCurrency === "PKR" && "₨"}
                  </Typography>
                </InputAdornment>
              ),
              endAdornment: formData.additionalCosts && (
                <InputAdornment position="end">
                  <Typography
                    variant="caption"
                    sx={{
                      color: colorScheme.primary,
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatNumberInWords(value, selectedCurrency)}
                  </Typography>
                </InputAdornment>
              ),
            }}
            placeholder={`Enter amount in ${selectedCurrency}`}
            sx={inputStyle}
          />
        </>
      ),
    },
    {
      label: "Additional Details",
      icon: <Info />,
      content: (
        <>
          {sectionHeader(<Info />, "Additional Details")}
          <FormControl fullWidth error={!!errors.callOutcome} sx={inputStyle}>
            <InputLabel>Call Outcome *</InputLabel>
            <Select
              value={formData.callOutcome}
              onChange={(e) => handleChange("callOutcome", e.target.value)}
              label="Call Outcome *"
            >
              <MenuItem value="Interested">Interested</MenuItem>
              <MenuItem value="No Fit">No Fit</MenuItem>
              <MenuItem value="Flaked">Flaked</MenuItem>
              <MenuItem value="Follow-up">Follow-up</MenuItem>
            </Select>
            {errors.callOutcome && (
              <FormHelperText>{errors.callOutcome}</FormHelperText>
            )}
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date"
              value={formData.date ? dayjs(formData.date) : dayjs()} // ✅ Convert string back to dayjs for display
              onChange={(newValue) => {
                // ✅ Convert dayjs to string before saving to form
                const formattedDate = newValue
                  ? newValue.format("YYYY-MM-DD")
                  : "";
                // onChange(formattedDate);
                handleChange("date", formattedDate);
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  InputLabelProps: {
                    shrink: true,
                  },
                  sx: {
                    height: 56,
                    width: "100%",
                    fontSize: "1rem",
                    fontWeight: 600,
                    background: "#ffffff",
                    borderRadius: 2,
                    mb: 2,
                    "& .MuiInputBase-root": {
                      height: 56,
                    },
                  },
                },
              }}
            />
            {/* <TextField
            type="date"
            label="Date"
            fullWidth
            value={formData.date}
            disabled
            InputLabelProps={{ shrink: true }}
            sx={inputStyle}
          /> */}
          </LocalizationProvider>
        </>
      ),
    },
    {
      label: "PDF Review",
      icon: <EditDocument />,
      content: (
        <>
          {sectionHeader(<EditDocument />, "PDF Review")}
          <UnifiedPdfEditor pdfPages={formData?.pdfPages} mode="edit-doc" />
        </>
      ),
    },
  ];
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        bgcolor: "#f5f7fa",
        minHeight: "100vh",
        py: 6,
        width: "100vw",
        position: "relative",
        left: "50%",
        right: "50%",
        ml: "-50vw",
        mr: "-50vw",
      }}
    >
      <Box sx={{ maxWidth: 1800, margin: "0 auto", px: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 5,
            px: { xs: 2, sm: 3 },
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          <Button
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIos />}
            sx={{
              color: "text.primary",
              fontWeight: 600,
              textTransform: "none",
              fontSize: "1rem",
              py: 1,
              px: 3,
              borderRadius: 3,
              minWidth: "auto",
              bgcolor: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(0,0,0,0.1)",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.95)",
                transform: "translateX(-4px)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              },
            }}
          >
            Back
          </Button>

          <Typography
            variant="h4"
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontWeight: 800,
              fontSize: { xs: "1.8rem", sm: "2.2rem" },
              background: colorScheme.gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            Edit Proposal
          </Typography>

          <Box sx={{ width: { xs: 100, sm: 120 }, height: 40 }} />
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 10 }}>
            <CircularProgress size={60} thickness={5} />
          </Box>
        ) : (
          <>
            <Stepper
              activeStep={activeStep}
              orientation="horizontal"
              sx={{
                mb: 4,
                display: "flex",
                flexWrap: "wrap",
                justifyContent:
                  steps.length % 2 !== 0 ? "center" : "flex-start",
              }}
            >
              {steps.map((step, index) => (
                <Step
                  key={step.label}
                  sx={{
                    mb: 3,
                    width: index === steps.length - 1 ? "100%" : "50%",
                    minWidth: index === steps.length - 1 ? "none" : "300px",
                  }}
                >
                  <StepLabel
                    onClick={() =>
                      isStepAccessible(index) && handleStepClick(index)
                    }
                    sx={{
                      cursor: "pointer",
                      "& .MuiStepLabel-label": {
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        color:
                          activeStep === index
                            ? colorScheme.primary
                            : "text.secondary",
                      },
                    }}
                    icon={
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background:
                            activeStep >= index
                              ? colorScheme.gradient
                              : "#e0e0e0",
                          color: activeStep >= index ? "#fff" : "#999",
                        }}
                      >
                        {activeStep > index ? <CheckCircle /> : step.icon}
                      </Box>
                    }
                  >
                    {step.label}
                  </StepLabel>
                  <StepContent>
                    <Card sx={cardStyle}>
                      <CardContent>{step.content}</CardContent>
                      <Box
                        sx={{
                          mt: 3,
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Button
                          disabled={activeStep === 0}
                          onClick={handleBack}
                          startIcon={<ArrowBack />}
                          variant="outlined"
                          sx={{ borderRadius: 10 }}
                        >
                          Back
                        </Button>
                        {index < steps.length - 1 && (
                          <Button
                            onClick={handleNext}
                            endIcon={<ArrowForward />}
                            variant="contained"
                            sx={{
                              background: colorScheme.gradient,
                              borderRadius: 10,
                            }}
                          >
                            Next
                          </Button>
                        )}
                      </Box>
                    </Card>
                  </StepContent>
                </Step>
              ))}
            </Stepper>

            <Box
              sx={{ display: "flex", justifyContent: "center", mt: 6, mb: 4 }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<Save />}
                onClick={handleSubmit}
                disabled={loading || pdfLoading}
                sx={{
                  px: 6,
                  py: 2,
                  borderRadius: 4,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  boxShadow: 6,
                  background: colorScheme.gradient,
                  "&:hover": { background: colorScheme.hoverGradient },
                }}
              >
                {loading || pdfLoading ? "Saving..." : "Save Proposal"}
              </Button>
            </Box>
          </>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditProposal;
