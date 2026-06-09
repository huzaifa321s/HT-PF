"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import axiosInstance from "../../utils/axiosInstance";
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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormHelperText,
} from "@mui/material";
import { Controller } from "react-hook-form";
import {
  Person,
  Business,
  Description,
  CheckCircle,
  ArrowBack,
  ArrowForward,
  Save,
  EditDocument,
  ArrowBackIos,
} from "@mui/icons-material";
import { pdfDetector } from "../../utils/PdfChangeDetector";
import { store } from "../../utils/store";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { replacePage2Content, setOriginalAiResponse, setDBDataP2, setMode } from "../../utils/page2Slice";
import { setDBDataP3, setMode2 } from "../../utils/page3Slice";
import { setDBDataPricing, setMode3 } from "../../utils/pricingReducer";
import { setDBTerms, setMode4 } from "../../utils/paymentTermsPageSlice";
import { setDBData, setMode1 } from "../../utils/page1Slice";
import { showToast } from "../../utils/toastSlice";
import { setFullFormData } from "../../utils/proposalSlice";

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
  const router = useRouter();
  const dispatch = useDispatch();
  const { reset, control, trigger, formState: { errors: hookErrors } } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const pdfRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  // Toast notifications handled globally via Redux showToast

  const page1 = useSelector((s) => s.page1Slice.edit);
  const page2 = useSelector((s) => s.page3.edit);
  const page3 = useSelector((s) => s.page2.edit);
  const pricingPage = useSelector((s) => s.pricing.edit);
  const paymentTerms = useSelector((s) => s.paymentTerms.edit);
  const contactPage = useSelector((s) => s.contact);
  const proposalState = useSelector((s) => s.proposal);


  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    brandName: "",
    projectTitle: "",
    advancePercent: "",
    additionalCosts: "",
    callOutcome: "",
    yourName: "Your Name",
    yourEmail: "your@email.com",
    date: new Date().toISOString().split("T")[0],
    projectCategory: "",
    customProjectCategory: "",
    projectBrief: "",
  });
  const [baseCost, setBaseCost] = useState("");
  const [autoApplyAdvance, setAutoApplyAdvance] = useState(false);
  const [existingProposalId, setExistingProposalId] = useState(null); // Added state for existing proposal
  const [existingProposalOwner, setExistingProposalOwner] = useState(null); // Added state for ownership check
  const [existingProposalsCount, setExistingProposalsCount] = useState(0); // Added for multiple proposals limit
  const [limitExceeded, setLimitExceeded] = useState(false); // Added for multiple proposals limit

  const formDataToSave = {
    clientName: formData.clientName,
    clientEmail: formData.clientEmail,
    brandName: formData.brandName,
    projectTitle: formData.projectTitle,
    projectCategory: formData.projectCategory === "Other" && formData.customProjectCategory ? formData.customProjectCategory : formData.projectCategory,
    advancePercent: formData.advancePercent,
    additionalCosts: formData.additionalCosts,
    callOutcome: formData.callOutcome,
    date: formData.date,
  };

  const PREDEFINED_CATEGORIES = [
    "Fashion & Apparel",
    "E-commerce & Retail",
    "Technology & SaaS",
    "Real Estate",
    "Health & Wellness",
    "Food & Beverage",
    "Agency & Portfolio",
    "Education",
    "Other"
  ];

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

        let updatedData = {
          clientName: data.clientName || "",
          clientEmail: data.clientEmail || "",
          brandName: data.brandName || "",
          projectTitle: data.projectTitle || "",
          advancePercent: data.advancePercent || "",
          additionalCosts: data.additionalCosts || "",
          callOutcome: data.callOutcome || "",
          date: data.date
            ? data.date.split("T")[0]
            : new Date().toISOString().split("T")[0],
          yourName: "Your Name",
          yourEmail: "your@email.com",
          pdfPages: data.pdfPages,
          projectCategory: (!data.projectCategory || PREDEFINED_CATEGORIES.includes(data.projectCategory)) ? (data.projectCategory || "") : "Other",
          customProjectCategory: (!data.projectCategory || PREDEFINED_CATEGORIES.includes(data.projectCategory)) ? "" : data.projectCategory,
        };

        if (proposalState && proposalState.isUnsavedEdit && proposalState._id === id) {
          updatedData = { ...updatedData, ...proposalState };
        }

        setFormData(updatedData);
        setBaseCost(updatedData.additionalCosts || "");
        reset(updatedData);

        // Seed Redux slices with fetched database pages
        if (data?.pdfPages) {
          if (data.pdfPages.page1) dispatch(setDBData(data.pdfPages.page1));
          if (data.pdfPages.page3) dispatch(setDBDataP2(data.pdfPages.page3));
          if (data.pdfPages.page2) dispatch(setDBDataP3(data.pdfPages.page2));
          if (data.pdfPages.pricingPage) dispatch(setDBDataPricing(data.pdfPages.pricingPage));
          if (data.pdfPages.paymentTerms) dispatch(setDBTerms(data.pdfPages.paymentTerms));
        }

        setTimeout(() => {
          pdfDetector.takeSnapshot(store);
        }, 100);
      } catch (err) {
        console.error("Error fetching proposal:", err);
        dispatch(showToast({ message: "Failed to load proposal.", severity: "error" }));
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [id, reset, dispatch]);

  // Set all slices to edit mode on mount
  useEffect(() => {
    dispatch(setMode("edit"));
    dispatch(setMode1("edit"));
    dispatch(setMode2("edit"));
    dispatch(setMode3("edit"));
    dispatch(setMode4("edit"));
  }, [dispatch]);

  const colorScheme = {
    primary: "#f3a833",
    secondary: "#f59e0b",
    gradient: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
    hoverGradient: "linear-gradient(135deg, #eab308 0%, #d97706 100%)",
  };

  const cardStyle = {
    mb: 3,
    p: { xs: 1, sm: 3, md: 4 },
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

  const containerVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const stepperVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" },
    },
  };

  const stepCardVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.35, ease: "easeOut" },
    },
  };

  const primaryButtonVariants = {
    hover: { scale: 1.03, y: -1 },
    tap: { scale: 0.97, y: 0 },
  };

  const secondaryButtonVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.97 },
  };

  const sectionHeaderVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const fieldRefs = {
    clientName: useRef(null),
    clientEmail: useRef(null),
    projectTitle: useRef(null),
  };

  const stepFields = {
    0: ["clientName", "clientEmail"], // Added clientEmail as required
    1: ["projectTitle"],
  };

  const sectionHeader = (icon, title) => (
    <Box
      component={motion.div}
      variants={sectionHeaderVariants}
      initial="hidden"
      animate="visible"
      sx={{ display: "flex", alignItems: "center", mb: 3, mt: 2 }}
    >
      <Box
        component={motion.div}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
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
        component={motion.div}
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

  // Format number in words function
  const formatNumberInWords = (value) => {
    if (!value) return "";

    const number = parseInt(value.toString().replace(/[^0-9]/g, ""), 10);
    if (isNaN(number) || number === 0) return "";

    if (number >= 1000000000) {
      return `${(number / 1000000000).toFixed(2)}B`;
    } else if (number >= 1000000) {
      return `${(number / 1000000).toFixed(2)}M`;
    } else if (number >= 1000) {
      return `${(number / 1000).toFixed(2)}K`;
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

  const handleNext = async (targetStep = null) => {
    const isValid = await validateStep();
    if (isValid) {
      if (targetStep !== null && typeof targetStep === "number") {
        setActiveStep(targetStep);
      } else {
        setActiveStep((prev) => prev + 1);
      }
    }
  };

  const handleGenerateAI = async () => {
    const brief = (formData.projectBrief || "").trim();
    const charCount = brief.length;
    const MIN_CHARS = 50;
    const MAX_CHARS = 2000;

    if (charCount === 0) {
      dispatch(showToast({ message: "Project Brief is required to generate AI content.", severity: "warning" }));
      return;
    }
    if (charCount < MIN_CHARS) {
      dispatch(showToast({ message: `Brief is too short — add at least ${MIN_CHARS - charCount} more character${MIN_CHARS - charCount === 1 ? '' : 's'} for the AI to produce quality output.`, severity: "warning" }));
      return;
    }
    if (charCount > MAX_CHARS) {
      dispatch(showToast({ message: `Brief exceeds the ${MAX_CHARS}-character limit. Please shorten it by ${charCount - MAX_CHARS} character${charCount - MAX_CHARS === 1 ? '' : 's'}.`, severity: "error" }));
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
        dispatch(setOriginalAiResponse(data.sections));
        dispatch(showToast({ message: "Proposal content generated successfully!", severity: "success" }));
        await handleSubmit();
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

  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleStepClick = (stepIndex) => setActiveStep(stepIndex);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const dataToSend = {
        ...formDataToSave, 
        _id: id,
        isUnsavedEdit: true // Flag to tell Proposal Studio to prefer this data over the DB
      };

      // Store in Redux memory instead of hitting the DB immediately
      dispatch(setFullFormData(dataToSend));

      dispatch(showToast({ message: "Draft changes saved! Redirecting to Studio...", severity: "success" }));

      router.push(`/proposal-studio/${id}`);

    } catch (error) {
      console.error("Save Error:", error);
      dispatch(showToast({ message: "Failed to process proposal changes.", severity: "error" }));
      setLoading(false);
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
                      setExistingProposalsCount(res.data.count);
                      setLimitExceeded(res.data.limitExceeded);
                      setExistingProposalId(res.data.proposalId);
                      setExistingProposalOwner(res.data.createdBy);

                      if (res.data.limitExceeded) {
                        return "Limit exceeded: Max 5 proposals allowed for this client email";
                      }
                    } else {
                      setExistingProposalsCount(0);
                      setLimitExceeded(false);
                      setExistingProposalId(null);
                      setExistingProposalOwner(null);
                    }
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
                  error={!!hookErrors.clientEmail || limitExceeded}
                  helperText={hookErrors.clientEmail?.message || ""}
                  sx={inputStyle}
                  onChange={(e) => {
                    field.onChange(e);
                    handleChange("clientEmail", e.target.value);
                    if (existingProposalsCount > 0) setExistingProposalsCount(0);
                    if (limitExceeded) setLimitExceeded(false);
                    if (existingProposalId) setExistingProposalId(null);
                  }}
                />
                {existingProposalsCount > 0 && (
                    <Button
                      component={motion.button}
                      variants={secondaryButtonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      size="small"
                      variant="contained"
                      startIcon={<EditDocument />}
                      onClick={() =>
                        router.push(`/admin/proposals?search=${encodeURIComponent(field.value)}`)
                      }
                      sx={{
                        mt: -1,
                        mb: 2,
                        background: colorScheme.gradient,
                        borderRadius: 10,
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
            name="projectCategory"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <FormControl fullWidth sx={inputStyle} error={!!hookErrors.projectCategory}>
                <InputLabel>Project Category</InputLabel>
                <Select
                  {...field}
                  label="Project Category"
                  onChange={(e) => {
                    field.onChange(e);
                    handleChange("projectCategory", e.target.value);
                  }}
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
                {hookErrors.projectCategory && <FormHelperText>{hookErrors.projectCategory.message}</FormHelperText>}
              </FormControl>
            )}
          />
          {formData.projectCategory === "Other" && (
            <Box component={motion.div} variants={containerVariants} sx={{ mt: -1, mb: 2 }}>
              <Controller
                name="customProjectCategory"
                control={control}
                defaultValue={formData.customProjectCategory}
                rules={{ required: "Custom category is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Please Specify Category *"
                    fullWidth
                    error={!!hookErrors.customProjectCategory}
                    helperText={hookErrors.customProjectCategory?.message}
                    sx={inputStyle}
                    onChange={(e) => {
                      field.onChange(e);
                      setFormData({ ...formData, customProjectCategory: e.target.value });
                    }}
                  />
                )}
              />
            </Box>
          )}

          {/* Project Brief for AI Generation */}
          <Box component={motion.div} variants={containerVariants} sx={{ mb: 2 }}>
            <Controller
              name="projectBrief"
              control={control}
              defaultValue={formData.projectBrief}
              rules={{
                minLength: { value: 50, message: "Brief must be at least 50 characters" },
                maxLength: { value: 2000, message: "Brief must not exceed 2,000 characters" },
              }}
              render={({ field, fieldState }) => {
                const charCount = (field.value || "").length;
                const MIN = 50;
                const MAX = 2000;
                const tooShort = charCount > 0 && charCount < MIN;
                const tooLong = charCount > MAX;
                const isValid = charCount >= MIN && charCount <= MAX;
                return (
                  <>
                    <TextField
                      {...field}
                      label="Project Brief (for AI Generation)"
                      fullWidth
                      multiline
                      rows={5}
                      placeholder={`Describe the client's business, what they need, and goals for this proposal.\n\nInclude key details such as:\n• Services required (website, mobile app, branding, etc.)\n• Target audience or industry\n• Any specific requirements or deadlines\n• Budget range (if known)`}
                      error={tooShort || tooLong || !!fieldState.error}
                      sx={inputStyle}
                      onChange={(e) => {
                        field.onChange(e);
                        setFormData({ ...formData, projectBrief: e.target.value });
                      }}
                    />
                    {/* Live char counter + hint */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5, px: 0.5 }}>
                      <Box sx={{ fontSize: "11px", color: tooShort ? "#f3a833" : tooLong ? "#f43f5e" : isValid ? "#10b981" : "#64748b" }}>
                        {charCount === 0 && "Minimum 50 characters required for quality AI output"}
                        {charCount > 0 && charCount < MIN && `⚠ ${MIN - charCount} more character${MIN - charCount === 1 ? '' : 's'} needed`}
                        {isValid && "✓ Good — AI ready to generate"}
                        {tooLong && `✕ ${charCount - MAX} character${charCount - MAX === 1 ? '' : 's'} over limit`}
                      </Box>
                      <Box sx={{ fontSize: "11px", fontWeight: 600, color: tooLong ? "#f43f5e" : charCount >= MIN ? "#10b981" : "#64748b" }}>
                        {charCount} / 2,000
                      </Box>
                    </Box>
                  </>
                );
              }}
            />
            
            <Button
              variant="outlined"
              color="primary"
              onClick={handleGenerateAI}
              disabled={isGeneratingAI || !formData.projectBrief}
              sx={{
                mt: 1.5,
                borderRadius: 10,
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

  ];

  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{
        bgcolor: "#0a0a0a",
        minHeight: "100vh",
        py: 6,
        width: "100%",
        position: "relative",
      }}
    >
      <Box sx={{ maxWidth: 1800, margin: "0 auto", px: { xs: 2, md: 4 } }}>
        <Box
          component={motion.div}
          variants={headerVariants}
          initial="hidden"
          animate="visible"
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
            component={motion.button}
            variants={secondaryButtonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => router.back()}
            startIcon={<ArrowBackIos />}
            sx={{
              color: "#fff",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              mb: { xs: 2, sm: 0 },
              background: "rgba(20, 20, 20, 0.8)",
              border: "1px solid rgba(243, 168, 51, 0.2)",
              px: 2,
              py: 0.5,
              borderRadius: 2,
              "&:hover": {
                background: "rgba(243, 168, 51, 0.1)",
                border: "1px solid rgba(243, 168, 51, 0.4)",
                transform: "translateX(-4px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Back
          </Button>

          <Typography
            component={motion.div}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
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
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            sx={{ display: "flex", justifyContent: "center", my: 10 }}
          >
            <CircularProgress size={60} thickness={5} />
          </Box>
        ) : (
          <>
            <Stepper
              component={motion.div}
              variants={stepperVariants}
              initial="hidden"
              animate="visible"
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
                  component={motion.div}
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.08 }}
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
                        component={motion.div}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{
                          scale:
                            activeStep === index
                              ? 1.05
                              : activeStep > index
                                ? 1
                                : 0.95,
                        }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
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
                    <Card
                      component={motion.div}
                      layout
                      variants={stepCardVariants}
                      initial="hidden"
                      animate="visible"
                      sx={cardStyle}
                    >
                      <CardContent>{step.content}</CardContent>
                      <Box
                        sx={{
                          mt: 3,
                          display: "flex",
                          justifyContent: activeStep === 0 ? "flex-end" : "space-between",
                        }}
                      >
                        {activeStep > 0 && (
                          <Button
                            component={motion.button}
                            variants={secondaryButtonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={handleBack}
                            startIcon={<ArrowBack />}
                            variant="outlined"
                            sx={{ borderRadius: 10 }}
                          >
                            Back
                          </Button>
                        )}
                        <Box>
                          {index < steps.length - 1 && (
                            <Button
                              component={motion.button}
                              variants={primaryButtonVariants}
                              whileHover="hover"
                              whileTap="tap"
                              onClick={() => handleNext()}
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
                          {index === steps.length - 1 && (
                            <Button
                              component={motion.button}
                              variants={primaryButtonVariants}
                              whileHover="hover"
                              whileTap="tap"
                              variant="contained"
                              startIcon={<Save />}
                              onClick={handleSubmit}
                              disabled={loading}
                              sx={{
                                background: colorScheme.gradient,
                                borderRadius: 10,
                                px: 4,
                                fontWeight: 700,
                                "&:hover": {
                                  background: colorScheme.hoverGradient,
                                  boxShadow: "0 12px 32px rgba(243, 168, 51, 0.4)",
                                },
                              }}
                            >
                              {loading ? "Saving & Redirecting..." : "Save & Continue to Studio"}
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Card>
                  </StepContent>
                </Step>
              ))}
            </Stepper>




            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
              sx={{ display: "flex", justifyContent: "center", mt: 6, mb: 4, px: { xs: 2, sm: 0 } }}
            >
              <Button
                component={motion.button}
                variants={primaryButtonVariants}
                whileHover="hover"
                whileTap="tap"
                variant="contained"
                size="large"
                startIcon={<Save />}
                onClick={handleSubmit}
                disabled={loading}
                sx={{
                  px: { xs: 3, sm: 6 },
                  py: { xs: 1.5, sm: 2 },
                  borderRadius: 10,
                  fontSize: { xs: "0.9rem", sm: "1.1rem" },
                  fontWeight: 700,
                  boxShadow: 6,
                  background: colorScheme.gradient,
                  width: { xs: "100%", sm: "auto" },
                  maxWidth: { xs: "300px", sm: "none" },
                  "&:hover": { background: colorScheme.hoverGradient },
                }}
              >
                {loading ? "Saving & Redirecting..." : "Save & Continue to Studio"}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default EditProposal;
