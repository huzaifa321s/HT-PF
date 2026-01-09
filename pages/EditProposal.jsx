import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import axiosInstance from "../utils/axiosInstance";
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
import { Controller } from "react-hook-form";
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
import { useDispatch, useSelector, Provider } from "react-redux";
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
    return null;
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
  const { reset, control, trigger, formState: { errors: hookErrors } } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const pdfRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

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
  const [baseCost, setBaseCost] = useState("");
  const [existingProposalId, setExistingProposalId] = useState(null); // Added state for existing proposal
  const [existingProposalOwner, setExistingProposalOwner] = useState(null); // Added state for ownership check
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

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
        setBaseCost(data.additionalCosts || "");
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
    p: { xs: 1, sm: 3, md: 4 },
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
    0: ["clientName", "clientEmail"], // Added clientEmail as required
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

  // Format number in words function for currency display
  const formatNumberInWords = (value, currency) => {
    if (!value) return "";

    const number = parseInt(value.toString().replace(/[^0-9]/g, ""), 10);
    if (isNaN(number) || number === 0) return "";

    // Common formatting for USD, GBP, EUR, AED
    if (["USD", "GBP", "EUR", "AED"].includes(currency)) {
      if (number >= 1000000000) {
        return `${(number / 1000000000).toFixed(2)}B`;
      } else if (number >= 1000000) {
        return `${(number / 1000000).toFixed(2)}M`;
      } else if (number >= 1000) {
        return `${(number / 1000).toFixed(2)}K`;
      }
      return number.toLocaleString();
    }

    // PKR - Lakh & Crore
    if (currency === "PKR") {
      if (number >= 10000000) {
        return `${(number / 10000000).toFixed(2)} Crore`;
      } else if (number >= 100000) {
        return `${(number / 100000).toFixed(2)} Lakh`;
      } else if (number >= 1000) {
        return `${(number / 1000).toFixed(2)}K`;
      }
      return number.toLocaleString();
    }

    return number.toLocaleString();
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ UPDATED: Validate Step with Email Check
  const validateStep = async () => {
    const fields = stepFields[activeStep];

    // Use react-hook-form trigger for fields in this step
    const isValid = await trigger(fields);

    if (!isValid) {
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
          selectedCurrency,
        };
        dataToSend.pdfPages = pdfPages;
      }

      await axiosInstance.put(
        `${import.meta.env.VITE_APP_BASE_URL}api/proposals/update-proposal/${id}`,
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
        <Provider store={store}>
          <CombinedPdfDocument
            paymentTerms={paymentTerms || {}}
            pricingPage={pricingPage || {}}
            page1Data={page1 || {}}
            page2Data={page2 || {}}
            page3Data={page3 || {}}
            contactData={contactPage || {}}
            clientName={formData.clientName}
            date={formData.date}
          />
        </Provider>
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
        `${import.meta.env.VITE_APP_BASE_URL}api/proposals/update-proposal/${id}`,
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
          <Controller
            name="clientName"
            control={control}
            rules={{ required: "Client Name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Client Name *"
                fullWidth
                inputRef={fieldRefs.clientName}
                error={!!hookErrors.clientName}
                helperText={hookErrors.clientName?.message}
                sx={inputStyle}
                onChange={(e) => {
                  field.onChange(e);
                  handleChange("clientName", e.target.value);
                }}
              />
            )}
          />
          <Controller
            name="clientEmail"
            control={control}
            rules={{
              required: "Client email is required",
              validate: {
                isValid: (value) => getEmailErrorMessage(value) === null || getEmailErrorMessage(value),
                checkUniqueness: async (value) => {
                  if (!value) return true;
                  try {
                    const res = await axiosInstance.get("/api/proposals/check-email", {
                      params: { email: value, excludeId: id },
                    });
                    if (res.data?.success && res.data.exists) {
                      setExistingProposalId(res.data.proposalId);
                      setExistingProposalOwner(res.data.createdBy);
                      return "client is already exists with this email";
                    }
                    setExistingProposalId(null);
                    setExistingProposalOwner(null);
                    return true;
                  } catch (err) {
                    return true;
                  }
                }
              }
            }}
            render={({ field }) => (
              <Box>
                <TextField
                  {...field}
                  label="Client Email *"
                  type="email"
                  fullWidth
                  inputRef={fieldRefs.clientEmail}
                  error={!!hookErrors.clientEmail}
                  helperText={hookErrors.clientEmail?.message}
                  sx={inputStyle}
                  onChange={(e) => {
                    field.onChange(e);
                    handleChange("clientEmail", e.target.value);
                    if (existingProposalId) setExistingProposalId(null);
                  }}
                />
                {hookErrors.clientEmail?.message === "client is already exists with this email" &&
                  existingProposalId &&
                  (user.role === "admin" ||
                    user._id === existingProposalOwner) && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<EditDocument />}
                      onClick={() =>
                        navigate(`/admin/proposals/${existingProposalId}`)
                      }
                      sx={{
                        mt: -1,
                        mb: 2,
                        background: colorScheme.gradient,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                          background: colorScheme.hoverGradient,
                        },
                      }}
                    >
                      View Client
                    </Button>
                  )}
              </Box>
            )}
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
          <Controller
            name="brandName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Brand Name"
                fullWidth
                sx={inputStyle}
                onChange={(e) => {
                  field.onChange(e);
                  handleChange("brandName", e.target.value);
                }}
              />
            )}
          />
          <Controller
            name="projectTitle"
            control={control}
            rules={{ required: "Project title is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Project Title *"
                fullWidth
                inputRef={fieldRefs.projectTitle}
                error={!!hookErrors.projectTitle}
                helperText={hookErrors.projectTitle?.message}
                sx={inputStyle}
                onChange={(e) => {
                  field.onChange(e);
                  handleChange("projectTitle", e.target.value);
                }}
              />
            )}
          />
          <Controller
            name="businessDescription"
            control={control}
            rules={{ required: "Business description is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Business Description *"
                multiline
                rows={3}
                fullWidth
                inputRef={fieldRefs.businessDescription}
                error={!!hookErrors.businessDescription}
                helperText={hookErrors.businessDescription?.message}
                sx={inputStyle}
                onChange={(e) => {
                  field.onChange(e);
                  handleChange("businessDescription", e.target.value);
                }}
              />
            )}
          />
          <Controller
            name="proposedSolution"
            control={control}
            rules={{ required: "Proposed solution is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Proposed Solution *"
                multiline
                rows={3}
                fullWidth
                inputRef={fieldRefs.proposedSolution}
                error={!!hookErrors.proposedSolution}
                helperText={hookErrors.proposedSolution?.message}
                sx={inputStyle}
                onChange={(e) => {
                  field.onChange(e);
                  handleChange("proposedSolution", e.target.value);
                }}
              />
            )}
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
              size="small"
              sx={{
                gap: { xs: 0.5, sm: 1 },
                flexWrap: "wrap",
                "& .MuiToggleButton-root": {
                  px: { xs: 1, sm: 2 },
                  py: { xs: 0.3, sm: 0.5 },
                  fontSize: { xs: "0.7rem", sm: "0.9rem" },
                  fontWeight: 700,
                  border: "2px solid",
                  borderColor: colorScheme.primary,
                  borderRadius: 3,
                  minWidth: { xs: 60, sm: 90 },
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
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.4, sm: 0.8 } }}>
                  <Typography sx={{ fontSize: { xs: "1rem", sm: "1.4rem" } }}>$</Typography>
                  <Typography>USD</Typography>
                </Box>
              </ToggleButton>

              <ToggleButton value="PKR">
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.4, sm: 0.8 } }}>
                  <Typography sx={{ fontSize: { xs: "1rem", sm: "1.4rem" } }}>₨</Typography>
                  <Typography>PKR</Typography>
                </Box>
              </ToggleButton>
              <ToggleButton value="GBP">
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.4, sm: 0.8 } }}>
                  <Typography sx={{ fontSize: { xs: "1rem", sm: "1.4rem" } }}>£</Typography>
                  <Typography>GBP</Typography>
                </Box>
              </ToggleButton>

              <ToggleButton value="EUR">
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.4, sm: 0.8 } }}>
                  <Typography sx={{ fontSize: { xs: "1rem", sm: "1.4rem" } }}>€</Typography>
                  <Typography>EUR</Typography>
                </Box>
              </ToggleButton>

              <ToggleButton value="AED">
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.4, sm: 0.8 } }}>
                  <Typography sx={{ fontSize: { xs: "1rem", sm: "1.3rem" }, fontWeight: 800 }}>
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

              // Auto-calculate cost based on advance percentage
              const advance = parseFloat(limitedValue) || 0;
              if (baseCost) {
                const base = parseFloat(baseCost) || 0;
                const discounted = base * (1 - advance / 100);
                handleChange("additionalCosts", Math.round(discounted).toString());
              }
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
            label={`Cost (${selectedCurrency})`}
            type="text"
            fullWidth
            value={formData.additionalCosts}
            onChange={(e) => {
              const numericValue = e.target.value.replace(/[^0-9]/g, "");
              setBaseCost(numericValue); // Store original cost

              const advance = parseFloat(formData.advancePercent) || 0;
              const discounted = parseFloat(numericValue) * (1 - advance / 100);
              handleChange("additionalCosts", Math.round(discounted || 0).toString());
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
                    {formatNumberInWords(formData.additionalCosts, selectedCurrency)}
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
          <FormControl fullWidth error={!!hookErrors.callOutcome} sx={inputStyle}>
            <InputLabel>Call Outcome *</InputLabel>
            <Controller
              name="callOutcome"
              control={control}
              rules={{ required: "Call outcome is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Call Outcome *"
                  inputRef={fieldRefs.callOutcome}
                  onChange={(e) => {
                    field.onChange(e);
                    handleChange("callOutcome", e.target.value);
                  }}
                >
                  <MenuItem value="Interested">Interested</MenuItem>
                  <MenuItem value="No Fit">No Fit</MenuItem>
                  <MenuItem value="Flaked">Flaked</MenuItem>
                  <MenuItem value="Follow-up">Follow-up</MenuItem>
                </Select>
              )}
            />
            {hookErrors.callOutcome && (
              <FormHelperText>{hookErrors.callOutcome?.message}</FormHelperText>
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
          </LocalizationProvider>
        </>
      ),
    },
    {
      label: "PDF Review",
      icon: <EditDocument />,
      content: (
        <Box sx={{ mx: { xs: -1, sm: 0 }, px: { xs: 0, sm: 0 } }}>
          {sectionHeader(<EditDocument />, "PDF Review")}
          <UnifiedPdfEditor
            pdfPages={formData?.pdfPages}
            mode="edit-doc"
            clientName={formData.clientName}
            date={formData.date}
          />
        </Box>
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
              fontSize: 14,
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
              textAlign: 'center',
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
              orientation="vertical"
              sx={{
                mb: 4,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center"
              }}
            >
              {steps.map((step, index) => (
                <Step
                  key={step.label}
                  sx={{
                    mb: 3,
                    width: "100%",
                    minWidth: "300px",
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
              sx={{ display: "flex", justifyContent: "center", mt: 6, mb: 4, px: { xs: 2, sm: 0 } }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<Save />}
                onClick={handleSubmit}
                disabled={loading || pdfLoading}
                sx={{
                  px: { xs: 3, sm: 6 },
                  py: { xs: 1.5, sm: 2 },
                  borderRadius: 4,
                  fontSize: { xs: "0.9rem", sm: "1.1rem" },
                  fontWeight: 700,
                  boxShadow: 6,
                  background: colorScheme.gradient,
                  width: { xs: "100%", sm: "auto" },
                  maxWidth: { xs: "300px", sm: "none" },
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
