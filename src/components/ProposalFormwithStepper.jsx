"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CardContent,
  Chip,
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  LinearProgress,
  ToggleButtonGroup,
  ToggleButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Switch,
  Card,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  useMediaQuery,
} from "@mui/material";
import {
  Info,
  DeblurOutlined,
  Timeline,
  CheckCircle,
  Send,
  CalendarMonth,
  ExpandMore,
  Add,
  ArrowBack,
  ArrowForward,
  Person,
  Business,
  Code,
  AttachMoney,
  Description,
  Preview,
  Download,
  Delete,
  Money,
  Payment,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";
import { pdf } from "@react-pdf/renderer";
import ProposalDocument from "./pdf/ProposalDocument";
import dayjs from "dayjs";
import UnifiedPdfEditor from "./UnifiedPDFEditor";
import { useDispatch, useSelector } from "react-redux";
import {
  addCustomPlatform,
  addService,
  removeService,
  updateCharges,
  updateField,
  updateServices,
} from "../utils/proposalSlice";
import axiosInstance from "../utils/axiosInstance";
import { addSection, updateSection, replacePage2Content } from "../utils/page2Slice";
import { setBrandName } from "../utils/page1Slice";
import { updateTitle } from "../utils/page3Slice";
import { useDebounce } from "use-debounce";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { store } from "../utils/store";
import { showToast } from "../utils/toastSlice";
import { motion, AnimatePresence } from "framer-motion";

const ProposalFormWithStepper = ({
  control,
  errors,
  watch,
  handleSubmit,
  register,
  handleSubmitForm,
  isLoading,
  trigger,
  setValue,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [creds, setCreds] = useState({ yourName: "", yourEmail: "" });
  const [baseCost, setBaseCost] = useState(watch("additionalCosts") || "");
  const [autoApplyAdvance, setAutoApplyAdvance] = useState(false);
  const [existingProposalId, setExistingProposalId] = useState(null); // Added state for existing proposal
  const [existingProposalOwner, setExistingProposalOwner] = useState(null); // Added state for ownership check
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [existingProposalsCount, setExistingProposalsCount] = useState(0); // Added for multiple proposals limit
  const [limitExceeded, setLimitExceeded] = useState(false); // Added for multiple proposals limit
  const existingProposalRef = useRef({ id: null, owner: null }); // Backup ref to survive React 18 strict mode state-loss
  const dispatch = useDispatch();
  const router = useRouter(); // Initialize navigate

  const userStr = typeof window !== "undefined" ? sessionStorage.getItem("user") : null;
  const user = userStr ? JSON.parse(userStr) : {};
  const clientEmailValue = watch("clientEmail");
  const [debouncedClientEmail] = useDebounce(clientEmailValue, 600);

  // ✅ Refs for all required fields
  const fieldRefs = {
    clientName: useRef(null),
    clientEmail: useRef(null),
    brandName: useRef(null),
    projectTitle: useRef(null),
  };
  // ✅ Step-wise required fields
  const stepFields = {
    0: ["clientName", "clientEmail"],
    1: ["brandName", "projectTitle"],
    2: [],
    3: [],
    4: [],
  };

  // ✅ Scroll to first error field
  const onInvalid = (errors) => {
    console.log("Validation errors:", errors);
    const firstField = Object.keys(errors)[0];

    if (fieldRefs[firstField]?.current) {
      fieldRefs[firstField].current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // Focus after scroll
      setTimeout(() => {
        fieldRefs[firstField].current.focus();
      }, 300);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/api/get-creds");

        if (res.data?.success && res.data.data) {
          const { name, email } = res.data.data;
          setCreds({ yourName: name, yourEmail: email });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const email =
      typeof debouncedClientEmail === "string"
        ? debouncedClientEmail.trim()
        : "";
    if (!email) return;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return;

    // Use a small timeout to ensure the field is registered before triggering validation
    const timer = setTimeout(() => {
      trigger("clientEmail");
    }, 200);

    return () => clearTimeout(timer);
  }, [debouncedClientEmail, trigger]);

  // Color scheme matching Generate PDF button
  const colorScheme = {
    primary: "#f3a833",
    secondary: "#f59e0b",
    accent: "#f3a833",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#f44336",
    gradient: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
    brandGradient: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
    hoverGradient: "linear-gradient(135deg, #eab308 0%, #d97706 100%)",
    brandHoverGradient: "linear-gradient(135deg, #eab308 0%, #d97706 100%)",
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 },
    },
  };
  const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };
  const sectionVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };
  const listItemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  const cardStyle = {
    mb: 3,
    p: { xs: 0, sm: 3, md: 4 },
    background: "#0a0a0a",
    border: "1px solid rgba(243, 168, 51, 0.2)",
    borderRadius: 3,
    boxShadow: "0 4px 20px rgba(243, 168, 51, 0.1)",
  };

  const inputStyle = {
    mb: 2,
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      background: "#141414",
      "&:hover": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: colorScheme.primary,
        },
      },
    },
  };

  const sectionHeader = (icon, title) => (
    <Box component={motion.div} variants={sectionVariants} initial="hidden" animate="visible" sx={{ display: "flex", alignItems: "center", mb: 3, mt: 2 }}>
      <Box
        component={motion.div}
        sx={{
          p: 1.5,
          mr: 2,
          background: colorScheme.gradient,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {React.cloneElement(icon, {
          sx: { fontSize: 12, color: "#fff" },
        })}
      </Box>
      <Typography
        component={motion.div}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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

  const handleSubmitData = async (data) => {
    const submitData = { ...data };
    if (submitData.projectCategory === "Other" && submitData.customProjectCategory) {
      submitData.projectCategory = submitData.customProjectCategory;
    }
    console.log("Form data submitted:", submitData);
    console.log("selected", selectedCurrency);
    dispatch(updateField({ field: "clientName", value: data.clientName }));
    dispatch(updateField({ field: "clientEmail", value: data.clientEmail }));
    dispatch(updateField({ field: "brandName", value: data.brandName }));

    await handleSubmitForm(submitData, selectedCurrency);
  };

  const handleGenerateAI = async () => {
    const brief = watch("projectBrief");
    if (!brief || brief.trim() === "") {
      dispatch(showToast({ message: "Please enter a Project Brief first.", severity: "error" }));
      return;
    }
    
    setIsGeneratingAI(true);
    try {
      const response = await axiosInstance.post('api/ai/generate-proposal', {
        projectBrief: brief,
        companyName: "Humantek"
      });

      const data = response.data;
      if (data && data.sections && data.tables) {
        dispatch(replacePage2Content(data));
        dispatch(showToast({ message: "Proposal content generated successfully!", severity: "success" }));
        handleNext(); // Move to the next step
      } else {
        throw new Error("Invalid format received from AI.");
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      dispatch(showToast({ message: "Failed to generate proposal using AI.", severity: "error" }));
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // ✅ Check if a step is accessible
  const isStepAccessible = (stepIndex) => {
    if (stepIndex > 0 && errors?.clientEmail) return false;
    if (stepIndex > 0 && limitExceeded) return false;

    // Current step ya pehle ke steps accessible hain
    for (let i = 0; i < stepIndex; i++) {
      const fields = stepFields[i];
      // Agar koi bhi field empty hai previous step mein
      const hasError = fields.some((field) => {
        const value = watch(field); // react-hook-form se value lao
        const isEmpty =
          value === undefined ||
          value === null ||
          (typeof value === "string" && value.trim() === "");
        return isEmpty || !!errors?.[field];
      });
      if (hasError) return false;
    }
    return true;
  };

  const handleStepClick = (stepIndex) => {
    // ✅ Sirf accessible steps par hi click ho
    if (isStepAccessible(stepIndex)) {
      setActiveStep(stepIndex);
    }
  };

  const handleFieldChange = (fieldName, field, e) => {
    field.onChange(e); // Update value
    if (errors[fieldName] && e.target.value.trim()) {
    }
  };
  const isSmall = useMediaQuery("(max-width:1325px)");
  // Add this state at the top of your component
  const formatNumberDisplay = (value) => {
    if (!value) return "";
    const number = value.toString().replace(/[^0-9]/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  // Updated formatNumberInWords function jo teeno currencies ko handle kare
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

  // Add this state at the top of your component
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  // Add this handler function
  const handleCurrencyChange = (event, newCurrency) => {
    if (newCurrency !== null) {
      setSelectedCurrency(newCurrency);
    }
  };
  const steps = [
    {
      label: "Your & Client Information",
      icon: <Person />,
      content: (
        <>
          {/* YOUR INFORMATION */}
          {sectionHeader(<Person />, "Your Information")}
          <Box component={motion.div} variants={fieldVariants}>
            <Controller
              name="yourName"
              control={control}
              rules={{ required: "Your name is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Your Name *"
                  fullWidth
                  value={creds.yourName}
                  error={!!errors.yourName}
                  helperText={errors.yourName?.message}
                  disabled
                  sx={inputStyle}
                />
              )}
            />
          </Box>
          <Box component={motion.div} variants={fieldVariants}>
            <Controller
              name="yourEmail"
              control={control}
              rules={{
                required: "Your email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Your Email *"
                  fullWidth
                  value={creds.yourEmail}
                  error={!!errors.yourEmail}
                  helperText={errors.yourEmail?.message}
                  disabled
                  sx={inputStyle}
                />
              )}
            />
          </Box>

          {/* CLIENT INFORMATION */}
          {sectionHeader(<Business />, "Client Information")}
          <Box component={motion.div} variants={fieldVariants}>
            <Controller
              name="clientName"
              control={control}
              rules={{ required: "Client name is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Client Name *"
                  fullWidth
                  error={!!errors.clientName}
                  helperText={errors.clientName?.message}
                  inputRef={fieldRefs.clientName}
                  sx={inputStyle}
                  onChange={(e) => handleFieldChange("clientName", field, e)}
                />
              )}
            />
          </Box>
          <Box component={motion.div} variants={fieldVariants}>
            <Controller
              name="clientEmail"
              control={control}
              rules={{
                required: "Client email is required", // Made required
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Please enter a valid email address",
                },
                validate: {
                  checkUniqueness: async (value) => {
                    if (!value) return true;
                    try {
                      const res = await axiosInstance.get("/api/proposals/check-email", {
                        params: { email: value },
                      });
                      if (res.data?.success && res.data.exists) {
                        setExistingProposalsCount(res.data.count);
                        setLimitExceeded(res.data.limitExceeded);
                        setExistingProposalId(res.data.proposalId); // legacy
                        setExistingProposalOwner(res.data.createdBy); // legacy
                        existingProposalRef.current = { id: res.data.proposalId, owner: res.data.createdBy };

                        if (res.data.limitExceeded) {
                          return "Limit exceeded: Max 5 proposals allowed for this client email";
                        }
                      } else {
                        setExistingProposalsCount(0);
                        setLimitExceeded(false);
                        setExistingProposalId(null);
                        setExistingProposalOwner(null);
                        existingProposalRef.current = { id: null, owner: null };
                      }
                      return true;
                    } catch (err) {
                      console.error("Error checking uniqueness:", err);
                      return true; // Proceed if API fails
                    }
                  },
                  // ✅ Check for valid email domains
                  validDomain: (value) => {
                    if (!value) return true;
                    const domain = value.split("@")[1];
                    if (!domain || domain.length < 3) {
                      return "Email must have a valid domain";
                    }

                    // ✅ Check if domain has proper extension (.com, .net, etc)
                    const hasDot = domain.includes(".");
                    if (!hasDot) {
                      return "Email must include a valid domain (e.g., gmail.com)";
                    }

                    // ✅ Check for common invalid patterns
                    if (
                      domain === "abc" ||
                      domain === "example.com" ||
                      domain === "test.com"
                    ) {
                      return "Please enter a real email address";
                    }

                    return true;
                  },

                  trustedDomain: (value) => {
                    if (!value) return true;
                    const trustedDomains = [
                      "gmail.com",
                      "yahoo.com",
                      "outlook.com",
                      "hotmail.com",
                    ];
                    const domain = value.split("@")[1]?.toLowerCase();
                    return true;
                  },
                },
              }}
              render={({ field }) => (
                <Box>
                  <TextField
                    {...field}
                    label="Client Email *"
                    fullWidth
                    type="email"
                    error={!!errors.clientEmail || limitExceeded}
                    helperText={
                      errors.clientEmail?.message || (limitExceeded ? "Limit exceeded: Max 5 proposals allowed for this client email" : "")
                    }
                    inputRef={fieldRefs.clientEmail}
                    sx={inputStyle}
                    onChange={(e) => {
                      handleFieldChange("clientEmail", field, e);
                      if (existingProposalsCount > 0) setExistingProposalsCount(0);
                      if (limitExceeded) setLimitExceeded(false);
                      if (existingProposalId) setExistingProposalId(null);
                      existingProposalRef.current = { id: null, owner: null };
                    }}
                  />

                  {existingProposalsCount > 0 && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Preview />}
                      onClick={() =>
                        router.push(`/admin/proposals?search=${encodeURIComponent(field.value)}`)
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
                      View All Proposals ({existingProposalsCount})

                    </Button>
                  )}
                </Box>
              )}
            />
          </Box>
        </>
      ),
    },
    {
      label: "Project Details",
      icon: <Description />,
      content: (
        <>
          {sectionHeader(<Description />, "Project Details")}
          <Box component={motion.div} variants={fieldVariants}>
            <Controller
              name="brandName"
              control={control}
              rules={{ required: "Brand Name is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Brand Name *"
                  fullWidth
                  error={!!errors.brandName}
                  helperText={errors.brandName?.message}
                  inputRef={fieldRefs.projectTitle}
                  onChange={(e) => {
                    console.log("e", e.target.value);
                    field.onChange(e);

                    dispatch(setBrandName(e.target.value));
                    dispatch(updateTitle(`Proposal For ${e.target.value}`));
                  }}
                  sx={inputStyle}
                />
              )}
            />
          </Box>
          <Box component={motion.div} variants={fieldVariants}>
            <Controller
              name="projectTitle"
              control={control}
              rules={{ required: "Project title is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Project Title *"
                  fullWidth
                  error={!!errors.projectTitle}
                  helperText={errors.projectTitle?.message}
                  inputRef={fieldRefs.projectTitle}
                  sx={inputStyle}
                  onChange={(e) => handleFieldChange("projectTitle", field, e)}
                />
              )}
            />
          </Box>
          <Box component={motion.div} variants={fieldVariants}>
            <Controller
              name="projectCategory"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FormControl fullWidth sx={inputStyle} error={!!errors.projectCategory}>
                  <InputLabel>Project Category</InputLabel>
                  <Select
                    {...field}
                    label="Project Category"
                    onChange={(e) => handleFieldChange("projectCategory", field, e)}
                    MenuProps={{
                      disablePortal: true,
                      sx: {
                        position: "absolute !important",
                        top: "0 !important",
                        left: "0 !important",
                        width: "100%",
                        height: "100%",
                        "& .MuiPaper-root": {
                          top: "100% !important",
                          left: "0 !important",
                          position: "absolute !important",
                          width: "100%",
                          boxSizing: "border-box",
                          transform: "none !important",
                          mt: 0.5,
                        },
                      },
                      PaperProps: {
                        sx: {
                          bgcolor: "#1a1a1a",
                          border: "1px solid rgba(243, 168, 51, 0.2)",
                          borderRadius: 2,
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)",
                          maxHeight: 250,
                          "& .MuiMenuItem-root": {
                            fontSize: "0.85rem",
                            py: 1.2,
                            px: 2,
                            color: "#e2e8f0",
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                              bgcolor: "rgba(243, 168, 51, 0.1)",
                              color: "#f3a833",
                            },
                            "&.Mui-selected": {
                              bgcolor: "rgba(243, 168, 51, 0.15)",
                              color: "#f3a833",
                              fontWeight: 600,
                              "&:hover": {
                                bgcolor: "rgba(243, 168, 51, 0.2)",
                              },
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="Fashion & Apparel">Fashion & Apparel</MenuItem>
                    <MenuItem value="E-commerce & Retail">E-commerce & Retail</MenuItem>
                    <MenuItem value="Technology & SaaS">Technology & SaaS</MenuItem>
                    <MenuItem value="Real Estate">Real Estate</MenuItem>
                    <MenuItem value="Health & Wellness">Health & Wellness</MenuItem>
                    <MenuItem value="Food & Beverage">Food & Beverage</MenuItem>
                    <MenuItem value="Agency & Portfolio">Agency & Portfolio</MenuItem>
                    <MenuItem value="Education">Education</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                  {errors.projectCategory && <FormHelperText>{errors.projectCategory.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Box>
          {watch("projectCategory") === "Other" && (
            <Box component={motion.div} variants={fieldVariants} sx={{ mt: -1, mb: 2 }}>
              <Controller
                name="customProjectCategory"
                control={control}
                defaultValue=""
                rules={{ required: "Custom category is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Please Specify Category *"
                    fullWidth
                    error={!!errors.customProjectCategory}
                    helperText={errors.customProjectCategory?.message}
                    sx={inputStyle}
                  />
                )}
              />
            </Box>
          )}

          {/* Project Brief for AI Generation */}
          <Box component={motion.div} variants={fieldVariants} sx={{ mb: 2 }}>
            <Controller
              name="projectBrief"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Project Brief (for AI Generation)"
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="E.g., I need to make a proposal for SQ Logistics' digital presence..."
                  sx={inputStyle}
                />
              )}
            />
            
            <Button
              variant="outlined"
              color="primary"
              onClick={handleGenerateAI}
              disabled={isGeneratingAI || !watch("projectBrief")}
              sx={{
                mt: 1,
                borderColor: colorScheme.primary,
                color: colorScheme.primary,
                "&:hover": {
                  bgcolor: "rgba(243, 168, 51, 0.1)",
                  borderColor: colorScheme.secondary,
                }
              }}
            >
              {isGeneratingAI ? "Generating Content..." : "Generate with AI & Continue"}
            </Button>
          </Box>


        </>
      ),
    },
    {
      label: "Costs",
      icon: <Payment />,
      content: (
        <>
          {sectionHeader(<Payment />, "Costs")}

          {/* Currency Toggle - 5 Currencies */}
          <Box component={motion.div} variants={fieldVariants} sx={{ mb: 4, display: "flex", justifyContent: "start" }}>
            <ToggleButtonGroup
              value={selectedCurrency}
              exclusive
              onChange={handleCurrencyChange}
              aria-label="currency selection"
              sx={{
                gap: 1,
                flexWrap: "wrap",
                "& .MuiToggleButton-root": {
                  px: { xs: 1, sm: 2 },
                  py: { xs: 0.3, sm: 0.5 },
                  fontSize: { xs: "0.65rem", sm: "0.85rem" },
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
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.3, sm: 0.8 } }}>
                  <Typography sx={{ fontSize: { xs: "1rem", sm: "1.4rem" } }}>$</Typography>
                  <Typography sx={{ fontSize: { xs: "0.65rem", sm: "0.85rem" } }}>USD</Typography>
                </Box>
              </ToggleButton>

              <ToggleButton value="PKR">
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.3, sm: 0.8 } }}>
                  <Typography sx={{ fontSize: { xs: "1rem", sm: "1.4rem" } }}>₨</Typography>
                  <Typography sx={{ fontSize: { xs: "0.65rem", sm: "0.85rem" } }}>PKR</Typography>
                </Box>
              </ToggleButton>
              <ToggleButton value="GBP">
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.3, sm: 0.8 } }}>
                  <Typography sx={{ fontSize: { xs: "1rem", sm: "1.4rem" } }}>£</Typography>
                  <Typography sx={{ fontSize: { xs: "0.65rem", sm: "0.85rem" } }}>GBP</Typography>
                </Box>
              </ToggleButton>

              <ToggleButton value="EUR">
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.3, sm: 0.8 } }}>
                  <Typography sx={{ fontSize: { xs: "1rem", sm: "1.4rem" } }}>€</Typography>
                  <Typography sx={{ fontSize: { xs: "0.65rem", sm: "0.85rem" } }}>EUR</Typography>
                </Box>
              </ToggleButton>

              <ToggleButton value="AED">
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.3, sm: 0.8 } }}>
                  <Typography sx={{ fontSize: { xs: "0.9rem", sm: "1.3rem" }, fontWeight: 800 }}>
                    د.إ
                  </Typography>
                  <Typography sx={{ fontSize: { xs: "0.65rem", sm: "0.85rem" } }}>AED</Typography>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Advance Percentage */}
          <Box component={motion.div} variants={fieldVariants}>
            <Controller
              name="advancePercent"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextField
                  {...field}
                  label="Advance Percentage"
                  type="text"
                  fullWidth
                  value={value || ""}
                  onChange={(e) => {
                    // Only allow numbers
                    const numericValue = e.target.value.replace(/[^0-9]/g, "");
                    // Limit to 100
                    const limitedValue = numericValue
                      ? Math.min(parseInt(numericValue), 100).toString()
                      : "";
                    onChange(limitedValue);

                    // Auto-calculate cost based on advance percentage if toggle is ON
                    if (autoApplyAdvance) {
                      const advance = parseFloat(limitedValue) || 0;
                      if (baseCost) {
                        const base = parseFloat(baseCost) || 0;
                        const discounted = base * (1 - advance / 100);
                        setValue("additionalCosts", Math.round(discounted).toString());
                      }
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography
                          sx={{ fontWeight: 600, color: colorScheme.primary }}
                        >
                          %
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Enter percentage (e.g., 50)"
                  sx={inputStyle}
                />
              )}
            />
          </Box>

          {/* Auto-Cut Toggle */}
          <Box>
            <Box
              onClick={() => {
                const newValue = !autoApplyAdvance;
                setAutoApplyAdvance(newValue);

                // Recalculate instantly on toggle
                if (newValue && baseCost) {
                  const advance = parseFloat(watch("advancePercent")) || 0;
                  const discounted = parseFloat(baseCost) * (1 - advance / 100);
                  setValue("additionalCosts", Math.round(discounted || 0).toString());
                } else if (!newValue && baseCost) {
                  setValue("additionalCosts", baseCost.toString());
                }
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: autoApplyAdvance ? "rgba(243,168,51,0.08)" : "#141414",
                border: `2px solid ${autoApplyAdvance ? colorScheme.primary : "rgba(255,255,255,0.15)"}`,
                borderRadius: 2,
                px: 2,
                py: 1.5,
                mb: 2,
                mt: 1,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": { borderColor: colorScheme.primary, bgcolor: "rgba(243,168,51,0.05)" },
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: autoApplyAdvance ? colorScheme.primary : "#f8fafc" }}>
                  Auto-Deduct Advance from Cost
                </Typography>
                <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mt: 0.3 }}>
                  {autoApplyAdvance ? "Cost will be automatically reduced by advance %" : "Advance % is saved separately — cost unchanged"}
                </Typography>
              </Box>
              <Box sx={{
                width: 44, height: 24, borderRadius: 12, position: "relative",
                bgcolor: autoApplyAdvance ? colorScheme.primary : "rgba(255,255,255,0.2)",
                transition: "background-color 0.3s ease", flexShrink: 0, ml: 2,
              }}>
                <Box sx={{
                  width: 18, height: 18, borderRadius: "50%", bgcolor: "#fff",
                  position: "absolute", top: 3,
                  left: autoApplyAdvance ? 23 : 3,
                  transition: "left 0.3s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }} />
              </Box>
            </Box>
          </Box>

          {/* Additional Costs with Currency Symbol and Formatting */}
          <Box component={motion.div} variants={fieldVariants}>
            <Controller
              name="additionalCosts"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextField
                  {...field}
                  label={`Cost (${selectedCurrency})`}
                  type="text"
                  fullWidth
                  value={value ? parseInt(value).toLocaleString() : ""}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/[^0-9]/g, "");
                    setBaseCost(numericValue); // Store original cost

                    if (autoApplyAdvance) {
                      const advance = parseFloat(watch("advancePercent")) || 0;
                      const discounted = parseFloat(numericValue) * (1 - advance / 100);
                      onChange(Math.round(discounted || 0).toString());
                    } else {
                      onChange(numericValue);
                    }
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
                    endAdornment: value && (
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
              )}
            />
          </Box>
        </>
      ),
    },
    {
      label: "Additional Details",
      icon: <Info />,
      content: (
        <>
          {sectionHeader(<Info />, "Additional Details")}
          <Box component={motion.div} variants={fieldVariants}>
            <Controller
              name="callOutcome"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error} sx={inputStyle}>
                  <InputLabel>Call Outcome</InputLabel>
                  <Select {...field} label="Call Outcome">
                    <MenuItem value="Interested">Interested</MenuItem>
                    <MenuItem value="No Fit">No Fit</MenuItem>
                    <MenuItem value="Flaked">Flaked</MenuItem>
                    <MenuItem value="Follow-up">Follow-up</MenuItem>
                  </Select>
                  {error && (
                    <FormHelperText error>{error.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Box>
          <Box component={motion.div} variants={fieldVariants}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="date"
                control={control}
                defaultValue={dayjs().format("YYYY-MM-DD")} // ✅ String format for form
                render={({ field: { onChange, value, ...field } }) => (
                  <DatePicker
                    {...field}
                    label="Date"
                    value={value ? dayjs(value) : dayjs()} // ✅ Convert string back to dayjs for display
                    onChange={(newValue) => {
                      // ✅ Convert dayjs to string before saving to form
                      const formattedDate = newValue
                        ? newValue.format("YYYY-MM-DD")
                        : "";
                      onChange(formattedDate);
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
                          background: "#141414",
                          borderRadius: 2,
                          mb: 2,
                          "& .MuiInputBase-root": {
                            height: 56,
                          },
                        },
                      },
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </Box>
        </>
      ),
    },

    {
      label: "Review & Continue",
      icon: <Send />,
      content: (
        <>
          {/* PDF ACTIONS */}
          <Box
            sx={{
              textAlign: "center",
              mt: 4,
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}
          >
            <Typography variant="h6" sx={{ color: "#f8fafc", mb: 3 }}>
              You have reached the final step! Click below to save your draft and open the Proposal Studio to visually edit and generate your PDF.
            </Typography>
            <Grid item xs={12} md={6} component={motion.div} variants={fieldVariants}>
              <Button
                onClick={() => handleSubmit(handleSubmitData, onInvalid)()}
                variant="contained"
                size="large"
                startIcon={isLoading ? <Timeline /> : <Send />}
                disabled={isLoading}
                sx={{
                  px: { xs: 3, sm: 6 },
                  py: { xs: 1.5, sm: 2 },
                  borderRadius: 4,
                  fontSize: { xs: "0.85rem", sm: "1.1rem" },
                  fontWeight: 700,
                  boxShadow: 6,
                  background: colorScheme.gradient,
                  width: { xs: "100%", sm: "auto" },
                  maxWidth: { xs: "100%", sm: "none" },
                  "&:hover": {
                    background: colorScheme.hoverGradient,
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 32px rgba(243, 168, 51, 0.5)",
                  },
                }}
              >
                {isLoading
                  ? "Saving & Redirecting..."
                  : "Save & Continue to Studio"}
              </Button>
            </Grid>
          </Box>
        </>
      ),
    },
  ];
  const handleNext = async (targetStep) => {
    const currentStepFields = stepFields[activeStep];

    if (currentStepFields.length > 0) {
      const isValid = await trigger(currentStepFields);

      if (!isValid) {
        const firstError = currentStepFields.find((field) => errors[field]);

        if (firstError && fieldRefs[firstError]?.current) {
          fieldRefs[firstError].current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          setTimeout(() => {
            fieldRefs[firstError].current.focus();
          }, 300);
        }

        return;
      }
    }

    if (targetStep !== undefined) {
      setActiveStep(targetStep);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <>
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{
          maxWidth: 1800,
          margin: "0 auto",
          p: { xs: 0, sm: 2, md: 3 },
          position: "relative",
        }}
      >
        <Box sx={{ position: "absolute", top: { xs: 8, sm: 16 }, right: { xs: 8, sm: 16 }, zIndex: 10 }}>
          <Button
            variant="outlined"
            onClick={() => window.open('/docs', '_blank')}
            sx={{
              color: colorScheme.primary,
              borderColor: colorScheme.primary,
              borderRadius: 8,
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { bgcolor: "rgba(243, 168, 51, 0.1)" }
            }}
          >
            Help & Docs
          </Button>
        </Box>
        <Stepper
          activeStep={activeStep}
          orientation="vertical"
          sx={{
            mb: { xs: 0, sm: 4 },
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            p: { xs: 0, sm: 2 },
          }}
        >
          {steps.map((step, index) => (
            <Step
              key={step.label}
              sx={{
                mb: { xs: 0, sm: 3 },
                width: "100%",
                minWidth: { xs: "100%", sm: "300px" },
                p: { xs: 0, sm: 2 },
              }}
            >
              <StepLabel
                onClick={() => handleStepClick(index)}
                sx={{
                  cursor: isStepAccessible(index) ? "pointer" : "not-allowed",
                  opacity: isStepAccessible(index) ? 1 : 0.5,
                  "& .MuiStepLabel-label": {
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color:
                      activeStep === index
                        ? colorScheme.primary
                        : "text.secondary",
                  },
                  "&:hover": {
                    "& .MuiStepLabel-label": {
                      color: isStepAccessible(index)
                        ? colorScheme.primary
                        : "text.secondary",
                    },
                  },
                }}
                icon={
                  <Box
                    component={motion.div}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        activeStep >= index ? colorScheme.gradient : "#e0e0e0",
                      color: activeStep >= index ? "#fff" : "#999",
                      opacity: isStepAccessible(index) ? 1 : 0.5,
                    }}
                    animate={{ scale: activeStep === index ? [1, 1.06, 1] : 1 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {activeStep > index ? <CheckCircle /> : step.icon}
                  </Box>
                }
              >
                {step.label}
              </StepLabel>
              <StepContent sx={{ ml: { xs: 0, sm: 3 }, pl: { xs: 0, sm: 3 }, borderLeft: { xs: "none", sm: "1px solid #bdbdbd" } }}>
                <AnimatePresence mode="popLayout">
                  {activeStep === index && (
                    <Card
                      key={`step-card-${index}`}
                      component={motion.div}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      sx={{ ...cardStyle, m: { xs: 0, sm: 2 }, width: "100%" }}
                    >
                      <CardContent
                        sx={{ p: { xs: 2, sm: 2 }, "&:last-child": { pb: { xs: 2, sm: 3 } } }}
                      >
                        {step.content}
                      </CardContent>
                      <Box
                        component={motion.div}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.35 }}
                        sx={{
                          mt: 3,
                          pb: 2,
                          px: 2,
                          display: "flex",
                          justifyContent: activeStep === 0 ? "flex-end" : "space-between",
                          flexDirection: activeStep === 1 && isSmall ? "column" : "row",
                          gap: activeStep === 1 && isSmall ? 2 : 0,
                          alignItems: activeStep === 1 && isSmall ? "flex-start" : "center",
                        }}
                      >
                        {activeStep > 0 && (
                          <Button
                            component={motion.button}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleBack}
                            startIcon={<ArrowBack />}
                            variant="outlined"
                            sx={{
                              borderColor: colorScheme.primary,
                              borderRadius: 10,
                              color: colorScheme.primary,
                              width: activeStep === 1 && isSmall ? "auto" : "auto",
                              alignSelf: "flex-start",
                              "&:hover": {
                                borderColor: colorScheme.secondary,
                                background: `${colorScheme.primary}10`,
                              },
                            }}
                          >
                            Back
                          </Button>
                        )}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexDirection: activeStep === 1 && isSmall ? "column" : "row",
                            width: activeStep === 1 && isSmall ? "100%" : "auto",
                          }}
                        >
                          {activeStep === 2 ? (
                            <>
                              <Button
                                component={motion.button}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleNext(3)}
                                variant="outlined"
                                sx={{
                                  borderColor: colorScheme.primary,
                                  borderRadius: 10,
                                  color: colorScheme.primary,
                                  width: activeStep === 1 && isSmall ? "100%" : "auto",
                                  "&:hover": {
                                    background: `${colorScheme.primary}10`,
                                  },
                                }}
                              >
                                Additional Details
                              </Button>
                              <Button
                                component={motion.button}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleNext(4)}
                                endIcon={<ArrowForward />}
                                variant="contained"
                                sx={{
                                  background: colorScheme.gradient,
                                  borderRadius: 10,
                                  width: activeStep === 1 && isSmall ? "100%" : "auto",
                                  "&:hover": {
                                    background: colorScheme.hoverGradient,
                                  },
                                }}
                              >
                                Review & Continue
                              </Button>
                            </>
                          ) : (
                            index < steps.length - 1 && (
                              <Button
                                component={motion.button}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleNext()}
                                endIcon={<ArrowForward />}
                                variant="contained"
                                disabled={!isStepAccessible(index + 1)}
                                sx={{
                                  background: colorScheme.gradient,
                                  borderRadius: 10,
                                  width: activeStep === 1 && isSmall ? "100%" : "auto",
                                  "&:hover": {
                                    background: colorScheme.hoverGradient,
                                  },
                                }}
                              >
                                Next
                              </Button>
                            )
                          )}
                        </Box>
                      </Box>
                    </Card>
                  )}
                </AnimatePresence>
              </StepContent>
            </Step>
          ))}
        </Stepper>

      </Box>
    </>
  );
};

export default ProposalFormWithStepper;
